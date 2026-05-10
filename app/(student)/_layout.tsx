import { Tabs } from 'expo-router';
import { Colors } from '@/src/theme/colors';
import { Ionicons } from '@expo/vector-icons';

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
      {/* 🟢 RUTAS VISIBLES EN EL TAB BAR */}
      <Tabs.Screen name="index" options={{ title: 'Inicio', tabBarIcon: ({ color, size }) => <Ionicons name="home" size={size} color={color} /> }} />
      <Tabs.Screen name="subjects/index" options={{ title: 'Materias', tabBarIcon: ({ color, size }) => <Ionicons name="book" size={size} color={color} /> }} />
      <Tabs.Screen name="progress/index" options={{ title: 'Progreso', tabBarIcon: ({ color, size }) => <Ionicons name="bar-chart" size={size} color={color} /> }} />
      <Tabs.Screen name="profile/index" options={{ title: 'Perfil', tabBarIcon: ({ color, size }) => <Ionicons name="person-circle" size={size} color={color} /> }} />
      
      {/* 🔴 RUTAS OCULTAS (Dinámicas y Sub-niveles) */}
      <Tabs.Screen 
        name="ovas/index" 
        options={{ href: null, headerShown: false }} 
      />
      <Tabs.Screen 
        name="ovas/exam/[ovaId]" 
        options={{ 
          href: null,               // Lo esconde del Tab Bar
          headerShown: false,       // Esconde el título feo de la ruta
          tabBarStyle: { display: 'none' } // ¡Oculta toda la barra para MODO ENFOQUE de examen!
        }} 
      />
      <Tabs.Screen 
        name="ovas/exam/result/[attemptId]" 
        options={{ 
          href: null, 
          headerShown: false,
          tabBarStyle: { display: 'none' } // Mantiene la inmersión en el resultado
        }} 
      />
      <Tabs.Screen 
        name="ovas/video/[id]" 
        options={{ 
          href: null,                       // Oculta del Tab Bar
          headerShown: false,               // Sin header para reproductor inmersivo
          tabBarStyle: { display: 'none' }  // Sin barra inferior durante la reproducción
        }} 
      />
    </Tabs>
  );
}