import React, { useState } from 'react';
import { useOutletContext } from 'react-router-dom';
import { Compass, Save, Plus, Trash2, Check, Sparkles, Loader2 } from 'lucide-react';
import AiHelperModal from '../components/AiHelperModal';
import { api } from '../lib/api';

export default function ProjectSurveyEditPage() {
  const { project, fetchProject } = useOutletContext();

  const [name, setName] = useState(project.name || '');
  const [description, setDescription] = useState(project.description || '');
  const [problemStatement, setProblemStatement] = useState(project.problem_statement || '');
  const [initialIdea, setInitialIdea] = useState(project.initial_idea || '');
  
  const [targetUsers, setTargetUsers] = useState(project.target_users?.length ? project.target_users : ['']);
  const [technologies, setTechnologies] = useState(project.technologies?.length ? project.technologies : ['']);
  const [constraints, setConstraints] = useState(project.constraints?.length ? project.constraints : ['']);

  const [saving, setSaving] = useState(false);
  const [saveSuccess, setSaveSuccess] = useState(false);

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
    <div className="space-y-6 max-w-3xl mx-auto animate-in fade-in">
      
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h3 className="text-xl font-bold font-display text-white flex items-center gap-2">
            <Compass className="w-5 h-5 text-indigo-400" />
            Project Definition & Survey Context
          </h3>
          <p className="text-xs text-slate-400 mt-1">
            Update problem statement, solution idea, target stakeholders, and constraints.
          </p>
        </div>

        {saveSuccess && (
          <span className="px-3 py-1 rounded-full bg-emerald-500/10 border border-emerald-500/30 text-emerald-400 text-xs font-semibold flex items-center gap-1.5 animate-in fade-in">
            <Check className="w-3.5 h-3.5" /> Saved ✓
          </span>
        )}
      </div>

      <form onSubmit={handleSave} className="p-7 sm:p-9 rounded-3xl bg-slate-900/80 border border-slate-800 space-y-6 shadow-xl">
        
        {/* Project Name */}
        <div>
          <label className="block text-xs font-semibold text-slate-300 mb-1">Project Name</label>
          <input
            type="text"
            value={name}
            onChange={(e) => setName(e.target.value)}
            className="w-full px-3.5 py-2.5 rounded-xl bg-slate-950 border border-slate-800 text-xs text-white focus:outline-none focus:border-indigo-500"
          />
        </div>

        {/* Problem Statement */}
        <div>
          <div className="flex items-center justify-between mb-1">
            <label className="text-xs font-semibold text-slate-300">Problem Statement</label>
            <button
              type="button"
              onClick={() => {
                setAiHelperMode('problem');
                setAiHelperOpen(true);
              }}
              className="text-xs text-indigo-400 hover:text-indigo-300 font-semibold flex items-center gap-1"
            >
              <Sparkles className="w-3 h-3 text-indigo-400" /> Improve with Gemini
            </button>
          </div>
          <textarea
            rows={4}
            value={problemStatement}
            onChange={(e) => setProblemStatement(e.target.value)}
            className="w-full px-3.5 py-2.5 rounded-xl bg-slate-950 border border-slate-800 text-xs text-slate-200 focus:outline-none focus:border-indigo-500 resize-none leading-relaxed"
          />
        </div>

        {/* Initial Idea */}
        <div>
          <div className="flex items-center justify-between mb-1">
            <label className="text-xs font-semibold text-slate-300">Initial Solution Idea</label>
            <button
              type="button"
              onClick={() => {
                setAiHelperMode('idea');
                setAiHelperOpen(true);
              }}
              className="text-xs text-indigo-400 hover:text-indigo-300 font-semibold flex items-center gap-1"
            >
              <Sparkles className="w-3 h-3 text-indigo-400" /> Improve with Gemini
            </button>
          </div>
          <textarea
            rows={4}
            value={initialIdea}
            onChange={(e) => setInitialIdea(e.target.value)}
            className="w-full px-3.5 py-2.5 rounded-xl bg-slate-950 border border-slate-800 text-xs text-slate-200 focus:outline-none focus:border-indigo-500 resize-none leading-relaxed"
          />
        </div>

        {/* Target Users */}
        <div className="space-y-2 pt-2 border-t border-slate-800/80">
          <div className="flex items-center justify-between">
            <label className="text-xs font-bold uppercase tracking-wider text-emerald-400">Target Users</label>
            <button
              type="button"
              onClick={() => addField(setTargetUsers, targetUsers)}
              className="text-[11px] text-emerald-400 font-semibold flex items-center gap-1"
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
                className="flex-1 px-3 py-1.5 rounded-lg bg-slate-950 border border-slate-800 text-xs text-white focus:outline-none focus:border-indigo-500"
              />
              <button
                type="button"
                onClick={() => removeField(setTargetUsers, targetUsers, i)}
                className="p-1.5 text-slate-500 hover:text-rose-400"
              >
                <Trash2 className="w-3.5 h-3.5" />
              </button>
            </div>
          ))}
        </div>

        {/* Technologies */}
        <div className="space-y-2 pt-2 border-t border-slate-800/80">
          <div className="flex items-center justify-between">
            <label className="text-xs font-bold uppercase tracking-wider text-purple-400">Technologies</label>
            <button
              type="button"
              onClick={() => addField(setTechnologies, technologies)}
              className="text-[11px] text-purple-400 font-semibold flex items-center gap-1"
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
                className="flex-1 px-3 py-1.5 rounded-lg bg-slate-950 border border-slate-800 text-xs text-white focus:outline-none focus:border-indigo-500"
              />
              <button
                type="button"
                onClick={() => removeField(setTechnologies, technologies, i)}
                className="p-1.5 text-slate-500 hover:text-rose-400"
              >
                <Trash2 className="w-3.5 h-3.5" />
              </button>
            </div>
          ))}
        </div>

        {/* Save Button */}
        <div className="flex justify-end pt-4 border-t border-slate-800">
          <button
            type="submit"
            disabled={saving}
            className="px-6 py-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-500 disabled:opacity-50 text-white text-xs font-bold shadow-lg shadow-indigo-600/30 flex items-center gap-2 transition-all"
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
