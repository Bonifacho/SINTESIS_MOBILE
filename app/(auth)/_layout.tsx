import { Stack } from 'expo-router';
import { Colors } from '@/src/theme/colors';

export default function AuthLayout() {
  return (
    <Stack screenOptions={{ 
      headerShown: false, // Ocultamos la barra superior para que el Login ocupe toda la pantalla
      contentStyle: { backgroundColor: Colors.background } 
    }}>
      <Stack.Screen name="login" />
      <Stack.Screen name="register" />
      <Stack.Screen name="forgot-password" />
    </Stack>
  );
}