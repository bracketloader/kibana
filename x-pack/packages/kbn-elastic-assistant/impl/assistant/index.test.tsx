/*
 * Copyright Elasticsearch B.V. and/or licensed to Elasticsearch B.V. under one
 * or more contributor license agreements. Licensed under the Elastic License
 * 2.0; you may not use this file except in compliance with the Elastic License
 * 2.0.
 */

import React, { MutableRefObject, SetStateAction } from 'react';

import { render } from '@testing-library/react';
import { Assistant } from '.';
import { AssistantProvider } from '../assistant_context';
import { Conversation } from '../assistant_context/types';
import { CodeBlockDetails } from './use_conversation/helpers';
import { HttpSetup, IHttpFetchError } from '@kbn/core/public';
import { EuiCommentProps } from '@elastic/eui';
import {
  ActionConnector,
  ActionTypeRegistryContract,
} from '@kbn/triggers-actions-ui-plugin/public';

import { useLoadConnectors } from '../connectorland/use_load_connectors';
import { useConnectorSetup } from '../connectorland/connector_setup';

import { UseQueryResult } from '@tanstack/react-query';
import { WELCOME_CONVERSATION_TITLE } from './use_conversation/translations';

jest.mock('../connectorland/use_load_connectors');
jest.mock('../connectorland/connector_setup');

const renderAssistant = () =>
  render(
    <AssistantProvider
      actionTypeRegistry={{} as ActionTypeRegistryContract}
      augmentMessageCodeBlocks={function (_: Conversation): CodeBlockDetails[][] {
        return [];
      }}
      baseAllow={[]}
      baseAllowReplacement={[]}
      defaultAllow={[]}
      defaultAllowReplacement={[]}
      getComments={function (_: {
        currentConversation: Conversation;
        lastCommentRef: MutableRefObject<HTMLDivElement | null>;
        showAnonymizedValues: boolean;
      }): EuiCommentProps[] {
        return [];
      }}
      http={{ basePath: { get: () => 'mockBasePath' } } as unknown as HttpSetup}
      getInitialConversations={function (): Record<string, Conversation> {
        return {
          [WELCOME_CONVERSATION_TITLE]: {
            id: WELCOME_CONVERSATION_TITLE,
            messages: [],
            apiConfig: {},
          },
        };
      }}
      setConversations={function (_: SetStateAction<Record<string, Conversation>>): void {}}
      setDefaultAllow={function (_: SetStateAction<string[]>): void {}}
      setDefaultAllowReplacement={function (_: SetStateAction<string[]>): void {}}
    >
      <Assistant />
    </AssistantProvider>
  );

describe('Assistant', () => {
  it('should render', () => {
    jest.mocked(useLoadConnectors).mockReturnValue({
      data: [],
    } as unknown as UseQueryResult<ActionConnector[], IHttpFetchError>);

    jest.mocked(useConnectorSetup).mockReturnValue({
      connectorDialog: <></>,
      connectorPrompt: <></>,
    });

    renderAssistant();
  });
});
