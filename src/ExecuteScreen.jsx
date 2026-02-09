import React, { useState, useEffect } from 'react';
import { SubtaskList } from './SubtaskList';
import {
  globalIconOptions,
  globalReminderOptions,
  globalAlertOptions,
  TaskDetailsList,
  saveToStorage,
  getToday,
  getDateKey,
  parseTime,
  formatElapsed
} from './shared';

const ExecuteScreen = ({
  selectedExecuteDate, setSelectedExecuteDate,
  activeTask, setActiveTask,
  elapsedTime, setElapsedTime,
  isPaused, setIsPaused,
  reminders, setReminders,
  projects, setProjects,

  tasks: propTasks,
  setTasksByDate,
  getResolvedTasksForDate,
  getRoutinesForDate,
  toggleRoutineHabit,
  removeHabitFromTemplate,
  addHabitToTemplate,
  completeAllHabits,
  completeTask,
  t,
  currentLocale,
  // Lifted state
  focusMode, setFocusMode,
  focusTask, setFocusTask,
  pomodoroTime, setPomodoroTime,
  pomodoroRunning, setPomodoroRunning,
  pomodoroSession, setPomodoroSession,
  isBreak, setIsBreak,
  totalFocusTime, setTotalFocusTime,
  executeShowNewTaskModal, setExecuteShowNewTaskModal,
  executeEditingTask, setExecuteEditingTask,
  executeEditingRoutine, setExecuteEditingRoutine,
  expandedRoutine, setExpandedRoutine,
  // Edit Task State
  editTaskName, setEditTaskName,
  editTaskIcon, setEditTaskIcon,
  editTaskEnergy, setEditTaskEnergy,
  editTaskStartHour, setEditTaskStartHour,
  editTaskStartMinute, setEditTaskStartMinute,
  editTaskEndHour, setEditTaskEndHour,
  editTaskEndMinute, setEditTaskEndMinute,
  editTaskAlerts, setEditTaskAlerts,
  editTaskRepeat, setEditTaskRepeat,
  editTaskShowTime, setEditTaskShowTime,
  editTaskShowAlerts, setEditTaskShowAlerts,
  editTaskDate, setEditTaskDate,
  editTaskShowDate, setEditTaskShowDate,
  editTaskShowRepeat, setEditTaskShowRepeat,
  editTaskShowIconPicker, setEditTaskShowIconPicker,
  editTaskValue, setEditTaskValue,
  editTaskNotes, setEditTaskNotes,
  editTaskSubtasks, setEditTaskSubtasks,
  openGlobalTaskModal
}) => {
  const tasks = propTasks || []; // Ensure tasks is defined

  const today = new Date();
  // Verify lifted state availability
  const [currentTime, setCurrentTime] = useState(new Date());
  const [draggingTask, setDraggingTask] = useState(null);
  const [dragStartY, setDragStartY] = useState(0);
  const [dragCurrentY, setDragCurrentY] = useState(0);
  const [dragStartTime, setDragStartTime] = useState(0);
  const [timelineRef, setTimelineRef] = useState(null);

  // Routine expansion state
  // expandedRoutine is now lifted to App component
  // editingRoutine is now lifted to App component as executeEditingRoutine
  const [newHabitText, setNewHabitText] = useState('');

  // Get current routines for selected date
  const currentRoutines = getRoutinesForDate(selectedExecuteDate);

  // Task edit modal state - NOW LIFTED TO APP COMPONENT LEVEL
  // All editTask* state variables are now defined at the App level to prevent reset on re-render

  // Focus mode state and timer logic lifted to App


  // Open task for editing
  const openTaskEdit = (task) => {
    setExecuteEditingTask(task);
    setEditTaskName(task.title || task.name || '');
    setEditTaskIcon(task.icon || '📌');
    setEditTaskEnergy(task.energy || 'medium');
    setEditTaskStartHour(task.startTime ? task.startTime.getHours() : 9);
    setEditTaskStartMinute(task.startTime ? task.startTime.getMinutes() : 0);
    setEditTaskEndHour(task.endTime ? task.endTime.getHours() : 10);
    setEditTaskEndMinute(task.endTime ? task.endTime.getMinutes() : 0);
    setEditTaskAlerts(task.alerts || []);
    setEditTaskRepeat(task.repeat || { type: 'none', label: 'None', days: [] });
    setEditTaskValue(task.value || 5);
    setEditTaskNotes(task.notes || '');
    setEditTaskSubtasks(task.subtasks || []);
    setEditTaskDate(task.startTime ? new Date(task.startTime) : new Date(selectedExecuteDate));
    setEditTaskShowTime(false);
    setEditTaskShowAlerts(false);
    setEditTaskShowDate(false);
    setEditTaskShowRepeat(false);
    setEditTaskShowIconPicker(false);
  };

  // Save task edits
  const saveTaskEdit = () => {
    if (!executeEditingTask || !editTaskName.trim()) return;

    const newStartTime = new Date(editTaskDate);
    newStartTime.setHours(editTaskStartHour, editTaskStartMinute, 0, 0);

    const newEndTime = new Date(editTaskDate);
    newEndTime.setHours(editTaskEndHour, editTaskEndMinute, 0, 0);

    if (newEndTime <= newStartTime) {
      newEndTime.setHours(editTaskStartHour + 1, editTaskStartMinute, 0, 0);
    }

    const dateKey = getDateKey(selectedExecuteDate);

    const updatedTask = {
      ...executeEditingTask,
      isVirtual: false, // Ensure it's hardened
      title: editTaskName.trim(),
      icon: editTaskIcon,
      energy: editTaskEnergy,
      startTime: newStartTime,
      endTime: newEndTime,
      alerts: editTaskAlerts,
      repeat: editTaskRepeat,
      value: editTaskValue,
      notes: editTaskNotes,
      subtasks: editTaskSubtasks
    };

    setTasksByDate(prev => {
      let dayTasks = prev[dateKey] || [];
      if (executeEditingTask.isVirtual) {
        dayTasks = [...dayTasks, updatedTask];
      } else {
        dayTasks = dayTasks.map(t => t.id === executeEditingTask.id ? updatedTask : t);
      }
      return {
        ...prev,
        [dateKey]: dayTasks.sort((a, b) => a.startTime - b.startTime)
      };
    });

    // Sync time changes back to original reminder if applicable
    if (updatedTask.originalReminderId) {
      const updatedReminders = reminders.map(r => {
        if (r.id === updatedTask.originalReminderId) {
          return {
            ...r,
            name: editTaskName.trim(),
            icon: editTaskIcon,
            energy: editTaskEnergy,
            startTime: newStartTime.toISOString(),
            endTime: newEndTime.toISOString(),
            date: editTaskDate.toISOString(),
            alerts: editTaskAlerts,
            repeat: editTaskRepeat,
            value: editTaskValue,
            notes: editTaskNotes,
            subtasks: editTaskSubtasks
          };
        }
        return r;
      });
      setReminders(updatedReminders);
      saveToStorage('reminders', updatedReminders);
    }

    // Sync time changes back to original project task if applicable
    if (updatedTask.projectId && updatedTask.projectTaskId) {
      const updatedProjects = projects.map(p => {
        if (p.id === updatedTask.projectId) {
          return {
            ...p,
            tasks: p.tasks.map(t => {
              if (t.id === updatedTask.projectTaskId) {
                return {
                  ...t,
                  title: editTaskName.trim(),
                  icon: editTaskIcon,
                  energy: editTaskEnergy,
                  startTime: newStartTime.toISOString(),
                  endTime: newEndTime.toISOString(),
                  dueDate: editTaskDate.toISOString(),
                  alerts: editTaskAlerts,
                  repeat: editTaskRepeat,
                  value: editTaskValue,
                  notes: editTaskNotes,
                  subtasks: editTaskSubtasks
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

    setExecuteEditingTask(null);
  };

  // Delete task
  const deleteTask = (taskId) => {
    const dateKey = getDateKey(selectedExecuteDate);
    setTasksByDate(prev => ({
      ...prev,
      [dateKey]: (prev[dateKey] || []).filter(t => t.id !== taskId)
    }));
    setExecuteEditingTask(null);
  };

  // Calculate task duration
  const getTaskFocusDuration = (task) => {
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

  // Start focus mode
  const startFocusMode = (task) => {
    // Calculate task duration using shared helper
    const durationSeconds = getTaskFocusDuration(task);

    setFocusTask(task);
    setFocusMode(true);
    setPomodoroTime(durationSeconds);
    setPomodoroRunning(true);
    setPomodoroSession(1);
    setIsBreak(false);
    setTotalFocusTime(0);
    setExecuteEditingTask(null);
  };

  // Format pomodoro time
  const formatPomodoroTime = (seconds) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };

  // formatPomodoroTime helper function...



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
      const hasTasks = getResolvedTasksForDate(date).length > 0;

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
        dayName: date.toLocaleDateString(currentLocale, { weekday: 'short' }),
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
      return firstDay.toLocaleDateString(currentLocale, { month: 'long', year: 'numeric' });
    } else {
      return `${firstDay.toLocaleDateString(currentLocale, { month: 'short' })} - ${lastDay.toLocaleDateString(currentLocale, { month: 'short', year: 'numeric' })}`;
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
        hasTasks: getResolvedTasksForDate(date).length > 0,
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
          {selectedExecuteDate.toLocaleDateString(currentLocale, { month: 'long', day: 'numeric' })}
        </p>
        <h1 className="text-3xl font-semibold text-white tracking-tight">
          {selectedExecuteDate.toDateString() === today.toDateString()
            ? t('plan.today')
            : selectedExecuteDate.toLocaleDateString(currentLocale, { weekday: 'long' })}
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
            {t('plan.dropToMoveTask')}
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
        const isEditing = executeEditingRoutine === 'morning';
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
                  {completedCount}/{totalCount} {t('plan.completed').toLowerCase()}
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
                        {t('common.add')}
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
                        {t('execute.completeAll')}
                      </button>
                    )}
                    <button
                      onClick={() => setExecuteEditingRoutine(isEditing ? null : 'morning')}
                      className="px-4 py-2 rounded-xl text-sm font-medium text-slate-400 bg-white/5 hover:bg-white/10 transition-all"
                    >
                      {isEditing ? t('settings.done') : t('common.edit')}
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
          className="flex-1 relative bg-white/5 rounded-2xl border border-white/10 cursor-pointer"
          style={{ height: `${timeSlots.length * 32 + 48}px` }}
          ref={(el) => setTimelineRef(el)}
          onClick={(e) => {
            // Prevent triggering when clicking on a task (though stopPropagation on task should handle this)
            if (e.target !== e.currentTarget && e.target.closest('.absolute.left-2.right-2')) return;

            const rect = e.currentTarget.getBoundingClientRect();
            // Adjust for scrolling if necessary, but clientY - rect.top is relative to viewport 
            // and rect is relative to viewport, so difference is relative to element top. Good.
            const offsetY = e.clientY - rect.top;

            const slotIndex = Math.floor(offsetY / 32);

            if (slotIndex >= 0 && slotIndex < timeSlots.length) {
              const hour = timeSlots[slotIndex].hour;
              const minute = (offsetY % 32) >= 16 ? 30 : 0;

              // Use 'reminder' mode so it shows up in Plan view's Reminders list
              openGlobalTaskModal('reminder', null, null, { hour, minute });
            }
          }}
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
                <p className="text-sm font-medium">{t('execute.noTasks')}</p>
                <p className="text-xs text-slate-500">{t('execute.addTasksInPlan')}</p>
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
                <span className="text-indigo-300/80 text-xs font-medium">{t('execute.sleep')}</span>
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
        const isEditing = executeEditingRoutine === 'evening';
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
                        placeholder={t('execute.addHabitPlaceholder')}
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
                        {t('common.add')}
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
                        {t('execute.completeAll')}
                      </button>
                    )}
                    <button
                      onClick={() => setExecuteEditingRoutine(isEditing ? null : 'evening')}
                      className="px-4 py-2 rounded-xl text-sm font-medium text-slate-400 bg-white/5 hover:bg-white/10 transition-all"
                    >
                      {isEditing ? t('settings.done') : t('common.edit')}
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
            <p className="text-slate-500 text-[10px]">{t('execute.anchored')}</p>
          </div>
          <div className="w-px h-12 bg-white/10"></div>
          <div className="text-center flex-1">
            <div className="text-xl mb-1">💨</div>
            <p className="text-slate-400 font-bold text-lg">{formatDuration(unanchoredMinutes)}</p>
            <p className="text-slate-500 text-[10px]">{t('execute.flowing')}</p>
          </div>
          <div className="w-px h-12 bg-white/10"></div>
          <div className="text-center flex-1">
            <div className="text-xl mb-1">🌙</div>
            <p className="text-indigo-400 font-bold text-lg">8h</p>
            <p className="text-slate-500 text-[10px]">{t('execute.recovery')}</p>
          </div>
        </div>

        {/* Gentle reminder */}
        <div className="mt-3 pt-3 border-t border-white/10 text-center">
          <p className="text-slate-500 text-xs italic">
            {dayProgress < 30
              ? t('execute.morningMessage')
              : dayProgress < 60
                ? t('execute.middayMessage')
                : dayProgress < 85
                  ? t('execute.afternoonMessage')
                  : t('execute.eveningMessage')}
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
                <p className="text-xs text-slate-400 mt-1">{t('execute.elapsed')}</p>
              </div>
              <div className="w-px h-10 bg-white/20"></div>
              <div className="text-center">
                <p className="text-3xl font-bold text-white font-mono">
                  {formatElapsed(Math.max(0, parseTime(activeTask.duration) * 60 - elapsedTime))}
                </p>
                <p className="text-xs text-slate-400 mt-1">{t('execute.remaining')}</p>
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
                    {t('execute.resumeTimer')}
                  </>
                ) : (
                  <>
                    <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
                      <path d="M6 4h4v16H6V4zm8 0h4v16h-4V4z" />
                    </svg>
                    {t('execute.pauseTimer')}
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
                {t('execute.completeTask')}
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
                <p className="text-white/60 text-[10px] uppercase tracking-wider mb-1">{t('common.from')}</p>
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
                <p className="text-white/60 text-[10px] uppercase tracking-wider mb-1">{t('common.to')}</p>
                <p className="text-4xl font-light text-white tracking-tight" style={{ fontVariantNumeric: 'tabular-nums' }}>
                  {getDragPreviewTimeRange().end}
                </p>
              </div>
            </div>

            {/* Target day indicator when hovering calendar */}
            {dragOverDay && (
              <div className="mt-4 pt-3 border-t border-amber-400/30 text-center animate-fadeIn">
                <p className="text-amber-400 text-sm font-medium">
                  📅 {t('common.moveTo')} {dragOverDay.toLocaleDateString(currentLocale, { weekday: 'short', month: 'short', day: 'numeric' })}
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
      {executeEditingTask && !focusMode && (
        <div className="fixed inset-0 z-50 flex items-end justify-center animate-fadeIn">
          <div
            className="absolute inset-0 bg-black/60 backdrop-blur-sm"
            onClick={() => setExecuteEditingTask(null)}
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
                <h2 className="text-lg font-semibold text-white">{t('modals.editTask')}</h2>
                <button
                  onClick={() => setExecuteEditingTask(null)}
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
                <label className="text-slate-400 text-sm mb-2 block">{t('common.task')}</label>
                <div className="flex gap-3">
                  <button
                    onClick={() => setEditTaskShowIconPicker(!editTaskShowIconPicker)}
                    className="w-12 h-12 rounded-xl bg-white/5 border border-white/10 flex items-center justify-center text-2xl hover:bg-white/10 transition-colors"
                  >
                    {editTaskIcon}
                  </button>
                  <input
                    type="text"
                    value={editTaskName}
                    onChange={(e) => setEditTaskName(e.target.value)}
                    placeholder={t('placeholders.reminder')}
                    className="flex-1 px-4 py-3 bg-white/5 border border-white/10 rounded-xl text-white placeholder:text-slate-500 outline-none focus:border-amber-500/50"
                  />
                </div>

                {/* Icon Picker (Conditional) */}
                {editTaskShowIconPicker && (
                  <div className="mt-4 p-4 rounded-xl bg-white/5 border border-white/5 animate-fadeIn">
                    <div className="flex flex-wrap gap-2">
                      {globalIconOptions.map(icon => (
                        <button
                          key={icon}
                          onClick={() => {
                            setEditTaskIcon(icon);
                            setEditTaskShowIconPicker(false);
                          }}
                          className={`w-10 h-10 rounded-lg flex items-center justify-center text-xl transition-colors
                              ${editTaskIcon === icon ? 'bg-amber-500/20 text-amber-500' : 'hover:bg-white/10'}`}
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
                date={editTaskDate}
                startTime={`${editTaskStartHour}:${editTaskStartMinute.toString().padStart(2, '0')}`}
                endTime={`${editTaskEndHour}:${editTaskEndMinute.toString().padStart(2, '0')}`}
                alerts={editTaskAlerts}
                onDateClick={() => {
                  setEditTaskShowDate(!editTaskShowDate);
                  setEditTaskShowTime(false);
                  setEditTaskShowAlerts(false);
                  setEditTaskShowRepeat(false);
                }}
                onTimeClick={() => {
                  setEditTaskShowTime(!editTaskShowTime);
                  setEditTaskShowAlerts(false);
                  setEditTaskShowDate(false);
                  setEditTaskShowRepeat(false);
                }}
                onAlertsClick={() => {
                  setEditTaskShowAlerts(!editTaskShowAlerts);
                  setEditTaskShowTime(false);
                  setEditTaskShowDate(false);
                  setEditTaskShowRepeat(false);
                }}
                onRepeatClick={() => {
                  setEditTaskShowRepeat(!editTaskShowRepeat);
                  setEditTaskShowAlerts(false);
                  setEditTaskShowTime(false);
                  setEditTaskShowDate(false);
                }}
                themeColor="amber"
                showDatePicker={editTaskShowDate}
                onDateChange={(date) => {
                  setEditTaskDate(date);
                  setEditTaskShowDate(false);
                }}
                showTimePicker={editTaskShowTime}
                onStartTimeChange={({ hour, minute }) => {
                  setEditTaskStartHour(hour);
                  setEditTaskStartMinute(minute);
                }}
                onEndTimeChange={({ hour, minute }) => {
                  setEditTaskEndHour(hour);
                  setEditTaskEndMinute(minute);
                }}
                repeat={editTaskRepeat}
                showRepeatPicker={editTaskShowRepeat}
                onRepeatChange={(repeat) => setEditTaskRepeat(repeat)}
                t={t}
                locale={currentLocale}
              />


              {/* Alerts Picker (Collapsible) */}
              {editTaskShowAlerts && (
                <div className="mb-6 p-4 rounded-2xl bg-white/5 border border-white/5 animate-fadeIn">
                  <label className="text-xs font-medium text-slate-400 uppercase tracking-wide mb-3 block">Manage Alerts</label>
                  <div className="space-y-2">
                    {editTaskAlerts.map((alert, index) => (
                      <div key={index} className="flex items-center justify-between p-3 rounded-xl bg-white/5 border border-white/5">
                        <span className="text-sm text-slate-200">{alert.label}</span>
                        <button
                          onClick={() => setEditTaskAlerts(editTaskAlerts.filter((_, i) => i !== index))}
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
                            if (!editTaskAlerts.some(a => a.value === opt.value)) {
                              setEditTaskAlerts([...editTaskAlerts, opt]);
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
                <label className="text-slate-400 text-sm mb-2 block">{t('common.impactValue')}: {editTaskValue}/10</label>
                <input
                  type="range"
                  min="1"
                  max="10"
                  value={editTaskValue}
                  onChange={(e) => setEditTaskValue(parseInt(e.target.value))}
                  className="w-full accent-amber-500"
                />
              </div>

              {/* Energy */}
              <div className="mb-6">
                <label className="text-slate-400 text-sm mb-2 block">{t('common.energyRequired')}</label>
                <div className="grid grid-cols-3 gap-2">
                  {['low', 'medium', 'high'].map(level => (
                    <button
                      key={level}
                      onClick={() => setEditTaskEnergy(level)}
                      className={`py-2.5 px-3 rounded-xl text-sm font-medium capitalize transition-all ${editTaskEnergy === level
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

              <SubtaskList
                subtasks={editTaskSubtasks}
                onChange={setEditTaskSubtasks}
                t={t}
              />

              {/* Notes */}
              <div className="mb-4">
                <label className="text-slate-400 text-sm mb-2 block">{t('common.notes')}</label>
                <textarea
                  value={editTaskNotes}
                  onChange={(e) => setEditTaskNotes(e.target.value)}
                  placeholder="Additional details..."
                  rows={2}
                  className="w-full px-4 py-3 bg-white/5 border border-white/10 rounded-xl text-white placeholder:text-slate-500 outline-none focus:border-amber-500/50 resize-none"
                />
              </div>

              {/* Task Name */}
              {/* Focus Mode Button */}
              {!executeEditingTask?.completed && (
                <button
                  onClick={() => startFocusMode(executeEditingTask)}
                  className="w-full py-3.5 rounded-xl font-semibold text-sm transition-all duration-200 flex items-center justify-center gap-2 mb-4
                      bg-gradient-to-r from-purple-500/30 to-indigo-500/30 text-purple-300 border border-purple-500/30 hover:from-purple-500/50 hover:to-indigo-500/50"
                >
                  <span className="text-lg">🎯</span>
                  <span>{t('execute.startFocusMode')}</span>
                </button>
              )}
            </div>

            {/* Footer */}
            <div className="px-5 py-4 border-t border-white/10">
              <div className="flex gap-3">
                <button
                  onClick={() => deleteTask(executeEditingTask.id)}
                  className="px-4 py-3 rounded-xl font-medium text-rose-400 bg-rose-500/10 hover:bg-rose-500/20 transition-all"
                >
                  <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                  </svg>
                </button>
                <button
                  onClick={() => setExecuteEditingTask(null)}
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
        <div className="fixed top-0 left-0 w-full h-full z-[100] flex flex-col items-center justify-center animate-fadeIn bg-[rgb(10,10,20)]"
          style={{
            background: 'linear-gradient(180deg, rgba(10,10,20,1) 0%, rgba(20,10,30,1) 100%)',
            overscrollBehavior: 'contain'
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
              {isBreak ? t('execute.breakTime') : `${t('execute.focusSession')} ${pomodoroSession}`}
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
                {isBreak ? t('execute.untilFocus') : t('execute.remaining')}
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


export default ExecuteScreen;
