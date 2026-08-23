import React, { useState } from 'react';
import { useOutletContext } from 'react-router-dom';
import { Compass, Save, Plus, Trash2, Check, Sparkles, Loader2, Wand2, CheckCircle2, Globe, ExternalLink } from 'lucide-react';
import AiHelperModal from '../components/AiHelperModal';
import { api } from '../lib/api';

export default function ProjectSurveyEditPage() {
  const { project, fetchProject } = useOutletContext();

  const [name, setName] = useState(project.name || '');
  const [description, setDescription] = useState(project.description || '');
  const [problemStatement, setProblemStatement] = useState(project.problem_statement || '');
  const [initialIdea, setInitialIdea] = useState(project.initial_idea || '');
  const [demoUrl, setDemoUrl] = useState(project.demo_url || '');
  
  const [targetUsers, setTargetUsers] = useState(project.target_users?.length ? project.target_users : ['']);
  const [technologies, setTechnologies] = useState(project.technologies?.length ? project.technologies : ['']);
  const [constraints, setConstraints] = useState(project.constraints?.length ? project.constraints : ['']);

  const [saving, setSaving] = useState(false);
  const [saveSuccess, setSaveSuccess] = useState(false);
  const [extractingFromDocs, setExtractingFromDocs] = useState(false);
  const [extractMsg, setExtractMsg] = useState('');

  // AI Helper Modal
  const [aiHelperOpen, setAiHelperOpen] = useState(false);
  const [aiHelperMode, setAiHelperMode] = useState('problem');

  const addField = (setter, list) => setter([...list, '']);
  const updateField = (setter, list, i, val) => {
    const next = [...list];
    next[i] = val;
    setter(next);
  };
  const removeField = (setter, list, i) => {
    if (list.length === 1) {
      setter(['']);
      return;
    }
    setter(list.filter((_, idx) => idx !== i));
  };

  const handleReadWithDocumentation = async () => {
    setExtractingFromDocs(true);
    setExtractMsg('');
    try {
      const extracted = await api.extractRequirements(project.id);
      if (extracted) {
        if (extracted.target_users?.length) {
          setTargetUsers(extracted.target_users);
        }
        if (extracted.technologies?.length) {
          setTechnologies(extracted.technologies);
        }
        if (extracted.constraints?.length) {
          setConstraints(extracted.constraints);
        }
        setExtractMsg('✨ AI successfully analyzed your uploaded documents and enriched your project specs!');
        setTimeout(() => setExtractMsg(''), 6000);
      }
    } catch (err) {
      alert('Could not extract requirements from documentation. You can edit them manually.');
    } finally {
      setExtractingFromDocs(false);
    }
  };

  const handleSave = async (e) => {
    e.preventDefault();
    setSaving(true);
    setSaveSuccess(false);
    try {
      await api.updateProject(project.id, {
        name,
        description,
        problem_statement: problemStatement,
        initial_idea: initialIdea,
        demo_url: demoUrl.trim(),
        target_users: targetUsers.filter(u => u.trim()),
        technologies: technologies.filter(t => t.trim()),
        constraints: constraints.filter(c => c.trim()),
      });
      await fetchProject();
      setSaveSuccess(true);
      setTimeout(() => setSaveSuccess(false), 3000);
    } catch (err) {
      alert(err.message || 'Failed to update survey.');
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="space-y-6 max-w-3xl mx-auto animate-in fade-in text-zinc-100">
      
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div>
          <h3 className="text-xl font-bold font-display text-zinc-100 flex items-center gap-2">
            <Compass className="w-5 h-5 text-red-500" />
            Project Definition & Survey Context
          </h3>
          <p className="text-xs text-zinc-400 mt-1 font-normal">
            Update problem statement, solution idea, live deployed demo URL, target stakeholders, and constraints.
          </p>
        </div>

        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={handleReadWithDocumentation}
            disabled={extractingFromDocs}
            className="px-3.5 py-1.5 rounded-xl bg-zinc-900 border border-zinc-800 hover:border-red-500/40 text-zinc-200 hover:text-white text-xs font-bold shadow-md flex items-center gap-1.5 transition-all"
          >
            {extractingFromDocs ? (
              <Loader2 className="w-3.5 h-3.5 animate-spin text-red-400" />
            ) : (
              <Wand2 className="w-3.5 h-3.5 text-red-400" />
            )}
            Read with Documentation
          </button>

          {saveSuccess && (
            <span className="px-3 py-1 rounded-full bg-red-950/40 border border-red-500/30 text-red-400 text-xs font-semibold flex items-center gap-1.5 animate-in fade-in">
              <Check className="w-3.5 h-3.5" /> Saved ✓
            </span>
          )}
        </div>
      </div>

      {extractMsg && (
        <div className="p-3.5 rounded-xl bg-red-950/30 border border-red-500/30 flex items-start gap-2.5 text-xs text-red-300 animate-in fade-in">
          <CheckCircle2 className="w-4 h-4 text-red-400 flex-shrink-0 mt-0.5" />
          <span>{extractMsg}</span>
        </div>
      )}

      <form onSubmit={handleSave} className="p-7 sm:p-9 rounded-3xl bg-zinc-900/90 border border-zinc-800 space-y-6 shadow-xl">
        
        {/* Project Name */}
        <div>
          <label className="block text-xs font-semibold text-zinc-300 mb-1">Project Name</label>
          <input
            type="text"
            value={name}
            onChange={(e) => setName(e.target.value)}
            className="w-full px-3.5 py-2.5 rounded-xl bg-zinc-950 border border-zinc-800 text-xs text-white focus:outline-none focus:border-red-500 focus:bg-black"
          />
        </div>

        {/* Live Deployed Demo URL */}
        <div>
          <div className="flex items-center justify-between mb-1">
            <label className="text-xs font-semibold text-zinc-300">Live Deployed Application URL</label>
            {demoUrl && (
              <a
                href={demoUrl.startsWith('http') ? demoUrl : `https://${demoUrl}`}
                target="_blank"
                rel="noopener noreferrer"
                className="text-xs text-red-400 hover:text-red-300 font-semibold flex items-center gap-1"
              >
                <ExternalLink className="w-3 h-3" /> Test App Live
              </a>
            )}
          </div>
          <div className="relative">
            <Globe className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-zinc-500" />
            <input
              type="url"
              value={demoUrl}
              onChange={(e) => setDemoUrl(e.target.value)}
              placeholder="https://my-app.vercel.app or deployed prototype URL"
              className="w-full pl-10 pr-4 py-2.5 rounded-xl bg-zinc-950 border border-zinc-800 text-xs text-white focus:outline-none focus:border-red-500 focus:bg-black"
            />
          </div>
          <p className="text-[11px] text-zinc-500 mt-1 font-normal">
            Used during 12-dimensional judging and RAG queries to evaluate the live working prototype.
          </p>
        </div>

        {/* Problem Statement */}
        <div>
          <div className="flex items-center justify-between mb-1">
            <label className="text-xs font-semibold text-zinc-300">Problem Statement</label>
            <button
              type="button"
              onClick={() => {
                setAiHelperMode('problem');
                setAiHelperOpen(true);
              }}
              className="text-xs text-red-400 hover:text-red-300 font-semibold flex items-center gap-1"
            >
              <Sparkles className="w-3 h-3 text-red-400" /> Improve with Gemini
            </button>
          </div>
          <textarea
            rows={4}
            value={problemStatement}
            onChange={(e) => setProblemStatement(e.target.value)}
            className="w-full px-3.5 py-2.5 rounded-xl bg-zinc-950 border border-zinc-800 text-xs text-zinc-200 focus:outline-none focus:border-red-500 focus:bg-black resize-none leading-relaxed"
          />
        </div>

        {/* Initial Idea */}
        <div>
          <div className="flex items-center justify-between mb-1">
            <label className="text-xs font-semibold text-zinc-300">Initial Solution Idea</label>
            <button
              type="button"
              onClick={() => {
                setAiHelperMode('idea');
                setAiHelperOpen(true);
              }}
              className="text-xs text-red-400 hover:text-red-300 font-semibold flex items-center gap-1"
            >
              <Sparkles className="w-3 h-3 text-red-400" /> Improve with Gemini
            </button>
          </div>
          <textarea
            rows={4}
            value={initialIdea}
            onChange={(e) => setInitialIdea(e.target.value)}
            className="w-full px-3.5 py-2.5 rounded-xl bg-zinc-950 border border-zinc-800 text-xs text-zinc-200 focus:outline-none focus:border-red-500 focus:bg-black resize-none leading-relaxed"
          />
        </div>

        {/* Target Users */}
        <div className="space-y-2 pt-2 border-t border-zinc-800">
          <div className="flex items-center justify-between">
            <label className="text-xs font-bold uppercase tracking-wider text-red-400 font-mono">Target Users</label>
            <button
              type="button"
              onClick={() => addField(setTargetUsers, targetUsers)}
              className="text-[11px] text-red-400 font-semibold flex items-center gap-1 hover:text-red-300"
            >
              <Plus className="w-3 h-3" /> Add User
            </button>
          </div>
          {targetUsers.map((u, i) => (
            <div key={i} className="flex items-center gap-2">
              <input
                type="text"
                value={u}
                onChange={(e) => updateField(setTargetUsers, targetUsers, i, e.target.value)}
                className="flex-1 px-3 py-1.5 rounded-lg bg-zinc-950 border border-zinc-800 text-xs text-white focus:outline-none focus:border-red-500"
              />
              <button
                type="button"
                onClick={() => removeField(setTargetUsers, targetUsers, i)}
                className="p-1.5 text-zinc-500 hover:text-rose-400"
              >
                <Trash2 className="w-3.5 h-3.5" />
              </button>
            </div>
          ))}
        </div>

        {/* Technologies */}
        <div className="space-y-2 pt-2 border-t border-zinc-800">
          <div className="flex items-center justify-between">
            <label className="text-xs font-bold uppercase tracking-wider text-rose-400 font-mono">Technologies</label>
            <button
              type="button"
              onClick={() => addField(setTechnologies, technologies)}
              className="text-[11px] text-rose-400 font-semibold flex items-center gap-1 hover:text-rose-300"
            >
              <Plus className="w-3 h-3" /> Add Tech
            </button>
          </div>
          {technologies.map((t, i) => (
            <div key={i} className="flex items-center gap-2">
              <input
                type="text"
                value={t}
                onChange={(e) => updateField(setTechnologies, technologies, i, e.target.value)}
                className="flex-1 px-3 py-1.5 rounded-lg bg-zinc-950 border border-zinc-800 text-xs text-white focus:outline-none focus:border-red-500"
              />
              <button
                type="button"
                onClick={() => removeField(setTechnologies, technologies, i)}
                className="p-1.5 text-zinc-500 hover:text-rose-400"
              >
                <Trash2 className="w-3.5 h-3.5" />
              </button>
            </div>
          ))}
        </div>

        {/* Constraints */}
        <div className="space-y-2 pt-2 border-t border-zinc-800">
          <div className="flex items-center justify-between">
            <label className="text-xs font-bold uppercase tracking-wider text-amber-400 font-mono">Constraints & Compliance</label>
            <button
              type="button"
              onClick={() => addField(setConstraints, constraints)}
              className="text-[11px] text-amber-400 font-semibold flex items-center gap-1 hover:text-amber-300"
            >
              <Plus className="w-3 h-3" /> Add Constraint
            </button>
          </div>
          {constraints.map((c, i) => (
            <div key={i} className="flex items-center gap-2">
              <input
                type="text"
                value={c}
                onChange={(e) => updateField(setConstraints, constraints, i, e.target.value)}
                className="flex-1 px-3 py-1.5 rounded-lg bg-zinc-950 border border-zinc-800 text-xs text-white focus:outline-none focus:border-red-500"
              />
              <button
                type="button"
                onClick={() => removeField(setConstraints, constraints, i)}
                className="p-1.5 text-zinc-500 hover:text-rose-400"
              >
                <Trash2 className="w-3.5 h-3.5" />
              </button>
            </div>
          ))}
        </div>

        {/* Save Button */}
        <div className="flex justify-end pt-4 border-t border-zinc-800">
          <button
            type="submit"
            disabled={saving}
            className="px-6 py-2.5 rounded-xl bg-gradient-to-r from-red-600 to-rose-600 hover:from-red-500 hover:to-rose-500 disabled:opacity-50 text-white text-xs font-bold shadow-lg shadow-red-600/25 flex items-center gap-2 transition-all border border-red-500/30"
          >
            {saving ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <Save className="w-3.5 h-3.5" />}
            Save Survey Changes
          </button>
        </div>

      </form>

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
