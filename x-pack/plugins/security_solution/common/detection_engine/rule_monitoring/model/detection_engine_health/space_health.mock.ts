/*
 * Copyright Elasticsearch B.V. and/or licensed to Elasticsearch B.V. under one
 * or more contributor license agreements. Licensed under the Elastic License
 * 2.0; you may not use this file except in compliance with the Elastic License
 * 2.0.
 */

import { healthStatsMock } from './health_stats.mock';
import type { SpaceHealthSnapshot } from './space_health';

const getEmptySpaceHealthSnapshot = (): SpaceHealthSnapshot => {
  return {
    stats_at_the_moment: healthStatsMock.getEmptyRuleStats(),
    stats_over_interval: healthStatsMock.getEmptyRuleExecutionStats(),
    history_over_interval: {
      buckets: [
        {
          timestamp: '2023-05-15T16:12:14.967Z',
          stats: healthStatsMock.getEmptyRuleExecutionStats(),
        },
      ],
    },
  };
};

export const spaceHealthSnapshotMock = {
  getEmptySpaceHealthSnapshot,
};
