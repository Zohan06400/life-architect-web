import React, { useState, useEffect } from 'react';
import { TaskDetailsList } from '../../../shared/ui/TaskDetailsList';
import { SubtaskList } from '../../../shared/ui/SubtaskList';

export const ProjectTaskModal = ({
    isOpen,
    onClose,
    task, // editingProjectTask
    project, // selectedProject or currentProject
    onSave, // (taskData) => void
    onDelete, // (projectId, taskId) => void
    projects, // for folder selection logic if needed, though we act on 'project'
    t,
    currentLocale
}) => {
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
        endTime: '',
        folderId: null,
        subtasks: []
    });

    const [localEditShowTime, setLocalEditShowTime] = useState(false);
    const [localEditShowAlerts, setLocalEditShowAlerts] = useState(false);
    const [localEditShowDate, setLocalEditShowDate] = useState(false);
    const [localEditShowRepeat, setLocalEditShowRepeat] = useState(false);
    const [localEditShowIconPicker, setLocalEditShowIconPicker] = useState(false);

    // Constants (should come from shared config eventually)
    const globalIconOptions = ['📝', '💡', '🎯', '📌', '⭐', '🔔', '📋', '💼', '🏠', '🛒', '📞', '✉️', '🎨', '🔧', '📚', '💪'];
    const globalAlertOptions = [
        { label: 'At time of event', value: 0 },
        { label: '5 minutes before', value: 5 },
        { label: '10 minutes before', value: 10 },
        { label: '15 minutes before', value: 15 },
        { label: '30 minutes before', value: 30 },
        { label: '1 hour before', value: 60 },
        { label: '2 hours before', value: 120 },
        { label: '1 day before', value: 1440 },
        { label: '2 days before', value: 2880 },
        { label: '1 week before', value: 10080 },
    ];
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


    useEffect(() => {
        if (isOpen) {
            // Reset UI states
            setLocalEditShowTime(false);
            setLocalEditShowAlerts(false);
            setLocalEditShowDate(false);
            setLocalEditShowIconPicker(false);
            setLocalEditShowRepeat(false);

            if (task) {
                const getStartTime = (t) => t.startTime ? new Date(t.startTime) : new Date(new Date().setHours(9, 0, 0, 0));
                const getEndTime = (t) => t.endTime ? new Date(t.endTime) : new Date(new Date().setHours(10, 0, 0, 0));
                const formatTime = (d) => `${d.getHours()}:${d.getMinutes().toString().padStart(2, '0')}`;

                setLocalTaskData({
                    title: task.title || '',
                    icon: task.icon || '📝',
                    value: task.value || 5,
                    energy: task.energy || 'medium',
                    timeEstimate: task.timeEstimate || 30,
                    dueDate: task.dueDate || '',
                    notes: task.notes || '',
                    alerts: task.alerts || [],
                    repeat: task.repeat || { type: 'none', label: 'None', days: [] },
                    date: task.date ? new Date(task.date) : new Date(),
                    startTime: task.startTime ? new Date(task.startTime).toTimeString().slice(0, 5) : '', // Or formatTime?
                    endTime: task.endTime ? new Date(task.endTime).toTimeString().slice(0, 5) : '',
                    folderId: task.folderId || null,
                    subtasks: task.subtasks || []
                });
            } else {
                // New Task
                setLocalTaskData({
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
                    endTime: '',
                    folderId: null, // Should maybe be passed in props if creating in a folder
                    subtasks: []
                });
            }
        }
    }, [isOpen, task]);

    const handleSave = () => {
        if (!localTaskData.title.trim()) return;

        // Process dates/times
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

        onSave(taskUpdates);
    };

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
                            {task ? t('modals.editTask') : t('modals.newTask')}
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
                                placeholder={t('placeholders.whatToDo')}
                                className="flex-1 px-4 py-3 bg-white/5 border border-white/10 rounded-xl text-white placeholder:text-slate-500 outline-none focus:border-amber-500/50"
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
                        ${localTaskData.icon === icon ? 'bg-amber-500/20 text-amber-500' : 'hover:bg-white/10'}`}
                                        >
                                            {icon}
                                        </button>
                                    ))}
                                </div>
                            </div>
                        )}
                    </div>

                    {/* Folder Selection */}
                    {project && (project.folders || []).length > 0 && (
                        <div className="mb-4">
                            <label className="text-slate-400 text-sm mb-2 block">{t('projects.folderName')}</label>
                            <div className="relative">
                                <select
                                    value={localTaskData.folderId || ''}
                                    onChange={(e) => setLocalTaskData(prev => ({ ...prev, folderId: e.target.value ? Number(e.target.value) : null }))}
                                    className="w-full px-4 py-3 bg-white/5 border border-white/10 rounded-xl text-white outline-none focus:border-amber-500/50 appearance-none"
                                >
                                    <option value="" className="bg-slate-800">{t('projects.uncategorized')}</option>
                                    {project.folders.map(folder => (
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

                    {/* Details List (iOS Style) */}
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
                            setLocalEditShowRepeat(false);
                        }}
                        onAlertsClick={() => {
                            setLocalEditShowAlerts(!localEditShowAlerts);
                            setLocalEditShowTime(false);
                            setLocalEditShowRepeat(false);
                        }}
                        onRepeatClick={() => {
                            setLocalEditShowRepeat(!localEditShowRepeat);
                            setLocalEditShowAlerts(false);
                            setLocalEditShowTime(false);
                        }}
                        themeColor="amber"
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
                            className="w-full accent-amber-500"
                        />
                    </div>

                    {/* Energy */}
                    <div>
                        <label className="text-xs font-medium text-slate-400 uppercase tracking-wide mb-2 block">{t('common.energyLevel')}</label>
                        <div className="flex gap-2">
                            {['low', 'medium', 'high'].map(level => (
                                <button
                                    key={level}
                                    onClick={() => setLocalTaskData(prev => ({ ...prev, energy: level }))}
                                    className={`flex-1 py-2.5 rounded-xl font-medium text-sm transition-all duration-200
                                        ${localTaskData.energy === level
                                            ? level === 'low'
                                                ? 'bg-emerald-500/80 text-white shadow-lg shadow-emerald-500/30'
                                                : level === 'medium'
                                                    ? 'bg-amber-500/80 text-white shadow-lg shadow-amber-500/30'
                                                    : 'bg-rose-500/80 text-white shadow-lg shadow-rose-500/30'
                                            : 'bg-white/10 text-slate-400 hover:bg-white/20'}`}
                                >
                                    {level === 'low' ? `🌱 ${t('energyLevels.light')}` : level === 'medium' ? `⚡ ${t('energyLevels.moderate')}` : `🔥 ${t('energyLevels.heavy')}`}
                                </button>
                            ))}
                        </div>
                    </div>

                    {/* Subtasks */}
                    <SubtaskList
                        subtasks={localTaskData.subtasks || []}
                        onChange={(newSubtasks) => setLocalTaskData(prev => ({ ...prev, subtasks: newSubtasks }))}
                        t={t}
                    />

                    {/* Notes */}
                    <div>
                        <label className="text-slate-400 text-sm mb-2 block">{t('common.notes')}</label>
                        <textarea
                            value={localTaskData.notes}
                            onChange={(e) => setLocalTaskData(prev => ({ ...prev, notes: e.target.value }))}
                            placeholder={t('placeholders.additionalDetails')}
                            rows={2}
                            className="w-full px-4 py-3 bg-white/5 border border-white/10 rounded-xl text-white placeholder:text-slate-500 outline-none focus:border-amber-500/50 resize-none"
                        />
                    </div>

                    {/* Save Button */}
                    <button
                        onClick={handleSave}
                        disabled={!localTaskData.title.trim()}
                        className="w-full py-4 rounded-xl font-semibold text-white transition-all disabled:opacity-50 bg-gradient-to-r from-amber-500 to-orange-500 shadow-lg shadow-amber-500/30"
                    >
                        {task ? t('common.saveChanges') : t('projects.addTask')}
                    </button>

                    {task && onDelete && (
                        <button
                            onClick={() => {
                                onDelete(project.id, task.id);
                                onClose();
                            }}
                            className="w-full py-3 rounded-xl font-medium text-rose-400 bg-rose-500/10 hover:bg-rose-500/20 transition-all"
                        >
                            {t('common.deleteTask')}
                        </button>
                    )}
                </div>
            </div>
        </div>
    );
};
