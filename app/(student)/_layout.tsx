// app/(student)/_layout.tsx
import { Tabs } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { useColors } from '@/src/hooks/useColors';

export default function StudentLayout() {
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
      {/* 🟢 RUTAS VISIBLES EN EL TAB BAR */}
      <Tabs.Screen name="index" options={{ title: 'Inicio', tabBarIcon: ({ color, size }) => <Ionicons name="home" size={size} color={color} /> }} />
      <Tabs.Screen name="subjects/index" options={{ title: 'Materias', tabBarIcon: ({ color, size }) => <Ionicons name="book" size={size} color={color} /> }} />
      <Tabs.Screen name="progress/index" options={{ title: 'Progreso', tabBarIcon: ({ color, size }) => <Ionicons name="bar-chart" size={size} color={color} /> }} />
      <Tabs.Screen name="profile/index" options={{ title: 'Perfil', tabBarIcon: ({ color, size }) => <Ionicons name="person-circle" size={size} color={color} /> }} />

      {/* 🔴 RUTAS OCULTAS (Dinámicas y Sub-niveles) */}
      <Tabs.Screen name="ovas" options={{ href: null, headerShown: false, tabBarStyle: { display: 'none' } }} />
    </Tabs>
  );
}