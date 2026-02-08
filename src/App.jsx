import React, { useState, useEffect, useMemo, useCallback } from 'react';
import ExecuteScreen from './ExecuteScreen';
import { translations } from './translations';
import {
  globalIconOptions,
  globalReminderOptions,
  globalAlertOptions,
  weekDays,
  durationOptions,
  RepeatPicker,
  TaskDetailsList,
  loadFromStorage,
  saveToStorage,
  getToday,
  getDateKey,
  parseTime,
  formatElapsed,
  getTaskFocusDuration,
  getDaysInMonth,
  getFirstDayOfMonth
} from './shared';

// ============================================
// LIFE ARCHITECT - AI Productivity Coach
// ============================================

// Questions for reflection
// Options for influence question
const influenceOptions = {
  helped: [
    { id: 'priorities', label: 'reflect.influencers.priorities', icon: '🎯' },
    { id: 'focus', label: 'reflect.influencers.focus', icon: '🧠' },
    { id: 'energy_high', label: 'reflect.influencers.energy_high', icon: '🔋' },
    { id: 'time', label: 'reflect.influencers.time', icon: '⏱️' },
    { id: 'next_steps', label: 'reflect.influencers.next_steps', icon: '🧩' },
    { id: 'discipline', label: 'reflect.influencers.discipline', icon: '💪' },
  ],
  blocked: [
    { id: 'distractions', label: 'reflect.influencers.distractions', icon: '📱' },
    { id: 'energy_low', label: 'reflect.influencers.energy_low', icon: '😴' },
    { id: 'clarity', label: 'reflect.influencers.clarity', icon: '🤯' },
    { id: 'time_low', label: 'reflect.influencers.time_low', icon: '⏳' },
    { id: 'interruptions', label: 'reflect.influencers.interruptions', icon: '🧍' },
    { id: 'stress', label: 'reflect.influencers.stress', icon: '😵‍💫' },
  ]
};

// Questions for reflection
const reflectionQuestions = [
  {
    key: 'activities',
    question: "reflect.mattered",
    placeholder: "reflect.matteredPlaceholder",
    icon: "📝"
  },
  {
    key: 'influencers',
    question: "reflect.influenced",
    type: 'balanced-select',
    icon: "📊"
  },
  {
    key: 'differently',
    question: "reflect.differently",
    placeholder: "reflect.differentlyPlaceholder",
    icon: "🔄"
  },
];

// Reflection input with voice recording option
const ReflectionInput = ({ question, description, placeholder, icon, defaultValue, onBlurSave, onValueChange }) => {
  const textareaRef = React.useRef(null);
  const [isRecording, setIsRecording] = React.useState(false);
  const [speechSupported, setSpeechSupported] = React.useState(true);
  const recognitionRef = React.useRef(null);

  // Check if speech recognition is supported
  React.useEffect(() => {
    const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
    setSpeechSupported(!!SpeechRecognition);
  }, []);

  // Update the textarea value when defaultValue changes (date switch)
  React.useEffect(() => {
    if (textareaRef.current) {
      textareaRef.current.value = defaultValue || '';
    }
  }, [defaultValue]);

  // Cleanup on unmount
  React.useEffect(() => {
    return () => {
      if (recognitionRef.current) {
        try {
          recognitionRef.current.stop();
        } catch (e) { }
      }
    };
  }, []);

  const startRecording = () => {
    try {
      const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;

      if (!SpeechRecognition) {
        alert('Speech recognition is not supported in this browser. Please use Chrome, Edge, or Safari.');
        return;
      }

      const recognition = new SpeechRecognition();
      recognition.continuous = false;
      recognition.interimResults = false;
      recognition.lang = 'en-US';
      recognition.maxAlternatives = 1;

      recognition.onstart = () => {
        setIsRecording(true);
      };

      recognition.onresult = (event) => {
        const transcript = event.results[0][0].transcript;

        if (textareaRef.current && transcript) {
          const currentValue = textareaRef.current.value;
          const newValue = currentValue ? currentValue + ' ' + transcript : transcript;
          textareaRef.current.value = newValue;
          if (onValueChange) onValueChange(newValue);
          if (onBlurSave) onBlurSave(newValue);
        }
      };

      recognition.onerror = (event) => {
        console.error('Speech recognition error:', event.error);
        setIsRecording(false);

        switch (event.error) {
          case 'not-allowed':
          case 'permission-denied':
            alert('Microphone access was denied. Please allow microphone access and try again.');
            break;
          case 'no-speech':
            alert('No speech was detected. Please try again.');
            break;
          case 'network':
            alert('Network error occurred. Please check your connection.');
            break;
          case 'aborted':
            // User aborted, no alert needed
            break;
          default:
            alert('Speech recognition error: ' + event.error);
        }
      };

      recognition.onend = () => {
        setIsRecording(false);
      };

      recognitionRef.current = recognition;
      recognition.start();

    } catch (error) {
      console.error('Error starting speech recognition:', error);
      setIsRecording(false);
      alert('Could not start speech recognition: ' + error.message);
    }
  };

  const stopRecording = () => {
    if (recognitionRef.current) {
      try {
        recognitionRef.current.stop();
      } catch (e) {
        console.error('Error stopping recognition:', e);
      }
    }
    setIsRecording(false);
  };

  const handleMicClick = () => {
    if (isRecording) {
      stopRecording();
    } else {
      startRecording();
    }
  };

  return (
    <div className="glass-card rounded-2xl p-4">
      <div className="flex items-center gap-3 mb-3">
        <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-purple-500/30 to-indigo-500/30 flex items-center justify-center">
          <span className="text-lg">{icon}</span>
        </div>
        <h3 className="text-slate-200 font-medium text-sm flex-1">{question}</h3>

        {/* Voice input button - only show if supported */}
        {speechSupported && (
          <button
            type="button"
            onClick={handleMicClick}
            className={`w-10 h-10 rounded-xl flex items-center justify-center transition-all ${isRecording
              ? 'bg-rose-500/30 text-rose-400 ring-2 ring-rose-500/50'
              : 'bg-white/10 text-slate-400 hover:bg-purple-500/20 hover:text-purple-400'
              }`}
            title={isRecording ? "Stop recording" : "Start voice input"}
          >
            {isRecording ? (
              <div className="w-4 h-4 rounded-sm bg-rose-400 animate-pulse"></div>
            ) : (
              <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 11a7 7 0 01-7 7m0 0a7 7 0 01-7-7m7 7v4m0 0H8m4 0h4m-4-8a3 3 0 01-3-3V5a3 3 0 116 0v6a3 3 0 01-3 3z" />
              </svg>
            )}
          </button>
        )}
      </div>

      {/* Description / Subtext */}
      {description && (
        <div className="mb-3 px-1">
          <p className="text-slate-400 text-xs leading-relaxed whitespace-pre-line border-l-2 border-slate-700/50 pl-3 italic">
            {description}
          </p>
        </div>
      )}

      <textarea
        ref={textareaRef}
        defaultValue={defaultValue}
        onBlur={(e) => onBlurSave(e.target.value)}
        placeholder={isRecording ? "🎤 Listening... speak now" : placeholder}
        rows={2}
        className={`w-full px-3 py-2.5 bg-white/5 border rounded-xl focus:ring-2 focus:ring-purple-500/30 focus:border-purple-500/30 outline-none transition-colors text-slate-200 placeholder:text-slate-500 resize-none text-sm ${isRecording ? 'border-rose-500/50 bg-rose-500/5' : 'border-white/10'
          }`}
      />

      {isRecording && (
        <div className="mt-2 flex items-center gap-2 text-rose-400 text-xs">
          <span className="flex gap-1">
            <span className="w-1 h-3 bg-rose-400 rounded-full animate-pulse"></span>
            <span className="w-1 h-3 bg-rose-400 rounded-full animate-pulse" style={{ animationDelay: '0.2s' }}></span>
            <span className="w-1 h-3 bg-rose-400 rounded-full animate-pulse" style={{ animationDelay: '0.4s' }}></span>
          </span>
          <span>Listening... speak then tap to stop</span>
        </div>
      )}
    </div>
  );
};







const TimePicker = ({
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
            {/* Manually formatting since durationOptions is external. Or use logic here */}
            {opt.value < 60 ? `${opt.value} ${t('units.m')}` :
              opt.value % 60 === 0 ? `${opt.value / 60} ${t('units.h')}` :
                `${Math.floor(opt.value / 60)} ${t('units.h')} ${opt.value % 60 > 0 ? '0.5' : ''}` // 1.5h handling might be tricky if not exact
            }
            {/* Better way: recreate labels based on value */}
            {opt.value < 60 ? `${opt.value}${t('units.m')}` : (opt.value % 60 === 0 ? `${opt.value / 60}${t('units.h')}` : `${opt.value / 60}${t('units.h')}`)}
          </button>
        ))}
        {/* Re-writing this part to be safer with the existing map */}
      </div>
    </div>
  );
};

// iOS-style Details List Row
const DetailsRow = ({ icon, label, value, subValue, onClick, isLast, themeColor = 'amber' }) => {
  const isTime = label.includes('Time');
  const isAlerts = label === 'Alerts';

  // Dynamic color mapping
  const getColorClasses = () => {
    switch (themeColor) {
      case 'cyan':
        return isTime ? 'bg-cyan-500 text-white' : 'bg-cyan-500/20 text-cyan-400';
      case 'rose':
        return isTime ? 'bg-rose-500 text-white' : 'bg-rose-500/20 text-rose-400';
      case 'purple':
        return isTime ? 'bg-purple-500 text-white' : 'bg-purple-500/20 text-purple-400';
      case 'emerald':
        return isTime ? 'bg-emerald-500 text-white' : 'bg-emerald-500/20 text-emerald-400';
      default: // amber
        return isTime ? 'bg-amber-500 text-white' : 'bg-amber-500/20 text-amber-500';
    }
  };

  return (
    <button
      onClick={onClick}
      className={`w-full flex items-center gap-3 py-3 pr-4 active:bg-white/5 transition-colors group ${!isLast ? 'border-b border-white/5' : ''}`}
    >
      <div className={`w-8 h-8 rounded-lg flex items-center justify-center ${getColorClasses()}`}>
        {icon}
      </div>

      <div className="flex-1 flex items-center justify-between">
        <div className="text-left">
          <span className="text-white text-[15px] block">{value}</span>
        </div>

        <div className="flex items-center gap-2">
          {subValue && <span className="text-slate-500 text-[15px]">{subValue}</span>}
          <svg className="w-4 h-4 text-slate-600 group-hover:text-slate-500 transition-colors" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
          </svg>
        </div>
      </div>
    </button>
  );
};

const DatePicker = ({ selectedDate, onSelect, themeColor = 'amber', locale = 'en-US' }) => {
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

// Simple localStorage helpers - no persistence for now to avoid issues
// const loadFromStorage = (key, defaultValue) => defaultValue;
// const saveToStorage = (key, value) => { };

// Default data
const defaultReminders = [
  { id: 1, icon: '📧', name: 'Process inbox', energy: 'low' },
  { id: 2, icon: '💪', name: 'Morning workout', energy: 'high' },
  { id: 3, icon: '📝', name: 'Write project proposal', energy: 'high' },
  { id: 4, icon: '📞', name: 'Client calls', energy: 'medium' },
  { id: 5, icon: '📚', name: 'Read 30 pages', energy: 'low' },
  { id: 6, icon: '🧘', name: 'Meditation', energy: 'low' },
  { id: 7, icon: '🎯', name: 'Review quarterly goals', energy: 'medium' },
];

const defaultProjects = [
  {
    id: 1,
    title: 'Mobile App Launch',
    startDate: new Date(Date.now() - 5 * 24 * 60 * 60 * 1000).toISOString().split('T')[0], // 5 days ago
    endDate: new Date(Date.now() + 14 * 24 * 60 * 60 * 1000).toISOString().split('T')[0], // 14 days from now
    status: 'active',
    description: 'Build and launch the first version of our mobile productivity app to 100 beta users',
    notes: '',
    color: '#06b6d4',
    tasks: [
      { id: 101, title: 'Design wireframes', value: 8, energy: 'high', timeEstimate: 120, completed: true, dueDate: null, notes: '' },
      { id: 102, title: 'Set up React Native project', value: 6, energy: 'medium', timeEstimate: 60, completed: true, dueDate: null, notes: '' },
      { id: 103, title: 'Build authentication flow', value: 9, energy: 'high', timeEstimate: 240, completed: false, dueDate: '2026-02-15', notes: '' },
      { id: 104, title: 'Create onboarding screens', value: 7, energy: 'medium', timeEstimate: 90, completed: false, dueDate: null, notes: '' },
    ]
  },
  {
    id: 2,
    title: 'Learn Spanish',
    startDate: new Date(Date.now() - 10 * 24 * 60 * 60 * 1000).toISOString().split('T')[0], // 10 days ago
    endDate: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString().split('T')[0], // 30 days from now
    status: 'active',
    description: 'Daily practice to become conversational in Spanish and reach B1 level',
    notes: '',
    color: '#22c55e',
    tasks: [
      { id: 201, title: 'Complete Duolingo unit 1', value: 5, energy: 'low', timeEstimate: 30, completed: true, dueDate: null, notes: '' },
      { id: 202, title: 'Watch Spanish movie with subtitles', value: 4, energy: 'low', timeEstimate: 120, completed: false, dueDate: null, notes: '' },
    ]
  }
];

// Migration: Add color to existing projects that don't have one
const migrateProjects = (projects) => {
  const defaultColors = ['#8b5cf6', '#06b6d4', '#22c55e', '#f97316', '#ec4899', '#3b82f6', '#eab308', '#ef4444'];
  return projects.map((project, index) => ({
    ...project,
    color: project.color || defaultColors[index % defaultColors.length],
    startDate: project.startDate || null,
    endDate: project.endDate || null
  }));
};



const LifeArchitect = () => {
  const [activeTab, setActiveTab] = useState('execute');
  const [isLoading, setIsLoading] = useState(true);

  // Language State (lifted)
  const [language, setLanguage] = useState(() => loadFromStorage('language', 'en'));

  // Derived Locale & Translation Helper
  const localeMap = { en: 'en-US', fr: 'fr-FR', zh: 'zh-CN', ru: 'ru-RU' };
  const currentLocale = localeMap[language] || 'en-US';

  const t = (path, params = {}) => {
    const keys = path.split('.');
    let value = translations[language];
    for (const key of keys) {
      value = value ? value[key] : null;
    }
    if (!value) return path; // Fallback to key if not found

    // Replace params like {name}
    if (typeof value === 'string') {
      return value.replace(/{(\w+)}/g, (_, key) => params[key] !== undefined ? params[key] : `{${key}}`);
    }
    return value;
  };

  // Lifted State for Focus Mode (Pomodoro)
  const [focusMode, setFocusMode] = useState(false);
  const [focusTask, setFocusTask] = useState(null);
  const [pomodoroTime, setPomodoroTime] = useState(25 * 60); // 25 minutes default
  const [pomodoroRunning, setPomodoroRunning] = useState(false);
  const [pomodoroSession, setPomodoroSession] = useState(1);
  const [isBreak, setIsBreak] = useState(false);
  const [totalFocusTime, setTotalFocusTime] = useState(0);

  // Pomodoro timer effect
  useEffect(() => {
    if (!pomodoroRunning || !focusMode) return;

    const interval = setInterval(() => {
      setPomodoroTime(prev => {
        if (prev <= 1) {
          // Timer finished
          setPomodoroRunning(false);
          if (!isBreak) {
            // Work session finished - add actual time worked
            const taskDuration = getTaskFocusDuration(focusTask);
            setTotalFocusTime(t => t + taskDuration);
            if (pomodoroSession % 4 === 0) {
              // Long break after 4 sessions
              setPomodoroTime(15 * 60);
            } else {
              // Short break
              setPomodoroTime(5 * 60);
            }
            setIsBreak(true);
          } else {
            // Break finished - start new work session with task duration
            setPomodoroSession(s => s + 1);
            setPomodoroTime(getTaskFocusDuration(focusTask));
            setIsBreak(false);
          }
          return 0;
        }
        return prev - 1;
      });
    }, 1000);

    return () => clearInterval(interval);
  }, [pomodoroRunning, focusMode, isBreak, pomodoroSession, focusTask]);

  // Initialize state from localStorage with defaults
  const [reminders, setReminders] = useState(() => loadFromStorage('reminders', defaultReminders));

  // Projects State - with migration for existing projects
  const [projects, setProjects] = useState(() => {
    const stored = loadFromStorage('projects', defaultProjects);
    return migrateProjects(stored);
  });

  const [selectedProject, setSelectedProject] = useState(null);
  const [showProjectModal, setShowProjectModal] = useState(false);
  const [showProjectTaskModal, setShowProjectTaskModal] = useState(false);
  const [projectsExpanded, setProjectsExpanded] = useState(false);
  const [expandedProjectId, setExpandedProjectId] = useState(null);
  const [remindersExpanded, setRemindersExpanded] = useState(false);
  const [expandedRoutine, setExpandedRoutine] = useState(null); // 'morning' | 'evening' | null
  // Lifted state for global persistence
  const [reviewViewMode, setReviewViewMode] = useState('edit');
  const [patternsViewMode, setPatternsViewMode] = useState('week');
  const [patternsActiveSection, setPatternsActiveSection] = useState('habits');
  const [projectsRemindersExpanded, setProjectsRemindersExpanded] = useState(false);
  const [editingProject, setEditingProject] = useState(null);
  const [editingProjectTask, setEditingProjectTask] = useState(null);
  const [pendingEditTask, setPendingEditTask] = useState(null); // Task to edit when navigating from Plan

  // Lifted Modal States for Navigation Hiding
  // Projects Screen
  const [projectsShowMoveModal, setProjectsShowMoveModal] = useState(false);
  const [projectsReminderToMove, setProjectsReminderToMove] = useState(null);
  const [projectsEditingReminder, setProjectsEditingReminder] = useState(null);
  // Execute Screen
  const [executeShowNewTaskModal, setExecuteShowNewTaskModal] = useState(false);
  const [executeEditingTask, setExecuteEditingTask] = useState(null);
  const [executeEditingRoutine, setExecuteEditingRoutine] = useState(null);

  // Settings State
  // Settings State
  const [showSettingsModal, setShowSettingsModal] = useState(false);
  const [installPrompt, setInstallPrompt] = useState(null);
  const [username, setUsername] = useState(() => loadFromStorage('username', 'Architect'));
  // language lifted to top

  // Handle PWA Install Prompt
  useEffect(() => {
    const handleBeforeInstallPrompt = (e) => {
      e.preventDefault();
      setInstallPrompt(e);
    };

    window.addEventListener('beforeinstallprompt', handleBeforeInstallPrompt);

    return () => {
      window.removeEventListener('beforeinstallprompt', handleBeforeInstallPrompt);
    };
  }, []);

  // Persist username & language
  useEffect(() => {
    saveToStorage('username', username);
  }, [username]);

  useEffect(() => {
    saveToStorage('language', language);
  }, [language]);

  // Translation helper lifted to top


  // Edit Task State (lifted to App level to prevent reset on re-render)
  const [editTaskName, setEditTaskName] = useState('');
  const [editTaskIcon, setEditTaskIcon] = useState('📌');
  const [editTaskEnergy, setEditTaskEnergy] = useState('medium');
  const [editTaskStartHour, setEditTaskStartHour] = useState(9);
  const [editTaskStartMinute, setEditTaskStartMinute] = useState(0);
  const [editTaskEndHour, setEditTaskEndHour] = useState(10);
  const [editTaskEndMinute, setEditTaskEndMinute] = useState(0);
  const [editTaskAlerts, setEditTaskAlerts] = useState([]);
  const [editTaskRepeat, setEditTaskRepeat] = useState({ type: 'none', label: 'None', days: [] });
  const [editTaskShowTime, setEditTaskShowTime] = useState(false);
  const [editTaskShowAlerts, setEditTaskShowAlerts] = useState(false);
  const [editTaskDate, setEditTaskDate] = useState(new Date()); // For date editing
  const [editTaskShowDate, setEditTaskShowDate] = useState(false);
  const [editTaskShowRepeat, setEditTaskShowRepeat] = useState(false);
  // Locale helper
  // Locale helper lifted to top

  const [editTaskShowIconPicker, setEditTaskShowIconPicker] = useState(false);

  // Consistency fields
  const [editTaskValue, setEditTaskValue] = useState(5);
  const [editTaskNotes, setEditTaskNotes] = useState('');

  // Plan Screen
  const [planShowNewReminder, setPlanShowNewReminder] = useState(false);
  const [planEditingReminder, setPlanEditingReminder] = useState(null);
  // editingPlanTask is already lifted or unique enough, ensuring consistency:
  const [planEditingTask, setPlanEditingTask] = useState(null);
  const [planEditingTaskProject, setPlanEditingTaskProject] = useState(null);

  // Review Screen
  const [reviewShowPhotoModal, setReviewShowPhotoModal] = useState(false);
  // Projects Screen - Notes
  const [projectsIsEditingNotes, setProjectsIsEditingNotes] = useState(false);
  const [projectsShowNewFolderInput, setProjectsShowNewFolderInput] = useState(false);
  const [projectsNewFolderName, setProjectsNewFolderName] = useState('');


  // Calculate project progress
  const getProjectProgress = (project) => {
    if (!project.tasks || project.tasks.length === 0) return 0;
    const totalValue = project.tasks.reduce((sum, t) => sum + t.value, 0);
    const completedValue = project.tasks.filter(t => t.completed).reduce((sum, t) => sum + t.value, 0);
    return totalValue > 0 ? Math.round((completedValue / totalValue) * 100) : 0;
  };

  // Add new project
  const addProject = (projectData) => {
    const newProject = {
      id: Date.now(),
      ...projectData,
      tasks: [],
      folders: []
    };
    setProjects(prev => [...prev, newProject]);
  };

  // Update project
  const updateProject = (projectId, updates) => {
    setProjects(prev => prev.map(p => p.id === projectId ? { ...p, ...updates } : p));
  };

  // Delete project
  const deleteProject = (projectId) => {
    setProjects(prev => prev.filter(p => p.id !== projectId));
    if (selectedProject?.id === projectId) setSelectedProject(null);
  };


  // Add folder to project
  const createFolder = (projectId, folderName) => {
    const newFolder = {
      id: Date.now(),
      name: folderName,
      isCollapsed: false
    };

    setProjects(prev => prev.map(p =>
      p.id === projectId
        ? { ...p, folders: [...(p.folders || []), newFolder] }
        : p
    ));

    setSelectedProject(prev => {
      if (prev?.id === projectId) {
        return { ...prev, folders: [...(prev.folders || []), newFolder] };
      }
      return prev;
    });
  };

  // Delete folder from project
  const deleteFolder = (projectId, folderId) => {
    // Determine what to do with tasks in this folder?
    // For now, let's just move them to "Uncategorized" (null folderId)
    // or we can allow the user to decide. 
    // Simplified interaction: Tasks keep their folderId but it won't match any folder, 
    // so they effectively become uncategorized if we filter by existing folders.
    // Better: explicitly set folderId to null for tasks in this folder.

    setProjects(prev => prev.map(p => {
      if (p.id !== projectId) return p;
      return {
        ...p,
        folders: (p.folders || []).filter(f => f.id !== folderId),
        tasks: (p.tasks || []).map(t => t.folderId === folderId ? { ...t, folderId: null } : t)
      };
    }));

    setSelectedProject(prev => {
      if (prev?.id === projectId) {
        return {
          ...prev,
          folders: (prev.folders || []).filter(f => f.id !== folderId),
          tasks: (prev.tasks || []).map(t => t.folderId === folderId ? { ...t, folderId: null } : t)
        };
      }
      return prev;
    });
  };

  // Toggle folder collapse state
  const toggleFolderCollapse = (projectId, folderId) => {
    setProjects(prev => prev.map(p => {
      if (p.id !== projectId) return p;
      return {
        ...p,
        folders: (p.folders || []).map(f =>
          f.id === folderId ? { ...f, isCollapsed: !f.isCollapsed } : f
        )
      };
    }));

    setSelectedProject(prev => {
      if (prev?.id === projectId) {
        return {
          ...prev,
          folders: (prev.folders || []).map(f =>
            f.id === folderId ? { ...f, isCollapsed: !f.isCollapsed } : f
          )
        };
      }
      return prev;
    });
  };

  // Add task to project
  const addProjectTask = (projectId, taskData) => {
    const newTask = {
      id: Date.now(),
      ...taskData,
      completed: false
    };
    setProjects(prev => {
      const updated = prev.map(p =>
        p.id === projectId
          ? { ...p, tasks: [...(p.tasks || []), newTask] }
          : p
      );
      return updated;
    });
    // Update selectedProject separately
    setSelectedProject(prev => {
      if (prev?.id === projectId) {
        return { ...prev, tasks: [...(prev.tasks || []), newTask] };
      }
      return prev;
    });
  };

  // Update project task
  const updateProjectTask = (projectId, taskId, updates) => {
    setProjects(prev => prev.map(p =>
      p.id === projectId
        ? { ...p, tasks: (p.tasks || []).map(t => t.id === taskId ? { ...t, ...updates } : t) }
        : p
    ));
    setSelectedProject(prev => {
      if (prev?.id === projectId) {
        return { ...prev, tasks: (prev.tasks || []).map(t => t.id === taskId ? { ...t, ...updates } : t) };
      }
      return prev;
    });
  };

  // Delete project task
  const deleteProjectTask = (projectId, taskId) => {
    setProjects(prev => prev.map(p =>
      p.id === projectId
        ? { ...p, tasks: (p.tasks || []).filter(t => t.id !== taskId) }
        : p
    ));
    setSelectedProject(prev => {
      if (prev?.id === projectId) {
        return { ...prev, tasks: (prev.tasks || []).filter(t => t.id !== taskId) };
      }
      return prev;
    });
  };

  // Toggle project task completion
  const toggleProjectTask = (projectId, taskId) => {
    setProjects(prev => prev.map(p =>
      p.id === projectId
        ? { ...p, tasks: (p.tasks || []).map(t => t.id === taskId ? { ...t, completed: !t.completed } : t) }
        : p
    ));
    setSelectedProject(prev => {
      if (prev?.id === projectId) {
        return { ...prev, tasks: (prev.tasks || []).map(t => t.id === taskId ? { ...t, completed: !t.completed } : t) };
      }
      return prev;
    });
  };

  // Multi-day planning support - use local date string to avoid timezone issues
  const getDateKey = (date) => {
    const d = new Date(date);
    const year = d.getFullYear();
    const month = String(d.getMonth() + 1).padStart(2, '0');
    const day = String(d.getDate()).padStart(2, '0');
    return `${year}-${month}-${day}`;
  };

  const isItemDueOnDate = (item, targetDate) => {
    if (!item.repeat || item.repeat.type === 'none') return false;

    const itemDate = new Date(item.startTime || item.date);
    const target = new Date(targetDate);
    target.setHours(0, 0, 0, 0);
    itemDate.setHours(0, 0, 0, 0);

    // Don't show if target is before the creation/start date
    if (target < itemDate) return false;

    if (item.repeat.type === 'daily') return true;

    if (item.repeat.type === 'weekly') {
      return itemDate.getDay() === target.getDay();
    }

    if (item.repeat.type === 'custom') {
      const dayName = ['sun', 'mon', 'tue', 'wed', 'thu', 'fri', 'sat'][target.getDay()];
      return item.repeat.days?.includes(dayName);
    }

    return false;
  };

  // Get today's date with time set to midnight for proper comparison
  const getToday = () => {
    const d = new Date();
    d.setHours(0, 0, 0, 0);
    return d;
  };

  const today = getToday();
  const todayKey = getDateKey(today);

  const [selectedPlanDate, setSelectedPlanDate] = useState(getToday());
  const [selectedExecuteDate, setSelectedExecuteDate] = useState(getToday());

  const [plansByDate, setPlansByDate] = useState(() => {
    const defaultPlan = {
      [todayKey]: {
        priorities: [
          { slot: 1, task: null, energy: null, time: null },
          { slot: 2, task: null, energy: null, time: null },
          { slot: 3, task: null, energy: null, time: null },
        ],
        nonNegotiable: { task: null, energy: null, time: null }
      }
    };
    return loadFromStorage('plansByDate', defaultPlan);
  });

  // Store tasks by date
  const [tasksByDate, setTasksByDate] = useState({});

  // Collect all unique recurring templates from tasksByDate and reminders
  const recurringTemplates = useMemo(() => {
    const templates = new Map();

    // Scan reminders
    if (Array.isArray(reminders)) {
      reminders.forEach(r => {
        if (r.repeat && r.repeat.type !== 'none') {
          templates.set(`reminder-${r.id}`, { ...r, originType: 'reminder' });
        }
      });
    }

    // Scan all tasks in tasksByDate
    Object.values(tasksByDate || {}).forEach(dayTasks => {
      dayTasks.forEach(t => {
        if (t.repeat && t.repeat.type !== 'none') {
          templates.set(`task-${t.id}`, { ...t, originType: 'task' });
        }
      });
    });

    // Scan all project tasks
    if (Array.isArray(projects)) {
      projects.forEach(p => {
        if (Array.isArray(p.tasks)) {
          p.tasks.forEach(t => {
            if (t.repeat && t.repeat.type !== 'none') {
              templates.set(`project-task-${t.id}`, { ...t, originType: 'task', projectId: p.id, projectTaskId: t.id });
            }
          });
        }
      });
    }

    return Array.from(templates.values());
  }, [reminders, tasksByDate, projects]);

  // Helper to get resolved tasks for a date (hardened + virtual)
  const getResolvedTasksForDate = useCallback((date) => {
    const dateKey = getDateKey(date);
    const hardenedTasks = tasksByDate[dateKey] || [];

    // Find virtual tasks that should be here
    const virtualTasks = recurringTemplates
      .filter(tpl => tpl.originType === 'task')
      .filter(tpl => isItemDueOnDate(tpl, date))
      .filter(tpl => !hardenedTasks.some(ht => ht.id === tpl.id))
      .map(tpl => ({
        ...tpl,
        startTime: new Date(new Date(date).setHours(new Date(tpl.startTime).getHours(), new Date(tpl.startTime).getMinutes(), 0, 0)),
        endTime: new Date(new Date(date).setHours(new Date(tpl.endTime).getHours(), new Date(tpl.endTime).getMinutes(), 0, 0)),
        isVirtual: true
      }));

    return [...hardenedTasks, ...virtualTasks].sort((a, b) => new Date(a.startTime) - new Date(b.startTime));
  }, [tasksByDate, recurringTemplates]);

  // Helper to get resolved reminders for a date
  const getResolvedRemindersForDate = useCallback((date) => {
    const targetDateKey = getDateKey(date);

    return reminders.map(r => {
      const rDateKey = r.date ? getDateKey(r.date) : null;
      const isFloating = !r.date && (!r.repeat || r.repeat.type === 'none');
      const isSpecific = rDateKey === targetDateKey;
      const isRecurringDue = isItemDueOnDate(r, date);

      if (isSpecific || isFloating) return { ...r, isVirtual: false };
      if (isRecurringDue) return { ...r, isVirtual: true, date: new Date(date).toISOString() };
      return null;
    }).filter(Boolean);
  }, [reminders, recurringTemplates]);

  // Default routines
  const defaultRoutines = {
    morning: {
      title: 'Morning Routine',
      icon: '🌅',
      time: '06:30',
      habits: [
        { id: 1, title: 'Make bed', completed: false },
        { id: 2, title: 'Drink water', completed: false },
        { id: 3, title: 'Stretch / Exercise', completed: false },
        { id: 4, title: 'Shower', completed: false },
        { id: 5, title: 'Healthy breakfast', completed: false },
        { id: 6, title: 'Review daily plan', completed: false },
      ]
    },
    evening: {
      title: 'Evening Routine',
      icon: '🌙',
      time: '21:00',
      habits: [
        { id: 1, title: 'Review the day', completed: false },
        { id: 2, title: 'Prepare tomorrow', completed: false },
        { id: 3, title: 'Tidy workspace', completed: false },
        { id: 4, title: 'Read / Journal', completed: false },
        { id: 5, title: 'Screen off', completed: false },
      ]
    }
  };

  // Routines state (habits by date)
  const [routinesByDate, setRoutinesByDate] = useState(() => loadFromStorage('routinesByDate', {}));

  // Routine templates (editable)
  const [routineTemplates, setRoutineTemplates] = useState(() => loadFromStorage('routineTemplates', defaultRoutines));

  // Save routines to localStorage
  useEffect(() => {
    saveToStorage('routinesByDate', routinesByDate);
  }, [routinesByDate]);

  useEffect(() => {
    saveToStorage('routineTemplates', routineTemplates);
  }, [routineTemplates]);

  // Get routines for a specific date (creates from template if not exists)
  const getRoutinesForDate = (date) => {
    const key = getDateKey(date);
    if (!routinesByDate[key]) {
      return {
        morning: { ...routineTemplates.morning, habits: routineTemplates.morning.habits.map(h => ({ ...h, completed: false })) },
        evening: { ...routineTemplates.evening, habits: routineTemplates.evening.habits.map(h => ({ ...h, completed: false })) }
      };
    }
    return routinesByDate[key];
  };

  // Toggle habit completion
  const toggleRoutineHabit = (date, routineType, habitId) => {
    const key = getDateKey(date);
    const currentRoutines = getRoutinesForDate(date);

    setRoutinesByDate(prev => ({
      ...prev,
      [key]: {
        ...currentRoutines,
        [routineType]: {
          ...currentRoutines[routineType],
          habits: currentRoutines[routineType].habits.map(h =>
            h.id === habitId ? { ...h, completed: !h.completed } : h
          )
        }
      }
    }));
  };

  // Complete all habits in a routine
  const completeAllHabits = (date, routineType) => {
    const key = getDateKey(date);
    const currentRoutines = getRoutinesForDate(date);

    setRoutinesByDate(prev => ({
      ...prev,
      [key]: {
        ...currentRoutines,
        [routineType]: {
          ...currentRoutines[routineType],
          habits: currentRoutines[routineType].habits.map(h => ({ ...h, completed: true }))
        }
      }
    }));
  };

  // Update routine template
  const updateRoutineTemplate = (routineType, updates) => {
    setRoutineTemplates(prev => ({
      ...prev,
      [routineType]: { ...prev[routineType], ...updates }
    }));
  };

  // Add habit to routine template
  const addHabitToTemplate = (routineType, habitTitle) => {
    setRoutineTemplates(prev => ({
      ...prev,
      [routineType]: {
        ...prev[routineType],
        habits: [...prev[routineType].habits, { id: Date.now(), title: habitTitle, completed: false }]
      }
    }));
  };

  // Remove habit from routine template
  const removeHabitFromTemplate = (routineType, habitId) => {
    setRoutineTemplates(prev => ({
      ...prev,
      [routineType]: {
        ...prev[routineType],
        habits: prev[routineType].habits.filter(h => h.id !== habitId)
      }
    }));
  };

  // Get plan for a specific date
  const getPlanForDate = (date) => {
    const key = getDateKey(date);
    if (!plansByDate[key]) {
      return {
        priorities: [
          { slot: 1, task: null, energy: null, time: null },
          { slot: 2, task: null, energy: null, time: null },
          { slot: 3, task: null, energy: null, time: null },
        ],
        nonNegotiable: { task: null, energy: null, time: null }
      };
    }
    return plansByDate[key];
  };

  // Get current day's plan (for Plan screen)
  const getCurrentPlan = () => getPlanForDate(selectedPlanDate);

  const priorities = getCurrentPlan().priorities;
  const nonNegotiable = getCurrentPlan().nonNegotiable;

  // Update priorities for current date
  const setPriorities = (newPriorities) => {
    const key = getDateKey(selectedPlanDate);
    setPlansByDate(prev => ({
      ...prev,
      [key]: {
        ...getPlanForDate(selectedPlanDate),
        priorities: typeof newPriorities === 'function'
          ? newPriorities(getPlanForDate(selectedPlanDate).priorities)
          : newPriorities
      }
    }));
  };

  // Add new priority slot
  const addPrioritySlot = () => {
    const currentPriorities = getCurrentPlan().priorities;
    const newSlot = { slot: currentPriorities.length + 1, task: null, energy: null, time: null };
    setPriorities([...currentPriorities, newSlot]);
  };

  // Update nonNegotiable for current date
  const setNonNegotiable = (newNonNegotiable) => {
    const key = getDateKey(selectedPlanDate);
    setPlansByDate(prev => ({
      ...prev,
      [key]: {
        ...getPlanForDate(selectedPlanDate),
        nonNegotiable: typeof newNonNegotiable === 'function'
          ? newNonNegotiable(getPlanForDate(selectedPlanDate).nonNegotiable)
          : newNonNegotiable
      }
    }));
  };
  // Get tasks for Execute screen's selected date
  const tasks = getResolvedTasksForDate(selectedExecuteDate);

  // Reflections storage by date
  const [selectedReflectDate, setSelectedReflectDate] = useState(getToday());
  const [reflectionsByDate, setReflectionsByDate] = useState(() => loadFromStorage('reflectionsByDate', {}));

  // Get reflection for a specific date
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

  // Update reflection for a specific date (auto-save)
  const updateReflection = (date, field, value) => {
    const key = getDateKey(date);
    setReflectionsByDate(prev => {
      const existing = prev[key] || {
        activities: '',
        topResult: '',
        energyDrain: '',
        didWell: '',
        lesson: '',
        rating: null,
        photo: null
      };
      return {
        ...prev,
        [key]: {
          ...existing,
          [field]: value
        }
      };
    });
  };

  const [activeTask, setActiveTask] = useState(null);
  const [isPaused, setIsPaused] = useState(false);
  const [elapsedTime, setElapsedTime] = useState(0);
  const [completedTasks, setCompletedTasks] = useState(() => loadFromStorage('completedTasks', []));
  const [selectedDay, setSelectedDay] = useState(new Date().getDay() === 0 ? 6 : new Date().getDay() - 1);
  const [draggedItem, setDraggedItem] = useState(null);
  const [dragOverSlot, setDragOverSlot] = useState(null);
  const [dragPosition, setDragPosition] = useState({ x: 0, y: 0 });
  const [isDragging, setIsDragging] = useState(false);

  // Persist data to localStorage whenever it changes
  useEffect(() => { saveToStorage('reminders', reminders); }, [reminders]);
  useEffect(() => { saveToStorage('projects', projects); }, [projects]);
  useEffect(() => { saveToStorage('plansByDate', plansByDate); }, [plansByDate]);
  useEffect(() => { saveToStorage('tasksByDate', tasksByDate); }, [tasksByDate]);
  useEffect(() => { saveToStorage('reflectionsByDate', reflectionsByDate); }, [reflectionsByDate]);
  useEffect(() => { saveToStorage('completedTasks', completedTasks); }, [completedTasks]);

  // Global New Task Modal State
  const [showGlobalTaskModal, setShowGlobalTaskModal] = useState(false);
  const [globalTaskName, setGlobalTaskName] = useState('');
  const [globalTaskIcon, setGlobalTaskIcon] = useState('📌');
  const [globalTaskEnergy, setGlobalTaskEnergy] = useState('medium');
  const [globalTaskStartHour, setGlobalTaskStartHour] = useState(9);
  const [globalTaskStartMinute, setGlobalTaskStartMinute] = useState(0);
  const [globalTaskEndHour, setGlobalTaskEndHour] = useState(10);
  const [globalTaskEndMinute, setGlobalTaskEndMinute] = useState(0);
  const [globalTaskReminder, setGlobalTaskReminder] = useState(null);
  const [globalTaskIsNonNegotiable, setGlobalTaskIsNonNegotiable] = useState(false);
  const [globalTaskMode, setGlobalTaskMode] = useState('task'); // 'task', 'reminder', or 'priority'
  const [globalTaskPrioritySlot, setGlobalTaskPrioritySlot] = useState(null); // Which priority slot to add to

  const [globalTaskDate, setGlobalTaskDate] = useState(new Date());
  const [globalTaskAlerts, setGlobalTaskAlerts] = useState([]);
  const [globalTaskShowTime, setGlobalTaskShowTime] = useState(false);
  const [globalTaskShowAlerts, setGlobalTaskShowAlerts] = useState(false);
  const [globalTaskShowDate, setGlobalTaskShowDate] = useState(false);
  const [globalTaskShowIconPicker, setGlobalTaskShowIconPicker] = useState(false);
  const [globalTaskRepeat, setGlobalTaskRepeat] = useState({ type: 'none', label: 'None', days: [] });
  const [globalTaskShowRepeat, setGlobalTaskShowRepeat] = useState(false);
  const [globalTaskValue, setGlobalTaskValue] = useState(5);
  const [globalTaskNotes, setGlobalTaskNotes] = useState('');
  const [globalEditingTaskId, setGlobalEditingTaskId] = useState(null);



  // Open global task modal
  const openGlobalTaskModal = (mode = 'task', prioritySlot = null, taskToEdit = null) => {
    const now = new Date();
    const nextHour = Math.min(22, now.getHours() + 1);

    // Choose date based on view or default to today
    const defaultDate = activeTab === 'execute' ? selectedExecuteDate : selectedPlanDate;

    if (taskToEdit) {
      // Edit mode
      setGlobalEditingTaskId(taskToEdit.id);
      setGlobalTaskName(taskToEdit.name || taskToEdit.title || '');
      setGlobalTaskIcon(taskToEdit.icon || '📌');
      setGlobalTaskEnergy(taskToEdit.energy || 'medium');
      setGlobalTaskValue(taskToEdit.value || 5);
      setGlobalTaskNotes(taskToEdit.notes || '');

      const taskDate = taskToEdit.date ? new Date(taskToEdit.date) : (taskToEdit.startTime ? new Date(taskToEdit.startTime) : new Date());
      setGlobalTaskDate(taskDate);

      if (taskToEdit.startTime) {
        const s = new Date(taskToEdit.startTime);
        setGlobalTaskStartHour(s.getHours());
        setGlobalTaskStartMinute(s.getMinutes());
      } else {
        setGlobalTaskStartHour(nextHour);
        setGlobalTaskStartMinute(0);
      }

      if (taskToEdit.endTime) {
        const e = new Date(taskToEdit.endTime);
        setGlobalTaskEndHour(e.getHours());
        setGlobalTaskEndMinute(e.getMinutes());
      } else {
        setGlobalTaskEndHour(Math.min(23, nextHour + 1));
        setGlobalTaskEndMinute(0);
      }

      setGlobalTaskAlerts(taskToEdit.alerts || []);
      setGlobalTaskRepeat(taskToEdit.repeat || { type: 'none', label: 'None', days: [] });

    } else {
      // Create mode
      setGlobalEditingTaskId(null);
      setGlobalTaskName('');
      setGlobalTaskIcon('📌');
      setGlobalTaskEnergy('medium');
      setGlobalTaskStartHour(nextHour);
      setGlobalTaskStartMinute(0);
      setGlobalTaskEndHour(Math.min(23, nextHour + 1));
      setGlobalTaskEndMinute(0);
      setGlobalTaskReminder(null); // Assuming this is distinct from alerts, kept for compatibility

      setGlobalTaskDate(defaultDate ? new Date(defaultDate) : new Date());
      setGlobalTaskAlerts([]);
      setGlobalTaskValue(5);
      setGlobalTaskNotes('');
      setGlobalTaskRepeat({ type: 'none', label: 'None', days: [] });
    }

    setGlobalTaskIsNonNegotiable(false);
    setGlobalTaskShowTime(false);
    setGlobalTaskShowAlerts(false);
    setGlobalTaskShowDate(false);
    setGlobalTaskShowRepeat(false);
    setGlobalTaskShowIconPicker(false);

    setGlobalTaskMode(mode);
    setGlobalTaskPrioritySlot(prioritySlot);
    setShowGlobalTaskModal(true);
  };

  // Create task/reminder from global modal
  const createGlobalTask = () => {
    if (!globalTaskName.trim()) return;

    if (globalTaskMode === 'reminder') {
      // Add as reminder
      const sTime = new Date(globalTaskDate);
      sTime.setHours(globalTaskStartHour, globalTaskStartMinute, 0, 0);

      const eTime = new Date(globalTaskDate);
      eTime.setHours(globalTaskEndHour, globalTaskEndMinute, 0, 0);

      const newReminder = {
        id: globalEditingTaskId || Date.now(),
        icon: globalTaskIcon,
        name: globalTaskName.trim(),
        energy: globalTaskEnergy,
        alerts: globalTaskAlerts,
        date: globalTaskDate.toISOString(),
        startTime: sTime.toISOString(),
        endTime: eTime.toISOString(),
        repeat: globalTaskRepeat,
        value: globalTaskValue,
        notes: globalTaskNotes,
        completed: false // Reset completed on edit? Probably not if editing. 
        // But for now assuming this is create path for reminder or simple update.
        // Use spread if editing.
      };

      if (globalEditingTaskId) {
        setReminders(prev => prev.map(r => r.id === globalEditingTaskId ? { ...r, ...newReminder, completed: r.completed } : r));
      } else {
        setReminders(prev => [...prev, newReminder]);
      }

    } else if (globalTaskMode === 'priority' && globalTaskPrioritySlot !== null) {
      const sTime = new Date(globalTaskDate);
      sTime.setHours(globalTaskStartHour, globalTaskStartMinute, 0, 0);

      const eTime = new Date(globalTaskDate);
      eTime.setHours(globalTaskEndHour, globalTaskEndMinute, 0, 0);

      // Calculate duration for priority display
      const duration = Math.round((eTime - sTime) / (1000 * 60)); // minutes
      const hours = Math.floor(duration / 60);
      const minutes = duration % 60;
      let timeStr = '1h';
      if (hours === 0 && minutes > 0) timeStr = `${minutes}m`;
      else if (hours > 0 && minutes === 0) timeStr = `${hours}h`;
      else if (hours > 0 && minutes > 0) timeStr = `${hours}h ${minutes}m`;

      if (globalEditingTaskId) {
        // UPDATE EXISTING PRIORITY TASK
        const existingPriority = priorities[globalTaskPrioritySlot];
        const updatedTask = {
          ...existingPriority.task,
          name: globalTaskName.trim(),
          title: globalTaskName.trim(),
          icon: globalTaskIcon,
          energy: globalTaskEnergy,
          value: globalTaskValue,
          notes: globalTaskNotes,
          startTime: sTime,
          endTime: eTime,
          alerts: globalTaskAlerts,
          repeat: globalTaskRepeat
        };

        const newPriorities = [...priorities];
        newPriorities[globalTaskPrioritySlot] = {
          ...existingPriority,
          task: updatedTask,
          energy: globalTaskEnergy,
          time: timeStr
        };
        setPriorities(newPriorities);

        // Sync to Reminder
        if (updatedTask.originalReminderId) {
          const updatedReminders = reminders.map(r =>
            r.id === updatedTask.originalReminderId ? {
              ...r,
              name: globalTaskName.trim(),
              icon: globalTaskIcon,
              energy: globalTaskEnergy,
              value: globalTaskValue,
              notes: globalTaskNotes,
              startTime: sTime.toISOString(),
              endTime: eTime.toISOString(),
              alerts: globalTaskAlerts,
              repeat: globalTaskRepeat,
              date: globalTaskDate.toISOString()
            } : r
          );
          setReminders(updatedReminders);
          saveToStorage('reminders', updatedReminders);
        }

        // Sync to Project Task
        if (updatedTask.projectId && updatedTask.projectTaskId) {
          const updatedProjects = projects.map(p => {
            if (p.id === updatedTask.projectId) {
              return {
                ...p,
                tasks: p.tasks.map(t => {
                  if (t.id === updatedTask.projectTaskId) {
                    return {
                      ...t,
                      title: globalTaskName.trim(),
                      icon: globalTaskIcon,
                      energy: globalTaskEnergy,
                      value: globalTaskValue,
                      notes: globalTaskNotes,
                      startTime: sTime.toISOString(),
                      endTime: eTime.toISOString(),
                      dueDate: globalTaskDate.toISOString(),
                      alerts: globalTaskAlerts,
                      repeat: globalTaskRepeat
                    };
                  }
                  return t;
                })
              };
            }
            return p;
          });
          setProjects(updatedProjects);
          saveToStorage('projects', updatedProjects);
        }

      } else {
        // CREATE NEW PRIORITY TASK
        const newReminder = {
          id: Date.now(),
          icon: globalTaskIcon,
          name: globalTaskName.trim(),
          energy: globalTaskEnergy,
          alerts: globalTaskAlerts,
          date: globalTaskDate.toISOString(),
          startTime: sTime.toISOString(),
          endTime: eTime.toISOString(),
          repeat: globalTaskRepeat,
          value: globalTaskValue,
          notes: globalTaskNotes,
          completed: false
        };

        // Save to reminders array
        const updatedReminders = [...reminders, newReminder];
        setReminders(updatedReminders);
        saveToStorage('reminders', updatedReminders);

        // Create priority task with reference to reminder
        const newTask = {
          id: Date.now() + 1,
          icon: globalTaskIcon,
          name: globalTaskName.trim(),
          title: globalTaskName.trim(),
          energy: globalTaskEnergy,
          value: globalTaskValue,
          notes: globalTaskNotes,
          originalReminderId: newReminder.id, // Link to reminder for completion sync
          startTime: sTime,
          endTime: eTime,
          alerts: globalTaskAlerts,
          repeat: globalTaskRepeat
        };

        const newPriorities = [...priorities];
        newPriorities[globalTaskPrioritySlot] = {
          slot: globalTaskPrioritySlot + 1,
          task: newTask,
          energy: globalTaskEnergy,
          time: timeStr
        };
        setPriorities(newPriorities);
      } // End create new
    } else {
      // Add as scheduled task
      const targetDate = globalTaskDate; // Use the selected date from modal
      const startTime = new Date(targetDate);
      startTime.setHours(globalTaskStartHour, globalTaskStartMinute, 0, 0);

      const endTime = new Date(targetDate);
      endTime.setHours(globalTaskEndHour, globalTaskEndMinute, 0, 0);

      if (endTime <= startTime) {
        endTime.setHours(globalTaskStartHour + 1, globalTaskStartMinute, 0, 0);
      }

      const newTask = {
        id: Date.now(),
        title: globalTaskName.trim(),
        icon: globalTaskIcon,
        energy: globalTaskEnergy,
        startTime: startTime,
        endTime: endTime,
        isNonNegotiable: globalTaskIsNonNegotiable,
        alerts: globalTaskAlerts,
        repeat: globalTaskRepeat,
        value: globalTaskValue,
        notes: globalTaskNotes,
        completed: false
      };

      const dateKey = getDateKey(targetDate);
      setTasksByDate(prev => ({
        ...prev,
        [dateKey]: [...(prev[dateKey] || []), newTask].sort((a, b) => a.startTime - b.startTime)
      }));
    }

    setShowGlobalTaskModal(false);
  };

  // State for Plan screen drag-to-day (needs to be at component level for useEffect access)
  const [planDragOverDay, setPlanDragOverDay] = useState(null);

  // Mouse-based drag and drop
  useEffect(() => {
    if (!isDragging) return;

    const handleMouseMove = (e) => {
      setDragPosition({ x: e.clientX, y: e.clientY });
    };

    const handleMouseUp = () => {
      // Check if dropping on a different day in Plan screen
      if (draggedItem && planDragOverDay && draggedItem.type === 'p') {
        // Move task to different day
        const sourceData = { ...priorities[draggedItem.index] };

        if (sourceData.task) {
          const targetDateKey = getDateKey(planDragOverDay);
          const currentPlan = plansByDate[targetDateKey] || {
            priorities: [
              { slot: 1, task: null, energy: null, time: null },
              { slot: 2, task: null, energy: null, time: null },
              { slot: 3, task: null, energy: null, time: null }
            ]
          };

          // Find first empty slot in target day
          let placed = false;
          for (let i = 0; i < 3; i++) {
            if (!currentPlan.priorities[i]?.task) {
              currentPlan.priorities[i] = {
                slot: i + 1,
                task: sourceData.task,
                energy: sourceData.energy,
                time: sourceData.time
              };
              placed = true;
              break;
            }
          }

          if (placed) {
            // Save to target day
            setPlansByDate(prev => ({
              ...prev,
              [targetDateKey]: currentPlan
            }));

            // Remove from current day
            const newPriorities = [...priorities];
            newPriorities[draggedItem.index] = {
              slot: draggedItem.index + 1,
              task: null,
              energy: null,
              time: null
            };
            setPriorities(newPriorities);
          }
        }

        setPlanDragOverDay(null);
      } else if (draggedItem && dragOverSlot) {
        executeDrop();
      }

      setIsDragging(false);
      setDraggedItem(null);
      setDragOverSlot(null);
      setPlanDragOverDay(null);
    };

    window.addEventListener('mousemove', handleMouseMove);
    window.addEventListener('mouseup', handleMouseUp);

    return () => {
      window.removeEventListener('mousemove', handleMouseMove);
      window.removeEventListener('mouseup', handleMouseUp);
    };
  }, [isDragging, draggedItem, dragOverSlot, plansByDate, selectedPlanDate, reminders, planDragOverDay, priorities]);

  // Timer effect
  useEffect(() => {
    let interval;
    if (activeTask && !isPaused) {
      interval = setInterval(() => {
        setElapsedTime(prev => prev + 1);
      }, 1000);
    }
    return () => clearInterval(interval);
  }, [activeTask, isPaused]);

  // Build tasks from priorities - syncs automatically when plan changes
  useEffect(() => {
    buildAllTasks();
  }, [plansByDate]);

  // Build tasks for all dates that have plans
  const buildAllTasks = () => {
    const colors = ['#FEF3C7', '#DBEAFE', '#FCE7F3', '#D1FAE5', '#FED7AA', '#E9D5FF'];
    const newTasksByDate = {};

    Object.keys(plansByDate).forEach(dateKey => {
      const plan = plansByDate[dateKey];
      if (!plan) return;

      const dateObj = new Date(dateKey + 'T00:00:00');
      let startTime = new Date(dateObj);
      startTime.setHours(9, 0, 0, 0);

      const dayTasks = [];
      let colorIndex = 0;

      // Get existing tasks for this date to preserve completed status
      const existingTasks = getResolvedTasksForDate(dateObj);

      // Add priorities
      plan.priorities?.forEach((p, idx) => {
        if (p.task) {
          const duration = parseTime(p.time || '1h');
          const endTime = new Date(startTime.getTime() + duration * 60000);
          const existingTask = existingTasks.find(t => t.id === `p${idx}`);
          dayTasks.push({
            id: `p${idx}`,
            icon: p.task.icon,
            title: p.task.title || p.task.name || '',
            startTime: new Date(startTime),
            endTime: endTime,
            duration: p.time || '1h',
            energy: p.energy || p.task.energy,
            color: colors[colorIndex % colors.length],
            isNonNegotiable: false,
            completed: existingTask?.completed || false,
            // Preserve original source fields for completion sync
            originalReminderId: p.task.originalReminderId,
            projectId: p.task.projectId,
            projectTaskId: p.task.projectTaskId
          });
          startTime = endTime;
          colorIndex++;
        }
      });

      if (dayTasks.length > 0) {
        newTasksByDate[dateKey] = dayTasks;
      }
    });

    setTasksByDate(newTasksByDate);

    // Update activeTask if it still exists
    if (activeTask) {
      const currentDateKey = getDateKey(selectedExecuteDate);
      const currentTasks = newTasksByDate[currentDateKey] || [];
      const updatedActiveTask = currentTasks.find(t => t.id === activeTask.id);
      if (updatedActiveTask) {
        setActiveTask(updatedActiveTask);
      } else {
        setActiveTask(null);
        setElapsedTime(0);
      }
    }

    // Update completedTasks
    const allCompleted = Object.values(newTasksByDate).flat().filter(t => t.completed);
    setCompletedTasks(allCompleted);
  };

  // const parseTime ... moved to module scope
  // const formatElapsed ... moved to module scope

  const addToNextSlot = (reminder) => {
    // Prevent duplicates: check if this reminder is already in priorities
    // Check using originalReminderId since we create new IDs for tasks
    if (priorities.some(p => p.task && p.task.originalReminderId === reminder.id)) {
      return; // Already in priorities, do nothing
    }

    // Create a copy of the reminder for the slot (don't remove from reminders)
    // Convert reminder's 'name' property to task's 'title' property
    const taskCopy = {
      ...reminder,
      title: reminder.title || reminder.name || '',
      originalReminderId: reminder.id, // Store original ID for duplicate checking
      id: Date.now(),
      isVirtual: false
    };

    // Fill priorities 1, 2, 3
    for (let i = 0; i < 3; i++) {
      if (!priorities[i].task) {
        const newPriorities = [...priorities];
        newPriorities[i] = { ...newPriorities[i], task: { ...taskCopy, id: Date.now() + i }, energy: reminder.energy };
        setPriorities(newPriorities);
        return;
      }
    }
  };

  // Drag and Drop handlers (mouse-based)
  const startDrag = (e, slotType, slotIndex = null, reminderData = null) => {
    e.preventDefault();
    setDraggedItem({ type: slotType, index: slotIndex, reminder: reminderData });
    setDragPosition({ x: e.clientX, y: e.clientY });
    setIsDragging(true);
  };

  const handleSlotMouseEnter = (slotType, slotIndex = null) => {
    if (isDragging) {
      setDragOverSlot({ type: slotType, index: slotIndex });
    }
  };

  const handleSlotMouseLeave = () => {
    if (isDragging) {
      setDragOverSlot(null);
    }
  };

  const executeDrop = () => {
    if (!draggedItem || !dragOverSlot) return;

    const targetType = dragOverSlot.type;
    const targetIndex = dragOverSlot.index;

    // Handle dropping a reminder into a priority slot
    if (draggedItem.type === 'reminder' && targetType === 'p') {
      const reminder = draggedItem.reminder;

      // If target slot has a task, return it to reminders
      if (priorities[targetIndex]?.task) {
        setReminders(prev => [...prev, priorities[targetIndex].task]);
      }

      const newPriorities = [...priorities];
      newPriorities[targetIndex] = {
        slot: targetIndex + 1,
        task: reminder,
        energy: reminder.energy,
        time: null
      };
      setPriorities(newPriorities);

      // Remove from reminders
      setReminders(prev => prev.filter(r => r.id !== reminder.id));
      return;
    }

    // Don't do anything if dropping on same slot
    if (draggedItem.type === targetType && draggedItem.index === targetIndex) {
      return;
    }

    // Only handle priority-to-priority swaps now
    if (draggedItem.type === 'p' && targetType === 'p') {
      const sourceData = { ...priorities[draggedItem.index] };
      const targetData = { ...priorities[targetIndex] };

      // Swap the data
      const newPriorities = [...priorities];
      newPriorities[draggedItem.index] = {
        slot: draggedItem.index + 1,
        task: targetData.task,
        energy: targetData.energy,
        time: targetData.time
      };
      newPriorities[targetIndex] = {
        slot: targetIndex + 1,
        task: sourceData.task,
        energy: sourceData.energy,
        time: sourceData.time
      };
      setPriorities(newPriorities);
    }
  };

  const completeTask = (taskId) => {
    const dateKey = getDateKey(selectedExecuteDate);
    const task = tasks.find(t => t.id === taskId);

    if (task && task.isVirtual) {
      setTasksByDate(prev => ({
        ...prev,
        [dateKey]: [...(prev[dateKey] || []), { ...task, isVirtual: false, completed: true }].sort((a, b) => a.startTime - b.startTime)
      }));
    } else {
      setTasksByDate(prev => ({
        ...prev,
        [dateKey]: (prev[dateKey] || []).map(t =>
          t.id === taskId ? { ...t, completed: true } : t
        )
      }));
    }

    if (task) {
      setCompletedTasks(prev => [...prev, { ...task, isVirtual: false, completed: true }]);

      // If this task came from a reminder, mark the reminder as completed too
      // ONLY if it's NOT a recurring task. Recurring reminders should stay active as templates.
      if (task.originalReminderId && (!task.repeat || task.repeat.type === 'none')) {
        const updatedReminders = reminders.map(r =>
          r.id === task.originalReminderId ? { ...r, completed: true } : r
        );
        setReminders(updatedReminders);
        saveToStorage('reminders', updatedReminders);
      }

      // If this task came from a project, mark the project task as completed too
      // ONLY if it's NOT a recurring task. Recurring project tasks should stay active as templates.
      if (task.projectId && task.projectTaskId && (!task.repeat || task.repeat.type === 'none')) {
        toggleProjectTask(task.projectId, task.projectTaskId);
      }
    }
    if (activeTask?.id === taskId) {
      setActiveTask(null);
      setElapsedTime(0);
      setIsPaused(false);
    }
  };

  const EnergyBadge = ({ energy, active = true, onClick, t }) => {
    const colors = {
      low: active ? 'bg-emerald-500 text-white' : 'bg-slate-200 text-slate-500',
      medium: active ? 'bg-amber-500 text-white' : 'bg-slate-200 text-slate-500',
      high: active ? 'bg-rose-500 text-white' : 'bg-slate-200 text-slate-500'
    };

    // Fallback if t is missing for some reason
    const labels = {
      low: t ? t('common.energy.low') : 'Low',
      medium: t ? t('common.energy.medium') : 'Med',
      high: t ? t('common.energy.high') : 'High'
    };

    return (
      <button
        onClick={onClick}
        className={`px-2.5 py-1 rounded-full text-xs font-medium transition-all duration-200 ${colors[energy]} ${onClick ? 'hover:scale-105 cursor-pointer' : ''}`}
      >
        {labels[energy]}
      </button>
    );
  };

  const TimeDropdown = ({ value, onChange, t }) => {
    const options = [
      '15m', '30m', '45m', '1h', '1h 15m', '1h 30m', '1h 45m', '2h',
      '2h 30m', '3h', '3h 30m', '4h', '4h 30m', '5h', '5h 30m', '6h', '6h 30m', '7h', '7h 30m', '8h'
    ].map(o => o.replace('m', t ? t('units.m') : 'm').replace('h', t ? t('units.h') : 'h'));

    return (
      <select
        value={value || ''}
        onChange={(e) => onChange(e.target.value)}
        className="px-3 py-1.5 bg-white/10 rounded-lg text-sm text-slate-300 border border-white/10 focus:ring-2 focus:ring-purple-500/30 outline-none cursor-pointer"
      >
        <option value="" className="bg-slate-800">{t ? t('common.time') : 'Time'}</option>
        {options.map(opt => <option key={opt} value={opt} className="bg-slate-800">{opt}</option>)}
      </select>
    );
  };

  // ============================================
  // PLAN SCREEN
  // ============================================
  const PlanScreen = () => {
    // projectsExpanded, expandedProjectId, remindersExpanded state lifted to App component
    // planShowNewReminder lifted to App as planShowNewReminder
    const [newReminderName, setNewReminderName] = useState('');
    const [newReminderIcon, setNewReminderIcon] = useState('📌');
    const [newReminderEnergy, setNewReminderEnergy] = useState('medium');

    // Edit reminder state
    const [planEditingReminder, setPlanEditingReminder] = useState(null);
    const [editReminderName, setEditReminderName] = useState('');
    const [editReminderIcon, setEditReminderIcon] = useState('📝');
    const [editReminderEnergy, setEditReminderEnergy] = useState('low');
    const [editReminderValue, setEditReminderValue] = useState(5);
    const [editReminderNotes, setEditReminderNotes] = useState('');

    // Edit Reminder Alerts & Time State
    const [editReminderAlerts, setEditReminderAlerts] = useState([]);
    const [editReminderDate, setEditReminderDate] = useState(new Date());
    const [editReminderStartHour, setEditReminderStartHour] = useState(9);
    const [editReminderStartMinute, setEditReminderStartMinute] = useState(0);
    const [editReminderEndHour, setEditReminderEndHour] = useState(10);
    const [editReminderEndMinute, setEditReminderEndMinute] = useState(0);
    const [editReminderShowTime, setEditReminderShowTime] = useState(false);
    const [editReminderShowAlerts, setEditReminderShowAlerts] = useState(false);
    const [editReminderShowDate, setEditReminderShowDate] = useState(false);
    const [editReminderShowIconPicker, setEditReminderShowIconPicker] = useState(false);
    const [editReminderRepeat, setEditReminderRepeat] = useState({ type: 'none', label: 'None', days: [] });
    const [editReminderShowRepeat, setEditReminderShowRepeat] = useState(false);

    // Edit project task state (for editing in Plan screen)
    // planEditingTask, planEditingTaskProject lifted to App as planEditingTask, planEditingTaskProject
    const [planTaskData, setPlanTaskData] = useState({
      title: '',
      icon: '📝', // Default icon
      value: 5,
      energy: 'medium',
      timeEstimate: 30,
      dueDate: '',
      notes: '',
      alerts: [],
      repeat: { type: 'none', label: 'None', days: [] },
      date: new Date(),
      startTime: '',
      endTime: ''
    });

    const [planEditShowTime, setPlanEditShowTime] = useState(false);
    const [planEditShowAlerts, setPlanEditShowAlerts] = useState(false);
    const [planEditShowDate, setPlanEditShowDate] = useState(false);
    const [planEditShowRepeat, setPlanEditShowRepeat] = useState(false);
    const [planEditShowIconPicker, setPlanEditShowIconPicker] = useState(false); // New state for icon picker toggle

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

    const openPlanTaskEdit = (task, project) => {
      // Helper to get formatted time string from date or defaults
      const getStartTime = (t) => t.startTime ? new Date(t.startTime) : new Date(new Date().setHours(9, 0, 0, 0));
      const getEndTime = (t) => t.endTime ? new Date(t.endTime) : new Date(new Date().setHours(10, 0, 0, 0));

      const sTime = getStartTime(task);
      const eTime = getEndTime(task);

      const formatTime = (d) => `${d.getHours()}:${d.getMinutes().toString().padStart(2, '0')}`;

      setPlanTaskData({
        title: task.title || task.name || '',
        icon: task.icon || '📝',
        value: task.value || 5,
        energy: task.energy || 'medium',
        timeEstimate: task.timeEstimate || 30,
        dueDate: task.dueDate || '',
        notes: task.notes || '',
        alerts: task.alerts || [],
        repeat: task.repeat || { type: 'none', label: 'None', days: [] },
        date: task.date ? new Date(task.date) : new Date(),
        startTime: formatTime(sTime),
        endTime: formatTime(eTime)
      });
      setPlanEditShowTime(false);
      setPlanEditShowAlerts(false);
      setPlanEditShowDate(false);
      setPlanEditShowRepeat(false);
      setPlanEditShowIconPicker(false);
      setPlanEditingTask(task);
      setPlanEditingTaskProject(project);
    };

    const savePlanTask = () => {
      if (!planTaskData.title.trim() || !planEditingTaskProject) return;

      const sDate = new Date(planTaskData.date);
      const [sh, sm] = planTaskData.startTime.split(':').map(Number);
      sDate.setHours(sh, sm, 0, 0);

      const eDate = new Date(planTaskData.date);
      const [eh, em] = planTaskData.endTime.split(':').map(Number);
      eDate.setHours(eh, em, 0, 0);

      const updates = {
        title: planTaskData.title,
        icon: planTaskData.icon,
        value: planTaskData.value,
        energy: planTaskData.energy,
        timeEstimate: planTaskData.timeEstimate,
        notes: planTaskData.notes,
        alerts: planTaskData.alerts,
        repeat: planTaskData.repeat,
        date: planTaskData.date instanceof Date ? planTaskData.date.toISOString() : planTaskData.date,
        startTime: sDate.toISOString(),
        endTime: eDate.toISOString()
      };

      updateProjectTask(planEditingTaskProject.id, planEditingTask.id, updates);
      setPlanEditingTask(null);
      setPlanEditingTaskProject(null);
    };

    const closePlanTaskModal = () => {
      setPlanEditingTask(null);
      setPlanEditingTaskProject(null);
    };

    const iconOptions = [
      '📌', '📧', '💪', '📝', '📞', '📚', '🧘', '🎯', '💼', '🏃',
      '🍎', '💡', '🎨', '🎵', '📊', '🛒', '🏠', '💰', '✈️', '🎮',
      '🧹', '👥', '📱', '💻', '🔧', '📦', '🎁', '❤️', '⭐', '🔔'
    ];

    // Open reminder for editing
    const openReminderEdit = (reminder) => {
      setPlanEditingReminder(reminder);
      setEditReminderName(reminder.name);
      setEditReminderIcon(reminder.icon);
      setEditReminderEnergy(reminder.energy || 'medium');
      setEditReminderValue(reminder.value || 5);
      setEditReminderNotes(reminder.notes || '');

      // Initialize new fields with defaults or existing values
      setEditReminderAlerts(reminder.alerts || []);
      setEditReminderRepeat(reminder.repeat || { type: 'none', label: 'None', days: [] });
      setEditReminderDate(reminder.date ? new Date(reminder.date) : new Date());

      if (reminder.startTime) {
        setEditReminderStartHour(new Date(reminder.startTime).getHours());
        setEditReminderStartMinute(new Date(reminder.startTime).getMinutes());
      } else {
        setEditReminderStartHour(9);
        setEditReminderStartMinute(0);
      }

      if (reminder.endTime) {
        setEditReminderEndHour(new Date(reminder.endTime).getHours());
        setEditReminderEndMinute(new Date(reminder.endTime).getMinutes());
      } else {
        setEditReminderEndHour(10);
        setEditReminderEndMinute(0);
      }

      setEditReminderShowTime(false);
      setEditReminderShowAlerts(false);
      setEditReminderShowDate(false);
      setEditReminderShowRepeat(false);
      setEditReminderShowIconPicker(false);
    };

    // Save reminder edits
    const saveReminderEdit = () => {
      if (!planEditingReminder || !editReminderName.trim()) return;

      setReminders(prev => prev.map(r => {
        if (r.id === planEditingReminder.id) {
          // specific handling for saving start/end time.
          const sTime = new Date(editReminderDate);
          sTime.setHours(editReminderStartHour, editReminderStartMinute, 0, 0);

          const eTime = new Date(editReminderDate);
          eTime.setHours(editReminderEndHour, editReminderEndMinute, 0, 0);

          const updatedData = {
            name: editReminderName.trim(),
            icon: editReminderIcon,
            energy: editReminderEnergy,
            alerts: editReminderAlerts,
            repeat: editReminderRepeat,
            date: editReminderDate.toISOString(),
            startTime: sTime.toISOString(),
            endTime: eTime.toISOString(),
            value: editReminderValue,
            notes: editReminderNotes,
            isVirtual: false
          };

          setReminders(prev => {
            if (planEditingReminder.isVirtual) {
              return [{ ...planEditingReminder, ...updatedData, id: Date.now() }, ...prev];
            } else {
              return prev.map(r => r.id === planEditingReminder.id ? { ...r, ...updatedData } : r);
            }
          });
        }
        return r;
      }));

      setPlanEditingReminder(null);
    };

    // Delete reminder
    const deleteReminder = (reminderId) => {
      setReminders(prev => prev.filter(r => r.id !== reminderId));
      setPlanEditingReminder(null);
    };

    const createReminder = () => {
      if (!newReminderName.trim()) return;

      const newReminder = {
        id: Date.now(),
        icon: newReminderIcon,
        name: newReminderName.trim(),
        energy: newReminderEnergy
      };

      setReminders(prev => [...prev, newReminder]);
      setNewReminderName('');
      setNewReminderIcon('📌');
      setNewReminderEnergy('medium');
      setPlanShowNewReminder(false);
    };

    const totalMinutes = priorities.reduce((sum, p) => {
      if (!p.task) return sum;
      return sum + parseTime(p.time);
    }, 0);

    const highEnergyCount = priorities.filter(p => p.energy === 'high').length;
    const energyLoad = highEnergyCount === 0 ? 'Light' : highEnergyCount === 1 ? 'Moderate' : highEnergyCount === 2 ? 'Heavy' : 'Very Heavy';

    const formatTotalTime = (mins) => {
      const h = Math.floor(mins / 60);
      const m = mins % 60;
      if (h === 0) return `${m}m`;
      if (m === 0) return `${h}h`;
      return `${h}h ${m}m`;
    };

    // Week navigation state
    const [weekOffset, setWeekOffset] = useState(0);
    const [showMonthPicker, setShowMonthPicker] = useState(false);

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
        const dateKey = getDateKey(date);
        const dayPlan = plansByDate[dateKey];
        const hasTasks = dayPlan && dayPlan.priorities?.some(p => p.task);

        const todayDate = new Date();
        todayDate.setHours(0, 0, 0, 0);
        const selectedDate = new Date(selectedPlanDate);
        selectedDate.setHours(0, 0, 0, 0);

        // Get project timelines for this date
        const dateStr = date.toISOString().split('T')[0];
        const projectTimelines = projects.filter(p => {
          if (!p.startDate && !p.endDate) return false;
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
          color: p.color || '#8b5cf6',
          isStart: p.startDate === dateStr,
          isEnd: p.endDate === dateStr
        }));

        days.push({
          dayName: date.toLocaleDateString('en-US', { weekday: 'short' }),
          dayNum: date.getDate(),
          isToday: date.getTime() === todayDate.getTime(),
          isSelected: date.getTime() === selectedDate.getTime(),
          date: new Date(date),
          hasTasks: hasTasks,
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

      // Add empty slots for days before the first of the month
      const startOffset = startDay === 0 ? 6 : startDay - 1; // Monday start
      for (let i = 0; i < startOffset; i++) {
        days.push(null);
      }

      // Add all days of the month
      const todayDate = new Date();
      todayDate.setHours(0, 0, 0, 0);
      const selectedDate = new Date(selectedPlanDate);
      selectedDate.setHours(0, 0, 0, 0);

      for (let i = 1; i <= daysInMonth; i++) {
        const date = new Date(year, month, i);
        date.setHours(0, 0, 0, 0);
        const dateKey = getDateKey(date);
        const dayPlan = plansByDate[dateKey];

        // Get project timelines for this date - use string comparison for reliability
        const dateStr = date.toISOString().split('T')[0];
        const projectTimelines = projects.filter(p => {
          if (!p.startDate && !p.endDate) return false;
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
          color: p.color || '#8b5cf6',
          isStart: p.startDate === dateStr,
          isEnd: p.endDate === dateStr
        }));

        days.push({
          dayNum: i,
          date: date,
          isToday: date.getTime() === todayDate.getTime(),
          isSelected: date.getTime() === selectedDate.getTime(),
          hasTasks: dayPlan && dayPlan.priorities?.some(p => p.task),
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
        return firstDay.toLocaleDateString('en-US', { month: 'long', year: 'numeric' });
      } else {
        return `${firstDay.toLocaleDateString('en-US', { month: 'short' })} - ${lastDay.toLocaleDateString('en-US', { month: 'short', year: 'numeric' })}`;
      }
    };

    const goToPreviousWeek = () => setWeekOffset(prev => prev - 1);
    const goToNextWeek = () => setWeekOffset(prev => prev + 1);
    const goToToday = () => {
      setWeekOffset(0);
      setSelectedPlanDate(getToday());
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
      setSelectedPlanDate(date);
      setShowMonthPicker(false);
    };

    const changeMonth = (delta) => {
      setWeekOffset(prev => prev + (delta * 4)); // Roughly 4 weeks per month
    };

    const selectDay = (date) => {
      setSelectedPlanDate(new Date(date));
    };

    return (
      <div className="pb-28 animate-fadeIn">
        {/* Header - Centered Apple Style */}
        <div className="mb-6 text-center">
          <p className="text-purple-400/80 text-xs font-medium uppercase tracking-widest mb-2">
            {selectedPlanDate.toLocaleDateString(currentLocale, { month: 'long', day: 'numeric' })}
          </p>
          <h1 className="text-3xl font-semibold text-white tracking-tight">
            {selectedPlanDate.toDateString() === today.toDateString()
              ? t('plan.greeting', { name: username })
              : selectedPlanDate.toLocaleDateString(currentLocale, { weekday: 'long' })}
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

        {/* Month Picker Dropdown with Notion-style Timeline */}
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
                {selectedPlanDate.toLocaleDateString(currentLocale, { month: 'long', year: 'numeric' })}
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
                                const dayTime = day.date.getTime();
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
                                    onClick={(e) => {
                                      e.stopPropagation();
                                      setActiveTab('projects');
                                      setTimeout(() => setSelectedProject(project), 100);
                                    }}
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
        )
        }

        {/* Week Calendar with Notion-style Project Timelines */}
        {
          (() => {
            // Get projects with dates for timeline
            const projectsWithDates = projects.filter(p => p.startDate && p.endDate && (p.status === 'active' || p.status === 'not-started'));
            const weekStart = weekDays[0]?.date;
            const weekEnd = weekDays[6]?.date;
            const weekStartStr = weekStart?.toISOString().split('T')[0] || '';
            const weekEndStr = weekEnd?.toISOString().split('T')[0] || '';

            // Filter projects that overlap with current week
            const visibleProjects = projectsWithDates.filter(p => {
              return p.endDate >= weekStartStr && p.startDate <= weekEndStr;
            });

            return (
              <div className={`mb-6 glass-card rounded-2xl overflow-hidden transition-all duration-200 ${isDragging && draggedItem?.type === 'p' ? 'ring-2 ring-purple-400/50 bg-purple-500/5' : ''
                }`}>
                {/* Day Headers Row */}
                <div className="flex border-b border-white/10">
                  {weekDays.map((day, idx) => {
                    const isDragOverThisDay = isDragging && planDragOverDay?.getTime() === day.date.getTime();
                    const isCurrentDay = day.date.getTime() === selectedPlanDate.getTime();
                    const canDrop = isDragging && draggedItem?.type === 'p' && !isCurrentDay;

                    return (
                      <button
                        key={idx}
                        onClick={() => !isDragging && selectDay(day.date)}
                        onMouseEnter={() => canDrop && setPlanDragOverDay(day.date)}
                        onMouseLeave={() => isDragging && setPlanDragOverDay(null)}
                        className={`flex-1 flex flex-col items-center py-3 px-1 transition-all duration-200 border-r border-white/5 last:border-r-0
                        ${isDragOverThisDay
                            ? 'bg-purple-500/40'
                            : day.isSelected
                              ? 'bg-gradient-to-b from-purple-500/30 to-indigo-600/20'
                              : day.isToday
                                ? 'bg-white/5'
                                : canDrop
                                  ? 'hover:bg-purple-500/20'
                                  : 'hover:bg-white/5'}`}
                      >
                        <span className={`text-[10px] font-medium uppercase tracking-wide ${isDragOverThisDay
                          ? 'text-purple-200'
                          : day.isSelected
                            ? 'text-purple-300'
                            : day.isToday
                              ? 'text-purple-400'
                              : 'text-slate-500'
                          }`}>
                          {day.dayName}
                        </span>
                        <span className={`text-lg font-semibold ${isDragOverThisDay
                          ? 'text-white'
                          : day.isSelected
                            ? 'text-white'
                            : day.isToday
                              ? 'text-purple-300'
                              : 'text-slate-300'
                          }`}>
                          {day.dayNum}
                        </span>
                        {/* Task indicator dot */}
                        {day.hasTasks && (
                          <div className={`w-1.5 h-1.5 rounded-full mt-1 ${day.isSelected ? 'bg-white' : 'bg-purple-400'}`}></div>
                        )}
                      </button>
                    );
                  })}
                </div>

                {/* Project Timeline Bars */}
                {visibleProjects.length > 0 && (
                  <div className="p-2 space-y-1">
                    {visibleProjects.map(project => {
                      const projectColor = project.color || '#8b5cf6';
                      const startDate = new Date(project.startDate);
                      const endDate = new Date(project.endDate);
                      startDate.setHours(0, 0, 0, 0);
                      endDate.setHours(0, 0, 0, 0);

                      // Calculate which days of the week this project spans
                      let startIdx = -1;
                      let endIdx = -1;

                      weekDays.forEach((day, idx) => {
                        const dayTime = day.date.getTime();
                        if (dayTime >= startDate.getTime() && dayTime <= endDate.getTime()) {
                          if (startIdx === -1) startIdx = idx;
                          endIdx = idx;
                        }
                      });

                      // If project starts before this week
                      if (startDate < weekStart && endDate >= weekStart) startIdx = 0;
                      // If project ends after this week
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
                            onClick={() => {
                              setActiveTab('projects');
                              setTimeout(() => setSelectedProject(project), 100);
                            }}
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

        {/* Drag hint when dragging tasks */}
        {
          isDragging && draggedItem?.type === 'p' && (
            <div className="mb-4 text-center">
              <span className="text-purple-400/80 text-xs font-medium px-3 py-1.5 rounded-full bg-purple-500/10 border border-purple-500/20">
                ↑ Drop on a day to move task
              </span>
            </div>
          )
        }

        {/* Projects & Reminders Quick Access Grid */}
        <div className="grid grid-cols-2 gap-3 mb-6">
          <button
            onClick={() => {
              setProjectsExpanded(!projectsExpanded);
              if (remindersExpanded) setRemindersExpanded(false);
            }}
            className="glass-card rounded-2xl p-4 flex items-center gap-3 hover:bg-white/10 transition-all text-left"
            style={{
              background: 'linear-gradient(135deg, rgba(6,182,212,0.1) 0%, rgba(59,130,246,0.1) 100%)',
              backdropFilter: 'blur(10px)',
              border: '1px solid rgba(6,182,212,0.2)'
            }}
          >
            <div className="w-10 h-10 rounded-xl flex items-center justify-center bg-cyan-500/20">
              <span className="text-xl">📁</span>
            </div>
            <div className="flex-1 min-w-0">
              <span className="text-white font-medium block truncate">{t('plan.projects')}</span>
              <p className="text-cyan-400/70 text-[11px]">{projects.filter(p => p.status === 'active').length} active</p>
            </div>
            <svg className={`w-4 h-4 text-cyan-400 transition-transform duration-300 ${projectsExpanded ? 'rotate-180' : ''}`} fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
            </svg>
          </button>

          <button
            onClick={() => {
              setRemindersExpanded(!remindersExpanded);
              if (projectsExpanded) setProjectsExpanded(false);
            }}
            className="glass-card rounded-2xl p-4 flex items-center gap-3 hover:bg-white/10 transition-all text-left"
            style={{
              background: 'linear-gradient(135deg, rgba(168,85,247,0.1) 0%, rgba(236,72,153,0.1) 100%)',
              backdropFilter: 'blur(10px)',
              border: '1px solid rgba(168,85,247,0.2)'
            }}
          >
            <div className="w-10 h-10 rounded-xl flex items-center justify-center bg-purple-500/20">
              <span className="text-xl">💡</span>
            </div>
            <div className="flex-1 min-w-0">
              <span className="text-white font-medium block truncate">{t('plan.reminders')}</span>
              <p className="text-purple-400/70 text-[11px]">{reminders.length} items</p>
            </div>
            <svg className={`w-4 h-4 text-purple-400 transition-transform duration-300 ${remindersExpanded ? 'rotate-180' : ''}`} fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
            </svg>
          </button>
        </div>

        {/* Expanded Projects List */}
        <div className={`space-y-2 overflow-hidden transition-all duration-300 mb-6 ${projectsExpanded ? 'max-h-[1200px] opacity-100' : 'max-h-0 opacity-0'}`}>
          {projects.filter(p => p.status === 'active' || p.status === 'not-started').map(project => {
            const progress = getProjectProgress(project);
            const pendingTasks = project.tasks?.filter(t => !t.completed) || [];
            const isExpanded = expandedProjectId === project.id;

            return (
              <div key={project.id} className="rounded-2xl overflow-hidden"
                style={{
                  background: 'linear-gradient(135deg, rgba(255,255,255,0.05) 0%, rgba(255,255,255,0.02) 100%)',
                  backdropFilter: 'blur(10px)',
                  border: '1px solid rgba(255,255,255,0.1)'
                }}>
                <button
                  onClick={() => setExpandedProjectId(isExpanded ? null : project.id)}
                  className="w-full p-4 flex items-center gap-3 hover:bg-white/5 transition-all"
                >
                  <div className={`w-5 h-5 rounded-lg bg-cyan-500/20 flex items-center justify-center transition-transform duration-300 ${isExpanded ? 'rotate-90' : ''}`}>
                    <svg className="w-3 h-3 text-cyan-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                    </svg>
                  </div>
                  <div className="flex-1 text-left">
                    <div className="flex items-center gap-2">
                      <span className="text-white font-medium">{project.title}</span>
                      <span className="text-cyan-400 text-xs">{progress}%</span>
                    </div>
                    <div className="h-1.5 bg-white/10 rounded-full mt-1.5 overflow-hidden">
                      <div
                        className="h-full rounded-full"
                        style={{
                          width: `${progress}%`,
                          background: 'linear-gradient(90deg, rgba(6,182,212,0.8) 0%, rgba(139,92,246,0.8) 100%)'
                        }}
                      />
                    </div>
                  </div>
                  <span className="text-slate-500 text-xs">{pendingTasks.length} {t('common.tasks').toLowerCase()}</span>
                </button>

                <div className={`overflow-hidden transition-all duration-300 ${isExpanded ? 'max-h-[600px]' : 'max-h-0'}`}>
                  <div className="px-4 pb-4 space-y-2">
                    {pendingTasks
                      .filter(task => {
                        return !priorities.some(p => p.task && (p.task.id === task.id || p.task.projectTaskId === task.id));
                      })
                      .map(task => (
                        <div
                          key={task.id}
                          onClick={() => openPlanTaskEdit(task, project)}
                          className="flex items-center justify-between p-3 rounded-xl
                    hover:bg-white/10 transition-all duration-200 cursor-pointer select-none hover:scale-[1.01]"
                          style={{ background: 'rgba(255,255,255,0.03)' }}
                        >
                          <div className="flex items-center gap-3">
                            <div className="text-slate-500">
                              <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                              </svg>
                            </div>
                            <div>
                              <span className="text-slate-200 font-medium text-sm">{task.title}</span>
                              <div className="flex items-center gap-2 mt-0.5">
                                <span className={`text-xs px-1.5 py-0.5 rounded ${task.energy === 'high' ? 'bg-rose-500/20 text-rose-400' :
                                  task.energy === 'medium' ? 'bg-amber-500/20 text-amber-400' :
                                    'bg-emerald-500/20 text-emerald-400'
                                  }`}>
                                  {task.energy}
                                </span>
                                <span className="text-slate-500 text-xs">{t('common.impact')}: {task.value}</span>
                              </div>
                            </div>
                          </div>
                          <button
                            onClick={(e) => {
                              e.stopPropagation();
                              if (priorities.some(p => p.task && p.task.projectTaskId === task.id)) return;

                              const taskToAdd = {
                                id: Date.now(),
                                icon: '📋',
                                name: task.title,
                                energy: task.energy,
                                time: task.timeEstimate,
                                projectId: project.id,
                                projectTaskId: task.id,
                                projectTitle: project.title
                              };
                              const emptySlotIndex = priorities.findIndex(p => !p.task);
                              if (emptySlotIndex !== -1) {
                                const newPriorities = [...priorities];
                                newPriorities[emptySlotIndex] = {
                                  ...newPriorities[emptySlotIndex],
                                  task: taskToAdd,
                                  energy: task.energy,
                                  time: task.timeEstimate
                                };
                                setPriorities(newPriorities);
                              }
                            }}
                            className="w-7 h-7 rounded-lg bg-cyan-500/30 text-cyan-300 flex items-center justify-center hover:bg-cyan-500/50 hover:scale-105 transition-all duration-200"
                          >
                            <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M12 4v16m8-8H4" />
                            </svg>
                          </button>
                        </div>
                      ))}
                    {pendingTasks.length === 0 && (
                      <div className="text-center py-3 text-slate-500 text-sm">
                        {t('plan.allTasksCompleted')}
                      </div>
                    )}
                  </div>
                </div>
              </div>
            );
          })}

          <button
            onClick={() => setActiveTab('projects')}
            className="w-full p-3.5 rounded-2xl border border-dashed border-white/20 text-slate-500 
        hover:border-cyan-500/50 hover:text-cyan-400 hover:bg-cyan-500/10 
        transition-all duration-200 flex items-center justify-center gap-2"
          >
            <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10" />
            </svg>
            <span className="font-medium">{t('plan.manageProjects')}</span>
          </button>
        </div>

        {/* Expanded Reminders List */}
        <div className={`space-y-2 overflow-hidden transition-all duration-300 mb-8 ${remindersExpanded ? 'max-h-[1200px] opacity-100' : 'max-h-0 opacity-0'}`}>
          {getResolvedRemindersForDate(selectedExecuteDate)
            .filter(reminder => {
              if (reminder.completed) return false;
              return !priorities.some(p => p.task && (p.task.id === reminder.id || p.task.originalReminderId === reminder.id));
            })
            .map(reminder => (
              <div
                key={reminder.id}
                onClick={() => openReminderEdit(reminder)}
                className="flex items-center justify-between p-3.5 rounded-2xl
          hover:bg-white/10 transition-all duration-200 cursor-pointer select-none hover:scale-[1.01]"
                style={{
                  background: 'linear-gradient(135deg, rgba(255,255,255,0.05) 0%, rgba(255,255,255,0.02) 100%)',
                  backdropFilter: 'blur(10px)',
                  border: '1px solid rgba(255,255,255,0.1)'
                }}
              >
                <div className="flex items-center gap-3">
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      const updatedReminders = reminders.map(r =>
                        r.id === reminder.id ? { ...r, completed: true } : r
                      );
                      setReminders(updatedReminders);
                      saveToStorage('reminders', updatedReminders);
                    }}
                    className="w-6 h-6 rounded-full border-2 border-purple-400 flex items-center justify-center hover:bg-purple-500/20 transition-all flex-shrink-0"
                  >
                  </button>

                  <span className="text-xl">{reminder.icon}</span>
                  <span className="text-slate-200 font-medium flex-1 truncate">{reminder.name}</span>
                  <EnergyBadge energy={reminder.energy} t={t} />
                </div>
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    addToNextSlot(reminder);
                  }}
                  className="w-8 h-8 rounded-xl text-purple-300 flex items-center justify-center hover:scale-105 transition-all duration-200 ml-2"
                  style={{ background: 'linear-gradient(135deg, rgba(168,85,247,0.3) 0%, rgba(236,72,153,0.3) 100%)' }}
                >
                  <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M12 4v16m8-8H4" />
                  </svg>
                </button>
              </div>
            ))}

          {/* New Reminder Button */}
          <button
            onClick={() => openGlobalTaskModal('reminder')}
            className="w-full p-3.5 rounded-2xl text-slate-500 hover:text-purple-400 transition-all duration-200 flex items-center justify-center gap-2"
            style={{
              background: 'transparent',
              border: '1px dashed rgba(168,85,247,0.3)'
            }}
          >
            <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
            </svg>
            <span className="font-medium">{t('plan.newReminder')}</span>
          </button>

          {/* Completed Reminders */}
          {(() => {
            const completedReminders = reminders.filter(r => r.completed);
            if (completedReminders.length === 0) return null;

            return (
              <div className="mt-4">
                <h3 className="text-slate-400 text-sm font-medium mb-3 uppercase tracking-wider">{t('plan.completed')}</h3>
                <div className="space-y-2">
                  {completedReminders.map(reminder => (
                    <div
                      key={reminder.id}
                      onClick={() => openReminderEdit(reminder)}
                      className="flex items-center justify-between p-3.5 rounded-2xl opacity-60 cursor-pointer hover:opacity-80 transition-all"
                      style={{
                        background: 'linear-gradient(135deg, rgba(255,255,255,0.05) 0%, rgba(255,255,255,0.02) 100%)',
                        backdropFilter: 'blur(10px)',
                        border: '1px solid rgba(255,255,255,0.1)'
                      }}
                    >
                      <div className="flex items-center gap-3 flex-1">
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            const updatedReminders = reminders.map(r =>
                              r.id === reminder.id ? { ...r, completed: false } : r
                            );
                            setReminders(updatedReminders);
                            saveToStorage('reminders', updatedReminders);
                          }}
                          className="w-6 h-6 rounded-full bg-purple-500 flex items-center justify-center flex-shrink-0"
                        >
                          <svg className="w-4 h-4 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                          </svg>
                        </button>
                        <span className="text-xl opacity-50">{reminder.icon}</span>
                        <span className="text-slate-400 font-medium line-through flex-1 truncate">{reminder.name}</span>
                      </div>
                      <svg className="w-5 h-5 text-slate-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                      </svg>
                    </div>
                  ))}
                </div>
              </div>
            );
          })()}
        </div>

        {/* Priorities */}
        <div className="mb-8">
          <h2 className="text-center text-sm font-medium text-slate-400 uppercase tracking-widest mb-4">
            {priorities.length <= 3 ? t('plan.topPriorities') : t('plan.todaysTasks', { count: priorities.length })}
          </h2>
          <div className="space-y-3">
            {priorities.map((priority, idx) => (
              <div
                key={idx}
                onMouseDown={(e) => priority.task && startDrag(e, 'p', idx)}
                onMouseEnter={() => handleSlotMouseEnter('p', idx)}
                onMouseLeave={handleSlotMouseLeave}
                onClick={() => !isDragging && openGlobalTaskModal('priority', idx, priority.task)}
                className={`p-4 glass-card rounded-2xl transition-all duration-200 ease-out select-none
            ${priority.task ? 'ring-1 ring-purple-500/30 cursor-grab active:cursor-grabbing' : 'cursor-pointer hover:bg-white/10 hover:scale-[1.01]'}
            ${isDragging && dragOverSlot?.type === 'p' && dragOverSlot?.index === idx
                    ? 'ring-2 ring-purple-400 scale-[1.02] bg-purple-500/20 shadow-lg shadow-purple-500/20'
                    : ''}
            ${isDragging && draggedItem?.type === 'p' && draggedItem?.index === idx ? 'opacity-40 scale-[0.98]' : ''}`}
              >
                {priority.task ? (
                  <div className="flex items-center gap-3">
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        const newPriorities = [...priorities];
                        newPriorities[idx] = {
                          ...priority,
                          task: { ...priority.task, completed: true }
                        };
                        setPriorities(newPriorities);

                        if (priority.task.originalReminderId) {
                          const updatedReminders = reminders.map(r =>
                            r.id === priority.task.originalReminderId ? { ...r, completed: true } : r
                          );
                          setReminders(updatedReminders);
                          saveToStorage('reminders', updatedReminders);
                        }

                        if (priority.task.projectId && priority.task.projectTaskId) {
                          toggleProjectTask(priority.task.projectId, priority.task.projectTaskId);
                        }
                      }}
                      className="w-6 h-6 rounded-full border-2 border-purple-400 flex items-center justify-center hover:bg-purple-500/20 transition-all flex-shrink-0"
                    >
                    </button>

                    <span className="text-xl">{priority.task.icon}</span>
                    <span className="text-slate-200 font-medium flex-1 truncate">{priority.task.name}</span>

                    <div onMouseDown={(e) => e.stopPropagation()}>
                      <EnergyBadge
                        energy={priority.energy}
                        onClick={() => {
                          const energies = ['low', 'medium', 'high'];
                          const currentIdx = energies.indexOf(priority.energy || 'medium');
                          const nextIdx = (currentIdx + 1) % 3;
                          const newP = [...priorities];
                          newP[idx].energy = energies[nextIdx];
                          setPriorities(newP);
                        }}
                        t={t}
                      />
                    </div>

                    <div className="flex items-center gap-2" onMouseDown={(e) => e.stopPropagation()}>
                      <TimeDropdown
                        value={priority.time}
                        onChange={(val) => {
                          const newP = [...priorities];
                          newP[idx].time = val;
                          setPriorities(newP);
                        }}
                        t={t}
                      />
                      <button
                        onClick={() => {
                          setReminders(prev => [...prev, priority.task]);
                          const newP = [...priorities];
                          newP[idx] = { slot: idx + 1, task: null, energy: null, time: null };
                          setPriorities(newP);
                        }}
                        className="w-8 h-8 rounded-lg text-slate-500 hover:text-rose-400 hover:bg-rose-500/20 flex items-center justify-center transition-all"
                      >
                        <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                        </svg>
                      </button>
                    </div>
                  </div>
                ) : (
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-purple-500/20 to-indigo-600/20 border border-purple-500/30 flex items-center justify-center">
                      <span className="text-purple-400 text-sm font-bold">{idx + 1}</span>
                    </div>
                    <span className="text-slate-500">{t('plan.tapToAddTask')}</span>
                    <div className="flex-1"></div>
                    <div className="w-9 h-9 rounded-xl bg-white/10 text-slate-400 flex items-center justify-center">
                      <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
                      </svg>
                    </div>
                  </div>
                )}
              </div>
            ))}

            {/* Add More Task Button */}
            <button
              onClick={addPrioritySlot}
              className="w-full p-3 rounded-2xl border border-dashed border-white/20 hover:border-purple-500/50 hover:bg-purple-500/10 transition-all flex items-center justify-center gap-2 text-slate-400 hover:text-purple-400"
            >
              <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
              </svg>
              <span className="text-sm font-medium">{t('common.add')} {t('common.task')} #{priorities.length + 1}</span>
            </button>
          </div>
        </div>

        {/* Summary Card - Glass */}
        <div className="glass-card rounded-3xl p-6 text-white">
          <div className="absolute inset-0 rounded-3xl bg-gradient-to-br from-purple-500/20 to-indigo-500/20 pointer-events-none"></div>
          <h3 className="text-lg font-semibold mb-4 text-slate-200">{t('plan.daySummary')}</h3>
          <div className="grid grid-cols-2 gap-6">
            <div>
              <p className="text-slate-400 text-sm mb-1">{t('plan.timeBudget')}</p>
              <p className="text-3xl font-bold text-gradient">{formatTotalTime(totalMinutes)}</p>
            </div>
            <div>
              <p className="text-slate-400 text-sm mb-1">{t('plan.energyLoad')}</p>
              <p className="text-3xl font-bold text-gradient">{energyLoad}</p>
            </div>
          </div>
        </div>

        {/* Drag Preview - Smooth floating */}
        {
          isDragging && draggedItem && (
            <div
              className="fixed pointer-events-none z-50 transition-transform duration-75 ease-out"
              style={{
                left: dragPosition.x,
                top: dragPosition.y,
                transform: 'translate(-50%, -50%) rotate(3deg) scale(1.05)'
              }}
            >
              <div
                className="flex items-center gap-3 px-5 py-3.5 rounded-2xl shadow-2xl animate-popIn"
                style={{
                  background: 'linear-gradient(135deg, rgba(139,92,246,0.3) 0%, rgba(99,102,241,0.3) 100%)',
                  backdropFilter: 'blur(20px)',
                  border: '2px solid rgba(139,92,246,0.6)',
                  boxShadow: '0 20px 40px rgba(139,92,246,0.3), 0 0 30px rgba(139,92,246,0.2)'
                }}
              >
                <span className="text-2xl drop-shadow-lg">
                  {draggedItem.type === 'reminder'
                    ? draggedItem.reminder?.icon
                    : priorities[draggedItem.index]?.task?.icon}
                </span>
                <span className="text-white font-semibold text-sm max-w-40 truncate drop-shadow">
                  {draggedItem.type === 'reminder'
                    ? draggedItem.reminder?.name
                    : priorities[draggedItem.index]?.task?.name}
                </span>
              </div>
            </div>
          )
        }

        {/* Edit Reminder Modal */}
        {
          planEditingReminder && (
            <div className="fixed inset-0 z-50 flex items-end justify-center animate-fadeIn">
              <div
                className="absolute inset-0 bg-black/60 backdrop-blur-sm"
                onClick={() => setPlanEditingReminder(null)}
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
                      onClick={() => setPlanEditingReminder(null)}
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
                        onClick={() => setEditReminderShowIconPicker(!editReminderShowIconPicker)}
                        className="w-12 h-12 rounded-xl bg-white/5 border border-white/10 flex items-center justify-center text-2xl hover:bg-white/10 transition-colors"
                      >
                        {editReminderIcon}
                      </button>
                      <input
                        type="text"
                        value={editReminderName}
                        onChange={(e) => setEditReminderName(e.target.value)}
                        placeholder={t('placeholders.reminder')}
                        className="flex-1 px-4 py-3 bg-white/5 border border-white/10 rounded-xl text-white placeholder:text-slate-500 outline-none focus:border-purple-500/50"
                      />
                    </div>

                    {/* Icon Picker (Conditional) */}
                    {editReminderShowIconPicker && (
                      <div className="mt-4 p-4 rounded-xl bg-white/5 border border-white/5 animate-fadeIn">
                        <div className="flex flex-wrap gap-2">
                          {globalIconOptions.map(icon => (
                            <button
                              key={icon}
                              onClick={() => {
                                setEditReminderIcon(icon);
                                setEditReminderShowIconPicker(false);
                              }}
                              className={`w-10 h-10 rounded-lg flex items-center justify-center text-xl transition-colors
                              ${editReminderIcon === icon ? 'bg-purple-500/20 text-purple-400' : 'hover:bg-white/10'}`}
                            >
                              {icon}
                            </button>
                          ))}
                        </div>
                      </div>
                    )}
                  </div>

                  {/* Details List (iOS Style) - Moved Up */}
                  <TaskDetailsList
                    date={editReminderDate}
                    startTime={`${editReminderStartHour}:${editReminderStartMinute.toString().padStart(2, '0')}`}
                    endTime={`${editReminderEndHour}:${editReminderEndMinute.toString().padStart(2, '0')}`}
                    alerts={editReminderAlerts}
                    onDateClick={() => {
                      setEditReminderShowDate(!editReminderShowDate);
                      setEditReminderShowTime(false);
                      setEditReminderShowAlerts(false);
                      setEditReminderShowRepeat(false);
                    }}
                    onTimeClick={() => {
                      setEditReminderShowTime(!editReminderShowTime);
                      setEditReminderShowAlerts(false);
                      setEditReminderShowDate(false);
                      setEditReminderShowRepeat(false);
                    }}
                    onAlertsClick={() => {
                      setEditReminderShowAlerts(!editReminderShowAlerts);
                      setEditReminderShowTime(false);
                      setEditReminderShowDate(false);
                      setEditReminderShowRepeat(false);
                    }}
                    onRepeatClick={() => {
                      setEditReminderShowRepeat(!editReminderShowRepeat);
                      setEditReminderShowAlerts(false);
                      setEditReminderShowTime(false);
                      setEditReminderShowDate(false);
                    }}
                    themeColor="purple"
                    showDatePicker={editReminderShowDate}
                    onDateChange={(date) => {
                      setEditReminderDate(date);
                      setEditReminderShowDate(false);
                    }}
                    showTimePicker={editReminderShowTime}
                    onStartTimeChange={({ hour, minute }) => {
                      setEditReminderStartHour(hour);
                      setEditReminderStartMinute(minute);
                    }}
                    onEndTimeChange={({ hour, minute }) => {
                      setEditReminderEndHour(hour);
                      setEditReminderEndMinute(minute);
                    }}
                    repeat={editReminderRepeat}
                    showRepeatPicker={editReminderShowRepeat}
                    onRepeatChange={(repeat) => setEditReminderRepeat(repeat)}
                    t={t}
                    locale={currentLocale}
                  />


                  {/* Alerts Picker (Collapsible) */}
                  {editReminderShowAlerts && (
                    <div className="mb-6 p-4 rounded-2xl bg-white/5 border border-white/5 animate-fadeIn">
                      <label className="text-xs font-medium text-slate-400 uppercase tracking-wide mb-3 block">Manage Alerts</label>
                      <div className="space-y-2">
                        {editReminderAlerts.map((alert, index) => (
                          <div key={index} className="flex items-center justify-between p-3 rounded-xl bg-white/5 border border-white/5">
                            <span className="text-sm text-slate-200">{alert.label}</span>
                            <button
                              onClick={() => setEditReminderAlerts(editReminderAlerts.filter((_, i) => i !== index))}
                              className="text-rose-400 hover:text-rose-300 p-1"
                            >
                              <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                              </svg>
                            </button>
                          </div>
                        ))}
                        <div className="pt-2 grid grid-cols-3 gap-2">
                          {globalAlertOptions.map(opt => (
                            <button
                              key={opt.label}
                              onClick={() => {
                                if (!editReminderAlerts.some(a => a.value === opt.value)) {
                                  setEditReminderAlerts([...editReminderAlerts, opt]);
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
                    <label className="text-slate-400 text-sm mb-2 block">Impact Value: {editReminderValue || 5}/10</label>
                    <input
                      type="range"
                      min="1"
                      max="10"
                      value={editReminderValue || 5}
                      onChange={(e) => setEditReminderValue(parseInt(e.target.value))}
                      className="w-full accent-purple-500"
                    />
                  </div>

                  {/* Energy */}
                  <div className="mb-6">
                    <label className="text-slate-400 text-sm mb-2 block">Energy Required</label>
                    <div className="grid grid-cols-3 gap-2">
                      {['low', 'medium', 'high'].map(level => (
                        <button
                          key={level}
                          onClick={() => setEditReminderEnergy(level)}
                          className={`py-2.5 px-3 rounded-xl text-sm font-medium capitalize transition-all ${editReminderEnergy === level
                            ? level === 'high' ? 'bg-rose-500/30 text-rose-300 ring-2 ring-rose-500/50' :
                              level === 'medium' ? 'bg-amber-500/30 text-amber-300 ring-2 ring-amber-500/50' :
                                'bg-emerald-500/30 text-emerald-300 ring-2 ring-emerald-500/50'
                            : 'bg-white/5 text-slate-400'
                            }`}
                        >
                          {level}
                        </button>
                      ))}
                    </div>
                  </div>

                  {/* Notes */}
                  <div className="mb-4">
                    <label className="text-slate-400 text-sm mb-2 block">{t('common.notes')}</label>
                    <textarea
                      value={editReminderNotes}
                      onChange={(e) => setEditReminderNotes(e.target.value)}
                      placeholder="Additional details..."
                      rows={2}
                      className="w-full px-4 py-3 bg-white/5 border border-white/10 rounded-xl text-white placeholder:text-slate-500 outline-none focus:border-purple-500/50 resize-none"
                    />
                  </div>

                </div>
                <div className="px-5 py-4 border-t border-white/10">
                  <div className="flex gap-3">
                    <button
                      onClick={() => deleteReminder(planEditingReminder.id)}
                      className="px-4 py-3 rounded-xl font-medium text-rose-400 bg-rose-500/10 hover:bg-rose-500/20 transition-all"
                    >
                      <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                      </svg>
                    </button>
                    <button
                      onClick={() => setPlanEditingReminder(null)}
                      className="flex-1 py-3 rounded-xl font-medium text-slate-400 bg-white/10 hover:bg-white/20 transition-all"
                    >
                      Cancel
                    </button>
                    <button
                      onClick={saveReminderEdit}
                      disabled={!editReminderName.trim()}
                      className={`flex-1 py-3 rounded-xl font-semibold transition-all duration-200
                      ${editReminderName.trim()
                          ? 'bg-gradient-to-r from-purple-500 to-indigo-500 text-white shadow-lg shadow-purple-500/30'
                          : 'bg-white/5 text-slate-600 cursor-not-allowed'}`}
                    >
                      Save Changes
                    </button>
                  </div>
                </div>
              </div >
            </div >
          )
        }

        {/* Project Task Edit Modal */}
        {
          planEditingTask && (
            <div className="fixed inset-0 z-50 flex items-end justify-center animate-fadeIn">
              <div className="absolute inset-0 bg-black/60 backdrop-blur-sm" onClick={closePlanTaskModal} />

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
                      <p className="text-cyan-400 text-xs mt-0.5">{planEditingTaskProject?.title}</p>
                    </div>
                    <button
                      onClick={closePlanTaskModal}
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
                        onClick={() => setPlanEditShowIconPicker(!planEditShowIconPicker)}
                        className="w-12 h-12 rounded-xl bg-white/5 border border-white/10 flex items-center justify-center text-2xl hover:bg-white/10 transition-colors"
                      >
                        {planTaskData.icon}
                      </button>
                      <input
                        type="text"
                        value={planTaskData.title}
                        onChange={(e) => setPlanTaskData(prev => ({ ...prev, title: e.target.value }))}
                        placeholder={t('placeholders.taskName')}
                        className="flex-1 px-4 py-3 bg-white/5 border border-white/10 rounded-xl text-white placeholder:text-slate-500 outline-none focus:border-cyan-500/50"
                      />
                    </div>

                    {/* Icon Picker (Conditional) */}
                    {planEditShowIconPicker && (
                      <div className="mt-4 p-4 rounded-xl bg-white/5 border border-white/5 animate-fadeIn">
                        <div className="flex flex-wrap gap-2">
                          {globalIconOptions.map(icon => (
                            <button
                              key={icon}
                              onClick={() => {
                                setPlanTaskData(prev => ({ ...prev, icon }));
                                setPlanEditShowIconPicker(false);
                              }}
                              className={`w-10 h-10 rounded-lg flex items-center justify-center text-xl transition-colors
                              ${planTaskData.icon === icon ? 'bg-cyan-500/20 text-cyan-400' : 'hover:bg-white/10'}`}
                            >
                              {icon}
                            </button>
                          ))}
                        </div>
                      </div>
                    )}
                  </div>

                  {/* Details List (iOS Style) - Moved Up */}
                  <TaskDetailsList
                    date={planTaskData.date}
                    startTime={planTaskData.startTime}
                    endTime={planTaskData.endTime}
                    alerts={planTaskData.alerts}
                    onDateClick={() => {
                      setPlanEditShowDate(!planEditShowDate);
                      setPlanEditShowTime(false);
                      setPlanEditShowAlerts(false);
                      setPlanEditShowRepeat(false);
                    }}
                    onTimeClick={() => {
                      setPlanEditShowTime(!planEditShowTime);
                      setPlanEditShowAlerts(false);
                      setPlanEditShowDate(false);
                      setPlanEditShowRepeat(false);
                    }}
                    onAlertsClick={() => {
                      setPlanEditShowAlerts(!planEditShowAlerts);
                      setPlanEditShowTime(false);
                      setPlanEditShowDate(false);
                      setPlanEditShowRepeat(false);
                    }}
                    onRepeatClick={() => {
                      setPlanEditShowRepeat(!planEditShowRepeat);
                      setPlanEditShowAlerts(false);
                      setPlanEditShowTime(false);
                      setPlanEditShowDate(false);
                    }}
                    themeColor="cyan"
                    showDatePicker={planEditShowDate}
                    onDateChange={(date) => {
                      setPlanTaskData(prev => ({ ...prev, date }));
                      setPlanEditShowDate(false);
                    }}
                    showTimePicker={planEditShowTime}
                    onStartTimeChange={({ hour, minute }) => {
                      const m = minute.toString().padStart(2, '0');
                      setPlanTaskData(p => ({ ...p, startTime: `${hour}:${m}` }));
                    }}
                    onEndTimeChange={({ hour, minute }) => {
                      const m = minute.toString().padStart(2, '0');
                      setPlanTaskData(p => ({ ...p, endTime: `${hour}:${m}` }));
                    }}
                    repeat={planTaskData.repeat}
                    showRepeatPicker={planEditShowRepeat}
                    onRepeatChange={(repeat) => setPlanTaskData(prev => ({ ...prev, repeat }))}
                    t={t}
                    locale={currentLocale}
                  />


                  {/* Alerts Picker (Collapsible) */}
                  {planEditShowAlerts && (
                    <div className="mb-6 p-4 rounded-2xl bg-white/5 border border-white/5 animate-fadeIn">
                      <label className="text-xs font-medium text-slate-400 uppercase tracking-wide mb-3 block">Manage Alerts</label>
                      <div className="space-y-2">
                        {planTaskData.alerts.map((alert, index) => (
                          <div key={index} className="flex items-center justify-between p-3 rounded-xl bg-white/5 border border-white/5">
                            <span className="text-sm text-slate-200">{alert.label}</span>
                            <button
                              onClick={() => setPlanTaskData(p => ({ ...p, alerts: p.alerts.filter((_, i) => i !== index) }))}
                              className="text-rose-400 hover:text-rose-300 p-1"
                            >
                              <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                              </svg>
                            </button>
                          </div>
                        ))}
                        <div className="pt-2 grid grid-cols-3 gap-2">
                          {globalAlertOptions.map(opt => (
                            <button
                              key={opt.label}
                              onClick={() => {
                                if (!planTaskData.alerts.some(a => a.value === opt.value)) {
                                  setPlanTaskData(p => ({ ...p, alerts: [...p.alerts, opt] }));
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
                  <div>
                    <label className="text-slate-400 text-sm mb-2 block">Impact Value: {planTaskData.value}/10</label>
                    <input
                      type="range"
                      min="1"
                      max="10"
                      value={planTaskData.value}
                      onChange={(e) => setPlanTaskData(prev => ({ ...prev, value: parseInt(e.target.value) }))}
                      className="w-full accent-cyan-500"
                    />
                  </div>

                  {/* Energy */}
                  <div>
                    <label className="text-slate-400 text-sm mb-2 block">Energy Required</label>
                    <div className="grid grid-cols-3 gap-2">
                      {['low', 'medium', 'high'].map(level => (
                        <button
                          key={level}
                          onClick={() => setPlanTaskData(prev => ({ ...prev, energy: level }))}
                          className={`py-2.5 px-3 rounded-xl text-sm font-medium capitalize transition-all ${planTaskData.energy === level
                            ? level === 'high' ? 'bg-rose-500/30 text-rose-300 ring-2 ring-rose-500/50' :
                              level === 'medium' ? 'bg-amber-500/30 text-amber-300 ring-2 ring-amber-500/50' :
                                'bg-emerald-500/30 text-emerald-300 ring-2 ring-emerald-500/50'
                            : 'bg-white/5 text-slate-400'
                            }`}
                        >
                          {level}
                        </button>
                      ))}
                    </div>
                  </div>

                  {/* Notes */}
                  <div>
                    <label className="text-slate-400 text-sm mb-2 block">{t('common.notes')}</label>
                    <textarea
                      value={planTaskData.notes}
                      onChange={(e) => setPlanTaskData(prev => ({ ...prev, notes: e.target.value }))}
                      placeholder="Additional details..."
                      rows={2}
                      className="w-full px-4 py-3 bg-white/5 border border-white/10 rounded-xl text-white placeholder:text-slate-500 outline-none focus:border-cyan-500/50 resize-none"
                    />
                  </div>

                  {/* Save Button */}

                  {/* Save Button */}
                  <button
                    onClick={savePlanTask}
                    disabled={!planTaskData.title.trim()}
                    className="w-full py-4 rounded-xl font-semibold text-white transition-all disabled:opacity-50"
                    style={{
                      background: 'linear-gradient(135deg, rgba(6,182,212,0.8) 0%, rgba(139,92,246,0.8) 100%)'
                    }}
                  >
                    Save Changes
                  </button>

                  {/* Delete Button */}
                  <button
                    onClick={() => {
                      deleteProjectTask(planEditingTaskProject.id, planEditingTask.id);
                      closePlanTaskModal();
                    }}
                    className="w-full py-3 rounded-xl font-medium text-rose-400 bg-rose-500/10 hover:bg-rose-500/20 transition-all"
                  >
                    Delete Task
                  </button>
                </div>
              </div>
            </div>
          )
        }
      </div >
    );
  };

  // ============================================
  const ReviewScreen = () => {

    // Photo upload ref
    const photoInputRef = React.useRef(null);
    // reviewShowPhotoModal lifted to App as reviewShowPhotoModal


    // Mode: 'edit' for questions, 'capsule' for viewing memory capsule
    // viewMode state lifted to App component as reviewViewMode

    // Handle photo upload
    const handlePhotoUpload = (e) => {
      const file = e.target.files?.[0];
      if (file) {
        const reader = new FileReader();
        reader.onloadend = () => {
          updateReflection(selectedReflectDate, 'photo', reader.result);
        };
        reader.readAsDataURL(file);
      }
    };

    // Remove photo
    const removePhoto = () => {
      updateReflection(selectedReflectDate, 'photo', null);
      setReviewShowPhotoModal(false);
    };

    // Get current reflection from global state
    const currentReflection = getReflectionForDate(selectedReflectDate);

    // Check if viewing a past date
    const todayDate = getToday();
    const isViewingPast = selectedReflectDate.getTime() < todayDate.getTime();
    const isViewingToday = selectedReflectDate.getTime() === todayDate.getTime();

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
    const dateKey = getDateKey(selectedReflectDate);
    useEffect(() => {
      const reflection = reflectionsByDate[dateKey];
      if (reflection?.capsuleCreated) {
        setReviewViewMode('capsule');
      } else {
        setReviewViewMode('edit');
      }
    }, [dateKey]);

    // Share Memory Capsule
    const handleShare = async () => {
      const influencers = currentReflection.influencers || { helped: [], blocked: [] };
      const helpedText = influencers.helped?.map(id => influenceOptions.helped.find(o => o.id === id)?.label).filter(Boolean).join(', ');
      const blockedText = influencers.blocked?.map(id => influenceOptions.blocked.find(o => o.id === id)?.label).filter(Boolean).join(', ');

      const influenceSummary = [
        helpedText ? `💪 Helped: ${helpedText}` : '',
        blockedText ? `🚧 Blocked: ${blockedText}` : ''
      ].filter(Boolean).join('\n');

      const shareText = `Memory Capsule - ${new Date(selectedReflectDate).toLocaleDateString()}\nRating: ${currentReflection.rating}/10\n\nToday in brief: ${currentReflection.activities?.split('.')[0] || 'Brief summary'}\n\n${influenceSummary ? `Influencers:\n${influenceSummary}\n\n` : ''}Next Step: ${currentReflection.differently || 'N/A'}`;

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
      updateReflection(selectedReflectDate, 'capsuleCreated', true);
      setReviewViewMode('capsule');
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
        const selectedDate = new Date(selectedReflectDate);
        selectedDate.setHours(0, 0, 0, 0);

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
          isSelected: date.getTime() === selectedDate.getTime(),
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
      const selectedDate = new Date(selectedReflectDate);
      selectedDate.setHours(0, 0, 0, 0);

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
          isSelected: date.getTime() === selectedDate.getTime(),
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
      setSelectedReflectDate(getToday());
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
      setSelectedReflectDate(date);
      setShowMonthPicker(false);
    };

    const changeMonth = (delta) => {
      setWeekOffset(prev => prev + (delta * 4));
    };

    const selectReflectDay = (date) => {
      setSelectedReflectDate(new Date(date));
    };

    // Auto-save handler
    const handleFieldChange = (field, value) => {
      updateReflection(selectedReflectDate, field, value);
    };

    // Generate AI summary based on current reflection
    const generateSummary = () => {
      const summaryLines = [];

      if (currentReflection.activities) {
        summaryLines.push(`You focused on ${currentReflection.activities.toLowerCase().includes('work') ? 'work-related tasks' : 'various activities'}.`);
      }
      if (currentReflection.influencers?.helped?.length > 0) {
        summaryLines.push(`Progress aided by ${currentReflection.influencers.helped.length} factors.`);
      }


      return summaryLines.join(' ') || null;
    };

    return (
      <div className="pb-28 animate-fadeIn">
        {/* Header - Centered Apple Style */}
        <div className="mb-6 text-center">
          <p className="text-indigo-400/80 text-xs font-medium uppercase tracking-widest mb-2">
            {selectedReflectDate.toLocaleDateString(currentLocale, { month: 'long', day: 'numeric' })}
          </p>
          <h1 className="text-3xl font-semibold text-white tracking-tight">
            {isViewingToday ? t('reflect.title') : selectedReflectDate.toLocaleDateString(currentLocale, { weekday: 'long' })}
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
        {reviewViewMode === 'edit' && (
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
            {reviewShowPhotoModal && currentReflection.photo && (
              <div className="fixed inset-0 z-50 flex items-center justify-center animate-fadeIn">
                <div
                  className="absolute inset-0 bg-black/90 backdrop-blur-xl"
                  onClick={() => setReviewShowPhotoModal(false)}
                />

                <div className="relative max-w-lg w-full mx-4">
                  {/* Close button */}
                  <button
                    onClick={() => setReviewShowPhotoModal(false)}
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
                      {selectedReflectDate.toLocaleDateString(currentLocale, {
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
                    <div key={`${getDateKey(selectedReflectDate)}-${q.key}`} className="bg-white/5 rounded-2xl p-5 border border-white/5">
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
                    key={`${getDateKey(selectedReflectDate)}-${q.key}`}
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
                    onClick={() => setReviewShowPhotoModal(true)}
                    className="text-xs text-purple-400 hover:text-purple-300 transition-colors"
                  >
                    {t('common.view')}
                  </button>
                )}
              </div>

              {currentReflection.photo ? (
                <div
                  className="relative group cursor-pointer"
                  onClick={() => setReviewShowPhotoModal(true)}
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
        {reviewViewMode === 'capsule' && (
          <div className="animate-fadeIn">
            {/* Memory Capsule Card - Clickable to edit */}
            <div
              onClick={() => setReviewViewMode('edit')}
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
                        {selectedReflectDate.toLocaleDateString(currentLocale, { weekday: 'long', month: 'short', day: 'numeric' })}
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

  // ============================================
  // PATTERNS SCREEN
  // ============================================
  const PatternsScreen = () => {
    // viewMode and activeSection lifted to App component
    // const [viewMode, setViewMode] = useState('week'); -> patternsViewMode
    const [selectedMonth, setSelectedMonth] = useState(new Date());
    // const [activeSection, setActiveSection] = useState('habits'); -> patternsActiveSection

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

    const weekDays = getWeekDays();
    const monthDays = getMonthDays();

    const weekStats = weekDays.map(date => ({
      date, dayName: date.toLocaleDateString('en-US', { weekday: 'short' }), dayNum: date.getDate(), ...getRoutineStats(date)
    }));

    const weekReflectStats = weekDays.map(date => ({
      date, dayName: date.toLocaleDateString('en-US', { weekday: 'short' }), dayNum: date.getDate(), ...getReflectionStats(date)
    }));

    const monthStats = monthDays.map(date => ({ date, dayNum: date.getDate(), ...getRoutineStats(date) }));
    const monthReflectStats = monthDays.map(date => ({ date, dayNum: date.getDate(), ...getReflectionStats(date) }));

    const weekAvgMorning = Math.round(weekStats.reduce((sum, d) => sum + d.morning.percent, 0) / 7);
    const weekAvgEvening = Math.round(weekStats.reduce((sum, d) => sum + d.evening.percent, 0) / 7);
    const weekAvgOverall = Math.round(weekStats.reduce((sum, d) => sum + d.overall, 0) / 7);

    const weekRatings = weekReflectStats.filter(d => d.rating > 0);
    const weekAvgRating = weekRatings.length > 0 ? (weekRatings.reduce((sum, d) => sum + d.rating, 0) / weekRatings.length).toFixed(1) : '—';
    const weekReflectionCount = weekReflectStats.filter(d => d.hasReflection).length;
    const weekPhotoCount = weekReflectStats.filter(d => d.hasPhoto).length;
    const perfectDaysWeek = weekStats.filter(d => d.overall === 100).length;

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

    // Task statistics helpers
    const getTaskStatsForDate = (date) => {
      const dateKey = getDateKey(date);
      const dayTasks = getResolvedTasksForDate(date);
      const completed = dayTasks.filter(t => t.completed).length;
      const total = dayTasks.length;
      return { completed, total, percent: total > 0 ? Math.round((completed / total) * 100) : 0 };
    };

    const weekTaskStats = weekDays.map(date => ({
      date,
      dayName: date.toLocaleDateString('en-US', { weekday: 'short' }),
      dayNum: date.getDate(),
      ...getTaskStatsForDate(date)
    }));

    const monthTaskStats = monthDays.map(date => ({
      date,
      dayNum: date.getDate(),
      ...getTaskStatsForDate(date)
    }));

    // Overall task stats
    const weekTasksCompleted = weekTaskStats.reduce((sum, d) => sum + d.completed, 0);
    const weekTasksTotal = weekTaskStats.reduce((sum, d) => sum + d.total, 0);
    const weekTasksPercent = weekTasksTotal > 0 ? Math.round((weekTasksCompleted / weekTasksTotal) * 100) : 0;

    // Project stats
    const activeProjects = projects.filter(p => p.status !== 'completed');
    const completedProjects = projects.filter(p => p.status === 'completed');

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

    // Get energy color
    const getEnergyColor = (energy) => {
      if (energy === 'high') return 'from-rose-500 to-orange-500';
      if (energy === 'medium') return 'from-amber-500 to-yellow-500';
      return 'from-emerald-500 to-green-500';
    };

    const getEnergyBgColor = (energy) => {
      if (energy === 'high') return 'bg-rose-500';
      if (energy === 'medium') return 'bg-amber-500';
      return 'bg-emerald-500';
    };

    return (
      <div className="pb-28 animate-fadeIn">
        <div className="mb-6 text-center">
          <p className="text-emerald-400/80 text-xs font-medium uppercase tracking-widest mb-2">{t('patterns.analytics')}</p>
          <h1 className="text-3xl font-semibold text-white tracking-tight">{t('patterns.title')}</h1>
        </div>

        <div className="flex gap-2 mb-6">
          <button onClick={() => setPatternsActiveSection('habits')} className={`flex-1 py-3 rounded-xl font-medium text-sm transition-all flex items-center justify-center gap-2 ${patternsActiveSection === 'habits' ? 'bg-gradient-to-r from-purple-500 to-indigo-500 text-white' : 'glass-card text-slate-400'}`}>
            <span className="text-lg">✅</span> {t('patterns.habits')}
          </button>
          <button onClick={() => setPatternsActiveSection('tasks')} className={`flex-1 py-3 rounded-xl font-medium text-sm transition-all flex items-center justify-center gap-2 ${patternsActiveSection === 'tasks' ? 'bg-gradient-to-r from-cyan-500 to-blue-500 text-white' : 'glass-card text-slate-400'}`}>
            <span className="text-lg">📋</span> {t('patterns.tasks')}
          </button>
          <button onClick={() => setPatternsActiveSection('reflect')} className={`flex-1 py-3 rounded-xl font-medium text-sm transition-all flex items-center justify-center gap-2 ${patternsActiveSection === 'reflect' ? 'bg-gradient-to-r from-indigo-500 to-purple-500 text-white' : 'glass-card text-slate-400'}`}>
            <span className="text-lg">🧠</span> {t('patterns.reflect')}
          </button>
        </div>

        {/* CONTENT */}
        {patternsActiveSection === 'habits' ? (
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
              <button onClick={() => setPatternsViewMode('week')} className={`flex-1 py-3 rounded-xl font-medium text-sm transition-all ${patternsViewMode === 'week' ? 'bg-gradient-to-r from-emerald-500 to-green-500 text-white' : 'text-slate-400'}`}>{t('patterns.weekView')}</button>
              <button onClick={() => setPatternsViewMode('month')} className={`flex-1 py-3 rounded-xl font-medium text-sm transition-all ${patternsViewMode === 'month' ? 'bg-gradient-to-r from-emerald-500 to-green-500 text-white' : 'text-slate-400'}`}>{t('patterns.monthView')}</button>
            </div>

            {patternsViewMode === 'week' ? (
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
        ) : patternsActiveSection === 'tasks' ? (
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
              <button onClick={() => setPatternsViewMode('week')} className={`flex-1 py-3 rounded-xl font-medium text-sm transition-all ${patternsViewMode === 'week' ? 'bg-gradient-to-r from-cyan-500 to-blue-500 text-white' : 'glass-card text-slate-400'}`}>{t('patterns.weekView')}</button>
              <button onClick={() => setPatternsViewMode('month')} className={`flex-1 py-3 rounded-xl font-medium text-sm transition-all ${patternsViewMode === 'month' ? 'bg-gradient-to-r from-cyan-500 to-blue-500 text-white' : 'glass-card text-slate-400'}`}>{t('patterns.monthView')}</button>
            </div>

            {patternsViewMode === 'week' ? (
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
              <button onClick={() => setPatternsViewMode('week')} className={`flex-1 py-3 rounded-xl font-medium text-sm transition-all ${patternsViewMode === 'week' ? 'bg-gradient-to-r from-indigo-500 to-purple-500 text-white' : 'glass-card text-slate-400'}`}>{t('patterns.weekView')}</button>
              <button onClick={() => setPatternsViewMode('month')} className={`flex-1 py-3 rounded-xl font-medium text-sm transition-all ${patternsViewMode === 'month' ? 'bg-gradient-to-r from-indigo-500 to-purple-500 text-white' : 'glass-card text-slate-400'}`}>{t('patterns.monthView')}</button>
            </div>

            {patternsViewMode === 'week' ? (
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
                  <h3 className="text-white font-medium">{selectedMonth.toLocaleDateString('en-US', { month: 'long', year: 'numeric' })}</h3>
                  <button onClick={nextMonth} className="w-10 h-10 rounded-xl glass-card flex items-center justify-center text-slate-400 hover:text-white transition-all"><svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" /></svg></button>
                </div>

                <div className="glass-card rounded-2xl p-4 mb-4">
                  <div className="flex items-center gap-2 mb-3"><span className="text-lg">📊</span><h3 className="text-white font-medium">{t('patterns.dayRatings')}</h3></div>
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

  // ============================================
  // PROJECTS SCREEN
  // ============================================
  const ProjectsScreen = () => {
    const [localProjectData, setLocalProjectData] = useState({
      title: '',
      startDate: '',
      endDate: '',
      status: 'not-started',
      description: '',
      notes: '',
      color: '#8b5cf6'
    });

    // Project color options
    const projectColors = [
      { value: '#8b5cf6', name: t('colors.purple') },
      { value: '#6366f1', name: t('colors.indigo') },
      { value: '#3b82f6', name: t('colors.blue') },
      { value: '#06b6d4', name: t('colors.cyan') },
      { value: '#10b981', name: t('colors.emerald') },
      { value: '#22c55e', name: t('colors.green') },
      { value: '#eab308', name: t('colors.yellow') },
      { value: '#f97316', name: t('colors.orange') },
      { value: '#ef4444', name: t('colors.red') },
      { value: '#ec4899', name: t('colors.pink') },
      { value: '#f43f5e', name: t('colors.rose') },
      { value: '#64748b', name: t('colors.slate') }
    ];

    const [localTaskData, setLocalTaskData] = useState({
      title: '',
      icon: '📝',
      value: 5,
      energy: 'medium',
      timeEstimate: 30,
      dueDate: '',
      notes: '',
      alerts: [],
      repeat: { type: 'none', label: 'None', days: [] },
      date: new Date(),
      startTime: '',
      endTime: ''
    });

    const [localEditShowTime, setLocalEditShowTime] = useState(false);
    const [localEditShowAlerts, setLocalEditShowAlerts] = useState(false);
    const [localEditShowDate, setLocalEditShowDate] = useState(false);
    const [localEditShowRepeat, setLocalEditShowRepeat] = useState(false);
    const [localEditShowIconPicker, setLocalEditShowIconPicker] = useState(false);

    // Quick reminder state
    const [newReminderText, setNewReminderText] = useState('');
    // projectsShowMoveModal, reminderToMove, editingReminder lifted to App
    const [editReminderName, setEditReminderName] = useState('');
    const [editReminderIcon, setEditReminderIcon] = useState('📝');

    // Icon options for reminders
    const reminderIcons = ['📝', '💡', '🎯', '📌', '⭐', '🔔', '📋', '💼', '🏠', '🛒', '📞', '✉️', '🎨', '🔧', '📚', '💪'];



    // Add quick reminder
    const addQuickReminder = () => {
      if (!newReminderText.trim()) return;
      const newReminder = {
        id: Date.now(),
        name: newReminderText.trim(),
        icon: '📝',
        createdAt: new Date().toISOString()
      };
      setReminders(prev => [newReminder, ...prev]);
      setNewReminderText('');
    };

    // Open edit reminder modal
    const openEditReminder = (reminder) => {
      setProjectsEditingReminder(reminder);
      setEditReminderName(reminder.name);
      setEditReminderIcon(reminder.icon || '📝');
    };

    // Save reminder edits
    const saveReminderEdit = () => {
      if (!editReminderName.trim() || !projectsEditingReminder) return;

      const updatedData = { ...projectsEditingReminder, name: editReminderName.trim(), icon: editReminderIcon, isVirtual: false };

      setReminders(prev => {
        if (projectsEditingReminder.isVirtual) {
          return [{ ...updatedData, id: Date.now() }, ...prev];
        } else {
          return prev.map(r => r.id === projectsEditingReminder.id ? updatedData : r);
        }
      });
      setProjectsEditingReminder(null);
    };

    // Close edit modal
    const closeEditReminder = () => {
      setProjectsEditingReminder(null);
      setEditReminderName('');
      setEditReminderIcon('📝');
    };

    // Open move modal
    const openMoveModal = (reminder) => {
      setProjectsReminderToMove(reminder);
      setProjectsShowMoveModal(true);
    };


    // Move reminder to project as task
    const moveReminderToProject = (projectId) => {
      if (!projectsReminderToMove) return;

      const newTask = {
        id: Date.now(),
        title: projectsReminderToMove.name,
        value: 5,
        energy: 'medium',
        timeEstimate: 30,
        completed: false,
        dueDate: null,
        notes: ''
      };

      addProjectTask(projectId, newTask);
      setReminders(prev => prev.filter(r => r.id !== projectsReminderToMove.id));
      setProjectsShowMoveModal(false);
      setProjectsReminderToMove(null);
    };

    // Delete reminder
    const deleteReminder = (reminderId) => {
      setReminders(prev => prev.filter(r => r.id !== reminderId));
    };

    // Populate localProjectData when editing a project
    useEffect(() => {
      if (editingProject) {
        setLocalProjectData({
          title: editingProject.title || '',
          startDate: editingProject.startDate || '',
          endDate: editingProject.endDate || '',
          status: editingProject.status || 'not-started',
          description: editingProject.description || '',
          notes: editingProject.notes || '',
          color: editingProject.color || '#8b5cf6'
        });
      }
    }, [editingProject]);

    // Populate localTaskData when editing a task
    useEffect(() => {
      if (editingProjectTask) {
        const getStartTime = (t) => t.startTime ? new Date(t.startTime) : new Date(new Date().setHours(9, 0, 0, 0));
        const getEndTime = (t) => t.endTime ? new Date(t.endTime) : new Date(new Date().setHours(10, 0, 0, 0));
        const formatTime = (d) => `${d.getHours()}:${d.getMinutes().toString().padStart(2, '0')}`;

        setLocalTaskData({
          title: editingProjectTask.title || '',
          icon: editingProjectTask.icon || '📝',
          value: editingProjectTask.value || 5,
          energy: editingProjectTask.energy || 'medium',
          timeEstimate: editingProjectTask.timeEstimate || 30,
          dueDate: editingProjectTask.dueDate || '',
          notes: editingProjectTask.notes || '',
          alerts: editingProjectTask.alerts || [],
          repeat: editingProjectTask.repeat || { type: 'none', label: 'None', days: [] },
          date: editingProjectTask.date ? new Date(editingProjectTask.date) : new Date(),
          startTime: formatTime(getStartTime(editingProjectTask)),
          endTime: formatTime(getEndTime(editingProjectTask))
        });
      }
    }, [editingProjectTask]);

    // Handle pending edit task from Plan screen
    useEffect(() => {
      if (pendingEditTask && selectedProject) {
        setEditingProjectTask(pendingEditTask);
        setShowProjectTaskModal(true);
        setPendingEditTask(null); // Clear it after opening
      }
    }, [pendingEditTask, selectedProject]);

    const statusColors = {
      'not-started': { bg: 'bg-slate-500/20', text: 'text-slate-400', label: t('projectStatus.not_started') },
      'active': { bg: 'bg-emerald-500/20', text: 'text-emerald-400', label: t('projectStatus.active') },
      'on-hold': { bg: 'bg-amber-500/20', text: 'text-amber-400', label: t('projectStatus.on_hold') },
      'completed': { bg: 'bg-purple-500/20', text: 'text-purple-400', label: t('projectStatus.completed') }
    };

    // Notes editing state
    // projectsIsEditingNotes lifted to App as projectsIsEditingNotes
    const [notesText, setNotesText] = useState('');

    const startEditingNotes = (project) => {
      setNotesText(project?.notes || '');
      setProjectsIsEditingNotes(true);
    };

    const saveNotes = () => {
      if (selectedProject) {
        updateProject(selectedProject.id, { notes: notesText });
      }
      setProjectsIsEditingNotes(false);
    };

    const cancelEditingNotes = () => {
      setProjectsIsEditingNotes(false);
      setNotesText('');
    };

    const timeOptions = [
      { value: 15, label: `15 ${t('units.m')}` },
      { value: 30, label: `30 ${t('units.m')}` },
      { value: 45, label: `45 ${t('units.m')}` },
      { value: 60, label: `1 ${t('units.h')}` },
      { value: 90, label: `1.5 ${t('units.h')}` },
      { value: 120, label: `2 ${t('units.h')}` },
      { value: 180, label: `3 ${t('units.h')}` },
      { value: 240, label: `4 ${t('units.h')}` },
      { value: 360, label: `6 ${t('units.h')}` },
      { value: 480, label: `8 ${t('units.h')}` },
    ];

    const openNewProject = () => {
      setLocalProjectData({
        title: '',
        startDate: new Date().toISOString().split('T')[0],
        endDate: '',
        status: 'not-started',
        description: '',
        notes: '',
        color: '#8b5cf6'
      });
      setEditingProject(null);
      setShowProjectModal(true);
    };

    const openEditProject = (project) => {
      setLocalProjectData({
        title: project.title || '',
        startDate: project.startDate || '',
        endDate: project.endDate || '',
        status: project.status || 'not-started',
        description: project.description || '',
        notes: project.notes || '',
        color: project.color || '#8b5cf6'
      });
      setEditingProject(project);
      setShowProjectModal(true);
    };

    const saveProject = () => {
      if (!localProjectData.title.trim()) return;

      if (editingProject) {
        updateProject(editingProject.id, localProjectData);
      } else {
        addProject(localProjectData);
      }
      setShowProjectModal(false);
    };

    const openNewTask = (folderId = null) => {
      setLocalTaskData({
        title: '',
        icon: '📝',
        value: 5,
        energy: 'medium',
        timeEstimate: 30,
        dueDate: '',
        notes: '',
        alerts: [],
        date: new Date(),
        startTime: '',
        startTime: '',
        endTime: '',
        folderId: folderId
      });
      setLocalEditShowTime(false);
      setLocalEditShowAlerts(false);
      setLocalEditShowDate(false);
      setLocalEditShowIconPicker(false);
      setEditingProjectTask(null);
      setShowProjectTaskModal(true);
    };

    const openEditTask = (task) => {
      setLocalEditShowTime(false);
      setLocalEditShowAlerts(false);
      setLocalEditShowDate(false);
      setLocalEditShowIconPicker(false);
      setEditingProjectTask(task);
      setLocalTaskData(prev => ({
        ...prev,
        title: task.title,
        icon: task.icon || '📝',
        value: task.value || 5,
        energy: task.energy || 'medium',
        timeEstimate: task.timeEstimate || 30,
        dueDate: task.dueDate || '',
        notes: task.notes || '',
        alerts: task.alerts || [],
        date: task.date ? new Date(task.date) : new Date(),
        startTime: task.startTime ? new Date(task.startTime).toTimeString().slice(0, 5) : '',
        endTime: task.endTime ? new Date(task.endTime).toTimeString().slice(0, 5) : '',
        folderId: task.folderId || null
      }));
      setShowProjectTaskModal(true);
    };

    const saveTask = () => {
      if (!localTaskData.title.trim() || !selectedProject) return;

      // Get fresh project ID
      const project = projects.find(p => p.id === selectedProject.id);
      if (!project) return;

      let sDate = null;
      if (localTaskData.startTime) {
        const [sh, sm] = localTaskData.startTime.split(':').map(Number);
        if (!isNaN(sh) && !isNaN(sm)) {
          sDate = new Date(localTaskData.date);
          sDate.setHours(sh, sm, 0, 0);
        }
      }

      let eDate = null;
      if (localTaskData.endTime) {
        const [eh, em] = localTaskData.endTime.split(':').map(Number);
        if (!isNaN(eh) && !isNaN(em)) {
          eDate = new Date(localTaskData.date);
          eDate.setHours(eh, em, 0, 0);
        }
      }

      const taskUpdates = {
        ...localTaskData,
        date: localTaskData.date instanceof Date ? localTaskData.date.toISOString() : localTaskData.date,
        startTime: sDate ? sDate.toISOString() : null,
        endTime: eDate ? eDate.toISOString() : null
      };

      if (editingProjectTask) {
        updateProjectTask(project.id, editingProjectTask.id, taskUpdates);
      } else {
        addProjectTask(project.id, taskUpdates);
      }
      setEditingProjectTask(null);
      setShowProjectTaskModal(false);
    };

    const closeTaskModal = () => {
      setLocalEditShowTime(false);
      setLocalEditShowAlerts(false);
      setLocalEditShowDate(false);
      setLocalEditShowIconPicker(false);
      setEditingProjectTask(null);
      setShowProjectTaskModal(false);
    };

    // Project List View
    if (!selectedProject) {
      return (
        <div className="pb-28 animate-fadeIn">
          {/* Header */}
          <div className="mb-6 text-center">
            <p className="text-cyan-400/80 text-xs font-medium uppercase tracking-widest mb-2">
              {projects.filter(p => p.status === 'active').length} {t('projects.active')}
            </p>
            <h1 className="text-3xl font-semibold text-white tracking-tight">{t('projects.title')}</h1>
          </div>

          {/* Reminders Section */}
          <div className="mb-6">
            <button
              onClick={() => setProjectsRemindersExpanded(!projectsRemindersExpanded)}
              className="w-full flex items-center justify-between mb-3 text-slate-400 hover:text-white transition-colors"
            >
              <div className="flex items-center gap-2">
                <span className="text-lg">💭</span>
                <h3 className="font-medium">{t('plan.quickReminders')}</h3>
                <span className="bg-slate-800 text-slate-400 text-xs px-2 py-0.5 rounded-full">
                  {reminders.length}
                </span>
              </div>
              <svg
                className={`w-5 h-5 transition-transform ${projectsRemindersExpanded ? 'rotate-180' : ''}`}
                fill="none" viewBox="0 0 24 24" stroke="currentColor"
              >
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
              </svg>
            </button>

            {projectsRemindersExpanded && (
              <div className="animate-fadeIn">
                {/* Quick Add Input */}
                <div className="flex gap-2 mb-3">
                  <input
                    type="text"
                    value={newReminderText}
                    onChange={(e) => setNewReminderText(e.target.value)}
                    onKeyDown={(e) => e.key === 'Enter' && addQuickReminder()}
                    placeholder={t('placeholders.captureIdea')}
                    className="flex-1 px-4 py-3 rounded-xl text-white placeholder:text-slate-500 outline-none"
                    style={{
                      background: 'rgba(255,255,255,0.05)',
                      border: '1px solid rgba(245,158,11,0.2)'
                    }}
                  />
                  <button
                    onClick={addQuickReminder}
                    disabled={!newReminderText.trim()}
                    className="px-4 py-3 rounded-xl font-medium transition-all disabled:opacity-50 disabled:cursor-not-allowed"
                    style={{
                      background: 'linear-gradient(135deg, rgba(245,158,11,0.3) 0%, rgba(251,191,36,0.3) 100%)',
                      color: '#fbbf24'
                    }}
                  >
                    <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
                    </svg>
                  </button>
                </div>

                {/* Reminders List */}
                {getResolvedRemindersForDate(selectedExecuteDate).filter(r => !r.completed).length > 0 ? (
                  <div className="space-y-2">
                    {getResolvedRemindersForDate(selectedExecuteDate).filter(r => !r.completed).map(reminder => (
                      <div
                        key={reminder.id}
                        onClick={() => openEditReminder(reminder)}
                        className="rounded-xl p-3 flex items-center gap-3 cursor-pointer hover:bg-white/10 transition-all"
                        style={{
                          background: 'linear-gradient(135deg, rgba(255,255,255,0.05) 0%, rgba(255,255,255,0.02) 100%)',
                          backdropFilter: 'blur(10px)',
                          border: '1px solid rgba(255,255,255,0.1)'
                        }}
                      >
                        {/* Completion checkbox */}
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            const updatedReminders = reminders.map(r =>
                              r.id === reminder.id ? { ...r, completed: true } : r
                            );
                            setReminders(updatedReminders);
                            saveToStorage('reminders', updatedReminders);
                          }}
                          className="w-6 h-6 rounded-full border-2 border-amber-400 flex items-center justify-center hover:bg-amber-500/20 transition-all flex-shrink-0"
                        >
                          {/* Empty circle for uncompleted */}
                        </button>

                        <span className="text-lg">{reminder.icon}</span>
                        <span className="text-slate-300 flex-1 truncate">{reminder.name}</span>
                        <div className="flex items-center gap-1">
                          <button
                            onClick={(e) => { e.stopPropagation(); openMoveModal(reminder); }}
                            className="w-8 h-8 rounded-lg text-cyan-400 hover:bg-cyan-500/20 flex items-center justify-center transition-all"
                            title="Move to project"
                          >
                            <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7l5 5m0 0l-5 5m5-5H6" />
                            </svg>
                          </button>
                          <button
                            onClick={(e) => { e.stopPropagation(); deleteReminder(reminder.id); }}
                            className="w-8 h-8 rounded-lg text-slate-500 hover:text-rose-400 hover:bg-rose-500/20 flex items-center justify-center transition-all"
                          >
                            <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                            </svg>
                          </button>
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="text-center py-4 text-slate-500 text-sm">
                    {t('projects.noReminders')}
                  </div>
                )}

                {/* Completed Reminders */}
                {(() => {
                  const completedReminders = reminders.filter(r => r.completed);
                  if (completedReminders.length === 0) return null;

                  return (
                    <div className="mt-4">
                      <h3 className="text-slate-400 text-sm font-medium mb-3 uppercase tracking-wider">{t('plan.completed')}</h3>
                      <div className="space-y-2">
                        {completedReminders.map(reminder => (
                          <div
                            key={reminder.id}
                            onClick={() => openEditReminder(reminder)}
                            className="rounded-xl p-3 flex items-center gap-3 opacity-60 cursor-pointer hover:opacity-80 transition-all"
                            style={{
                              background: 'linear-gradient(135deg, rgba(255,255,255,0.05) 0%, rgba(255,255,255,0.02) 100%)',
                              backdropFilter: 'blur(10px)',
                              border: '1px solid rgba(255,255,255,0.1)'
                            }}
                          >
                            <button
                              onClick={(e) => {
                                e.stopPropagation();
                                // Uncomplete the reminder
                                const updatedReminders = reminders.map(r =>
                                  r.id === reminder.id ? { ...r, completed: false } : r
                                );
                                setReminders(updatedReminders);
                                saveToStorage('reminders', updatedReminders);
                              }}
                              className="w-6 h-6 rounded-full bg-amber-500 flex items-center justify-center flex-shrink-0"
                            >
                              <svg className="w-4 h-4 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                              </svg>
                            </button>
                            <span className="text-lg opacity-50">{reminder.icon}</span>
                            <span className="text-slate-400 font-medium line-through flex-1 truncate">{reminder.name}</span>
                          </div>
                        ))}
                      </div>
                    </div>
                  );
                })()}
              </div>
            )}
          </div>

          {/* Projects List */}
          <div className="space-y-4">
            {projects.map(project => {
              const progress = getProjectProgress(project);
              const status = statusColors[project.status];
              const projectColor = project.color || '#8b5cf6';

              return (
                <div
                  key={project.id}
                  onClick={() => setSelectedProject(project)}
                  className="glass-card rounded-2xl p-4 cursor-pointer hover:scale-[1.02] transition-all duration-200 relative overflow-hidden"
                >
                  {/* Color indicator bar at top */}
                  <div
                    className="absolute top-0 left-0 right-0 h-1"
                    style={{ backgroundColor: projectColor }}
                  />

                  <div className="flex items-start justify-between mb-3 mt-1">
                    <div className="flex-1">
                      <h3 className="text-white font-semibold text-lg">{project.title}</h3>
                      {project.description && (
                        <p className="text-slate-400 text-sm mt-1 line-clamp-2">{project.description}</p>
                      )}
                    </div>
                    <span className={`px-2.5 py-1 rounded-full text-xs font-medium ${status.bg} ${status.text}`}>
                      {status.label}
                    </span>
                  </div>

                  {/* Progress Bar */}
                  <div className="mb-3">
                    <div className="flex items-center justify-between mb-1.5">
                      <span className="text-slate-500 text-xs">Progress</span>
                      <span className="text-slate-300 text-xs font-medium">{progress}%</span>
                    </div>
                    <div className="h-2 bg-white/10 rounded-full overflow-hidden">
                      <div
                        className="h-full rounded-full transition-all duration-500"
                        style={{
                          width: `${progress}%`,
                          backgroundColor: projectColor
                        }}
                      />
                    </div>
                  </div>

                  {/* Footer */}
                  <div className="flex items-center justify-between text-xs">
                    <span className="text-slate-500">
                      {project.tasks?.length || 0} tasks
                    </span>
                    {project.endDate && (
                      <span className="text-slate-500">
                        Due {new Date(project.endDate).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}
                      </span>
                    )}
                  </div>
                </div>
              );
            })}

            {/* Add Project Button */}
            <button
              onClick={openNewProject}
              className="w-full py-4 rounded-2xl border-2 border-dashed border-white/20 hover:border-cyan-500/50 hover:bg-cyan-500/10 transition-all duration-200 flex items-center justify-center gap-3 group"
            >
              <div className="w-8 h-8 rounded-lg bg-white/10 group-hover:bg-cyan-500/20 flex items-center justify-center transition-all">
                <svg className="w-5 h-5 text-slate-400 group-hover:text-cyan-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
                </svg>
              </div>
              <span className="text-slate-400 group-hover:text-cyan-400 font-medium">{t('modals.newProject')}</span>
            </button>
          </div>

          {projects.length === 0 && (
            <div className="glass-card rounded-2xl p-8 text-center">
              <div className="text-5xl mb-4">🎯</div>
              <p className="text-slate-300 font-medium mb-2">{t('projects.noProjects')}</p>
              <p className="text-slate-500 text-sm">{t('projects.createPromo')}</p>
            </div>
          )}

          {/* Edit Reminder Modal */}
          {projectsEditingReminder && (
            <div className="fixed inset-0 z-50 flex items-end justify-center animate-fadeIn">
              <div className="absolute inset-0 bg-black/60 backdrop-blur-sm" onClick={closeEditReminder} />

              <div
                className="relative w-full max-w-md mx-4 mb-4 rounded-3xl overflow-hidden animate-slideUp"
                style={{
                  background: 'linear-gradient(180deg, rgba(30,30,40,0.95) 0%, rgba(20,20,30,0.98) 100%)',
                  backdropFilter: 'blur(40px)',
                  border: '1px solid rgba(255,255,255,0.1)'
                }}
              >
                <div className="px-5 pt-5 pb-4 border-b border-white/10">
                  <div className="flex items-center justify-between">
                    <h2 className="text-lg font-semibold text-white">{t('modals.editReminder')}</h2>
                    <button
                      onClick={closeEditReminder}
                      className="w-8 h-8 rounded-full bg-white/10 flex items-center justify-center text-slate-400"
                    >
                      <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                      </svg>
                    </button>
                  </div>
                </div>

                <div className="p-5 space-y-4">
                  {/* Icon Picker */}
                  <div>
                    <label className="text-slate-400 text-sm mb-2 block">{t('common.icon')}</label>
                    <div className="flex flex-wrap gap-2">
                      {reminderIcons.map(icon => (
                        <button
                          key={icon}
                          onClick={() => setEditReminderIcon(icon)}
                          className={`w-10 h-10 rounded-xl text-xl flex items-center justify-center transition-all ${editReminderIcon === icon
                            ? 'bg-amber-500/30 ring-2 ring-amber-400'
                            : 'bg-white/5 hover:bg-white/10'
                            }`}
                        >
                          {icon}
                        </button>
                      ))}
                    </div>
                  </div>

                  {/* Name Input */}
                  <div>
                    <label className="text-slate-400 text-sm mb-2 block">{t('common.reminder')}</label>
                    <input
                      type="text"
                      value={editReminderName}
                      onChange={(e) => setEditReminderName(e.target.value)}
                      className="w-full px-4 py-3 bg-white/5 border border-white/10 rounded-xl text-white placeholder:text-slate-500 outline-none focus:border-amber-500/50"
                    />
                  </div>

                  {/* Save Button */}
                  <button
                    onClick={saveReminderEdit}
                    disabled={!editReminderName.trim()}
                    className="w-full py-4 rounded-xl font-semibold text-white transition-all disabled:opacity-50"
                    style={{
                      background: 'linear-gradient(135deg, rgba(245,158,11,0.8) 0%, rgba(217,119,6,0.8) 100%)'
                    }}
                  >
                    {t('common.saveChanges')}
                  </button>

                  {/* Delete Button */}
                  <button
                    onClick={() => {
                      deleteReminder(projectsEditingReminder.id);
                      closeEditReminder();
                    }}
                    className="w-full py-3 rounded-xl font-medium text-rose-400 bg-rose-500/10 hover:bg-rose-500/20 transition-all"
                  >
                    {t('modals.deleteReminder')}
                  </button>
                </div>
              </div>
            </div>
          )}

          {/* Move Reminder to Project Modal */}
          {projectsShowMoveModal && projectsReminderToMove && (
            <div className="fixed inset-0 z-50 flex items-end justify-center animate-fadeIn">
              <div className="absolute inset-0 bg-black/60 backdrop-blur-sm" onClick={() => setProjectsShowMoveModal(false)} />

              <div
                className="relative w-full max-w-md mx-4 mb-4 rounded-3xl overflow-hidden animate-slideUp max-h-[70vh] overflow-y-auto"
                style={{
                  background: 'linear-gradient(180deg, rgba(30,30,40,0.95) 0%, rgba(20,20,30,0.98) 100%)',
                  backdropFilter: 'blur(40px)',
                  border: '1px solid rgba(255,255,255,0.1)'
                }}
              >
                <div className="px-5 pt-5 pb-4 border-b border-white/10">
                  <div className="flex items-center justify-between">
                    <h2 className="text-lg font-semibold text-white">{t('projects.moveToProject')}</h2>
                    <button
                      onClick={() => setProjectsShowMoveModal(false)}
                      className="w-8 h-8 rounded-full bg-white/10 flex items-center justify-center text-slate-400"
                    >
                      <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                      </svg>
                    </button>
                  </div>
                  <p className="text-slate-400 text-sm mt-2">
                    {t('projects.moving')} <span className="text-cyan-400">{projectsReminderToMove.name}</span>
                  </p>
                </div>

                <div className="p-4 space-y-2">
                  {projects.length > 0 ? (
                    projects.map(project => (
                      <button
                        key={project.id}
                        onClick={() => moveReminderToProject(project.id)}
                        className="w-full p-4 glass-card rounded-xl flex items-center gap-3 hover:bg-white/10 transition-all text-left"
                      >
                        <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-cyan-500/20 to-purple-500/20 flex items-center justify-center">
                          <span className="text-lg">📁</span>
                        </div>
                        <div className="flex-1">
                          <p className="text-white font-medium">{project.title}</p>
                          <p className="text-slate-500 text-xs">{project.tasks?.length || 0} tasks</p>
                        </div>
                        <svg className="w-5 h-5 text-slate-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                        </svg>
                      </button>
                    ))
                  ) : (
                    <div className="text-center py-8">
                      <p className="text-slate-400 mb-4">{t('projects.noProjects')}</p>
                      <button
                        onClick={() => {
                          setProjectsShowMoveModal(false);
                          openNewProject();
                        }}
                        className="px-4 py-2 bg-cyan-500/20 text-cyan-400 rounded-xl font-medium hover:bg-cyan-500/30 transition-all"
                      >
                        {t('projects.createFirst')}
                      </button>
                    </div>
                  )}
                </div>
              </div>
            </div>
          )}

          {/* New Project Modal */}
          {showProjectModal && (
            <div className="fixed inset-0 z-50 flex items-end justify-center animate-fadeIn">
              <div className="absolute inset-0 bg-black/60 backdrop-blur-sm" onClick={() => setShowProjectModal(false)} />

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
                    <h2 className="text-lg font-semibold text-white">
                      {editingProject ? t('modals.editProject') : t('modals.newProject')}
                    </h2>
                    <button
                      onClick={() => setShowProjectModal(false)}
                      className="w-8 h-8 rounded-full bg-white/10 flex items-center justify-center text-slate-400"
                    >
                      <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                      </svg>
                    </button>
                  </div>
                </div>

                <div className="p-5 space-y-4">
                  {/* Title */}
                  <div>
                    <label className="text-slate-400 text-sm mb-2 block">{t('common.title')} *</label>
                    <input
                      type="text"
                      value={localProjectData.title}
                      onChange={(e) => setLocalProjectData(prev => ({ ...prev, title: e.target.value }))}
                      placeholder={t('placeholders.projectName')}
                      className="w-full px-4 py-3 bg-white/5 border border-white/10 rounded-xl text-white placeholder:text-slate-500 outline-none focus:border-cyan-500/50"
                    />
                  </div>

                  {/* Description */}
                  <div>
                    <label className="text-slate-400 text-sm mb-2 block">{t('common.description')}</label>
                    <textarea
                      value={localProjectData.description}
                      onChange={(e) => setLocalProjectData(prev => ({ ...prev, description: e.target.value }))}
                      placeholder={t('placeholders.projectAbout')}
                      rows={3}
                      className="w-full px-4 py-3 bg-white/5 border border-white/10 rounded-xl text-white placeholder:text-slate-500 outline-none focus:border-cyan-500/50 resize-none"
                    />
                  </div>

                  {/* Dates */}
                  <div className="grid grid-cols-2 gap-3">
                    <div>
                      <label className="text-slate-400 text-sm mb-2 block">{t('common.startDate')}</label>
                      <input
                        type="date"
                        value={localProjectData.startDate}
                        onChange={(e) => setLocalProjectData(prev => ({ ...prev, startDate: e.target.value }))}
                        className="w-full px-4 py-3 bg-white/5 border border-white/10 rounded-xl text-white outline-none focus:border-cyan-500/50"
                      />
                    </div>
                    <div>
                      <label className="text-slate-400 text-sm mb-2 block">{t('common.endDate')}</label>
                      <input
                        type="date"
                        value={localProjectData.endDate}
                        onChange={(e) => setLocalProjectData(prev => ({ ...prev, endDate: e.target.value }))}
                        className="w-full px-4 py-3 bg-white/5 border border-white/10 rounded-xl text-white outline-none focus:border-cyan-500/50"
                      />
                    </div>
                  </div>

                  {/* Status */}
                  <div>
                    <label className="text-slate-400 text-sm mb-2 block">{t('common.status')}</label>
                    <div className="grid grid-cols-2 gap-2">
                      {Object.entries(statusColors).map(([key, val]) => (
                        <button
                          key={key}
                          onClick={() => setLocalProjectData(prev => ({ ...prev, status: key }))}
                          className={`py-2.5 px-3 rounded-xl text-sm font-medium transition-all ${localProjectData.status === key
                            ? `${val.bg} ${val.text} ring-2 ring-current`
                            : 'bg-white/5 text-slate-400 hover:bg-white/10'
                            }`}
                        >
                          {val.label}
                        </button>
                      ))}
                    </div>
                  </div>

                  {/* Project Color */}
                  <div>
                    <label className="text-slate-400 text-sm mb-2 block">{t('common.timelineColor')}</label>
                    <div className="flex flex-wrap gap-2">
                      {projectColors.map(color => (
                        <button
                          key={color.value}
                          onClick={() => setLocalProjectData(prev => ({ ...prev, color: color.value }))}
                          className={`w-8 h-8 rounded-lg transition-all ${localProjectData.color === color.value
                            ? 'ring-2 ring-white ring-offset-2 ring-offset-slate-900 scale-110'
                            : 'hover:scale-110'
                            }`}
                          style={{ backgroundColor: color.value }}
                          title={color.name}
                        />
                      ))}
                    </div>
                  </div>

                  {/* Save Button */}
                  <button
                    onClick={saveProject}
                    disabled={!localProjectData.title.trim()}
                    className="w-full py-4 rounded-xl font-semibold text-white transition-all disabled:opacity-50"
                    style={{
                      background: 'linear-gradient(135deg, rgba(6,182,212,0.8) 0%, rgba(139,92,246,0.8) 100%)'
                    }}
                  >
                    {editingProject ? t('common.saveChanges') : t('modals.createProject')}
                  </button>

                  {editingProject && (
                    <button
                      onClick={() => {
                        deleteProject(editingProject.id);
                        setShowProjectModal(false);
                      }}
                      className="w-full py-3 rounded-xl font-medium text-rose-400 bg-rose-500/10 hover:bg-rose-500/20 transition-all"
                    >
                      Delete Project
                    </button>
                  )}
                </div>
              </div>
            </div>
          )}
        </div>
      );
    }

    // Project Detail View - Get fresh data from projects array
    const currentProject = projects.find(p => p.id === selectedProject.id) || selectedProject;
    const progress = getProjectProgress(currentProject);
    const status = statusColors[currentProject.status] || statusColors['not-started'];
    const completedTasks = currentProject.tasks?.filter(t => t.completed) || [];
    const pendingTasks = currentProject.tasks?.filter(t => !t.completed) || [];

    return (
      <div className="pb-28 animate-fadeIn">
        {/* Back Button & Header */}
        <div className="mb-6">
          <button
            onClick={() => setSelectedProject(null)}
            className="flex items-center gap-2 text-slate-400 hover:text-white transition-colors mb-4"
          >
            <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
            </svg>
            <span className="text-sm">{t('projects.backToProjects')}</span>
          </button>

          <div className="flex items-start justify-between">
            <div className="flex-1">
              <h1 className="text-2xl font-semibold text-white">{currentProject.title}</h1>
              {currentProject.description && (
                <p className="text-slate-400 text-sm mt-2 leading-relaxed">{currentProject.description}</p>
              )}
            </div>
            <button
              onClick={() => openEditProject(currentProject)}
              className="w-10 h-10 rounded-xl bg-white/10 flex items-center justify-center text-slate-400 hover:text-white hover:bg-white/20 transition-all ml-3 flex-shrink-0"
            >
              <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
              </svg>
            </button>
          </div>
        </div>

        {/* Progress Card */}
        <div className="glass-card rounded-2xl p-5 mb-4">
          <div className="flex items-center justify-between mb-4">
            <span className={`px-3 py-1.5 rounded-full text-sm font-medium ${status.bg} ${status.text}`}>
              {status.label}
            </span>
            <span className="text-2xl font-bold text-white">{progress}%</span>
          </div>

          <div className="h-3 bg-white/10 rounded-full overflow-hidden mb-4">
            <div
              className="h-full rounded-full transition-all duration-500"
              style={{
                width: `${progress}%`,
                background: 'linear-gradient(90deg, rgba(6,182,212,0.8) 0%, rgba(139,92,246,0.8) 100%)'
              }}
            />
          </div>

          <div className="flex justify-between text-sm">
            <span className="text-slate-400">
              {completedTasks.length} of {currentProject.tasks?.length || 0} tasks
            </span>
            {currentProject.endDate && (
              <span className="text-slate-400">
                Due {new Date(currentProject.endDate).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}
              </span>
            )}
          </div>
        </div>

        {/* Notes Section */}
        <div className="glass-card rounded-2xl p-4 mb-4">
          <div className="flex items-center justify-between mb-3">
            <div className="flex items-center gap-2">
              <span className="text-lg">📝</span>
              <h3 className="text-slate-400 text-sm font-medium uppercase tracking-wider">{t('common.notes')}</h3>
            </div>
            {!projectsIsEditingNotes && (
              <button
                onClick={() => startEditingNotes(currentProject)}
                className="text-cyan-400 text-xs hover:text-cyan-300 transition-colors"
              >
                {currentProject.notes ? t('common.edit') : t('projects.add')}
              </button>
            )}
          </div>

          {projectsIsEditingNotes ? (
            <div className="space-y-3">
              <textarea
                value={notesText}
                onChange={(e) => setNotesText(e.target.value)}
                placeholder={t('placeholders.projectNotes')}
                rows={4}
                className="w-full px-4 py-3 bg-white/5 border border-white/10 rounded-xl text-white placeholder:text-slate-500 outline-none focus:border-cyan-500/50 resize-none text-sm"
                autoFocus
              />
              <div className="flex gap-2">
                <button
                  onClick={saveNotes}
                  className="flex-1 py-2 rounded-xl text-sm font-medium text-white bg-cyan-500/20 hover:bg-cyan-500/30 border border-cyan-500/30 transition-all"
                >
                  {t('common.save')}
                </button>
                <button
                  onClick={cancelEditingNotes}
                  className="flex-1 py-2 rounded-xl text-sm font-medium text-slate-400 bg-white/5 hover:bg-white/10 transition-all"
                >
                  {t('common.cancel')}
                </button>
              </div>
            </div>
          ) : (
            <div>
              {currentProject.notes ? (
                <p className="text-slate-300 text-sm leading-relaxed whitespace-pre-wrap">{currentProject.notes}</p>
              ) : (
                <p className="text-slate-500 text-sm italic">{t('projects.noNotes')}</p>
              )}
            </div>
          )}
        </div>

        {/* Folders & Tasks */}
        <div className="mb-6">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-slate-400 text-sm font-medium uppercase tracking-wider">{t('projects.toDo')}</h3>
            {!projectsShowNewFolderInput && (
              <button
                onClick={() => setProjectsShowNewFolderInput(true)}
                className="text-cyan-400 text-xs hover:text-cyan-300 transition-colors flex items-center gap-1"
              >
                <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
                </svg>
                {t('projects.createFolder')}
              </button>
            )}
          </div>

          {/* New Folder Input */}
          {projectsShowNewFolderInput && (
            <div className="mb-4 animate-fadeIn">
              <div className="flex gap-2">
                <input
                  type="text"
                  value={projectsNewFolderName}
                  onChange={(e) => setProjectsNewFolderName(e.target.value)}
                  placeholder={t('projects.folderName')}
                  className="flex-1 px-4 py-2 bg-white/5 border border-white/10 rounded-xl text-white placeholder:text-slate-500 outline-none focus:border-cyan-500/50 text-sm"
                  autoFocus
                  onKeyDown={(e) => {
                    if (e.key === 'Enter' && projectsNewFolderName.trim()) {
                      createFolder(currentProject.id, projectsNewFolderName);
                      setProjectsNewFolderName('');
                      setProjectsShowNewFolderInput(false);
                    }
                  }}
                />
                <button
                  onClick={() => {
                    if (projectsNewFolderName.trim()) {
                      createFolder(currentProject.id, projectsNewFolderName);
                      setProjectsNewFolderName('');
                      setProjectsShowNewFolderInput(false);
                    }
                  }}
                  disabled={!projectsNewFolderName.trim()}
                  className="px-4 py-2 bg-cyan-500/20 text-cyan-400 rounded-xl text-sm font-medium hover:bg-cyan-500/30 disabled:opacity-50 transition-all"
                >
                  {t('common.add')}
                </button>
                <button
                  onClick={() => {
                    setProjectsNewFolderName('');
                    setProjectsShowNewFolderInput(false);
                  }}
                  className="px-4 py-2 bg-white/5 text-slate-400 rounded-xl text-sm font-medium hover:bg-white/10 transition-all"
                >
                  {t('common.cancel')}
                </button>
              </div>
            </div>
          )}

          {/* Folders List */}
          <div className="space-y-6">
            {(currentProject.folders || []).map(folder => {
              const folderTasks = pendingTasks.filter(t => t.folderId === folder.id);

              return (
                <div key={folder.id} className="animate-fadeIn">
                  <div className="flex items-center justify-between mb-2 group">
                    <div
                      className="flex items-center gap-2 cursor-pointer hover:text-cyan-400 transition-colors"
                      onClick={() => toggleFolderCollapse(currentProject.id, folder.id)}
                    >
                      <svg
                        className={`w-4 h-4 text-slate-500 transition-transform duration-200 ${folder.isCollapsed ? '-rotate-90' : 'rotate-0'}`}
                        fill="none" viewBox="0 0 24 24" stroke="currentColor"
                      >
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                      </svg>
                      <svg className="w-4 h-4 text-slate-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 7v10a2 2 0 002 2h14a2 2 0 002-2V9a2 2 0 00-2-2h-6l-2-2H5a2 2 0 00-2 2z" />
                      </svg>
                      <h4 className="text-white font-medium">{folder.name}</h4>
                      <span className="text-slate-500 text-xs">({folderTasks.length})</span>
                    </div>
                    <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-all">
                      <button
                        onClick={() => openNewTask(folder.id)}
                        className="p-1 text-slate-500 hover:text-cyan-400 transition-all"
                        title={t('projects.addTask')}
                      >
                        <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
                        </svg>
                      </button>
                      <button
                        onClick={() => deleteFolder(currentProject.id, folder.id)}
                        className="p-1 text-slate-500 hover:text-rose-400 transition-all"
                        title={t('projects.deleteFolder')}
                      >
                        <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                        </svg>
                      </button>
                    </div>
                  </div>

                  {/* Tasks in Folder */}
                  {!folder.isCollapsed && (
                    <div className="space-y-2 pl-2 border-l border-white/5">
                      {folderTasks.length > 0 ? (
                        folderTasks.map(task => (
                          <div
                            key={task.id}
                            onClick={() => openEditTask(task)}
                            className="glass-card rounded-xl p-4 flex items-center gap-3 cursor-pointer hover:bg-white/10 transition-all active:scale-[0.98]"
                          >
                            <button
                              onClick={(e) => {
                                e.stopPropagation();
                                toggleProjectTask(currentProject.id, task.id);
                              }}
                              className="w-6 h-6 rounded-full border-2 border-slate-500 hover:border-cyan-400 transition-colors flex-shrink-0"
                            />
                            <div className="flex-1 min-w-0">
                              <p className="text-white font-medium truncate">{task.title}</p>
                              <div className="flex items-center gap-3 mt-1">
                                <span className={`text-xs px-2 py-0.5 rounded-full ${task.energy === 'high' ? 'bg-rose-500/20 text-rose-400' :
                                  task.energy === 'medium' ? 'bg-amber-500/20 text-amber-400' :
                                    'bg-emerald-500/20 text-emerald-400'
                                  }`}>
                                  {task.energy}
                                </span>
                                <span className="text-slate-500 text-xs">
                                  {t('common.impact')}: {task.value}/10
                                </span>
                                <span className="text-slate-500 text-xs">
                                  {timeOptions.find(t => t.value === task.timeEstimate)?.label || task.timeEstimate + t('units.m')}
                                </span>
                              </div>
                            </div>
                            <svg className="w-5 h-5 text-slate-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                            </svg>
                          </div>
                        ))
                      ) : (
                        <div className="py-2 text-slate-500 text-xs italic pl-2">
                          {t('projects.noTasks')}
                        </div>
                      )}
                    </div>
                  )}
                </div>
              );
            })}

            {/* Uncategorized Tasks */}
            {(() => {
              const uncategorizedTasks = pendingTasks.filter(t => !currentProject.folders?.some(f => f.id === t.folderId));
              if (uncategorizedTasks.length === 0 && (currentProject.folders || []).length > 0) return null;

              return (
                <div className="animate-fadeIn">
                  {(currentProject.folders || []).length > 0 && (
                    <h4 className="text-slate-400 text-xs font-medium uppercase tracking-wider mb-2 mt-4">{t('projects.uncategorized')}</h4>
                  )}
                  <div className="space-y-2">
                    {uncategorizedTasks.map(task => (
                      <div
                        key={task.id}
                        onClick={() => openEditTask(task)}
                        className="glass-card rounded-xl p-4 flex items-center gap-3 cursor-pointer hover:bg-white/10 transition-all active:scale-[0.98]"
                      >
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            toggleProjectTask(currentProject.id, task.id);
                          }}
                          className="w-6 h-6 rounded-full border-2 border-slate-500 hover:border-cyan-400 transition-colors flex-shrink-0"
                        />
                        <div className="flex-1 min-w-0">
                          <p className="text-white font-medium truncate">{task.title}</p>
                          <div className="flex items-center gap-3 mt-1">
                            <span className={`text-xs px-2 py-0.5 rounded-full ${task.energy === 'high' ? 'bg-rose-500/20 text-rose-400' :
                              task.energy === 'medium' ? 'bg-amber-500/20 text-amber-400' :
                                'bg-emerald-500/20 text-emerald-400'
                              }`}>
                              {task.energy}
                            </span>
                            <span className="text-slate-500 text-xs">
                              {t('common.impact')}: {task.value}/10
                            </span>
                            <span className="text-slate-500 text-xs">
                              {timeOptions.find(t => t.value === task.timeEstimate)?.label || task.timeEstimate + t('units.m')}
                            </span>
                          </div>
                        </div>
                        <svg className="w-5 h-5 text-slate-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                        </svg>
                      </div>
                    ))}
                    {uncategorizedTasks.length === 0 && (currentProject.folders || []).length === 0 && (
                      <div className="text-center py-8 text-slate-500">
                        {t('projects.noTasks')}
                      </div>
                    )}
                  </div>
                </div>
              );
            })()}
          </div>
        </div>

        {/* Add Task Button */}
        <button
          onClick={openNewTask}
          className="w-full mb-6 py-3 rounded-xl border border-dashed border-white/20 hover:border-cyan-500/50 hover:bg-cyan-500/10 transition-all flex items-center justify-center gap-2 text-slate-400 hover:text-cyan-400"
        >
          <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
          </svg>
          <span className="font-medium">{t('projects.addTask')}</span>
        </button>

        {/* Completed Tasks */}
        {completedTasks.length > 0 && (
          <div>
            <h3 className="text-slate-400 text-sm font-medium mb-3 uppercase tracking-wider">{t('plan.completed')}</h3>
            <div className="space-y-2">
              {completedTasks.map(task => (
                <div
                  key={task.id}
                  onClick={() => openEditTask(task)}
                  className="glass-card rounded-xl p-4 flex items-center gap-3 opacity-60 cursor-pointer hover:opacity-80 transition-all active:scale-[0.98]"
                >
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      toggleProjectTask(currentProject.id, task.id);
                    }}
                    className="w-6 h-6 rounded-full bg-cyan-500 flex items-center justify-center flex-shrink-0"
                  >
                    <svg className="w-4 h-4 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                    </svg>
                  </button>
                  <div className="flex-1 min-w-0">
                    <p className="text-slate-400 font-medium line-through truncate">{task.title}</p>
                  </div>
                  <svg className="w-5 h-5 text-slate-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                  </svg>
                </div>
              ))}
            </div>
          </div>
        )}

        {currentProject.tasks?.length === 0 && (
          <div className="glass-card rounded-2xl p-8 text-center">
            <div className="text-4xl mb-3">📋</div>
            <p className="text-slate-400">{t('projects.noTasks')}</p>
          </div>
        )}

        {/* Task Modal */}
        {showProjectTaskModal && (
          <div className="fixed inset-0 z-50 flex items-end justify-center animate-fadeIn">
            <div className="absolute inset-0 bg-black/60 backdrop-blur-sm" onClick={closeTaskModal} />

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
                  <h2 className="text-lg font-semibold text-white">
                    {editingProjectTask ? t('modals.editTask') : t('modals.newTask')}
                  </h2>
                  <button
                    onClick={closeTaskModal}
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
                      onClick={() => setLocalEditShowIconPicker(!localEditShowIconPicker)}
                      className="w-12 h-12 rounded-xl bg-white/5 border border-white/10 flex items-center justify-center text-2xl hover:bg-white/10 transition-colors"
                    >
                      {localTaskData.icon}
                    </button>
                    <input
                      type="text"
                      value={localTaskData.title}
                      onChange={(e) => setLocalTaskData(prev => ({ ...prev, title: e.target.value }))}
                      placeholder={t('placeholders.taskName')}
                      className="flex-1 px-4 py-3 bg-white/5 border border-white/10 rounded-xl text-white placeholder:text-slate-500 outline-none focus:border-cyan-500/50"
                    />
                  </div>

                  {/* Icon Picker (Conditional) */}
                  {localEditShowIconPicker && (
                    <div className="mt-4 p-4 rounded-xl bg-white/5 border border-white/5 animate-fadeIn">
                      <div className="flex flex-wrap gap-2">
                        {globalIconOptions.map(icon => (
                          <button
                            key={icon}
                            onClick={() => {
                              setLocalTaskData(prev => ({ ...prev, icon }));
                              setLocalEditShowIconPicker(false);
                            }}
                            className={`w-10 h-10 rounded-lg flex items-center justify-center text-xl transition-colors
                              ${localTaskData.icon === icon ? 'bg-cyan-500/20 text-cyan-400' : 'hover:bg-white/10'}`}
                          >
                            {icon}
                          </button>
                        ))}
                      </div>
                    </div>
                  )}
                </div>

                {/* Folder Selection */}
                {(currentProject.folders || []).length > 0 && (
                  <div className="mb-4">
                    <label className="text-slate-400 text-sm mb-2 block">{t('projects.folderName')}</label>
                    <div className="relative">
                      <select
                        value={localTaskData.folderId || ''}
                        onChange={(e) => setLocalTaskData(prev => ({ ...prev, folderId: e.target.value ? Number(e.target.value) : null }))}
                        className="w-full px-4 py-3 bg-white/5 border border-white/10 rounded-xl text-white outline-none focus:border-cyan-500/50 appearance-none"
                      >
                        <option value="" className="bg-slate-800">{t('projects.uncategorized')}</option>
                        {currentProject.folders.map(folder => (
                          <option key={folder.id} value={folder.id} className="bg-slate-800">
                            {folder.name}
                          </option>
                        ))}
                      </select>
                      <div className="absolute right-4 top-1/2 -translate-y-1/2 pointer-events-none">
                        <svg className="w-5 h-5 text-slate-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                        </svg>
                      </div>
                    </div>
                  </div>
                )}

                {/* Details List (iOS Style) - Moved Up */}
                <TaskDetailsList
                  date={localTaskData.date}
                  startTime={localTaskData.startTime}
                  endTime={localTaskData.endTime}
                  alerts={localTaskData.alerts}
                  onDateClick={() => {
                    setLocalEditShowDate(!localEditShowDate);
                    setLocalEditShowTime(false);
                    setLocalEditShowAlerts(false);
                    setLocalEditShowRepeat(false);
                  }}
                  onTimeClick={() => {
                    setLocalEditShowTime(!localEditShowTime);
                    setLocalEditShowAlerts(false);
                    setLocalEditShowDate(false);
                    setLocalEditShowRepeat(false);
                  }}
                  onAlertsClick={() => {
                    setLocalEditShowAlerts(!localEditShowAlerts);
                    setLocalEditShowTime(false);
                    setLocalEditShowDate(false);
                    setLocalEditShowRepeat(false);
                  }}
                  onRepeatClick={() => {
                    setLocalEditShowRepeat(!localEditShowRepeat);
                    setLocalEditShowAlerts(false);
                    setLocalEditShowTime(false);
                    setLocalEditShowDate(false);
                  }}
                  themeColor="cyan"
                  showDatePicker={localEditShowDate}
                  onDateChange={(date) => {
                    setLocalTaskData(prev => ({ ...prev, date }));
                    setLocalEditShowDate(false);
                  }}
                  showTimePicker={localEditShowTime}
                  onStartTimeChange={({ hour, minute }) => {
                    const m = minute.toString().padStart(2, '0');
                    setLocalTaskData(p => ({ ...p, startTime: `${hour}:${m}` }));
                  }}
                  onEndTimeChange={({ hour, minute }) => {
                    const m = minute.toString().padStart(2, '0');
                    setLocalTaskData(p => ({ ...p, endTime: `${hour}:${m}` }));
                  }}
                  repeat={localTaskData.repeat}
                  showRepeatPicker={localEditShowRepeat}
                  onRepeatChange={(repeat) => setLocalTaskData(prev => ({ ...prev, repeat }))}
                  t={t}
                  locale={currentLocale}
                />


                {/* Alerts Picker (Collapsible) */}
                {localEditShowAlerts && (
                  <div className="mb-6 p-4 rounded-2xl bg-white/5 border border-white/5 animate-fadeIn">
                    <label className="text-xs font-medium text-slate-400 uppercase tracking-wide mb-3 block">{t('common.manageAlerts')}</label>
                    <div className="space-y-2">
                      {localTaskData.alerts.map((alert, index) => (
                        <div key={index} className="flex items-center justify-between p-3 rounded-xl bg-white/5 border border-white/5">
                          <span className="text-sm text-slate-200">{alert.label}</span>
                          <button
                            onClick={() => setLocalTaskData(p => ({ ...p, alerts: p.alerts.filter((_, i) => i !== index) }))}
                            className="text-rose-400 hover:text-rose-300 p-1"
                          >
                            <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                            </svg>
                          </button>
                        </div>
                      ))}
                      <div className="pt-2 grid grid-cols-3 gap-2">
                        {globalAlertOptions.map(opt => (
                          <button
                            key={opt.label}
                            onClick={() => {
                              if (!localTaskData.alerts.some(a => a.value === opt.value)) {
                                setLocalTaskData(p => ({ ...p, alerts: [...p.alerts, opt] }));
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
                <div>
                  <label className="text-slate-400 text-sm mb-2 block">{t('common.impactValue')}: {localTaskData.value}/10</label>
                  <input
                    type="range"
                    min="1"
                    max="10"
                    value={localTaskData.value}
                    onChange={(e) => setLocalTaskData(prev => ({ ...prev, value: parseInt(e.target.value) }))}
                    className="w-full accent-cyan-500"
                  />
                </div>

                {/* Energy */}
                <div>
                  <label className="text-slate-400 text-sm mb-2 block">{t('common.energyRequired')}</label>
                  <div className="grid grid-cols-3 gap-2">
                    {['low', 'medium', 'high'].map(level => (
                      <button
                        key={level}
                        onClick={() => setLocalTaskData(prev => ({ ...prev, energy: level }))}
                        className={`py-2.5 px-3 rounded-xl text-sm font-medium capitalize transition-all ${localTaskData.energy === level
                          ? level === 'high' ? 'bg-rose-500/20 text-rose-400 ring-2 ring-rose-500/50' :
                            level === 'medium' ? 'bg-amber-500/20 text-amber-400 ring-2 ring-amber-500/50' :
                              'bg-emerald-500/20 text-emerald-400 ring-2 ring-emerald-500/50'
                          : 'bg-white/5 text-slate-400 hover:bg-white/10'
                          }`}
                      >
                        {level}
                      </button>
                    ))}
                  </div>
                </div>

                {/* Notes */}
                <div>
                  <label className="text-slate-400 text-sm mb-2 block">{t('common.notes')}</label>
                  <textarea
                    value={localTaskData.notes}
                    onChange={(e) => setLocalTaskData(prev => ({ ...prev, notes: e.target.value }))}
                    placeholder={t('placeholders.projectTaskDetails')}
                    rows={2}
                    className="w-full px-4 py-3 bg-white/5 border border-white/10 rounded-xl text-white placeholder:text-slate-500 outline-none focus:border-cyan-500/50 resize-none"
                  />
                </div>

                {/* Save Button */}
                <button
                  onClick={saveTask}
                  disabled={!localTaskData.title.trim()}
                  className="w-full py-4 rounded-xl font-semibold text-white transition-all disabled:opacity-50"
                  style={{
                    background: 'linear-gradient(135deg, rgba(6,182,212,0.8) 0%, rgba(139,92,246,0.8) 100%)'
                  }}
                >
                  {editingProjectTask ? t('common.saveChanges') : t('projects.addTask')}
                </button>

                {editingProjectTask && (
                  <button
                    onClick={() => {
                      deleteProjectTask(currentProject.id, editingProjectTask.id);
                      closeTaskModal();
                    }}
                    className="w-full py-3 rounded-xl font-medium text-rose-400 bg-rose-500/10 hover:bg-rose-500/20 transition-all"
                  >
                    {t('common.deleteTask')}
                  </button>
                )}
              </div>
            </div>
          </div>
        )}

        {/* Project Modal (for editing from detail view) */}
        {showProjectModal && (
          <div className="fixed inset-0 z-50 flex items-end justify-center animate-fadeIn">
            <div className="absolute inset-0 bg-black/60 backdrop-blur-sm" onClick={() => setShowProjectModal(false)} />

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
                  <h2 className="text-lg font-semibold text-white">{t('modals.editProject')}</h2>
                  <button
                    onClick={() => setShowProjectModal(false)}
                    className="w-8 h-8 rounded-full bg-white/10 flex items-center justify-center text-slate-400"
                  >
                    <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                    </svg>
                  </button>
                </div>
              </div>

              <div className="p-5 space-y-4">
                <div>
                  <label className="text-slate-400 text-sm mb-2 block">{t('common.title')} *</label>
                  <input
                    type="text"
                    value={localProjectData.title}
                    onChange={(e) => setLocalProjectData(prev => ({ ...prev, title: e.target.value }))}
                    className="w-full px-4 py-3 bg-white/5 border border-white/10 rounded-xl text-white outline-none focus:border-cyan-500/50"
                  />
                </div>

                <div>
                  <label className="text-slate-400 text-sm mb-2 block">{t('common.description')}</label>
                  <textarea
                    value={localProjectData.description}
                    onChange={(e) => setLocalProjectData(prev => ({ ...prev, description: e.target.value }))}
                    placeholder={t('placeholders.projectAbout')}
                    rows={3}
                    className="w-full px-4 py-3 bg-white/5 border border-white/10 rounded-xl text-white outline-none focus:border-cyan-500/50 resize-none"
                  />
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="text-slate-400 text-sm mb-2 block">{t('common.startDate')}</label>
                    <input
                      type="date"
                      value={localProjectData.startDate}
                      onChange={(e) => setLocalProjectData(prev => ({ ...prev, startDate: e.target.value }))}
                      className="w-full px-4 py-3 bg-white/5 border border-white/10 rounded-xl text-white outline-none"
                    />
                  </div>
                  <div>
                    <label className="text-slate-400 text-sm mb-2 block">{t('common.endDate')}</label>
                    <input
                      type="date"
                      value={localProjectData.endDate}
                      onChange={(e) => setLocalProjectData(prev => ({ ...prev, endDate: e.target.value }))}
                      className="w-full px-4 py-3 bg-white/5 border border-white/10 rounded-xl text-white outline-none"
                    />
                  </div>
                </div>

                <div>
                  <label className="text-slate-400 text-sm mb-2 block">{t('common.status')}</label>
                  <div className="grid grid-cols-2 gap-2">
                    {Object.entries(statusColors).map(([key, val]) => (
                      <button
                        key={key}
                        onClick={() => setLocalProjectData(prev => ({ ...prev, status: key }))}
                        className={`py-2.5 px-3 rounded-xl text-sm font-medium transition-all ${localProjectData.status === key
                          ? `${val.bg} ${val.text} ring-2 ring-current`
                          : 'bg-white/5 text-slate-400'
                          }`}
                      >
                        {val.label}
                      </button>
                    ))}
                  </div>
                </div>

                {/* Project Color */}
                <div>
                  <label className="text-slate-400 text-sm mb-2 block">{t('common.timelineColor')}</label>
                  <div className="flex flex-wrap gap-2">
                    {[
                      { value: '#8b5cf6', name: 'Purple' },
                      { value: '#6366f1', name: 'Indigo' },
                      { value: '#3b82f6', name: 'Blue' },
                      { value: '#06b6d4', name: 'Cyan' },
                      { value: '#10b981', name: 'Emerald' },
                      { value: '#22c55e', name: 'Green' },
                      { value: '#eab308', name: 'Yellow' },
                      { value: '#f97316', name: 'Orange' },
                      { value: '#ef4444', name: 'Red' },
                      { value: '#ec4899', name: 'Pink' },
                      { value: '#f43f5e', name: 'Rose' },
                      { value: '#64748b', name: 'Slate' }
                    ].map(color => (
                      <button
                        key={color.value}
                        onClick={() => setLocalProjectData(prev => ({ ...prev, color: color.value }))}
                        className={`w-8 h-8 rounded-lg transition-all ${localProjectData.color === color.value
                          ? 'ring-2 ring-white ring-offset-2 ring-offset-slate-900 scale-110'
                          : 'hover:scale-110'
                          }`}
                        style={{ backgroundColor: color.value }}
                        title={color.name}
                      />
                    ))}
                  </div>
                </div>

                <button
                  onClick={() => {
                    updateProject(currentProject.id, localProjectData);
                    setSelectedProject({ ...currentProject, ...localProjectData });
                    setShowProjectModal(false);
                  }}
                  className="w-full py-4 rounded-xl font-semibold text-white"
                  style={{
                    background: 'linear-gradient(135deg, rgba(6,182,212,0.8) 0%, rgba(139,92,246,0.8) 100%)'
                  }}
                >
                  {t('common.saveChanges')}
                </button>

                <button
                  onClick={() => {
                    deleteProject(currentProject.id);
                    setShowProjectModal(false);
                  }}
                  className="w-full py-3 rounded-xl font-medium text-rose-400 bg-rose-500/10"
                >
                  {t('common.delete')} {t('common.project')}
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    );
  };

  // ============================================
  // NAVIGATION
  // ============================================
  const NavItem = ({ id, icon, label, active, isMain }) => (
    <button
      onClick={() => setActiveTab(id)}
      className={`flex flex-col items-center gap-1.5 rounded-2xl transition-all duration-300 ${isMain ? 'px-6 py-2 -mt-3' : 'px-4 py-2'
        } ${active
          ? 'text-white'
          : 'text-slate-500 hover:text-slate-300'
        }`}
    >
      <div className={`relative transition-all duration-300 ${active ? (isMain ? 'scale-125' : 'scale-110') : ''}`}>
        {active && (
          <div className={`absolute inset-0 ${isMain ? 'bg-amber-500/40' : 'bg-purple-500/30'} blur-xl rounded-full`}></div>
        )}
        <div className={`relative ${isMain && active ? 'text-amber-400' : ''}`}>{icon}</div>
      </div>
      <span className={`text-xs font-medium ${active ? (isMain ? 'text-amber-300' : 'text-purple-300') : ''}`}>{label}</span>
      {active && (
        <div className={`w-1 h-1 rounded-full ${isMain ? 'bg-amber-400' : 'bg-purple-400'} animate-glow`}></div>
      )}
    </button>
  );

  // Check if any edit modal is open
  const isEditing = showProjectModal ||
    showProjectTaskModal ||
    projectsShowMoveModal ||
    projectsEditingReminder ||
    executeShowNewTaskModal ||
    executeEditingTask ||
    executeEditingRoutine ||
    planShowNewReminder ||
    planEditingReminder ||
    planEditingTask ||
    editingProjectTask ||
    showGlobalTaskModal ||
    reviewShowPhotoModal ||
    projectsIsEditingNotes ||
    editingProject;

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900">
      {/* Ambient Background Effects */}
      <div className="fixed inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-0 left-1/4 w-96 h-96 bg-purple-500/20 rounded-full blur-3xl"></div>
        <div className="absolute bottom-1/4 right-0 w-80 h-80 bg-blue-500/20 rounded-full blur-3xl"></div>
        <div className="absolute top-1/2 left-0 w-64 h-64 bg-indigo-500/15 rounded-full blur-3xl"></div>
      </div>

      {/* Main Content */}
      <div className="relative max-w-md mx-auto px-5 pt-8">
        {/* Settings Button */}
        <button
          onClick={() => setShowSettingsModal(true)}
          className="absolute top-8 right-5 w-8 h-8 flex items-center justify-center rounded-full bg-white/5 hover:bg-white/10 text-slate-400 hover:text-white transition-all duration-200 z-20"
        >
          <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" />
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
          </svg>
        </button>
        {activeTab === 'projects' && <ProjectsScreen />}
        {activeTab === 'plan' && <PlanScreen />}
        {activeTab === 'execute' && <ExecuteScreen
          selectedExecuteDate={selectedExecuteDate}
          setSelectedExecuteDate={setSelectedExecuteDate}
          activeTask={activeTask}
          setActiveTask={setActiveTask}
          elapsedTime={elapsedTime}
          setElapsedTime={setElapsedTime}
          isPaused={isPaused}
          setIsPaused={setIsPaused}
          reminders={reminders}
          setReminders={setReminders}
          projects={projects}
          setProjects={setProjects}
          priorities={priorities}
          setPriorities={setPriorities}
          tasks={tasksByDate[getDateKey(selectedExecuteDate)]}
          setTasksByDate={setTasksByDate}
          getResolvedTasksForDate={getResolvedTasksForDate}
          getRoutinesForDate={getRoutinesForDate}
          toggleRoutineHabit={toggleRoutineHabit}
          removeHabitFromTemplate={removeHabitFromTemplate}
          addHabitToTemplate={addHabitToTemplate}
          completeAllHabits={completeAllHabits}
          completeTask={completeTask}
          t={t}
          currentLocale={currentLocale}
          focusMode={focusMode}
          setFocusMode={setFocusMode}
          focusTask={focusTask}
          setFocusTask={setFocusTask}
          pomodoroTime={pomodoroTime}
          setPomodoroTime={setPomodoroTime}
          pomodoroRunning={pomodoroRunning}
          setPomodoroRunning={setPomodoroRunning}
          pomodoroSession={pomodoroSession}
          setPomodoroSession={setPomodoroSession}
          isBreak={isBreak}
          setIsBreak={setIsBreak}
          totalFocusTime={totalFocusTime}
          setTotalFocusTime={setTotalFocusTime}
          executeShowNewTaskModal={executeShowNewTaskModal}
          setExecuteShowNewTaskModal={setExecuteShowNewTaskModal}
          executeEditingTask={executeEditingTask}
          setExecuteEditingTask={setExecuteEditingTask}
          executeEditingRoutine={executeEditingRoutine}
          setExecuteEditingRoutine={setExecuteEditingRoutine}
          expandedRoutine={expandedRoutine}
          setExpandedRoutine={setExpandedRoutine}
          editTaskName={editTaskName}
          setEditTaskName={setEditTaskName}
          editTaskIcon={editTaskIcon}
          setEditTaskIcon={setEditTaskIcon}
          editTaskEnergy={editTaskEnergy}
          setEditTaskEnergy={setEditTaskEnergy}
          editTaskStartHour={editTaskStartHour}
          setEditTaskStartHour={setEditTaskStartHour}
          editTaskStartMinute={editTaskStartMinute}
          setEditTaskStartMinute={setEditTaskStartMinute}
          editTaskEndHour={editTaskEndHour}
          setEditTaskEndHour={setEditTaskEndHour}
          editTaskEndMinute={editTaskEndMinute}
          setEditTaskEndMinute={setEditTaskEndMinute}
          editTaskAlerts={editTaskAlerts}
          setEditTaskAlerts={setEditTaskAlerts}
          editTaskRepeat={editTaskRepeat}
          setEditTaskRepeat={setEditTaskRepeat}
          editTaskShowTime={editTaskShowTime}
          setEditTaskShowTime={setEditTaskShowTime}
          editTaskShowAlerts={editTaskShowAlerts}
          setEditTaskShowAlerts={setEditTaskShowAlerts}
          editTaskDate={editTaskDate}
          setEditTaskDate={setEditTaskDate}
          editTaskShowDate={editTaskShowDate}
          setEditTaskShowDate={setEditTaskShowDate}
          editTaskShowRepeat={editTaskShowRepeat}
          setEditTaskShowRepeat={setEditTaskShowRepeat}
          editTaskShowIconPicker={editTaskShowIconPicker}
          setEditTaskShowIconPicker={setEditTaskShowIconPicker}
          editTaskValue={editTaskValue}
          setEditTaskValue={setEditTaskValue}
          editTaskNotes={editTaskNotes}
          setEditTaskNotes={setEditTaskNotes}
        />}
        {activeTab === 'review' && <ReviewScreen />}
        {activeTab === 'patterns' && <PatternsScreen />}
      </div>

      {/* Bottom Navigation - Liquid Glass */}
      <nav className={`fixed bottom-6 left-1/2 -translate-x-1/2 w-[90%] max-w-[400px] rounded-full backdrop-blur-2xl bg-black/40 border border-white/10 shadow-2xl shadow-black/50 z-50 transition-all duration-500 ${isEditing ? 'translate-y-[200%] opacity-0 pointer-events-none' : 'translate-y-0 opacity-100'}`}>
        <div className="max-w-md mx-auto flex justify-around items-end py-2">
          <NavItem
            id="projects"
            label={t('tabs.projects')}
            active={activeTab === 'projects'}
            icon={
              <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10" />
              </svg>
            }
          />
          <NavItem
            id="plan"
            label={t('tabs.plan')}
            active={activeTab === 'plan'}
            icon={
              <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
              </svg>
            }
          />
          <NavItem
            id="execute"
            label={t('tabs.execute')}
            active={activeTab === 'execute'}
            isMain={true}
            icon={
              <svg className="w-7 h-7" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M14.752 11.168l-3.197-2.132A1 1 0 0010 9.87v4.263a1 1 0 001.555.832l3.197-2.132a1 1 0 000-1.664z" />
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
            }
          />
          <NavItem
            id="review"
            label={t('tabs.reflect')}
            active={activeTab === 'review'}
            icon={
              <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M20.354 15.354A9 9 0 018.646 3.646 9.003 9.003 0 0012 21a9.003 9.003 0 008.354-5.646z" />
              </svg>
            }
          />
          <NavItem
            id="patterns"
            label={t('patterns.title')}
            active={activeTab === 'patterns'}
            icon={
              <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M13 10V3L4 14h7v7l9-11h-7z" />
              </svg>
            }
          />
        </div>
      </nav>

      {/* Global Floating Add Button - Removed per user request */}

      {/* Global New Task Modal */}
      {showGlobalTaskModal && (
        <div className="fixed inset-0 z-50 flex items-end justify-center animate-fadeIn">
          <div
            className="absolute inset-0 bg-black/60 backdrop-blur-sm"
            onClick={() => setShowGlobalTaskModal(false)}
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
                <h2 className="text-lg font-semibold text-white">
                  {globalTaskMode === 'reminder' ? t('modals.newReminder') : globalTaskMode === 'priority' ? t('modals.newPriority') : t('modals.newTask')}
                </h2>
                <button
                  onClick={() => setShowGlobalTaskModal(false)}
                  className="w-8 h-8 rounded-full bg-white/10 flex items-center justify-center text-slate-400 hover:bg-white/20 transition-colors"
                >
                  <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </button>
              </div>

              {/* Mode Toggle - Only show if not in priority mode */}
              {globalTaskMode !== 'priority' && (
                <div className="flex gap-2 mt-3">
                  <button
                    onClick={() => setGlobalTaskMode('task')}
                    className={`flex-1 py-2 rounded-xl text-sm font-medium transition-all ${globalTaskMode === 'task'
                      ? 'bg-amber-500/80 text-white'
                      : 'bg-white/10 text-slate-400'
                      }`}
                  >
                    ⏰ {t('common.scheduledTask')}
                  </button>
                  <button
                    onClick={() => setGlobalTaskMode('reminder')}
                    className={`flex-1 py-2 rounded-xl text-sm font-medium transition-all ${globalTaskMode === 'reminder'
                      ? 'bg-purple-500/80 text-white'
                      : 'bg-white/10 text-slate-400'
                      }`}
                  >
                    📌 {t('common.reminder')}
                  </button>
                </div>
              )}

              {/* Priority slot indicator */}
              {globalTaskMode === 'priority' && globalTaskPrioritySlot !== null && (
                <div className="mt-3 flex items-center gap-2">
                  <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-purple-500/30 to-indigo-600/30 border border-purple-500/30 flex items-center justify-center">
                    <span className="text-purple-400 text-sm font-bold">{globalTaskPrioritySlot + 1}</span>
                  </div>
                  <span className="text-slate-400 text-sm">{t('common.priority')} #{globalTaskPrioritySlot + 1}</span>
                </div>
              )}
            </div>

            {/* Body */}
            <div className="px-5 py-4 max-h-[60vh] overflow-y-auto">

              {/* Title & Icon Header */}
              <div className="mb-4">
                <label className="text-slate-400 text-sm mb-2 block">
                  {globalTaskMode === 'reminder' ? t('common.reminder') : globalTaskMode === 'priority' ? t('common.priority') : t('common.task')}
                </label>
                <div className="flex gap-3">
                  <button
                    onClick={() => setGlobalTaskShowIconPicker(!globalTaskShowIconPicker)}
                    className="w-12 h-12 rounded-xl bg-white/5 border border-white/10 flex items-center justify-center text-2xl hover:bg-white/10 transition-colors"
                  >
                    {globalTaskIcon}
                  </button>
                  <input
                    type="text"
                    value={globalTaskName}
                    onChange={(e) => setGlobalTaskName(e.target.value)}
                    placeholder={globalTaskMode === 'reminder' ? t('placeholders.reminder') : t('placeholders.whatToDo')}
                    className="flex-1 px-4 py-3 bg-white/5 border border-white/10 rounded-xl text-white placeholder:text-slate-500 outline-none focus:border-amber-500/50"
                    autoFocus
                  />
                </div>

                {/* Icon Picker (Conditional) */}
                {globalTaskShowIconPicker && (
                  <div className="mt-4 p-4 rounded-xl bg-white/5 border border-white/5 animate-fadeIn">
                    <div className="flex flex-wrap gap-2">
                      {globalIconOptions.map(icon => (
                        <button
                          key={icon}
                          onClick={() => {
                            setGlobalTaskIcon(icon);
                            setGlobalTaskShowIconPicker(false);
                          }}
                          className={`w-10 h-10 rounded-lg flex items-center justify-center text-xl transition-colors
                            ${globalTaskIcon === icon ? 'bg-amber-500/20 text-amber-500' : 'hover:bg-white/10'}`}
                        >
                          {icon}
                        </button>
                      ))}
                    </div>
                  </div>
                )}
              </div>

              {/* iOS Style Details List - For Tasks, Reminders & Priorities */}
              {(globalTaskMode === 'task' || globalTaskMode === 'reminder' || globalTaskMode === 'priority') && (
                <>
                  <TaskDetailsList
                    date={globalTaskDate}
                    startTime={`${globalTaskStartHour}:${globalTaskStartMinute.toString().padStart(2, '0')}`}
                    endTime={`${globalTaskEndHour}:${globalTaskEndMinute.toString().padStart(2, '0')}`}
                    alerts={globalTaskAlerts}
                    onDateClick={() => {
                      setGlobalTaskShowDate(!globalTaskShowDate);
                      setGlobalTaskShowTime(false);
                      setGlobalTaskShowAlerts(false);
                      setGlobalTaskShowRepeat(false);
                    }}
                    onTimeClick={() => {
                      setGlobalTaskShowTime(!globalTaskShowTime);
                      setGlobalTaskShowAlerts(false);
                      setGlobalTaskShowDate(false);
                      setGlobalTaskShowRepeat(false);
                    }}
                    onAlertsClick={() => {
                      setGlobalTaskShowAlerts(!globalTaskShowAlerts);
                      setGlobalTaskShowTime(false);
                      setGlobalTaskShowDate(false);
                      setGlobalTaskShowRepeat(false);
                    }}
                    onRepeatClick={() => {
                      setGlobalTaskShowRepeat(!globalTaskShowRepeat);
                      setGlobalTaskShowAlerts(false);
                      setGlobalTaskShowTime(false);
                      setGlobalTaskShowDate(false);
                    }}
                    themeColor="amber"
                    showDatePicker={globalTaskShowDate}
                    onDateChange={(date) => {
                      setGlobalTaskDate(date);
                      setGlobalTaskShowDate(false);
                    }}
                    showTimePicker={globalTaskShowTime}
                    onStartTimeChange={({ hour, minute }) => {
                      setGlobalTaskStartHour(hour);
                      setGlobalTaskStartMinute(minute);
                    }}
                    onEndTimeChange={({ hour, minute }) => {
                      setGlobalTaskEndHour(hour);
                      setGlobalTaskEndMinute(minute);
                    }}
                    repeat={globalTaskRepeat}
                    showRepeatPicker={globalTaskShowRepeat}
                    onRepeatChange={(repeat) => setGlobalTaskRepeat(repeat)}
                    t={t}
                    locale={currentLocale}
                  />


                  {/* Alerts Picker */}
                  {globalTaskShowAlerts && (
                    <div className="mb-6 p-4 rounded-2xl bg-white/5 border border-white/5 animate-fadeIn">
                      <label className="text-xs font-medium text-slate-400 uppercase tracking-wide mb-3 block">{t('common.manageAlerts')}</label>
                      <div className="space-y-2">
                        {globalTaskAlerts.map((alert, index) => (
                          <div key={index} className="flex items-center justify-between p-3 rounded-xl bg-white/5 border border-white/5">
                            <span className="text-sm text-slate-200">{alert.label}</span>
                            <button
                              onClick={() => setGlobalTaskAlerts(prev => prev.filter((_, i) => i !== index))}
                              className="text-rose-400 hover:text-rose-300 p-1"
                            >
                              <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                              </svg>
                            </button>
                          </div>
                        ))}
                        <div className="pt-2 grid grid-cols-3 gap-2">
                          {globalAlertOptions.map(opt => (
                            <button
                              key={opt.label}
                              onClick={() => {
                                if (!globalTaskAlerts.some(a => a.value === opt.value)) {
                                  setGlobalTaskAlerts(prev => [...prev, opt]);
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
                </>
              )}

              {/* Value (New) */}
              <div className="mb-4">
                <label className="text-slate-400 text-sm mb-2 block">{t('common.impactValue')}: {globalTaskValue}/10</label>
                <input
                  type="range"
                  min="1"
                  max="10"
                  value={globalTaskValue}
                  onChange={(e) => setGlobalTaskValue(parseInt(e.target.value))}
                  className="w-full accent-amber-500"
                />
              </div>

              {/* Energy Level */}
              <div className="mb-4">
                <label className="text-xs font-medium text-slate-400 uppercase tracking-wide mb-2 block">{t('common.energyLevel')}</label>
                <div className="flex gap-2">
                  {['low', 'medium', 'high'].map(e => (
                    <button
                      key={e}
                      onClick={() => setGlobalTaskEnergy(e)}
                      className={`flex-1 py-2.5 rounded-xl font-medium text-sm transition-all duration-200
                        ${globalTaskEnergy === e
                          ? e === 'low'
                            ? 'bg-emerald-500/80 text-white shadow-lg shadow-emerald-500/30'
                            : e === 'medium'
                              ? 'bg-amber-500/80 text-white shadow-lg shadow-amber-500/30'
                              : 'bg-rose-500/80 text-white shadow-lg shadow-rose-500/30'
                          : 'bg-white/10 text-slate-400 hover:bg-white/20'}`}
                    >
                      {e === 'low' ? `🌱 ${t('energyLevels.light')}` : e === 'medium' ? `⚡ ${t('energyLevels.moderate')}` : `🔥 ${t('energyLevels.heavy')}`}
                    </button>
                  ))}
                </div>
              </div>

              {/* Notes (New) */}
              <div className="mb-4">
                <label className="text-slate-400 text-sm mb-2 block">{t('common.notes')}</label>
                <textarea
                  value={globalTaskNotes}
                  onChange={(e) => setGlobalTaskNotes(e.target.value)}
                  placeholder={t('placeholders.additionalDetails')}
                  rows={2}
                  className="w-full px-4 py-3 bg-white/5 border border-white/10 rounded-xl text-white placeholder:text-slate-500 outline-none focus:border-amber-500/50 resize-none"
                />
              </div>

              {/* Non-negotiable Toggle - Only for scheduled tasks */}

              {/* Non-negotiable Toggle - Only for scheduled tasks */}
              {globalTaskMode === 'task' && (
                <button
                  onClick={() => setGlobalTaskIsNonNegotiable(!globalTaskIsNonNegotiable)}
                  className={`w-full py-3 rounded-xl font-medium text-sm transition-all duration-200 flex items-center justify-center gap-2
                    ${globalTaskIsNonNegotiable
                      ? 'bg-rose-500/20 text-rose-300 border border-rose-500/30'
                      : 'bg-white/5 text-slate-400 border border-white/10 hover:bg-white/10'}`}
                >
                  <span>{globalTaskIsNonNegotiable ? '🎯' : '○'}</span>
                  <span>{t('common.nonNegotiable')}</span>
                </button>
              )}
            </div>

            {/* Footer */}
            <div className="px-5 py-4 border-t border-white/10">
              <div className="flex gap-3">
                <button
                  onClick={() => setShowGlobalTaskModal(false)}
                  className="flex-1 py-3 rounded-xl font-medium text-slate-400 bg-white/10 hover:bg-white/20 transition-all"
                >
                  {t('common.cancel')}
                </button>
                <button
                  onClick={createGlobalTask}
                  disabled={!globalTaskName.trim()}
                  className={`flex-1 py-3 rounded-xl font-semibold transition-all duration-200 flex items-center justify-center gap-2
                    ${globalTaskName.trim()
                      ? globalTaskMode === 'reminder'
                        ? 'bg-gradient-to-r from-purple-500 to-indigo-500 text-white shadow-lg shadow-purple-500/30'
                        : globalTaskMode === 'priority'
                          ? 'bg-gradient-to-r from-purple-500 to-indigo-500 text-white shadow-lg shadow-purple-500/30'
                          : 'bg-gradient-to-r from-amber-500 to-orange-500 text-white shadow-lg shadow-amber-500/30'
                      : 'bg-white/5 text-slate-600 cursor-not-allowed'}`}
                >
                  <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
                  </svg>
                  {globalTaskMode === 'reminder' ? `${t('common.add')} ${t('common.reminder')}` : globalTaskMode === 'priority' ? `${t('common.add')} ${t('common.priority')}` : t('projects.addTask')}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Settings Modal */}
      {showSettingsModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center animate-fadeIn">
          {/* Backdrop */}
          <div
            className="absolute inset-0 bg-black/60 backdrop-blur-sm"
            onClick={() => setShowSettingsModal(false)}
          />

          {/* Modal Card */}
          <div className="relative w-[90%] max-w-sm glass-card rounded-3xl overflow-hidden shadow-2xl animate-popIn">
            <div className="p-6">
              <h3 className="text-xl font-semibold text-white mb-6">{t('settings.title')}</h3>

              {/* Profile Section */}
              <div className="mb-6">
                <label className="block text-xs font-medium text-slate-400 uppercase tracking-widest mb-2">
                  {t('settings.profileName')}
                </label>
                <div className="relative">
                  <div className="absolute left-3 top-1/2 -translate-y-1/2 text-lg">
                    👋
                  </div>
                  <input
                    type="text"
                    value={username}
                    onChange={(e) => setUsername(e.target.value)}
                    className="w-full pl-10 pr-4 py-3 bg-white/5 border border-white/10 rounded-xl text-white outline-none focus:border-purple-500/50 transition-colors"
                  />
                </div>
              </div>

              {/* Language Selector */}
              <div className="mb-6">
                <label className="block text-xs font-medium text-slate-400 uppercase tracking-widest mb-2">
                  {t('settings.language')}
                </label>
                <div className="grid grid-cols-2 gap-2">
                  {[
                    { code: 'en', label: 'English' },
                    { code: 'fr', label: 'Français' },
                    { code: 'zh', label: '中文' },
                    { code: 'ru', label: 'Русский' }
                  ].map((lang) => (
                    <button
                      key={lang.code}
                      onClick={() => setLanguage(lang.code)}
                      className={`px-4 py-2 rounded-xl text-sm font-medium transition-all ${language === lang.code
                        ? 'bg-purple-500 text-white shadow-lg shadow-purple-500/25'
                        : 'bg-white/5 text-slate-400 hover:bg-white/10 hover:text-white'
                        }`}
                    >
                      {lang.label}
                    </button>
                  ))}
                </div>
              </div>

              {/* Data Section */}
              <div>
                <button
                  onClick={() => {
                    if (window.confirm(t('settings.resetWarning'))) {
                      localStorage.clear();
                      window.location.reload();
                    }
                  }}
                  className="w-full py-3 rounded-xl bg-rose-500/10 text-rose-400 border border-rose-500/20 hover:bg-rose-500/20 transition-all font-medium text-sm flex items-center justify-center gap-2"
                >
                  <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                  </svg>
                  {t('settings.resetButton')}
                </button>
              </div>

              {/* Install App Section */}
              <div className="mt-6 mb-6">
                <label className="block text-xs font-medium text-slate-400 uppercase tracking-widest mb-2">
                  {t('settings.install')}
                </label>
                {installPrompt ? (
                  <button
                    onClick={() => {
                      if (installPrompt) {
                        installPrompt.prompt();
                        installPrompt.userChoice.then((choiceResult) => {
                          if (choiceResult.outcome === 'accepted') {
                            setInstallPrompt(null);
                          }
                        });
                      }
                    }}
                    className="w-full py-3 rounded-xl bg-gradient-to-r from-amber-500 to-orange-500 text-white shadow-lg shadow-amber-500/20 hover:shadow-amber-500/40 transition-all font-bold text-sm flex items-center justify-center gap-2"
                  >
                    <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" />
                    </svg>
                    Install App
                  </button>
                ) : (
                  <div className="p-3 bg-white/5 rounded-xl border border-white/10 text-center">
                    <p className="text-xs text-slate-400 mb-2">
                      To install on iOS:
                    </p>
                    <div className="flex items-center justify-center gap-2 text-sm text-white font-medium">
                      Tap <span className="text-xl">⎋</span> Share &rarr; Add to Home Screen
                    </div>
                  </div>
                )}
              </div>
            </div>

            {/* Footer */}
            <div className="bg-white/5 p-4 flex justify-end">
              <button
                onClick={() => setShowSettingsModal(false)}
                className="px-6 py-2 rounded-xl bg-white/10 hover:bg-white/20 text-white font-medium transition-colors"
              >
                {t('settings.done')}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Global Styles - Liquid Glass */}
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Inter:wght@300;400;500;600;700&display=swap');
        
        * {
          font-family: -apple-system, BlinkMacSystemFont, 'SF Pro Display', 'SF Pro Text', 'Inter', 'Segoe UI', Roboto, sans-serif;
          -webkit-font-smoothing: antialiased;
          -moz-osx-font-smoothing: grayscale;
        }
        
        @keyframes fadeIn {
          from { opacity: 0; transform: translateY(10px); }
          to { opacity: 1; transform: translateY(0); }
        }
        @keyframes slideUp {
          from { opacity: 0; transform: translateY(20px); }
          to { opacity: 1; transform: translateY(0); }
        }
        @keyframes popIn {
          0% { opacity: 0; transform: scale(0.8) rotate(0deg); }
          50% { transform: scale(1.05) rotate(2deg); }
          100% { opacity: 1; transform: scale(1) rotate(3deg); }
        }
        @keyframes pulse-ring {
          0% { box-shadow: 0 0 0 0 rgba(139, 92, 246, 0.4); }
          70% { box-shadow: 0 0 0 10px rgba(139, 92, 246, 0); }
          100% { box-shadow: 0 0 0 0 rgba(139, 92, 246, 0); }
        }
        @keyframes shimmer {
          0% { background-position: -200% 0; }
          100% { background-position: 200% 0; }
        }
        @keyframes glow {
          0%, 100% { opacity: 0.5; }
          50% { opacity: 1; }
        }
        @keyframes fallingSand {
          0% { 
            transform: translateY(0) scale(1);
            opacity: 0.8;
          }
          50% {
            opacity: 1;
          }
          100% { 
            transform: translateY(35px) scale(0.6);
            opacity: 0;
          }
        }
        @keyframes sandStream {
          0% { 
            transform: translateY(0);
            opacity: 0.7;
          }
          100% { 
            transform: translateY(15px);
            opacity: 0.3;
          }
        }
        @keyframes sandPile {
          0%, 100% { 
            transform: scaleY(1);
          }
          50% { 
            transform: scaleY(1.02);
          }
        }
        @keyframes glassShine {
          0% { 
            opacity: 0.1;
            transform: translateX(-100%);
          }
          50% {
            opacity: 0.3;
          }
          100% { 
            opacity: 0.1;
            transform: translateX(100%);
          }
        }
        @keyframes timePulse {
          0%, 100% { 
            box-shadow: 0 0 10px rgba(251, 191, 36, 0.4);
          }
          50% { 
            box-shadow: 0 0 20px rgba(251, 191, 36, 0.7);
          }
        }
        .animate-fadeIn { animation: fadeIn 0.4s ease-out; }
        .animate-slideUp { animation: slideUp 0.3s ease-out; }
        .animate-popIn { animation: popIn 0.2s cubic-bezier(0.34, 1.56, 0.64, 1); }
        .animate-pulse-ring { animation: pulse-ring 1s ease-out infinite; }
        .animate-shimmer { 
          animation: shimmer 3s linear infinite;
          background-size: 200% 100%;
        }
        .animate-glow { animation: glow 2s ease-in-out infinite; }
        .animate-sand-stream { animation: sandStream 0.5s ease-in infinite; }
        .animate-time-pulse { animation: timePulse 2s ease-in-out infinite; }
        .safe-area-pb { padding-bottom: env(safe-area-inset-bottom, 0); }
        
        /* Apple-style Typography */
        h1, h2, h3 {
          font-weight: 600;
          letter-spacing: -0.02em;
        }
        
        p, span, label {
          letter-spacing: -0.01em;
        }
        
        /* Liquid Glass Effects */
        .glass {
          background: rgba(255, 255, 255, 0.08);
          backdrop-filter: blur(20px);
          -webkit-backdrop-filter: blur(20px);
          border: 1px solid rgba(255, 255, 255, 0.1);
        }
        .glass-dark {
          background: rgba(15, 23, 42, 0.8);
          backdrop-filter: blur(20px);
          -webkit-backdrop-filter: blur(20px);
        }
        .glass-card {
          background: linear-gradient(135deg, rgba(255, 255, 255, 0.1) 0%, rgba(255, 255, 255, 0.05) 100%);
          backdrop-filter: blur(20px);
          -webkit-backdrop-filter: blur(20px);
          border: 1px solid rgba(255, 255, 255, 0.1);
          box-shadow: 0 8px 32px rgba(0, 0, 0, 0.3), inset 0 1px 0 rgba(255, 255, 255, 0.1);
        }
        .glass-input {
          background: rgba(255, 255, 255, 0.05);
          backdrop-filter: blur(10px);
          -webkit-backdrop-filter: blur(10px);
          border: 1px solid rgba(255, 255, 255, 0.1);
        }
        .glass-button {
          background: linear-gradient(135deg, rgba(139, 92, 246, 0.3) 0%, rgba(99, 102, 241, 0.3) 100%);
          backdrop-filter: blur(10px);
          -webkit-backdrop-filter: blur(10px);
          border: 1px solid rgba(139, 92, 246, 0.3);
        }
        .glass-button:hover {
          background: linear-gradient(135deg, rgba(139, 92, 246, 0.5) 0%, rgba(99, 102, 241, 0.5) 100%);
        }
        .text-gradient {
          background: linear-gradient(135deg, #c084fc 0%, #818cf8 50%, #60a5fa 100%);
          -webkit-background-clip: text;
          -webkit-text-fill-color: transparent;
          background-clip: text;
        }
      `}</style>
    </div>
  );
};

export default LifeArchitect;
