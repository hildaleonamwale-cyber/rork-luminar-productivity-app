import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  TextInput,
  Alert,
  Keyboard,
  StatusBar,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Stack, useRouter } from 'expo-router';
import {
  ChevronLeft,
  User,
  Palette,
  Cloud,
  ChevronRight,
  Edit3,
  Check,
  X,
} from 'lucide-react-native';
import { useTheme } from '@/contexts/ThemeContext';
import { useOnboarding } from '@/contexts/OnboardingContext';
import ColorPicker from '@/components/ColorPicker';
import Colors from '@/constants/colors';

export default function SettingsScreen() {
  const router = useRouter();
  const { colors } = useTheme();
  const { userName, updateUserName } = useOnboarding();
  const [showColorPicker, setShowColorPicker] = useState(false);
  const [isEditingName, setIsEditingName] = useState(false);
  const [nameInput, setNameInput] = useState(userName);

  const handleSaveName = async () => {
    if (!nameInput.trim()) {
      Alert.alert('Error', 'Name cannot be empty');
      return;
    }
    await updateUserName(nameInput.trim());
    setIsEditingName(false);
    Keyboard.dismiss();
    Alert.alert('Success', 'Your name has been updated');
  };

  const handleCancelEdit = () => {
    setNameInput(userName);
    setIsEditingName(false);
    Keyboard.dismiss();
  };

  return (
    <View style={styles.container}>
      <StatusBar barStyle="dark-content" backgroundColor="#FFFFFF" />
      <Stack.Screen
        options={{
          headerShown: false,
        }}
      />

      <View style={[styles.topBarBackground, { backgroundColor: '#FFFFFF', shadowColor: '#000' }]}>
        <SafeAreaView edges={['top']} style={styles.safeArea}>
          <View style={styles.header}>
            <TouchableOpacity
              style={styles.backButton}
              onPress={() => router.back()}
              activeOpacity={0.7}
            >
              <ChevronLeft color={colors.primary} size={28} strokeWidth={2.5} />
            </TouchableOpacity>
            <Text style={[styles.headerTitle, { color: Colors.text }]}>Settings</Text>
            <View style={styles.headerSpacer} />
          </View>
        </SafeAreaView>
      </View>

      <ScrollView
        style={styles.scrollView}
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Profile</Text>
          
          <View style={styles.card}>
            <View style={styles.settingRow}>
              <View style={styles.settingLeft}>
                <View style={[styles.iconBox, { backgroundColor: `${colors.primary}15` }]}>
                  <User size={22} color={colors.primary} strokeWidth={2.5} />
                </View>
                <View style={styles.settingContent}>
                  <Text style={styles.settingLabel}>Your Name</Text>
                  {isEditingName ? (
                    <TextInput
                      style={[styles.nameInput, { borderColor: colors.primary }]}
                      value={nameInput}
                      onChangeText={setNameInput}
                      placeholder="Enter your name"
                      autoFocus
                      returnKeyType="done"
                      onSubmitEditing={handleSaveName}
                    />
                  ) : (
                    <Text style={styles.settingValue}>{userName || 'Not set'}</Text>
                  )}
                </View>
              </View>
              {isEditingName ? (
                <View style={styles.editActions}>
                  <TouchableOpacity
                    onPress={handleCancelEdit}
                    style={[styles.editActionButton, styles.cancelButton]}
                    activeOpacity={0.7}
                  >
                    <X size={20} color="#6B7280" strokeWidth={2.5} />
                  </TouchableOpacity>
                  <TouchableOpacity
                    onPress={handleSaveName}
                    style={[styles.editActionButton, { backgroundColor: colors.primary }]}
                    activeOpacity={0.7}
                  >
                    <Check size={20} color="#FFFFFF" strokeWidth={2.5} />
                  </TouchableOpacity>
                </View>
              ) : (
                <TouchableOpacity
                  onPress={() => setIsEditingName(true)}
                  style={styles.editButton}
                  activeOpacity={0.7}
                >
                  <Edit3 size={20} color={colors.primary} strokeWidth={2.5} />
                </TouchableOpacity>
              )}
            </View>
          </View>
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Customization</Text>
          
          <TouchableOpacity
            style={styles.card}
            onPress={() => setShowColorPicker(true)}
            activeOpacity={0.7}
          >
            <View style={styles.settingRow}>
              <View style={styles.settingLeft}>
                <View style={[styles.iconBox, { backgroundColor: `${colors.secondary}15` }]}>
                  <Palette size={22} color={colors.secondary} strokeWidth={2.5} />
                </View>
                <View style={styles.settingContent}>
                  <Text style={styles.settingLabel}>Theme & Colors</Text>
                  <Text style={styles.settingDescription}>Customize app appearance</Text>
                </View>
              </View>
              <ChevronRight size={24} color="#9CA3AF" strokeWidth={2.5} />
            </View>
          </TouchableOpacity>
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Data</Text>
          
          <TouchableOpacity
            style={styles.card}
            onPress={() => router.push('/backup')}
            activeOpacity={0.7}
          >
            <View style={styles.settingRow}>
              <View style={styles.settingLeft}>
                <View style={[styles.iconBox, { backgroundColor: `${colors.primary}15` }]}>
                  <Cloud size={22} color={colors.primary} strokeWidth={2.5} />
                </View>
                <View style={styles.settingContent}>
                  <Text style={styles.settingLabel}>Backup & Restore</Text>
                  <Text style={styles.settingDescription}>Manage your data backups</Text>
                </View>
              </View>
              <ChevronRight size={24} color="#9CA3AF" strokeWidth={2.5} />
            </View>
          </TouchableOpacity>
        </View>
      </ScrollView>

      <ColorPicker
        visible={showColorPicker}
        onClose={() => setShowColorPicker(false)}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F9FAFB',
  },
  topBarBackground: {
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.15,
    shadowRadius: 8,
    elevation: 8,
  },
  safeArea: {
    backgroundColor: 'transparent',
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
    alignItems: 'center',
    justifyContent: 'center',
  },
  headerTitle: {
    fontSize: 20,
    fontWeight: '700' as const,
    color: '#FFFFFF',
  },
  headerSpacer: {
    width: 40,
  },
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    padding: 20,
    paddingBottom: 140,
  },
  section: {
    marginBottom: 32,
  },
  sectionTitle: {
    fontSize: 13,
    fontWeight: '700' as const,
    color: '#6B7280',
    textTransform: 'uppercase' as const,
    letterSpacing: 1,
    marginBottom: 12,
    paddingHorizontal: 4,
  },
  card: {
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
    padding: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 8,
    elevation: 2,
  },
  settingRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  settingLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  iconBox: {
    width: 44,
    height: 44,
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 14,
  },
  settingContent: {
    flex: 1,
  },
  settingLabel: {
    fontSize: 16,
    fontWeight: '600' as const,
    color: '#111827',
    marginBottom: 4,
  },
  settingValue: {
    fontSize: 15,
    color: '#6B7280',
    fontWeight: '500' as const,
  },
  settingDescription: {
    fontSize: 14,
    color: '#9CA3AF',
    fontWeight: '500' as const,
  },
  editButton: {
    width: 40,
    height: 40,
    alignItems: 'center',
    justifyContent: 'center',
  },
  editActions: {
    flexDirection: 'row',
    gap: 8,
  },
  editActionButton: {
    width: 40,
    height: 40,
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
  },
  cancelButton: {
    backgroundColor: '#F3F4F6',
  },
  nameInput: {
    fontSize: 15,
    color: '#111827',
    fontWeight: '600' as const,
    borderBottomWidth: 2,
    paddingVertical: 4,
    paddingHorizontal: 0,
  },
});
