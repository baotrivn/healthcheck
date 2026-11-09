import React, { useState } from 'react';
import { FileCode, Send, Copy, Check } from 'lucide-react';
import { MonitoredRepository } from '../types';

interface OpenApiExplorerProps {
  repositories: MonitoredRepository[];
}

interface EndpointDef {
  path: string;
  method: 'GET';
  summary: string;
  description: string;
}

const ENDPOINTS: EndpointDef[] = [
  {
    path: '/api/summary.json',
    method: 'GET',
    summary: 'Status summary & metrics overview',
    description: 'Consolidated overview of latest cron delay, manual trigger, and next scheduled run.',
  },
  {
    path: '/api/latest-delay.json',
    method: 'GET',
    summary: 'Latest 17th cron schedule delay',
    description: 'The most recent monthly cron execution (scheduled on 17th at 03:14 UTC) with latency measurements.',
  },
  {
    path: '/api/latest-manual.json',
    method: 'GET',
    summary: 'Latest manual workflow dispatch',
    description: 'The most recent manual trigger with runner dispatch queue latency.',
  },
  {
    path: '/api/history.json',
    method: 'GET',
    summary: 'Complete history & measurements',
    description: 'All historical monthly 17th cron jitter runs and manual triggers.',
  },
];

export const OpenApiExplorer: React.FC<OpenApiExplorerProps> = ({ repositories }) => {
  const [selectedRepoId, setSelectedRepoId] = useState<string>(repositories[0]?.id || 'flynn0');
  const [selectedEndpoint, setSelectedEndpoint] = useState<string>(ENDPOINTS[0].path);
  const [loading, setLoading] = useState<boolean>(false);
  const [responseStatus, setResponseStatus] = useState<number | null>(null);
  const [responseTime, setResponseTime] = useState<number | null>(null);
  const [responseData, setResponseData] = useState<any>(null);
  const [copied, setCopied] = useState<boolean>(false);

  const currentRepo = repositories.find(r => r.id === selectedRepoId) || repositories[0];
  const targetUrl = currentRepo ? `${currentRepo.baseUrl}${selectedEndpoint}` : '';

  const handleTestEndpoint = async () => {
    if (!targetUrl) return;
    setLoading(true);
    setResponseStatus(null);
    setResponseData(null);

    const start = performance.now();
    try {
      const res = await fetch(targetUrl);
      const end = performance.now();
      setResponseTime(Math.round(end - start));
      setResponseStatus(res.status);
      const json = await res.json();
      setResponseData(json);
    } catch (err: any) {
      setResponseStatus(500);
      setResponseData({ error: 'Failed to fetch endpoint', details: err.message });
    } finally {
      setLoading(false);
    }
  };

  const copyToClipboard = () => {
    if (!responseData) return;
    navigator.clipboard.writeText(JSON.stringify(responseData, null, 2));
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-sm overflow-hidden">
      {/* Header */}
      <div className="p-6 border-b border-slate-100 dark:border-slate-800">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <div className="flex items-center space-x-2">
              <FileCode className="w-5 h-5 text-teal-500" />
              <h3 className="text-lg font-bold text-slate-900 dark:text-white">
                OpenAPI 3.1 Interface Explorer
              </h3>
              <span className="px-2 py-0.5 rounded text-[11px] font-mono font-semibold bg-teal-100 dark:bg-teal-950 text-teal-800 dark:text-teal-300 border border-teal-200 dark:border-teal-800">
                v3.1.0
              </span>
            </div>
            <p className="mt-1 text-xs text-slate-500 dark:text-slate-400">
              Interactive test console for heartbeat endpoints documented in their OpenAPI 3.1 specification
            </p>
          </div>

          <div className="flex items-center space-x-2">
            <span className="text-xs text-slate-500">Target:</span>
            <select
              value={selectedRepoId}
              onChange={e => setSelectedRepoId(e.target.value)}
              className="text-xs px-3 py-1.5 rounded-lg bg-slate-100 dark:bg-slate-800 text-slate-800 dark:text-slate-200 border border-slate-200 dark:border-slate-700"
            >
              {repositories.map(r => (
                <option key={r.id} value={r.id}>{r.name}</option>
              ))}
            </select>
          </div>
        </div>
      </div>

      <div className="p-6 space-y-6">
        {/* Endpoints Selector */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
          {ENDPOINTS.map(ep => {
            const isSelected = ep.path === selectedEndpoint;
            return (
              <button
                key={ep.path}
                onClick={() => setSelectedEndpoint(ep.path)}
                className={`text-left p-4 rounded-xl border transition-all ${
                  isSelected
                    ? 'border-teal-500 bg-teal-50/50 dark:bg-teal-950/20 ring-1 ring-teal-500'
                    : 'border-slate-200 dark:border-slate-800 hover:border-slate-300 dark:hover:border-slate-700 bg-slate-50/40 dark:bg-slate-800/20'
                }`}
              >
                <div className="flex items-center space-x-2 mb-1">
                  <span className="px-2 py-0.5 text-[10px] font-mono font-bold rounded bg-emerald-600 text-white">
                    {ep.method}
                  </span>
                  <span className="font-mono text-xs font-semibold text-slate-900 dark:text-white">
                    {ep.path}
                  </span>
                </div>
                <p className="text-xs font-medium text-slate-700 dark:text-slate-300">
                  {ep.summary}
                </p>
                <p className="text-[11px] text-slate-500 dark:text-slate-400 mt-1 line-clamp-1">
                  {ep.description}
                </p>
              </button>
            );
          })}
        </div>

        {/* Live URL & Action Bar */}
        <div className="flex flex-col sm:flex-row items-center gap-2 p-2 rounded-xl bg-slate-100 dark:bg-slate-800 border border-slate-200 dark:border-slate-700">
          <div className="flex items-center space-x-2 px-3 py-1.5 flex-1 w-full overflow-hidden font-mono text-xs text-slate-700 dark:text-slate-300">
            <span className="text-emerald-600 dark:text-emerald-400 font-bold">GET</span>
            <span className="truncate">{targetUrl}</span>
          </div>
          <button
            onClick={handleTestEndpoint}
            disabled={loading}
            className="w-full sm:w-auto flex items-center justify-center space-x-1.5 px-4 py-2 rounded-lg bg-teal-600 hover:bg-teal-700 text-white text-xs font-semibold shadow-sm transition disabled:opacity-60"
          >
            <Send className="w-3.5 h-3.5" />
            <span>{loading ? 'Executing...' : 'Execute Live Query'}</span>
          </button>
        </div>

        {/* Response Panel */}
        {responseStatus !== null && (
          <div className="rounded-xl border border-slate-200 dark:border-slate-800 overflow-hidden bg-slate-950 text-slate-200 font-mono text-xs">
            <div className="flex items-center justify-between px-4 py-2.5 bg-slate-900 border-b border-slate-800">
              <div className="flex items-center space-x-3">
                <span className={`px-2 py-0.5 rounded text-[11px] font-bold ${
                  responseStatus >= 200 && responseStatus < 300
                    ? 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/40'
                    : 'bg-rose-500/20 text-rose-400 border border-rose-500/40'
                }`}>
                  Status: {responseStatus} OK
                </span>
                {responseTime !== null && (
                  <span className="text-slate-400 text-[11px]">
                    Latency: {responseTime}ms
                  </span>
                )}
              </div>

              <button
                onClick={copyToClipboard}
                className="flex items-center space-x-1 text-xs text-slate-400 hover:text-white transition"
              >
                {copied ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
                <span>{copied ? 'Copied' : 'Copy'}</span>
              </button>
            </div>

            <pre className="p-4 overflow-x-auto max-h-80 text-emerald-300">
              {JSON.stringify(responseData, null, 2)}
            </pre>
          </div>
        )}
      </div>
    </div>
  );
};
