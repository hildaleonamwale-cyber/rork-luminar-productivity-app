import React, { useState, useRef } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Modal,
  TextInput,
  Animated,
} from 'react-native';
import * as Haptics from 'expo-haptics';
import { SafeAreaView } from 'react-native-safe-area-context';
import { ArrowLeft, Plus, Trash2, Calendar, CheckCircle2, Clock, TrendingUp, ListTodo, Edit2, Check } from 'lucide-react-native';
import { useRouter, useLocalSearchParams } from 'expo-router';
import AdvancedDateTimePicker from '@/components/AdvancedDateTimePicker';
import Card from '@/components/Card';
import Colors from '@/constants/colors';
import { useProjects } from '@/contexts/ProjectsContext';
import { useTasks, useActiveTasks } from '@/contexts/TasksContext';
import { Task } from '@/constants/types';
import { LinearGradient } from 'expo-linear-gradient';
import { useTheme } from '@/contexts/ThemeContext';

const EMOJI_OPTIONS = ['📝', '💼', '🎯', '📊', '🚀', '💡', '🔥', '✨', '⭐', '📱', '💻', '🎨', '📚', '🏃', '🎵', '🍕'];

interface ProjectTaskCardProps {
  task: Task;
  onLongPress: () => void;
  onToggleComplete: () => void;
}

const ProjectTaskCard = ({ task, onLongPress, onToggleComplete }: ProjectTaskCardProps) => {
  const { colors } = useTheme();
  const scaleAnim = useRef(new Animated.Value(1)).current;
  const translateYAnim = useRef(new Animated.Value(0)).current;

  const handleLongPressIn = () => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
    Animated.parallel([
      Animated.spring(scaleAnim, {
        toValue: 0.95,
        useNativeDriver: true,
        speed: 50,
        bounciness: 4,
      }),
      Animated.spring(translateYAnim, {
        toValue: -8,
        useNativeDriver: true,
        speed: 50,
        bounciness: 4,
      }),
    ]).start();
  };

  const handleLongPressOut = () => {
    Animated.parallel([
      Animated.spring(scaleAnim, {
        toValue: 1,
        useNativeDriver: true,
        speed: 50,
        bounciness: 4,
      }),
      Animated.spring(translateYAnim, {
        toValue: 0,
        useNativeDriver: true,
        speed: 50,
        bounciness: 4,
      }),
    ]).start();
  };

  return (
    <TouchableOpacity
      onLongPress={onLongPress}
      onPressIn={handleLongPressIn}
      onPressOut={handleLongPressOut}
      activeOpacity={1}
      delayLongPress={500}
    >
      <Animated.View style={{
        transform: [{ scale: scaleAnim }, { translateY: translateYAnim }]
      }}>
        <Card style={[
          styles.taskCard,
          task.completed && styles.taskCardCompleted
        ]}>
          <View style={styles.taskContent}>
            <Text style={styles.taskEmoji}>{task.emoji || '📝'}</Text>
            <View style={styles.taskInfo}>
              <Text style={styles.taskTitle}>{task.title}</Text>
              <Text style={styles.taskDate}>
                {new Date(task.date).toLocaleDateString('en-US', {
                  month: 'short',
                  day: 'numeric',
                  year: 'numeric'
                })}
              </Text>
            </View>
            <TouchableOpacity
              style={styles.checkbox}
              onPress={onToggleComplete}
              activeOpacity={0.7}
            >
              <View style={[
                styles.checkboxCircle,
                { borderColor: colors.primary },
                task.completed && [styles.checkboxCircleChecked, { backgroundColor: colors.secondary, borderColor: colors.secondary }]
              ]}>
                {task.completed && (
                  <View style={styles.checkmark} />
                )}
              </View>
            </TouchableOpacity>
          </View>
        </Card>
      </Animated.View>
    </TouchableOpacity>
  );
};

export default function ProjectDetailScreen() {
  const router = useRouter();
  const { id } = useLocalSearchParams();
  const { projects, updateProject } = useProjects();
  const { addTask, updateTask, deleteTask } = useTasks();
  const activeTasks = useActiveTasks();
  const { colors } = useTheme();
  const [isAddingTask, setIsAddingTask] = useState(false);
  const [editingTask, setEditingTask] = useState<Task | null>(null);
  const [taskTitle, setTaskTitle] = useState('');
  const [taskEmoji, setTaskEmoji] = useState('📝');
  const [taskDate, setTaskDate] = useState(new Date());
  const [taskNotes, setTaskNotes] = useState('');
  const [showDatePicker, setShowDatePicker] = useState(false);
  const [longPressedTask, setLongPressedTask] = useState<Task | null>(null);
  const [deleteConfirmTask, setDeleteConfirmTask] = useState<Task | null>(null);
  const [projectNotes, setProjectNotes] = useState('');
  const [isEditingNotes, setIsEditingNotes] = useState(false);

  const project = projects.find(p => p.id === id);
  const projectTasks = activeTasks.filter(task => task.projectId === id);

  React.useEffect(() => {
    if (project) {
      setProjectNotes(project.notes || '');
    }
  }, [project]);

  const handleAddTask = () => {
    if (!taskTitle.trim()) return;

    if (editingTask) {
      updateTask(editingTask.id, {
        title: taskTitle,
        emoji: taskEmoji,
        date: taskDate.toISOString().split('T')[0],
        notes: taskNotes,
      });
      setEditingTask(null);
    } else {
      addTask({
        title: taskTitle,
        emoji: taskEmoji,
        category: 'personal',
        date: taskDate.toISOString().split('T')[0],
        notes: taskNotes,
        completed: false,
        projectId: id as string,
      });
    }

    setTaskTitle('');
    setTaskEmoji('📝');
    setTaskDate(new Date());
    setTaskNotes('');
    setIsAddingTask(false);
  };

  const handleEditTask = (task: Task) => {
    setEditingTask(task);
    setTaskTitle(task.title);
    setTaskEmoji(task.emoji || '📝');
    setTaskDate(new Date(task.date));
    setTaskNotes(task.notes || '');
    setLongPressedTask(null);
    setIsAddingTask(true);
  };

  const handleDeleteTask = () => {
    if (deleteConfirmTask) {
      deleteTask(deleteConfirmTask.id);
      setDeleteConfirmTask(null);
      if (editingTask && editingTask.id === deleteConfirmTask.id) {
        setIsAddingTask(false);
        setEditingTask(null);
      }
    }
  };

  const openAddModal = () => {
    setEditingTask(null);
    setTaskTitle('');
    setTaskEmoji('📝');
    setTaskDate(new Date());
    setTaskNotes('');
    setIsAddingTask(true);
  };

  if (!project) {
    return (
      <View style={styles.container}>
        <SafeAreaView edges={['top']}>
          <Text style={styles.errorText}>Project not found</Text>
        </SafeAreaView>
      </View>
    );
  }

  const completedTasks = projectTasks.filter(task => task.completed).length;
  const totalTasks = projectTasks.length;
  const progress = totalTasks > 0 ? (completedTasks / totalTasks) * 100 : 0;

  return (
    <View style={styles.container}>
      <LinearGradient
        colors={[colors.primary, colors.secondary]}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 1 }}
        style={styles.headerGradient}
      >
        <SafeAreaView edges={['top']}>
          <View style={styles.header}>
            <TouchableOpacity
              style={styles.backButton}
              onPress={() => router.back()}
              activeOpacity={0.7}
            >
              <ArrowLeft color={Colors.white} size={24} />
            </TouchableOpacity>
            <View style={styles.placeholder} />
          </View>

          <View style={styles.heroSection}>
            <View style={styles.emojiContainer}>
              <Text style={styles.projectEmoji}>{project.emoji || '📝'}</Text>
            </View>
            <Text style={styles.projectTitle}>{project.title}</Text>
            {project.description && (
              <Text style={styles.projectDescription}>{project.description}</Text>
            )}
            {project.deadline && (
              <View style={styles.deadlineChip}>
                <Calendar color={colors.primary} size={14} />
                <Text style={[styles.deadlineText, { color: colors.primary }]}>
                  Due {new Date(project.deadline).toLocaleDateString('en-US', {
                    month: 'short',
                    day: 'numeric',
                    year: 'numeric'
                  })}
                </Text>
              </View>
            )}
          </View>
        </SafeAreaView>
      </LinearGradient>

      <ScrollView style={styles.content} contentContainerStyle={styles.contentContainer}>
        <View style={styles.statsRow}>
          <Card style={styles.statCard}>
            <View style={[styles.statIcon, { backgroundColor: `${colors.primary}15` }]}>
              <CheckCircle2 color={colors.primary} size={22} strokeWidth={2.5} fill="none" />
            </View>
            <Text style={styles.statValue}>{completedTasks}</Text>
            <Text style={styles.statLabel}>Completed</Text>
          </Card>

          <Card style={styles.statCard}>
            <View style={[styles.statIcon, { backgroundColor: `${colors.secondary}15` }]}>
              <Clock color={colors.secondary} size={22} strokeWidth={2.5} fill="none" />
            </View>
            <Text style={styles.statValue}>{totalTasks - completedTasks}</Text>
            <Text style={styles.statLabel}>Remaining</Text>
          </Card>

          <Card style={styles.statCard}>
            <View style={[styles.statIcon, { backgroundColor: `${colors.accent}15` }]}>
              <TrendingUp color={colors.accent} size={22} strokeWidth={2.5} fill="none" />
            </View>
            <Text style={styles.statValue}>{Math.round(progress)}%</Text>
            <Text style={styles.statLabel}>Progress</Text>
          </Card>
        </View>

        <Card style={styles.progressBarCard}>
          <View style={styles.progressBarHeader}>
            <Text style={styles.progressBarTitle}>Overall Progress</Text>
            <Text style={styles.progressBarPercentage}>{Math.round(progress)}%</Text>
          </View>
          <View style={styles.progressBarBackground}>
            <LinearGradient
              colors={[colors.primary, colors.secondary]}
              start={{ x: 0, y: 0 }}
              end={{ x: 1, y: 0 }}
              style={[styles.progressBarFill, { width: `${progress}%` }]}
            />
          </View>
          <Text style={styles.progressBarSubtitle}>
            {completedTasks} of {totalTasks} tasks completed
          </Text>
        </Card>

        <View style={[styles.notesCard, { backgroundColor: `${colors.primary}10` }]}>
          <View style={styles.notesHeader}>
            <Text style={styles.notesTitle}>Notes</Text>
            <TouchableOpacity
              style={[styles.notesEditButton, { backgroundColor: isEditingNotes ? colors.primary : `${colors.primary}20` }]}
              onPress={() => {
                if (isEditingNotes && project) {
                  updateProject(project.id, { notes: projectNotes });
                }
                setIsEditingNotes(!isEditingNotes);
              }}
              activeOpacity={0.7}
            >
              {isEditingNotes ? (
                <Check color={Colors.white} size={16} strokeWidth={2.5} />
              ) : (
                <Edit2 color={colors.primary} size={16} strokeWidth={2.5} />
              )}
            </TouchableOpacity>
          </View>
          {isEditingNotes ? (
            <TextInput
              style={[styles.notesTextInput, { 
                backgroundColor: `${colors.primary}18`,
                borderColor: colors.primary,
                color: Colors.text
              }]}
              placeholder="Add project notes..."
              placeholderTextColor={Colors.textSecondary}
              value={projectNotes}
              onChangeText={setProjectNotes}
              multiline
              textAlignVertical="top"
              autoFocus
            />
          ) : (
            <TouchableOpacity
              style={styles.notesReadOnlyContainer}
              onPress={() => setIsEditingNotes(true)}
              activeOpacity={0.7}
            >
              <Text style={styles.notesReadOnlyText}>
                {projectNotes || 'Tap the pencil icon to add notes...'}
              </Text>
            </TouchableOpacity>
          )}
        </View>

        <View style={styles.tasksHeader}>
          <View style={[styles.tasksHeaderIcon, { backgroundColor: `${colors.primary}15` }]}>
            <ListTodo color={colors.primary} size={20} strokeWidth={2.5} fill="none" />
          </View>
          <Text style={styles.tasksTitle}>Tasks</Text>
          <View style={[styles.tasksBadge, { backgroundColor: `${colors.secondary}15` }]}>
            <Text style={[styles.tasksBadgeText, { color: colors.secondary }]}>{totalTasks}</Text>
          </View>
        </View>

        {projectTasks.length === 0 ? (
          <Card style={styles.emptyCard}>
            <View style={styles.emptyIconContainer}>
              <CheckCircle2 color={Colors.textSecondary} size={48} />
            </View>
            <Text style={styles.emptyText}>No tasks yet</Text>
            <Text style={styles.emptySubtext}>Tap the + button to add your first task</Text>
          </Card>
        ) : (
          <View style={styles.tasksList}>
            {projectTasks.map((task) => (
              <ProjectTaskCard
                key={task.id}
                task={task}
                onLongPress={() => setLongPressedTask(task)}
                onToggleComplete={() => updateTask(task.id, { completed: !task.completed })}
              />
            ))}
          </View>
        )}
      </ScrollView>

      <TouchableOpacity
        style={[styles.addButton, { backgroundColor: colors.primary, shadowColor: colors.primary }]}
        onPress={openAddModal}
        activeOpacity={0.8}
      >
        <Plus color={Colors.white} size={28} />
      </TouchableOpacity>

      <Modal
        visible={isAddingTask}
        animationType="slide"
        transparent={false}
        onRequestClose={() => {
          setIsAddingTask(false);
          setEditingTask(null);
        }}
      >
        <View style={styles.fullPageModal}>
          <SafeAreaView edges={['top', 'bottom']} style={styles.modalSafeArea}>
            <View style={styles.modalHeader}>
              <TouchableOpacity
                style={styles.backButton}
                onPress={() => {
                  setIsAddingTask(false);
                  setEditingTask(null);
                }}
                activeOpacity={0.7}
              >
                <ArrowLeft color={Colors.text} size={24} />
              </TouchableOpacity>
              <Text style={styles.modalTitle}>{editingTask ? 'Edit Task' : 'Add Task'}</Text>
              <View style={styles.placeholder} />
            </View>

            <ScrollView 
              style={styles.modalScroll}
              contentContainerStyle={styles.modalScrollContent}
              showsVerticalScrollIndicator={false}
            >
              <Text style={styles.label}>Title</Text>
              <TextInput
                style={styles.input}
                placeholder="Task title"
                placeholderTextColor={Colors.textSecondary}
                value={taskTitle}
                onChangeText={setTaskTitle}
              />

              <Text style={styles.label}>Emoji</Text>
              <ScrollView 
                horizontal 
                showsHorizontalScrollIndicator={false}
                style={styles.emojiScroll}
                contentContainerStyle={styles.emojiScrollContent}
              >
                {EMOJI_OPTIONS.map((emoji) => (
                  <TouchableOpacity
                    key={emoji}
                    style={[
                      styles.emojiOption,
                      taskEmoji === emoji && [styles.emojiOptionSelected, { borderColor: colors.primary, backgroundColor: `${colors.primary}15` }]
                    ]}
                    onPress={() => setTaskEmoji(emoji)}
                    activeOpacity={0.7}
                  >
                    <Text style={styles.emojiText}>{emoji}</Text>
                  </TouchableOpacity>
                ))}
              </ScrollView>

              <Text style={styles.label}>Date</Text>
              <TouchableOpacity
                style={styles.inputField}
                onPress={() => setShowDatePicker(true)}
                activeOpacity={0.7}
              >
                <Text style={styles.inputFieldText}>
                  {taskDate.toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' })}
                </Text>
              </TouchableOpacity>

              <Text style={styles.label}>Notes (Optional)</Text>
              <TextInput
                style={styles.notesInput}
                placeholder="Add notes"
                placeholderTextColor={Colors.textSecondary}
                value={taskNotes}
                onChangeText={setTaskNotes}
                multiline
                numberOfLines={6}
                textAlignVertical="top"
              />

              <TouchableOpacity
                style={[styles.saveButton, { backgroundColor: colors.primary, shadowColor: colors.primary }]}
                onPress={handleAddTask}
                activeOpacity={0.7}
              >
                <Text style={styles.saveButtonText}>{editingTask ? 'Save Changes' : 'Add Task'}</Text>
              </TouchableOpacity>

              {editingTask && (
                <TouchableOpacity
                  style={styles.deleteButton}
                  onPress={() => setDeleteConfirmTask(editingTask)}
                  activeOpacity={0.7}
                >
                  <Trash2 color="#FF4D4D" size={20} />
                  <Text style={styles.deleteButtonText}>Delete Task</Text>
                </TouchableOpacity>
              )}
            </ScrollView>
          </SafeAreaView>
        </View>
      </Modal>

      <Modal
        visible={longPressedTask !== null}
        transparent
        animationType="fade"
        onRequestClose={() => setLongPressedTask(null)}
      >
        <TouchableOpacity
          style={styles.optionsOverlay}
          activeOpacity={1}
          onPress={() => setLongPressedTask(null)}
        >
          <View style={styles.optionsSheet}>
            <TouchableOpacity
              style={styles.optionButton}
              onPress={() => {
                if (longPressedTask) handleEditTask(longPressedTask);
              }}
              activeOpacity={0.7}
            >
              <Text style={styles.optionText}>Edit Task</Text>
            </TouchableOpacity>
            <View style={styles.optionDivider} />
            <TouchableOpacity
              style={styles.optionButton}
              onPress={() => {
                if (longPressedTask) {
                  setDeleteConfirmTask(longPressedTask);
                  setLongPressedTask(null);
                }
              }}
              activeOpacity={0.7}
            >
              <Text style={[styles.optionText, styles.optionTextDanger]}>Delete Task</Text>
            </TouchableOpacity>
          </View>
        </TouchableOpacity>
      </Modal>

      <Modal
        visible={deleteConfirmTask !== null}
        transparent
        animationType="fade"
        onRequestClose={() => setDeleteConfirmTask(null)}
      >
        <View style={styles.confirmOverlay}>
          <View style={styles.confirmModal}>
            <Text style={styles.confirmTitle}>Delete Task</Text>
            <Text style={styles.confirmMessage}>Are you sure you want to delete this task?</Text>
            <View style={styles.confirmButtons}>
              <TouchableOpacity
                style={[styles.confirmButton, styles.confirmButtonCancel]}
                onPress={() => setDeleteConfirmTask(null)}
                activeOpacity={0.7}
              >
                <Text style={styles.confirmButtonTextCancel}>Cancel</Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={[styles.confirmButton, styles.confirmButtonDelete]}
                onPress={handleDeleteTask}
                activeOpacity={0.7}
              >
                <Text style={styles.confirmButtonTextDelete}>Delete</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>

      <AdvancedDateTimePicker
        visible={showDatePicker}
        mode="date"
        value={taskDate}
        onConfirm={(date) => {
          setTaskDate(date);
          setShowDatePicker(false);
        }}
        onCancel={() => setShowDatePicker(false)}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.background,
  },
  headerGradient: {
    paddingBottom: 32,
    borderBottomLeftRadius: 32,
    borderBottomRightRadius: 32,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 20,
    paddingTop: 16,
    paddingBottom: 20,
  },
  backButton: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: 'rgba(255, 255, 255, 0.25)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  placeholder: {
    width: 44,
  },
  heroSection: {
    paddingHorizontal: 20,
    paddingBottom: 8,
    alignItems: 'center',
  },
  emojiContainer: {
    width: 80,
    height: 80,
    borderRadius: 40,
    backgroundColor: 'rgba(255, 255, 255, 0.25)',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 16,
  },
  projectEmoji: {
    fontSize: 40,
  },
  projectTitle: {
    fontSize: 28,
    fontWeight: '700',
    color: Colors.white,
    textAlign: 'center',
    marginBottom: 8,
  },
  projectDescription: {
    fontSize: 15,
    fontWeight: '500',
    color: 'rgba(255, 255, 255, 0.9)',
    textAlign: 'center',
    marginBottom: 12,
  },
  deadlineChip: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    backgroundColor: Colors.white,
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 20,
  },
  deadlineText: {
    fontSize: 13,
    fontWeight: '600',
  },
  content: {
    flex: 1,
  },
  contentContainer: {
    padding: 20,
    paddingBottom: 100,
  },
  errorText: {
    fontSize: 16,
    color: Colors.textSecondary,
    textAlign: 'center',
    marginTop: 40,
  },
  statsRow: {
    flexDirection: 'row',
    gap: 12,
    marginBottom: 20,
  },
  statCard: {
    flex: 1,
    padding: 16,
    alignItems: 'center',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.08,
    shadowRadius: 12,
    elevation: 3,
  },
  statIcon: {
    width: 48,
    height: 48,
    borderRadius: 24,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 12,
    overflow: 'visible',
  },
  statValue: {
    fontSize: 24,
    fontWeight: '700',
    color: Colors.text,
    marginBottom: 4,
  },
  statLabel: {
    fontSize: 12,
    fontWeight: '600',
    color: Colors.textSecondary,
  },
  progressBarCard: {
    padding: 20,
    marginBottom: 24,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.08,
    shadowRadius: 12,
    elevation: 3,
  },
  progressBarHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
  },
  progressBarTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: Colors.text,
  },
  progressBarPercentage: {
    fontSize: 20,
    fontWeight: '700',
    color: Colors.text,
  },
  progressBarBackground: {
    height: 12,
    backgroundColor: '#F0F0F0',
    borderRadius: 6,
    overflow: 'hidden',
    marginBottom: 12,
  },
  progressBarFill: {
    height: '100%',
    borderRadius: 6,
  },
  progressBarSubtitle: {
    fontSize: 13,
    fontWeight: '500',
    color: Colors.textSecondary,
  },
  notesCard: {
    padding: 20,
    marginBottom: 24,
    borderRadius: 16,
    shadowColor: Colors.shadowColor,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.08,
    shadowRadius: 12,
    elevation: 3,
  },
  notesHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 12,
  },
  notesTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: Colors.text,
  },
  notesEditButton: {
    width: 32,
    height: 32,
    borderRadius: 8,
    alignItems: 'center',
    justifyContent: 'center',
  },
  notesTextInput: {
    borderRadius: 12,
    padding: 16,
    fontSize: 15,
    minHeight: 100,
    maxHeight: 200,
    borderWidth: 1.5,
  },
  notesReadOnlyContainer: {
    padding: 16,
    minHeight: 100,
    borderRadius: 12,
  },
  notesReadOnlyText: {
    fontSize: 15,
    color: Colors.textSecondary,
    lineHeight: 22,
  },
  tasksHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 16,
    gap: 12,
  },
  tasksHeaderIcon: {
    width: 36,
    height: 36,
    borderRadius: 10,
    alignItems: 'center',
    justifyContent: 'center',
    overflow: 'visible',
  },
  tasksTitle: {
    fontSize: 22,
    fontWeight: '700',
    color: Colors.text,
  },
  tasksBadge: {
    paddingHorizontal: 12,
    paddingVertical: 4,
    borderRadius: 12,
  },
  tasksBadgeText: {
    fontSize: 14,
    fontWeight: '700',
  },
  tasksList: {
    gap: 12,
  },
  taskCard: {
    padding: 16,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.08,
    shadowRadius: 8,
    elevation: 2,
  },
  taskCardCompleted: {
    backgroundColor: '#F5F5F5',
    opacity: 0.7,
  },
  taskContent: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  taskEmoji: {
    fontSize: 32,
  },
  taskInfo: {
    flex: 1,
  },
  taskTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: Colors.text,
    marginBottom: 4,
  },
  taskDate: {
    fontSize: 13,
    fontWeight: '500',
    color: Colors.textSecondary,
  },
  checkbox: {
    padding: 4,
  },
  checkboxCircle: {
    width: 28,
    height: 28,
    borderRadius: 14,
    borderWidth: 2.5,
    alignItems: 'center',
    justifyContent: 'center',
  },
  checkboxCircleChecked: {
  },
  checkmark: {
    width: 14,
    height: 14,
    borderRadius: 7,
    backgroundColor: Colors.white,
  },
  emptyCard: {
    alignItems: 'center',
    padding: 48,
  },
  emptyIconContainer: {
    width: 80,
    height: 80,
    borderRadius: 40,
    backgroundColor: '#F0F0F0',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 20,
  },
  emptyText: {
    fontSize: 18,
    fontWeight: '600',
    color: Colors.text,
    marginBottom: 8,
  },
  emptySubtext: {
    fontSize: 14,
    color: Colors.textSecondary,
    textAlign: 'center',
  },
  addButton: {
    position: 'absolute',
    right: 20,
    bottom: 100,
    width: 64,
    height: 64,
    borderRadius: 32,
    alignItems: 'center',
    justifyContent: 'center',
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.4,
    shadowRadius: 16,
    elevation: 10,
  },
  fullPageModal: {
    flex: 1,
    backgroundColor: Colors.background,
  },
  modalSafeArea: {
    flex: 1,
  },
  modalHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 20,
    paddingTop: 20,
    paddingBottom: 16,
  },
  modalTitle: {
    fontSize: 20,
    fontWeight: '600',
    color: Colors.text,
  },
  modalScroll: {
    flex: 1,
  },
  modalScrollContent: {
    padding: 20,
    paddingBottom: 40,
  },
  label: {
    fontSize: 14,
    fontWeight: '600',
    color: Colors.text,
    marginBottom: 12,
  },
  input: {
    backgroundColor: '#F6F8FF',
    borderRadius: 12,
    padding: 16,
    fontSize: 16,
    color: Colors.text,
    marginBottom: 20,
    shadowColor: Colors.shadowColor,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 8,
    elevation: 2,
  },
  emojiScroll: {
    marginBottom: 20,
  },
  emojiScrollContent: {
    gap: 12,
  },
  emojiOption: {
    width: 56,
    height: 56,
    borderRadius: 12,
    backgroundColor: Colors.white,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 2,
    borderColor: 'transparent',
    shadowColor: Colors.shadowColor,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.08,
    shadowRadius: 8,
    elevation: 2,
  },
  emojiOptionSelected: {
  },
  emojiText: {
    fontSize: 28,
  },
  inputField: {
    backgroundColor: '#F6F8FF',
    borderRadius: 12,
    padding: 16,
    marginBottom: 20,
    shadowColor: Colors.shadowColor,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 8,
    elevation: 2,
  },
  inputFieldText: {
    fontSize: 16,
    color: Colors.text,
    fontWeight: '500',
  },
  notesInput: {
    backgroundColor: '#F6F8FF',
    borderRadius: 12,
    padding: 16,
    fontSize: 16,
    color: Colors.text,
    marginBottom: 24,
    minHeight: 120,
    shadowColor: Colors.shadowColor,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 8,
    elevation: 2,
  },
  saveButton: {
    paddingVertical: 16,
    borderRadius: 12,
    alignItems: 'center',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 12,
    elevation: 4,
    marginBottom: 12,
  },
  saveButtonText: {
    fontSize: 16,
    fontWeight: '600',
    color: Colors.white,
  },
  deleteButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    paddingVertical: 16,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#FFE5E5',
    backgroundColor: '#FFF5F5',
  },
  deleteButtonText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#FF4D4D',
  },
  optionsOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.4)',
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  optionsSheet: {
    backgroundColor: Colors.white,
    borderRadius: 16,
    width: '100%',
    maxWidth: 300,
    overflow: 'hidden',
    shadowColor: Colors.shadowColor,
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.15,
    shadowRadius: 20,
    elevation: 8,
  },
  optionButton: {
    paddingVertical: 18,
    paddingHorizontal: 20,
    alignItems: 'center',
  },
  optionDivider: {
    height: 1,
    backgroundColor: '#F0F0F0',
  },
  optionText: {
    fontSize: 16,
    fontWeight: '600',
    color: Colors.text,
  },
  optionTextDanger: {
    color: '#FF4D4D',
  },
  confirmOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  confirmModal: {
    backgroundColor: Colors.white,
    borderRadius: 20,
    padding: 24,
    width: '100%',
    maxWidth: 340,
    shadowColor: Colors.shadowColor,
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.15,
    shadowRadius: 20,
    elevation: 8,
  },
  confirmTitle: {
    fontSize: 20,
    fontWeight: '700',
    color: Colors.text,
    marginBottom: 12,
    textAlign: 'center',
  },
  confirmMessage: {
    fontSize: 16,
    color: Colors.textSecondary,
    marginBottom: 24,
    textAlign: 'center',
    lineHeight: 22,
  },
  confirmButtons: {
    flexDirection: 'row',
    gap: 12,
  },
  confirmButton: {
    flex: 1,
    paddingVertical: 14,
    borderRadius: 12,
    alignItems: 'center',
  },
  confirmButtonCancel: {
    backgroundColor: '#F6F8FF',
  },
  confirmButtonTextCancel: {
    fontSize: 16,
    fontWeight: '600',
    color: Colors.text,
  },
  confirmButtonDelete: {
    backgroundColor: '#FF4D4D',
  },
  confirmButtonTextDelete: {
    fontSize: 16,
    fontWeight: '600',
    color: Colors.white,
  },
});
