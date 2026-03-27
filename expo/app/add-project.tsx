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
import { useProjects } from '@/contexts/ProjectsContext';
import AdvancedDateTimePicker from '@/components/AdvancedDateTimePicker';
import { useTheme } from '@/contexts/ThemeContext';

export default function AddProjectScreen() {
  const router = useRouter();
  const { addProject } = useProjects();
  const { colors: themeColors } = useTheme();
  const [projectTitle, setProjectTitle] = useState('');
  const [projectDescription, setProjectDescription] = useState('');
  const [deadline, setDeadline] = useState<Date | null>(null);
  const [showDatePicker, setShowDatePicker] = useState(false);

  const handleSave = () => {
    if (!projectTitle.trim()) return;

    addProject({
      title: projectTitle,
      description: projectDescription,
      deadline: deadline ? deadline.toISOString() : undefined,
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
          <Text style={styles.title}>Add Project</Text>
          <View style={styles.backButton} />
        </View>

        <ScrollView style={styles.content} contentContainerStyle={styles.contentInner} showsVerticalScrollIndicator={false}>
          <Text style={styles.label}>Project Title</Text>
          <TextInput
            style={styles.input}
            placeholder="Enter project title"
            placeholderTextColor={Colors.textSecondary}
            value={projectTitle}
            onChangeText={setProjectTitle}
          />

          <Text style={styles.label}>Deadline (Optional)</Text>
          <TouchableOpacity
            style={styles.dateButton}
            onPress={() => setShowDatePicker(true)}
            activeOpacity={0.7}
          >
            <Calendar color={themeColors.primary} size={20} />
            <Text style={styles.dateButtonText}>
              {deadline
                ? deadline.toLocaleDateString('en-US', {
                    month: 'short',
                    day: 'numeric',
                    year: 'numeric',
                  })
                : 'Select deadline'}
            </Text>
            {deadline && (
              <TouchableOpacity
                onPress={(e) => {
                  e.stopPropagation();
                  setDeadline(null);
                }}
                style={styles.clearButton}
              >
                <Text style={styles.clearButtonText}>×</Text>
              </TouchableOpacity>
            )}
          </TouchableOpacity>

          <Text style={styles.label}>Description (Optional)</Text>
          <TextInput
            style={[styles.input, styles.textArea]}
            placeholder="Add a description for your project"
            placeholderTextColor={Colors.textSecondary}
            value={projectDescription}
            onChangeText={setProjectDescription}
            multiline
            numberOfLines={4}
            textAlignVertical="top"
          />

          <TouchableOpacity
            style={[
              styles.saveButton,
              { backgroundColor: themeColors.primary, shadowColor: themeColors.primary },
              !projectTitle.trim() && styles.saveButtonDisabled
            ]}
            onPress={handleSave}
            activeOpacity={0.7}
            disabled={!projectTitle.trim()}
          >
            <Text style={styles.saveButtonText}>Create Project</Text>
          </TouchableOpacity>
        </ScrollView>
      </SafeAreaView>

      {showDatePicker && (
        <AdvancedDateTimePicker
          visible={showDatePicker}
          mode="date"
          value={deadline || new Date()}
          onConfirm={(date) => {
            setDeadline(date);
            setShowDatePicker(false);
          }}
          onCancel={() => setShowDatePicker(false)}
        />
      )}
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
