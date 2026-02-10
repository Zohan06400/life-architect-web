import React from 'react';
import { getToday, getDateKey } from '../../../shared/utils/date';

export const PlanCalendar = ({
    selectedDate,
    setSelectedDate,
    weekOffset,
    setWeekOffset,
    showMonthPicker,
    setShowMonthPicker,
    projects,
    getResolvedTasksForDate,
    onProjectClick,
    t,
    currentLocale
}) => {
    const today = getToday();

    // Generate week days for calendar with offset
    const getWeekDays = () => {
        const days = [];
        const now = new Date();
        const currentDay = now.getDay();

        // Calculate Monday of current week
        const daysToMonday = currentDay === 0 ? 6 : currentDay - 1;
        const startOfWeek = new Date(now);
        startOfWeek.setDate(now.getDate() - daysToMonday + (weekOffset * 7));
        startOfWeek.setHours(0, 0, 0, 0);

        for (let i = 0; i < 7; i++) {
            const date = new Date(startOfWeek);
            date.setDate(startOfWeek.getDate() + i);
            date.setHours(0, 0, 0, 0);

            const hasTasks = getResolvedTasksForDate(date).length > 0;

            const todayDate = new Date();
            todayDate.setHours(0, 0, 0, 0);
            const selectedDateObj = new Date(selectedDate);
            selectedDateObj.setHours(0, 0, 0, 0);

            // Get project timelines for this date
            const dateStr = date.toISOString().split('T')[0];
            const projectTimelines = projects.filter(p => {
                if (!p.startDate && !p.endDate) return false;
                if (p.status !== 'active' && p.status !== 'not-started') return false;
                const startStr = p.startDate || null;
                const endStr = p.endDate || null;

                if (startStr && endStr) {
                    return dateStr >= startStr && dateStr <= endStr;
                } else if (startStr) {
                    return dateStr === startStr;
                } else if (endStr) {
                    return dateStr === endStr;
                }
                return false;
            }).map(p => ({
                ...p,
                color: p.color || '#8b5cf6',
                isStart: p.startDate === dateStr,
                isEnd: p.endDate === dateStr
            }));

            days.push({
                dayName: date.toLocaleDateString(currentLocale, { weekday: 'short' }),
                dayNum: date.getDate(),
                isToday: date.getTime() === todayDate.getTime(),
                isSelected: date.getTime() === selectedDateObj.getTime(),
                date: new Date(date),
                hasTasks: hasTasks,
                projectTimelines: projectTimelines
            });
        }
        return days;
    };

    const weekDays = getWeekDays();

    // Generate month days for month picker
    const getMonthDays = () => {
        const targetDate = weekDays.length > 0 ? weekDays[3].date : new Date();
        const year = targetDate.getFullYear();
        const month = targetDate.getMonth();

        const firstDayOfMonth = new Date(year, month, 1);
        const lastDayOfMonth = new Date(year, month + 1, 0);
        const startDay = firstDayOfMonth.getDay();
        const daysInMonth = lastDayOfMonth.getDate();

        const days = [];

        // Add empty slots for days before the first of the month
        const startOffset = startDay === 0 ? 6 : startDay - 1; // Monday start
        for (let i = 0; i < startOffset; i++) {
            days.push(null);
        }

        // Add all days of the month
        const todayDate = new Date();
        todayDate.setHours(0, 0, 0, 0);
        const selectedDateObj = new Date(selectedDate);
        selectedDateObj.setHours(0, 0, 0, 0);

        for (let i = 1; i <= daysInMonth; i++) {
            const date = new Date(year, month, i);
            date.setHours(0, 0, 0, 0);

            // Get project timelines for this date - use string comparison for reliability
            const dateStr = date.toISOString().split('T')[0];
            const projectTimelines = projects.filter(p => {
                if (!p.startDate && !p.endDate) return false;
                if (p.status !== 'active' && p.status !== 'not-started') return false;
                const startStr = p.startDate || null;
                const endStr = p.endDate || null;

                if (startStr && endStr) {
                    return dateStr >= startStr && dateStr <= endStr;
                } else if (startStr) {
                    return dateStr === startStr;
                } else if (endStr) {
                    return dateStr === endStr;
                }
                return false;
            }).map(p => ({
                ...p,
                color: p.color || '#8b5cf6',
                isStart: p.startDate === dateStr,
                isEnd: p.endDate === dateStr
            }));

            days.push({
                dayNum: i,
                date: date,
                isToday: date.getTime() === todayDate.getTime(),
                isSelected: date.getTime() === selectedDateObj.getTime(),
                hasTasks: getResolvedTasksForDate(date).length > 0,
                projectTimelines: projectTimelines
            });
        }

        return days;
    };

    // Get month/year for the current week view
    const getWeekMonthYear = () => {
        if (weekDays.length === 0) return '';
        const firstDay = weekDays[0].date;
        const lastDay = weekDays[6].date;

        if (firstDay.getMonth() === lastDay.getMonth()) {
            return firstDay.toLocaleDateString(currentLocale, { month: 'long', year: 'numeric' });
        } else {
            return `${firstDay.toLocaleDateString(currentLocale, { month: 'short' })} - ${lastDay.toLocaleDateString(currentLocale, { month: 'short', year: 'numeric' })}`;
        }
    };

    const goToPreviousWeek = () => setWeekOffset(prev => prev - 1);
    const goToNextWeek = () => setWeekOffset(prev => prev + 1);
    const goToToday = () => {
        setWeekOffset(0);
        setSelectedDate(today);
    };

    const changeMonth = (delta) => {
        setWeekOffset(prev => prev + (delta * 4)); // Roughly 4 weeks per month
    };

    const selectDateFromMonth = (date) => {
        // Calculate the week offset for this date
        const now = new Date();
        const currentDay = now.getDay();
        const daysToMonday = currentDay === 0 ? 6 : currentDay - 1;
        const currentWeekStart = new Date(now);
        currentWeekStart.setDate(now.getDate() - daysToMonday);
        currentWeekStart.setHours(0, 0, 0, 0);

        const targetDay = date.getDay();
        const targetDaysToMonday = targetDay === 0 ? 6 : targetDay - 1;
        const targetWeekStart = new Date(date);
        targetWeekStart.setDate(date.getDate() - targetDaysToMonday);
        targetWeekStart.setHours(0, 0, 0, 0);

        const diffTime = targetWeekStart.getTime() - currentWeekStart.getTime();
        const diffWeeks = Math.round(diffTime / (7 * 24 * 60 * 60 * 1000));

        setWeekOffset(diffWeeks);
        setSelectedDate(date);
        setShowMonthPicker(false);
    };

    const selectDay = (date) => {
        setSelectedDate(new Date(date));
    };

    return (
        <>
            <div className="flex items-center justify-between mb-2">
                <button
                    onClick={goToPreviousWeek}
                    className="w-8 h-8 rounded-lg bg-white/5 hover:bg-white/10 flex items-center justify-center text-slate-400 hover:text-white transition-all"
                >
                    <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
                    </svg>
                </button>

                <button
                    onClick={() => setShowMonthPicker(!showMonthPicker)}
                    className="px-3 py-1.5 rounded-lg bg-white/5 hover:bg-white/10 text-slate-300 hover:text-white text-sm font-medium transition-all flex items-center gap-2"
                >
                    <span>{getWeekMonthYear()}</span>
                    <svg className={`w-4 h-4 transition-transform ${showMonthPicker ? 'rotate-180' : ''}`} fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                    </svg>
                </button>

                <div className="flex items-center gap-1">
                    {weekOffset !== 0 && (
                        <button
                            onClick={goToToday}
                            className="px-2 py-1 rounded-lg bg-purple-500/20 hover:bg-purple-500/30 text-purple-400 text-xs font-medium transition-all mr-1"
                        >
                            {t('plan.today')}
                        </button>
                    )}
                    <button
                        onClick={goToNextWeek}
                        className="w-8 h-8 rounded-lg bg-white/5 hover:bg-white/10 flex items-center justify-center text-slate-400 hover:text-white transition-all"
                    >
                        <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                        </svg>
                    </button>
                </div>
            </div>

            {showMonthPicker && (
                <div className="glass-card rounded-2xl p-4 mb-4 animate-fadeIn">
                    {/* Month Navigation */}
                    <div className="flex items-center gap-4">
                        <button onClick={() => changeMonth(-1)} className="p-2 hover:bg-white/10 rounded-full transition-colors text-slate-400 hover:text-white">
                            <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
                            </svg>
                        </button>
                        <h2 className="text-xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-purple-400 to-indigo-400 capitalize">
                            {selectedDate.toLocaleDateString(currentLocale, { month: 'long', year: 'numeric' })}
                        </h2>
                        <button onClick={() => changeMonth(1)} className="p-2 hover:bg-white/10 rounded-full transition-colors text-slate-400 hover:text-white">
                            <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                            </svg>
                        </button>
                    </div>

                    <button
                        onClick={() => goToToday()}
                        className="px-3 py-1.5 rounded-lg bg-white/5 border border-white/10 text-xs font-medium text-slate-300 hover:bg-white/10 transition-colors"
                    >
                        {t('plan.today')}
                    </button>

                    <div className="grid grid-cols-7 mb-2">
                        {(() => {
                            const baseDate = new Date(2024, 0, 1); // A Monday
                            return Array.from({ length: 7 }).map((_, i) => {
                                const d = new Date(baseDate);
                                d.setDate(baseDate.getDate() + i);
                                return (
                                    <div key={i} className="text-center text-xs font-medium text-slate-500 uppercase tracking-wider py-2">
                                        {d.toLocaleDateString(currentLocale, { weekday: 'short' })}
                                    </div>
                                );
                            });
                        })()}
                    </div>

                    {/* Calendar Grid with Notion-style Timeline */}
                    {(() => {
                        const monthDays = getMonthDays();
                        const projectsWithDates = projects.filter(p => p.startDate && p.endDate && (p.status === 'active' || p.status === 'not-started'));

                        // Group days into weeks
                        const weeks = [];
                        for (let i = 0; i < monthDays.length; i += 7) {
                            weeks.push(monthDays.slice(i, i + 7));
                        }

                        return (
                            <div className="space-y-0">
                                {weeks.map((week, weekIdx) => {
                                    // Get first and last valid day of this week
                                    const validDays = week.filter(d => d !== null);
                                    if (validDays.length === 0) return null;

                                    const weekStartDate = validDays[0]?.date;
                                    const weekEndDate = validDays[validDays.length - 1]?.date;
                                    const weekStartStr = weekStartDate?.toISOString().split('T')[0] || '';
                                    const weekEndStr = weekEndDate?.toISOString().split('T')[0] || '';

                                    // Find projects visible in this week
                                    const weekProjects = projectsWithDates.filter(p => {
                                        return p.endDate >= weekStartStr && p.startDate <= weekEndStr;
                                    });

                                    return (
                                        <div key={weekIdx} className="border-b border-white/5 last:border-b-0">
                                            {/* Day Numbers Row */}
                                            <div className="grid grid-cols-7 gap-0">
                                                {week.map((day, dayIdx) => (
                                                    <button
                                                        key={dayIdx}
                                                        onClick={() => day && selectDateFromMonth(day.date)}
                                                        disabled={!day}
                                                        className={`py-2 text-sm font-medium transition-all flex flex-col items-center justify-center
                              ${!day ? 'invisible' : ''}
                              ${day?.isSelected
                                                                ? 'bg-gradient-to-br from-purple-500/40 to-indigo-600/40 text-white'
                                                                : day?.isToday
                                                                    ? 'text-purple-400'
                                                                    : 'hover:bg-white/5 text-slate-300'}`}
                                                    >
                                                        <span className={`w-7 h-7 flex items-center justify-center rounded-full ${day?.isSelected ? 'bg-purple-500' : day?.isToday ? 'ring-1 ring-purple-400/50' : ''}`}>
                                                            {day?.dayNum}
                                                        </span>
                                                        {day?.hasTasks && !day?.isSelected && (
                                                            <div className="w-1 h-1 rounded-full bg-purple-400 mt-0.5"></div>
                                                        )}
                                                    </button>
                                                ))}
                                            </div>

                                            {/* Project Timeline Bars for this week */}
                                            {weekProjects.length > 0 && (
                                                <div className="px-1 pb-2 space-y-1">
                                                    {weekProjects.slice(0, 3).map(project => {
                                                        const projectColor = project.color || '#8b5cf6';
                                                        const startDate = new Date(project.startDate);
                                                        const endDate = new Date(project.endDate);
                                                        startDate.setHours(0, 0, 0, 0);
                                                        endDate.setHours(0, 0, 0, 0);

                                                        // Calculate bar position within this week
                                                        let startIdx = 0;
                                                        let endIdx = 6;

                                                        week.forEach((day, idx) => {
                                                            if (!day) return;
                                                            const dayStr = day.date.toISOString().split('T')[0];

                                                            if (dayStr === project.startDate) startIdx = idx;
                                                            if (dayStr === project.endDate) endIdx = idx;
                                                        });

                                                        // Clamp to week boundaries
                                                        if (startDate < weekStartDate) startIdx = week.findIndex(d => d !== null);
                                                        if (endDate > weekEndDate) endIdx = week.length - 1 - [...week].reverse().findIndex(d => d !== null);

                                                        const leftPercent = (startIdx / 7) * 100;
                                                        const widthPercent = ((endIdx - startIdx + 1) / 7) * 100;

                                                        const isStartVisible = project.startDate >= weekStartStr;
                                                        const isEndVisible = project.endDate <= weekEndStr;

                                                        return (
                                                            <div key={project.id} className="relative h-5">
                                                                <div
                                                                    className="absolute top-0 h-full flex items-center px-1.5 cursor-pointer hover:brightness-110 transition-all overflow-hidden"
                                                                    style={{
                                                                        left: `${leftPercent}%`,
                                                                        width: `${widthPercent}%`,
                                                                        backgroundColor: projectColor,
                                                                        opacity: 0.85,
                                                                        borderRadius: isStartVisible && isEndVisible ? '4px' : isStartVisible ? '4px 0 0 4px' : isEndVisible ? '0 4px 4px 0' : '0'
                                                                    }}
                                                                    onClick={() => onProjectClick && onProjectClick(project)}
                                                                >
                                                                    <span className="text-[10px] text-white font-medium truncate">
                                                                        {project.title}
                                                                    </span>
                                                                </div>
                                                            </div>
                                                        );
                                                    })}
                                                </div>
                                            )}
                                        </div>
                                    );
                                })}
                            </div>
                        );
                    })()}
                </div>
            )}

            {/* Week Calendar with Notion-style Project Timelines */}
            {
                (() => {
                    const projectsWithDates = projects.filter(p => p.startDate && p.endDate && (p.status === 'active' || p.status === 'not-started'));
                    const weekStart = weekDays[0]?.date;
                    const weekEnd = weekDays[6]?.date;
                    const weekStartStr = weekStart?.toISOString().split('T')[0] || '';
                    const weekEndStr = weekEnd?.toISOString().split('T')[0] || '';

                    const visibleProjects = projectsWithDates.filter(p => {
                        return p.endDate >= weekStartStr && p.startDate <= weekEndStr;
                    });

                    return (
                        <div className="mb-6 glass-card rounded-2xl overflow-hidden transition-all duration-200">
                            <div className="flex border-b border-white/10">
                                {weekDays.map((day, idx) => {
                                    return (
                                        <button
                                            key={idx}
                                            onClick={() => selectDay(day.date)}
                                            className={`flex-1 flex flex-col items-center py-3 px-1 transition-all duration-200 border-r border-white/5 last:border-r-0
                      ${day.isSelected
                                                    ? 'bg-gradient-to-b from-purple-500/30 to-indigo-600/20'
                                                    : day.isToday
                                                        ? 'bg-white/5'
                                                        : 'hover:bg-white/5'}`}
                                        >
                                            <span className={`text-[10px] font-medium uppercase tracking-wide ${day.isSelected
                                                ? 'text-purple-300'
                                                : day.isToday
                                                    ? 'text-purple-400'
                                                    : 'text-slate-500'
                                                }`}>
                                                {day.dayName}
                                            </span>
                                            <span className={`text-lg font-semibold ${day.isSelected
                                                ? 'text-white'
                                                : day.isToday
                                                    ? 'text-purple-300'
                                                    : 'text-slate-300'
                                                }`}>
                                                {day.dayNum}
                                            </span>
                                            {day.hasTasks && (
                                                <div className={`w-1.5 h-1.5 rounded-full mt-1 ${day.isSelected ? 'bg-white' : 'bg-purple-400'}`}></div>
                                            )}
                                        </button>
                                    );
                                })}
                            </div>

                            {visibleProjects.length > 0 && (
                                <div className="p-2 space-y-1">
                                    {visibleProjects.map(project => {
                                        const projectColor = project.color || '#8b5cf6';
                                        const startDate = new Date(project.startDate);
                                        const endDate = new Date(project.endDate);
                                        startDate.setHours(0, 0, 0, 0);
                                        endDate.setHours(0, 0, 0, 0);

                                        let startIdx = -1;
                                        let endIdx = -1;

                                        weekDays.forEach((day, idx) => {
                                            const dayTime = day.date.getTime();
                                            if (dayTime >= startDate.getTime() && dayTime <= endDate.getTime()) {
                                                if (startIdx === -1) startIdx = idx;
                                                endIdx = idx;
                                            }
                                        });

                                        if (startDate < weekStart && endDate >= weekStart) startIdx = 0;
                                        if (endDate > weekEnd && startDate <= weekEnd) endIdx = 6;

                                        if (startIdx === -1 || endIdx === -1) return null;

                                        const leftPercent = (startIdx / 7) * 100;
                                        const widthPercent = ((endIdx - startIdx + 1) / 7) * 100;
                                        const isStartVisible = project.startDate >= weekStartStr;
                                        const isEndVisible = project.endDate <= weekEndStr;

                                        return (
                                            <div key={project.id} className="relative h-6">
                                                <div
                                                    className="absolute top-0 h-full flex items-center px-2 cursor-pointer hover:brightness-110 transition-all overflow-hidden"
                                                    style={{
                                                        left: `${leftPercent}%`,
                                                        width: `${widthPercent}%`,
                                                        backgroundColor: projectColor,
                                                        opacity: 0.85,
                                                        borderRadius: isStartVisible && isEndVisible ? '6px' : isStartVisible ? '6px 0 0 6px' : isEndVisible ? '0 6px 6px 0' : '0'
                                                    }}
                                                    onClick={() => onProjectClick && onProjectClick(project)}
                                                >
                                                    <span className="text-[11px] text-white font-medium truncate">
                                                        {project.title}
                                                    </span>
                                                </div>
                                            </div>
                                        );
                                    })}
                                </div>
                            )}
                        </div>
                    );
                })()
            }
        </>
    );
};
