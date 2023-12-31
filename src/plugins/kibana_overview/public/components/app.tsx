/*
 * Copyright Elasticsearch B.V. and/or licensed to Elasticsearch B.V. under one
 * or more contributor license agreements. Licensed under the Elastic License
 * 2.0 and the Server Side Public License, v 1; you may not use this file except
 * in compliance with, at your election, the Elastic License 2.0 or the Server
 * Side Public License, v 1.
 */

import React, { useEffect, useState } from 'react';
import { Observable } from 'rxjs';
import { I18nProvider } from '@kbn/i18n-react';
import { HashRouter as Router } from 'react-router-dom';
import { Route, Routes } from '@kbn/shared-ux-router';
import { CoreStart } from '@kbn/core/public';
import { NavigationPublicPluginStart } from '@kbn/navigation-plugin/public';
import { FetchResult } from '@kbn/newsfeed-plugin/public';
import { FeatureCatalogueEntry, FeatureCatalogueSolution } from '@kbn/home-plugin/public';
import { Overview } from './overview';

interface KibanaOverviewAppDeps {
  basename: string;
  notifications: CoreStart['notifications'];
  http: CoreStart['http'];
  navigation: NavigationPublicPluginStart;
  newsfeed$?: Observable<FetchResult | null | void>;
  solutions: FeatureCatalogueSolution[];
  features: FeatureCatalogueEntry[];
}

export const KibanaOverviewApp = ({
  basename,
  newsfeed$,
  solutions,
  features,
}: KibanaOverviewAppDeps) => {
  const [newsFetchResult, setNewsFetchResult] = useState<FetchResult | null | void>(null);

  useEffect(() => {
    if (newsfeed$) {
      const subscription = newsfeed$.subscribe((res: FetchResult | void | null) => {
        setNewsFetchResult(res);
      });

      return () => subscription.unsubscribe();
    }
  }, [newsfeed$]);

  return (
    <Router basename={basename}>
      <I18nProvider>
        <Routes>
          <Route exact path="/">
            <Overview {...{ newsFetchResult, solutions, features }} />
          </Route>
        </Routes>
      </I18nProvider>
    </Router>
  );
};
