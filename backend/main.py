import os
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from backend.config import settings
from backend.routers import projects, documents, chat, evaluation, ai_board, rag_metrics
from backend.services.supabase_service import supabase_service

app = FastAPI(
    title="ProjectLens AI API",
    description="Backend API for AI Project Evaluation and RAG Assistant",
    version="1.0.0"
)

# Enable permissive CORS for frontend Vite development & production
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Include Routers
app.include_router(projects.router)
app.include_router(documents.router)
app.include_router(chat.router)
app.include_router(evaluation.router)
app.include_router(ai_board.router)
app.include_router(rag_metrics.router)

@app.on_event("startup")
def on_startup():
    print("ProjectLens AI Backend starting up...")
    try:
        # Check if demo project exists, if not, auto-seed it
        existing = supabase_service.get_projects()
        if not existing:
            print("Auto-seeding CivicLens AI demo project...")
            projects.seed_demo_project()
            print("Demo project seeded successfully.")
    except Exception as e:
        print(f"Startup initialization note: {e}")

@app.get("/")
def root():
    return {
        "app": "ProjectLens AI",
        "version": "1.0.0",
        "status": "online",
        "docs_url": "/docs"
    }

@app.get("/api/health")
def health_check():
    return {
        "status": "healthy",
        "supabase_url": settings.SUPABASE_URL,
        "gemini_model": "gemini-3.6-flash",
        "embedding_model": "models/gemini-embedding-001"
    }

if __name__ == "__main__":
    import uvicorn
    uvicorn.run("backend.main:app", host="0.0.0.0", port=settings.PORT, reload=True)
