import React from 'react';
import { RepeatPicker } from './RepeatPicker';

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
            {/* Date (Main Toggle) */}
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
                        {/* Summary of active settings when collapsed */}
                        {!showDatePicker && (
                            <div className="flex items-center gap-2 text-xs text-slate-400">
                                {(startTime || endTime) && (
                                    <span className="flex items-center gap-1">
                                        <svg className="w-3 h-3" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                                        </svg>
                                    </span>
                                )}
                                {alerts.length > 0 && (
                                    <span className="flex items-center gap-1">
                                        <svg className="w-3 h-3" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9" />
                                        </svg>
                                    </span>
                                )}
                                {repeat.type !== 'none' && (
                                    <span className="flex items-center gap-1">
                                        <svg className="w-3 h-3" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
                                        </svg>
                                    </span>
                                )}
                            </div>
                        )}
                    </div>
                    <svg className={`w-4 h-4 transition-transform ${showDatePicker ? 'rotate-180' : ''}`} fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                    </svg>
                </button>

                {showDatePicker && (
                    <div className="mt-3 space-y-3 animate-fadeIn">
                        {/* Date Picker Input */}
                        <div className="p-4 rounded-xl bg-white/5 border border-white/5">
                            <input
                                type="date"
                                value={date.toISOString().split('T')[0]}
                                onChange={(e) => onDateChange(new Date(e.target.value))}
                                className="w-full bg-transparent text-white outline-none"
                            />
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
                                    <div className="text-left">
                                        <span className="text-sm font-medium text-slate-200 block">
                                            {(startTime || '00:00')} <span className="text-slate-500 mx-1">→</span> {(endTime || '00:00')}
                                        </span>
                                        <span className="text-xs text-slate-500 block">Time Range</span>
                                    </div>
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
                                    <div className="text-left">
                                        <span className="text-sm font-medium">
                                            {alerts.length > 0 ? `${alerts.length} ${t('common.alerts')}` : t('common.addAlert')}
                                        </span>
                                        {alerts.length > 0 && <span className="text-xs text-slate-400 block">{alerts[0].label}</span>}
                                    </div>
                                </div>
                                <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                                </svg>
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
                )}
            </div>
        </div>
    );
};
