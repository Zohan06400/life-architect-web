import React from 'react';
import { EnergyBadge } from '../../../shared/ui/EnergyBadge';
import { formatTotalTime } from '../../../shared/utils/formatting'; // Need to ensure this is exported

export const PlanDailyList = ({
    resolvedTasks,
    onEditTask,
    onEditReminder, // or generic onEditItem
    onToggleCompletion,
    onAddTask,
    energyLoad,
    totalMinutes,
    selectedPlanDate,
    t
}) => {

    const handleEdit = (task) => {
        if (task.isReminder) {
            // Reconstruct reminder object or pass minimal necessary data
            // resolvedTasks items might have merged properties
            onEditReminder(task);
        } else {
            onEditTask(task);
        }
    };

    return (
        <div className="mb-8">
            <div className="space-y-3">
                {resolvedTasks.length > 0 ? (
                    resolvedTasks.map((task) => (
                        <div
                            key={task.id}
                            onClick={() => handleEdit(task)}
                            className={`p-4 glass-card rounded-2xl transition-all duration-200 ease-out select-none cursor-pointer hover:bg-white/10 hover:scale-[1.01]`}
                        >
                            <div className="flex items-center gap-3">
                                <button
                                    onClick={(e) => {
                                        e.stopPropagation();
                                        onToggleCompletion(task);
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
                            onClick={() => onAddTask()}
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
                    onClick={() => onAddTask()}
                    className="w-full p-3 rounded-2xl border border-dashed border-white/20 hover:border-purple-500/50 hover:bg-purple-500/10 transition-all flex items-center justify-center gap-2 text-slate-400 hover:text-purple-400"
                >
                    <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
                    </svg>
                    <span className="text-sm font-medium">{t('common.add')} {t('common.task')}</span>
                </button>
            </div>

            {/* Summary Card - Glass */}
            <div className="glass-card rounded-3xl p-6 text-white mt-8">
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
        </div>
    );
};
