/*
 * Copyright Elasticsearch B.V. and/or licensed to Elasticsearch B.V. under one
 * or more contributor license agreements. Licensed under the Elastic License
 * 2.0 and the Server Side Public License, v 1; you may not use this file except
 * in compliance with, at your election, the Elastic License 2.0 or the Server
 * Side Public License, v 1.
 */

import { serviceContractMock } from './service_contract.mock';

const createSetupContractMock = () => {
  return {
    setUserProfileSettings: jest.fn(),
    getUserSettingDarkMode: jest.fn(),
  };
};

const createMock = () => {
  const mocked = serviceContractMock();
  mocked.setup.mockReturnValue(createSetupContractMock());
  // mocked.start.mockReturnValue(createStartContractMock());
  return mocked;
};

export const userSettingsServiceMock = {
  create: createMock,
  createSetupContract: createSetupContractMock,
};
