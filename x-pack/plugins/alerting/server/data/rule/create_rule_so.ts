/*
 * Copyright Elasticsearch B.V. and/or licensed to Elasticsearch B.V. under one
 * or more contributor license agreements. Licensed under the Elastic License
 * 2.0; you may not use this file except in compliance with the Elastic License
 * 2.0.
 */

import {
  SavedObjectsClientContract,
  SavedObjectsCreateOptions,
  SavedObject,
} from '@kbn/core/server';
import { RuleAttributes } from './types';

export interface CreateRuleSoParams {
  savedObjectClient: SavedObjectsClientContract;
  ruleAttributes: RuleAttributes;
  savedObjectCreateOptions?: SavedObjectsCreateOptions;
}

export const createRuleSo = (params: CreateRuleSoParams): Promise<SavedObject<RuleAttributes>> => {
  const { savedObjectClient, ruleAttributes, savedObjectCreateOptions } = params;

  return savedObjectClient.create('alert', ruleAttributes, savedObjectCreateOptions);
};
