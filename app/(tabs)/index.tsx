import React, { useMemo } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Dimensions,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { 
  Target, 
  TrendingUp,
  CheckCircle2,
  ListTodo,
  Calendar,
  Sparkles,
  BookOpen,
  ChevronRight,
} from 'lucide-react-native';
import { useRouter } from 'expo-router';
import { useTheme } from '@/contexts/ThemeContext';
import { useStandaloneTasks, useUpcomingTasks } from '@/contexts/TasksContext';
import { useActiveGoals } from '@/contexts/GoalsContext';
import { useActiveProjects } from '@/contexts/ProjectsContext';
import { useActiveEntries } from '@/contexts/JournalContext';
import { useOnboarding } from '@/contexts/OnboardingContext';
import Colors from '@/constants/colors';
import DonutChart from '@/components/DonutChart';

const { width } = Dimensions.get('window');

export default function HomeScreen() {
  const router = useRouter();
  const { colors: themeColors } = useTheme();
  const { userName } = useOnboarding();

  const getGreeting = () => {
    const hour = new Date().getHours();
    if (hour < 12) return 'Good morning';
    if (hour < 18) return 'Good afternoon';
    return 'Good evening';
  };

  const tasks = useStandaloneTasks();
  const goals = useActiveGoals();
  const projects = useActiveProjects();
  const journalEntries = useActiveEntries();
  const upcomingTasks = useUpcomingTasks(5);

  const today = new Date().toISOString().split('T')[0];
  const todayTasks = tasks.filter(task => task.date === today);
  const completedToday = todayTasks.filter(task => task.completed).length;
  const totalToday = todayTasks.length;
  const completionPercentage = totalToday > 0 ? (completedToday / totalToday) * 100 : 0;

  const weeklyProgress = useMemo(() => {
    const last7Days = Array.from({ length: 7 }, (_, i) => {
      const date = new Date();
      date.setDate(date.getDate() - (6 - i));
      return date.toISOString().split('T')[0];
    });

    return last7Days.map(date => {
      const dayTasks = tasks.filter(t => t.date === date);
      const completed = dayTasks.filter(t => t.completed).length;
      return dayTasks.length > 0 ? Math.round((completed / dayTasks.length) * 100) : 0;
    });
  }, [tasks]);

  const stats = [
    { label: 'Active Tasks', value: tasks.filter(t => !t.completed && !t.deleted).length, icon: ListTodo, color: themeColors.primary },
    { label: 'Goals', value: goals.length, icon: Target, color: themeColors.primary },
    { label: 'Projects', value: projects.length, icon: TrendingUp, color: themeColors.primary },
    { label: 'Journal Entries', value: journalEntries.length, icon: BookOpen, color: themeColors.primary },
  ];

  return (
    <View style={styles.container}>
      <SafeAreaView edges={['top']} style={styles.safeArea}>
        <View style={styles.header}>
          <View>
            <Text style={styles.headerSubtitle}>{getGreeting()}</Text>
            <Text style={styles.headerTitle}>{userName || 'User'}</Text>
          </View>
          <TouchableOpacity 
            style={[styles.settingsButton, { backgroundColor: `${themeColors.primary}15` }]}
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
        {/* Today's Progress Card */}
        <View style={styles.progressCard}>
          <View style={styles.progressHeader}>
            <View style={[styles.progressIconContainer, { backgroundColor: `${themeColors.primary}15` }]}>
              <Calendar color={themeColors.primary} size={22} strokeWidth={2.5} />
            </View>
            <View style={styles.progressHeaderText}>
              <Text style={styles.progressTitle}>Today&apos;s Progress</Text>
              <Text style={styles.progressSubtitle}>
                {completedToday} of {totalToday} tasks completed
              </Text>
            </View>
          </View>

          <View style={styles.progressContent}>
            <DonutChart 
              percentage={completionPercentage}
              size={120}
              strokeWidth={14}
              color={themeColors.primary}
            />
            <View style={styles.progressStats}>
              <View style={styles.progressStat}>
                <View style={[styles.progressDot, { backgroundColor: themeColors.primary }]} />
                <Text style={styles.progressStatValue}>{completedToday}</Text>
                <Text style={styles.progressStatLabel}>Done</Text>
              </View>
              <View style={styles.progressStat}>
                <View style={[styles.progressDot, { backgroundColor: '#E5E7EB' }]} />
                <Text style={styles.progressStatValue}>{totalToday - completedToday}</Text>
                <Text style={styles.progressStatLabel}>Left</Text>
              </View>
            </View>
          </View>

          {/* Weekly Mini Chart */}
          <View style={styles.weeklyChart}>
            {weeklyProgress.map((value, index) => (
              <View key={index} style={styles.chartBarContainer}>
                <View 
                  style={[
                    styles.chartBar, 
                    { 
                      height: `${Math.max(value, 8)}%`,
                      backgroundColor: value > 0 ? themeColors.primary : '#E5E7EB',
                      opacity: value > 0 ? 0.3 + (value / 100) * 0.7 : 1,
                    },
                  ]} 
                />
              </View>
            ))}
          </View>
        </View>

        {/* Quick Stats Grid */}
        <View style={styles.statsGrid}>
          {stats.map((stat, index) => (
            <TouchableOpacity 
              key={index} 
              style={styles.statCard}
              activeOpacity={0.7}
            >
              <View style={[styles.statIconContainer, { backgroundColor: `${themeColors.primary}12` }]}>
                <stat.icon color={themeColors.primary} size={20} strokeWidth={2.5} />
              </View>
              <Text style={styles.statValue}>{stat.value}</Text>
              <Text style={styles.statLabel}>{stat.label}</Text>
            </TouchableOpacity>
          ))}
        </View>

        {/* Upcoming Tasks */}
        <View style={styles.section}>
          <View style={styles.sectionHeader}>
            <Text style={styles.sectionTitle}>Upcoming Tasks</Text>
            <TouchableOpacity onPress={() => router.push('/tasks')}>
              <Text style={[styles.seeAll, { color: themeColors.primary }]}>See All</Text>
            </TouchableOpacity>
          </View>

          {upcomingTasks.length > 0 ? (
            <View style={styles.tasksList}>
              {upcomingTasks.slice(0, 4).map((task) => {
                const taskDate = new Date(task.date);
                const isToday = task.date === new Date().toISOString().split('T')[0];
                const tomorrow = new Date();
                tomorrow.setDate(tomorrow.getDate() + 1);
                const isTomorrow = task.date === tomorrow.toISOString().split('T')[0];
                
                let dateLabel = taskDate.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
                if (isToday) dateLabel = 'Today';
                if (isTomorrow) dateLabel = 'Tomorrow';

                return (
                  <View key={task.id} style={styles.taskItem}>
                    <View style={[
                      styles.taskCheckbox,
                      task.completed && { backgroundColor: themeColors.primary, borderColor: themeColors.primary },
                    ]}>
                      {task.completed && <CheckCircle2 color={Colors.white} size={14} strokeWidth={3} />}
                    </View>
                    <View style={styles.taskContent}>
                      <Text style={[styles.taskTitle, task.completed && styles.taskTitleCompleted]}>
                        {task.title}
                      </Text>
                      <Text style={styles.taskMeta}>
                        {dateLabel} {task.time && `• ${task.time}`}
                      </Text>
                    </View>
                    <ChevronRight color="#D1D5DB" size={18} strokeWidth={2.5} />
                  </View>
                );
              })}
            </View>
          ) : (
            <View style={styles.emptyState}>
              <Text style={styles.emptyText}>No upcoming tasks</Text>
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
    backgroundColor: Colors.background,
  },
  safeArea: {
    backgroundColor: Colors.background,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingVertical: 16,
  },
  headerSubtitle: {
    fontSize: 15,
    fontWeight: '500',
    color: Colors.textSecondary,
    marginBottom: 4,
  },
  headerTitle: {
    fontSize: 32,
    fontWeight: '700',
    color: Colors.text,
  },
  settingsButton: {
    width: 48,
    height: 48,
    borderRadius: 14,
    alignItems: 'center',
    justifyContent: 'center',
  },
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    paddingBottom: 140,
  },
  progressCard: {
    backgroundColor: Colors.white,
    marginHorizontal: 20,
    marginTop: 8,
    borderRadius: 24,
    padding: 20,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.06,
    shadowRadius: 12,
    elevation: 3,
  },
  progressHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 20,
  },
  progressIconContainer: {
    width: 44,
    height: 44,
    borderRadius: 14,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 14,
  },
  progressHeaderText: {
    flex: 1,
  },
  progressTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: Colors.text,
    marginBottom: 4,
  },
  progressSubtitle: {
    fontSize: 14,
    fontWeight: '500',
    color: Colors.textSecondary,
  },
  progressContent: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 20,
  },
  progressStats: {
    marginLeft: 24,
    gap: 16,
  },
  progressStat: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
  },
  progressDot: {
    width: 10,
    height: 10,
    borderRadius: 5,
  },
  progressStatValue: {
    fontSize: 18,
    fontWeight: '700',
    color: Colors.text,
    minWidth: 24,
  },
  progressStatLabel: {
    fontSize: 14,
    fontWeight: '500',
    color: Colors.textSecondary,
  },
  weeklyChart: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-end',
    height: 40,
    paddingHorizontal: 8,
  },
  chartBarContainer: {
    flex: 1,
    height: '100%',
    justifyContent: 'flex-end',
    alignItems: 'center',
    marginHorizontal: 3,
  },
  chartBar: {
    width: '60%',
    borderRadius: 4,
    minHeight: 4,
  },
  statsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    paddingHorizontal: 20,
    marginTop: 16,
    gap: 12,
  },
  statCard: {
    width: (width - 52) / 2,
    backgroundColor: Colors.white,
    borderRadius: 20,
    padding: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 8,
    elevation: 2,
  },
  statIconContainer: {
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
  },
  statLabel: {
    fontSize: 13,
    fontWeight: '500',
    color: Colors.textSecondary,
  },
  section: {
    marginTop: 24,
    paddingHorizontal: 20,
  },
  sectionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: Colors.text,
  },
  seeAll: {
    fontSize: 14,
    fontWeight: '600',
  },
  tasksList: {
    backgroundColor: Colors.white,
    borderRadius: 20,
    overflow: 'hidden',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 8,
    elevation: 2,
  },
  taskItem: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#F5F5F5',
  },
  taskCheckbox: {
    width: 24,
    height: 24,
    borderRadius: 8,
    borderWidth: 2,
    borderColor: '#E5E7EB',
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 14,
  },
  taskContent: {
    flex: 1,
  },
  taskTitle: {
    fontSize: 15,
    fontWeight: '600',
    color: Colors.text,
    marginBottom: 4,
  },
  taskTitleCompleted: {
    textDecorationLine: 'line-through',
    opacity: 0.5,
  },
  taskMeta: {
    fontSize: 13,
    fontWeight: '500',
    color: Colors.textSecondary,
  },
  emptyState: {
    backgroundColor: Colors.white,
    borderRadius: 20,
    padding: 32,
    alignItems: 'center',
  },
  emptyText: {
    fontSize: 15,
    fontWeight: '500',
    color: Colors.textSecondary,
  },
});
