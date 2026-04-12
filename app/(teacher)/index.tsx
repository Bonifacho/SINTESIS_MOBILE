import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { Colors } from '@/src/theme/colors';
import { useAuthStore } from '@/src/store/authStore';
import { useRouter } from 'expo-router';

export default function TeacherGroupsScreen() {
  // Traemos la función para borrar la sesión y el enrutador
  const clearAuth = useAuthStore((state) => state.clearAuth);
  const router = useRouter();

  const handleLogout = async () => {
    await clearAuth(); // Destruye el token del celular
    router.replace('/(auth)/login'); // Te devuelve a la pantalla de Login
  };

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.title}>Gestión de Grupos</Text>
        <Text style={styles.subtitle}>Selecciona un grupo para administrar su contenido.</Text>
      </View>
      <View style={styles.emptyContainer}>
        <Text style={styles.emptyText}>Cargando grupos asignados...</Text>
        
        {/* BOTÓN DE CIERRE DE SESIÓN */}
        <TouchableOpacity style={styles.logoutButton} onPress={handleLogout} activeOpacity={0.8}>
          <Text style={styles.logoutText}>Cerrar Sesión</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: Colors.background },
  header: { padding: 24, backgroundColor: Colors.surface, borderBottomWidth: 1, borderBottomColor: Colors.window },
  title: { fontSize: 24, fontWeight: 'bold', color: Colors.dark, marginBottom: 4 },
  subtitle: { fontSize: 14, color: Colors.gray },
  emptyContainer: { flex: 1, justifyContent: 'center', alignItems: 'center' },
  emptyText: { fontSize: 16, color: Colors.gray, fontStyle: 'italic', marginBottom: 20 },
  
  // Estilos del nuevo botón usando tu color de error (Rojo suave)
  logoutButton: {
    backgroundColor: Colors.error, 
    paddingVertical: 12,
    paddingHorizontal: 24,
    borderRadius: 8,
    elevation: 3,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
  },
  logoutText: {
    color: Colors.surface,
    fontSize: 16,
    fontWeight: 'bold',
  }
});