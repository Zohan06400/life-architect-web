import React, { useState } from 'react';

export const ProjectList = ({
    projects,
    reminders,
    onSelectProject,
    onOpenNewProject,
    // Reminders props
    projectsRemindersExpanded,
    setProjectsRemindersExpanded,
    onAddQuickReminder, // (text) => void
    onOpenEditReminder, // (reminder) => void
    onToggleReminder, // (id, completed) => void
    onDeleteReminder, // (id) => void
    onOpenMoveModal, // (reminder) => void
    onUncompleteReminder, // (id) => void
    // Helper
    getProjectProgress,
    t
}) => {
    const [newReminderText, setNewReminderText] = useState('');

    const statusColors = {
        'not-started': { bg: 'bg-slate-500/20', text: 'text-slate-400', label: t('projectStatus.not_started') },
        'active': { bg: 'bg-emerald-500/20', text: 'text-emerald-400', label: t('projectStatus.active') },
        'on-hold': { bg: 'bg-amber-500/20', text: 'text-amber-400', label: t('projectStatus.on_hold') },
        'completed': { bg: 'bg-purple-500/20', text: 'text-purple-400', label: t('projectStatus.completed') }
    };

    const handleAddWrapper = () => {
        if (newReminderText.trim()) {
            onAddQuickReminder(newReminderText.trim());
            setNewReminderText('');
        }
    };

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
                                onKeyDown={(e) => e.key === 'Enter' && handleAddWrapper()}
                                placeholder={t('placeholders.captureIdea')}
                                className="flex-1 px-4 py-3 rounded-xl text-white placeholder:text-slate-500 outline-none"
                                style={{
                                    background: 'rgba(255,255,255,0.05)',
                                    border: '1px solid rgba(245,158,11,0.2)'
                                }}
                            />
                            <button
                                onClick={handleAddWrapper}
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
                        {reminders.filter(r => !r.completed).length > 0 ? (
                            <div className="space-y-2">
                                {reminders.filter(r => !r.completed).map(reminder => (
                                    <div
                                        key={reminder.id}
                                        onClick={() => onOpenEditReminder(reminder)}
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
                                                onToggleReminder(reminder.id, true);
                                            }}
                                            className="w-6 h-6 rounded-full border-2 border-amber-400 flex items-center justify-center hover:bg-amber-500/20 transition-all flex-shrink-0"
                                        >
                                            {/* Empty circle for uncompleted */}
                                        </button>

                                        <span className="text-lg">{reminder.icon}</span>
                                        <span className="text-slate-300 flex-1 truncate">{reminder.name}</span>
                                        <div className="flex items-center gap-1">
                                            <button
                                                onClick={(e) => { e.stopPropagation(); onOpenMoveModal(reminder); }}
                                                className="w-8 h-8 rounded-lg text-cyan-400 hover:bg-cyan-500/20 flex items-center justify-center transition-all"
                                                title="Move to project"
                                            >
                                                <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7l5 5m0 0l-5 5m5-5H6" />
                                                </svg>
                                            </button>
                                            <button
                                                onClick={(e) => { e.stopPropagation(); onDeleteReminder(reminder.id); }}
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
                                                onClick={() => onOpenEditReminder(reminder)}
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
                                                        onUncompleteReminder(reminder.id);
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
                    const status = statusColors[project.status] || statusColors['not-started'];
                    const projectColor = project.color || '#8b5cf6';

                    return (
                        <div
                            key={project.id}
                            onClick={() => onSelectProject(project)}
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
                    onClick={onOpenNewProject}
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
        </div>
    );
};
