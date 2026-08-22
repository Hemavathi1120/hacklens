-- ==============================================================================
-- PROJECTLENS AI - SUPABASE DATABASE SCHEMA & RLS POLICIES
-- ==============================================================================

-- 1. Enable pgvector extension for AI embeddings
CREATE EXTENSION IF NOT EXISTS vector;

-- 2. Profiles table
CREATE TABLE IF NOT EXISTS public.profiles (
    id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
    email TEXT,
    full_name TEXT,
    avatar_url TEXT,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- 3. Projects table
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

-- 4. Project Requirements table
CREATE TABLE IF NOT EXISTS public.project_requirements (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    project_id UUID REFERENCES public.projects(id) ON DELETE CASCADE,
    category TEXT NOT NULL, -- functional, technical, target_users, constraints, tech_preferences
    requirement TEXT NOT NULL,
    priority TEXT DEFAULT 'MEDIUM', -- HIGH, MEDIUM, LOW
    status TEXT DEFAULT 'pending', -- pending, implemented, validated
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 5. Documents table
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

-- 6. Document Chunks table with 3072-dimension vectors for Gemini embeddings
CREATE TABLE IF NOT EXISTS public.document_chunks (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    document_id UUID REFERENCES public.documents(id) ON DELETE CASCADE,
    project_id UUID REFERENCES public.projects(id) ON DELETE CASCADE,
    chunk_index INT NOT NULL,
    content TEXT NOT NULL,
    page_number INT,
    section_title TEXT,
    embedding VECTOR(3072),
    metadata JSONB DEFAULT '{}'::jsonb,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 7. Evaluations table
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

-- 8. Evaluation Items breakdown
CREATE TABLE IF NOT EXISTS public.evaluation_items (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    evaluation_id UUID REFERENCES public.evaluations(id) ON DELETE CASCADE,
    category TEXT NOT NULL,
    score NUMERIC(4,2) DEFAULT 0,
    strengths TEXT,
    weaknesses TEXT,
    recommendations TEXT,
    priority TEXT DEFAULT 'MEDIUM',
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 9. AI Board Items (7 Kanban columns)
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

-- 10. Chat Sessions
CREATE TABLE IF NOT EXISTS public.chat_sessions (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    project_id UUID REFERENCES public.projects(id) ON DELETE CASCADE,
    user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
    title TEXT NOT NULL,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- 11. Chat Messages
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
-- ROW LEVEL SECURITY (RLS) POLICIES
-- ==============================================================================

ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.projects ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.project_requirements ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.documents ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.document_chunks ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.evaluations ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.evaluation_items ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.ai_board_items ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.chat_sessions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.chat_messages ENABLE ROW LEVEL SECURITY;

-- Projects RLS
CREATE POLICY "Users can manage own projects" 
ON public.projects FOR ALL 
USING (auth.uid() = user_id OR user_id IS NULL);

-- Documents RLS
CREATE POLICY "Users can manage own documents" 
ON public.documents FOR ALL 
USING (auth.uid() = user_id OR user_id IS NULL);

-- Document Chunks RLS
CREATE POLICY "Users can access chunks of accessible projects" 
ON public.document_chunks FOR ALL 
USING (project_id IN (SELECT id FROM public.projects WHERE user_id = auth.uid() OR user_id IS NULL));

-- Evaluations RLS
CREATE POLICY "Users can manage own evaluations" 
ON public.evaluations FOR ALL 
USING (auth.uid() = user_id OR user_id IS NULL);

-- AI Board Items RLS
CREATE POLICY "Users can manage own board items" 
ON public.ai_board_items FOR ALL 
USING (auth.uid() = user_id OR user_id IS NULL);

-- Chat Sessions RLS
CREATE POLICY "Users can manage own chat sessions" 
ON public.chat_sessions FOR ALL 
USING (auth.uid() = user_id OR user_id IS NULL);

-- Chat Messages RLS
CREATE POLICY "Users can access own messages" 
ON public.chat_messages FOR ALL 
USING (session_id IN (SELECT id FROM public.chat_sessions WHERE user_id = auth.uid() OR user_id IS NULL));

-- ==============================================================================
-- VECTOR SEARCH RPC FUNCTION
-- ==============================================================================
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
    similarity FLOAT
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
        1 - (dc.embedding <=> query_embedding) AS similarity
    FROM public.document_chunks dc
    WHERE dc.project_id = filter_project_id
      AND 1 - (dc.embedding <=> query_embedding) > match_threshold
    ORDER BY dc.embedding <=> query_embedding
    LIMIT match_count;
END;
$$;
