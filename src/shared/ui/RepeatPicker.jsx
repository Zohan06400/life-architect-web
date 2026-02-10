import React from 'react';
import { weekDays } from '../config/constants';

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
