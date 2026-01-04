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
  { primary: '#DEA193', secondary: '#E8B5A8', accent: '#F7D4C9' },
  { primary: '#C7A9D4', secondary: '#D6BFDF', accent: '#E8D8ED' },
  { primary: '#B8D4A8', secondary: '#C9DFB9', accent: '#DDEBD0' },
  { primary: '#A8C9D4', secondary: '#B9D7DF', accent: '#D0E6ED' },
  { primary: '#F5C99B', secondary: '#F7D7B5', accent: '#FCE8D4' },
  { primary: '#E8A5A0', secondary: '#EEB9B5', accent: '#F5D3D0' },
  { primary: '#B8A5D4', secondary: '#C9B9DF', accent: '#DDD3ED' },
  { primary: '#A5D4C7', secondary: '#B9DFCE', accent: '#D0EDDD' },
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
