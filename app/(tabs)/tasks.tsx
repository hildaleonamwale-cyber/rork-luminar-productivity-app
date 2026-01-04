import React, { useState, useMemo, useRef, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Modal,
  Pressable,
  Animated,
  StatusBar,
} from 'react-native';
import * as Haptics from 'expo-haptics';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useRouter, useFocusEffect } from 'expo-router';
import { Plus, Circle, CheckCircle2, ChevronLeft, ChevronRight, Briefcase, User, Heart, BookOpen, Trash2, Edit3, X } from 'lucide-react-native';
import Card from '@/components/Card';
import EmptyState from '@/components/EmptyState';
import Colors from '@/constants/colors';
import { useTasks, useTasksByDate } from '@/contexts/TasksContext';
import { Category, Task } from '@/constants/types';
import { useTheme } from '@/contexts/ThemeContext';

type TabType = 'inProgress' | 'completed';

export default function TasksScreen() {
  const router = useRouter();
  const { updateTask, deleteTask } = useTasks();
  const { colors: themeColors } = useTheme();
  const [selectedDate, setSelectedDate] = useState(() => {
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    return today;
  });
  const [selectedTab, setSelectedTab] = useState<TabType>('inProgress');
  const [showActionModal, setShowActionModal] = useState(false);
  const [selectedTask, setSelectedTask] = useState<Task | null>(null);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const dateScrollRef = useRef<ScrollView>(null);
  const [currentTime, setCurrentTime] = useState(new Date());

  const dateString = `${selectedDate.getFullYear()}-${String(selectedDate.getMonth() + 1).padStart(2, '0')}-${String(selectedDate.getDate()).padStart(2, '0')}`;
  const allTasksForDate = useTasksByDate(dateString);

  useFocusEffect(
    React.useCallback(() => {
      const today = new Date();
      today.setHours(0, 0, 0, 0);
      setSelectedDate(today);
    }, [])
  );

  useEffect(() => {
    const interval = setInterval(() => {
      setCurrentTime(new Date());
    }, 30000);

    return () => clearInterval(interval);
  }, []);

  useEffect(() => {
    const today = new Date();
    const isCurrentMonth = selectedDate.getMonth() === today.getMonth() && 
                          selectedDate.getFullYear() === today.getFullYear();
    
    if (isCurrentMonth) {
      const currentDay = today.getDate();
      const dateItemWidth = 60;
      const dateItemGap = 12;
      const scrollPosition = (currentDay - 1) * (dateItemWidth + dateItemGap);
      
      setTimeout(() => {
        dateScrollRef.current?.scrollTo({
          x: scrollPosition,
          animated: true,
        });
      }, 100);
    }
  }, [selectedDate]);
  
  const tasksForDate = useMemo(() => {
    if (selectedTab === 'completed') {
      return allTasksForDate.filter(task => task.completed);
    }
    return allTasksForDate.filter(task => !task.completed);
  }, [allTasksForDate, selectedTab]);

  const scrollDates = useMemo(() => {
    const dates: Date[] = [];
    const year = selectedDate.getFullYear();
    const month = selectedDate.getMonth();
    const daysInMonth = new Date(year, month + 1, 0).getDate();
    
    for (let day = 1; day <= daysInMonth; day++) {
      const date = new Date(year, month, day);
      dates.push(date);
    }
    return dates;
  }, [selectedDate]);



  const handleLongPress = (task: Task) => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
    setSelectedTask(task);
    setShowActionModal(true);
  };

  const handleEditTask = () => {
    if (!selectedTask) return;
    
    setShowActionModal(false);
    router.push(`/edit-task/${selectedTask.id}`);
    setSelectedTask(null);
  };

  const handleDeleteTask = () => {
    setShowActionModal(false);
    setShowDeleteModal(true);
  };

  const confirmDeleteTask = () => {
    if (selectedTask) {
      deleteTask(selectedTask.id);
    }
    setShowDeleteModal(false);
    setSelectedTask(null);
  };

  const changeMonth = (direction: number) => {
    const newDate = new Date(selectedDate);
    newDate.setMonth(newDate.getMonth() + direction);
    setSelectedDate(newDate);
  };

  const calculateDuration = (startTime?: string, endTime?: string) => {
    if (!startTime || !endTime) return null;
    
    const [startH, startM] = startTime.split(':').map(Number);
    const [endH, endM] = endTime.split(':').map(Number);
    
    const startMinutes = startH * 60 + startM;
    const endMinutes = endH * 60 + endM;
    const diff = endMinutes - startMinutes;
    
    if (diff <= 0) return null;
    
    const hours = Math.floor(diff / 60);
    const minutes = diff % 60;
    
    if (hours === 0) return `${minutes}min`;
    if (minutes === 0) return `${hours}hr`;
    return `${hours}hr ${minutes}min`;
  };

  const isTaskActive = (task: Task) => {
    if (!task.time || !task.endTime) return false;
    
    const currentMinutes = currentTime.getHours() * 60 + currentTime.getMinutes();
    
    const [startH, startM] = task.time.split(':').map(Number);
    const [endH, endM] = task.endTime.split(':').map(Number);
    
    const startMinutes = startH * 60 + startM;
    const endMinutes = endH * 60 + endM;
    
    const taskDateStr = task.date;
    const todayStr = currentTime.toISOString().split('T')[0];
    
    if (taskDateStr !== todayStr) return false;
    
    return currentMinutes >= startMinutes && currentMinutes < endMinutes;
  };

  interface TaskCardItemProps {
    task: Task;
    duration: string | null;
    isLast: boolean;
    isActive: boolean;
    IconComponent: React.ComponentType<any>;
    onLongPress: () => void;
    onToggleComplete: () => void;
  }

  const TaskCardItem = ({ task, duration, isLast, isActive, IconComponent, onLongPress, onToggleComplete }: TaskCardItemProps) => {
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
      <View style={styles.timelineItem}>
        <View style={styles.timelineLeft}>
          {task.time && <Text style={styles.timeText}>{task.time}</Text>}
        </View>
        
        <View style={styles.timelineCenter}>
          <View style={[
            styles.timelineDot,
            isActive && [styles.timelineDotActive, { backgroundColor: themeColors.primary }]
          ]} />
          {!isLast && <View style={styles.timelineLine} />}
        </View>
        
        <Pressable
          style={styles.taskCardWrapper}
          onLongPress={onLongPress}
          onPressIn={handleLongPressIn}
          onPressOut={handleLongPressOut}
          delayLongPress={500}
        >
          <Animated.View style={{
            transform: [{ scale: scaleAnim }, { translateY: translateYAnim }]
          }}>
            <Card style={[
              styles.taskCard,
              isActive && [styles.taskCardActive, { backgroundColor: `${themeColors.primary}15` }]
            ]}>
              <View style={styles.taskCardContent}>
                <View style={[
                  styles.taskIcon,
                  { backgroundColor: Colors.categoryColors[task.category] }
                ]}>
                  <IconComponent 
                    color={Colors.white} 
                    size={18}
                    strokeWidth={2.5}
                    fill="none"
                  />
                </View>
                <View style={styles.taskInfo}>
                  <Text style={styles.taskTitle}>{task.title}</Text>
                  {task.time && (
                    <View style={styles.taskMeta}>
                      <Text style={styles.taskMetaText}>
                        {task.time}{task.endTime ? `-${task.endTime}` : ''}
                      </Text>
                      {duration && (
                        <>
                          <Text style={styles.taskMetaDot}> • </Text>
                          <Text style={styles.taskMetaText}>{duration}</Text>
                        </>
                      )}
                    </View>
                  )}
                </View>
                <TouchableOpacity
                  onPress={onToggleComplete}
                  activeOpacity={0.7}
                  style={styles.checkButton}
                >
                  {task.completed ? (
                    <CheckCircle2 color={themeColors.primary} size={24} fill="none" strokeWidth={2.5} />
                  ) : (
                    <Circle color="#667085" size={24} fill="none" strokeWidth={2.5} />
                  )}
                </TouchableOpacity>
              </View>
            </Card>
          </Animated.View>
        </Pressable>
      </View>
    );
  };

  const getCategoryIcon = (category: Category) => {
    switch (category) {
      case 'work':
        return Briefcase;
      case 'personal':
        return User;
      case 'fitness':
        return Heart;
      case 'learning':
        return BookOpen;
      default:
        return User;
    }
  };





  return (
    <View style={styles.container}>
      <StatusBar barStyle="dark-content" backgroundColor="#FFFFFF" />
      <View style={[styles.calendarBackground, { backgroundColor: '#FFFFFF', shadowColor: '#000' }]}>
        <SafeAreaView edges={['top']} style={styles.safeArea}>
          <View style={styles.header}>
            <View style={styles.monthSelector}>
              <TouchableOpacity onPress={() => changeMonth(-1)} activeOpacity={0.7}>
                <ChevronLeft color={Colors.text} size={24} fill="none" strokeWidth={2.5} />
              </TouchableOpacity>
              <Text style={[styles.monthText, { color: Colors.text }]}>
                {selectedDate.toLocaleDateString('en-US', { month: 'long', year: 'numeric' })}
              </Text>
              <TouchableOpacity onPress={() => changeMonth(1)} activeOpacity={0.7}>
                <ChevronRight color={Colors.text} size={24} fill="none" strokeWidth={2.5} />
              </TouchableOpacity>
            </View>
          </View>

          <ScrollView 
            ref={dateScrollRef}
            horizontal 
            showsHorizontalScrollIndicator={false}
            style={styles.dateScroll}
            contentContainerStyle={styles.dateScrollContent}
          >
            {scrollDates.map((date, index) => {
              const isSelected = date.toDateString() === selectedDate.toDateString();
              const isToday = date.toDateString() === new Date().toDateString();
              return (
                <TouchableOpacity
                  key={index}
                  style={[styles.dateItem, isSelected && [styles.dateItemSelected, { backgroundColor: themeColors.primary }]]}
                  onPress={() => setSelectedDate(date)}
                  activeOpacity={0.7}
                >
                  <Text style={[styles.dateDay, isSelected && styles.dateTextSelected, !isSelected && { color: Colors.text }]}>
                    {date.toLocaleDateString('en-US', { weekday: 'short' })}
                  </Text>
                  <Text style={[styles.dateNumber, isSelected && styles.dateTextSelected, !isSelected && { color: Colors.text }]}>
                    {date.getDate()}
                  </Text>
                  {isToday && !isSelected && <View style={[styles.todayDot, { backgroundColor: themeColors.primary }]} />}
                </TouchableOpacity>
              );
            })}
          </ScrollView>
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

        {tasksForDate.length === 0 ? (
          <EmptyState 
            icon={selectedTab === 'completed' ? 'check' : 'inbox'}
            title={selectedTab === 'completed' ? 'No completed tasks' : 'No tasks yet'}
            description={selectedTab === 'completed' 
              ? 'Completed tasks will appear here'
              : 'Add your first task to get started'}
            iconColor={themeColors.primary}
          />
        ) : (
          <View style={styles.timeline}>
            {tasksForDate
              .sort((a, b) => (a.time || '').localeCompare(b.time || ''))
              .map((task, index) => {
                const duration = calculateDuration(task.time, task.endTime);
                const isLast = index === tasksForDate.length - 1;
                const isActive = isTaskActive(task);
                const IconComponent = getCategoryIcon(task.category);
                
                return (
                  <TaskCardItem
                    key={task.id}
                    task={task}
                    duration={duration}
                    isLast={isLast}
                    isActive={isActive}
                    IconComponent={IconComponent}
                    onLongPress={() => handleLongPress(task)}
                    onToggleComplete={() => updateTask(task.id, { completed: !task.completed })}
                  />
                );
              })}
          </View>
        )}
      </ScrollView>

      <TouchableOpacity
        style={[styles.addButton, { backgroundColor: themeColors.secondary, shadowColor: themeColors.secondary }]}
        onPress={() => router.push('/add-task')}
        activeOpacity={0.8}
      >
        <View style={styles.addButtonInner}>
          <Plus color={Colors.white} size={28} strokeWidth={3.5} fill="none" />
        </View>
      </TouchableOpacity>

      <Modal
        visible={showActionModal}
        transparent
        animationType="fade"
        onRequestClose={() => {
          setShowActionModal(false);
          setSelectedTask(null);
        }}
      >
        <Pressable 
          style={styles.actionModalOverlay}
          onPress={() => {
            setShowActionModal(false);
            setSelectedTask(null);
          }}
        >
          <Pressable style={styles.actionModalContent} onPress={(e) => e.stopPropagation()}>
            <View style={styles.actionModalHeader}>
              <Text style={styles.actionModalTitle}>Task Actions</Text>
              <TouchableOpacity
                onPress={() => {
                  setShowActionModal(false);
                  setSelectedTask(null);
                }}
                activeOpacity={0.7}
              >
                <X color={Colors.textSecondary} size={24} />
              </TouchableOpacity>
            </View>
            
            <TouchableOpacity
              style={styles.actionButton}
              onPress={handleEditTask}
              activeOpacity={0.7}
            >
              <View style={[styles.actionIconContainer, { backgroundColor: 'rgba(59, 130, 246, 0.1)' }]}>
                <Edit3 color="#3B82F6" size={22} strokeWidth={2} />
              </View>
              <View style={styles.actionTextContainer}>
                <Text style={styles.actionTitle}>Edit Task</Text>
                <Text style={styles.actionDescription}>Modify task details</Text>
              </View>
            </TouchableOpacity>

            <View style={{ height: 12 }} />

            <TouchableOpacity
              style={styles.actionButton}
              onPress={handleDeleteTask}
              activeOpacity={0.7}
            >
              <View style={[styles.actionIconContainer, { backgroundColor: 'rgba(239, 68, 68, 0.1)' }]}>
                <Trash2 color={Colors.accent} size={22} strokeWidth={2} />
              </View>
              <View style={styles.actionTextContainer}>
                <Text style={styles.actionTitle}>Delete Task</Text>
                <Text style={styles.actionDescription}>Remove this task permanently</Text>
              </View>
            </TouchableOpacity>
          </Pressable>
        </Pressable>
      </Modal>

      <Modal
        visible={showDeleteModal}
        transparent
        animationType="fade"
        onRequestClose={() => {
          setShowDeleteModal(false);
          setSelectedTask(null);
        }}
      >
        <Pressable 
          style={styles.deleteModalOverlay}
          onPress={() => {
            setShowDeleteModal(false);
            setSelectedTask(null);
          }}
        >
          <Pressable style={styles.deleteModal}>
            <Text style={styles.deleteModalTitle}>Delete Task</Text>
            <Text style={styles.deleteModalText}>
              Are you sure you want to delete this task?
            </Text>
            <View style={styles.deleteModalButtons}>
              <TouchableOpacity
                style={[styles.deleteModalButton, styles.deleteModalCancelButton, { borderColor: themeColors.primary }]}
                onPress={() => {
                  setShowDeleteModal(false);
                  setSelectedTask(null);
                }}
                activeOpacity={0.7}
              >
                <Text style={[styles.deleteModalCancelText, { color: themeColors.primary }]}>Cancel</Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={[styles.deleteModalButton, styles.deleteModalDeleteButton]}
                onPress={confirmDeleteTask}
                activeOpacity={0.7}
              >
                <Text style={styles.deleteModalDeleteText}>Delete</Text>
              </TouchableOpacity>
            </View>
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
  calendarBackground: {
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
    marginBottom: 20,
  },
  monthSelector: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  monthText: {
    fontSize: 20,
    fontWeight: '600',
    color: Colors.white,
  },
  dateScroll: {
    marginBottom: 20,
  },
  dateScrollContent: {
    paddingRight: 20,
    gap: 12,
  },
  dateItem: {
    width: 60,
    paddingVertical: 12,
    borderRadius: 12,
    backgroundColor: '#F3F4F6',
    alignItems: 'center',
    shadowColor: Colors.shadowColor,
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.04,
    shadowRadius: 4,
    elevation: 1,
  },
  dateItemSelected: {
    backgroundColor: 'rgba(255, 255, 255, 0.3)',
    borderWidth: 2,
    borderColor: Colors.white,
  },
  dateDay: {
    fontSize: 12,
    fontWeight: '500',
    marginBottom: 4,
  },
  dateNumber: {
    fontSize: 18,
    fontWeight: '700',
  },
  dateTextSelected: {
    color: Colors.white,
  },
  todayDot: {
    width: 4,
    height: 4,
    borderRadius: 2,
    marginTop: 4,
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
  timeline: {
    gap: 0,
  },
  timelineItem: {
    flexDirection: 'row',
    marginBottom: 16,
  },
  timelineLeft: {
    width: 50,
    paddingTop: 16,
    alignItems: 'flex-end',
    paddingRight: 12,
  },
  timeText: {
    fontSize: 12,
    fontWeight: '600',
    color: '#667085',
    letterSpacing: -0.2,
  },
  timelineCenter: {
    alignItems: 'center',
    width: 20,
  },
  timelineDot: {
    width: 10,
    height: 10,
    borderRadius: 5,
    backgroundColor: '#D0D5DD',
    marginTop: 20,
  },
  timelineDotActive: {
    width: 12,
    height: 12,
    borderRadius: 6,
  },
  timelineLine: {
    width: 2,
    flex: 1,
    backgroundColor: '#E4E7EC',
    marginTop: 4,
  },
  taskCardWrapper: {
    flex: 1,
    marginLeft: 12,
  },
  taskCard: {
    padding: 16,
  },
  taskCardActive: {
  },
  taskCardContent: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  taskIcon: {
    width: 40,
    height: 40,
    borderRadius: 20,
    alignItems: 'center',
    justifyContent: 'center',
  },
  taskInfo: {
    flex: 1,
  },
  taskTitle: {
    fontSize: 15,
    fontWeight: '600',
    color: Colors.text,
    marginBottom: 4,
    lineHeight: 20,
  },
  taskMeta: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 2,
  },
  taskMetaText: {
    fontSize: 13,
    color: '#667085',
    fontWeight: '500',
  },
  taskMetaDot: {
    fontSize: 13,
    color: '#667085',
  },
  checkButton: {
    padding: 4,
  },
  addButton: {
    position: 'absolute',
    right: 20,
    bottom: 100,
    width: 58,
    height: 58,
    borderRadius: 29,
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.15,
    shadowRadius: 8,
    elevation: 4,
  },
  addButtonInner: {
    width: '100%',
    height: '100%',
    alignItems: 'center',
    justifyContent: 'center',
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'flex-end',
  },
  modalContent: {
    backgroundColor: Colors.white,
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
    padding: 24,
    maxHeight: '80%',
  },
  modalTitle: {
    fontSize: 24,
    fontWeight: '700',
    color: Colors.text,
    marginBottom: 24,
  },
  input: {
    backgroundColor: Colors.softPeach,
    borderRadius: 12,
    padding: 16,
    fontSize: 16,
    color: Colors.text,
    marginBottom: 20,
    shadowColor: Colors.shadowColor,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.08,
    shadowRadius: 8,
    elevation: 2,
  },
  notesInput: {
    minHeight: 100,
  },
  label: {
    fontSize: 14,
    fontWeight: '600',
    color: Colors.text,
    marginBottom: 12,
  },
  categoryGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 12,
    marginBottom: 20,
  },
  categoryChip: {
    paddingVertical: 12,
    paddingHorizontal: 24,
    borderRadius: 24,
    shadowColor: Colors.shadowColor,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.08,
    shadowRadius: 8,
    elevation: 2,
  },
  categoryChipText: {
    fontSize: 15,
    fontWeight: '700',
    textTransform: 'capitalize',
  },
  fieldInput: {
    backgroundColor: Colors.softPeach,
    borderRadius: 12,
    padding: 16,
    marginBottom: 20,
    shadowColor: Colors.shadowColor,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.08,
    shadowRadius: 8,
    elevation: 2,
  },
  fieldInputText: {
    fontSize: 16,
    color: Colors.text,
    fontWeight: '500',
  },
  placeholderText: {
    color: Colors.textSecondary,
  },
  errorText: {
    fontSize: 14,
    color: Colors.accent,
    marginTop: -12,
    marginBottom: 12,
    marginLeft: 4,
  },
  modalButtons: {
    flexDirection: 'row',
    gap: 12,
    marginTop: 20,
  },
  modalButton: {
    flex: 1,
    paddingVertical: 16,
    borderRadius: 12,
    alignItems: 'center',
  },
  cancelButton: {
    backgroundColor: Colors.softPeach,
  },
  cancelButtonText: {
    fontSize: 16,
    fontWeight: '600',
    color: Colors.text,
  },
  saveButton: {
  },
  saveButtonDisabled: {
    backgroundColor: Colors.textSecondary,
    shadowColor: Colors.shadowColor,
    opacity: 0.6,
  },
  saveButtonText: {
    fontSize: 16,
    fontWeight: '600',
    color: Colors.white,
  },
  fullPageModal: {
    flex: 1,
    backgroundColor: Colors.background,
  },
  fullPageSafeArea: {
    flex: 1,
  },
  fullPageHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 20,
    paddingVertical: 16,
    borderBottomWidth: 1,
    borderBottomColor: Colors.softPeach,
  },
  backButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: Colors.softPeach,
    alignItems: 'center',
    justifyContent: 'center',
  },
  fullPageTitle: {
    fontSize: 20,
    fontWeight: '700',
    color: Colors.text,
  },
  fullPageContent: {
    flex: 1,
    padding: 20,
  },
  actionModalOverlay: {
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
  actionModalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 24,
  },
  actionModalTitle: {
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
  deleteModalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  deleteModal: {
    backgroundColor: Colors.white,
    borderRadius: 16,
    padding: 24,
    width: '100%',
    maxWidth: 340,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.08,
    shadowRadius: 12,
    elevation: 2,
  },
  deleteModalTitle: {
    fontSize: 20,
    fontWeight: '700',
    color: Colors.text,
    marginBottom: 12,
    textAlign: 'center',
  },
  deleteModalText: {
    fontSize: 16,
    color: Colors.textSecondary,
    marginBottom: 24,
    textAlign: 'center',
    lineHeight: 22,
  },
  deleteModalButtons: {
    flexDirection: 'row',
    gap: 12,
  },
  deleteModalButton: {
    flex: 1,
    paddingVertical: 14,
    borderRadius: 12,
    alignItems: 'center',
  },
  deleteModalCancelButton: {
    backgroundColor: Colors.white,
    borderWidth: 2,
  },
  deleteModalCancelText: {
    fontSize: 16,
    fontWeight: '600',
  },
  deleteModalDeleteButton: {
    backgroundColor: Colors.accent,
  },
  deleteModalDeleteText: {
    fontSize: 16,
    fontWeight: '600',
    color: Colors.white,
  },
  deleteButton: {
    flexDirection: 'row',
    backgroundColor: Colors.white,
    borderWidth: 2,
    borderColor: Colors.accent,
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
  },
  deleteButtonText: {
    fontSize: 16,
    fontWeight: '600',
    color: Colors.accent,
  },
});
