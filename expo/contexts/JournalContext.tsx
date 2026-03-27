import { useState, useEffect, useMemo } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';
import createContextHook from '@nkzw/create-context-hook';
import { JournalEntry } from '@/constants/types';

const JOURNAL_STORAGE_KEY = '@luminar_journal';

export const [JournalContext, useJournal] = createContextHook(() => {
  const [entries, setEntries] = useState<JournalEntry[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    loadEntries();
  }, []);

  const loadEntries = async () => {
    try {
      const stored = await AsyncStorage.getItem(JOURNAL_STORAGE_KEY);
      if (stored) {
        setEntries(JSON.parse(stored));
      }
    } catch (error) {
      console.error('Error loading journal entries:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const saveEntries = async (newEntries: JournalEntry[]) => {
    try {
      await AsyncStorage.setItem(JOURNAL_STORAGE_KEY, JSON.stringify(newEntries));
      setEntries(newEntries);
    } catch (error) {
      console.error('Error saving journal entries:', error);
    }
  };

  const addEntry = (entry: Omit<JournalEntry, 'id'>) => {
    const newEntry: JournalEntry = {
      ...entry,
      id: Date.now().toString(),
    };
    saveEntries([...entries, newEntry]);
  };

  const updateEntry = (id: string, updates: Partial<JournalEntry>) => {
    const updated = entries.map(entry =>
      entry.id === id ? { ...entry, ...updates } : entry
    );
    saveEntries(updated);
  };

  const deleteEntry = (id: string) => {
    const updated = entries.map(entry =>
      entry.id === id ? { ...entry, deleted: true } : entry
    );
    saveEntries(updated);
  };

  const restoreEntry = (id: string) => {
    const updated = entries.map(entry =>
      entry.id === id ? { ...entry, deleted: false } : entry
    );
    saveEntries(updated);
  };

  const permanentlyDeleteEntry = (id: string) => {
    const updated = entries.filter(entry => entry.id !== id);
    saveEntries(updated);
  };

  return {
    entries,
    isLoading,
    addEntry,
    updateEntry,
    deleteEntry,
    restoreEntry,
    permanentlyDeleteEntry,
  };
});

export function useActiveEntries() {
  const { entries } = useJournal();
  return useMemo(() => 
    entries
      .filter(entry => !entry.deleted)
      .sort((a, b) => b.date.localeCompare(a.date)),
    [entries]
  );
}

export function useDeletedEntries() {
  const { entries } = useJournal();
  return useMemo(() => entries.filter(entry => entry.deleted), [entries]);
}
