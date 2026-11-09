# Healthcheck Observatory 🩺

[![Version](https://img.shields.io/badge/version-0.1.0-emerald.svg)](package.json)
[![OpenAPI 3.1](https://img.shields.io/badge/OpenAPI-3.1.0-teal.svg)](public/openapi.json)
[![Schedule](https://img.shields.io/badge/Schedule-19th%20Monthly%20%2804%3A00%20UTC%29-indigo.svg)](.github/workflows/deploy.yml)
[![License: MIT](https://img.shields.io/badge/License-MIT-blue.svg)](LICENSE)

An automated observatory that checks and benchmarks heartbeat repositories—including [Flynn0 Heartbeat](https://flynn0.github.io/heartbeat/) and [BaoTriVN Heartbeat](https://baotrivn.github.io/heartbeat/)—via their documented **OpenAPI 3.1** interfaces, tracking their monthly GitHub Actions cron execution.

Live Site: **[https://baotrivn.github.io/healthcheck/](https://baotrivn.github.io/healthcheck/)**

---

## 📅 The Monthly Execution Lifecycle

| Stage | Schedule | Details |
| :--- | :--- | :--- |
| **Monitored Cron** | **17th of each month** at `03:14:00 UTC` | Heartbeat repositories trigger their monthly GitHub Actions runner cron job (`14 3 17 * *`). |
| **Buffer Period** | **17th – 18th** (48 hours) | GitHub Actions runners can occasionally experience runner queue delays, high load, or delayed dispatch. |
| **Healthcheck Verification** | **19th of each month** at `04:00:00 UTC` | This repository automatically runs via GitHub Actions (`0 4 19 * *`), queries target OpenAPI 3.1 endpoints, calculates queue delay latency, and updates the Vite observatory dashboard. |

---

## 🔍 Monitored Repositories & OpenAPI 3.1 Interface

All monitored repositories expose compliant **OpenAPI 3.1.0** specifications and REST endpoints:

- **flynn0 / heartbeat**: [`https://flynn0.github.io/heartbeat/`](https://flynn0.github.io/heartbeat/)
  - OpenAPI Spec: [`https://flynn0.github.io/heartbeat/openapi.json`](https://flynn0.github.io/heartbeat/openapi.json)
- **baotrivn / heartbeat**: [`https://baotrivn.github.io/heartbeat/`](https://baotrivn.github.io/heartbeat/)
  - OpenAPI Spec: [`https://baotrivn.github.io/heartbeat/openapi.json`](https://baotrivn.github.io/heartbeat/openapi.json)

### Documented Endpoints Checked:

- `GET /api/latest-delay.json` — Latest monthly 17th cron execution with runner latency measurements (`delayMs`, `delaySeconds`, `delayFormatted`).
- `GET /api/latest-manual.json` — Latest workflow dispatch trigger with queue startup latency.
- `GET /api/history.json` — Historical timeline of all monthly 17th cron runs and manual dispatches.
- `GET /api/summary.json` — Consolidated overview of scheduler status and metrics.

This observatory also publishes its own OpenAPI 3.1 specification at [`public/openapi.json`](public/openapi.json) and snapshot data at [`public/data/healthcheck.json`](public/data/healthcheck.json).

---

## ✨ Features

- **Dynamic Project Versioning**: Project version `0.1.0` is retrieved dynamically from `package.json` (via Vite build definitions and imports) without hardcoding.
- **Light & Dark Mode**: Persistent theme switcher with system preference detection and smooth transitions.
- **Side-by-Side Comparison**: Live status, latest 17th cron execution, and queue jitter comparison across heartbeat targets.
- **Monthly 17th Timeline**: Visual latency timeline and sortable tabular log of monthly runs (Jan 17th – Oct 17th).
- **Interactive OpenAPI 3.1 Explorer**: In-browser API console to execute live requests against heartbeat endpoints with response timing and JSON inspection.
- **Automated GitHub Actions Deployment**: Monthly cron execution on the 19th (`0 4 19 * *`), manual dispatch (`workflow_dispatch`), and continuous deployment to GitHub Pages.

---

## 🛠️ Local Development

### Prerequisites

- Node.js >= 20.0.0 (Node 22 recommended)
- npm >= 9.0.0

### Getting Started

```bash
# Clone the repository
git clone https://github.com/baotrivn/healthcheck.git
cd healthcheck

# Install dependencies
npm install

# Fetch fresh data from monitored OpenAPI 3.1 endpoints
npm run fetch-data

# Start local Vite development server
npm run dev
```

### Production Build

```bash
# Fetches data and builds static assets to /dist
npm run build

# Preview production build locally
npm run preview
```

---

## 🚀 GitHub Actions Workflow

The automated workflow located at [`.github/workflows/deploy.yml`](.github/workflows/deploy.yml) performs:
1. Triggers every 19th of the month at 04:00 UTC (or on manual dispatch / push).
2. Executes `scripts/fetch-heartbeats.mjs` to query heartbeat endpoints.
3. Compiles the modern Vite application with Tailwind CSS and Lucide icons.
4. Commits any updated snapshot data back to the repository.
5. Deploys the static site to GitHub Pages.

---

## 📄 License

This project is licensed under the [MIT License](LICENSE).
