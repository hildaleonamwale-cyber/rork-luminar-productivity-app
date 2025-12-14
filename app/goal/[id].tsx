import React, { useMemo, useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Modal,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { ArrowLeft, Flame, Check, Trash2, Edit3 } from 'lucide-react-native';
import { useRouter, useLocalSearchParams } from 'expo-router';
import Card from '@/components/Card';
import Colors from '@/constants/colors';
import { useGoals } from '@/contexts/GoalsContext';
import { useTheme } from '@/contexts/ThemeContext';

export default function GoalDetailScreen() {
  const router = useRouter();
  const { id } = useLocalSearchParams();
  const { goals, toggleDayCompletion, deleteGoal } = useGoals();
  const { colors: themeColors } = useTheme();
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);

  const goal = goals.find(g => g.id === id);

  const calendarDays = useMemo(() => {
    if (!goal) return [];
    
    const startDate = new Date(goal.startDate);
    const today = new Date();
    const days: { date: string; dateObj: Date; isPast: boolean; isToday: boolean; dayName: string }[] = [];

    for (let i = 0; i < goal.targetDays; i++) {
      const currentDate = new Date(startDate);
      currentDate.setDate(currentDate.getDate() + i);
      const dateString = currentDate.toISOString().split('T')[0];
      const isPast = currentDate < today && currentDate.toDateString() !== today.toDateString();
      const isToday = currentDate.toDateString() === today.toDateString();
      const dayName = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'][currentDate.getDay()];
      
      days.push({
        date: dateString,
        dateObj: currentDate,
        isPast,
        isToday,
        dayName,
      });
    }

    return days;
  }, [goal]);

  const calendarRows = useMemo(() => {
    const rows: typeof calendarDays[] = [];
    for (let i = 0; i < calendarDays.length; i += 7) {
      rows.push(calendarDays.slice(i, i + 7));
    }
    return rows;
  }, [calendarDays]);

  if (!goal) {
    return (
      <View style={styles.container}>
        <SafeAreaView edges={['top']} style={styles.safeArea}>
          <Text style={styles.errorText}>Goal not found</Text>
        </SafeAreaView>
      </View>
    );
  }

  const completedCount = goal.completedDays.length;
  const isFuture = (dateObj: Date) => {
    const today = new Date();
    return dateObj > today && dateObj.toDateString() !== today.toDateString();
  };

  return (
    <View style={styles.container}>
      <SafeAreaView edges={['top']} style={styles.safeArea}>
        <View style={styles.header}>
          <TouchableOpacity
            style={[styles.backButton, { backgroundColor: `${themeColors.primary}20` }]}
            onPress={() => router.back()}
            activeOpacity={0.7}
          >
            <ArrowLeft color={themeColors.primary} size={24} />
          </TouchableOpacity>
          <Text style={styles.headerTitle}>{goal.title}</Text>
          <View style={styles.headerActions}>
            <TouchableOpacity
              style={[styles.actionButton, { backgroundColor: `${themeColors.primary}20` }]}
              onPress={() => router.push(`/edit-goal/${id}`)}
              activeOpacity={0.7}
            >
              <Edit3 color={themeColors.primary} size={20} />
            </TouchableOpacity>
            <TouchableOpacity
              style={[styles.actionButton, { backgroundColor: `${themeColors.accent}20` }]}
              onPress={() => setShowDeleteConfirm(true)}
              activeOpacity={0.7}
            >
              <Trash2 color={themeColors.accent} size={20} />
            </TouchableOpacity>
          </View>
        </View>
      </SafeAreaView>

      <ScrollView style={styles.content} contentContainerStyle={styles.contentContainer}>
        <Card style={styles.progressCard}>
          <View style={[styles.iconLarge, { backgroundColor: `${themeColors.primary}15` }]}>
            <Flame color={themeColors.primary} size={48} />
          </View>
          <Text style={styles.largeNumber}>{completedCount}</Text>
          <Text style={styles.largeLabel}>days completed</Text>
        </Card>

        <Card style={styles.calendarCard}>
          <Text style={styles.cardTitle}>Track Your Progress</Text>
          <View style={styles.calendar}>
            {calendarRows.map((row, rowIndex) => (
              <View key={rowIndex} style={styles.calendarRow}>
                {row.map((day, dayIndex) => {
                  const isCompleted = goal.completedDays.includes(day.date);
                  const isFutureDay = isFuture(day.dateObj);
                  const canToggle = !isFutureDay;

                  return (
                    <View key={dayIndex} style={styles.calendarDayContainer}>
                      <Text style={styles.dayLabel}>{day.dayName}</Text>
                      <TouchableOpacity
                        style={[
                          styles.calendarDay,
                          { backgroundColor: `${themeColors.primary}15` },
                          isCompleted && [styles.calendarDayCompleted, { backgroundColor: themeColors.primary }],
                          day.isToday && [styles.calendarDayToday, { borderColor: themeColors.secondary }],
                          isFutureDay && styles.calendarDayFuture,
                        ]}
                        onPress={() => canToggle && toggleDayCompletion(goal.id, day.date)}
                        activeOpacity={canToggle ? 0.7 : 1}
                        disabled={!canToggle}
                      >
                        {isCompleted ? (
                          <Check color={Colors.white} size={20} strokeWidth={3} />
                        ) : (
                          <Text
                            style={[
                              styles.calendarDayText,
                              isFutureDay && styles.calendarDayTextFuture,
                            ]}
                          >
                            {day.dateObj.getDate()}
                          </Text>
                        )}
                      </TouchableOpacity>
                    </View>
                  );
                })}
              </View>
            ))}
          </View>
        </Card>
      </ScrollView>

      <Modal
        visible={showDeleteConfirm}
        transparent
        animationType="fade"
        onRequestClose={() => setShowDeleteConfirm(false)}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <Text style={styles.modalTitle}>Move to Trash</Text>
            <Text style={styles.modalText}>
              Are you sure you want to move this goal to trash? You can restore it later.
            </Text>
            <View style={styles.modalButtons}>
              <TouchableOpacity
                style={[styles.modalButton, styles.cancelButton]}
                onPress={() => setShowDeleteConfirm(false)}
                activeOpacity={0.7}
              >
                <Text style={styles.cancelButtonText}>Cancel</Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={[styles.modalButton, styles.deleteButton, { backgroundColor: themeColors.accent }]}
                onPress={() => {
                  deleteGoal(id as string);
                  setShowDeleteConfirm(false);
                  router.back();
                }}
                activeOpacity={0.7}
              >
                <Text style={styles.deleteButtonText}>Move to Trash</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.background,
  },
  safeArea: {
    paddingHorizontal: 20,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginTop: 20,
    marginBottom: 24,
  },
  backButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    alignItems: 'center',
    justifyContent: 'center',
  },
  headerTitle: {
    fontSize: 20,
    fontWeight: '600',
    color: Colors.text,
  },
  placeholder: {
    width: 40,
  },
  headerActions: {
    flexDirection: 'row',
    gap: 8,
  },
  actionButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    alignItems: 'center',
    justifyContent: 'center',
  },
  content: {
    flex: 1,
  },
  contentContainer: {
    padding: 20,
    paddingBottom: 40,
  },
  errorText: {
    fontSize: 16,
    color: Colors.textSecondary,
    textAlign: 'center',
    marginTop: 40,
  },
  progressCard: {
    alignItems: 'center',
    paddingVertical: 32,
    marginBottom: 20,
  },
  iconLarge: {
    width: 80,
    height: 80,
    borderRadius: 40,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 20,
  },
  largeNumber: {
    fontSize: 64,
    fontWeight: '700',
    color: Colors.text,
    marginBottom: 8,
  },
  largeLabel: {
    fontSize: 16,
    color: Colors.textSecondary,
  },
  calendarCard: {
    padding: 20,
  },
  cardTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: Colors.text,
    marginBottom: 20,
  },
  calendar: {
    alignItems: 'center',
  },
  calendarRow: {
    flexDirection: 'row',
    justifyContent: 'center',
    marginBottom: 12,
  },
  calendarDayContainer: {
    alignItems: 'center',
    marginHorizontal: 3,
  },
  dayLabel: {
    fontSize: 10,
    fontWeight: '600',
    color: Colors.textSecondary,
    marginBottom: 6,
  },
  calendarDay: {
    width: 38,
    height: 38,
    borderRadius: 19,
    alignItems: 'center',
    justifyContent: 'center',
    position: 'relative',
  },
  calendarDayCompleted: {
  },
  calendarDayToday: {
    borderWidth: 2,
  },
  calendarDayFuture: {
    opacity: 0.3,
  },
  calendarDayText: {
    fontSize: 13,
    fontWeight: '600',
    color: Colors.text,
  },

  calendarDayTextFuture: {
    color: Colors.textSecondary,
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  modalContent: {
    backgroundColor: Colors.white,
    borderRadius: 20,
    padding: 24,
    width: '100%',
    maxWidth: 400,
  },
  modalTitle: {
    fontSize: 20,
    fontWeight: '600',
    color: Colors.text,
    marginBottom: 12,
  },
  modalText: {
    fontSize: 15,
    color: Colors.textSecondary,
    lineHeight: 22,
    marginBottom: 24,
  },
  modalButtons: {
    flexDirection: 'row',
    gap: 12,
  },
  modalButton: {
    flex: 1,
    paddingVertical: 14,
    borderRadius: 12,
    alignItems: 'center',
  },
  cancelButton: {
    backgroundColor: '#F6F8FF',
  },
  cancelButtonText: {
    fontSize: 16,
    fontWeight: '600',
    color: Colors.text,
  },
  deleteButton: {
  },
  deleteButtonText: {
    fontSize: 16,
    fontWeight: '600',
    color: Colors.white,
  },
});
