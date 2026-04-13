import React from 'react';
import { View, Text, StyleSheet, ScrollView } from 'react-native';
import { Colors } from '@/src/theme/colors';
import { useAuthStore } from '@/src/store/authStore';
import { useMockDB } from '@/src/store/mockDB';
import { Ionicons } from '@expo/vector-icons';

export default function StudentHome() {
  const { user } = useAuthStore();
  
  // Conectamos a la base de datos en RAM para contar datos reales
  const getGroupsByStudent = useMockDB((s) => s.getGroupsByStudent);
  const getAttemptsByStudent = useMockDB((s) => s.getAttemptsByStudent);
  
  const myGroups = getGroupsByStudent(user?.id || 0);
  const myAttempts = getAttemptsByStudent(user?.id || 0);

  return (
    <ScrollView style={styles.container} contentContainerStyle={styles.content}>
      <View style={styles.profileCard}>
        <View style={styles.avatarContainer}>
          <Ionicons name="person-circle" size={72} color={Colors.primary} />
        </View>
        <Text style={styles.userName}>{user?.full_name}</Text>
        <Text style={styles.userEmail}>@{user?.username} · SÍNTESIS</Text>
        <View style={styles.roleBadge}>
          <Text style={styles.roleText}>ESTUDIANTE</Text>
        </View>
      </View>

      <View style={styles.statsCard}>
        <Text style={styles.sectionTitle}>Mi Resumen Académico</Text>
        <View style={styles.statsRow}>
          <View style={styles.statBox}>
            <Text style={styles.statNumber}>{myGroups.length}</Text>
            <Text style={styles.statLabel}>Materias</Text>
          </View>
          <View style={styles.statBox}>
            <Text style={styles.statNumber}>{myAttempts.length}</Text>
            <Text style={styles.statLabel}>Exámenes</Text>
          </View>
        </View>
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: Colors.background },
  content: { padding: 20, gap: 20 },
  profileCard: { backgroundColor: Colors.surface, borderRadius: 16, padding: 24, alignItems: 'center', elevation: 4, shadowColor: Colors.dark, shadowOffset: { width: 0, height: 2 }, shadowOpacity: 0.1, shadowRadius: 8 },
  avatarContainer: { marginBottom: 12 },
  userName: { fontSize: 22, fontWeight: 'bold', color: Colors.dark, marginBottom: 4, textAlign: 'center' },
  userEmail: { fontSize: 14, color: Colors.gray, marginBottom: 12 },
  roleBadge: { backgroundColor: `${Colors.primary}15`, paddingHorizontal: 12, paddingVertical: 6, borderRadius: 20 },
  roleText: { color: Colors.primary, fontSize: 12, fontWeight: '700', letterSpacing: 0.5 },
  statsCard: { backgroundColor: Colors.surface, borderRadius: 16, padding: 20, elevation: 2 },
  sectionTitle: { fontSize: 16, fontWeight: '600', color: Colors.dark, marginBottom: 16 },
  statsRow: { flexDirection: 'row', justifyContent: 'space-around' },
  statBox: { alignItems: 'center' },
  statNumber: { fontSize: 32, fontWeight: 'bold', color: Colors.primary },
  statLabel: { fontSize: 13, color: Colors.gray, marginTop: 4 },
});