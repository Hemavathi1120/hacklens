import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { 
  Sparkles, 
  ArrowRight, 
  ArrowLeft, 
  Plus, 
  Trash2, 
  Check, 
  Loader2, 
  FileText, 
  Bot, 
  Compass, 
  Layers, 
  Zap,
  HelpCircle,
  UploadCloud,
  Wand2,
  CheckCircle2,
  AlertCircle
} from 'lucide-react';
import Navbar from '../components/Navbar';
import UploadZone from '../components/UploadZone';
import AiHelperModal from '../components/AiHelperModal';
import { useAuth } from '../contexts/AuthContext';
import { api } from '../lib/api';

export default function ProjectWizardPage() {
  const { user } = useAuth();
  const navigate = useNavigate();

  const [currentStep, setCurrentStep] = useState(1);
  const [createdProjectId, setCreatedProjectId] = useState(null);

  // Form State
  const [name, setName] = useState('');
  const [description, setDescription] = useState('');
  const [problemStatement, setProblemStatement] = useState('');
  const [initialIdea, setInitialIdea] = useState('');
  
  // Document Uploads
  const [uploadedDocs, setUploadedDocs] = useState([]);

  // Structured Requirements
  const [functionalReqs, setFunctionalReqs] = useState(['']);
  const [technicalReqs, setTechnicalReqs] = useState(['']);
  const [targetUsers, setTargetUsers] = useState(['']);
  const [constraints, setConstraints] = useState(['']);
  const [technologies, setTechnologies] = useState(['']);

  // AI Helper Modal State
  const [aiHelperOpen, setAiHelperOpen] = useState(false);
  const [aiHelperMode, setAiHelperMode] = useState('problem'); // 'problem' or 'idea'

  // Loading States
  const [loading, setLoading] = useState(false);
  const [extractingFromDocs, setExtractingFromDocs] = useState(false);
  const [autoFillSuccessMsg, setAutoFillSuccessMsg] = useState('');

  // 5-Step Order with Documents (03) before Requirements (04)
  const steps = [
    { num: 1, label: '01 Problem' },
    { num: 2, label: '02 Idea' },
    { num: 3, label: '03 Documents' },
    { num: 4, label: '04 Requirements' },
    { num: 5, label: '05 AI Analysis' },
  ];

  // Requirements Helpers
  const addListField = (setter, currentList) => {
    setter([...currentList, '']);
  };

  const updateListField = (setter, currentList, index, val) => {
    const updated = [...currentList];
    updated[index] = val;
    setter(updated);
  };

  const removeListField = (setter, currentList, index) => {
    if (currentList.length === 1) {
      setter(['']);
      return;
    }
    setter(currentList.filter((_, i) => i !== index));
  };

  // Step Navigation & Save Handlers
  const handleNextStep = async () => {
    if (currentStep === 1) {
      if (!name.trim()) {
        alert('Please enter a project name.');
        return;
      }
      if (!problemStatement.trim()) {
        alert('Please define the problem statement.');
        return;
      }
      setCurrentStep(2);
    } else if (currentStep === 2) {
      if (!initialIdea.trim()) {
        alert('Please enter your initial solution idea.');
        return;
      }

      // Create draft project so we have createdProjectId for Step 03 Document uploads
      setLoading(true);
      try {
        if (!createdProjectId) {
          const payload = {
            name: name.trim(),
            description: description.trim() || problemStatement.slice(0, 120),
            problem_statement: problemStatement.trim(),
            initial_idea: initialIdea.trim(),
            target_users: targetUsers.filter(u => u.trim()),
            technologies: technologies.filter(t => t.trim()),
            constraints: constraints.filter(c => c.trim()),
            requirements: [],
            user_id: user?.id || 'demo-user',
          };
          const res = await api.createProject(payload);
          setCreatedProjectId(res.id);
        } else {
          await api.updateProject(createdProjectId, {
            name: name.trim(),
            description: description.trim(),
            problem_statement: problemStatement.trim(),
            initial_idea: initialIdea.trim(),
          });
        }
        setCurrentStep(3); // Go to Step 03: Documents
      } catch (err) {
        alert(err.message || 'Failed to initialize project draft.');
      } finally {
        setLoading(false);
      }

    } else if (currentStep === 3) {
      // Step 3 (Documents) -> Go to Step 4 (Requirements)
      setCurrentStep(4);
    } else if (currentStep === 4) {
      // Step 4 (Requirements) -> Save all requirements and go to Step 5
      setLoading(true);
      try {
        const formattedReqs = [
          ...functionalReqs.filter(r => r.trim()).map(r => ({ category: 'functional', requirement: r, priority: 'HIGH' })),
          ...technicalReqs.filter(r => r.trim()).map(r => ({ category: 'technical', requirement: r, priority: 'HIGH' })),
          ...constraints.filter(r => r.trim()).map(r => ({ category: 'constraints', requirement: r, priority: 'MEDIUM' })),
        ];

        await api.updateProject(createdProjectId, {
          target_users: targetUsers.filter(u => u.trim()),
          technologies: technologies.filter(t => t.trim()),
          constraints: constraints.filter(c => c.trim()),
          requirements: formattedReqs,
        });

        setCurrentStep(5);
      } catch (err) {
        alert(err.message || 'Failed to save requirements.');
      } finally {
        setLoading(false);
      }
    }
  };

  // AI Feature: "Read with Documentation" to Auto-Fill Requirements
  const handleReadWithDocumentation = async () => {
    if (!createdProjectId) return;
    setExtractingFromDocs(true);
    setAutoFillSuccessMsg('');

    try {
      const extracted = await api.extractRequirements(createdProjectId);

      if (extracted) {
        if (extracted.functional_requirements?.length) {
          setFunctionalReqs(extracted.functional_requirements);
        }
        if (extracted.technical_requirements?.length) {
          setTechnicalReqs(extracted.technical_requirements);
        }
        if (extracted.target_users?.length) {
          setTargetUsers(extracted.target_users);
        }
        if (extracted.technologies?.length) {
          setTechnologies(extracted.technologies);
        }
        if (extracted.constraints?.length) {
          setConstraints(extracted.constraints);
        }

        setAutoFillSuccessMsg('✨ AI successfully analyzed your documents and auto-populated the requirements below! You can further edit or add manual items.');
        setTimeout(() => setAutoFillSuccessMsg(''), 8000);
      }
    } catch (err) {
      console.error('Error auto-filling from documentation:', err);
      alert('Could not extract requirements from documentation. You can enter them manually.');
    } finally {
      setExtractingFromDocs(false);
    }
  };

  const handleLaunchAnalysis = async () => {
    if (!createdProjectId) return;
    setLoading(true);
    try {
      await api.runEvaluation(createdProjectId);
      navigate(`/projects/${createdProjectId}/evaluation`);
    } catch (err) {
      alert(err.message || 'Evaluation generation error.');
      navigate(`/projects/${createdProjectId}/evaluation`);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#090d16] text-slate-100 flex flex-col">
      <Navbar />

      <main className="flex-1 max-w-4xl w-full mx-auto px-4 sm:px-6 py-8 space-y-8">
        
        {/* Step Indicator */}
        <div className="p-4 rounded-2xl bg-slate-900/60 border border-slate-800 flex items-center justify-between overflow-x-auto gap-3">
          {steps.map((s) => {
            const isCompleted = s.num < currentStep;
            const isCurrent = s.num === currentStep;

            return (
              <div key={s.num} className="flex items-center gap-2 flex-shrink-0">
                <div
                  className={`w-7 h-7 rounded-lg flex items-center justify-center text-xs font-bold transition-all ${
                    isCompleted
                      ? 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/30'
                      : isCurrent
                      ? 'bg-indigo-600 text-white shadow-lg shadow-indigo-600/30'
                      : 'bg-slate-800 text-slate-500 border border-slate-700'
                  }`}
                >
                  {isCompleted ? <Check className="w-3.5 h-3.5" /> : s.num}
                </div>
                <span
                  className={`text-xs font-semibold uppercase tracking-wider ${
                    isCurrent ? 'text-white' : isCompleted ? 'text-emerald-400' : 'text-slate-500'
                  }`}
                >
                  {s.label}
                </span>
                {s.num < steps.length && (
                  <div className="w-6 sm:w-12 h-px bg-slate-800 mx-1" />
                )}
              </div>
            );
          })}
        </div>

        {/* STEP 1: PROBLEM STATEMENT */}
        {currentStep === 1 && (
          <div className="p-7 sm:p-9 rounded-3xl bg-slate-900/80 border border-slate-800 space-y-6 shadow-xl animate-in fade-in">
            <div className="space-y-1">
              <span className="text-xs font-bold text-indigo-400 uppercase tracking-wider">Step 01</span>
              <h2 className="text-xl font-bold font-display text-white">Define the Problem Statement</h2>
              <p className="text-xs text-slate-400">
                Specify who faces this challenge and why current alternatives fail.
              </p>
            </div>

            <div className="space-y-4">
              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1">Project Name *</label>
                <input
                  type="text"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder="e.g. CivicLens AI"
                  className="w-full px-4 py-2.5 rounded-xl bg-slate-950 border border-slate-800 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-indigo-500"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1">Brief Description (Optional)</label>
                <input
                  type="text"
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  placeholder="e.g. AI-powered municipal intelligence and legal citation assistant."
                  className="w-full px-4 py-2.5 rounded-xl bg-slate-950 border border-slate-800 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-indigo-500"
                />
              </div>

              <div>
                <div className="flex items-center justify-between mb-1">
                  <label className="text-xs font-semibold text-slate-300">Problem Statement *</label>
                  <button
                    type="button"
                    onClick={() => {
                      setAiHelperMode('problem');
                      setAiHelperOpen(true);
                    }}
                    className="inline-flex items-center gap-1.5 text-xs text-indigo-400 hover:text-indigo-300 font-semibold"
                  >
                    <Sparkles className="w-3.5 h-3.5" /> Need help defining the problem?
                  </button>
                </div>
                <textarea
                  rows={5}
                  value={problemStatement}
                  onChange={(e) => setProblemStatement(e.target.value)}
                  placeholder="Describe the exact pain point, affected user group, current manual workarounds, and why this problem is urgent..."
                  className="w-full px-4 py-3 rounded-xl bg-slate-950 border border-slate-800 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-indigo-500 leading-relaxed"
                />
                <div className="flex justify-between text-[11px] text-slate-500 mt-1">
                  <span>Aim for specific, measurable pain points.</span>
                  <span>{problemStatement.length} characters</span>
                </div>
              </div>
            </div>

            <div className="flex justify-end pt-4">
              <button
                onClick={handleNextStep}
                className="px-6 py-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-semibold flex items-center gap-2 shadow-lg shadow-indigo-600/30 transition-all"
              >
                Next: Solution Idea <ArrowRight className="w-4 h-4" />
              </button>
            </div>
          </div>
        )}

        {/* STEP 2: INITIAL SOLUTION IDEA */}
        {currentStep === 2 && (
          <div className="p-7 sm:p-9 rounded-3xl bg-slate-900/80 border border-slate-800 space-y-6 shadow-xl animate-in fade-in">
            <div className="space-y-1">
              <span className="text-xs font-bold text-indigo-400 uppercase tracking-wider">Step 02</span>
              <h2 className="text-xl font-bold font-display text-white">Your Initial Solution Idea</h2>
              <p className="text-xs text-slate-400">
                Outline how your application intends to solve the core problem.
              </p>
            </div>

            <div className="space-y-4">
              <div>
                <div className="flex items-center justify-between mb-1">
                  <label className="text-xs font-semibold text-slate-300">Solution Concept *</label>
                  <button
                    type="button"
                    onClick={() => {
                      setAiHelperMode('idea');
                      setAiHelperOpen(true);
                    }}
                    className="inline-flex items-center gap-1.5 text-xs text-indigo-400 hover:text-indigo-300 font-semibold"
                  >
                    <Sparkles className="w-3.5 h-3.5" /> Improve my idea
                  </button>
                </div>
                <textarea
                  rows={6}
                  value={initialIdea}
                  onChange={(e) => setInitialIdea(e.target.value)}
                  placeholder="Describe your core architecture, AI model integration, user experience, and key differentiators..."
                  className="w-full px-4 py-3 rounded-xl bg-slate-950 border border-slate-800 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-indigo-500 leading-relaxed"
                />
                <div className="flex justify-between text-[11px] text-slate-500 mt-1">
                  <span>Highlight your technical differentiators and user workflow.</span>
                  <span>{initialIdea.length} characters</span>
                </div>
              </div>
            </div>

            <div className="flex justify-between items-center pt-4">
              <button
                onClick={() => setCurrentStep(1)}
                className="px-5 py-2.5 rounded-xl border border-slate-700 bg-slate-800 text-slate-300 hover:bg-slate-700 text-xs font-semibold flex items-center gap-2 transition-all"
              >
                <ArrowLeft className="w-4 h-4" /> Back
              </button>

              <button
                onClick={handleNextStep}
                disabled={loading}
                className="px-6 py-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-semibold flex items-center gap-2 shadow-lg shadow-indigo-600/30 transition-all"
              >
                {loading ? <Loader2 className="w-4 h-4 animate-spin" /> : <>Next: Upload Documents <ArrowRight className="w-4 h-4" /></>}
              </button>
            </div>
          </div>
        )}

        {/* STEP 3: UPLOAD DOCUMENTATION (Swapped to Step 03) */}
        {currentStep === 3 && (
          <div className="p-7 sm:p-9 rounded-3xl bg-slate-900/80 border border-slate-800 space-y-6 shadow-xl animate-in fade-in">
            <div className="space-y-1">
              <span className="text-xs font-bold text-indigo-400 uppercase tracking-wider">Step 03</span>
              <h2 className="text-xl font-bold font-display text-white">Upload Project Documentation</h2>
              <p className="text-xs text-slate-400">
                Upload your slides, whitepapers, design docs, or requirements files (PDF, PPT, PPTX, DOC, DOCX, TXT, MD). 
                The AI will read these files to auto-fill your requirements and build a private RAG knowledge base.
              </p>
            </div>

            <div className="p-4 rounded-2xl bg-indigo-500/10 border border-indigo-500/20 text-xs text-indigo-300 flex items-start gap-3">
              <Sparkles className="w-5 h-5 text-indigo-400 flex-shrink-0 mt-0.5" />
              <div>
                <p className="font-semibold text-indigo-200">Smart Document Ingestion</p>
                <p className="text-[11px] text-indigo-300/80 mt-0.5">
                  In the next step, you can click <strong>"Read with Documentation"</strong> to let the AI automatically extract functional specs, tech stack, and user personas from your uploaded files!
                </p>
              </div>
            </div>

            {createdProjectId && (
              <UploadZone
                projectId={createdProjectId}
                onUploadSuccess={(newDocs) => {
                  setUploadedDocs((prev) => [...prev, ...newDocs]);
                }}
              />
            )}

            <div className="flex justify-between items-center pt-4">
              <button
                onClick={() => setCurrentStep(2)}
                className="px-5 py-2.5 rounded-xl border border-slate-700 bg-slate-800 text-slate-300 hover:bg-slate-700 text-xs font-semibold flex items-center gap-2 transition-all"
              >
                <ArrowLeft className="w-4 h-4" /> Back
              </button>

              <button
                onClick={handleNextStep}
                className="px-6 py-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-semibold flex items-center gap-2 shadow-lg shadow-indigo-600/30 transition-all"
              >
                Next: Define Requirements <ArrowRight className="w-4 h-4" />
              </button>
            </div>
          </div>
        )}

        {/* STEP 4: PROJECT REQUIREMENTS (Manual + Read with Documentation) */}
        {currentStep === 4 && (
          <div className="p-7 sm:p-9 rounded-3xl bg-slate-900/80 border border-slate-800 space-y-6 shadow-xl animate-in fade-in">
            
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
              <div className="space-y-1">
                <span className="text-xs font-bold text-indigo-400 uppercase tracking-wider">Step 04</span>
                <h2 className="text-xl font-bold font-display text-white">Project Requirements & Specifications</h2>
                <p className="text-xs text-slate-400">
                  Fill manually, or click below to let AI extract requirements directly from your uploaded documentation.
                </p>
              </div>

              {/* Read with Documentation Button */}
              <button
                type="button"
                onClick={handleReadWithDocumentation}
                disabled={extractingFromDocs}
                className="px-4 py-2.5 rounded-xl bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-500 hover:to-indigo-500 disabled:opacity-50 text-white text-xs font-bold shadow-lg shadow-indigo-600/25 flex items-center gap-2 transition-all hover:scale-[1.02] flex-shrink-0"
              >
                {extractingFromDocs ? (
                  <>
                    <Loader2 className="w-4 h-4 animate-spin" /> Reading Documentation...
                  </>
                ) : (
                  <>
                    <Wand2 className="w-4 h-4" /> Read with Documentation
                  </>
                )}
              </button>
            </div>

            {autoFillSuccessMsg && (
              <div className="p-3.5 rounded-xl bg-emerald-500/10 border border-emerald-500/30 flex items-start gap-2.5 text-xs text-emerald-300 animate-in fade-in">
                <CheckCircle2 className="w-4 h-4 text-emerald-400 flex-shrink-0 mt-0.5" />
                <span>{autoFillSuccessMsg}</span>
              </div>
            )}

            <div className="space-y-6">
              
              {/* 1. Functional Requirements */}
              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <label className="text-xs font-semibold text-slate-300">Functional Requirements</label>
                  <button
                    type="button"
                    onClick={() => addListField(setFunctionalReqs, functionalReqs)}
                    className="text-[11px] text-indigo-400 hover:text-indigo-300 font-semibold flex items-center gap-1"
                  >
                    <Plus className="w-3.5 h-3.5" /> Add Requirement
                  </button>
                </div>
                {functionalReqs.map((req, idx) => (
                  <div key={idx} className="flex items-center gap-2">
                    <input
                      type="text"
                      value={req}
                      onChange={(e) => updateListField(setFunctionalReqs, functionalReqs, idx, e.target.value)}
                      placeholder={`e.g. System allows natural language statutory search with source citations...`}
                      className="flex-1 px-3.5 py-2 rounded-xl bg-slate-950 border border-slate-800 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-indigo-500"
                    />
                    <button
                      type="button"
                      onClick={() => removeListField(setFunctionalReqs, functionalReqs, idx)}
                      className="p-2 text-slate-500 hover:text-rose-400 hover:bg-slate-800 rounded-lg transition-colors"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </div>
                ))}
              </div>

              {/* 2. Technical Requirements */}
              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <label className="text-xs font-semibold text-slate-300">Technical Requirements & Architecture</label>
                  <button
                    type="button"
                    onClick={() => addListField(setTechnicalReqs, technicalReqs)}
                    className="text-[11px] text-indigo-400 hover:text-indigo-300 font-semibold flex items-center gap-1"
                  >
                    <Plus className="w-3.5 h-3.5" /> Add Tech Spec
                  </button>
                </div>
                {technicalReqs.map((req, idx) => (
                  <div key={idx} className="flex items-center gap-2">
                    <input
                      type="text"
                      value={req}
                      onChange={(e) => updateListField(setTechnicalReqs, technicalReqs, idx, e.target.value)}
                      placeholder={`e.g. Sub-500ms vector search response time with pgvector...`}
                      className="flex-1 px-3.5 py-2 rounded-xl bg-slate-950 border border-slate-800 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-indigo-500"
                    />
                    <button
                      type="button"
                      onClick={() => removeListField(setTechnicalReqs, technicalReqs, idx)}
                      className="p-2 text-slate-500 hover:text-rose-400 hover:bg-slate-800 rounded-lg transition-colors"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </div>
                ))}
              </div>

              {/* 3. Target Users */}
              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <label className="text-xs font-semibold text-slate-300">Target User Personas</label>
                  <button
                    type="button"
                    onClick={() => addListField(setTargetUsers, targetUsers)}
                    className="text-[11px] text-indigo-400 hover:text-indigo-300 font-semibold flex items-center gap-1"
                  >
                    <Plus className="w-3.5 h-3.5" /> Add Persona
                  </button>
                </div>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                  {targetUsers.map((user, idx) => (
                    <div key={idx} className="flex items-center gap-2">
                      <input
                        type="text"
                        value={user}
                        onChange={(e) => updateListField(setTargetUsers, targetUsers, idx, e.target.value)}
                        placeholder="e.g. Legal Researchers / Citizens"
                        className="flex-1 px-3.5 py-2 rounded-xl bg-slate-950 border border-slate-800 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-indigo-500"
                      />
                      <button
                        type="button"
                        onClick={() => removeListField(setTargetUsers, targetUsers, idx)}
                        className="p-2 text-slate-500 hover:text-rose-400 hover:bg-slate-800 rounded-lg transition-colors"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  ))}
                </div>
              </div>

              {/* 4. Technologies */}
              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <label className="text-xs font-semibold text-slate-300">Technologies & Frameworks</label>
                  <button
                    type="button"
                    onClick={() => addListField(setTechnologies, technologies)}
                    className="text-[11px] text-indigo-400 hover:text-indigo-300 font-semibold flex items-center gap-1"
                  >
                    <Plus className="w-3.5 h-3.5" /> Add Technology
                  </button>
                </div>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                  {technologies.map((tech, idx) => (
                    <div key={idx} className="flex items-center gap-2">
                      <input
                        type="text"
                        value={tech}
                        onChange={(e) => updateListField(setTechnologies, technologies, idx, e.target.value)}
                        placeholder="e.g. React, Python, Supabase, Gemini"
                        className="flex-1 px-3.5 py-2 rounded-xl bg-slate-950 border border-slate-800 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-indigo-500"
                      />
                      <button
                        type="button"
                        onClick={() => removeListField(setTechnologies, technologies, idx)}
                        className="p-2 text-slate-500 hover:text-rose-400 hover:bg-slate-800 rounded-lg transition-colors"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  ))}
                </div>
              </div>

              {/* 5. Constraints */}
              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <label className="text-xs font-semibold text-slate-300">Constraints & Compliance</label>
                  <button
                    type="button"
                    onClick={() => addListField(setConstraints, constraints)}
                    className="text-[11px] text-indigo-400 hover:text-indigo-300 font-semibold flex items-center gap-1"
                  >
                    <Plus className="w-3.5 h-3.5" /> Add Constraint
                  </button>
                </div>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                  {constraints.map((c, idx) => (
                    <div key={idx} className="flex items-center gap-2">
                      <input
                        type="text"
                        value={c}
                        onChange={(e) => updateListField(setConstraints, constraints, idx, e.target.value)}
                        placeholder="e.g. Strict tenant privacy, Zero hallucination"
                        className="flex-1 px-3.5 py-2 rounded-xl bg-slate-950 border border-slate-800 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-indigo-500"
                      />
                      <button
                        type="button"
                        onClick={() => removeListField(setConstraints, constraints, idx)}
                        className="p-2 text-slate-500 hover:text-rose-400 hover:bg-slate-800 rounded-lg transition-colors"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  ))}
                </div>
              </div>

            </div>

            <div className="flex justify-between items-center pt-4">
              <button
                onClick={() => setCurrentStep(3)}
                className="px-5 py-2.5 rounded-xl border border-slate-700 bg-slate-800 text-slate-300 hover:bg-slate-700 text-xs font-semibold flex items-center gap-2 transition-all"
              >
                <ArrowLeft className="w-4 h-4" /> Back to Documents
              </button>

              <button
                onClick={handleNextStep}
                disabled={loading}
                className="px-6 py-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-semibold flex items-center gap-2 shadow-lg shadow-indigo-600/30 transition-all"
              >
                {loading ? <Loader2 className="w-4 h-4 animate-spin" /> : <>Review & Launch AI Analysis <ArrowRight className="w-4 h-4" /></>}
              </button>
            </div>
          </div>
        )}

        {/* STEP 5: REVIEW & LAUNCH AI ANALYSIS */}
        {currentStep === 5 && (
          <div className="p-7 sm:p-9 rounded-3xl bg-slate-900/80 border border-slate-800 space-y-6 shadow-xl animate-in fade-in">
            <div className="space-y-1">
              <span className="text-xs font-bold text-indigo-400 uppercase tracking-wider">Step 05</span>
              <h2 className="text-xl font-bold font-display text-white">Review & Launch AI Evaluation</h2>
              <p className="text-xs text-slate-400">
                Confirm your project definition and trigger the 12-dimensional evaluation matrix.
              </p>
            </div>

            <div className="space-y-4 text-xs">
              <div className="p-4 rounded-2xl bg-slate-950/70 border border-slate-800/80 space-y-1">
                <span className="text-slate-400 font-semibold uppercase text-[10px]">Project Name</span>
                <p className="font-bold text-white text-sm">{name}</p>
              </div>

              <div className="p-4 rounded-2xl bg-slate-950/70 border border-slate-800/80 space-y-1">
                <span className="text-slate-400 font-semibold uppercase text-[10px]">Problem Statement</span>
                <p className="text-slate-200 leading-relaxed">{problemStatement}</p>
              </div>

              <div className="p-4 rounded-2xl bg-slate-950/70 border border-slate-800/80 space-y-1">
                <span className="text-slate-400 font-semibold uppercase text-[10px]">Solution Idea</span>
                <p className="text-slate-200 leading-relaxed">{initialIdea}</p>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div className="p-4 rounded-2xl bg-slate-950/70 border border-slate-800/80 space-y-1">
                  <span className="text-slate-400 font-semibold uppercase text-[10px]">Functional Requirements</span>
                  <p className="text-slate-200 font-semibold">{functionalReqs.filter(r => r.trim()).length} requirements defined</p>
                </div>

                <div className="p-4 rounded-2xl bg-slate-950/70 border border-slate-800/80 space-y-1">
                  <span className="text-slate-400 font-semibold uppercase text-[10px]">Technical Specs</span>
                  <p className="text-slate-200 font-semibold">{technicalReqs.filter(r => r.trim()).length} specs defined</p>
                </div>
              </div>
            </div>

            <div className="flex justify-between items-center pt-4">
              <button
                onClick={() => setCurrentStep(4)}
                className="px-5 py-2.5 rounded-xl border border-slate-700 bg-slate-800 text-slate-300 hover:bg-slate-700 text-xs font-semibold flex items-center gap-2 transition-all"
              >
                <ArrowLeft className="w-4 h-4" /> Back to Requirements
              </button>

              <button
                onClick={handleLaunchAnalysis}
                disabled={loading}
                className="px-7 py-3 rounded-2xl bg-gradient-to-r from-indigo-600 to-violet-600 hover:from-indigo-500 hover:to-violet-500 text-white font-bold text-xs sm:text-sm shadow-xl shadow-indigo-600/30 flex items-center gap-2 transition-all hover:scale-[1.02]"
              >
                {loading ? (
                  <>
                    <Loader2 className="w-4 h-4 animate-spin" /> Evaluating Project Dimensions...
                  </>
                ) : (
                  <>
                    <Zap className="w-4 h-4" /> Launch 12-Dimensional AI Evaluation
                  </>
                )}
              </button>
            </div>
          </div>
        )}

      </main>

      {/* AI Helper Modal */}
      <AiHelperModal
        isOpen={aiHelperOpen}
        onClose={() => setAiHelperOpen(false)}
        mode={aiHelperMode}
        currentText={aiHelperMode === 'problem' ? problemStatement : initialIdea}
        problemContext={problemStatement}
        onApply={(text) => {
          if (aiHelperMode === 'problem') {
            setProblemStatement(text);
          } else {
            setInitialIdea(text);
          }
        }}
      />

    </div>
  );
}
