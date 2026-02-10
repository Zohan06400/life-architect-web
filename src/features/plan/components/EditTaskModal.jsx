import React, { useState, useEffect } from 'react';
import { SubtaskList } from '../../../shared/ui/SubtaskList';
import { globalIconOptions } from '../../../shared/config/constants';

export const EditTaskModal = ({
    task,
    project,
    onSave,
    onClose,
    t,
    currentLocale
}) => {
    // Initialize state from task
    const [title, setTitle] = useState(task.title || task.name || '');
    const [icon, setIcon] = useState(task.icon || '📝');
    const [value, setValue] = useState(task.value || 5);
    const [energy, setEnergy] = useState(task.energy || 'medium');
    const [timeEstimate, setTimeEstimate] = useState(task.timeEstimate || 30);
    const [notes, setNotes] = useState(task.notes || '');
    const [subtasks, setSubtasks] = useState(task.subtasks || []);
    const [alerts, setAlerts] = useState(task.alerts || []);
    const [repeat, setRepeat] = useState(task.repeat || { type: 'none', label: 'None', days: [] });
    const [date, setDate] = useState(task.date ? new Date(task.date) : new Date());

    // Time state
    const [startHour, setStartHour] = useState(9);
    const [startMinute, setStartMinute] = useState(0);
    const [endHour, setEndHour] = useState(10);
    const [endMinute, setEndMinute] = useState(0);

    const [showIconPicker, setShowIconPicker] = useState(false);

    // Initialize time from task
    useEffect(() => {
        if (task.startTime) {
            const s = new Date(task.startTime);
            setStartHour(s.getHours());
            setStartMinute(s.getMinutes());
        }
        if (task.endTime) {
            const e = new Date(task.endTime);
            setEndHour(e.getHours());
            setEndMinute(e.getMinutes());
        }
    }, [task]);

    const handleSave = () => {
        if (!title.trim() || !project) return;

        const sDate = new Date(date);
        sDate.setHours(startHour, startMinute, 0, 0);

        const eDate = new Date(date);
        eDate.setHours(endHour, endMinute, 0, 0);

        const updates = {
            title: title.trim(),
            icon,
            value,
            energy,
            timeEstimate,
            notes,
            alerts,
            repeat,
            date: date.toISOString(),
            startTime: sDate.toISOString(),
            endTime: eDate.toISOString(),
            subtasks
        };

        onSave(updates);
    };

    const timeOptions = [
        { value: 15, label: '15 min' },
        { value: 30, label: '30 min' },
        { value: 45, label: '45 min' },
        { value: 60, label: '1 hour' },
        { value: 90, label: '1.5 hours' },
        { value: 120, label: '2 hours' },
        { value: 180, label: '3 hours' },
        { value: 240, label: '4 hours' },
    ];

    return (
        <div className="fixed inset-0 z-50 flex items-end justify-center animate-fadeIn">
            <div className="absolute inset-0 bg-black/60 backdrop-blur-sm" onClick={onClose} />

            <div
                className="relative w-full max-w-md mx-4 mb-4 rounded-3xl overflow-hidden animate-slideUp max-h-[85vh] overflow-y-auto"
                style={{
                    background: 'linear-gradient(180deg, rgba(30,30,40,0.95) 0%, rgba(20,20,30,0.98) 100%)',
                    backdropFilter: 'blur(40px)',
                    border: '1px solid rgba(255,255,255,0.1)'
                }}
            >
                <div className="px-5 pt-5 pb-4 border-b border-white/10">
                    <div className="flex items-center justify-between">
                        <div>
                            <h2 className="text-lg font-semibold text-white">{t('modals.editTask')}</h2>
                            <p className="text-amber-400 text-xs mt-0.5">{project?.title}</p>
                        </div>
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
                    {/* Title & Icon Header */}
                    <div className="mb-4">
                        <label className="text-slate-400 text-sm mb-2 block">{t('common.task')}</label>
                        <div className="flex gap-3">
                            <button
                                onClick={() => setShowIconPicker(!showIconPicker)}
                                className="w-12 h-12 rounded-xl bg-white/5 border border-white/10 flex items-center justify-center text-2xl hover:bg-white/10 transition-colors"
                            >
                                {icon}
                            </button>
                            <input
                                type="text"
                                value={title}
                                onChange={(e) => setTitle(e.target.value)}
                                placeholder={t('placeholders.whatToDo')}
                                className="flex-1 px-4 py-3 bg-white/5 border border-white/10 rounded-xl text-white placeholder:text-slate-500 outline-none focus:border-amber-500/50"
                            />
                        </div>

                        {/* Icon Picker (Conditional) */}
                        {showIconPicker && (
                            <div className="mt-4 p-4 rounded-xl bg-white/5 border border-white/5 animate-fadeIn">
                                <div className="flex flex-wrap gap-2">
                                    {globalIconOptions.map(opt => (
                                        <button
                                            key={opt}
                                            onClick={() => {
                                                setIcon(opt);
                                                setShowIconPicker(false);
                                            }}
                                            className={`w-10 h-10 rounded-lg flex items-center justify-center text-xl transition-colors
                      ${icon === opt ? 'bg-amber-500/20 text-amber-500' : 'hover:bg-white/10'}`}
                                        >
                                            {opt}
                                        </button>
                                    ))}
                                </div>
                            </div>
                        )}
                    </div>

                    {/* Time Estimate */}
                    <div>
                        <label className="text-slate-400 text-sm mb-2 block">Time Estimate</label>
                        <div className="grid grid-cols-4 gap-2">
                            {timeOptions.map(opt => (
                                <button
                                    key={opt.value}
                                    onClick={() => setTimeEstimate(opt.value)}
                                    className={`py-2 rounded-lg text-xs font-medium transition-all ${timeEstimate === opt.value
                                        ? 'bg-amber-500/20 text-amber-400 border border-amber-500/30'
                                        : 'bg-white/5 text-slate-400 hover:bg-white/10 border border-transparent'
                                        }`}
                                >
                                    {opt.label}
                                </button>
                            ))}
                        </div>
                    </div>

                    {/* Energy Level */}
                    <div>
                        <label className="text-xs font-medium text-slate-400 uppercase tracking-wide mb-2 block">{t('common.energyLevel')}</label>
                        <div className="flex gap-2">
                            {['low', 'medium', 'high'].map(level => (
                                <button
                                    key={level}
                                    onClick={() => setEnergy(level)}
                                    className={`flex-1 py-2.5 rounded-xl font-medium text-sm transition-all duration-200
                                        ${energy === level
                                            ? level === 'low'
                                                ? 'bg-emerald-500/80 text-white shadow-lg shadow-emerald-500/30'
                                                : level === 'medium'
                                                    ? 'bg-amber-500/80 text-white shadow-lg shadow-amber-500/30'
                                                    : 'bg-rose-500/80 text-white shadow-lg shadow-rose-500/30'
                                            : 'bg-white/10 text-slate-400 hover:bg-white/20'}`}
                                >
                                    {level === 'low' ? `🌱 ${t('energyLevels.light')}` : level === 'medium' ? `⚡ ${t('energyLevels.moderate')}` : `🔥 ${t('energyLevels.heavy')}`}
                                </button>
                            ))}
                        </div>
                    </div>

                    <SubtaskList
                        subtasks={subtasks}
                        onChange={setSubtasks}
                        t={t}
                    />

                    {/* Notes */}
                    <div>
                        <label className="text-slate-400 text-sm mb-2 block">{t('common.notes')}</label>
                        <textarea
                            value={notes}
                            onChange={(e) => setNotes(e.target.value)}
                            placeholder={t('placeholders.additionalDetails')}
                            rows={2}
                            className="w-full px-4 py-3 bg-white/5 border border-white/10 rounded-xl text-white placeholder:text-slate-500 outline-none focus:border-amber-500/50 resize-none"
                        />
                    </div>
                </div>

                <div className="px-5 py-4 border-t border-white/10 flex gap-3">
                    <button
                        onClick={onClose}
                        className="flex-1 py-3 rounded-xl font-medium text-slate-400 bg-white/10 hover:bg-white/20 transition-all"
                    >
                        {t('common.cancel')}
                    </button>
                    <button
                        onClick={handleSave}
                        disabled={!title.trim()}
                        className={`flex-1 py-3 rounded-xl font-semibold transition-all duration-200
            ${title.trim()
                                ? 'bg-gradient-to-r from-amber-500 to-orange-500 text-white shadow-lg shadow-amber-500/30'
                                : 'bg-white/5 text-slate-600 cursor-not-allowed'}`}
                    >
                        {t('common.save')}
                    </button>
                </div>
            </div>
        </div>
    );
};
