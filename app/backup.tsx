import React, { useState } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, ActivityIndicator, Alert, Platform, StatusBar } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Stack, useRouter } from 'expo-router';
import { Download, Upload, Clock, Cloud, Database, CheckCircle2, ChevronLeft } from 'lucide-react-native';
import { useTheme } from '@/contexts/ThemeContext';
import { useBackup } from '@/contexts/BackupContext';
import ConfirmModal from '@/components/ConfirmModal';
import Colors from '@/constants/colors';

export default function BackupScreen() {
  const router = useRouter();
  const { colors } = useTheme();
  const { 
    lastBackupDate, 
    isBackingUp, 
    isRestoring, 
    backupProgress,
    cloudPermission,
    backupSize,
    backupNow, 
    restoreFromBackup 
  } = useBackup();
  const [showRestoreConfirm, setShowRestoreConfirm] = useState(false);

  const handleBackup = async () => {
    const result = await backupNow();
    Alert.alert(
      result.success ? 'Success' : 'Error',
      result.message,
      [{ text: 'OK' }]
    );
  };

  const handleRestoreConfirm = () => {
    setShowRestoreConfirm(true);
  };

  const handleRestoreExecute = async () => {
    setShowRestoreConfirm(false);
    const result = await restoreFromBackup();
    Alert.alert(
      result.success ? 'Success' : 'Error',
      result.message,
      [{ text: 'OK' }]
    );
  };

  const formatDate = (dateString: string | null) => {
    if (!dateString) return 'Never';
    
    try {
      const date = new Date(dateString);
      const now = new Date();
      const diffMs = now.getTime() - date.getTime();
      const diffMins = Math.floor(diffMs / 60000);
      const diffHours = Math.floor(diffMs / 3600000);
      const diffDays = Math.floor(diffMs / 86400000);

      if (diffMins < 1) return 'Just now';
      if (diffMins < 60) return `${diffMins} minute${diffMins > 1 ? 's' : ''} ago`;
      if (diffHours < 24) return `${diffHours} hour${diffHours > 1 ? 's' : ''} ago`;
      if (diffDays < 7) return `${diffDays} day${diffDays > 1 ? 's' : ''} ago`;
      
      return date.toLocaleDateString('en-US', {
        month: 'short',
        day: 'numeric',
        year: 'numeric',
      });
    } catch {
      return 'Never';
    }
  };

  const formatSize = (bytes: number) => {
    if (bytes < 1024) return `${bytes} B`;
    if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
    return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
  };

  const getProviderName = () => {
    return Platform.OS === 'ios' ? 'iCloud Drive' : 'Google Drive';
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
            <Text style={[styles.headerTitle, { color: Colors.text }]}>Backup & Restore</Text>
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
          {cloudPermission.granted ? (
            <View style={[styles.statusCard, { borderColor: colors.primary }]}>
              <View style={styles.statusHeader}>
                <View style={[styles.statusIconBox, { backgroundColor: `${colors.primary}15` }]}>
                  <Cloud size={24} color={colors.primary} strokeWidth={2.5} />
                </View>
                <View style={styles.statusContent}>
                  <Text style={[styles.statusTitle, { color: colors.primary }]}>Connected to {getProviderName()}</Text>
                  <Text style={styles.statusDescription}>Your data is being backed up automatically</Text>
                </View>
              </View>
            </View>
          ) : (
            <View style={styles.statusCard}>
              <View style={styles.statusHeader}>
                <View style={[styles.statusIconBox, { backgroundColor: '#FEE2E2' }]}>
                  <Cloud size={24} color="#DC2626" strokeWidth={2.5} />
                </View>
                <View style={styles.statusContent}>
                  <Text style={styles.statusTitle}>Cloud Backup Disabled</Text>
                  <Text style={styles.statusDescription}>Enable backup to keep your data safe</Text>
                </View>
              </View>
            </View>
          )}

          {backupProgress && (
            <View style={[styles.progressCard, { borderColor: colors.primary }]}>
              <View style={styles.progressHeader}>
                <Text style={[styles.progressTitle, { color: colors.primary }]}>{backupProgress.message}</Text>
                <Text style={[styles.progressPercent, { color: colors.primary }]}>{backupProgress.progress}%</Text>
              </View>
              <View style={styles.progressBarContainer}>
                <View 
                  style={[
                    styles.progressBarFill, 
                    { width: `${backupProgress.progress}%`, backgroundColor: colors.primary }
                  ]} 
                />
              </View>
            </View>
          )}

          <View style={styles.statsRow}>
            <View style={[styles.statBox, { borderColor: '#E5E7EB' }]}>
              <View style={styles.statIconBox}>
                <Database size={20} color={colors.primary} strokeWidth={2.5} />
              </View>
              <Text style={styles.statValue}>{formatSize(backupSize)}</Text>
              <Text style={styles.statLabel}>Backup Size</Text>
            </View>

            <View style={[styles.statBox, { borderColor: '#E5E7EB' }]}>
              <View style={styles.statIconBox}>
                <Clock size={20} color={colors.primary} strokeWidth={2.5} />
              </View>
              <Text style={styles.statValue}>{formatDate(lastBackupDate)}</Text>
              <Text style={styles.statLabel}>Last Backup</Text>
            </View>
          </View>

          <TouchableOpacity
            style={[
              styles.backupButton,
              { backgroundColor: colors.primary },
              (isBackingUp || isRestoring) && styles.backupButtonDisabled
            ]}
            onPress={handleBackup}
            disabled={isBackingUp || isRestoring}
            testID="backup-now-button"
          >
            {isBackingUp ? (
              <>
                <ActivityIndicator size="small" color="#FFFFFF" style={styles.buttonIcon} />
                <Text style={styles.backupButtonText}>Backing up...</Text>
              </>
            ) : (
              <>
                <Upload size={20} color="#FFFFFF" strokeWidth={2.5} style={styles.buttonIcon} />
                <Text style={styles.backupButtonText}>Back up now</Text>
              </>
            )}
          </TouchableOpacity>

          <TouchableOpacity
            style={[
              styles.restoreButton,
              (isBackingUp || isRestoring) && styles.restoreButtonDisabled
            ]}
            onPress={handleRestoreConfirm}
            disabled={isBackingUp || isRestoring}
            testID="restore-button"
          >
            {isRestoring ? (
              <>
                <ActivityIndicator size="small" color={colors.primary} style={styles.buttonIcon} />
                <Text style={[styles.restoreButtonText, { color: colors.primary }]}>Restoring...</Text>
              </>
            ) : (
              <>
                <Download size={20} color={colors.primary} strokeWidth={2.5} style={styles.buttonIcon} />
                <Text style={[styles.restoreButtonText, { color: colors.primary }]}>Restore from backup</Text>
              </>
            )}
          </TouchableOpacity>

          <View style={[styles.infoBox, { backgroundColor: `${colors.primary}08`, borderColor: `${colors.primary}20` }]}>
            <View style={styles.infoHeader}>
              <CheckCircle2 size={18} color={colors.primary} strokeWidth={2.5} />
              <Text style={[styles.infoTitle, { color: colors.primary }]}>How backup works</Text>
            </View>
            <Text style={styles.infoText}>
              <Text style={styles.infoBullet}>•</Text> Automatic backups every 3 days{'\n'}
              <Text style={styles.infoBullet}>•</Text> Backs up when you close the app{'\n'}
              <Text style={styles.infoBullet}>•</Text> Encrypted and stored in {getProviderName()}{'\n'}
              <Text style={styles.infoBullet}>•</Text> Includes all tasks, goals, projects & settings{'\n'}
              <Text style={styles.infoBullet}>•</Text> No account needed - completely private
            </Text>
          </View>
        </View>
      </ScrollView>

      <ConfirmModal
        visible={showRestoreConfirm}
        title="Restore from Backup?"
        message="This will replace all current data with the backup file. This action cannot be undone. Are you sure?"
        confirmText="Restore"
        cancelText="Cancel"
        onConfirm={handleRestoreExecute}
        onCancel={() => setShowRestoreConfirm(false)}
        variant="danger"
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
    marginBottom: 24,
  },
  statusCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
    padding: 16,
    marginBottom: 20,
    borderWidth: 2,
    borderColor: '#E5E7EB',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 8,
    elevation: 2,
  },
  statusHeader: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  statusIconBox: {
    width: 48,
    height: 48,
    borderRadius: 12,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 14,
  },
  statusContent: {
    flex: 1,
  },
  statusTitle: {
    fontSize: 16,
    fontWeight: '700' as const,
    color: '#111827',
    marginBottom: 4,
  },
  statusDescription: {
    fontSize: 13,
    color: '#6B7280',
    lineHeight: 18,
  },
  progressCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
    padding: 16,
    marginBottom: 20,
    borderWidth: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 8,
    elevation: 2,
  },
  progressHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
  },
  progressTitle: {
    fontSize: 15,
    fontWeight: '600' as const,
  },
  progressPercent: {
    fontSize: 15,
    fontWeight: '700' as const,
  },
  progressBarContainer: {
    height: 6,
    backgroundColor: '#F3F4F6',
    borderRadius: 3,
    overflow: 'hidden',
  },
  progressBarFill: {
    height: '100%',
    borderRadius: 3,
  },
  statsRow: {
    flexDirection: 'row',
    gap: 12,
    marginBottom: 20,
  },
  statBox: {
    flex: 1,
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
    padding: 16,
    borderWidth: 1,
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.03,
    shadowRadius: 4,
    elevation: 1,
  },
  statIconBox: {
    marginBottom: 8,
  },
  statValue: {
    fontSize: 16,
    fontWeight: '700' as const,
    color: '#111827',
    marginBottom: 4,
  },
  statLabel: {
    fontSize: 12,
    color: '#6B7280',
    textAlign: 'center',
  },
  backupButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 16,
    paddingHorizontal: 24,
    borderRadius: 14,
    marginBottom: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 3,
  },
  backupButtonDisabled: {
    opacity: 0.6,
  },
  backupButtonText: {
    fontSize: 16,
    fontWeight: '700' as const,
    color: '#FFFFFF',
  },
  buttonIcon: {
    marginRight: 8,
  },
  restoreButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 16,
    paddingHorizontal: 24,
    borderRadius: 14,
    marginBottom: 20,
    backgroundColor: '#FFFFFF',
    borderWidth: 2,
    borderColor: '#E5E7EB',
  },
  restoreButtonDisabled: {
    opacity: 0.6,
  },
  restoreButtonText: {
    fontSize: 16,
    fontWeight: '700' as const,
  },
  infoBox: {
    borderRadius: 16,
    padding: 16,
    borderWidth: 1,
  },
  infoHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 10,
    gap: 8,
  },
  infoTitle: {
    fontSize: 15,
    fontWeight: '700' as const,
  },
  infoText: {
    fontSize: 13,
    color: '#6B7280',
    lineHeight: 22,
  },
  infoBullet: {
    fontWeight: '700' as const,
    marginRight: 6,
  },
});
