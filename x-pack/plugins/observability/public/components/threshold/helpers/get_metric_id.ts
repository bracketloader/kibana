/*
 * Copyright Elasticsearch B.V. and/or licensed to Elasticsearch B.V. under one
 * or more contributor license agreements. Licensed under the Elastic License
 * 2.0; you may not use this file except in compliance with the Elastic License
 * 2.0.
 */

import { MetricsExplorerOptionsMetric } from '../../../../common/threshold_rule/types';

export const getMetricId = (metric: MetricsExplorerOptionsMetric, index: string | number) => {
  return `metric_${index}`;
};
