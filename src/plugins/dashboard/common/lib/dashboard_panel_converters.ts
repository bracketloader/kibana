/*
 * Copyright Elasticsearch B.V. and/or licensed to Elasticsearch B.V. under one
 * or more contributor license agreements. Licensed under the Elastic License
 * 2.0 and the Server Side Public License, v 1; you may not use this file except
 * in compliance with, at your election, the Elastic License 2.0 or the Server
 * Side Public License, v 1.
 */

import { omit } from 'lodash';
import { EmbeddableInput, SavedObjectEmbeddableInput } from '@kbn/embeddable-plugin/common';

import { DashboardPanelMap, DashboardPanelState } from '..';
import { SavedDashboardPanel } from '../content_management';

export function convertSavedDashboardPanelToPanelState<
  TEmbeddableInput extends EmbeddableInput | SavedObjectEmbeddableInput = SavedObjectEmbeddableInput
>(savedDashboardPanel: SavedDashboardPanel): DashboardPanelState<TEmbeddableInput> {
  return {
    type: savedDashboardPanel.type,
    version: savedDashboardPanel.version,
    gridData: savedDashboardPanel.gridData,
    panelRefName: savedDashboardPanel.panelRefName,
    explicitInput: {
      id: savedDashboardPanel.panelIndex,
      ...(savedDashboardPanel.id !== undefined && { savedObjectId: savedDashboardPanel.id }),
      ...(savedDashboardPanel.title !== undefined && { title: savedDashboardPanel.title }),
      ...savedDashboardPanel.embeddableConfig,
    } as TEmbeddableInput,
  };
}

export function convertPanelStateToSavedDashboardPanel(
  panelState: DashboardPanelState,
  version?: string
): SavedDashboardPanel {
  const savedObjectId = (panelState.explicitInput as SavedObjectEmbeddableInput).savedObjectId;
  return {
    version: version ?? (panelState.version as string), // temporary cast. Version will be mandatory at a later date.
    type: panelState.type,
    gridData: panelState.gridData,
    panelIndex: panelState.explicitInput.id,
    embeddableConfig: omit(panelState.explicitInput, ['id', 'savedObjectId', 'title']),
    ...(panelState.explicitInput.title !== undefined && { title: panelState.explicitInput.title }),
    ...(savedObjectId !== undefined && { id: savedObjectId }),
    ...(panelState.panelRefName !== undefined && { panelRefName: panelState.panelRefName }),
  };
}

export const convertSavedPanelsToPanelMap = (panels?: SavedDashboardPanel[]): DashboardPanelMap => {
  const panelsMap: DashboardPanelMap = {};
  panels?.forEach((panel, idx) => {
    panelsMap![panel.panelIndex ?? String(idx)] = convertSavedDashboardPanelToPanelState(panel);
  });
  return panelsMap;
};

export const convertPanelMapToSavedPanels = (
  panels: DashboardPanelMap,
  versionOverride?: string
) => {
  return Object.values(panels).map((panel) =>
    convertPanelStateToSavedDashboardPanel(panel, versionOverride)
  );
};
