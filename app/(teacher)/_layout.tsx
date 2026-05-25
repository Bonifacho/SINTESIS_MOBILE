import { Tabs } from 'expo-router';
import { Colors } from '@/src/theme/colors';
import { Ionicons } from '@expo/vector-icons';

export default function TeacherLayout() {
  return (
    <Tabs
      screenOptions={{
        tabBarActiveTintColor: Colors.primary,
        tabBarInactiveTintColor: Colors.gray,
        tabBarStyle: { backgroundColor: Colors.surface, borderTopColor: Colors.window, borderTopWidth: 1, height: 64, paddingBottom: 10, paddingTop: 6 },
        tabBarLabelStyle: { fontSize: 11, fontWeight: '600' },
        headerStyle: { backgroundColor: Colors.primary },
        headerTintColor: Colors.surface,
        headerTitleStyle: { fontWeight: 'bold' },
      }}
    >
      <Tabs.Screen name="index" options={{ title: 'Mis Grupos', tabBarIcon: ({ color, size }) => <Ionicons name="people" size={size} color={color} /> }} />
      <Tabs.Screen name="students/index" options={{ title: 'Estudiantes', tabBarIcon: ({ color, size }) => <Ionicons name="search" size={size} color={color} /> }} />
      <Tabs.Screen name="results/index" options={{ title: 'Resultados', tabBarIcon: ({ color, size }) => <Ionicons name="stats-chart" size={size} color={color} /> }} />
      <Tabs.Screen name="profile/index" options={{ title: 'Perfil', tabBarIcon: ({ color, size }) => <Ionicons name="person-circle" size={size} color={color} /> }} />
    </Tabs>
  );
}