/*
 * Copyright Elasticsearch B.V. and/or licensed to Elasticsearch B.V. under one
 * or more contributor license agreements. Licensed under the Elastic License
 * 2.0; you may not use this file except in compliance with the Elastic License
 * 2.0.
 */

import type { CoreStart, HttpSetup } from '@kbn/core/public';
import type { History } from 'history';
import { createBrowserHistory } from 'history';
import type { Store } from 'redux';
import { applyMiddleware, createStore } from 'redux';

import { coreMock } from '@kbn/core/public/mocks';

import type { AppLocation, MetadataListResponse } from '../../../../../common/endpoint/types';
import type { DepsStartMock } from '../../../../common/mock/endpoint';
import { depsStartMock } from '../../../../common/mock/endpoint';

import { endpointMiddlewareFactory } from './middleware';

import { endpointListReducer } from './reducer';

import { uiQueryParams } from './selectors';
import {
  mockEndpointResultList,
  setEndpointListApiMockImplementation,
} from './mock_endpoint_result_list';
import type { EndpointState, EndpointIndexUIQueryParams } from '../types';
import type { MiddlewareActionSpyHelper } from '../../../../common/store/test_utils';
import { createSpyMiddleware } from '../../../../common/store/test_utils';
import { getEndpointListPath } from '../../../common/routing';
import { HOST_METADATA_LIST_ROUTE } from '../../../../../common/endpoint/constants';

jest.mock('../../../services/policies/ingest', () => ({
  sendGetAgentPolicyList: () => Promise.resolve({ items: [] }),
  sendGetEndpointSecurityPackage: () => Promise.resolve({}),
}));
describe('endpoint list pagination: ', () => {
  let fakeCoreStart: jest.Mocked<CoreStart>;
  let depsStart: DepsStartMock;
  let fakeHttpServices: jest.Mocked<HttpSetup>;
  let history: History<AppLocation['state']>;
  let store: Store;
  let queryParams: () => EndpointIndexUIQueryParams;
  let waitForAction: MiddlewareActionSpyHelper['waitForAction'];
  let actionSpyMiddleware;
  const getEndpointListApiResponse = (): MetadataListResponse => {
    return mockEndpointResultList({ pageSize: 1, page: 0, total: 10 });
  };

  let historyPush: (params: EndpointIndexUIQueryParams) => void;
  beforeEach(() => {
    fakeCoreStart = coreMock.createStart();
    depsStart = depsStartMock();
    fakeHttpServices = fakeCoreStart.http as jest.Mocked<HttpSetup>;
    history = createBrowserHistory();
    const middleware = endpointMiddlewareFactory(fakeCoreStart, depsStart);
    ({ actionSpyMiddleware, waitForAction } = createSpyMiddleware<EndpointState>());
    store = createStore(endpointListReducer, applyMiddleware(middleware, actionSpyMiddleware));

    history.listen((location) => {
      store.dispatch({ type: 'userChangedUrl', payload: location });
    });

    queryParams = () => uiQueryParams(store.getState());

    historyPush = (nextQueryParams: EndpointIndexUIQueryParams): void => {
      return history.push(getEndpointListPath({ name: 'endpointList', ...nextQueryParams }));
    };

    setEndpointListApiMockImplementation(fakeHttpServices);
  });

  describe('when the user enteres the endpoint list for the first time', () => {
    it('the api is called with page_index and page_size defaulting to 0 and 10 respectively', async () => {
      const apiResponse = getEndpointListApiResponse();
      fakeHttpServices.get.mockResolvedValue(apiResponse);
      expect(fakeHttpServices.get).not.toHaveBeenCalled();

      store.dispatch({
        type: 'userChangedUrl',
        payload: {
          ...history.location,
          pathname: getEndpointListPath({ name: 'endpointList' }),
        },
      });
      await waitForAction('serverReturnedEndpointList');
      expect(fakeHttpServices.get).toHaveBeenCalledWith(HOST_METADATA_LIST_ROUTE, {
        query: {
          page: '0',
          pageSize: '10',
          kuery: '',
        },
        version: '2023-10-31',
      });
    });
  });
  describe('when a new page size is passed', () => {
    it('should modify the url correctly', () => {
      historyPush({ ...queryParams(), page_size: '20' });
      expect(queryParams()).toMatchInlineSnapshot(`
        Object {
          "page_index": "0",
          "page_size": "20",
        }
      `);
    });
  });
  describe('when an invalid page size is passed', () => {
    it('should modify the page size in the url to the default page size', () => {
      historyPush({ ...queryParams(), page_size: '1' });
      expect(queryParams()).toEqual({ page_index: '0', page_size: '10' });
    });
  });

  describe('when a negative page size is passed', () => {
    it('should modify the page size in the url to the default page size', () => {
      historyPush({ ...queryParams(), page_size: '-1' });
      expect(queryParams()).toEqual({ page_index: '0', page_size: '10' });
    });
  });

  describe('when a new page index is passed', () => {
    it('should modify the page index in the url correctly', () => {
      historyPush({ ...queryParams(), page_index: '2' });
      expect(queryParams()).toEqual({ page_index: '2', page_size: '10' });
    });
  });

  describe('when a negative page index is passed', () => {
    it('should modify the page index in the url to the default page index', () => {
      historyPush({ ...queryParams(), page_index: '-2' });
      expect(queryParams()).toEqual({ page_index: '0', page_size: '10' });
    });
  });

  describe('when invalid params are passed in the url', () => {
    it('ignores non-numeric values for page_index and page_size', () => {
      historyPush({ ...queryParams, page_index: 'one', page_size: 'fifty' });
      expect(queryParams()).toEqual({ page_index: '0', page_size: '10' });
    });

    it('ignores unknown url search params', () => {
      store.dispatch({
        type: 'userChangedUrl',
        payload: {
          ...history.location,
          pathname: '/endpoint-hosts',
          search: '?foo=bar',
        },
      });
      expect(queryParams()).toEqual({ page_index: '0', page_size: '10' });
    });

    it('ignores multiple values of the same query params except the last value', () => {
      store.dispatch({
        type: 'userChangedUrl',
        payload: {
          ...history.location,
          pathname: '/endpoint-hosts',
          search: '?page_index=2&page_index=3&page_size=20&page_size=50',
        },
      });
      expect(queryParams()).toEqual({ page_index: '3', page_size: '50' });
    });
  });
});
