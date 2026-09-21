# 🚀 OmniApply AI — Autonomous Engineering Career Engine

[![TypeScript](https://img.shields.io/badge/TypeScript-5.0+-3178C6?style=flat-square&logo=typescript&logoColor=white)](https://www.typescriptlang.org/)
[![React](https://img.shields.io/badge/React-19-61DAFB?style=flat-square&logo=react&logoColor=black)](https://reactjs.org/)
[![Express](https://img.shields.io/badge/Express-4.x-000000?style=flat-square&logo=express&logoColor=white)](https://expressjs.com/)
[![Tailwind CSS](https://img.shields.io/badge/TailwindCSS-v4-38B2AC?style=flat-square&logo=tailwind-css&logoColor=white)](https://tailwindcss.com/)
[![Gemini](https://img.shields.io/badge/Gemini_2.5_Flash-Google_AI-4285F4?style=flat-square&logo=google&logoColor=white)](https://ai.google.dev/)
[![Status](https://img.shields.io/badge/Release-v2.0_Commercial-emerald?style=flat-square)]()
[![License](https://img.shields.io/badge/License-MIT-blue.svg?style=flat-square)](LICENSE)

**OmniApply AI** is an engineering-first career assistant and application preparation engine. It ingests your authentic technical footprint across **GitHub, LeetCode, Substack, LinkedIn, and Portfolio sites**, parses job requirements, and generates ATS-optimized resumes, platform-specific pitches (**Wellfound, LinkedIn, Internshala, Greenhouse, Lever**), 4-stage recruiter follow-ups with calendar sync, and interactive offer negotiation models.

---

## 📑 Table of Contents

- [📊 Interactive System Architecture & Infographics](#-interactive-system-architecture--infographics)
  - [1. End-to-End Application Synthesis Pipeline](#1-end-to-end-application-synthesis-pipeline)
  - [2. Multi-Signal Footprint Ingestion Flow](#2-multi-signal-footprint-ingestion-flow)
  - [3. Razorpay Checkout & Doodle Advisory Flow](#3-razorpay-checkout--doodle-advisory-flow)
  - [4. Job Application State Machine](#4-job-application-state-machine)
- [⚖️ Honest Comparison: OmniApply vs. Generic AI Prompting](#️-honest-comparison-omniapply-vs-generic-ai-prompting)
- [🌟 Key Core Capabilities](#-key-core-capabilities)
  - [1. Real Signal Ingestion & Live Scrapers](#1-real-signal-ingestion--live-scrapers)
  - [2. ATS-Compliant Single-Column Resume & LaTeX Generator](#2-ats-compliant-single-column-resume--latex-generator)
  - [3. Recruiter Follow-up Drip Sequencer & RFC 5545 .ICS Sync](#3-recruiter-follow-up-drip-sequencer--rfc-5545-ics-sync)
  - [4. Salary Negotiation & 409A Equity Valuation Calculator](#4-salary-negotiation--409a-equity-valuation-calculator)
  - [5. Platform-Tailored Adapters (Wellfound, LinkedIn, Internshala)](#5-platform-tailored-adapters-wellfound-linkedin-internshala)
  - [6. Razorpay Commercial Billing & Doodle 1:1 Advisory](#6-razorpay-commercial-billing--doodle-11-advisory)
  - [7. Fail-Closed PostgreSQL & Local SQLite WASM Engine](#7-fail-closed-postgresql--local-sqlite-wasm-engine)
- [📡 Comprehensive API Reference](#-comprehensive-api-reference)
- [🛠️ Tech Stack & Security Model](#️-tech-stack--security-model)
- [🚀 Local Development & Quickstart](#-local-development--quickstart)
- [💡 Honest Disclosures & Operational Constraints](#-honest-disclosures--operational-constraints)

---

## 📊 Interactive System Architecture & Infographics

### 1. End-to-End Application Synthesis Pipeline

```mermaid
flowchart TD
    subgraph SignalIngestion["1. Multi-Platform Ingestion"]
        GH["GitHub REST API<br/>• Repos & PRs<br/>• Language AST<br/>• Commit cadence"]
        LC["LeetCode GraphQL<br/>• DSA Percentiles<br/>• Tag Breakdown<br/>• Solved Totals"]
        SS["Substack RSS<br/>• Technical Essays<br/>• Architecture Posts<br/>• Voice DNA"]
        LI["LinkedIn / Portfolio<br/>• Work Experience<br/>• Education & Bio<br/>• Career Timeline"]
    end

    subgraph NormalizationEngine["2. Candidate Intelligence Core"]
        NORM["Signal Sanitizer & Scraper Fallback"]
        DOSSIER["Unified Candidate Dossier<br/>• Verified Skills Matrix<br/>• STAR Project Bullets<br/>• Authentic Code Citations"]
    end

    subgraph JobAnalysis["3. Job Posting Analysis"]
        JD["Job Description Input<br/>(URL or Text)"]
        PARSE["Prerequisite Parser<br/>• Hard Tech Stack<br/>• Tooling Minimums<br/>• Soft Qualifications"]
        GAP["Keyword & Density Matcher<br/>• Gap Analysis<br/>• Relevance Rubric"]
    end

    subgraph SynthesisEngine["4. Gemini 2.5 Flash Synthesis Engine"]
        PROMPT["Structured Grounding Prompt<br/>(Strict Anti-Fabrication Constraints)"]
        GEN["Multi-Artifact Compilation"]
    end

    subgraph ArtifactGeneration["5. Tailored Application Package"]
        RES["ATS Single-Column Resume<br/>• Markdown & LaTeX<br/>• Real Code PR Citations"]
        PITCH["Platform-Specific Pitches<br/>• Wellfound Founder Note<br/>• LinkedIn Recruiter InMail<br/>• Internshala Answers"]
        FOLLOW["4-Stage Follow-up Cadence<br/>• Day 3, 7, 14, 21<br/>• RFC 5545 .ICS Calendar File"]
        NEG["Compensation Planner<br/>• Levels.fyi Market Percentiles<br/>• 409A Equity Vesting Model"]
    end

    GH --> NORM
    LC --> NORM
    SS --> NORM
    LI --> NORM
    NORM --> DOSSIER

    JD --> PARSE --> GAP
    DOSSIER & GAP --> PROMPT
    PROMPT --> GEN

    GEN --> RES
    GEN --> PITCH
    GEN --> FOLLOW
    GEN --> NEG
```

---

### 2. Multi-Signal Footprint Ingestion Flow

```mermaid
sequenceDiagram
    autonumber
    actor Candidate as User / Candidate
    participant Client as OmniApply React UI
    participant Server as Express / Node API
    participant Scrapers as Multi-Platform Scraper Engine
    participant Gemini as Gemini 2.5 Flash
    participant DB as SQLite WASM / PostgreSQL

    Candidate->>Client: Input Profile URLs (GitHub, LeetCode, Substack)
    Client->>Server: POST /api/analyze-profiles
    Server->>Scrapers: Trigger Non-Blocking Ingestion (4s timeout)
    
    par Query GitHub API
        Scrapers->>Scrapers: Extract Public Repos, Languages, Stars
    and Query LeetCode GraphQL
        Scrapers->>Scrapers: Extract Solved Problems & Rating
    and Parse Substack RSS
        Scrapers->>Scrapers: Extract Technical Writing Topics
    end

    Scrapers-->>Server: Normalized Technical Signals
    Server->>Gemini: Synthesize Unified Candidate Dossier
    Gemini-->>Server: Verified Skills Matrix + STAR Experience
    Server->>DB: Persist Candidate Dossier (User Session)
    Server-->>Client: 200 OK with Candidate Analysis
    Client-->>Candidate: Render Skills Radar & Dossier Preview
```

---

### 3. Razorpay Checkout & Doodle Advisory Flow

```mermaid
sequenceDiagram
    autonumber
    actor Candidate as Candidate
    participant UI as Pricing & Booking Modal
    participant Backend as Express Commerce API
    participant Razorpay as Razorpay API Gateway
    participant Doodle as Doodle Calendar Sync

    Candidate->>UI: Select Plan (Starter / Pro / Career Suite)
    UI->>Backend: POST /api/razorpay/create-order { tier, currency, cycle }
    Backend->>Razorpay: Initialize Order (INR / USD with HMAC signature key)
    Razorpay-->>Backend: Order Object (id, amount, currency)
    Backend-->>UI: Order Metadata + Checkout Configuration
    UI->>Candidate: Open Razorpay Modal (UPI, Netbanking, Cards)
    
    Candidate->>UI: Authorize Payment
    UI->>Backend: POST /api/razorpay/verify-payment { order_id, payment_id, signature }
    Backend->>Backend: Constant-Time HMAC-SHA256 Signature Verification
    Backend->>Backend: Upgrade User Subscription Tier in Database
    Backend-->>UI: 200 OK + Instant Feature Unlock

    opt 1:1 Executive Advisory (Doodle)
        Candidate->>UI: Schedule 1:1 Offer Strategy Session
        UI->>Backend: POST /api/doodle/book-session { name, email, targetRole, timeSlot }
        Backend->>Doodle: Create Calendar Reservation & Sync RFC 5545 .ICS
        Backend-->>UI: 200 OK + Confirmation & Calendar Invite
        UI-->>Candidate: Display Google/Apple Calendar Add Button
    end
```

---

### 4. Job Application State Machine

```mermaid
stateDiagram-v2
    [*] --> Prepared : Generate Application Package
    
    Prepared --> InReview : Candidate Inspects Resume & Pitch
    InReview --> Prepared : Refine Draft / Re-prompt
    
    InReview --> Applied : Candidate Submits to Employer
    
    Applied --> Screening : Recruiter Outreach Received
    Applied --> FollowUpDrip : No response after 3/7/14 days
    FollowUpDrip --> Applied : Recruiter Follow-up Dispatched via .ICS
    
    Screening --> TechnicalInterview : Pass Recruiter Screen
    TechnicalInterview --> OfferReceived : Pass Onsite / Coding Rounds
    
    OfferReceived --> Negotiating : Run 409A Equity & Salary Calculator
    Negotiating --> OfferAccepted : Counter-Offer Accepted
    Negotiating --> Archived : Offer Declined / Withdrawn
    
    Applied --> Rejected : Employer Rejection
    Rejected --> Archived : Archive Record
    OfferAccepted --> [*]
    Archived --> [*]
```

---

## ⚖️ Honest Comparison: OmniApply vs. Generic AI Prompting

| Capability | Generic ChatGPT / LLM Prompt | OmniApply AI Engine | Why It Matters |
|---|:---:|:---:|---|
| **Code Footprint Ingestion** | ❌ None (Manual copy-paste) | ✅ Direct GitHub API & repo analysis | Cites real commit histories, language breakdowns, and architecture. |
| **Hallucination Prevention** | ❌ High (Invented metrics & jobs) | ✅ Strict Grounding on public profiles | Prevents awkward interview situations where you cannot defend your resume. |
| **Platform Pitch Specialization** | ❌ Generic cover letter output | ✅ Wellfound, LinkedIn, Internshala, ATS | Tailors length, tone, and format to each platform's culture. |
| **ATS OCR Structure** | ⚠️ Often introduces tables/columns | ✅ Strict Single-Column standard layout | Ensures 100% readability across Greenhouse, Lever, and Workday. |
| **Follow-up Timing** | ❌ None | ✅ 4-Stage Cadence + RFC 5545 `.ics` | Automatically populates follow-up reminders in your calendar. |
| **Offer Negotiation Model** | ⚠️ Generic tips | ✅ Levels.fyi Percentiles + 409A Equity math | Evaluates tax, vesting cliffs, and startup dilution scenarios. |
| **Data Privacy** | ❌ Uploaded to 3P training sets | ✅ Self-Serve Account & Data Export/Purge | Full GDPR-compliant data export and deletion at any time. |

---

## 🌟 Key Core Capabilities

### 1. Real Signal Ingestion & Live Scrapers
- **GitHub REST API**: Queries public repositories, stars, language breakdowns, and recent activity.
- **LeetCode GraphQL API**: Extracts total solved count, global ranking, and category metrics (Algorithms, Database, Shell).
- **Substack RSS**: Parses published articles to analyze writing focus and domain expertise.
- **Resilient Fallback Mode**: All scrapers feature a strict 4-second timeout with deterministic parsing fallback to prevent UI blocking when third-party endpoints rate-limit requests.

### 2. ATS-Compliant Single-Column Resume & LaTeX Generator
- **Clean Single-Column Layout**: Strict avoidance of complex multi-column tables, text boxes, or embedded vector graphics that break legacy ATS OCR engines.
- **XYZ Formula Formatting**: Rewrites engineering bullet points using Google's XYZ formula: `Accomplished [X], measured by [Y], by doing [Z]`.
- **LaTeX Source Export**: One-click `.tex` export compatible with Overleaf and `pdflatex`.

### 3. Recruiter Follow-up Drip Sequencer & RFC 5545 .ICS Sync
- **Stage 1 (Day 3)**: Subtle value-add message sharing relevant open-source work or technical insights.
- **Stage 2 (Day 7)**: Direct recruiter check-in.
- **Stage 3 (Day 14)**: Project milestone and traction update.
- **Stage 4 (Day 21)**: Professional closeout note.
- **Calendar Reminders**: Generates downloadable `.ics` files that import directly into **Google Calendar, Apple Calendar, and Microsoft Outlook**.

### 4. Salary Negotiation & 409A Equity Valuation Calculator
- **Market Benchmarking**: Visualizes base salary, sign-on bonus, and equity against standard market percentiles.
- **Equity Modeling**: Calculates Year 1 Total Compensation vs. Recurring TC, factoring in 4-year vesting schedules and startup valuation scenarios (1x to 5x).
- **Custom Negotiation Scripts**: Generates diplomatic email drafts for competing offers, under-market compensation, or equity-to-base rebalancing.

### 5. Platform-Tailored Adapters
- **Wellfound (AngelList)**: Concise founder pitch (150–200 words) highlighting 0-to-1 build speed, technical ownership, and equity expectations.
- **LinkedIn InMail**: Compact 120-word recruiter note with bulleted achievements and a 300-character connection request template.
- **Internshala**: Formatted answers to platform screening prompts (e.g., "Why should you be hired for this internship?").
- **Enterprise ATS**: Formal cover letter, tailored resume bullets, and technical screening responses.

### 6. Razorpay Commercial Billing & Doodle 1:1 Advisory
- **Razorpay Integration**: Native checkout supporting **UPI (Google Pay, PhonePe, Paytm), Netbanking, and International Credit/Debit Cards** in INR (₹) and USD ($).
- **HMAC Signature Verification**: Secure server-side validation using SHA-256 HMAC tokens.
- **Doodle 1:1 Advisory Scheduling**: Built-in executive career strategy booking with instant calendar invite dispatch.

### 7. Fail-Closed PostgreSQL & Local SQLite WASM Engine
- **Production Persistence**: Direct PostgreSQL integration (`DATABASE_URL`) with fail-closed security in production.
- **Local Zero-Setup Mode**: Embedded SQLite WASM engine for local development without external database dependencies.

---

## 📡 Comprehensive API Reference

### Profile Intelligence
- `POST /api/analyze-profiles` — Ingest candidate URLs and compile unified dossier.
- `POST /api/scrapers/ping` — Test public profile URLs for GitHub, LeetCode, or Substack.
- `GET  /api/analysis` — Retrieve active candidate dossier.

### Application Generation & ATS
- `POST /api/generate-application` — Generate tailored application package for a target job.
- `POST /api/refine-draft` — Apply prompt transformations to drafted content.
- `POST /api/resume/latex` — Generate ATS-compliant LaTeX resume code.
- `POST /api/followup/generate` — Generate 4-stage recruiter follow-up sequence.
- `GET  /api/jobs/:id/ics` — Download RFC 5545 `.ics` follow-up reminder file.

### Job Tracker & Negotiation
- `GET    /api/jobs` — List all tracked job applications.
- `GET    /api/jobs/:id` — Retrieve full package for a specific job.
- `PATCH  /api/jobs/:id` — Update application package or notes.
- `PATCH  /api/jobs/:id/status` — Update application status.
- `PATCH  /api/jobs/:id/offer` — Update compensation & negotiation data.
- `DELETE /api/jobs/:id` — Remove job application record.

### Payments & Advisory
- `POST /api/razorpay/create-order` — Create Razorpay checkout order.
- `POST /api/razorpay/verify-payment` — Verify payment HMAC signature and activate subscription.
- `POST /api/doodle/book-session` — Schedule 1:1 advisory session with calendar sync.

### Authentication & Account Security
- `POST   /api/auth/register` — Create new account with CSPRNG OTP verification.
- `POST   /api/auth/verify-email` — Verify email code using constant-time cryptographic comparison.
- `POST   /api/auth/login` — Sign in with email and password.
- `GET    /api/auth/me` — Retrieve active session profile.
- `GET    /api/auth/export-data` — Export all user data as JSON.
- `DELETE /api/auth/account` — Permanent account and data deletion.

---

## 🛠️ Tech Stack & Security Model

```
+-------------------------------------------------------------------------+
|                               FRONTEND                                  |
|  React 19 • TypeScript 5 • Tailwind CSS v4 • Lucide Icons • Motion UI   |
+------------------------------------+------------------------------------+
                                     | (Vite & Fetch API)
+------------------------------------+------------------------------------+
|                               BACKEND                                   |
|   Express 4 • Node.js Runtime • TypeScript (tsx) • esbuild Bundler      |
+------------------------------------+------------------------------------+
         |                           |                           |
+--------+--------+         +--------+--------+         +--------+--------+
|    AI CORE      |         |    SECURITY     |         |   COMMERCE      |
| Google GenAI    |         | PBKDF2 (100k)   |         | Razorpay API    |
| Gemini 2.5 Flash|         | HMAC-SHA256 JWT |         | Doodle Sync     |
| Grounding AST   |         | CSPRNG OTP      |         | Resend Email    |
+-----------------+         +-----------------+         +-----------------+
```

- **Password Hashing**: PBKDF2 with 100,000 iterations of SHA-512 and unique 16-byte cryptographic salts.
- **Session Tokens**: HMAC-SHA256 signed tokens with 7-day expirations and timing-safe verification.
- **Rate Limiting**: Sliding-window rate limiting on `/api/*` endpoints to protect against brute-force attempts.
- **Email Delivery**: Transactional email dispatch via Resend API with local development console fallback.

---

## 🚀 Local Development & Quickstart

### Prerequisites
- **Node.js**: 18.x or higher
- **npm**: 9.x or higher

### Quickstart Steps

1. **Clone the repository:**
   ```bash
   git clone https://github.com/your-username/omniapply-ai.git
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
   Configure your keys in `.env`:
   ```env
   # Core AI
   GEMINI_API_KEY=your_gemini_api_key_here

   # Session Security
   JWT_SECRET=your_random_64_character_secret_here

   # Database (PostgreSQL for production; local dev defaults to embedded SQLite)
   DATABASE_URL=postgresql://user:password@host/dbname?sslmode=require

   # Commerce & Payments (Optional for local testing; mock fallback provided)
   RAZORPAY_KEY_ID=rzp_test_your_key_id
   RAZORPAY_KEY_SECRET=your_key_secret

   # Transactional Email (Optional for local testing; OTP logged to console in dev)
   RESEND_API_KEY=re_your_resend_api_key
   ```

4. **Start the development server:**
   ```bash
   npm run dev
   ```
   Open `http://localhost:3000` in your browser.

5. **Run test suite:**
   ```bash
   npm test
   ```

6. **Build for production:**
   ```bash
   npm run build
   npm start
   ```

---

## 💡 Honest Disclosures & Operational Constraints

1. **Grounded in Public Signals**: The quality and specificity of generated applications depend entirely on your provided technical profiles. If a GitHub or LeetCode profile has limited public activity, the engine outputs concise, strictly verified materials rather than inventing placeholder projects.
2. **Human-in-the-Loop Required**: Always review generated cover notes, resume bullets, and salary parameters before submitting applications.
3. **No Unattended Auto-Applying**: OmniApply AI is a drafting and preparation engine. It does not perform automated browser clicks on third-party job portals, keeping your accounts fully compliant with platform terms of service.
4. **Third-Party API Rate Limits**: Public scrapers (GitHub, LeetCode, Substack) are subject to external rate limits. If rate limits are encountered, the engine gracefully falls back to structured template baselines.
5. **Data Ownership**: You retain full ownership of your data. You can export or permanently delete your account and records at any time from **Settings → Data Privacy**.

---

<div align="center">
  <sub>OmniApply AI — Autonomous Engineering Career Intelligence</sub>
</div>
