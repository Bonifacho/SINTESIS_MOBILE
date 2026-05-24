import { useEffect } from 'react';
import { ActivityIndicator, View, Text, StyleSheet } from 'react-native';
import { Stack, useRouter, useSegments } from 'expo-router';
import { Colors } from '@/src/theme/colors';
import { useAuthStore } from '@/src/store/authStore';

// Grupos de rutas que requieren autenticación
const PROTECTED_GROUPS = ['(student)', '(teacher)', '(trainee)'];

export default function RootLayout() {
  const router = useRouter();
  const segments = useSegments();
  const { user, token, isLoading } = useAuthStore();

  useEffect(() => {
    if (isLoading) return; // Aún restaurando sesión, no decidir todavía

    // ¿El usuario está dentro de un grupo protegido?
    const currentGroup = segments[0] as string | undefined;
    const isInProtectedRoute = PROTECTED_GROUPS.includes(currentGroup ?? '');
    const isAuthenticated = !!token && !!user;

    if (isInProtectedRoute && !isAuthenticated) {
      // Intento de acceso no autorizado (deep link, URL manual, back navigation)
      router.replace('/(auth)/login');
    }
  }, [isLoading, token, user, segments]);

  // Rúbrica §7: Splash de marca anti-fatiga mientras el middleware persist
  // restaura la sesión desde SecureStore. Evita "flashes" y saltos bruscos.
  if (isLoading) {
    return (
      <View style={styles.splash}>
        <Text style={styles.splashLogo}>SÍNTESIS</Text>
        <Text style={styles.splashSubtitle}>Plataforma de Aprendizaje</Text>
        <ActivityIndicator size="large" color={Colors.secondary} style={styles.splashSpinner} />
      </View>
    );
  }

  return (
    <Stack screenOptions={{ 
      headerShown: false,
      contentStyle: { backgroundColor: Colors.background }
    }}>
      {/* El index es el punto de entrada que decide a dónde ir */}
      <Stack.Screen name="index" />
      
      {/* Grupos de rutas (carpetas con paréntesis) */}
      <Stack.Screen name="(auth)" options={{ animation: 'fade' }} />
      <Stack.Screen name="(student)" options={{ animation: 'slide_from_right', gestureEnabled: false }} />
      <Stack.Screen name="(teacher)" options={{ animation: 'slide_from_right', gestureEnabled: false }} />
      <Stack.Screen name="(trainee)" options={{ animation: 'slide_from_right', gestureEnabled: false }} />
      
      {/* Pantalla de error 404 */}
      <Stack.Screen name="+not-found" options={{ title: '¡Ups!' }} />
    </Stack>
  );
}

const styles = StyleSheet.create({
  splash: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: Colors.primary,
  },
  splashLogo: {
    fontSize: 36,
    fontWeight: '900',
    color: Colors.surface,
    letterSpacing: 4,
  },
  splashSubtitle: {
    fontSize: 14,
    color: Colors.surface,
    opacity: 0.75,
    marginTop: 8,
    fontWeight: '500',
    letterSpacing: 1,
  },
  splashSpinner: {
    marginTop: 32,
  },
});