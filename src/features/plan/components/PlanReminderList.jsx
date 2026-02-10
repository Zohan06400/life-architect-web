import React from 'react';
import { EnergyBadge } from '../../../shared/ui/EnergyBadge'; // Assuming this needs to be extracted or imported

export const PlanReminderList = ({
    reminders,
    onToggleReminder, // Replaces direct setReminders/saveToStorage
    onEditReminder,
    onAddReminder,
    remindersExpanded,
    selectedPlanDate, // Passed to filter resolved tasks
    getResolvedTasksForDate,
    t
}) => {
    return (
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
                        onClick={() => onEditReminder(reminder)}
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
                                    onToggleReminder(reminder.id, true);
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
                                // Logic to add reminder as task to today's plan
                                onAddReminder({
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
                onClick={() => onAddReminder(null, 'reminder')} // Pass 'reminder' type if needed, logic depends on handler
                // Actually onApp: openGlobalTaskModal('reminder')
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
                                    onClick={() => onEditReminder(reminder)}
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
                                                onToggleReminder(reminder.id, false);
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
    );
};
