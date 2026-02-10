import React, { useState, useEffect } from 'react';

export const ProjectEditModal = ({
    isOpen,
    onClose,
    project,
    onSave, // (projectData) => void
    onDelete, // (projectId) => void
    t
}) => {
    const [localProjectData, setLocalProjectData] = useState({
        title: '',
        startDate: '',
        endDate: '',
        status: 'not-started',
        description: '',
        notes: '',
        color: '#8b5cf6'
    });

    useEffect(() => {
        if (isOpen) {
            if (project) {
                setLocalProjectData({
                    title: project.title || '',
                    startDate: project.startDate || '',
                    endDate: project.endDate || '',
                    status: project.status || 'not-started',
                    description: project.description || '',
                    notes: project.notes || '',
                    color: project.color || '#8b5cf6'
                });
            } else {
                setLocalProjectData({
                    title: '',
                    startDate: new Date().toISOString().split('T')[0],
                    endDate: '',
                    status: 'not-started',
                    description: '',
                    notes: '',
                    color: '#8b5cf6'
                });
            }
        }
    }, [isOpen, project]);

    const statusColors = {
        'not-started': { bg: 'bg-slate-500/20', text: 'text-slate-400', label: t('projectStatus.not_started') },
        'active': { bg: 'bg-emerald-500/20', text: 'text-emerald-400', label: t('projectStatus.active') },
        'on-hold': { bg: 'bg-amber-500/20', text: 'text-amber-400', label: t('projectStatus.on_hold') },
        'completed': { bg: 'bg-purple-500/20', text: 'text-purple-400', label: t('projectStatus.completed') }
    };

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

    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 z-50 flex items-end justify-center animate-fadeIn">
            <div className="absolute inset-0 bg-black/60 backdrop-blur-sm" onClick={onClose} />

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
                            {project ? t('modals.editProject') : t('modals.newProject')}
                        </h2>
                        <button
                            onClick={onClose}
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
                        onClick={() => onSave(localProjectData)}
                        disabled={!localProjectData.title.trim()}
                        className="w-full py-4 rounded-xl font-semibold text-white transition-all disabled:opacity-50"
                        style={{
                            background: 'linear-gradient(135deg, rgba(6,182,212,0.8) 0%, rgba(139,92,246,0.8) 100%)'
                        }}
                    >
                        {project ? t('common.saveChanges') : t('modals.createProject')}
                    </button>

                    {project && onDelete && (
                        <button
                            onClick={() => {
                                onDelete(project.id);
                                onClose();
                            }}
                            className="w-full py-3 rounded-xl font-medium text-rose-400 bg-rose-500/10 hover:bg-rose-500/20 transition-all"
                        >
                            Delete Project
                        </button>
                    )}
                </div>
            </div>
        </div>
    );
};
