import React, { useState, useEffect } from 'react';

// ============================================
// LIFE ARCHITECT - AI Productivity Coach
// ============================================

// Questions for reflection
const reflectionQuestions = [
  { key: 'activities', question: "What did you do today?", placeholder: "List your main activities...", icon: "📝" },
  { key: 'topResult', question: "What is the one most important result?", placeholder: "The biggest win or outcome...", icon: "🏆" },
  { key: 'energyDrain', question: "What drained your energy?", placeholder: "What felt heavy or exhausting...", icon: "🔋" },
  { key: 'didWell', question: "One thing you did well?", placeholder: "Something you're proud of...", icon: "⭐" },
  { key: 'lesson', question: "One lesson from today?", placeholder: "What did you learn...", icon: "💡" },
];

// Reflection input with voice recording option
const ReflectionInput = ({ question, placeholder, icon, defaultValue, onBlurSave, onValueChange }) => {
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
        console.log('Speech recognition started');
        setIsRecording(true);
      };

      recognition.onresult = (event) => {
        console.log('Speech recognition result:', event);
        const transcript = event.results[0][0].transcript;
        console.log('Transcript:', transcript);

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
        console.log('Speech recognition ended');
        setIsRecording(false);
      };

      recognitionRef.current = recognition;
      recognition.start();
      console.log('Recognition start called');

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

// Simple localStorage helpers - no persistence for now to avoid issues
const loadFromStorage = (key, defaultValue) => defaultValue;
const saveToStorage = (key, value) => { };

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
      tasks: []
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
  const tasks = tasksByDate[getDateKey(selectedExecuteDate)] || [];

  // Set tasks for a specific date
  const setTasksForDate = (date, newTasks) => {
    const key = getDateKey(date);
    setTasksByDate(prev => ({
      ...prev,
      [key]: typeof newTasks === 'function' ? newTasks(prev[key] || []) : newTasks
    }));
  };

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

  const globalIconOptions = [
    '📌', '📧', '💪', '📝', '📞', '📚', '🧘', '🎯', '💼', '🏃',
    '🍎', '💡', '🎨', '🎵', '📊', '🛒', '🏠', '💰', '✈️', '🎮',
    '🧹', '👥', '📱', '💻', '🔧', '📦', '🎁', '❤️', '⭐', '🔔'
  ];

  const globalReminderOptions = [
    { value: null, label: 'None' },
    { value: 5, label: '5 min' },
    { value: 10, label: '10 min' },
    { value: 15, label: '15 min' },
    { value: 30, label: '30 min' },
    { value: 60, label: '1 hour' }
  ];

  // Open global task modal
  const openGlobalTaskModal = (mode = 'task', prioritySlot = null) => {
    const now = new Date();
    const nextHour = Math.min(22, now.getHours() + 1);
    setGlobalTaskName('');
    setGlobalTaskIcon('📌');
    setGlobalTaskEnergy('medium');
    setGlobalTaskStartHour(nextHour);
    setGlobalTaskStartMinute(0);
    setGlobalTaskEndHour(Math.min(23, nextHour + 1));
    setGlobalTaskEndMinute(0);
    setGlobalTaskReminder(null);
    setGlobalTaskIsNonNegotiable(false);
    setGlobalTaskMode(mode);
    setGlobalTaskPrioritySlot(prioritySlot);
    setShowGlobalTaskModal(true);
  };

  // Create task/reminder from global modal
  const createGlobalTask = () => {
    if (!globalTaskName.trim()) return;

    if (globalTaskMode === 'reminder') {
      // Add as reminder
      const newReminder = {
        id: Date.now(),
        icon: globalTaskIcon,
        name: globalTaskName.trim(),
        energy: globalTaskEnergy
      };
      setReminders(prev => [...prev, newReminder]);
    } else if (globalTaskMode === 'priority' && globalTaskPrioritySlot !== null) {
      // Add to specific priority slot
      const newTask = {
        id: Date.now(),
        icon: globalTaskIcon,
        name: globalTaskName.trim(),
        energy: globalTaskEnergy
      };
      const newPriorities = [...priorities];
      newPriorities[globalTaskPrioritySlot] = {
        slot: globalTaskPrioritySlot + 1,
        task: newTask,
        energy: globalTaskEnergy,
        time: null
      };
      setPriorities(newPriorities);
    } else {
      // Add as scheduled task
      const targetDate = activeTab === 'execute' ? selectedExecuteDate : selectedPlanDate;
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
        duration: `${Math.round((endTime - startTime) / 60000)}m`,
        completed: false,
        isNonNegotiable: globalTaskIsNonNegotiable,
        reminder: globalTaskReminder
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
      const existingTasks = tasksByDate[dateKey] || [];

      // Add priorities
      plan.priorities?.forEach((p, idx) => {
        if (p.task) {
          const duration = parseTime(p.time || '1h');
          const endTime = new Date(startTime.getTime() + duration * 60000);
          const existingTask = existingTasks.find(t => t.id === `p${idx}`);
          dayTasks.push({
            id: `p${idx}`,
            icon: p.task.icon,
            title: p.task.name,
            startTime: new Date(startTime),
            endTime: endTime,
            duration: p.time || '1h',
            energy: p.energy || p.task.energy,
            color: colors[colorIndex % colors.length],
            isNonNegotiable: false,
            completed: existingTask?.completed || false
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

  const parseTime = (timeStr) => {
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

  const formatTimeRange = (start, end) => {
    const formatT = (d) => d.toLocaleTimeString('en-US', { hour: 'numeric', minute: '2-digit', hour12: true });
    return `${formatT(start)} - ${formatT(end)}`;
  };

  const formatElapsed = (seconds) => {
    const h = Math.floor(seconds / 3600);
    const m = Math.floor((seconds % 3600) / 60);
    const s = seconds % 60;
    if (h > 0) return `${h}:${m.toString().padStart(2, '0')}:${s.toString().padStart(2, '0')}`;
    return `${m}:${s.toString().padStart(2, '0')}`;
  };

  const addToNextSlot = (reminder) => {
    // Create a copy of the reminder for the slot (don't remove from reminders)
    const taskCopy = { ...reminder, id: Date.now() }; // New ID so it's independent

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

    setTasksByDate(prev => ({
      ...prev,
      [dateKey]: (prev[dateKey] || []).map(t =>
        t.id === taskId ? { ...t, completed: true } : t
      )
    }));

    if (task) {
      setCompletedTasks(prev => [...prev, { ...task, completed: true }]);

      // If this task came from a project, mark the project task as completed too
      if (task.projectId && task.projectTaskId) {
        toggleProjectTask(task.projectId, task.projectTaskId);
      }
    }
    if (activeTask?.id === taskId) {
      setActiveTask(null);
      setElapsedTime(0);
      setIsPaused(false);
    }
  };

  const EnergyBadge = ({ energy, active = true, onClick }) => {
    const colors = {
      low: active ? 'bg-emerald-500 text-white' : 'bg-slate-200 text-slate-500',
      medium: active ? 'bg-amber-500 text-white' : 'bg-slate-200 text-slate-500',
      high: active ? 'bg-rose-500 text-white' : 'bg-slate-200 text-slate-500'
    };
    const labels = { low: 'Low', medium: 'Med', high: 'High' };

    return (
      <button
        onClick={onClick}
        className={`px-2.5 py-1 rounded-full text-xs font-medium transition-all duration-200 ${colors[energy]} ${onClick ? 'hover:scale-105 cursor-pointer' : ''}`}
      >
        {labels[energy]}
      </button>
    );
  };

  const TimeDropdown = ({ value, onChange }) => {
    const options = [
      '15m', '30m', '45m', '1h', '1h 15m', '1h 30m', '1h 45m', '2h',
      '2h 30m', '3h', '3h 30m', '4h', '4h 30m', '5h', '5h 30m', '6h', '6h 30m', '7h', '7h 30m', '8h'
    ];

    return (
      <select
        value={value || ''}
        onChange={(e) => onChange(e.target.value)}
        className="px-3 py-1.5 bg-white/10 rounded-lg text-sm text-slate-300 border border-white/10 focus:ring-2 focus:ring-purple-500/30 outline-none cursor-pointer"
      >
        <option value="" className="bg-slate-800">Time</option>
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
    // planEditingReminder lifted to App as planEditingReminder
    const [editReminderName, setEditReminderName] = useState('');
    const [editReminderIcon, setEditReminderIcon] = useState('📌');
    const [editReminderEnergy, setEditReminderEnergy] = useState('medium');

    // Edit project task state (for editing in Plan screen)
    // planEditingTask, planEditingTaskProject lifted to App as planEditingTask, planEditingTaskProject
    const [planTaskData, setPlanTaskData] = useState({
      title: '',
      value: 5,
      energy: 'medium',
      timeEstimate: 30,
      dueDate: '',
      notes: ''
    });

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
      setPlanTaskData({
        title: task.title || '',
        value: task.value || 5,
        energy: task.energy || 'medium',
        timeEstimate: task.timeEstimate || 30,
        dueDate: task.dueDate || '',
        notes: task.notes || ''
      });
      setPlanEditingTask(task);
      setPlanEditingTaskProject(project);
    };

    const savePlanTask = () => {
      if (!planTaskData.title.trim() || !planEditingTaskProject) return;
      updateProjectTask(planEditingTaskProject.id, planEditingTask.id, planTaskData);
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
    };

    // Save reminder edits
    const saveReminderEdit = () => {
      if (!planEditingReminder || !editReminderName.trim()) return;

      setReminders(prev => prev.map(r => {
        if (r.id === planEditingReminder.id) {
          return {
            ...r,
            name: editReminderName.trim(),
            icon: editReminderIcon,
            energy: editReminderEnergy
          };
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
            {selectedPlanDate.toLocaleDateString('en-US', { month: 'long', day: 'numeric' })}
          </p>
          <h1 className="text-3xl font-semibold text-white tracking-tight">
            {selectedPlanDate.toDateString() === today.toDateString()
              ? 'Plan Your Day'
              : selectedPlanDate.toLocaleDateString('en-US', { weekday: 'long' })}
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
                Today
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
                {weekDays.length > 0 && weekDays[3].date.toLocaleDateString('en-US', { month: 'long', year: 'numeric' })}
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
            <div className="grid grid-cols-7 gap-0 mb-1 border-b border-white/10 pb-2">
              {['Mo', 'Tu', 'We', 'Th', 'Fr', 'Sa', 'Su'].map(day => (
                <div key={day} className="text-center text-xs text-slate-500 font-medium py-1">
                  {day}
                </div>
              ))}
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
        )}

        {/* Week Calendar with Notion-style Project Timelines */}
        {(() => {
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
        })()}

        {/* Drag hint when dragging tasks */}
        {isDragging && draggedItem?.type === 'p' && (
          <div className="mb-4 text-center">
            <span className="text-purple-400/80 text-xs font-medium px-3 py-1.5 rounded-full bg-purple-500/10 border border-purple-500/20">
              ↑ Drop on a day to move task
            </span>
          </div>
        )}

        {/* Projects Section */}
        <div className="mb-4">
          <button
            onClick={() => setProjectsExpanded(!projectsExpanded)}
            className="w-full glass-card rounded-2xl p-4 flex items-center gap-3 mb-3 hover:bg-white/10 transition-all"
            style={{
              background: 'linear-gradient(135deg, rgba(6,182,212,0.15) 0%, rgba(139,92,246,0.15) 100%)',
              backdropFilter: 'blur(10px)',
              border: '1px solid rgba(6,182,212,0.2)'
            }}
          >
            <div className="w-10 h-10 rounded-xl flex items-center justify-center"
              style={{ background: 'linear-gradient(135deg, rgba(6,182,212,0.3) 0%, rgba(139,92,246,0.3) 100%)' }}>
              <span className="text-xl">📁</span>
            </div>
            <div className="flex-1 text-left">
              <span className="text-white font-medium">Projects</span>
              <p className="text-cyan-400/70 text-xs">{projects.filter(p => p.status === 'active').length} active</p>
            </div>
            <svg className={`w-5 h-5 text-cyan-400 transition-transform duration-300 ${projectsExpanded ? 'rotate-180' : ''}`} fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
            </svg>
          </button>

          <div className={`space-y-2 overflow-hidden transition-all duration-300 ${projectsExpanded ? 'max-h-[1200px] opacity-100' : 'max-h-0 opacity-0'}`}>
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
                  {/* Project Header - Click to expand/collapse */}
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
                    <span className="text-slate-500 text-xs">{pendingTasks.length} tasks</span>
                  </button>

                  {/* Project Tasks - Expandable */}
                  <div className={`overflow-hidden transition-all duration-300 ${isExpanded ? 'max-h-[600px]' : 'max-h-0'}`}>
                    <div className="px-4 pb-4 space-y-2">
                      {pendingTasks.map(task => (
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
                                <span className="text-slate-500 text-xs">Impact: {task.value}</span>
                              </div>
                            </div>
                          </div>
                          <button
                            onClick={(e) => {
                              e.stopPropagation();
                              // Add project task to next available priority slot
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
                          All tasks completed! 🎉
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              );
            })}

            {/* View All Projects Button */}
            <button
              onClick={() => setActiveTab('projects')}
              className="w-full p-3.5 rounded-2xl border border-dashed border-white/20 text-slate-500 
                hover:border-cyan-500/50 hover:text-cyan-400 hover:bg-cyan-500/10 
                transition-all duration-200 flex items-center justify-center gap-2"
            >
              <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10" />
              </svg>
              <span className="font-medium">Manage Projects</span>
            </button>
          </div>
        </div>

        {/* Reminders Section */}
        <div className="mb-8">
          <button
            onClick={() => setRemindersExpanded(!remindersExpanded)}
            className="w-full glass-card rounded-2xl p-4 flex items-center gap-3 mb-3 hover:bg-white/10 transition-all"
            style={{
              background: 'linear-gradient(135deg, rgba(168,85,247,0.15) 0%, rgba(236,72,153,0.15) 100%)',
              backdropFilter: 'blur(10px)',
              border: '1px solid rgba(168,85,247,0.2)'
            }}
          >
            <div className="w-10 h-10 rounded-xl flex items-center justify-center"
              style={{ background: 'linear-gradient(135deg, rgba(168,85,247,0.3) 0%, rgba(236,72,153,0.3) 100%)' }}>
              <span className="text-xl">💡</span>
            </div>
            <div className="flex-1 text-left">
              <span className="text-white font-medium">Reminders</span>
              <p className="text-purple-400/70 text-xs">{reminders.length} items</p>
            </div>
            <svg className={`w-5 h-5 text-purple-400 transition-transform duration-300 ${remindersExpanded ? 'rotate-180' : ''}`} fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
            </svg>
          </button>

          <div className={`space-y-2 overflow-hidden transition-all duration-300 ${remindersExpanded ? 'max-h-[600px] opacity-100' : 'max-h-0 opacity-0'}`}>
            {reminders.map(reminder => (
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
                  <div className="text-slate-500">
                    <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                    </svg>
                  </div>
                  <span className="text-xl">{reminder.icon}</span>
                  <span className="text-slate-200 font-medium flex-1 truncate">{reminder.name}</span>
                  <EnergyBadge energy={reminder.energy} />
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
              className="w-full p-3.5 rounded-2xl text-slate-500 
                hover:text-purple-400 
                transition-all duration-200 flex items-center justify-center gap-2"
              style={{
                background: 'transparent',
                border: '1px dashed rgba(168,85,247,0.3)'
              }}
            >
              <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
              </svg>
              <span className="font-medium">New Reminder</span>
            </button>
          </div>
        </div>

        {/* Priorities */}
        <div className="mb-8">
          <h2 className="text-center text-sm font-medium text-slate-400 uppercase tracking-widest mb-4">
            {priorities.length <= 3 ? 'Top 3 Priorities' : `Today's ${priorities.length} Tasks`}
          </h2>
          <div className="space-y-3">
            {priorities.map((priority, idx) => (
              <div
                key={idx}
                onMouseDown={(e) => priority.task && startDrag(e, 'p', idx)}
                onMouseEnter={() => handleSlotMouseEnter('p', idx)}
                onMouseLeave={handleSlotMouseLeave}
                onClick={() => !priority.task && !isDragging && openGlobalTaskModal('priority', idx)}
                className={`p-4 glass-card rounded-2xl transition-all duration-200 ease-out select-none
                  ${priority.task ? 'ring-1 ring-purple-500/30 cursor-grab active:cursor-grabbing' : 'cursor-pointer hover:bg-white/10 hover:scale-[1.01]'} 
                  ${isDragging && dragOverSlot?.type === 'p' && dragOverSlot?.index === idx
                    ? 'ring-2 ring-purple-400 scale-[1.02] bg-purple-500/20 shadow-lg shadow-purple-500/20'
                    : ''}
                  ${isDragging && draggedItem?.type === 'p' && draggedItem?.index === idx ? 'opacity-40 scale-[0.98]' : ''}`}
              >
                {priority.task ? (
                  <div className="flex items-center gap-3">
                    {/* Drag handle */}
                    <div className="text-slate-500 pointer-events-none">
                      <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 8h16M4 16h16" />
                      </svg>
                    </div>

                    {/* Task icon */}
                    <span className="text-xl">{priority.task.icon}</span>

                    {/* Task name */}
                    <span className="text-slate-200 font-medium flex-1 truncate">{priority.task.name}</span>

                    {/* Energy badge - clickable to cycle */}
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
                      />
                    </div>

                    {/* Time and remove */}
                    <div className="flex items-center gap-2" onMouseDown={(e) => e.stopPropagation()}>
                      <TimeDropdown
                        value={priority.time}
                        onChange={(val) => {
                          const newP = [...priorities];
                          newP[idx].time = val;
                          setPriorities(newP);
                        }}
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
                    <span className="text-slate-500">Tap to add a task...</span>
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
              <span className="text-sm font-medium">Add Task #{priorities.length + 1}</span>
            </button>
          </div>
        </div>

        {/* Summary Card - Glass */}
        <div className="glass-card rounded-3xl p-6 text-white">
          <div className="absolute inset-0 rounded-3xl bg-gradient-to-br from-purple-500/20 to-indigo-500/20 pointer-events-none"></div>
          <h3 className="text-lg font-semibold mb-4 text-slate-200">Day Summary</h3>
          <div className="grid grid-cols-2 gap-6">
            <div>
              <p className="text-slate-400 text-sm mb-1">Time Budget</p>
              <p className="text-3xl font-bold text-gradient">{formatTotalTime(totalMinutes)}</p>
            </div>
            <div>
              <p className="text-slate-400 text-sm mb-1">Energy Load</p>
              <p className="text-3xl font-bold text-gradient">{energyLoad}</p>
            </div>
          </div>
        </div>

        {/* Drag Preview - Smooth floating */}
        {isDragging && draggedItem && (
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
        )}

        {/* Edit Reminder Modal */}
        {planEditingReminder && (
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
                  <h2 className="text-lg font-semibold text-white">Edit Reminder</h2>
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
                {/* Icon Picker */}
                <div className="mb-4">
                  <label className="text-xs font-medium text-slate-400 uppercase tracking-wide mb-2 block">Icon</label>
                  <div className="flex flex-wrap gap-1.5">
                    {iconOptions.map(icon => (
                      <button
                        key={icon}
                        onClick={() => setEditReminderIcon(icon)}
                        className={`w-9 h-9 rounded-xl flex items-center justify-center text-lg transition-all duration-150
                          ${editReminderIcon === icon
                            ? 'bg-purple-500 scale-110 shadow-lg shadow-purple-500/30'
                            : 'bg-white/10 hover:bg-white/20 hover:scale-105'}`}
                      >
                        {icon}
                      </button>
                    ))}
                  </div>
                </div>

                {/* Reminder Name */}
                <div className="mb-4">
                  <label className="text-xs font-medium text-slate-400 uppercase tracking-wide mb-2 block">Reminder Name</label>
                  <input
                    type="text"
                    value={editReminderName}
                    onChange={(e) => setEditReminderName(e.target.value)}
                    placeholder="What do you need to remember?"
                    className="w-full px-4 py-3 bg-white/5 border border-white/10 rounded-xl focus:border-purple-500/50 focus:ring-2 focus:ring-purple-500/20 outline-none transition-all text-white placeholder:text-slate-500"
                  />
                </div>

                {/* Energy Level */}
                <div className="mb-4">
                  <label className="text-xs font-medium text-slate-400 uppercase tracking-wide mb-2 block">Energy Level</label>
                  <div className="flex gap-2">
                    {['low', 'medium', 'high'].map(e => (
                      <button
                        key={e}
                        onClick={() => setEditReminderEnergy(e)}
                        className={`flex-1 py-2.5 rounded-xl font-medium text-sm transition-all duration-200
                          ${editReminderEnergy === e
                            ? e === 'low'
                              ? 'bg-emerald-500/80 text-white shadow-lg shadow-emerald-500/30'
                              : e === 'medium'
                                ? 'bg-amber-500/80 text-white shadow-lg shadow-amber-500/30'
                                : 'bg-rose-500/80 text-white shadow-lg shadow-rose-500/30'
                            : 'bg-white/10 text-slate-400 hover:bg-white/20'}`}
                      >
                        {e === 'low' ? '🌱 Low' : e === 'medium' ? '⚡ Med' : '🔥 High'}
                      </button>
                    ))}
                  </div>
                </div>
              </div>

              {/* Footer */}
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
            </div>
          </div>
        )}

        {/* Project Task Edit Modal */}
        {planEditingTask && (
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
                    <h2 className="text-lg font-semibold text-white">Edit Task</h2>
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
                {/* Title */}
                <div>
                  <label className="text-slate-400 text-sm mb-2 block">Title *</label>
                  <input
                    type="text"
                    value={planTaskData.title}
                    onChange={(e) => setPlanTaskData(prev => ({ ...prev, title: e.target.value }))}
                    placeholder="Task name"
                    className="w-full px-4 py-3 bg-white/5 border border-white/10 rounded-xl text-white placeholder:text-slate-500 outline-none focus:border-cyan-500/50"
                  />
                </div>

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

                {/* Time Estimate */}
                <div>
                  <label className="text-slate-400 text-sm mb-2 block">Time Estimate</label>
                  <div className="grid grid-cols-4 gap-2">
                    {timeOptions.map(opt => (
                      <button
                        key={opt.value}
                        onClick={() => setPlanTaskData(prev => ({ ...prev, timeEstimate: opt.value }))}
                        className={`py-2 px-2 rounded-xl text-xs font-medium transition-all ${planTaskData.timeEstimate === opt.value
                          ? 'bg-cyan-500/30 text-cyan-300 ring-2 ring-cyan-500/50'
                          : 'bg-white/5 text-slate-400'
                          }`}
                      >
                        {opt.label}
                      </button>
                    ))}
                  </div>
                </div>

                {/* Notes */}
                <div>
                  <label className="text-slate-400 text-sm mb-2 block">Notes</label>
                  <textarea
                    value={planTaskData.notes}
                    onChange={(e) => setPlanTaskData(prev => ({ ...prev, notes: e.target.value }))}
                    placeholder="Additional details..."
                    rows={2}
                    className="w-full px-4 py-3 bg-white/5 border border-white/10 rounded-xl text-white placeholder:text-slate-500 outline-none focus:border-cyan-500/50 resize-none"
                  />
                </div>

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
        )}
      </div>
    );
  };

  // ============================================
  // EXECUTE SCREEN
  // ============================================
  const ExecuteScreen = () => {
    const today = new Date();
    const [currentTime, setCurrentTime] = useState(new Date());
    const [draggingTask, setDraggingTask] = useState(null);
    const [dragStartY, setDragStartY] = useState(0);
    const [dragCurrentY, setDragCurrentY] = useState(0);
    const [dragStartTime, setDragStartTime] = useState(0);
    const [timelineRef, setTimelineRef] = useState(null);

    // Routine expansion state
    // expandedRoutine is now lifted to App component
    const [editingRoutine, setEditingRoutine] = useState(null); // 'morning' | 'evening' | null
    const [newHabitText, setNewHabitText] = useState('');

    // Get current routines for selected date
    const currentRoutines = getRoutinesForDate(selectedExecuteDate);

    // Task edit modal state
    const [editingTask, setEditingTask] = useState(null);
    const [editTaskName, setEditTaskName] = useState('');
    const [editTaskIcon, setEditTaskIcon] = useState('📌');
    const [editTaskEnergy, setEditTaskEnergy] = useState('medium');
    const [editTaskStartHour, setEditTaskStartHour] = useState(9);
    const [editTaskStartMinute, setEditTaskStartMinute] = useState(0);
    const [editTaskEndHour, setEditTaskEndHour] = useState(10);
    const [editTaskEndMinute, setEditTaskEndMinute] = useState(0);

    // Focus mode / Pomodoro state
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

    // Open task for editing
    const openTaskEdit = (task) => {
      setEditingTask(task);
      setEditTaskName(task.title);
      setEditTaskIcon(task.icon);
      setEditTaskEnergy(task.energy || 'medium');
      setEditTaskStartHour(task.startTime.getHours());
      setEditTaskStartMinute(task.startTime.getMinutes());
      setEditTaskEndHour(task.endTime.getHours());
      setEditTaskEndMinute(task.endTime.getMinutes());
    };

    // Save task edits
    const saveTaskEdit = () => {
      if (!editingTask || !editTaskName.trim()) return;

      const newStartTime = new Date(selectedExecuteDate);
      newStartTime.setHours(editTaskStartHour, editTaskStartMinute, 0, 0);

      const newEndTime = new Date(selectedExecuteDate);
      newEndTime.setHours(editTaskEndHour, editTaskEndMinute, 0, 0);

      if (newEndTime <= newStartTime) {
        newEndTime.setHours(editTaskStartHour + 1, editTaskStartMinute, 0, 0);
      }

      const dateKey = getDateKey(selectedExecuteDate);
      setTasksByDate(prev => ({
        ...prev,
        [dateKey]: (prev[dateKey] || []).map(t => {
          if (t.id === editingTask.id) {
            return {
              ...t,
              title: editTaskName.trim(),
              icon: editTaskIcon,
              energy: editTaskEnergy,
              startTime: newStartTime,
              endTime: newEndTime
            };
          }
          return t;
        }).sort((a, b) => a.startTime - b.startTime)
      }));

      setEditingTask(null);
    };

    // Delete task
    const deleteTask = (taskId) => {
      const dateKey = getDateKey(selectedExecuteDate);
      setTasksByDate(prev => ({
        ...prev,
        [dateKey]: (prev[dateKey] || []).filter(t => t.id !== taskId)
      }));
      setEditingTask(null);
    };

    // Start focus mode
    const startFocusMode = (task) => {
      // Calculate task duration in seconds, default to 25 minutes if no time set
      let durationSeconds = 25 * 60;
      if (task.startTime && task.endTime) {
        const durationMs = task.endTime - task.startTime;
        durationSeconds = Math.max(60, Math.floor(durationMs / 1000)); // Minimum 1 minute
      }

      setFocusTask(task);
      setFocusMode(true);
      setPomodoroTime(durationSeconds);
      setPomodoroRunning(false);
      setPomodoroSession(1);
      setIsBreak(false);
      setTotalFocusTime(0);
      setEditingTask(null);
    };

    // Get initial focus duration for reset
    const getTaskFocusDuration = (task) => {
      if (task?.startTime && task?.endTime) {
        const durationMs = task.endTime - task.startTime;
        return Math.max(60, Math.floor(durationMs / 1000));
      }
      return 25 * 60;
    };

    // Format pomodoro time
    const formatPomodoroTime = (seconds) => {
      const mins = Math.floor(seconds / 60);
      const secs = seconds % 60;
      return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
    };

    // formatPomodoroTime helper function...

    // New task modal state
    // executeShowNewTaskModal lifted to App as executeShowNewTaskModal
    const [newTaskName, setNewTaskName] = useState('');
    const [newTaskIcon, setNewTaskIcon] = useState('📌');
    const [newTaskEnergy, setNewTaskEnergy] = useState('medium');
    const [newTaskStartHour, setNewTaskStartHour] = useState(9);
    const [newTaskStartMinute, setNewTaskStartMinute] = useState(0);
    const [newTaskEndHour, setNewTaskEndHour] = useState(10);
    const [newTaskEndMinute, setNewTaskEndMinute] = useState(0);
    const [newTaskReminder, setNewTaskReminder] = useState(null); // null, 5, 10, 15, 30
    const [newTaskIsNonNegotiable, setNewTaskIsNonNegotiable] = useState(false);

    const iconOptions = [
      '📌', '📧', '💪', '📝', '📞', '📚', '🧘', '🎯', '💼', '🏃',
      '🍎', '💡', '🎨', '🎵', '📊', '🛒', '🏠', '💰', '✈️', '🎮',
      '🧹', '👥', '📱', '💻', '🔧', '📦', '🎁', '❤️', '⭐', '🔔'
    ];

    const reminderOptions = [
      { value: null, label: 'No reminder' },
      { value: 5, label: '5 min before' },
      { value: 10, label: '10 min before' },
      { value: 15, label: '15 min before' },
      { value: 30, label: '30 min before' },
      { value: 60, label: '1 hour before' }
    ];

    // Create new task from modal
    const createNewTask = () => {
      if (!newTaskName.trim()) return;

      const startTime = new Date(selectedExecuteDate);
      startTime.setHours(newTaskStartHour, newTaskStartMinute, 0, 0);

      const endTime = new Date(selectedExecuteDate);
      endTime.setHours(newTaskEndHour, newTaskEndMinute, 0, 0);

      // Validate end time is after start time
      if (endTime <= startTime) {
        endTime.setHours(newTaskStartHour + 1, newTaskStartMinute, 0, 0);
      }

      const newTask = {
        id: Date.now(),
        title: newTaskName.trim(),
        icon: newTaskIcon,
        energy: newTaskEnergy,
        startTime: startTime,
        endTime: endTime,
        duration: `${Math.round((endTime - startTime) / 60000)}m`,
        completed: false,
        isNonNegotiable: newTaskIsNonNegotiable,
        reminder: newTaskReminder
      };

      // Add task to the selected date
      const dateKey = getDateKey(selectedExecuteDate);
      setTasksByDate(prev => ({
        ...prev,
        [dateKey]: [...(prev[dateKey] || []), newTask].sort((a, b) => a.startTime - b.startTime)
      }));

      // Reset form
      setNewTaskName('');
      setNewTaskIcon('📌');
      setNewTaskEnergy('medium');
      setNewTaskStartHour(9);
      setNewTaskStartMinute(0);
      setNewTaskEndHour(10);
      setNewTaskEndMinute(0);
      setNewTaskReminder(null);
      setNewTaskIsNonNegotiable(false);
      setExecuteShowNewTaskModal(false);
    };

    // Reset modal form
    const resetNewTaskForm = () => {
      setNewTaskName('');
      setNewTaskIcon('📌');
      setNewTaskEnergy('medium');
      // Set default start time to next hour
      const nextHour = Math.min(22, currentTime.getHours() + 1);
      setNewTaskStartHour(nextHour);
      setNewTaskStartMinute(0);
      setNewTaskEndHour(Math.min(23, nextHour + 1));
      setNewTaskEndMinute(0);
      setNewTaskReminder(null);
      setNewTaskIsNonNegotiable(false);
    };

    // Open modal with smart defaults
    const openNewTaskModal = () => {
      resetNewTaskForm();
      setExecuteShowNewTaskModal(true);
    };

    // Update current time every 30 seconds for smoother sand clock
    useEffect(() => {
      const interval = setInterval(() => {
        setCurrentTime(new Date());
      }, 30000);
      return () => clearInterval(interval);
    }, []);

    // Handle drag on timeline and calendar (mouse and touch)
    useEffect(() => {
      if (!draggingTask) return;

      const handleMove = (clientY) => {
        setDragCurrentY(clientY);
      };

      const handleMouseMove = (e) => {
        handleMove(e.clientY);
      };

      const handleTouchMove = (e) => {
        if (e.touches.length > 0) {
          e.preventDefault();
          handleMove(e.touches[0].clientY);
        }
      };

      const handleEnd = (clientY) => {
        // Check if this was a click (short time, small movement)
        const timeDiff = Date.now() - dragStartTime;
        const posDiff = Math.abs(dragCurrentY - dragStartY);

        if (timeDiff < 200 && posDiff < 5 && draggingTask) {
          // This was a click, open edit modal
          openTaskEdit(draggingTask);
          setDragOverDay(null);
          setDraggingTask(null);
          return;
        }

        // Check if dropping on a calendar day (use ref for current value)
        const targetDay = dragOverDayRef.current;
        if (targetDay && draggingTask) {
          moveTaskToDay(draggingTask, targetDay);
          setDragOverDay(null);
          setDraggingTask(null);
          return;
        }

        // Otherwise, update time within the same day
        if (timelineRef && draggingTask) {
          const rect = timelineRef.getBoundingClientRect();
          const relativeY = clientY - rect.top;
          const hourOffset = relativeY / 32; // 32px per hour (synchronized with timeline)
          const newHour = Math.max(6, Math.min(22, Math.floor(6 + hourOffset)));
          const newMinutes = Math.round(((hourOffset % 1) * 60) / 15) * 15; // Snap to 15 min

          // Update the task time with smooth animation
          updateTaskTime(draggingTask.id, newHour, newMinutes);
        }
        setDragOverDay(null);
        setDraggingTask(null);
      };

      const handleMouseUp = (e) => {
        handleEnd(e.clientY);
      };

      const handleTouchEnd = (e) => {
        // Use the last known position from dragCurrentY
        handleEnd(dragCurrentY);
      };

      window.addEventListener('mousemove', handleMouseMove);
      window.addEventListener('mouseup', handleMouseUp);
      window.addEventListener('touchmove', handleTouchMove, { passive: false });
      window.addEventListener('touchend', handleTouchEnd);
      window.addEventListener('touchcancel', handleTouchEnd);

      return () => {
        window.removeEventListener('mousemove', handleMouseMove);
        window.removeEventListener('mouseup', handleMouseUp);
        window.removeEventListener('touchmove', handleTouchMove);
        window.removeEventListener('touchend', handleTouchEnd);
        window.removeEventListener('touchcancel', handleTouchEnd);
      };
    }, [draggingTask, timelineRef, dragCurrentY, dragStartY, dragStartTime]);

    // Update task time and sync back to Plan
    const updateTaskTime = (taskId, newHour, newMinutes) => {
      const task = tasks.find(t => t.id === taskId);
      if (!task) return;

      // Calculate duration in minutes
      const durationMs = task.endTime - task.startTime;
      const durationMins = durationMs / 60000;

      // Create new start time based on selected date
      const newStartTime = new Date(selectedExecuteDate);
      newStartTime.setHours(newHour, newMinutes, 0, 0);

      // Create new end time
      const newEndTime = new Date(newStartTime.getTime() + durationMins * 60000);

      // Update tasks state for this date
      const dateKey = getDateKey(selectedExecuteDate);
      setTasksByDate(prev => ({
        ...prev,
        [dateKey]: (prev[dateKey] || []).map(t => {
          if (t.id === taskId) {
            return { ...t, startTime: newStartTime, endTime: newEndTime };
          }
          return t;
        }).sort((a, b) => a.startTime - b.startTime)
      }));
    };

    const startTaskDrag = (e, task) => {
      if (task.completed) {
        // Allow clicking completed tasks to view
        openTaskEdit(task);
        return;
      }
      e.preventDefault();
      e.stopPropagation();

      // Get clientY from mouse or touch event
      const clientY = e.touches ? e.touches[0].clientY : e.clientY;

      setDraggingTask(task);
      setDragStartY(clientY);
      setDragCurrentY(clientY);
      setDragStartTime(Date.now());
    };

    // Handle task click (if not dragged)
    const handleTaskClick = (task) => {
      // If drag was very short (< 200ms and < 5px movement), treat as click
      const timeDiff = Date.now() - dragStartTime;
      const posDiff = Math.abs(dragCurrentY - dragStartY);

      if (timeDiff < 200 && posDiff < 5) {
        openTaskEdit(task);
      }
    };

    // Get drag preview position for smooth dragging
    const getDragTaskPosition = (task) => {
      if (draggingTask?.id === task.id && timelineRef) {
        const rect = timelineRef.getBoundingClientRect();
        const relativeY = dragCurrentY - rect.top;
        return Math.max(0, Math.min(timeSlots.length * 32 - 28, relativeY));
      }
      return (task.startTime.getHours() - 6) * 32 + (task.startTime.getMinutes() / 60) * 32;
    };

    // Week navigation state
    const [weekOffset, setWeekOffset] = useState(0);
    const [showMonthPicker, setShowMonthPicker] = useState(false);

    // Generate week days
    const getWeekDays = () => {
      const days = [];
      const now = new Date();
      const currentDay = now.getDay(); // 0 = Sunday, 1 = Monday, etc.

      // Calculate Monday of current week, then apply offset
      const daysToMonday = currentDay === 0 ? 6 : currentDay - 1;
      const startOfWeek = new Date(now);
      startOfWeek.setDate(now.getDate() - daysToMonday + (weekOffset * 7));
      startOfWeek.setHours(0, 0, 0, 0);

      for (let i = 0; i < 7; i++) {
        const date = new Date(startOfWeek);
        date.setDate(startOfWeek.getDate() + i);
        date.setHours(0, 0, 0, 0);
        const dateKey = getDateKey(date);
        const hasTasks = tasksByDate[dateKey] && tasksByDate[dateKey].length > 0;

        // Compare dates properly by resetting time
        const todayDate = new Date();
        todayDate.setHours(0, 0, 0, 0);
        const selectedDate = new Date(selectedExecuteDate);
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
          dayName: date.toLocaleDateString('en-US', { weekday: 'short' }),
          dayNum: date.getDate(),
          isToday: date.getTime() === todayDate.getTime(),
          isSelected: date.getTime() === selectedDate.getTime(),
          date: new Date(date),
          hasTasks: hasTasks,
          dateKey: dateKey,
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

    // Generate month calendar
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
      const selectedDate = new Date(selectedExecuteDate);
      selectedDate.setHours(0, 0, 0, 0);

      for (let i = 1; i <= daysInMonth; i++) {
        const date = new Date(year, month, i);
        date.setHours(0, 0, 0, 0);
        const dateKey = getDateKey(date);

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
          hasTasks: tasksByDate[dateKey] && tasksByDate[dateKey].length > 0,
          projectTimelines: projectTimelines
        });
      }

      return days;
    };

    const goToPreviousWeek = () => setWeekOffset(prev => prev - 1);
    const goToNextWeek = () => setWeekOffset(prev => prev + 1);
    const goToToday = () => {
      setWeekOffset(0);
      setSelectedExecuteDate(getToday());
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
      setSelectedExecuteDate(date);
      setShowMonthPicker(false);
    };

    const changeMonth = (delta) => {
      setWeekOffset(prev => prev + (delta * 4)); // Roughly 4 weeks per month
    };

    // Track hovered calendar day during drag - use ref for event handler access
    const [dragOverDay, setDragOverDay] = useState(null);
    const dragOverDayRef = React.useRef(null);

    // Keep ref in sync with state
    useEffect(() => {
      dragOverDayRef.current = dragOverDay;
    }, [dragOverDay]);

    const selectExecuteDay = (date) => {
      setSelectedExecuteDate(new Date(date));
      setActiveTask(null);
      setElapsedTime(0);
    };

    // Move task to different day
    const moveTaskToDay = (task, targetDate) => {
      const sourceKey = getDateKey(selectedExecuteDate);
      const targetKey = getDateKey(targetDate);

      if (sourceKey === targetKey) return; // Same day, no move needed

      // Calculate new times for the target day
      const newStartTime = new Date(targetDate);
      newStartTime.setHours(task.startTime.getHours(), task.startTime.getMinutes(), 0, 0);

      const newEndTime = new Date(targetDate);
      newEndTime.setHours(task.endTime.getHours(), task.endTime.getMinutes(), 0, 0);

      const movedTask = {
        ...task,
        startTime: newStartTime,
        endTime: newEndTime
      };

      // Remove from source day and add to target day
      setTasksByDate(prev => ({
        ...prev,
        [sourceKey]: (prev[sourceKey] || []).filter(t => t.id !== task.id),
        [targetKey]: [...(prev[targetKey] || []), movedTask].sort((a, b) => a.startTime - b.startTime)
      }));
    };

    // Generate time slots from 6 AM to 11 PM - European format (24h)
    const generateTimeSlots = () => {
      const slots = [];
      for (let hour = 6; hour <= 23; hour++) {
        slots.push({
          hour,
          label: `${hour}.00`
        });
      }
      return slots;
    };

    const timeSlots = generateTimeSlots();

    // Calculate task position and height based on time
    const getTaskStyle = (task) => {
      const startHour = task.startTime.getHours() + task.startTime.getMinutes() / 60;
      const endHour = task.endTime.getHours() + task.endTime.getMinutes() / 60;
      const duration = endHour - startHour;

      let topOffset = (startHour - 6) * 64; // 64px per hour

      // If this task is being dragged, calculate new position
      if (draggingTask?.id === task.id && timelineRef) {
        const rect = timelineRef.getBoundingClientRect();
        const relativeY = dragCurrentY - rect.top;
        topOffset = Math.max(0, Math.min(timeSlots.length * 64 - 48, relativeY - 24));
      }

      const height = Math.max(duration * 64, 48); // Minimum 48px height

      return {
        top: `${topOffset}px`,
        height: `${height}px`,
        minHeight: '48px'
      };
    };

    // Get current time indicator position
    const getCurrentTimePosition = () => {
      const hours = currentTime.getHours() + currentTime.getMinutes() / 60;
      return (hours - 6) * 32; // 32px per hour
    };

    // Format time in European style (24h with dot)
    const formatTimeEuropean = (hour, minutes) => {
      const h = Math.floor(hour);
      const m = minutes !== undefined ? minutes : Math.round((hour % 1) * 60);
      return `${h}.${m.toString().padStart(2, '0')}`;
    };

    // Get preview time range while dragging
    const getDragPreviewTimeRange = () => {
      if (!draggingTask || !timelineRef) return null;
      const rect = timelineRef.getBoundingClientRect();
      const relativeY = dragCurrentY - rect.top;
      const hourOffset = relativeY / 32; // 32px per hour
      const startHour = Math.max(6, Math.min(22, Math.floor(6 + hourOffset)));
      const startMinutes = Math.round(((hourOffset % 1) * 60) / 15) * 15;

      // Calculate duration from original task
      const originalDuration = (draggingTask.endTime - draggingTask.startTime) / 3600000; // hours
      const endHour = startHour + Math.floor(originalDuration + startMinutes / 60);
      const endMinutes = Math.round((originalDuration * 60 + startMinutes) % 60);

      return {
        start: formatTimeEuropean(startHour, startMinutes % 60),
        end: formatTimeEuropean(Math.min(23, endHour), endMinutes)
      };
    };

    // Get preview time while dragging (legacy)
    const getDragPreviewTime = () => {
      const range = getDragPreviewTimeRange();
      return range ? range.start : null;
    };

    // Task colors based on energy/type
    const getTaskColor = (task) => {
      if (task.isNonNegotiable) {
        return { bg: 'bg-rose-100', border: 'border-l-rose-500', text: 'text-rose-900' };
      }
      const colors = [
        { bg: 'bg-blue-100', border: 'border-l-blue-500', text: 'text-blue-900' },
        { bg: 'bg-amber-100', border: 'border-l-amber-500', text: 'text-amber-900' },
        { bg: 'bg-emerald-100', border: 'border-l-emerald-500', text: 'text-emerald-900' },
        { bg: 'bg-purple-100', border: 'border-l-purple-500', text: 'text-purple-900' },
        { bg: 'bg-pink-100', border: 'border-l-pink-500', text: 'text-pink-900' },
        { bg: 'bg-cyan-100', border: 'border-l-cyan-500', text: 'text-cyan-900' },
      ];
      const index = parseInt(task.id.replace('p', '')) || 0;
      return colors[index % colors.length];
    };

    const formatTime = (date) => {
      const h = date.getHours();
      const m = date.getMinutes();
      return `${h}.${m.toString().padStart(2, '0')}`;
    };

    const formatTimeOfDay = (date) => {
      const h = date.getHours();
      const m = date.getMinutes();
      return `${h}.${m.toString().padStart(2, '0')}`;
    };

    const formatDuration = (minutes) => {
      if (minutes < 60) return `${Math.round(minutes)}m`;
      const h = Math.floor(minutes / 60);
      const m = Math.round(minutes % 60);
      return m > 0 ? `${h}h ${m}m` : `${h}h`;
    };

    // Sand Clock Calculations
    // Day runs from 6 AM to 11 PM (17 hours = 1020 minutes)
    const dayStartHour = 6;
    const dayEndHour = 23;
    const totalDayMinutes = (dayEndHour - dayStartHour) * 60; // 1020 minutes

    // Calculate day progress (0-100%)
    const currentHour = currentTime.getHours();
    const currentMinute = currentTime.getMinutes();
    const minutesSinceDayStart = Math.max(0, (currentHour - dayStartHour) * 60 + currentMinute);
    const dayProgress = Math.min(100, (minutesSinceDayStart / totalDayMinutes) * 100);

    // Calculate intentional time (time spent on tasks that have passed)
    const completedTaskMinutes = tasks
      .filter(t => t.completed)
      .reduce((sum, t) => sum + (t.endTime - t.startTime) / 60000, 0);

    // Tasks in progress or passed (up to current time)
    const elapsedTaskMinutes = tasks.reduce((sum, task) => {
      const taskStart = task.startTime.getHours() * 60 + task.startTime.getMinutes();
      const taskEnd = task.endTime.getHours() * 60 + task.endTime.getMinutes();
      const nowMinutes = currentHour * 60 + currentMinute;
      const dayStartMinutes = dayStartHour * 60;

      if (nowMinutes >= taskEnd) {
        // Task fully passed
        return sum + (taskEnd - taskStart);
      } else if (nowMinutes > taskStart) {
        // Task in progress
        return sum + (nowMinutes - taskStart);
      }
      return sum;
    }, 0);

    const intentionalMinutes = Math.max(completedTaskMinutes, elapsedTaskMinutes);
    const intentionalPercent = (intentionalMinutes / totalDayMinutes) * 100;

    // Unanchored time = elapsed time - intentional time
    const unanchoredMinutes = Math.max(0, minutesSinceDayStart - intentionalMinutes);
    const unanchoredPercent = (unanchoredMinutes / totalDayMinutes) * 100;

    return (
      <div className="pb-40 animate-fadeIn">
        {/* Header - Centered Apple Style */}
        <div className="mb-6 text-center">
          <p className="text-amber-400/80 text-xs font-medium uppercase tracking-widest mb-2">
            {selectedExecuteDate.toLocaleDateString('en-US', { month: 'long', day: 'numeric' })}
          </p>
          <h1 className="text-3xl font-semibold text-white tracking-tight">
            {selectedExecuteDate.toDateString() === today.toDateString()
              ? 'Today'
              : selectedExecuteDate.toLocaleDateString('en-US', { weekday: 'long' })}
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
                Today
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
                {weekDays.length > 0 && weekDays[3].date.toLocaleDateString('en-US', { month: 'long', year: 'numeric' })}
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
              {['Mo', 'Tu', 'We', 'Th', 'Fr', 'Sa', 'Su'].map(day => (
                <div key={day} className="text-center text-xs text-slate-500 font-medium py-1">
                  {day}
                </div>
              ))}
            </div>

            {/* Calendar Grid */}
            <div className="grid grid-cols-7 gap-1">
              {getMonthDays().map((day, idx) => (
                <button
                  key={idx}
                  onClick={() => day && selectDateFromMonth(day.date)}
                  disabled={!day}
                  className={`aspect-square rounded-lg text-sm font-medium transition-all flex flex-col items-center justify-center relative
                    ${!day ? 'invisible' : ''}
                    ${day?.isSelected
                      ? 'bg-gradient-to-br from-purple-500 to-indigo-600 text-white'
                      : day?.isToday
                        ? 'bg-white/10 text-purple-400 ring-1 ring-purple-400/50'
                        : 'hover:bg-white/10 text-slate-300'}`}
                >
                  <span>{day?.dayNum}</span>
                  {day?.hasTasks && !day?.isSelected && (
                    <div className="w-1 h-1 rounded-full bg-purple-400 mt-0.5"></div>
                  )}
                </button>
              ))}
            </div>
          </div>
        )}

        {/* Week Calendar Strip - Glass - Drop zones when dragging */}
        <div className={`flex gap-1.5 mb-6 glass-card rounded-2xl p-2 overflow-x-auto transition-all duration-200 ${draggingTask ? 'ring-2 ring-amber-400/50 bg-amber-500/5' : ''
          }`}>
          {weekDays.map((day, idx) => {
            const isDragOver = draggingTask && dragOverDay?.getTime() === day.date.getTime();
            const isCurrentDay = day.date.getTime() === selectedExecuteDate.getTime();

            return (
              <button
                key={idx}
                onClick={() => !draggingTask && selectExecuteDay(day.date)}
                onMouseEnter={() => draggingTask && !isCurrentDay && setDragOverDay(day.date)}
                onMouseLeave={() => draggingTask && setDragOverDay(null)}
                className={`flex-1 min-w-[44px] flex flex-col items-center py-2.5 px-1 rounded-xl transition-all duration-200
                  ${isDragOver
                    ? 'bg-amber-500/40 ring-2 ring-amber-400 scale-105 shadow-lg shadow-amber-500/30'
                    : day.isSelected
                      ? 'bg-gradient-to-br from-purple-500 to-indigo-600 text-white shadow-lg shadow-purple-500/30'
                      : day.isToday
                        ? 'bg-white/10 text-purple-300'
                        : draggingTask
                          ? 'hover:bg-amber-500/20 hover:scale-102 text-slate-400'
                          : 'hover:bg-white/5 text-slate-400'}`}
              >
                <span className={`text-[10px] font-medium uppercase tracking-wide ${isDragOver
                  ? 'text-amber-200'
                  : day.isSelected
                    ? 'text-purple-200'
                    : day.isToday
                      ? 'text-purple-400'
                      : 'text-slate-500'
                  }`}>
                  {day.dayName}
                </span>
                <span className={`text-lg font-semibold mt-0.5 ${isDragOver
                  ? 'text-white'
                  : day.isSelected
                    ? 'text-white'
                    : day.isToday
                      ? 'text-white'
                      : 'text-slate-300'
                  }`}>
                  {day.dayNum}
                </span>
                {/* Task indicator dots or drop indicator */}
                <div className="h-1.5 mt-1">
                  {isDragOver ? (
                    <div className="w-4 h-1 rounded-full bg-amber-400 animate-pulse"></div>
                  ) : day.hasTasks && !day.isSelected ? (
                    <div className="w-1.5 h-1.5 rounded-full bg-purple-400"></div>
                  ) : day.hasTasks && day.isSelected ? (
                    <div className="w-1.5 h-1.5 rounded-full bg-white"></div>
                  ) : null}
                </div>
              </button>
            );
          })}
        </div>

        {/* Drag hint when dragging */}
        {draggingTask && (
          <div className="mb-3 text-center">
            <span className="text-amber-400/80 text-xs font-medium px-3 py-1.5 rounded-full bg-amber-500/10 border border-amber-500/20">
              ↑ Drop on a day to move task
            </span>
          </div>
        )}

        {/* Morning Routine Card */}
        {(() => {
          const routine = currentRoutines.morning;
          const completedCount = routine.habits.filter(h => h.completed).length;
          const totalCount = routine.habits.length;
          const progress = totalCount > 0 ? (completedCount / totalCount) * 100 : 0;
          const isExpanded = expandedRoutine === 'morning';
          const isEditing = editingRoutine === 'morning';
          const allDone = completedCount === totalCount;

          return (
            <div className={`glass-card rounded-2xl mb-4 overflow-hidden transition-all duration-300 ${allDone ? 'ring-1 ring-emerald-500/30' : ''}`}>
              {/* Collapsed View */}
              <button
                onClick={() => setExpandedRoutine(isExpanded ? null : 'morning')}
                className="w-full p-4 flex items-center gap-3"
              >
                <div className="text-2xl">{routine.icon}</div>
                <div className="flex-1 text-left">
                  <div className="flex items-center gap-2">
                    <span className="text-white font-medium">{routine.title}</span>
                    <span className="text-slate-500 text-xs">{routine.time}</span>
                  </div>
                  <span className={`text-xs ${allDone ? 'text-emerald-400' : 'text-slate-400'}`}>
                    {completedCount}/{totalCount} done
                  </span>
                </div>
                {/* Progress Ring */}
                <div className="relative w-10 h-10">
                  <svg className="w-10 h-10 -rotate-90">
                    <circle cx="20" cy="20" r="16" fill="none" stroke="rgba(255,255,255,0.1)" strokeWidth="3" />
                    <circle
                      cx="20" cy="20" r="16" fill="none"
                      stroke={allDone ? '#10b981' : '#a855f7'}
                      strokeWidth="3"
                      strokeDasharray={`${progress} ${100 - progress}`}
                      strokeDashoffset="0"
                      strokeLinecap="round"
                      style={{ strokeDasharray: `${progress * 1.005} 100` }}
                    />
                  </svg>
                  {allDone && (
                    <div className="absolute inset-0 flex items-center justify-center text-emerald-400 text-sm">✓</div>
                  )}
                </div>
                <svg className={`w-5 h-5 text-slate-400 transition-transform ${isExpanded ? 'rotate-180' : ''}`} fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                </svg>
              </button>

              {/* Expanded View */}
              {isExpanded && (
                <div className="px-4 pb-4 animate-fadeIn">
                  <div className="border-t border-white/10 pt-3">
                    {/* Habits Checklist */}
                    <div className="space-y-2 mb-3">
                      {routine.habits.map(habit => (
                        <button
                          key={habit.id}
                          onClick={(e) => {
                            e.stopPropagation();
                            if (!isEditing) toggleRoutineHabit(selectedExecuteDate, 'morning', habit.id);
                          }}
                          className={`w-full flex items-center gap-3 p-2 rounded-xl transition-all ${habit.completed ? 'bg-emerald-500/10' : 'bg-white/5 hover:bg-white/10'
                            }`}
                        >
                          <div className={`w-5 h-5 rounded-full border-2 flex items-center justify-center transition-all ${habit.completed ? 'bg-emerald-500 border-emerald-500' : 'border-slate-500'
                            }`}>
                            {habit.completed && (
                              <svg className="w-3 h-3 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" />
                              </svg>
                            )}
                          </div>
                          <span className={`flex-1 text-left text-sm ${habit.completed ? 'text-emerald-400 line-through' : 'text-slate-300'}`}>
                            {habit.title}
                          </span>
                          {isEditing && (
                            <button
                              onClick={(e) => { e.stopPropagation(); removeHabitFromTemplate('morning', habit.id); }}
                              className="text-rose-400 hover:text-rose-300 p-1"
                            >
                              <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                              </svg>
                            </button>
                          )}
                        </button>
                      ))}
                    </div>

                    {/* Add new habit (edit mode) */}
                    {isEditing && (
                      <div className="flex gap-2 mb-3">
                        <input
                          type="text"
                          value={newHabitText}
                          onChange={(e) => setNewHabitText(e.target.value)}
                          placeholder="Add new habit..."
                          className="flex-1 px-3 py-2 bg-white/5 border border-white/10 rounded-xl text-white text-sm placeholder:text-slate-500 outline-none focus:border-purple-500/50"
                        />
                        <button
                          onClick={() => {
                            if (newHabitText.trim()) {
                              addHabitToTemplate('morning', newHabitText.trim());
                              setNewHabitText('');
                            }
                          }}
                          className="px-3 py-2 bg-purple-500/20 text-purple-400 rounded-xl text-sm font-medium hover:bg-purple-500/30 transition-all"
                        >
                          Add
                        </button>
                      </div>
                    )}

                    {/* Action Buttons */}
                    <div className="flex gap-2">
                      {!allDone && !isEditing && (
                        <button
                          onClick={() => completeAllHabits(selectedExecuteDate, 'morning')}
                          className="flex-1 py-2 rounded-xl text-sm font-medium text-emerald-400 bg-emerald-500/10 hover:bg-emerald-500/20 transition-all"
                        >
                          Complete All
                        </button>
                      )}
                      <button
                        onClick={() => setEditingRoutine(isEditing ? null : 'morning')}
                        className="px-4 py-2 rounded-xl text-sm font-medium text-slate-400 bg-white/5 hover:bg-white/10 transition-all"
                      >
                        {isEditing ? 'Done' : 'Edit'}
                      </button>
                    </div>
                  </div>
                </div>
              )}
            </div>
          );
        })()}

        {/* Simple Timeline */}
        <div className="relative flex">
          {/* Time Scale - Left Side */}
          <div className="w-16 flex-shrink-0 flex flex-col relative z-20 pr-2">
            {/* Time markers - each slot is 32px */}
            {timeSlots.map((slot, idx) => {
              const isPast = slot.hour < currentTime.getHours() ||
                (slot.hour === currentTime.getHours() && currentTime.getMinutes() >= 30);
              const isCurrent = slot.hour === currentTime.getHours();
              return (
                <div
                  key={slot.hour}
                  className="flex items-center justify-end h-8"
                >
                  <span className={`text-xs font-medium transition-all duration-300 ${isCurrent
                    ? 'text-amber-400 font-bold'
                    : isPast
                      ? 'text-slate-500'
                      : 'text-slate-400'
                    }`}>
                    {slot.label}
                  </span>
                  <div className={`w-4 h-px ml-2 ${isCurrent ? 'bg-amber-400' : isPast ? 'bg-slate-600' : 'bg-slate-700'}`}></div>
                </div>
              );
            })}
            {/* Sleep zone label */}
            <div className="flex items-center justify-end h-12">
              <span className="text-xs text-indigo-400 font-medium">🌙</span>
            </div>
          </div>

          {/* Timeline with Tasks */}
          <div
            className="flex-1 relative bg-white/5 rounded-2xl border border-white/10"
            style={{ height: `${timeSlots.length * 32 + 48}px` }}
            ref={(el) => setTimelineRef(el)}
          >
            {/* Hour grid lines */}
            {timeSlots.map((slot, idx) => (
              <div
                key={slot.hour}
                className="absolute left-0 right-0 border-t border-white/5"
                style={{ top: `${idx * 32}px` }}
              />
            ))}

            {/* Current time indicator */}
            {currentTime.getHours() >= 6 && currentTime.getHours() <= 23 && (
              <div
                className="absolute z-30 flex items-center pointer-events-none transition-all duration-1000"
                style={{
                  top: `${getCurrentTimePosition()}px`,
                  left: '-68px',
                  right: '0'
                }}
              >
                {/* Time badge on left */}
                <div className="px-2 py-0.5 bg-amber-500 rounded-md shadow-lg shadow-amber-500/30 flex-shrink-0">
                  <span className="text-[10px] text-white font-bold">{formatTimeOfDay(currentTime)}</span>
                </div>

                {/* Time line extending to the right */}
                <div className="flex-1 h-0.5 bg-gradient-to-r from-amber-400 via-amber-400 to-amber-400/30"></div>

                {/* Small dot at the end */}
                <div className="w-2 h-2 rounded-full bg-amber-400/50 flex-shrink-0"></div>
              </div>
            )}

            {/* Draggable Tasks */}
            {tasks.length === 0 ? (
              <div className="absolute inset-0 flex items-center justify-center" style={{ height: `${timeSlots.length * 32}px` }}>
                <div className="text-center text-slate-400 py-8">
                  <div className="text-4xl mb-2">📋</div>
                  <p className="text-sm font-medium">No tasks scheduled</p>
                  <p className="text-xs text-slate-500">Add tasks in Plan</p>
                </div>
              </div>
            ) : (
              tasks.map(task => {
                const taskStartHour = task.startTime.getHours() + task.startTime.getMinutes() / 60;
                const taskEndHour = task.endTime.getHours() + task.endTime.getMinutes() / 60;
                const currentHourFloat = currentTime.getHours() + currentTime.getMinutes() / 60;
                const isPast = taskEndHour <= currentHourFloat;
                const isActive = taskStartHour <= currentHourFloat && taskEndHour > currentHourFloat;
                const isDragging = draggingTask?.id === task.id;

                // Position: use drag position if dragging, otherwise calculated position
                const top = getDragTaskPosition(task);
                const height = Math.max(28, ((taskEndHour - taskStartHour) * 32));

                return (
                  <div
                    key={task.id}
                    onMouseDown={(e) => startTaskDrag(e, task)}
                    onTouchStart={(e) => startTaskDrag(e, task)}
                    className={`absolute left-2 right-2 rounded-xl px-3 py-1.5 select-none touch-none
                      ${isDragging ? 'cursor-grabbing z-50' : 'cursor-grab'}
                      transition-shadow duration-150 overflow-hidden
                      ${task.completed
                        ? 'bg-emerald-500/30 border border-emerald-400/50'
                        : isPast
                          ? 'bg-slate-500/20 border border-slate-400/30'
                          : isActive
                            ? 'bg-amber-500/30 border-2 border-amber-400 shadow-lg shadow-amber-500/20'
                            : 'bg-white/10 border border-white/20 hover:bg-white/15'}
                      ${isDragging ? 'scale-[1.02] shadow-2xl ring-2 ring-amber-400 bg-amber-500/40' : ''}
                      ${activeTask?.id === task.id && !isDragging ? 'ring-2 ring-amber-400' : ''}`}
                    style={{
                      top: `${top}px`,
                      height: `${height}px`,
                      minHeight: '28px',
                      transition: isDragging ? 'transform 0.1s, box-shadow 0.1s' : 'all 0.2s ease-out'
                    }}
                  >
                    <div className="flex items-center justify-between h-full gap-2">
                      <div className="flex items-center gap-2 min-w-0 flex-1">
                        <span className="text-base flex-shrink-0">{task.icon}</span>
                        <div className="min-w-0 flex-1">
                          <h3 className={`text-xs font-semibold truncate ${task.completed ? 'text-emerald-200 line-through' : 'text-white'
                            }`}>
                            {task.title}
                          </h3>
                          {height >= 44 && (
                            <p className="text-[10px] text-white/50 mt-0.5">
                              {formatTime(task.startTime)} - {formatTime(task.endTime)}
                            </p>
                          )}
                        </div>
                      </div>

                      {/* Complete checkbox */}
                      <button
                        onMouseDown={(e) => e.stopPropagation()}
                        onTouchStart={(e) => e.stopPropagation()}
                        onClick={(e) => {
                          e.stopPropagation();
                          if (!task.completed) completeTask(task.id);
                        }}
                        className={`w-5 h-5 rounded-full border-2 flex items-center justify-center flex-shrink-0 transition-all
                          ${task.completed
                            ? 'bg-emerald-500 border-emerald-400 text-white'
                            : 'border-white/30 hover:border-emerald-400 hover:bg-emerald-500/20'}`}
                      >
                        {task.completed && (
                          <svg className="w-3 h-3" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" />
                          </svg>
                        )}
                      </button>
                    </div>
                  </div>
                );
              })
            )}

            {/* Sleep zone at bottom */}
            <div
              className="absolute left-0 right-0 bottom-0"
              style={{ height: '48px' }}
            >
              <div className="h-12 bg-gradient-to-b from-indigo-500/10 to-indigo-600/5 rounded-b-xl flex items-center justify-center border-t border-indigo-400/20">
                <div className="flex items-center gap-2">
                  <span className="text-sm">🌙</span>
                  <span className="text-indigo-300/80 text-xs font-medium">Sleep</span>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Evening Routine Card */}
        {(() => {
          const routine = currentRoutines.evening;
          const completedCount = routine.habits.filter(h => h.completed).length;
          const totalCount = routine.habits.length;
          const progress = totalCount > 0 ? (completedCount / totalCount) * 100 : 0;
          const isExpanded = expandedRoutine === 'evening';
          const isEditing = editingRoutine === 'evening';
          const allDone = completedCount === totalCount;

          return (
            <div className={`glass-card rounded-2xl mt-4 overflow-hidden transition-all duration-300 ${allDone ? 'ring-1 ring-emerald-500/30' : ''}`}>
              {/* Collapsed View */}
              <button
                onClick={() => setExpandedRoutine(isExpanded ? null : 'evening')}
                className="w-full p-4 flex items-center gap-3"
              >
                <div className="text-2xl">{routine.icon}</div>
                <div className="flex-1 text-left">
                  <div className="flex items-center gap-2">
                    <span className="text-white font-medium">{routine.title}</span>
                    <span className="text-slate-500 text-xs">{routine.time}</span>
                  </div>
                  <span className={`text-xs ${allDone ? 'text-emerald-400' : 'text-slate-400'}`}>
                    {completedCount}/{totalCount} done
                  </span>
                </div>
                {/* Progress Ring */}
                <div className="relative w-10 h-10">
                  <svg className="w-10 h-10 -rotate-90">
                    <circle cx="20" cy="20" r="16" fill="none" stroke="rgba(255,255,255,0.1)" strokeWidth="3" />
                    <circle
                      cx="20" cy="20" r="16" fill="none"
                      stroke={allDone ? '#10b981' : '#6366f1'}
                      strokeWidth="3"
                      strokeDasharray={`${progress} ${100 - progress}`}
                      strokeDashoffset="0"
                      strokeLinecap="round"
                      style={{ strokeDasharray: `${progress * 1.005} 100` }}
                    />
                  </svg>
                  {allDone && (
                    <div className="absolute inset-0 flex items-center justify-center text-emerald-400 text-sm">✓</div>
                  )}
                </div>
                <svg className={`w-5 h-5 text-slate-400 transition-transform ${isExpanded ? 'rotate-180' : ''}`} fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                </svg>
              </button>

              {/* Expanded View */}
              {isExpanded && (
                <div className="px-4 pb-4 animate-fadeIn">
                  <div className="border-t border-white/10 pt-3">
                    {/* Habits Checklist */}
                    <div className="space-y-2 mb-3">
                      {routine.habits.map(habit => (
                        <button
                          key={habit.id}
                          onClick={(e) => {
                            e.stopPropagation();
                            if (!isEditing) toggleRoutineHabit(selectedExecuteDate, 'evening', habit.id);
                          }}
                          className={`w-full flex items-center gap-3 p-2 rounded-xl transition-all ${habit.completed ? 'bg-emerald-500/10' : 'bg-white/5 hover:bg-white/10'
                            }`}
                        >
                          <div className={`w-5 h-5 rounded-full border-2 flex items-center justify-center transition-all ${habit.completed ? 'bg-emerald-500 border-emerald-500' : 'border-slate-500'
                            }`}>
                            {habit.completed && (
                              <svg className="w-3 h-3 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" />
                              </svg>
                            )}
                          </div>
                          <span className={`flex-1 text-left text-sm ${habit.completed ? 'text-emerald-400 line-through' : 'text-slate-300'}`}>
                            {habit.title}
                          </span>
                          {isEditing && (
                            <button
                              onClick={(e) => { e.stopPropagation(); removeHabitFromTemplate('evening', habit.id); }}
                              className="text-rose-400 hover:text-rose-300 p-1"
                            >
                              <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                              </svg>
                            </button>
                          )}
                        </button>
                      ))}
                    </div>

                    {/* Add new habit (edit mode) */}
                    {isEditing && (
                      <div className="flex gap-2 mb-3">
                        <input
                          type="text"
                          value={newHabitText}
                          onChange={(e) => setNewHabitText(e.target.value)}
                          placeholder="Add new habit..."
                          className="flex-1 px-3 py-2 bg-white/5 border border-white/10 rounded-xl text-white text-sm placeholder:text-slate-500 outline-none focus:border-indigo-500/50"
                        />
                        <button
                          onClick={() => {
                            if (newHabitText.trim()) {
                              addHabitToTemplate('evening', newHabitText.trim());
                              setNewHabitText('');
                            }
                          }}
                          className="px-3 py-2 bg-indigo-500/20 text-indigo-400 rounded-xl text-sm font-medium hover:bg-indigo-500/30 transition-all"
                        >
                          Add
                        </button>
                      </div>
                    )}

                    {/* Action Buttons */}
                    <div className="flex gap-2">
                      {!allDone && !isEditing && (
                        <button
                          onClick={() => completeAllHabits(selectedExecuteDate, 'evening')}
                          className="flex-1 py-2 rounded-xl text-sm font-medium text-emerald-400 bg-emerald-500/10 hover:bg-emerald-500/20 transition-all"
                        >
                          Complete All
                        </button>
                      )}
                      <button
                        onClick={() => setEditingRoutine(isEditing ? null : 'evening')}
                        className="px-4 py-2 rounded-xl text-sm font-medium text-slate-400 bg-white/5 hover:bg-white/10 transition-all"
                      >
                        {isEditing ? 'Done' : 'Edit'}
                      </button>
                    </div>
                  </div>
                </div>
              )}
            </div>
          );
        })()}

        {/* Stats Summary */}
        <div className="mt-4 glass-card rounded-2xl p-4">
          <div className="flex justify-between items-center">
            <div className="text-center flex-1">
              <div className="text-xl mb-1">⏳</div>
              <p className="text-amber-400 font-bold text-lg">{formatDuration(intentionalMinutes)}</p>
              <p className="text-slate-500 text-[10px]">Anchored</p>
            </div>
            <div className="w-px h-12 bg-white/10"></div>
            <div className="text-center flex-1">
              <div className="text-xl mb-1">💨</div>
              <p className="text-slate-400 font-bold text-lg">{formatDuration(unanchoredMinutes)}</p>
              <p className="text-slate-500 text-[10px]">Flowing</p>
            </div>
            <div className="w-px h-12 bg-white/10"></div>
            <div className="text-center flex-1">
              <div className="text-xl mb-1">🌙</div>
              <p className="text-indigo-400 font-bold text-lg">8h</p>
              <p className="text-slate-500 text-[10px]">Recovery</p>
            </div>
          </div>

          {/* Gentle reminder */}
          <div className="mt-3 pt-3 border-t border-white/10 text-center">
            <p className="text-slate-500 text-xs italic">
              {dayProgress < 30
                ? "☀️ Fresh morning sand — anchor it wisely"
                : dayProgress < 60
                  ? "🌤️ Sand flows steadily — stay present"
                  : dayProgress < 85
                    ? "🌅 Afternoon grains — protect what remains"
                    : "🌙 Evening approaches — honor your day"}
            </p>
          </div>
        </div>

        {/* Active Task Widget */}
        {activeTask && !activeTask.completed && (
          <div className="fixed bottom-24 left-4 right-4 max-w-md mx-auto glass-card rounded-3xl shadow-2xl overflow-hidden animate-slideUp z-40 border border-white/20">
            {/* Progress Bar */}
            <div className="h-1.5 bg-white/10">
              <div
                className="h-full bg-gradient-to-r from-amber-400 to-orange-500 transition-all duration-1000"
                style={{ width: `${Math.min((elapsedTime / (parseTime(activeTask.duration) * 60)) * 100, 100)}%` }}
              />
            </div>

            <div className="p-5">
              <div className="flex items-center justify-between mb-4">
                <div className="flex items-center gap-3">
                  <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-amber-200 to-orange-200 flex items-center justify-center shadow-inner">
                    <span className="text-2xl">{activeTask.icon}</span>
                  </div>
                  <div>
                    <h3 className="font-bold text-white">{activeTask.title}</h3>
                    <p className="text-xs text-slate-400">
                      {formatTime(activeTask.startTime)} - {formatTime(activeTask.endTime)}
                    </p>
                  </div>
                </div>
                <button
                  onClick={() => setActiveTask(null)}
                  className="w-8 h-8 rounded-full hover:bg-white/10 flex items-center justify-center text-slate-400 transition-colors"
                >
                  <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </button>
              </div>

              <div className="flex items-center justify-center gap-8 mb-4">
                <div className="text-center">
                  <p className="text-3xl font-bold text-white font-mono">{formatElapsed(elapsedTime)}</p>
                  <p className="text-xs text-slate-400 mt-1">Elapsed</p>
                </div>
                <div className="w-px h-10 bg-white/20"></div>
                <div className="text-center">
                  <p className="text-3xl font-bold text-white font-mono">
                    {formatElapsed(Math.max(0, parseTime(activeTask.duration) * 60 - elapsedTime))}
                  </p>
                  <p className="text-xs text-slate-400 mt-1">Remaining</p>
                </div>
              </div>

              <div className="flex gap-3">
                <button
                  onClick={() => setIsPaused(!isPaused)}
                  className={`flex-1 py-3.5 rounded-xl font-semibold transition-all duration-200 flex items-center justify-center gap-2
                    ${isPaused
                      ? 'bg-gradient-to-r from-amber-500 to-orange-500 text-white shadow-lg shadow-amber-500/30'
                      : 'bg-white/10 text-white hover:bg-white/20'}`}
                >
                  {isPaused ? (
                    <>
                      <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
                        <path d="M8 5v14l11-7z" />
                      </svg>
                      Resume
                    </>
                  ) : (
                    <>
                      <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
                        <path d="M6 4h4v16H6V4zm8 0h4v16h-4V4z" />
                      </svg>
                      Pause
                    </>
                  )}
                </button>
                <button
                  onClick={() => completeTask(activeTask.id)}
                  className="flex-1 py-3.5 rounded-xl font-semibold bg-emerald-500 text-white hover:bg-emerald-600 transition-all duration-200 shadow-lg shadow-emerald-500/30 flex items-center justify-center gap-2"
                >
                  <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M5 13l4 4L19 7" />
                  </svg>
                  Complete
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Liquid Glass Time Preview - Shows when dragging */}
        {draggingTask && getDragPreviewTimeRange() && (
          <div className="fixed top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 z-50 pointer-events-none animate-fadeIn">
            <div
              className="px-8 py-5 rounded-3xl shadow-2xl"
              style={{
                background: 'linear-gradient(135deg, rgba(255,255,255,0.2) 0%, rgba(255,255,255,0.1) 50%, rgba(255,255,255,0.15) 100%)',
                backdropFilter: 'blur(40px)',
                WebkitBackdropFilter: 'blur(40px)',
                border: '1px solid rgba(255,255,255,0.3)',
                boxShadow: '0 25px 50px rgba(0,0,0,0.4), inset 0 1px 1px rgba(255,255,255,0.3), 0 0 80px rgba(251,191,36,0.2)'
              }}
            >
              <div className="flex items-center gap-4">
                {/* Start time */}
                <div className="text-center">
                  <p className="text-white/60 text-[10px] uppercase tracking-wider mb-1">From</p>
                  <p className="text-4xl font-light text-white tracking-tight" style={{ fontVariantNumeric: 'tabular-nums' }}>
                    {getDragPreviewTimeRange().start}
                  </p>
                </div>

                {/* Arrow */}
                <div className="flex flex-col items-center px-2">
                  <svg className="w-8 h-8 text-amber-400/80" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M17 8l4 4m0 0l-4 4m4-4H3" />
                  </svg>
                </div>

                {/* End time */}
                <div className="text-center">
                  <p className="text-white/60 text-[10px] uppercase tracking-wider mb-1">To</p>
                  <p className="text-4xl font-light text-white tracking-tight" style={{ fontVariantNumeric: 'tabular-nums' }}>
                    {getDragPreviewTimeRange().end}
                  </p>
                </div>
              </div>

              {/* Target day indicator when hovering calendar */}
              {dragOverDay && (
                <div className="mt-4 pt-3 border-t border-amber-400/30 text-center animate-fadeIn">
                  <p className="text-amber-400 text-sm font-medium">
                    📅 Move to {dragOverDay.toLocaleDateString('en-US', { weekday: 'short', month: 'short', day: 'numeric' })}
                  </p>
                </div>
              )}

              {/* Task info */}
              <div className={`mt-4 pt-3 border-t border-white/10 flex items-center justify-center gap-2 ${dragOverDay ? 'mt-0 pt-2 border-t-0' : ''}`}>
                <span className="text-lg">{draggingTask.icon}</span>
                <span className="text-white/80 text-sm font-medium">{draggingTask.title}</span>
              </div>
            </div>
          </div>
        )}

        {/* Edit Task Modal */}
        {editingTask && !focusMode && (
          <div className="fixed inset-0 z-50 flex items-end justify-center animate-fadeIn">
            <div
              className="absolute inset-0 bg-black/60 backdrop-blur-sm"
              onClick={() => setEditingTask(null)}
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
                  <h2 className="text-lg font-semibold text-white">Edit Task</h2>
                  <button
                    onClick={() => setEditingTask(null)}
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
                {/* Icon Picker */}
                <div className="mb-4">
                  <label className="text-xs font-medium text-slate-400 uppercase tracking-wide mb-2 block">Icon</label>
                  <div className="flex flex-wrap gap-1.5">
                    {iconOptions.map(icon => (
                      <button
                        key={icon}
                        onClick={() => setEditTaskIcon(icon)}
                        className={`w-9 h-9 rounded-xl flex items-center justify-center text-lg transition-all duration-150
                          ${editTaskIcon === icon
                            ? 'bg-amber-500 scale-110 shadow-lg shadow-amber-500/30'
                            : 'bg-white/10 hover:bg-white/20 hover:scale-105'}`}
                      >
                        {icon}
                      </button>
                    ))}
                  </div>
                </div>

                {/* Task Name */}
                <div className="mb-4">
                  <label className="text-xs font-medium text-slate-400 uppercase tracking-wide mb-2 block">Task Name</label>
                  <input
                    type="text"
                    value={editTaskName}
                    onChange={(e) => setEditTaskName(e.target.value)}
                    placeholder="What do you need to do?"
                    className="w-full px-4 py-3 bg-white/5 border border-white/10 rounded-xl focus:border-amber-500/50 focus:ring-2 focus:ring-amber-500/20 outline-none transition-all text-white placeholder:text-slate-500"
                  />
                </div>

                {/* Time Selection */}
                <div className="mb-4">
                  <label className="text-xs font-medium text-slate-400 uppercase tracking-wide mb-2 block">Time</label>
                  <div className="flex items-center gap-3">
                    <div className="flex-1">
                      <p className="text-[10px] text-slate-500 mb-1">From</p>
                      <div className="flex gap-1">
                        <select
                          value={editTaskStartHour}
                          onChange={(e) => setEditTaskStartHour(parseInt(e.target.value))}
                          className="flex-1 px-2 py-2.5 bg-white/10 border border-white/10 rounded-xl text-white text-center focus:ring-2 focus:ring-amber-500/30 outline-none cursor-pointer"
                        >
                          {Array.from({ length: 18 }, (_, i) => i + 6).map(h => (
                            <option key={h} value={h} className="bg-slate-800">{h}</option>
                          ))}
                        </select>
                        <span className="text-white/50 self-center">.</span>
                        <select
                          value={editTaskStartMinute}
                          onChange={(e) => setEditTaskStartMinute(parseInt(e.target.value))}
                          className="flex-1 px-2 py-2.5 bg-white/10 border border-white/10 rounded-xl text-white text-center focus:ring-2 focus:ring-amber-500/30 outline-none cursor-pointer"
                        >
                          {[0, 15, 30, 45].map(m => (
                            <option key={m} value={m} className="bg-slate-800">{m.toString().padStart(2, '0')}</option>
                          ))}
                        </select>
                      </div>
                    </div>

                    <svg className="w-6 h-6 text-amber-400/60 flex-shrink-0 mt-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 8l4 4m0 0l-4 4m4-4H3" />
                    </svg>

                    <div className="flex-1">
                      <p className="text-[10px] text-slate-500 mb-1">To</p>
                      <div className="flex gap-1">
                        <select
                          value={editTaskEndHour}
                          onChange={(e) => setEditTaskEndHour(parseInt(e.target.value))}
                          className="flex-1 px-2 py-2.5 bg-white/10 border border-white/10 rounded-xl text-white text-center focus:ring-2 focus:ring-amber-500/30 outline-none cursor-pointer"
                        >
                          {Array.from({ length: 18 }, (_, i) => i + 6).map(h => (
                            <option key={h} value={h} className="bg-slate-800">{h}</option>
                          ))}
                        </select>
                        <span className="text-white/50 self-center">.</span>
                        <select
                          value={editTaskEndMinute}
                          onChange={(e) => setEditTaskEndMinute(parseInt(e.target.value))}
                          className="flex-1 px-2 py-2.5 bg-white/10 border border-white/10 rounded-xl text-white text-center focus:ring-2 focus:ring-amber-500/30 outline-none cursor-pointer"
                        >
                          {[0, 15, 30, 45].map(m => (
                            <option key={m} value={m} className="bg-slate-800">{m.toString().padStart(2, '0')}</option>
                          ))}
                        </select>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Energy Level */}
                <div className="mb-4">
                  <label className="text-xs font-medium text-slate-400 uppercase tracking-wide mb-2 block">Energy Level</label>
                  <div className="flex gap-2">
                    {['low', 'medium', 'high'].map(e => (
                      <button
                        key={e}
                        onClick={() => setEditTaskEnergy(e)}
                        className={`flex-1 py-2.5 rounded-xl font-medium text-sm transition-all duration-200
                          ${editTaskEnergy === e
                            ? e === 'low'
                              ? 'bg-emerald-500/80 text-white shadow-lg shadow-emerald-500/30'
                              : e === 'medium'
                                ? 'bg-amber-500/80 text-white shadow-lg shadow-amber-500/30'
                                : 'bg-rose-500/80 text-white shadow-lg shadow-rose-500/30'
                            : 'bg-white/10 text-slate-400 hover:bg-white/20'}`}
                      >
                        {e === 'low' ? '🌱 Low' : e === 'medium' ? '⚡ Med' : '🔥 High'}
                      </button>
                    ))}
                  </div>
                </div>

                {/* Focus Mode Button */}
                {!editingTask?.completed && (
                  <button
                    onClick={() => startFocusMode(editingTask)}
                    className="w-full py-3.5 rounded-xl font-semibold text-sm transition-all duration-200 flex items-center justify-center gap-2 mb-4
                      bg-gradient-to-r from-purple-500/30 to-indigo-500/30 text-purple-300 border border-purple-500/30 hover:from-purple-500/50 hover:to-indigo-500/50"
                  >
                    <span className="text-lg">🎯</span>
                    <span>Start Focus Mode (Pomodoro)</span>
                  </button>
                )}
              </div>

              {/* Footer */}
              <div className="px-5 py-4 border-t border-white/10">
                <div className="flex gap-3">
                  <button
                    onClick={() => deleteTask(editingTask.id)}
                    className="px-4 py-3 rounded-xl font-medium text-rose-400 bg-rose-500/10 hover:bg-rose-500/20 transition-all"
                  >
                    <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                    </svg>
                  </button>
                  <button
                    onClick={() => setEditingTask(null)}
                    className="flex-1 py-3 rounded-xl font-medium text-slate-400 bg-white/10 hover:bg-white/20 transition-all"
                  >
                    Cancel
                  </button>
                  <button
                    onClick={saveTaskEdit}
                    disabled={!editTaskName.trim()}
                    className={`flex-1 py-3 rounded-xl font-semibold transition-all duration-200
                      ${editTaskName.trim()
                        ? 'bg-gradient-to-r from-amber-500 to-orange-500 text-white shadow-lg shadow-amber-500/30'
                        : 'bg-white/5 text-slate-600 cursor-not-allowed'}`}
                  >
                    Save Changes
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Focus Mode - Full Screen Pomodoro Timer */}
        {focusMode && focusTask && (
          <div className="fixed inset-0 z-50 flex flex-col items-center justify-center animate-fadeIn"
            style={{
              background: 'linear-gradient(180deg, rgba(10,10,20,0.98) 0%, rgba(20,10,30,0.98) 100%)'
            }}
          >
            {/* Close button */}
            <button
              onClick={() => {
                setFocusMode(false);
                setFocusTask(null);
                setPomodoroRunning(false);
              }}
              className="absolute top-6 right-6 w-10 h-10 rounded-full bg-white/10 flex items-center justify-center text-slate-400 hover:bg-white/20 transition-colors z-10"
            >
              <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>

            {/* Background ambient glow */}
            <div className="absolute inset-0 overflow-hidden pointer-events-none">
              <div className={`absolute top-1/4 left-1/2 -translate-x-1/2 w-96 h-96 rounded-full blur-3xl transition-colors duration-1000 ${isBreak ? 'bg-emerald-500/20' : 'bg-purple-500/20'
                }`}></div>
            </div>

            {/* Task info */}
            <div className="mb-8 text-center relative z-10">
              <span className="text-5xl mb-4 block">{focusTask.icon}</span>
              <h2 className="text-xl font-semibold text-white mb-2">{focusTask.title}</h2>
              <p className={`text-sm font-medium ${isBreak ? 'text-emerald-400' : 'text-purple-400'}`}>
                {isBreak ? '☕ Break Time' : `🎯 Focus Session ${pomodoroSession}`}
              </p>
            </div>

            {/* Liquid Glass Timer */}
            <div
              className="relative mb-10"
              style={{
                width: '280px',
                height: '280px'
              }}
            >
              {/* Outer glass ring */}
              <div
                className="absolute inset-0 rounded-full"
                style={{
                  background: 'linear-gradient(135deg, rgba(255,255,255,0.1) 0%, rgba(255,255,255,0.05) 50%, rgba(255,255,255,0.08) 100%)',
                  backdropFilter: 'blur(20px)',
                  border: '1px solid rgba(255,255,255,0.15)',
                  boxShadow: `0 25px 60px rgba(0,0,0,0.4), inset 0 1px 1px rgba(255,255,255,0.2), 0 0 100px ${isBreak ? 'rgba(52,211,153,0.2)' : 'rgba(139,92,246,0.2)'}`
                }}
              />

              {/* Progress ring */}
              <svg className="absolute inset-0 w-full h-full -rotate-90">
                <circle
                  cx="140"
                  cy="140"
                  r="125"
                  fill="none"
                  stroke="rgba(255,255,255,0.1)"
                  strokeWidth="8"
                />
                <circle
                  cx="140"
                  cy="140"
                  r="125"
                  fill="none"
                  stroke={isBreak ? 'rgb(52,211,153)' : 'rgb(139,92,246)'}
                  strokeWidth="8"
                  strokeLinecap="round"
                  strokeDasharray={2 * Math.PI * 125}
                  strokeDashoffset={2 * Math.PI * 125 * (1 - pomodoroTime / (isBreak ? (pomodoroSession % 4 === 0 ? 15 * 60 : 5 * 60) : getTaskFocusDuration(focusTask)))}
                  className="transition-all duration-1000"
                  style={{
                    filter: `drop-shadow(0 0 10px ${isBreak ? 'rgb(52,211,153)' : 'rgb(139,92,246)'})`
                  }}
                />
              </svg>

              {/* Inner glass circle with time */}
              <div
                className="absolute inset-6 rounded-full flex flex-col items-center justify-center"
                style={{
                  background: 'linear-gradient(180deg, rgba(255,255,255,0.08) 0%, rgba(255,255,255,0.03) 100%)',
                  backdropFilter: 'blur(10px)',
                  border: '1px solid rgba(255,255,255,0.1)',
                  boxShadow: 'inset 0 2px 10px rgba(0,0,0,0.2)'
                }}
              >
                <span
                  className="text-6xl font-extralight text-white tracking-tight"
                  style={{ fontVariantNumeric: 'tabular-nums' }}
                >
                  {formatPomodoroTime(pomodoroTime)}
                </span>
                <span className="text-white/40 text-sm mt-2">
                  {isBreak ? 'until focus' : 'remaining'}
                </span>
              </div>
            </div>

            {/* Control buttons */}
            <div className="flex gap-4 relative z-10">
              {/* Reset button */}
              <button
                onClick={() => {
                  setPomodoroTime(isBreak ? (pomodoroSession % 4 === 0 ? 15 * 60 : 5 * 60) : getTaskFocusDuration(focusTask));
                  setPomodoroRunning(false);
                }}
                className="w-14 h-14 rounded-full flex items-center justify-center transition-all"
                style={{
                  background: 'linear-gradient(135deg, rgba(255,255,255,0.1) 0%, rgba(255,255,255,0.05) 100%)',
                  backdropFilter: 'blur(10px)',
                  border: '1px solid rgba(255,255,255,0.1)'
                }}
              >
                <svg className="w-6 h-6 text-white/60" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
                </svg>
              </button>

              {/* Play/Pause button */}
              <button
                onClick={() => setPomodoroRunning(!pomodoroRunning)}
                className="w-20 h-20 rounded-full flex items-center justify-center transition-all hover:scale-105"
                style={{
                  background: isBreak
                    ? 'linear-gradient(135deg, rgba(52,211,153,0.8) 0%, rgba(16,185,129,0.8) 100%)'
                    : 'linear-gradient(135deg, rgba(139,92,246,0.8) 0%, rgba(99,102,241,0.8) 100%)',
                  backdropFilter: 'blur(10px)',
                  border: '1px solid rgba(255,255,255,0.2)',
                  boxShadow: isBreak
                    ? '0 10px 40px rgba(52,211,153,0.4)'
                    : '0 10px 40px rgba(139,92,246,0.4)'
                }}
              >
                {pomodoroRunning ? (
                  <svg className="w-8 h-8 text-white" fill="currentColor" viewBox="0 0 24 24">
                    <path d="M6 4h4v16H6V4zm8 0h4v16h-4V4z" />
                  </svg>
                ) : (
                  <svg className="w-8 h-8 text-white ml-1" fill="currentColor" viewBox="0 0 24 24">
                    <path d="M8 5v14l11-7z" />
                  </svg>
                )}
              </button>

              {/* Skip button */}
              <button
                onClick={() => {
                  if (!isBreak) {
                    // Add time worked so far
                    const taskDuration = getTaskFocusDuration(focusTask);
                    setTotalFocusTime(t => t + (taskDuration - pomodoroTime));
                  }
                  if (isBreak) {
                    setPomodoroSession(s => s + 1);
                    setPomodoroTime(getTaskFocusDuration(focusTask));
                    setIsBreak(false);
                  } else {
                    if (pomodoroSession % 4 === 0) {
                      setPomodoroTime(15 * 60);
                    } else {
                      setPomodoroTime(5 * 60);
                    }
                    setIsBreak(true);
                  }
                  setPomodoroRunning(false);
                }}
                className="w-14 h-14 rounded-full flex items-center justify-center transition-all"
                style={{
                  background: 'linear-gradient(135deg, rgba(255,255,255,0.1) 0%, rgba(255,255,255,0.05) 100%)',
                  backdropFilter: 'blur(10px)',
                  border: '1px solid rgba(255,255,255,0.1)'
                }}
              >
                <svg className="w-6 h-6 text-white/60" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 5l7 7-7 7M5 5l7 7-7 7" />
                </svg>
              </button>
            </div>

            {/* Session stats */}
            <div
              className="mt-10 px-6 py-4 rounded-2xl flex gap-8"
              style={{
                background: 'linear-gradient(135deg, rgba(255,255,255,0.05) 0%, rgba(255,255,255,0.02) 100%)',
                backdropFilter: 'blur(10px)',
                border: '1px solid rgba(255,255,255,0.1)'
              }}
            >
              <div className="text-center">
                <p className="text-2xl font-bold text-white">{pomodoroSession}</p>
                <p className="text-xs text-white/40">Sessions</p>
              </div>
              <div className="w-px bg-white/10"></div>
              <div className="text-center">
                <p className="text-2xl font-bold text-white">{Math.floor(totalFocusTime / 60)}</p>
                <p className="text-xs text-white/40">Minutes focused</p>
              </div>
              <div className="w-px bg-white/10"></div>
              <div className="text-center">
                <p className="text-2xl font-bold text-white">{4 - (pomodoroSession % 4 || 4)}</p>
                <p className="text-xs text-white/40">Until long break</p>
              </div>
            </div>

            {/* Complete task button */}
            {!focusTask.completed && (
              <button
                onClick={() => {
                  completeTask(focusTask.id);
                  setFocusMode(false);
                  setFocusTask(null);
                }}
                className="mt-6 px-8 py-3 rounded-xl font-semibold bg-emerald-500/20 text-emerald-300 border border-emerald-500/30 hover:bg-emerald-500/30 transition-all flex items-center gap-2"
              >
                <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                </svg>
                Mark Task Complete
              </button>
            )}
          </div>
        )}
      </div>
    );
  };

  // ============================================
  // REVIEW SCREEN - Evening Reflection with Memory
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
      currentReflection.lesson || currentReflection.rating || currentReflection.photo;

    // Check if reflection has any content at all (for showing capsule button)
    const canCreateCapsule = currentReflection.activities || currentReflection.topResult ||
      currentReflection.energyDrain || currentReflection.didWell ||
      currentReflection.lesson || currentReflection.rating || currentReflection.photo;

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
      const shareText = `Memory Capsule - ${new Date(selectedReflectDate).toLocaleDateString()}\nRating: ${currentReflection.rating}/10\n\nToday in brief: ${currentReflection.activities?.split('.')[0] || 'Brief summary'}\n\nTop moment: ${currentReflection.topResult || 'N/A'}\n\nLesson learned: ${currentReflection.lesson || 'N/A'}`;

      if (navigator.share) {
        try {
          await navigator.share({
            title: 'My Memory Capsule',
            text: shareText,
          });
        } catch (error) {
          console.log('Error sharing:', error);
        }
      } else {
        navigator.clipboard.writeText(shareText);
        alert('Capsule summary copied to clipboard!');
      }
    };

    // Generate Memory Capsule
    const createMemoryCapsule = () => {
      console.log('Creating memory capsule...');
      updateReflection(selectedReflectDate, 'capsuleCreated', true);
      setReviewViewMode('capsule');
      console.log('View mode set to capsule');
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
          reflection.lesson || reflection.rating);

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
          dayName: date.toLocaleDateString('en-US', { weekday: 'short' }),
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
            reflection.lesson || reflection.rating),
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
      if (currentReflection.topResult) {
        summaryLines.push(`Key win: ${currentReflection.topResult}.`);
      }
      if (currentReflection.energyDrain) {
        summaryLines.push(`Energy spent on ${currentReflection.energyDrain.toLowerCase()}.`);
      }

      return summaryLines.join(' ') || null;
    };

    return (
      <div className="pb-28 animate-fadeIn">
        {/* Header - Centered Apple Style */}
        <div className="mb-6 text-center">
          <p className="text-indigo-400/80 text-xs font-medium uppercase tracking-widest mb-2">
            {selectedReflectDate.toLocaleDateString('en-US', { month: 'long', day: 'numeric' })}
          </p>
          <h1 className="text-3xl font-semibold text-white tracking-tight">
            {isViewingToday ? 'Reflect' : selectedReflectDate.toLocaleDateString('en-US', { weekday: 'long' })}
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
                Today
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
                {weekDays.length > 0 && weekDays[3].date.toLocaleDateString('en-US', { month: 'long', year: 'numeric' })}
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
              {['Mo', 'Tu', 'We', 'Th', 'Fr', 'Sa', 'Su'].map(day => (
                <div key={day} className="text-center text-xs text-slate-500 font-medium py-1">
                  {day}
                </div>
              ))}
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
                <span className="text-slate-300 font-medium">Day Rating</span>
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

            {/* Photo of the Day */}
            <div className="glass-card rounded-2xl p-4 mb-4">
              <div className="flex items-center justify-between mb-3">
                <span className="text-slate-300 font-medium">📸 Photo of the Day</span>
                {currentReflection.photo && (
                  <button
                    onClick={() => setReviewShowPhotoModal(true)}
                    className="text-xs text-purple-400 hover:text-purple-300 transition-colors"
                  >
                    View
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
                    <span className="text-white font-medium text-sm">Click to view</span>
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
                    Add a memory from today
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
                      {selectedReflectDate.toLocaleDateString('en-US', {
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
                      Change Photo
                    </button>
                    <button
                      onClick={removePhoto}
                      className="px-4 py-2 rounded-xl bg-rose-500/20 text-rose-400 text-sm font-medium hover:bg-rose-500/30 transition-all flex items-center gap-2"
                    >
                      <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                      </svg>
                      Remove
                    </button>
                  </div>
                </div>
              </div>
            )}

            {/* Questions - All visible with auto-save */}
            <div className="space-y-4">
              {reflectionQuestions.map((q) => (
                <ReflectionInput
                  key={`${getDateKey(selectedReflectDate)}-${q.key}`}
                  question={q.question}
                  placeholder={q.placeholder}
                  icon={q.icon}
                  defaultValue={currentReflection[q.key] || ''}
                  onBlurSave={(value) => handleFieldChange(q.key, value)}
                  onValueChange={(value) => handleFieldChange(q.key, value)}
                />
              ))}
            </div>

            {/* Create Memory Capsule Button - Always visible */}
            <div className="mt-6">
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
                <span>Create Memory Capsule</span>
              </button>
              <p className="text-center text-slate-500 text-xs mt-3">
                {canCreateCapsule
                  ? "Capture this day's reflection as a beautiful memory"
                  : "Answer at least one question to create your capsule"}
              </p>
            </div>

            {/* Auto-save indicator */}
            <div className="mt-4 flex items-center justify-center gap-2 text-slate-500 text-xs">
              <div className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse"></div>
              <span>Auto-saving</span>
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
                <span className="text-indigo-400/80 text-xs font-medium uppercase tracking-widest px-3">Memory Capsule</span>
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
                      <p className="text-[10px] font-medium text-indigo-400/70 uppercase tracking-widest mb-2">Today in Brief</p>
                      <p className="text-slate-200 text-sm leading-relaxed">
                        {currentReflection.activities?.split('.')[0] || currentReflection.activities}
                        {currentReflection.rating >= 7 ? ' — a good day overall.' : currentReflection.rating >= 4 ? ' — a balanced day.' : ' — a challenging day.'}
                      </p>
                    </div>
                  )}

                  {/* What Stood Out */}
                  {currentReflection.topResult && (
                    <div
                      className="p-4 rounded-2xl"
                      style={{
                        background: 'rgba(255,255,255,0.06)',
                        border: '1px solid rgba(255,255,255,0.08)'
                      }}
                    >
                      <p className="text-[10px] font-medium text-indigo-400/70 uppercase tracking-widest mb-2">What Stood Out</p>
                      <p className="text-slate-200 text-sm leading-relaxed">{currentReflection.topResult}</p>
                    </div>
                  )}

                  {/* Energy Note */}
                  {currentReflection.energyDrain && (
                    <div
                      className="p-4 rounded-2xl"
                      style={{
                        background: 'rgba(255,255,255,0.06)',
                        border: '1px solid rgba(255,255,255,0.08)'
                      }}
                    >
                      <p className="text-[10px] font-medium text-amber-400/70 uppercase tracking-widest mb-2">Energy Note</p>
                      <p className="text-slate-300 text-sm leading-relaxed">{currentReflection.energyDrain}</p>
                    </div>
                  )}

                  {/* Quiet Insight */}
                  {currentReflection.lesson && (
                    <div
                      className="p-4 rounded-2xl"
                      style={{
                        background: 'linear-gradient(135deg, rgba(139,92,246,0.1) 0%, rgba(99,102,241,0.1) 100%)',
                        border: '1px solid rgba(139,92,246,0.2)'
                      }}
                    >
                      <p className="text-[10px] font-medium text-purple-400/80 uppercase tracking-widest mb-2">Quiet Insight</p>
                      <p className="text-slate-200 text-sm leading-relaxed italic">"{currentReflection.lesson}"</p>
                    </div>
                  )}

                  {/* Tomorrow's Focus */}
                  {currentReflection.didWell && (
                    <div
                      className="p-4 rounded-2xl"
                      style={{
                        background: 'rgba(255,255,255,0.06)',
                        border: '1px solid rgba(255,255,255,0.08)'
                      }}
                    >
                      <p className="text-[10px] font-medium text-emerald-400/70 uppercase tracking-widest mb-2">Tomorrow's Focus</p>
                      <p className="text-slate-300 text-sm leading-relaxed">
                        Keep building on: {currentReflection.didWell.toLowerCase()}
                      </p>
                    </div>
                  )}

                  {/* Footer with date and rating */}
                  <div className="flex items-center justify-between pt-2">
                    <div className="flex items-center gap-2">
                      <span className="text-slate-500 text-xs">
                        {selectedReflectDate.toLocaleDateString('en-US', { weekday: 'long', month: 'short', day: 'numeric' })}
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
                <span>Share Capsule</span>
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
      const dayTasks = tasksByDate[dateKey] || [];
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
          <p className="text-emerald-400/80 text-xs font-medium uppercase tracking-widest mb-2">Analytics</p>
          <h1 className="text-3xl font-semibold text-white tracking-tight">Patterns</h1>
        </div>

        <div className="flex gap-2 mb-6">
          <button onClick={() => setPatternsActiveSection('habits')} className={`flex-1 py-3 rounded-xl font-medium text-sm transition-all flex items-center justify-center gap-2 ${patternsActiveSection === 'habits' ? 'bg-gradient-to-r from-purple-500 to-indigo-500 text-white' : 'glass-card text-slate-400'}`}>
            <span className="text-lg">✅</span> Habits
          </button>
          <button onClick={() => setPatternsActiveSection('tasks')} className={`flex-1 py-3 rounded-xl font-medium text-sm transition-all flex items-center justify-center gap-2 ${patternsActiveSection === 'tasks' ? 'bg-gradient-to-r from-cyan-500 to-blue-500 text-white' : 'glass-card text-slate-400'}`}>
            <span className="text-lg">📋</span> Tasks
          </button>
          <button onClick={() => setPatternsActiveSection('reflect')} className={`flex-1 py-3 rounded-xl font-medium text-sm transition-all flex items-center justify-center gap-2 ${patternsActiveSection === 'reflect' ? 'bg-gradient-to-r from-indigo-500 to-purple-500 text-white' : 'glass-card text-slate-400'}`}>
            <span className="text-lg">🧠</span> Reflect
          </button>
        </div>

        {/* CONTENT */}
        {patternsActiveSection === 'habits' ? (
          <>
            <div className="grid grid-cols-3 gap-3 mb-6">
              <div className="glass-card rounded-2xl p-4 text-center">
                <div className="text-2xl mb-1">🔥</div>
                <p className="text-3xl font-bold text-white">{currentStreak}</p>
                <p className="text-slate-400 text-xs">Day Streak</p>
              </div>
              <div className="glass-card rounded-2xl p-4 text-center">
                <div className="text-2xl mb-1">⭐</div>
                <p className="text-3xl font-bold text-white">{perfectDaysWeek}</p>
                <p className="text-slate-400 text-xs">Perfect Days</p>
              </div>
              <div className="glass-card rounded-2xl p-4 text-center">
                <div className="text-2xl mb-1">📊</div>
                <p className="text-3xl font-bold text-white">{weekAvgOverall}%</p>
                <p className="text-slate-400 text-xs">Week Avg</p>
              </div>
            </div>
            {/* View Toggle */}
            <div className="flex bg-white/5 p-1 rounded-xl mb-6">
              <button onClick={() => setPatternsViewMode('week')} className={`flex-1 py-3 rounded-xl font-medium text-sm transition-all ${patternsViewMode === 'week' ? 'bg-gradient-to-r from-emerald-500 to-green-500 text-white' : 'text-slate-400'}`}>Week View</button>
              <button onClick={() => setPatternsViewMode('month')} className={`flex-1 py-3 rounded-xl font-medium text-sm transition-all ${patternsViewMode === 'month' ? 'bg-gradient-to-r from-emerald-500 to-green-500 text-white' : 'text-slate-400'}`}>Month View</button>
            </div>

            {patternsViewMode === 'week' ? (
              <>
                <div className="glass-card rounded-2xl p-4 mb-4">
                  <div className="flex items-center justify-between mb-4">
                    <div className="flex items-center gap-2"><span className="text-xl">🌅</span><h3 className="text-white font-medium">Morning Routine</h3></div>
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
                    <div className="flex items-center gap-2"><span className="text-xl">🌙</span><h3 className="text-white font-medium">Evening Routine</h3></div>
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
                  <h3 className="text-white font-medium mb-4">This Week's Habits</h3>
                  <div className="mb-4">
                    <p className="text-slate-400 text-xs uppercase tracking-wider mb-2">🌅 Morning</p>
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
                    <p className="text-slate-400 text-xs uppercase tracking-wider mb-2">🌙 Evening</p>
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
                  <h3 className="text-white font-medium">{selectedMonth.toLocaleDateString('en-US', { month: 'long', year: 'numeric' })}</h3>
                  <button onClick={nextMonth} className="w-10 h-10 rounded-xl glass-card flex items-center justify-center text-slate-400 hover:text-white transition-all"><svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" /></svg></button>
                </div>

                <div className="glass-card rounded-2xl p-4 mb-4">
                  <div className="flex items-center gap-2 mb-3"><span className="text-lg">🌅</span><h3 className="text-white font-medium">Morning Routine</h3></div>
                  <div className="grid grid-cols-7 gap-1 mb-2">{['M', 'T', 'W', 'T', 'F', 'S', 'S'].map((d, i) => <div key={i} className="text-center text-[10px] text-slate-500">{d}</div>)}</div>
                  <div className="grid grid-cols-7 gap-1">
                    {Array.from({ length: (new Date(selectedMonth.getFullYear(), selectedMonth.getMonth(), 1).getDay() + 6) % 7 }).map((_, i) => <div key={`e${i}`} className="aspect-square" />)}
                    {monthStats.map((day, i) => <div key={i} className={`aspect-square rounded-md ${getHeatmapColor(day.morning.percent)} flex items-center justify-center transition-all hover:scale-110`}><span className="text-[10px] text-white/70">{day.dayNum}</span></div>)}
                  </div>
                  <div className="flex items-center justify-center gap-1 mt-3"><span className="text-[10px] text-slate-500">0%</span><div className="w-4 h-3 rounded bg-white/10"></div><div className="w-4 h-3 rounded bg-orange-400/50"></div><div className="w-4 h-3 rounded bg-amber-400/60"></div><div className="w-4 h-3 rounded bg-green-400/70"></div><div className="w-4 h-3 rounded bg-emerald-500"></div><span className="text-[10px] text-slate-500">100%</span></div>
                </div>

                <div className="glass-card rounded-2xl p-4">
                  <div className="flex items-center gap-2 mb-3"><span className="text-lg">🌙</span><h3 className="text-white font-medium">Evening Routine</h3></div>
                  <div className="grid grid-cols-7 gap-1 mb-2">{['M', 'T', 'W', 'T', 'F', 'S', 'S'].map((d, i) => <div key={i} className="text-center text-[10px] text-slate-500">{d}</div>)}</div>
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
                <p className="text-slate-400 text-xs">Completed</p>
              </div>
              <div className="glass-card rounded-2xl p-4 text-center">
                <div className="text-2xl mb-1">📊</div>
                <p className="text-3xl font-bold text-white">{weekTasksPercent}%</p>
                <p className="text-slate-400 text-xs">Completion</p>
              </div>
              <div className="glass-card rounded-2xl p-4 text-center">
                <div className="text-2xl mb-1">📁</div>
                <p className="text-3xl font-bold text-white">{activeProjects.length}</p>
                <p className="text-slate-400 text-xs">Active Projects</p>
              </div>
            </div>

            {/* View Toggle */}
            <div className="flex gap-2 mb-6">
              <button onClick={() => setPatternsViewMode('week')} className={`flex-1 py-3 rounded-xl font-medium text-sm transition-all ${patternsViewMode === 'week' ? 'bg-gradient-to-r from-cyan-500 to-blue-500 text-white' : 'glass-card text-slate-400'}`}>Week View</button>
              <button onClick={() => setPatternsViewMode('month')} className={`flex-1 py-3 rounded-xl font-medium text-sm transition-all ${patternsViewMode === 'month' ? 'bg-gradient-to-r from-cyan-500 to-blue-500 text-white' : 'glass-card text-slate-400'}`}>Month View</button>
            </div>

            {patternsViewMode === 'week' ? (
              <>
                {/* Tasks Completed - Week Chart */}
                <div className="glass-card rounded-2xl p-4 mb-4">
                  <div className="flex items-center justify-between mb-4">
                    <div className="flex items-center gap-2"><span className="text-xl">📋</span><h3 className="text-white font-medium">Daily Tasks</h3></div>
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
                  <h3 className="text-white font-medium mb-4">Project Progress</h3>
                  {projects.length === 0 ? (
                    <p className="text-slate-500 text-sm text-center py-4">No projects yet</p>
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
                  <h3 className="text-white font-medium mb-4">Tasks by Energy</h3>
                  {totalEnergyTasks === 0 ? (
                    <p className="text-slate-500 text-sm text-center py-4">No tasks yet</p>
                  ) : (
                    <div className="space-y-3">
                      <div className="flex items-center gap-3">
                        <div className="w-8 h-8 rounded-lg bg-rose-500/20 flex items-center justify-center"><span className="text-sm">🔥</span></div>
                        <span className="text-slate-300 text-sm flex-1">High Energy</span>
                        <div className="w-32 h-2 bg-white/10 rounded-full overflow-hidden">
                          <div className="h-full rounded-full bg-gradient-to-r from-rose-500 to-orange-500" style={{ width: `${(tasksByEnergy.high / totalEnergyTasks) * 100}%` }} />
                        </div>
                        <span className="text-slate-400 text-xs w-8 text-right">{tasksByEnergy.high}</span>
                      </div>
                      <div className="flex items-center gap-3">
                        <div className="w-8 h-8 rounded-lg bg-amber-500/20 flex items-center justify-center"><span className="text-sm">⚡</span></div>
                        <span className="text-slate-300 text-sm flex-1">Medium Energy</span>
                        <div className="w-32 h-2 bg-white/10 rounded-full overflow-hidden">
                          <div className="h-full rounded-full bg-gradient-to-r from-amber-500 to-yellow-500" style={{ width: `${(tasksByEnergy.medium / totalEnergyTasks) * 100}%` }} />
                        </div>
                        <span className="text-slate-400 text-xs w-8 text-right">{tasksByEnergy.medium}</span>
                      </div>
                      <div className="flex items-center gap-3">
                        <div className="w-8 h-8 rounded-lg bg-emerald-500/20 flex items-center justify-center"><span className="text-sm">🌿</span></div>
                        <span className="text-slate-300 text-sm flex-1">Low Energy</span>
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
                  <h3 className="text-white font-medium">{selectedMonth.toLocaleDateString('en-US', { month: 'long', year: 'numeric' })}</h3>
                  <button onClick={nextMonth} className="w-10 h-10 rounded-xl glass-card flex items-center justify-center text-slate-400 hover:text-white transition-all"><svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" /></svg></button>
                </div>

                {/* Month Heatmap - Task Completion */}
                <div className="glass-card rounded-2xl p-4 mb-4">
                  <div className="flex items-center gap-2 mb-3"><span className="text-lg">📋</span><h3 className="text-white font-medium">Task Completion</h3></div>
                  <div className="grid grid-cols-7 gap-1 mb-2">{['M', 'T', 'W', 'T', 'F', 'S', 'S'].map((d, i) => <div key={i} className="text-center text-[10px] text-slate-500">{d}</div>)}</div>
                  <div className="grid grid-cols-7 gap-1">
                    {Array.from({ length: (new Date(selectedMonth.getFullYear(), selectedMonth.getMonth(), 1).getDay() + 6) % 7 }).map((_, i) => <div key={`e${i}`} className="aspect-square" />)}
                    {monthTaskStats.map((day, i) => <div key={i} className={`aspect-square rounded-md ${getHeatmapColor(day.percent)} flex items-center justify-center transition-all hover:scale-110`}><span className="text-[10px] text-white/70">{day.dayNum}</span></div>)}
                  </div>
                  <div className="flex items-center justify-center gap-1 mt-3"><span className="text-[10px] text-slate-500">0%</span><div className="w-4 h-3 rounded bg-white/10"></div><div className="w-4 h-3 rounded bg-orange-400/50"></div><div className="w-4 h-3 rounded bg-amber-400/60"></div><div className="w-4 h-3 rounded bg-green-400/70"></div><div className="w-4 h-3 rounded bg-emerald-500"></div><span className="text-[10px] text-slate-500">100%</span></div>
                </div>

                {/* Month Heatmap - Tasks Count */}
                <div className="glass-card rounded-2xl p-4">
                  <div className="flex items-center gap-2 mb-3"><span className="text-lg">✅</span><h3 className="text-white font-medium">Tasks Completed</h3></div>
                  <div className="grid grid-cols-7 gap-1 mb-2">{['M', 'T', 'W', 'T', 'F', 'S', 'S'].map((d, i) => <div key={i} className="text-center text-[10px] text-slate-500">{d}</div>)}</div>
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
                <p className="text-slate-400 text-xs">Day Streak</p>
              </div>
              <div className="glass-card rounded-2xl p-4 text-center">
                <div className="text-2xl mb-1">⭐</div>
                <p className="text-3xl font-bold text-white">{weekAvgRating}</p>
                <p className="text-slate-400 text-xs">Avg Rating</p>
              </div>
              <div className="glass-card rounded-2xl p-4 text-center">
                <div className="text-2xl mb-1">📝</div>
                <p className="text-3xl font-bold text-white">{weekReflectionCount}/7</p>
                <p className="text-slate-400 text-xs">This Week</p>
              </div>
            </div>
            {/* Reflect Stats View Toggle */}
            <div className="flex bg-white/5 p-1 rounded-xl mb-6">
              <button onClick={() => setPatternsViewMode('week')} className={`flex-1 py-3 rounded-xl font-medium text-sm transition-all ${patternsViewMode === 'week' ? 'bg-gradient-to-r from-indigo-500 to-purple-500 text-white' : 'glass-card text-slate-400'}`}>Week View</button>
              <button onClick={() => setPatternsViewMode('month')} className={`flex-1 py-3 rounded-xl font-medium text-sm transition-all ${patternsViewMode === 'month' ? 'bg-gradient-to-r from-indigo-500 to-purple-500 text-white' : 'glass-card text-slate-400'}`}>Month View</button>
            </div>

            {patternsViewMode === 'week' ? (
              <>
                <div className="glass-card rounded-2xl p-4 mb-4">
                  <div className="flex items-center justify-between mb-4">
                    <div className="flex items-center gap-2"><span className="text-xl">📊</span><h3 className="text-white font-medium">Day Ratings</h3></div>
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
                  <h3 className="text-white font-medium mb-4">This Week's Reflections</h3>
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
                              <p className="text-white font-medium text-sm">{day.date.toLocaleDateString('en-US', { weekday: 'long', month: 'short', day: 'numeric' })}</p>
                              {reflection?.topResult ? <p className="text-slate-400 text-xs truncate">{reflection.topResult}</p> : <p className="text-slate-500 text-xs italic">No reflection</p>}
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
                    <div className="flex items-center gap-2 mb-3"><span className="text-lg">📸</span><h3 className="text-white font-medium">Photos This Week</h3><span className="text-slate-400 text-sm">({weekPhotoCount})</span></div>
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
                  <div className="flex items-center gap-2 mb-3"><span className="text-lg">📊</span><h3 className="text-white font-medium">Day Ratings</h3></div>
                  <div className="grid grid-cols-7 gap-1 mb-2">{['M', 'T', 'W', 'T', 'F', 'S', 'S'].map((d, i) => <div key={i} className="text-center text-[10px] text-slate-500">{d}</div>)}</div>
                  <div className="grid grid-cols-7 gap-1">
                    {Array.from({ length: (new Date(selectedMonth.getFullYear(), selectedMonth.getMonth(), 1).getDay() + 6) % 7 }).map((_, i) => <div key={`e${i}`} className="aspect-square" />)}
                    {monthReflectStats.map((day, i) => <div key={i} className={`aspect-square rounded-md ${getRatingHeatmapColor(day.rating)} flex items-center justify-center transition-all hover:scale-110`}><span className="text-[10px] text-white/70">{day.dayNum}</span></div>)}
                  </div>
                  <div className="flex items-center justify-center gap-1 mt-3"><span className="text-[10px] text-slate-500">😢</span><div className="w-4 h-3 rounded bg-white/10"></div><div className="w-4 h-3 rounded bg-rose-400/50"></div><div className="w-4 h-3 rounded bg-orange-400/60"></div><div className="w-4 h-3 rounded bg-amber-400/70"></div><div className="w-4 h-3 rounded bg-green-400/80"></div><div className="w-4 h-3 rounded bg-emerald-500"></div><span className="text-[10px] text-slate-500">🌟</span></div>
                </div>

                <div className="glass-card rounded-2xl p-4">
                  <div className="flex items-center gap-2 mb-3"><span className="text-lg">📝</span><h3 className="text-white font-medium">Reflections Completed</h3></div>
                  <div className="grid grid-cols-7 gap-1 mb-2">{['M', 'T', 'W', 'T', 'F', 'S', 'S'].map((d, i) => <div key={i} className="text-center text-[10px] text-slate-500">{d}</div>)}</div>
                  <div className="grid grid-cols-7 gap-1">
                    {Array.from({ length: (new Date(selectedMonth.getFullYear(), selectedMonth.getMonth(), 1).getDay() + 6) % 7 }).map((_, i) => <div key={`e${i}`} className="aspect-square" />)}
                    {monthReflectStats.map((day, i) => <div key={i} className={`aspect-square rounded-md flex items-center justify-center transition-all hover:scale-110 ${day.hasCapsule ? 'bg-purple-500' : day.hasPhoto && day.hasReflection ? 'bg-indigo-500' : day.hasReflection ? 'bg-indigo-400/70' : 'bg-white/10'}`}><span className="text-[10px] text-white/70">{day.dayNum}</span></div>)}
                  </div>
                  <div className="flex items-center justify-center gap-2 mt-3">
                    <div className="flex items-center gap-1"><div className="w-3 h-3 rounded bg-white/10"></div><span className="text-[10px] text-slate-500">None</span></div>
                    <div className="flex items-center gap-1"><div className="w-3 h-3 rounded bg-indigo-400/70"></div><span className="text-[10px] text-slate-500">Reflected</span></div>
                    <div className="flex items-center gap-1"><div className="w-3 h-3 rounded bg-indigo-500"></div><span className="text-[10px] text-slate-500">+ Photo</span></div>
                    <div className="flex items-center gap-1"><div className="w-3 h-3 rounded bg-purple-500"></div><span className="text-[10px] text-slate-500">Capsule</span></div>
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
    ];

    const [localTaskData, setLocalTaskData] = useState({
      title: '',
      value: 5,
      energy: 'medium',
      timeEstimate: 30,
      dueDate: '',
      notes: ''
    });

    // Quick reminder state
    const [newReminderText, setNewReminderText] = useState('');
    // projectsShowMoveModal, reminderToMove, editingReminder lifted to App
    const [editReminderName, setEditReminderName] = useState('');
    const [editReminderIcon, setEditReminderIcon] = useState('📝');

    // Icon options for reminders
    const reminderIcons = ['📝', '💡', '🎯', '📌', '⭐', '🔔', '📋', '💼', '🏠', '🛒', '📞', '✉️', '🎨', '🔧', '📚', '💪'];

    const nonProjectReminders = reminders;


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
      setReminders(prev => prev.map(r =>
        r.id === projectsEditingReminder.id
          ? { ...r, name: editReminderName.trim(), icon: editReminderIcon }
          : r
      ));
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
        setLocalTaskData({
          title: editingProjectTask.title || '',
          value: editingProjectTask.value || 5,
          energy: editingProjectTask.energy || 'medium',
          timeEstimate: editingProjectTask.timeEstimate || 30,
          dueDate: editingProjectTask.dueDate || '',
          notes: editingProjectTask.notes || ''
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
      'not-started': { bg: 'bg-slate-500/20', text: 'text-slate-400', label: 'Not Started' },
      'active': { bg: 'bg-emerald-500/20', text: 'text-emerald-400', label: 'Active' },
      'on-hold': { bg: 'bg-amber-500/20', text: 'text-amber-400', label: 'On Hold' },
      'completed': { bg: 'bg-purple-500/20', text: 'text-purple-400', label: 'Completed' }
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
      { value: 15, label: '15 min' },
      { value: 30, label: '30 min' },
      { value: 45, label: '45 min' },
      { value: 60, label: '1 hour' },
      { value: 90, label: '1.5 hours' },
      { value: 120, label: '2 hours' },
      { value: 180, label: '3 hours' },
      { value: 240, label: '4 hours' },
      { value: 360, label: '6 hours' },
      { value: 480, label: '8 hours' },
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

    const openNewTask = () => {
      setLocalTaskData({
        title: '',
        value: 5,
        energy: 'medium',
        timeEstimate: 30,
        dueDate: '',
        notes: ''
      });
      setEditingProjectTask(null);
      setShowProjectTaskModal(true);
    };

    const openEditTask = (task) => {
      setEditingProjectTask(task);
      setShowProjectTaskModal(true);
    };

    const saveTask = () => {
      if (!localTaskData.title.trim() || !selectedProject) return;

      // Get fresh project ID
      const project = projects.find(p => p.id === selectedProject.id);
      if (!project) return;

      if (editingProjectTask) {
        updateProjectTask(project.id, editingProjectTask.id, localTaskData);
      } else {
        addProjectTask(project.id, localTaskData);
      }
      setEditingProjectTask(null);
      setShowProjectTaskModal(false);
    };

    const closeTaskModal = () => {
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
              {projects.filter(p => p.status === 'active').length} Active
            </p>
            <h1 className="text-3xl font-semibold text-white tracking-tight">Projects</h1>
          </div>

          {/* Reminders Section */}
          <div className="mb-6">
            <button
              onClick={() => setProjectsRemindersExpanded(!projectsRemindersExpanded)}
              className="w-full flex items-center justify-between mb-3 text-slate-400 hover:text-white transition-colors"
            >
              <div className="flex items-center gap-2">
                <span className="text-lg">💭</span>
                <h3 className="font-medium">Quick Reminders</h3>
                <span className="bg-slate-800 text-slate-400 text-xs px-2 py-0.5 rounded-full">
                  {nonProjectReminders.length}
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
                    placeholder="Capture an idea..."
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
                {reminders.length > 0 ? (
                  <div className="space-y-2">
                    {reminders.map(reminder => (
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
                    No reminders. Add ideas here or in Plan!
                  </div>
                )}
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
              <span className="text-slate-400 group-hover:text-cyan-400 font-medium">New Project</span>
            </button>
          </div>

          {projects.length === 0 && (
            <div className="glass-card rounded-2xl p-8 text-center">
              <div className="text-5xl mb-4">🎯</div>
              <p className="text-slate-300 font-medium mb-2">No projects yet</p>
              <p className="text-slate-500 text-sm">Create your first project to start tracking progress</p>
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
                    <h2 className="text-lg font-semibold text-white">Edit Reminder</h2>
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
                    <label className="text-slate-400 text-sm mb-2 block">Icon</label>
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
                    <label className="text-slate-400 text-sm mb-2 block">Name</label>
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
                    Save Changes
                  </button>

                  {/* Delete Button */}
                  <button
                    onClick={() => {
                      deleteReminder(projectsEditingReminder.id);
                      closeEditReminder();
                    }}
                    className="w-full py-3 rounded-xl font-medium text-rose-400 bg-rose-500/10 hover:bg-rose-500/20 transition-all"
                  >
                    Delete Reminder
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
                    <h2 className="text-lg font-semibold text-white">Move to Project</h2>
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
                    Moving: <span className="text-cyan-400">{projectsReminderToMove.name}</span>
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
                      <p className="text-slate-400 mb-4">No projects yet</p>
                      <button
                        onClick={() => {
                          setProjectsShowMoveModal(false);
                          openNewProject();
                        }}
                        className="px-4 py-2 bg-cyan-500/20 text-cyan-400 rounded-xl font-medium hover:bg-cyan-500/30 transition-all"
                      >
                        Create Project First
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
                      {editingProject ? 'Edit Project' : 'New Project'}
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
                    <label className="text-slate-400 text-sm mb-2 block">Title *</label>
                    <input
                      type="text"
                      value={localProjectData.title}
                      onChange={(e) => setLocalProjectData(prev => ({ ...prev, title: e.target.value }))}
                      placeholder="Project name"
                      className="w-full px-4 py-3 bg-white/5 border border-white/10 rounded-xl text-white placeholder:text-slate-500 outline-none focus:border-cyan-500/50"
                    />
                  </div>

                  {/* Description */}
                  <div>
                    <label className="text-slate-400 text-sm mb-2 block">Description (optional)</label>
                    <textarea
                      value={localProjectData.description}
                      onChange={(e) => setLocalProjectData(prev => ({ ...prev, description: e.target.value }))}
                      placeholder="What is this project about?"
                      rows={3}
                      className="w-full px-4 py-3 bg-white/5 border border-white/10 rounded-xl text-white placeholder:text-slate-500 outline-none focus:border-cyan-500/50 resize-none"
                    />
                  </div>

                  {/* Dates */}
                  <div className="grid grid-cols-2 gap-3">
                    <div>
                      <label className="text-slate-400 text-sm mb-2 block">Start Date</label>
                      <input
                        type="date"
                        value={localProjectData.startDate}
                        onChange={(e) => setLocalProjectData(prev => ({ ...prev, startDate: e.target.value }))}
                        className="w-full px-4 py-3 bg-white/5 border border-white/10 rounded-xl text-white outline-none focus:border-cyan-500/50"
                      />
                    </div>
                    <div>
                      <label className="text-slate-400 text-sm mb-2 block">End Date</label>
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
                    <label className="text-slate-400 text-sm mb-2 block">Status</label>
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
                    <label className="text-slate-400 text-sm mb-2 block">Timeline Color</label>
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
                    {editingProject ? 'Save Changes' : 'Create Project'}
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
            <span className="text-sm">Back to Projects</span>
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
              <h3 className="text-slate-400 text-sm font-medium uppercase tracking-wider">Notes</h3>
            </div>
            {!projectsIsEditingNotes && (
              <button
                onClick={() => startEditingNotes(currentProject)}
                className="text-cyan-400 text-xs hover:text-cyan-300 transition-colors"
              >
                {currentProject.notes ? 'Edit' : '+ Add'}
              </button>
            )}
          </div>

          {projectsIsEditingNotes ? (
            <div className="space-y-3">
              <textarea
                value={notesText}
                onChange={(e) => setNotesText(e.target.value)}
                placeholder="Write your ideas, thoughts, and reminders about this project..."
                rows={4}
                className="w-full px-4 py-3 bg-white/5 border border-white/10 rounded-xl text-white placeholder:text-slate-500 outline-none focus:border-cyan-500/50 resize-none text-sm"
                autoFocus
              />
              <div className="flex gap-2">
                <button
                  onClick={saveNotes}
                  className="flex-1 py-2 rounded-xl text-sm font-medium text-white bg-cyan-500/20 hover:bg-cyan-500/30 border border-cyan-500/30 transition-all"
                >
                  Save
                </button>
                <button
                  onClick={cancelEditingNotes}
                  className="flex-1 py-2 rounded-xl text-sm font-medium text-slate-400 bg-white/5 hover:bg-white/10 transition-all"
                >
                  Cancel
                </button>
              </div>
            </div>
          ) : (
            <div>
              {currentProject.notes ? (
                <p className="text-slate-300 text-sm leading-relaxed whitespace-pre-wrap">{currentProject.notes}</p>
              ) : (
                <p className="text-slate-500 text-sm italic">No notes yet. Click "+ Add" to add your ideas.</p>
              )}
            </div>
          )}
        </div>

        {/* Pending Tasks */}
        {pendingTasks.length > 0 && (
          <div className="mb-4">
            <h3 className="text-slate-400 text-sm font-medium mb-3 uppercase tracking-wider">To Do</h3>
            <div className="space-y-2">
              {pendingTasks.map(task => (
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
                        Impact: {task.value}/10
                      </span>
                      <span className="text-slate-500 text-xs">
                        {timeOptions.find(t => t.value === task.timeEstimate)?.label || task.timeEstimate + 'm'}
                      </span>
                    </div>
                  </div>
                  <svg className="w-5 h-5 text-slate-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                  </svg>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Add Task Button */}
        <button
          onClick={openNewTask}
          className="w-full mb-6 py-3 rounded-xl border border-dashed border-white/20 hover:border-cyan-500/50 hover:bg-cyan-500/10 transition-all flex items-center justify-center gap-2 text-slate-400 hover:text-cyan-400"
        >
          <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
          </svg>
          <span className="font-medium">Add Task</span>
        </button>

        {/* Completed Tasks */}
        {completedTasks.length > 0 && (
          <div>
            <h3 className="text-slate-400 text-sm font-medium mb-3 uppercase tracking-wider">Completed</h3>
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
            <p className="text-slate-400">No tasks yet. Add your first task!</p>
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
                    {editingProjectTask ? 'Edit Task' : 'New Task'}
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
                {/* Title */}
                <div>
                  <label className="text-slate-400 text-sm mb-2 block">Title *</label>
                  <input
                    type="text"
                    value={localTaskData.title}
                    onChange={(e) => setLocalTaskData(prev => ({ ...prev, title: e.target.value }))}
                    placeholder="Task name"
                    className="w-full px-4 py-3 bg-white/5 border border-white/10 rounded-xl text-white placeholder:text-slate-500 outline-none focus:border-cyan-500/50"
                  />
                </div>

                {/* Value (Impact) */}
                <div>
                  <label className="text-slate-400 text-sm mb-2 block">Impact Value: {localTaskData.value}/10</label>
                  <input
                    type="range"
                    min="1"
                    max="10"
                    value={localTaskData.value}
                    onChange={(e) => setLocalTaskData(prev => ({ ...prev, value: parseInt(e.target.value) }))}
                    className="w-full accent-cyan-500"
                  />
                  <div className="flex justify-between text-xs text-slate-500 mt-1">
                    <span>Low impact</span>
                    <span>High impact</span>
                  </div>
                </div>

                {/* Energy */}
                <div>
                  <label className="text-slate-400 text-sm mb-2 block">Energy Required</label>
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

                {/* Time Estimate */}
                <div>
                  <label className="text-slate-400 text-sm mb-2 block">Time Estimate</label>
                  <div className="grid grid-cols-5 gap-2">
                    {timeOptions.slice(0, 5).map(opt => (
                      <button
                        key={opt.value}
                        onClick={() => setLocalTaskData(prev => ({ ...prev, timeEstimate: opt.value }))}
                        className={`py-2 px-2 rounded-lg text-xs font-medium transition-all ${localTaskData.timeEstimate === opt.value
                          ? 'bg-cyan-500/20 text-cyan-400 ring-2 ring-cyan-500/50'
                          : 'bg-white/5 text-slate-400 hover:bg-white/10'
                          }`}
                      >
                        {opt.label}
                      </button>
                    ))}
                  </div>
                  <div className="grid grid-cols-5 gap-2 mt-2">
                    {timeOptions.slice(5).map(opt => (
                      <button
                        key={opt.value}
                        onClick={() => setLocalTaskData(prev => ({ ...prev, timeEstimate: opt.value }))}
                        className={`py-2 px-2 rounded-lg text-xs font-medium transition-all ${localTaskData.timeEstimate === opt.value
                          ? 'bg-cyan-500/20 text-cyan-400 ring-2 ring-cyan-500/50'
                          : 'bg-white/5 text-slate-400 hover:bg-white/10'
                          }`}
                      >
                        {opt.label}
                      </button>
                    ))}
                  </div>
                </div>

                {/* Due Date */}
                <div>
                  <label className="text-slate-400 text-sm mb-2 block">Due Date (optional)</label>
                  <input
                    type="date"
                    value={localTaskData.dueDate}
                    onChange={(e) => setLocalTaskData(prev => ({ ...prev, dueDate: e.target.value }))}
                    className="w-full px-4 py-3 bg-white/5 border border-white/10 rounded-xl text-white outline-none focus:border-cyan-500/50"
                  />
                </div>

                {/* Notes */}
                <div>
                  <label className="text-slate-400 text-sm mb-2 block">Notes</label>
                  <textarea
                    value={localTaskData.notes}
                    onChange={(e) => setLocalTaskData(prev => ({ ...prev, notes: e.target.value }))}
                    placeholder="Additional details, links, files..."
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
                  {editingProjectTask ? 'Save Changes' : 'Add Task'}
                </button>

                {editingProjectTask && (
                  <button
                    onClick={() => {
                      deleteProjectTask(currentProject.id, editingProjectTask.id);
                      closeTaskModal();
                    }}
                    className="w-full py-3 rounded-xl font-medium text-rose-400 bg-rose-500/10 hover:bg-rose-500/20 transition-all"
                  >
                    Delete Task
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
                  <h2 className="text-lg font-semibold text-white">Edit Project</h2>
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
                  <label className="text-slate-400 text-sm mb-2 block">Title *</label>
                  <input
                    type="text"
                    value={localProjectData.title}
                    onChange={(e) => setLocalProjectData(prev => ({ ...prev, title: e.target.value }))}
                    className="w-full px-4 py-3 bg-white/5 border border-white/10 rounded-xl text-white outline-none focus:border-cyan-500/50"
                  />
                </div>

                <div>
                  <label className="text-slate-400 text-sm mb-2 block">Description</label>
                  <textarea
                    value={localProjectData.description}
                    onChange={(e) => setLocalProjectData(prev => ({ ...prev, description: e.target.value }))}
                    placeholder="What is this project about?"
                    rows={3}
                    className="w-full px-4 py-3 bg-white/5 border border-white/10 rounded-xl text-white outline-none focus:border-cyan-500/50 resize-none"
                  />
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="text-slate-400 text-sm mb-2 block">Start Date</label>
                    <input
                      type="date"
                      value={localProjectData.startDate}
                      onChange={(e) => setLocalProjectData(prev => ({ ...prev, startDate: e.target.value }))}
                      className="w-full px-4 py-3 bg-white/5 border border-white/10 rounded-xl text-white outline-none"
                    />
                  </div>
                  <div>
                    <label className="text-slate-400 text-sm mb-2 block">End Date</label>
                    <input
                      type="date"
                      value={localProjectData.endDate}
                      onChange={(e) => setLocalProjectData(prev => ({ ...prev, endDate: e.target.value }))}
                      className="w-full px-4 py-3 bg-white/5 border border-white/10 rounded-xl text-white outline-none"
                    />
                  </div>
                </div>

                <div>
                  <label className="text-slate-400 text-sm mb-2 block">Status</label>
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
                  <label className="text-slate-400 text-sm mb-2 block">Timeline Color</label>
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
                  Save Changes
                </button>

                <button
                  onClick={() => {
                    deleteProject(currentProject.id);
                    setShowProjectModal(false);
                  }}
                  className="w-full py-3 rounded-xl font-medium text-rose-400 bg-rose-500/10"
                >
                  Delete Project
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
        {activeTab === 'projects' && <ProjectsScreen />}
        {activeTab === 'plan' && <PlanScreen />}
        {activeTab === 'execute' && <ExecuteScreen />}
        {activeTab === 'review' && <ReviewScreen />}
        {activeTab === 'patterns' && <PatternsScreen />}
      </div>

      {/* Bottom Navigation - Liquid Glass */}
      <nav className={`fixed bottom-6 left-1/2 -translate-x-1/2 w-[90%] max-w-[400px] rounded-full backdrop-blur-2xl bg-black/40 border border-white/10 shadow-2xl shadow-black/50 z-50 transition-all duration-500 ${isEditing ? 'translate-y-[200%] opacity-0 pointer-events-none' : 'translate-y-0 opacity-100'}`}>
        <div className="max-w-md mx-auto flex justify-around items-end py-2">
          <NavItem
            id="projects"
            label="Projects"
            active={activeTab === 'projects'}
            icon={
              <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10" />
              </svg>
            }
          />
          <NavItem
            id="plan"
            label="Plan"
            active={activeTab === 'plan'}
            icon={
              <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
              </svg>
            }
          />
          <NavItem
            id="execute"
            label="Execute"
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
            label="Reflect"
            active={activeTab === 'review'}
            icon={
              <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M20.354 15.354A9 9 0 018.646 3.646 9.003 9.003 0 0012 21a9.003 9.003 0 008.354-5.646z" />
              </svg>
            }
          />
          <NavItem
            id="patterns"
            label="Patterns"
            active={activeTab === 'patterns'}
            icon={
              <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M13 10V3L4 14h7v7l9-11h-7z" />
              </svg>
            }
          />
        </div>
      </nav>

      {/* Global Floating Add Button */}
      <button
        onClick={() => openGlobalTaskModal('task')}
        className="fixed bottom-24 right-6 w-14 h-14 rounded-full shadow-2xl z-40 flex items-center justify-center transition-all duration-300 hover:scale-110 active:scale-95"
        style={{
          background: 'linear-gradient(135deg, rgba(251,191,36,0.9) 0%, rgba(245,158,11,0.9) 100%)',
          backdropFilter: 'blur(10px)',
          boxShadow: '0 10px 40px rgba(251,191,36,0.4), inset 0 1px 1px rgba(255,255,255,0.3)'
        }}
      >
        <svg className="w-7 h-7 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M12 4v16m8-8H4" />
        </svg>
      </button>

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
                  {globalTaskMode === 'reminder' ? 'New Reminder' : globalTaskMode === 'priority' ? 'New Priority' : 'New Task'}
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
                    ⏰ Scheduled Task
                  </button>
                  <button
                    onClick={() => setGlobalTaskMode('reminder')}
                    className={`flex-1 py-2 rounded-xl text-sm font-medium transition-all ${globalTaskMode === 'reminder'
                      ? 'bg-purple-500/80 text-white'
                      : 'bg-white/10 text-slate-400'
                      }`}
                  >
                    📌 Reminder
                  </button>
                </div>
              )}

              {/* Priority slot indicator */}
              {globalTaskMode === 'priority' && globalTaskPrioritySlot !== null && (
                <div className="mt-3 flex items-center gap-2">
                  <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-purple-500/30 to-indigo-600/30 border border-purple-500/30 flex items-center justify-center">
                    <span className="text-purple-400 text-sm font-bold">{globalTaskPrioritySlot + 1}</span>
                  </div>
                  <span className="text-slate-400 text-sm">Priority #{globalTaskPrioritySlot + 1}</span>
                </div>
              )}
            </div>

            {/* Body */}
            <div className="px-5 py-4 max-h-[60vh] overflow-y-auto">
              {/* Icon Picker */}
              <div className="mb-4">
                <label className="text-xs font-medium text-slate-400 uppercase tracking-wide mb-2 block">Icon</label>
                <div className="flex flex-wrap gap-1.5">
                  {globalIconOptions.map(icon => (
                    <button
                      key={icon}
                      onClick={() => setGlobalTaskIcon(icon)}
                      className={`w-9 h-9 rounded-xl flex items-center justify-center text-lg transition-all duration-150
                        ${globalTaskIcon === icon
                          ? 'bg-amber-500 scale-110 shadow-lg shadow-amber-500/30'
                          : 'bg-white/10 hover:bg-white/20 hover:scale-105'}`}
                    >
                      {icon}
                    </button>
                  ))}
                </div>
              </div>

              {/* Task Name */}
              <div className="mb-4">
                <label className="text-xs font-medium text-slate-400 uppercase tracking-wide mb-2 block">
                  {globalTaskMode === 'reminder' ? 'Reminder' : 'Task Name'}
                </label>
                <input
                  type="text"
                  value={globalTaskName}
                  onChange={(e) => setGlobalTaskName(e.target.value)}
                  placeholder="What do you need to do?"
                  className="w-full px-4 py-3 bg-white/5 border border-white/10 rounded-xl focus:border-amber-500/50 focus:ring-2 focus:ring-amber-500/20 outline-none transition-all text-white placeholder:text-slate-500"
                  autoFocus
                />
              </div>

              {/* Time Selection - Only for scheduled tasks */}
              {globalTaskMode === 'task' && (
                <div className="mb-4">
                  <label className="text-xs font-medium text-slate-400 uppercase tracking-wide mb-2 block">Time</label>
                  <div className="flex items-center gap-3">
                    <div className="flex-1">
                      <p className="text-[10px] text-slate-500 mb-1">From</p>
                      <div className="flex gap-1">
                        <select
                          value={globalTaskStartHour}
                          onChange={(e) => setGlobalTaskStartHour(parseInt(e.target.value))}
                          className="flex-1 px-2 py-2.5 bg-white/10 border border-white/10 rounded-xl text-white text-center focus:ring-2 focus:ring-amber-500/30 outline-none cursor-pointer"
                        >
                          {Array.from({ length: 18 }, (_, i) => i + 6).map(h => (
                            <option key={h} value={h} className="bg-slate-800">{h}</option>
                          ))}
                        </select>
                        <span className="text-white/50 self-center">.</span>
                        <select
                          value={globalTaskStartMinute}
                          onChange={(e) => setGlobalTaskStartMinute(parseInt(e.target.value))}
                          className="flex-1 px-2 py-2.5 bg-white/10 border border-white/10 rounded-xl text-white text-center focus:ring-2 focus:ring-amber-500/30 outline-none cursor-pointer"
                        >
                          {[0, 15, 30, 45].map(m => (
                            <option key={m} value={m} className="bg-slate-800">{m.toString().padStart(2, '0')}</option>
                          ))}
                        </select>
                      </div>
                    </div>

                    <svg className="w-6 h-6 text-amber-400/60 flex-shrink-0 mt-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 8l4 4m0 0l-4 4m4-4H3" />
                    </svg>

                    <div className="flex-1">
                      <p className="text-[10px] text-slate-500 mb-1">To</p>
                      <div className="flex gap-1">
                        <select
                          value={globalTaskEndHour}
                          onChange={(e) => setGlobalTaskEndHour(parseInt(e.target.value))}
                          className="flex-1 px-2 py-2.5 bg-white/10 border border-white/10 rounded-xl text-white text-center focus:ring-2 focus:ring-amber-500/30 outline-none cursor-pointer"
                        >
                          {Array.from({ length: 18 }, (_, i) => i + 6).map(h => (
                            <option key={h} value={h} className="bg-slate-800">{h}</option>
                          ))}
                        </select>
                        <span className="text-white/50 self-center">.</span>
                        <select
                          value={globalTaskEndMinute}
                          onChange={(e) => setGlobalTaskEndMinute(parseInt(e.target.value))}
                          className="flex-1 px-2 py-2.5 bg-white/10 border border-white/10 rounded-xl text-white text-center focus:ring-2 focus:ring-amber-500/30 outline-none cursor-pointer"
                        >
                          {[0, 15, 30, 45].map(m => (
                            <option key={m} value={m} className="bg-slate-800">{m.toString().padStart(2, '0')}</option>
                          ))}
                        </select>
                      </div>
                    </div>
                  </div>
                </div>
              )}

              {/* Energy Level */}
              <div className="mb-4">
                <label className="text-xs font-medium text-slate-400 uppercase tracking-wide mb-2 block">Energy Level</label>
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
                      {e === 'low' ? '🌱 Low' : e === 'medium' ? '⚡ Med' : '🔥 High'}
                    </button>
                  ))}
                </div>
              </div>

              {/* Reminder - Only for scheduled tasks */}
              {globalTaskMode === 'task' && (
                <div className="mb-4">
                  <label className="text-xs font-medium text-slate-400 uppercase tracking-wide mb-2 block">Reminder</label>
                  <div className="flex flex-wrap gap-2">
                    {globalReminderOptions.map(opt => (
                      <button
                        key={opt.value || 'none'}
                        onClick={() => setGlobalTaskReminder(opt.value)}
                        className={`px-3 py-2 rounded-xl text-xs font-medium transition-all duration-200
                          ${globalTaskReminder === opt.value
                            ? 'bg-purple-500/80 text-white shadow-lg shadow-purple-500/30'
                            : 'bg-white/10 text-slate-400 hover:bg-white/20'}`}
                      >
                        {opt.value ? `🔔 ${opt.label}` : '🔕 None'}
                      </button>
                    ))}
                  </div>
                </div>
              )}

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
                  <span>Non-negotiable</span>
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
                  Cancel
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
                  {globalTaskMode === 'reminder' ? 'Add Reminder' : globalTaskMode === 'priority' ? 'Add Priority' : 'Add Task'}
                </button>
              </div>
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
