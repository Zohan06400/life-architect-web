// Helper for parsing time strings (e.g. "1h 30m" -> 90)
export const parseTime = (timeStr) => {
    if (!timeStr) return 60;
    // If it's already a number, return it directly
    if (typeof timeStr === 'number') return timeStr;
    // Convert to string if needed
    const str = String(timeStr);
    const match = str.match(/(\d+)h?\s*(\d+)?m?/);
    if (!match) return 60;
    const hours = parseInt(match[1]) || 0;
    const mins = parseInt(match[2]) || 0;
    if (str.includes('h')) return hours * 60 + mins;
    return parseInt(str) || 60;
};

export const formatElapsed = (seconds) => {
    const h = Math.floor(seconds / 3600);
    const m = Math.floor((seconds % 3600) / 60);
    const s = seconds % 60;
    if (h > 0) return `${h}:${m.toString().padStart(2, '0')}:${s.toString().padStart(2, '0')}`;
    return `${m}:${s.toString().padStart(2, '0')}`;
};

export const formatTotalTime = (minutes) => {
    if (!minutes) return '0h 0m';
    const h = Math.floor(minutes / 60);
    const m = minutes % 60;
    return `${h}h ${m}m`;
};
