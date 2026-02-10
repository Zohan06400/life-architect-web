import React from 'react';

// Re-export UI components
export { RepeatPicker } from './shared/ui/RepeatPicker';
export { TaskDetailsList } from './shared/ui/TaskDetailsList';


// ============================================
// CONSTANTS
// ============================================

export const durationOptions = [
    { label: '15 min', value: 15 },
    { label: '30 min', value: 30 },
    { label: '45 min', value: 45 },
    { label: '1 hour', value: 60 },
    { label: '1.5 hours', value: 90 },
    { label: '2 hours', value: 120 },
    { label: '3 hours', value: 180 },
    { label: '4 hours', value: 240 },
    { label: '6 hours', value: 360 },
    { label: '8 hours', value: 480 },
];

export const globalAlertOptions = [
    { label: 'At start', value: 0 },
    { label: '5 min before', value: 5 },
    { label: '15 min before', value: 15 },
    { label: '30 min before', value: 30 },
    { label: '1 hour before', value: 60 },
    { label: '2 hours before', value: 120 },
    { label: '1 day before', value: 1440 },
    { label: '2 days before', value: 2880 },
    { label: '1 week before', value: 10080 },
];

export const globalIconOptions = [
    '📌', '📧', '💪', '📝', '📞', '📚', '🧘', '🎯', '💼', '🏃',
    '🍎', '💡', '🎨', '🎵', '📊', '🛒', '🏠', '💰', '✈️', '🎮',
    '🧹', '👥', '📱', '💻', '🔧', '📦', '🎁', '❤️', '⭐', '🔔'
];

export const globalReminderOptions = [
    { value: null, label: 'None' },
    { value: 5, label: '5 min' },
    { value: 10, label: '10 min' },
    { value: 15, label: '15 min' },
    { value: 30, label: '30 min' },
    { value: 60, label: '1 hour' }
];

export const weekDays = [
    { label: 'M', full: 'Monday', value: 1 },
    { label: 'T', full: 'Tuesday', value: 2 },
    { label: 'W', full: 'Wednesday', value: 3 },
    { label: 'T', full: 'Thursday', value: 4 },
    { label: 'F', full: 'Friday', value: 5 },
    { label: 'S', full: 'Saturday', value: 6 },
    { label: 'S', full: 'Sunday', value: 0 },
];

// ============================================
// HELPERS
// ============================================

export const loadFromStorage = (key, defaultValue) => {
    try {
        const item = localStorage.getItem(key);
        return item ? JSON.parse(item) : defaultValue;
    } catch (error) {
        console.error(`Error loading ${key} from storage:`, error);
        return defaultValue;
    }
};

export const saveToStorage = (key, value) => {
    try {
        localStorage.setItem(key, JSON.stringify(value));
    } catch (error) {
        console.error(`Error saving ${key} to storage:`, error);
    }
};

// Helper to get today's date with time reset
export const getToday = () => {
    const d = new Date();
    d.setHours(0, 0, 0, 0);
    return d;
};

// Helper to generate date key (YYYY-MM-DD)
export const getDateKey = (date) => {
    const d = new Date(date);
    return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`;
};

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

// Calculate task duration
export const getTaskFocusDuration = (task) => {
    if (typeof task?.startTime === 'string' && typeof task?.endTime === 'string' &&
        task.startTime.includes(':') && task.endTime.includes(':')) {
        const [startH, startM] = task.startTime.split(':').map(Number);
        const [endH, endM] = task.endTime.split(':').map(Number);
        const totalMinutes = (endH * 60 + endM) - (startH * 60 + startM);
        if (totalMinutes > 0) {
            return totalMinutes * 60;
        }
    }

    if (task?.startTime instanceof Date && task?.endTime instanceof Date) {
        if (!isNaN(task.startTime.getTime()) && !isNaN(task.endTime.getTime())) {
            const durationMs = task.endTime - task.startTime;
            return Math.max(60, Math.floor(durationMs / 1000));
        }
    }
    return 25 * 60;
};

// Safe date parser for Safari/iOS compatibility
export const safeParseDate = (dateInput) => {
    if (!dateInput) return new Date();

    // If it's already a Date object
    if (dateInput instanceof Date) {
        return isNaN(dateInput.getTime()) ? new Date() : dateInput;
    }

    // Handle strings
    let date = new Date(dateInput);

    // If invalid, try replacing dashes with slashes (common Safari fix for YYYY-MM-DD)
    if (isNaN(date.getTime()) && typeof dateInput === 'string') {
        const replaceDashes = dateInput.replace(/-/g, '/');
        date = new Date(replaceDashes);
    }

    // Final fallback
    if (isNaN(date.getTime())) {
        console.warn('Invalid date detected, falling back to now:', dateInput);
        return new Date();
    }

    return date;
};

// ============================================
// SHARED COMPONENTS
// ============================================



// Helper to get number of days in a month
export const getDaysInMonth = (year, month) => {
    return new Date(year, month + 1, 0).getDate();
};

// Helper to get day of week of the first day of the month
export const getFirstDayOfMonth = (year, month) => {
    return new Date(year, month, 1).getDay();
};
