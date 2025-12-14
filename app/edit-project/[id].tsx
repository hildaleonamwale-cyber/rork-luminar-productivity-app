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
import { useProjects } from '@/contexts/ProjectsContext';
import AdvancedDateTimePicker from '@/components/AdvancedDateTimePicker';
import { useTheme } from '@/contexts/ThemeContext';

export default function EditProjectScreen() {
  const router = useRouter();
  const { id } = useLocalSearchParams();
  const { projects, updateProject, deleteProject } = useProjects();
  const { colors: themeColors } = useTheme();
  const [projectTitle, setProjectTitle] = useState('');
  const [projectDescription, setProjectDescription] = useState('');
  const [deadline, setDeadline] = useState<Date | null>(null);
  const [showDatePicker, setShowDatePicker] = useState(false);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);

  const project = projects.find(p => p.id === id);

  useEffect(() => {
    if (project) {
      setProjectTitle(project.title);
      setProjectDescription(project.description || '');
      if (project.deadline) {
        setDeadline(new Date(project.deadline));
      }
    }
  }, [project]);

  const handleSave = () => {
    if (!projectTitle.trim() || !project) return;

    updateProject(project.id, {
      title: projectTitle,
      description: projectDescription,
      deadline: deadline ? deadline.toISOString() : undefined,
    });

    router.back();
  };

  if (!project) {
    return (
      <View style={styles.container}>
        <SafeAreaView edges={['top']} style={styles.safeArea}>
          <Text style={styles.errorText}>Project not found</Text>
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
          <Text style={styles.title}>Edit Project</Text>
          <View style={styles.backButton} />
        </View>

        <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
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
              Are you sure you want to move this project to trash? All tasks in this project will also be moved. You can restore it later.
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
                  deleteProject(id as string);
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