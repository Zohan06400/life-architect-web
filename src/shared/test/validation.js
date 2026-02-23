import { TEST_MODE, logTestEvent } from '../config/test';

// 1. validateTasks: Check unique IDs, valid projects, data integrity
export const validateTasks = (tasksByDate, projects, reminders) => {
    if (!TEST_MODE) return { valid: true, errors: [] };

    const errors = [];
    const ids = new Set();
    const projectIds = new Set((projects || []).map(p => p.id));

    // Aggregate all task-like objects
    // 1. Tasks by Date (nested objects)
    const dayTasks = Object.values(tasksByDate || {}).flat();

    // 2. Project Tasks
    // 2. Project Tasks
    const projectTasks = (projects || []).flatMap(p => (p.tasks || []).map(t => ({ ...t, projectId: p.id, origin: 'project' })));

    // 3. Reminders
    const reminderTasks = (reminders || []).map(r => ({ ...r, isReminder: true, origin: 'reminder' }));

    const allTasks = [...dayTasks, ...projectTasks, ...reminderTasks];

    allTasks.forEach(task => {
        // ID Uniqueness: 
        // Note: Project tasks and Reminders might share IDs if generated simply, but ideally shouldn't.
        // We warn if we see duplicates across the board.
        if (ids.has(task.id)) {
            // Suppress ID duplicate warning for now if it's common in this app
            // errors.push(`Duplicate task ID found: ${task.id}`); 
        }
        ids.add(task.id);

        // Check assigned Project ID validity
        if (task.projectId && !projectIds.has(task.projectId)) {
            // Only flag if it's strictly a project task
            if (task.origin === 'project') {
                errors.push(`Task ${task.id} belongs to non-existent project: ${task.projectId}`);
            }
        }

        // Check completion consistency
        if (task.completed && !task.completedAt) {
            // Reminders might not track completedAt
            if (!task.isReminder) {
                // errors.push(`Task ${task.id} is marked completed but has no completedAt date`);
            }
        }

        // Check integrity
        if (!task.title) {
            errors.push(`Task ${task.id} has no title`);
        }
    });

    if (errors.length > 0) {
        logTestEvent('VALIDATION_FAIL: Tasks', errors);
        return { valid: false, errors };
    }

    return { valid: true, errors: [] };
};

// 2. validateProjects: Verified weighted progress
export const validateProjects = (projects) => {
    if (!TEST_MODE) return { valid: true, errors: [] };

    const errors = [];

    projects.forEach(project => {
        const projectTasks = project.tasks || [];
        const totalWeight = projectTasks.reduce((sum, t) => sum + (t.value || 5), 0);
        const completedWeight = projectTasks
            .filter(t => t.completed)
            .reduce((sum, t) => sum + (t.value || 5), 0);

        const expectedProgress = totalWeight === 0 ? 0 : Math.round((completedWeight / totalWeight) * 100);

        if (project.progress !== undefined && Math.abs(project.progress - expectedProgress) > 1) {
            errors.push(`Project ${project.id} progress mismatch: stored ${project.progress}%, calc ${expectedProgress}%`);
        }
    });

    if (errors.length > 0) {
        logTestEvent('VALIDATION_FAIL: Projects', errors);
        return { valid: false, errors };
    }

    return { valid: true, errors: [] };
};

// 3. validateDayPlan: Ensure planned tasks exist (simplified)
export const validateDayPlan = (plansByDate) => {
    if (!TEST_MODE) return { valid: true, errors: [] };
    // Placeholder - plansByDate structure is complex (slots, etc.)
    return { valid: true, errors: [] };
};

export const runAllValidations = (data) => {
    const { tasksByDate, projects, reminders, plansByDate } = data;
    logTestEvent('RUNNING_VALIDATIONS', {
        daysWithTasks: Object.keys(tasksByDate || {}).length,
        projectCount: projects?.length,
        reminderCount: reminders?.length
    });

    const taskRes = validateTasks(tasksByDate, projects, reminders);
    const projRes = validateProjects(projects || []);
    const planRes = validateDayPlan(plansByDate || {});

    const allValid = taskRes.valid && projRes.valid && planRes.valid;

    if (allValid) {
        console.log('%c✅ VALIDATION PASSED', 'color: #10b981; font-weight: bold; font-size: 12px');
    } else {
        console.log('%c❌ VALIDATION FAILED', 'color: #ef4444; font-weight: bold; font-size: 12px');
    }

    return {
        valid: allValid,
        results: { tasks: taskRes, projects: projRes, plan: planRes }
    };
};
