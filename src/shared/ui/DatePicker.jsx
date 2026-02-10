import React from 'react';
import { getDaysInMonth, getFirstDayOfMonth } from '../utils/date';

export const DatePicker = ({ selectedDate, onSelect, themeColor = 'amber', locale = 'en-US' }) => {
    const [viewDate, setViewDate] = React.useState(selectedDate || new Date());

    const year = viewDate.getFullYear();
    const month = viewDate.getMonth();
    const daysInMonth = getDaysInMonth(year, month);
    const firstDay = getFirstDayOfMonth(year, month);
    const today = new Date();

    // Navigation
    const nextMonth = () => setViewDate(new Date(year, month + 1, 1));
    const prevMonth = () => setViewDate(new Date(year, month - 1, 1));

    const handleDayClick = (day) => {
        const newDate = new Date(year, month, day);
        onSelect(newDate);
    };

    const getThemeClasses = (isSelected, isToday) => {
        const baseSelected = 'text-white shadow-lg';
        const baseToday = 'bg-white/10 border';

        switch (themeColor) {
            case 'cyan':
                if (isSelected) return `bg-cyan-500 ${baseSelected} shadow-cyan-500/30`;
                if (isToday) return `${baseToday} text-cyan-500 border-cyan-500/30`;
                return 'text-slate-300 hover:bg-white/10';
            case 'rose':
                if (isSelected) return `bg-rose-500 ${baseSelected} shadow-rose-500/30`;
                if (isToday) return `${baseToday} text-rose-500 border-rose-500/30`;
                return 'text-slate-300 hover:bg-white/10';
            case 'purple':
                if (isSelected) return `bg-purple-500 ${baseSelected} shadow-purple-500/30`;
                if (isToday) return `${baseToday} text-purple-500 border-purple-500/30`;
                return 'text-slate-300 hover:bg-white/10';
            case 'emerald':
                if (isSelected) return `bg-emerald-500 ${baseSelected} shadow-emerald-500/30`;
                if (isToday) return `${baseToday} text-emerald-500 border-emerald-500/30`;
                return 'text-slate-300 hover:bg-white/10';
            default: // amber
                if (isSelected) return `bg-amber-500 ${baseSelected} shadow-amber-500/30`;
                if (isToday) return `${baseToday} text-amber-500 border-amber-500/30`;
                return 'text-slate-300 hover:bg-white/10';
        }
    };

    const monthName = new Date(year, month).toLocaleDateString(locale, { month: 'long' });

    return (
        <div className="p-4 bg-white/5 border border-white/10 rounded-2xl animate-fadeIn mb-6">
            <div className="flex items-center justify-between mb-4">
                <button onClick={prevMonth} className="p-1 text-slate-400 hover:text-white transition-colors">
                    <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
                    </svg>
                </button>
                <span className="font-semibold text-white capitalize">{monthName} {year}</span>
                <button onClick={nextMonth} className="p-1 text-slate-400 hover:text-white transition-colors">
                    <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                    </svg>
                </button>
            </div>

            <div className="grid grid-cols-7 gap-1 mb-2">
                {['S', 'M', 'T', 'W', 'T', 'F', 'S'].map(d => (
                    <div key={d} className="text-center text-xs text-slate-500 font-medium py-1">{d}</div>
                ))}
            </div>

            <div className="grid grid-cols-7 gap-1">
                {Array.from({ length: firstDay }).map((_, i) => (
                    <div key={`empty-${i}`} />
                ))}
                {Array.from({ length: daysInMonth }).map((_, i) => {
                    const day = i + 1;
                    const date = new Date(year, month, day);
                    const isSelected = selectedDate && date.toDateString() === selectedDate.toDateString();
                    const isToday = date.toDateString() === today.toDateString();

                    return (
                        <button
                            key={day}
                            onClick={() => handleDayClick(day)}
                            className={`h-9 w-9 rounded-full flex items-center justify-center text-sm font-medium transition-all
                  ${getThemeClasses(isSelected, isToday)}`}
                        >
                            {day}
                        </button>
                    );
                })}
            </div>
        </div>
    );
};
