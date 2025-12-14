import React from 'react';
import { View, Text, StyleSheet, Modal, TouchableOpacity, Platform } from 'react-native';
import { BlurView } from 'expo-blur';
import { AlertCircle } from 'lucide-react-native';
import { useTheme } from '@/contexts/ThemeContext';

interface ConfirmModalProps {
  visible: boolean;
  title: string;
  message: string;
  confirmText?: string;
  cancelText?: string;
  onConfirm: () => void;
  onCancel: () => void;
  variant?: 'default' | 'danger';
}

export default function ConfirmModal({
  visible,
  title,
  message,
  confirmText = 'Confirm',
  cancelText = 'Cancel',
  onConfirm,
  onCancel,
  variant = 'default',
}: ConfirmModalProps) {
  const { colors } = useTheme();

  return (
    <Modal
      visible={visible}
      transparent
      animationType="fade"
      onRequestClose={onCancel}
    >
      <View style={styles.overlay}>
        {Platform.OS === 'web' ? (
          <View style={[styles.blurFallback, { backgroundColor: 'rgba(0, 0, 0, 0.5)' }]} />
        ) : (
          <BlurView intensity={20} style={StyleSheet.absoluteFill} />
        )}
        
        <View style={styles.modalContainer}>
          <View style={[styles.modal, { backgroundColor: '#FFFFFF' }]}>
            <View style={[styles.iconContainer, { backgroundColor: variant === 'danger' ? '#FEE2E2' : `${colors.primary}20` }]}>
              <AlertCircle 
                size={28} 
                color={variant === 'danger' ? '#DC2626' : colors.primary} 
                strokeWidth={2.5}
              />
            </View>

            <Text style={styles.title}>{title}</Text>
            <Text style={styles.message}>{message}</Text>

            <View style={styles.buttonContainer}>
              <TouchableOpacity
                style={[styles.button, styles.cancelButton, { borderColor: '#E5E7EB' }]}
                onPress={onCancel}
                testID="confirm-modal-cancel"
              >
                <Text style={[styles.buttonText, { color: '#6B7280' }]}>{cancelText}</Text>
              </TouchableOpacity>

              <TouchableOpacity
                style={[
                  styles.button,
                  styles.confirmButton,
                  { backgroundColor: variant === 'danger' ? '#DC2626' : colors.primary }
                ]}
                onPress={onConfirm}
                testID="confirm-modal-confirm"
              >
                <Text style={[styles.buttonText, { color: '#FFFFFF' }]}>{confirmText}</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  blurFallback: {
    ...StyleSheet.absoluteFillObject,
  },
  modalContainer: {
    width: '85%',
    maxWidth: 400,
  },
  modal: {
    borderRadius: 24,
    padding: 28,
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.15,
    shadowRadius: 24,
    elevation: 8,
  },
  iconContainer: {
    width: 64,
    height: 64,
    borderRadius: 32,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 20,
  },
  title: {
    fontSize: 22,
    fontWeight: '700' as const,
    color: '#111827',
    marginBottom: 12,
    textAlign: 'center',
  },
  message: {
    fontSize: 15,
    color: '#6B7280',
    textAlign: 'center',
    lineHeight: 22,
    marginBottom: 28,
  },
  buttonContainer: {
    flexDirection: 'row',
    gap: 12,
    width: '100%',
  },
  button: {
    flex: 1,
    paddingVertical: 14,
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
  },
  cancelButton: {
    backgroundColor: '#F9FAFB',
    borderWidth: 1,
  },
  confirmButton: {
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 2,
  },
  buttonText: {
    fontSize: 16,
    fontWeight: '600' as const,
  },
});
