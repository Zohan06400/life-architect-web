import React from 'react';

export const EnergyBadge = ({ energy, t }) => {
    const colors = {
        high: 'bg-rose-500/20 text-rose-300 ring-rose-500/30',
        medium: 'bg-amber-500/20 text-amber-300 ring-amber-500/30',
        low: 'bg-emerald-500/20 text-emerald-300 ring-emerald-500/30'
    };

    const colorClass = colors[energy] || colors.medium;
    const label = energy ? (energy.charAt(0).toUpperCase() + energy.slice(1)) : 'Medium';

    return (
        <span className={`px-2 py-0.5 rounded-lg text-[10px] font-semibold ring-1 ring-inset ${colorClass} uppercase tracking-wider`}>
            {label}
        </span>
    );
};
