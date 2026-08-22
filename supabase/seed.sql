-- ==============================================================================
-- PROJECTLENS AI / HACKLENS - SUPABASE SEED DATA
-- ==============================================================================

-- Demo Project: CivicLens AI
INSERT INTO public.projects (
    id,
    name,
    description,
    problem_statement,
    initial_idea,
    target_users,
    technologies,
    constraints,
    status,
    overall_score,
    created_at,
    updated_at
) VALUES (
    'demo-civiclens-ai-001'::uuid,
    'CivicLens AI',
    'AI-powered statutory compliance and public benefit discovery platform.',
    'Government regulations, civic welfare schemes, and municipal ordinances are severely fragmented across over 45,000 portals. Citizens and small businesses fail to discover and claim eligible grants, while caseworkers face massive processing backlogs.',
    'A RAG-powered statutory assistant that ingests municipal policy PDFs, generates embeddings, enforces page-level grounding, and guides citizens through verified welfare eligibility checks.',
    '["Citizens navigating public benefits", "Small business owners seeking compliance", "Municipal caseworkers & legal aids"]'::jsonb,
    '["FastAPI", "React 19", "Tailwind CSS", "Google Gemini 2.5", "Supabase pgvector"]'::jsonb,
    '["Must operate with zero hallucinations on legal text", "Sub-second search latency across 10,000+ policy pages", "Strict tenant data isolation"]'::jsonb,
    'evaluated',
    89.5,
    NOW(),
    NOW()
) ON CONFLICT (id) DO NOTHING;

-- Demo Requirements
INSERT INTO public.project_requirements (id, project_id, category, requirement, priority, status)
VALUES
    (gen_random_uuid(), 'demo-civiclens-ai-001'::uuid, 'functional', 'Ingest and chunk municipal ordinances and PDF benefit schedules.', 'HIGH', 'validated'),
    (gen_random_uuid(), 'demo-civiclens-ai-001'::uuid, 'functional', 'Provide grounded conversational answers with exact page and section citations.', 'HIGH', 'validated'),
    (gen_random_uuid(), 'demo-civiclens-ai-001'::uuid, 'technical', 'Hybrid retrieval combining dense Gemini embeddings (3072 dims) and BM25 lexical search with RRF.', 'HIGH', 'validated'),
    (gen_random_uuid(), 'demo-civiclens-ai-001'::uuid, 'security', 'Prompt injection defense and automatic PII redaction on user queries.', 'HIGH', 'validated')
ON CONFLICT (id) DO NOTHING;
