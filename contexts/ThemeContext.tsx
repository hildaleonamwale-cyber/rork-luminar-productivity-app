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
  { primary: '#dea193', secondary: '#e8b5aa', accent: '#f5c7be' },
  { primary: '#a8c5e8', secondary: '#c2d9f0', accent: '#dce8f7' },
  { primary: '#98d8a8', secondary: '#b4e4be', accent: '#d0f0d7' },
  { primary: '#f5c089', secondary: '#f8d4a7', accent: '#fbe4c4' },
  { primary: '#c998d8', secondary: '#dab4e4', accent: '#e8d0f0' },
  { primary: '#f7a3a3', secondary: '#fac0c0', accent: '#fcd9d9' },
  { primary: '#89d4f5', secondary: '#a7e0f8', accent: '#c4ebfb' },
  { primary: '#d8c498', secondary: '#e4d4b4', accent: '#f0e4d0' },
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
