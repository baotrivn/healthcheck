import React, { useState } from 'react';
import { Calendar, CheckCircle2, Search, BarChart3, List } from 'lucide-react';
import { MonitoredRepository } from '../types';

interface CronHistoryComparisonProps {
  repositories: MonitoredRepository[];
}

export const CronHistoryComparison: React.FC<CronHistoryComparisonProps> = ({ repositories }) => {
  const [selectedRepoId, setSelectedRepoId] = useState<string>('all');
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [activeTab, setActiveTab] = useState<'timeline' | 'table'>('timeline');

  // Extract all cron executions tagged by repo
  const allExecutions = repositories.flatMap(repo =>
    repo.cronExecutions.map(item => ({
      ...item,
      repoId: repo.id,
      repoName: repo.name,
    }))
  );

  // Filter based on repo and query
  const filtered = allExecutions.filter(item => {
    const matchesRepo = selectedRepoId === 'all' || item.repoId === selectedRepoId;
    const matchesQuery =
      item.id.toLowerCase().includes(searchQuery.toLowerCase()) ||
      item.scheduledTime.toLowerCase().includes(searchQuery.toLowerCase()) ||
      (item.delayFormatted || '').toLowerCase().includes(searchQuery.toLowerCase());
    return matchesRepo && matchesQuery;
  });

  // Unique months list
  const uniqueDates = Array.from(
    new Set(allExecutions.map(e => e.scheduledTime.slice(0, 7)))
  ).sort().reverse();

  return (
    <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-sm overflow-hidden">
      {/* Header & Controls */}
      <div className="p-6 border-b border-slate-100 dark:border-slate-800">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <div className="flex items-center space-x-2">
              <Calendar className="w-5 h-5 text-emerald-500" />
              <h3 className="text-lg font-bold text-slate-900 dark:text-white">
                Monthly 17th Cron Execution History
              </h3>
            </div>
            <p className="mt-1 text-xs text-slate-500 dark:text-slate-400">
              Tracking scheduled vs actual GitHub Actions runner queue latency for the 17th of each month
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-2">
            {/* View switcher */}
            <div className="inline-flex rounded-lg p-0.5 bg-slate-100 dark:bg-slate-800 border border-slate-200 dark:border-slate-700">
              <button
                onClick={() => setActiveTab('timeline')}
                className={`inline-flex items-center space-x-1 px-3 py-1.5 text-xs font-medium rounded-md transition ${
                  activeTab === 'timeline'
                    ? 'bg-white dark:bg-slate-900 text-slate-900 dark:text-white shadow-sm'
                    : 'text-slate-500 hover:text-slate-900 dark:hover:text-white'
                }`}
              >
                <BarChart3 className="w-3.5 h-3.5" />
                <span>Visual Timeline</span>
              </button>
              <button
                onClick={() => setActiveTab('table')}
                className={`inline-flex items-center space-x-1 px-3 py-1.5 text-xs font-medium rounded-md transition ${
                  activeTab === 'table'
                    ? 'bg-white dark:bg-slate-900 text-slate-900 dark:text-white shadow-sm'
                    : 'text-slate-500 hover:text-slate-900 dark:hover:text-white'
                }`}
              >
                <List className="w-3.5 h-3.5" />
                <span>Detailed Log</span>
              </button>
            </div>

            {/* Search Input */}
            <div className="relative">
              <Search className="w-3.5 h-3.5 text-slate-400 absolute left-2.5 top-1/2 -translate-y-1/2" />
              <input
                type="text"
                placeholder="Search runs..."
                value={searchQuery}
                onChange={e => setSearchQuery(e.target.value)}
                className="text-xs pl-8 pr-3 py-1.5 rounded-lg bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 border border-slate-200 dark:border-slate-700 focus:outline-none focus:ring-2 focus:ring-emerald-500 w-32 sm:w-40"
              />
            </div>

            {/* Repository filter */}
            <select
              value={selectedRepoId}
              onChange={e => setSelectedRepoId(e.target.value)}
              className="text-xs px-3 py-1.5 rounded-lg bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 border border-slate-200 dark:border-slate-700 focus:outline-none focus:ring-2 focus:ring-emerald-500"
            >
              <option value="all">All Repositories</option>
              {repositories.map(r => (
                <option key={r.id} value={r.id}>{r.name}</option>
              ))}
            </select>
          </div>
        </div>
      </div>

      {/* Tab 1: Visual Timeline of Monthly 17th Runs */}
      {activeTab === 'timeline' && (
        <div className="p-6 space-y-6">
          <div className="space-y-4">
            {uniqueDates.map(month => {
              const monthRuns = filtered.filter(e => e.scheduledTime.startsWith(month));
              if (monthRuns.length === 0) return null;

              const monthLabel = new Date(`${month}-17T03:14:00Z`).toLocaleDateString(undefined, {
                month: 'long',
                year: 'numeric',
                timeZone: 'UTC',
              });

              return (
                <div
                  key={month}
                  className="p-4 rounded-xl bg-slate-50 dark:bg-slate-800/40 border border-slate-200 dark:border-slate-800/80 transition hover:border-slate-300 dark:hover:border-slate-700"
                >
                  <div className="flex items-center justify-between mb-3">
                    <div className="flex items-center space-x-2">
                      <span className="w-2.5 h-2.5 rounded-full bg-emerald-500"></span>
                      <h4 className="text-sm font-bold text-slate-900 dark:text-white">
                        {monthLabel} (17th at 03:14 UTC)
                      </h4>
                    </div>
                    <span className="text-xs text-slate-500 dark:text-slate-400 font-mono">
                      {month}-17
                    </span>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                    {monthRuns.map(run => {
                      const isHighDelay = (run.delaySeconds || 0) > 600;
                      const isSevere = (run.delaySeconds || 0) > 86400;

                      return (
                        <div
                          key={`${run.repoId}-${run.id}`}
                          className="p-3 rounded-lg bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 text-xs space-y-2 shadow-2xs"
                        >
                          <div className="flex items-center justify-between">
                            <span className="font-semibold text-slate-700 dark:text-slate-300">
                              {run.repoName}
                            </span>
                            <span className={`px-2 py-0.5 rounded-full font-mono font-bold text-[11px] ${
                              isSevere
                                ? 'bg-amber-100 dark:bg-amber-950/80 text-amber-800 dark:text-amber-300 border border-amber-300 dark:border-amber-800'
                                : isHighDelay
                                ? 'bg-blue-100 dark:bg-blue-950/80 text-blue-800 dark:text-blue-300 border border-blue-200 dark:border-blue-800'
                                : 'bg-emerald-100 dark:bg-emerald-950/80 text-emerald-800 dark:text-emerald-300 border border-emerald-200 dark:border-emerald-800'
                            }`}>
                              {run.delayFormatted || `+${run.delaySeconds}s`}
                            </span>
                          </div>

                          <div className="flex items-center justify-between text-slate-500 dark:text-slate-400">
                            <span>Actual Executed:</span>
                            <span className="font-mono">{new Date(run.actualTime).toUTCString().slice(17, 25)} UTC</span>
                          </div>

                          <div className="flex items-center justify-between text-slate-500 dark:text-slate-400 pt-1 border-t border-slate-100 dark:border-slate-800">
                            <span>Runner Delay:</span>
                            <span className="font-mono text-slate-700 dark:text-slate-300">
                              {run.delaySeconds?.toLocaleString()}s ({(run.delayMs ? (run.delayMs / 1000).toFixed(1) : (run.delaySeconds || 0))}s)
                            </span>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* Tab 2: Detailed Table View */}
      {activeTab === 'table' && (
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs border-collapse">
            <thead>
              <tr className="bg-slate-50 dark:bg-slate-800/80 border-b border-slate-200 dark:border-slate-800 text-slate-600 dark:text-slate-400 font-semibold uppercase tracking-wider">
                <th className="py-3 px-4">Repository</th>
                <th className="py-3 px-4">Scheduled (17th)</th>
                <th className="py-3 px-4">Actual Execution</th>
                <th className="py-3 px-4">Queue Latency</th>
                <th className="py-3 px-4">Delay (Seconds)</th>
                <th className="py-3 px-4">Actor</th>
                <th className="py-3 px-4">Status</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 dark:divide-slate-800/60">
              {filtered.map((item, idx) => (
                <tr
                  key={`${item.repoId}-${item.id}-${idx}`}
                  className="hover:bg-slate-50/80 dark:hover:bg-slate-800/40 transition-colors"
                >
                  <td className="py-3 px-4 font-medium text-slate-900 dark:text-white">
                    {item.repoName}
                  </td>
                  <td className="py-3 px-4 font-mono text-slate-600 dark:text-slate-300">
                    {new Date(item.scheduledTime).toISOString().replace('.000Z', 'Z')}
                  </td>
                  <td className="py-3 px-4 font-mono text-slate-600 dark:text-slate-300">
                    {new Date(item.actualTime).toISOString().replace('.000Z', 'Z')}
                  </td>
                  <td className="py-3 px-4 font-mono font-bold text-emerald-600 dark:text-emerald-400">
                    {item.delayFormatted || `+${item.delaySeconds}s`}
                  </td>
                  <td className="py-3 px-4 font-mono text-slate-600 dark:text-slate-300">
                    {item.delaySeconds?.toLocaleString()}s
                  </td>
                  <td className="py-3 px-4 text-slate-600 dark:text-slate-300">
                    {item.actor || 'system'}
                  </td>
                  <td className="py-3 px-4">
                    <span className="inline-flex items-center space-x-1 text-emerald-600 dark:text-emerald-400 font-semibold">
                      <CheckCircle2 className="w-3.5 h-3.5" />
                      <span className="capitalize">{item.status}</span>
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
};
