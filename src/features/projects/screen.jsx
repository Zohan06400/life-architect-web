import React, { useState, useEffect } from 'react';
import { ProjectList } from './components/ProjectList';
import { ProjectDetail } from './components/ProjectDetail';
import { ProjectEditModal } from './components/ProjectEditModal';
import { ProjectTaskModal } from './components/ProjectTaskModal';
import { MoveReminderModal } from './components/MoveReminderModal';
import { ProjectsEditReminderModal } from './components/ProjectsEditReminderModal';

export const ProjectsScreen = ({
    // Data
    projects,
    reminders,
    // Global State
    selectedProject,
    setSelectedProject,
    projectsRemindersExpanded,
    setProjectsRemindersExpanded,
    // Project Handlers
    onAddProject,
    onUpdateProject,
    onDeleteProject,
    // Folder Handlers
    onCreateFolder,
    onDeleteFolder,
    onToggleFolderCollapse,
    // Task Handlers
    onAddProjectTask,
    onUpdateProjectTask, // (projectId, taskId, updates)
    onDeleteProjectTask,
    onToggleProjectTask,
    // Reminder Handlers
    onAddQuickReminder,
    onUpdateReminder, // (reminder)
    onDeleteReminder,
    onToggleReminder, // (id, completed)
    // Shared
    saveToStorage,
    t,
    currentLocale,
    pendingEditTask,
    setPendingEditTask,
    onEditingChange // (isEditing) => void
}) => {
    // --- Local UI State ---

    // Modals state
    const [showProjectModal, setShowProjectModal] = useState(false);
    const [editingProject, setEditingProject] = useState(null);

    const [showProjectTaskModal, setShowProjectTaskModal] = useState(false);
    const [editingProjectTask, setEditingProjectTask] = useState(null);

    // Notes state
    const [projectsIsEditingNotes, setProjectsIsEditingNotes] = useState(false);

    // Reminder UI state
    const [projectsEditingReminder, setProjectsEditingReminder] = useState(null);
    const [projectsShowMoveModal, setProjectsShowMoveModal] = useState(false);
    const [projectsReminderToMove, setProjectsReminderToMove] = useState(null);

    // --- Local Handlers (Wrappers or UI specific) ---

    const handleMoveReminderToProject = (projectId) => {
        if (!projectsReminderToMove) return;

        const newTask = {
            title: projectsReminderToMove.name,
            value: 5,
            energy: 'medium',
            timeEstimate: 30,
            completed: false,
            dueDate: null,
            notes: '',
            icon: projectsReminderToMove.icon || '📝'
        };

        onAddProjectTask(projectId, newTask);
        onDeleteReminder(projectsReminderToMove.id);
        setProjectsShowMoveModal(false);
        setProjectsReminderToMove(null);
    };

    // Helper: Get project progress (if not passed as prop, we render it locally)
    // Note: App.jsx had this. We can keep it here or import it.
    const getProjectProgress = (project) => {
        if (!project?.tasks || project.tasks.length === 0) return 0;
        const completed = project.tasks.filter(t => t.completed).length;
        return Math.round((completed / project.tasks.length) * 100);
    };

    // --- Effects ---

    // Handle pending edit task
    useEffect(() => {
        if (pendingEditTask && selectedProject) {
            setEditingProjectTask(pendingEditTask);
            setShowProjectTaskModal(true);
            setPendingEditTask(null);
        }
    }, [pendingEditTask, selectedProject]);

    // Notify parent about editing state (for hiding navigation)
    useEffect(() => {
        const isEditing =
            showProjectModal ||
            showProjectTaskModal ||
            projectsIsEditingNotes ||
            !!projectsEditingReminder ||
            projectsShowMoveModal;

        if (onEditingChange) {
            onEditingChange(isEditing);
        }
    }, [
        showProjectModal,
        showProjectTaskModal,
        projectsIsEditingNotes,
        projectsEditingReminder,
        projectsShowMoveModal,
        onEditingChange
    ]);


    // --- Render ---

    if (selectedProject) {
        // Ensure we are using the latest project object from 'projects' array
        // because 'selectedProject' might be stale if it's a separate state object
        const currentProject = projects.find(p => p.id === selectedProject.id) || selectedProject;

        return (
            <div className="p-6 pb-24 md:pb-6 max-w-7xl mx-auto w-full">
                <ProjectDetail
                    project={currentProject}
                    onBack={() => setSelectedProject(null)}
                    onEditProject={(p) => {
                        setEditingProject(p);
                        setShowProjectModal(true);
                    }}
                    onUpdateProject={(id, data) => onUpdateProject(id, data)}
                    onCreateFolder={onCreateFolder}
                    onDeleteFolder={onDeleteFolder}
                    onToggleFolder={onToggleFolderCollapse}
                    onToggleTask={onToggleProjectTask}
                    onOpenNewTask={(folderId) => {
                        setEditingProjectTask({ folderId }); // Pass partial object for folder init
                        setShowProjectTaskModal(true);
                    }}
                    onOpenEditTask={(task) => {
                        setEditingProjectTask(task);
                        setShowProjectTaskModal(true);
                    }}
                    projectsIsEditingNotes={projectsIsEditingNotes}
                    setProjectsIsEditingNotes={setProjectsIsEditingNotes}
                    t={t}
                    getProjectProgress={getProjectProgress}
                />

                {/* Modals for Detail View */}
                <ProjectEditModal
                    isOpen={showProjectModal}
                    onClose={() => setShowProjectModal(false)}
                    project={editingProject}
                    onSave={(data) => {
                        if (editingProject) {
                            onUpdateProject(editingProject.id, data);
                        } else {
                            onAddProject(data);
                        }
                        setShowProjectModal(false);
                    }}
                    onDelete={onDeleteProject}
                    t={t}
                />

                <ProjectTaskModal
                    isOpen={showProjectTaskModal}
                    onClose={() => setShowProjectTaskModal(false)}
                    task={editingProjectTask}
                    project={currentProject}
                    onSave={(data) => {
                        if (editingProjectTask && editingProjectTask.id) {
                            onUpdateProjectTask(currentProject.id, editingProjectTask.id, data);
                        } else {
                            onAddProjectTask(currentProject.id, data);
                        }
                        setShowProjectTaskModal(false);
                    }}
                    onDelete={onDeleteProjectTask}
                    t={t}
                    currentLocale={currentLocale}
                />
            </div>
        );
    }

    // List View
    return (
        <div className="p-6 pb-24 md:pb-6 max-w-7xl mx-auto w-full">
            <ProjectList
                projects={projects}
                reminders={reminders}
                onSelectProject={setSelectedProject}
                onOpenNewProject={() => {
                    setEditingProject(null);
                    setShowProjectModal(true);
                }}
                projectsRemindersExpanded={projectsRemindersExpanded}
                setProjectsRemindersExpanded={setProjectsRemindersExpanded}
                onAddQuickReminder={onAddQuickReminder}
                onOpenEditReminder={(reminder) => {
                    setProjectsEditingReminder(reminder);
                }}
                onToggleReminder={onToggleReminder}
                onDeleteReminder={onDeleteReminder}
                onOpenMoveModal={(reminder) => {
                    setProjectsReminderToMove(reminder);
                    setProjectsShowMoveModal(true);
                }}
                onUncompleteReminder={(id) => onToggleReminder(id, false)}
                getProjectProgress={getProjectProgress}
                t={t}
            />

            {/* Modals shared or for List View */}
            <ProjectEditModal
                isOpen={showProjectModal}
                onClose={() => setShowProjectModal(false)}
                project={editingProject}
                onSave={(data) => {
                    if (editingProject) {
                        onUpdateProject(editingProject.id, data);
                    } else {
                        onAddProject(data);
                    }
                    setShowProjectModal(false);
                }}
                t={t}
            />

            <ProjectsEditReminderModal
                isOpen={!!projectsEditingReminder}
                onClose={() => setProjectsEditingReminder(null)} // Close logic
                reminder={projectsEditingReminder}
                onSave={(data) => {
                    onUpdateReminder(data);
                    setProjectsEditingReminder(null);
                }}
                onDelete={onDeleteReminder}
                t={t}
            />

            <MoveReminderModal
                isOpen={projectsShowMoveModal}
                onClose={() => setProjectsShowMoveModal(false)}
                reminderToMove={projectsReminderToMove}
                projects={projects}
                onMoveToProject={handleMoveReminderToProject}
                onOpenNewProject={() => {
                    setProjectsShowMoveModal(false);
                    setEditingProject(null);
                    setShowProjectModal(true);
                }}
                t={t}
            />
        </div>
    );
};
