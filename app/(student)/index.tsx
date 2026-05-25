import { useThemeStore } from '@/src/store/themeStore';
import React, { useEffect, useState } from 'react';
import { View, Text, StyleSheet, ScrollView, ActivityIndicator } from 'react-native';
import { Colors } from '@/src/theme/colors';
import { useAuthStore } from '@/src/store/authStore';
import { academicApi } from '@/src/api/academic';
import { Ionicons } from '@expo/vector-icons';
import type { AcademicGroup, ExamAttempt } from '@/src/models/academic';

export default function StudentHome() {
  const isDark = useThemeStore((s) => s.isDark);
  const styles = makeStyles(isDark);
  const { user } = useAuthStore();

  const [groups, setGroups] = useState<AcademicGroup[]>([]);
  const [attempts, setAttempts] = useState<ExamAttempt[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!user?.id) return;

    const fetchData = async () => {
      try {
        setLoading(true);
        setError(null);
        const [groupsRes, attemptsRes] = await Promise.all([
          academicApi.getUserGroups(user.id),
          academicApi.getStudentAttempts(user.id),
        ]);
        setGroups(groupsRes.data.data);
        setAttempts(attemptsRes.data.data);
      } catch (err) {
        console.error('[StudentHome] Error cargando datos:', err);
        setError('No se pudieron cargar tus datos académicos.');
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [user?.id]);

  if (loading) {
    return (
      <View style={styles.centered}>
        <ActivityIndicator size="large" color={Colors.primary} />
        <Text style={styles.loadingText}>Cargando tu resumen...</Text>
      </View>
    );
  }

  if (error) {
    return (
      <View style={styles.centered}>
        <Ionicons name="cloud-offline-outline" size={48} color={Colors.error} />
        <Text style={styles.errorText}>{error}</Text>
      </View>
    );
  }

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
            <Text style={styles.statNumber}>{groups.length}</Text>
            <Text style={styles.statLabel}>Materias</Text>
          </View>
          <View style={styles.statBox}>
            <Text style={styles.statNumber}>{attempts.length}</Text>
            <Text style={styles.statLabel}>Exámenes</Text>
          </View>
        </View>
      </View>
    </ScrollView>
  );
}

const makeStyles = (isDark: boolean) => StyleSheet.create({
  container: { flex: 1, backgroundColor: isDark ? '#121212' : Colors.background },
  content: { padding: 20, gap: 20 },
  centered: { flex: 1, justifyContent: 'center', alignItems: 'center', gap: 12 },
  loadingText: { fontSize: 14, color: isDark ? '#AAAAAA' : Colors.gray },
  errorText: { fontSize: 15, color: Colors.error, textAlign: 'center', paddingHorizontal: 24 },
  profileCard: { backgroundColor: isDark ? '#1E1E1E' : Colors.surface, borderRadius: 16, padding: 24, alignItems: 'center', elevation: 4, shadowColor: Colors.dark, shadowOffset: { width: 0, height: 2 }, shadowOpacity: 0.1, shadowRadius: 8 },
  avatarContainer: { marginBottom: 12 },
  userName: { fontSize: 22, fontWeight: 'bold', color: isDark ? '#FFFFFF' : Colors.dark, marginBottom: 4, textAlign: 'center' },
  userEmail: { fontSize: 14, color: isDark ? '#AAAAAA' : Colors.gray, marginBottom: 12 },
  roleBadge: { backgroundColor: `${Colors.primary}15`, paddingHorizontal: 12, paddingVertical: 6, borderRadius: 20 },
  roleText: { color: Colors.primary, fontSize: 12, fontWeight: '700', letterSpacing: 0.5 },
  statsCard: { backgroundColor: isDark ? '#1E1E1E' : Colors.surface, borderRadius: 16, padding: 20, elevation: 2 },
  sectionTitle: { fontSize: 16, fontWeight: '600', color: isDark ? '#FFFFFF' : Colors.dark, marginBottom: 16 },
  statsRow: { flexDirection: 'row', justifyContent: 'space-around' },
  statBox: { alignItems: 'center' },
  statNumber: { fontSize: 32, fontWeight: 'bold', color: Colors.primary },
  statLabel: { fontSize: 13, color: isDark ? '#AAAAAA' : Colors.gray, marginTop: 4 },
});