# 🧰 Solo Suite

> A unified productivity platform built for student entrepreneurs and solo creators.

---

## 🧠 Project Description

**Solo Suite** is a compact digital toolkit designed to streamline the daily operations of solo creators and student entrepreneurs. It brings together invoicing, portfolio management, task boards, and AI-driven planning in one seamless platform. Whether you’re finding clients or managing projects, Solo Suite helps you do it smarter — not harder.

### 💡 How We Solve the Problem

- 🔄 Eliminates the need for multiple disjointed tools (e.g., Trello, Google Docs, invoicing apps).
- 🧭 Consolidates core workflows in a single interface.
- 🕒 Saves time with automation and intelligent scheduling.
- 🌐 Enables providers to find new clients and manage requests effectively.

---

## 🚀 Features & Innovations

- **🧠 AI Schedule Optimizer** – Automatically generates and adjusts weekly plans and to-dos.
- **⏱️ Smart Task Estimator** – Predicts task durations and flags urgency with color zones.
- **📥 Client Request Analyzer** – Analyzes and categorizes client needs.
- **📊 Productivity Insights** – AI-powered summaries and personalized productivity suggestions.

---

## 🛠 Tech Stack

### Frontend
- React (with TypeScript)
- Next.js (App Router, Client & Server Components)
- Tailwind CSS
- ShadCN UI

### Backend
- Supabase (Auth, Database, API, File Storage)
- PostgreSQL (via Supabase)

### AI Features
- Gemini APIs (for intelligent text analysis, task/todo generation)

---

## ⚙️ Setup Instructions

> Basic setup instructions (temporary – to be expanded as development continues)

1. **Clone the repo**  
   ```bash
   git clone https://github.com/HackSomeThorns-2025/Dreadful_APIs.git
   cd Dreadful_APIs
   ```

2. **Install dependencies**  
   ```bash
   npm install
   ```

3. **Run the development server**  
   ```bash
   npm run dev
   ```

4. **(Optional)** Set up your Supabase project and environment variables.

> More detailed setup documentation will be added soon.

---

## 📦 Dependencies

> A minimal list for now (auto-generated in package.json, to be finalized):

- `react`, `next`, `typescript`, `tailwindcss`  
- `@shadcn/ui`  
- `@supabase/supabase-js`  
- `lucide-react`  
- `dotenv` (for local env config)

---

## 👥 Team Details

**Team Name:** Dreadful APIs  
A duo of tech enthusiasts building meaningful productivity tools.

| Name               | Stream             | Registration No. |
|--------------------|---------------------|-------------------|
| Kashyap Datta Dhondu | Computer Science     | 230905392         |
| Manas Goel         | Data Science        | 230968160         |

---

## 🔁 Workflow Explanation

```mermaid
graph TD
    A[Client/Provider Login] --> B[Role-Based Dashboard]
    B --> C[Smart Taskboard]
    B --> D[Portfolio Showcase]
    B --> E[Client Requests]
    E --> F[Request Analyzer (AI)]
    C --> G[AI Schedule Optimizer]
    G --> H[Weekly Plan / Todos]
```

---

## 🔗 Important Links

- [Supabase](https://supabase.com/)
- [Next.js](https://nextjs.org/)
- [Tailwind CSS](https://tailwindcss.com/)
- [Gemini API](https://ai.google.dev/gemini-api)
- [ShadCN UI](https://ui.shadcn.com/)

---

## ✅ Current Status

- Core layout and routing set up ✅  
- Supabase auth integration in progress ⏳  
- Taskboard, dashboard and client request module – under development 🛠  
- AI modules integration planned ⚙️

---

> _This README will evolve as the project grows. Stay tuned!_
