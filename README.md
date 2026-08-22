# 🌟 PROJECTLENS AI — AI Project Evaluation & RAG Assistant

> **Turn your project idea into a stronger, smarter solution.**

**ProjectLens AI** is an enterprise-grade AI project evaluation and RAG assistant platform. It allows developers, students, and product teams to formulate problem statements, refine solution ideas, upload multi-format project documentation (PDF, PPT, DOCX, TXT, MD), query a grounded knowledge base with verified citations, generate a 12-category AI evaluation, simulate Hackathon Judge critiques, and execute action plans through an interactive 7-column AI Kanban Board.

---

## 🚀 Key Features

* **🔐 Authentication & Instant Demo**:
  * Google & GitHub OAuth via Supabase Authentication.
  * 1-Click Demo Login pre-loading **CivicLens AI** with documentation, 86/100 evaluation score, and AI Board.
* **📝 5-Step Project Wizard with Gemini Assistants**:
  * Step 01: Problem statement with character count + *"Need help defining the problem?"* AI assistant.
  * Step 02: Initial solution idea with *"Improve my idea"* architecture assistant.
  * Step 03: Structured requirements builder (Functional, Technical, Target Users, Constraints, Tech stack).
  * Step 04: Multi-format document upload zone (PDF, PPT, PPTX, DOC, DOCX, TXT, MD) with live indexing status.
  * Step 05: Project summary preview + 1-click AI Evaluation launch.
* **📚 Grounded RAG Pipeline & Multi-Format Ingestion**:
  * Semantic text extraction across PDF, DOCX, PPTX, TXT, and Markdown.
  * 800-character chunking preserving page numbers and section headers.
  * 3072-dimensional vector embeddings with Gemini embedding models.
  * Grounded Chatbot citing exact document name, page number, and highlighted excerpt with zero hallucination.
* **🏆 12-Category AI Evaluation & Hackathon Judge Mode**:
  * 12 scoring dimensions (Problem Clarity, Problem Importance, Solution Quality, Innovation, Technical Feasibility, User Value, Requirement Completeness, Scalability, Security, RAG Quality, Implementation Feasibility, Overall Strength).
  * Overall Score Ring (0–100), *"What's Strong"*, *"What's Missing"*, and Risk Matrix.
  * Prioritized Improvement Action Plan (`HIGH`, `MEDIUM`, `LOW`).
  * **"Judge My Project"** Hackathon Judge Mode (Score, verdict, tough questions, criticisms, presentation tips).
  * **"Compare Evaluations"** delta diff tracking iterative score changes (`+14.0 pts`).
* **📋 7-Column Interactive AI Kanban Board**:
  * Columns: `PROBLEM`, `IDEA`, `REQUIREMENTS`, `AI INSIGHTS`, `RISKS`, `IMPROVEMENTS`, `NEXT STEPS`.
  * Move cards across columns, pin cards, toggle completion, edit text, and synchronize directly from AI evaluations.
* **📊 RAG Quality Observability Dashboard**:
  * Developer panel monitoring indexed documents, total chunks, vector health, citation accuracy rate (`100%`), and faithfulness verification.

---

## 🛠️ Technology Stack

* **Frontend**: React.js (Vite), JavaScript, Tailwind CSS, Lucide React, React Router.
* **Backend**: Python (FastAPI, Uvicorn), `google-genai` (Gemini 3.6 Flash, `gemini-embedding-001`), `pypdf`, `python-docx`, `python-pptx`.
* **Database & Storage**: Supabase (PostgreSQL with `pgvector`, Supabase Storage for `project-documents`, Supabase Auth with Row Level Security).

---

## 📦 Getting Started

### 1. Prerequisites
* **Node.js** (v18+)
* **Python** (v3.10+)

### 2. Environment Configuration
Copy `.env.example` into `backend/.env` and `frontend/.env`:

```bash
# In frontend/.env
VITE_SUPABASE_URL=https://your-project.supabase.co
VITE_SUPABASE_PUBLISHABLE_KEY=your_supabase_publishable_key
VITE_API_BASE_URL=http://localhost:8000

# In backend/.env
SUPABASE_URL=https://your-project.supabase.co
SUPABASE_PUBLISHABLE_KEY=your_supabase_publishable_key
SUPABASE_SECRET_KEY=your_supabase_secret_key
GEMINI_API_KEY=your_gemini_api_key
PORT=8000
```

### 3. Install Dependencies & Run

```bash
# Install backend packages
pip install -r backend/requirements.txt # or: pip install supabase fastapi uvicorn google-genai python-multipart pypdf python-docx python-pptx tiktoken pydantic-settings python-dotenv

# Install frontend packages
cd frontend && npm install && cd ..

# Launch both Frontend & Backend concurrently via Node.js
node start.js
# Or
npm start
```

### 4. Open in Browser
* **Frontend Application**: `http://localhost:5173/`
* **Backend API Docs (Swagger UI)**: `http://localhost:8000/docs`

---

## 📜 Supabase Database Schema
To set up all PostgreSQL tables, pgvector vector indices, and Row Level Security policies on Supabase, execute the SQL queries from `supabase_schema.sql` in your Supabase SQL Editor.

---

## 📄 License
MIT License © 2026 PROJECTLENS AI.
