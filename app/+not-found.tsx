import { Link, Stack } from 'expo-router';
import { StyleSheet, Text, View } from 'react-native';
import { Colors } from '@/src/theme/colors';

export default function NotFoundScreen() {
  return (
    <>
      <Stack.Screen options={{ title: 'Ruta no encontrada', headerShown: false }} />
      <View style={styles.container}>
        <Text style={styles.title}>404 - Módulo no disponible</Text>
        <Text style={styles.subtitle}>
          El recurso al que intentas acceder no existe en SÍNTESIS o no tienes los permisos necesarios.
        </Text>
        
        {/* Este botón siempre devuelve al usuario a la raíz, donde el middleware de 
            Zustand lo redirigirá a su dashboard correcto o al Login */}
        <Link href="/" style={styles.link}>
          <Text style={styles.linkText}>Volver al Inicio Seguro</Text>
        </Link>
      </View>
    </>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    padding: 24,
    backgroundColor: Colors.background, // Blanco Grisáceo
  },
  title: {
    fontSize: 22,
    fontWeight: '800',
    color: Colors.primary, // Índigo
    marginTop: 20,
    marginBottom: 12,
  },
  subtitle: {
    fontSize: 16,
    color: Colors.gray,
    textAlign: 'center',
    marginBottom: 40,
    lineHeight: 24,
  },
  link: {
    paddingVertical: 14,
    paddingHorizontal: 28,
    backgroundColor: Colors.primary,
    borderRadius: 8,
  },
  linkText: {
    color: Colors.surface, // Blanco Puro
    fontWeight: 'bold',
    fontSize: 16,
  },
});