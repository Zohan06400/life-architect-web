import React, { useState, useEffect } from 'react';
import { TEST_MODE } from '../config/test';
import { runAllValidations } from './validation';
import { runSmokeTest } from './simulation';
import { X, CheckCircle, AlertTriangle, Play, RefreshCw, Activity } from 'lucide-react';

export const TestPanel = ({
    tasks,
    projects,
    habits,
    entries,
    stats,
    dayPlan,
    // Setters for simulation
    setTasks,
    setProjects,
    setDayPlan
}) => {
    const [minimized, setMinimized] = useState(false);
    const [validationResult, setValidationResult] = useState({ valid: true, results: {} });
    const [lastRun, setLastRun] = useState(null);

    // Auto-run validation on data change (debounced slightly)
    useEffect(() => {
        if (!TEST_MODE) return;

        const timer = setTimeout(() => {
            const res = runAllValidations({ tasks, projects, stats, dayPlan });
            setValidationResult(res);
            setLastRun(new Date());
        }, 1000);

        return () => clearTimeout(timer);
    }, [tasks, projects, stats, dayPlan]);

    if (!TEST_MODE) return null;

    if (minimized) {
        return (
            <button
                onClick={() => setMinimized(false)}
                className="fixed bottom-4 left-4 z-[9999] bg-indigo-600 text-white p-2 rounded-full shadow-lg hover:bg-indigo-700 transition"
                title="Expand Test Panel"
            >
                <Activity size={20} />
            </button>
        );
    }

    const { valid, results } = validationResult;
    // Helper to count errors
    const countErrors = (res) => res?.errors?.length || 0;
    const totalErrors = countErrors(results.tasks) + countErrors(results.projects) + countErrors(results.plan);

    return (
        <div className="fixed bottom-4 left-4 z-[9999] bg-slate-900 border border-slate-700 rounded-xl shadow-2xl w-80 font-mono text-xs overflow-hidden animate-fadeIn backdrop-blur-md bg-opacity-95">
            {/* Header */}
            <div className="bg-slate-800 p-3 flex justify-between items-center border-b border-slate-700">
                <div className="flex items-center gap-2">
                    <Activity size={14} className="text-indigo-400" />
                    <span className="font-bold text-slate-200">TEST MODE</span>
                </div>
                <button onClick={() => setMinimized(true)} className="text-slate-400 hover:text-white">
                    <X size={14} />
                </button>
            </div>

            {/* Counts Grid */}
            <div className="grid grid-cols-2 gap-px bg-slate-700">
                <div className="bg-slate-900 p-2">
                    <div className="text-slate-500">Tasks</div>
                    <div className="text-white font-bold text-lg">{tasks?.length || 0}</div>
                </div>
                <div className="bg-slate-900 p-2">
                    <div className="text-slate-500">Projects</div>
                    <div className="text-white font-bold text-lg">{projects?.length || 0}</div>
                </div>
                <div className="bg-slate-900 p-2">
                    <div className="text-slate-500">Habits</div>
                    <div className="text-white font-bold text-lg">{habits?.length || 0}</div>
                </div>
                <div className="bg-slate-900 p-2">
                    <div className="text-slate-500">Day Plan</div>
                    <div className="text-white font-bold text-lg">{dayPlan?.length || 0}</div>
                </div>
            </div>

            {/* Validation Status */}
            <div className={`p-3 border-b border-slate-700 ${totalErrors > 0 ? 'bg-red-900/20' : 'bg-emerald-900/20'}`}>
                <div className="flex justify-between items-center mb-2">
                    <span className="font-semibold text-slate-300">Data Integrity</span>
                    {totalErrors === 0 ? (
                        <span className="flex items-center gap-1 text-emerald-400">
                            <CheckCircle size={12} /> OK
                        </span>
                    ) : (
                        <span className="flex items-center gap-1 text-rose-400">
                            <AlertTriangle size={12} /> {totalErrors} Issues
                        </span>
                    )}
                </div>

                {/* Error List */}
                {totalErrors > 0 && (
                    <div className="max-h-24 overflow-y-auto space-y-1 mt-2 mb-2 p-2 bg-black/20 rounded">
                        {results.tasks?.errors?.map((e, i) => <div key={`t-${i}`} className="text-rose-300">• {e}</div>)}
                        {results.projects?.errors?.map((e, i) => <div key={`p-${i}`} className="text-rose-300">• {e}</div>)}
                        {results.plan?.errors?.map((e, i) => <div key={`d-${i}`} className="text-rose-300">• {e}</div>)}
                    </div>
                )}

                <div className="text-slate-500 text-[10px]">
                    Last check: {lastRun?.toLocaleTimeString()}
                </div>
            </div>

            {/* Actions */}
            <div className="p-3 gap-2 flex flex-col">
                <button
                    onClick={() => runSmokeTest({ tasks, setTasks, projects, setProjects, setDayPlan })}
                    className="flex items-center justify-center gap-2 bg-indigo-600 hover:bg-indigo-700 text-white py-2 rounded-lg transition"
                >
                    <Play size={12} /> Run Smoke Test
                </button>
                <button
                    onClick={() => window.location.reload()}
                    className="flex items-center justify-center gap-2 bg-slate-700 hover:bg-slate-600 text-slate-300 py-2 rounded-lg transition"
                >
                    <RefreshCw size={12} /> Reload & Verify
                </button>
            </div>
        </div>
    );
};
