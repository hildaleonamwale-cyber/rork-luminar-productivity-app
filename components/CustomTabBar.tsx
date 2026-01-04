import React from 'react';
import { View, TouchableOpacity, StyleSheet, Platform } from 'react-native';
import { Sparkles, CheckSquare, Target, Folder } from 'lucide-react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useTheme } from '@/contexts/ThemeContext';

interface CustomTabBarProps {
  state: any;
  descriptors: any;
  navigation: any;
}

export default function CustomTabBar({ state, descriptors, navigation }: CustomTabBarProps) {
  const insets = useSafeAreaInsets();
  const { colors: themeColors } = useTheme();

  const icons = {
    'index': Sparkles,
    'tasks': CheckSquare,
    'goals': Target,
    'projects': Folder,
  };

  return (
    <View style={styles.outerContainer}>
      <View style={[styles.container, { paddingBottom: Math.max(insets.bottom, 12), backgroundColor: '#FFFFFF' }]}>
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
            
            if (!Icon) return null;

            return (
              <TouchableOpacity
                key={route.key}
                onPress={onPress}
                style={styles.tab}
                activeOpacity={0.7}
              >
                <View style={[
                  styles.tabIconContainer,
                  isFocused && { backgroundColor: `${themeColors.primary}18` }
                ]}>
                  <Icon 
                    color={isFocused ? themeColors.primary : '#9CA3AF'} 
                    size={24}
                    strokeWidth={isFocused ? 2.5 : 2}
                    fill={isFocused ? `${themeColors.primary}25` : 'none'}
                  />
                </View>
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
    borderTopWidth: 1,
    borderTopColor: 'rgba(0, 0, 0, 0.04)',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: -2 },
    shadowOpacity: 0.06,
    shadowRadius: 12,
    elevation: 8,
    ...Platform.select({
      web: {
        boxShadow: '0 -2px 16px rgba(0, 0, 0, 0.04)',
      },
    }),
  },
  tabBar: {
    flexDirection: 'row',
    height: 60,
    alignItems: 'center',
    justifyContent: 'space-around',
    paddingHorizontal: 24,
    paddingTop: 8,
  },
  tab: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    height: '100%',
  },
  tabIconContainer: {
    alignItems: 'center',
    justifyContent: 'center',
    width: 52,
    height: 52,
    borderRadius: 16,
    transition: 'all 0.2s ease',
  },
});
