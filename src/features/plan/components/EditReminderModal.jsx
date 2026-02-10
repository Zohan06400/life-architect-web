import React, { useState, useEffect } from 'react';
import { TaskDetailsList } from '../../../shared/ui/TaskDetailsList';
import { SubtaskList } from '../../../shared/ui/SubtaskList';
import { globalAlertOptions as alertOptions, globalIconOptions } from '../../../shared/config/constants';

export const EditReminderModal = ({
    reminder,
    onSave,
    onDelete,
    onClose,
    t,
    currentLocale
}) => {
    const [name, setName] = useState(reminder.name || '');
    const [icon, setIcon] = useState(reminder.icon || '📝');
    const [energy, setEnergy] = useState(reminder.energy || 'medium');
    const [value, setValue] = useState(reminder.value || 5);
    const [notes, setNotes] = useState(reminder.notes || '');
    const [subtasks, setSubtasks] = useState(reminder.subtasks || []);
    const [alerts, setAlerts] = useState(reminder.alerts || []);
    const [repeat, setRepeat] = useState(reminder.repeat || { type: 'none', label: 'None', days: [] });
    const [date, setDate] = useState(reminder.date ? new Date(reminder.date) : new Date());

    // Time state
    const [startHour, setStartHour] = useState(9);
    const [startMinute, setStartMinute] = useState(0);
    const [endHour, setEndHour] = useState(10);
    const [endMinute, setEndMinute] = useState(0);

    // UI Visibility State
    const [showTime, setShowTime] = useState(false);
    const [showAlerts, setShowAlerts] = useState(false);
    const [showDate, setShowDate] = useState(false);
    const [showRepeat, setShowRepeat] = useState(false);
    const [showIconPicker, setShowIconPicker] = useState(false);

    // Initialize time from reminder (if exists)
    useEffect(() => {
        if (reminder.startTime) {
            const s = new Date(reminder.startTime);
            setStartHour(s.getHours());
            setStartMinute(s.getMinutes());
        }
        if (reminder.endTime) {
            const e = new Date(reminder.endTime);
            setEndHour(e.getHours());
            setEndMinute(e.getMinutes());
        }
    }, [reminder]);

    const handleSave = () => {
        if (!name.trim()) return;

        const sTime = new Date(date);
        sTime.setHours(startHour, startMinute, 0, 0);

        const eTime = new Date(date);
        eTime.setHours(endHour, endMinute, 0, 0);

        const updatedData = {
            ...reminder,
            name: name.trim(),
            icon,
            energy,
            value,
            notes,
            subtasks,
            alerts,
            repeat,
            date: date.toISOString(),
            startTime: sTime.toISOString(),
            endTime: eTime.toISOString(),
            isVirtual: false
        };

        onSave(updatedData);
    };

    return (
        <div className="fixed inset-0 z-50 flex items-end justify-center animate-fadeIn">
            <div
                className="absolute inset-0 bg-black/60 backdrop-blur-sm"
                onClick={onClose}
            />

            <div
                className="relative w-full max-w-md mx-4 mb-4 rounded-3xl overflow-hidden animate-slideUp"
                style={{
                    background: 'linear-gradient(180deg, rgba(30,30,40,0.95) 0%, rgba(20,20,30,0.98) 100%)',
                    backdropFilter: 'blur(40px)',
                    border: '1px solid rgba(255,255,255,0.1)',
                    boxShadow: '0 25px 50px rgba(0,0,0,0.5)'
                }}
            >
                {/* Header */}
                <div className="px-5 pt-5 pb-4 border-b border-white/10">
                    <div className="flex items-center justify-between">
                        <h2 className="text-lg font-semibold text-white">{t('modals.editReminder')}</h2>
                        <button
                            onClick={onClose}
                            className="w-8 h-8 rounded-full bg-white/10 flex items-center justify-center text-slate-400 hover:bg-white/20 transition-colors"
                        >
                            <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                            </svg>
                        </button>
                    </div>
                </div>

                {/* Body */}
                <div className="px-5 py-4 max-h-[60vh] overflow-y-auto">
                    {/* Title & Icon Header */}
                    <div className="mb-4">
                        <label className="text-slate-400 text-sm mb-2 block">{t('common.reminder')}</label>
                        <div className="flex gap-3">
                            <button
                                onClick={() => setShowIconPicker(!showIconPicker)}
                                className="w-12 h-12 rounded-xl bg-white/5 border border-white/10 flex items-center justify-center text-2xl hover:bg-white/10 transition-colors"
                            >
                                {icon}
                            </button>
                            <input
                                type="text"
                                value={name}
                                onChange={(e) => setName(e.target.value)}
                                placeholder={t('placeholders.reminder')}
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

                    {/* Details List (iOS Style) */}
                    <TaskDetailsList
                        date={date}
                        startTime={`${startHour}:${startMinute.toString().padStart(2, '0')}`}
                        endTime={`${endHour}:${endMinute.toString().padStart(2, '0')}`}
                        alerts={alerts}
                        onDateClick={() => {
                            setShowDate(!showDate);
                            setShowTime(false);
                            setShowAlerts(false);
                            setShowRepeat(false);
                        }}
                        onTimeClick={() => {
                            setShowTime(!showTime);
                            setShowAlerts(false);
                            setShowRepeat(false);
                        }}
                        onAlertsClick={() => {
                            setShowAlerts(!showAlerts);
                            setShowTime(false);
                            setShowRepeat(false);
                        }}
                        onRepeatClick={() => {
                            setShowRepeat(!showRepeat);
                            setShowAlerts(false);
                            setShowTime(false);
                        }}
                        themeColor="purple"
                        showDatePicker={showDate}
                        onDateChange={(d) => {
                            setDate(d);
                            setShowDate(false);
                        }}
                        showTimePicker={showTime}
                        onStartTimeChange={({ hour, minute }) => {
                            setStartHour(hour);
                            setStartMinute(minute);
                        }}
                        onEndTimeChange={({ hour, minute }) => {
                            setEndHour(hour);
                            setEndMinute(minute);
                        }}
                        repeat={repeat}
                        showRepeatPicker={showRepeat}
                        onRepeatChange={setRepeat}
                        t={t}
                        locale={currentLocale}
                    />

                    {/* Alerts Picker (Collapsible) */}
                    {showAlerts && (
                        <div className="mb-6 p-4 rounded-2xl bg-white/5 border border-white/5 animate-fadeIn">
                            <label className="text-xs font-medium text-slate-400 uppercase tracking-wide mb-3 block">Manage Alerts</label>
                            <div className="space-y-2">
                                {alerts.map((alert, index) => (
                                    <div key={index} className="flex items-center justify-between p-3 rounded-xl bg-white/5 border border-white/5">
                                        <span className="text-sm text-slate-200">{alert.label}</span>
                                        <button
                                            onClick={() => setAlerts(alerts.filter((_, i) => i !== index))}
                                            className="text-rose-400 hover:text-rose-300 p-1"
                                        >
                                            <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                                            </svg>
                                        </button>
                                    </div>
                                ))}
                                <div className="pt-2 grid grid-cols-3 gap-2">
                                    {alertOptions.map(opt => (
                                        <button
                                            key={opt.label}
                                            onClick={() => {
                                                if (!alerts.some(a => a.value === opt.value)) {
                                                    setAlerts([...alerts, opt]);
                                                }
                                            }}
                                            className="p-2 rounded-lg bg-indigo-500/10 text-indigo-300 text-[10px] font-medium border border-indigo-500/20 hover:bg-indigo-500/20 transition-all text-left"
                                        >
                                            + {opt.label}
                                        </button>
                                    ))}
                                </div>
                            </div>
                        </div>
                    )}

                    {/* Value (Impact) */}
                    <div className="mb-4">
                        <label className="text-slate-400 text-sm mb-2 block">{t('common.impact')}: {value}/10</label>
                        <input
                            type="range"
                            min="1"
                            max="10"
                            value={value}
                            onChange={(e) => setValue(parseInt(e.target.value))}
                            className="w-full accent-amber-500"
                        />
                    </div>

                    {/* Energy Level */}
                    <div className="mb-6">
                        <label className="text-xs font-medium text-slate-400 uppercase tracking-wide mb-3 block">{t('common.energyLevel')}</label>
                        <div className="flex gap-2">
                            {['low', 'medium', 'high'].map((level) => (
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
                    <div className="mb-4">
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
                <div className="px-5 py-4 border-t border-white/10">
                    <div className="flex gap-3">
                        <button
                            onClick={() => onDelete(reminder.id)}
                            className="px-4 py-3 rounded-xl font-medium text-rose-400 bg-rose-500/10 hover:bg-rose-500/20 transition-all"
                        >
                            <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                            </svg>
                        </button>
                        <button
                            onClick={onClose}
                            className="flex-1 py-3 rounded-xl font-medium text-slate-400 bg-white/10 hover:bg-white/20 transition-all"
                        >
                            {t('common.cancel')}
                        </button>
                        <button
                            onClick={handleSave}
                            disabled={!name.trim()}
                            className={`flex-1 py-3 rounded-xl font-semibold transition-all duration-200
              ${name.trim()
                                    ? 'bg-gradient-to-r from-amber-500 to-orange-500 text-white shadow-lg shadow-amber-500/30'
                                    : 'bg-white/5 text-slate-600 cursor-not-allowed'}`}
                        >
                            {t('common.save')}
                        </button>
                    </div>
                </div>
            </div >
        </div >
    );
};
