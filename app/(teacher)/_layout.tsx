import React from 'react';
import { Tabs } from 'expo-router';
import { Colors } from '@/src/theme/colors';
import { IconSymbol } from '@/components/ui/icon-symbol';

export default function TeacherLayout() {
  return (
    <Tabs
      screenOptions={{
        tabBarActiveTintColor: Colors.primary,
        tabBarInactiveTintColor: Colors.gray,
        tabBarStyle: {
          backgroundColor: Colors.surface,
          borderTopColor: Colors.window,
        },
        headerStyle: { backgroundColor: Colors.primary },
        headerTintColor: Colors.surface,
      }}>
      <Tabs.Screen
        name="index"
        options={{
          title: 'Mis Grupos',
          tabBarIcon: ({ color }) => <IconSymbol size={28} name="person.3.fill" color={color} />,
        }}
      />
      <Tabs.Screen
        name="results/index"
        options={{
          title: 'Resultados',
          tabBarIcon: ({ color }) => <IconSymbol size={28} name="list.bullet.clipboard.fill" color={color} />,
        }}
      />
    </Tabs>
  );
}