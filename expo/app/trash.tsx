import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Modal,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { ArrowLeft, RotateCcw, Trash2 } from 'lucide-react-native';
import { useRouter } from 'expo-router';
import Card from '@/components/Card';
import EmptyState from '@/components/EmptyState';
import Colors from '@/constants/colors';
import { useDeletedTasks, useTasks } from '@/contexts/TasksContext';
import { useDeletedGoals, useGoals } from '@/contexts/GoalsContext';
import { useDeletedProjects, useProjects } from '@/contexts/ProjectsContext';
import { useDeletedEntries, useJournal } from '@/contexts/JournalContext';
import { useTheme } from '@/contexts/ThemeContext';

type ItemType = 'task' | 'goal' | 'project' | 'entry';

export default function TrashScreen() {
  const router = useRouter();
  const deletedTasks = useDeletedTasks();
  const { colors: themeColors } = useTheme();
  const deletedGoals = useDeletedGoals();
  const deletedProjects = useDeletedProjects();
  const deletedEntries = useDeletedEntries();
  
  const { restoreTask, permanentlyDeleteTask } = useTasks();
  const { restoreGoal, permanentlyDeleteGoal } = useGoals();
  const { restoreProject, permanentlyDeleteProject } = useProjects();
  const { restoreEntry, permanentlyDeleteEntry } = useJournal();

  const [confirmDelete, setConfirmDelete] = useState<{ id: string; type: ItemType } | null>(null);

  const handleRestore = (id: string, type: ItemType) => {
    switch (type) {
      case 'task':
        restoreTask(id);
        break;
      case 'goal':
        restoreGoal(id);
        break;
      case 'project':
        restoreProject(id);
        break;
      case 'entry':
        restoreEntry(id);
        break;
    }
  };

  const handlePermanentDelete = () => {
    if (!confirmDelete) return;
    
    switch (confirmDelete.type) {
      case 'task':
        permanentlyDeleteTask(confirmDelete.id);
        break;
      case 'goal':
        permanentlyDeleteGoal(confirmDelete.id);
        break;
      case 'project':
        permanentlyDeleteProject(confirmDelete.id);
        break;
      case 'entry':
        permanentlyDeleteEntry(confirmDelete.id);
        break;
    }
    
    setConfirmDelete(null);
  };

  const totalDeleted = deletedTasks.length + deletedGoals.length + 
                       deletedProjects.length + deletedEntries.length;

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
          <Text style={styles.headerTitle}>Trash</Text>
          <View style={styles.placeholder} />
        </View>
      </SafeAreaView>

      <ScrollView style={styles.content} contentContainerStyle={styles.contentContainer}>
        {totalDeleted === 0 ? (
          <EmptyState 
            icon="trash"
            title="Trash is empty"
            description="Deleted items will appear here"
            iconColor={themeColors.primary}
          />
        ) : (
          <View style={styles.itemsList}>
            {deletedTasks.map((task) => (
              <Card key={task.id} style={styles.itemCard}>
                <View style={styles.itemHeader}>
                  <View>
                    <Text style={styles.itemTitle}>{task.title}</Text>
                    <Text style={styles.itemType}>Task · {task.category}</Text>
                  </View>
                  <View style={styles.itemActions}>
                    <TouchableOpacity
                      style={styles.actionButton}
                      onPress={() => handleRestore(task.id, 'task')}
                      activeOpacity={0.7}
                    >
                      <RotateCcw color={themeColors.primary} size={20} />
                    </TouchableOpacity>
                    <TouchableOpacity
                      style={styles.actionButton}
                      onPress={() => setConfirmDelete({ id: task.id, type: 'task' })}
                      activeOpacity={0.7}
                    >
                      <Trash2 color={themeColors.accent} size={20} />
                    </TouchableOpacity>
                  </View>
                </View>
              </Card>
            ))}

            {deletedGoals.map((goal) => (
              <Card key={goal.id} style={styles.itemCard}>
                <View style={styles.itemHeader}>
                  <View>
                    <Text style={styles.itemTitle}>{goal.title}</Text>
                    <Text style={styles.itemType}>Goal · {goal.targetDays} days</Text>
                  </View>
                  <View style={styles.itemActions}>
                    <TouchableOpacity
                      style={styles.actionButton}
                      onPress={() => handleRestore(goal.id, 'goal')}
                      activeOpacity={0.7}
                    >
                      <RotateCcw color={themeColors.primary} size={20} />
                    </TouchableOpacity>
                    <TouchableOpacity
                      style={styles.actionButton}
                      onPress={() => setConfirmDelete({ id: goal.id, type: 'goal' })}
                      activeOpacity={0.7}
                    >
                      <Trash2 color={themeColors.accent} size={20} />
                    </TouchableOpacity>
                  </View>
                </View>
              </Card>
            ))}

            {deletedProjects.map((project) => (
              <Card key={project.id} style={styles.itemCard}>
                <View style={styles.itemHeader}>
                  <View>
                    <Text style={styles.itemTitle}>{project.title}</Text>
                    <Text style={styles.itemType}>Project</Text>
                  </View>
                  <View style={styles.itemActions}>
                    <TouchableOpacity
                      style={styles.actionButton}
                      onPress={() => handleRestore(project.id, 'project')}
                      activeOpacity={0.7}
                    >
                      <RotateCcw color={themeColors.primary} size={20} />
                    </TouchableOpacity>
                    <TouchableOpacity
                      style={styles.actionButton}
                      onPress={() => setConfirmDelete({ id: project.id, type: 'project' })}
                      activeOpacity={0.7}
                    >
                      <Trash2 color={themeColors.accent} size={20} />
                    </TouchableOpacity>
                  </View>
                </View>
              </Card>
            ))}

            {deletedEntries.map((entry) => (
              <Card key={entry.id} style={styles.itemCard}>
                <View style={styles.itemHeader}>
                  <View style={styles.entryPreview}>
                    <Text style={styles.itemTitle} numberOfLines={1}>
                      {entry.content.substring(0, 50)}...
                    </Text>
                    <Text style={styles.itemType}>Journal Entry</Text>
                  </View>
                  <View style={styles.itemActions}>
                    <TouchableOpacity
                      style={styles.actionButton}
                      onPress={() => handleRestore(entry.id, 'entry')}
                      activeOpacity={0.7}
                    >
                      <RotateCcw color={themeColors.primary} size={20} />
                    </TouchableOpacity>
                    <TouchableOpacity
                      style={styles.actionButton}
                      onPress={() => setConfirmDelete({ id: entry.id, type: 'entry' })}
                      activeOpacity={0.7}
                    >
                      <Trash2 color={themeColors.accent} size={20} />
                    </TouchableOpacity>
                  </View>
                </View>
              </Card>
            ))}
          </View>
        )}
      </ScrollView>

      <Modal
        visible={confirmDelete !== null}
        transparent
        animationType="fade"
        onRequestClose={() => setConfirmDelete(null)}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <Text style={styles.modalTitle}>Permanent Delete</Text>
            <Text style={styles.modalText}>
              This action cannot be undone. Are you sure you want to permanently delete this item?
            </Text>
            <View style={styles.modalButtons}>
              <TouchableOpacity
                style={[styles.modalButton, styles.cancelButton]}
                onPress={() => setConfirmDelete(null)}
                activeOpacity={0.7}
              >
                <Text style={styles.cancelButtonText}>Cancel</Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={[styles.modalButton, styles.deleteButton, { backgroundColor: themeColors.accent }]}
                onPress={handlePermanentDelete}
                activeOpacity={0.7}
              >
                <Text style={styles.deleteButtonText}>Delete</Text>
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
    fontSize: 24,
    fontWeight: '700',
    color: Colors.text,
  },
  placeholder: {
    width: 40,
  },
  content: {
    flex: 1,
  },
  contentContainer: {
    padding: 20,
    paddingBottom: 140,
  },
  emptyCard: {
    alignItems: 'center',
    padding: 40,
  },
  emptyText: {
    fontSize: 16,
    color: Colors.textSecondary,
  },
  itemsList: {
    gap: 12,
  },
  itemCard: {
    padding: 16,
  },
  itemHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  itemTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: Colors.text,
    marginBottom: 4,
  },
  itemType: {
    fontSize: 13,
    color: Colors.textSecondary,
    textTransform: 'capitalize',
  },
  entryPreview: {
    flex: 1,
    marginRight: 12,
  },
  itemActions: {
    flexDirection: 'row',
    gap: 8,
  },
  actionButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: '#F6F8FF',
    alignItems: 'center',
    justifyContent: 'center',
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
