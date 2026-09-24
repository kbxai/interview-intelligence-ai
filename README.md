# Interview Intelligence & ATS Resume Studio

Evidence-based AI interview preparation and ATS resume tailoring platform built with React, Node.js, Express, MongoDB, and Google Gemini.

---

## Features

- **Public Landing Page:** Overview of product capabilities, 3-step workflow, features, and FAQ.
- **Role Context Analysis:** Analyzes job description, candidate self-description, and uploaded PDF resume.
- **Evidence-Based Extraction:** Prevents fabricated experience by grounding all questions and answers strictly in candidate inputs.
- **Technical & Behavioral Questions:** Role-specific questions with candidate-grounded answers and interviewer evaluation intent.
- **Skill Gap Prioritization:** Categorizes gaps by severity (critical, high, medium, low).
- **Day-by-Day Roadmap:** Actionable daily milestones with study topics and practice tasks.
- **ATS Resume Studio:** Generates structured Markdown resumes in Classic, Modern, and Compact layouts, featuring live dual-column editing and print-ready PDF export via headless Chromium.

---

## Tech Stack

- **Frontend:** React 19, React Router 8, SCSS, Axios, Vite 8, Oxlint.
- **Backend:** Node.js, Express 5, MongoDB / Mongoose 9, `@google/genai` (Google Gemini), Puppeteer, `pdf-parse`, `express-rate-limit`, Zod, JWT.
- **Containerization:** Dockerfile with Google Chrome for Puppeteer, `docker-compose.yml`.

---

## Getting Started

### Prerequisites

- Node.js (version 20 or higher)
- MongoDB instance (local or MongoDB Atlas)
- Google Gemini API key

### 1. Environment Setup

#### Backend (`Backend/.env`)

```env
PORT=5000
NODE_ENV=development
MONGO_URI=mongodb://127.0.0.1:27017/interview-master
JWT_SECRET=your_minimum_32_characters_secret_key
GOOGLE_GENAI_API_KEY=your_gemini_api_key
FRONTEND_ORIGIN=http://localhost:5173
GOOGLE_GENAI_MODEL=gemini-3.5-flash-lite
```

#### Frontend (`frontend/.env`)

```env
VITE_API_URL=http://localhost:5000
```

### 2. Install Dependencies

```bash
# Backend
cd Backend
npm install

# Frontend
cd ../frontend
npm install
```

### 3. Run Locally

```bash
# In Backend directory
npm run dev

# In frontend directory
npm run dev
```

---

## Verification & Quality Commands

```bash
# Backend smoke tests
cd Backend
npm test

# Frontend linting (0 warnings, 0 errors)
cd frontend
npm run lint

# Frontend production build
cd frontend
npm run build
```

---

## Production Deployment Checklist

1. Configure strong, random `JWT_SECRET` (at least 32 characters).
2. Set `NODE_ENV=production`.
3. Set `FRONTEND_ORIGIN` to your production frontend URL for CORS.
4. Ensure headless Chrome dependencies are installed or use the provided Docker container.
5. Provide verified MongoDB Atlas URI and Google Gemini API key in production environment variables.
