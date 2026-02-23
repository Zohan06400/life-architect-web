import { logTestEvent } from '../config/test';
import { getDateKey } from '../../shared'; // Assuming index.js exports shared utils, check imports

// Helper for delays
const wait = (ms) => new Promise(resolve => setTimeout(resolve, ms));

export const runSmokeTest = async (context) => {
    const {
        tasks, setTasks, // This is tasksByDate object
        reminders, setReminders,
        projects, setProjects,
        dayPlan, setDayPlan
    } = context;

    logTestEvent('SMOKE_TEST_START', 'Starting automated smoke test sequence...');

    try {
        // 1. Create Project
        logTestEvent('STEP 1', 'Creating Test Project...');
        const projectId = Date.now();
        const newProject = {
            id: projectId,
            title: '🧪 Test Project',
            icon: '🧪',
            progress: 0,
            color: 'indigo',
            status: 'active',
            folders: [],
            tasks: []
        };

        setProjects(prev => [...prev, newProject]);
        await wait(500);

        // 2. Add Project Task
        logTestEvent('STEP 2', 'Adding Project Task...');
        const newTaskId = Date.now() + 1;
        const newTask = {
            id: newTaskId,
            title: 'Test Project Task',
            completed: false,
            value: 5,
            energy: 'medium'
        };

        setProjects(prev => prev.map(p =>
            p.id === projectId
                ? { ...p, tasks: [...(p.tasks || []), newTask] }
                : p
        ));
        await wait(500);

        // 3. Add Daily Task (to tasksByDate)
        logTestEvent('STEP 3', 'Adding Daily Task...');
        const todayKey = getDateKey(new Date());
        const dailyTaskId = Date.now() + 2;
        const dailyTask = {
            id: dailyTaskId,
            title: 'Test Daily Task',
            completed: false,
            energy: 'low',
            startTime: new Date().toISOString(),
            endTime: new Date(Date.now() + 3600000).toISOString()
        };

        setTasks(prev => ({
            ...prev,
            [todayKey]: [...(prev[todayKey] || []), dailyTask]
        }));
        await wait(500);

        // 4. Complete Project Task
        logTestEvent('STEP 4', 'Completing Project Task...');
        setProjects(prev => prev.map(p => {
            if (p.id === projectId) {
                const updatedTasks = p.tasks.map(t =>
                    t.id === newTaskId ? { ...t, completed: true, completedAt: new Date().toISOString() } : t
                );

                // Recalculate progress (weighted)
                const totalWeight = updatedTasks.reduce((sum, t) => sum + (t.value || 5), 0);
                const completedWeight = updatedTasks
                    .filter(t => t.completed)
                    .reduce((sum, t) => sum + (t.value || 5), 0);
                const newProgress = totalWeight === 0 ? 0 : Math.round((completedWeight / totalWeight) * 100);

                return {
                    ...p,
                    tasks: updatedTasks,
                    progress: newProgress
                };
            }
            return p;
        }));
        await wait(500);

        // 5. Cleanup
        // logTestEvent('STEP 5', 'Deleting Test Project...');
        // setProjects(prev => prev.filter(p => p.id !== projectId));
        // await wait(500);

        logTestEvent('SMOKE_TEST_COMPLETE', 'Sequence finished. Verify Test Project exists.');

    } catch (err) {
        console.error(err);
        logTestEvent('SMOKE_TEST_ERROR', err.message);
    }
};
