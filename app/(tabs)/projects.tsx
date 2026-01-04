import React, { useState, useMemo, useCallback, useRef } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Animated,
  Modal,
  Pressable,
  StatusBar,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Plus, FolderKanban, TrendingUp, Edit3, X } from 'lucide-react-native';
import { useRouter } from 'expo-router';
import * as Haptics from 'expo-haptics';
import EmptyState from '@/components/EmptyState';
import Colors from '@/constants/colors';
import { useActiveProjects } from '@/contexts/ProjectsContext';
import { useActiveTasks } from '@/contexts/TasksContext';
import { useTheme } from '@/contexts/ThemeContext';

type TabType = 'inProgress' | 'completed';

export default function ProjectsScreen() {
  const router = useRouter() as any;
  const allActiveProjects = useActiveProjects();
  const activeTasks = useActiveTasks();
  const { colors: themeColors } = useTheme();
  const [selectedTab, setSelectedTab] = useState<TabType>('inProgress');
  const [selectedProject, setSelectedProject] = useState<string | null>(null);
  const [showActionModal, setShowActionModal] = useState(false);
  const animatedValues = useRef<{ [key: string]: Animated.Value }>({}).current;

  const getProjectProgress = useCallback((projectId: string) => {
    const projectTasks = activeTasks.filter(task => task.projectId === projectId);
    if (projectTasks.length === 0) return 0;
    const completed = projectTasks.filter(task => task.completed).length;
    return (completed / projectTasks.length) * 100;
  }, [activeTasks]);

  const getProjectTaskCount = (projectId: string) => {
    return activeTasks.filter(task => task.projectId === projectId).length;
  };
  
  const activeProjects = useMemo(() => {
    if (selectedTab === 'completed') {
      return allActiveProjects.filter(project => getProjectProgress(project.id) === 100);
    }
    return allActiveProjects.filter(project => getProjectProgress(project.id) < 100);
  }, [allActiveProjects, selectedTab, getProjectProgress]);

  const totalTasks = activeTasks.length;
  const completedTasks = activeTasks.filter(task => task.completed).length;
  const overallProgress = totalTasks > 0 ? Math.round((completedTasks / totalTasks) * 100) : 0;

  const getAnimatedValue = (projectId: string) => {
    if (!animatedValues[projectId]) {
      animatedValues[projectId] = new Animated.Value(0);
    }
    return animatedValues[projectId];
  };

  const handleLongPress = (projectId: string) => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
    const animValue = getAnimatedValue(projectId);
    
    Animated.spring(animValue, {
      toValue: 1,
      useNativeDriver: false,
      friction: 5,
      tension: 40,
    }).start();

    setSelectedProject(projectId);
    setShowActionModal(true);
  };

  const handleCloseModal = () => {
    if (selectedProject) {
      const animValue = getAnimatedValue(selectedProject);
      Animated.spring(animValue, {
        toValue: 0,
        useNativeDriver: false,
        friction: 7,
        tension: 40,
      }).start();
    }
    setShowActionModal(false);
    setTimeout(() => setSelectedProject(null), 300);
  };

  const handleEdit = () => {
    handleCloseModal();
    if (selectedProject) {
      router.push(`/edit-project/${selectedProject}`);
    }
  };

  return (
    <View style={styles.container}>
      <StatusBar barStyle="dark-content" backgroundColor="#FFFFFF" />
      <View style={[styles.topBarBackground, { backgroundColor: '#FFFFFF', shadowColor: '#000' }]}>
        <SafeAreaView edges={['top']} style={styles.safeArea}>
          <View style={styles.header}>
            <View style={styles.titleRow}>
              <Text style={[styles.headerTitle, { color: Colors.text }]}>Projects</Text>
              <TouchableOpacity
                style={styles.addButtonHeader}
                onPress={() => router.push('/add-project')}
                activeOpacity={0.7}
              >
                <Plus color={themeColors.primary} size={24} strokeWidth={2.5} />
              </TouchableOpacity>
            </View>
            <View style={styles.statsRow}>
              <View style={styles.statItem}>
                <Text style={[styles.statValue, { color: themeColors.primary }]}>{activeProjects.length}</Text>
                <Text style={[styles.statLabel, { color: Colors.textSecondary }]}>Active Projects</Text>
              </View>
              <View style={styles.statDivider} />
              <View style={styles.statItem}>
                <Text style={[styles.statValue, { color: themeColors.primary }]}>{overallProgress}%</Text>
                <Text style={[styles.statLabel, { color: Colors.textSecondary }]}>Overall Progress</Text>
              </View>
            </View>
          </View>
        </SafeAreaView>
      </View>

      <ScrollView style={styles.content} contentContainerStyle={styles.contentContainer}>
        <View style={styles.tabContainer}>
          <TouchableOpacity
            style={[styles.tab, selectedTab === 'inProgress' && styles.tabActive, selectedTab === 'inProgress' && { backgroundColor: themeColors.primary }]}
            onPress={() => setSelectedTab('inProgress')}
            activeOpacity={0.7}
          >
            <Text style={[styles.tabText, selectedTab === 'inProgress' && styles.tabTextActive]}>
              In Progress
            </Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={[styles.tab, selectedTab === 'completed' && styles.tabActive, selectedTab === 'completed' && { backgroundColor: themeColors.primary }]}
            onPress={() => setSelectedTab('completed')}
            activeOpacity={0.7}
          >
            <Text style={[styles.tabText, selectedTab === 'completed' && styles.tabTextActive]}>
              Completed
            </Text>
          </TouchableOpacity>
        </View>

        {activeProjects.length === 0 ? (
          <EmptyState 
            icon="folder"
            title={selectedTab === 'completed' ? 'No completed projects' : 'No projects yet'}
            description={selectedTab === 'completed' 
              ? 'Completed projects will appear here'
              : 'Create your first project to organize tasks'}
            iconColor={themeColors.primary}
          />
        ) : (
          <View style={styles.projectsGrid}>
            {activeProjects.map((project) => {
              const progress = getProjectProgress(project.id);
              const taskCount = getProjectTaskCount(project.id);
              const animValue = getAnimatedValue(project.id);
              
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
                  outputRange: [0.1, 0.25],
                }),
                shadowRadius: animValue.interpolate({
                  inputRange: [0, 1],
                  outputRange: [10, 20],
                }),
              };

              return (
                <TouchableOpacity
                  key={project.id}
                  activeOpacity={0.7}
                  onPress={() => router.push(`/project/${project.id}`)}
                  onLongPress={() => handleLongPress(project.id)}
                  delayLongPress={400}
                >
                  <Animated.View style={[styles.projectCard, elevationStyle]}>
                    <View style={styles.cardGradient}>
                      <View style={styles.cardContent}>
                        <View style={styles.projectHeader}>
                          <View style={styles.iconContainer}>
                            <FolderKanban color={themeColors.primary} size={26} strokeWidth={2.5} />
                          </View>
                          <View style={styles.projectInfo}>
                            <Text style={styles.projectTitle}>{project.title}</Text>
                            {project.description && (
                              <Text style={styles.projectDescription} numberOfLines={2}>
                                {project.description}
                              </Text>
                            )}
                          </View>
                        </View>

                        <View style={styles.progressSection}>
                          <View style={styles.progressHeader}>
                            <Text style={styles.progressLabel}>Progress</Text>
                            <View style={styles.progressBadge}>
                              <TrendingUp color={themeColors.primary} size={14} strokeWidth={2.5} />
                              <Text style={[styles.progressBadgeText, { color: themeColors.primary }]}>{Math.round(progress)}%</Text>
                            </View>
                          </View>
                          <View style={styles.progressBar}>
                            <View style={[styles.progressFill, { 
                              width: `${progress}%`,
                              backgroundColor: themeColors.primary,
                            }]} />
                          </View>
                        </View>

                        <View style={styles.projectFooter}>
                          <View style={styles.taskCountContainer}>
                            <View style={styles.taskDot} />
                            <Text style={styles.projectStat}>{taskCount} {taskCount === 1 ? 'task' : 'tasks'}</Text>
                          </View>
                          <View style={styles.statusBadge}>
                            <Text style={[styles.statusText, { color: themeColors.primary }]}>{progress === 100 ? 'Complete' : 'In Progress'}</Text>
                          </View>
                        </View>
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
              <Text style={styles.modalTitle}>Project Actions</Text>
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
                <Text style={styles.actionTitle}>Edit Project</Text>
                <Text style={styles.actionDescription}>Modify project details</Text>
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
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.03,
    shadowRadius: 4,
    elevation: 1,
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
    marginBottom: 20,
  },
  statsRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-around',
    paddingVertical: 16,
    paddingHorizontal: 20,
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
    borderRadius: 16,
    marginBottom: 8,
  },
  statItem: {
    alignItems: 'center',
    flex: 1,
  },
  statValue: {
    fontSize: 28,
    fontWeight: '700',
    color: Colors.white,
    marginBottom: 4,
  },
  statLabel: {
    fontSize: 13,
    fontWeight: '500',
    color: 'rgba(255, 255, 255, 0.9)',
    textAlign: 'center',
  },
  statDivider: {
    width: 1,
    height: 40,
    backgroundColor: 'rgba(255, 255, 255, 0.3)',
    marginHorizontal: 16,
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
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.04,
    shadowRadius: 4,
    elevation: 1,
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
  projectsGrid: {
    gap: 16,
  },
  projectCard: {
    borderRadius: 16,
    backgroundColor: Colors.white,
    shadowColor: Colors.shadowColor,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.04,
    shadowRadius: 8,
    elevation: 1,
  },
  cardGradient: {
    borderRadius: 16,
    overflow: 'hidden',
  },
  cardContent: {
    padding: 20,
  },
  projectHeader: {
    flexDirection: 'row',
    marginBottom: 20,
  },
  iconContainer: {
    width: 56,
    height: 56,
    borderRadius: 16,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 16,
    backgroundColor: Colors.softPeach,
  },

  projectInfo: {
    flex: 1,
  },
  projectTitle: {
    fontSize: 19,
    fontWeight: '700',
    color: Colors.text,
    marginBottom: 6,
    letterSpacing: -0.3,
  },
  projectDescription: {
    fontSize: 13,
    color: Colors.textSecondary,
    lineHeight: 19,
    opacity: 0.8,
  },
  progressSection: {
    marginTop: 20,
    marginBottom: 16,
  },
  progressHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 10,
  },
  progressLabel: {
    fontSize: 13,
    fontWeight: '600',
    color: Colors.textSecondary,
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  },
  progressBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 10,
    paddingVertical: 5,
    borderRadius: 12,
    gap: 5,
    backgroundColor: Colors.softPeach,
  },
  progressBadgeText: {
    fontSize: 14,
    fontWeight: '700',
  },
  progressBar: {
    height: 10,
    borderRadius: 8,
    overflow: 'hidden',
    backgroundColor: Colors.softPeach,
  },
  progressFill: {
    height: '100%',
    borderRadius: 8,
  },
  projectFooter: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginTop: 4,
  },
  taskCountContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  taskDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: Colors.primary,
  },
  projectStat: {
    fontSize: 14,
    fontWeight: '600',
    color: Colors.text,
  },
  statusBadge: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 10,
    backgroundColor: Colors.softPeach,
  },
  statusText: {
    fontSize: 12,
    fontWeight: '600',
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
    shadowColor: '#000',
    shadowOffset: { width: 0, height: -2 },
    shadowOpacity: 0.05,
    shadowRadius: 8,
    elevation: 2,
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
