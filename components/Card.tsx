import React from 'react';
import { View, StyleSheet, ViewStyle } from 'react-native';
import Colors from '@/constants/colors';
import { useTheme } from '@/contexts/ThemeContext';

interface CardProps {
  children: React.ReactNode;
  style?: ViewStyle;
  tinted?: boolean;
}

export default function Card({ children, style, tinted = false }: CardProps) {
  const { colors: themeColors } = useTheme();

  const hexToRgb = (hex: string) => {
    const result = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hex);
    return result ? {
      r: parseInt(result[1], 16),
      g: parseInt(result[2], 16),
      b: parseInt(result[3], 16)
    } : { r: 218, g: 147, b: 129 };
  };

  const rgb = hexToRgb(themeColors.primary);
  const tintedBackground = `rgba(${rgb.r}, ${rgb.g}, ${rgb.b}, 0.03)`;

  return (
    <View style={[
      styles.card, 
      tinted && { backgroundColor: tintedBackground },
      style
    ]}>
      {children}
    </View>
  );
}

const styles = StyleSheet.create({
  card: {
    backgroundColor: Colors.white,
    borderRadius: 16,
    padding: 20,
    shadowColor: Colors.shadowColor,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.04,
    shadowRadius: 8,
    elevation: 2,
  },
});
