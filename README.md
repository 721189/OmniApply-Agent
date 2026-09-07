# 🚀 OmniApply AI — Autonomous Career Intelligence & Multi-Platform Application Engine

[![TypeScript](https://img.shields.io/badge/TypeScript-5.0+-3178C6?style=flat-square&logo=typescript&logoColor=white)](https://www.typescriptlang.org/)
[![React](https://img.shields.io/badge/React-19-61DAFB?style=flat-square&logo=react&logoColor=black)](https://reactjs.org/)
[![Express](https://img.shields.io/badge/Express-4.x-000000?style=flat-square&logo=express&logoColor=white)](https://expressjs.com/)
[![Tailwind CSS](https://img.shields.io/badge/TailwindCSS-v4-38B2AC?style=flat-square&logo=tailwind-css&logoColor=white)](https://tailwindcss.com/)
[![Gemini](https://img.shields.io/badge/Gemini_2.5_Flash-Google_AI-4285F4?style=flat-square&logo=google&logoColor=white)](https://ai.google.dev/)
[![Status](https://img.shields.io/badge/Status-Production_Ready-emerald?style=flat-square)]()

**OmniApply AI** is an end-to-end autonomous career intelligence engine and multi-platform application compiler. It aggregates candidate public footprints across **GitHub, LeetCode, Substack, LinkedIn, and Twitter/X**, synthesizes a **Unified Candidate Dossier**, and generates tailored, ATS-optimized application packages for **Wellfound, LinkedIn, Internshala, Greenhouse, and Lever**.

---

## 📑 Table of Contents

- [🧩 System Architecture & Workflow](#-system-architecture--workflow)
- [🌟 Key Core Capabilities](#-key-core-capabilities)
  - [1. Multi-Platform Signal Ingestion & Live Scrapers](#1-multi-platform-signal-ingestion--live-scrapers)
  - [2. ATS-Compliant LaTeX & PDF Resume Generator](#2-ats-compliant-latex--pdf-resume-generator)
  - [3. Recruiter Follow-up Drip Sequencer & .ICS Sync](#3-recruiter-follow-up-drip-sequencer--ics-sync)
  - [4. 📊 Salary Negotiation & Offer Evaluation Calculator](#4--salary-negotiation--offer-evaluation-calculator)
  - [5. Platform-Tailored Application Adapters](#5-platform-tailored-application-adapters)
  - [6. Real-Time Async Pipeline & Worker Telemetry](#6-real-time-async-pipeline--worker-telemetry)
  - [7. Dual-View Kanban & Table Pipeline](#7-dual-view-kanban--table-pipeline)
- [📡 API Reference](#-api-reference)
- [🛠️ Tech Stack & Dependencies](#-tech-stack--dependencies)
- [🚀 Local Development & Setup](#-local-development--setup)
- [🤝 Contributing](#-contributing)
- [💡 Honest Disclosures & Ethics](#-honest-disclosures--ethics)

---

## 🧩 System Architecture & Workflow

```
                                  OMNIAPPLY AI ARCHITECTURE
                                  
   +---------------------------------------------------------------------------------+
   |                                1. SIGNAL INGESTION                              |
   |                                                                                 |
   |   [ GitHub API ]       [ LeetCode GraphQL ]      [ Substack RSS ]     [ LinkedIn/X ]
   |   Repos, PRs, Langs    DSA Ranking, Badges      Writings, Essays      Tenure & Bio  
   +---------------------------------------+-----------------------------------------+
                                           |
                                           v
   +---------------------------------------------------------------------------------+
   |                           2. CANDIDATE INTELLIGENCE                             |
   |                                                                                 |
   |                       Gemini 2.5 Flash / Analyzer Engine                        |
   |                                       |                                         |
   |                                       v                                         |
   |                             Unified Candidate Dossier                           |
   |       * Skills Matrix   * Star Repos   * DSA Metrics   * Voice DNA   * KPIs     |
   +---------------------------------------+-----------------------------------------+
                                           |
                                           v
   +---------------------------------------------------------------------------------+
   |                              3. JOB STUDIO & ADAPTERS                           |
   |                                                                                 |
   |   [ Wellfound Adapter ]   [ LinkedIn InMail ]   [ Internshala ]   [ ATS (Greenhouse) ]
   |   Founder pitch + equity  Recruiter pitch 120w  Why-hire Q&A      XYZ-formula bullets 
   +---------------------------------------+-----------------------------------------+
                                           |
        +----------------------------------+----------------------------------+
        |                                  |                                  |
        v                                  v                                  v
+-----------------------+      +-----------------------+      +-----------------------+
|  4. ATS LATEX ENGINE  |      |  5. FOLLOW-UP CADENCE |      |  6. OFFER NEGOTIATOR  |
|                       |      |                       |      |                       |
| Overleaf-ready .tex   |      | 4-Stage Drip Sequence |      | Market percentiles    |
| Single-page layout    |      | InMail / Email copy   |      | Equity vesting model  |
| Clean PDF print view  |      | RFC 5545 .ICS sync    |      | Counter-offer scripts |
+-----------------------+      +-----------------------+      +-----------------------+
        |                                  |                                  |
        +----------------------------------+----------------------------------+
                                           |
                                           v
   +---------------------------------------------------------------------------------+
   |                             7. LIFECYCLE & TRACKING                             |
   |                                                                                 |
   |     Dual-View Kanban Board  <--->  Data Table View  <--->  CSV / JSON Export    |
   |     Prepared  -->  Applied  -->  Interviewing  -->  Offer Received  --> Archive |
   +---------------------------------------------------------------------------------+
```

---

## 🌟 Key Core Capabilities

### 1. Multi-Platform Signal Ingestion & Live Scrapers
- **Live Scrapers (`/server/scrapers.ts`)**:
  - **GitHub**: Queries public REST APIs for language distributions, star counts, pinned repos, and commit cadence.
  - **LeetCode**: Queries public GraphQL endpoints to extract total problems solved, contest rating, and global ranking percentiles.
  - **Substack**: Parses RSS feeds to extract article titles, publication themes, and technical writing depth.
  - **Non-blocking Resiliency**: Implements 4-second `AbortController` timeouts with deterministic fallback models if network rate limits are encountered.

### 2. ATS-Compliant LaTeX & PDF Resume Generator
- Generates publication-quality, ATS-optimized single-page LaTeX resumes ready for **Overleaf** or local `pdflatex` compilation.
- Features:
  - Strict ATS formatting without tables, multi-column blocks, or graphics that break OCR scanners.
  - XYZ-formula bullet formatting (`Accomplished [X], measured by [Y], by doing [Z]`).
  - Embedded keyword density matching target job descriptions.
  - Built-in live browser PDF print previewer and one-click `.tex` export.

### 3. Recruiter Follow-up Drip Sequencer & .ICS Sync
- Compiles a proactive 4-stage follow-up schedule:
  1. **Day 3**: Subtle value-add touchpoint (sharing relevant open-source repo or article).
  2. **Day 7**: Direct recruiter InMail / email check-in.
  3. **Day 14**: Secondary project update & traction milestone.
  4. **Day 21**: Graceful breakup / future-pipeline note.
- **One-Click Calendar Sync**: Generates RFC 5545 standard `.ics` calendar files that import directly into **Google Calendar, Apple Calendar, and Microsoft Outlook**.

### 4. 📊 Salary Negotiation & Offer Evaluation Calculator
- **Market Benchmarking**: Evaluates base compensation, sign-on bonuses, and equity grants against real-world percentiles (Levels.fyi / Glassdoor data points).
- **Location Tier Support**: Tier 1 (SF Bay Area, NYC, Seattle), Tier 2 (Austin, Boston, London, Toronto), Tier 3 (Remote, Berlin, Bangalore).
- **Equity Growth Modeling**: Calculates Year 1 Total Compensation (TC) vs. Recurring TC with 4-year cliff vesting and startup valuation multipliers (1x to 5x).
- **Counter-Offer Email Generator**: Generates professional, diplomatic negotiation scripts tailored for:
  - Multiple competing offers.
  - Market percentile under-compensation.
  - Flexible equity-to-base rebalancing.

### 5. Platform-Tailored Application Adapters
| Target Platform | Output Format & Strategy |
|---|---|
| **Wellfound (AngelList)** | Short founder note (150–200 words), zero-to-one traction, and startup equity stance. |
| **LinkedIn InMail** | High-impact 120-word recruiter pitch with scannable bullet points and custom connection request note. |
| **Internshala** | Structured answers to "Why should you be hired?" and availability confirmations. |
| **Enterprise ATS (Greenhouse / Lever)** | Formal cover letter, tailored resume bullets, and candidate-grounded screening answers. |

### 6. Real-Time Async Pipeline & Worker Telemetry
- Application-level async worker telemetry (`async-worker-node-01`, `async-worker-node-02`).
- Provides real-time execution logs across four pipeline stages (`INGESTION` → `CORRELATION` → `SYNTHESIS` → `GENERATION`).
- Non-blocking task monitoring with persistent telemetry logs in PostgreSQL / SQLite.

### 7. Dual-View Kanban & Table Pipeline
- Track job statuses across 6 distinct phases: `Prepared`, `Applied`, `Interviewing`, `Offer Received`, `Archived`.
- Includes full-text search, platform filtering, CSV spreadsheet export, and quick note editing.

---

## 📡 API Reference

### Profile Intelligence & Live Scrapers
- `POST /api/analyze-profiles` — Ingest candidate URLs and compile unified dossier.
- `POST /api/scrapers/ping` — Live query test for GitHub, LeetCode, or Substack endpoints.
- `GET  /api/analysis` — Retrieve saved candidate dossier.

### Generation & Optimization
- `POST /api/generate-application` — Generate tailored application package for a target job description.
- `POST /api/refine-draft` — Apply prompt transformations to drafted content.
- `POST /api/resume/latex` — Generate ATS LaTeX resume code and PDF preview structure.
- `POST /api/followup/generate` — Generate 4-stage recruiter follow-up sequence.
- `GET  /api/jobs/:id/ics` — Download RFC 5545 `.ics` follow-up reminder file.

### Job Tracker & Negotiation
- `GET    /api/jobs` — List all tracked job applications.
- `GET    /api/jobs/:id` — Retrieve full dossier for a specific application.
- `PATCH  /api/jobs/:id` — Update application package or notes.
- `PATCH  /api/jobs/:id/status` — Update pipeline stage.
- `PATCH  /api/jobs/:id/offer` — Update offer compensation details & negotiation parameters.
- `DELETE /api/jobs/:id` — Remove job record.

### Authentication & Privacy
- `POST   /api/auth/login` — Sign in with email and password.
- `POST   /api/auth/register` — Create new candidate profile with CSPRNG OTP verification.
- `POST   /api/auth/verify-email` — Verify email via constant-time cryptographic comparison.
- `GET    /api/auth/me` — Get active session.
- `GET    /api/auth/export-data` — Export user records as JSON.
- `DELETE /api/auth/account` — Permanent account purge.

---

## 🛠️ Tech Stack & Dependencies

- **Frontend**: React 19, TypeScript, Tailwind CSS v4, Lucide Icons, Canvas Confetti.
- **Backend Server**: Express 4, Node.js, TypeScript (`tsx`).
- **AI Core**: Google Gemini 2.5 Flash via `@google/genai` SDK with deterministic fallback synthesis.
- **Security & Authentication**:
  - **PBKDF2 Salted Hashing**: 100,000-iteration SHA-512 password hashing with 16-byte cryptographically unique salts via Node `crypto`.
  - **HMAC-SHA256 Signed Tokens**: 7-day expiration session tokens with constant-time signature verification. Requires `JWT_SECRET` (or `SECRET_KEY` alias) in production.
  - **CSPRNG OTP Verification & Email Dispatch**: Cryptographically secure 6-digit codes (`crypto.randomInt`) with timing-safe verification, 15-minute expirations, and real transactional email dispatch via Resend API (with local dev console logging fallback).
  - **HTTP Security Headers**: Native headers (`X-Content-Type-Options`, `X-Frame-Options`, `X-XSS-Protection`, `Referrer-Policy`).
  - **In-Memory Instance Rate Limiting**: Sliding-window rate limiter (60 requests/minute per IP) on `/api/*` endpoints to throttle brute-force attacks on individual server/container instances (for multi-instance serverless deployments, an external coordinator like Upstash Redis is recommended).
- **Database & Persistence**: Fail-closed PostgreSQL persistence for production/serverless environments (`DATABASE_URL`). Embedded relational SQLite WASM storage is strictly isolated to local development environments to prevent silent production data loss.
- **Build & Packaging**: Vite 6, esbuild CommonJS single-bundle compilation (`dist/server.cjs`).

---

## 🚀 Local Development & Setup

### Prerequisites
- Node.js 18.x or higher
- npm 9.x or higher

### Step-by-Step Setup

1. **Clone the repository:**
   ```bash
   git clone https://github.com/<YOUR-USERNAME>/omniapply-ai.git
   cd omniapply-ai
   ```

2. **Install dependencies:**
   ```bash
   npm install
   ```

3. **Configure environment variables:**
   ```bash
   cp .env.example .env
   ```
   Add your configuration keys in `.env`:
   ```env
   # Core AI
   GEMINI_API_KEY=your_gemini_api_key_here

   # Session security (required in production, optional in local dev)
   JWT_SECRET=your_random_64_character_secret_here

   # PostgreSQL connection (required in production, uses SQLite in local dev)
   DATABASE_URL=postgresql://user:password@host/dbname?sslmode=require

   # Optional transactional email dispatch
   RESEND_API_KEY=re_your_resend_api_key_here
   ```

4. **Start the development server:**
   ```bash
   npm run dev
   ```
   Open your browser at `http://localhost:3000`.

5. **Build for production:**
   ```bash
   npm run build
   npm start
   ```

---

## 🤝 Contributing

Contributions are welcome! Please review [CONTRIBUTING.md](./CONTRIBUTING.md) for details on code style, branch naming conventions, and pull request workflows.

---

## 💡 Honest Disclosures & Ethics

1. **Human-in-the-Loop Philosophy**: OmniApply AI generates tailored materials grounded in your actual public work, but **you should always review every cover note, screening answer, and salary figure** prior to final submission.
2. **Platform Terms Compliance**: OmniApply AI functions as a drafting and preparation engine. It does not perform unattended, automated browser clicks on job boards, ensuring account safety.
3. **Data Privacy**: Your profile signals and applications reside in your active session. You can export or delete your data at any time via **Settings → Data Privacy**.

---

<div align="center">
  <sub>Built with ❤️ by the OmniApply Open Source Contributors.</sub>
</div>
