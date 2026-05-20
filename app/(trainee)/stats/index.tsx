import React, { useEffect, useMemo, useState } from 'react';
import { View, Text, StyleSheet, ScrollView, ActivityIndicator } from 'react-native';
import { Colors } from '@/src/theme/colors';
import { useAuthStore } from '@/src/store/authStore';
import { academicApi } from '@/src/api/academic';
import { Ionicons } from '@expo/vector-icons';
import SearchableSelect from '@/src/components/ui/searchableSelect';
import PaginatedList from '@/src/components/ui/PaginatedList';
import type { AcademicGroup, ExamAttempt, EnrolledStudent } from '@/src/models/academic';

export default function TraineeStatsScreen() {
  const user = useAuthStore((s) => s.user);

  const [groups, setGroups] = useState<AcademicGroup[]>([]);
  const [selectedGroupId, setSelectedGroupId] = useState<number | null>(null);
  const [loadingGroups, setLoadingGroups] = useState(true);

  // Datos del grupo seleccionado
  const [attempts, setAttempts] = useState<ExamAttempt[]>([]);
  const [students, setStudents] = useState<EnrolledStudent[]>([]);
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
        setStudents(enrollRes.data.data as EnrolledStudent[]);
      } catch (err) {
        console.error('[TraineeStats] Error cargando estadísticas:', err);
        setAttempts([]);
        setStudents([]);
      } finally {
        setLoadingStats(false);
      }
    };
    fetchStats();
  }, [selectedGroupId]);

  const selectOptions = groups.map(g => ({ id: g.id, description: g.name }));
  const studentMap = useMemo(() => new Map(students.map(s => [s.id, s])), [students]);

  // Métricas calculadas
  const metrics = useMemo(() => {
    if (attempts.length === 0) return null;
    const total = attempts.length;
    const passed = attempts.filter(a => a.passed).length;
    const failed = total - passed;
    const avg = Math.round(attempts.reduce((s, a) => s + a.score, 0) / total);
    const highest = Math.max(...attempts.map(a => a.score));
    const lowest = Math.min(...attempts.map(a => a.score));
    const passRate = Math.round((passed / total) * 100);
    return { total, passed, failed, avg, highest, lowest, passRate };
  }, [attempts]);

  if (loadingGroups) {
    return (
      <View style={styles.centered}>
        <ActivityIndicator size="large" color={Colors.info} />
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <ScrollView contentContainerStyle={{ padding: 24, paddingBottom: 40 }} showsVerticalScrollIndicator={false}>
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
          <View style={styles.centeredInline}>
            <ActivityIndicator size="large" color={Colors.info} />
          </View>
        ) : selectedGroupId && metrics ? (
          <>
            {/* Tarjeta de métricas expandida */}
            <View style={styles.metricsCard}>
              <Text style={styles.sectionTitle}>Resumen del Grupo</Text>
              <View style={styles.metricsGrid}>
                <View style={styles.metricItem}>
                  <Ionicons name="people" size={22} color={Colors.info} />
                  <Text style={styles.metricValue}>{students.length}</Text>
                  <Text style={styles.metricLabel}>Alumnos</Text>
                </View>
                <View style={styles.metricItem}>
                  <Text style={[styles.metricValue, { color: Colors.primary }]}>{metrics.avg}%</Text>
                  <Text style={styles.metricLabel}>Promedio</Text>
                </View>
                <View style={styles.metricItem}>
                  <Text style={[styles.metricValue, { color: Colors.success }]}>{metrics.passRate}%</Text>
                  <Text style={styles.metricLabel}>Aprobación</Text>
                </View>
                <View style={styles.metricItem}>
                  <Text style={[styles.metricValue, { color: Colors.success }]}>{metrics.highest}</Text>
                  <Text style={styles.metricLabel}>Más alta</Text>
                </View>
                <View style={styles.metricItem}>
                  <Text style={[styles.metricValue, { color: Colors.error }]}>{metrics.lowest}</Text>
                  <Text style={styles.metricLabel}>Más baja</Text>
                </View>
                <View style={styles.metricItem}>
                  <Text style={[styles.metricValue, { color: Colors.error }]}>{metrics.failed}</Text>
                  <Text style={styles.metricLabel}>Reprobados</Text>
                </View>
              </View>
            </View>

            {/* Lista paginada de intentos */}
            <Text style={[styles.sectionTitle, { marginTop: 20 }]}>Evaluaciones del Grupo</Text>
            <PaginatedList
              data={attempts}
              keyExtractor={(item) => item.attempt_id.toString()}
              pageSize={8}
              contentContainerStyle={{ gap: 10 }}
              ListEmptyComponent={
                <View style={styles.centeredInline}>
                  <Ionicons name="document-text-outline" size={48} color={Colors.window} />
                  <Text style={styles.emptyText}>Sin evaluaciones registradas.</Text>
                </View>
              }
              renderItem={({ item }) => {
                const passed = item.passed;
                const color = passed ? Colors.success : Colors.error;
                const student = studentMap.get(item.student_id);
                return (
                  <View style={styles.attemptCard}>
                    <View style={styles.attemptHeader}>
                      <View style={{ flex: 1 }}>
                        <Text style={styles.attemptStudent}>{student?.full_name ?? `Estudiante #${item.student_id}`}</Text>
                        <Text style={styles.attemptExam}>Examen #{item.exam_id}</Text>
                      </View>
                      <View style={[styles.scoreBadge, { backgroundColor: color + '15' }]}>
                        <Text style={[styles.scoreText, { color }]}>{item.score}/100</Text>
                      </View>
                    </View>
                    <View style={styles.attemptFooter}>
                      <Text style={styles.attemptDate}>
                        {new Date(item.submitted_at).toLocaleDateString('es-CO')}
                      </Text>
                      <View style={{ flexDirection: 'row', alignItems: 'center', gap: 4 }}>
                        <Ionicons name={passed ? 'checkmark-circle' : 'close-circle'} size={14} color={color} />
                        <Text style={[styles.attemptStatus, { color }]}>{passed ? 'Aprobado' : 'Reprobado'}</Text>
                      </View>
                    </View>
                  </View>
                );
              }}
            />
          </>
        ) : (
          <Text style={{ textAlign: 'center', marginTop: 40, color: Colors.gray }}>Selecciona un grupo para ver estadísticas.</Text>
        )}
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: Colors.background },
  centered: { flex: 1, justifyContent: 'center', alignItems: 'center' },
  centeredInline: { alignItems: 'center', paddingTop: 40, gap: 12 },
  header: { marginBottom: 24, paddingTop: 20 },
  title: { fontSize: 28, fontWeight: '800', color: Colors.dark },
  subtitle: { fontSize: 15, color: Colors.gray, marginTop: 4 },
  readOnlyBadge: { flexDirection: 'row', alignItems: 'center', gap: 6, marginTop: 12, backgroundColor: Colors.info + '15', paddingHorizontal: 12, paddingVertical: 6, borderRadius: 8, alignSelf: 'flex-start' },
  readOnlyText: { fontSize: 12, fontWeight: '700', color: Colors.info, letterSpacing: 0.3 },
  sectionTitle: { fontSize: 16, fontWeight: '700', color: Colors.dark, marginBottom: 12 },
  emptyText: { fontSize: 15, color: Colors.gray, fontStyle: 'italic' },
  // ── Metrics ──
  metricsCard: { backgroundColor: Colors.surface, borderRadius: 16, padding: 20, borderWidth: 1, borderColor: Colors.info + '30', elevation: 2 },
  metricsGrid: { flexDirection: 'row', flexWrap: 'wrap' },
  metricItem: { width: '33%', alignItems: 'center', paddingVertical: 12 },
  metricValue: { fontSize: 24, fontWeight: '800', color: Colors.dark },
  metricLabel: { fontSize: 11, color: Colors.gray, marginTop: 2, fontWeight: '500' },
  // ── Attempt cards ──
  attemptCard: { backgroundColor: Colors.surface, borderRadius: 12, padding: 14, borderWidth: 1, borderColor: Colors.window },
  attemptHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 10 },
  attemptStudent: { fontSize: 14, fontWeight: '700', color: Colors.dark },
  attemptExam: { fontSize: 12, color: Colors.gray, marginTop: 2 },
  scoreBadge: { paddingHorizontal: 10, paddingVertical: 4, borderRadius: 10 },
  scoreText: { fontSize: 13, fontWeight: '700' },
  attemptFooter: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', paddingTop: 10, borderTopWidth: 1, borderTopColor: Colors.window },
  attemptDate: { fontSize: 11, color: Colors.gray },
  attemptStatus: { fontSize: 12, fontWeight: '600' },
});