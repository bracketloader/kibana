/*
 * Copyright Elasticsearch B.V. and/or licensed to Elasticsearch B.V. under one
 * or more contributor license agreements. Licensed under the Elastic License
 * 2.0; you may not use this file except in compliance with the Elastic License
 * 2.0.
 */

import { useLocation } from 'react-router-dom';
import { useMemo } from 'react';
import { parse } from 'query-string';
import { useUiSetting } from '@kbn/kibana-react-plugin/public';
import { UI_SETTINGS } from '@kbn/data-plugin/common';
import { getAbsoluteTime } from '../utils/date';
import { TimePickerTimeDefaults } from '../types';

const getParsedParams = (search: string) => {
  return search ? parse(search[0] === '?' ? search.slice(1) : search, { sort: false }) : {};
};

export function useQueryParams() {
  const { from, to } = useUiSetting<TimePickerTimeDefaults>(UI_SETTINGS.TIMEPICKER_TIME_DEFAULTS);

  const { rangeFrom, rangeTo } = getParsedParams(useLocation().search);

  return useMemo(() => {
    return {
      start: (rangeFrom as string) ?? from,
      end: (rangeTo as string) ?? to,
      absStart: getAbsoluteTime((rangeFrom as string) ?? from)!,
      absEnd: getAbsoluteTime((rangeTo as string) ?? to, { roundUp: true })!,
    };
  }, [rangeFrom, rangeTo, from, to]);
}
