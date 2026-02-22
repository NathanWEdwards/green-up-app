import { Tabs } from 'expo-router';
import React from 'react';

import { IconSymbol } from '@/components/ui/icon-symbol';
import { Colors } from '@/constants/theme';
import { useColorScheme } from '@/hooks/use-color-scheme';

export default function TabLayout() {
  const colorScheme = useColorScheme();

  return (
    <Tabs
      screenOptions={{
        tabBarActiveTintColor: Colors[colorScheme ?? 'light'].tint,
        headerShown: false,
      }}>
      <Tabs.Screen
        name="index"
        options={{
          title: 'Menu',
          tabBarAccessibilityLabel: 'Open menu',
          tabBarIcon: ({ color }) => <IconSymbol size={28} name="line.3.horizontal" color={color} />,
        }}
      />
      <Tabs.Screen
        name="map/index"
        options={{
          tabBarAccessibilityLabel: 'Open map',
          title: 'Map',
          tabBarIcon: ({ color }) => <IconSymbol size={28} name="map.fill" color={color} />,
        }}
      />
      <Tabs.Screen
        name="teams/index"
        options={{
          title: 'Teams',
          tabBarAccessibilityLabel: 'Access teams',
          tabBarIcon: ({ color }) => <IconSymbol size={28} name="person.fill" color={color} />,
        }}
      />
    </Tabs>
  );
}
