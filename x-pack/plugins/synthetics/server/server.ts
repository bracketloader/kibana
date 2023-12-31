/*
 * Copyright Elasticsearch B.V. and/or licensed to Elasticsearch B.V. under one
 * or more contributor license agreements. Licensed under the Elastic License
 * 2.0; you may not use this file except in compliance with the Elastic License
 * 2.0.
 */
import { IRuleDataClient } from '@kbn/rule-registry-plugin/server';
import { registerSyntheticsTLSCheckRule } from './alert_rules/tls_rule/tls_rule';
import { registerSyntheticsStatusCheckRule } from './alert_rules/status_rule/monitor_status_rule';
import { SyntheticsPluginsSetupDependencies, SyntheticsServerSetup } from './types';
import { createSyntheticsRouteWithAuth } from './routes/create_route_with_auth';
import { SyntheticsMonitorClient } from './synthetics_service/synthetics_monitor/synthetics_monitor_client';
import { syntheticsRouteWrapper } from './synthetics_route_wrapper';
import { syntheticsAppRestApiRoutes } from './routes';

export const initSyntheticsServer = (
  server: SyntheticsServerSetup,
  syntheticsMonitorClient: SyntheticsMonitorClient,
  plugins: SyntheticsPluginsSetupDependencies,
  ruleDataClient: IRuleDataClient
) => {
  syntheticsAppRestApiRoutes.forEach((route) => {
    const { method, options, handler, validate, path } = syntheticsRouteWrapper(
      createSyntheticsRouteWithAuth(route),
      server,
      syntheticsMonitorClient
    );

    const routeDefinition = {
      path,
      validate,
      options,
    };

    switch (method) {
      case 'GET':
        server.router.get(routeDefinition, handler);
        break;
      case 'POST':
        server.router.post(routeDefinition, handler);
        break;
      case 'PUT':
        server.router.put(routeDefinition, handler);
        break;
      case 'DELETE':
        server.router.delete(routeDefinition, handler);
        break;
      default:
        throw new Error(`Handler for method ${method} is not defined`);
    }
  });

  const {
    alerting: { registerType },
  } = plugins;

  const statusAlert = registerSyntheticsStatusCheckRule(
    server,
    plugins,
    syntheticsMonitorClient,
    ruleDataClient
  );

  registerType(statusAlert);

  const tlsRule = registerSyntheticsTLSCheckRule(
    server,
    plugins,
    syntheticsMonitorClient,
    ruleDataClient
  );

  registerType(tlsRule);
};
