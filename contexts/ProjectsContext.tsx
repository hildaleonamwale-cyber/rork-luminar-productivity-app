import { useState, useEffect, useMemo } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';
import createContextHook from '@nkzw/create-context-hook';
import { Project } from '@/constants/types';

const PROJECTS_STORAGE_KEY = '@luminar_projects';

export const [ProjectsContext, useProjects] = createContextHook(() => {
  const [projects, setProjects] = useState<Project[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    loadProjects();
  }, []);

  useEffect(() => {
    const initSampleData = async () => {
      if (!isLoading && projects.length === 0) {
        const sampleProjects: Project[] = [
          {
            id: 'project1',
            title: 'Website Redesign',
            description: 'Redesign company website with modern UI/UX',
          },
        ];
        
        await AsyncStorage.setItem(PROJECTS_STORAGE_KEY, JSON.stringify(sampleProjects));
        setProjects(sampleProjects);
      }
    };
    
    initSampleData();
  }, [isLoading, projects.length]);

  const loadProjects = async () => {
    try {
      const stored = await AsyncStorage.getItem(PROJECTS_STORAGE_KEY);
      if (stored) {
        setProjects(JSON.parse(stored));
      }
    } catch (error) {
      console.error('Error loading projects:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const saveProjects = async (newProjects: Project[]) => {
    try {
      await AsyncStorage.setItem(PROJECTS_STORAGE_KEY, JSON.stringify(newProjects));
      setProjects(newProjects);
    } catch (error) {
      console.error('Error saving projects:', error);
    }
  };

  const addProject = (project: Omit<Project, 'id'>) => {
    const newProject: Project = {
      ...project,
      id: Date.now().toString(),
    };
    saveProjects([...projects, newProject]);
  };

  const updateProject = (id: string, updates: Partial<Project>) => {
    const updated = projects.map(project =>
      project.id === id ? { ...project, ...updates } : project
    );
    saveProjects(updated);
  };

  const deleteProject = (id: string) => {
    console.log('ProjectsContext: Deleting project with id:', id);
    const projectToDelete = projects.find(project => project.id === id);
    console.log('ProjectsContext: Project found:', projectToDelete);
    const updated = projects.map(project =>
      project.id === id ? { ...project, deleted: true } : project
    );
    console.log('ProjectsContext: Updated projects array, deleted count:', updated.filter(p => p.deleted).length);
    saveProjects(updated);
  };

  const restoreProject = (id: string) => {
    console.log('ProjectsContext: Restoring project with id:', id);
    const updated = projects.map(project =>
      project.id === id ? { ...project, deleted: false } : project
    );
    console.log('ProjectsContext: Restored projects, active count:', updated.filter(p => !p.deleted).length);
    saveProjects(updated);
  };

  const permanentlyDeleteProject = (id: string) => {
    const updated = projects.filter(project => project.id !== id);
    saveProjects(updated);
  };

  return {
    projects,
    isLoading,
    addProject,
    updateProject,
    deleteProject,
    restoreProject,
    permanentlyDeleteProject,
  };
});

export function useActiveProjects() {
  const { projects } = useProjects();
  return useMemo(() => projects.filter(project => !project.deleted), [projects]);
}

export function useDeletedProjects() {
  const { projects } = useProjects();
  return useMemo(() => projects.filter(project => project.deleted), [projects]);
}
