/*
 * Copyright Elasticsearch B.V. and/or licensed to Elasticsearch B.V. under one
 * or more contributor license agreements. Licensed under the Elastic License
 * 2.0; you may not use this file except in compliance with the Elastic License
 * 2.0.
 */

import { useCallback, useMemo } from 'react';
import { ExceptionListTypeEnum } from '@kbn/securitysolution-io-ts-list-types';

import { useUserData } from '../../user_info';
import { ACTION_ADD_ENDPOINT_EXCEPTION, ACTION_ADD_EXCEPTION } from '../translations';
import type { AlertTableContextMenuItem } from '../types';

interface UseExceptionActionProps {
  isEndpointAlert: boolean;
  onAddExceptionTypeClick: (type?: ExceptionListTypeEnum) => void;
}

export const useExceptionActions = ({
  isEndpointAlert,
  onAddExceptionTypeClick,
}: UseExceptionActionProps) => {
  const [{ canUserCRUD, hasIndexWrite }] = useUserData();

  const handleDetectionExceptionModal = useCallback(() => {
    onAddExceptionTypeClick();
  }, [onAddExceptionTypeClick]);

  const handleEndpointExceptionModal = useCallback(() => {
    onAddExceptionTypeClick(ExceptionListTypeEnum.ENDPOINT);
  }, [onAddExceptionTypeClick]);

  const disabledAddEndpointException = !canUserCRUD || !hasIndexWrite || !isEndpointAlert;
  const disabledAddException = !canUserCRUD || !hasIndexWrite;

  const exceptionActionItems: AlertTableContextMenuItem[] = useMemo(
    () =>
      disabledAddException
        ? []
        : [
            {
              key: 'add-endpoint-exception-menu-item',
              'data-test-subj': 'add-endpoint-exception-menu-item',
              disabled: disabledAddEndpointException,
              onClick: handleEndpointExceptionModal,
              name: ACTION_ADD_ENDPOINT_EXCEPTION,
            },
            {
              key: 'add-exception-menu-item',
              'data-test-subj': 'add-exception-menu-item',
              disabled: disabledAddException,
              onClick: handleDetectionExceptionModal,
              name: ACTION_ADD_EXCEPTION,
            },
          ],
    [
      disabledAddEndpointException,
      disabledAddException,
      handleDetectionExceptionModal,
      handleEndpointExceptionModal,
    ]
  );

  return { exceptionActionItems };
};
