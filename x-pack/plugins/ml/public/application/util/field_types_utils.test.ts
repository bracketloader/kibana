/*
 * Copyright Elasticsearch B.V. and/or licensed to Elasticsearch B.V. under one
 * or more contributor license agreements. Licensed under the Elastic License
 * 2.0; you may not use this file except in compliance with the Elastic License
 * 2.0.
 */

import { KBN_FIELD_TYPES } from '@kbn/field-types';
import type { DataViewField } from '@kbn/data-views-plugin/common';
import { ML_JOB_FIELD_TYPES } from '@kbn/ml-anomaly-utils';
import {
  kbnTypeToMLJobType,
  getMLJobTypeAriaLabel,
  mlJobTypeAriaLabels,
} from './field_types_utils';

describe('ML - field type utils', () => {
  describe('kbnTypeToMLJobType', () => {
    test('returns correct ML_JOB_FIELD_TYPES for KBN_FIELD_TYPES', () => {
      // @ts-ignore reassigning missing properties
      const field: DataViewField = {
        type: KBN_FIELD_TYPES.NUMBER,
        name: KBN_FIELD_TYPES.NUMBER,
        aggregatable: true,
      };
      expect(kbnTypeToMLJobType(field)).toBe(ML_JOB_FIELD_TYPES.NUMBER);

      // @ts-ignore reassigning read-only type
      field.type = KBN_FIELD_TYPES.DATE;
      expect(kbnTypeToMLJobType(field)).toBe(ML_JOB_FIELD_TYPES.DATE);

      // @ts-ignore reassigning read-only type
      field.type = KBN_FIELD_TYPES.IP;
      expect(kbnTypeToMLJobType(field)).toBe(ML_JOB_FIELD_TYPES.IP);

      // @ts-ignore reassigning read-only type
      field.type = KBN_FIELD_TYPES.BOOLEAN;
      expect(kbnTypeToMLJobType(field)).toBe(ML_JOB_FIELD_TYPES.BOOLEAN);

      // @ts-ignore reassigning read-only type
      field.type = KBN_FIELD_TYPES.GEO_POINT;
      expect(kbnTypeToMLJobType(field)).toBe(ML_JOB_FIELD_TYPES.GEO_POINT);
    });

    test('returns ML_JOB_FIELD_TYPES.KEYWORD for aggregatable KBN_FIELD_TYPES.STRING', () => {
      // @ts-ignore reassigning missing properties
      const field: DataViewField = {
        type: KBN_FIELD_TYPES.STRING,
        name: KBN_FIELD_TYPES.STRING,
        aggregatable: true,
      };
      expect(kbnTypeToMLJobType(field)).toBe(ML_JOB_FIELD_TYPES.KEYWORD);
    });

    test('returns ML_JOB_FIELD_TYPES.TEXT for non-aggregatable KBN_FIELD_TYPES.STRING', () => {
      // @ts-ignore reassigning missing properties
      const field: DataViewField = {
        type: KBN_FIELD_TYPES.STRING,
        name: KBN_FIELD_TYPES.STRING,
        aggregatable: false,
      };
      expect(kbnTypeToMLJobType(field)).toBe(ML_JOB_FIELD_TYPES.TEXT);
    });

    test('returns undefined for non-aggregatable "foo"', () => {
      // @ts-ignore reassigning missing properties
      const field: DataViewField = {
        type: 'foo',
        name: 'foo',
        aggregatable: false,
      };
      expect(kbnTypeToMLJobType(field)).toBe(undefined);
    });
  });

  describe('getMLJobTypeAriaLabel: Getting a field type aria label by passing what it is stored in constants', () => {
    test('should returns all ML_JOB_FIELD_TYPES labels exactly as it is for each correct value', () => {
      const mlKeys = Object.keys(ML_JOB_FIELD_TYPES);
      const receivedMlLabels: Record<string, string | null> = {};
      const testStorage = mlJobTypeAriaLabels;
      mlKeys.forEach((constant) => {
        receivedMlLabels[constant] = getMLJobTypeAriaLabel(
          ML_JOB_FIELD_TYPES[constant as keyof typeof ML_JOB_FIELD_TYPES]
        );
      });

      expect(receivedMlLabels).toEqual(testStorage);
    });
    test('should returns NULL as ML_JOB_FIELD_TYPES does not contain such a keyword', () => {
      expect(getMLJobTypeAriaLabel('ML_JOB_FIELD_TYPES')).toBe(null);
    });
  });
});
