/*
 * Copyright Elasticsearch B.V. and/or licensed to Elasticsearch B.V. under one
 * or more contributor license agreements. Licensed under the Elastic License
 * 2.0; you may not use this file except in compliance with the Elastic License
 * 2.0.
 */

import { isEmpty } from 'lodash';

import { CommentType } from '../../../common/api';
import type { CommentUI } from '../../containers/types';
import { SUPPORTED_ACTION_TYPES } from './constants';
import type { SupportedUserActionTypes } from './types';

export const isUserActionTypeSupported = (type: string): type is SupportedUserActionTypes =>
  SUPPORTED_ACTION_TYPES.includes(type as SupportedUserActionTypes);

export const getManualAlertIdsWithNoRuleId = (comments: CommentUI[]): string[] => {
  const dedupeAlerts = comments.reduce((alertIds, comment: CommentUI) => {
    if (comment.type === CommentType.alert && isEmpty(comment.rule.id)) {
      const ids = Array.isArray(comment.alertId) ? comment.alertId : [comment.alertId];
      ids.forEach((id) => alertIds.add(id));
      return alertIds;
    }
    return alertIds;
  }, new Set<string>());
  return Array.from(dedupeAlerts);
};
