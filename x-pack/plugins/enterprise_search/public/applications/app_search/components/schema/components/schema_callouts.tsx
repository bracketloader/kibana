/*
 * Copyright Elasticsearch B.V. and/or licensed to Elasticsearch B.V. under one
 * or more contributor license agreements. Licensed under the Elastic License
 * 2.0; you may not use this file except in compliance with the Elastic License
 * 2.0.
 */

import React from 'react';

import { useValues, useActions } from 'kea';

import { EuiCallOut, EuiButton, EuiSpacer, EuiFlexGroup, EuiFlexItem, EuiLink } from '@elastic/eui';
import { i18n } from '@kbn/i18n';

import { EuiButtonTo } from '../../../../shared/react_router_helpers';
import { SchemaErrorsCallout } from '../../../../shared/schema';
import { AppLogic } from '../../../app_logic';
import { ENGINE_RELEVANCE_TUNING_PATH, ENGINE_REINDEX_JOB_PATH } from '../../../routes';
import { generateEnginePath } from '../../engine';

import { SchemaLogic } from '../schema_logic';

export const SchemaCallouts: React.FC = () => {
  const {
    myRole: { canManageEngines },
  } = useValues(AppLogic);
  const {
    hasUnconfirmedFields,
    hasNewUnsearchedFields,
    mostRecentIndexJob: { hasErrors, activeReindexJobId },
    hasIncompleteFields,
  } = useValues(SchemaLogic);

  return (
    <>
      {hasErrors && (
        <>
          <SchemaErrorsCallout
            viewErrorsPath={generateEnginePath(ENGINE_REINDEX_JOB_PATH, {
              reindexJobId: activeReindexJobId,
            })}
          />
          <EuiSpacer />
        </>
      )}
      {hasUnconfirmedFields && canManageEngines && (
        <>
          {hasNewUnsearchedFields ? <UnsearchedFieldsCallout /> : <UnconfirmedFieldsCallout />}
          <EuiSpacer />
        </>
      )}
      {hasIncompleteFields && (
        <>
          <MissingSubfieldsCallout />
          <EuiSpacer />
        </>
      )}
    </>
  );
};

export const UnsearchedFieldsCallout: React.FC = () => (
  <EuiCallOut
    iconType="iInCircle"
    title={i18n.translate('xpack.enterpriseSearch.appSearch.engine.schema.unsearchedFields.title', {
      defaultMessage: 'Recently added fields are not being searched by default',
    })}
    data-test-subj="schemaUnsearchedUnconfirmedFieldsCallout"
  >
    <p>
      {i18n.translate(
        'xpack.enterpriseSearch.appSearch.engine.schema.unsearchedFields.description',
        {
          defaultMessage:
            'If these new fields should be searchable, update your search settings to include them. If you want them to remain unsearchable, confirm your new field types to dismiss this alert.',
        }
      )}
    </p>
    <EuiFlexGroup gutterSize="s" responsive={false}>
      <EuiFlexItem grow={false}>
        <EuiButtonTo
          fill
          size="s"
          to={generateEnginePath(ENGINE_RELEVANCE_TUNING_PATH)}
          data-test-subj="relevanceTuningButtonLink"
        >
          {i18n.translate(
            'xpack.enterpriseSearch.appSearch.engine.schema.unsearchedFields.searchSettingsButtonLabel',
            { defaultMessage: 'Update search settings' }
          )}
        </EuiButtonTo>
      </EuiFlexItem>
      <EuiFlexItem grow={false}>
        <ConfirmSchemaButton />
      </EuiFlexItem>
    </EuiFlexGroup>
  </EuiCallOut>
);

export const UnconfirmedFieldsCallout: React.FC = () => (
  <EuiCallOut
    iconType="iInCircle"
    title={i18n.translate(
      'xpack.enterpriseSearch.appSearch.engine.schema.unconfirmedFields.title',
      { defaultMessage: "You've recently added new schema fields" }
    )}
    data-test-subj="schemaUnconfirmedFieldsCallout"
  >
    <p>
      {i18n.translate(
        'xpack.enterpriseSearch.appSearch.engine.schema.unconfirmedFields.description',
        {
          defaultMessage:
            'Set your new schema field(s) to their correct or expected types, and then confirm your field types.',
        }
      )}
    </p>
    <ConfirmSchemaButton />
  </EuiCallOut>
);

export const ConfirmSchemaButton: React.FC = () => {
  const { updateSchema } = useActions(SchemaLogic);
  const { isUpdating } = useValues(SchemaLogic);

  return (
    <EuiButton
      size="s"
      isLoading={isUpdating}
      onClick={() => updateSchema()}
      data-test-subj="confirmSchemaTypesButton"
    >
      {i18n.translate('xpack.enterpriseSearch.appSearch.engine.schema.confirmSchemaButtonLabel', {
        defaultMessage: 'Confirm types',
      })}
    </EuiButton>
  );
};

export const MissingSubfieldsCallout: React.FC = () => {
  const { incompleteFields } = useValues(SchemaLogic);

  return (
    <EuiCallOut
      iconType="warning"
      color="warning"
      title={i18n.translate(
        'xpack.enterpriseSearch.appSearch.engine.schema.incompleteFields.title',
        {
          defaultMessage:
            '{count, plural, one {A field is} other {# fields are}} missing subfields',
          values: { count: incompleteFields.length },
        }
      )}
    >
      <p>
        {i18n.translate(
          'xpack.enterpriseSearch.appSearch.engine.schema.incompleteFields.description',
          {
            defaultMessage:
              'Some fields are missing one or more subfields used by App Search. Some search features may not work until those subfields are added.',
          }
        )}{' '}
      </p>
      <EuiLink
        href="https://www.elastic.co/guide/en/app-search/current/elasticsearch-engines-text-subfields-support-conventions.html"
        data-test-subj="missingSubfieldsLearnMoreLink"
        target="_blank"
      >
        {i18n.translate('xpack.enterpriseSearch.appSearch.engine.schema.incompleteFields.link', {
          defaultMessage: 'Learn more.',
        })}
      </EuiLink>
    </EuiCallOut>
  );
};
