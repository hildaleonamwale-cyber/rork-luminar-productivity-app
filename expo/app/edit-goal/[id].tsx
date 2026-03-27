import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  TextInput,
  Modal,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { ArrowLeft, Calendar, Trash2 } from 'lucide-react-native';
import { useRouter, useLocalSearchParams } from 'expo-router';
import Colors from '@/constants/colors';
import { useGoals } from '@/contexts/GoalsContext';
import AdvancedDateTimePicker from '@/components/AdvancedDateTimePicker';
import { useTheme } from '@/contexts/ThemeContext';

export default function EditGoalScreen() {
  const router = useRouter();
  const { id } = useLocalSearchParams();
  const { goals, updateGoal, deleteGoal } = useGoals();
  const { colors: themeColors } = useTheme();
  const [goalTitle, setGoalTitle] = useState('');
  const [targetDays, setTargetDays] = useState('');
  const [startDate, setStartDate] = useState(new Date());
  const [showDatePicker, setShowDatePicker] = useState(false);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);

  const goal = goals.find(g => g.id === id);

  useEffect(() => {
    if (goal) {
      setGoalTitle(goal.title);
      setTargetDays(goal.targetDays.toString());
      setStartDate(new Date(goal.startDate));
    }
  }, [goal]);

  const handleSave = () => {
    if (!goalTitle.trim() || !targetDays.trim() || !goal) return;

    const days = parseInt(targetDays);
    if (isNaN(days) || days <= 0) return;

    updateGoal(goal.id, {
      title: goalTitle,
      targetDays: days,
      startDate: startDate.toISOString().split('T')[0],
    });

    router.back();
  };

  if (!goal) {
    return (
      <View style={styles.container}>
        <SafeAreaView edges={['top']} style={styles.safeArea}>
          <Text style={styles.errorText}>Goal not found</Text>
        </SafeAreaView>
      </View>
    );
  }

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
          <Text style={styles.title}>Edit Goal</Text>
          <View style={styles.backButton} />
        </View>

        <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
          <Text style={styles.label}>Goal Title</Text>
          <TextInput
            style={styles.input}
            placeholder="Enter goal title"
            placeholderTextColor={Colors.textSecondary}
            value={goalTitle}
            onChangeText={setGoalTitle}
          />

          <Text style={styles.label}>Duration (Days)</Text>
          <TextInput
            style={styles.input}
            placeholder="e.g., 30, 100, 360"
            placeholderTextColor={Colors.textSecondary}
            value={targetDays}
            onChangeText={setTargetDays}
            keyboardType="number-pad"
          />
          <Text style={styles.helperText}>Set how many days you want to track this goal</Text>

          <Text style={styles.label}>Start Date</Text>
          <TouchableOpacity
            style={styles.dateField}
            onPress={() => setShowDatePicker(true)}
            activeOpacity={0.7}
          >
            <Calendar color={themeColors.primary} size={20} />
            <Text style={styles.dateFieldText}>
              {startDate.toLocaleDateString('en-US', {
                month: 'long',
                day: 'numeric',
                year: 'numeric',
              })}
            </Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={[
              styles.saveButton,
              { backgroundColor: themeColors.primary, shadowColor: themeColors.primary },
              (!goalTitle.trim() || !targetDays.trim()) && styles.saveButtonDisabled
            ]}
            onPress={handleSave}
            activeOpacity={0.7}
            disabled={!goalTitle.trim() || !targetDays.trim()}
          >
            <Text style={styles.saveButtonText}>Save Changes</Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={[styles.deleteButton, { borderColor: `${themeColors.accent}30`, backgroundColor: `${themeColors.accent}10` }]}
            onPress={() => setShowDeleteConfirm(true)}
            activeOpacity={0.7}
          >
            <Trash2 color={themeColors.accent} size={20} />
            <Text style={[styles.deleteButtonText, { color: themeColors.accent }]}>Move to Trash</Text>
          </TouchableOpacity>
        </ScrollView>
      </SafeAreaView>

      <AdvancedDateTimePicker
        visible={showDatePicker}
        mode="date"
        value={startDate}
        onConfirm={(date) => {
          setStartDate(date);
          setShowDatePicker(false);
        }}
        onCancel={() => setShowDatePicker(false)}
      />

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
                style={[styles.modalButton, styles.trashButton, { backgroundColor: themeColors.accent }]}
                onPress={() => {
                  deleteGoal(id as string);
                  setShowDeleteConfirm(false);
                  router.back();
                }}
                activeOpacity={0.7}
              >
                <Text style={styles.trashButtonText}>Move to Trash</Text>
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
    padding: 20,
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
  helperText: {
    fontSize: 14,
    color: Colors.textSecondary,
    marginTop: 8,
    marginBottom: 8,
  },
  dateField: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    backgroundColor: '#F6F8FF',
    borderRadius: 16,
    padding: 18,
    shadowColor: Colors.shadowColor,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.08,
    shadowRadius: 8,
    elevation: 2,
  },
  dateFieldText: {
    flex: 1,
    fontSize: 16,
    fontWeight: '600',
    color: Colors.text,
  },
  saveButton: {
    borderRadius: 16,
    paddingVertical: 18,
    alignItems: 'center',
    marginTop: 32,
    marginBottom: 40,
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
  errorText: {
    fontSize: 16,
    color: Colors.textSecondary,
    textAlign: 'center',
    marginTop: 40,
  },
  deleteButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    paddingVertical: 16,
    borderRadius: 16,
    borderWidth: 1.5,
    marginBottom: 40,
  },
  deleteButtonText: {
    fontSize: 16,
    fontWeight: '600',
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
  trashButton: {
  },
  trashButtonText: {
    fontSize: 16,
    fontWeight: '600',
    color: Colors.white,
  },
});