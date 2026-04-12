import { Tabs } from 'expo-router';
import { Colors } from '@/src/theme/colors';
import { IconSymbol } from '@/components/ui/icon-symbol';

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
      <Tabs.Screen name="index" options={{ title: 'Mis Grupos', tabBarIcon: ({ color, size }) => <IconSymbol name="person.3.fill" size={size} color={color} /> }} />
      <Tabs.Screen
        name="students/index"
        options={{
          title: 'Estudiantes',
          tabBarIcon: ({ color, size }) =>
            <IconSymbol name="person.2.fill" size={size} color={color} />,
        }} />
      <Tabs.Screen name="results/index" options={{ title: 'Resultados', tabBarIcon: ({ color, size }) => <IconSymbol name="chart.bar.fill" size={size} color={color} /> }} />
      <Tabs.Screen name="profile/index" options={{ title: 'Perfil', tabBarIcon: ({ color, size }) => <IconSymbol name="person.crop.circle.fill" size={size} color={color} /> }} />
    </Tabs>
  );
}