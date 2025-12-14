import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TextInput,
  TouchableOpacity,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Stack, useRouter } from 'expo-router';
import { Check, X } from 'lucide-react-native';
import Colors from '@/constants/colors';
import { useTheme } from '@/contexts/ThemeContext';
import { useQuote } from '@/contexts/QuoteContext';

export default function EditQuoteScreen() {
  const router = useRouter();
  const { colors: themeColors } = useTheme();
  const { quote, updateQuote } = useQuote();
  const [newQuote, setNewQuote] = useState(quote);

  const handleSave = () => {
    if (newQuote.trim()) {
      updateQuote(newQuote.trim());
      router.back();
    }
  };

  const handleCancel = () => {
    router.back();
  };

  return (
    <View style={styles.container}>
      <Stack.Screen
        options={{
          headerShown: true,
          title: 'Edit Quote',
          headerStyle: {
            backgroundColor: themeColors.primary,
          },
          headerTintColor: Colors.white,
          headerTitleStyle: {
            fontWeight: '700',
            fontSize: 18,
          },
          headerLeft: () => (
            <TouchableOpacity onPress={handleCancel} style={styles.headerButton}>
              <X color={Colors.white} size={24} strokeWidth={2.5} />
            </TouchableOpacity>
          ),
          headerRight: () => (
            <TouchableOpacity onPress={handleSave} style={styles.headerButton}>
              <Check color={Colors.white} size={24} strokeWidth={2.5} />
            </TouchableOpacity>
          ),
        }}
      />
      
      <SafeAreaView edges={['bottom']} style={styles.safeArea}>
        <KeyboardAvoidingView
          behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
          style={styles.keyboardView}
        >
          <ScrollView
            style={styles.scrollView}
            contentContainerStyle={styles.scrollContent}
            keyboardShouldPersistTaps="handled"
          >
            <View style={styles.content}>
              <View style={styles.promptCard}>
                <Text style={[styles.promptText, { color: themeColors.primary }]}>
                  What motivates you?
                </Text>
                <Text style={styles.promptSubtext}>
                  Write a quote or phrase that inspires you every day
                </Text>
              </View>

              <View style={styles.inputCard}>
                <TextInput
                  style={[styles.input, { color: themeColors.primary }]}
                  value={newQuote}
                  onChangeText={setNewQuote}
                  placeholder="Enter your motivational quote..."
                  placeholderTextColor={Colors.textSecondary}
                  multiline
                  numberOfLines={4}
                  textAlignVertical="top"
                  autoFocus
                />
              </View>

              <TouchableOpacity
                style={[styles.saveButton, { backgroundColor: themeColors.primary }]}
                onPress={handleSave}
                activeOpacity={0.8}
              >
                <Check color={Colors.white} size={20} strokeWidth={2.5} />
                <Text style={styles.saveButtonText}>Update Quote</Text>
              </TouchableOpacity>
            </View>
          </ScrollView>
        </KeyboardAvoidingView>
      </SafeAreaView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#FAFAFA',
  },
  safeArea: {
    flex: 1,
  },
  keyboardView: {
    flex: 1,
  },
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    flexGrow: 1,
  },
  content: {
    flex: 1,
    paddingHorizontal: 20,
    paddingTop: 24,
  },
  headerButton: {
    padding: 8,
  },
  promptCard: {
    backgroundColor: Colors.white,
    borderRadius: 20,
    padding: 24,
    marginBottom: 20,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 12,
    elevation: 2,
  },
  promptText: {
    fontSize: 24,
    fontWeight: '700',
    marginBottom: 8,
    textAlign: 'center',
  },
  promptSubtext: {
    fontSize: 14,
    color: Colors.textSecondary,
    textAlign: 'center',
    lineHeight: 20,
  },
  inputCard: {
    backgroundColor: Colors.white,
    borderRadius: 20,
    padding: 20,
    marginBottom: 24,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 12,
    elevation: 2,
  },
  input: {
    fontSize: 18,
    fontWeight: '500',
    lineHeight: 28,
    minHeight: 120,
    textAlign: 'center',
    fontStyle: 'italic',
  },
  saveButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    paddingVertical: 16,
    borderRadius: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.2,
    shadowRadius: 12,
    elevation: 4,
  },
  saveButtonText: {
    color: Colors.white,
    fontSize: 17,
    fontWeight: '700',
  },
});
