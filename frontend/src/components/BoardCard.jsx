import React, { useState } from 'react';
import { 
  CheckCircle2, 
  Circle, 
  Pin, 
  Trash2, 
  Edit3, 
  Sparkles, 
  ArrowRight, 
  ArrowLeft,
  AlertTriangle,
  Clock
} from 'lucide-react';

export default function BoardCard({ 
  card, 
  columns, 
  onMoveColumn, 
  onToggleComplete, 
  onTogglePin, 
  onDelete, 
  onEdit 
}) {
  const [isEditing, setIsEditing] = useState(false);
  const [title, setTitle] = useState(card.title || '');
  const [description, setDescription] = useState(card.description || '');
  const [priority, setPriority] = useState(card.priority || 'MEDIUM');

  const handleSave = () => {
    onEdit(card.id, { title, description, priority });
    setIsEditing(false);
  };

  const currentColumnIndex = columns.findIndex(c => c.id === card.column_name);

  const getPriorityBadge = (p) => {
    switch (p?.toUpperCase()) {
      case 'HIGH':
        return 'bg-rose-500/15 text-rose-400 border-rose-500/30';
      case 'LOW':
        return 'bg-slate-800 text-slate-400 border-slate-700';
      case 'MEDIUM':
      default:
        return 'bg-amber-500/15 text-amber-400 border-amber-500/30';
    }
  };

  const isAI = card.source_type === 'evaluation' || card.source_type === 'ai_helper';

  if (isEditing) {
    return (
      <div className="p-3.5 rounded-xl border border-indigo-500/50 bg-slate-900 shadow-xl space-y-3">
        <input
          type="text"
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          className="w-full px-2.5 py-1.5 rounded-lg bg-slate-950 border border-slate-800 text-xs font-semibold text-white focus:outline-none focus:border-indigo-500"
          placeholder="Card Title"
        />
        <textarea
          rows={3}
          value={description}
          onChange={(e) => setDescription(e.target.value)}
          className="w-full px-2.5 py-1.5 rounded-lg bg-slate-950 border border-slate-800 text-xs text-slate-300 focus:outline-none focus:border-indigo-500 resize-none"
          placeholder="Description"
        />
        <div className="flex items-center justify-between">
          <select
            value={priority}
            onChange={(e) => setPriority(e.target.value)}
            className="px-2 py-1 rounded bg-slate-950 border border-slate-800 text-xs text-slate-300 focus:outline-none"
          >
            <option value="LOW">Low Priority</option>
            <option value="MEDIUM">Medium Priority</option>
            <option value="HIGH">High Priority</option>
          </select>
          <div className="flex gap-1.5">
            <button
              onClick={() => setIsEditing(false)}
              className="px-2.5 py-1 text-xs text-slate-400 hover:text-white"
            >
              Cancel
            </button>
            <button
              onClick={handleSave}
              className="px-3 py-1 rounded-lg bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-medium"
            >
              Save
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div
      className={`group relative p-3.5 rounded-xl border transition-all ${
        card.completed
          ? 'opacity-60 bg-slate-950/60 border-slate-800/60'
          : isAI
          ? 'bg-slate-900/90 border-indigo-500/25 hover:border-indigo-500/50 shadow-md shadow-indigo-950/20'
          : 'bg-slate-900/80 border-slate-800 hover:border-slate-700'
      } ${card.is_pinned ? 'ring-1 ring-amber-500/40' : ''}`}
    >
      {/* Top Header: Pin, AI Tag, Priority */}
      <div className="flex items-center justify-between gap-2 mb-2">
        <div className="flex items-center gap-1.5">
          {card.is_pinned && (
            <Pin className="w-3.5 h-3.5 text-amber-400 fill-amber-400 flex-shrink-0" />
          )}
          {isAI && (
            <span className="flex items-center gap-1 px-1.5 py-0.5 rounded text-[10px] font-semibold bg-indigo-500/20 text-indigo-300 border border-indigo-500/30">
              <Sparkles className="w-2.5 h-2.5" />
              AI
            </span>
          )}
          <span className={`px-2 py-0.5 rounded text-[10px] font-semibold border ${getPriorityBadge(card.priority)}`}>
            {card.priority || 'MED'}
          </span>
        </div>

        {/* Hover Action Buttons */}
        <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
          <button
            onClick={() => onTogglePin(card.id, !card.is_pinned)}
            title={card.is_pinned ? 'Unpin card' : 'Pin card'}
            className="p-1 text-slate-400 hover:text-amber-400 rounded"
          >
            <Pin className="w-3 h-3" />
          </button>
          <button
            onClick={() => setIsEditing(true)}
            title="Edit card"
            className="p-1 text-slate-400 hover:text-indigo-400 rounded"
          >
            <Edit3 className="w-3 h-3" />
          </button>
          <button
            onClick={() => onDelete(card.id)}
            title="Delete card"
            className="p-1 text-slate-400 hover:text-rose-400 rounded"
          >
            <Trash2 className="w-3 h-3" />
          </button>
        </div>
      </div>

      {/* Title & Checkbox */}
      <div className="flex items-start gap-2.5">
        <button
          onClick={() => onToggleComplete(card.id, !card.completed)}
          className="mt-0.5 text-slate-500 hover:text-emerald-400 flex-shrink-0 transition-colors"
        >
          {card.completed ? (
            <CheckCircle2 className="w-4 h-4 text-emerald-400 fill-emerald-500/20" />
          ) : (
            <Circle className="w-4 h-4" />
          )}
        </button>
        <div className="flex-1 min-w-0">
          <h5
            className={`text-xs font-semibold leading-snug break-words ${
              card.completed ? 'line-through text-slate-500' : 'text-slate-100'
            }`}
          >
            {card.title}
          </h5>
          {card.description && (
            <p className="text-[11px] text-slate-400 mt-1 leading-relaxed whitespace-pre-wrap line-clamp-4">
              {card.description}
            </p>
          )}
        </div>
      </div>

      {/* Column Move Controls */}
      <div className="flex items-center justify-between mt-3 pt-2 border-t border-slate-800/60 text-[10px] text-slate-500">
        <div>
          {currentColumnIndex > 0 && (
            <button
              onClick={() => onMoveColumn(card.id, columns[currentColumnIndex - 1].id)}
              className="flex items-center gap-1 text-slate-400 hover:text-indigo-300 transition-colors"
              title={`Move to ${columns[currentColumnIndex - 1].name}`}
            >
              <ArrowLeft className="w-3 h-3" />
              {columns[currentColumnIndex - 1].name.slice(0, 7)}
            </button>
          )}
        </div>
        <div>
          {currentColumnIndex < columns.length - 1 && (
            <button
              onClick={() => onMoveColumn(card.id, columns[currentColumnIndex + 1].id)}
              className="flex items-center gap-1 text-slate-400 hover:text-indigo-300 transition-colors"
              title={`Move to ${columns[currentColumnIndex + 1].name}`}
            >
              {columns[currentColumnIndex + 1].name.slice(0, 7)}
              <ArrowRight className="w-3 h-3" />
            </button>
          )}
        </div>
      </div>
    </div>
  );
}
