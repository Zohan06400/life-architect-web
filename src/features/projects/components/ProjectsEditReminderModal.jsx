import React, { useState, useEffect } from 'react';

export const ProjectsEditReminderModal = ({
    isOpen,
    onClose,
    reminder,
    onSave, // (updatedReminder) => void
    onDelete, // (id) => void
    t
}) => {
    const [name, setName] = useState('');
    const [icon, setIcon] = useState('📝');

    // Icon options for reminders
    const reminderIcons = ['📝', '💡', '🎯', '📌', '⭐', '🔔', '📋', '💼', '🏠', '🛒', '📞', '✉️', '🎨', '🔧', '📚', '💪'];

    useEffect(() => {
        if (isOpen && reminder) {
            setName(reminder.name || '');
            setIcon(reminder.icon || '📝');
        }
    }, [isOpen, reminder]);

    const handleSave = () => {
        if (!name.trim()) return;
        onSave({
            ...reminder,
            name: name.trim(),
            icon,
            isVirtual: false // Ensure it's real if it was virtual
        });
    };

    if (!isOpen || !reminder) return null;

    return (
        <div className="fixed inset-0 z-50 flex items-end justify-center animate-fadeIn">
            <div className="absolute inset-0 bg-black/60 backdrop-blur-sm" onClick={onClose} />

            <div
                className="relative w-full max-w-md mx-4 mb-4 rounded-3xl overflow-hidden animate-slideUp"
                style={{
                    background: 'linear-gradient(180deg, rgba(30,30,40,0.95) 0%, rgba(20,20,30,0.98) 100%)',
                    backdropFilter: 'blur(40px)',
                    border: '1px solid rgba(255,255,255,0.1)'
                }}
            >
                <div className="px-5 pt-5 pb-4 border-b border-white/10">
                    <div className="flex items-center justify-between">
                        <h2 className="text-lg font-semibold text-white">{t('modals.editReminder')}</h2>
                        <button
                            onClick={onClose}
                            className="w-8 h-8 rounded-full bg-white/10 flex items-center justify-center text-slate-400"
                        >
                            <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                            </svg>
                        </button>
                    </div>
                </div>

                <div className="p-5 space-y-4">
                    {/* Icon Picker */}
                    <div>
                        <label className="text-slate-400 text-sm mb-2 block">{t('common.icon')}</label>
                        <div className="flex flex-wrap gap-2">
                            {reminderIcons.map(opt => (
                                <button
                                    key={opt}
                                    onClick={() => setIcon(opt)}
                                    className={`w-10 h-10 rounded-xl text-xl flex items-center justify-center transition-all ${icon === opt
                                        ? 'bg-amber-500/30 ring-2 ring-amber-400'
                                        : 'bg-white/5 hover:bg-white/10'
                                        }`}
                                >
                                    {opt}
                                </button>
                            ))}
                        </div>
                    </div>

                    {/* Name Input */}
                    <div>
                        <label className="text-slate-400 text-sm mb-2 block">{t('common.reminder')}</label>
                        <input
                            type="text"
                            value={name}
                            onChange={(e) => setName(e.target.value)}
                            className="w-full px-4 py-3 bg-white/5 border border-white/10 rounded-xl text-white placeholder:text-slate-500 outline-none focus:border-amber-500/50"
                        />
                    </div>

                    {/* Save Button */}
                    <button
                        onClick={handleSave}
                        disabled={!name.trim()}
                        className="w-full py-4 rounded-xl font-semibold text-white transition-all disabled:opacity-50"
                        style={{
                            background: 'linear-gradient(135deg, rgba(245,158,11,0.8) 0%, rgba(217,119,6,0.8) 100%)'
                        }}
                    >
                        {t('common.saveChanges')}
                    </button>

                    {/* Delete Button */}
                    <button
                        onClick={() => {
                            onDelete(reminder.id);
                            onClose();
                        }}
                        className="w-full py-3 rounded-xl font-medium text-rose-400 bg-rose-500/10 hover:bg-rose-500/20 transition-all"
                    >
                        {t('modals.deleteReminder')}
                    </button>
                </div>
            </div>
        </div>
    );
};
