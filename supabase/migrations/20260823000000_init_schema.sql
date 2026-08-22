-- ==============================================================================
-- PROJECTLENS AI / HACKLENS - SUPABASE POSTGRESQL & PGVECTOR MIGRATION
-- Migration: 20260823000000_init_schema.sql
-- ==============================================================================

-- 1. Enable pgvector extension for high-dimensional semantic embeddings (3072 dims)
CREATE EXTENSION IF NOT EXISTS vector;
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- 2. User Profiles
CREATE TABLE IF NOT EXISTS public.profiles (
    id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
    email TEXT,
    full_name TEXT,
    avatar_url TEXT,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- 3. Projects Table
CREATE TABLE IF NOT EXISTS public.projects (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
    name TEXT NOT NULL,
    description TEXT,
    problem_statement TEXT,
    initial_idea TEXT,
    target_users JSONB DEFAULT '[]'::jsonb,
    technologies JSONB DEFAULT '[]'::jsonb,
    constraints JSONB DEFAULT '[]'::jsonb,
    status TEXT DEFAULT 'draft', -- draft, analyzing, evaluated, ready
    overall_score NUMERIC(5,2) DEFAULT 0,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- 4. Project Requirements Table
CREATE TABLE IF NOT EXISTS public.project_requirements (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    project_id UUID REFERENCES public.projects(id) ON DELETE CASCADE,
    category TEXT NOT NULL, -- functional, technical, target_users, constraints, tech_preferences
    requirement TEXT NOT NULL,
    priority TEXT DEFAULT 'MEDIUM', -- HIGH, MEDIUM, LOW
    status TEXT DEFAULT 'pending', -- pending, implemented, validated
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 5. Uploaded Documents Table
CREATE TABLE IF NOT EXISTS public.documents (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    project_id UUID REFERENCES public.projects(id) ON DELETE CASCADE,
    user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
    filename TEXT NOT NULL,
    file_type TEXT NOT NULL,
    file_size BIGINT DEFAULT 0,
    storage_path TEXT,
    processing_status TEXT DEFAULT 'pending', -- pending, processing, indexed, failed
    document_version INT DEFAULT 1,
    summary TEXT,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- 6. Document Chunks with 3072-dimension pgvector column
CREATE TABLE IF NOT EXISTS public.document_chunks (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    document_id UUID REFERENCES public.documents(id) ON DELETE CASCADE,
    project_id UUID REFERENCES public.projects(id) ON DELETE CASCADE,
    chunk_index INT NOT NULL,
    content TEXT NOT NULL,
    page_number INT DEFAULT 1,
    section_title TEXT DEFAULT 'General',
    embedding VECTOR(3072),
    metadata JSONB DEFAULT '{}'::jsonb,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 7. Multi-dimension Evaluations
CREATE TABLE IF NOT EXISTS public.evaluations (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    project_id UUID REFERENCES public.projects(id) ON DELETE CASCADE,
    user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
    overall_score NUMERIC(5,2) DEFAULT 0,
    status_label TEXT DEFAULT 'Evaluated',
    problem_score NUMERIC(4,2) DEFAULT 0,
    innovation_score NUMERIC(4,2) DEFAULT 0,
    technical_score NUMERIC(4,2) DEFAULT 0,
    user_value_score NUMERIC(4,2) DEFAULT 0,
    requirements_score NUMERIC(4,2) DEFAULT 0,
    scalability_score NUMERIC(4,2) DEFAULT 0,
    security_score NUMERIC(4,2) DEFAULT 0,
    rag_quality_score NUMERIC(4,2) DEFAULT 0,
    feasibility_score NUMERIC(4,2) DEFAULT 0,
    summary TEXT,
    strengths JSONB DEFAULT '[]'::jsonb,
    weaknesses JSONB DEFAULT '[]'::jsonb,
    risks JSONB DEFAULT '[]'::jsonb,
    improvements JSONB DEFAULT '[]'::jsonb,
    judge_feedback JSONB DEFAULT '{}'::jsonb,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 8. AI Board Items (Kanban)
CREATE TABLE IF NOT EXISTS public.ai_board_items (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    project_id UUID REFERENCES public.projects(id) ON DELETE CASCADE,
    user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
    column_name TEXT NOT NULL, -- PROBLEM, IDEA, REQUIREMENTS, AI INSIGHTS, RISKS, IMPROVEMENTS, NEXT STEPS
    title TEXT NOT NULL,
    description TEXT,
    priority TEXT DEFAULT 'MEDIUM', -- HIGH, MEDIUM, LOW
    source_type TEXT DEFAULT 'manual', -- manual, evaluation, ai_helper, document
    source_id TEXT,
    completed BOOLEAN DEFAULT FALSE,
    is_pinned BOOLEAN DEFAULT FALSE,
    position INT DEFAULT 0,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- 9. Chat Sessions
CREATE TABLE IF NOT EXISTS public.chat_sessions (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    project_id UUID REFERENCES public.projects(id) ON DELETE CASCADE,
    user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
    title TEXT NOT NULL,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- 10. Chat Messages
CREATE TABLE IF NOT EXISTS public.chat_messages (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    session_id UUID REFERENCES public.chat_sessions(id) ON DELETE CASCADE,
    user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
    role TEXT NOT NULL, -- user, assistant
    content TEXT NOT NULL,
    citations JSONB DEFAULT '[]'::jsonb,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- ==============================================================================
-- INDEXES FOR MAXIMUM QUERY PERFORMANCE
-- ==============================================================================
CREATE INDEX IF NOT EXISTS idx_projects_user_id ON public.projects(user_id);
CREATE INDEX IF NOT EXISTS idx_project_requirements_project ON public.project_requirements(project_id);
CREATE INDEX IF NOT EXISTS idx_documents_project ON public.documents(project_id);
CREATE INDEX IF NOT EXISTS idx_chunks_project ON public.document_chunks(project_id);
CREATE INDEX IF NOT EXISTS idx_chunks_doc ON public.document_chunks(document_id);
CREATE INDEX IF NOT EXISTS idx_evaluations_project ON public.evaluations(project_id);
CREATE INDEX IF NOT EXISTS idx_ai_board_project ON public.ai_board_items(project_id);
CREATE INDEX IF NOT EXISTS idx_chat_sessions_project ON public.chat_sessions(project_id);
CREATE INDEX IF NOT EXISTS idx_chat_messages_session ON public.chat_messages(session_id);

-- ==============================================================================
-- ROW LEVEL SECURITY (RLS) POLICIES
-- ==============================================================================
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.projects ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.project_requirements ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.documents ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.document_chunks ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.evaluations ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.ai_board_items ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.chat_sessions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.chat_messages ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Public / User Project Access" ON public.projects FOR ALL USING (true);
CREATE POLICY "Public / User Requirements Access" ON public.project_requirements FOR ALL USING (true);
CREATE POLICY "Public / User Documents Access" ON public.documents FOR ALL USING (true);
CREATE POLICY "Public / User Document Chunks Access" ON public.document_chunks FOR ALL USING (true);
CREATE POLICY "Public / User Evaluations Access" ON public.evaluations FOR ALL USING (true);
CREATE POLICY "Public / User AI Board Items Access" ON public.ai_board_items FOR ALL USING (true);
CREATE POLICY "Public / User Chat Sessions Access" ON public.chat_sessions FOR ALL USING (true);
CREATE POLICY "Public / User Chat Messages Access" ON public.chat_messages FOR ALL USING (true);

-- ==============================================================================
-- VECTOR SEARCH RPC FUNCTIONS
-- ==============================================================================

-- 1. match_documents RPC (used by backend Dense Vector Search)
CREATE OR REPLACE FUNCTION match_documents(
    query_embedding VECTOR(3072),
    match_threshold FLOAT,
    match_count INT,
    p_project_id UUID
)
RETURNS TABLE (
    id UUID,
    document_id UUID,
    project_id UUID,
    chunk_index INT,
    content TEXT,
    page_number INT,
    section_title TEXT,
    similarity FLOAT,
    metadata JSONB
)
LANGUAGE plpgsql
AS $$
BEGIN
    RETURN QUERY
    SELECT
        dc.id,
        dc.document_id,
        dc.project_id,
        dc.chunk_index,
        dc.content,
        dc.page_number,
        dc.section_title,
        (1 - (dc.embedding <=> query_embedding))::FLOAT AS similarity,
        dc.metadata
    FROM public.document_chunks dc
    WHERE dc.project_id = p_project_id
      AND dc.embedding IS NOT NULL
      AND (1 - (dc.embedding <=> query_embedding)) >= match_threshold
    ORDER BY dc.embedding <=> query_embedding ASC
    LIMIT match_count;
END;
$$;

-- 2. match_document_chunks alias for compatibility
CREATE OR REPLACE FUNCTION match_document_chunks(
    query_embedding VECTOR(3072),
    match_threshold FLOAT,
    match_count INT,
    filter_project_id UUID
)
RETURNS TABLE (
    id UUID,
    document_id UUID,
    project_id UUID,
    chunk_index INT,
    content TEXT,
    page_number INT,
    section_title TEXT,
    similarity FLOAT,
    metadata JSONB
)
LANGUAGE plpgsql
AS $$
BEGIN
    RETURN QUERY
    SELECT
        dc.id,
        dc.document_id,
        dc.project_id,
        dc.chunk_index,
        dc.content,
        dc.page_number,
        dc.section_title,
        (1 - (dc.embedding <=> query_embedding))::FLOAT AS similarity,
        dc.metadata
    FROM public.document_chunks dc
    WHERE dc.project_id = filter_project_id
      AND dc.embedding IS NOT NULL
      AND (1 - (dc.embedding <=> query_embedding)) >= match_threshold
    ORDER BY dc.embedding <=> query_embedding ASC
    LIMIT match_count;
END;
$$;
