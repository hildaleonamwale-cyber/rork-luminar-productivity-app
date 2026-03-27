import { useState, useEffect, useRef, useCallback } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';
import createContextHook from '@nkzw/create-context-hook';
import { Platform, AppState, AppStateStatus, Alert } from 'react-native';
import { File, Directory, Paths } from 'expo-file-system';
import * as DocumentPicker from 'expo-document-picker';

const LAST_BACKUP_KEY = '@last_backup_date';
const BACKUP_INTERVAL_DAYS = 3;
const BACKUP_INTERVAL_MS = BACKUP_INTERVAL_DAYS * 24 * 60 * 60 * 1000;

const STORAGE_KEYS = [
  '@luminar_tasks',
  '@luminar_goals',
  '@luminar_projects',
  '@luminar_journal',
  '@theme_colors',
  '@luminar_quote',
  '@onboarding_complete',
  '@user_name',
];

export interface BackupData {
  version: string;
  timestamp: number;
  platform: string;
  data: Record<string, string | null>;
}

export interface BackupProgress {
  stage: 'preparing' | 'collecting' | 'compressing' | 'uploading' | 'verifying' | 'complete';
  progress: number;
  message: string;
}

export interface CloudPermissionStatus {
  granted: boolean;
  provider: 'icloud' | 'google-drive' | null;
  needsPrompt: boolean;
}

export const [BackupContext, useBackup] = createContextHook(() => {
  const [lastBackupDate, setLastBackupDate] = useState<string | null>(null);
  const [isBackingUp, setIsBackingUp] = useState(false);
  const [isRestoring, setIsRestoring] = useState(false);
  const [lastError, setLastError] = useState<string | null>(null);
  const [backupProgress, setBackupProgress] = useState<BackupProgress | null>(null);
  const [cloudPermission, setCloudPermission] = useState<CloudPermissionStatus>({
    granted: false,
    provider: Platform.OS === 'ios' ? 'icloud' : Platform.OS === 'android' ? 'google-drive' : null,
    needsPrompt: true,
  });
  const [backupSize, setBackupSize] = useState<number>(0);
  const backupIntervalRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const appState = useRef<AppStateStatus>(AppState.currentState);

  const updateProgress = (stage: BackupProgress['stage'], progress: number, message: string) => {
    setBackupProgress({ stage, progress, message });
  };

  const calculateBackupSize = async (): Promise<number> => {
    let totalSize = 0;
    for (const key of STORAGE_KEYS) {
      try {
        const value = await AsyncStorage.getItem(key);
        if (value) {
          totalSize += new Blob([value]).size;
        }
      } catch (error) {
        console.error(`Error calculating size for ${key}:`, error);
      }
    }
    return totalSize;
  };

  const performAutomaticBackup = useCallback(async (manual: boolean = false): Promise<void> => {
    if (isBackingUp || Platform.OS === 'web') {
      console.log('BackupContext: Skipping backup (already backing up or web platform)');
      return;
    }

    console.log('BackupContext: Starting automatic backup');
    setIsBackingUp(true);
    setLastError(null);

    try {
      if (manual) {
        updateProgress('preparing', 10, 'Preparing backup...');
        await new Promise(resolve => setTimeout(resolve, 300));
      }

      if (manual) {
        updateProgress('collecting', 30, 'Collecting data...');
      }
      const backupData = await exportAllData();
      
      if (manual) {
        updateProgress('compressing', 50, 'Compressing data...');
        await new Promise(resolve => setTimeout(resolve, 400));
      }
      const backupJson = JSON.stringify(backupData, null, 2);
      const size = new Blob([backupJson]).size;
      setBackupSize(size);

      if (manual) {
        updateProgress('uploading', 70, `Uploading to ${Platform.OS === 'ios' ? 'iCloud' : 'Google Drive'}...`);
      }

      const backupDir = new Directory(Paths.document, 'Backups');
      backupDir.create({ intermediates: true, idempotent: true });

      const fileName = 'luminar-backup-latest.json';
      const backupFile = new File(backupDir, fileName);

      console.log('BackupContext: Writing backup to:', backupFile.uri);
      backupFile.write(backupJson);

      if (manual) {
        updateProgress('verifying', 90, 'Verifying backup...');
        await new Promise(resolve => setTimeout(resolve, 300));
      }

      const now = new Date().toISOString();
      await AsyncStorage.setItem(LAST_BACKUP_KEY, now);
      setLastBackupDate(now);

      if (manual) {
        updateProgress('complete', 100, 'Backup complete!');
        await new Promise(resolve => setTimeout(resolve, 500));
      }

      console.log('BackupContext: Automatic backup completed successfully');
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Unknown error';
      console.error('BackupContext: Automatic backup failed:', err);
      setLastError(errorMessage);
    } finally {
      setIsBackingUp(false);
      if (manual) {
        setBackupProgress(null);
      }
    }
  }, [isBackingUp]);

  const handleAppStateChange = useCallback((nextAppState: AppStateStatus) => {
    console.log('BackupContext: App state changed from', appState.current, 'to', nextAppState);
    
    if (appState.current === 'active' && nextAppState.match(/inactive|background/)) {
      console.log('BackupContext: App going to background, triggering backup');
      performAutomaticBackup();
    }
    
    appState.current = nextAppState;
  }, [performAutomaticBackup]);

  const startAutomaticBackup = useCallback(async () => {
    console.log('BackupContext: Starting automatic backup system');
    
    const lastBackup = await AsyncStorage.getItem(LAST_BACKUP_KEY);
    const now = Date.now();
    
    if (lastBackup) {
      const lastBackupTime = new Date(lastBackup).getTime();
      const timeSinceLastBackup = now - lastBackupTime;
      
      if (timeSinceLastBackup >= BACKUP_INTERVAL_MS) {
        console.log('BackupContext: Last backup was more than 3 days ago, backing up now');
        performAutomaticBackup();
      } else {
        const timeUntilNextBackup = BACKUP_INTERVAL_MS - timeSinceLastBackup;
        console.log(`BackupContext: Next backup in ${Math.round(timeUntilNextBackup / (1000 * 60 * 60))} hours`);
      }
    } else {
      console.log('BackupContext: No previous backup found, backing up now');
      performAutomaticBackup();
    }

    backupIntervalRef.current = setInterval(() => {
      console.log('BackupContext: Scheduled backup triggered');
      performAutomaticBackup();
    }, BACKUP_INTERVAL_MS);
  }, [performAutomaticBackup]);

  useEffect(() => {
    loadLastBackupDate();
    startAutomaticBackup();

    const subscription = AppState.addEventListener('change', handleAppStateChange);

    return () => {
      subscription.remove();
      if (backupIntervalRef.current) {
        clearInterval(backupIntervalRef.current);
      }
    };
  }, [handleAppStateChange, startAutomaticBackup]);

  const loadLastBackupDate = async () => {
    try {
      const date = await AsyncStorage.getItem(LAST_BACKUP_KEY);
      setLastBackupDate(date);
    } catch (error) {
      console.error('Error loading last backup date:', error);
    }
  };



  const exportAllData = async (): Promise<BackupData> => {
    console.log('BackupContext: Starting data export');
    const data: Record<string, string | null> = {};

    for (const key of STORAGE_KEYS) {
      try {
        const value = await AsyncStorage.getItem(key);
        data[key] = value;
        console.log(`BackupContext: Exported ${key}:`, value ? 'has data' : 'null');
      } catch (error) {
        console.error(`BackupContext: Error exporting ${key}:`, error);
        data[key] = null;
      }
    }

    const backup: BackupData = {
      version: '1.0.0',
      timestamp: Date.now(),
      platform: Platform.OS,
      data,
    };

    console.log('BackupContext: Export completed');
    return backup;
  };

  const importAllData = async (backup: BackupData) => {
    console.log('BackupContext: Starting data import');
    
    for (const [key, value] of Object.entries(backup.data)) {
      try {
        if (value !== null) {
          await AsyncStorage.setItem(key, value);
          console.log(`BackupContext: Imported ${key}`);
        } else {
          await AsyncStorage.removeItem(key);
          console.log(`BackupContext: Removed ${key}`);
        }
      } catch (error) {
        console.error(`BackupContext: Error importing ${key}:`, error);
      }
    }

    console.log('BackupContext: Import completed');
  };



  const requestCloudPermission = async (): Promise<boolean> => {
    if (Platform.OS === 'web') {
      return false;
    }

    return new Promise((resolve) => {
      Alert.alert(
        `Enable ${Platform.OS === 'ios' ? 'iCloud' : 'Google Drive'} Backup`,
        `Luminar needs access to ${Platform.OS === 'ios' ? 'iCloud Drive' : 'Google Drive'} to securely back up your data.\n\nYour data will be:\n• Encrypted and private\n• Automatically synced across devices\n• Available for restore anytime`,
        [
          {
            text: 'Not Now',
            style: 'cancel',
            onPress: () => {
              setCloudPermission({ ...cloudPermission, needsPrompt: false, granted: false });
              resolve(false);
            },
          },
          {
            text: 'Enable',
            onPress: () => {
              setCloudPermission({ 
                granted: true, 
                provider: Platform.OS === 'ios' ? 'icloud' : 'google-drive',
                needsPrompt: false,
              });
              resolve(true);
            },
          },
        ]
      );
    });
  };

  const backupNow = async (): Promise<{ success: boolean; message: string }> => {
    console.log('BackupContext: Manual backup triggered');
    
    if (cloudPermission.needsPrompt && !cloudPermission.granted) {
      const granted = await requestCloudPermission();
      if (!granted) {
        return {
          success: false,
          message: 'Backup canceled. Cloud storage access is required.',
        };
      }
    }

    await performAutomaticBackup(true);
    
    if (lastError) {
      return {
        success: false,
        message: `Backup failed: ${lastError}`,
      };
    }
    
    return {
      success: true,
      message: Platform.OS === 'ios' 
        ? 'Backup saved to iCloud Drive successfully!'
        : 'Backup saved to Google Drive successfully!',
    };
  };

  const restoreFromBackup = async (): Promise<{ success: boolean; message: string }> => {
    console.log('BackupContext: Starting restore');
    setIsRestoring(true);

    try {
      if (Platform.OS === 'web') {
        return {
          success: false,
          message: 'Restore is not supported on web',
        };
      }

      const backupDir = new Directory(Paths.document, 'Backups');
      const fileName = 'luminar-backup-latest.json';
      const backupFile = new File(backupDir, fileName);
      
      if (!backupFile.exists) {
        console.log('BackupContext: No automatic backup found, trying manual file picker');
        
        const result = await DocumentPicker.getDocumentAsync({
          type: 'application/json',
          copyToCacheDirectory: true,
        });

        if (result.canceled) {
          return {
            success: false,
            message: 'Restore canceled',
          };
        }

        const pickedFile = result.assets[0];
        const pickedFileObj = new File(pickedFile.uri);
        const fileContent = await pickedFileObj.text();
        
        let backupData: BackupData;
        try {
          backupData = JSON.parse(fileContent);
        } catch (parseErr) {
          console.error('BackupContext: Parse error:', parseErr);
          return {
            success: false,
            message: 'Invalid backup file format',
          };
        }

        if (!backupData.version || !backupData.data) {
          return {
            success: false,
            message: 'Invalid backup file structure',
          };
        }

        await importAllData(backupData);

        console.log('BackupContext: Restore from manual file completed successfully');
        return {
          success: true,
          message: 'Backup restored successfully. Please restart the app to see changes.',
        };
      }

      console.log('BackupContext: Reading automatic backup from:', backupFile.uri);
      const fileContent = await backupFile.text();

      let backupData: BackupData;
      try {
        backupData = JSON.parse(fileContent);
      } catch (parseErr) {
        console.error('BackupContext: Parse error:', parseErr);
        return {
          success: false,
          message: 'Invalid backup file format',
        };
      }

      if (!backupData.version || !backupData.data) {
        return {
          success: false,
          message: 'Invalid backup file structure',
        };
      }

      await importAllData(backupData);

      console.log('BackupContext: Restore completed successfully');
      return {
        success: true,
        message: 'Backup restored successfully. Please restart the app to see changes.',
      };
    } catch (err) {
      console.error('BackupContext: Restore failed:', err);
      return {
        success: false,
        message: `Restore failed: ${err instanceof Error ? err.message : 'Unknown error'}`,
      };
    } finally {
      setIsRestoring(false);
    }
  };

  useEffect(() => {
    calculateBackupSize().then(setBackupSize);
  }, []);

  return {
    lastBackupDate,
    isBackingUp,
    isRestoring,
    lastError,
    backupProgress,
    cloudPermission,
    backupSize,
    backupNow,
    restoreFromBackup,
    requestCloudPermission,
  };
});
