import React from 'react';
import { durationOptions } from '../config/constants';

export const TimePicker = ({
    startHour,
    startMinute,
    endHour,
    endMinute,
    onStartChange,
    onEndChange,
    themeColor = 'amber',
    t
}) => {
    const handleDurationSelect = (minutes) => {
        let totalStartMinutes = startHour * 60 + startMinute;
        let totalEndMinutes = totalStartMinutes + minutes;

        let newEndHour = Math.floor(totalEndMinutes / 60) % 24;
        let newEndMinute = totalEndMinutes % 60;

        onEndChange({ hour: newEndHour, minute: newEndMinute });
    };

    const getThemeClasses = () => {
        switch (themeColor) {
            case 'cyan': return 'focus:ring-cyan-500/30 text-cyan-400 border-cyan-500/20';
            case 'purple': return 'focus:ring-purple-500/30 text-purple-400 border-purple-500/20';
            default: return 'focus:ring-amber-500/30 text-amber-400 border-amber-500/20';
        }
    };

    const getButtonTheme = (isSelected) => {
        if (!isSelected) return 'bg-white/5 text-slate-400 hover:bg-white/10';
        switch (themeColor) {
            case 'cyan': return 'bg-cyan-500/20 text-cyan-400 ring-1 ring-cyan-500/50';
            case 'purple': return 'bg-purple-500/20 text-purple-400 ring-1 ring-purple-500/50';
            default: return 'bg-amber-500/20 text-amber-400 ring-1 ring-amber-500/50';
        }
    };

    const currentDuration = (endHour * 60 + endMinute) - (startHour * 60 + startMinute);

    return (
        <div className="mb-6 p-4 rounded-2xl bg-white/5 border border-white/5 animate-fadeIn">
            {/* Time Controls */}
            <div className="flex items-center gap-3 mb-6">
                <div className="flex-1">
                    <p className="text-[10px] text-slate-500 mb-1">From</p>
                    <div className="flex gap-1">
                        <select
                            value={startHour}
                            onChange={(e) => onStartChange({ hour: parseInt(e.target.value), minute: startMinute })}
                            className={`flex-1 px-2 py-2.5 bg-white/10 border border-white/10 rounded-xl text-white text-center outline-none cursor-pointer focus:ring-2 ${getThemeClasses()}`}
                        >
                            {Array.from({ length: 24 }, (_, i) => i).map(h => (
                                <option key={h} value={h} className="bg-slate-800 text-white">{h}</option>
                            ))}
                        </select>
                        <span className="text-white/50 self-center">.</span>
                        <select
                            value={startMinute}
                            onChange={(e) => onStartChange({ hour: startHour, minute: parseInt(e.target.value) })}
                            className={`flex-1 px-2 py-2.5 bg-white/10 border border-white/10 rounded-xl text-white text-center outline-none cursor-pointer focus:ring-2 ${getThemeClasses()}`}
                        >
                            {[0, 15, 30, 45].map(m => (
                                <option key={m} value={m} className="bg-slate-800 text-white">{m.toString().padStart(2, '0')}</option>
                            ))}
                        </select>
                    </div>
                </div>

                <svg className={`w-6 h-6 flex-shrink-0 mt-4 ${themeColor === 'cyan' ? 'text-cyan-400/60' : themeColor === 'purple' ? 'text-purple-400/60' : 'text-amber-400/60'}`} fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 8l4 4m0 0l-4 4m4-4H3" />
                </svg>

                <div className="flex-1">
                    <p className="text-[10px] text-slate-500 mb-1">To</p>
                    <div className="flex gap-1">
                        <select
                            value={endHour}
                            onChange={(e) => onEndChange({ hour: parseInt(e.target.value), minute: endMinute })}
                            className={`flex-1 px-2 py-2.5 bg-white/10 border border-white/10 rounded-xl text-white text-center outline-none cursor-pointer focus:ring-2 ${getThemeClasses()}`}
                        >
                            {Array.from({ length: 24 }, (_, i) => i).map(h => (
                                <option key={h} value={h} className="bg-slate-800 text-white">{h}</option>
                            ))}
                        </select>
                        <span className="text-white/50 self-center">.</span>
                        <select
                            value={endMinute}
                            onChange={(e) => onEndChange({ hour: endHour, minute: parseInt(e.target.value) })}
                            className={`flex-1 px-2 py-2.5 bg-white/10 border border-white/10 rounded-xl text-white text-center outline-none cursor-pointer focus:ring-2 ${getThemeClasses()}`}
                        >
                            {[0, 15, 30, 45].map(m => (
                                <option key={m} value={m} className="bg-slate-800 text-white">{m.toString().padStart(2, '0')}</option>
                            ))}
                        </select>
                    </div>
                </div>
            </div>

            {/* Duration Grid */}
            <div className="grid grid-cols-5 gap-2">
                {durationOptions.map(opt => (
                    <button
                        key={opt.value}
                        onClick={() => handleDurationSelect(opt.value)}
                        className={`py-2 px-1 rounded-xl text-[10px] font-medium transition-all ${getButtonTheme(currentDuration === opt.value)}`}
                    >
                        {opt.value < 60 ? `${opt.value} ${t('units.m')}` :
                            opt.value % 60 === 0 ? `${opt.value / 60} ${t('units.h')}` :
                                `${Math.floor(opt.value / 60)} ${t('units.h')} ${opt.value % 60 > 0 ? '0.5' : ''}`
                        }
                    </button>
                ))}
            </div>
        </div>
    );
};
