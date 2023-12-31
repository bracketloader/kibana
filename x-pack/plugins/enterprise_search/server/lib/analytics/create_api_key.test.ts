/*
 * Copyright Elasticsearch B.V. and/or licensed to Elasticsearch B.V. under one
 * or more contributor license agreements. Licensed under the Elastic License
 * 2.0; you may not use this file except in compliance with the Elastic License
 * 2.0.
 */

import { IScopedClusterClient } from '@kbn/core/server';

import { createApiKey } from './create_api_key';

describe('createApiKey lib function', () => {
  const createResponse = {
    api_key: 'ui2lp2axTNmsyakw9tvNnw',
    encoded: 'VnVhQ2ZHY0JDZGJrUW0tZTVhT3g6dWkybHAyYXhUTm1zeWFrdzl0dk5udw==',
    id: 'VuaCfGcBCdbkQm-e5aOx',
    name: 'website key',
  };

  const mockClient = {
    asCurrentUser: {
      security: {
        createApiKey: jest.fn().mockReturnValue(createResponse),
      },
    },
  };

  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('should create an api key via the security plugin', async () => {
    await expect(
      createApiKey(mockClient as unknown as IScopedClusterClient, 'website', 'website key')
    ).resolves.toEqual(createResponse);

    expect(mockClient.asCurrentUser.security.createApiKey).toHaveBeenCalledWith({
      name: 'website key',
      role_descriptors: {
        'website-key-role': {
          cluster: ['post_behavioral_analytics_event'],
        },
      },
    });
  });
});
