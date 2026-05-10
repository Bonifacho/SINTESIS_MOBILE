import React, { useEffect, useState } from 'react';
import { View, Text, StyleSheet, ScrollView, ActivityIndicator } from 'react-native';
import { Colors } from '@/src/theme/colors';
import { useAuthStore } from '@/src/store/authStore';
import { academicApi } from '@/src/api/academic';
import { Ionicons } from '@expo/vector-icons';
import SearchableSelect from '@/src/components/ui/searchableSelect';
import type { AcademicGroup, ExamAttempt, EnrolledStudent } from '@/src/models/academic';

export default function TraineeStatsScreen() {
  const user = useAuthStore((s) => s.user);

  const [groups, setGroups] = useState<AcademicGroup[]>([]);
  const [selectedGroupId, setSelectedGroupId] = useState<number | null>(null);
  const [loadingGroups, setLoadingGroups] = useState(true);

  // Datos del grupo seleccionado
  const [attempts, setAttempts] = useState<ExamAttempt[]>([]);
  const [studentCount, setStudentCount] = useState(0);
  const [loadingStats, setLoadingStats] = useState(false);

  // Cargar grupos del practicante
  useEffect(() => {
    if (!user?.id) return;
    const fetchGroups = async () => {
      try {
        setLoadingGroups(true);
        const res = await academicApi.getUserGroups(user.id);
        const fetched: AcademicGroup[] = res.data.data;
        setGroups(fetched);
        if (fetched.length > 0) setSelectedGroupId(fetched[0].id);
      } catch (err) {
        console.error('[TraineeStats] Error cargando grupos:', err);
      } finally {
        setLoadingGroups(false);
      }
    };
    fetchGroups();
  }, [user?.id]);

  // Cargar stats cuando cambia el grupo (solo lectura)
  useEffect(() => {
    if (!selectedGroupId) return;
    const fetchStats = async () => {
      try {
        setLoadingStats(true);
        const [attemptsRes, enrollRes] = await Promise.all([
          academicApi.getGroupAttempts(selectedGroupId),
          academicApi.getGroupEnrollments(selectedGroupId),
        ]);
        setAttempts(attemptsRes.data.data);
        setStudentCount((enrollRes.data.data as EnrolledStudent[]).length);
      } catch (err) {
        console.error('[TraineeStats] Error cargando estadísticas:', err);
        setAttempts([]);
        setStudentCount(0);
      } finally {
        setLoadingStats(false);
      }
    };
    fetchStats();
  }, [selectedGroupId]);

  const selectOptions = groups.map(g => ({ id: g.id, description: g.name }));

  // Cálculos derivados
  const totalAttempts = attempts.length;
  const passedAttempts = attempts.filter(a => a.passed).length;
  const avgScore = totalAttempts > 0 ? Math.round(attempts.reduce((acc, curr) => acc + curr.score, 0) / totalAttempts) : 0;
  const passRate = totalAttempts > 0 ? Math.round((passedAttempts / totalAttempts) * 100) : 0;

  if (loadingGroups) {
    return (
      <View style={styles.centered}>
        <ActivityIndicator size="large" color={Colors.info} />
      </View>
    );
  }

  return (
    <ScrollView style={styles.container} contentContainerStyle={{ padding: 24 }}>
      <View style={styles.header}>
        <Text style={styles.title}>Métricas del Grupo</Text>
        <Text style={styles.subtitle}>Supervisión de rendimiento académico.</Text>
        {/* Rúbrica §6: Badge visual de solo lectura */}
        <View style={styles.readOnlyBadge}>
          <Ionicons name="eye-outline" size={14} color={Colors.info} />
          <Text style={styles.readOnlyText}>Solo Lectura</Text>
        </View>
        <View style={{ marginTop: 20 }}>
          <SearchableSelect data={selectOptions} value={selectedGroupId || 0} onSelect={setSelectedGroupId} placeholder="Selecciona un grupo..." />
        </View>
      </View>

      {loadingStats ? (
        <View style={styles.centered}>
          <ActivityIndicator size="large" color={Colors.info} />
        </View>
      ) : selectedGroupId ? (
        <View style={styles.metricsGrid}>
          <View style={styles.metricCard}>
            <Ionicons name="people" size={32} color={Colors.info} />
            <Text style={styles.metricValue}>{studentCount}</Text>
            <Text style={styles.metricLabel}>Alumnos</Text>
          </View>
          <View style={styles.metricCard}>
            <Ionicons name="podium" size={32} color={Colors.success} />
            <Text style={styles.metricValue}>{avgScore}%</Text>
            <Text style={styles.metricLabel}>Promedio</Text>
          </View>
          <View style={[styles.metricCard, { width: '100%' }]}>
            <Ionicons name="checkmark-circle" size={32} color={Colors.primary} />
            <Text style={styles.metricValue}>{passRate}%</Text>
            <Text style={styles.metricLabel}>Tasa de Aprobación de Evaluaciones</Text>
          </View>
        </View>
      ) : (
        <Text style={{ textAlign: 'center', marginTop: 40, color: Colors.gray }}>Selecciona un grupo para ver estadísticas.</Text>
      )}
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: Colors.background },
  centered: { flex: 1, justifyContent: 'center', alignItems: 'center', paddingTop: 60 },
  header: { marginBottom: 24, paddingTop: 20 },
  title: { fontSize: 28, fontWeight: '800', color: Colors.dark },
  subtitle: { fontSize: 15, color: Colors.gray, marginTop: 4 },
  readOnlyBadge: { flexDirection: 'row', alignItems: 'center', gap: 6, marginTop: 12, backgroundColor: Colors.info + '15', paddingHorizontal: 12, paddingVertical: 6, borderRadius: 8, alignSelf: 'flex-start' },
  readOnlyText: { fontSize: 12, fontWeight: '700', color: Colors.info, letterSpacing: 0.3 },
  metricsGrid: { flexDirection: 'row', flexWrap: 'wrap', justifyContent: 'space-between', gap: 16 },
  metricCard: { backgroundColor: Colors.surface, width: '47%', padding: 20, borderRadius: 16, alignItems: 'center', elevation: 2, borderWidth: 1, borderColor: Colors.window },
  metricValue: { fontSize: 26, fontWeight: '900', color: Colors.dark, marginTop: 12 },
  metricLabel: { fontSize: 13, color: Colors.gray, marginTop: 4, textAlign: 'center', fontWeight: '500' }
});