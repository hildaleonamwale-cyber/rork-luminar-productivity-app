import { useState, useEffect, useMemo } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';
import createContextHook from '@nkzw/create-context-hook';
import { Goal } from '@/constants/types';

const GOALS_STORAGE_KEY = '@luminar_goals';

export const [GoalsContext, useGoals] = createContextHook(() => {
  const [goals, setGoals] = useState<Goal[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    loadGoals();
  }, []);

  useEffect(() => {
    const initSampleData = async () => {
      if (!isLoading && goals.length === 0) {
        const today = new Date();
        const fiveDaysAgo = new Date(today);
        fiveDaysAgo.setDate(fiveDaysAgo.getDate() - 5);
        
        const completedDays: string[] = [];
        for (let i = 0; i < 5; i++) {
          const date = new Date(fiveDaysAgo);
          date.setDate(date.getDate() + i);
          completedDays.push(date.toISOString().split('T')[0]);
        }
        
        const sampleGoals: Goal[] = [
          {
            id: '1',
            title: 'Daily Exercise',
            icon: 'flame',
            targetDays: 30,
            completedDays,
            startDate: fiveDaysAgo.toISOString().split('T')[0],
            emoji: '🔥',
            color: '#FF4D0C',
          },
        ];
        
        await AsyncStorage.setItem(GOALS_STORAGE_KEY, JSON.stringify(sampleGoals));
        setGoals(sampleGoals);
      }
    };
    
    initSampleData();
  }, [isLoading, goals.length]);

  const loadGoals = async () => {
    try {
      const stored = await AsyncStorage.getItem(GOALS_STORAGE_KEY);
      if (stored) {
        setGoals(JSON.parse(stored));
      }
    } catch (error) {
      console.error('Error loading goals:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const saveGoals = async (newGoals: Goal[]) => {
    try {
      await AsyncStorage.setItem(GOALS_STORAGE_KEY, JSON.stringify(newGoals));
      setGoals(newGoals);
    } catch (error) {
      console.error('Error saving goals:', error);
    }
  };

  const addGoal = (goal: Omit<Goal, 'id' | 'completedDays'>) => {
    const newGoal: Goal = {
      ...goal,
      id: Date.now().toString(),
      completedDays: [],
    };
    saveGoals([...goals, newGoal]);
  };

  const updateGoal = (id: string, updates: Partial<Goal>) => {
    const updated = goals.map(goal =>
      goal.id === id ? { ...goal, ...updates } : goal
    );
    saveGoals(updated);
  };

  const toggleDayCompletion = (goalId: string, date: string) => {
    const updated = goals.map(goal => {
      if (goal.id === goalId) {
        const completedDays = goal.completedDays.includes(date)
          ? goal.completedDays.filter(d => d !== date)
          : [...goal.completedDays, date];
        return { ...goal, completedDays };
      }
      return goal;
    });
    saveGoals(updated);
  };

  const deleteGoal = (id: string) => {
    console.log('GoalsContext: Deleting goal with id:', id);
    const goalToDelete = goals.find(goal => goal.id === id);
    console.log('GoalsContext: Goal found:', goalToDelete);
    const updated = goals.map(goal =>
      goal.id === id ? { ...goal, deleted: true } : goal
    );
    console.log('GoalsContext: Updated goals array, deleted count:', updated.filter(g => g.deleted).length);
    saveGoals(updated);
  };

  const restoreGoal = (id: string) => {
    console.log('GoalsContext: Restoring goal with id:', id);
    const updated = goals.map(goal =>
      goal.id === id ? { ...goal, deleted: false } : goal
    );
    console.log('GoalsContext: Restored goals, active count:', updated.filter(g => !g.deleted).length);
    saveGoals(updated);
  };

  const permanentlyDeleteGoal = (id: string) => {
    const updated = goals.filter(goal => goal.id !== id);
    saveGoals(updated);
  };

  return {
    goals,
    isLoading,
    addGoal,
    updateGoal,
    toggleDayCompletion,
    deleteGoal,
    restoreGoal,
    permanentlyDeleteGoal,
  };
});

export function useActiveGoals() {
  const { goals } = useGoals();
  return useMemo(() => goals.filter(goal => !goal.deleted), [goals]);
}

export function useDeletedGoals() {
  const { goals } = useGoals();
  return useMemo(() => goals.filter(goal => goal.deleted), [goals]);
}
