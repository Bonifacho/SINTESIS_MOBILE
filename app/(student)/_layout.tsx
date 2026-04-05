import React from 'react';
import { Tabs } from 'expo-router';
import { Colors } from '@/src/theme/colors';

// Usaremos los íconos por defecto de Expo que ya tienes en tu carpeta components/ui
import { IconSymbol } from '@/components/ui/icon-symbol';

export default function StudentLayout() {
  return (
    <Tabs
      screenOptions={{
        // 🎨 Estilos estrictos basados en tu Identidad Visual
        tabBarActiveTintColor: Colors.primary, // Índigo para la pestaña seleccionada
        tabBarInactiveTintColor: Colors.gray,  // Gris para las no seleccionadas
        tabBarStyle: {
          backgroundColor: Colors.surface,     // Blanco puro para la barra
          borderTopColor: Colors.window,       // Borde sutil
          elevation: 5,                        // Sombra en Android
          shadowOpacity: 0.1,                  // Sombra en iOS
        },
        headerStyle: {
          backgroundColor: Colors.primary,     // El Header será Índigo Institucional
        },
        headerTintColor: Colors.surface,       // El texto del Header será Blanco
        headerTitleStyle: {
          fontWeight: 'bold',
        },
      }}>
      
      {/* 1. Tab de Inicio / Perfil */}
      <Tabs.Screen
        name="index"
        options={{
          title: 'Inicio',
          tabBarIcon: ({ color }) => <IconSymbol size={28} name="house.fill" color={color} />,
        }}
      />

      {/* 2. Tab de Materias (Según tu tablero) */}
      <Tabs.Screen
        name="subjects/index"
        options={{
          title: 'Materias',
          tabBarIcon: ({ color }) => <IconSymbol size={28} name="book.fill" color={color} />,
        }}
      />

      {/* 3. Tab de Progreso (Según tu tablero) */}
      <Tabs.Screen
        name="progress/index"
        options={{
          title: 'Progreso',
          tabBarIcon: ({ color }) => <IconSymbol size={28} name="chart.bar.fill" color={color} />,
        }}
      />

      {/* 🚫 RUTAS OCULTAS EN LA BARRA INFERIOR */}
      {/* OVAs: El estudiante entra a los OVAs desde la materia, no desde la barra inferior */}
      <Tabs.Screen
        name="ovas/index"
        options={{
          href: null, // ¡Este es el truco! La ruta existe, pero no sale en el TabBar
          title: 'Objeto Virtual', 
        }}
      />
    </Tabs>
  );
}