/*
 * Copyright Elasticsearch B.V. and/or licensed to Elasticsearch B.V. under one
 * or more contributor license agreements. Licensed under the Elastic License
 * 2.0; you may not use this file except in compliance with the Elastic License
 * 2.0.
 */

import * as rt from 'io-ts';
import type { UserActionWithAttributes } from './common';
import { ActionTypes } from './common';

export const DescriptionUserActionPayloadRt = rt.strict({ description: rt.string });

export const DescriptionUserActionRt = rt.strict({
  type: rt.literal(ActionTypes.description),
  payload: DescriptionUserActionPayloadRt,
});

export type DescriptionUserAction = UserActionWithAttributes<
  rt.TypeOf<typeof DescriptionUserActionRt>
>;
