# Contributing to OmniApply AI

Thank you for your interest in contributing to **OmniApply AI**! We welcome contributions from engineers, designers, and open-source advocates to make job application intelligence fairer, faster, and more transparent for developers worldwide.

---

## 📜 Code of Conduct

We expect all contributors to uphold a welcoming, inclusive, and harassment-free community:
- Treat fellow contributors with respect, empathy, and constructive feedback.
- Welcome newcomers and guide them through our architecture.
- Keep discussions focused on engineering excellence, product craftsmanship, and ethical job-hunting practices.

---

## 🛠️ Development Workflow

### 1. Fork & Clone
1. Fork the repository to your own GitHub account.
2. Clone your fork locally:
   ```bash
   git clone https://github.com/<YOUR-USERNAME>/omniapply-ai.git
   cd omniapply-ai
   ```

### 2. Branch Naming Conventions
Create a descriptive branch for your work:
- `feature/salary-calculator-improvements`
- `fix/leetcode-graphql-parser`
- `refactor/latex-resume-builder`
- `docs/api-reference-update`

```bash
git checkout -b feature/your-feature-name
```

### 3. Setting Up Local Environment
Install dependencies:
```bash
npm install
```

Copy the example environment file:
```bash
cp .env.example .env
```
Add your `GEMINI_API_KEY` (optional if testing with deterministic fallback logic).

Start the development server:
```bash
npm run dev
```
The app will be accessible at `http://localhost:3000`.

---

## 🧱 Architecture & Guidelines

### Frontend
- **Framework**: React 18+ with TypeScript.
- **Styling**: Tailwind CSS utility classes. Avoid arbitrary inline styles.
- **Icons**: Always import icons from `lucide-react`.
- **Component Modularity**: Keep components clean and modular under `/src/components/`. Extract shared mathematical or scoring calculations into `/src/utils/`.

### Backend
- **Server**: Express 4 with TypeScript (`server.ts`).
- **Data Store**: In-Memory or SQLite adapter (`/server/db.ts`).
- **Scrapers**: Always implement strict request timeouts using `AbortController` and never block request execution if third-party endpoints rate-limit or fail.

### Testing & Verification
Before submitting a pull request, ensure the build passes cleanly:
```bash
npm run build
```

---

## 🚀 Submitting a Pull Request (PR)

1. **Commit your changes**:
   Write clear, conventional commit messages:
   - `feat: add Indian Rupee and EUR currency support in negotiation engine`
   - `fix: correct LaTeX escaping for ampersands in company names`
   - `docs: update setup commands in README`

2. **Push to your fork**:
   ```bash
   git push origin feature/your-feature-name
   ```

3. **Open a Pull Request**:
   - Provide a clear summary of what was changed and why.
   - Attach screenshots or visual recordings for UI modifications.
   - Reference any relevant issues (e.g., `Closes #12`).

---

## 💡 Feature Ideas & Roadmap

Looking for inspiration? Check out our active development areas:
- [ ] Multi-turn AI Technical Interview Simulator with audio feedback.
- [ ] Direct Chrome Extension adapter for one-click form autofill.
- [ ] Additional localized salary percentiles for Europe and APAC regions.
- [ ] Native Overleaf project generator API.

---

<div align="center">
  <sub>Thank you for making OmniApply AI better!</sub>
</div>
