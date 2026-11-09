import React from 'react';
import { ExternalLink, CheckCircle2, Clock, PlayCircle, GitCommit, User, AlertTriangle, ShieldCheck } from 'lucide-react';
import { MonitoredRepository } from '../types';

interface RepositoryCardProps {
  repo: MonitoredRepository;
}

export const RepositoryCard: React.FC<RepositoryCardProps> = ({ repo }) => {
  const latestCron = repo.latest17thRun;
  const latestManual = repo.latestManualTrigger;

  const isSevereDelay = (latestCron?.delaySeconds || 0) > 86400;

  return (
    <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-sm overflow-hidden transition hover:shadow-md hover:border-slate-300 dark:hover:border-slate-700">
      {/* Card Header */}
      <div className="p-6 border-b border-slate-100 dark:border-slate-800/80 bg-slate-50/50 dark:bg-slate-900/50">
        <div className="flex items-start justify-between">
          <div>
            <div className="flex items-center space-x-2">
              <h3 className="text-lg font-bold text-slate-900 dark:text-white tracking-tight">
                {repo.name}
              </h3>
              <span className="inline-flex items-center space-x-1 px-2.5 py-0.5 rounded-full text-xs font-semibold bg-emerald-100 dark:bg-emerald-950/80 text-emerald-800 dark:text-emerald-300 border border-emerald-200 dark:border-emerald-800">
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-500"></span>
                <span>Online</span>
              </span>
            </div>
            <p className="mt-1 text-xs text-slate-500 dark:text-slate-400">
              {repo.description}
            </p>
          </div>

          <div className="flex items-center space-x-2">
            <span className="inline-flex items-center space-x-1 px-2.5 py-1 rounded-lg text-xs font-medium bg-slate-100 dark:bg-slate-800 text-teal-700 dark:text-teal-400 border border-slate-200 dark:border-slate-700">
              <ShieldCheck className="w-3.5 h-3.5 text-teal-500" />
              <span>OpenAPI {repo.openApi.specVersion}</span>
            </span>
          </div>
        </div>

        {/* URLs & Navigation */}
        <div className="mt-4 flex flex-wrap items-center gap-2 pt-2">
          <a
            href={repo.baseUrl}
            target="_blank"
            rel="noreferrer"
            className="inline-flex items-center space-x-1 text-xs text-emerald-600 dark:text-emerald-400 hover:underline"
          >
            <span>Live Website</span>
            <ExternalLink className="w-3 h-3" />
          </a>
          <span className="text-slate-300 dark:text-slate-700">•</span>
          <a
            href={repo.repoUrl}
            target="_blank"
            rel="noreferrer"
            className="inline-flex items-center space-x-1 text-xs text-slate-600 dark:text-slate-400 hover:underline"
          >
            <span>GitHub Repository</span>
            <ExternalLink className="w-3 h-3" />
          </a>
          <span className="text-slate-300 dark:text-slate-700">•</span>
          <a
            href={repo.openApi.url}
            target="_blank"
            rel="noreferrer"
            className="inline-flex items-center space-x-1 text-xs text-teal-600 dark:text-teal-400 hover:underline"
          >
            <span>openapi.json</span>
            <ExternalLink className="w-3 h-3" />
          </a>
        </div>
      </div>

      <div className="p-6 space-y-6">
        {/* Latest 17th Cron Execution */}
        <div>
          <div className="flex items-center justify-between mb-3">
            <div className="flex items-center space-x-2">
              <Clock className="w-4 h-4 text-emerald-500" />
              <h4 className="text-xs font-bold uppercase tracking-wider text-slate-700 dark:text-slate-300">
                Latest 17th Cron Execution
              </h4>
            </div>
            <span className="text-xs text-slate-500 dark:text-slate-400">
              Cron: {repo.schedule.cron}
            </span>
          </div>

          {latestCron ? (
            <div className="p-4 rounded-xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-800 space-y-3">
              <div className="flex items-center justify-between">
                <div>
                  <span className="text-xs text-slate-500 dark:text-slate-400">Scheduled Time (17th)</span>
                  <div className="text-sm font-semibold text-slate-800 dark:text-slate-200">
                    {new Date(latestCron.scheduledTime).toUTCString()}
                  </div>
                </div>

                <div className="text-right">
                  <span className="text-xs text-slate-500 dark:text-slate-400">Calculated Delay</span>
                  <div>
                    <span className={`inline-flex items-center space-x-1 px-2.5 py-0.5 rounded-full text-xs font-bold ${
                      isSevereDelay
                        ? 'bg-amber-100 dark:bg-amber-950/80 text-amber-800 dark:text-amber-300 border border-amber-200 dark:border-amber-800'
                        : 'bg-emerald-100 dark:bg-emerald-950/80 text-emerald-800 dark:text-emerald-300 border border-emerald-200 dark:border-emerald-800'
                    }`}>
                      {isSevereDelay && <AlertTriangle className="w-3 h-3 mr-0.5 text-amber-600" />}
                      <span>{latestCron.delayFormatted || `+${latestCron.delaySeconds}s`}</span>
                    </span>
                  </div>
                </div>
              </div>

              <div className="grid grid-cols-2 sm:grid-cols-3 gap-2 pt-2 border-t border-slate-200 dark:border-slate-700/60 text-xs">
                <div>
                  <span className="text-slate-500 dark:text-slate-400">Actual Execution:</span>
                  <p className="font-mono text-slate-700 dark:text-slate-300 truncate">
                    {new Date(latestCron.actualTime).toLocaleTimeString()} UTC
                  </p>
                </div>
                <div>
                  <span className="text-slate-500 dark:text-slate-400">Run ID:</span>
                  <p className="font-mono text-slate-700 dark:text-slate-300 truncate">
                    #{latestCron.runId || latestCron.id}
                  </p>
                </div>
                <div>
                  <span className="text-slate-500 dark:text-slate-400">Status:</span>
                  <p className="flex items-center space-x-1 text-emerald-600 dark:text-emerald-400 font-semibold">
                    <CheckCircle2 className="w-3.5 h-3.5" />
                    <span className="capitalize">{latestCron.status}</span>
                  </p>
                </div>
              </div>
            </div>
          ) : (
            <p className="text-sm text-slate-500">No cron execution records found.</p>
          )}
        </div>

        {/* Latest Manual Trigger */}
        {latestManual && (
          <div>
            <div className="flex items-center space-x-2 mb-2">
              <PlayCircle className="w-4 h-4 text-teal-500" />
              <h4 className="text-xs font-bold uppercase tracking-wider text-slate-700 dark:text-slate-300">
                Latest Manual Trigger (Workflow Dispatch)
              </h4>
            </div>

            <div className="p-3.5 rounded-xl bg-slate-50 dark:bg-slate-800/40 border border-slate-200 dark:border-slate-800 text-xs space-y-2">
              <div className="flex items-center justify-between">
                <span className="text-slate-600 dark:text-slate-300 font-medium">
                  Dispatch Latency:
                </span>
                <span className="font-mono font-bold text-teal-600 dark:text-teal-400">
                  {latestManual.delayFormatted || `+${latestManual.delaySeconds}s`} ({latestManual.delayMs}ms)
                </span>
              </div>

              <div className="flex items-center justify-between text-slate-500 dark:text-slate-400">
                <div className="flex items-center space-x-1">
                  <User className="w-3 h-3 text-slate-400" />
                  <span>Actor: {latestManual.actor}</span>
                </div>
                <div className="flex items-center space-x-1 font-mono">
                  <GitCommit className="w-3 h-3 text-slate-400" />
                  <span className="truncate max-w-[120px]">{latestManual.commitSha?.slice(0, 7)}</span>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Aggregate Stats */}
        <div className="pt-2 border-t border-slate-100 dark:border-slate-800">
          <div className="grid grid-cols-3 gap-2 text-center">
            <div className="p-2 rounded-lg bg-slate-50 dark:bg-slate-800/30">
              <span className="block text-[10px] text-slate-500 uppercase tracking-wider font-semibold">Total Runs</span>
              <span className="text-sm font-bold text-slate-800 dark:text-slate-200">
                {repo.statistics?.totalRuns ?? repo.cronExecutions.length}
              </span>
            </div>
            <div className="p-2 rounded-lg bg-slate-50 dark:bg-slate-800/30">
              <span className="block text-[10px] text-slate-500 uppercase tracking-wider font-semibold">17th Crons</span>
              <span className="text-sm font-bold text-slate-800 dark:text-slate-200">
                {repo.cronExecutions.filter(c => c.is17th).length}
              </span>
            </div>
            <div className="p-2 rounded-lg bg-slate-50 dark:bg-slate-800/30">
              <span className="block text-[10px] text-slate-500 uppercase tracking-wider font-semibold">Min Delay</span>
              <span className="text-sm font-bold text-emerald-600 dark:text-emerald-400">
                {repo.statistics?.minCronDelaySeconds ? `+${repo.statistics.minCronDelaySeconds}s` : 'N/A'}
              </span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
