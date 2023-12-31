/*
 * Copyright Elasticsearch B.V. and/or licensed to Elasticsearch B.V. under one
 * or more contributor license agreements. Licensed under the Elastic License
 * 2.0; you may not use this file except in compliance with the Elastic License
 * 2.0.
 */

import { decodeWithExcessOrThrow, CasePushRequestParamsRt } from '../../../../common/api';
import { CASE_PUSH_URL } from '../../../../common/constants';
import type { CaseRoute } from '../types';
import { createCaseError } from '../../../common/error';
import { createCasesRoute } from '../create_cases_route';

export const pushCaseRoute: CaseRoute = createCasesRoute({
  method: 'post',
  path: CASE_PUSH_URL,
  handler: async ({ context, request, response }) => {
    try {
      const caseContext = await context.cases;
      const casesClient = await caseContext.getCasesClient();

      const params = decodeWithExcessOrThrow(CasePushRequestParamsRt)(request.params);

      return response.ok({
        body: await casesClient.cases.push({
          caseId: params.case_id,
          connectorId: params.connector_id,
        }),
      });
    } catch (error) {
      throw createCaseError({
        message: `Failed to push case in route: ${error}`,
        error,
      });
    }
  },
});
