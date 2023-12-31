/*
 * Copyright Elasticsearch B.V. and/or licensed to Elasticsearch B.V. under one
 * or more contributor license agreements. Licensed under the Elastic License
 * 2.0; you may not use this file except in compliance with the Elastic License
 * 2.0.
 */

import * as t from 'io-ts';

export const SyntheticsCommonStateCodec = t.intersection([
  t.partial({
    firstTriggeredAt: t.string,
    lastTriggeredAt: t.string,
    lastResolvedAt: t.string,
    meta: t.record(t.string, t.unknown),
    idWithLocation: t.string,
  }),
  t.type({
    firstCheckedAt: t.string,
    lastCheckedAt: t.string,
    isTriggered: t.boolean,
  }),
]);

export type SyntheticsCommonState = t.TypeOf<typeof SyntheticsCommonStateCodec>;

export const SyntheticsMonitorStatusAlertStateCodec = t.type({
  configId: t.string,
  locationId: t.string,
  locationName: t.string,
  errorStartedAt: t.string,
  lastErrorMessage: t.string,
  stateId: t.string,
});

export type SyntheticsMonitorStatusAlertState = t.TypeOf<
  typeof SyntheticsMonitorStatusAlertStateCodec
>;
