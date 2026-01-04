import React, { useMemo, useRef } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Dimensions,
  Animated,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { 
  Sparkles,
  Target,
  TrendingUp,
  CheckCircle2,
  Circle,
  ListTodo,
  Calendar,
  Clock,
  ArrowRight,
} from 'lucide-react-native';

import DonutChart from '@/components/DonutChart';
import Colors from '@/constants/colors';
import { useTheme } from '@/contexts/ThemeContext';
import { useStandaloneTasks, useUpcomingTasks } from '@/contexts/TasksContext';
import { useActiveGoals } from '@/contexts/GoalsContext';
import { useActiveProjects } from '@/contexts/ProjectsContext';
import { useRouter } from 'expo-router';
import { useOnboarding } from '@/contexts/OnboardingContext';
import { useQuote } from '@/contexts/QuoteContext';

const { width } = Dimensions.get('window');
const CARD_WIDTH = width - 60;
const CARD_SPACING = 16;

export default function DashboardScreen() {
  const router = useRouter();
  const { colors: themeColors } = useTheme();
  const scrollX = useRef(new Animated.Value(0)).current;

  const { userName } = useOnboarding();
  const { quote } = useQuote();

  const getGreeting = () => {
    const hour = new Date().getHours();
    if (hour < 12) return 'Good Morning';
    if (hour < 18) return 'Good Afternoon';
    return 'Good Evening';
  };

  const tasks = useStandaloneTasks();
  const goals = useActiveGoals();
  const projects = useActiveProjects();
  const upcomingTasks = useUpcomingTasks(5);

  const today = new Date().toISOString().split('T')[0];
  const todayTasks = tasks.filter(task => task.date === today);
  const completedToday = todayTasks.filter(task => task.completed).length;
  const totalToday = todayTasks.length;
  const completionPercentage = totalToday > 0 ? (completedToday / totalToday) * 100 : 0;

  const stats = useMemo(() => {
    const allTasks = tasks.filter(t => !t.deleted);
    const completedTasks = allTasks.filter(t => t.completed).length;
    const activeTasksCount = allTasks.filter(t => !t.completed).length;

    return {
      completedTasks,
      activeTasksCount,
      goalsActive: goals.length,
      projectsActive: projects.length,
    };
  }, [tasks, goals, projects]);

  const carouselCards = [
    {
      id: 'progress',
      title: "Today's Progress",
      subtitle: `${completedToday} of ${totalToday} tasks completed`,
      color: themeColors.primary,
    },
    {
      id: 'goals',
      title: 'Active Goals',
      subtitle: `${stats.goalsActive} goals in progress`,
      color: '#C7A9D4',
    },
    {
      id: 'projects',
      title: 'Projects',
      subtitle: `${stats.projectsActive} active projects`,
      color: '#B8D4A8',
    },
  ];

  return (
    <View style={[styles.container, { backgroundColor: Colors.background }]}>
      <SafeAreaView edges={['top']} style={{ backgroundColor: themeColors.primary }}>
        <View style={[styles.header, { backgroundColor: themeColors.primary }]}>
          <View>
            <Text style={styles.greeting}>{getGreeting()}</Text>
            <Text style={styles.userName}>{userName || 'User'}</Text>
          </View>
          <TouchableOpacity 
            style={styles.settingsButton}
            onPress={() => router.push('/settings')}
          >
            <Sparkles color={themeColors.primary} size={22} strokeWidth={2.5} />
          </TouchableOpacity>
        </View>
      </SafeAreaView>

      <ScrollView 
        style={styles.scrollView}
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        <View style={styles.quoteSection}>
          <View style={styles.quoteCard}>
            <Sparkles color={themeColors.primary} size={20} strokeWidth={2.5} />
            <Text style={[styles.quoteText, { color: themeColors.primary }]}>
              {quote}
            </Text>
          </View>
        </View>

        <View style={styles.statsGrid}>
          <View style={[styles.statCard, { borderColor: Colors.border }]}>
            <View style={[styles.statIcon, { backgroundColor: `${themeColors.primary}15` }]}>
              <CheckCircle2 color={themeColors.primary} size={20} strokeWidth={2.5} />
            </View>
            <Text style={styles.statValue}>{stats.completedTasks}</Text>
            <Text style={styles.statLabel}>Completed</Text>
          </View>

          <View style={[styles.statCard, { borderColor: Colors.border }]}>
            <View style={[styles.statIcon, { backgroundColor: '#C7A9D415' }]}>
              <Circle color="#C7A9D4" size={20} strokeWidth={2.5} />
            </View>
            <Text style={styles.statValue}>{stats.activeTasksCount}</Text>
            <Text style={styles.statLabel}>Active</Text>
          </View>

          <View style={[styles.statCard, { borderColor: Colors.border }]}>
            <View style={[styles.statIcon, { backgroundColor: '#B8D4A815' }]}>
              <Target color="#B8D4A8" size={20} strokeWidth={2.5} />
            </View>
            <Text style={styles.statValue}>{stats.goalsActive}</Text>
            <Text style={styles.statLabel}>Goals</Text>
          </View>
        </View>

        <View style={styles.carouselSection}>
          <Text style={styles.sectionTitle}>Overview</Text>
          <ScrollView
            horizontal
            pagingEnabled={false}
            decelerationRate="fast"
            snapToInterval={CARD_WIDTH + CARD_SPACING}
            snapToAlignment="start"
            showsHorizontalScrollIndicator={false}
            contentContainerStyle={styles.carouselContent}
            onScroll={Animated.event(
              [{ nativeEvent: { contentOffset: { x: scrollX } } }],
              { useNativeDriver: false }
            )}
            scrollEventThrottle={16}
          >
            {carouselCards.map((card, index) => (
              <View
                key={card.id}
                style={[
                  styles.carouselCard,
                  { backgroundColor: Colors.white, borderColor: Colors.border }
                ]}
              >
                <View style={[styles.carouselCardIcon, { backgroundColor: `${card.color}15` }]}>
                  {card.id === 'progress' && <TrendingUp color={card.color} size={28} strokeWidth={2.5} />}
                  {card.id === 'goals' && <Target color={card.color} size={28} strokeWidth={2.5} />}
                  {card.id === 'projects' && <ListTodo color={card.color} size={28} strokeWidth={2.5} />}
                </View>
                <Text style={styles.carouselCardTitle}>{card.title}</Text>
                <Text style={styles.carouselCardSubtitle}>{card.subtitle}</Text>
                
                {card.id === 'progress' && (
                  <View style={styles.progressContainer}>
                    <DonutChart 
                      percentage={completionPercentage}
                      size={140}
                      strokeWidth={14}
                      color={themeColors.primary}
                    />
                  </View>
                )}
                
                {card.id === 'goals' && (
                  <View style={styles.cardStats}>
                    <View style={styles.cardStatItem}>
                      <Text style={[styles.cardStatValue, { color: card.color }]}>{stats.goalsActive}</Text>
                      <Text style={styles.cardStatLabel}>In Progress</Text>
                    </View>
                  </View>
                )}
                
                {card.id === 'projects' && (
                  <View style={styles.cardStats}>
                    <View style={styles.cardStatItem}>
                      <Text style={[styles.cardStatValue, { color: card.color }]}>{stats.projectsActive}</Text>
                      <Text style={styles.cardStatLabel}>Active</Text>
                    </View>
                  </View>
                )}
              </View>
            ))}
          </ScrollView>
          
          <View style={styles.carouselDots}>
            {carouselCards.map((_, index) => {
              const inputRange = [
                (index - 1) * (CARD_WIDTH + CARD_SPACING),
                index * (CARD_WIDTH + CARD_SPACING),
                (index + 1) * (CARD_WIDTH + CARD_SPACING),
              ];

              const dotWidth = scrollX.interpolate({
                inputRange,
                outputRange: [8, 24, 8],
                extrapolate: 'clamp',
              });

              const opacity = scrollX.interpolate({
                inputRange,
                outputRange: [0.3, 1, 0.3],
                extrapolate: 'clamp',
              });

              return (
                <Animated.View
                  key={index}
                  style={[
                    styles.dot,
                    {
                      width: dotWidth,
                      opacity,
                      backgroundColor: themeColors.primary,
                    },
                  ]}
                />
              );
            })}
          </View>
        </View>

        <View style={styles.upcomingSection}>
          <View style={styles.sectionHeader}>
            <Text style={styles.sectionTitle}>Upcoming Tasks</Text>
            <TouchableOpacity onPress={() => router.push('/(tabs)/tasks')}>
              <ArrowRight color={themeColors.primary} size={22} strokeWidth={2.5} />
            </TouchableOpacity>
          </View>

          {upcomingTasks.length > 0 ? (
            <View style={styles.tasksList}>
              {upcomingTasks.slice(0, 4).map((task) => {
                const taskDate = new Date(task.date);
                const isToday = task.date === today;
                const tomorrow = new Date();
                tomorrow.setDate(tomorrow.getDate() + 1);
                const isTomorrow = task.date === tomorrow.toISOString().split('T')[0];
                
                let dateLabel = taskDate.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
                if (isToday) dateLabel = 'Today';
                if (isTomorrow) dateLabel = 'Tomorrow';

                return (
                  <View key={task.id} style={[styles.taskCard, { borderColor: Colors.border }]}>
                    <View style={[
                      styles.taskStatus,
                      { backgroundColor: task.completed ? '#B8D4A8' : themeColors.primary }
                    ]} />
                    <View style={styles.taskContent}>
                      <Text style={styles.taskTitle}>{task.title}</Text>
                      <View style={styles.taskMeta}>
                        <Calendar color={Colors.textSecondary} size={14} strokeWidth={2} />
                        <Text style={styles.taskMetaText}>{dateLabel}</Text>
                        {task.time && (
                          <>
                            <View style={styles.taskMetaDot} />
                            <Clock color={Colors.textSecondary} size={14} strokeWidth={2} />
                            <Text style={styles.taskMetaText}>{task.time}</Text>
                          </>
                        )}
                      </View>
                    </View>
                  </View>
                );
              })}
            </View>
          ) : (
            <View style={styles.emptyState}>
              <Text style={styles.emptyStateText}>No upcoming tasks</Text>
            </View>
          )}
        </View>
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 24,
    paddingVertical: 20,
  },
  greeting: {
    fontSize: 14,
    fontWeight: '600',
    color: 'rgba(255, 255, 255, 0.85)',
    letterSpacing: 0.3,
    marginBottom: 4,
  },
  userName: {
    fontSize: 28,
    fontWeight: '700',
    color: Colors.white,
    letterSpacing: -0.5,
  },
  settingsButton: {
    width: 48,
    height: 48,
    borderRadius: 16,
    backgroundColor: Colors.white,
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 3,
  },
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    paddingBottom: 100,
  },
  quoteSection: {
    paddingHorizontal: 24,
    paddingTop: 24,
  },
  quoteCard: {
    backgroundColor: Colors.white,
    borderRadius: 20,
    padding: 24,
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: 12,
    shadowColor: Colors.shadowColor,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.08,
    shadowRadius: 12,
    elevation: 2,
    borderWidth: 1,
    borderColor: Colors.border,
  },
  quoteText: {
    flex: 1,
    fontSize: 16,
    fontWeight: '600',
    lineHeight: 24,
    letterSpacing: 0.2,
  },
  statsGrid: {
    flexDirection: 'row',
    paddingHorizontal: 24,
    paddingTop: 20,
    gap: 12,
  },
  statCard: {
    flex: 1,
    backgroundColor: Colors.white,
    borderRadius: 16,
    padding: 16,
    alignItems: 'center',
    borderWidth: 1,
    shadowColor: Colors.shadowColor,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.06,
    shadowRadius: 8,
    elevation: 2,
  },
  statIcon: {
    width: 40,
    height: 40,
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 12,
  },
  statValue: {
    fontSize: 24,
    fontWeight: '700',
    color: Colors.text,
    marginBottom: 4,
    letterSpacing: -0.5,
  },
  statLabel: {
    fontSize: 12,
    fontWeight: '600',
    color: Colors.textSecondary,
  },
  carouselSection: {
    paddingTop: 32,
  },
  sectionTitle: {
    fontSize: 20,
    fontWeight: '700',
    color: Colors.text,
    paddingHorizontal: 24,
    marginBottom: 16,
    letterSpacing: -0.3,
  },
  carouselContent: {
    paddingHorizontal: 24,
    gap: CARD_SPACING,
  },
  carouselCard: {
    width: CARD_WIDTH,
    backgroundColor: Colors.white,
    borderRadius: 24,
    padding: 28,
    borderWidth: 1,
    shadowColor: Colors.shadowColor,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.08,
    shadowRadius: 16,
    elevation: 3,
  },
  carouselCardIcon: {
    width: 56,
    height: 56,
    borderRadius: 16,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 20,
  },
  carouselCardTitle: {
    fontSize: 22,
    fontWeight: '700',
    color: Colors.text,
    marginBottom: 6,
    letterSpacing: -0.3,
  },
  carouselCardSubtitle: {
    fontSize: 14,
    color: Colors.textSecondary,
    fontWeight: '500',
    marginBottom: 24,
  },
  progressContainer: {
    alignItems: 'center',
    paddingVertical: 16,
  },
  cardStats: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    paddingTop: 16,
  },
  cardStatItem: {
    alignItems: 'center',
  },
  cardStatValue: {
    fontSize: 32,
    fontWeight: '700',
    marginBottom: 4,
    letterSpacing: -0.5,
  },
  cardStatLabel: {
    fontSize: 13,
    color: Colors.textSecondary,
    fontWeight: '600',
  },
  carouselDots: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    gap: 8,
    marginTop: 20,
  },
  dot: {
    height: 8,
    borderRadius: 4,
  },
  upcomingSection: {
    paddingTop: 32,
    paddingHorizontal: 24,
  },
  sectionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
  },
  tasksList: {
    gap: 12,
  },
  taskCard: {
    backgroundColor: Colors.white,
    borderRadius: 16,
    padding: 16,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 14,
    borderWidth: 1,
    shadowColor: Colors.shadowColor,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.06,
    shadowRadius: 8,
    elevation: 2,
  },
  taskStatus: {
    width: 4,
    height: 44,
    borderRadius: 2,
  },
  taskContent: {
    flex: 1,
  },
  taskTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: Colors.text,
    marginBottom: 6,
    letterSpacing: 0.1,
  },
  taskMeta: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  taskMetaText: {
    fontSize: 13,
    color: Colors.textSecondary,
    fontWeight: '500',
  },
  taskMetaDot: {
    width: 3,
    height: 3,
    borderRadius: 1.5,
    backgroundColor: Colors.textSecondary,
    opacity: 0.5,
  },
  emptyState: {
    paddingVertical: 40,
    alignItems: 'center',
  },
  emptyStateText: {
    fontSize: 15,
    color: Colors.textSecondary,
    fontWeight: '500',
  },
});
