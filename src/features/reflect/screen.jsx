import React, { useState, useEffect, useRef } from 'react';
import { getToday, getDateKey } from '../../shared/utils/date';
import { ReflectionInput } from '../../shared/ui/ReflectionInput';

export const ReflectScreen = ({
    reflectionsByDate,
    updateReflection,
    projects,
    influenceOptions,
    showPhotoModal,
    setShowPhotoModal,
    viewMode,
    setViewMode,
    selectedDate,
    setSelectedDate,
    reflectionQuestions,
    t,
    currentLocale
}) => {
    // Photo upload ref
    const photoInputRef = useRef(null);

    // Handle photo upload
    const handlePhotoUpload = (e) => {
        const file = e.target.files?.[0];
        if (file) {
            const reader = new FileReader();
            reader.onloadend = () => {
                updateReflection(selectedDate, 'photo', reader.result);
            };
            reader.readAsDataURL(file);
        }
    };

    // Remove photo
    const removePhoto = () => {
        updateReflection(selectedDate, 'photo', null);
        setShowPhotoModal(false);
    };

    // Get reflection for a specific date (local helper using prop)
    const getReflectionForDate = (date) => {
        const key = getDateKey(date);
        return reflectionsByDate[key] || {
            activities: '',
            topResult: '',
            energyDrain: '',
            didWell: '',
            lesson: '',
            rating: null,
            photo: null
        };
    };

    // Get current reflection from global state
    const currentReflection = getReflectionForDate(selectedDate);

    // Check if viewing a past date
    const todayDate = getToday();
    const isViewingPast = selectedDate.getTime() < todayDate.getTime();
    const isViewingToday = selectedDate.getTime() === todayDate.getTime();

    // Check if reflection has any content
    const hasContent = currentReflection.activities || currentReflection.topResult ||
        currentReflection.energyDrain || currentReflection.didWell ||
        currentReflection.lesson || currentReflection.differently || currentReflection.rating || currentReflection.photo;

    // Check if reflection has any content at all (for showing capsule button)
    const canCreateCapsule = currentReflection.activities || currentReflection.topResult ||
        currentReflection.energyDrain || currentReflection.didWell ||
        currentReflection.lesson || currentReflection.differently || currentReflection.rating || currentReflection.photo;

    // Auto-switch to capsule view if already has capsule created (for past dates)
    // Only run when date changes, not on every render
    const dateKey = getDateKey(selectedDate);
    useEffect(() => {
        const reflection = reflectionsByDate[dateKey];
        if (reflection?.capsuleCreated) {
            setViewMode('capsule');
        } else {
            setViewMode('edit');
        }
    }, [dateKey, reflectionsByDate, setViewMode]); // Added dependencies

    // Share Memory Capsule
    const handleShare = async () => {
        const influencers = currentReflection.influencers || { helped: [], blocked: [] };
        const helpedText = influencers.helped?.map(id => influenceOptions.helped.find(o => o.id === id)?.label).filter(Boolean).join(', ');
        const blockedText = influencers.blocked?.map(id => influenceOptions.blocked.find(o => o.id === id)?.label).filter(Boolean).join(', ');

        const influenceSummary = [
            helpedText ? `💪 Helped: ${helpedText}` : '',
            blockedText ? `🚧 Blocked: ${blockedText}` : ''
        ].filter(Boolean).join('\n');

        const shareText = `Memory Capsule - ${new Date(selectedDate).toLocaleDateString()}\nRating: ${currentReflection.rating}/10\n\nToday in brief: ${currentReflection.activities?.split('.')[0] || 'Brief summary'}\n\n${influenceSummary ? `Influencers:\n${influenceSummary}\n\n` : ''}Next Step: ${currentReflection.differently || 'N/A'}`;

        if (navigator.share) {
            try {
                await navigator.share({
                    title: 'My Memory Capsule',
                    text: shareText,
                });
            } catch (error) {
                // Error sharing
            }
        } else {
            navigator.clipboard.writeText(shareText);
            alert('Capsule summary copied to clipboard!');
        }
    };

    // Generate Memory Capsule
    const createMemoryCapsule = () => {
        updateReflection(selectedDate, 'capsuleCreated', true);
        setViewMode('capsule');
    };

    // Week navigation state
    const [weekOffset, setWeekOffset] = useState(0);
    const [showMonthPicker, setShowMonthPicker] = useState(false);

    // Generate week days for calendar
    const getWeekDays = () => {
        const days = [];
        const now = new Date();
        const currentDay = now.getDay();
        const daysToMonday = currentDay === 0 ? 6 : currentDay - 1;
        const startOfWeek = new Date(now);
        startOfWeek.setDate(now.getDate() - daysToMonday + (weekOffset * 7));
        startOfWeek.setHours(0, 0, 0, 0);

        for (let i = 0; i < 7; i++) {
            const date = new Date(startOfWeek);
            date.setDate(startOfWeek.getDate() + i);
            date.setHours(0, 0, 0, 0);
            const dateKey = getDateKey(date);
            const reflection = reflectionsByDate[dateKey];
            const hasReflection = reflection && (reflection.activities || reflection.topResult ||
                reflection.energyDrain || reflection.didWell ||
                reflection.lesson || reflection.differently || reflection.rating);

            const todayDate = getToday();
            const selectedDateObj = new Date(selectedDate);
            selectedDateObj.setHours(0, 0, 0, 0);

            // Get project timelines for this date
            const dateStr = date.toISOString().split('T')[0];
            const projectTimelines = projects.filter(p => {
                if (!p.startDate && !p.endDate) return false;
                const startStr = p.startDate || null;
                const endStr = p.endDate || null;
                if (startStr && endStr) return dateStr >= startStr && dateStr <= endStr;
                else if (startStr) return dateStr === startStr;
                else if (endStr) return dateStr === endStr;
                return false;
            }).map(p => ({
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
                hasReflection: hasReflection,
                projectTimelines: projectTimelines
            });
        }
        return days;
    };

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

        const startOffset = startDay === 0 ? 6 : startDay - 1;
        for (let i = 0; i < startOffset; i++) {
            days.push(null);
        }

        const todayDate = new Date();
        todayDate.setHours(0, 0, 0, 0);
        const selectedDateObj = new Date(selectedDate);
        selectedDateObj.setHours(0, 0, 0, 0);

        for (let i = 1; i <= daysInMonth; i++) {
            const date = new Date(year, month, i);
            date.setHours(0, 0, 0, 0);
            const dateKey = getDateKey(date);
            const reflection = reflectionsByDate[dateKey];

            // Get project timelines for this date
            const dateStr = date.toISOString().split('T')[0];
            const projectTimelines = projects.filter(p => {
                if (!p.startDate && !p.endDate) return false;
                const startStr = p.startDate || null;
                const endStr = p.endDate || null;
                if (startStr && endStr) return dateStr >= startStr && dateStr <= endStr;
                else if (startStr) return dateStr === startStr;
                else if (endStr) return dateStr === endStr;
                return false;
            }).map(p => ({
                color: p.color || '#8b5cf6',
                isStart: p.startDate === dateStr,
                isEnd: p.endDate === dateStr
            }));

            days.push({
                dayNum: i,
                date: date,
                isToday: date.getTime() === todayDate.getTime(),
                isSelected: date.getTime() === selectedDateObj.getTime(),
                hasReflection: reflection && (reflection.activities || reflection.topResult ||
                    reflection.energyDrain || reflection.didWell ||
                    reflection.lesson || reflection.differently || reflection.rating),
                projectTimelines: projectTimelines
            });
        }

        return days;
    };

    const weekDays = getWeekDays();

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
        setSelectedDate(getToday());
    };

    const selectDateFromMonth = (date) => {
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

    const changeMonth = (delta) => {
        setWeekOffset(prev => prev + (delta * 4));
    };

    const selectReflectDay = (date) => {
        setSelectedDate(new Date(date));
    };

    // Auto-save handler
    const handleFieldChange = (field, value) => {
        updateReflection(selectedDate, field, value);
    };

    return (
        <div className="pb-28 animate-fadeIn">
            {/* Header - Centered Apple Style */}
            <div className="mb-6 text-center">
                <p className="text-indigo-400/80 text-xs font-medium uppercase tracking-widest mb-2">
                    {selectedDate.toLocaleDateString(currentLocale, { month: 'long', day: 'numeric' })}
                </p>
                <h1 className="text-3xl font-semibold text-white tracking-tight">
                    {isViewingToday ? t('reflect.title') : selectedDate.toLocaleDateString(currentLocale, { weekday: 'long' })}
                </h1>
            </div>

            {/* Week Navigation Header */}
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

            {/* Month Picker Dropdown */}
            {showMonthPicker && (
                <div className="glass-card rounded-2xl p-4 mb-4 animate-fadeIn">
                    {/* Month Navigation */}
                    <div className="flex items-center justify-between mb-3">
                        <button
                            onClick={() => changeMonth(-1)}
                            className="w-8 h-8 rounded-lg bg-white/5 hover:bg-white/10 flex items-center justify-center text-slate-400 hover:text-white transition-all"
                        >
                            <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
                            </svg>
                        </button>
                        <span className="text-white font-medium">
                            {weekDays.length > 0 && weekDays[3].date.toLocaleDateString(currentLocale, { month: 'long', year: 'numeric' })}
                        </span>
                        <button
                            onClick={() => changeMonth(1)}
                            className="w-8 h-8 rounded-lg bg-white/5 hover:bg-white/10 flex items-center justify-center text-slate-400 hover:text-white transition-all"
                        >
                            <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                            </svg>
                        </button>
                    </div>

                    {/* Day Headers */}
                    <div className="grid grid-cols-7 gap-1 mb-2">
                        {(() => {
                            const baseDate = new Date(2024, 0, 1); // A Monday
                            return Array.from({ length: 7 }).map((_, i) => {
                                const d = new Date(baseDate);
                                d.setDate(baseDate.getDate() + i);
                                return (
                                    <div key={i} className="text-center text-xs text-slate-500 font-medium py-1">
                                        {d.toLocaleDateString(currentLocale, { weekday: 'short' })}
                                    </div>
                                );
                            });
                        })()}
                    </div>

                    {/* Calendar Grid */}
                    <div className="grid grid-cols-7 gap-1">
                        {getMonthDays().map((day, idx) => (
                            <button
                                key={idx}
                                onClick={() => day && selectDateFromMonth(day.date)}
                                disabled={!day}
                                className={`aspect-square rounded-lg text-sm font-medium transition-all flex flex-col items-center justify-center
                  ${!day ? 'invisible' : ''}
                  ${day?.isSelected
                                        ? 'bg-gradient-to-br from-purple-500 to-indigo-600 text-white'
                                        : day?.isToday
                                            ? 'bg-white/10 text-purple-400 ring-1 ring-purple-400/50'
                                            : 'hover:bg-white/10 text-slate-300'}`}
                            >
                                <span>{day?.dayNum}</span>
                                {day?.hasReflection && !day?.isSelected && (
                                    <div className="w-1 h-1 rounded-full bg-purple-400 mt-0.5"></div>
                                )}
                            </button>
                        ))}
                    </div>
                </div>
            )}

            {/* Week Calendar Strip - Glass */}
            <div className="flex gap-1.5 mb-6 glass-card rounded-2xl p-2 overflow-x-auto">
                {weekDays.map((day, idx) => (
                    <button
                        key={idx}
                        onClick={() => selectReflectDay(day.date)}
                        className={`flex-1 min-w-[44px] flex flex-col items-center py-2.5 px-1 rounded-xl transition-all duration-200
              ${day.isSelected
                                ? 'bg-gradient-to-br from-purple-500 to-indigo-600 text-white shadow-lg shadow-purple-500/30'
                                : day.isToday
                                    ? 'bg-white/10 text-purple-300'
                                    : 'hover:bg-white/5 text-slate-400'}`}
                    >
                        <span className={`text-[10px] font-medium uppercase tracking-wide ${day.isSelected
                            ? 'text-purple-200'
                            : day.isToday
                                ? 'text-purple-400'
                                : 'text-slate-500'
                            }`}>
                            {day.dayName}
                        </span>
                        <span className={`text-lg font-semibold mt-0.5 ${day.isSelected
                            ? 'text-white'
                            : day.isToday
                                ? 'text-white'
                                : 'text-slate-300'
                            }`}>
                            {day.dayNum}
                        </span>
                        {/* Reflection indicator */}
                        <div className="h-1.5 mt-1">
                            {day.hasReflection && !day.isSelected ? (
                                <div className="w-1.5 h-1.5 rounded-full bg-purple-400"></div>
                            ) : day.hasReflection && day.isSelected ? (
                                <div className="w-1.5 h-1.5 rounded-full bg-white"></div>
                            ) : null}
                        </div>
                    </button>
                ))}
            </div>

            {/* EDIT MODE - Rating, Photo, and Questions */}
            {viewMode === 'edit' && (
                <>
                    {/* Rating Section */}
                    <div className="glass-card rounded-2xl p-4 mb-4">
                        <div className="flex items-center justify-between mb-3">
                            <span className="text-slate-300 font-medium">{t('reflect.rating')}</span>
                            {currentReflection.rating && (
                                <span className="text-2xl">
                                    {currentReflection.rating >= 8 ? '🌟' : currentReflection.rating >= 6 ? '👍' : currentReflection.rating >= 4 ? '😐' : '💪'}
                                </span>
                            )}
                        </div>
                        <div className="flex gap-1.5">
                            {[1, 2, 3, 4, 5, 6, 7, 8, 9, 10].map(num => (
                                <button
                                    key={num}
                                    onClick={() => handleFieldChange('rating', num)}
                                    className={`flex-1 py-2.5 rounded-lg font-bold text-sm transition-all duration-200
                    ${currentReflection.rating === num
                                            ? 'bg-gradient-to-br from-purple-500 to-indigo-600 text-white shadow-lg shadow-purple-500/30 scale-110'
                                            : 'bg-white/10 text-slate-400 hover:bg-white/20 hover:text-white'}`}
                                >
                                    {num}
                                </button>
                            ))}
                        </div>
                    </div>

                    {/* Photo Modal - Full Screen View */}
                    {showPhotoModal && currentReflection.photo && (
                        <div className="fixed inset-0 z-50 flex items-center justify-center animate-fadeIn">
                            <div
                                className="absolute inset-0 bg-black/90 backdrop-blur-xl"
                                onClick={() => setShowPhotoModal(false)}
                            />

                            <div className="relative max-w-lg w-full mx-4">
                                {/* Close button */}
                                <button
                                    onClick={() => setShowPhotoModal(false)}
                                    className="absolute -top-12 right-0 w-10 h-10 rounded-full bg-white/10 flex items-center justify-center text-white hover:bg-white/20 transition-colors z-10"
                                >
                                    <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                                    </svg>
                                </button>

                                {/* Photo */}
                                <div
                                    className="rounded-3xl overflow-hidden shadow-2xl"
                                    style={{
                                        background: 'linear-gradient(135deg, rgba(255,255,255,0.1) 0%, rgba(255,255,255,0.05) 100%)',
                                        border: '1px solid rgba(255,255,255,0.1)',
                                    }}
                                >
                                    <img
                                        src={currentReflection.photo}
                                        alt="Photo of the day"
                                        className="w-full h-auto"
                                    />
                                </div>

                                {/* Date label */}
                                <div className="mt-4 text-center">
                                    <p className="text-white/60 text-sm">
                                        {selectedDate.toLocaleDateString(currentLocale, {
                                            weekday: 'long',
                                            month: 'long',
                                            day: 'numeric',
                                            year: 'numeric'
                                        })}
                                    </p>
                                </div>

                                {/* Actions */}
                                <div className="mt-4 flex justify-center gap-3">
                                    <button
                                        onClick={() => photoInputRef.current?.click()}
                                        className="px-4 py-2 rounded-xl bg-white/10 text-white text-sm font-medium hover:bg-white/20 transition-all flex items-center gap-2"
                                    >
                                        <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                                        </svg>
                                        {t('reflect.changePhoto')}
                                    </button>
                                    <button
                                        onClick={removePhoto}
                                        className="px-4 py-2 rounded-xl bg-rose-500/20 text-rose-400 text-sm font-medium hover:bg-rose-500/30 transition-all flex items-center gap-2"
                                    >
                                        <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                                        </svg>
                                        {t('common.remove')}
                                    </button>
                                </div>
                            </div>
                        </div>
                    )}

                    {/* Questions - All visible with auto-save */}
                    <div className="space-y-4">
                        {reflectionQuestions.map((q) => {
                            if (q.type === 'balanced-select') {
                                const currentVal = currentReflection[q.key] || { helped: [], blocked: [] };
                                // Handle legacy data safety
                                const safeVal = typeof currentVal === 'string' ? { helped: [], blocked: [] } : currentVal;

                                const toggleInfluence = (type, id) => {
                                    const list = safeVal[type] || [];
                                    const newList = list.includes(id)
                                        ? list.filter(item => item !== id)
                                        : [...list, id];

                                    handleFieldChange(q.key, { ...safeVal, [type]: newList });
                                };

                                return (
                                    <div key={`${getDateKey(selectedDate)}-${q.key}`} className="bg-white/5 rounded-2xl p-5 border border-white/5">
                                        <div className="flex items-center gap-3 mb-4 text-slate-400">
                                            <span className="text-xl">{q.icon}</span>
                                            <h3 className="font-medium text-sm uppercase tracking-wide">{t(q.question)}</h3>
                                        </div>

                                        <div className="grid grid-cols-2 gap-4">
                                            {/* Helped Column */}
                                            <div>
                                                <div className="text-emerald-400 text-xs font-bold uppercase tracking-wider mb-3 flex items-center gap-1">
                                                    <span>{t('reflect.helped')}</span>
                                                </div>
                                                <div className="space-y-2">
                                                    {influenceOptions.helped.map(opt => (
                                                        <button
                                                            key={opt.id}
                                                            onClick={() => toggleInfluence('helped', opt.id)}
                                                            className={`w-full p-2.5 rounded-xl text-left text-xs font-medium flex items-center gap-2 transition-all ${safeVal.helped?.includes(opt.id)
                                                                ? 'bg-emerald-500/20 text-emerald-200 border border-emerald-500/30'
                                                                : 'bg-white/5 text-slate-400 hover:bg-white/10 border border-transparent'
                                                                }`}
                                                        >
                                                            <span>{opt.icon}</span>
                                                            <span>{t(opt.label)}</span>
                                                        </button>
                                                    ))}
                                                </div>
                                            </div>

                                            {/* Blocked Column */}
                                            <div>
                                                <div className="text-rose-400 text-xs font-bold uppercase tracking-wider mb-3 flex items-center gap-1">
                                                    <span>{t('reflect.blocked')}</span>
                                                </div>
                                                <div className="space-y-2">
                                                    {influenceOptions.blocked.map(opt => (
                                                        <button
                                                            key={opt.id}
                                                            onClick={() => toggleInfluence('blocked', opt.id)}
                                                            className={`w-full p-2.5 rounded-xl text-left text-xs font-medium flex items-center gap-2 transition-all ${safeVal.blocked?.includes(opt.id)
                                                                ? 'bg-rose-500/20 text-rose-200 border border-rose-500/30'
                                                                : 'bg-white/5 text-slate-400 hover:bg-white/10 border border-transparent'
                                                                }`}
                                                        >
                                                            <span>{opt.icon}</span>
                                                            <span>{t(opt.label)}</span>
                                                        </button>
                                                    ))}
                                                </div>
                                            </div>
                                        </div>
                                    </div>
                                );
                            }

                            return (
                                <ReflectionInput
                                    key={`${getDateKey(selectedDate)}-${q.key}`}
                                    question={t(q.question)}
                                    description={q.description}
                                    placeholder={t(q.placeholder)}
                                    icon={q.icon}
                                    defaultValue={currentReflection[q.key] || ''}
                                    onBlurSave={(value) => handleFieldChange(q.key, value)}
                                    onValueChange={(value) => handleFieldChange(q.key, value)}
                                />
                            );
                        })}
                    </div>

                    {/* Photo of the Day */}
                    <div className="glass-card rounded-2xl p-4 mt-6">
                        <div className="flex items-center justify-between mb-3">
                            <span className="text-slate-300 font-medium">{t('reflect.photo')}</span>
                            {currentReflection.photo && (
                                <button
                                    onClick={() => setShowPhotoModal(true)}
                                    className="text-xs text-purple-400 hover:text-purple-300 transition-colors"
                                >
                                    {t('common.view')}
                                </button>
                            )}
                        </div>

                        {currentReflection.photo ? (
                            <div
                                className="relative group cursor-pointer"
                                onClick={() => setShowPhotoModal(true)}
                            >
                                <div
                                    className="w-full h-48 rounded-xl overflow-hidden"
                                    style={{
                                        background: 'linear-gradient(135deg, rgba(255,255,255,0.1) 0%, rgba(255,255,255,0.05) 100%)',
                                    }}
                                >
                                    <img
                                        src={currentReflection.photo}
                                        alt="Photo of the day"
                                        className="w-full h-full object-cover transition-transform duration-300 group-hover:scale-105"
                                    />
                                </div>
                                {/* Hover overlay */}
                                <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity duration-200 rounded-xl flex items-center justify-center">
                                    <span className="text-white font-medium text-sm">{t('reflect.clickToView')}</span>
                                </div>
                            </div>
                        ) : (
                            <button
                                onClick={() => photoInputRef.current?.click()}
                                className="w-full h-32 rounded-xl border-2 border-dashed border-white/20 hover:border-purple-500/50 hover:bg-purple-500/10 transition-all duration-200 flex flex-col items-center justify-center gap-2 group"
                            >
                                <div className="w-12 h-12 rounded-full bg-white/10 group-hover:bg-purple-500/20 flex items-center justify-center transition-all">
                                    <svg className="w-6 h-6 text-slate-400 group-hover:text-purple-400 transition-colors" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M3 9a2 2 0 012-2h.93a2 2 0 001.664-.89l.812-1.22A2 2 0 0110.07 4h3.86a2 2 0 011.664.89l.812 1.22A2 2 0 0018.07 7H19a2 2 0 012 2v9a2 2 0 01-2 2H5a2 2 0 01-2-2V9z" />
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M15 13a3 3 0 11-6 0 3 3 0 016 0z" />
                                    </svg>
                                </div>
                                <span className="text-slate-500 group-hover:text-purple-400 text-sm font-medium transition-colors">
                                    {t('reflect.addMemory')}
                                </span>
                            </button>
                        )}

                        {/* Hidden file input */}
                        <input
                            ref={photoInputRef}
                            type="file"
                            accept="image/*"
                            onChange={handlePhotoUpload}
                            className="hidden"
                        />
                    </div>

                    {/* Create Memory Capsule Button - Always visible */}
                    <div className="mt-6 mb-12">
                        <button
                            onClick={createMemoryCapsule}
                            className="w-full py-4 rounded-2xl font-semibold text-white transition-all duration-300 flex items-center justify-center gap-3 hover:scale-[1.02] active:scale-[0.98]"
                            style={{
                                background: canCreateCapsule
                                    ? 'linear-gradient(135deg, rgba(139,92,246,0.8) 0%, rgba(99,102,241,0.8) 100%)'
                                    : 'linear-gradient(135deg, rgba(100,100,120,0.5) 0%, rgba(80,80,100,0.5) 100%)',
                                boxShadow: canCreateCapsule ? '0 10px 40px rgba(139,92,246,0.3)' : 'none',
                                border: '1px solid rgba(255,255,255,0.2)'
                            }}
                        >
                            <span className="text-xl">✨</span>
                            <span>{t('reflect.createCapsule')}</span>
                        </button>
                        <p className="text-center text-slate-500 text-xs mt-3">
                            {canCreateCapsule
                                ? t('reflect.captureReflection')
                                : t('reflect.answerToCreate')}
                        </p>
                    </div>

                    {/* Auto-save indicator */}
                    <div className="mt-4 flex items-center justify-center gap-2 text-slate-500 text-xs">
                        <div className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse"></div>
                        <span>{t('reflect.autoSaving')}</span>
                    </div>
                </>
            )}

            {/* CAPSULE MODE - Memory Capsule View */}
            {viewMode === 'capsule' && (
                <div className="animate-fadeIn">
                    {/* Memory Capsule Card - Clickable to edit */}
                    <div
                        onClick={() => setViewMode('edit')}
                        className="cursor-pointer transition-all duration-300 hover:scale-[1.01] active:scale-[0.99]"
                    >
                        {/* Header */}
                        <div className="flex items-center justify-center gap-2 mb-4">
                            <div className="h-px flex-1 bg-gradient-to-r from-transparent via-indigo-500/30 to-transparent"></div>
                            <span className="text-indigo-400/80 text-xs font-medium uppercase tracking-widest px-3">{t('reflect.capsuleTitle')}</span>
                            <div className="h-px flex-1 bg-gradient-to-r from-transparent via-indigo-500/30 to-transparent"></div>
                        </div>

                        {/* Main Capsule Card */}
                        <div
                            className="rounded-3xl overflow-hidden"
                            style={{
                                background: 'linear-gradient(180deg, rgba(255,255,255,0.12) 0%, rgba(255,255,255,0.06) 100%)',
                                backdropFilter: 'blur(40px)',
                                WebkitBackdropFilter: 'blur(40px)',
                                border: '1px solid rgba(255,255,255,0.15)',
                                boxShadow: '0 20px 60px rgba(0,0,0,0.15), inset 0 1px 0 rgba(255,255,255,0.2)'
                            }}
                        >
                            {/* Photo Section */}
                            {currentReflection.photo && (
                                <div className="p-4 pb-0">
                                    <div
                                        className="w-full h-48 rounded-2xl overflow-hidden"
                                        style={{
                                            boxShadow: '0 8px 24px rgba(0,0,0,0.2)'
                                        }}
                                    >
                                        <img
                                            src={currentReflection.photo}
                                            alt="Photo of the day"
                                            className="w-full h-full object-cover"
                                        />
                                    </div>
                                </div>
                            )}

                            {/* Content Sections */}
                            <div className="p-5 space-y-4">
                                {/* Today in Brief */}
                                {currentReflection.activities && (
                                    <div
                                        className="p-4 rounded-2xl"
                                        style={{
                                            background: 'rgba(255,255,255,0.06)',
                                            border: '1px solid rgba(255,255,255,0.08)'
                                        }}
                                    >
                                        <p className="text-[10px] font-medium text-indigo-400/70 uppercase tracking-widest mb-2">{t('reflect.todayInBrief')}</p>
                                        <p className="text-slate-200 text-sm leading-relaxed">
                                            {currentReflection.activities?.split('.')[0] || currentReflection.activities}
                                            {currentReflection.rating >= 7 ? ' — a good day overall.' : currentReflection.rating >= 4 ? ' — a balanced day.' : ' — a challenging day.'}
                                        </p>
                                    </div>
                                )}

                                {/* What Stood Out */}
                                {/* Influencers Section */}
                                {(currentReflection.influencers?.helped?.length > 0 || currentReflection.influencers?.blocked?.length > 0) && (
                                    <div className="mb-4 space-y-3">
                                        <div className="flex items-center gap-2 mb-2 text-indigo-300/80">
                                            <span className="text-lg">📊</span>
                                            <h3 className="text-xs font-bold uppercase tracking-widest">{t('reflect.influencersTitle')}</h3>
                                        </div>
                                        <div className="grid grid-cols-2 gap-3">
                                            {/* Helped */}
                                            {currentReflection.influencers?.helped?.length > 0 && (
                                                <div className="bg-emerald-500/10 rounded-xl p-3 border border-emerald-500/20">
                                                    <p className="text-emerald-400 text-[10px] font-bold uppercase tracking-wider mb-2 flex items-center gap-1">
                                                        <span>{t('reflect.helped')}</span>
                                                    </p>
                                                    <div className="flex flex-wrap gap-1.5">
                                                        {currentReflection.influencers.helped.map(id => {
                                                            const opt = influenceOptions.helped.find(o => o.id === id);
                                                            return opt ? (
                                                                <span key={id} className="text-emerald-100 text-xs bg-emerald-500/20 px-1.5 py-0.5 rounded-md border border-emerald-500/20 inline-flex items-center gap-1">
                                                                    <span>{opt.icon}</span>
                                                                    <span>{t(opt.label)}</span>
                                                                </span>
                                                            ) : null;
                                                        })}
                                                    </div>
                                                </div>
                                            )}

                                            {/* Blocked */}
                                            {currentReflection.influencers?.blocked?.length > 0 && (
                                                <div className="bg-rose-500/10 rounded-xl p-3 border border-rose-500/20">
                                                    <p className="text-rose-400 text-[10px] font-bold uppercase tracking-wider mb-2 flex items-center gap-1">
                                                        <span>{t('reflect.blocked')}</span>
                                                    </p>
                                                    <div className="flex flex-wrap gap-1.5">
                                                        {currentReflection.influencers.blocked.map(id => {
                                                            const opt = influenceOptions.blocked.find(o => o.id === id);
                                                            return opt ? (
                                                                <span key={id} className="text-rose-100 text-xs bg-rose-500/20 px-1.5 py-0.5 rounded-md border border-rose-500/20 inline-flex items-center gap-1">
                                                                    <span>{opt.icon}</span>
                                                                    <span>{t(opt.label)}</span>
                                                                </span>
                                                            ) : null;
                                                        })}
                                                    </div>
                                                </div>
                                            )}
                                        </div>
                                    </div>
                                )}

                                {/* Tomorrow's Adjustment */}
                                {currentReflection.differently && (
                                    <div
                                        className="p-4 rounded-2xl"
                                        style={{
                                            background: 'linear-gradient(135deg, rgba(139,92,246,0.1) 0%, rgba(99,102,241,0.1) 100%)',
                                            border: '1px solid rgba(139,92,246,0.2)'
                                        }}
                                    >
                                        <p className="text-[10px] font-medium text-purple-400/80 uppercase tracking-widest mb-2">{t('reflect.tomorrowsAdjustment')}</p>
                                        <p className="text-slate-200 text-sm leading-relaxed italic">"{currentReflection.differently}"</p>
                                    </div>
                                )}

                                {/* Footer with date and rating */}
                                <div className="flex items-center justify-between pt-2">
                                    <div className="flex items-center gap-2">
                                        <span className="text-slate-500 text-xs">
                                            {selectedDate.toLocaleDateString(currentLocale, { weekday: 'long', month: 'short', day: 'numeric' })}
                                        </span>
                                    </div>
                                    <div className="flex items-center gap-1.5">
                                        {[...Array(10)].map((_, i) => (
                                            <div
                                                key={i}
                                                className={`w-1.5 h-1.5 rounded-full transition-all ${i < currentReflection.rating
                                                    ? currentReflection.rating >= 7
                                                        ? 'bg-emerald-400'
                                                        : currentReflection.rating >= 4
                                                            ? 'bg-amber-400'
                                                            : 'bg-rose-400'
                                                    : 'bg-white/10'
                                                    }`}
                                            />
                                        ))}
                                        <span className="text-slate-400 text-xs ml-1">{currentReflection.rating}/10</span>
                                    </div>
                                </div>
                            </div>
                        </div>

                        {/* Capsule glow effect */}
                        <div className="relative">
                            <div className="absolute -inset-4 bg-gradient-to-b from-indigo-500/5 via-purple-500/5 to-transparent rounded-3xl -z-10 blur-xl"></div>
                        </div>
                    </div>

                    {/* Share and Edit Buttons */}
                    <div className="flex gap-3 mt-4">
                        <button
                            onClick={handleShare}
                            className="flex-1 py-3 px-4 rounded-xl flex items-center justify-center gap-2 font-medium text-indigo-100 transition-all active:scale-95 group"
                            style={{
                                background: 'rgba(99, 102, 241, 0.15)',
                                border: '1px solid rgba(99, 102, 241, 0.3)'
                            }}
                        >
                            <div className="p-1.5 rounded-full bg-indigo-500/20 group-hover:bg-indigo-500/30 transition-colors">
                                <svg className="w-4 h-4 text-indigo-300" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8.684 13.342C8.886 12.938 9 12.482 9 12c0-.482-.114-.938-.316-1.342m0 2.684a3 3 0 110-2.684m0 2.684l6.632 3.316m-6.632-6l6.632-3.316m0 0a3 3 0 105.367-2.684 3 3 0 00-5.367 2.684zm0 9.316a3 3 0 105.368 2.684 3 3 0 00-5.368-2.684z" />
                                </svg>
                            </div>
                            <span>{t('reflect.shareCapsule')}</span>
                        </button>
                    </div>


                    {/* Edit hint */}
                    <div className="mt-4 text-center">
                        <p className="text-slate-500 text-xs">Tap the capsule to edit your reflection</p>
                    </div>
                </div>
            )}

            {/* Empty state for past days */}
            {isViewingPast && !hasContent && (
                <div className="mt-6 glass-card rounded-2xl p-8 text-center">
                    <div className="text-4xl mb-3">📝</div>
                    <p className="text-slate-400">No reflection recorded for this day</p>
                </div>
            )}
        </div>
    );
};
