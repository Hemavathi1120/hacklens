import uuid
from typing import List, Dict, Any, Optional
from fastapi import APIRouter, HTTPException, Depends
from pydantic import BaseModel
from backend.services.supabase_service import supabase_service
from backend.services.gemini_service import gemini_service

router = APIRouter(prefix="/api", tags=["projects"])

class ProjectCreateRequest(BaseModel):
    name: str
    description: Optional[str] = ""
    problem_statement: Optional[str] = ""
    initial_idea: Optional[str] = ""
    target_users: Optional[List[str]] = []
    technologies: Optional[List[str]] = []
    constraints: Optional[List[str]] = []
    requirements: Optional[List[Dict[str, Any]]] = []
    user_id: Optional[str] = "demo-user"

class ProjectUpdateRequest(BaseModel):
    name: Optional[str] = None
    description: Optional[str] = None
    problem_statement: Optional[str] = None
    initial_idea: Optional[str] = None
    target_users: Optional[List[str]] = None
    technologies: Optional[List[str]] = None
    constraints: Optional[List[str]] = None
    requirements: Optional[List[Dict[str, Any]]] = None
    status: Optional[str] = None
    overall_score: Optional[float] = None

class ImproveProblemRequest(BaseModel):
    problem_statement: str

class ImproveIdeaRequest(BaseModel):
    initial_idea: str
    problem_statement: Optional[str] = ""

@router.get("/projects")
def list_projects(user_id: Optional[str] = None):
    return supabase_service.get_projects(user_id)

@router.post("/projects")
def create_project(req: ProjectCreateRequest):
    project_data = req.model_dump()
    saved = supabase_service.save_project(project_data)
    return saved

@router.get("/projects/{project_id}")
def get_project(project_id: str):
    project = supabase_service.get_project(project_id)
    if not project:
        raise HTTPException(status_code=404, detail="Project not found")
    return project

@router.put("/projects/{project_id}")
def update_project(project_id: str, req: ProjectUpdateRequest):
    existing = supabase_service.get_project(project_id)
    if not existing:
        raise HTTPException(status_code=404, detail="Project not found")
    
    update_data = req.model_dump(exclude_unset=True)
    merged = {**existing, **update_data}
    saved = supabase_service.save_project(merged)
    return saved

@router.delete("/projects/{project_id}")
def delete_project(project_id: str):
    success = supabase_service.delete_project(project_id)
    return {"success": success, "id": project_id}

@router.post("/ai/improve-problem")
def improve_problem(req: ImproveProblemRequest):
    if not req.problem_statement or len(req.problem_statement.strip()) < 5:
        raise HTTPException(status_code=400, detail="Problem statement too short")
    result = gemini_service.improve_problem_statement(req.problem_statement)
    return result

@router.post("/ai/improve-idea")
def improve_idea(req: ImproveIdeaRequest):
    if not req.initial_idea or len(req.initial_idea.strip()) < 5:
        raise HTTPException(status_code=400, detail="Initial idea too short")
    result = gemini_service.improve_initial_idea(req.initial_idea, req.problem_statement)
    return result

@router.post("/demo/seed")
def seed_demo_project():
    """Seeds the official CivicLens AI demo project with complete data."""
    demo_id = "demo-civiclens-ai-001"
    
    # 1. Project Info
    project_data = {
        "id": demo_id,
        "user_id": "demo-user",
        "name": "CivicLens AI",
        "description": "Government Policy Intelligence & Public Service RAG Assistant",
        "problem_statement": "Government regulations, civic welfare schemes, and public compliance policies are dispersed across thousands of disconnected PDF manuals and municipal portals, making it exceedingly difficult for citizens and small businesses to find accurate, current, and actionable guidance.",
        "initial_idea": "An enterprise-grade, evidence-grounded RAG intelligence assistant that indexes verified civic documentation, synthesizes plain-language answers, cites exact statutory sections and pages, and flags outdated policy circulars.",
        "target_users": ["Citizens navigating public benefits", "Small business owners seeking compliance", "Municipal caseworkers & legal aids"],
        "technologies": ["React.js", "Python FastAPI", "Google Gemini 3.6", "Supabase pgvector", "Tailwind CSS"],
        "constraints": ["Zero hallucination tolerance on legal statutes", "Sub-2s response latency", "Strict data privacy under GDPR/CCPA"],
        "status": "evaluated",
        "overall_score": 86.5,
        "requirements": [
            {"category": "functional", "requirement": "Multi-document PDF & statutory circular parsing with page-level section tracking.", "priority": "HIGH", "status": "implemented"},
            {"category": "functional", "requirement": "Real-time RAG query engine citing exact source documents and page numbers.", "priority": "HIGH", "status": "implemented"},
            {"category": "technical", "requirement": "Supabase PostgreSQL with pgvector for 3072-dimensional embedding similarity search.", "priority": "HIGH", "status": "implemented"},
            {"category": "technical", "requirement": "Prompt injection defense preventing malicious document overrides.", "priority": "HIGH", "status": "implemented"},
            {"category": "target_users", "requirement": "Accessible and responsive web UI for mobile and desktop citizens.", "priority": "MEDIUM", "status": "implemented"},
            {"category": "constraints", "requirement": "Private document storage with strict Row Level Security isolation.", "priority": "HIGH", "status": "implemented"}
        ]
    }
    project = supabase_service.save_project(project_data)

    # 2. Demo Documents
    doc1_id = "demo-doc-001"
    doc1_text = """
    # CivicLens AI: Municipal Policy & Public Welfare Architecture
    
    ## Section 1: Executive Overview & Problem Context
    Public sector information architecture suffers from extreme fragmentation. Over 45,000 distinct civic portals and municipal ordinances exist across regional jurisdictions. Citizens frequently fail to claim legitimate social welfare benefits due to dense administrative jargon and inability to cross-reference multi-departmental mandates.
    
    ## Section 2: Statutory Knowledge Retrieval Architecture
    CivicLens AI implements a hybrid retrieval framework:
    1. Document Parser: Ingests PDF regulations, PPTX administrative decks, and DOCX public circulars.
    2. Vector Pipeline: Decomposes statutory text into 800-character semantic chunks with 150-character overlap. Embeddings are generated using Gemini Embedding models.
    3. Grounding & Anti-Hallucination: Responses must strictly cite statutory chapter, section title, and page index.
    
    ## Section 3: Security & Privacy Governance
    All uploaded documents are isolated by project_id and user_id using Supabase Row Level Security (RLS). Prompts are sanitised to eliminate prompt injection risks.
    """
    
    supabase_service.save_document({
        "id": doc1_id,
        "project_id": demo_id,
        "user_id": "demo-user",
        "filename": "CivicLens_System_Architecture_Whitepaper.pdf",
        "file_type": "application/pdf",
        "file_size": 248500,
        "storage_path": "demo/CivicLens_System_Architecture_Whitepaper.pdf",
        "processing_status": "indexed",
        "document_version": 1,
        "summary": "System architecture whitepaper detailing municipal policy retrieval, chunking pipeline, and RLS security governance."
    })

    # Chunks for doc 1
    chunks = [
        {
            "id": f"{doc1_id}-chunk-1",
            "document_id": doc1_id,
            "project_id": demo_id,
            "chunk_index": 0,
            "page_number": 1,
            "section_title": "Executive Overview & Problem Context",
            "content": "Public sector information architecture suffers from extreme fragmentation. Over 45,000 distinct civic portals and municipal ordinances exist across regional jurisdictions. Citizens frequently fail to claim legitimate social welfare benefits due to dense administrative jargon.",
            "embedding": gemini_service.generate_embedding("Public sector information architecture fragmentation civic portals welfare benefits"),
            "metadata": {"doc_name": "CivicLens_System_Architecture_Whitepaper.pdf"}
        },
        {
            "id": f"{doc1_id}-chunk-2",
            "document_id": doc1_id,
            "project_id": demo_id,
            "chunk_index": 1,
            "page_number": 2,
            "section_title": "Statutory Knowledge Retrieval Architecture",
            "content": "CivicLens AI implements a hybrid retrieval framework: Document parser ingest PDF/DOCX/PPTX, vector pipeline with Gemini embeddings, and strict grounding where answers must cite statutory chapter, section, and page index.",
            "embedding": gemini_service.generate_embedding("CivicLens AI hybrid retrieval framework document parser vector pipeline gemini embeddings citations"),
            "metadata": {"doc_name": "CivicLens_System_Architecture_Whitepaper.pdf"}
        }
    ]
    supabase_service.save_chunks(chunks)

    # 3. Demo Evaluation
    eval_id = "demo-eval-001"
    eval_data = {
        "id": eval_id,
        "project_id": demo_id,
        "user_id": "demo-user",
        "overall_score": 86.5,
        "status_label": "Strong Concept",
        "problem_score": 8.8,
        "innovation_score": 8.2,
        "technical_score": 9.1,
        "user_value_score": 8.7,
        "requirements_score": 7.4,
        "scalability_score": 8.0,
        "security_score": 8.4,
        "rag_quality_score": 8.9,
        "feasibility_score": 8.5,
        "summary": "CivicLens AI addresses a critically high-value civic problem with high technical rigor. The grounding strategy and citation integrity eliminate legal hallucination risks, while the Supabase RLS design guarantees multi-tenant security.",
        "strengths": [
            "Crystal-clear problem definition solving a multi-billion dollar public accessibility gap.",
            "Rigorous RAG architecture with verified citations preventing legal hallucinations.",
            "Robust multi-format document parser handling PDF, DOCX, and PPTX with page-level tracking.",
            "Strict tenant isolation with Supabase RLS and server-side Gemini execution."
        ],
        "weaknesses": [
            "Missing automated document expiration/effective-date filtering when municipal circulars are superseded.",
            "High reliance on LLM inference latency during multi-page document synthesis.",
            "Needs multi-language support (Spanish, Hindi, French) for non-native speaking citizens."
        ],
        "missing_requirements": [
            "Document versioning with effective-date filtering.",
            "Automated fallback to human legal caseworker when policy ambiguity exceeds threshold.",
            "Audit log trail for compliance queries."
        ],
        "risks": [
            {"type": "Product", "risk": "Citizens acting upon outdated municipal circulars", "severity": "HIGH", "mitigation": "Add effective-date metadata and circular expiration warnings."},
            {"type": "Technical", "risk": "Latency spikes during high-volume document ingestion", "severity": "MEDIUM", "mitigation": "Use asynchronous worker queues for document chunking."},
            {"type": "Security", "risk": "Prompt injection via adversarial uploaded civic documents", "severity": "LOW", "mitigation": "System prompt strictly treats document chunks as read-only data."}
        ],
        "improvements": [
            {"priority": "HIGH", "category": "RAG", "issue": "Superseded Policy Detection", "why_it_matters": "Prevents giving obsolete policy advice to citizens", "recommended_action": "Add circular publication date filtering and deprecation flags."},
            {"priority": "MEDIUM", "category": "UX", "issue": "Multi-Lingual Citizen Support", "why_it_matters": "Expands accessible reach to underserved demographics", "recommended_action": "Enable Gemini automatic translation in RAG synthesis."},
            {"priority": "MEDIUM", "category": "Architecture", "issue": "Caseworker Escalation Flow", "why_it_matters": "Handles complex unresolvable legal disputes", "recommended_action": "Add an 'Escalate to Municipal Officer' action button."}
        ],
        "judge_feedback": {
            "judge_score": 88,
            "verdict": "Exceptional problem-solution fit with genuine public sector impact. Real-world commercialization and civic adoption potential is very high.",
            "potential_questions": [
                "How does the system handle conflicting municipal policies across state and county levels?",
                "What is your strategy for processing non-digitized, scanned historic policy circulars?",
                "What is the operational cost per 1,000 citizen queries using Gemini embeddings?"
            ],
            "potential_criticisms": [
                "Need benchmarked retrieval accuracy metrics across complex legal clauses."
            ],
            "presentation_tips": [
                "Open your pitch with a 30-second story of a citizen losing welfare benefits due to bureaucratic fragmentation.",
                "Demonstrate the live citation preview showing exact page numbers and statutory chapters."
            ]
        }
    }
    supabase_service.save_evaluation(eval_data)

    # 4. Demo AI Board Items (7 Columns)
    cards = gemini_service.generate_ai_board_cards(project_data, eval_data)
    for c in cards:
        c["project_id"] = demo_id
        c["user_id"] = "demo-user"
        supabase_service.save_board_item(c)

    # 5. Demo Chat Session & Messages
    session = supabase_service.create_chat_session(demo_id, user_id="demo-user", title="Initial Project & RAG Analysis")
    supabase_service.save_chat_message(
        session_id=session["id"],
        role="user",
        content="What is the main problem CivicLens AI is solving and how does it prevent hallucinations?",
        user_id="demo-user"
    )
    supabase_service.save_chat_message(
        session_id=session["id"],
        role="assistant",
        content="**ANSWER**\nCivicLens AI solves the extreme fragmentation of public sector regulations across over 45,000 municipal portals, which prevents citizens and small businesses from discovering and claiming legitimate welfare schemes.\n\n**KEY OBSERVATIONS**\n• The platform uses a hybrid RAG pipeline with Gemini embeddings and 3072-dimensional vector indexing.\n• Hallucination is prevented by enforcing strict page-level and statutory-section citations.\n• Tenant isolation is guaranteed via Supabase Row Level Security.\n\n**RECOMMENDATIONS**\n• Implement effective-date filtering to automatically flag superseded policy circulars.\n• Introduce multi-lingual response synthesis for immigrant and minority citizen populations.",
        citations=[
            {
                "source_id": 1,
                "filename": "CivicLens_System_Architecture_Whitepaper.pdf",
                "page_number": 1,
                "section_title": "Executive Overview & Problem Context",
                "snippet": "Public sector information architecture suffers from extreme fragmentation. Over 45,000 distinct civic portals and municipal ordinances exist..."
            },
            {
                "source_id": 2,
                "filename": "CivicLens_System_Architecture_Whitepaper.pdf",
                "page_number": 2,
                "section_title": "Statutory Knowledge Retrieval Architecture",
                "snippet": "CivicLens AI implements a hybrid retrieval framework... Grounding & Anti-Hallucination: Responses must strictly cite statutory chapter, section title, and page index."
            }
        ],
        user_id="demo-user"
    )

    return {"success": True, "project_id": demo_id, "project": supabase_service.get_project(demo_id)}
