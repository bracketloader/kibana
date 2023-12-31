/*
 * Copyright Elasticsearch B.V. and/or licensed to Elasticsearch B.V. under one
 * or more contributor license agreements. Licensed under the Elastic License
 * 2.0; you may not use this file except in compliance with the Elastic License
 * 2.0.
 */

import { Routes, Route } from '@kbn/shared-ux-router';
import React, { memo } from 'react';
import { TrustedAppsList } from './view/trusted_apps_list';
import { MANAGEMENT_ROUTING_TRUSTED_APPS_PATH } from '../../common/constants';
import { NotFoundPage } from '../../../app/404';

export const TrustedAppsContainer = memo(() => {
  return (
    <Routes>
      <Route path={MANAGEMENT_ROUTING_TRUSTED_APPS_PATH} exact component={TrustedAppsList} />
      <Route path="*" component={NotFoundPage} />
    </Routes>
  );
});

TrustedAppsContainer.displayName = 'TrustedAppsContainer';
