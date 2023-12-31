/*
 * Copyright Elasticsearch B.V. and/or licensed to Elasticsearch B.V. under one
 * or more contributor license agreements. Licensed under the Elastic License
 * 2.0; you may not use this file except in compliance with the Elastic License
 * 2.0.
 */

import React, { useEffect, useCallback } from 'react';
import PropTypes from 'prop-types';
import {
  EuiFormRow,
  EuiAccordion,
  EuiSelect,
  EuiTextArea,
  EuiCallOut,
  EuiSpacer,
  EuiLink,
  EuiText,
} from '@elastic/eui';
import { getSimpleArg, setSimpleArg } from '../../../public/lib/arg_helpers';
import { ESFieldsSelect } from '../../../public/components/es_fields_select';
import { ESFieldSelect } from '../../../public/components/es_field_select';
import { ESDataViewSelect } from '../../../public/components/es_data_view_select';
import { templateFromReactComponent } from '../../../public/lib/template_from_react_component';
import { DataSourceStrings, LUCENE_QUERY_URL } from '../../../i18n';

const { ESDocs: strings } = DataSourceStrings;

const EsdocsDatasource = ({ args, updateArgs, defaultIndex }) => {
  const setArg = useCallback(
    (name, value) => {
      console.log({ name, value });
      updateArgs &&
        updateArgs({
          ...args,
          ...setSimpleArg(name, value),
        });
    },
    [args, updateArgs]
  );

  // TODO: This is a terrible way of doing defaults. We need to find a way to read the defaults for the function
  // and set them for the data source UI.
  const getArgName = () => {
    if (getSimpleArg('_', args)[0]) {
      return '_';
    }
    if (getSimpleArg('q', args)[0]) {
      return 'q';
    }
    return 'query';
  };

  const getIndex = () => {
    return getSimpleArg('index', args)[0] || defaultIndex || '';
  };

  const getQuery = () => {
    return getSimpleArg(getArgName(), args)[0] || '';
  };

  const getFields = () => {
    const commas = getSimpleArg('fields', args)[0] || '';
    if (commas.length === 0) {
      return [];
    }
    return commas.split(',').map((str) => str.trim());
  };

  const getSortBy = () => {
    const commas = getSimpleArg('sort', args)[0] || ', DESC';
    return commas.split(',').map((str) => str.trim());
  };

  const fields = getFields();
  const [sortField, sortOrder] = getSortBy();

  const index = getIndex();

  useEffect(() => {
    if (getSimpleArg('index', args)[0] !== index) {
      setArg('index', index);
    }
  }, [args, index, setArg]);

  const sortOptions = [
    { value: 'asc', text: strings.getAscendingOption() },
    { value: 'desc', text: strings.getDescendingOption() },
  ];

  return (
    <div>
      <EuiFormRow
        label={strings.getIndexTitle()}
        helpText={strings.getIndexLabel()}
        display="rowCompressed"
      >
        <ESDataViewSelect value={index} onChange={(index) => setArg('index', index)} />
      </EuiFormRow>

      <EuiFormRow
        label={strings.getFieldsTitle()}
        helpText={fields.length <= 10 ? strings.getFieldsLabel() : strings.getFieldsWarningLabel()}
        display="rowCompressed"
      >
        <ESFieldsSelect
          index={index}
          onChange={(fields) => setArg('fields', fields.join(', '))}
          selected={fields}
        />
      </EuiFormRow>

      <EuiSpacer size="s" />
      <EuiAccordion
        id="accordionAdvancedSettings"
        buttonContent="Advanced settings"
        className="canvasSidebar__accordion"
      >
        <EuiSpacer size="s" />
        <EuiFormRow label={strings.getSortFieldTitle()} display="columnCompressed">
          <ESFieldSelect
            index={index}
            value={sortField}
            onChange={(field) => setArg('sort', [field, sortOrder].join(', '))}
          />
        </EuiFormRow>

        <EuiFormRow label={strings.getSortOrderTitle()} display="columnCompressed">
          <EuiSelect
            value={sortOrder.toLowerCase()}
            onChange={(e) => setArg('sort', [sortField, e.target.value].join(', '))}
            options={sortOptions}
            compressed
          />
        </EuiFormRow>

        <EuiFormRow
          label={strings.getQueryTitle()}
          labelAppend={
            <EuiText size="xs">
              <EuiLink href={LUCENE_QUERY_URL} target="_blank">
                {strings.getQueryLabel()}
              </EuiLink>
            </EuiText>
          }
          display="rowCompressed"
        >
          <EuiTextArea
            value={getQuery()}
            onChange={(e) => setArg(getArgName(), e.target.value)}
            compressed
          />
        </EuiFormRow>
      </EuiAccordion>

      <EuiSpacer size="m" />

      <EuiCallOut size="s" title={strings.getWarningTitle()} iconType="warning" color="warning">
        <p>{strings.getWarning()}</p>
      </EuiCallOut>
    </div>
  );
};

EsdocsDatasource.propTypes = {
  args: PropTypes.object.isRequired,
  updateArgs: PropTypes.func,
  defaultIndex: PropTypes.string,
};

export const esdocs = () => ({
  name: 'esdocs',
  displayName: strings.getDisplayName(),
  help: strings.getHelp(),
  image: 'documents',
  template: templateFromReactComponent(EsdocsDatasource),
});
