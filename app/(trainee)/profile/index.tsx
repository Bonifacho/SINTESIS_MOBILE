import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Alert } from 'react-native';
import { useRouter } from 'expo-router';
import { Colors } from '@/src/theme/colors';
import { useAuthStore } from '@/src/store/authStore';
import { Ionicons } from '@expo/vector-icons';

export default function TraineeProfileScreen() {
  const router = useRouter();
  const { user, clearAuth } = useAuthStore();

  const handleLogout = () => {
    Alert.alert('Cerrar Sesión', '¿Estás seguro que deseas salir?', [
      { text: 'Cancelar', style: 'cancel' },
      { 
        text: 'Salir', 
        style: 'destructive',
        onPress: async () => {
          // 1. Borramos los datos de sesión en RAM
          await clearAuth();
          
          // 2. FIX: Esperamos a que la alerta se cierre y navegamos DIRECTO al login
          setTimeout(() => {
            router.replace('/(auth)/login');
          }, 150);
        } 
      }
    ]);
  };

  return (
    <View style={styles.container}>
      <View style={styles.card}>
        <View style={styles.avatar}>
          <Ionicons name="person" size={40} color={Colors.info} />
        </View>
        <Text style={styles.name}>{user?.full_name}</Text>
        <Text style={styles.role}>Practicante en Observación</Text>
        <Text style={styles.username}>Usuario: @{user?.username}</Text>
      </View>

      <TouchableOpacity style={styles.logoutBtn} onPress={handleLogout}>
        <Ionicons name="log-out-outline" size={20} color={Colors.error} />
        <Text style={styles.logoutText}>Cerrar Sesión</Text>
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: Colors.background, padding: 20, justifyContent: 'center' },
  card: { backgroundColor: Colors.surface, borderRadius: 16, padding: 30, alignItems: 'center', elevation: 2, marginBottom: 30 },
  avatar: { width: 80, height: 80, borderRadius: 40, backgroundColor: Colors.info + '15', justifyContent: 'center', alignItems: 'center', marginBottom: 16 },
  name: { fontSize: 22, fontWeight: 'bold', color: Colors.dark, marginBottom: 8, textAlign: 'center' },
  role: { fontSize: 16, color: Colors.info, fontWeight: '600', marginBottom: 4 },
  username: { fontSize: 14, color: Colors.gray },
  logoutBtn: { flexDirection: 'row', alignItems: 'center', justifyContent: 'center', backgroundColor: Colors.surface, padding: 16, borderRadius: 12, borderWidth: 1, borderColor: Colors.error + '50', gap: 8 },
  logoutText: { color: Colors.error, fontSize: 16, fontWeight: 'bold' }
});