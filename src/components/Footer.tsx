import React from 'react';
import { Activity, GitBranch, Shield, Heart } from 'lucide-react';
import { APP_VERSION } from '../config/version';

interface FooterProps {
  generatedAt: string;
}

export const Footer: React.FC<FooterProps> = ({ generatedAt }) => {
  return (
    <footer className="mt-16 border-t border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900/60 transition-colors">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 sm:py-12">
        <div className="flex flex-col md:flex-row items-center justify-between gap-6">
          <div className="flex items-center space-x-3">
            <div className="w-8 h-8 rounded-lg bg-emerald-600 flex items-center justify-center text-white">
              <Activity className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center space-x-2">
                <span className="font-bold text-slate-900 dark:text-white">Healthcheck Observatory</span>
                <span className="text-xs px-2 py-0.5 rounded-full bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 font-mono">
                  v{APP_VERSION}
                </span>
              </div>
              <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
                Automated monthly verification on the 19th for GitHub Actions 17th cron jobs
              </p>
            </div>
          </div>

          <div className="flex flex-wrap items-center gap-6 text-xs text-slate-500 dark:text-slate-400">
            <a
              href="https://github.com/baotrivn/healthcheck"
              target="_blank"
              rel="noreferrer"
              className="hover:text-emerald-500 transition flex items-center space-x-1"
            >
              <GitBranch className="w-3.5 h-3.5" />
              <span>GitHub Repository</span>
            </a>
            <a
              href="./openapi.json"
              target="_blank"
              rel="noreferrer"
              className="hover:text-teal-500 transition flex items-center space-x-1"
            >
              <Shield className="w-3.5 h-3.5" />
              <span>OpenAPI 3.1 Spec</span>
            </a>
            <a
              href="https://flynn0.github.io/heartbeat/"
              target="_blank"
              rel="noreferrer"
              className="hover:text-rose-500 transition flex items-center space-x-1"
            >
              <Heart className="w-3.5 h-3.5" />
              <span>Flynn0 Heartbeat</span>
            </a>
            <a
              href="https://baotrivn.github.io/heartbeat/"
              target="_blank"
              rel="noreferrer"
              className="hover:text-rose-500 transition flex items-center space-x-1"
            >
              <Heart className="w-3.5 h-3.5" />
              <span>BaoTriVN Heartbeat</span>
            </a>
          </div>
        </div>

        <div className="mt-8 pt-6 border-t border-slate-100 dark:border-slate-800/80 flex flex-col sm:flex-row items-center justify-between text-xs text-slate-400 gap-2">
          <p>
            Release v{APP_VERSION} • Open Source under MIT License
          </p>
          <p>
            Last verified snapshot: {new Date(generatedAt).toUTCString()}
          </p>
        </div>
      </div>
    </footer>
  );
};
