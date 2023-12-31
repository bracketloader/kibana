/*
 * Copyright Elasticsearch B.V. and/or licensed to Elasticsearch B.V. under one
 * or more contributor license agreements. Licensed under the Elastic License
 * 2.0 and the Server Side Public License, v 1; you may not use this file except
 * in compliance with, at your election, the Elastic License 2.0 or the Server
 * Side Public License, v 1.
 */

import React from 'react';
import { EuiModalBody, EuiModalHeader, EuiModalHeaderTitle } from '@elastic/eui';
import { i18n } from '@kbn/i18n';
import { FormattedMessage } from '@kbn/i18n-react';
import { IUiSettingsClient, HttpStart } from '@kbn/core/public';

import { SavedObjectsManagementPluginStart } from '@kbn/saved-objects-management-plugin/public';
import { SavedObjectFinder } from '@kbn/saved-objects-finder-plugin/public';
import type { BaseVisType } from '../../vis_types';
import { DialogNavigation } from '../dialog_navigation';
import { showSavedObject } from './show_saved_object';

interface SearchSelectionProps {
  onSearchSelected: (searchId: string, searchType: string) => void;
  visType: BaseVisType;
  uiSettings: IUiSettingsClient;
  http: HttpStart;
  savedObjectsManagement: SavedObjectsManagementPluginStart;
  goBack: () => void;
}

export class SearchSelection extends React.Component<SearchSelectionProps> {
  private fixedPageSize: number = 8;
  public render() {
    return (
      <React.Fragment>
        <EuiModalHeader>
          <EuiModalHeaderTitle>
            <FormattedMessage
              id="visualizations.newVisWizard.newVisTypeTitle"
              defaultMessage="New {visTypeName}"
              values={{ visTypeName: this.props.visType.title }}
            />{' '}
            /{' '}
            <FormattedMessage
              id="visualizations.newVisWizard.chooseSourceTitle"
              defaultMessage="Choose a source"
            />
          </EuiModalHeaderTitle>
        </EuiModalHeader>
        <EuiModalBody>
          <DialogNavigation goBack={this.props.goBack} />
          <SavedObjectFinder
            key="searchSavedObjectFinder"
            onChoose={this.props.onSearchSelected}
            showFilter
            noItemsMessage={i18n.translate(
              'visualizations.newVisWizard.searchSelection.notFoundLabel',
              {
                defaultMessage: 'No matching indices or saved searches found.',
              }
            )}
            savedObjectMetaData={[
              {
                type: 'search',
                getIconForSavedObject: () => 'search',
                name: i18n.translate(
                  'visualizations.newVisWizard.searchSelection.savedObjectType.search',
                  {
                    defaultMessage: 'Saved search',
                  }
                ),
                // ignore the saved searches that have text-based languages queries
                includeFields: ['isTextBasedQuery', 'usesAdHocDataView'],
                showSavedObject,
              },
              {
                type: 'index-pattern',
                getIconForSavedObject: () => 'indexPatternApp',
                name: i18n.translate(
                  'visualizations.newVisWizard.searchSelection.savedObjectType.dataView',
                  {
                    defaultMessage: 'Data view',
                  }
                ),
                defaultSearchField: 'name',
              },
            ]}
            fixedPageSize={this.fixedPageSize}
            services={{
              uiSettings: this.props.uiSettings,
              http: this.props.http,
              savedObjectsManagement: this.props.savedObjectsManagement,
            }}
          />
        </EuiModalBody>
      </React.Fragment>
    );
  }
}
