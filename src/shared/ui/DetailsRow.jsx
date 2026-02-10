import React from 'react';

// iOS-style Details List Row
export const DetailsRow = ({ icon, label, value, subValue, onClick, isLast, themeColor = 'amber' }) => {
    const isTime = label.includes('Time');
    const isAlerts = label === 'Alerts';

    // Dynamic color mapping
    const getColorClasses = () => {
        switch (themeColor) {
            case 'cyan':
                return isTime ? 'bg-cyan-500 text-white' : 'bg-cyan-500/20 text-cyan-400';
            case 'rose':
                return isTime ? 'bg-rose-500 text-white' : 'bg-rose-500/20 text-rose-400';
            case 'purple':
                return isTime ? 'bg-purple-500 text-white' : 'bg-purple-500/20 text-purple-400';
            case 'emerald':
                return isTime ? 'bg-emerald-500 text-white' : 'bg-emerald-500/20 text-emerald-400';
            default: // amber
                return isTime ? 'bg-amber-500 text-white' : 'bg-amber-500/20 text-amber-500';
        }
    };

    return (
        <button
            onClick={onClick}
            className={`w-full flex items-center gap-3 py-3 pr-4 active:bg-white/5 transition-colors group ${!isLast ? 'border-b border-white/5' : ''}`}
        >
            <div className={`w-8 h-8 rounded-lg flex items-center justify-center ${getColorClasses()}`}>
                {icon}
            </div>

            <div className="flex-1 flex items-center justify-between">
                <div className="text-left">
                    <span className="text-white text-[15px] block">{value}</span>
                </div>

                <div className="flex items-center gap-2">
                    {subValue && <span className="text-slate-500 text-[15px]">{subValue}</span>}
                    <svg className="w-4 h-4 text-slate-600 group-hover:text-slate-500 transition-colors" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                    </svg>
                </div>
            </div>
        </button>
    );
};
