/*
 * Copyright Elasticsearch B.V. and/or licensed to Elasticsearch B.V. under one
 * or more contributor license agreements. Licensed under the Elastic License
 * 2.0; you may not use this file except in compliance with the Elastic License
 * 2.0.
 */

import { EuiEmptyPrompt } from '@elastic/eui';
import React, { PureComponent } from 'react';

import { FormattedMessage } from '@kbn/i18n-react';

export class TransformErrorSection extends PureComponent<{}, {}> {
  public render() {
    return (
      <EuiEmptyPrompt
        color="danger"
        iconType="warning"
        title={
          <h2>
            <FormattedMessage
              id="xpack.security.management.editRole.transformErrorSectionTitle"
              defaultMessage="Malformed role"
            />
          </h2>
        }
        body={
          <p>
            <FormattedMessage
              id="xpack.security.management.editRole.transformErrorSectionDescription"
              defaultMessage="This role definition is invalid, and cannot be edited through this screen."
            />
          </p>
        }
      />
    );
  }
}
