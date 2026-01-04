import { Tabs } from "expo-router";
import React from "react";
import CustomTabBar from "@/components/CustomTabBar";

export default function TabLayout() {
  return (
    <Tabs
      tabBar={(props) => <CustomTabBar {...props} />}
      screenOptions={{
        headerShown: false,
      }}
    >
      <Tabs.Screen name="index" />
      <Tabs.Screen name="tasks" />
      <Tabs.Screen name="goals" />
      <Tabs.Screen name="projects" />
    </Tabs>
  );
}
