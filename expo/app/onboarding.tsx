import React, { useState, useRef } from 'react';
import {
  View,
  Text,
  StyleSheet,
  Dimensions,
  TouchableOpacity,
  TextInput,
  Animated,
  ScrollView,
  KeyboardAvoidingView,
  Platform,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useRouter } from 'expo-router';
import {
  Target,
  Sparkles,
  CheckCircle2,
  BarChart3,
  BookOpen,
} from 'lucide-react-native';
import { useOnboarding } from '@/contexts/OnboardingContext';
import Colors from '@/constants/colors';

const { width } = Dimensions.get('window');

const THEME_COLOR = '#DA9381';

const screens = [
  {
    id: 1,
    icon: Target,
    title: 'Set Meaningful Goals',
    description: 'Create and track your personal and professional goals. Break them down into actionable steps and watch your progress grow every day.',
  },
  {
    id: 2,
    icon: CheckCircle2,
    title: 'Organize Your Tasks',
    description: 'Manage your daily tasks with ease. Set priorities, deadlines, and categories to stay on top of everything that matters.',
  },
  {
    id: 3,
    icon: BarChart3,
    title: 'Track Your Progress',
    description: 'Visualize your productivity with beautiful charts and insights. See your streaks, completion rates, and celebrate your wins.',
  },
  {
    id: 4,
    icon: BookOpen,
    title: 'Journal Your Journey',
    description: 'Reflect on your day with built-in journaling. Capture your thoughts, feelings, and the lessons learned along the way.',
  },
];

export default function OnboardingScreen() {
  const router = useRouter();
  const { completeOnboarding } = useOnboarding();
  const [currentScreen, setCurrentScreen] = useState(0);
  const [userName, setUserNameInput] = useState('');
  const scrollX = useRef(new Animated.Value(0)).current;
  const scrollViewRef = useRef<ScrollView>(null);

  const isNameScreen = currentScreen === screens.length;
  const isLastScreen = currentScreen === screens.length - 1;

  const handleNext = () => {
    if (isNameScreen) {
      if (userName.trim()) {
        completeOnboarding(userName.trim());
        router.replace('/(tabs)');
      }
    } else {
      const nextScreen = currentScreen + 1;
      setCurrentScreen(nextScreen);
      scrollViewRef.current?.scrollTo({
        x: nextScreen * width,
        animated: true,
      });
    }
  };

  const handleSkip = () => {
    const nameScreenIndex = screens.length;
    setCurrentScreen(nameScreenIndex);
    scrollViewRef.current?.scrollTo({
      x: nameScreenIndex * width,
      animated: true,
    });
  };

  const renderScreen = (screen: typeof screens[0], index: number) => {
    const Icon = screen.icon;

    return (
      <View key={screen.id} style={styles.screenContainer}>
        <View style={styles.iconContainer}>
          <View style={[styles.iconCircle, { backgroundColor: `${THEME_COLOR}15` }]}>
            <View style={[styles.iconInner, { backgroundColor: `${THEME_COLOR}30` }]}>
              <Icon color={THEME_COLOR} size={56} strokeWidth={2.5} />
            </View>
          </View>
        </View>

        <View style={styles.contentContainer}>
          <Text style={styles.title}>{screen.title}</Text>
          <Text style={styles.description}>{screen.description}</Text>
        </View>
      </View>
    );
  };

  const renderNameScreen = () => {
    return (
      <View style={styles.screenContainer}>
        <View style={styles.iconContainer}>
          <View style={[styles.iconCircle, { backgroundColor: `${THEME_COLOR}15` }]}>
            <View style={[styles.iconInner, { backgroundColor: `${THEME_COLOR}30` }]}>
              <Sparkles color={THEME_COLOR} size={56} strokeWidth={2.5} fill={THEME_COLOR} />
            </View>
          </View>
        </View>

        <View style={styles.contentContainer}>
          <Text style={styles.title}>What should we call you?</Text>
          <Text style={styles.description}>
            We&apos;d love to know your name so we can personalize your experience and cheer you on!
          </Text>

          <View style={styles.inputContainer}>
            <TextInput
              style={[styles.input, { borderColor: THEME_COLOR }]}
              placeholder="Enter your name"
              placeholderTextColor={Colors.textSecondary}
              value={userName}
              onChangeText={setUserNameInput}
              autoFocus
              autoCapitalize="words"
              returnKeyType="done"
              onSubmitEditing={handleNext}
            />
          </View>
        </View>
      </View>
    );
  };

  return (
    <SafeAreaView style={styles.container} edges={['top', 'bottom']}>
      <View style={styles.container}>
        <View style={styles.header}>
          <View style={styles.logoContainer}>
            <View style={[styles.logo, { backgroundColor: THEME_COLOR }]}>
              <Sparkles color={Colors.white} size={28} strokeWidth={3} fill={Colors.white} />
            </View>
          </View>

          {!isNameScreen && (
            <TouchableOpacity onPress={handleSkip} style={styles.skipButton}>
              <Text style={[styles.skipText, { color: THEME_COLOR }]}>Skip</Text>
            </TouchableOpacity>
          )}
        </View>

        <KeyboardAvoidingView
          behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
          style={styles.content}
        >
          <ScrollView
            ref={scrollViewRef}
            horizontal
            pagingEnabled
            showsHorizontalScrollIndicator={false}
            scrollEnabled={false}
            onScroll={Animated.event(
              [{ nativeEvent: { contentOffset: { x: scrollX } } }],
              { useNativeDriver: false }
            )}
            scrollEventThrottle={16}
          >
            {screens.map((screen, index) => renderScreen(screen, index))}
            {renderNameScreen()}
          </ScrollView>

          <View style={styles.footer}>
            <View style={styles.dotsContainer}>
              {[...screens, { id: 'name' }].map((_, index) => {
                const opacity = scrollX.interpolate({
                  inputRange: [
                    (index - 1) * width,
                    index * width,
                    (index + 1) * width,
                  ],
                  outputRange: [0.3, 1, 0.3],
                  extrapolate: 'clamp',
                });

                const scale = scrollX.interpolate({
                  inputRange: [
                    (index - 1) * width,
                    index * width,
                    (index + 1) * width,
                  ],
                  outputRange: [1, 1.5, 1],
                  extrapolate: 'clamp',
                });

                return (
                  <Animated.View
                    key={index}
                    style={[
                      styles.dot,
                      {
                        backgroundColor: THEME_COLOR,
                        opacity,
                        transform: [{ scale }],
                      },
                    ]}
                  />
                );
              })}
            </View>

            <TouchableOpacity
              style={[
                styles.button,
                { backgroundColor: THEME_COLOR },
                isNameScreen && !userName.trim() && styles.buttonDisabled,
              ]}
              onPress={handleNext}
              disabled={isNameScreen && !userName.trim()}
              activeOpacity={0.8}
            >
              <Text style={styles.buttonText}>
                {isNameScreen ? "Let&apos;s Go!" : isLastScreen ? 'Continue' : 'Next'}
              </Text>
            </TouchableOpacity>
          </View>
        </KeyboardAvoidingView>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.white,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 24,
    paddingTop: 16,
    paddingBottom: 24,
  },
  logoContainer: {
    flex: 1,
  },
  logo: {
    width: 56,
    height: 56,
    borderRadius: 18,
    alignItems: 'center',
    justifyContent: 'center',
  },
  skipButton: {
    paddingHorizontal: 16,
    paddingVertical: 8,
  },
  skipText: {
    fontSize: 16,
    fontWeight: '700',
  },
  content: {
    flex: 1,
  },
  screenContainer: {
    width,
    paddingHorizontal: 32,
    alignItems: 'center',
    justifyContent: 'center',
  },
  iconContainer: {
    alignItems: 'center',
    marginBottom: 48,
  },
  iconCircle: {
    width: 180,
    height: 180,
    borderRadius: 90,
    alignItems: 'center',
    justifyContent: 'center',
  },
  iconInner: {
    width: 140,
    height: 140,
    borderRadius: 70,
    alignItems: 'center',
    justifyContent: 'center',
  },
  contentContainer: {
    alignItems: 'center',
    paddingHorizontal: 20,
  },
  title: {
    fontSize: 32,
    fontWeight: '800',
    color: Colors.text,
    textAlign: 'center',
    marginBottom: 20,
    lineHeight: 40,
  },
  description: {
    fontSize: 17,
    fontWeight: '500',
    color: Colors.textSecondary,
    textAlign: 'center',
    lineHeight: 26,
    paddingHorizontal: 8,
  },
  inputContainer: {
    width: '100%',
    marginTop: 40,
  },
  input: {
    width: '100%',
    height: 64,
    borderWidth: 2,
    borderRadius: 16,
    paddingHorizontal: 20,
    fontSize: 18,
    fontWeight: '600',
    color: Colors.text,
    backgroundColor: Colors.white,
  },
  footer: {
    paddingHorizontal: 32,
    paddingBottom: 24,
    paddingTop: 32,
  },
  dotsContainer: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 32,
    gap: 8,
  },
  dot: {
    width: 10,
    height: 10,
    borderRadius: 5,
  },
  button: {
    height: 64,
    borderRadius: 20,
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: THEME_COLOR,
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.3,
    shadowRadius: 16,
    elevation: 8,
  },
  buttonDisabled: {
    opacity: 0.5,
  },
  buttonText: {
    fontSize: 18,
    fontWeight: '800',
    color: Colors.white,
    letterSpacing: 0.5,
  },
});
