/*
 * Copyright Elasticsearch B.V. and/or licensed to Elasticsearch B.V. under one
 * or more contributor license agreements. Licensed under the Elastic License
 * 2.0; you may not use this file except in compliance with the Elastic License
 * 2.0.
 */

import type { RuleObjectId } from '../../../../../common/detection_engine/rule_schema';

export interface CoverageOverviewRule {
  id: RuleObjectId; // rule SO's ids (not ruleId)
  name: string;
}
