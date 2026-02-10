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
