import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { Stack, useRouter, useSegments } from "expo-router";
import * as SplashScreen from "expo-splash-screen";
import React, { useEffect } from "react";
import { GestureHandlerRootView } from "react-native-gesture-handler";
import { LogBox } from "react-native";
import { TasksContext } from "@/contexts/TasksContext";
import { GoalsContext } from "@/contexts/GoalsContext";
import { ProjectsContext } from "@/contexts/ProjectsContext";
import { JournalContext } from "@/contexts/JournalContext";
import { QuoteContext } from "@/contexts/QuoteContext";
import { ThemeContext } from "@/contexts/ThemeContext";
import { OnboardingContext, useOnboarding } from "@/contexts/OnboardingContext";
import { BackupContext } from "@/contexts/BackupContext";

SplashScreen.preventAutoHideAsync();

LogBox.ignoreLogs([
  'Error while flushing PostHog',
  'PostHogFetchNetworkError',
  'Network error while fetching PostHog',
]);

const originalConsoleError = console.error;
console.error = (...args) => {
  if (
    args[0]?.includes?.('PostHog') ||
    args[0]?.includes?.('posthog')
  ) {
    return;
  }
  originalConsoleError(...args);
};

const queryClient = new QueryClient();

function RootLayoutNav() {
  const { isOnboardingComplete, isLoading } = useOnboarding();
  const segments = useSegments();
  const router = useRouter();

  useEffect(() => {
    if (isLoading) return;

    const inOnboarding = segments[0] === 'onboarding';

    if (!isOnboardingComplete && !inOnboarding) {
      router.replace('/onboarding');
    } else if (isOnboardingComplete && inOnboarding) {
      router.replace('/(tabs)');
    }
  }, [isOnboardingComplete, isLoading, segments, router]);

  return (
    <Stack screenOptions={{ headerBackTitle: "Back" }}>
      <Stack.Screen name="onboarding" options={{ headerShown: false }} />
      <Stack.Screen name="(tabs)" options={{ headerShown: false }} />
      <Stack.Screen name="journal" options={{ headerShown: false }} />
      <Stack.Screen name="journal-entry" options={{ headerShown: false }} />
      <Stack.Screen name="trash" options={{ headerShown: false, presentation: "modal" }} />
      <Stack.Screen name="goal/[id]" options={{ headerShown: false }} />
      <Stack.Screen name="project/[id]" options={{ headerShown: false }} />
      <Stack.Screen name="add-goal" options={{ headerShown: false }} />
      <Stack.Screen name="add-project" options={{ headerShown: false }} />
      <Stack.Screen name="add-task" options={{ headerShown: false }} />
      <Stack.Screen name="edit-task/[id]" options={{ headerShown: false }} />
      <Stack.Screen name="edit-goal/[id]" options={{ headerShown: false }} />
      <Stack.Screen name="edit-project/[id]" options={{ headerShown: false }} />
    </Stack>
  );
}

export default function RootLayout() {
  useEffect(() => {
    SplashScreen.hideAsync();
  }, []);

  return (
    <QueryClientProvider client={queryClient}>
      <OnboardingContext>
        <ThemeContext>
          <BackupContext>
            <TasksContext>
              <GoalsContext>
                <ProjectsContext>
                  <JournalContext>
                    <QuoteContext>
                      <GestureHandlerRootView style={{ flex: 1 }}>
                        <RootLayoutNav />
                      </GestureHandlerRootView>
                    </QuoteContext>
                  </JournalContext>
                </ProjectsContext>
              </GoalsContext>
            </TasksContext>
          </BackupContext>
        </ThemeContext>
      </OnboardingContext>
    </QueryClientProvider>
  );
}
