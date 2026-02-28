import React from 'react';
import { PlanCalendar } from './components/PlanCalendar';
import { PlanProjectList } from './components/PlanProjectList';
import { PlanReminderList } from './components/PlanReminderList';
import { PlanDailyList } from './components/PlanDailyList';
import { EditReminderModal } from './components/EditReminderModal';
import { EditTaskModal } from './components/EditTaskModal';
import { formatTotalTime } from '../../shared/utils/formatting';
import { saveToStorage } from '../../services/storage';
import { Portal } from '../../shared/ui/Portal';

export const PlanScreen = ({
    projects,
    setProjects,
    reminders,
    setReminders,
    projectsExpanded,
    setProjectsExpanded,
    expandedProjectId,
    setExpandedProjectId,
    remindersExpanded,
    setRemindersExpanded,
    selectedPlanDate,
    setSelectedPlanDate,
    weekOffset,
    setWeekOffset,
    showMonthPicker,
    setShowMonthPicker,
    activeTab,
    setActiveTab,
    setSelectedProject,
    getResolvedTasksForDate,
    toggleTaskCompletion,
    updateProjectTask, // Function from App.jsx
    openGlobalTaskModal, // Function from App.jsx
    t,
    currentLocale,
    today,
    onEditingChange // (isEditing) => void
}) => {
    // Local UI State
    const [planEditingTask, setPlanEditingTask] = React.useState(null);
    const [planEditingTaskProject, setPlanEditingTaskProject] = React.useState(null);
    const [planEditingReminder, setPlanEditingReminder] = React.useState(null);


    // Notify parent about editing state (for hiding navigation)
    React.useEffect(() => {
        const isEditing = !!planEditingTask || !!planEditingReminder;
        if (onEditingChange) {
            onEditingChange(isEditing);
        }
    }, [planEditingTask, planEditingReminder, onEditingChange]);

    const resolvedTasks = getResolvedTasksForDate(selectedPlanDate);
    const totalMinutes = resolvedTasks.reduce((acc, t) => acc + (t.timeEstimate || 30), 0);
    const energyLoad = resolvedTasks.reduce((acc, t) => {
        const val = t.energy === 'high' ? 3 : t.energy === 'medium' ? 2 : 1;
        return acc + val;
    }, 0);

    // Handlers
    const handleProjectClick = (project) => {
        setActiveTab('projects');
        setTimeout(() => {
            if (typeof setSelectedProject === 'function') {
                setSelectedProject(project);
            }
        }, 100);
    };

    const handleEditReminder = (reminder) => {
        setPlanEditingReminder(reminder);
    };

    const handleSaveReminder = (updatedReminder) => {
        const updatedReminders = reminders.map(r =>
            r.id === updatedReminder.id ? updatedReminder : r
        );
        setReminders(updatedReminders);
        saveToStorage('reminders', updatedReminders);
        setPlanEditingReminder(null);
    };

    const handleDeleteReminder = (id) => {
        const updatedReminders = reminders.filter(r => r.id !== id);
        setReminders(updatedReminders);
        saveToStorage('reminders', updatedReminders);
        setPlanEditingReminder(null);
    };

    const handleToggleReminder = (id, completed) => {
        const updatedReminders = reminders.map(r =>
            r.id === id ? { ...r, completed } : r
        );
        setReminders(updatedReminders);
        saveToStorage('reminders', updatedReminders);
    };

    const handleEditTask = (task, project) => {
        // If project is not passed, find it?
        // In legacy code, openPlanTaskEdit(task, project) was called from project list.
        // If called from DailyList, we might need to find the project.
        let targetProject = project;
        if (!targetProject && task.projectId) {
            targetProject = projects.find(p => p.id === task.projectId);
        }

        setPlanEditingTask(task);
        setPlanEditingTaskProject(targetProject);
    };

    const handleSaveTask = (updates) => {
        if (planEditingTaskProject && planEditingTask) {
            updateProjectTask(planEditingTaskProject.id, planEditingTask.id || planEditingTask.projectTaskId, updates);
            setPlanEditingTask(null);
            setPlanEditingTaskProject(null);
        }
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
                        ? t('plan.title')
                        : selectedPlanDate.toLocaleDateString(currentLocale, { weekday: 'long' })}
                </h1>
            </div>

            <PlanCalendar
                selectedDate={selectedPlanDate}
                setSelectedDate={setSelectedPlanDate}
                weekOffset={weekOffset}
                setWeekOffset={setWeekOffset}
                showMonthPicker={showMonthPicker}
                setShowMonthPicker={setShowMonthPicker}
                projects={projects}
                getResolvedTasksForDate={getResolvedTasksForDate}
                onProjectClick={handleProjectClick}
                t={t}
                currentLocale={currentLocale}
            />

            {/* Projects & Reminders Row */}
            <div className="mb-8">
                <PlanProjectList
                    projects={projects}
                    reminders={reminders}
                    projectsExpanded={projectsExpanded}
                    setProjectsExpanded={setProjectsExpanded}
                    remindersExpanded={remindersExpanded}
                    setRemindersExpanded={setRemindersExpanded}
                    expandedProjectId={expandedProjectId}
                    setExpandedProjectId={setExpandedProjectId}
                    getResolvedTasksForDate={getResolvedTasksForDate}
                    selectedPlanDate={selectedPlanDate}
                    onEditTask={handleEditTask}
                    onAddTask={openGlobalTaskModal}
                    t={t}
                    currentLocale={currentLocale}
                />

                <PlanReminderList
                    reminders={reminders}
                    onToggleReminder={handleToggleReminder}
                    onEditReminder={handleEditReminder}
                    onAddReminder={openGlobalTaskModal}
                    remindersExpanded={remindersExpanded}
                    selectedPlanDate={selectedPlanDate}
                    getResolvedTasksForDate={getResolvedTasksForDate}
                    t={t}
                />
            </div>

            {/* Daily Plan Section */}
            <div>
                {/* <h2 className="text-xl font-semibold text-white mb-4">{t('plan.dailyPlan')}</h2> */ /* daily plan title might be redundant if empty state has "Your day awaits" header? user screenshot shows no "Daily Plan" title above "Your day awaits" */}
                <PlanDailyList
                    resolvedTasks={resolvedTasks}
                    onEditTask={handleEditTask}
                    onEditReminder={handleEditReminder}
                    onToggleCompletion={(task) => toggleTaskCompletion(task.id, task.isVirtual, task.date)}
                    onAddTask={() => openGlobalTaskModal('task', null, null, { hour: 9, minute: 0 })}
                    energyLoad={energyLoad}
                    totalMinutes={totalMinutes}
                    selectedPlanDate={selectedPlanDate}
                    t={t}
                />
            </div>

            {/* Modals */}
            {planEditingReminder && (
                <Portal>
                    <EditReminderModal
                        reminder={planEditingReminder}
                        onSave={handleSaveReminder}
                        onDelete={handleDeleteReminder}
                        onClose={() => setPlanEditingReminder(null)}
                        t={t}
                        currentLocale={currentLocale}
                    />
                </Portal>
            )}

            {planEditingTask && (
                <Portal>
                    <EditTaskModal
                        task={planEditingTask}
                        project={planEditingTaskProject}
                        onSave={handleSaveTask}
                        onClose={() => {
                            setPlanEditingTask(null);
                            setPlanEditingTaskProject(null);
                        }}
                        t={t}
                        currentLocale={currentLocale}
                    />
                </Portal>
            )}

        </div>
    );
};
