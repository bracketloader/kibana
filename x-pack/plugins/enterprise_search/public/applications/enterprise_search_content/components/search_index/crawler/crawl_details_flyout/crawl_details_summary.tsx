/*
 * Copyright Elasticsearch B.V. and/or licensed to Elasticsearch B.V. under one
 * or more contributor license agreements. Licensed under the Elastic License
 * 2.0; you may not use this file except in compliance with the Elastic License
 * 2.0.
 */

import React from 'react';

import moment from 'moment';

import {
  EuiFlexGroup,
  EuiFlexItem,
  EuiHorizontalRule,
  EuiIconTip,
  EuiLink,
  EuiPanel,
  EuiSpacer,
  EuiStat,
  EuiText,
} from '@elastic/eui';

import { i18n } from '@kbn/i18n';
import { FormattedMessage } from '@kbn/i18n-react';

import { docLinks } from '../../../../../shared/doc_links';

import { CrawlRequestStats } from '../../../../api/crawler/types';

export interface CrawlerDetailsSummaryProps {
  crawlDepth: number;
  crawlType: string;
  domainCount: number;
  stats: CrawlRequestStats | null;
}

export const CrawlDetailsSummary: React.FC<CrawlerDetailsSummaryProps> = ({
  crawlDepth,
  crawlType,
  domainCount,
  stats,
}) => {
  const duration = () => {
    if (stats?.status?.crawlDurationMSec) {
      const milliseconds = moment.duration(stats.status.crawlDurationMSec, 'milliseconds');
      const days = milliseconds.days();
      const hours = milliseconds.hours();
      const minutes = milliseconds.minutes();
      const seconds = milliseconds.seconds();
      return `${days ? days + 'd ' : ''}${hours}h ${minutes}m ${seconds}s`;
    } else {
      return '--';
    }
  };

  const getStatusCount = (code: string, codes: { [code: string]: number }) => {
    return Object.entries(codes).reduce((count, [k, v]) => {
      if (k[0] !== code) return count;
      return v + count;
    }, 0);
  };

  const statusCounts = {
    clientErrorCount: stats?.status?.statusCodes
      ? getStatusCount('4', stats.status.statusCodes)
      : 0,
    serverErrorCount: stats?.status?.statusCodes
      ? getStatusCount('5', stats.status.statusCodes)
      : 0,
  };

  const shouldHideStats = !stats;

  return (
    <EuiPanel paddingSize="l" color="primary">
      <EuiFlexGroup>
        <EuiFlexItem grow={2}>
          <EuiStat
            data-test-subjet="crawlType"
            titleSize="s"
            title={i18n.translate(
              'xpack.enterpriseSearch.crawler.components.crawlDetailsSummary.crawlCountOnDomains',
              {
                defaultMessage:
                  '{crawlType} crawl on {domainCount, plural, one {# domain} other {# domains}}',
                values: {
                  crawlType: crawlType[0].toUpperCase() + crawlType.substring(1),
                  domainCount,
                },
              }
            )}
            description={i18n.translate(
              'xpack.enterpriseSearch.crawler.components.crawlDetailsSummary.crawlTypeLabel',
              {
                defaultMessage: 'Crawl type',
              }
            )}
          />
        </EuiFlexItem>
        <EuiFlexItem grow={1}>
          <EuiStat
            data-test-subj="crawlDepth"
            titleSize="s"
            title={crawlDepth}
            description={i18n.translate(
              'xpack.enterpriseSearch.crawler.components.crawlDetailsSummary.crawlDepthLabel',
              {
                defaultMessage: 'Max crawl depth',
              }
            )}
          />
        </EuiFlexItem>
        {!shouldHideStats && (
          <EuiFlexItem grow={false}>
            <EuiStat
              data-test-subj="crawlDuration"
              titleSize="s"
              title={duration()}
              description={i18n.translate(
                'xpack.enterpriseSearch.crawler.crawlDetailsSummary.durationTooltipTitle',
                {
                  defaultMessage: 'Duration',
                }
              )}
            />
          </EuiFlexItem>
        )}
      </EuiFlexGroup>
      <EuiHorizontalRule margin="s" />
      {!shouldHideStats ? (
        <EuiFlexGroup justifyContent="spaceBetween">
          <EuiFlexItem grow={false}>
            <EuiStat
              data-test-subj="urlsAllowed"
              titleSize="s"
              title={stats?.status?.urlsAllowed ?? '--'}
              description={
                <EuiText size="s">
                  URLs{' '}
                  <EuiIconTip
                    type="iInCircle"
                    color="primary"
                    size="m"
                    title={i18n.translate(
                      'xpack.enterpriseSearch.crawler.crawlDetailsSummary.urlsTooltipTitle',
                      {
                        defaultMessage: 'URLs Seen',
                      }
                    )}
                    content={i18n.translate(
                      'xpack.enterpriseSearch.crawler.crawlDetailsSummary.urlsTooltip',
                      {
                        defaultMessage:
                          'URLs found by the crawler during the crawl, including those not followed due to the crawl configuration.',
                      }
                    )}
                  />
                </EuiText>
              }
            />
          </EuiFlexItem>
          <EuiFlexItem grow={false}>
            <EuiStat
              data-test-subj="pagesVisited"
              titleSize="s"
              title={stats?.status?.pagesVisited ? stats.status.pagesVisited : '--'}
              description={
                <EuiText size="s">
                  {i18n.translate(
                    'xpack.enterpriseSearch.crawler.crawlDetailsSummary.pagesVisitedTooltipTitle',
                    {
                      defaultMessage: 'Pages',
                    }
                  )}{' '}
                  <EuiIconTip
                    type="iInCircle"
                    color="primary"
                    size="m"
                    title={i18n.translate(
                      'xpack.enterpriseSearch.crawler.crawlDetailsSummary.pagesTooltipTitle',
                      {
                        defaultMessage: 'Pages visited',
                      }
                    )}
                    content={i18n.translate(
                      'xpack.enterpriseSearch.crawler.crawlDetailsSummary.pagesTooltip',
                      {
                        defaultMessage: 'URLs visited and extracted during the crawl.',
                      }
                    )}
                  />
                </EuiText>
              }
            />
          </EuiFlexItem>
          <EuiFlexItem grow={false}>
            <EuiStat
              data-test-subj="avgResponseTime"
              titleSize="s"
              title={
                stats?.status?.avgResponseTimeMSec
                  ? `${Math.round(stats.status.avgResponseTimeMSec)}ms`
                  : '--'
              }
              description={i18n.translate(
                'xpack.enterpriseSearch.crawler.crawlDetailsSummary.avgResponseTimeLabel',
                {
                  defaultMessage: 'Avg. response',
                }
              )}
            />
          </EuiFlexItem>
          <EuiFlexItem grow={false}>
            <EuiStat
              data-test-subj="clientErrors"
              titleSize="s"
              title={statusCounts.clientErrorCount}
              description={i18n.translate(
                'xpack.enterpriseSearch.crawler.crawlDetailsSummary.clientErrorsLabel',
                {
                  defaultMessage: '4xx Errors',
                }
              )}
            />
          </EuiFlexItem>
          <EuiFlexItem grow={false}>
            <EuiStat
              data-test-subj="serverErrors"
              titleSize="s"
              title={statusCounts.serverErrorCount}
              description={i18n.translate(
                'xpack.enterpriseSearch.crawler.crawlDetailsSummary.serverErrorsLabel',
                {
                  defaultMessage: '5xx Errors',
                }
              )}
            />
          </EuiFlexItem>
        </EuiFlexGroup>
      ) : (
        <EuiText size="xs" textAlign="center" data-test-subj="logsDisabledMessage">
          <EuiSpacer size="m" />
          <p>
            <FormattedMessage
              id="xpack.enterpriseSearch.crawler.crawlDetailsSummary.logsDisabledMessage"
              defaultMessage="{configLink} in your enterprise-search.yml or user settings for more detailed crawl statistics."
              values={{
                configLink: (
                  <EuiLink href={docLinks.enterpriseSearchConfig} external>
                    {i18n.translate(
                      'xpack.enterpriseSearch.crawler.crawlDetailsSummary.configLink',
                      { defaultMessage: 'Enable web crawler logs' }
                    )}
                  </EuiLink>
                ),
              }}
            />
          </p>
        </EuiText>
      )}
    </EuiPanel>
  );
};
