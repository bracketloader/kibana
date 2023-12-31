/*
 * Copyright Elasticsearch B.V. and/or licensed to Elasticsearch B.V. under one
 * or more contributor license agreements. Licensed under the Elastic License
 * 2.0 and the Server Side Public License, v 1; you may not use this file except
 * in compliance with, at your election, the Elastic License 2.0 or the Server
 * Side Public License, v 1.
 */

import { schema, TypeOf } from '@kbn/config-schema';

export const config = schema.object({
  enabled: schema.boolean({ defaultValue: true }),

  readOnly: schema.conditional(
    schema.contextRef('serverless'),
    true,
    schema.maybe(schema.boolean({ defaultValue: false })),
    schema.never()
  ),

  /** @deprecated **/
  chartResolution: schema.number({ defaultValue: 150 }),
  /** @deprecated **/
  minimumBucketSize: schema.number({ defaultValue: 10 }),
});

export type VisTypeTimeseriesConfig = TypeOf<typeof config>;

export interface VisTypeTimeseriesPublicConfig {
  readOnly?: boolean;
}
