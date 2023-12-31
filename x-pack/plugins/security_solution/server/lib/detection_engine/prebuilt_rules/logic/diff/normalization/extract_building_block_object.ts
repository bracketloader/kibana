/*
 * Copyright Elasticsearch B.V. and/or licensed to Elasticsearch B.V. under one
 * or more contributor license agreements. Licensed under the Elastic License
 * 2.0; you may not use this file except in compliance with the Elastic License
 * 2.0.
 */

import type { RuleResponse } from '../../../../../../../common/detection_engine/rule_schema';
import type { BuildingBlockObject } from '../../../../../../../common/detection_engine/prebuilt_rules/model/diff/diffable_rule/diffable_field_types';
import type { PrebuiltRuleAsset } from '../../../model/rule_assets/prebuilt_rule_asset';

export const extractBuildingBlockObject = (
  rule: RuleResponse | PrebuiltRuleAsset
): BuildingBlockObject | undefined => {
  if (rule.building_block_type == null) {
    return undefined;
  }
  return {
    type: rule.building_block_type,
  };
};
