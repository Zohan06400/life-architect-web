import React from 'react';
import { getProjectProgress } from '../../../features/projects/utils'; // We'll need to export this or move to shared

// Temporary utility if not yet exported
const calculateProgress = (project) => {
    if (!project.tasks || project.tasks.length === 0) return 0;
    const completed = project.tasks.filter(t => t.completed).length;
    return Math.round((completed / project.tasks.length) * 100);
};

export const PlanProjectList = ({
    projects,
    reminders,
    projectsExpanded,
    setProjectsExpanded,
    remindersExpanded,
    setRemindersExpanded, // To collapse reminders when projects expand
    expandedProjectId,
    setExpandedProjectId,
    getResolvedTasksForDate,
    selectedPlanDate,
    onEditTask,
    onAddTask,
    t,
    currentLocale
}) => {
    const activeProjects = projects.filter(p => p.status === 'active');

    return (
        <>
            <div className="grid grid-cols-2 gap-3 mb-6">
                <button
                    onClick={() => {
                        setProjectsExpanded(!projectsExpanded);
                        if (remindersExpanded && !projectsExpanded) setRemindersExpanded(false);
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
                        <span className="text-white font-medium block">{t('plan.projects')}</span>
                        <p className="text-cyan-400/70 text-[11px]">{activeProjects.length} active</p>
                    </div>
                    <svg className={`w-4 h-4 text-cyan-400 transition-transform duration-300 ${projectsExpanded ? 'rotate-180' : ''}`} fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                    </svg>
                </button>

                <button
                    onClick={() => {
                        setRemindersExpanded(!remindersExpanded);
                        if (projectsExpanded && !remindersExpanded) setProjectsExpanded(false);
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
                        <span className="text-white font-medium block">{t('plan.reminders')}</span>
                        <p className="text-purple-400/70 text-[11px]">{reminders ? reminders.length : 0} items</p>
                    </div>
                    <svg className={`w-4 h-4 text-purple-400 transition-transform duration-300 ${remindersExpanded ? 'rotate-180' : ''}`} fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                    </svg>
                </button>
            </div>

            {/* Expanded Projects List */}
            <div className={`space-y-2 overflow-hidden transition-all duration-300 mb-6 ${projectsExpanded ? 'max-h-[1200px] opacity-100' : 'max-h-0 opacity-0'}`}>
                {projects.filter(p => p.status === 'active' || p.status === 'not-started').map(project => {
                    const progress = calculateProgress(project);
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
                                                onClick={() => onEditTask(task, project)}
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
                                                        // Logic to add task to day plan
                                                        // This corresponds to logic in App.jsx around line 2686
                                                        // We need a prop/handler for this: onScheduleTask
                                                        // For now using onAddTask with data, but ideally it should call a schedule handler.
                                                        // The original code:
                                                        /* 
                                                        openGlobalTaskModal('task', null, null, {
                                                          name: task.title,
                                                          icon: '📋',
                                                          energy: task.energy,
                                                          hour: 9, 
                                                          minute: 0,
                                                          projectId: project.id, // Important for linking
                                                          projectTaskId: task.id // Important for linking
                                                        });
                                                        */
                                                        // We will use onAddTask to match the signature
                                                        onAddTask('task', null, null, {
                                                            name: task.title,
                                                            icon: '📋',
                                                            energy: task.energy,
                                                            hour: 9,
                                                            minute: 0,
                                                            projectId: project.id,
                                                            projectTaskId: task.id
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
                    onClick={() => {
                        // Navigate to projects tab - passing this up might be needed if not handled by parent
                        // Ideally we pass onManageProjects
                    }}
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
        </>
    );
};
