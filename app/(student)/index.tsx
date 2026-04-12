import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity, ScrollView } from 'react-native';
import { Colors } from '@/src/theme/colors';
import { useAuthStore } from '@/src/store/authStore';
import { useRouter } from 'expo-router';
import { IconSymbol } from '@/components/ui/icon-symbol';

export default function StudentHome() {
  const { user, clearAuth } = useAuthStore();
  const router = useRouter();

  const handleLogout = async () => {
    await clearAuth();
    router.replace('/(auth)/login');
  };

  return (
    <ScrollView style={styles.container} contentContainerStyle={styles.content}>
      {/* Tarjeta de Perfil (Material Design 3) */}
      <View style={styles.profileCard}>
        <View style={styles.avatarContainer}>
          <IconSymbol name="person.crop.circle.fill" size={64} color={Colors.primary} />
        </View>
        <Text style={styles.userName}>{user?.full_name || 'Estudiante SÍNTESIS'}</Text>
        <Text style={styles.userEmail}>{user?.email || 'correo@sintesis.edu.co'}</Text>
        <View style={styles.roleBadge}>
          <Text style={styles.roleText}>Rol: {user?.role?.toUpperCase()}</Text>
        </View>
      </View>

      {/* Tarjeta de Resumen Rápido */}
      <View style={styles.statsCard}>
        <Text style={styles.sectionTitle}>Resumen Académico</Text>
        <View style={styles.statsRow}>
          <View style={styles.statBox}>
            <Text style={styles.statNumber}>3</Text>
            <Text style={styles.statLabel}>Materias</Text>
          </View>
          <View style={styles.statBox}>
            <Text style={styles.statNumber}>12</Text>
            <Text style={styles.statLabel}>OVAs Vistos</Text>
          </View>
        </View>
      </View>

      {/* Botón de Cierre de Sesión Profesional */}
      <TouchableOpacity style={styles.logoutButton} onPress={handleLogout} activeOpacity={0.8}>
        <IconSymbol name="rectangle.portrait.and.arrow.right" size={20} color={Colors.surface} />
        <Text style={styles.logoutText}>Cerrar Sesión Segura</Text>
      </TouchableOpacity>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: Colors.background },
  content: { padding: 20, gap: 20 },
  profileCard: {
    backgroundColor: Colors.surface,
    borderRadius: 16,
    padding: 24,
    alignItems: 'center',
    elevation: 4, // Sombra Material Design
    shadowColor: Colors.dark,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
  },
  avatarContainer: { marginBottom: 12 },
  userName: { fontSize: 22, fontWeight: 'bold', color: Colors.dark, marginBottom: 4 },
  userEmail: { fontSize: 14, color: Colors.gray, marginBottom: 12 },
  roleBadge: { backgroundColor: `${Colors.primary}15`, paddingHorizontal: 12, paddingVertical: 6, borderRadius: 20 },
  roleText: { color: Colors.primary, fontSize: 12, fontWeight: '700' },
  statsCard: {
    backgroundColor: Colors.surface,
    borderRadius: 16,
    padding: 20,
    elevation: 2,
  },
  sectionTitle: { fontSize: 16, fontWeight: '600', color: Colors.dark, marginBottom: 16 },
  statsRow: { flexDirection: 'row', justifyContent: 'space-around' },
  statBox: { alignItems: 'center' },
  statNumber: { fontSize: 28, fontWeight: 'bold', color: Colors.primary },
  statLabel: { fontSize: 13, color: Colors.gray, marginTop: 4 },
  logoutButton: {
    backgroundColor: Colors.error,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    padding: 16,
    borderRadius: 12,
    marginTop: 10,
    gap: 8,
  },
  logoutText: { color: Colors.surface, fontSize: 16, fontWeight: 'bold' },
});