// app/(teacher)/_layout.tsx
// 4 tabs del docente. La vista "Actividad" es accesible desde el botón
// en la pestaña Resultados (como stack encima), NO como tab propio.
import { Tabs } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { useColors } from '@/src/hooks/useColors';

export default function TeacherLayout() {
  const C = useColors();
  return (
    <Tabs
      backBehavior="history"
      screenOptions={{
        tabBarActiveTintColor: C.primary,
        tabBarInactiveTintColor: C.gray,
        tabBarStyle: { backgroundColor: C.surface, borderTopColor: C.window, borderTopWidth: 1, height: 64, paddingBottom: 10, paddingTop: 6 },
        tabBarLabelStyle: { fontSize: 11, fontWeight: '600' },
        headerStyle: { backgroundColor: C.primary },
        headerTintColor: '#fff',
        headerTitleStyle: { fontWeight: 'bold' },
      }}
    >
      <Tabs.Screen name="index" options={{ title: 'Mis Grupos', tabBarIcon: ({ color, size }) => <Ionicons name="people" size={size} color={color} /> }} />
      <Tabs.Screen name="students/index" options={{ title: 'Estudiantes', tabBarIcon: ({ color, size }) => <Ionicons name="search" size={size} color={color} /> }} />
      <Tabs.Screen name="results/index" options={{ title: 'Resultados', tabBarIcon: ({ color, size }) => <Ionicons name="stats-chart" size={size} color={color} /> }} />
      <Tabs.Screen name="profile/index" options={{ title: 'Perfil', tabBarIcon: ({ color, size }) => <Ionicons name="person-circle" size={size} color={color} /> }} />
      {/* Activity: ruta oculta del tab bar — se navega desde Results */}
      <Tabs.Screen name="activity" options={{ href: null, headerShown: false, tabBarStyle: { display: 'none' } }} />
    </Tabs>
  );
}