import React, { useMemo } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { 
  Target,
  CheckCircle2,
  Circle,
  FolderKanban,
  ArrowRight,
  BookOpen,
  Settings,
} from 'lucide-react-native';

import DonutChart from '@/components/DonutChart';
import Colors from '@/constants/colors';
import { useTheme } from '@/contexts/ThemeContext';
import { useStandaloneTasks, useUpcomingTasks } from '@/contexts/TasksContext';
import { useActiveGoals } from '@/contexts/GoalsContext';
import { useActiveProjects } from '@/contexts/ProjectsContext';
import { useRouter } from 'expo-router';
import { useOnboarding } from '@/contexts/OnboardingContext';



export default function DashboardScreen() {
  const router = useRouter();
  const { colors: themeColors } = useTheme();

  const { userName } = useOnboarding();

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



  return (
    <View style={[styles.container, { backgroundColor: Colors.background }]}>
      <SafeAreaView edges={['top']} style={{ backgroundColor: Colors.background }}>
        <View style={styles.header}>
          <View style={styles.headerLeft}>
            <TouchableOpacity 
              style={styles.menuButton}
              onPress={() => router.push('/settings')}
            >
              <Settings color={Colors.text} size={22} strokeWidth={2} />
            </TouchableOpacity>
          </View>
          <View>
            <Text style={styles.greeting}>{getGreeting()}</Text>
            <Text style={styles.userName}>{userName || 'there'}</Text>
          </View>
          <View style={styles.headerRight}>
            <TouchableOpacity 
              style={styles.journalButton}
              onPress={() => router.push('/journal')}
            >
              <BookOpen color={themeColors.primary} size={20} strokeWidth={2} />
            </TouchableOpacity>
          </View>
        </View>
      </SafeAreaView>

      <ScrollView 
        style={styles.scrollView}
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        <View style={styles.searchSection}>
          <View style={styles.searchBar}>
            <Text style={styles.searchPlaceholder}>Search</Text>
          </View>
        </View>

        <View style={styles.quickStatsSection}>
          <View style={styles.quickStatsRow}>
            <View style={styles.quickStatPill}>
              <CheckCircle2 color={themeColors.primary} size={16} strokeWidth={2} />
              <Text style={styles.quickStatText}>{stats.completedTasks} Completed</Text>
            </View>
            <View style={styles.quickStatPill}>
              <Circle color="#9CA3AF" size={16} strokeWidth={2} />
              <Text style={styles.quickStatText}>{stats.activeTasksCount} Active</Text>
            </View>
          </View>
        </View>

        <View style={styles.progressCard}>
          <View style={styles.progressHeader}>
            <Text style={styles.progressTitle}>Today&apos;s Progress</Text>
            <Text style={styles.progressSubtitle}>{completedToday}/{totalToday} tasks</Text>
          </View>
          <View style={styles.progressChartContainer}>
            <DonutChart 
              percentage={completionPercentage}
              size={100}
              strokeWidth={10}
              color={themeColors.primary}
            />
          </View>
        </View>

        <View style={styles.projectsSection}>
          <View style={styles.sectionHeader}>
            <Text style={styles.sectionTitle}>My Projects</Text>
            <TouchableOpacity onPress={() => router.push('/(tabs)/projects')}>
              <ArrowRight color={Colors.textTertiary} size={20} strokeWidth={2} />
            </TouchableOpacity>
          </View>
          <ScrollView
            horizontal
            showsHorizontalScrollIndicator={false}
            contentContainerStyle={styles.projectsScroll}
          >
            {projects.slice(0, 3).map((project) => (
              <TouchableOpacity
                key={project.id}
                style={[styles.projectCard, { backgroundColor: project.color + '15' }]}
                onPress={() => router.push(`/project/${project.id}`)}
              >
                <FolderKanban color={project.color} size={24} strokeWidth={2} />
                <Text style={styles.projectCardTitle} numberOfLines={1}>{project.title}</Text>
                <Text style={styles.projectCardSubtitle}>{project.tasks?.length || 0} tasks</Text>
              </TouchableOpacity>
            ))}
            {projects.length === 0 && (
              <View style={styles.emptyProjectCard}>
                <Text style={styles.emptyText}>No projects yet</Text>
              </View>
            )}
          </ScrollView>
        </View>

        <View style={styles.goalsSection}>
          <View style={styles.sectionHeader}>
            <Text style={styles.sectionTitle}>Active Goals</Text>
            <TouchableOpacity onPress={() => router.push('/(tabs)/goals')}>
              <ArrowRight color={Colors.textTertiary} size={20} strokeWidth={2} />
            </TouchableOpacity>
          </View>
          <View style={styles.goalsList}>
            {goals.slice(0, 3).map((goal) => (
              <TouchableOpacity
                key={goal.id}
                style={styles.goalCard}
                onPress={() => router.push(`/goal/${goal.id}`)}
              >
                <View style={[styles.goalIcon, { backgroundColor: goal.color + '15' }]}>
                  <Target color={goal.color} size={18} strokeWidth={2} />
                </View>
                <View style={styles.goalContent}>
                  <Text style={styles.goalTitle} numberOfLines={1}>{goal.title}</Text>
                  <Text style={styles.goalTarget}>{goal.targetValue || goal.targetDays} {goal.metric || 'days'}</Text>
                </View>
              </TouchableOpacity>
            ))}
            {goals.length === 0 && (
              <View style={styles.emptyCard}>
                <Text style={styles.emptyText}>No active goals</Text>
              </View>
            )}
          </View>
        </View>

        <View style={styles.upcomingSection}>
          <View style={styles.sectionHeader}>
            <Text style={styles.sectionTitle}>Upcoming</Text>
            <TouchableOpacity onPress={() => router.push('/(tabs)/tasks')}>
              <ArrowRight color={Colors.textTertiary} size={20} strokeWidth={2} />
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
                  <View key={task.id} style={styles.taskCard}>
                    <View style={[styles.taskColorBar, { backgroundColor: themeColors.primary }]} />
                    <View style={styles.taskContent}>
                      <Text style={styles.taskTitle} numberOfLines={1}>{task.title}</Text>
                      <View style={styles.taskMeta}>
                        <Text style={styles.taskMetaText}>{dateLabel}</Text>
                        {task.time && (
                          <>
                            <Text style={styles.taskMetaDot}>•</Text>
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
            <View style={styles.emptyCard}>
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
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingVertical: 16,
    paddingTop: 8,
  },
  headerLeft: {
    width: 40,
  },
  headerRight: {
    width: 40,
    alignItems: 'flex-end',
  },
  menuButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: Colors.white,
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: Colors.shadowColor,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.06,
    shadowRadius: 8,
    elevation: 2,
  },
  journalButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: Colors.white,
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: Colors.shadowColor,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.06,
    shadowRadius: 8,
    elevation: 2,
  },
  greeting: {
    fontSize: 14,
    fontWeight: '500',
    color: Colors.textSecondary,
    textAlign: 'center',
    marginBottom: 2,
  },
  userName: {
    fontSize: 24,
    fontWeight: '700',
    color: Colors.text,
    textAlign: 'center',
  },
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    paddingBottom: 100,
  },
  searchSection: {
    paddingHorizontal: 20,
    paddingTop: 16,
  },
  searchBar: {
    backgroundColor: Colors.white,
    borderRadius: 14,
    paddingHorizontal: 16,
    paddingVertical: 14,
    shadowColor: Colors.shadowColor,
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.04,
    shadowRadius: 4,
    elevation: 1,
  },
  searchPlaceholder: {
    fontSize: 15,
    color: Colors.textTertiary,
    fontWeight: '400',
  },
  quickStatsSection: {
    paddingHorizontal: 20,
    paddingTop: 16,
  },
  quickStatsRow: {
    flexDirection: 'row',
    gap: 10,
  },
  quickStatPill: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    backgroundColor: Colors.white,
    borderRadius: 12,
    paddingHorizontal: 14,
    paddingVertical: 12,
    shadowColor: Colors.shadowColor,
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.04,
    shadowRadius: 4,
    elevation: 1,
  },
  quickStatText: {
    fontSize: 13,
    color: Colors.text,
    fontWeight: '600',
  },
  progressCard: {
    marginHorizontal: 20,
    marginTop: 20,
    backgroundColor: Colors.white,
    borderRadius: 20,
    padding: 20,
    shadowColor: Colors.shadowColor,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.06,
    shadowRadius: 8,
    elevation: 2,
  },
  progressHeader: {
    marginBottom: 16,
  },
  progressTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: Colors.text,
    marginBottom: 4,
  },
  progressSubtitle: {
    fontSize: 14,
    color: Colors.textSecondary,
    fontWeight: '500',
  },
  progressChartContainer: {
    alignItems: 'center',
    paddingVertical: 8,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: Colors.text,
  },
  projectsSection: {
    marginTop: 24,
  },
  sectionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 20,
    marginBottom: 12,
  },
  projectsScroll: {
    paddingHorizontal: 20,
    gap: 12,
  },
  projectCard: {
    width: 140,
    backgroundColor: Colors.white,
    borderRadius: 16,
    padding: 16,
    gap: 10,
    shadowColor: Colors.shadowColor,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.04,
    shadowRadius: 6,
    elevation: 2,
  },
  projectCardTitle: {
    fontSize: 15,
    fontWeight: '600',
    color: Colors.text,
  },
  projectCardSubtitle: {
    fontSize: 12,
    color: Colors.textSecondary,
    fontWeight: '500',
  },
  emptyProjectCard: {
    width: 140,
    height: 100,
    backgroundColor: Colors.white,
    borderRadius: 16,
    padding: 16,
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: Colors.shadowColor,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.04,
    shadowRadius: 6,
    elevation: 2,
  },
  goalsSection: {
    marginTop: 24,
    paddingHorizontal: 20,
  },
  goalsList: {
    gap: 10,
  },
  goalCard: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: Colors.white,
    borderRadius: 14,
    padding: 14,
    gap: 12,
    shadowColor: Colors.shadowColor,
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.04,
    shadowRadius: 4,
    elevation: 1,
  },
  goalIcon: {
    width: 40,
    height: 40,
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
  },
  goalContent: {
    flex: 1,
  },
  goalTitle: {
    fontSize: 15,
    fontWeight: '600',
    color: Colors.text,
    marginBottom: 2,
  },
  goalTarget: {
    fontSize: 13,
    color: Colors.textSecondary,
    fontWeight: '500',
  },
  upcomingSection: {
    marginTop: 24,
    paddingHorizontal: 20,
  },
  tasksList: {
    gap: 10,
  },
  taskCard: {
    flexDirection: 'row',
    backgroundColor: Colors.white,
    borderRadius: 14,
    overflow: 'hidden',
    shadowColor: Colors.shadowColor,
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.04,
    shadowRadius: 4,
    elevation: 1,
  },
  taskColorBar: {
    width: 4,
  },
  taskContent: {
    flex: 1,
    padding: 14,
  },
  taskTitle: {
    fontSize: 15,
    fontWeight: '600',
    color: Colors.text,
    marginBottom: 4,
  },
  taskMeta: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  taskMetaText: {
    fontSize: 12,
    color: Colors.textSecondary,
    fontWeight: '500',
  },
  taskMetaDot: {
    fontSize: 12,
    color: Colors.textTertiary,
  },
  emptyCard: {
    backgroundColor: Colors.white,
    borderRadius: 14,
    padding: 24,
    alignItems: 'center',
    shadowColor: Colors.shadowColor,
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.04,
    shadowRadius: 4,
    elevation: 1,
  },
  emptyText: {
    fontSize: 14,
    color: Colors.textSecondary,
    fontWeight: '500',
  },
});
