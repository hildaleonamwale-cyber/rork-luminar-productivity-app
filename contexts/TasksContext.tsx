import { useState, useEffect, useMemo } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';
import createContextHook from '@nkzw/create-context-hook';
import { Task } from '@/constants/types';

const TASKS_STORAGE_KEY = '@luminar_tasks';

export const [TasksContext, useTasks] = createContextHook(() => {
  const [tasks, setTasks] = useState<Task[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    loadTasks();
  }, []);

  useEffect(() => {
    const initSampleData = async () => {
      if (!isLoading && tasks.length === 0) {
        const today = new Date();
        const tomorrow = new Date(today);
        tomorrow.setDate(tomorrow.getDate() + 1);
        
        const sampleTasks: Task[] = [
          {
            id: '1',
            title: 'Morning workout',
            category: 'fitness',
            date: today.toISOString().split('T')[0],
            time: '07:00',
            completed: true,
          },
          {
            id: '2',
            title: 'Team meeting',
            category: 'work',
            date: today.toISOString().split('T')[0],
            time: '10:00',
            completed: false,
          },
          {
            id: '3',
            title: 'Review project proposal',
            category: 'work',
            date: today.toISOString().split('T')[0],
            time: '14:00',
            completed: false,
          },
          {
            id: '4',
            title: 'Grocery shopping',
            category: 'personal',
            date: tomorrow.toISOString().split('T')[0],
            time: '18:00',
            completed: false,
          },
          {
            id: '5',
            title: 'Design homepage mockup',
            category: 'work',
            date: today.toISOString().split('T')[0],
            completed: true,
            projectId: 'project1',
          },
          {
            id: '6',
            title: 'Implement responsive navigation',
            category: 'work',
            date: tomorrow.toISOString().split('T')[0],
            completed: false,
            projectId: 'project1',
          },
        ];
        
        await AsyncStorage.setItem(TASKS_STORAGE_KEY, JSON.stringify(sampleTasks));
        setTasks(sampleTasks);
      }
    };
    
    initSampleData();
  }, [isLoading, tasks.length]);

  const loadTasks = async () => {
    try {
      const stored = await AsyncStorage.getItem(TASKS_STORAGE_KEY);
      if (stored) {
        setTasks(JSON.parse(stored));
      }
    } catch (error) {
      console.error('Error loading tasks:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const saveTasks = async (newTasks: Task[]) => {
    try {
      console.log('TasksContext.saveTasks: Saving', newTasks.length, 'tasks to storage');
      await AsyncStorage.setItem(TASKS_STORAGE_KEY, JSON.stringify(newTasks));
      console.log('TasksContext.saveTasks: Successfully saved to AsyncStorage');
      setTasks(newTasks);
      console.log('TasksContext.saveTasks: State updated');
    } catch (error) {
      console.error('TasksContext.saveTasks: Error saving tasks:', error);
    }
  };

  const addTask = (task: Omit<Task, 'id'>) => {
    console.log('TasksContext.addTask: Creating task with data:', task);
    const newTask: Task = {
      ...task,
      id: Date.now().toString(),
    };
    console.log('TasksContext.addTask: New task created with id:', newTask.id);
    const updatedTasks = [...tasks, newTask];
    console.log('TasksContext.addTask: Total tasks after add:', updatedTasks.length);
    saveTasks(updatedTasks);
  };

  const updateTask = (id: string, updates: Partial<Task>) => {
    console.log('TasksContext.updateTask: Updating task', id, 'with updates:', updates);
    const updated = tasks.map(task =>
      task.id === id ? { ...task, ...updates } : task
    );
    console.log('TasksContext.updateTask: Created updated array with', updated.length, 'tasks');
    saveTasks(updated);
  };

  const deleteTask = (id: string) => {
    console.log('TasksContext: Deleting task with id:', id);
    const taskToDelete = tasks.find(task => task.id === id);
    console.log('TasksContext: Task found:', taskToDelete);
    const updated = tasks.map(task =>
      task.id === id ? { ...task, deleted: true } : task
    );
    console.log('TasksContext: Updated tasks array, deleted count:', updated.filter(t => t.deleted).length);
    saveTasks(updated);
  };

  const restoreTask = (id: string) => {
    console.log('TasksContext: Restoring task with id:', id);
    const updated = tasks.map(task =>
      task.id === id ? { ...task, deleted: false } : task
    );
    console.log('TasksContext: Restored tasks, active count:', updated.filter(t => !t.deleted).length);
    saveTasks(updated);
  };

  const permanentlyDeleteTask = (id: string) => {
    const updated = tasks.filter(task => task.id !== id);
    saveTasks(updated);
  };

  return {
    tasks,
    isLoading,
    addTask,
    updateTask,
    deleteTask,
    restoreTask,
    permanentlyDeleteTask,
  };
});

export function useActiveTasks() {
  const { tasks } = useTasks();
  return useMemo(() => tasks.filter(task => !task.deleted), [tasks]);
}

export function useStandaloneTasks() {
  const { tasks } = useTasks();
  return useMemo(() => tasks.filter(task => !task.deleted && !task.projectId), [tasks]);
}

export function useDeletedTasks() {
  const { tasks } = useTasks();
  return useMemo(() => tasks.filter(task => task.deleted), [tasks]);
}

export function useTasksByDate(date: string) {
  const standaloneTasks = useStandaloneTasks();
  return useMemo(
    () => standaloneTasks.filter(task => task.date === date),
    [standaloneTasks, date]
  );
}

export function useUpcomingTasks(limit: number = 5, includeProjectTasks: boolean = false) {
  const activeTasks = useActiveTasks();
  return useMemo(() => {
    const today = new Date().toISOString().split('T')[0];
    const filteredTasks = includeProjectTasks 
      ? activeTasks 
      : activeTasks.filter(task => !task.projectId);
    return filteredTasks
      .filter(task => task.date >= today)
      .sort((a, b) => {
        if (a.date !== b.date) return a.date.localeCompare(b.date);
        if (a.time && b.time) return a.time.localeCompare(b.time);
        return 0;
      })
      .slice(0, limit);
  }, [activeTasks, limit, includeProjectTasks]);
}
