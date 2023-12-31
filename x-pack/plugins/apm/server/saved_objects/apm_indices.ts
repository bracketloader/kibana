/*
 * Copyright Elasticsearch B.V. and/or licensed to Elasticsearch B.V. under one
 * or more contributor license agreements. Licensed under the Elastic License
 * 2.0; you may not use this file except in compliance with the Elastic License
 * 2.0.
 */

import { SavedObjectsType } from '@kbn/core/server';
import { i18n } from '@kbn/i18n';
import { schema } from '@kbn/config-schema';
import { updateApmOssIndexPaths } from './migrations/update_apm_oss_index_paths';

export interface APMIndices {
  apmIndices?: {
    error?: string;
    onboarding?: string;
    span?: string;
    transaction?: string;
    metric?: string;
  };
  isSpaceAware?: boolean;
}

export const apmIndices: SavedObjectsType = {
  name: 'apm-indices',
  hidden: false,
  namespaceType: 'single',
  mappings: {
    dynamic: false,
    properties: {}, // several fields exist, but we don't need to search or aggregate on them, so we exclude them from the mappings
  },
  management: {
    importableAndExportable: true,
    icon: 'apmApp',
    getTitle: () =>
      i18n.translate('xpack.apm.apmSettings.index', {
        defaultMessage: 'APM Settings - Index',
      }),
  },
  modelVersions: {
    '1': {
      changes: [],
      schemas: {
        create: schema.object({
          apmIndices: schema.maybe(
            schema.object({
              error: schema.maybe(schema.string()),
              onboarding: schema.maybe(schema.string()),
              span: schema.maybe(schema.string()),
              transaction: schema.maybe(schema.string()),
              metric: schema.maybe(schema.string()),
            })
          ),
          isSpaceAware: schema.maybe(schema.boolean()),
        }),
      },
    },
  },
  migrations: {
    '7.16.0': (doc) => {
      const attributes = updateApmOssIndexPaths(doc.attributes);
      return { ...doc, attributes };
    },
    '8.2.0': (doc) => {
      // Any future changes on this structure should be also tested on migrateLegacyAPMIndicesToSpaceAware
      return { ...doc, attributes: { apmIndices: doc.attributes } };
    },
  },
};
