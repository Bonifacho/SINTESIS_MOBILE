import { Tabs } from 'expo-router';
import { Colors } from '@/src/theme/colors';

export default function StudentLayout() {
  return (
    <Tabs
      screenOptions={{
        headerShown: false,
        tabBarActiveTintColor: Colors.secondary,
        tabBarInactiveTintColor: Colors.gray,
        tabBarStyle: {
          backgroundColor: Colors.surface,
          borderTopColor: Colors.window,
          borderTopWidth: 1,
          height: 60,
          paddingBottom: 8,
        },
        tabBarLabelStyle: { fontSize: 11, fontWeight: '600' },
      }}
    >
      <Tabs.Screen name="index"           options={{ title: 'Inicio' }} />
      <Tabs.Screen name="subjects/index"  options={{ title: 'Materias' }} />
      <Tabs.Screen name="ovas/index"      options={{ title: 'OVAs' }} />
      <Tabs.Screen name="progress/index"  options={{ title: 'Progreso' }} />
    </Tabs>
  );
}