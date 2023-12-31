/*
 * Copyright Elasticsearch B.V. and/or licensed to Elasticsearch B.V. under one
 * or more contributor license agreements. Licensed under the Elastic License
 * 2.0; you may not use this file except in compliance with the Elastic License
 * 2.0.
 */

import { act } from 'react-dom/test-utils';

import { componentHelpers, MappingsEditorTestBed, kibanaVersion } from '../helpers';
import { getFieldConfig } from '../../../lib';

const { setup, getMappingsEditorDataFactory } = componentHelpers.mappingsEditor;

// Parameters automatically added to the text datatype when saved (with the default values)
export const defaultTextParameters = {
  type: 'text',
  eager_global_ordinals: false,
  fielddata: false,
  index: true,
  index_options: 'positions',
  index_phrases: false,
  norms: true,
  store: false,
};

describe('Mappings editor: text datatype', () => {
  /**
   * Variable to store the mappings data forwarded to the consumer component
   */
  let data: any;
  let onChangeHandler: jest.Mock = jest.fn();
  let getMappingsEditorData = getMappingsEditorDataFactory(onChangeHandler);
  let testBed: MappingsEditorTestBed;

  beforeAll(() => {
    jest.useFakeTimers({ legacyFakeTimers: true });
  });

  afterAll(() => {
    jest.useRealTimers();
  });

  beforeEach(() => {
    onChangeHandler = jest.fn();
    getMappingsEditorData = getMappingsEditorDataFactory(onChangeHandler);
  });

  test('initial view and default parameters values', async () => {
    const defaultMappings = {
      properties: {
        myField: {
          type: 'text',
        },
      },
    };

    await act(async () => {
      testBed = setup({ value: defaultMappings, onChange: onChangeHandler });
    });
    testBed.component.update();

    const {
      component,
      exists,
      actions: { startEditField, updateFieldName, getToggleValue, updateFieldAndCloseFlyout },
    } = testBed;

    // Open the flyout to edit the field
    await startEditField('myField');

    // Update the name of the field
    await updateFieldName('updatedField');

    // It should have searchable ("index" param) active by default
    const indexFieldConfig = getFieldConfig('index');
    expect(getToggleValue('indexParameter.formRowToggle')).toBe(indexFieldConfig.defaultValue);

    if (kibanaVersion.major < 7) {
      expect(exists('boostParameterToggle')).toBe(true);
    } else {
      // Since 8.x the boost parameter is deprecated
      expect(exists('boostParameterToggle')).toBe(false);
    }

    // Save the field and close the flyout
    await updateFieldAndCloseFlyout();

    // It should have the default parameters values added
    const updatedMappings = {
      properties: {
        updatedField: {
          ...defaultTextParameters,
        },
      },
    };

    ({ data } = await getMappingsEditorData(component));
    expect(data).toEqual(updatedMappings);
  });

  test('analyzer parameter: default values', async () => {
    const defaultMappings = {
      _meta: {},
      _source: {},
      properties: {
        myField: {
          type: 'text',
          // Should have 2 dropdown selects:
          // The first one set to 'language' and the second one set to 'french
          search_quote_analyzer: 'french',
        },
      },
    };

    await act(async () => {
      testBed = setup({ value: defaultMappings, onChange: onChangeHandler });
    });
    testBed.component.update();

    const {
      component,
      find,
      exists,
      form: { selectCheckBox, setSelectValue },
      actions: {
        startEditField,
        updateFieldName,
        getCheckboxValue,
        showAdvancedSettings,
        updateFieldAndCloseFlyout,
      },
    } = testBed;
    const fieldToEdit = 'myField';
    const newFieldName = 'updatedField';

    // Start edit, update the name only, and save to have all the default values
    await startEditField(fieldToEdit);
    await showAdvancedSettings();
    await updateFieldName(newFieldName);
    await updateFieldAndCloseFlyout();

    expect(exists('mappingsEditorFieldEdit')).toBe(false);

    ({ data } = await getMappingsEditorData(component));

    let updatedMappings: any = {
      ...defaultMappings,
      properties: {
        updatedField: {
          ...defaultMappings.properties.myField,
          ...defaultTextParameters,
        },
      },
    };
    expect(data).toEqual(updatedMappings);

    // Re-open the edit panel
    await startEditField(newFieldName);
    await showAdvancedSettings();

    // When no analyzer is defined, defaults to "Index default"
    let indexAnalyzerValue = find('indexAnalyzer.select').props().value;
    expect(indexAnalyzerValue).toEqual('index_default');

    const searchQuoteAnalyzerSelects = find('searchQuoteAnalyzer.select');

    expect(searchQuoteAnalyzerSelects.length).toBe(2);
    expect(searchQuoteAnalyzerSelects.at(0).props().value).toBe('language');
    expect(searchQuoteAnalyzerSelects.at(1).props().value).toBe(
      defaultMappings.properties.myField.search_quote_analyzer
    );

    // When no "search_analyzer" is defined, the checkBox should be checked
    let isUseSameAnalyzerForSearchChecked = getCheckboxValue(
      'useSameAnalyzerForSearchCheckBox.input'
    );
    expect(isUseSameAnalyzerForSearchChecked).toBe(true);

    // And the search analyzer select should not exist
    expect(exists('searchAnalyzer')).toBe(false);

    // Uncheck the "Use same analyzer for search" checkbox and make sure the dedicated select appears
    await act(async () => {
      selectCheckBox('useSameAnalyzerForSearchCheckBox.input', false);
    });
    component.update();

    expect(exists('searchAnalyzer.select')).toBe(true);

    let searchAnalyzerValue = find('searchAnalyzer.select').props().value;
    expect(searchAnalyzerValue).toEqual('index_default');

    await act(async () => {
      // Change the value of the 3 analyzers
      setSelectValue('indexAnalyzer.select', 'standard', false);
      setSelectValue('searchAnalyzer.select', 'simple', false);
      setSelectValue(find('searchQuoteAnalyzer.select').at(0), 'whitespace', false);
    });

    await updateFieldAndCloseFlyout();

    updatedMappings = {
      ...updatedMappings,
      properties: {
        updatedField: {
          ...updatedMappings.properties.updatedField,
          analyzer: 'standard',
          search_analyzer: 'simple',
          search_quote_analyzer: 'whitespace',
        },
      },
    };

    ({ data } = await getMappingsEditorData(component));
    expect(data).toEqual(updatedMappings);

    // Re-open the flyout and make sure the select have the correct updated value
    await startEditField(newFieldName);
    await showAdvancedSettings();

    isUseSameAnalyzerForSearchChecked = getCheckboxValue('useSameAnalyzerForSearchCheckBox.input');
    expect(isUseSameAnalyzerForSearchChecked).toBe(false);

    indexAnalyzerValue = find('indexAnalyzer.select').props().value;
    searchAnalyzerValue = find('searchAnalyzer.select').props().value;
    const searchQuoteAnalyzerValue = find('searchQuoteAnalyzer.select').props().value;

    expect(indexAnalyzerValue).toBe('standard');
    expect(searchAnalyzerValue).toBe('simple');
    expect(searchQuoteAnalyzerValue).toBe('whitespace');
  });

  test('analyzer parameter: custom analyzer (external plugin)', async () => {
    const defaultMappings = {
      _meta: {},
      _source: {},
      properties: {
        myField: {
          type: 'text',
          analyzer: 'myCustomIndexAnalyzer',
          search_analyzer: 'myCustomSearchAnalyzer',
          search_quote_analyzer: 'myCustomSearchQuoteAnalyzer',
        },
      },
    };

    let updatedMappings: any = {
      ...defaultMappings,
      properties: {
        myField: {
          ...defaultMappings.properties.myField,
          ...defaultTextParameters,
        },
      },
    };

    await act(async () => {
      testBed = setup({ value: defaultMappings, onChange: onChangeHandler });
    });
    testBed.component.update();

    const {
      find,
      exists,
      component,
      form: { setInputValue, setSelectValue },
      actions: { startEditField, showAdvancedSettings, updateFieldAndCloseFlyout },
    } = testBed;
    const fieldToEdit = 'myField';

    await startEditField(fieldToEdit);
    await showAdvancedSettings();

    expect(exists('indexAnalyzer-custom')).toBe(true);
    expect(exists('searchAnalyzer-custom')).toBe(true);
    expect(exists('searchQuoteAnalyzer-custom')).toBe(true);

    const indexAnalyzerValue = find('indexAnalyzer-custom.input').props().value;
    const searchAnalyzerValue = find('searchAnalyzer-custom.input').props().value;
    const searchQuoteAnalyzerValue = find('searchQuoteAnalyzer-custom.input').props().value;

    expect(indexAnalyzerValue).toBe(defaultMappings.properties.myField.analyzer);
    expect(searchAnalyzerValue).toBe(defaultMappings.properties.myField.search_analyzer);
    expect(searchQuoteAnalyzerValue).toBe(defaultMappings.properties.myField.search_quote_analyzer);

    const updatedIndexAnalyzer = 'newCustomIndexAnalyzer';
    const updatedSearchAnalyzer = 'whitespace';

    await act(async () => {
      // Change the index analyzer to another custom one
      setInputValue('indexAnalyzer-custom.input', updatedIndexAnalyzer);
    });

    await act(async () => {
      // Change the search analyzer to a built-in analyzer
      find('searchAnalyzer-toggleCustomButton').simulate('click');
    });
    component.update();

    await act(async () => {
      setSelectValue('searchAnalyzer.select', updatedSearchAnalyzer, false);
    });

    await act(async () => {
      // Change the searchQuote to use built-in analyzer
      // By default it means using the "index default"
      find('searchQuoteAnalyzer-toggleCustomButton').simulate('click');
    });

    await updateFieldAndCloseFlyout();

    ({ data } = await getMappingsEditorData(component));

    updatedMappings = {
      ...updatedMappings,
      properties: {
        myField: {
          ...updatedMappings.properties.myField,
          analyzer: updatedIndexAnalyzer,
          search_analyzer: updatedSearchAnalyzer,
          search_quote_analyzer: undefined, // Index default means not declaring the analyzer
        },
      },
    };

    expect(data).toEqual(updatedMappings);
  });

  test('analyzer parameter: custom analyzer (from index settings)', async () => {
    const indexSettings = {
      analysis: {
        analyzer: {
          // eslint-disable-next-line @typescript-eslint/naming-convention
          customAnalyzer_1: {},
          // eslint-disable-next-line @typescript-eslint/naming-convention
          customAnalyzer_2: {},
          // eslint-disable-next-line @typescript-eslint/naming-convention
          customAnalyzer_3: {},
        },
      },
    };

    const customAnalyzers = Object.keys(indexSettings.analysis.analyzer);

    const defaultMappings = {
      properties: {
        myField: {
          type: 'text',
          analyzer: customAnalyzers[0],
        },
      },
    };

    let updatedMappings: any = {
      ...defaultMappings,
      properties: {
        myField: {
          ...defaultMappings.properties.myField,
          ...defaultTextParameters,
        },
      },
    };

    await act(async () => {
      testBed = setup({
        value: defaultMappings,
        onChange: onChangeHandler,
        indexSettings,
      });
    });
    testBed.component.update();

    const {
      component,
      find,
      form: { setSelectValue },
      actions: { startEditField, showAdvancedSettings, updateFieldAndCloseFlyout },
    } = testBed;
    const fieldToEdit = 'myField';

    await startEditField(fieldToEdit);
    await showAdvancedSettings();

    // It should have 2 selects
    const indexAnalyzerSelects = find('indexAnalyzer.select');

    expect(indexAnalyzerSelects.length).toBe(2);
    expect(indexAnalyzerSelects.at(0).props().value).toBe('custom');
    expect(indexAnalyzerSelects.at(1).props().value).toBe(
      defaultMappings.properties.myField.analyzer
    );

    // Access the list of option of the second dropdown select
    const subSelectOptions = indexAnalyzerSelects
      .at(1)
      .find('option')
      .map((wrapper) => wrapper.text());

    expect(subSelectOptions).toEqual(customAnalyzers);

    await act(async () => {
      // Change the custom analyzer dropdown to another one from the index settings
      setSelectValue(find('indexAnalyzer.select').at(1), customAnalyzers[2], false);
    });
    component.update();

    await updateFieldAndCloseFlyout();

    ({ data } = await getMappingsEditorData(component));

    updatedMappings = {
      ...updatedMappings,
      properties: {
        myField: {
          ...updatedMappings.properties.myField,
          analyzer: customAnalyzers[2],
        },
      },
    };

    expect(data).toEqual(updatedMappings);
  });
});
