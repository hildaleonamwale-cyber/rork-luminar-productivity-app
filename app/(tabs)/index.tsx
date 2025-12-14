import React, { useMemo } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Dimensions,
  ImageBackground,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { 
  Target, 
  TrendingUp,
  Activity,
  BarChart3,
  Sparkles,
  ListTodo,
  BookOpen,
  Edit3,
  CheckCircle2,
  Circle,
} from 'lucide-react-native';

import DonutChart from '@/components/DonutChart';
import LineGraph from '@/components/LineGraph';

import Colors from '@/constants/colors';
import { useTheme } from '@/contexts/ThemeContext';
import { useStandaloneTasks, useUpcomingTasks } from '@/contexts/TasksContext';
import { useActiveGoals } from '@/contexts/GoalsContext';
import { useActiveProjects } from '@/contexts/ProjectsContext';
import { useActiveEntries } from '@/contexts/JournalContext';
import { useRouter } from 'expo-router';
import { useOnboarding } from '@/contexts/OnboardingContext';
import { useQuote } from '@/contexts/QuoteContext';

const { width } = Dimensions.get('window');
const CARD_PADDING = 20;
const SCREEN_PADDING = 40;

export default function DashboardScreen() {
  const router = useRouter();
  const { colors: themeColors } = useTheme();

  const { userName } = useOnboarding();
  const { quote } = useQuote();

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

  const weeklyData = useMemo(() => {
    const last7Days = Array.from({ length: 7 }, (_, i) => {
      const date = new Date();
      date.setDate(date.getDate() - (6 - i));
      return date.toISOString().split('T')[0];
    });

    return last7Days.map(date => {
      const dayTasks = tasks.filter(t => t.date === date);
      const completed = dayTasks.filter(t => t.completed).length;
      return dayTasks.length > 0 ? (completed / dayTasks.length) * 100 : 0;
    });
  }, [tasks]);

  const stats = useMemo(() => {
    const allTasks = tasks.filter(t => !t.deleted);
    const completedTasks = allTasks.filter(t => t.completed).length;
    const activeTasksCount = allTasks.filter(t => !t.completed).length;
    
    const activeGoalsStreak = goals.reduce((max, goal) => {
      let currentStreak = 0;
      const sortedDays = [...goal.completedDays].sort().reverse();
      
      for (let i = 0; i < sortedDays.length; i++) {
        const date = new Date(sortedDays[i]);
        const expectedDate = new Date();
        expectedDate.setDate(expectedDate.getDate() - i);
        
        if (date.toISOString().split('T')[0] === expectedDate.toISOString().split('T')[0]) {
          currentStreak++;
        } else {
          break;
        }
      }
      
      return Math.max(max, currentStreak);
    }, 0);

    const last30Days = tasks.filter(t => {
      const taskDate = new Date(t.date);
      const thirtyDaysAgo = new Date();
      thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);
      return taskDate >= thirtyDaysAgo;
    });
    
    const completedLast30 = last30Days.filter(t => t.completed).length;
    const productivityRate = last30Days.length > 0 ? (completedLast30 / last30Days.length) * 100 : 0;

    return {
      completedTasks,
      activeTasksCount,
      goalsActive: goals.length,
      projectsActive: projects.length,
      streak: activeGoalsStreak,
      productivity: Math.round(productivityRate),
      journalEntries: journalEntries.length,
    };
  }, [tasks, goals, projects, journalEntries]);

  const categoryBreakdown = useMemo(() => {
    const categories = todayTasks.reduce((acc, task) => {
      acc[task.category] = (acc[task.category] || 0) + 1;
      return acc;
    }, {} as Record<string, number>);

    return Object.entries(categories).map(([name, count]) => ({
      name,
      count,
      color: Colors.categoryColors[name as keyof typeof Colors.categoryColors] || '#735DFF',
    }));
  }, [todayTasks]);

  const backgroundComponent = themeColors.backgroundImage ? (
    <ImageBackground 
      source={{ uri: themeColors.backgroundImage }} 
      style={StyleSheet.absoluteFill}
      resizeMode="cover"
    >
      <View style={styles.overlay} />
    </ImageBackground>
  ) : null;

  return (
    <View style={styles.container}>
      {backgroundComponent}
      <View style={[styles.headerWrapper, { backgroundColor: themeColors.primary }]}>
        <SafeAreaView edges={['top']} style={[styles.safeArea, { backgroundColor: themeColors.primary }]}>
          <View style={[styles.header, { backgroundColor: themeColors.primary }]}>
            <View>
              <Text style={styles.headerSubtitle}>ANALYTICS DASHBOARD</Text>
              <Text style={styles.headerTitle}>{getGreeting()}, {userName || 'User'}</Text>
            </View>
            <View style={styles.headerButtons}>
              <TouchableOpacity 
                style={[styles.sparkleButton, { backgroundColor: Colors.white }]}
                onPress={() => router.push('/settings')}
              >
                <Sparkles color={themeColors.primary} size={24} strokeWidth={2.5} fill="none" />
              </TouchableOpacity>
              <TouchableOpacity 
                style={[styles.sparkleButton, { backgroundColor: Colors.white }]}
                onPress={() => router.push('/journal')}
              >
                <BookOpen color={themeColors.primary} size={24} strokeWidth={2.5} fill="none" />
              </TouchableOpacity>
            </View>
          </View>
        </SafeAreaView>
      </View>

      <ScrollView 
        style={styles.scrollView}
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        <View style={styles.content}>
          <View style={styles.quoteCard}>
            <TouchableOpacity
              style={[styles.editQuoteButton, { backgroundColor: themeColors.primary }]}
              onPress={() => router.push('/edit-quote')}
              activeOpacity={0.7}
            >
              <Edit3 color={Colors.white} size={18} strokeWidth={2.5} />
            </TouchableOpacity>

            <View style={styles.quoteHeader}>
              <View style={[styles.quoteIconCircle, { backgroundColor: `${themeColors.primary}15` }]}>
                <Sparkles color={themeColors.primary} size={20} strokeWidth={2.5} fill="none" />
              </View>
              <Text style={[styles.quoteLabel, { color: themeColors.primary }]}>YOUR DAILY INSPIRATION</Text>
            </View>

            <View style={styles.quoteContent}>
              <Text style={[styles.openingQuoteMark, { color: themeColors.primary }]}>&ldquo;</Text>
              <Text style={[styles.quoteText, { color: themeColors.primary }]}>
                {quote}
              </Text>
              <Text style={[styles.closingQuoteMark, { color: themeColors.primary }]}>&rdquo;</Text>
            </View>

            <View style={styles.quoteStats}>
              <View style={styles.quoteStat}>
                <View style={[styles.quoteStatCircle, { backgroundColor: `${themeColors.primary}15`, borderColor: `${themeColors.primary}30` }]}>
                  <CheckCircle2 color={themeColors.primary} size={22} strokeWidth={2.5} />
                </View>
                <Text style={styles.quoteStatNumber}>{stats.completedTasks}</Text>
                <Text style={styles.quoteStatLabel}>Completed</Text>
              </View>

              <View style={styles.quoteStatDivider} />

              <View style={styles.quoteStat}>
                <View style={[styles.quoteStatCircle, { backgroundColor: `${themeColors.secondary}15`, borderColor: `${themeColors.secondary}30` }]}>
                  <Circle color={themeColors.secondary} size={22} strokeWidth={2.5} />
                </View>
                <Text style={styles.quoteStatNumber}>{stats.activeTasksCount}</Text>
                <Text style={styles.quoteStatLabel}>Remaining</Text>
              </View>
            </View>
          </View>

          <View style={styles.largeCard}>
            <View style={styles.cardHeader}>
              <View style={styles.cardHeaderLeft}>
                <View style={[styles.cardIcon, { backgroundColor: `${themeColors.primary}1A` }]}>
                  <ListTodo color={themeColors.primary} size={22} strokeWidth={2.5} />
                </View>
                <View>
                  <Text style={styles.cardTitle}>Upcoming Tasks</Text>
                  <Text style={styles.cardSubtitle}>Your next {upcomingTasks.length} tasks</Text>
                </View>
              </View>
            </View>

            {upcomingTasks.length > 0 ? (
              <View style={styles.tasksList}>
                {upcomingTasks.map((task) => {
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
                      <View style={[styles.taskDot, { backgroundColor: task.completed ? '#10B981' : themeColors.secondary }]} />
                      <View style={styles.taskContent}>
                        <Text style={[styles.taskTitle, task.completed && styles.taskTitleCompleted]}>
                          {task.title}
                        </Text>
                        <View style={styles.taskMeta}>
                          <Text style={styles.taskMetaText}>{dateLabel}</Text>
                          {task.time && (
                            <>
                              <Text style={styles.taskMetaDot}>•</Text>
                              <Text style={styles.taskMetaText}>{task.time}</Text>
                            </>
                          )}
                          <Text style={styles.taskMetaDot}>•</Text>
                          <Text style={[styles.taskCategory, { color: themeColors.primary }]}>{task.category}</Text>
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

          <View style={styles.largeCard}>
            <View style={styles.cardHeader}>
              <View style={styles.cardHeaderLeft}>
                <View style={[styles.cardIcon, { backgroundColor: `${themeColors.primary}1A` }]}>
                  <Activity color={themeColors.primary} size={22} strokeWidth={2.5} />
                </View>
                <View>
                  <Text style={styles.cardTitle}>Weekly Performance</Text>
                  <Text style={styles.cardSubtitle}>Last 7 days completion rate</Text>
                </View>
              </View>
              <View style={styles.percentageBadge}>
                <TrendingUp color="#10B981" size={16} strokeWidth={3} />
                <Text style={styles.percentageText}>+12%</Text>
              </View>
            </View>

            <View style={styles.graphContainer}>
              <LineGraph 
                data={weeklyData}
                width={width - SCREEN_PADDING}
                height={180}
                color={themeColors.primary}
                showDots={true}
                showGrid={true}
              />
            </View>

            <View style={styles.weekLabels}>
              {['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'].map((day, i) => (
                <Text key={i} style={styles.weekLabel}>{day}</Text>
              ))}
            </View>
          </View>

          <View style={styles.largeCard}>
            <View style={styles.cardHeader}>
              <View style={styles.cardHeaderLeft}>
                <View style={[styles.cardIcon, { backgroundColor: `${themeColors.secondary}1A` }]}>
                  <Target color={themeColors.secondary} size={22} strokeWidth={2.5} />
                </View>
                <View>
                  <Text style={styles.cardTitle}>Today&apos;s Progress</Text>
                  <Text style={styles.cardSubtitle}>
                    {completedToday} of {totalToday} tasks completed
                  </Text>
                </View>
              </View>
            </View>

            <View style={styles.progressRow}>
              <DonutChart 
                percentage={completionPercentage}
                size={160}
                strokeWidth={18}
                color={themeColors.secondary}
              />

              <View style={styles.progressStats}>
                <View style={styles.progressStat}>
                  <View style={[styles.progressDot, { backgroundColor: themeColors.secondary }]} />
                  <View style={styles.progressStatContent}>
                    <Text style={styles.progressStatValue}>{completedToday}</Text>
                    <Text style={styles.progressStatLabel}>Completed</Text>
                  </View>
                </View>

                <View style={styles.progressStat}>
                  <View style={[styles.progressDot, { backgroundColor: '#E5E7EB' }]} />
                  <View style={styles.progressStatContent}>
                    <Text style={styles.progressStatValue}>{totalToday - completedToday}</Text>
                    <Text style={styles.progressStatLabel}>Remaining</Text>
                  </View>
                </View>

                <View style={styles.progressStat}>
                  <View style={[styles.progressDot, { backgroundColor: themeColors.primary }]} />
                  <View style={styles.progressStatContent}>
                    <Text style={styles.progressStatValue}>{totalToday}</Text>
                    <Text style={styles.progressStatLabel}>Total Today</Text>
                  </View>
                </View>
              </View>
            </View>
          </View>

          {categoryBreakdown.length > 0 && (
            <View style={styles.largeCard}>
              <View style={styles.cardHeader}>
                <View style={styles.cardHeaderLeft}>
                  <View style={[styles.cardIcon, { backgroundColor: `${themeColors.primary}1A` }]}>
                    <BarChart3 color={themeColors.primary} size={22} strokeWidth={2.5} />
                  </View>
                  <View>
                    <Text style={styles.cardTitle}>Category Distribution</Text>
                    <Text style={styles.cardSubtitle}>Today&apos;s tasks by category</Text>
                  </View>
                </View>
              </View>

              <View style={styles.categoryList}>
                {categoryBreakdown.map((category, index) => {
                  const percentage = (category.count / totalToday) * 100;
                  return (
                    <View key={index} style={styles.categoryItem}>
                      <View style={styles.categoryLeft}>
                        <View style={[styles.categoryDot, { backgroundColor: category.color }]} />
                        <Text style={styles.categoryName}>{category.name}</Text>
                      </View>
                      <View style={styles.categoryRight}>
                        <View style={styles.categoryBar}>
                          <View 
                            style={[
                              styles.categoryBarFill, 
                              { 
                                width: `${percentage}%`,
                                backgroundColor: category.color 
                              }
                            ]} 
                          />
                        </View>
                        <Text style={styles.categoryCount}>{category.count}</Text>
                      </View>
                    </View>
                  );
                })}
              </View>
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
    backgroundColor: Colors.white,
  },
  overlay: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: 'rgba(255, 255, 255, 0.85)',
  },
  headerWrapper: {
    borderBottomLeftRadius: 24,
    borderBottomRightRadius: 24,
    overflow: 'hidden',
  },
  safeArea: {
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingVertical: 20,
    paddingBottom: 50,
  },
  headerSubtitle: {
    fontSize: 11,
    fontWeight: '700',
    color: 'rgba(255, 255, 255, 0.8)',
    letterSpacing: 1.5,
    marginBottom: 4,
  },
  headerTitle: {
    fontSize: 28,
    fontWeight: '700',
    color: Colors.white,
  },
  headerButtons: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  sparkleButton: {
    width: 52,
    height: 52,
    borderRadius: 16,
    backgroundColor: Colors.white,
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.15,
    shadowRadius: 12,
    elevation: 4,
  },
  scrollView: {
    flex: 1,
    position: 'relative' as const,
  },
  scrollContent: {
    paddingBottom: 140,
  },
  content: {
    paddingHorizontal: 20,
    paddingTop: 20,
  },
  quoteCard: {
    backgroundColor: Colors.white,
    borderRadius: 16,
    padding: 24,
    marginBottom: 24,
    marginTop: 8,
    shadowColor: Colors.shadowColor,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.04,
    shadowRadius: 8,
    elevation: 2,
    position: 'relative' as const,
  },
  quoteHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    marginBottom: 20,
  },
  quoteIconCircle: {
    width: 32,
    height: 32,
    borderRadius: 16,
    alignItems: 'center',
    justifyContent: 'center',
  },
  quoteLabel: {
    fontSize: 10,
    fontWeight: '700',
    letterSpacing: 1.2,
  },
  quoteContent: {
    paddingHorizontal: 12,
    paddingVertical: 24,
    alignItems: 'center',
    justifyContent: 'center',
    position: 'relative' as const,
    minHeight: 120,
  },
  openingQuoteMark: {
    fontSize: 80,
    fontWeight: '300' as const,
    lineHeight: 80,
    opacity: 0.25,
    fontFamily: 'Georgia',
    position: 'absolute' as const,
    top: -10,
    left: 10,
  },
  closingQuoteMark: {
    fontSize: 80,
    fontWeight: '300' as const,
    lineHeight: 80,
    opacity: 0.25,
    fontFamily: 'Georgia',
    position: 'absolute' as const,
    bottom: -10,
    right: 10,
  },
  quoteText: {
    fontSize: 30,
    fontWeight: '700' as const,
    textAlign: 'center' as const,
    lineHeight: 40,
    paddingHorizontal: 32,
    paddingVertical: 12,
    letterSpacing: 0.3,
    fontFamily: 'Quicksand',
    textShadowColor: 'rgba(0, 0, 0, 0.08)',
    textShadowOffset: { width: 0, height: 2 },
    textShadowRadius: 4,
  },
  quoteStats: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-around',
    marginTop: 28,
    paddingTop: 24,
    borderTopWidth: 1,
    borderTopColor: '#F3F4F6',
  },
  quoteStat: {
    alignItems: 'center',
    gap: 10,
  },
  quoteStatCircle: {
    width: 64,
    height: 64,
    borderRadius: 32,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 2,
  },
  quoteStatNumber: {
    fontSize: 28,
    fontWeight: '700',
    color: Colors.text,
  },
  quoteStatLabel: {
    fontSize: 11,
    fontWeight: '600',
    color: Colors.textSecondary,
    textTransform: 'uppercase' as const,
    letterSpacing: 0.5,
  },
  quoteStatDivider: {
    width: 1,
    height: 48,
    backgroundColor: '#E5E7EB',
  },
  editQuoteButton: {
    position: 'absolute' as const,
    top: 20,
    right: 20,
    width: 36,
    height: 36,
    borderRadius: 18,
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 3,
    zIndex: 10,
  },
  largeCard: {
    backgroundColor: Colors.white,
    borderRadius: 16,
    padding: CARD_PADDING,
    marginBottom: 16,
    shadowColor: Colors.shadowColor,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.04,
    shadowRadius: 8,
    elevation: 2,
  },
  cardHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 24,
  },
  cardHeaderLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    flex: 1,
  },
  cardIcon: {
    width: 48,
    height: 48,
    borderRadius: 14,
    alignItems: 'center',
    justifyContent: 'center',
  },
  cardTitle: {
    fontSize: 17,
    fontWeight: '700',
    color: Colors.text,
    marginBottom: 2,
  },
  cardSubtitle: {
    fontSize: 12,
    color: Colors.textSecondary,
    fontWeight: '500',
  },
  percentageBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    backgroundColor: 'rgba(16, 185, 129, 0.1)',
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: 8,
  },
  percentageText: {
    fontSize: 13,
    fontWeight: '700',
    color: '#10B981',
  },
  graphContainer: {
    alignItems: 'center',
    marginVertical: 8,
  },
  weekLabels: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingHorizontal: 20,
    marginTop: 12,
  },
  weekLabel: {
    fontSize: 11,
    fontWeight: '600',
    color: Colors.textSecondary,
    textTransform: 'uppercase',
  },
  progressRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 24,
  },
  progressStats: {
    flex: 1,
    gap: 16,
  },
  progressStat: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  progressDot: {
    width: 12,
    height: 12,
    borderRadius: 6,
  },
  progressStatContent: {
    flex: 1,
  },
  progressStatValue: {
    fontSize: 22,
    fontWeight: '700',
    color: Colors.text,
    marginBottom: 2,
  },
  progressStatLabel: {
    fontSize: 12,
    color: Colors.textSecondary,
    fontWeight: '600',
  },
  categoryList: {
    gap: 16,
  },
  categoryItem: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  categoryLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    flex: 1,
  },
  categoryDot: {
    width: 14,
    height: 14,
    borderRadius: 7,
  },
  categoryName: {
    fontSize: 15,
    fontWeight: '600',
    color: Colors.text,
    textTransform: 'capitalize',
  },
  categoryRight: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    flex: 1,
  },
  categoryBar: {
    flex: 1,
    height: 8,
    backgroundColor: '#F3F4F6',
    borderRadius: 4,
    overflow: 'hidden',
  },
  categoryBarFill: {
    height: '100%',
    borderRadius: 4,
  },
  categoryCount: {
    fontSize: 16,
    fontWeight: '700',
    color: Colors.text,
    minWidth: 24,
    textAlign: 'right',
  },
  metricsGrid: {
    flexDirection: 'row',
    gap: 12,
    marginBottom: 12,
  },
  metricCard: {
    flex: 1,
    backgroundColor: Colors.white,
    borderRadius: 16,
    padding: 20,
    alignItems: 'center',
    shadowColor: Colors.shadowColor,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.04,
    shadowRadius: 8,
    elevation: 2,
  },
  metricIcon: {
    width: 64,
    height: 64,
    borderRadius: 18,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 16,
  },
  metricValue: {
    fontSize: 32,
    fontWeight: '700',
    color: Colors.text,
    marginBottom: 6,
  },
  metricLabel: {
    fontSize: 12,
    color: Colors.textSecondary,
    fontWeight: '600',
    textAlign: 'center',
    marginBottom: 12,
  },
  metricBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    backgroundColor: 'rgba(16, 185, 129, 0.1)',
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: 8,
  },
  metricBadgeText: {
    fontSize: 11,
    fontWeight: '700',
    color: '#10B981',
  },

  tasksList: {
    gap: 20,
  },
  taskItem: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: 14,
  },
  taskDot: {
    width: 10,
    height: 10,
    borderRadius: 5,
    marginTop: 6,
  },
  taskContent: {
    flex: 1,
  },
  taskTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: Colors.text,
    marginBottom: 6,
  },
  taskTitleCompleted: {
    textDecorationLine: 'line-through',
    opacity: 0.5,
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
    fontSize: 13,
    color: Colors.textSecondary,
    opacity: 0.5,
  },
  taskCategory: {
    fontSize: 13,
    fontWeight: '600',
    textTransform: 'capitalize',
  },
  emptyState: {
    paddingVertical: 20,
    alignItems: 'center',
  },
  emptyStateText: {
    fontSize: 14,
    color: Colors.textSecondary,
    fontWeight: '500',
  },
});
