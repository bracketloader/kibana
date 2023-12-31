/*
 * Copyright Elasticsearch B.V. and/or licensed to Elasticsearch B.V. under one
 * or more contributor license agreements. Licensed under the Elastic License
 * 2.0; you may not use this file except in compliance with the Elastic License
 * 2.0.
 */
import { i18n } from '@kbn/i18n';

export const MonitorStatusTranslations = {
  defaultActionMessage: i18n.translate('xpack.uptime.alerts.monitorStatus.defaultActionMessage', {
    defaultMessage:
      'Monitor {monitorName} with url {monitorUrl} from {observerLocation} {statusMessage} The latest error message is {latestErrorMessage}, checked at {checkedAt}',
    values: {
      monitorName: '{{context.monitorName}}',
      monitorUrl: '{{{context.monitorUrl}}}',
      statusMessage: '{{{context.statusMessage}}}',
      latestErrorMessage: '{{{context.latestErrorMessage}}}',
      observerLocation: '{{context.observerLocation}}',
      checkedAt: '{{context.checkedAt}}',
    },
  }),
  defaultSubjectMessage: i18n.translate('xpack.uptime.alerts.monitorStatus.defaultSubjectMessage', {
    defaultMessage: 'Monitor {monitorName} with url {monitorUrl} is down',
    values: {
      monitorName: '{{context.monitorName}}',
      monitorUrl: '{{{context.monitorUrl}}}',
    },
  }),
  defaultRecoverySubjectMessage: i18n.translate(
    'xpack.uptime.alerts.monitorStatus.defaultRecoverySubjectMessage',
    {
      defaultMessage: 'Monitor {monitorName} with url {monitorUrl} has recovered',
      values: {
        monitorName: '{{context.monitorName}}',
        monitorUrl: '{{{context.monitorUrl}}}',
      },
    }
  ),
  defaultRecoveryMessage: i18n.translate(
    'xpack.uptime.alerts.monitorStatus.defaultRecoveryMessage',
    {
      defaultMessage:
        'Alert for monitor {monitorName} with url {monitorUrl} from {observerLocation} has recovered',
      values: {
        monitorName: '{{context.monitorName}}',
        monitorUrl: '{{{context.monitorUrl}}}',
        observerLocation: '{{context.observerLocation}}',
      },
    }
  ),
  name: i18n.translate('xpack.uptime.alerts.monitorStatus.clientName', {
    defaultMessage: 'Uptime monitor status',
  }),
  description: i18n.translate('xpack.uptime.alerts.monitorStatus.description', {
    defaultMessage: 'Alert when a monitor is down or an availability threshold is breached.',
  }),
};

export const TlsTranslations = {
  defaultActionMessage: i18n.translate('xpack.uptime.alerts.tls.defaultActionMessage', {
    defaultMessage: `Detected TLS certificate {commonName} from issuer {issuer} is {status}. Certificate {summary}`,
    values: {
      commonName: '{{context.commonName}}',
      issuer: '{{context.issuer}}',
      summary: '{{context.summary}}',
      status: '{{context.status}}',
    },
  }),
  defaultRecoveryMessage: i18n.translate('xpack.uptime.alerts.tls.defaultRecoveryMessage', {
    defaultMessage: `Alert for TLS certificate {commonName} from issuer {issuer} has recovered`,
    values: {
      commonName: '{{context.commonName}}',
      issuer: '{{context.issuer}}',
    },
  }),
  name: i18n.translate('xpack.uptime.alerts.tls.clientName', {
    defaultMessage: 'Uptime TLS',
  }),
  description: i18n.translate('xpack.uptime.alerts.tls.description', {
    defaultMessage: 'Alert when the TLS certificate of an Uptime monitor is about to expire.',
  }),
};

export const TlsTranslationsLegacy = {
  defaultActionMessage: i18n.translate('xpack.uptime.alerts.tls.legacy.defaultActionMessage', {
    defaultMessage: `Detected {count} TLS certificates expiring or becoming too old.
{expiringConditionalOpen}
Expiring cert count: {expiringCount}
Expiring Certificates: {expiringCommonNameAndDate}
{expiringConditionalClose}
{agingConditionalOpen}
Aging cert count: {agingCount}
Aging Certificates: {agingCommonNameAndDate}
{agingConditionalClose}
`,
    values: {
      count: '{{state.count}}',
      expiringCount: '{{state.expiringCount}}',
      expiringCommonNameAndDate: '{{state.expiringCommonNameAndDate}}',
      expiringConditionalOpen: '{{#state.hasExpired}}',
      expiringConditionalClose: '{{/state.hasExpired}}',
      agingCount: '{{state.agingCount}}',
      agingCommonNameAndDate: '{{state.agingCommonNameAndDate}}',
      agingConditionalOpen: '{{#state.hasAging}}',
      agingConditionalClose: '{{/state.hasAging}}',
    },
  }),
  name: i18n.translate('xpack.uptime.alerts.tls.legacy.clientName', {
    defaultMessage: 'Uptime TLS (Legacy)',
  }),
  description: i18n.translate('xpack.uptime.alerts.tls.legacy.description', {
    defaultMessage:
      'Alert when the TLS certificate of an Uptime monitor is about to expire. This alert will be deprecated in a future version.',
  }),
};

export const DurationAnomalyTranslations = {
  defaultActionMessage: i18n.translate('xpack.uptime.alerts.durationAnomaly.defaultActionMessage', {
    defaultMessage: `Abnormal ({severity} level) response time detected on {monitor} with url {monitorUrl} at {anomalyStartTimestamp}. Anomaly severity score is {severityScore}.
Response times as high as {slowestAnomalyResponse} have been detected from location {observerLocation}. Expected response time is {expectedResponseTime}.`,
    values: {
      severity: '{{context.severity}}',
      anomalyStartTimestamp: '{{context.anomalyStartTimestamp}}',
      monitor: '{{context.monitor}}',
      monitorUrl: '{{{context.monitorUrl}}}',
      slowestAnomalyResponse: '{{context.slowestAnomalyResponse}}',
      expectedResponseTime: '{{context.expectedResponseTime}}',
      severityScore: '{{context.severityScore}}',
      observerLocation: '{{context.observerLocation}}',
    },
  }),
  defaultRecoveryMessage: i18n.translate(
    'xpack.uptime.alerts.durationAnomaly.defaultRecoveryMessage',
    {
      defaultMessage: `Alert for abnormal ({severity} level) response time detected on monitor {monitor} with url {monitorUrl} from location {observerLocation} at {anomalyStartTimestamp} has recovered`,
      values: {
        severity: '{{context.severity}}',
        anomalyStartTimestamp: '{{context.anomalyStartTimestamp}}',
        monitor: '{{context.monitor}}',
        monitorUrl: '{{{context.monitorUrl}}}',
        observerLocation: '{{context.observerLocation}}',
      },
    }
  ),
  name: i18n.translate('xpack.uptime.alerts.durationAnomaly.clientName', {
    defaultMessage: 'Uptime Duration Anomaly',
  }),
  description: i18n.translate('xpack.uptime.alerts.durationAnomaly.description', {
    defaultMessage: 'Alert when the Uptime monitor duration is anomalous.',
  }),
};
