// app/(trainee)/_layout.tsx
import { Redirect, Tabs } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { useColors } from '@/src/hooks/useColors';
import { useAuthStore } from '@/src/store/authStore';

export default function TraineeLayout() {
  const { user, token } = useAuthStore();
  const C = useColors();

  if (!token || !user) {
    return <Redirect href="/(auth)/login" />;
  }

  if (user.role !== 'practicante') {
    if (user.role === 'docente') return <Redirect href="/(teacher)" />;
    if (user.role === 'estudiante') return <Redirect href="/(student)" />;
    return <Redirect href="/(auth)/login" />;
  }

  return (
    <Tabs
      backBehavior="history"
      screenOptions={{
        tabBarActiveTintColor: C.info,
        tabBarInactiveTintColor: C.gray,
        tabBarStyle: { backgroundColor: C.surface, borderTopColor: C.window, borderTopWidth: 1, height: 64, paddingBottom: 10, paddingTop: 6 },
        tabBarLabelStyle: { fontSize: 11, fontWeight: '600' },
        headerStyle: { backgroundColor: C.info },
        headerTintColor: '#fff',
        headerTitleStyle: { fontWeight: 'bold' },
      }}
    >
      <Tabs.Screen name="index" options={{ title: 'Grupos', tabBarIcon: ({ color, size }) => <Ionicons name="people" size={size} color={color} /> }} />
      <Tabs.Screen name="students/index" options={{ title: 'Estudiantes', tabBarIcon: ({ color, size }) => <Ionicons name="search" size={size} color={color} /> }} />
      <Tabs.Screen name="stats/index" options={{ title: 'Estadísticas', tabBarIcon: ({ color, size }) => <Ionicons name="stats-chart" size={size} color={color} /> }} />
      <Tabs.Screen name="profile/index" options={{ title: 'Perfil', tabBarIcon: ({ color, size }) => <Ionicons name="person-circle" size={size} color={color} /> }} />
    </Tabs>
  );
}