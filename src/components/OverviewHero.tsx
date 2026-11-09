import React from 'react';
import { Calendar, ShieldCheck, Clock, Server, ArrowRight } from 'lucide-react';
import { ObservatorySnapshot } from '../types';

interface OverviewHeroProps {
  data: ObservatorySnapshot;
}

export const OverviewHero: React.FC<OverviewHeroProps> = ({ data }) => {
  const { summary, checkSchedule, monitoredSchedule, repositories, generatedAt } = data;

  const totalRuns = repositories.reduce((acc, r) => acc + (r.cronExecutions?.length || 0), 0);
  const compliantCount = repositories.filter(r => r.openApi?.isValid).length;

  return (
    <div className="py-6 sm:py-8 space-y-6">
      {/* Banner / Explanation Box */}
      <div className="relative overflow-hidden rounded-2xl bg-gradient-to-br from-slate-900 via-slate-800 to-emerald-950 text-white p-6 sm:p-8 shadow-xl border border-slate-700/50">
        <div className="absolute top-0 right-0 -mt-12 -mr-12 w-64 h-64 rounded-full bg-emerald-500/10 blur-3xl pointer-events-none"></div>

        <div className="max-w-3xl space-y-4 relative z-10">
          <div className="inline-flex items-center space-x-2 px-3 py-1 rounded-full bg-emerald-500/20 text-emerald-300 border border-emerald-500/30 text-xs font-semibold uppercase tracking-wider">
            <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse"></span>
            <span>Monthly Verification Lifecycle</span>
          </div>

          <h1 className="text-2xl sm:text-4xl font-extrabold tracking-tight text-white">
            Automated Cron Verification on the 19th
          </h1>

          <p className="text-sm sm:text-base text-slate-300 leading-relaxed">
            Target heartbeat repositories run their GitHub Actions cron schedule on the{' '}
            <span className="font-semibold text-emerald-400">17th of each month</span> at 03:14 UTC.
            Because GitHub Actions runner queues can experience jitter and delayed dispatch, this healthcheck repository
            automatically runs on the{' '}
            <span className="font-semibold text-emerald-400">19th of each month</span> via GitHub Actions to inspect their
            documented <span className="font-semibold text-teal-300">OpenAPI 3.1</span> interfaces and compile latency metrics.
          </p>

          <div className="pt-2 flex flex-wrap items-center gap-3 text-xs sm:text-sm text-slate-300">
            <div className="flex items-center space-x-2 bg-slate-800/80 px-3 py-1.5 rounded-lg border border-slate-700" title={monitoredSchedule.description}>
              <Calendar className="w-4 h-4 text-emerald-400" />
              <span>Target: <strong>{monitoredSchedule.cron}</strong> (17th / 03:14 UTC)</span>
            </div>
            <ArrowRight className="w-4 h-4 text-slate-500" />
            <div className="flex items-center space-x-2 bg-slate-800/80 px-3 py-1.5 rounded-lg border border-slate-700" title={checkSchedule.reason}>
              <Clock className="w-4 h-4 text-teal-400" />
              <span>Healthcheck: <strong>{checkSchedule.cron}</strong> (19th / 04:00 UTC)</span>
            </div>
          </div>
        </div>
      </div>

      {/* KPI Cards Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Monitored Repos */}
        <div className="bg-white dark:bg-slate-900 p-5 rounded-xl border border-slate-200 dark:border-slate-800 shadow-sm transition-all hover:border-emerald-500/40">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wider">
              Heartbeat Targets
            </span>
            <Server className="w-5 h-5 text-emerald-500" />
          </div>
          <div className="mt-2 flex items-baseline space-x-2">
            <span className="text-2xl font-bold text-slate-900 dark:text-white">
              {summary.onlineCount}/{summary.totalMonitored}
            </span>
            <span className="text-xs text-emerald-600 dark:text-emerald-400 font-medium">Online</span>
          </div>
          <p className="mt-1 text-xs text-slate-500 dark:text-slate-400">
            flynn0 & baotrivn heartbeat repos
          </p>
        </div>

        {/* OpenAPI 3.1 Compliance */}
        <div className="bg-white dark:bg-slate-900 p-5 rounded-xl border border-slate-200 dark:border-slate-800 shadow-sm transition-all hover:border-emerald-500/40">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wider">
              OpenAPI 3.1
            </span>
            <ShieldCheck className="w-5 h-5 text-teal-500" />
          </div>
          <div className="mt-2 flex items-baseline space-x-2">
            <span className="text-2xl font-bold text-slate-900 dark:text-white">
              {compliantCount}/{repositories.length}
            </span>
            <span className="text-xs text-teal-600 dark:text-teal-400 font-medium">100% Compliant</span>
          </div>
          <p className="mt-1 text-xs text-slate-500 dark:text-slate-400">
            Strict OpenAPI 3.1 schema validation
          </p>
        </div>

        {/* Total 17th Runs Logged */}
        <div className="bg-white dark:bg-slate-900 p-5 rounded-xl border border-slate-200 dark:border-slate-800 shadow-sm transition-all hover:border-emerald-500/40">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wider">
              17th Cron Executions
            </span>
            <Clock className="w-5 h-5 text-indigo-500" />
          </div>
          <div className="mt-2 flex items-baseline space-x-2">
            <span className="text-2xl font-bold text-slate-900 dark:text-white">
              {totalRuns}
            </span>
            <span className="text-xs text-indigo-600 dark:text-indigo-400 font-medium">Logged</span>
          </div>
          <p className="mt-1 text-xs text-slate-500 dark:text-slate-400">
            10 months of monthly 17th records
          </p>
        </div>

        {/* Next Scheduled Check */}
        <div className="bg-white dark:bg-slate-900 p-5 rounded-xl border border-slate-200 dark:border-slate-800 shadow-sm transition-all hover:border-emerald-500/40">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wider">
              Automated Check
            </span>
            <Calendar className="w-5 h-5 text-amber-500" />
          </div>
          <div className="mt-2 flex items-baseline space-x-2">
            <span className="text-2xl font-bold text-slate-900 dark:text-white">
              19th
            </span>
            <span className="text-xs text-amber-600 dark:text-amber-400 font-medium">Monthly (04:00 UTC)</span>
          </div>
          <p className="mt-1 text-xs text-slate-500 dark:text-slate-400 truncate" title={`Snapshot: ${generatedAt}`}>
            Last verified: {new Date(generatedAt).toLocaleDateString()}
          </p>
        </div>
      </div>
    </div>
  );
};
