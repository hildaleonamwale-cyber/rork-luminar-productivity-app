import React, { useState, useEffect, useRef } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Animated,
  TextInput,
  Modal,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Play, Pause, RotateCcw, Volume2, Settings } from 'lucide-react-native';
import { LinearGradient } from 'expo-linear-gradient';
import Svg, { Circle } from 'react-native-svg';
import Colors from '@/constants/colors';
import { useTheme } from '@/contexts/ThemeContext';

const WORK_DURATION = 25 * 60;
const BREAK_DURATION = 5 * 60;

export default function PomodoroScreen() {
  const { colors: themeColors } = useTheme();
  const [duration, setDuration] = useState(WORK_DURATION);
  const [timeLeft, setTimeLeft] = useState(WORK_DURATION);
  const [isRunning, setIsRunning] = useState(false);
  const [isBreak, setIsBreak] = useState(false);
  const [soundEnabled, setSoundEnabled] = useState(false);
  const [sessionsCompleted, setSessionsCompleted] = useState(0);
  const [showCustomModal, setShowCustomModal] = useState(false);
  const [customMinutes, setCustomMinutes] = useState('');
  const intervalRef = useRef<any>(null);
  const pulseAnim = useRef(new Animated.Value(1)).current;

  useEffect(() => {
    if (isRunning) {
      intervalRef.current = setInterval(() => {
        setTimeLeft((prev) => {
          if (prev <= 1) {
            setIsRunning(false);
            if (!isBreak) {
              setSessionsCompleted((s) => s + 1);
            }
            setIsBreak(!isBreak);
            const newDuration = !isBreak ? BREAK_DURATION : WORK_DURATION;
            setDuration(newDuration);
            return newDuration;
          }
          return prev - 1;
        });
      }, 1000);
    } else {
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
      }
    }

    return () => {
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
      }
    };
  }, [isRunning, isBreak]);

  useEffect(() => {
    if (isRunning) {
      Animated.loop(
        Animated.sequence([
          Animated.timing(pulseAnim, {
            toValue: 1.05,
            duration: 1000,
            useNativeDriver: true,
          }),
          Animated.timing(pulseAnim, {
            toValue: 1,
            duration: 1000,
            useNativeDriver: true,
          }),
        ])
      ).start();
    } else {
      pulseAnim.setValue(1);
    }
  }, [isRunning, pulseAnim]);

  const handleReset = () => {
    setIsRunning(false);
    setTimeLeft(duration);
  };

  const handlePlayPause = () => {
    setIsRunning(!isRunning);
  };

  const handleDurationChange = (newDuration: number) => {
    if (!isRunning) {
      setDuration(newDuration);
      setTimeLeft(newDuration);
    }
  };

  const handleCustomTime = () => {
    const minutes = parseInt(customMinutes);
    if (!isNaN(minutes) && minutes > 0 && minutes <= 180) {
      handleDurationChange(minutes * 60);
      setShowCustomModal(false);
      setCustomMinutes('');
    }
  };

  const minutes = Math.floor(timeLeft / 60);
  const seconds = timeLeft % 60;
  const progress = ((duration - timeLeft) / duration) * 100;

  const circumference = 2 * Math.PI * 140;
  const strokeDashoffset = circumference - (progress / 100) * circumference;

  return (
    <View style={styles.container}>
      <SafeAreaView edges={['top', 'bottom']} style={styles.safeArea}>
        <View style={styles.header}>
          <View>
            <Text style={styles.headerSubtitle}>
              {isBreak ? '☕ Take a break' : '🎯 Stay focused'}
            </Text>
          </View>
        </View>

        <View style={styles.statsRow}>
          <View style={styles.statCard}>
            <Text style={[styles.statValue, { color: themeColors.primary }]}>{sessionsCompleted}</Text>
            <Text style={styles.statLabel}>Sessions</Text>
          </View>
          <View style={styles.statCard}>
            <Text style={[styles.statValue, { color: themeColors.primary }]}>{Math.floor(sessionsCompleted * 25 / 60)}h {(sessionsCompleted * 25) % 60}m</Text>
            <Text style={styles.statLabel}>Focus Time</Text>
          </View>
        </View>

        <View style={styles.timerContainer}>
          <View style={styles.timerCard}>
            <LinearGradient
              colors={isBreak ? [themeColors.secondary, themeColors.accent] : [themeColors.primary, themeColors.secondary]}
              start={{ x: 0, y: 0 }}
              end={{ x: 1, y: 1 }}
              style={styles.timerGradient}
            >
              <Animated.View style={[styles.timerCircle, { transform: [{ scale: pulseAnim }] }]}>
                <Svg width={280} height={280} style={styles.svg}>
                  <Circle
                    cx="140"
                    cy="140"
                    r="120"
                    stroke="rgba(255,255,255,0.3)"
                    strokeWidth="16"
                    fill="none"
                  />
                  <Circle
                    cx="140"
                    cy="140"
                    r="120"
                    stroke={Colors.white}
                    strokeWidth="16"
                    fill="none"
                    strokeDasharray={circumference * 0.857}
                    strokeDashoffset={strokeDashoffset * 0.857}
                    strokeLinecap="round"
                    rotation="-90"
                    origin="140, 140"
                  />
                </Svg>
                <View style={styles.timerText}>
                  <Text style={styles.modeText}>
                    {isBreak ? 'BREAK' : 'FOCUS'}
                  </Text>
                  <Text style={styles.timeDisplay}>
                    {minutes.toString().padStart(2, '0')}:{seconds.toString().padStart(2, '0')}
                  </Text>
                  <Text style={styles.progressText}>
                    {Math.round(progress)}% complete
                  </Text>
                </View>
              </Animated.View>
            </LinearGradient>
          </View>
        </View>

        <View style={styles.controls}>
          <TouchableOpacity
            style={styles.controlButton}
            onPress={handleReset}
            activeOpacity={0.7}
          >
            <RotateCcw color={Colors.text} size={26} strokeWidth={2.5} />
          </TouchableOpacity>

          <TouchableOpacity
            style={styles.playButton}
            onPress={handlePlayPause}
            activeOpacity={0.8}
          >
            <LinearGradient
              colors={[themeColors.primary, themeColors.secondary]}
              start={{ x: 0, y: 0 }}
              end={{ x: 1, y: 1 }}
              style={styles.playGradient}
            >
              {isRunning ? (
                <Pause color={Colors.white} size={36} fill={Colors.white} strokeWidth={2.5} />
              ) : (
                <Play color={Colors.white} size={36} fill={Colors.white} strokeWidth={2.5} />
              )}
            </LinearGradient>
          </TouchableOpacity>

          <TouchableOpacity
            style={[styles.controlButton, soundEnabled && styles.controlButtonActive]}
            onPress={() => setSoundEnabled(!soundEnabled)}
            activeOpacity={0.7}
          >
            <Volume2 color={soundEnabled ? themeColors.primary : Colors.text} size={26} strokeWidth={2.5} />
          </TouchableOpacity>
        </View>

        <View style={styles.durations}>
          <TouchableOpacity
            style={[
              styles.durationChip,
              duration === WORK_DURATION && !isBreak && [styles.durationChipActive, { backgroundColor: themeColors.primary, shadowColor: themeColors.primary }],
            ]}
            onPress={() => handleDurationChange(WORK_DURATION)}
            activeOpacity={0.7}
          >
            <Text
              style={[
                styles.durationText,
                duration === WORK_DURATION && !isBreak && styles.durationTextActive,
              ]}
            >
              25 min
            </Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={[
              styles.durationChip,
              duration === BREAK_DURATION && !isBreak && [styles.durationChipActive, { backgroundColor: themeColors.primary, shadowColor: themeColors.primary }],
            ]}
            onPress={() => handleDurationChange(BREAK_DURATION)}
            activeOpacity={0.7}
          >
            <Text
              style={[
                styles.durationText,
                duration === BREAK_DURATION && !isBreak && styles.durationTextActive,
              ]}
            >
              5 min
            </Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={[
              styles.durationChip,
              duration === 15 * 60 && [styles.durationChipActive, { backgroundColor: themeColors.primary, shadowColor: themeColors.primary }],
            ]}
            onPress={() => handleDurationChange(15 * 60)}
            activeOpacity={0.7}
          >
            <Text
              style={[
                styles.durationText,
                duration === 15 * 60 && styles.durationTextActive,
              ]}
            >
              15 min
            </Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={styles.durationChip}
            onPress={() => setShowCustomModal(true)}
            activeOpacity={0.7}
          >
            <View style={styles.customChipContent}>
              <Settings color={Colors.text} size={16} strokeWidth={2.5} />
              <Text style={styles.customChipText}>Custom</Text>
            </View>
          </TouchableOpacity>
        </View>

        <Modal
          visible={showCustomModal}
          transparent
          animationType="fade"
          onRequestClose={() => setShowCustomModal(false)}
        >
          <View style={styles.modalOverlay}>
            <View style={styles.modalContent}>
              <Text style={styles.modalTitle}>Set Custom Time</Text>
              <Text style={styles.modalSubtitle}>Enter duration in minutes (1-180)</Text>
              
              <TextInput
                style={styles.input}
                value={customMinutes}
                onChangeText={setCustomMinutes}
                keyboardType="number-pad"
                placeholder="e.g., 30"
                placeholderTextColor={Colors.textSecondary}
                maxLength={3}
              />

              <View style={styles.modalButtons}>
                <TouchableOpacity
                  style={styles.cancelButton}
                  onPress={() => {
                    setShowCustomModal(false);
                    setCustomMinutes('');
                  }}
                  activeOpacity={0.7}
                >
                  <Text style={styles.cancelButtonText}>Cancel</Text>
                </TouchableOpacity>

                <TouchableOpacity
                  style={styles.confirmButton}
                  onPress={handleCustomTime}
                  activeOpacity={0.8}
                >
                  <LinearGradient
                    colors={[themeColors.primary, themeColors.secondary]}
                    start={{ x: 0, y: 0 }}
                    end={{ x: 1, y: 1 }}
                    style={styles.confirmGradient}
                  >
                    <Text style={styles.confirmButtonText}>Set Timer</Text>
                  </LinearGradient>
                </TouchableOpacity>
              </View>
            </View>
          </View>
        </Modal>
      </SafeAreaView>
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
    paddingHorizontal: 20,
  },
  header: {
    marginTop: 16,
    marginBottom: 20,
  },
  headerTitle: {
    fontSize: 28,
    fontWeight: '700',
    color: Colors.text,
    marginBottom: 4,
  },
  headerSubtitle: {
    fontSize: 15,
    color: Colors.textSecondary,
    fontWeight: '500',
  },
  statsRow: {
    flexDirection: 'row',
    gap: 12,
    marginBottom: 24,
  },
  statCard: {
    flex: 1,
    backgroundColor: Colors.white,
    borderRadius: 12,
    padding: 16,
    alignItems: 'center',
    shadowColor: Colors.shadowColor,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.04,
    shadowRadius: 8,
    elevation: 2,
  },
  statValue: {
    fontSize: 24,
    fontWeight: '700',
    marginBottom: 4,
  },
  statLabel: {
    fontSize: 12,
    fontWeight: '600',
    color: Colors.textSecondary,
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  },
  timerContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    marginVertical: 20,
  },
  timerCard: {
    width: '100%',
    aspectRatio: 1,
    maxWidth: 340,
    maxHeight: 340,
    borderRadius: 200,
    overflow: 'hidden',
    shadowColor: '#FF4D0C',
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.25,
    shadowRadius: 24,
    elevation: 12,
  },
  timerGradient: {
    width: '100%',
    height: '100%',
    justifyContent: 'center',
    alignItems: 'center',
  },
  timerCircle: {
    width: 280,
    height: 280,
    justifyContent: 'center',
    alignItems: 'center',
  },
  svg: {
    position: 'absolute',
  },
  timerText: {
    justifyContent: 'center',
    alignItems: 'center',
  },
  modeText: {
    fontSize: 14,
    fontWeight: '700',
    color: Colors.white,
    letterSpacing: 2,
    marginBottom: 12,
    opacity: 0.9,
  },
  timeDisplay: {
    fontSize: 56,
    fontWeight: '700',
    color: Colors.white,
    letterSpacing: -2,
  },
  progressText: {
    fontSize: 13,
    fontWeight: '600',
    color: Colors.white,
    marginTop: 12,
    opacity: 0.8,
  },
  controls: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    gap: 40,
    marginVertical: 32,
  },
  controlButton: {
    width: 64,
    height: 64,
    borderRadius: 32,
    backgroundColor: Colors.white,
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: Colors.shadowColor,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.12,
    shadowRadius: 12,
    elevation: 4,
  },
  controlButtonActive: {
    backgroundColor: '#FFE8DC',
  },
  playButton: {
    width: 88,
    height: 88,
    borderRadius: 44,
    shadowColor: '#FF4D0C',
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.35,
    shadowRadius: 20,
    elevation: 10,
  },
  playGradient: {
    width: '100%',
    height: '100%',
    borderRadius: 44,
    alignItems: 'center',
    justifyContent: 'center',
  },
  durations: {
    flexDirection: 'row',
    justifyContent: 'center',
    flexWrap: 'wrap',
    gap: 10,
    marginBottom: 120,
    paddingHorizontal: 4,
  },
  durationChip: {
    paddingVertical: 12,
    paddingHorizontal: 20,
    borderRadius: 12,
    backgroundColor: Colors.white,
    shadowColor: Colors.shadowColor,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.04,
    shadowRadius: 8,
    elevation: 2,
  },
  durationChipActive: {
    shadowOpacity: 0.3,
  },
  durationText: {
    fontSize: 13,
    fontWeight: '700',
    color: Colors.text,
  },
  durationTextActive: {
    color: Colors.white,
  },
  customChipContent: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  customChipText: {
    fontSize: 13,
    fontWeight: '700',
    color: Colors.text,
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.5)',
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  modalContent: {
    backgroundColor: Colors.white,
    borderRadius: 16,
    padding: 28,
    width: '100%',
    maxWidth: 340,
    shadowColor: Colors.shadowColor,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.08,
    shadowRadius: 12,
    elevation: 4,
  },
  modalTitle: {
    fontSize: 22,
    fontWeight: '700',
    color: Colors.text,
    marginBottom: 8,
    textAlign: 'center',
  },
  modalSubtitle: {
    fontSize: 14,
    color: Colors.textSecondary,
    marginBottom: 24,
    textAlign: 'center',
  },
  input: {
    backgroundColor: Colors.offWhite,
    borderRadius: 12,
    padding: 18,
    fontSize: 18,
    fontWeight: '600',
    color: Colors.text,
    textAlign: 'center',
    marginBottom: 24,
  },
  modalButtons: {
    flexDirection: 'row',
    gap: 12,
  },
  cancelButton: {
    flex: 1,
    paddingVertical: 16,
    borderRadius: 12,
    backgroundColor: Colors.offWhite,
    alignItems: 'center',
  },
  cancelButtonText: {
    fontSize: 16,
    fontWeight: '700',
    color: Colors.text,
  },
  confirmButton: {
    flex: 1,
    borderRadius: 12,
    overflow: 'hidden',
    shadowColor: Colors.shadowColor,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.08,
    shadowRadius: 8,
    elevation: 2,
  },
  confirmGradient: {
    paddingVertical: 16,
    alignItems: 'center',
    justifyContent: 'center',
  },
  confirmButtonText: {
    fontSize: 16,
    fontWeight: '700',
    color: Colors.white,
  },
});
