/*
 * Copyright Elasticsearch B.V. and/or licensed to Elasticsearch B.V. under one
 * or more contributor license agreements. Licensed under the Elastic License
 * 2.0; you may not use this file except in compliance with the Elastic License
 * 2.0.
 */

import * as rt from 'io-ts';
import type { UserActionWithAttributes } from './common';
import { ActionTypes } from './common';

export const DeleteCaseUserActionRt = rt.strict({
  type: rt.literal(ActionTypes.delete_case),
  payload: rt.strict({}),
});

export type DeleteCaseUserAction = UserActionWithAttributes<
  rt.TypeOf<typeof DeleteCaseUserActionRt>
>;
