/*
 * Copyright Elasticsearch B.V. and/or licensed to Elasticsearch B.V. under one
 * or more contributor license agreements. Licensed under the Elastic License
 * 2.0; you may not use this file except in compliance with the Elastic License
 * 2.0.
 */

import moment from 'moment';
import Boom from '@hapi/boom';
import { i18n } from '@kbn/i18n';
import type { KibanaRequest, KibanaResponseFactory, Logger } from '@kbn/core/server';
import type { ReportingCore } from '../..';
import { API_BASE_URL } from '../../../common/constants';
import { checkParamsVersion, cryptoFactory } from '../../lib';
import { Report } from '../../lib/store';
import type { BaseParams, ReportingRequestHandlerContext, ReportingUser } from '../../types';
import { Counters } from './get_counter';

export const handleUnavailable = (res: KibanaResponseFactory) => {
  return res.custom({ statusCode: 503, body: 'Not Available' });
};

const getDownloadBaseUrl = (reporting: ReportingCore) => {
  const { basePath } = reporting.getServerInfo();
  return basePath + `${API_BASE_URL}/jobs/download`;
};

/**
 * Handles the common parts of requests to generate a report
 */
export class RequestHandler {
  constructor(
    private reporting: ReportingCore,
    private user: ReportingUser,
    private context: ReportingRequestHandlerContext,
    private req: KibanaRequest,
    private res: KibanaResponseFactory,
    private logger: Logger
  ) {}

  private async encryptHeaders() {
    const { encryptionKey } = this.reporting.getConfig();
    const crypto = cryptoFactory(encryptionKey);
    return await crypto.encrypt(this.req.headers);
  }

  public async enqueueJob(exportTypeId: string, jobParams: BaseParams) {
    const { reporting, logger, context, req: request, user } = this;

    const exportType = reporting.getExportTypesRegistry().getById(exportTypeId);

    if (exportType == null) {
      throw new Error(`Export type ${exportTypeId} does not exist in the registry!`);
    }

    if (!exportType.createJobFnFactory) {
      throw new Error(`Export type ${exportTypeId} is not an async job type!`);
    }

    const [createJob, store] = await Promise.all([
      exportType.createJobFnFactory(reporting, logger.get(exportType.id)),
      reporting.getStore(),
    ]);

    if (!createJob) {
      throw new Error(`Export type ${exportTypeId} is not an async job type!`);
    }

    // 1. ensure the incoming params have a version field (should be set by the UI)
    jobParams.version = checkParamsVersion(jobParams, logger);

    // 2. encrypt request headers for the running report job to authenticate itself with Kibana
    // 3. call the export type's createJobFn to create the job payload
    const [headers, job] = await Promise.all([
      this.encryptHeaders(),
      createJob(jobParams, context, this.req),
    ]);

    const payload = {
      ...job,
      headers,
      spaceId: reporting.getSpaceId(request, logger),
    };

    // 4. Add the report to ReportingStore to show as pending
    const report = await store.addReport(
      new Report({
        jobtype: exportType.jobType,
        created_by: user ? user.username : false,
        payload,
        meta: {
          // telemetry fields
          objectType: jobParams.objectType,
          layout: jobParams.layout?.id,
          isDeprecated: job.isDeprecated,
        },
      })
    );
    logger.debug(`Successfully stored pending job: ${report._index}/${report._id}`);

    // 5. Schedule the report with Task Manager
    const task = await reporting.scheduleTask(report.toReportTaskJSON());
    logger.info(
      `Scheduled ${exportType.name} reporting task. Task ID: task:${task.id}. Report ID: ${report._id}`
    );

    // 6. Log the action with event log
    reporting.getEventLogger(report, task).logScheduleTask();

    return report;
  }

  public async handleGenerateRequest(
    exportTypeId: string,
    jobParams: BaseParams,
    counters: Counters
  ) {
    // ensure the async dependencies are loaded
    if (!this.context.reporting) {
      return handleUnavailable(this.res);
    }

    const licenseInfo = await this.reporting.getLicenseInfo();
    const licenseResults = licenseInfo[exportTypeId];

    if (!licenseResults) {
      return this.res.badRequest({ body: `Invalid export-type of ${exportTypeId}` });
    }

    if (!licenseResults.enableLinks) {
      return this.res.forbidden({ body: licenseResults.message });
    }

    if (jobParams.browserTimezone && !moment.tz.zone(jobParams.browserTimezone)) {
      return this.res.badRequest({
        body: `Invalid timezone "${jobParams.browserTimezone ?? ''}".`,
      });
    }

    let report: Report | undefined;
    try {
      report = await this.enqueueJob(exportTypeId, jobParams);

      // return task manager's task information and the download URL
      const downloadBaseUrl = getDownloadBaseUrl(this.reporting);

      counters.usageCounter();

      return this.res.ok({
        headers: { 'content-type': 'application/json' },
        body: {
          path: `${downloadBaseUrl}/${report._id}`,
          job: report.toApiJSON(),
        },
      });
    } catch (err) {
      return this.handleError(err, counters, report?.jobtype);
    }
  }

  private handleError(err: Error | Boom.Boom, counters: Counters, jobtype?: string) {
    this.logger.error(err);

    if (err instanceof Boom.Boom) {
      const statusCode = err.output.statusCode;
      counters?.errorCounter(jobtype, statusCode);

      return this.res.customError({
        statusCode,
        body: err.output.payload.message,
      });
    }

    counters?.errorCounter(jobtype, 500);

    return this.res.customError({
      statusCode: 500,
      body:
        err?.message ||
        i18n.translate('xpack.reporting.errorHandler.unknownError', {
          defaultMessage: 'Unknown error',
        }),
    });
  }
}
