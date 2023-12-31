/*
 * Copyright Elasticsearch B.V. and/or licensed to Elasticsearch B.V. under one
 * or more contributor license agreements. Licensed under the Elastic License
 * 2.0; you may not use this file except in compliance with the Elastic License
 * 2.0.
 */

import React from 'react';
import { FormattedMessage } from '@kbn/i18n-react';
import { EuiFlexGroup, EuiFlexItem } from '@elastic/eui';

export const MonitorsPageHeader = () => (
  <EuiFlexGroup alignItems="center" gutterSize="xs" responsive={false}>
    <EuiFlexItem grow={false}>
      <FormattedMessage id="xpack.synthetics.monitors.pageHeader.title" defaultMessage="Monitors" />
    </EuiFlexItem>
  </EuiFlexGroup>
);
