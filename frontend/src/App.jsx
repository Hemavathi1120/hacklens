import React from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider, useAuth } from './contexts/AuthContext';

// Pages
import LandingPage from './pages/LandingPage';
import AuthPage from './pages/AuthPage';
import AuthCallback from './pages/AuthCallback';
import DashboardPage from './pages/DashboardPage';
import ProjectsListPage from './pages/ProjectsListPage';
import ProjectWizardPage from './pages/ProjectWizardPage';
import ProjectLayout from './layouts/ProjectLayout';
import ProjectSurveyEditPage from './pages/ProjectSurveyEditPage';
import DocumentManagementPage from './pages/DocumentManagementPage';
import ChatbotPage from './pages/ChatbotPage';
import EvaluationPage from './pages/EvaluationPage';
import AIBoardPage from './pages/AIBoardPage';
import SuggestionsPage from './pages/SuggestionsPage';
import RagQualityDashboardPage from './pages/RagQualityDashboardPage';
import ProfilePage from './pages/ProfilePage';

// Protected Route Wrapper
function ProtectedRoute({ children }) {
  const { user, loading } = useAuth();

  if (loading) {
    return (
      <div className="min-h-screen bg-[#09090b] flex items-center justify-center">
        <div className="w-8 h-8 rounded-full border-2 border-red-500 border-t-transparent animate-spin" />
      </div>
    );
  }

  if (!user) {
    return <Navigate to="/login" replace />;
  }

  return children;
}

export default function App() {
  return (
    <AuthProvider>
      <BrowserRouter>
        <Routes>
          {/* Public Routes */}
          <Route path="/" element={<LandingPage />} />
          <Route path="/login" element={<AuthPage />} />
          <Route path="/auth" element={<AuthPage />} />
          <Route path="/auth/callback" element={<AuthCallback />} />

          {/* Protected Routes */}
          <Route
            path="/dashboard"
            element={
              <ProtectedRoute>
                <DashboardPage />
              </ProtectedRoute>
            }
          />
          <Route
            path="/projects"
            element={
              <ProtectedRoute>
                <ProjectsListPage />
              </ProtectedRoute>
            }
          />
          <Route
            path="/projects/new"
            element={
              <ProtectedRoute>
                <ProjectWizardPage />
              </ProtectedRoute>
            }
          />
          
          {/* Nested Project Routes */}
          <Route
            path="/projects/:id"
            element={
              <ProtectedRoute>
                <ProjectLayout />
              </ProtectedRoute>
            }
          >
            <Route index element={<Navigate to="evaluation" replace />} />
            <Route path="survey" element={<ProjectSurveyEditPage />} />
            <Route path="documents" element={<DocumentManagementPage />} />
            <Route path="chat" element={<ChatbotPage />} />
            <Route path="evaluation" element={<EvaluationPage />} />
            <Route path="board" element={<AIBoardPage />} />
            <Route path="suggestions" element={<SuggestionsPage />} />
            <Route path="rag-dashboard" element={<RagQualityDashboardPage />} />
          </Route>

          <Route
            path="/profile"
            element={
              <ProtectedRoute>
                <ProfilePage />
              </ProtectedRoute>
            }
          />

          {/* Catch-all */}
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </BrowserRouter>
    </AuthProvider>
  );
}
