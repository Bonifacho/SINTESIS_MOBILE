import { Tabs } from 'expo-router';
import { Colors } from '@/src/theme/colors';
import { IconSymbol } from '@/components/ui/icon-symbol';

export default function StudentLayout() {
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
      <Tabs.Screen name="index" options={{ title: 'Inicio', tabBarIcon: ({ color, size }) => <IconSymbol name="house.fill" size={size} color={color} /> }} />
      <Tabs.Screen name="subjects/index" options={{ title: 'Materias', tabBarIcon: ({ color, size }) => <IconSymbol name="book.fill" size={size} color={color} /> }} />
      <Tabs.Screen name="progress/index" options={{ title: 'Progreso', tabBarIcon: ({ color, size }) => <IconSymbol name="chart.bar.fill" size={size} color={color} /> }} />
      <Tabs.Screen name="profile/index" options={{ title: 'Perfil', tabBarIcon: ({ color, size }) => <IconSymbol name="person.crop.circle.fill" size={size} color={color} /> }} />
      <Tabs.Screen name="ovas/index" options={{ href: null, title: 'OVAs' }} />
    </Tabs>
  );
}