/*
 * Copyright Elasticsearch B.V. and/or licensed to Elasticsearch B.V. under one
 * or more contributor license agreements. Licensed under the Elastic License
 * 2.0 and the Server Side Public License, v 1; you may not use this file except
 * in compliance with, at your election, the Elastic License 2.0 or the Server
 * Side Public License, v 1.
 */

import type { IRouter } from '@kbn/core/server';
import { TELEMETRY_SAVED_OBJECT_TYPE } from '../saved_objects';
import { v2 } from '../../common/types';
import {
  type TelemetrySavedObjectAttributes,
  getTelemetrySavedObject,
  updateTelemetrySavedObject,
} from '../saved_objects';

export function registerTelemetryUserHasSeenNotice(router: IRouter, currentKibanaVersion: string) {
  router.put(
    {
      path: '/api/telemetry/v2/userHasSeenNotice',
      validate: false,
    },
    async (context, req, res) => {
      const soClient = (await context.core).savedObjects.getClient({
        includedHiddenTypes: [TELEMETRY_SAVED_OBJECT_TYPE],
      });
      const telemetrySavedObject = await getTelemetrySavedObject(soClient);

      // update the object with a flag stating that the opt-in notice has been seen
      const updatedAttributes: TelemetrySavedObjectAttributes = {
        ...telemetrySavedObject,
        userHasSeenNotice: true,
        // We need to store that the user was notified in this version.
        // Otherwise, it'll continuously show the banner if previously opted-out.
        lastVersionChecked: currentKibanaVersion,
      };
      await updateTelemetrySavedObject(soClient, updatedAttributes);

      const body: v2.Telemetry = {
        allowChangingOptInStatus: updatedAttributes.allowChangingOptInStatus,
        enabled: updatedAttributes.enabled,
        lastReported: updatedAttributes.lastReported,
        lastVersionChecked: updatedAttributes.lastVersionChecked,
        reportFailureCount: updatedAttributes.reportFailureCount,
        reportFailureVersion: updatedAttributes.reportFailureVersion,
        sendUsageFrom: updatedAttributes.sendUsageFrom,
        userHasSeenNotice: updatedAttributes.userHasSeenNotice,
      };
      return res.ok({ body });
    }
  );
}
