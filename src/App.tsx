import React, { useState } from 'react';
import initialSnapshot from './data/heartbeatSnapshot.json';
import { ObservatorySnapshot } from './types';
import { Header } from './components/Header';
import { OverviewHero } from './components/OverviewHero';
import { RepositoryCard } from './components/RepositoryCard';
import { CronHistoryComparison } from './components/CronHistoryComparison';
import { OpenApiExplorer } from './components/OpenApiExplorer';
import { Footer } from './components/Footer';

export const App: React.FC = () => {
  const [data, setData] = useState<ObservatorySnapshot>(initialSnapshot as unknown as ObservatorySnapshot);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [refreshMessage, setRefreshMessage] = useState<string | null>(null);

  const handleRefresh = async () => {
    setIsRefreshing(true);
    setRefreshMessage(null);
    try {
      // Refresh live from both monitored heartbeat repositories
      const updatedRepos = await Promise.all(
        data.repositories.map(async repo => {
          try {
            const [summaryRes, historyRes, openapiRes] = await Promise.all([
              fetch(`${repo.baseUrl}/api/summary.json`),
              fetch(`${repo.baseUrl}/api/history.json`),
              fetch(`${repo.baseUrl}/openapi.json`),
            ]);

            const summary = summaryRes.ok ? await summaryRes.json() : null;
            const history = historyRes.ok ? await historyRes.json() : null;
            const openapi = openapiRes.ok ? await openapiRes.json() : null;

            const cronHistory = history?.cronHistory || repo.cronExecutions;
            const latest17th = cronHistory[cronHistory.length - 1] || summary?.latestCronDelay || repo.latest17thRun;

            return {
              ...repo,
              status: (summary || history || openapi) ? ('online' as const) : repo.status,
              checkedAt: new Date().toISOString(),
              latest17thRun: latest17th,
              latestManualTrigger: summary?.latestManualTrigger || repo.latestManualTrigger,
              statistics: summary?.statistics || history?.statistics || repo.statistics,
              openApi: {
                ...repo.openApi,
                isValid: Boolean(openapi && openapi.openapi?.startsWith('3.1')),
                specVersion: openapi?.openapi || repo.openApi.specVersion,
              },
            };
          } catch (err) {
            console.warn(`Failed to refresh ${repo.name} live:`, err);
            return repo;
          }
        })
      );

      setData(prev => ({
        ...prev,
        generatedAt: new Date().toISOString(),
        repositories: updatedRepos,
      }));
      setRefreshMessage('Successfully refreshed live data from heartbeat endpoints!');
      setTimeout(() => setRefreshMessage(null), 4000);
    } catch (err: any) {
      setRefreshMessage('Could not connect to live endpoints. Displaying cached verified snapshot.');
      setTimeout(() => setRefreshMessage(null), 4000);
    } finally {
      setIsRefreshing(false);
    }
  };

  return (
    <div className="min-h-screen flex flex-col bg-slate-50 dark:bg-slate-950 text-slate-900 dark:text-slate-100 transition-colors duration-200">
      <Header
        onRefresh={handleRefresh}
        isRefreshing={isRefreshing}
        lastUpdated={data.generatedAt}
      />

      {refreshMessage && (
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 mt-4 w-full">
          <div className="p-3 text-xs rounded-xl bg-emerald-500/10 border border-emerald-500/30 text-emerald-700 dark:text-emerald-300 flex items-center justify-between">
            <span>{refreshMessage}</span>
            <button
              onClick={() => setRefreshMessage(null)}
              className="font-bold ml-2 hover:opacity-75"
            >
              ×
            </button>
          </div>
        </div>
      )}

      <main className="flex-1 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 w-full space-y-10">
        <OverviewHero data={data} />

        {/* Monitored Repositories Section */}
        <section className="space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-xl font-bold tracking-tight text-slate-900 dark:text-white">
                Monitored Heartbeat Repositories
              </h2>
              <p className="text-xs text-slate-500 dark:text-slate-400">
                Adhering to documented OpenAPI 3.1 specifications and monthly 17th cron schedules
              </p>
            </div>
            <span className="text-xs font-semibold px-2.5 py-1 rounded-full bg-slate-200 dark:bg-slate-800 text-slate-700 dark:text-slate-300">
              {data.repositories.length} Targets Active
            </span>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {data.repositories.map(repo => (
              <RepositoryCard key={repo.id} repo={repo} />
            ))}
          </div>
        </section>

        {/* 17th Monthly Cron History & Latency Comparison */}
        <section>
          <CronHistoryComparison repositories={data.repositories} />
        </section>

        {/* Interactive OpenAPI 3.1 Explorer */}
        <section>
          <OpenApiExplorer repositories={data.repositories} />
        </section>
      </main>

      <Footer generatedAt={data.generatedAt} />
    </div>
  );
};
export default App;
