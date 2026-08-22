const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:8000';

async function request(endpoint, options = {}) {
  const url = `${API_BASE_URL}${endpoint}`;
  const headers = {
    ...(options.isFormData ? {} : { 'Content-Type': 'application/json' }),
    ...options.headers,
  };

  const response = await fetch(url, {
    ...options,
    headers,
  });

  if (!response.ok) {
    let errorMsg = `API Error (${response.status})`;
    try {
      const errJson = await response.json();
      errorMsg = errJson.detail || errJson.message || errorMsg;
    } catch (_) {}
    throw new Error(errorMsg);
  }

  return response.json();
}

export const api = {
  // System Health
  getHealth: () => request('/api/health'),

  // Projects
  getProjects: (userId) => request(`/api/projects${userId ? `?user_id=${userId}` : ''}`),
  getProject: (id) => request(`/api/projects/${id}`),
  createProject: (data) => request('/api/projects', { method: 'POST', body: JSON.stringify(data) }),
  updateProject: (id, data) => request(`/api/projects/${id}`, { method: 'PUT', body: JSON.stringify(data) }),
  deleteProject: (id) => request(`/api/projects/${id}`, { method: 'DELETE' }),
  seedDemo: () => request('/api/demo/seed', { method: 'POST' }),

  // AI Helpers
  improveProblem: (problem_statement) => request('/api/ai/improve-problem', { method: 'POST', body: JSON.stringify({ problem_statement }) }),
  improveIdea: (initial_idea, problem_statement) => request('/api/ai/improve-idea', { method: 'POST', body: JSON.stringify({ initial_idea, problem_statement }) }),
  extractRequirements: (projectId) => request(`/api/projects/${projectId}/extract-requirements`, { method: 'POST' }),

  // Documents
  getDocuments: (projectId) => request(`/api/projects/${projectId}/documents`),
  getDocument: (id) => request(`/api/documents/${id}`),
  uploadDocuments: (projectId, files, userId = 'demo-user') => {
    const formData = new FormData();
    formData.append('project_id', projectId);
    formData.append('user_id', userId);
    Array.from(files).forEach((file) => formData.append('files', file));
    return request('/api/documents/upload', {
      method: 'POST',
      body: formData,
      isFormData: true,
    });
  },
  reprocessDocument: (docId) => request(`/api/documents/${docId}/reprocess`, { method: 'POST' }),
  deleteDocument: (docId) => request(`/api/documents/${docId}`, { method: 'DELETE' }),

  // Chat / RAG
  getChatSessions: (projectId) => request(`/api/projects/${projectId}/chat/sessions`),
  createChatSession: (projectId, title, userId) => request(`/api/projects/${projectId}/chat/sessions`, { method: 'POST', body: JSON.stringify({ title, user_id: userId }) }),
  getSessionMessages: (sessionId) => request(`/api/chat/sessions/${sessionId}/messages`),
  sendChatQuery: (data) => request('/api/chat/query', { method: 'POST', body: JSON.stringify(data) }),

  // Evaluation
  runEvaluation: (projectId) => request(`/api/projects/${projectId}/evaluate`, { method: 'POST' }),
  getEvaluations: (projectId) => request(`/api/projects/${projectId}/evaluations`),
  getEvaluation: (evalId) => request(`/api/evaluations/${evalId}`),
  compareEvaluations: (projectId, baseId, targetId) => {
    let q = `/api/projects/${projectId}/evaluations/compare`;
    const params = [];
    if (baseId) params.push(`base_id=${baseId}`);
    if (targetId) params.push(`target_id=${targetId}`);
    if (params.length) q += `?${params.join('&')}`;
    return request(q);
  },
  judgeProject: (projectId) => request(`/api/projects/${projectId}/judge`, { method: 'POST' }),

  // AI Board
  getBoardItems: (projectId) => request(`/api/projects/${projectId}/board`),
  createBoardItem: (projectId, data) => request(`/api/projects/${projectId}/board`, { method: 'POST', body: JSON.stringify(data) }),
  updateBoardItem: (itemId, data) => request(`/api/board/${itemId}`, { method: 'PUT', body: JSON.stringify(data) }),
  deleteBoardItem: (itemId) => request(`/api/board/${itemId}`, { method: 'DELETE' }),
  syncBoardFromEvaluation: (projectId) => request(`/api/projects/${projectId}/board/sync`, { method: 'POST' }),

  // RAG Quality Dashboard Metrics & Sandbox
  getRagMetrics: (projectId) => request(`/api/projects/${projectId}/rag-metrics`),
  testRagSandbox: (projectId, query, topK = 5) => request('/api/chat/sandbox', { method: 'POST', body: JSON.stringify({ project_id: projectId, query, top_k: topK }) }),
};

