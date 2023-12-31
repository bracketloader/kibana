/*
 * Copyright Elasticsearch B.V. and/or licensed to Elasticsearch B.V. under one
 * or more contributor license agreements. Licensed under the Elastic License
 * 2.0 and the Server Side Public License, v 1; you may not use this file except
 * in compliance with, at your election, the Elastic License 2.0 or the Server
 * Side Public License, v 1.
 */

import { i18n } from '@kbn/i18n';
import React, { Fragment } from 'react';
import { FormattedMessage } from '@kbn/i18n-react';
import { EuiFormRow, EuiSwitch } from '@elastic/eui';
import { SavedObjectSaveModal } from '@kbn/saved-objects-plugin/public';

import type { DashboardSaveOptions } from '../../../types';
import { pluginServices } from '../../../../services/plugin_services';

/**
 * TODO: Portable Dashboard followup, convert this to a functional component & use redux for the state.
 * https://github.com/elastic/kibana/issues/147490
 */

interface Props {
  onSave: ({
    newTitle,
    newDescription,
    newCopyOnSave,
    newTags,
    newTimeRestore,
    isTitleDuplicateConfirmed,
    onTitleDuplicate,
  }: DashboardSaveOptions) => void;
  onClose: () => void;
  title: string;
  description: string;
  tags?: string[];
  timeRestore: boolean;
  showCopyOnSave: boolean;
}

interface State {
  tags: string[];
  timeRestore: boolean;
}

export class DashboardSaveModal extends React.Component<Props, State> {
  state: State = {
    timeRestore: this.props.timeRestore,
    tags: this.props.tags ?? [],
  };

  constructor(props: Props) {
    super(props);
  }

  saveDashboard = ({
    newTitle,
    newDescription,
    newCopyOnSave,
    isTitleDuplicateConfirmed,
    onTitleDuplicate,
  }: {
    newTitle: string;
    newDescription: string;
    newCopyOnSave: boolean;
    isTitleDuplicateConfirmed: boolean;
    onTitleDuplicate: () => void;
  }) => {
    this.props.onSave({
      newTitle,
      newDescription,
      newCopyOnSave,
      newTimeRestore: this.state.timeRestore,
      isTitleDuplicateConfirmed,
      onTitleDuplicate,
      newTags: this.state.tags,
    });
  };

  onTimeRestoreChange = (event: any) => {
    this.setState({
      timeRestore: event.target.checked,
    });
  };

  renderDashboardSaveOptions() {
    const {
      savedObjectsTagging: { components },
    } = pluginServices.getServices();

    const tagSelector = components ? (
      <components.SavedObjectSaveModalTagSelector
        initialSelection={this.state.tags}
        onTagsSelected={(tags) => {
          this.setState({
            tags,
          });
        }}
        markOptional
      />
    ) : undefined;

    return (
      <Fragment>
        {tagSelector}

        <EuiFormRow
          helpText={
            <FormattedMessage
              id="dashboard.topNav.saveModal.storeTimeWithDashboardFormRowHelpText"
              defaultMessage="This changes the time filter to the currently selected time each time this dashboard is loaded."
            />
          }
        >
          <EuiSwitch
            data-test-subj="storeTimeWithDashboard"
            checked={this.state.timeRestore}
            onChange={this.onTimeRestoreChange}
            label={
              <FormattedMessage
                id="dashboard.topNav.saveModal.storeTimeWithDashboardFormRowLabel"
                defaultMessage="Store time with dashboard"
              />
            }
          />
        </EuiFormRow>
      </Fragment>
    );
  }

  render() {
    return (
      <SavedObjectSaveModal
        onSave={this.saveDashboard}
        onClose={this.props.onClose}
        title={this.props.title}
        description={this.props.description}
        showDescription
        showCopyOnSave={this.props.showCopyOnSave}
        initialCopyOnSave={this.props.showCopyOnSave}
        objectType={i18n.translate('dashboard.topNav.saveModal.objectType', {
          defaultMessage: 'dashboard',
        })}
        options={this.renderDashboardSaveOptions()}
      />
    );
  }
}
