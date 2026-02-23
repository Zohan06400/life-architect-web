import React, { useState } from 'react';

export const ProjectDetail = ({
    project, // currentProject
    onBack,
    onEditProject,
    onUpdateProject, // (projectId, updates) => void (for notes)
    onCreateFolder,
    onDeleteFolder,
    onToggleFolder,
    onToggleTask,
    onOpenNewTask, // (folderId?) => void
    onOpenEditTask, // (task) => void
    projectsIsEditingNotes,
    setProjectsIsEditingNotes,
    t,
    // Helper to calculate progress - could be prop or imported util

    // Helper to calculate progress - could be prop or imported util
    getProjectProgress,
    onUpdateProjectTask
}) => {
    const [notesText, setNotesText] = useState('');
    const [showNewFolderInput, setShowNewFolderInput] = useState(false);
    const [newFolderName, setNewFolderName] = useState('');
    // Drag and Drop State
    const [dragOverFolderId, setDragOverFolderId] = useState(null);

    if (!project) return null;

    const handleDragStart = (e, taskId) => {
        e.dataTransfer.setData('taskId', taskId);
        e.dataTransfer.effectAllowed = 'move';
    };

    const handleDragOver = (e, folderId) => {
        e.preventDefault(); // Necessary to allow dropping
        if (dragOverFolderId !== folderId) {
            setDragOverFolderId(folderId);
        }
    };

    const handleDragLeave = (e, folderId) => {
        // Prevent flickering by checking if we're actually leaving the container
        if (e.currentTarget.contains(e.relatedTarget)) {
            return;
        }

        if (dragOverFolderId === folderId) {
            setDragOverFolderId(null);
        }
    };

    const handleDrop = (e, folderId) => {
        e.preventDefault();
        const taskIdStr = e.dataTransfer.getData('taskId');
        if (taskIdStr) {
            // Task IDs are numbers (timestamps), but dataTransfer stores strings
            const taskId = parseInt(taskIdStr, 10);

            // Only update if it's a valid number
            if (!isNaN(taskId)) {
                onUpdateProjectTask(project.id, taskId, { folderId });
            }
        }
        setDragOverFolderId(null);
    };

    const progress = getProjectProgress(project);
    const completedTasks = project.tasks?.filter(t => t.completed) || [];
    const pendingTasks = project.tasks?.filter(t => !t.completed) || [];

    const statusColors = {
        'not-started': { bg: 'bg-slate-500/20', text: 'text-slate-400', label: t('projectStatus.not_started') },
        'active': { bg: 'bg-emerald-500/20', text: 'text-emerald-400', label: t('projectStatus.active') },
        'on-hold': { bg: 'bg-amber-500/20', text: 'text-amber-400', label: t('projectStatus.on_hold') },
        'completed': { bg: 'bg-purple-500/20', text: 'text-purple-400', label: t('projectStatus.completed') }
    };

    const status = statusColors[project.status] || statusColors['not-started'];
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

    const handleStartEditingNotes = () => {
        setNotesText(project.notes || '');
        setProjectsIsEditingNotes(true);
    };

    const handleSaveNotes = () => {
        onUpdateProject(project.id, { notes: notesText });
        setProjectsIsEditingNotes(false);
    };

    const handleCancelNotes = () => {
        setProjectsIsEditingNotes(false);
        setNotesText('');
    };

    return (
        <div className="pb-28 animate-fadeIn">
            {/* Back Button & Header */}
            <div className="mb-6">
                <button
                    onClick={onBack}
                    className="flex items-center gap-2 text-slate-400 hover:text-white transition-colors mb-4"
                >
                    <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
                    </svg>
                    <span className="text-sm">{t('projects.backToProjects')}</span>
                </button>

                <div className="flex items-start justify-between">
                    <div className="flex-1">
                        <h1 className="text-2xl font-semibold text-white">{project.title}</h1>
                        {project.description && (
                            <p className="text-slate-400 text-sm mt-2 leading-relaxed">{project.description}</p>
                        )}
                    </div>
                    <button
                        onClick={() => onEditProject(project)}
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
                        {completedTasks.length} of {project.tasks?.length || 0} tasks
                    </span>
                    {project.endDate && (
                        <span className="text-slate-400">
                            Due {new Date(project.endDate).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}
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
                            onClick={handleStartEditingNotes}
                            className="text-cyan-400 text-xs hover:text-cyan-300 transition-colors"
                        >
                            {project.notes ? t('common.edit') : t('projects.add')}
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
                                onClick={handleSaveNotes}
                                className="flex-1 py-2 rounded-xl text-sm font-medium text-white bg-cyan-500/20 hover:bg-cyan-500/30 border border-cyan-500/30 transition-all"
                            >
                                {t('common.save')}
                            </button>
                            <button
                                onClick={handleCancelNotes}
                                className="flex-1 py-2 rounded-xl text-sm font-medium text-slate-400 bg-white/5 hover:bg-white/10 transition-all"
                            >
                                {t('common.cancel')}
                            </button>
                        </div>
                    </div>
                ) : (
                    <div>
                        {project.notes ? (
                            <p className="text-slate-300 text-sm leading-relaxed whitespace-pre-wrap">{project.notes}</p>
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
                    {!showNewFolderInput && (
                        <button
                            onClick={() => setShowNewFolderInput(true)}
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
                {showNewFolderInput && (
                    <div className="mb-4 animate-fadeIn">
                        <div className="flex gap-2">
                            <input
                                type="text"
                                value={newFolderName}
                                onChange={(e) => setNewFolderName(e.target.value)}
                                placeholder={t('projects.folderName')}
                                className="flex-1 px-4 py-2 bg-white/5 border border-white/10 rounded-xl text-white placeholder:text-slate-500 outline-none focus:border-cyan-500/50 text-sm"
                                autoFocus
                                onKeyDown={(e) => {
                                    if (e.key === 'Enter' && newFolderName.trim()) {
                                        onCreateFolder(project.id, newFolderName);
                                        setNewFolderName('');
                                        setShowNewFolderInput(false);
                                    }
                                }}
                            />
                            <button
                                onClick={() => {
                                    if (newFolderName.trim()) {
                                        onCreateFolder(project.id, newFolderName);
                                        setNewFolderName('');
                                        setShowNewFolderInput(false);
                                    }
                                }}
                                disabled={!newFolderName.trim()}
                                className="px-4 py-2 bg-cyan-500/20 text-cyan-400 rounded-xl text-sm font-medium hover:bg-cyan-500/30 disabled:opacity-50 transition-all"
                            >
                                {t('common.add')}
                            </button>
                            <button
                                onClick={() => {
                                    setNewFolderName('');
                                    setShowNewFolderInput(false);
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
                    {(project.folders || []).map(folder => {
                        const folderTasks = pendingTasks.filter(t => t.folderId === folder.id);

                        return (

                            <div
                                key={folder.id}
                                id={`folder-${folder.id}`}
                                className={`animate-fadeIn transition-colors duration-200 rounded-xl ${dragOverFolderId === folder.id ? 'bg-white/5 ring-2 ring-cyan-500/50' : ''}`}
                                onDragOver={(e) => handleDragOver(e, folder.id)}
                                onDragLeave={(e) => handleDragLeave(e, folder.id)}
                                onDrop={(e) => handleDrop(e, folder.id)}
                            >
                                <div className="flex items-center justify-between mb-2 group">
                                    <div
                                        className="flex items-center gap-2 cursor-pointer hover:text-cyan-400 transition-colors"
                                        onClick={() => onToggleFolder(project.id, folder.id)}
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
                                            onClick={() => onOpenNewTask(folder.id)}
                                            className="p-1 text-slate-500 hover:text-cyan-400 transition-all"
                                            title={t('projects.addTask')}
                                        >
                                            <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
                                            </svg>
                                        </button>
                                        <button
                                            onClick={() => onDeleteFolder(project.id, folder.id)}
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
                                                    id={`task-${task.id}`}
                                                    draggable="true"
                                                    onDragStart={(e) => handleDragStart(e, task.id)}
                                                    onClick={() => onOpenEditTask(task)}
                                                    className="glass-card rounded-xl p-4 flex items-center gap-3 cursor-grab active:cursor-grabbing hover:bg-white/10 transition-all active:scale-[0.98]"
                                                >
                                                    <button
                                                        onClick={(e) => {
                                                            e.stopPropagation();
                                                            onToggleTask(project.id, task.id);
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
                        const uncategorizedTasks = pendingTasks.filter(t => !project.folders?.some(f => f.id === t.folderId));
                        if (uncategorizedTasks.length === 0 && (project.folders || []).length > 0) return null;

                        return (
                            <div className="animate-fadeIn">
                                {(project.folders || []).length > 0 && (
                                    <h4 className="text-slate-400 text-xs font-medium uppercase tracking-wider mb-2 mt-4">{t('projects.uncategorized')}</h4>
                                )}
                                <div className="space-y-2">
                                    {uncategorizedTasks.map(task => (

                                        <div
                                            key={task.id}
                                            id={`task-${task.id}`}
                                            draggable="true"
                                            onDragStart={(e) => handleDragStart(e, task.id)}
                                            onClick={() => onOpenEditTask(task)}
                                            className="glass-card rounded-xl p-4 flex items-center gap-3 cursor-grab active:cursor-grabbing hover:bg-white/10 transition-all active:scale-[0.98]"
                                        >
                                            <button
                                                onClick={(e) => {
                                                    e.stopPropagation();
                                                    onToggleTask(project.id, task.id);
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
                                    {uncategorizedTasks.length === 0 && (project.folders || []).length === 0 && (
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
                onClick={() => onOpenNewTask()}
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
                                onClick={() => onOpenEditTask(task)}
                                className="glass-card rounded-xl p-4 flex items-center gap-3 opacity-60 cursor-pointer hover:opacity-80 transition-all active:scale-[0.98]"
                            >
                                <button
                                    onClick={(e) => {
                                        e.stopPropagation();
                                        onToggleTask(project.id, task.id);
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

            {project.tasks?.length === 0 && (
                <div className="glass-card rounded-2xl p-8 text-center">
                    <div className="text-4xl mb-3">📋</div>
                    <p className="text-slate-400">{t('projects.noTasks')}</p>
                </div>
            )}
        </div>
    );
};
