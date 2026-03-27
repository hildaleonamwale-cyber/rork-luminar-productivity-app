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
import { useRouter, useLocalSearchParams } from 'expo-router';
import Colors from '@/constants/colors';
import { useJournal } from '@/contexts/JournalContext';
import { useTheme } from '@/contexts/ThemeContext';
import AdvancedDateTimePicker from '@/components/AdvancedDateTimePicker';

export default function JournalEntryScreen() {
  const router = useRouter();
  const params = useLocalSearchParams();
  const { addEntry, updateEntry, entries } = useJournal();
  const { colors: themeColors } = useTheme();
  
  const editingId = params.id as string | undefined;
  const existingEntry = editingId ? entries.find(e => e.id === editingId) : null;

  const [entryTitle, setEntryTitle] = useState(existingEntry?.title || '');
  const [entryContent, setEntryContent] = useState(existingEntry?.content || '');
  const [entryDate, setEntryDate] = useState(
    existingEntry ? new Date(existingEntry.date) : new Date()
  );
  const [showDatePicker, setShowDatePicker] = useState(false);

  const handleSave = () => {
    const trimmedTitle = entryTitle.trim();
    const trimmedContent = entryContent.trim();
    
    if (!trimmedTitle && !trimmedContent) {
      console.log('Save blocked: Both title and content are empty');
      return;
    }

    console.log('Saving entry:', { trimmedTitle, trimmedContent, editingId });

    if (editingId) {
      updateEntry(editingId, { 
        title: trimmedTitle,
        content: trimmedContent, 
        date: entryDate.toISOString() 
      });
    } else {
      addEntry({
        title: trimmedTitle,
        date: entryDate.toISOString(),
        content: trimmedContent,
      });
    }

    console.log('Entry saved, navigating back');
    router.back();
  };

  return (
    <KeyboardAvoidingView 
      style={styles.container} 
      behavior={Platform.OS === 'ios' ? 'padding' : undefined}
      keyboardVerticalOffset={Platform.OS === 'ios' ? 0 : 0}
    >
      <View style={[styles.topBarBackground, { backgroundColor: themeColors.primary, shadowColor: themeColors.primary }]}>
        <SafeAreaView edges={['top']} style={styles.safeArea}>
          <View style={styles.header}>
            <TouchableOpacity
              style={styles.backButton}
              onPress={() => router.back()}
              activeOpacity={0.7}
            >
              <ArrowLeft color={Colors.white} size={24} />
            </TouchableOpacity>
            <Text style={styles.headerTitle}>
              {editingId ? 'Edit Entry' : 'New Entry'}
            </Text>
            <TouchableOpacity
              style={styles.saveButton}
              onPress={handleSave}
              activeOpacity={0.7}
            >
              <Text style={styles.saveButtonText}>Save</Text>
            </TouchableOpacity>
          </View>
        </SafeAreaView>
      </View>

      <ScrollView style={styles.content} contentContainerStyle={styles.contentContainer}>
        <TextInput
          style={styles.titleInput}
          placeholder="Title"
          placeholderTextColor={Colors.textSecondary + '60'}
          value={entryTitle}
          onChangeText={setEntryTitle}
          autoFocus={!editingId}
        />

        <TouchableOpacity
          style={[styles.dateField, { backgroundColor: themeColors.primary + '10' }]}
          onPress={() => setShowDatePicker(true)}
          activeOpacity={0.7}
        >
          <Calendar color={themeColors.primary} size={20} />
          <Text style={styles.dateFieldText}>
            {entryDate.toLocaleDateString('en-US', {
              weekday: 'long',
              year: 'numeric',
              month: 'long',
              day: 'numeric',
            })}
          </Text>
        </TouchableOpacity>

        <TextInput
          style={[styles.textArea, { backgroundColor: themeColors.primary + '10' }]}
          placeholder="Write your thoughts..."
          placeholderTextColor={Colors.textSecondary}
          value={entryContent}
          onChangeText={setEntryContent}
          multiline
        />
      </ScrollView>

      <AdvancedDateTimePicker
        visible={showDatePicker}
        mode="date"
        value={entryDate}
        onConfirm={(date) => {
          setEntryDate(date);
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
  saveButton: {
    paddingHorizontal: 20,
    paddingVertical: 10,
    borderRadius: 20,
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
  },
  saveButtonText: {
    fontSize: 16,
    fontWeight: '600',
    color: Colors.white,
  },
  content: {
    flex: 1,
  },
  contentContainer: {
    padding: 20,
    paddingBottom: 120,
  },
  titleInput: {
    fontSize: 32,
    fontWeight: '700',
    color: Colors.text,
    marginBottom: 20,
    paddingVertical: 8,
  },
  dateField: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    borderRadius: 16,
    padding: 16,
    marginBottom: 20,
  },
  dateFieldText: {
    flex: 1,
    fontSize: 16,
    fontWeight: '600',
    color: Colors.text,
  },
  textArea: {
    borderRadius: 16,
    padding: 16,
    fontSize: 16,
    lineHeight: 24,
    color: Colors.text,
    minHeight: 400,
    textAlignVertical: 'top',
  },
});
