import React, { useState, useRef, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Modal,
  Animated,
  Dimensions,
  PanResponder,
  TextInput,
  ScrollView,
  Alert,
  Platform,
} from 'react-native';
import { X, Palette, Plus, Minus, Image as ImageIcon, Upload } from 'lucide-react-native';
import * as ImagePicker from 'expo-image-picker';
import { LinearGradient } from 'expo-linear-gradient';
import { useTheme, THEME_PRESETS, ThemeColors, GradientType } from '@/contexts/ThemeContext';

const { width } = Dimensions.get('window');

interface ColorPickerProps {
  visible: boolean;
  onClose: () => void;
}

export default function ColorPicker({ visible, onClose }: ColorPickerProps) {
  const { colors, setTheme, setCustomColor, setHexColor, setGradient, setBackgroundImage } = useTheme();
  const [hue, setHue] = useState(0);
  const [hexInput, setHexInput] = useState('#735DFF');
  const [activeTab, setActiveTab] = useState<'solid' | 'gradient' | 'background'>('solid');
  const [gradientColors, setGradientColors] = useState<string[]>(['#FF4D0C', '#735DFF']);
  const [gradientType, setGradientType] = useState<GradientType>('linear');
  const [backgroundUrl, setBackgroundUrl] = useState('');
  const slideAnim = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    if (visible) {
      Animated.spring(slideAnim, {
        toValue: 1,
        useNativeDriver: true,
        tension: 65,
        friction: 11,
      }).start();
    } else {
      Animated.timing(slideAnim, {
        toValue: 0,
        duration: 250,
        useNativeDriver: true,
      }).start();
    }
  }, [visible, slideAnim]);

  const panResponder = PanResponder.create({
    onStartShouldSetPanResponder: () => true,
    onMoveShouldSetPanResponder: () => true,
    onPanResponderMove: (_, gestureState) => {
      const sliderWidth = width - 80;
      const position = Math.max(0, Math.min(sliderWidth, gestureState.moveX - 40));
      const newHue = Math.round((position / sliderWidth) * 360);
      setHue(newHue);
    },
    onPanResponderRelease: () => {
      setCustomColor(hue);
    },
  });

  const handlePresetSelect = (preset: ThemeColors) => {
    setTheme(preset);
  };

  const translateY = slideAnim.interpolate({
    inputRange: [0, 1],
    outputRange: [600, 0],
  });

  const backdropOpacity = slideAnim.interpolate({
    inputRange: [0, 1],
    outputRange: [0, 1],
  });

  const handleAddGradientColor = () => {
    if (gradientColors.length < 5) {
      setGradientColors([...gradientColors, '#735DFF']);
    }
  };

  const handleRemoveGradientColor = (index: number) => {
    if (gradientColors.length > 2) {
      setGradientColors(gradientColors.filter((_, i) => i !== index));
    }
  };

  const handleGradientColorChange = (index: number, color: string) => {
    const updated = [...gradientColors];
    updated[index] = color;
    setGradientColors(updated);
  };

  const handleApplyGradient = () => {
    console.log('Applying gradient:', { type: gradientType, colors: gradientColors });
    if (gradientColors.length >= 2) {
      setGradient({ type: gradientType, colors: gradientColors });
      Alert.alert('Success', 'Gradient applied successfully!');
    } else {
      Alert.alert('Error', 'Please add at least 2 colors');
    }
  };

  const handleApplyHex = () => {
    if (hexInput.match(/^#[0-9A-Fa-f]{6}$/)) {
      setHexColor(hexInput);
    }
  };

  const handlePickImage = async () => {
    try {
      if (Platform.OS !== 'web') {
        const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync();
        if (status !== 'granted') {
          Alert.alert('Permission Required', 'Please grant camera roll permissions to pick an image.');
          return;
        }
      }

      const result = await ImagePicker.launchImageLibraryAsync({
        mediaTypes: 'images' as any,
        allowsEditing: true,
        aspect: [9, 16],
        quality: 0.8,
      });

      if (!result.canceled && result.assets[0]) {
        setBackgroundUrl(result.assets[0].uri);
        setBackgroundImage(result.assets[0].uri);
        Alert.alert('Success', 'Background image set successfully!');
      }
    } catch (error) {
      console.log('Error picking image:', error);
      Alert.alert('Error', 'Failed to pick image');
    }
  };

  const handleApplyBackground = () => {
    if (backgroundUrl.trim()) {
      setBackgroundImage(backgroundUrl);
      Alert.alert('Success', 'Background image applied!');
    }
  };

  return (
    <Modal
      visible={visible}
      transparent
      animationType="none"
      onRequestClose={onClose}
    >
      <View style={styles.container}>
        <Animated.View style={[styles.backdrop, { opacity: backdropOpacity }]}>
          <TouchableOpacity 
            style={StyleSheet.absoluteFill} 
            onPress={onClose}
            activeOpacity={1}
          />
        </Animated.View>

        <Animated.View style={[styles.content, { transform: [{ translateY }] }]}>
          <View style={styles.handle} />
          
          <View style={styles.header}>
            <View style={styles.headerLeft}>
              <View style={styles.iconContainer}>
                <Palette color={colors.primary} size={24} strokeWidth={2.5} />
              </View>
              <View>
                <Text style={styles.title}>Customize Theme</Text>
                <Text style={styles.subtitle}>Choose your colors</Text>
              </View>
            </View>
            <TouchableOpacity onPress={onClose} style={styles.closeButton}>
              <X color="#6B7280" size={24} strokeWidth={2.5} />
            </TouchableOpacity>
          </View>

          <View style={styles.tabContainer}>
            <TouchableOpacity
              style={[styles.tab, activeTab === 'solid' && styles.tabActive]}
              onPress={() => setActiveTab('solid')}
            >
              <Text style={[styles.tabText, activeTab === 'solid' && styles.tabTextActive]}>
                Solid
              </Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={[styles.tab, activeTab === 'gradient' && styles.tabActive]}
              onPress={() => setActiveTab('gradient')}
            >
              <Text style={[styles.tabText, activeTab === 'gradient' && styles.tabTextActive]}>
                Gradient
              </Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={[styles.tab, activeTab === 'background' && styles.tabActive]}
              onPress={() => setActiveTab('background')}
            >
              <Text style={[styles.tabText, activeTab === 'background' && styles.tabTextActive]}>
                Background
              </Text>
            </TouchableOpacity>
          </View>

          <ScrollView 
            style={styles.scrollView}
            showsVerticalScrollIndicator={false}
          >

            {activeTab === 'solid' && (
              <>
                <View style={styles.section}>
                  <Text style={styles.sectionTitle}>Hex Code</Text>
                  <Text style={styles.sectionSubtitle}>Enter a hex color code</Text>
                  <View style={styles.hexInputContainer}>
                    <TextInput
                      style={styles.hexInput}
                      value={hexInput}
                      onChangeText={setHexInput}
                      placeholder="#735DFF"
                      placeholderTextColor="#9CA3AF"
                      maxLength={7}
                      autoCapitalize="characters"
                    />
                    <TouchableOpacity
                      style={[styles.applyButton, { backgroundColor: colors.primary }]}
                      onPress={handleApplyHex}
                    >
                      <Text style={styles.applyButtonText}>Apply</Text>
                    </TouchableOpacity>
                  </View>
                </View>

                <View style={styles.section}>
                  <Text style={styles.sectionTitle}>Presets</Text>
                  <View style={styles.presetGrid}>
                    {THEME_PRESETS.map((preset, index) => (
                      <TouchableOpacity
                        key={index}
                        onPress={() => handlePresetSelect(preset)}
                        style={styles.presetButton}
                        activeOpacity={0.7}
                      >
                        <LinearGradient
                          colors={[preset.primary, preset.secondary]}
                          start={{ x: 0, y: 0 }}
                          end={{ x: 1, y: 1 }}
                          style={styles.presetGradient}
                        >
                          {colors.primary === preset.primary && (
                            <View style={styles.checkmark}>
                              <View style={styles.checkmarkInner} />
                            </View>
                          )}
                        </LinearGradient>
                      </TouchableOpacity>
                    ))}
                  </View>
                </View>

                <View style={styles.section}>
                  <Text style={styles.sectionTitle}>Custom Color</Text>
                  <Text style={styles.sectionSubtitle}>Slide to create your own color</Text>
                  
                  <View style={styles.sliderContainer}>
                    <LinearGradient
                      colors={[
                        '#FF0000',
                        '#FFFF00',
                        '#00FF00',
                        '#00FFFF',
                        '#0000FF',
                        '#FF00FF',
                        '#FF0000',
                      ]}
                      start={{ x: 0, y: 0 }}
                      end={{ x: 1, y: 0 }}
                      style={styles.slider}
                    >
                      <View
                        style={styles.sliderTrack}
                        {...panResponder.panHandlers}
                      >
                        <View
                          style={[
                            styles.sliderThumb,
                            { left: `${(hue / 360) * 100}%` },
                          ]}
                        >
                          <View style={styles.sliderThumbInner} />
                        </View>
                      </View>
                    </LinearGradient>
                  </View>

                  <View style={styles.previewContainer}>
                    <View style={styles.previewLabel}>
                      <Text style={styles.previewText}>Preview</Text>
                    </View>
                    <LinearGradient
                      colors={[
                        `hsl(${hue}, 85%, 55%)`,
                        `hsl(${hue}, 80%, 65%)`,
                      ]}
                      start={{ x: 0, y: 0 }}
                      end={{ x: 1, y: 1 }}
                      style={styles.preview}
                    />
                  </View>
                </View>
              </>
            )}

            {activeTab === 'gradient' && (
              <>
                <View style={styles.section}>
                  <Text style={styles.sectionTitle}>Gradient Type</Text>
                  <View style={styles.gradientTypeContainer}>
                    <TouchableOpacity
                      style={[styles.gradientTypeButton, gradientType === 'linear' && styles.gradientTypeActive]}
                      onPress={() => setGradientType('linear')}
                    >
                      <Text style={[styles.gradientTypeText, gradientType === 'linear' && styles.gradientTypeTextActive]}>
                        Linear
                      </Text>
                    </TouchableOpacity>
                    <TouchableOpacity
                      style={[styles.gradientTypeButton, gradientType === 'radial' && styles.gradientTypeActive]}
                      onPress={() => setGradientType('radial')}
                    >
                      <Text style={[styles.gradientTypeText, gradientType === 'radial' && styles.gradientTypeTextActive]}>
                        Radial
                      </Text>
                    </TouchableOpacity>
                  </View>
                </View>

                <View style={styles.section}>
                  <Text style={styles.sectionTitle}>Gradient Colors (up to 5)</Text>
                  <Text style={styles.sectionSubtitle}>Add or remove colors for your gradient</Text>
                  
                  {gradientColors.map((color, index) => (
                    <View key={index} style={styles.gradientColorRow}>
                      <View style={[styles.gradientColorPreview, { backgroundColor: color }]} />
                      <TextInput
                        style={styles.gradientColorInput}
                        value={color}
                        onChangeText={(text) => handleGradientColorChange(index, text)}
                        placeholder="#735DFF"
                        placeholderTextColor="#9CA3AF"
                        maxLength={7}
                        autoCapitalize="characters"
                      />
                      {gradientColors.length > 2 && (
                        <TouchableOpacity
                          style={styles.removeColorButton}
                          onPress={() => handleRemoveGradientColor(index)}
                        >
                          <Minus color="#EF4444" size={18} strokeWidth={2.5} />
                        </TouchableOpacity>
                      )}
                    </View>
                  ))}

                  {gradientColors.length < 5 && (
                    <TouchableOpacity
                      style={styles.addColorButton}
                      onPress={handleAddGradientColor}
                    >
                      <Plus color={colors.primary} size={20} strokeWidth={2.5} />
                      <Text style={[styles.addColorText, { color: colors.primary }]}>Add Color</Text>
                    </TouchableOpacity>
                  )}

                  <View style={styles.gradientPreviewContainer}>
                    <Text style={styles.gradientPreviewLabel}>Preview</Text>
                    {gradientType === 'radial' ? (
                      <View style={styles.radialGradientContainer}>
                        <LinearGradient
                          colors={gradientColors.length >= 2 ? (gradientColors as [string, string, ...string[]]) : ['#FF4D0C', '#735DFF']}
                          start={{ x: 0.5, y: 0.5 }}
                          end={{ x: 1, y: 1 }}
                          style={[styles.gradientPreview, styles.radialLayer1]}
                        />
                        <LinearGradient
                          colors={gradientColors.length >= 2 ? (gradientColors as [string, string, ...string[]]) : ['#FF4D0C', '#735DFF']}
                          start={{ x: 0.5, y: 0.5 }}
                          end={{ x: 0, y: 1 }}
                          style={[styles.gradientPreview, styles.radialLayer2]}
                        />
                        <LinearGradient
                          colors={gradientColors.length >= 2 ? (gradientColors as [string, string, ...string[]]) : ['#FF4D0C', '#735DFF']}
                          start={{ x: 0.5, y: 0.5 }}
                          end={{ x: 1, y: 0 }}
                          style={[styles.gradientPreview, styles.radialLayer3]}
                        />
                        <LinearGradient
                          colors={gradientColors.length >= 2 ? (gradientColors as [string, string, ...string[]]) : ['#FF4D0C', '#735DFF']}
                          start={{ x: 0.5, y: 0.5 }}
                          end={{ x: 0, y: 0 }}
                          style={[styles.gradientPreview, styles.radialLayer4]}
                        />
                      </View>
                    ) : (
                      <LinearGradient
                        colors={gradientColors.length >= 2 ? (gradientColors as [string, string, ...string[]]) : ['#FF4D0C', '#735DFF']}
                        start={{ x: 0, y: 0 }}
                        end={{ x: 1, y: 1 }}
                        style={styles.gradientPreview}
                      />
                    )}
                  </View>

                  <TouchableOpacity
                    style={[styles.applyGradientButton, { backgroundColor: colors.primary }]}
                    onPress={handleApplyGradient}
                  >
                    <Text style={styles.applyGradientButtonText}>Apply Gradient</Text>
                  </TouchableOpacity>
                </View>
              </>
            )}

            {activeTab === 'background' && (
              <View style={styles.section}>
                <View style={styles.backgroundHeader}>
                  <View style={styles.backgroundIconContainer}>
                    <ImageIcon color={colors.primary} size={24} strokeWidth={2.5} />
                  </View>
                  <View style={styles.backgroundHeaderText}>
                    <Text style={styles.sectionTitle}>Background Image</Text>
                    <Text style={styles.sectionSubtitle}>Set a custom app background</Text>
                  </View>
                </View>

                <TouchableOpacity
                  style={[styles.pickImageButton, { backgroundColor: colors.primary }]}
                  onPress={handlePickImage}
                >
                  <Upload color="#FFFFFF" size={20} strokeWidth={2.5} />
                  <Text style={styles.pickImageButtonText}>Pick Image from Phone</Text>
                </TouchableOpacity>

                <View style={styles.orDivider}>
                  <View style={styles.orLine} />
                  <Text style={styles.orText}>OR</Text>
                  <View style={styles.orLine} />
                </View>

                <TextInput
                  style={styles.backgroundInput}
                  value={backgroundUrl}
                  onChangeText={setBackgroundUrl}
                  placeholder="Enter image URL (e.g., https://unsplash.com/...)"
                  placeholderTextColor="#9CA3AF"
                  multiline
                  numberOfLines={3}
                />

                <Text style={styles.backgroundHint}>💡 Pick from phone or paste an image URL</Text>

                {backgroundUrl.trim() && (
                  <View style={styles.backgroundPreviewContainer}>
                    <Text style={styles.backgroundPreviewLabel}>Preview</Text>
                    <View style={styles.backgroundPreview}>
                      <Text style={styles.backgroundPreviewText}>Image will appear here</Text>
                    </View>
                  </View>
                )}

                <TouchableOpacity
                  style={[styles.applyBackgroundButton, { backgroundColor: colors.primary }]}
                  onPress={handleApplyBackground}
                >
                  <Text style={styles.applyBackgroundButtonText}>Apply Background</Text>
                </TouchableOpacity>
              </View>
            )}
          </ScrollView>
        </Animated.View>
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'flex-end',
  },
  backdrop: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
  },
  content: {
    backgroundColor: '#FFFFFF',
    borderTopLeftRadius: 32,
    borderTopRightRadius: 32,
    paddingTop: 8,
    maxHeight: '90%',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: -4 },
    shadowOpacity: 0.15,
    shadowRadius: 24,
    elevation: 24,
  },
  scrollView: {
    maxHeight: 500,
  },
  handle: {
    width: 40,
    height: 4,
    backgroundColor: '#E5E7EB',
    borderRadius: 2,
    alignSelf: 'center',
    marginBottom: 20,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 24,
    marginBottom: 28,
  },
  headerLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  iconContainer: {
    width: 48,
    height: 48,
    borderRadius: 14,
    backgroundColor: 'rgba(115, 93, 255, 0.1)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  title: {
    fontSize: 20,
    fontWeight: '700',
    color: '#1A1A1A',
    marginBottom: 2,
  },
  subtitle: {
    fontSize: 13,
    color: '#6B7280',
    fontWeight: '500',
  },
  closeButton: {
    width: 40,
    height: 40,
    borderRadius: 12,
    backgroundColor: '#F3F4F6',
    alignItems: 'center',
    justifyContent: 'center',
  },
  tabContainer: {
    flexDirection: 'row',
    paddingHorizontal: 24,
    marginBottom: 20,
    gap: 8,
  },
  tab: {
    flex: 1,
    paddingVertical: 12,
    alignItems: 'center',
    borderRadius: 12,
    backgroundColor: '#F3F4F6',
  },
  tabActive: {
    backgroundColor: '#735DFF',
  },
  tabText: {
    fontSize: 14,
    fontWeight: '600',
    color: '#6B7280',
  },
  tabTextActive: {
    color: '#FFFFFF',
  },
  section: {
    paddingHorizontal: 24,
    marginBottom: 24,
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: '700',
    color: '#1A1A1A',
    marginBottom: 4,
  },
  sectionSubtitle: {
    fontSize: 13,
    color: '#6B7280',
    marginBottom: 16,
    fontWeight: '500',
  },
  presetGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 12,
  },
  presetButton: {
    width: (width - 72) / 4,
    height: 64,
    borderRadius: 16,
    overflow: 'hidden',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 3,
  },
  presetGradient: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  checkmark: {
    width: 28,
    height: 28,
    borderRadius: 14,
    backgroundColor: '#FFFFFF',
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 4,
    elevation: 4,
  },
  checkmarkInner: {
    width: 16,
    height: 16,
    borderRadius: 8,
    backgroundColor: '#10B981',
  },
  sliderContainer: {
    marginBottom: 24,
  },
  slider: {
    height: 56,
    borderRadius: 16,
    overflow: 'hidden',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 3,
  },
  sliderTrack: {
    flex: 1,
    justifyContent: 'center',
  },
  sliderThumb: {
    position: 'absolute',
    width: 40,
    height: 40,
    marginLeft: -20,
    alignItems: 'center',
    justifyContent: 'center',
  },
  sliderThumbInner: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: '#FFFFFF',
    borderWidth: 4,
    borderColor: '#1A1A1A',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.25,
    shadowRadius: 8,
    elevation: 8,
  },
  previewContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  previewLabel: {
    flex: 1,
  },
  previewText: {
    fontSize: 15,
    fontWeight: '600',
    color: '#6B7280',
  },
  preview: {
    width: 120,
    height: 48,
    borderRadius: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 3,
  },
  hexInputContainer: {
    flexDirection: 'row',
    gap: 12,
    alignItems: 'center',
  },
  hexInput: {
    flex: 1,
    height: 48,
    backgroundColor: '#F3F4F6',
    borderRadius: 12,
    paddingHorizontal: 16,
    fontSize: 15,
    fontWeight: '600',
    color: '#1A1A1A',
  },
  applyButton: {
    paddingHorizontal: 24,
    paddingVertical: 14,
    borderRadius: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 3,
  },
  applyButtonText: {
    color: '#FFFFFF',
    fontSize: 15,
    fontWeight: '700',
  },
  gradientTypeContainer: {
    flexDirection: 'row',
    gap: 12,
  },
  gradientTypeButton: {
    flex: 1,
    paddingVertical: 12,
    alignItems: 'center',
    borderRadius: 12,
    backgroundColor: '#F3F4F6',
  },
  gradientTypeActive: {
    backgroundColor: '#735DFF',
  },
  gradientTypeText: {
    fontSize: 14,
    fontWeight: '600',
    color: '#6B7280',
  },
  gradientTypeTextActive: {
    color: '#FFFFFF',
  },
  gradientColorRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    marginBottom: 12,
  },
  gradientColorPreview: {
    width: 40,
    height: 40,
    borderRadius: 10,
    borderWidth: 2,
    borderColor: '#E5E7EB',
  },
  gradientColorInput: {
    flex: 1,
    height: 48,
    backgroundColor: '#F3F4F6',
    borderRadius: 12,
    paddingHorizontal: 16,
    fontSize: 15,
    fontWeight: '600',
    color: '#1A1A1A',
  },
  removeColorButton: {
    width: 40,
    height: 40,
    borderRadius: 10,
    backgroundColor: 'rgba(239, 68, 68, 0.1)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  addColorButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    paddingVertical: 14,
    borderRadius: 12,
    backgroundColor: 'rgba(115, 93, 255, 0.1)',
    marginTop: 8,
  },
  addColorText: {
    fontSize: 15,
    fontWeight: '700',
  },
  gradientPreviewContainer: {
    marginTop: 20,
  },
  gradientPreviewLabel: {
    fontSize: 15,
    fontWeight: '600',
    color: '#6B7280',
    marginBottom: 12,
  },
  gradientPreview: {
    height: 120,
    borderRadius: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 3,
  },
  applyGradientButton: {
    marginTop: 20,
    paddingVertical: 16,
    borderRadius: 12,
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 3,
  },
  applyGradientButtonText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: '700',
  },
  backgroundHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    marginBottom: 16,
  },
  backgroundIconContainer: {
    width: 48,
    height: 48,
    borderRadius: 14,
    backgroundColor: 'rgba(115, 93, 255, 0.1)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  backgroundHeaderText: {
    flex: 1,
  },
  backgroundInput: {
    backgroundColor: '#F3F4F6',
    borderRadius: 12,
    paddingHorizontal: 16,
    paddingVertical: 12,
    fontSize: 14,
    color: '#1A1A1A',
    minHeight: 80,
    textAlignVertical: 'top',
  },
  backgroundHint: {
    fontSize: 12,
    color: '#6B7280',
    marginTop: 8,
    fontWeight: '500',
  },
  backgroundPreviewContainer: {
    marginTop: 20,
  },
  backgroundPreviewLabel: {
    fontSize: 15,
    fontWeight: '600',
    color: '#6B7280',
    marginBottom: 12,
  },
  backgroundPreview: {
    height: 120,
    borderRadius: 16,
    backgroundColor: '#F3F4F6',
    alignItems: 'center',
    justifyContent: 'center',
  },
  backgroundPreviewText: {
    fontSize: 14,
    color: '#9CA3AF',
    fontWeight: '500',
  },
  applyBackgroundButton: {
    marginTop: 20,
    paddingVertical: 16,
    borderRadius: 12,
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 3,
  },
  applyBackgroundButtonText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: '700',
  },
  pickImageButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 10,
    paddingVertical: 16,
    borderRadius: 12,
    marginBottom: 20,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 3,
  },
  pickImageButtonText: {
    color: '#FFFFFF',
    fontSize: 15,
    fontWeight: '700',
  },
  orDivider: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 20,
    gap: 12,
  },
  orLine: {
    flex: 1,
    height: 1,
    backgroundColor: '#E5E7EB',
  },
  orText: {
    fontSize: 13,
    fontWeight: '600',
    color: '#9CA3AF',
  },
  radialGradientContainer: {
    position: 'relative',
    height: 120,
    borderRadius: 16,
    overflow: 'hidden',
  },
  radialLayer1: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    opacity: 0.5,
  },
  radialLayer2: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    opacity: 0.5,
  },
  radialLayer3: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    opacity: 0.5,
  },
  radialLayer4: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    opacity: 0.5,
  },
});
