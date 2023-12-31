/*
 * Copyright Elasticsearch B.V. and/or licensed to Elasticsearch B.V. under one
 * or more contributor license agreements. Licensed under the Elastic License
 * 2.0; you may not use this file except in compliance with the Elastic License
 * 2.0.
 */

import * as rt from 'io-ts';

export const CaseUserActionStatsRt = rt.strict({
  total: rt.number,
  total_comments: rt.number,
  total_other_actions: rt.number,
});

export type CaseUserActionStats = rt.TypeOf<typeof CaseUserActionStatsRt>;
