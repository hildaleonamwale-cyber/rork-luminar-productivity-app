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
import { ArrowLeft, Calendar } from 'lucide-react-native';
import { useRouter } from 'expo-router';
import Colors from '@/constants/colors';
import { useGoals } from '@/contexts/GoalsContext';
import AdvancedDateTimePicker from '@/components/AdvancedDateTimePicker';
import { useTheme } from '@/contexts/ThemeContext';

export default function AddGoalScreen() {
  const router = useRouter();
  const { addGoal } = useGoals();
  const { colors: themeColors } = useTheme();
  const [goalTitle, setGoalTitle] = useState('');
  const [targetDays, setTargetDays] = useState('');
  const [startDate, setStartDate] = useState(new Date());
  const [showDatePicker, setShowDatePicker] = useState(false);

  const handleSave = () => {
    if (!goalTitle.trim() || !targetDays.trim()) return;

    const days = parseInt(targetDays);
    if (isNaN(days) || days <= 0) return;

    addGoal({
      title: goalTitle,
      icon: 'flame',
      targetDays: days,
      startDate: startDate.toISOString().split('T')[0],
    });

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
          <Text style={styles.title}>Add Goal</Text>
          <View style={styles.backButton} />
        </View>

        <ScrollView style={styles.content} contentContainerStyle={styles.contentInner} showsVerticalScrollIndicator={false}>
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
            <Text style={styles.saveButtonText}>Create Goal</Text>
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
