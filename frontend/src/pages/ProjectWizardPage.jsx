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
  HelpCircle
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
  
  // Structured Requirements
  const [functionalReqs, setFunctionalReqs] = useState(['']);
  const [technicalReqs, setTechnicalReqs] = useState(['']);
  const [targetUsers, setTargetUsers] = useState(['']);
  const [constraints, setConstraints] = useState(['']);
  const [technologies, setTechnologies] = useState(['']);

  // Document Uploads
  const [uploadedDocs, setUploadedDocs] = useState([]);

  // AI Helper Modal State
  const [aiHelperOpen, setAiHelperOpen] = useState(false);
  const [aiHelperMode, setAiHelperMode] = useState('problem'); // 'problem' or 'idea'

  // Loading
  const [loading, setLoading] = useState(false);

  const steps = [
    { num: 1, label: '01 Problem' },
    { num: 2, label: '02 Idea' },
    { num: 3, label: '03 Requirements' },
    { num: 4, label: '04 Documents' },
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

  // Step Navigation & Save
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
      setCurrentStep(3);
    } else if (currentStep === 3) {
      // Create or update project in backend
      setLoading(true);
      try {
        const formattedReqs = [
          ...functionalReqs.filter(r => r.trim()).map(r => ({ category: 'functional', requirement: r, priority: 'HIGH' })),
          ...technicalReqs.filter(r => r.trim()).map(r => ({ category: 'technical', requirement: r, priority: 'HIGH' })),
          ...constraints.filter(r => r.trim()).map(r => ({ category: 'constraints', requirement: r, priority: 'MEDIUM' })),
        ];

        const payload = {
          name: name.trim(),
          description: description.trim() || problemStatement.slice(0, 120),
          problem_statement: problemStatement.trim(),
          initial_idea: initialIdea.trim(),
          target_users: targetUsers.filter(u => u.trim()),
          technologies: technologies.filter(t => t.trim()),
          constraints: constraints.filter(c => c.trim()),
          requirements: formattedReqs,
          user_id: user?.id || 'demo-user',
        };

        const res = await api.createProject(payload);
        setCreatedProjectId(res.id);
        setCurrentStep(4);
      } catch (err) {
        alert(err.message || 'Failed to save project survey');
      } finally {
        setLoading(false);
      }
    } else if (currentStep === 4) {
      setCurrentStep(5);
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
                  <div className="w-6 sm:w-12 h-px bg-slate-800 ml-2" />
                )}
              </div>
            );
          })}
        </div>

        {/* STEP 1: PROBLEM STATEMENT */}
        {currentStep === 1 && (
          <div className="p-7 sm:p-9 rounded-3xl bg-slate-900/80 border border-slate-800 space-y-6 shadow-xl animate-in fade-in">
            <div>
              <span className="text-xs uppercase font-bold text-rose-400 tracking-wider">Step 01</span>
              <h2 className="text-xl sm:text-2xl font-bold font-display text-white mt-1">
                What problem are you trying to solve?
              </h2>
              <p className="text-xs text-slate-400 mt-1">
                Give your project a name and define the core real-world pain point.
              </p>
            </div>

            <div className="space-y-4">
              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1">Project Name *</label>
                <input
                  type="text"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder="e.g., CivicLens AI, MediCare RAG, FinAudit AI..."
                  className="w-full px-4 py-2.5 rounded-xl bg-slate-950 border border-slate-800 text-sm text-white focus:outline-none focus:border-indigo-500"
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
                    className="text-xs text-indigo-400 hover:text-indigo-300 font-semibold flex items-center gap-1 bg-indigo-500/10 px-2.5 py-1 rounded-lg border border-indigo-500/20"
                  >
                    <Sparkles className="w-3 h-3 text-indigo-400" /> Need help defining the problem?
                  </button>
                </div>
                <textarea
                  rows={5}
                  value={problemStatement}
                  onChange={(e) => setProblemStatement(e.target.value)}
                  placeholder="Describe the real-world problem your project is trying to solve in detail..."
                  className="w-full px-4 py-3 rounded-xl bg-slate-950 border border-slate-800 text-sm text-slate-200 focus:outline-none focus:border-indigo-500 resize-none leading-relaxed"
                />
                <div className="flex justify-end text-[11px] text-slate-500 mt-1">
                  {problemStatement.length} characters
                </div>
              </div>
            </div>

            <div className="flex justify-end pt-4 border-t border-slate-800">
              <button
                onClick={handleNextStep}
                className="px-6 py-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-semibold flex items-center gap-2 shadow-lg shadow-indigo-600/30 transition-all"
              >
                Next: Initial Idea <ArrowRight className="w-3.5 h-3.5" />
              </button>
            </div>
          </div>
        )}

        {/* STEP 2: INITIAL IDEA */}
        {currentStep === 2 && (
          <div className="p-7 sm:p-9 rounded-3xl bg-slate-900/80 border border-slate-800 space-y-6 shadow-xl animate-in fade-in">
            <div>
              <span className="text-xs uppercase font-bold text-indigo-400 tracking-wider">Step 02</span>
              <h2 className="text-xl sm:text-2xl font-bold font-display text-white mt-1">
                What is your initial idea?
              </h2>
              <p className="text-xs text-slate-400 mt-1">
                Explain your proposed solution in simple terms.
              </p>
            </div>

            <div className="space-y-4">
              <div>
                <div className="flex items-center justify-between mb-1">
                  <label className="text-xs font-semibold text-slate-300">Solution Idea *</label>
                  <button
                    type="button"
                    onClick={() => {
                      setAiHelperMode('idea');
                      setAiHelperOpen(true);
                    }}
                    className="text-xs text-indigo-400 hover:text-indigo-300 font-semibold flex items-center gap-1 bg-indigo-500/10 px-2.5 py-1 rounded-lg border border-indigo-500/20"
                  >
                    <Sparkles className="w-3 h-3 text-indigo-400" /> Improve my idea
                  </button>
                </div>
                <textarea
                  rows={5}
                  value={initialIdea}
                  onChange={(e) => setInitialIdea(e.target.value)}
                  placeholder="Explain your initial solution idea in simple words..."
                  className="w-full px-4 py-3 rounded-xl bg-slate-950 border border-slate-800 text-sm text-slate-200 focus:outline-none focus:border-indigo-500 resize-none leading-relaxed"
                />
                <div className="flex justify-end text-[11px] text-slate-500 mt-1">
                  {initialIdea.length} characters
                </div>
              </div>
            </div>

            <div className="flex items-center justify-between pt-4 border-t border-slate-800">
              <button
                onClick={() => setCurrentStep(1)}
                className="px-5 py-2 rounded-xl text-slate-400 hover:text-white text-xs font-semibold flex items-center gap-1.5"
              >
                <ArrowLeft className="w-3.5 h-3.5" /> Back
              </button>
              <button
                onClick={handleNextStep}
                className="px-6 py-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-semibold flex items-center gap-2 shadow-lg shadow-indigo-600/30 transition-all"
              >
                Next: Requirements <ArrowRight className="w-3.5 h-3.5" />
              </button>
            </div>
          </div>
        )}

        {/* STEP 3: STRUCTURED REQUIREMENTS */}
        {currentStep === 3 && (
          <div className="p-7 sm:p-9 rounded-3xl bg-slate-900/80 border border-slate-800 space-y-6 shadow-xl animate-in fade-in">
            <div>
              <span className="text-xs uppercase font-bold text-blue-400 tracking-wider">Step 03</span>
              <h2 className="text-xl sm:text-2xl font-bold font-display text-white mt-1">
                What are the requirements?
              </h2>
              <p className="text-xs text-slate-400 mt-1">
                Break down functional specs, technical constraints, target users, and technology preferences.
              </p>
            </div>

            {/* Functional Requirements */}
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <label className="text-xs font-bold uppercase tracking-wider text-indigo-300">
                  Functional Requirements
                </label>
                <button
                  type="button"
                  onClick={() => addListField(setFunctionalReqs, functionalReqs)}
                  className="text-[11px] text-indigo-400 hover:text-indigo-300 font-semibold flex items-center gap-1"
                >
                  <Plus className="w-3 h-3" /> Add requirement
                </button>
              </div>
              {functionalReqs.map((req, idx) => (
                <div key={idx} className="flex items-center gap-2">
                  <input
                    type="text"
                    value={req}
                    onChange={(e) => updateListField(setFunctionalReqs, functionalReqs, idx, e.target.value)}
                    placeholder={`e.g. Document parsing with page-level citations...`}
                    className="flex-1 px-3.5 py-2 rounded-xl bg-slate-950 border border-slate-800 text-xs text-white focus:outline-none focus:border-indigo-500"
                  />
                  <button
                    onClick={() => removeListField(setFunctionalReqs, functionalReqs, idx)}
                    className="p-2 text-slate-500 hover:text-rose-400"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                  </button>
                </div>
              ))}
            </div>

            {/* Technical Requirements */}
            <div className="space-y-2 pt-2 border-t border-slate-800/80">
              <div className="flex items-center justify-between">
                <label className="text-xs font-bold uppercase tracking-wider text-purple-300">
                  Technical Requirements
                </label>
                <button
                  type="button"
                  onClick={() => addListField(setTechnicalReqs, technicalReqs)}
                  className="text-[11px] text-purple-400 hover:text-purple-300 font-semibold flex items-center gap-1"
                >
                  <Plus className="w-3 h-3" /> Add requirement
                </button>
              </div>
              {technicalReqs.map((req, idx) => (
                <div key={idx} className="flex items-center gap-2">
                  <input
                    type="text"
                    value={req}
                    onChange={(e) => updateListField(setTechnicalReqs, technicalReqs, idx, e.target.value)}
                    placeholder={`e.g. Vector similarity search using Supabase pgvector...`}
                    className="flex-1 px-3.5 py-2 rounded-xl bg-slate-950 border border-slate-800 text-xs text-white focus:outline-none focus:border-indigo-500"
                  />
                  <button
                    onClick={() => removeListField(setTechnicalReqs, technicalReqs, idx)}
                    className="p-2 text-slate-500 hover:text-rose-400"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                  </button>
                </div>
              ))}
            </div>

            {/* Target Users */}
            <div className="space-y-2 pt-2 border-t border-slate-800/80">
              <div className="flex items-center justify-between">
                <label className="text-xs font-bold uppercase tracking-wider text-emerald-300">
                  Target Users
                </label>
                <button
                  type="button"
                  onClick={() => addListField(setTargetUsers, targetUsers)}
                  className="text-[11px] text-emerald-400 hover:text-emerald-300 font-semibold flex items-center gap-1"
                >
                  <Plus className="w-3 h-3" /> Add user
                </button>
              </div>
              {targetUsers.map((userRole, idx) => (
                <div key={idx} className="flex items-center gap-2">
                  <input
                    type="text"
                    value={userRole}
                    onChange={(e) => updateListField(setTargetUsers, targetUsers, idx, e.target.value)}
                    placeholder={`e.g. Municipal officers, Citizens, Compliance auditors...`}
                    className="flex-1 px-3.5 py-2 rounded-xl bg-slate-950 border border-slate-800 text-xs text-white focus:outline-none focus:border-indigo-500"
                  />
                  <button
                    onClick={() => removeListField(setTargetUsers, targetUsers, idx)}
                    className="p-2 text-slate-500 hover:text-rose-400"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                  </button>
                </div>
              ))}
            </div>

            {/* Constraints */}
            <div className="space-y-2 pt-2 border-t border-slate-800/80">
              <div className="flex items-center justify-between">
                <label className="text-xs font-bold uppercase tracking-wider text-amber-300">
                  Constraints & Security Requirements
                </label>
                <button
                  type="button"
                  onClick={() => addListField(setConstraints, constraints)}
                  className="text-[11px] text-amber-400 hover:text-amber-300 font-semibold flex items-center gap-1"
                >
                  <Plus className="w-3 h-3" /> Add constraint
                </button>
              </div>
              {constraints.map((c, idx) => (
                <div key={idx} className="flex items-center gap-2">
                  <input
                    type="text"
                    value={c}
                    onChange={(e) => updateListField(setConstraints, constraints, idx, e.target.value)}
                    placeholder={`e.g. Strict data privacy under GDPR, sub-2s response latency...`}
                    className="flex-1 px-3.5 py-2 rounded-xl bg-slate-950 border border-slate-800 text-xs text-white focus:outline-none focus:border-indigo-500"
                  />
                  <button
                    onClick={() => removeListField(setConstraints, constraints, idx)}
                    className="p-2 text-slate-500 hover:text-rose-400"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                  </button>
                </div>
              ))}
            </div>

            <div className="flex items-center justify-between pt-4 border-t border-slate-800">
              <button
                onClick={() => setCurrentStep(2)}
                className="px-5 py-2 rounded-xl text-slate-400 hover:text-white text-xs font-semibold flex items-center gap-1.5"
              >
                <ArrowLeft className="w-3.5 h-3.5" /> Back
              </button>
              <button
                onClick={handleNextStep}
                disabled={loading}
                className="px-6 py-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-500 disabled:opacity-50 text-white text-xs font-semibold flex items-center gap-2 shadow-lg shadow-indigo-600/30 transition-all"
              >
                {loading ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : 'Continue to Documentation'}
                <ArrowRight className="w-3.5 h-3.5" />
              </button>
            </div>
          </div>
        )}

        {/* STEP 4: DOCUMENT UPLOAD */}
        {currentStep === 4 && (
          <div className="p-7 sm:p-9 rounded-3xl bg-slate-900/80 border border-slate-800 space-y-6 shadow-xl animate-in fade-in">
            <div>
              <span className="text-xs uppercase font-bold text-amber-400 tracking-wider">Step 04</span>
              <h2 className="text-xl sm:text-2xl font-bold font-display text-white mt-1">
                Give your AI the project context.
              </h2>
              <p className="text-xs text-slate-400 mt-1">
                Upload your project documentation and let ProjectLens index and understand it.
              </p>
            </div>

            <UploadZone
              projectId={createdProjectId}
              onUploadSuccess={(docs) => {
                setUploadedDocs((prev) => [...prev, ...docs]);
              }}
            />

            <div className="flex items-center justify-between pt-4 border-t border-slate-800">
              <button
                onClick={() => setCurrentStep(3)}
                className="px-5 py-2 rounded-xl text-slate-400 hover:text-white text-xs font-semibold flex items-center gap-1.5"
              >
                <ArrowLeft className="w-3.5 h-3.5" /> Back
              </button>
              <button
                onClick={handleNextStep}
                className="px-6 py-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-semibold flex items-center gap-2 shadow-lg shadow-indigo-600/30 transition-all"
              >
                Review Summary <ArrowRight className="w-3.5 h-3.5" />
              </button>
            </div>
          </div>
        )}

        {/* STEP 5: PROJECT SUMMARY & AI ANALYSIS */}
        {currentStep === 5 && (
          <div className="p-7 sm:p-9 rounded-3xl bg-slate-900/80 border border-slate-800 space-y-6 shadow-xl animate-in fade-in">
            <div>
              <span className="text-xs uppercase font-bold text-emerald-400 tracking-wider">Step 05</span>
              <h2 className="text-xl sm:text-2xl font-bold font-display text-white mt-1">
                Project Summary & AI Launch
              </h2>
              <p className="text-xs text-slate-400 mt-1">
                Review your configuration before launching Gemini 12-category evaluation & AI Board generation.
              </p>
            </div>

            <div className="space-y-4 rounded-2xl bg-slate-950/60 border border-slate-800/80 p-5 text-xs text-slate-300">
              <div>
                <span className="font-bold text-slate-400 uppercase tracking-wider text-[10px]">Project:</span>
                <p className="text-sm font-semibold text-white mt-0.5">{name}</p>
              </div>

              <div className="pt-2 border-t border-slate-900">
                <span className="font-bold text-slate-400 uppercase tracking-wider text-[10px]">Problem Statement:</span>
                <p className="text-slate-200 mt-0.5 leading-relaxed">{problemStatement}</p>
              </div>

              <div className="pt-2 border-t border-slate-900">
                <span className="font-bold text-slate-400 uppercase tracking-wider text-[10px]">Initial Idea:</span>
                <p className="text-slate-200 mt-0.5 leading-relaxed">{initialIdea}</p>
              </div>

              <div className="pt-2 border-t border-slate-900">
                <span className="font-bold text-slate-400 uppercase tracking-wider text-[10px]">Requirements:</span>
                <ul className="mt-1 space-y-1 text-slate-300 list-disc list-inside">
                  {functionalReqs.filter(r => r.trim()).map((r, i) => (
                    <li key={i}>[Func] {r}</li>
                  ))}
                  {technicalReqs.filter(r => r.trim()).map((r, i) => (
                    <li key={i}>[Tech] {r}</li>
                  ))}
                </ul>
              </div>

              <div className="pt-2 border-t border-slate-900 flex items-center justify-between text-slate-400">
                <span>Uploaded Documents:</span>
                <span className="font-semibold text-indigo-400">{uploadedDocs.length} files indexed</span>
              </div>
            </div>

            <div className="flex items-center justify-between pt-4 border-t border-slate-800">
              <button
                onClick={() => setCurrentStep(4)}
                className="px-5 py-2 rounded-xl text-slate-400 hover:text-white text-xs font-semibold flex items-center gap-1.5"
              >
                <ArrowLeft className="w-3.5 h-3.5" /> Back
              </button>
              <button
                onClick={handleLaunchAnalysis}
                disabled={loading}
                className="px-7 py-3 rounded-2xl bg-gradient-to-r from-indigo-600 to-violet-600 hover:from-indigo-500 hover:to-violet-500 text-white text-xs sm:text-sm font-bold shadow-xl shadow-indigo-600/30 flex items-center gap-2 transition-all hover:scale-[1.02]"
              >
                {loading ? (
                  <>
                    <Loader2 className="w-4 h-4 animate-spin" />
                    Running 12-Category AI Evaluation...
                  </>
                ) : (
                  <>
                    <Zap className="w-4 h-4" />
                    Launch AI Evaluation & AI Board
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
        initialText={aiHelperMode === 'problem' ? problemStatement : initialIdea}
        problemContext={problemStatement}
        onApply={(text, extra) => {
          if (aiHelperMode === 'problem') {
            setProblemStatement(text);
          } else {
            setInitialIdea(text);
            if (extra && extra.length) {
              setTechnologies(extra);
            }
          }
        }}
      />

    </div>
  );
}
