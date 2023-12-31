/*
 * Copyright Elasticsearch B.V. and/or licensed to Elasticsearch B.V. under one
 * or more contributor license agreements. Licensed under the Elastic License
 * 2.0; you may not use this file except in compliance with the Elastic License
 * 2.0.
 */

import { cloudPosturePages } from './constants';
import type { CloudSecurityPosturePageId, CspPage } from './types';

interface CloudSecurityPostureLinkItem<TId extends string = CloudSecurityPosturePageId> {
  id: TId;
  title: string;
  path: string;
}

/**
 * Gets the cloud security posture link properties of a CSP page for navigation in the security solution.
 * @param cloudSecurityPosturePage the name of the cloud posture page.
 */
export const getSecuritySolutionLink = <TId extends string = CloudSecurityPosturePageId>(
  cloudSecurityPosturePage: CspPage
): CloudSecurityPostureLinkItem<TId> => ({
  id: cloudPosturePages[cloudSecurityPosturePage].id as TId,
  title: cloudPosturePages[cloudSecurityPosturePage].name,
  path: cloudPosturePages[cloudSecurityPosturePage].path,
});
