import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Plus, Edit2 } from 'lucide-react-native';
import { useRouter } from 'expo-router';
import Card from '@/components/Card';
import EmptyState from '@/components/EmptyState';
import Colors from '@/constants/colors';
import { useActiveEntries } from '@/contexts/JournalContext';
import { useTheme } from '@/contexts/ThemeContext';

export default function JournalScreen() {
  const router = useRouter();
  const entries = useActiveEntries();
  const { colors: themeColors } = useTheme();

  const handleEdit = (id: string) => {
    router.push(`/journal-entry?id=${id}`);
  };

  const handleAdd = () => {
    router.push('/journal-entry');
  };

  return (
    <View style={styles.container}>
      <SafeAreaView edges={['top']} style={styles.safeArea}>
        <View style={styles.header}>
          <View>
            <Text style={styles.headerSubtitle}>JOURNAL</Text>
            <Text style={styles.headerTitle}>Your Thoughts</Text>
          </View>
          <TouchableOpacity
            style={[styles.addButton, { backgroundColor: themeColors.primary }]}
            onPress={handleAdd}
            activeOpacity={0.8}
          >
            <Plus color={Colors.white} size={24} strokeWidth={2.5} />
          </TouchableOpacity>
        </View>
      </SafeAreaView>

      <ScrollView style={styles.content} contentContainerStyle={styles.contentContainer}>
        {entries.length === 0 ? (
          <EmptyState 
            icon="book"
            title="No journal entries yet"
            description="Start journaling to track your thoughts and progress"
            iconColor={themeColors.primary}
          />
        ) : (
          <View style={styles.entriesList}>
            {entries.map((entry) => (
              <Card key={entry.id} style={styles.entryCard}>
                <View style={styles.entryHeader}>
                  <Text style={styles.entryDate}>
                    {new Date(entry.date).toLocaleDateString('en-US', {
                      weekday: 'long',
                      year: 'numeric',
                      month: 'long',
                      day: 'numeric',
                    })}
                  </Text>
                  <TouchableOpacity
                    onPress={() => handleEdit(entry.id)}
                    activeOpacity={0.7}
                  >
                    <Edit2 color={themeColors.primary} size={20} strokeWidth={2.5} />
                  </TouchableOpacity>
                </View>
                {entry.title && <Text style={styles.entryTitle}>{entry.title}</Text>}
                <Text style={styles.entryContent}>{entry.content}</Text>
              </Card>
            ))}
          </View>
        )}
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.background,
  },
  safeArea: {
    backgroundColor: Colors.background,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingVertical: 16,
  },
  headerSubtitle: {
    fontSize: 11,
    fontWeight: '700',
    color: Colors.textSecondary,
    letterSpacing: 1.5,
    marginBottom: 4,
  },
  headerTitle: {
    fontSize: 28,
    fontWeight: '700',
    color: Colors.text,
  },
  addButton: {
    width: 48,
    height: 48,
    borderRadius: 14,
    alignItems: 'center',
    justifyContent: 'center',
  },
  content: {
    flex: 1,
  },
  contentContainer: {
    padding: 20,
    paddingBottom: 140,
  },
  entriesList: {
    gap: 16,
  },
  entryCard: {
    padding: 20,
    backgroundColor: Colors.white,
    borderRadius: 20,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 8,
    elevation: 2,
  },
  entryHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
  },
  entryDate: {
    fontSize: 14,
    fontWeight: '600',
    color: Colors.textSecondary,
  },
  entryTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: Colors.text,
    marginBottom: 8,
  },
  entryContent: {
    fontSize: 16,
    lineHeight: 24,
    color: Colors.text,
  },
});
