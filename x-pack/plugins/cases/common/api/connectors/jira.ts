/*
 * Copyright Elasticsearch B.V. and/or licensed to Elasticsearch B.V. under one
 * or more contributor license agreements. Licensed under the Elastic License
 * 2.0; you may not use this file except in compliance with the Elastic License
 * 2.0.
 */

import * as rt from 'io-ts';

export const JiraFieldsRT = rt.strict({
  issueType: rt.union([rt.string, rt.null]),
  priority: rt.union([rt.string, rt.null]),
  parent: rt.union([rt.string, rt.null]),
});

export type JiraFieldsType = rt.TypeOf<typeof JiraFieldsRT>;
