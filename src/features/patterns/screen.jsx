import React, { useState } from 'react';
import { getDateKey } from '../../shared/utils/date';

export const PatternsScreen = ({
    viewMode,
    setViewMode,
    activeSection,
    setActiveSection,
    projects,
    routineTemplates,
    getRoutinesForDate,
    reflectionsByDate,
    getResolvedTasksForDate,
    t,
    currentLocale
}) => {
    const [selectedMonth, setSelectedMonth] = useState(new Date());

    const getWeekDays = () => {
        const days = [];
        const today = new Date();
        for (let i = 6; i >= 0; i--) {
            const date = new Date(today);
            date.setDate(today.getDate() - i);
            date.setHours(0, 0, 0, 0);
            days.push(date);
        }
        return days;
    };

    const getMonthDays = () => {
        const year = selectedMonth.getFullYear();
        const month = selectedMonth.getMonth();
        const lastDay = new Date(year, month + 1, 0);
        const days = [];
        for (let i = 1; i <= lastDay.getDate(); i++) {
            const date = new Date(year, month, i);
            date.setHours(0, 0, 0, 0);
            days.push(date);
        }
        return days;
    };

    const getRoutineStats = (date) => {
        const routines = getRoutinesForDate(date);
        const morningTotal = routines.morning.habits.length;
        const morningDone = routines.morning.habits.filter(h => h.completed).length;
        const morningPercent = morningTotal > 0 ? Math.round((morningDone / morningTotal) * 100) : 0;
        const eveningTotal = routines.evening.habits.length;
        const eveningDone = routines.evening.habits.filter(h => h.completed).length;
        const eveningPercent = eveningTotal > 0 ? Math.round((eveningDone / eveningTotal) * 100) : 0;
        return {
            morning: { done: morningDone, total: morningTotal, percent: morningPercent },
            evening: { done: eveningDone, total: eveningTotal, percent: eveningPercent },
            overall: morningTotal + eveningTotal > 0 ? Math.round(((morningDone + eveningDone) / (morningTotal + eveningTotal)) * 100) : 0
        };
    };

    const getReflectionStats = (date) => {
        const dateKey = getDateKey(date);
        const reflection = reflectionsByDate[dateKey];
        return {
            rating: reflection?.rating || 0,
            hasReflection: reflection && (reflection.activities || reflection.topResult || reflection.rating),
            hasPhoto: !!reflection?.photo,
            hasCapsule: !!reflection?.capsuleCreated
        };
    };

    const getTaskStatsForDate = (date) => {
        const dayTasks = getResolvedTasksForDate(date);
        const completed = dayTasks.filter(t => t.completed).length;
        const total = dayTasks.length;
        return { completed, total, percent: total > 0 ? Math.round((completed / total) * 100) : 0 };
    };

    const weekDays = getWeekDays();
    const monthDays = getMonthDays();

    const weekStats = weekDays.map(date => ({
        date, dayName: date.toLocaleDateString('en-US', { weekday: 'short' }), dayNum: date.getDate(), ...getRoutineStats(date)
    }));

    const weekReflectStats = weekDays.map(date => ({
        date, dayName: date.toLocaleDateString('en-US', { weekday: 'short' }), dayNum: date.getDate(), ...getReflectionStats(date)
    }));

    const weekTaskStats = weekDays.map(date => ({
        date,
        dayName: date.toLocaleDateString('en-US', { weekday: 'short' }),
        dayNum: date.getDate(),
        ...getTaskStatsForDate(date)
    }));

    const monthStats = monthDays.map(date => ({ date, dayNum: date.getDate(), ...getRoutineStats(date) }));
    const monthReflectStats = monthDays.map(date => ({ date, dayNum: date.getDate(), ...getReflectionStats(date) }));

    const monthTaskStats = monthDays.map(date => ({
        date,
        dayNum: date.getDate(),
        ...getTaskStatsForDate(date)
    }));

    const weekAvgMorning = Math.round(weekStats.reduce((sum, d) => sum + d.morning.percent, 0) / 7);
    const weekAvgEvening = Math.round(weekStats.reduce((sum, d) => sum + d.evening.percent, 0) / 7);
    const weekAvgOverall = Math.round(weekStats.reduce((sum, d) => sum + d.overall, 0) / 7);

    const weekRatings = weekReflectStats.filter(d => d.rating > 0);
    const weekAvgRating = weekRatings.length > 0 ? (weekRatings.reduce((sum, d) => sum + d.rating, 0) / weekRatings.length).toFixed(1) : '—';
    const weekReflectionCount = weekReflectStats.filter(d => d.hasReflection).length;
    const weekPhotoCount = weekReflectStats.filter(d => d.hasPhoto).length;
    const perfectDaysWeek = weekStats.filter(d => d.overall === 100).length;

    const weekTasksCompleted = weekTaskStats.reduce((sum, d) => sum + d.completed, 0);
    const weekTasksTotal = weekTaskStats.reduce((sum, d) => sum + d.total, 0);
    const weekTasksPercent = weekTasksTotal > 0 ? Math.round((weekTasksCompleted / weekTasksTotal) * 100) : 0;

    const calculateStreak = () => {
        let streak = 0;
        const today = new Date();
        for (let i = 0; i < 30; i++) {
            const date = new Date(today);
            date.setDate(today.getDate() - i);
            const stats = getRoutineStats(date);
            if (stats.overall >= 80) streak++;
            else if (i > 0) break;
        }
        return streak;
    };

    const calculateReflectStreak = () => {
        let streak = 0;
        const today = new Date();
        for (let i = 0; i < 30; i++) {
            const date = new Date(today);
            date.setDate(today.getDate() - i);
            const stats = getReflectionStats(date);
            if (stats.hasReflection) streak++;
            else if (i > 0) break;
        }
        return streak;
    };

    const currentStreak = calculateStreak();
    const reflectStreak = calculateReflectStreak();

    const prevMonth = () => setSelectedMonth(prev => { const d = new Date(prev); d.setMonth(prev.getMonth() - 1); return d; });
    const nextMonth = () => setSelectedMonth(prev => { const d = new Date(prev); d.setMonth(prev.getMonth() + 1); return d; });

    const getBarColor = (percent) => {
        if (percent === 100) return 'from-emerald-500 to-emerald-400';
        if (percent >= 80) return 'from-green-500 to-green-400';
        if (percent >= 50) return 'from-amber-500 to-amber-400';
        if (percent > 0) return 'from-orange-500 to-orange-400';
        return 'from-slate-600 to-slate-500';
    };

    const getHeatmapColor = (percent) => {
        if (percent === 100) return 'bg-emerald-500';
        if (percent >= 80) return 'bg-emerald-400/80';
        if (percent >= 60) return 'bg-green-400/70';
        if (percent >= 40) return 'bg-amber-400/60';
        if (percent >= 20) return 'bg-orange-400/50';
        if (percent > 0) return 'bg-orange-300/40';
        return 'bg-white/10';
    };

    const getRatingColor = (rating) => {
        if (rating >= 9) return 'from-emerald-500 to-emerald-400';
        if (rating >= 7) return 'from-green-500 to-green-400';
        if (rating >= 5) return 'from-amber-500 to-amber-400';
        if (rating >= 3) return 'from-orange-500 to-orange-400';
        if (rating > 0) return 'from-rose-500 to-rose-400';
        return 'from-slate-600 to-slate-500';
    };

    const getRatingHeatmapColor = (rating) => {
        if (rating >= 9) return 'bg-emerald-500';
        if (rating >= 7) return 'bg-green-400/80';
        if (rating >= 5) return 'bg-amber-400/70';
        if (rating >= 3) return 'bg-orange-400/60';
        if (rating > 0) return 'bg-rose-400/50';
        return 'bg-white/10';
    };

    const getRatingEmoji = (rating) => {
        if (rating >= 9) return '🌟';
        if (rating >= 7) return '😊';
        if (rating >= 5) return '😐';
        if (rating >= 3) return '😔';
        if (rating > 0) return '😢';
        return '—';
    };

    // Project stats
    const activeProjects = projects.filter(p => p.status !== 'completed');
    const getProjectProgress = (project) => {
        const total = project.tasks?.length || 0;
        const completed = project.tasks?.filter(t => t.completed).length || 0;
        return { total, completed, percent: total > 0 ? Math.round((completed / total) * 100) : 0 };
    };

    // Tasks by energy level
    const allProjectTasks = projects.flatMap(p => p.tasks || []);
    const tasksByEnergy = {
        high: allProjectTasks.filter(t => t.energy === 'high').length,
        medium: allProjectTasks.filter(t => t.energy === 'medium').length,
        low: allProjectTasks.filter(t => t.energy === 'low').length
    };
    const totalEnergyTasks = tasksByEnergy.high + tasksByEnergy.medium + tasksByEnergy.low;


    return (
        <div className="pb-28 animate-fadeIn">
            <div className="mb-6 text-center">
                <p className="text-emerald-400/80 text-xs font-medium uppercase tracking-widest mb-2">{t('patterns.analytics')}</p>
                <h1 className="text-3xl font-semibold text-white tracking-tight">{t('patterns.title')}</h1>
            </div>

            <div className="flex gap-2 mb-6">
                <button onClick={() => setActiveSection('habits')} className={`flex-1 py-3 rounded-xl font-medium text-sm transition-all flex items-center justify-center gap-2 ${activeSection === 'habits' ? 'bg-gradient-to-r from-purple-500 to-indigo-500 text-white' : 'glass-card text-slate-400'}`}>
                    <span className="text-lg">✅</span> {t('patterns.habits')}
                </button>
                <button onClick={() => setActiveSection('tasks')} className={`flex-1 py-3 rounded-xl font-medium text-sm transition-all flex items-center justify-center gap-2 ${activeSection === 'tasks' ? 'bg-gradient-to-r from-cyan-500 to-blue-500 text-white' : 'glass-card text-slate-400'}`}>
                    <span className="text-lg">📋</span> {t('patterns.tasks')}
                </button>
                <button onClick={() => setActiveSection('reflect')} className={`flex-1 py-3 rounded-xl font-medium text-sm transition-all flex items-center justify-center gap-2 ${activeSection === 'reflect' ? 'bg-gradient-to-r from-indigo-500 to-purple-500 text-white' : 'glass-card text-slate-400'}`}>
                    <span className="text-lg">🧠</span> {t('patterns.reflect')}
                </button>
            </div>

            {/* CONTENT */}
            {activeSection === 'habits' ? (
                <>
                    <div className="grid grid-cols-3 gap-3 mb-6">
                        <div className="glass-card rounded-2xl p-4 text-center">
                            <div className="text-2xl mb-1">🔥</div>
                            <p className="text-3xl font-bold text-white">{currentStreak}</p>
                            <p className="text-slate-400 text-xs">{t('patterns.dayStreak')}</p>
                        </div>
                        <div className="glass-card rounded-2xl p-4 text-center">
                            <div className="text-2xl mb-1">⭐</div>
                            <p className="text-3xl font-bold text-white">{perfectDaysWeek}</p>
                            <p className="text-slate-400 text-xs">{t('patterns.perfectDays')}</p>
                        </div>
                        <div className="glass-card rounded-2xl p-4 text-center">
                            <div className="text-2xl mb-1">📊</div>
                            <p className="text-3xl font-bold text-white">{weekAvgOverall}%</p>
                            <p className="text-slate-400 text-xs">{t('patterns.weekAvg')}</p>
                        </div>
                    </div>
                    {/* View Toggle */}
                    <div className="flex bg-white/5 p-1 rounded-xl mb-6">
                        <button onClick={() => setViewMode('week')} className={`flex-1 py-3 rounded-xl font-medium text-sm transition-all ${viewMode === 'week' ? 'bg-gradient-to-r from-emerald-500 to-green-500 text-white' : 'text-slate-400'}`}>{t('patterns.weekView')}</button>
                        <button onClick={() => setViewMode('month')} className={`flex-1 py-3 rounded-xl font-medium text-sm transition-all ${viewMode === 'month' ? 'bg-gradient-to-r from-emerald-500 to-green-500 text-white' : 'text-slate-400'}`}>{t('patterns.monthView')}</button>
                    </div>

                    {viewMode === 'week' ? (
                        <>
                            <div className="glass-card rounded-2xl p-4 mb-4">
                                <div className="flex items-center justify-between mb-4">
                                    <div className="flex items-center gap-2"><span className="text-xl">🌅</span><h3 className="text-white font-medium">{t('plan.morningRoutine')}</h3></div>
                                    <span className="text-emerald-400 text-sm font-medium">{weekAvgMorning}% avg</span>
                                </div>
                                <div className="flex items-end justify-between gap-2 h-32">
                                    {weekStats.map((day, idx) => (
                                        <div key={idx} className="flex-1 flex flex-col items-center gap-2">
                                            <div className="w-full h-24 bg-white/5 rounded-lg relative overflow-hidden">
                                                <div className={`absolute bottom-0 w-full rounded-lg bg-gradient-to-t ${getBarColor(day.morning.percent)} transition-all duration-500`} style={{ height: `${day.morning.percent}%` }} />
                                            </div>
                                            <span className="text-[10px] text-slate-400">{day.dayName}</span>
                                            <span className="text-xs text-slate-300 font-medium">{day.morning.percent}%</span>
                                        </div>
                                    ))}
                                </div>
                            </div>

                            <div className="glass-card rounded-2xl p-4 mb-4">
                                <div className="flex items-center justify-between mb-4">
                                    <div className="flex items-center gap-2"><span className="text-xl">🌙</span><h3 className="text-white font-medium">{t('patterns.eveningRoutine')}</h3></div>
                                    <span className="text-indigo-400 text-sm font-medium">{weekAvgEvening}% avg</span>
                                </div>
                                <div className="flex items-end justify-between gap-2 h-32">
                                    {weekStats.map((day, idx) => (
                                        <div key={idx} className="flex-1 flex flex-col items-center gap-2">
                                            <div className="w-full h-24 bg-white/5 rounded-lg relative overflow-hidden">
                                                <div className={`absolute bottom-0 w-full rounded-lg bg-gradient-to-t ${getBarColor(day.evening.percent)} transition-all duration-500`} style={{ height: `${day.evening.percent}%` }} />
                                            </div>
                                            <span className="text-[10px] text-slate-400">{day.dayName}</span>
                                            <span className="text-xs text-slate-300 font-medium">{day.evening.percent}%</span>
                                        </div>
                                    ))}
                                </div>
                            </div>

                            <div className="glass-card rounded-2xl p-4">
                                <h3 className="text-white font-medium mb-4">{t('patterns.habits')}</h3>
                                <div className="mb-4">
                                    <p className="text-slate-400 text-xs uppercase tracking-wider mb-2">🌅 {t('patterns.morning')}</p>
                                    <div className="space-y-2">
                                        {routineTemplates.morning.habits.map(habit => {
                                            const completedDays = weekStats.filter(day => { const r = getRoutinesForDate(day.date); return r.morning.habits.find(h => h.id === habit.id)?.completed; }).length;
                                            const percent = Math.round((completedDays / 7) * 100);
                                            return (
                                                <div key={habit.id} className="flex items-center gap-3">
                                                    <span className="text-slate-300 text-sm flex-1 truncate">{habit.title}</span>
                                                    <div className="w-24 h-2 bg-white/10 rounded-full overflow-hidden"><div className={`h-full rounded-full bg-gradient-to-r ${getBarColor(percent)}`} style={{ width: `${percent}%` }} /></div>
                                                    <span className="text-slate-400 text-xs w-12 text-right">{completedDays}/7</span>
                                                </div>
                                            );
                                        })}
                                    </div>
                                </div>
                                <div>
                                    <p className="text-slate-400 text-xs uppercase tracking-wider mb-2">🌙 {t('patterns.evening')}</p>
                                    <div className="space-y-2">
                                        {routineTemplates.evening.habits.map(habit => {
                                            const completedDays = weekStats.filter(day => { const r = getRoutinesForDate(day.date); return r.evening.habits.find(h => h.id === habit.id)?.completed; }).length;
                                            const percent = Math.round((completedDays / 7) * 100);
                                            return (
                                                <div key={habit.id} className="flex items-center gap-3">
                                                    <span className="text-slate-300 text-sm flex-1 truncate">{habit.title}</span>
                                                    <div className="w-24 h-2 bg-white/10 rounded-full overflow-hidden"><div className={`h-full rounded-full bg-gradient-to-r ${getBarColor(percent)}`} style={{ width: `${percent}%` }} /></div>
                                                    <span className="text-slate-400 text-xs w-12 text-right">{completedDays}/7</span>
                                                </div>
                                            );
                                        })}
                                    </div>
                                </div>
                            </div>
                        </>
                    ) : (
                        <>
                            <div className="flex items-center justify-between mb-4">
                                <button onClick={prevMonth} className="w-10 h-10 rounded-xl glass-card flex items-center justify-center text-slate-400 hover:text-white transition-all"><svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" /></svg></button>
                                <h3 className="text-white font-medium">{selectedMonth.toLocaleDateString(currentLocale, { month: 'long', year: 'numeric' })}</h3>
                                <button onClick={nextMonth} className="w-10 h-10 rounded-xl glass-card flex items-center justify-center text-slate-400 hover:text-white transition-all"><svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" /></svg></button>
                            </div>

                            <div className="glass-card rounded-2xl p-4 mb-4">
                                <div className="flex items-center gap-2 mb-3"><span className="text-lg">🌅</span><h3 className="text-white font-medium">{t('plan.morningRoutine')}</h3></div>
                                <div className="grid grid-cols-7 gap-1 mb-2">
                                    {(() => {
                                        const baseDate = new Date(2024, 0, 1);
                                        return Array.from({ length: 7 }).map((_, i) => {
                                            const d = new Date(baseDate);
                                            d.setDate(baseDate.getDate() + i);
                                            return (
                                                <div key={i} className="text-center text-[10px] text-slate-500">
                                                    {d.toLocaleDateString(currentLocale, { weekday: 'narrow' })}
                                                </div>
                                            );
                                        });
                                    })()}
                                </div>
                                <div className="grid grid-cols-7 gap-1">
                                    {Array.from({ length: (new Date(selectedMonth.getFullYear(), selectedMonth.getMonth(), 1).getDay() + 6) % 7 }).map((_, i) => <div key={`e${i}`} className="aspect-square" />)}
                                    {monthStats.map((day, i) => <div key={i} className={`aspect-square rounded-md ${getHeatmapColor(day.morning.percent)} flex items-center justify-center transition-all hover:scale-110`}><span className="text-[10px] text-white/70">{day.dayNum}</span></div>)}
                                </div>
                                <div className="flex items-center justify-center gap-1 mt-3"><span className="text-[10px] text-slate-500">0%</span><div className="w-4 h-3 rounded bg-white/10"></div><div className="w-4 h-3 rounded bg-orange-400/50"></div><div className="w-4 h-3 rounded bg-amber-400/60"></div><div className="w-4 h-3 rounded bg-green-400/70"></div><div className="w-4 h-3 rounded bg-emerald-500"></div><span className="text-[10px] text-slate-500">100%</span></div>
                            </div>

                            <div className="glass-card rounded-2xl p-4">
                                <div className="flex items-center gap-2 mb-3"><span className="text-lg">🌙</span><h3 className="text-white font-medium">{t('patterns.eveningRoutine')}</h3></div>
                                <div className="grid grid-cols-7 gap-1 mb-2">
                                    {(() => {
                                        const baseDate = new Date(2024, 0, 1);
                                        return Array.from({ length: 7 }).map((_, i) => {
                                            const d = new Date(baseDate);
                                            d.setDate(baseDate.getDate() + i);
                                            return (
                                                <div key={i} className="text-center text-[10px] text-slate-500">
                                                    {d.toLocaleDateString(currentLocale, { weekday: 'narrow' })}
                                                </div>
                                            );
                                        });
                                    })()}
                                </div>
                                <div className="grid grid-cols-7 gap-1">
                                    {Array.from({ length: (new Date(selectedMonth.getFullYear(), selectedMonth.getMonth(), 1).getDay() + 6) % 7 }).map((_, i) => <div key={`e${i}`} className="aspect-square" />)}
                                    {monthStats.map((day, i) => <div key={i} className={`aspect-square rounded-md ${getHeatmapColor(day.evening.percent)} flex items-center justify-center transition-all hover:scale-110`}><span className="text-[10px] text-white/70">{day.dayNum}</span></div>)}
                                </div>
                                <div className="flex items-center justify-center gap-1 mt-3"><span className="text-[10px] text-slate-500">0%</span><div className="w-4 h-3 rounded bg-white/10"></div><div className="w-4 h-3 rounded bg-orange-400/50"></div><div className="w-4 h-3 rounded bg-amber-400/60"></div><div className="w-4 h-3 rounded bg-green-400/70"></div><div className="w-4 h-3 rounded bg-emerald-500"></div><span className="text-[10px] text-slate-500">100%</span></div>
                            </div>
                        </>
                    )}
                </>
            ) : activeSection === 'tasks' ? (
                <>
                    {/* Tasks Stats Overview Cards */}
                    <div className="grid grid-cols-3 gap-3 mb-6">
                        <div className="glass-card rounded-2xl p-4 text-center">
                            <div className="text-2xl mb-1">✅</div>
                            <p className="text-3xl font-bold text-white">{weekTasksCompleted}</p>
                            <p className="text-slate-400 text-xs">{t('patterns.completion')}</p>
                        </div>
                        <div className="glass-card rounded-2xl p-4 text-center">
                            <div className="text-2xl mb-1">📊</div>
                            <p className="text-3xl font-bold text-white">{weekTasksPercent}%</p>
                            <p className="text-slate-400 text-xs">{t('patterns.completion')}</p>
                        </div>
                        <div className="glass-card rounded-2xl p-4 text-center">
                            <div className="text-2xl mb-1">📁</div>
                            <p className="text-3xl font-bold text-white">{activeProjects.length}</p>
                            <p className="text-slate-400 text-xs">{t('patterns.activeProjects')}</p>
                        </div>
                    </div>

                    {/* View Toggle */}
                    <div className="flex gap-2 mb-6">
                        <button onClick={() => setViewMode('week')} className={`flex-1 py-3 rounded-xl font-medium text-sm transition-all ${viewMode === 'week' ? 'bg-gradient-to-r from-cyan-500 to-blue-500 text-white' : 'glass-card text-slate-400'}`}>{t('patterns.weekView')}</button>
                        <button onClick={() => setViewMode('month')} className={`flex-1 py-3 rounded-xl font-medium text-sm transition-all ${viewMode === 'month' ? 'bg-gradient-to-r from-cyan-500 to-blue-500 text-white' : 'glass-card text-slate-400'}`}>{t('patterns.monthView')}</button>
                    </div>

                    {viewMode === 'week' ? (
                        <>
                            {/* Tasks Completed - Week Chart */}
                            <div className="glass-card rounded-2xl p-4 mb-4">
                                <div className="flex items-center justify-between mb-4">
                                    <div className="flex items-center gap-2"><span className="text-xl">📋</span><h3 className="text-white font-medium">{t('patterns.dailyTasks')}</h3></div>
                                    <span className="text-cyan-400 text-sm font-medium">{weekTasksCompleted} total</span>
                                </div>
                                <div className="flex items-end justify-between gap-2 h-32">
                                    {weekTaskStats.map((day, idx) => (
                                        <div key={idx} className="flex-1 flex flex-col items-center gap-2">
                                            <div className="w-full h-24 bg-white/5 rounded-lg relative overflow-hidden">
                                                <div className={`absolute bottom-0 w-full rounded-lg bg-gradient-to-t ${getBarColor(day.percent)} transition-all duration-500`} style={{ height: `${day.percent}%` }} />
                                            </div>
                                            <span className="text-[10px] text-slate-400">{day.dayName}</span>
                                            <span className="text-xs text-slate-300 font-medium">{day.completed}/{day.total}</span>
                                        </div>
                                    ))}
                                </div>
                            </div>

                            {/* Project Progress */}
                            <div className="glass-card rounded-2xl p-4 mb-4">
                                <h3 className="text-white font-medium mb-4">{t('patterns.projectProgress')}</h3>
                                {projects.length === 0 ? (
                                    <p className="text-slate-500 text-sm text-center py-4">{t('patterns.noProjects')}</p>
                                ) : (
                                    <div className="space-y-4">
                                        {projects.map(project => {
                                            const progress = getProjectProgress(project);
                                            return (
                                                <div key={project.id}>
                                                    <div className="flex items-center justify-between mb-2">
                                                        <div className="flex items-center gap-2">
                                                            <span>{project.icon || '📁'}</span>
                                                            <span className="text-white text-sm font-medium truncate max-w-[150px]">{project.title}</span>
                                                        </div>
                                                        <span className="text-slate-400 text-xs">{progress.completed}/{progress.total}</span>
                                                    </div>
                                                    <div className="w-full h-3 bg-white/10 rounded-full overflow-hidden">
                                                        <div
                                                            className={`h-full rounded-full bg-gradient-to-r ${progress.percent === 100 ? 'from-emerald-500 to-green-500' :
                                                                progress.percent >= 50 ? 'from-cyan-500 to-blue-500' :
                                                                    'from-slate-500 to-slate-400'
                                                                } transition-all duration-500`}
                                                            style={{ width: `${progress.percent}%` }}
                                                        />
                                                    </div>
                                                    <p className="text-right text-xs text-slate-500 mt-1">{progress.percent}%</p>
                                                </div>
                                            );
                                        })}
                                    </div>
                                )}
                            </div>

                            {/* Tasks by Energy Level */}
                            <div className="glass-card rounded-2xl p-4">
                                <h3 className="text-white font-medium mb-4">{t('patterns.tasksByEnergy')}</h3>
                                {totalEnergyTasks === 0 ? (
                                    <p className="text-slate-500 text-sm text-center py-4">{t('patterns.noTasks')}</p>
                                ) : (
                                    <div className="space-y-3">
                                        <div className="flex items-center gap-3">
                                            <div className="w-8 h-8 rounded-lg bg-rose-500/20 flex items-center justify-center"><span className="text-sm">🔥</span></div>
                                            <span className="text-slate-300 text-sm flex-1">{t('patterns.highEnergy')}</span>
                                            <div className="w-32 h-2 bg-white/10 rounded-full overflow-hidden">
                                                <div className="h-full rounded-full bg-gradient-to-r from-rose-500 to-orange-500" style={{ width: `${(tasksByEnergy.high / totalEnergyTasks) * 100}%` }} />
                                            </div>
                                            <span className="text-slate-400 text-xs w-8 text-right">{tasksByEnergy.high}</span>
                                        </div>
                                        <div className="flex items-center gap-3">
                                            <div className="w-8 h-8 rounded-lg bg-amber-500/20 flex items-center justify-center"><span className="text-sm">⚡</span></div>
                                            <span className="text-slate-300 text-sm flex-1">{t('patterns.mediumEnergy')}</span>
                                            <div className="w-32 h-2 bg-white/10 rounded-full overflow-hidden">
                                                <div className="h-full rounded-full bg-gradient-to-r from-amber-500 to-yellow-500" style={{ width: `${(tasksByEnergy.medium / totalEnergyTasks) * 100}%` }} />
                                            </div>
                                            <span className="text-slate-400 text-xs w-8 text-right">{tasksByEnergy.medium}</span>
                                        </div>
                                        <div className="flex items-center gap-3">
                                            <div className="w-8 h-8 rounded-lg bg-emerald-500/20 flex items-center justify-center"><span className="text-sm">🌿</span></div>
                                            <span className="text-slate-300 text-sm flex-1">{t('patterns.lowEnergy')}</span>
                                            <div className="w-32 h-2 bg-white/10 rounded-full overflow-hidden">
                                                <div className="h-full rounded-full bg-gradient-to-r from-emerald-500 to-green-500" style={{ width: `${(tasksByEnergy.low / totalEnergyTasks) * 100}%` }} />
                                            </div>
                                            <span className="text-slate-400 text-xs w-8 text-right">{tasksByEnergy.low}</span>
                                        </div>
                                    </div>
                                )}
                            </div>
                        </>
                    ) : (
                        <>
                            {/* Month Navigation */}
                            <div className="flex items-center justify-between mb-4">
                                <button onClick={prevMonth} className="w-10 h-10 rounded-xl glass-card flex items-center justify-center text-slate-400 hover:text-white transition-all"><svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" /></svg></button>
                                <h3 className="text-white font-medium">{selectedMonth.toLocaleDateString(currentLocale, { month: 'long', year: 'numeric' })}</h3>
                                <button onClick={nextMonth} className="w-10 h-10 rounded-xl glass-card flex items-center justify-center text-slate-400 hover:text-white transition-all"><svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" /></svg></button>
                            </div>

                            {/* Month Heatmap - Task Completion */}
                            <div className="glass-card rounded-2xl p-4 mb-4">
                                <div className="flex items-center gap-2 mb-3"><span className="text-lg">📋</span><h3 className="text-white font-medium">{t('patterns.completion')}</h3></div>
                                <div className="grid grid-cols-7 gap-1 mb-2">
                                    {(() => {
                                        const baseDate = new Date(2024, 0, 1);
                                        return Array.from({ length: 7 }).map((_, i) => {
                                            const d = new Date(baseDate);
                                            d.setDate(baseDate.getDate() + i);
                                            return (
                                                <div key={i} className="text-center text-[10px] text-slate-500">
                                                    {d.toLocaleDateString(currentLocale, { weekday: 'narrow' })}
                                                </div>
                                            );
                                        });
                                    })()}
                                </div>
                                <div className="grid grid-cols-7 gap-1">
                                    {Array.from({ length: (new Date(selectedMonth.getFullYear(), selectedMonth.getMonth(), 1).getDay() + 6) % 7 }).map((_, i) => <div key={`e${i}`} className="aspect-square" />)}
                                    {monthTaskStats.map((day, i) => <div key={i} className={`aspect-square rounded-md ${getHeatmapColor(day.percent)} flex items-center justify-center transition-all hover:scale-110`}><span className="text-[10px] text-white/70">{day.dayNum}</span></div>)}
                                </div>
                                <div className="flex items-center justify-center gap-1 mt-3"><span className="text-[10px] text-slate-500">0%</span><div className="w-4 h-3 rounded bg-white/10"></div><div className="w-4 h-3 rounded bg-orange-400/50"></div><div className="w-4 h-3 rounded bg-amber-400/60"></div><div className="w-4 h-3 rounded bg-green-400/70"></div><div className="w-4 h-3 rounded bg-emerald-500"></div><span className="text-[10px] text-slate-500">100%</span></div>
                            </div>

                            {/* Month Heatmap - Tasks Count */}
                            <div className="glass-card rounded-2xl p-4">
                                <div className="flex items-center gap-2 mb-3"><span className="text-lg">✅</span><h3 className="text-white font-medium">{t('patterns.dailyTasks')}</h3></div>
                                <div className="grid grid-cols-7 gap-1 mb-2">
                                    {(() => {
                                        const baseDate = new Date(2024, 0, 1);
                                        return Array.from({ length: 7 }).map((_, i) => {
                                            const d = new Date(baseDate);
                                            d.setDate(baseDate.getDate() + i);
                                            return (
                                                <div key={i} className="text-center text-[10px] text-slate-500">
                                                    {d.toLocaleDateString(currentLocale, { weekday: 'narrow' })}
                                                </div>
                                            );
                                        });
                                    })()}
                                </div>
                                <div className="grid grid-cols-7 gap-1">
                                    {Array.from({ length: (new Date(selectedMonth.getFullYear(), selectedMonth.getMonth(), 1).getDay() + 6) % 7 }).map((_, i) => <div key={`e${i}`} className="aspect-square" />)}
                                    {monthTaskStats.map((day, i) => {
                                        const intensity = day.completed === 0 ? 'bg-white/10' :
                                            day.completed >= 5 ? 'bg-cyan-500' :
                                                day.completed >= 3 ? 'bg-cyan-400/70' :
                                                    day.completed >= 1 ? 'bg-cyan-300/50' : 'bg-white/10';
                                        return <div key={i} className={`aspect-square rounded-md ${intensity} flex items-center justify-center transition-all hover:scale-110`}><span className="text-[10px] text-white/70">{day.dayNum}</span></div>;
                                    })}
                                </div>
                                <div className="flex items-center justify-center gap-1 mt-3">
                                    <span className="text-[10px] text-slate-500">0</span>
                                    <div className="w-4 h-3 rounded bg-white/10"></div>
                                    <div className="w-4 h-3 rounded bg-cyan-300/50"></div>
                                    <div className="w-4 h-3 rounded bg-cyan-400/70"></div>
                                    <div className="w-4 h-3 rounded bg-cyan-500"></div>
                                    <span className="text-[10px] text-slate-500">5+</span>
                                </div>
                            </div>
                        </>
                    )}
                </>
            ) : (
                <>
                    <div className="grid grid-cols-3 gap-3 mb-6">
                        <div className="glass-card rounded-2xl p-4 text-center">
                            <div className="text-2xl mb-1">🔥</div>
                            <p className="text-3xl font-bold text-white">{reflectStreak}</p>
                            <p className="text-slate-400 text-xs">{t('patterns.dayStreak')}</p>
                        </div>
                        <div className="glass-card rounded-2xl p-4 text-center">
                            <div className="text-2xl mb-1">⭐</div>
                            <p className="text-3xl font-bold text-white">{weekAvgRating}</p>
                            <p className="text-slate-400 text-xs">{t('patterns.avgRating')}</p>
                        </div>
                        <div className="glass-card rounded-2xl p-4 text-center">
                            <div className="text-2xl mb-1">📝</div>
                            <p className="text-3xl font-bold text-white">{weekReflectionCount}/7</p>
                            <p className="text-slate-400 text-xs">{t('patterns.thisWeek')}</p>
                        </div>
                    </div>
                    {/* Reflect Stats View Toggle */}
                    <div className="flex bg-white/5 p-1 rounded-xl mb-6">
                        <button onClick={() => setViewMode('week')} className={`flex-1 py-3 rounded-xl font-medium text-sm transition-all ${viewMode === 'week' ? 'bg-gradient-to-r from-indigo-500 to-purple-500 text-white' : 'glass-card text-slate-400'}`}>{t('patterns.weekView')}</button>
                        <button onClick={() => setViewMode('month')} className={`flex-1 py-3 rounded-xl font-medium text-sm transition-all ${viewMode === 'month' ? 'bg-gradient-to-r from-indigo-500 to-purple-500 text-white' : 'glass-card text-slate-400'}`}>{t('patterns.monthView')}</button>
                    </div>

                    {viewMode === 'week' ? (
                        <>
                            <div className="glass-card rounded-2xl p-4 mb-4">
                                <div className="flex items-center justify-between mb-4">
                                    <div className="flex items-center gap-2"><span className="text-xl">📊</span><h3 className="text-white font-medium">{t('patterns.dayRatings')}</h3></div>
                                    <span className="text-indigo-400 text-sm font-medium">{weekAvgRating} avg</span>
                                </div>
                                <div className="flex items-end justify-between gap-2 h-40">
                                    {weekReflectStats.map((day, idx) => (
                                        <div key={idx} className="flex-1 flex flex-col items-center gap-2">
                                            <div className="w-full h-28 bg-white/5 rounded-lg relative overflow-hidden">
                                                <div className={`absolute bottom-0 w-full rounded-lg bg-gradient-to-t ${getRatingColor(day.rating)} transition-all duration-500`} style={{ height: `${day.rating * 10}%` }} />
                                            </div>
                                            <span className="text-[10px] text-slate-400">{day.dayName}</span>
                                            <span className="text-lg">{getRatingEmoji(day.rating)}</span>
                                            <span className="text-xs text-slate-300 font-medium">{day.rating || '—'}</span>
                                        </div>
                                    ))}
                                </div>
                            </div>

                            <div className="glass-card rounded-2xl p-4 mb-4">
                                <h3 className="text-white font-medium mb-4">{t('patterns.habits')}</h3>
                                <div className="space-y-3">
                                    {weekReflectStats.map((day, idx) => {
                                        const dateKey = getDateKey(day.date);
                                        const reflection = reflectionsByDate[dateKey];
                                        return (
                                            <div key={idx} className={`p-3 rounded-xl ${day.hasReflection ? 'bg-white/5' : 'bg-white/[0.02]'}`}>
                                                <div className="flex items-center gap-3">
                                                    <div className={`w-10 h-10 rounded-xl flex items-center justify-center ${day.rating >= 7 ? 'bg-emerald-500/20' : day.rating >= 5 ? 'bg-amber-500/20' : day.rating > 0 ? 'bg-rose-500/20' : 'bg-white/10'}`}>
                                                        <span className="text-xl">{getRatingEmoji(day.rating)}</span>
                                                    </div>
                                                    <div className="flex-1">
                                                        <p className="text-white font-medium text-sm">{day.date.toLocaleDateString(currentLocale, { weekday: 'long', month: 'short', day: 'numeric' })}</p>
                                                        {reflection?.topResult ? <p className="text-slate-400 text-xs truncate">{reflection.topResult}</p> : <p className="text-slate-500 text-xs italic">{t('patterns.noReflection')}</p>}
                                                    </div>
                                                    <div className="flex items-center gap-2">
                                                        {day.hasPhoto && <span className="text-sm">📸</span>}
                                                        {day.hasCapsule && <span className="text-sm">💊</span>}
                                                        {day.rating > 0 && <span className={`text-sm font-bold ${day.rating >= 7 ? 'text-emerald-400' : day.rating >= 5 ? 'text-amber-400' : 'text-rose-400'}`}>{day.rating}</span>}
                                                    </div>
                                                </div>
                                            </div>
                                        );
                                    })}
                                </div>
                            </div>

                            {weekPhotoCount > 0 && (
                                <div className="glass-card rounded-2xl p-4">
                                    <div className="flex items-center gap-2 mb-3"><span className="text-lg">📸</span><h3 className="text-white font-medium">{t('patterns.photosThisWeek')}</h3><span className="text-slate-400 text-sm">({weekPhotoCount})</span></div>
                                    <div className="grid grid-cols-4 gap-2">
                                        {weekReflectStats.filter(d => d.hasPhoto).map((day, idx) => {
                                            const dateKey = getDateKey(day.date);
                                            const reflection = reflectionsByDate[dateKey];
                                            return <div key={idx} className="aspect-square rounded-xl overflow-hidden bg-white/10"><img src={reflection?.photo} alt="" className="w-full h-full object-cover" /></div>;
                                        })}
                                    </div>
                                </div>
                            )}
                        </>
                    ) : (
                        <>
                            <div className="flex items-center justify-between mb-4">
                                <button onClick={prevMonth} className="w-10 h-10 rounded-xl glass-card flex items-center justify-center text-slate-400 hover:text-white transition-all"><svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" /></svg></button>
                                <h3 className="text-white font-medium">{selectedMonth.toLocaleDateString(currentLocale, { month: 'long', year: 'numeric' })}</h3>
                                <button onClick={nextMonth} className="w-10 h-10 rounded-xl glass-card flex items-center justify-center text-slate-400 hover:text-white transition-all"><svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" /></svg></button>
                            </div>

                            <div className="glass-card rounded-2xl p-4 mb-4">
                                <div className="flex items-center gap-2 mb-3"><span className="text-lg">😢</span><h3 className="text-white font-medium">{t('patterns.dayRatings')}</h3></div>
                                <div className="grid grid-cols-7 gap-1 mb-2">
                                    {(() => {
                                        const baseDate = new Date(2024, 0, 1);
                                        return Array.from({ length: 7 }).map((_, i) => {
                                            const d = new Date(baseDate);
                                            d.setDate(baseDate.getDate() + i);
                                            return (
                                                <div key={i} className="text-center text-[10px] text-slate-500">
                                                    {d.toLocaleDateString(currentLocale, { weekday: 'narrow' })}
                                                </div>
                                            );
                                        });
                                    })()}
                                </div>
                                <div className="grid grid-cols-7 gap-1">
                                    {Array.from({ length: (new Date(selectedMonth.getFullYear(), selectedMonth.getMonth(), 1).getDay() + 6) % 7 }).map((_, i) => <div key={`e${i}`} className="aspect-square" />)}
                                    {monthReflectStats.map((day, i) => <div key={i} className={`aspect-square rounded-md ${getRatingHeatmapColor(day.rating)} flex items-center justify-center transition-all hover:scale-110`}><span className="text-[10px] text-white/70">{day.dayNum}</span></div>)}
                                </div>
                                <div className="flex items-center justify-center gap-1 mt-3"><span className="text-[10px] text-slate-500">😢</span><div className="w-4 h-3 rounded bg-white/10"></div><div className="w-4 h-3 rounded bg-rose-400/50"></div><div className="w-4 h-3 rounded bg-orange-400/60"></div><div className="w-4 h-3 rounded bg-amber-400/70"></div><div className="w-4 h-3 rounded bg-green-400/80"></div><div className="w-4 h-3 rounded bg-emerald-500"></div><span className="text-[10px] text-slate-500">🌟</span></div>
                            </div>

                            <div className="glass-card rounded-2xl p-4">
                                <div className="flex items-center gap-2 mb-3"><span className="text-lg">📝</span><h3 className="text-white font-medium">{t('patterns.reflectionsCompleted')}</h3></div>
                                <div className="grid grid-cols-7 gap-1 mb-2">
                                    {(() => {
                                        const baseDate = new Date(2024, 0, 1);
                                        return Array.from({ length: 7 }).map((_, i) => {
                                            const d = new Date(baseDate);
                                            d.setDate(baseDate.getDate() + i);
                                            return (
                                                <div key={i} className="text-center text-[10px] text-slate-500">
                                                    {d.toLocaleDateString(currentLocale, { weekday: 'narrow' })}
                                                </div>
                                            );
                                        });
                                    })()}
                                </div>
                                <div className="grid grid-cols-7 gap-1">
                                    {Array.from({ length: (new Date(selectedMonth.getFullYear(), selectedMonth.getMonth(), 1).getDay() + 6) % 7 }).map((_, i) => <div key={`e${i}`} className="aspect-square" />)}
                                    {monthReflectStats.map((day, i) => <div key={i} className={`aspect-square rounded-md flex items-center justify-center transition-all hover:scale-110 ${day.hasCapsule ? 'bg-purple-500' : day.hasPhoto && day.hasReflection ? 'bg-indigo-500' : day.hasReflection ? 'bg-indigo-400/70' : 'bg-white/10'}`}><span className="text-[10px] text-white/70">{day.dayNum}</span></div>)}
                                </div>
                                <div className="flex items-center justify-center gap-2 mt-3">
                                    <div className="flex items-center gap-1"><div className="w-3 h-3 rounded bg-white/10"></div><span className="text-[10px] text-slate-500">{t('common.none')}</span></div>
                                    <div className="flex items-center gap-1"><div className="w-3 h-3 rounded bg-indigo-400/70"></div><span className="text-[10px] text-slate-500">{t('patterns.reflected')}</span></div>
                                    <div className="flex items-center gap-1"><div className="w-3 h-3 rounded bg-indigo-500"></div><span className="text-[10px] text-slate-500">+ {t('patterns.photo')}</span></div>
                                    <div className="flex items-center gap-1"><div className="w-3 h-3 rounded bg-purple-500"></div><span className="text-[10px] text-slate-500">{t('patterns.capsule')}</span></div>
                                </div>
                            </div>
                        </>
                    )}
                </>
            )}
        </div>
    );
};
