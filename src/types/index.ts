export interface CronExecution {
  id: string;
  type: 'cron';
  runId?: string;
  runNumber?: number;
  scheduledTime: string;
  actualTime: string;
  delayMs?: number;
  delaySeconds?: number;
  delayFormatted?: string;
  actor?: string;
  commitSha?: string;
  status: 'success' | 'failure' | string;
  dayOfMonth?: number;
  is17th?: boolean;
  delayCategory?: 'minimal' | 'moderate' | 'high' | 'severe';
}

export interface ManualExecution {
  id: string;
  type: 'manual';
  runId?: string;
  runNumber?: number;
  dispatchTime?: string;
  actualTime: string;
  delayMs?: number;
  delaySeconds?: number;
  delayFormatted?: string;
  actor?: string;
  commitSha?: string;
  note?: string;
  status: 'success' | 'failure' | string;
}

export interface OpenApiInfo {
  url: string;
  isValid: boolean;
  specVersion: string;
  title: string;
  description: string;
  endpoints: string[];
  paths?: Record<string, any>;
}

export interface RepositoryStatistics {
  totalRuns?: number;
  cronRuns?: number;
  manualRuns?: number;
  latestCronDelaySeconds?: number;
  averageCronDelaySeconds?: number;
  minCronDelaySeconds?: number;
  maxCronDelaySeconds?: number;
}

export interface MonitoredRepository {
  id: string;
  name: string;
  baseUrl: string;
  repoUrl: string;
  description: string;
  status: 'online' | 'offline';
  checkedAt: string;
  openApi: OpenApiInfo;
  schedule: {
    cron: string;
    description: string;
  };
  latest17thRun?: CronExecution | null;
  latestManualTrigger?: ManualExecution | null;
  statistics?: RepositoryStatistics;
  cronExecutions: CronExecution[];
  manualExecutions: ManualExecution[];
}

export interface ObservatorySnapshot {
  version: string;
  generatedAt: string;
  checkSchedule: {
    cron: string;
    description: string;
    reason: string;
  };
  monitoredSchedule: {
    cron: string;
    description: string;
  };
  summary: {
    totalMonitored: number;
    onlineCount: number;
    openApiCompliantCount: number;
    averageDelaySecondsAcrossAll: number;
  };
  repositories: MonitoredRepository[];
}
