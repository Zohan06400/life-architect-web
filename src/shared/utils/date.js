
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

// Helper to get number of days in a month
export const getDaysInMonth = (year, month) => {
    return new Date(year, month + 1, 0).getDate();
};

// Helper to get day of week of the first day of the month
export const getFirstDayOfMonth = (year, month) => {
    return new Date(year, month, 1).getDay();
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
