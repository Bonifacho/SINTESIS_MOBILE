import { Stack } from 'expo-router';
import { Colors } from '@/src/theme/colors';

export default function RootLayout() {
  return (
    <Stack screenOptions={{ 
      headerShown: false,
      contentStyle: { backgroundColor: Colors.background }
    }}>
      {/* El index es el punto de entrada que decide a dónde ir */}
      <Stack.Screen name="index" />
      
      {/* Grupos de rutas (carperas con paréntesis) */}
      <Stack.Screen name="(auth)" options={{ animation: 'fade' }} />
      <Stack.Screen name="(student)" options={{ animation: 'slide_from_right' }} />
      <Stack.Screen name="(teacher)" options={{ animation: 'slide_from_right' }} />
      <Stack.Screen name="(trainee)" options={{ animation: 'slide_from_right' }} />
      
      {/* Pantalla de error 404 */}
      <Stack.Screen name="+not-found" options={{ title: '¡Ups!' }} />
    </Stack>
  );
}