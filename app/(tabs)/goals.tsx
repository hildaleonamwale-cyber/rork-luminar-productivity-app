import React, { useState, useMemo, useRef } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Animated,
  Modal,
  Pressable,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Plus, TrendingUp, Target, Edit3, X } from 'lucide-react-native';
import { useRouter } from 'expo-router';
import * as Haptics from 'expo-haptics';
import EmptyState from '@/components/EmptyState';
import Colors from '@/constants/colors';
import { useActiveGoals } from '@/contexts/GoalsContext';
import { useTheme } from '@/contexts/ThemeContext';

type TabType = 'inProgress' | 'completed';

export default function GoalsScreen() {
  const router = useRouter() as any;
  const allActiveGoals = useActiveGoals();
  const { colors: themeColors } = useTheme();
  const [selectedTab, setSelectedTab] = useState<TabType>('inProgress');
  const [selectedGoal, setSelectedGoal] = useState<string | null>(null);
  const [showActionModal, setShowActionModal] = useState(false);
  const animatedValues = useRef<{ [key: string]: Animated.Value }>({}).current;
  
  const activeGoals = useMemo(() => {
    if (selectedTab === 'completed') {
      return allActiveGoals.filter(goal => goal.completedDays.length >= goal.targetDays);
    }
    return allActiveGoals.filter(goal => goal.completedDays.length < goal.targetDays);
  }, [allActiveGoals, selectedTab]);

  const calculateStreak = (completedDays: string[]) => {
    if (completedDays.length === 0) return 0;
    
    const sortedDays = [...completedDays].sort().reverse();
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    
    let streak = 0;
    let currentDate = new Date(today);
    
    for (const day of sortedDays) {
      const completedDate = new Date(day);
      completedDate.setHours(0, 0, 0, 0);
      
      if (completedDate.getTime() === currentDate.getTime()) {
        streak++;
        currentDate.setDate(currentDate.getDate() - 1);
      } else {
        break;
      }
    }
    
    return streak;
  };



  const totalCompletedDays = activeGoals.reduce((sum, goal) => sum + goal.completedDays.length, 0);
  const totalTargetDays = activeGoals.reduce((sum, goal) => sum + goal.targetDays, 0);
  const overallProgress = totalTargetDays > 0 ? Math.round((totalCompletedDays / totalTargetDays) * 100) : 0;

  const getAnimatedValue = (goalId: string) => {
    if (!animatedValues[goalId]) {
      animatedValues[goalId] = new Animated.Value(0);
    }
    return animatedValues[goalId];
  };

  const handleLongPress = (goalId: string) => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
    const animValue = getAnimatedValue(goalId);
    
    Animated.spring(animValue, {
      toValue: 1,
      useNativeDriver: false,
      friction: 5,
      tension: 40,
    }).start();

    setSelectedGoal(goalId);
    setShowActionModal(true);
  };

  const handleCloseModal = () => {
    if (selectedGoal) {
      const animValue = getAnimatedValue(selectedGoal);
      Animated.spring(animValue, {
        toValue: 0,
        useNativeDriver: false,
        friction: 7,
        tension: 40,
      }).start();
    }
    setShowActionModal(false);
    setTimeout(() => setSelectedGoal(null), 300);
  };

  const handleEdit = () => {
    handleCloseModal();
    if (selectedGoal) {
      router.push(`/edit-goal/${selectedGoal}`);
    }
  };

  return (
    <View style={styles.container}>
      <View style={[styles.topBarBackground, { backgroundColor: themeColors.primary, shadowColor: themeColors.primary }]}>
        <SafeAreaView edges={['top']} style={styles.safeArea}>
          <View style={styles.header}>
            <View style={styles.titleRow}>
              <Text style={styles.headerTitle}>Goals</Text>
              <TouchableOpacity
                style={styles.addButtonHeader}
                onPress={() => router.push('/add-goal')}
                activeOpacity={0.7}
              >
                <Plus color={Colors.white} size={24} strokeWidth={2.5} />
              </TouchableOpacity>
            </View>
            <View style={styles.statsRow}>
              <View style={styles.statItem}>
                <Text style={styles.statValue}>{activeGoals.length}</Text>
                <Text style={styles.statLabel}>Active Goals</Text>
              </View>
              <View style={styles.statDivider} />
              <View style={styles.statItem}>
                <Text style={styles.statValue}>{totalCompletedDays}</Text>
                <Text style={styles.statLabel}>Days Completed</Text>
              </View>
              <View style={styles.statDivider} />
              <View style={styles.statItem}>
                <Text style={styles.statValue}>{overallProgress}%</Text>
                <Text style={styles.statLabel}>Overall</Text>
              </View>
            </View>
          </View>
        </SafeAreaView>
      </View>

      <ScrollView style={styles.content} contentContainerStyle={styles.contentContainer}>
        <View style={styles.tabContainer}>
          <TouchableOpacity
            style={[styles.tab, selectedTab === 'inProgress' && styles.tabActive, selectedTab === 'inProgress' && { backgroundColor: themeColors.secondary }]}
            onPress={() => setSelectedTab('inProgress')}
            activeOpacity={0.7}
          >
            <Text style={[styles.tabText, selectedTab === 'inProgress' && styles.tabTextActive]}>
              In Progress
            </Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={[styles.tab, selectedTab === 'completed' && styles.tabActive, selectedTab === 'completed' && { backgroundColor: themeColors.secondary }]}
            onPress={() => setSelectedTab('completed')}
            activeOpacity={0.7}
          >
            <Text style={[styles.tabText, selectedTab === 'completed' && styles.tabTextActive]}>
              Completed
            </Text>
          </TouchableOpacity>
        </View>

        {activeGoals.length === 0 ? (
          <EmptyState 
            icon="target"
            title={selectedTab === 'completed' ? 'No completed goals' : 'No goals yet'}
            description={selectedTab === 'completed' 
              ? 'Completed goals will appear here'
              : 'Set your first goal to start achieving'}
            iconColor={themeColors.primary}
          />
        ) : (
          <View style={styles.goalsGrid}>
            {activeGoals.map((goal, index) => {
              const completionPercentage = (goal.completedDays.length / goal.targetDays) * 100;
              const currentStreak = calculateStreak(goal.completedDays);
              
              const animValue = getAnimatedValue(goal.id);
              
              const elevationStyle = {
                transform: [
                  {
                    scale: animValue.interpolate({
                      inputRange: [0, 1],
                      outputRange: [1, 1.03],
                    }),
                  },
                  {
                    translateY: animValue.interpolate({
                      inputRange: [0, 1],
                      outputRange: [0, -4],
                    }),
                  },
                ],
                shadowOpacity: animValue.interpolate({
                  inputRange: [0, 1],
                  outputRange: [0.15, 0.3],
                }),
                shadowRadius: animValue.interpolate({
                  inputRange: [0, 1],
                  outputRange: [16, 24],
                }),
              };
              
              return (
                <TouchableOpacity
                  key={goal.id}
                  activeOpacity={0.7}
                  onPress={() => router.push(`/goal/${goal.id}`)}
                  onLongPress={() => handleLongPress(goal.id)}
                  delayLongPress={400}
                >
                  <Animated.View style={[styles.goalCard, elevationStyle]}>
                    <View style={styles.cardTopSection}>
                      <View style={styles.goalHeader}>
                        <View style={styles.iconContainer}>
                          <Target color={themeColors.primary} size={28} strokeWidth={2.5} />
                        </View>
                        <View style={styles.goalTitleContainer}>
                          <Text style={styles.goalTitle}>{goal.title}</Text>
                          <View style={styles.targetBadge}>
                            <Target color="#FFF" size={12} />
                            <Text style={styles.targetText}>{goal.targetDays} day goal</Text>
                          </View>
                        </View>
                      </View>
                    </View>

                    <View style={styles.progressSection}>
                      <View style={styles.progressBarContainer}>
                        <View style={styles.progressBarBg}>
                          <View style={[
                            styles.progressBarFill,
                            { width: `${completionPercentage}%`, backgroundColor: themeColors.primary }
                          ]} />
                        </View>
                        <Text style={[styles.percentageText, { color: themeColors.primary }]}>{Math.round(completionPercentage)}%</Text>
                      </View>
                    </View>

                    <View style={styles.statsSection}>
                      <View style={styles.statBox}>
                        <Text style={[styles.statNumber, { color: themeColors.primary }]}>{goal.completedDays.length}</Text>
                        <Text style={styles.cardStatLabel}>Completed</Text>
                      </View>
                      <View style={styles.statDividerVertical} />
                      <View style={styles.statBox}>
                        <Text style={[styles.statNumber, { color: themeColors.primary }]}>{goal.targetDays - goal.completedDays.length}</Text>
                        <Text style={styles.cardStatLabel}>Remaining</Text>
                      </View>
                      <View style={styles.statDividerVertical} />
                      <View style={styles.statBox}>
                        <View style={styles.streakContainer}>
                          <TrendingUp color={themeColors.primary} size={18} strokeWidth={2.5} />
                          <Text style={[styles.statNumber, { color: themeColors.primary }]}>{currentStreak}</Text>
                        </View>
                        <Text style={styles.cardStatLabel}>Day Streak</Text>
                      </View>
                    </View>
                  </Animated.View>
                </TouchableOpacity>
              );
            })}
          </View>
        )}
      </ScrollView>

      <Modal
        visible={showActionModal}
        transparent
        animationType="fade"
        onRequestClose={handleCloseModal}
      >
        <Pressable style={styles.modalOverlay} onPress={handleCloseModal}>
          <Pressable style={styles.actionModalContent} onPress={(e) => e.stopPropagation()}>
            <View style={styles.modalHeader}>
              <Text style={styles.modalTitle}>Goal Actions</Text>
              <TouchableOpacity onPress={handleCloseModal} activeOpacity={0.7}>
                <X color={Colors.textSecondary} size={24} />
              </TouchableOpacity>
            </View>
            
            <TouchableOpacity
              style={styles.actionButton}
              onPress={handleEdit}
              activeOpacity={0.7}
            >
              <View style={[styles.actionIconContainer, { backgroundColor: 'rgba(59, 130, 246, 0.1)' }]}>
                <Edit3 color="#3B82F6" size={22} strokeWidth={2} />
              </View>
              <View style={styles.actionTextContainer}>
                <Text style={styles.actionTitle}>Edit Goal</Text>
                <Text style={styles.actionDescription}>Modify goal details</Text>
              </View>
            </TouchableOpacity>
          </Pressable>
        </Pressable>
      </Modal>


    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.background,
  },
  topBarBackground: {
    borderBottomLeftRadius: 24,
    borderBottomRightRadius: 24,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.08,
    shadowRadius: 12,
    elevation: 4,
  },
  safeArea: {
    paddingHorizontal: 20,
  },
  header: {
    marginTop: 20,
    marginBottom: 24,
  },
  titleRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 20,
  },
  headerTitle: {
    fontSize: 32,
    fontWeight: '700',
    color: Colors.white,
  },
  statsRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-around',
    paddingVertical: 16,
    paddingHorizontal: 12,
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
    borderRadius: 16,
    marginBottom: 8,
  },
  statItem: {
    alignItems: 'center',
    flex: 1,
  },
  statValue: {
    fontSize: 24,
    fontWeight: '700',
    color: Colors.white,
    marginBottom: 4,
  },
  statLabel: {
    fontSize: 12,
    fontWeight: '500',
    color: 'rgba(255, 255, 255, 0.9)',
    textAlign: 'center' as const,
  },
  statDivider: {
    width: 1,
    height: 40,
    backgroundColor: 'rgba(255, 255, 255, 0.3)',
    marginHorizontal: 8,
  },
  content: {
    flex: 1,
  },
  contentContainer: {
    padding: 20,
    paddingBottom: 140,
  },
  tabContainer: {
    flexDirection: 'row',
    backgroundColor: Colors.white,
    borderRadius: 12,
    padding: 4,
    marginBottom: 20,
    shadowColor: Colors.shadowColor,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.04,
    shadowRadius: 8,
    elevation: 2,
  },
  tab: {
    flex: 1,
    paddingVertical: 12,
    paddingHorizontal: 16,
    borderRadius: 12,
    alignItems: 'center',
  },
  tabActive: {
  },
  tabText: {
    fontSize: 14,
    fontWeight: '600',
    color: Colors.textSecondary,
  },
  tabTextActive: {
    color: Colors.white,
  },
  emptyCard: {
    alignItems: 'center',
    padding: 40,
  },
  emptyText: {
    fontSize: 16,
    color: Colors.textSecondary,
  },
  goalsGrid: {
    gap: 20,
  },
  goalCard: {
    backgroundColor: Colors.white,
    borderRadius: 16,
    padding: 20,
    shadowColor: Colors.shadowColor,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.04,
    shadowRadius: 8,
    elevation: 2,
  },

  cardTopSection: {
    marginBottom: 20,
  },
  goalHeader: {
    flexDirection: 'row',
    alignItems: 'flex-start',
  },
  iconContainer: {
    width: 56,
    height: 56,
    borderRadius: 16,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 16,
    backgroundColor: Colors.softPurple,
  },
  goalTitleContainer: {
    flex: 1,
    paddingTop: 4,
  },

  goalTitle: {
    fontSize: 20,
    fontWeight: '700',
    color: Colors.text,
    marginBottom: 8,
    letterSpacing: 0.3,
  },
  targetBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 12,
    alignSelf: 'flex-start',
    backgroundColor: Colors.primary,
  },
  targetText: {
    fontSize: 12,
    fontWeight: '600',
    color: '#FFF',
  },
  progressSection: {
    marginBottom: 20,
  },
  progressBarContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  progressBarBg: {
    flex: 1,
    height: 12,
    backgroundColor: '#F0F0F0',
    borderRadius: 6,
    overflow: 'hidden' as const,
  },
  progressBarFill: {
    height: '100%',
    borderRadius: 6,
  },
  percentageText: {
    fontSize: 18,
    fontWeight: '700',
    minWidth: 50,
    textAlign: 'right' as const,
  },
  statsSection: {
    flexDirection: 'row',
    backgroundColor: '#F8F8F8',
    borderRadius: 16,
    padding: 16,
  },
  statBox: {
    flex: 1,
    alignItems: 'center',
  },
  statNumber: {
    fontSize: 24,
    fontWeight: '800',
    marginBottom: 4,
  },
  cardStatLabel: {
    fontSize: 11,
    fontWeight: '600',
    color: Colors.textSecondary,
    textTransform: 'uppercase' as const,
    letterSpacing: 0.5,
  },
  statDividerVertical: {
    width: 1,
    backgroundColor: '#E0E0E0',
    marginHorizontal: 12,
  },
  streakContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  addButtonHeader: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'flex-end',
  },
  actionModalContent: {
    backgroundColor: Colors.white,
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
    paddingHorizontal: 20,
    paddingTop: 24,
    paddingBottom: 40,
    shadowColor: Colors.shadowColor,
    shadowOffset: { width: 0, height: -2 },
    shadowOpacity: 0.06,
    shadowRadius: 12,
    elevation: 6,
  },
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 24,
  },
  modalTitle: {
    fontSize: 22,
    fontWeight: '700',
    color: Colors.text,
  },
  actionButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: Colors.background,
    borderRadius: 16,
    padding: 16,
  },
  actionIconContainer: {
    width: 48,
    height: 48,
    borderRadius: 14,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 16,
  },
  actionTextContainer: {
    flex: 1,
  },
  actionTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: Colors.text,
    marginBottom: 2,
  },
  actionDescription: {
    fontSize: 13,
    color: Colors.textSecondary,
  },

});
