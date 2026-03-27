import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet, Platform } from 'react-native';
import { CheckSquare, Target, FolderKanban, BookOpen, Wallet } from 'lucide-react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useTheme } from '@/contexts/ThemeContext';

interface CustomTabBarProps {
  state: any;
  descriptors: any;
  navigation: any;
}

export default function CustomTabBar({ state, descriptors: _descriptors, navigation }: CustomTabBarProps) {
  const insets = useSafeAreaInsets();
  const { colors: themeColors } = useTheme();

  const icons = {
    'tasks': CheckSquare,
    'goals': Target,
    'journal': BookOpen,
    'projects': FolderKanban,
    'money': Wallet,
  };

  const labels = {
    'tasks': 'Tasks',
    'goals': 'Goals',
    'journal': 'Journal',
    'projects': 'Projects',
    'money': 'Money',
  };

  return (
    <View style={styles.outerContainer}>
      <View style={[styles.container, { paddingBottom: Math.max(insets.bottom, 8) }]}>
        <View style={styles.tabBar}>
          {state.routes.map((route: any, index: number) => {
            const isFocused = state.index === index;

            const onPress = () => {
              const event = navigation.emit({
                type: 'tabPress',
                target: route.key,
                canPreventDefault: true,
              });

              if (!isFocused && !event.defaultPrevented) {
                navigation.navigate(route.name);
              }
            };

            const Icon = icons[route.name as keyof typeof icons];
            const label = labels[route.name as keyof typeof labels];

            return (
              <TouchableOpacity
                key={route.key}
                onPress={onPress}
                style={styles.tab}
                activeOpacity={0.7}
              >
                <View style={[
                  styles.tabIconContainer,
                  isFocused && { backgroundColor: `${themeColors.primary}15` }
                ]}>
                  <Icon 
                    color={isFocused ? themeColors.primary : '#9CA3AF'} 
                    size={24}
                    strokeWidth={2.2}
                    fill="none"
                  />
                </View>
                <Text style={[
                  styles.tabLabel,
                  isFocused && { color: themeColors.primary }
                ]}>
                  {label}
                </Text>
                {isFocused && (
                  <View style={[styles.activeIndicator, { backgroundColor: themeColors.primary }]} />
                )}
              </TouchableOpacity>
            );
          })}
        </View>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  outerContainer: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    backgroundColor: 'transparent',
  },
  container: {
    backgroundColor: '#FFFFFF',
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: -4 },
    shadowOpacity: 0.08,
    shadowRadius: 16,
    elevation: 8,
    ...Platform.select({
      web: {
        boxShadow: '0 -4px 24px rgba(0, 0, 0, 0.06)',
      },
    }),
  },
  tabBar: {
    flexDirection: 'row',
    height: 76,
    alignItems: 'center',
    justifyContent: 'space-around',
    paddingHorizontal: 8,
    paddingTop: 8,
  },
  tab: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    height: '100%',
  },
  tabIconContainer: {
    width: 44,
    height: 44,
    borderRadius: 14,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 4,
  },
  tabLabel: {
    fontSize: 11,
    fontWeight: '600',
    color: '#9CA3AF',
    marginTop: 2,
  },
  activeIndicator: {
    width: 4,
    height: 4,
    borderRadius: 2,
    marginTop: 4,
  },
});
