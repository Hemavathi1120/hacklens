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
        return 'bg-red-950/50 text-red-400 border-red-500/40';
      case 'LOW':
        return 'bg-zinc-800 text-zinc-400 border-zinc-700';
      case 'MEDIUM':
      default:
        return 'bg-amber-950/40 text-amber-400 border-amber-500/30';
    }
  };

  const isAI = card.source_type === 'evaluation' || card.source_type === 'ai_helper';

  if (isEditing) {
    return (
      <div className="p-3.5 rounded-2xl border border-red-500/50 bg-zinc-950 shadow-xl space-y-3">
        <input
          type="text"
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          className="w-full px-2.5 py-1.5 rounded-xl bg-zinc-900 border border-zinc-800 text-xs font-bold text-zinc-100 placeholder-zinc-500 focus:outline-none focus:border-red-500 focus:bg-black"
          placeholder="Card Title"
        />
        <textarea
          rows={3}
          value={description}
          onChange={(e) => setDescription(e.target.value)}
          className="w-full px-2.5 py-1.5 rounded-xl bg-zinc-900 border border-zinc-800 text-xs text-zinc-300 placeholder-zinc-500 focus:outline-none focus:border-red-500 focus:bg-black resize-none font-normal"
          placeholder="Description"
        />
        <div className="flex items-center justify-between">
          <select
            value={priority}
            onChange={(e) => setPriority(e.target.value)}
            className="px-2 py-1 rounded-lg bg-zinc-900 border border-zinc-800 text-xs text-zinc-300 focus:outline-none font-medium"
          >
            <option value="LOW">Low Priority</option>
            <option value="MEDIUM">Medium Priority</option>
            <option value="HIGH">High Priority</option>
          </select>
          <div className="flex gap-1.5">
            <button
              onClick={() => setIsEditing(false)}
              className="px-2.5 py-1 text-xs text-zinc-400 hover:text-zinc-100"
            >
              Cancel
            </button>
            <button
              onClick={handleSave}
              className="px-3 py-1 rounded-xl bg-gradient-to-r from-red-600 to-rose-600 hover:from-red-500 hover:to-rose-500 text-white text-xs font-bold shadow-xs border border-red-500/30"
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
      className={`group relative p-3.5 rounded-2xl border transition-all ${
        card.completed
          ? 'opacity-50 bg-zinc-950/60 border-zinc-800'
          : isAI
          ? 'bg-zinc-950/90 border-red-500/30 hover:border-red-500/60 shadow-xs hover:shadow-md hover:shadow-red-600/10'
          : 'bg-zinc-950/90 border-zinc-800 hover:border-zinc-700 shadow-xs hover:shadow-md'
      } ${card.is_pinned ? 'ring-2 ring-amber-500/50 border-amber-500/40' : ''}`}
    >
      {/* Top Header: Pin, AI Tag, Priority */}
      <div className="flex items-center justify-between gap-2 mb-2">
        <div className="flex items-center gap-1.5">
          {card.is_pinned && (
            <Pin className="w-3.5 h-3.5 text-amber-400 fill-amber-400 flex-shrink-0" />
          )}
          {isAI && (
            <span className="flex items-center gap-1 px-1.5 py-0.5 rounded-full text-[10px] font-bold bg-red-950/50 text-red-400 border border-red-500/30">
              <Sparkles className="w-2.5 h-2.5 text-red-400" />
              AI
            </span>
          )}
          <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold border ${getPriorityBadge(card.priority)}`}>
            {card.priority || 'MED'}
          </span>
        </div>

        {/* Hover Action Buttons */}
        <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
          <button
            onClick={() => onTogglePin(card.id, !card.is_pinned)}
            title={card.is_pinned ? 'Unpin card' : 'Pin card'}
            className="p-1 text-zinc-400 hover:text-amber-400 hover:bg-zinc-800 rounded"
          >
            <Pin className="w-3 h-3" />
          </button>
          <button
            onClick={() => setIsEditing(true)}
            title="Edit card"
            className="p-1 text-zinc-400 hover:text-red-400 hover:bg-zinc-800 rounded"
          >
            <Edit3 className="w-3 h-3" />
          </button>
          <button
            onClick={() => onDelete(card.id)}
            title="Delete card"
            className="p-1 text-zinc-400 hover:text-rose-400 hover:bg-zinc-800 rounded"
          >
            <Trash2 className="w-3 h-3" />
          </button>
        </div>
      </div>

      {/* Title & Checkbox */}
      <div className="flex items-start gap-2.5">
        <button
          onClick={() => onToggleComplete(card.id, !card.completed)}
          className="mt-0.5 text-zinc-500 hover:text-red-400 flex-shrink-0 transition-colors"
        >
          {card.completed ? (
            <CheckCircle2 className="w-4 h-4 text-red-500 fill-red-950/50" />
          ) : (
            <Circle className="w-4 h-4" />
          )}
        </button>
        <div className="flex-1 min-w-0">
          <h5
            className={`text-xs font-bold leading-snug break-words ${
              card.completed ? 'line-through text-zinc-500' : 'text-zinc-100'
            }`}
          >
            {card.title}
          </h5>
          {card.description && (
            <p className="text-[11px] text-zinc-400 mt-1 leading-relaxed whitespace-pre-wrap line-clamp-4 font-normal">
              {card.description}
            </p>
          )}
        </div>
      </div>

      {/* Column Move Controls */}
      <div className="flex items-center justify-between mt-3 pt-2 border-t border-zinc-800/80 text-[10px] text-zinc-500 font-medium">
        <div>
          {currentColumnIndex > 0 && (
            <button
              onClick={() => onMoveColumn(card.id, columns[currentColumnIndex - 1].id)}
              className="flex items-center gap-1 text-zinc-400 hover:text-red-400 transition-colors"
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
              className="flex items-center gap-1 text-zinc-400 hover:text-red-400 transition-colors"
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
