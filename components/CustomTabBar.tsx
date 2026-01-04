import React from 'react';
import { View, TouchableOpacity, StyleSheet, Platform } from 'react-native';
import { Home, CheckSquare, FolderKanban, Timer, LayoutDashboard } from 'lucide-react-native';
import { LinearGradient } from 'expo-linear-gradient';
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
    'index': Home,
    'tasks': CheckSquare,
    'goals': LayoutDashboard,
    'projects': FolderKanban,
    'pomodoro': Timer,
  };

  return (
    <View style={styles.outerContainer}>
      <View style={[styles.container, { paddingBottom: Math.max(insets.bottom, 8) }]}>
        <View style={styles.tabBar}>
          {state.routes.map((route: any, index: number) => {
            const isFocused = state.index === index;
            const isMiddle = index === 2;

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

            if (isMiddle) {
              return (
                <View key={route.key} style={styles.middleButtonContainer}>
                  <TouchableOpacity
                    onPress={onPress}
                    style={styles.middleButton}
                    activeOpacity={0.85}
                  >
                    <LinearGradient
                      colors={[themeColors.primary, themeColors.secondary]}
                      start={{ x: 0, y: 0 }}
                      end={{ x: 1, y: 1 }}
                      style={styles.gradient}
                    >
                      <View style={styles.iconGlow}>
                        <Icon color="#FFFFFF" size={32} strokeWidth={2.8} fill="none" />
                      </View>
                    </LinearGradient>
                    <View style={styles.middleButtonRing} />
                  </TouchableOpacity>
                </View>
              );
            }

            return (
              <TouchableOpacity
                key={route.key}
                onPress={onPress}
                style={styles.tab}
                activeOpacity={0.6}
              >
                <View style={[
                  styles.tabIconContainer,
                  isFocused && { backgroundColor: `${themeColors.primary}14` }
                ]}>
                  <Icon 
                    color={isFocused ? themeColors.primary : '#667085'} 
                    size={26}
                    strokeWidth={2.5}
                    fill="none"
                  />
                  {isFocused && <View style={[styles.activeDot, { backgroundColor: themeColors.primary }]} />}
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
    borderTopLeftRadius: 28,
    borderTopRightRadius: 28,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: -8 },
    shadowOpacity: 0.12,
    shadowRadius: 24,
    elevation: 12,
    ...Platform.select({
      web: {
        boxShadow: '0 -8px 32px rgba(0, 0, 0, 0.08)',
      },
    }),
  },
  tabBar: {
    flexDirection: 'row',
    height: 72,
    alignItems: 'center',
    justifyContent: 'space-around',
    paddingHorizontal: 16,
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
    paddingVertical: 8,
    paddingHorizontal: 16,
    borderRadius: 16,
    position: 'relative',
  },
  tabIconContainerActive: {
    backgroundColor: 'rgba(255, 77, 12, 0.08)',
  },
  activeDot: {
    width: 4,
    height: 4,
    borderRadius: 2,
    backgroundColor: '#FF4D0C',
    marginTop: 6,
  },
  middleButtonContainer: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: -40,
  },
  middleButton: {
    width: 68,
    height: 68,
    borderRadius: 34,
    position: 'relative',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.4,
    shadowRadius: 20,
    elevation: 12,
    ...Platform.select({
      web: {
        boxShadow: '0 8px 32px rgba(255, 77, 12, 0.35)',
      },
    }),
  },
  gradient: {
    width: '100%',
    height: '100%',
    borderRadius: 34,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 4,
    borderColor: '#FFFFFF',
  },
  middleButtonRing: {
    position: 'absolute',
    top: -6,
    left: -6,
    right: -6,
    bottom: -6,
    borderRadius: 40,
    borderWidth: 2,
    borderColor: 'rgba(255, 77, 12, 0.15)',
  },
  iconGlow: {
    alignItems: 'center',
    justifyContent: 'center',
    width: 40,
    height: 40,
  },
});
