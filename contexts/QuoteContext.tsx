import { useState, useEffect } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';
import createContextHook from '@nkzw/create-context-hook';

const QUOTE_STORAGE_KEY = '@luminar_quote';
const DEFAULT_QUOTE = "Every day is a chance to become better";

export const [QuoteContext, useQuote] = createContextHook(() => {
  const [quote, setQuote] = useState<string>(DEFAULT_QUOTE);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    loadQuote();
  }, []);

  const loadQuote = async () => {
    try {
      const stored = await AsyncStorage.getItem(QUOTE_STORAGE_KEY);
      if (stored) {
        setQuote(stored);
      }
    } catch (error) {
      console.error('Error loading quote:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const updateQuote = async (newQuote: string) => {
    try {
      await AsyncStorage.setItem(QUOTE_STORAGE_KEY, newQuote);
      setQuote(newQuote);
    } catch (error) {
      console.error('Error saving quote:', error);
    }
  };

  return {
    quote,
    isLoading,
    updateQuote,
  };
});
