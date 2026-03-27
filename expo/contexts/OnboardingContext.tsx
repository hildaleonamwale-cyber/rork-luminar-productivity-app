import createContextHook from '@nkzw/create-context-hook';
import { useState, useEffect } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';

const ONBOARDING_KEY = '@onboarding_complete';
const USER_NAME_KEY = '@user_name';

export const [OnboardingContext, useOnboarding] = createContextHook(() => {
  const [isOnboardingComplete, setIsOnboardingComplete] = useState<boolean>(false);
  const [userName, setUserName] = useState<string>('');
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    loadOnboardingState();
  }, []);

  const loadOnboardingState = async () => {
    try {
      const [onboardingComplete, name] = await Promise.all([
        AsyncStorage.getItem(ONBOARDING_KEY),
        AsyncStorage.getItem(USER_NAME_KEY),
      ]);
      
      setIsOnboardingComplete(onboardingComplete === 'true');
      setUserName(name || '');
    } catch (error) {
      console.log('Error loading onboarding state:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const completeOnboarding = async (name: string) => {
    try {
      await Promise.all([
        AsyncStorage.setItem(ONBOARDING_KEY, 'true'),
        AsyncStorage.setItem(USER_NAME_KEY, name),
      ]);
      setIsOnboardingComplete(true);
      setUserName(name);
    } catch (error) {
      console.log('Error completing onboarding:', error);
    }
  };

  const resetOnboarding = async () => {
    try {
      await Promise.all([
        AsyncStorage.removeItem(ONBOARDING_KEY),
        AsyncStorage.removeItem(USER_NAME_KEY),
      ]);
      setIsOnboardingComplete(false);
      setUserName('');
    } catch (error) {
      console.log('Error resetting onboarding:', error);
    }
  };

  const updateUserName = async (name: string) => {
    try {
      await AsyncStorage.setItem(USER_NAME_KEY, name);
      setUserName(name);
    } catch (error) {
      console.log('Error updating user name:', error);
    }
  };

  return {
    isOnboardingComplete,
    userName,
    isLoading,
    completeOnboarding,
    resetOnboarding,
    updateUserName,
  };
});
