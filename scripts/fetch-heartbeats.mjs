import { writeFileSync, mkdirSync } from 'node:fs';
import { resolve, dirname } from 'node:path';
import { fileURLToPath } from 'node:url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

const TARGET_REPOSITORIES = [
  {
    id: 'flynn0',
    name: 'flynn0 / heartbeat',
    baseUrl: 'https://flynn0.github.io/heartbeat',
    repoUrl: 'https://github.com/flynn0/heartbeat',
    description: 'Primary GitHub Actions Cron Jitter & Delay Observatory',
  },
  {
    id: 'baotrivn',
    name: 'baotrivn / heartbeat',
    baseUrl: 'https://baotrivn.github.io/heartbeat',
    repoUrl: 'https://github.com/baotrivn/heartbeat',
    description: 'Mirror GitHub Actions Cron Jitter & Delay Observatory',
  },
];

async function fetchJson(url, retries = 3, timeout = 10000) {
  for (let attempt = 1; attempt <= retries; attempt++) {
    const controller = new AbortController();
    const timer = setTimeout(() => controller.abort(), timeout);
    try {
      const response = await fetch(url, {
        signal: controller.signal,
        headers: {
          'Accept': 'application/json',
          'User-Agent': 'Healthcheck-Observatory/0.1.0 (+https://github.com/baotrivn/healthcheck)',
        },
      });
      clearTimeout(timer);
      if (!response.ok) {
        throw new Error(`HTTP ${response.status}: ${response.statusText}`);
      }
      return await response.json();
    } catch (err) {
      clearTimeout(timer);
      if (attempt === retries) {
        console.warn(`[WARN] Failed to fetch ${url} after ${retries} attempts: ${err.message}`);
        return null;
      }
      await new Promise(r => setTimeout(r, 1000 * attempt));
    }
  }
  return null;
}

function analyzeCronExecutions(cronHistory = []) {
  return cronHistory.map(item => {
    const scheduledDate = new Date(item.scheduledTime);
    const actualDate = new Date(item.actualTime);
    const dayOfMonth = scheduledDate.getUTCDate();
    const is17th = dayOfMonth === 17;
    const delaySeconds = item.delaySeconds ?? Math.round((actualDate.getTime() - scheduledDate.getTime()) / 1000);

    let delayCategory = 'minimal'; // < 5 mins
    if (delaySeconds > 86400) {
      delayCategory = 'severe'; // > 24 hours
    } else if (delaySeconds > 3600) {
      delayCategory = 'high'; // > 1 hour
    } else if (delaySeconds > 600) {
      delayCategory = 'moderate'; // > 10 mins
    }

    return {
      ...item,
      dayOfMonth,
      is17th,
      delaySeconds,
      delayCategory,
      scheduledDateUtc: scheduledDate.toISOString(),
      actualDateUtc: actualDate.toISOString(),
    };
  });
}

async function collectRepoData(target) {
  console.log(`\n--- Querying ${target.name} (${target.baseUrl}) ---`);

  const openapiUrl = `${target.baseUrl}/openapi.json`;
  const summaryUrl = `${target.baseUrl}/api/summary.json`;
  const latestDelayUrl = `${target.baseUrl}/api/latest-delay.json`;
  const latestManualUrl = `${target.baseUrl}/api/latest-manual.json`;
  const historyUrl = `${target.baseUrl}/api/history.json`;

  const [openapi, summary, latestDelay, latestManual, history] = await Promise.all([
    fetchJson(openapiUrl),
    fetchJson(summaryUrl),
    fetchJson(latestDelayUrl),
    fetchJson(latestManualUrl),
    fetchJson(historyUrl),
  ]);

  const isOpenApiValid = Boolean(openapi && (openapi.openapi?.startsWith('3.1') || openapi.openapi?.startsWith('3.0')));
  const openApiVersion = openapi?.openapi || 'unknown';
  const endpointsDocumented = openapi?.paths ? Object.keys(openapi.paths) : [];

  const cronHistory = history?.cronHistory || [];
  const manualHistory = history?.manualHistory || [];
  const analyzedCron = analyzeCronExecutions(cronHistory);

  // Check 17th execution compliance
  const runsOn17th = analyzedCron.filter(r => r.is17th);
  const latest17thRun = runsOn17th[runsOn17th.length - 1] || latestDelay;

  const isUp = Boolean(summary || latestDelay || openapi);

  console.log(`✓ Status: ${isUp ? 'ONLINE' : 'OFFLINE'}`);
  console.log(`✓ OpenAPI 3.1: ${isOpenApiValid ? `Valid (${openApiVersion})` : 'Missing/Invalid'}`);
  console.log(`✓ Endpoints documented: ${endpointsDocumented.join(', ')}`);
  console.log(`✓ Total 17th cron executions recorded: ${runsOn17th.length}`);
  if (latest17thRun) {
    console.log(`✓ Latest 17th run: ${latest17thRun.scheduledTime} -> actual ${latest17thRun.actualTime} (delay: ${latest17thRun.delayFormatted})`);
  }

  return {
    id: target.id,
    name: target.name,
    baseUrl: target.baseUrl,
    repoUrl: target.repoUrl,
    description: target.description,
    status: isUp ? 'online' : 'offline',
    checkedAt: new Date().toISOString(),
    openApi: {
      url: openapiUrl,
      isValid: isOpenApiValid,
      specVersion: openApiVersion,
      title: openapi?.info?.title || 'Unknown API',
      description: openapi?.info?.description || '',
      endpoints: endpointsDocumented,
      paths: openapi?.paths || {},
    },
    schedule: summary?.schedule || {
      cron: '14 3 17 * *',
      description: 'Every month on the 17th at 03:14:00 UTC',
    },
    latest17thRun,
    latestManualTrigger: latestManual || summary?.latestManualTrigger || null,
    statistics: summary?.statistics || history?.statistics || {
      totalRuns: cronHistory.length + manualHistory.length,
      cronRuns: cronHistory.length,
      manualRuns: manualHistory.length,
    },
    cronExecutions: analyzedCron,
    manualExecutions: manualHistory,
  };
}

async function main() {
  console.log('====================================================');
  console.log('  Healthcheck Observatory: Querying Heartbeat Repos ');
  console.log('  Checking Monthly 17th Cron Executions via OpenAPI  ');
  console.log('====================================================');

  const timestamp = new Date().toISOString();
  const repoResults = [];

  for (const target of TARGET_REPOSITORIES) {
    const result = await collectRepoData(target);
    repoResults.push(result);
  }

  // Cross-repository insights
  const all17thRuns = repoResults.flatMap(r => r.cronExecutions.filter(x => x.is17th));
  const avgDelayAll = all17thRuns.length > 0
    ? Math.round(all17thRuns.reduce((sum, r) => sum + (r.delaySeconds || 0), 0) / all17thRuns.length)
    : 0;

  const payload = {
    version: '0.1.0',
    generatedAt: timestamp,
    checkSchedule: {
      cron: '0 4 19 * *',
      description: 'Every month on the 19th at 04:00 UTC (48h buffer after the 17th cron)',
      reason: 'GitHub Actions cron jobs scheduled on the 17th can experience delays; running healthcheck on the 19th ensures complete execution data capture.',
    },
    monitoredSchedule: {
      cron: '14 3 17 * *',
      description: 'Target heartbeat repositories scheduled on the 17th of each month at 03:14 UTC',
    },
    summary: {
      totalMonitored: repoResults.length,
      onlineCount: repoResults.filter(r => r.status === 'online').length,
      openApiCompliantCount: repoResults.filter(r => r.openApi.isValid).length,
      averageDelaySecondsAcrossAll: avgDelayAll,
    },
    repositories: repoResults,
  };

  const projectRoot = resolve(__dirname, '..');
  const srcDataDir = resolve(projectRoot, 'src', 'data');
  const publicDataDir = resolve(projectRoot, 'public', 'data');
  const publicDir = resolve(projectRoot, 'public');

  mkdirSync(srcDataDir, { recursive: true });
  mkdirSync(publicDataDir, { recursive: true });

  const srcSnapshotPath = resolve(srcDataDir, 'heartbeatSnapshot.json');
  const publicSnapshotPath = resolve(publicDataDir, 'healthcheck.json');

  writeFileSync(srcSnapshotPath, JSON.stringify(payload, null, 2), 'utf-8');
  writeFileSync(publicSnapshotPath, JSON.stringify(payload, null, 2), 'utf-8');

  // Also write this observatory's own OpenAPI 3.1 specification!
  const observatoryOpenApi = {
    openapi: '3.1.0',
    info: {
      title: 'Heartbeat Healthcheck Observatory API',
      version: '0.1.0',
      description: 'Automated healthcheck observatory monitoring monthly 17th cron execution across heartbeat repositories. Automatically runs on the 19th of each month to account for runner delays.',
      contact: {
        name: 'baotrivn',
        url: 'https://github.com/baotrivn/healthcheck',
      },
      license: {
        name: 'MIT',
        url: 'https://opensource.org/licenses/MIT',
      },
    },
    servers: [
      {
        url: 'https://baotrivn.github.io/healthcheck',
        description: 'Production GitHub Pages',
      },
      {
        url: 'http://localhost:5173',
        description: 'Local Vite Development Server',
      },
    ],
    paths: {
      '/data/healthcheck.json': {
        get: {
          summary: 'Retrieve complete healthcheck observatory snapshot',
          description: 'Returns the status, OpenAPI compliance, and monthly 17th cron execution analysis for all monitored heartbeat repositories.',
          operationId: 'getHealthcheckData',
          responses: {
            '200': {
              description: 'Successful healthcheck response',
              content: {
                'application/json': {
                  schema: {
                    type: 'object',
                    properties: {
                      version: { type: 'string', example: '0.1.0' },
                      generatedAt: { type: 'string', format: 'date-time' },
                      checkSchedule: { type: 'object' },
                      monitoredSchedule: { type: 'object' },
                      summary: { type: 'object' },
                      repositories: { type: 'array' },
                    },
                  },
                },
              },
            },
          },
        },
      },
    },
  };

  writeFileSync(resolve(publicDir, 'openapi.json'), JSON.stringify(observatoryOpenApi, null, 2), 'utf-8');

  console.log(`\n✓ Successfully saved snapshot to:`);
  console.log(`  - ${srcSnapshotPath}`);
  console.log(`  - ${publicSnapshotPath}`);
  console.log(`  - ${resolve(publicDir, 'openapi.json')}`);
}

main().catch(err => {
  console.error('Fatal fetch error:', err);
  process.exit(1);
});
