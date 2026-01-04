import React from 'react';
import { TouchableOpacity, Text, StyleSheet, ViewStyle } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import Colors from '@/constants/colors';
import { useTheme } from '@/contexts/ThemeContext';

interface GradientButtonProps {
  title: string;
  onPress: () => void;
  style?: ViewStyle;
  disabled?: boolean;
}

export default function GradientButton({ title, onPress, style, disabled }: GradientButtonProps) {
  const { colors: themeColors } = useTheme();

  return (
    <TouchableOpacity 
      onPress={onPress} 
      disabled={disabled}
      style={[styles.button, style]}
      activeOpacity={0.8}
    >
      <LinearGradient
        colors={[themeColors.primary, themeColors.secondary]}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 1 }}
        style={[styles.gradient, disabled && styles.gradientDisabled]}
      >
        <Text style={styles.text}>{title}</Text>
      </LinearGradient>
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  button: {
    borderRadius: 16,
    overflow: 'hidden',
    shadowColor: Colors.shadowColor,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.15,
    shadowRadius: 8,
    elevation: 3,
  },
  gradient: {
    paddingVertical: 16,
    paddingHorizontal: 32,
    alignItems: 'center',
    justifyContent: 'center',
  },
  gradientDisabled: {
    opacity: 0.5,
  },
  text: {
    color: Colors.white,
    fontSize: 16,
    fontWeight: '700',
    letterSpacing: 0.3,
  },
});
