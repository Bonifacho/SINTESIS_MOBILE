import { Tabs } from 'expo-router';
import { Colors } from '@/src/theme/colors';

export default function TeacherLayout() {
  return (
    <Tabs
      screenOptions={{
        headerShown: false,
        tabBarActiveTintColor: Colors.primary,
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
      <Tabs.Screen name="index" options={{ title: 'Mis Grupos' }} />
      <Tabs.Screen name="results/index" options={{ title: 'Resultados' }} />
    </Tabs>
  );
}