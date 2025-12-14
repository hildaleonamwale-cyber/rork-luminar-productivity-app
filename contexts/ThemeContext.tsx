import createContextHook from '@nkzw/create-context-hook';
import { useState, useEffect } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';

export type GradientType = 'linear' | 'radial';

export interface GradientConfig {
  type: GradientType;
  colors: string[];
}

export interface ThemeColors {
  primary: string;
  secondary: string;
  accent: string;
  gradient?: GradientConfig;
  backgroundImage?: string;
}

export const THEME_PRESETS: ThemeColors[] = [
  { primary: '#DA9381', secondary: '#E5A997', accent: '#F0BFAD' },
  { primary: '#735DFF', secondary: '#9B8BFF', accent: '#C6C9FF' },
  { primary: '#10B981', secondary: '#34D399', accent: '#6EE7B7' },
  { primary: '#F59E0B', secondary: '#FBBF24', accent: '#FCD34D' },
  { primary: '#EC4899', secondary: '#F472B6', accent: '#F9A8D4' },
  { primary: '#3B82F6', secondary: '#60A5FA', accent: '#93C5FD' },
  { primary: '#8B5CF6', secondary: '#A78BFA', accent: '#C4B5FD' },
  { primary: '#EF4444', secondary: '#F87171', accent: '#FCA5A5' },
];

const STORAGE_KEY = '@theme_colors';

export const [ThemeContext, useTheme] = createContextHook(() => {
  const [colors, setColors] = useState<ThemeColors>(THEME_PRESETS[0]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    loadTheme();
  }, []);

  const loadTheme = async () => {
    try {
      const stored = await AsyncStorage.getItem(STORAGE_KEY);
      if (stored) {
        setColors(JSON.parse(stored));
      }
    } catch (error) {
      console.log('Error loading theme:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const setTheme = async (newColors: ThemeColors) => {
    try {
      setColors(newColors);
      await AsyncStorage.setItem(STORAGE_KEY, JSON.stringify(newColors));
    } catch (error) {
      console.log('Error saving theme:', error);
    }
  };

  const setCustomColor = (hue: number) => {
    const primary = `hsl(${hue}, 85%, 55%)`;
    const secondary = `hsl(${hue}, 80%, 65%)`;
    const accent = `hsl(${hue}, 75%, 75%)`;
    setTheme({ primary, secondary, accent });
  };

  const setHexColor = (hex: string) => {
    setTheme({ ...colors, primary: hex, secondary: hex, accent: hex });
  };

  const setGradient = (gradient: GradientConfig) => {
    setTheme({ ...colors, gradient });
  };

  const setBackgroundImage = (imageUrl: string) => {
    setTheme({ ...colors, backgroundImage: imageUrl });
  };

  return {
    colors,
    setTheme,
    setCustomColor,
    setHexColor,
    setGradient,
    setBackgroundImage,
    isLoading,
  };
});
