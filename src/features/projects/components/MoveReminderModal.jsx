import React from 'react';

export const MoveReminderModal = ({
    isOpen,
    onClose,
    reminderToMove,
    projects,
    onMoveToProject,
    onOpenNewProject,
    t
}) => {
    if (!isOpen || !reminderToMove) return null;

    return (
        <div className="fixed inset-0 z-50 flex items-end justify-center animate-fadeIn">
            <div className="absolute inset-0 bg-black/60 backdrop-blur-sm" onClick={onClose} />

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
                            onClick={onClose}
                            className="w-8 h-8 rounded-full bg-white/10 flex items-center justify-center text-slate-400"
                        >
                            <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                            </svg>
                        </button>
                    </div>
                    <p className="text-slate-400 text-sm mt-2">
                        {t('projects.moving')} <span className="text-cyan-400">{reminderToMove.name}</span>
                    </p>
                </div>

                <div className="p-4 space-y-2">
                    {projects.length > 0 ? (
                        projects.map(project => (
                            <button
                                key={project.id}
                                onClick={() => onMoveToProject(project.id)}
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
                                    onClose();
                                    onOpenNewProject();
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
    );
};
