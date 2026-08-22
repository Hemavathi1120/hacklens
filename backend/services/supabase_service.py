import json
import math
import os
import re
import sqlite3
import uuid
from datetime import datetime
from pathlib import Path
from typing import List, Dict, Any, Optional
from supabase import create_client, Client
from backend.config import settings

class SupabaseService:
    def __init__(self):
        self.url = settings.SUPABASE_URL
        self.key = settings.SUPABASE_SECRET_KEY
        self.publishable_key = settings.SUPABASE_PUBLISHABLE_KEY
        self.client: Optional[Client] = None
        self.storage_bucket = settings.STORAGE_BUCKET
        
        # Local SQLite database path for guaranteed data persistence & instant speed
        self.db_path = Path(__file__).resolve().parent.parent / "data" / "projectlens.db"
        self.db_path.parent.mkdir(parents=True, exist_ok=True)
        
        # Init SQLite tables
        self._init_sqlite()

        # Connect to Supabase
        try:
            self.client = create_client(self.url, self.key)
            print(f"Supabase client initialized: {self.url}")
        except Exception as e:
            print(f"Supabase client initialization warning: {e}")

    def _init_sqlite(self):
        with sqlite3.connect(self.db_path) as conn:
            c = conn.cursor()
            c.execute("""
                CREATE TABLE IF NOT EXISTS projects (
                    id TEXT PRIMARY KEY,
                    user_id TEXT,
                    name TEXT NOT NULL,
                    description TEXT,
                    problem_statement TEXT,
                    initial_idea TEXT,
                    target_users TEXT,
                    technologies TEXT,
                    constraints TEXT,
                    status TEXT DEFAULT 'draft',
                    overall_score REAL DEFAULT 0,
                    created_at TEXT,
                    updated_at TEXT
                )
            """)
            c.execute("""
                CREATE TABLE IF NOT EXISTS project_requirements (
                    id TEXT PRIMARY KEY,
                    project_id TEXT,
                    category TEXT,
                    requirement TEXT,
                    priority TEXT DEFAULT 'MEDIUM',
                    status TEXT DEFAULT 'pending',
                    created_at TEXT
                )
            """)
            c.execute("""
                CREATE TABLE IF NOT EXISTS documents (
                    id TEXT PRIMARY KEY,
                    project_id TEXT,
                    user_id TEXT,
                    filename TEXT,
                    file_type TEXT,
                    file_size INTEGER,
                    storage_path TEXT,
                    processing_status TEXT,
                    document_version INTEGER DEFAULT 1,
                    summary TEXT,
                    created_at TEXT,
                    updated_at TEXT
                )
            """)
            c.execute("""
                CREATE TABLE IF NOT EXISTS document_chunks (
                    id TEXT PRIMARY KEY,
                    document_id TEXT,
                    project_id TEXT,
                    chunk_index INTEGER,
                    content TEXT,
                    page_number INTEGER,
                    section_title TEXT,
                    embedding TEXT,
                    metadata TEXT,
                    created_at TEXT
                )
            """)
            c.execute("""
                CREATE TABLE IF NOT EXISTS evaluations (
                    id TEXT PRIMARY KEY,
                    project_id TEXT,
                    user_id TEXT,
                    overall_score REAL,
                    status_label TEXT,
                    problem_score REAL,
                    innovation_score REAL,
                    technical_score REAL,
                    user_value_score REAL,
                    requirements_score REAL,
                    scalability_score REAL,
                    security_score REAL,
                    rag_quality_score REAL,
                    feasibility_score REAL,
                    summary TEXT,
                    strengths TEXT,
                    weaknesses TEXT,
                    risks TEXT,
                    improvements TEXT,
                    judge_feedback TEXT,
                    created_at TEXT
                )
            """)
            c.execute("""
                CREATE TABLE IF NOT EXISTS ai_board_items (
                    id TEXT PRIMARY KEY,
                    project_id TEXT,
                    user_id TEXT,
                    column_name TEXT,
                    title TEXT,
                    description TEXT,
                    priority TEXT,
                    source_type TEXT,
                    source_id TEXT,
                    completed INTEGER DEFAULT 0,
                    is_pinned INTEGER DEFAULT 0,
                    position INTEGER DEFAULT 0,
                    created_at TEXT,
                    updated_at TEXT
                )
            """)
            c.execute("""
                CREATE TABLE IF NOT EXISTS chat_sessions (
                    id TEXT PRIMARY KEY,
                    project_id TEXT,
                    user_id TEXT,
                    title TEXT,
                    created_at TEXT,
                    updated_at TEXT
                )
            """)
            c.execute("""
                CREATE TABLE IF NOT EXISTS chat_messages (
                    id TEXT PRIMARY KEY,
                    session_id TEXT,
                    user_id TEXT,
                    role TEXT,
                    content TEXT,
                    citations TEXT,
                    created_at TEXT
                )
            """)
            conn.commit()

    # =========================================================================
    # PROJECTS
    # =========================================================================
    def get_projects(self, user_id: Optional[str] = None) -> List[Dict[str, Any]]:
        if not user_id:
            return []
        
        projects = []
        with sqlite3.connect(self.db_path) as conn:
            conn.row_factory = sqlite3.Row
            c = conn.cursor()
            c.execute("SELECT * FROM projects WHERE user_id = ? ORDER BY updated_at DESC", (user_id,))
            rows = c.fetchall()
            for r in rows:
                p = dict(r)
                p["target_users"] = json.loads(p.get("target_users") or "[]")
                p["technologies"] = json.loads(p.get("technologies") or "[]")
                p["constraints"] = json.loads(p.get("constraints") or "[]")
                
                # Fetch doc count
                c_docs = conn.cursor()
                c_docs.execute("SELECT COUNT(*) FROM documents WHERE project_id = ?", (p["id"],))
                p["document_count"] = c_docs.fetchone()[0]
                projects.append(p)
        return projects

    def get_project(self, project_id: str) -> Optional[Dict[str, Any]]:
        with sqlite3.connect(self.db_path) as conn:
            conn.row_factory = sqlite3.Row
            c = conn.cursor()
            c.execute("SELECT * FROM projects WHERE id = ?", (project_id,))
            row = c.fetchone()
            if not row:
                return None
            p = dict(row)
            p["target_users"] = json.loads(p.get("target_users") or "[]")
            p["technologies"] = json.loads(p.get("technologies") or "[]")
            p["constraints"] = json.loads(p.get("constraints") or "[]")
            
            c_docs = conn.cursor()
            c_docs.execute("SELECT COUNT(*) FROM documents WHERE project_id = ?", (p["id"],))
            p["document_count"] = c_docs.fetchone()[0]
            
            # Fetch requirements
            c_reqs = conn.cursor()
            c_reqs.execute("SELECT * FROM project_requirements WHERE project_id = ? ORDER BY created_at ASC", (project_id,))
            p["requirements"] = [dict(r) for r in c_reqs.fetchall()]
            return p

    def save_project(self, project_data: Dict[str, Any]) -> Dict[str, Any]:
        p_id = project_data.get("id") or str(uuid.uuid4())
        now = datetime.utcnow().isoformat()
        
        target_users = json.dumps(project_data.get("target_users", []))
        technologies = json.dumps(project_data.get("technologies", []))
        constraints = json.dumps(project_data.get("constraints", []))

        with sqlite3.connect(self.db_path) as conn:
            c = conn.cursor()
            c.execute("""
                INSERT INTO projects (id, user_id, name, description, problem_statement, initial_idea, target_users, technologies, constraints, status, overall_score, created_at, updated_at)
                VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
                ON CONFLICT(id) DO UPDATE SET
                    name=excluded.name,
                    description=excluded.description,
                    problem_statement=excluded.problem_statement,
                    initial_idea=excluded.initial_idea,
                    target_users=excluded.target_users,
                    technologies=excluded.technologies,
                    constraints=excluded.constraints,
                    status=excluded.status,
                    overall_score=excluded.overall_score,
                    updated_at=excluded.updated_at
            """, (
                p_id,
                project_data.get("user_id", "demo-user"),
                project_data.get("name", "Untitled Project"),
                project_data.get("description", ""),
                project_data.get("problem_statement", ""),
                project_data.get("initial_idea", ""),
                target_users,
                technologies,
                constraints,
                project_data.get("status", "draft"),
                project_data.get("overall_score", 0),
                project_data.get("created_at", now),
                now
            ))
            
            # Save requirements if provided
            reqs = project_data.get("requirements", [])
            for req in reqs:
                r_id = req.get("id") or str(uuid.uuid4())
                c.execute("""
                    INSERT INTO project_requirements (id, project_id, category, requirement, priority, status, created_at)
                    VALUES (?, ?, ?, ?, ?, ?, ?)
                    ON CONFLICT(id) DO UPDATE SET
                        category=excluded.category,
                        requirement=excluded.requirement,
                        priority=excluded.priority,
                        status=excluded.status
                """, (
                    r_id,
                    p_id,
                    req.get("category", "functional"),
                    req.get("requirement", ""),
                    req.get("priority", "MEDIUM"),
                    req.get("status", "pending"),
                    req.get("created_at", now)
                ))
            conn.commit()

        # Attempt Supabase sync
        if self.client:
            try:
                self.client.table("projects").upsert({
                    "id": p_id,
                    "user_id": project_data.get("user_id", "demo-user"),
                    "name": project_data.get("name", "Untitled Project"),
                    "description": project_data.get("description", ""),
                    "problem_statement": project_data.get("problem_statement", ""),
                    "initial_idea": project_data.get("initial_idea", ""),
                    "target_users": project_data.get("target_users", []),
                    "technologies": project_data.get("technologies", []),
                    "constraints": project_data.get("constraints", []),
                    "status": project_data.get("status", "draft"),
                    "overall_score": project_data.get("overall_score", 0),
                    "updated_at": now
                }).execute()
            except Exception:
                pass

        return self.get_project(p_id)

    def delete_project(self, project_id: str) -> bool:
        with sqlite3.connect(self.db_path) as conn:
            c = conn.cursor()
            c.execute("DELETE FROM projects WHERE id = ?", (project_id,))
            c.execute("DELETE FROM project_requirements WHERE project_id = ?", (project_id,))
            c.execute("DELETE FROM documents WHERE project_id = ?", (project_id,))
            c.execute("DELETE FROM document_chunks WHERE project_id = ?", (project_id,))
            c.execute("DELETE FROM evaluations WHERE project_id = ?", (project_id,))
            c.execute("DELETE FROM ai_board_items WHERE project_id = ?", (project_id,))
            c.execute("DELETE FROM chat_sessions WHERE project_id = ?", (project_id,))
            conn.commit()
        return True

    # =========================================================================
    # DOCUMENTS & CHUNKS
    # =========================================================================
    def save_document(self, doc_data: Dict[str, Any]) -> Dict[str, Any]:
        d_id = doc_data.get("id") or str(uuid.uuid4())
        now = datetime.utcnow().isoformat()
        with sqlite3.connect(self.db_path) as conn:
            c = conn.cursor()
            c.execute("""
                INSERT INTO documents (id, project_id, user_id, filename, file_type, file_size, storage_path, processing_status, document_version, summary, created_at, updated_at)
                VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
                ON CONFLICT(id) DO UPDATE SET
                    processing_status=excluded.processing_status,
                    summary=excluded.summary,
                    updated_at=excluded.updated_at
            """, (
                d_id,
                doc_data.get("project_id"),
                doc_data.get("user_id", "demo-user"),
                doc_data.get("filename"),
                doc_data.get("file_type"),
                doc_data.get("file_size", 0),
                doc_data.get("storage_path", ""),
                doc_data.get("processing_status", "pending"),
                doc_data.get("document_version", 1),
                doc_data.get("summary", ""),
                doc_data.get("created_at", now),
                now
            ))
            conn.commit()
        return self.get_document(d_id)

    def get_document(self, doc_id: str) -> Optional[Dict[str, Any]]:
        with sqlite3.connect(self.db_path) as conn:
            conn.row_factory = sqlite3.Row
            c = conn.cursor()
            c.execute("SELECT * FROM documents WHERE id = ?", (doc_id,))
            row = c.fetchone()
            if not row:
                return None
            doc = dict(row)
            # Fetch chunks count
            c_cnt = conn.cursor()
            c_cnt.execute("SELECT COUNT(*) FROM document_chunks WHERE document_id = ?", (doc_id,))
            doc["chunk_count"] = c_cnt.fetchone()[0]
            return doc

    def get_project_documents(self, project_id: str) -> List[Dict[str, Any]]:
        docs = []
        with sqlite3.connect(self.db_path) as conn:
            conn.row_factory = sqlite3.Row
            c = conn.cursor()
            c.execute("SELECT * FROM documents WHERE project_id = ? ORDER BY created_at DESC", (project_id,))
            for r in c.fetchall():
                d = dict(r)
                c_cnt = conn.cursor()
                c_cnt.execute("SELECT COUNT(*) FROM document_chunks WHERE document_id = ?", (d["id"],))
                d["chunk_count"] = c_cnt.fetchone()[0]
                docs.append(d)
        return docs

    def delete_document(self, doc_id: str) -> bool:
        with sqlite3.connect(self.db_path) as conn:
            c = conn.cursor()
            c.execute("DELETE FROM documents WHERE id = ?", (doc_id,))
            c.execute("DELETE FROM document_chunks WHERE document_id = ?", (doc_id,))
            conn.commit()
        return True

    def save_chunks(self, chunks: List[Dict[str, Any]]):
        now = datetime.utcnow().isoformat()
        with sqlite3.connect(self.db_path) as conn:
            c = conn.cursor()
            for chunk in chunks:
                c_id = chunk.get("id") or str(uuid.uuid4())
                embedding_str = json.dumps(chunk.get("embedding", []))
                metadata_str = json.dumps(chunk.get("metadata", {}))
                c.execute("""
                    INSERT INTO document_chunks (id, document_id, project_id, chunk_index, content, page_number, section_title, embedding, metadata, created_at)
                    VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
                    ON CONFLICT(id) DO UPDATE SET
                        content=excluded.content,
                        page_number=excluded.page_number,
                        section_title=excluded.section_title,
                        embedding=excluded.embedding,
                        metadata=excluded.metadata
                """, (
                    c_id,
                    chunk.get("document_id"),
                    chunk.get("project_id"),
                    chunk.get("chunk_index", 0),
                    chunk.get("content", ""),
                    chunk.get("page_number", 1),
                    chunk.get("section_title", ""),
                    embedding_str,
                    metadata_str,
                    now
                ))
            conn.commit()

    def get_document_chunks(self, document_id: str) -> List[Dict[str, Any]]:
        chunks = []
        with sqlite3.connect(self.db_path) as conn:
            conn.row_factory = sqlite3.Row
            c = conn.cursor()
            c.execute("SELECT id, document_id, project_id, chunk_index, content, page_number, section_title, metadata, created_at FROM document_chunks WHERE document_id = ? ORDER BY chunk_index ASC", (document_id,))
            for r in c.fetchall():
                ch = dict(r)
                ch["metadata"] = json.loads(ch.get("metadata") or "{}")
                chunks.append(ch)
        return chunks

    def vector_search(self, project_id: str, query_embedding: List[float], raw_query: str = "", top_k: int = 6, similarity_threshold: float = 0.15) -> List[Dict[str, Any]]:
        """
        Calculates hybrid cosine similarity and keyword relevance between query and stored document chunk embeddings for the given project.
        """
        results = []
        query_words = set(re.findall(r'\w+', (raw_query or "").lower()))
        
        with sqlite3.connect(self.db_path) as conn:
            conn.row_factory = sqlite3.Row
            c = conn.cursor()
            c.execute("""
                SELECT dc.*, d.filename 
                FROM document_chunks dc
                JOIN documents d ON dc.document_id = d.id
                WHERE dc.project_id = ?
            """, (project_id,))
            rows = c.fetchall()

            for row in rows:
                content_lower = (row["content"] or "").lower()
                title_lower = (row["section_title"] or "").lower()
                
                # 1. Cosine Vector Similarity
                sim = 0.0
                emb_str = row["embedding"]
                if emb_str and query_embedding and any(query_embedding):
                    emb = json.loads(emb_str)
                    sim = self._cosine_similarity(query_embedding, emb)
                
                # 2. Keyword Overlap Score (0.0 to 1.0)
                kw_score = 0.0
                if query_words:
                    matched_words = sum(1 for w in query_words if w in content_lower or w in title_lower)
                    kw_score = matched_words / max(len(query_words), 1)
                
                # Combined Score
                combined_score = max(sim, kw_score * 0.85, (sim * 0.7 + kw_score * 0.3))
                
                if combined_score >= similarity_threshold or len(rows) <= top_k:
                    item = dict(row)
                    item.pop("embedding", None)
                    item["metadata"] = json.loads(item.get("metadata") or "{}")
                    item["similarity"] = round(combined_score, 4)
                    results.append(item)

        results.sort(key=lambda x: x["similarity"], reverse=True)
        return results[:top_k]

    def _cosine_similarity(self, v1: List[float], v2: List[float]) -> float:
        if not v1 or not v2 or len(v1) != len(v2):
            return 0.0
        dot = sum(a * b for a, b in zip(v1, v2))
        norm_a = math.sqrt(sum(a * a for a in v1))
        norm_b = math.sqrt(sum(b * b for b in v2))
        if norm_a == 0.0 or norm_b == 0.0:
            return 0.0
        return dot / (norm_a * norm_b)

    # =========================================================================
    # EVALUATIONS
    # =========================================================================
    def save_evaluation(self, eval_data: Dict[str, Any]) -> Dict[str, Any]:
        e_id = eval_data.get("id") or str(uuid.uuid4())
        now = datetime.utcnow().isoformat()
        
        strengths = json.dumps(eval_data.get("strengths", []))
        weaknesses = json.dumps(eval_data.get("weaknesses", []))
        risks = json.dumps(eval_data.get("risks", []))
        improvements = json.dumps(eval_data.get("improvements", []))
        judge_feedback = json.dumps(eval_data.get("judge_feedback", {}))

        with sqlite3.connect(self.db_path) as conn:
            c = conn.cursor()
            c.execute("""
                INSERT INTO evaluations (
                    id, project_id, user_id, overall_score, status_label,
                    problem_score, innovation_score, technical_score, user_value_score,
                    requirements_score, scalability_score, security_score, rag_quality_score, feasibility_score,
                    summary, strengths, weaknesses, risks, improvements, judge_feedback, created_at
                )
                VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
                ON CONFLICT(id) DO UPDATE SET
                    overall_score=excluded.overall_score,
                    status_label=excluded.status_label,
                    problem_score=excluded.problem_score,
                    innovation_score=excluded.innovation_score,
                    technical_score=excluded.technical_score,
                    user_value_score=excluded.user_value_score,
                    requirements_score=excluded.requirements_score,
                    scalability_score=excluded.scalability_score,
                    security_score=excluded.security_score,
                    rag_quality_score=excluded.rag_quality_score,
                    feasibility_score=excluded.feasibility_score,
                    summary=excluded.summary,
                    strengths=excluded.strengths,
                    weaknesses=excluded.weaknesses,
                    risks=excluded.risks,
                    improvements=excluded.improvements,
                    judge_feedback=excluded.judge_feedback
            """, (
                e_id,
                eval_data.get("project_id"),
                eval_data.get("user_id", "demo-user"),
                eval_data.get("overall_score", 0),
                eval_data.get("status_label", "Analyzed"),
                eval_data.get("problem_score", 0),
                eval_data.get("innovation_score", 0),
                eval_data.get("technical_score", 0),
                eval_data.get("user_value_score", 0),
                eval_data.get("requirements_score", 0),
                eval_data.get("scalability_score", 0),
                eval_data.get("security_score", 0),
                eval_data.get("rag_quality_score", 0),
                eval_data.get("feasibility_score", 0),
                eval_data.get("summary", ""),
                strengths,
                weaknesses,
                risks,
                improvements,
                judge_feedback,
                now
            ))
            # Also update overall_score & status on project
            c.execute("""
                UPDATE projects 
                SET overall_score = ?, status = 'evaluated', updated_at = ? 
                WHERE id = ?
            """, (eval_data.get("overall_score", 0), now, eval_data.get("project_id")))
            conn.commit()

        return self.get_evaluation(e_id)

    def get_evaluation(self, eval_id: str) -> Optional[Dict[str, Any]]:
        with sqlite3.connect(self.db_path) as conn:
            conn.row_factory = sqlite3.Row
            c = conn.cursor()
            c.execute("SELECT * FROM evaluations WHERE id = ?", (eval_id,))
            row = c.fetchone()
            if not row:
                return None
            res = dict(row)
            res["strengths"] = json.loads(res.get("strengths") or "[]")
            res["weaknesses"] = json.loads(res.get("weaknesses") or "[]")
            res["risks"] = json.loads(res.get("risks") or "[]")
            res["improvements"] = json.loads(res.get("improvements") or "[]")
            res["judge_feedback"] = json.loads(res.get("judge_feedback") or "{}")
            return res

    def get_project_evaluations(self, project_id: str) -> List[Dict[str, Any]]:
        evals = []
        with sqlite3.connect(self.db_path) as conn:
            conn.row_factory = sqlite3.Row
            c = conn.cursor()
            c.execute("SELECT * FROM evaluations WHERE project_id = ? ORDER BY created_at DESC", (project_id,))
            for r in c.fetchall():
                res = dict(r)
                res["strengths"] = json.loads(res.get("strengths") or "[]")
                res["weaknesses"] = json.loads(res.get("weaknesses") or "[]")
                res["risks"] = json.loads(res.get("risks") or "[]")
                res["improvements"] = json.loads(res.get("improvements") or "[]")
                res["judge_feedback"] = json.loads(res.get("judge_feedback") or "{}")
                evals.append(res)
        return evals

    # =========================================================================
    # AI BOARD ITEMS (7 Columns)
    # =========================================================================
    def get_board_items(self, project_id: str) -> List[Dict[str, Any]]:
        items = []
        with sqlite3.connect(self.db_path) as conn:
            conn.row_factory = sqlite3.Row
            c = conn.cursor()
            c.execute("SELECT * FROM ai_board_items WHERE project_id = ? ORDER BY position ASC, created_at ASC", (project_id,))
            for r in c.fetchall():
                item = dict(r)
                item["completed"] = bool(item.get("completed", 0))
                item["is_pinned"] = bool(item.get("is_pinned", 0))
                items.append(item)
        return items

    def save_board_item(self, item_data: Dict[str, Any]) -> Dict[str, Any]:
        i_id = item_data.get("id") or str(uuid.uuid4())
        now = datetime.utcnow().isoformat()
        with sqlite3.connect(self.db_path) as conn:
            c = conn.cursor()
            c.execute("""
                INSERT INTO ai_board_items (id, project_id, user_id, column_name, title, description, priority, source_type, source_id, completed, is_pinned, position, created_at, updated_at)
                VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
                ON CONFLICT(id) DO UPDATE SET
                    column_name=excluded.column_name,
                    title=excluded.title,
                    description=excluded.description,
                    priority=excluded.priority,
                    completed=excluded.completed,
                    is_pinned=excluded.is_pinned,
                    position=excluded.position,
                    updated_at=excluded.updated_at
            """, (
                i_id,
                item_data.get("project_id"),
                item_data.get("user_id", "demo-user"),
                item_data.get("column_name", "PROBLEM"),
                item_data.get("title", ""),
                item_data.get("description", ""),
                item_data.get("priority", "MEDIUM"),
                item_data.get("source_type", "manual"),
                item_data.get("source_id", ""),
                1 if item_data.get("completed") else 0,
                1 if item_data.get("is_pinned") else 0,
                item_data.get("position", 0),
                item_data.get("created_at", now),
                now
            ))
            conn.commit()
        
        with sqlite3.connect(self.db_path) as conn:
            conn.row_factory = sqlite3.Row
            c = conn.cursor()
            c.execute("SELECT * FROM ai_board_items WHERE id = ?", (i_id,))
            res = dict(c.fetchone())
            res["completed"] = bool(res.get("completed", 0))
            res["is_pinned"] = bool(res.get("is_pinned", 0))
            return res

    def delete_board_item(self, item_id: str) -> bool:
        with sqlite3.connect(self.db_path) as conn:
            c = conn.cursor()
            c.execute("DELETE FROM ai_board_items WHERE id = ?", (item_id,))
            conn.commit()
        return True

    # =========================================================================
    # CHAT SESSIONS & MESSAGES
    # =========================================================================
    def get_chat_sessions(self, project_id: str) -> List[Dict[str, Any]]:
        sessions = []
        with sqlite3.connect(self.db_path) as conn:
            conn.row_factory = sqlite3.Row
            c = conn.cursor()
            c.execute("SELECT * FROM chat_sessions WHERE project_id = ? ORDER BY updated_at DESC", (project_id,))
            for r in c.fetchall():
                sessions.append(dict(r))
        return sessions

    def create_chat_session(self, project_id: str, user_id: str = "demo-user", title: str = "New Conversation") -> Dict[str, Any]:
        s_id = str(uuid.uuid4())
        now = datetime.utcnow().isoformat()
        with sqlite3.connect(self.db_path) as conn:
            c = conn.cursor()
            c.execute("""
                INSERT INTO chat_sessions (id, project_id, user_id, title, created_at, updated_at)
                VALUES (?, ?, ?, ?, ?, ?)
            """, (s_id, project_id, user_id, title, now, now))
            conn.commit()
        return {"id": s_id, "project_id": project_id, "user_id": user_id, "title": title, "created_at": now, "updated_at": now}

    def get_chat_messages(self, session_id: str) -> List[Dict[str, Any]]:
        messages = []
        with sqlite3.connect(self.db_path) as conn:
            conn.row_factory = sqlite3.Row
            c = conn.cursor()
            c.execute("SELECT * FROM chat_messages WHERE session_id = ? ORDER BY created_at ASC", (session_id,))
            for r in c.fetchall():
                m = dict(r)
                m["citations"] = json.loads(m.get("citations") or "[]")
                messages.append(m)
        return messages

    def save_chat_message(self, session_id: str, role: str, content: str, citations: List[Dict[str, Any]] = None, user_id: str = "demo-user") -> Dict[str, Any]:
        m_id = str(uuid.uuid4())
        now = datetime.utcnow().isoformat()
        citations_str = json.dumps(citations or [])
        with sqlite3.connect(self.db_path) as conn:
            c = conn.cursor()
            c.execute("""
                INSERT INTO chat_messages (id, session_id, user_id, role, content, citations, created_at)
                VALUES (?, ?, ?, ?, ?, ?, ?)
            """, (m_id, session_id, user_id, role, content, citations_str, now))
            c.execute("UPDATE chat_sessions SET updated_at = ? WHERE id = ?", (now, session_id))
            conn.commit()
        return {
            "id": m_id,
            "session_id": session_id,
            "user_id": user_id,
            "role": role,
            "content": content,
            "citations": citations or [],
            "created_at": now
        }

supabase_service = SupabaseService()
