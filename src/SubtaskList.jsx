import React, { useState } from 'react';

export const SubtaskList = ({ subtasks = [], onChange, t }) => {
    const [newItem, setNewItem] = useState('');

    const handleAdd = () => {
        if (!newItem.trim()) return;
        const newSubtask = {
            id: Date.now(),
            title: newItem.trim(),
            completed: false
        };
        onChange([...subtasks, newSubtask]);
        setNewItem('');
    };

    const handleKeyDown = (e) => {
        if (e.key === 'Enter') {
            e.preventDefault();
            handleAdd();
        }
    };

    const handleDelete = (id) => {
        onChange(subtasks.filter(s => s.id !== id));
    };

    const handleToggle = (id) => {
        onChange(subtasks.map(s => s.id === id ? { ...s, completed: !s.completed } : s));
    };

    return (
        <div className="mb-4">
            <label className="text-slate-400 text-sm mb-2 block">Subtasks</label>

            {/* List */}
            <div className="space-y-2 mb-3">
                {subtasks.map(subtask => (
                    <div key={subtask.id} className="flex items-center gap-3 bg-white/5 p-3 rounded-xl border border-white/5 group">
                        <button
                            onClick={() => handleToggle(subtask.id)}
                            className={`w-5 h-5 rounded-full border flex items-center justify-center transition-all ${subtask.completed
                                    ? 'bg-emerald-500 border-emerald-500'
                                    : 'border-slate-500 hover:border-slate-300'
                                }`}
                        >
                            {subtask.completed && (
                                <svg className="w-3 h-3 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" />
                                </svg>
                            )}
                        </button>
                        <span className={`flex-1 text-sm ${subtask.completed ? 'text-slate-500 line-through' : 'text-slate-200'}`}>
                            {subtask.title}
                        </span>
                        <button
                            onClick={() => handleDelete(subtask.id)}
                            className="opacity-0 group-hover:opacity-100 p-1 text-slate-500 hover:text-rose-400 transition-all"
                        >
                            <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                            </svg>
                        </button>
                    </div>
                ))}
            </div>

            {/* Input */}
            <div className="relative">
                <input
                    type="text"
                    value={newItem}
                    onChange={(e) => setNewItem(e.target.value)}
                    onKeyDown={handleKeyDown}
                    placeholder="Add a subtask..."
                    className="w-full pl-4 pr-10 py-3 bg-white/5 border border-white/10 rounded-xl text-white placeholder:text-slate-500 outline-none focus:border-amber-500/50"
                />
                <button
                    onClick={handleAdd}
                    disabled={!newItem.trim()}
                    className="absolute right-2 top-1/2 -translate-y-1/2 p-2 text-slate-400 hover:text-white disabled:opacity-50"
                >
                    <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
                    </svg>
                </button>
            </div>
        </div>
    );
};
