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
    const [editReminderSubtasks, setEditReminderSubtasks] = useState([]);

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

        endTime: formatTime(eTime),
        subtasks: task.subtasks || []
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

        endTime: eDate.toISOString(),
        subtasks: planTaskData.subtasks
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
      setEditReminderSubtasks(reminder.subtasks || []);

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
        subtasks: editReminderSubtasks,
        isVirtual: false
      };

      setReminders(prev => {
        if (planEditingReminder.isVirtual) {
          // If virtual, we are "creating" it from a template or something?
          // Or verifying it.
          // Note: Logic suggests adding it if virtual, updating if not.
          // However, we need to handle ID collision if just using Date.now() multiple times fast?
          // Using Date.now() + Math.random() is safer but simple Date.now() usually fine for UI.
          return [{ ...planEditingReminder, ...updatedData, id: Date.now() }, ...prev];
        } else {
          return prev.map(r => r.id === planEditingReminder.id ? { ...r, ...updatedData } : r);
        }
      });

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

    const totalMinutes = 0; // Legacy stats removed
    const energyLoad = 'Light'; // Legacy stats removed
    const highEnergyCount = 0; // Legacy stats removed

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
        const hasTasks = getResolvedTasksForDate(date).length > 0;

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
          hasTasks: getResolvedTasksForDate(date).length > 0,
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
              <div className="mb-6 glass-card rounded-2xl overflow-hidden transition-all duration-200">
                {/* Day Headers Row */}
                <div className="flex border-b border-white/10">
                  {weekDays.map((day, idx) => {
                    const isCurrentDay = day.date.getTime() === selectedPlanDate.getTime();

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
                        const tasksForDay = getResolvedTasksForDate(selectedPlanDate);
                        return !tasksForDay.some(t => t.projectId === project.id && t.projectTaskId === task.id);
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
                              const tasksForDay = getResolvedTasksForDate(selectedPlanDate);
                              if (tasksForDay.some(t => t.projectId === project.id && t.projectTaskId === task.id)) return;

                              openGlobalTaskModal('task', null, null, {
                                name: task.title,
                                icon: '📋',
                                energy: task.energy,
                                hour: 9,
                                minute: 0
                              });
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
          {/* Show ALL reminders in the expanded list, not just those for the selected date */}
          {reminders
            .filter(reminder => {
              if (reminder.completed) return false;
              return !getResolvedTasksForDate(selectedPlanDate).some(t => t.originalReminderId === reminder.id);
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
                    openGlobalTaskModal('task', null, null, {
                      name: reminder.name,
                      icon: reminder.icon,
                      energy: reminder.energy,
                      originalReminderId: reminder.id,
                      hour: 9,
                      minute: 0
                    });
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

        {/* Daily Plan (Syncs with Execute) */}
        <div className="mb-8">

          <div className="space-y-3">
            {getResolvedTasksForDate(selectedPlanDate).length > 0 ? (
              getResolvedTasksForDate(selectedPlanDate).map((task) => (
                <div
                  key={task.id}
                  onClick={() => openGlobalTaskModal(task.isReminder ? 'reminder' : 'task', null, task)}
                  className={`p-4 glass-card rounded-2xl transition-all duration-200 ease-out select-none cursor-pointer hover:bg-white/10 hover:scale-[1.01]`}
                >
                  <div className="flex items-center gap-3">
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        // Handle completion logic based on type
                        if (task.isReminder) {
                          const updatedReminders = reminders.map(r =>
                            r.id === task.id ? { ...r, completed: true } : r
                          );
                          setReminders(updatedReminders);
                          saveToStorage('reminders', updatedReminders);
                        } else {
                          toggleTaskCompletion(task.id, task.isVirtual, task.date);
                        }
                      }}
                      className={`w-6 h-6 rounded-full border-2 ${task.completed ? 'bg-purple-500 border-purple-500' : 'border-purple-400'} flex items-center justify-center hover:bg-purple-500/20 transition-all flex-shrink-0`}
                    >
                      {task.completed && (
                        <svg className="w-4 h-4 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                        </svg>
                      )}
                    </button>

                    <span className="text-xl">{task.icon}</span>
                    <div className="flex-1 min-w-0">
                      <span className={`text-slate-200 font-medium truncate block ${task.completed ? 'line-through opacity-50' : ''}`}>
                        {task.name || task.title}
                      </span>
                      <div className="flex items-center gap-2 text-xs text-slate-500">
                        <span>{new Date(task.startTime).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</span>
                        {task.isReminder && <span className="text-purple-400">Reminder</span>}
                      </div>
                    </div>

                    <EnergyBadge energy={task.energy} t={t} />
                  </div>
                </div>
              ))
            ) : (
              <div className="relative overflow-hidden rounded-3xl p-12 text-center"
                style={{
                  background: 'linear-gradient(135deg, rgba(139, 92, 246, 0.1) 0%, rgba(59, 130, 246, 0.05) 100%)',
                  backdropFilter: 'blur(20px)',
                  border: '1px solid rgba(139, 92, 246, 0.2)'
                }}
              >
                {/* Decorative gradient orbs */}
                <div className="absolute top-0 right-0 w-32 h-32 bg-purple-500/20 rounded-full blur-3xl" />
                <div className="absolute bottom-0 left-0 w-32 h-32 bg-blue-500/20 rounded-full blur-3xl" />

                {/* Icon */}
                <div className="relative mb-6 flex justify-center">
                  <div className="w-20 h-20 rounded-2xl flex items-center justify-center"
                    style={{
                      background: 'linear-gradient(135deg, rgba(139, 92, 246, 0.2) 0%, rgba(59, 130, 246, 0.2) 100%)',
                      boxShadow: '0 8px 32px rgba(139, 92, 246, 0.3)'
                    }}
                  >
                    <svg className="w-10 h-10 text-purple-300" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5}
                        d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-6 9l2 2 4-4" />
                    </svg>
                  </div>
                </div>

                {/* Text */}
                <h3 className="text-xl font-semibold text-slate-200 mb-2">
                  Your day awaits
                </h3>
                <p className="text-slate-400 mb-8 max-w-sm mx-auto leading-relaxed">
                  Start planning your perfect day. Add tasks, set priorities, and make it happen.
                </p>

                {/* CTA Button */}
                <button
                  onClick={() => openGlobalTaskModal('task', null, null, { hour: 9, minute: 0 })}
                  className="group relative inline-flex items-center gap-2 px-6 py-3 rounded-xl font-medium text-white overflow-hidden transition-all duration-300 hover:scale-105"
                  style={{
                    background: 'linear-gradient(135deg, #8b5cf6 0%, #3b82f6 100%)',
                    boxShadow: '0 4px 20px rgba(139, 92, 246, 0.4)'
                  }}
                >
                  <span className="relative z-10">Start Planning</span>
                  <svg className="relative z-10 w-4 h-4 transition-transform group-hover:translate-x-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
                  </svg>

                  {/* Hover effect */}
                  <div className="absolute inset-0 bg-gradient-to-r from-purple-600 to-blue-600 opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
                </button>
              </div>
            )}

            {/* Add More Task Button */}
            <button
              onClick={() => openGlobalTaskModal('task', null, null, { hour: 9, minute: 0 })}
              className="w-full p-3 rounded-2xl border border-dashed border-white/20 hover:border-purple-500/50 hover:bg-purple-500/10 transition-all flex items-center justify-center gap-2 text-slate-400 hover:text-purple-400"
            >
              <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
              </svg>
              <span className="text-sm font-medium">{t('common.add')} {t('common.task')}</span>
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

                  <SubtaskList
                    subtasks={editReminderSubtasks}
                    onChange={setEditReminderSubtasks}
                    t={t}
                  />

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

                  <SubtaskList
                    subtasks={planTaskData.subtasks || []}
                    onChange={(newSubtasks) => setPlanTaskData(prev => ({ ...prev, subtasks: newSubtasks }))}
                    t={t}
                  />

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
