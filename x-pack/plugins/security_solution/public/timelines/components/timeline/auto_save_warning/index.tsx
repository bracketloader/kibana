/*
 * Copyright Elasticsearch B.V. and/or licensed to Elasticsearch B.V. under one
 * or more contributor license agreements. Licensed under the Elastic License
 * 2.0; you may not use this file except in compliance with the Elastic License
 * 2.0.
 */

import type { EuiGlobalToastListToast as Toast } from '@elastic/eui';
import { EuiButton, EuiFlexGroup, EuiFlexItem } from '@elastic/eui';
import { getOr } from 'lodash/fp';
import React, { useCallback, useMemo } from 'react';
import { useDispatch } from 'react-redux';

import { useDeepEqualSelector } from '../../../../common/hooks/use_selector';
import { setTimelineRangeDatePicker } from '../../../../common/store/inputs/actions';
import { timelineActions, timelineSelectors } from '../../../store/timeline';
import { useStateToaster } from '../../../../common/components/toasters';
import * as i18n from './translations';

const AutoSaveWarningMsgComponent = () => {
  const dispatch = useDispatch();
  const dispatchToaster = useStateToaster()[1];
  const { timelineId, newTimelineModel } = useDeepEqualSelector(
    timelineSelectors.autoSaveMsgSelector
  );

  const handleClick = useCallback(() => {
    if (timelineId != null && newTimelineModel != null) {
      dispatch(timelineActions.updateTimeline({ id: timelineId, timeline: newTimelineModel }));
      dispatch(timelineActions.updateAutoSaveMsg({ timelineId: null, newTimelineModel: null }));
      dispatch(
        setTimelineRangeDatePicker({
          from: getOr(0, 'dateRange.start', newTimelineModel),
          to: getOr(0, 'dateRange.end', newTimelineModel),
        })
      );
    }
  }, [dispatch, newTimelineModel, timelineId]);

  const TextComponent = useMemo(
    () => (
      <>
        <p>{i18n.DESCRIPTION}</p>
        <EuiFlexGroup justifyContent="flexEnd" gutterSize="s">
          <EuiFlexItem grow={false}>
            <EuiButton size="s" onClick={handleClick}>
              {i18n.REFRESH_TIMELINE}
            </EuiButton>
          </EuiFlexItem>
        </EuiFlexGroup>
      </>
    ),
    [handleClick]
  );

  if (timelineId != null && newTimelineModel != null) {
    const toast: Toast = {
      id: 'AutoSaveWarningMsg',
      title: i18n.TITLE,
      color: 'warning',
      iconType: 'warning',
      toastLifeTimeMs: 10000,
      text: TextComponent,
    };
    dispatchToaster({
      type: 'addToaster',
      toast,
    });
  }

  return null;
};

AutoSaveWarningMsgComponent.displayName = 'AutoSaveWarningMsgComponent';

export const AutoSaveWarningMsg = React.memo(AutoSaveWarningMsgComponent);
