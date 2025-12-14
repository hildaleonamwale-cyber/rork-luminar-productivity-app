import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  TextInput,
  KeyboardAvoidingView,
  Platform,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { ArrowLeft, Calendar, Clock } from 'lucide-react-native';
import { useRouter } from 'expo-router';
import Colors from '@/constants/colors';
import { useTasks } from '@/contexts/TasksContext';
import AdvancedDateTimePicker from '@/components/AdvancedDateTimePicker';
import { Category } from '@/constants/types';
import { useTheme } from '@/contexts/ThemeContext';

export default function AddTaskScreen() {
  const router = useRouter();
  const { addTask } = useTasks();
  const { colors: themeColors } = useTheme();
  const [taskTitle, setTaskTitle] = useState('');
  const [taskCategory, setTaskCategory] = useState<Category>('personal');
  const [taskDate, setTaskDate] = useState(() => {
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    return today;
  });
  const [taskTime, setTaskTime] = useState<Date | null>(null);
  const [taskEndTime, setTaskEndTime] = useState<Date | null>(null);
  const [taskNotes, setTaskNotes] = useState('');
  const [showDatePicker, setShowDatePicker] = useState(false);
  const [showTimePicker, setShowTimePicker] = useState(false);
  const [showEndTimePicker, setShowEndTimePicker] = useState(false);
  const [timeError, setTimeError] = useState<string>('');

  const handleSave = async () => {
    if (!taskTitle.trim()) {
      console.log('AddTask: Title is empty, not saving');
      return;
    }

    if (!taskTime || !taskEndTime) {
      setTimeError('Both start time and end time are required');
      return;
    }

    const startMinutes = taskTime.getHours() * 60 + taskTime.getMinutes();
    const endMinutes = taskEndTime.getHours() * 60 + taskEndTime.getMinutes();
    if (endMinutes <= startMinutes) {
      setTimeError('End time must be after start time');
      return;
    }
    
    setTimeError('');

    const dateString = `${taskDate.getFullYear()}-${String(taskDate.getMonth() + 1).padStart(2, '0')}-${String(taskDate.getDate()).padStart(2, '0')}`;

    const newTask = {
      title: taskTitle,
      category: taskCategory,
      date: dateString,
      time: taskTime ? `${taskTime.getHours().toString().padStart(2, '0')}:${taskTime.getMinutes().toString().padStart(2, '0')}` : undefined,
      endTime: taskEndTime ? `${taskEndTime.getHours().toString().padStart(2, '0')}:${taskEndTime.getMinutes().toString().padStart(2, '0')}` : undefined,
      completed: false,
      notes: taskNotes.trim() || undefined,
    };
    
    console.log('AddTask: Saving task:', newTask);
    addTask(newTask);
    
    console.log('AddTask: Task saved, navigating back');
    router.back();
  };

  return (
    <KeyboardAvoidingView 
      style={styles.container}
      behavior={Platform.OS === 'ios' ? 'padding' : undefined}
      keyboardVerticalOffset={Platform.OS === 'ios' ? 0 : 0}
    >
      <SafeAreaView edges={['top']} style={styles.safeArea}>
        <View style={styles.header}>
          <TouchableOpacity
            style={[styles.backButton, { backgroundColor: `${themeColors.primary}20` }]}
            onPress={() => router.back()}
            activeOpacity={0.7}
          >
            <ArrowLeft color={themeColors.primary} size={24} />
          </TouchableOpacity>
          <Text style={styles.title}>Add Task</Text>
          <View style={styles.backButton} />
        </View>

        <ScrollView style={styles.content} contentContainerStyle={styles.contentInner} showsVerticalScrollIndicator={false}>
          <Text style={styles.label}>Task Title</Text>
          <TextInput
            style={styles.input}
            placeholder="Enter task title"
            placeholderTextColor={Colors.textSecondary}
            value={taskTitle}
            onChangeText={setTaskTitle}
          />

          <Text style={styles.label}>Date</Text>
          <TouchableOpacity
            style={styles.dateButton}
            onPress={() => setShowDatePicker(true)}
            activeOpacity={0.7}
          >
            <Calendar color={themeColors.primary} size={20} />
            <Text style={styles.dateButtonText}>
              {taskDate.toLocaleDateString('en-US', {
                month: 'long',
                day: 'numeric',
                year: 'numeric',
              })}
            </Text>
          </TouchableOpacity>

          <Text style={styles.label}>Start Time</Text>
          <TouchableOpacity
            style={styles.dateButton}
            onPress={() => setShowTimePicker(true)}
            activeOpacity={0.7}
          >
            <Clock color={themeColors.primary} size={20} />
            <Text style={[styles.dateButtonText, !taskTime && styles.placeholderText]}>
              {taskTime 
                ? `${taskTime.getHours().toString().padStart(2, '0')}:${taskTime.getMinutes().toString().padStart(2, '0')}`
                : 'No time set'}
            </Text>
            {taskTime && (
              <TouchableOpacity
                onPress={(e) => {
                  e.stopPropagation();
                  setTaskTime(null);
                }}
                style={styles.clearButton}
              >
                <Text style={styles.clearButtonText}>×</Text>
              </TouchableOpacity>
            )}
          </TouchableOpacity>

          <Text style={styles.label}>End Time</Text>
          <TouchableOpacity
            style={styles.dateButton}
            onPress={() => setShowEndTimePicker(true)}
            activeOpacity={0.7}
          >
            <Clock color={themeColors.primary} size={20} />
            <Text style={[styles.dateButtonText, !taskEndTime && styles.placeholderText]}>
              {taskEndTime 
                ? `${taskEndTime.getHours().toString().padStart(2, '0')}:${taskEndTime.getMinutes().toString().padStart(2, '0')}`
                : 'No time set'}
            </Text>
            {taskEndTime && (
              <TouchableOpacity
                onPress={(e) => {
                  e.stopPropagation();
                  setTaskEndTime(null);
                }}
                style={styles.clearButton}
              >
                <Text style={styles.clearButtonText}>×</Text>
              </TouchableOpacity>
            )}
          </TouchableOpacity>
          {timeError ? (
            <Text style={styles.errorText}>{timeError}</Text>
          ) : null}

          <Text style={styles.label}>Category</Text>
          <View style={styles.categoryGrid}>
            {(['work', 'personal', 'fitness', 'learning'] as Category[]).map((cat) => {
              const isSelected = taskCategory === cat;
              return (
                <TouchableOpacity
                  key={cat}
                  style={[
                    styles.categoryChip,
                    isSelected 
                      ? { backgroundColor: Colors.categoryColors[cat] }
                      : { backgroundColor: '#F6F8FF' }
                  ]}
                  onPress={() => setTaskCategory(cat)}
                  activeOpacity={0.7}
                >
                  <Text style={[
                    styles.categoryChipText,
                    { color: isSelected ? Colors.white : Colors.categoryColors[cat] }
                  ]}>{cat}</Text>
                </TouchableOpacity>
              );
            })}
          </View>

          <Text style={styles.label}>Notes (Optional)</Text>
          <TextInput
            style={[styles.input, styles.textArea]}
            placeholder="Add notes..."
            placeholderTextColor={Colors.textSecondary}
            value={taskNotes}
            onChangeText={setTaskNotes}
            multiline
            numberOfLines={4}
            textAlignVertical="top"
          />

          <TouchableOpacity
            style={[
              styles.saveButton,
              { backgroundColor: themeColors.primary, shadowColor: themeColors.primary },
              (!taskTitle.trim() || !taskTime || !taskEndTime) && styles.saveButtonDisabled
            ]}
            onPress={handleSave}
            activeOpacity={0.7}
            disabled={!taskTitle.trim() || !taskTime || !taskEndTime}
          >
            <Text style={styles.saveButtonText}>Create Task</Text>
          </TouchableOpacity>
        </ScrollView>
      </SafeAreaView>

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

      <AdvancedDateTimePicker
        visible={showTimePicker}
        mode="time"
        value={taskTime || new Date()}
        onConfirm={(date) => {
          setTaskTime(date);
          setShowTimePicker(false);
        }}
        onCancel={() => setShowTimePicker(false)}
      />

      <AdvancedDateTimePicker
        visible={showEndTimePicker}
        mode="time"
        value={taskEndTime || new Date()}
        onConfirm={(date) => {
          setTaskEndTime(date);
          setShowEndTimePicker(false);
        }}
        onCancel={() => setShowEndTimePicker(false)}
      />
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.background,
  },
  safeArea: {
    flex: 1,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 20,
    paddingVertical: 16,
  },
  backButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    alignItems: 'center',
    justifyContent: 'center',
  },
  title: {
    fontSize: 20,
    fontWeight: '700',
    color: Colors.text,
  },
  content: {
    flex: 1,
  },
  contentInner: {
    padding: 20,
    paddingBottom: 120,
  },
  label: {
    fontSize: 16,
    fontWeight: '700',
    color: Colors.text,
    marginBottom: 12,
    marginTop: 8,
  },
  input: {
    backgroundColor: '#F6F8FF',
    borderRadius: 16,
    padding: 18,
    fontSize: 16,
    color: Colors.text,
    fontWeight: '500',
    shadowColor: Colors.shadowColor,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.08,
    shadowRadius: 8,
    elevation: 2,
  },
  textArea: {
    height: 120,
    paddingTop: 18,
  },
  categoryGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 12,
    marginBottom: 8,
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
  dateButton: {
    backgroundColor: '#F6F8FF',
    borderRadius: 16,
    padding: 18,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    shadowColor: Colors.shadowColor,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.08,
    shadowRadius: 8,
    elevation: 2,
  },
  dateButtonText: {
    fontSize: 16,
    fontWeight: '500',
    color: Colors.text,
    flex: 1,
  },
  placeholderText: {
    color: Colors.textSecondary,
  },
  clearButton: {
    width: 28,
    height: 28,
    borderRadius: 14,
    backgroundColor: Colors.white,
    alignItems: 'center',
    justifyContent: 'center',
  },
  clearButtonText: {
    fontSize: 20,
    fontWeight: '700',
    color: Colors.textSecondary,
  },
  errorText: {
    fontSize: 14,
    color: Colors.accent,
    marginTop: 8,
    marginBottom: 8,
    marginLeft: 4,
  },
  saveButton: {
    borderRadius: 16,
    paddingVertical: 18,
    alignItems: 'center',
    marginTop: 32,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 12,
    elevation: 4,
  },
  saveButtonDisabled: {
    backgroundColor: Colors.textSecondary,
    shadowColor: Colors.shadowColor,
  },
  saveButtonText: {
    fontSize: 18,
    fontWeight: '700',
    color: Colors.white,
  },
});
