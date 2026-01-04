import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  StatusBar,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { ArrowLeft, Plus, Edit2 } from 'lucide-react-native';
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
      <StatusBar barStyle="dark-content" backgroundColor="#FFFFFF" />
      <View style={[styles.topBarBackground, { backgroundColor: '#FFFFFF', shadowColor: '#000' }]}>
        <SafeAreaView edges={['top']} style={styles.safeArea}>
          <View style={styles.header}>
            <TouchableOpacity
              style={styles.backButton}
              onPress={() => router.back()}
              activeOpacity={0.7}
            >
              <ArrowLeft color={themeColors.primary} size={24} />
            </TouchableOpacity>
            <Text style={[styles.headerTitle, { color: Colors.text }]}>Journal</Text>
            <TouchableOpacity
              style={styles.addButtonHeader}
              onPress={handleAdd}
              activeOpacity={0.7}
            >
              <Plus color={themeColors.primary} size={24} />
            </TouchableOpacity>
          </View>
        </SafeAreaView>
      </View>

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
                    <Edit2 color={themeColors.secondary} size={20} />
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
  topBarBackground: {
    borderBottomLeftRadius: 32,
    borderBottomRightRadius: 32,
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.2,
    shadowRadius: 16,
    elevation: 8,
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
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  headerTitle: {
    fontSize: 24,
    fontWeight: '700',
    color: Colors.white,
  },
  addButtonHeader: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
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
  emptyCard: {
    alignItems: 'center',
    padding: 40,
  },
  emptyText: {
    fontSize: 16,
    color: Colors.textSecondary,
  },
  entriesList: {
    gap: 16,
  },
  entryCard: {
    padding: 20,
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
