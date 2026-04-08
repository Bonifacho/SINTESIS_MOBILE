import React from 'react';
import { Tabs } from 'expo-router';
import { Colors } from '@/src/theme/colors';
import { IconSymbol } from '@/components/ui/icon-symbol';

export default function TraineeLayout() {
  return (
    <Tabs
      screenOptions={{
        tabBarActiveTintColor: Colors.primary,
        tabBarInactiveTintColor: Colors.gray,
        tabBarStyle: { backgroundColor: Colors.surface, borderTopColor: Colors.window },
        headerStyle: { backgroundColor: Colors.primary },
        headerTintColor: Colors.surface,
      }}>
      <Tabs.Screen
        name="index"
        options={{
          title: 'Observación',
          tabBarIcon: ({ color }) => <IconSymbol size={28} name="eye.fill" color={color} />,
        }}
      />
      <Tabs.Screen
        name="stats/index"
        options={{
          title: 'Métricas',
          tabBarIcon: ({ color }) => <IconSymbol size={28} name="chart.bar.doc.horizontal" color={color} />,
        }}
      />
    </Tabs>
  );
}