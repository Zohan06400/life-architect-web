import React from 'react';

// ============================================
// CONSTANTS
// ============================================

export const durationOptions = [
    { label: '15 min', value: 15 },
    { label: '30 min', value: 30 },
    { label: '45 min', value: 45 },
    { label: '1 hour', value: 60 },
    { label: '1.5 hours', value: 90 },
    { label: '2 hours', value: 120 },
    { label: '3 hours', value: 180 },
    { label: '4 hours', value: 240 },
    { label: '6 hours', value: 360 },
    { label: '8 hours', value: 480 },
];

export const globalAlertOptions = [
    { label: 'At start', value: 0 },
    { label: '5 min before', value: 5 },
    { label: '15 min before', value: 15 },
    { label: '30 min before', value: 30 },
    { label: '1 hour before', value: 60 },
    { label: '2 hours before', value: 120 },
    { label: '1 day before', value: 1440 },
    { label: '2 days before', value: 2880 },
    { label: '1 week before', value: 10080 },
];

export const globalIconOptions = [
    '📌', '📧', '💪', '📝', '📞', '📚', '🧘', '🎯', '💼', '🏃',
    '🍎', '💡', '🎨', '🎵', '📊', '🛒', '🏠', '💰', '✈️', '🎮',
    '🧹', '👥', '📱', '💻', '🔧', '📦', '🎁', '❤️', '⭐', '🔔'
];

export const globalReminderOptions = [
    { value: null, label: 'None' },
    { value: 5, label: '5 min' },
    { value: 10, label: '10 min' },
    { value: 15, label: '15 min' },
    { value: 30, label: '30 min' },
    { value: 60, label: '1 hour' }
];

export const weekDays = [
    { label: 'M', full: 'Monday', value: 1 },
    { label: 'T', full: 'Tuesday', value: 2 },
    { label: 'W', full: 'Wednesday', value: 3 },
    { label: 'T', full: 'Thursday', value: 4 },
    { label: 'F', full: 'Friday', value: 5 },
    { label: 'S', full: 'Saturday', value: 6 },
    { label: 'S', full: 'Sunday', value: 0 },
];

// ============================================
// HELPERS
// ============================================

export const loadFromStorage = (key, defaultValue) => {
    try {
        const item = localStorage.getItem(key);
        return item ? JSON.parse(item) : defaultValue;
    } catch (error) {
        console.error(`Error loading ${key} from storage:`, error);
        return defaultValue;
    }
};

export const saveToStorage = (key, value) => {
    try {
        localStorage.setItem(key, JSON.stringify(value));
    } catch (error) {
        console.error(`Error saving ${key} to storage:`, error);
    }
};

// Helper to get today's date with time reset
export const getToday = () => {
    const d = new Date();
    d.setHours(0, 0, 0, 0);
    return d;
};

// Helper to generate date key (YYYY-MM-DD)
export const getDateKey = (date) => {
    const d = new Date(date);
    return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`;
};

// Helper for parsing time strings (e.g. "1h 30m" -> 90)
export const parseTime = (timeStr) => {
    if (!timeStr) return 60;
    // If it's already a number, return it directly
    if (typeof timeStr === 'number') return timeStr;
    // Convert to string if needed
    const str = String(timeStr);
    const match = str.match(/(\d+)h?\s*(\d+)?m?/);
    if (!match) return 60;
    const hours = parseInt(match[1]) || 0;
    const mins = parseInt(match[2]) || 0;
    if (str.includes('h')) return hours * 60 + mins;
    return parseInt(str) || 60;
};

export const formatElapsed = (seconds) => {
    const h = Math.floor(seconds / 3600);
    const m = Math.floor((seconds % 3600) / 60);
    const s = seconds % 60;
    if (h > 0) return `${h}:${m.toString().padStart(2, '0')}:${s.toString().padStart(2, '0')}`;
    return `${m}:${s.toString().padStart(2, '0')}`;
};

// Calculate task duration
export const getTaskFocusDuration = (task) => {
    if (typeof task?.startTime === 'string' && typeof task?.endTime === 'string' &&
        task.startTime.includes(':') && task.endTime.includes(':')) {
        const [startH, startM] = task.startTime.split(':').map(Number);
        const [endH, endM] = task.endTime.split(':').map(Number);
        const totalMinutes = (endH * 60 + endM) - (startH * 60 + startM);
        if (totalMinutes > 0) {
            return totalMinutes * 60;
        }
    }

    if (task?.startTime instanceof Date && task?.endTime instanceof Date) {
        if (!isNaN(task.startTime.getTime()) && !isNaN(task.endTime.getTime())) {
            const durationMs = task.endTime - task.startTime;
            return Math.max(60, Math.floor(durationMs / 1000));
        }
    }
    return 25 * 60;
};

// Safe date parser for Safari/iOS compatibility
export const safeParseDate = (dateInput) => {
    if (!dateInput) return new Date();

    // If it's already a Date object
    if (dateInput instanceof Date) {
        return isNaN(dateInput.getTime()) ? new Date() : dateInput;
    }

    // Handle strings
    let date = new Date(dateInput);

    // If invalid, try replacing dashes with slashes (common Safari fix for YYYY-MM-DD)
    if (isNaN(date.getTime()) && typeof dateInput === 'string') {
        const replaceDashes = dateInput.replace(/-/g, '/');
        date = new Date(replaceDashes);
    }

    // Final fallback
    if (isNaN(date.getTime())) {
        console.warn('Invalid date detected, falling back to now:', dateInput);
        return new Date();
    }

    return date;
};

// ============================================
// SHARED COMPONENTS
// ============================================

export const RepeatPicker = ({ repeat, onSelect, themeColor = 'amber', t }) => {
    const getThemeClasses = (isSelected) => {
        if (!isSelected) return 'bg-white/5 text-slate-400 hover:bg-white/10';
        switch (themeColor) {
            case 'cyan': return 'bg-cyan-500/20 text-cyan-400 ring-1 ring-cyan-500/50';
            case 'purple': return 'bg-purple-500/20 text-purple-400 ring-1 ring-purple-500/50';
            default: return 'bg-amber-500/20 text-amber-400 ring-1 ring-amber-500/50';
        }
    };

    const setType = (type) => {
        let label = t('common.none');
        let days = [];
        if (type === 'daily') label = 'Daily'; // Can translate in display
        if (type === 'weekly') label = 'Weekly';
        if (type === 'custom') label = 'Custom Days';
        onSelect({ ...repeat, type, label, days });
    };

    const toggleDay = (dayValue) => {
        let newDays = [...(repeat.days || [])];
        if (newDays.includes(dayValue)) {
            newDays = newDays.filter(d => d !== dayValue);
        } else {
            newDays.push(dayValue);
        }

        // Sort days M-S
        newDays.sort((a, b) => {
            const aIdx = weekDays.findIndex(d => d.value === a);
            const bIdx = weekDays.findIndex(d => d.value === b);
            return aIdx - bIdx;
        });

        onSelect({ ...repeat, days: newDays });
    };

    return (
        <div className="space-y-4">
            {/* Type Selection */}
            <div className="flex gap-2 p-1 bg-white/5 rounded-xl">
                {['none', 'daily', 'weekly', 'custom'].map(type => (
                    <button
                        key={type}
                        onClick={() => setType(type)}
                        className={`flex-1 py-2 rounded-lg text-xs font-medium capitalize transition-all ${repeat.type === type
                            ? getThemeClasses(true)
                            : 'text-slate-500 hover:text-slate-300'
                            }`}
                    >
                        {type}
                    </button>
                ))}
            </div>

            {/* Days Selection (for weekly/custom) */}
            {(repeat.type === 'weekly' || repeat.type === 'custom') && (
                <div className="flex justify-between gap-1">
                    {weekDays.map(day => {
                        const isSelected = repeat.days?.includes(day.value);
                        return (
                            <button
                                key={day.value}
                                onClick={() => toggleDay(day.value)}
                                className={`w-8 h-8 rounded-lg flex items-center justify-center text-xs font-bold transition-all ${isSelected
                                    ? getThemeClasses(true)
                                    : 'bg-white/5 text-slate-500 hover:bg-white/10'
                                    }`}
                            >
                                {day.label}
                            </button>
                        );
                    })}
                </div>
            )}
        </div>
    );
};

export const TaskDetailsList = ({
    date,
    startTime,
    endTime,
    alerts,
    onDateClick,
    onTimeClick,
    onAlertsClick,
    onRepeatClick,
    themeColor = 'amber',
    showDatePicker,
    onDateChange,
    showTimePicker,
    onStartTimeChange,
    onEndTimeChange,
    repeat,
    showRepeatPicker,
    onRepeatChange,
    t,
    locale
}) => {
    const getThemeClasses = (isActive) => {
        if (!isActive) return 'bg-white/5 border-white/5 text-slate-300';
        switch (themeColor) {
            case 'cyan': return 'bg-cyan-500/10 border-cyan-500/30 text-cyan-300';
            case 'purple': return 'bg-purple-500/10 border-purple-500/30 text-purple-300';
            default: return 'bg-amber-500/10 border-amber-500/30 text-amber-300';
        }
    };

    const getIconColor = () => {
        switch (themeColor) {
            case 'cyan': return 'text-cyan-400';
            case 'purple': return 'text-purple-400';
            default: return 'text-amber-400';
        }
    };

    return (
        <div className="space-y-3 mb-6">
            {/* Date */}
            <div>
                <button
                    onClick={onDateClick}
                    className={`w-full flex items-center justify-between p-3 rounded-xl border transition-all ${getThemeClasses(showDatePicker)}`}
                >
                    <div className="flex items-center gap-3">
                        <div className={`w-8 h-8 rounded-lg bg-white/5 flex items-center justify-center ${getIconColor()}`}>
                            <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                            </svg>
                        </div>
                        <span className="text-sm font-medium">
                            {date.toLocaleDateString(locale, { weekday: 'short', month: 'long', day: 'numeric' })}
                        </span>
                    </div>
                    <svg className={`w-4 h-4 transition-transform ${showDatePicker ? 'rotate-180' : ''}`} fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                    </svg>
                </button>

                {showDatePicker && (
                    <div className="mt-2 p-4 rounded-xl bg-white/5 border border-white/5 animate-fadeIn">
                        <input
                            type="date"
                            value={date.toISOString().split('T')[0]}
                            onChange={(e) => onDateChange(new Date(e.target.value))}
                            className="w-full bg-transparent text-white outline-none"
                        />
                    </div>
                )}
            </div>

            {/* Time */}
            <div>
                <button
                    onClick={onTimeClick}
                    className={`w-full flex items-center justify-between p-3 rounded-xl border transition-all ${getThemeClasses(showTimePicker)}`}
                >
                    <div className="flex items-center gap-3">
                        <div className={`w-8 h-8 rounded-lg bg-white/5 flex items-center justify-center ${getIconColor()}`}>
                            <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                            </svg>
                        </div>
                        <span className="text-sm font-medium text-slate-200">
                            {(startTime || '00:00')} <span className="text-slate-500 mx-1">→</span> {(endTime || '00:00')}
                        </span>
                    </div>
                    <svg className={`w-4 h-4 transition-transform ${showTimePicker ? 'rotate-180' : ''}`} fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                    </svg>
                </button>

                {showTimePicker && (
                    <div className="mt-2 p-4 rounded-xl bg-white/5 border border-white/5 animate-fadeIn">
                        <div className="flex items-center gap-4">
                            <div className="flex-1">
                                <label className="text-xs text-slate-500 mb-1 block">Start</label>
                                <div className="flex gap-2">
                                    <select
                                        value={parseInt(startTime.split(':')[0])}
                                        onChange={(e) => onStartTimeChange({ hour: parseInt(e.target.value), minute: parseInt(startTime.split(':')[1]) })}
                                        className="bg-white/10 rounded-lg px-2 py-1 text-white outline-none flex-1"
                                    >
                                        {Array.from({ length: 24 }).map((_, i) => (
                                            <option key={i} value={i}>{i.toString().padStart(2, '0')}</option>
                                        ))}
                                    </select>
                                    <select
                                        value={parseInt(startTime.split(':')[1])}
                                        onChange={(e) => onStartTimeChange({ hour: parseInt(startTime.split(':')[0]), minute: parseInt(e.target.value) })}
                                        className="bg-white/10 rounded-lg px-2 py-1 text-white outline-none flex-1"
                                    >
                                        {[0, 15, 30, 45].map(m => (
                                            <option key={m} value={m}>{m.toString().padStart(2, '0')}</option>
                                        ))}
                                    </select>
                                </div>
                            </div>
                            <div className="text-slate-500">→</div>
                            <div className="flex-1">
                                <label className="text-xs text-slate-500 mb-1 block">End</label>
                                <div className="flex gap-2">
                                    <select
                                        value={parseInt(endTime.split(':')[0])}
                                        onChange={(e) => onEndTimeChange({ hour: parseInt(e.target.value), minute: parseInt(endTime.split(':')[1]) })}
                                        className="bg-white/10 rounded-lg px-2 py-1 text-white outline-none flex-1"
                                    >
                                        {Array.from({ length: 24 }).map((_, i) => (
                                            <option key={i} value={i}>{i.toString().padStart(2, '0')}</option>
                                        ))}
                                    </select>
                                    <select
                                        value={parseInt(endTime.split(':')[1])}
                                        onChange={(e) => onEndTimeChange({ hour: parseInt(endTime.split(':')[0]), minute: parseInt(e.target.value) })}
                                        className="bg-white/10 rounded-lg px-2 py-1 text-white outline-none flex-1"
                                    >
                                        {[0, 15, 30, 45].map(m => (
                                            <option key={m} value={m}>{m.toString().padStart(2, '0')}</option>
                                        ))}
                                    </select>
                                </div>
                            </div>
                        </div>
                    </div>
                )}
            </div>

            {/* Alerts */}
            <div>
                <button
                    onClick={onAlertsClick}
                    className={`w-full flex items-center justify-between p-3 rounded-xl border transition-all ${getThemeClasses(alerts.length > 0)}`}
                >
                    <div className="flex items-center gap-3">
                        <div className={`w-8 h-8 rounded-lg bg-white/5 flex items-center justify-center ${getIconColor()}`}>
                            <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9" />
                            </svg>
                        </div>
                        <span className="text-sm font-medium">
                            {alerts.length > 0 ? `${alerts.length} ${t('common.alerts')}` : t('common.addAlert')}
                        </span>
                    </div>
                    <div className="flex items-center gap-2">
                        {alerts.length > 0 && <span className="text-xs text-slate-400">{alerts[0].label}</span>}
                        <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                        </svg>
                    </div>
                </button>
            </div>

            {/* Repeat */}
            <div>
                <button
                    onClick={onRepeatClick}
                    className={`w-full flex items-center justify-between p-3 rounded-xl border transition-all ${getThemeClasses(repeat.type !== 'none')}`}
                >
                    <div className="flex items-center gap-3">
                        <div className={`w-8 h-8 rounded-lg bg-white/5 flex items-center justify-center ${getIconColor()}`}>
                            <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
                            </svg>
                        </div>
                        <span className="text-sm font-medium">
                            {repeat.label}
                        </span>
                    </div>
                    <svg className={`w-4 h-4 transition-transform ${showRepeatPicker ? 'rotate-180' : ''}`} fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                    </svg>
                </button>

                {showRepeatPicker && (
                    <div className="mt-2 p-4 rounded-xl bg-white/5 border border-white/5 animate-fadeIn">
                        <RepeatPicker
                            repeat={repeat}
                            onSelect={onRepeatChange}
                            themeColor={themeColor}
                            t={t}
                        />
                    </div>
                )}
            </div>
        </div>
    );
};

// Helper to get number of days in a month
export const getDaysInMonth = (year, month) => {
    return new Date(year, month + 1, 0).getDate();
};

// Helper to get day of week of the first day of the month
export const getFirstDayOfMonth = (year, month) => {
    return new Date(year, month, 1).getDay();
};
