/*
 * Copyright Elasticsearch B.V. and/or licensed to Elasticsearch B.V. under one
 * or more contributor license agreements. Licensed under the Elastic License
 * 2.0 and the Server Side Public License, v 1; you may not use this file except
 * in compliance with, at your election, the Elastic License 2.0 or the Server
 * Side Public License, v 1.
 */

import { schema, TypeOf } from '@kbn/config-schema';

export const configSchema = schema.object({
  enabled: schema.boolean({ defaultValue: true }),

  readOnly: schema.conditional(
    schema.contextRef('serverless'),
    true,
    schema.maybe(schema.boolean({ defaultValue: false })),
    schema.never()
  ),
});

export type GaugeConfig = TypeOf<typeof configSchema>;

export interface GaugePublicConfig {
  readOnly?: boolean;
}
