import React, { useEffect, useMemo, useState } from 'react';
import { View, Text, StyleSheet, ActivityIndicator, TouchableOpacity, Alert } from 'react-native';
import { Colors } from '@/src/theme/colors';
import { useAuthStore } from '@/src/store/authStore';
import { academicApi } from '@/src/api/academic';
import { Ionicons } from '@expo/vector-icons';
import SearchableSelect from '@/src/components/ui/searchableSelect';
import PaginatedList from '@/src/components/ui/PaginatedList';
import { generateAndSharePDF } from '@/src/utils/pdfExport';
import type { AcademicGroup, ExamAttempt, EnrolledStudent } from '@/src/models/academic';

export default function TeacherResultsScreen() {
  const user = useAuthStore((s) => s.user);

  const [groups, setGroups] = useState<AcademicGroup[]>([]);
  const [attempts, setAttempts] = useState<ExamAttempt[]>([]);
  const [students, setStudents] = useState<EnrolledStudent[]>([]);
  const [selectedGroupId, setSelectedGroupId] = useState<number | null>(null);
  const [loadingGroups, setLoadingGroups] = useState(true);
  const [loadingAttempts, setLoadingAttempts] = useState(false);

  // Cargar grupos del docente
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
        console.error('[Results] Error cargando grupos:', err);
      } finally {
        setLoadingGroups(false);
      }
    };
    fetchGroups();
  }, [user?.id]);

  // Cargar intentos + estudiantes cuando cambia el grupo seleccionado
  useEffect(() => {
    if (!selectedGroupId) { setAttempts([]); setStudents([]); return; }
    const fetchData = async () => {
      try {
        setLoadingAttempts(true);
        // Traemos intentos y matrículas en paralelo para resolver nombres
        const [attemptsRes, enrollRes] = await Promise.all([
          academicApi.getGroupAttempts(selectedGroupId),
          academicApi.getGroupEnrollments(selectedGroupId),
        ]);
        setAttempts(attemptsRes.data.data);
        setStudents(enrollRes.data.data);
      } catch (err) {
        console.error('[Results] Error cargando datos del grupo:', err);
        setAttempts([]);
        setStudents([]);
      } finally {
        setLoadingAttempts(false);
      }
    };
    fetchData();
  }, [selectedGroupId]);

  // Lookup rápido para resolver student_id → nombre
  const studentMap = useMemo(
    () => new Map(students.map(s => [s.id, s])),
    [students]
  );

  // ── Métricas macro del grupo (Rúbrica §6) ─────────────────────────────────
  const groupMetrics = useMemo(() => {
    if (attempts.length === 0) return null;
    const totalAttempts = attempts.length;
    const passedAttempts = attempts.filter(a => a.passed).length;
    const failedAttempts = totalAttempts - passedAttempts;
    const avgScore = Math.round(attempts.reduce((sum, a) => sum + a.score, 0) / totalAttempts);
    const highestScore = Math.max(...attempts.map(a => a.score));
    const lowestScore = Math.min(...attempts.map(a => a.score));
    const passRate = Math.round((passedAttempts / totalAttempts) * 100);

    return { totalAttempts, passedAttempts, failedAttempts, avgScore, highestScore, lowestScore, passRate };
  }, [attempts]);

  const selectOptions = groups.map(g => ({ id: g.id, description: g.name }));

  if (loadingGroups) {
    return (
      <View style={styles.centered}>
        <ActivityIndicator size="large" color={Colors.primary} />
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'flex-start' }}>
          <View style={{ flex: 1 }}>
            <Text style={styles.title}>Auditoría de Evaluaciones</Text>
            <Text style={styles.subtitle}>Monitorea el rendimiento de tus estudiantes.</Text>
          </View>
          {groupMetrics && (
            <TouchableOpacity
              style={styles.exportBtn}
              onPress={async () => {
                try {
                  const groupName = groups.find(g => g.id === selectedGroupId)?.name ?? 'Grupo';
                  await generateAndSharePDF({
                    title: `Reporte: ${groupName}`,
                    subtitle: 'Auditoría de evaluaciones del grupo',
                    generatedBy: user?.full_name ?? 'Docente',
                    metrics: [
                      { label: 'Total Intentos', value: groupMetrics.totalAttempts },
                      { label: 'Tasa Aprobación', value: `${groupMetrics.passRate}%`, color: Colors.success },
                      { label: 'Promedio', value: groupMetrics.avgScore, color: Colors.primary },
                      { label: 'Nota Más Alta', value: groupMetrics.highestScore, color: Colors.success },
                      { label: 'Nota Más Baja', value: groupMetrics.lowestScore, color: Colors.error },
                      { label: 'Reprobados', value: groupMetrics.failedAttempts, color: Colors.error },
                    ],
                    attempts: attempts.map(a => ({
                      examId: a.exam_id,
                      studentName: studentMap.get(a.student_id)?.full_name ?? `Estudiante #${a.student_id}`,
                      score: a.score,
                      passed: a.passed,
                      correct: a.correct_answers,
                      total: a.total_questions,
                      date: new Date(a.submitted_at).toLocaleDateString('es-CO'),
                    })),
                  });
                } catch (err) {
                  Alert.alert('Error', 'No se pudo generar el PDF.');
                }
              }}
            >
              <Ionicons name="download-outline" size={18} color={Colors.surface} />
              <Text style={styles.exportBtnText}>PDF</Text>
            </TouchableOpacity>
          )}
        </View>

        <View style={{ marginTop: 16 }}>
          <SearchableSelect
            data={selectOptions}
            value={selectedGroupId || 0}
            onSelect={(id) => setSelectedGroupId(id)}
            placeholder="Selecciona un grupo..."
          />
        </View>
      </View>

      {loadingAttempts ? (
        <View style={styles.centered}>
          <ActivityIndicator size="large" color={Colors.primary} />
        </View>
      ) : (
        <PaginatedList
          data={attempts}
          keyExtractor={(item) => item.attempt_id.toString()}
          pageSize={10}
          contentContainerStyle={styles.list}
          ListHeaderComponent={
            groupMetrics ? (
              <View style={styles.metricsCard}>
                <Text style={styles.metricsTitle}>Resumen del Grupo</Text>
                <View style={styles.metricsGrid}>
                  <View style={styles.metricItem}>
                    <Text style={styles.metricValue}>{groupMetrics.totalAttempts}</Text>
                    <Text style={styles.metricLabel}>Intentos</Text>
                  </View>
                  <View style={styles.metricItem}>
                    <Text style={[styles.metricValue, { color: Colors.success }]}>{groupMetrics.passRate}%</Text>
                    <Text style={styles.metricLabel}>Aprobación</Text>
                  </View>
                  <View style={styles.metricItem}>
                    <Text style={[styles.metricValue, { color: Colors.primary }]}>{groupMetrics.avgScore}</Text>
                    <Text style={styles.metricLabel}>Promedio</Text>
                  </View>
                  <View style={styles.metricItem}>
                    <Text style={[styles.metricValue, { color: Colors.success }]}>{groupMetrics.highestScore}</Text>
                    <Text style={styles.metricLabel}>Más alta</Text>
                  </View>
                  <View style={styles.metricItem}>
                    <Text style={[styles.metricValue, { color: Colors.error }]}>{groupMetrics.lowestScore}</Text>
                    <Text style={styles.metricLabel}>Más baja</Text>
                  </View>
                  <View style={styles.metricItem}>
                    <Text style={[styles.metricValue, { color: Colors.error }]}>{groupMetrics.failedAttempts}</Text>
                    <Text style={styles.metricLabel}>Reprobados</Text>
                  </View>
                </View>
              </View>
            ) : undefined
          }
          ListEmptyComponent={
            <View style={styles.empty}>
              <Ionicons name="document-text-outline" size={48} color={Colors.window} />
              <Text style={styles.emptyText}>No hay evaluaciones registradas aún.</Text>
            </View>
          }
          renderItem={({ item }) => {
            const passed = item.passed;
            const color = passed ? Colors.success : Colors.error;
            // Resolvemos nombre del estudiante con el mapa de matrículas
            const student = studentMap.get(item.student_id);

            return (
              <View style={styles.card}>
                <View style={styles.cardHeader}>
                  <View style={{ flex: 1 }}>
                    <Text style={styles.studentName}>{student?.full_name ?? `Estudiante #${item.student_id}`}</Text>
                    <Text style={styles.ovaName}>Examen #{item.exam_id}</Text>
                  </View>
                  <View style={[styles.scoreBadge, { backgroundColor: color + '15' }]}>
                    <Text style={[styles.scoreText, { color }]}>{item.score}/100</Text>
                  </View>
                </View>
                <View style={styles.cardFooter}>
                  <Text style={styles.dateText}>
                     Presentado el: {new Date(item.submitted_at).toLocaleDateString('es-CO')}
                  </Text>
                  <View style={{ flexDirection: 'row', alignItems: 'center', gap: 4 }}>
                    <Ionicons name={passed ? "checkmark-circle" : "close-circle"} size={16} color={color} />
                    <Text style={[styles.statusText, { color }]}>{passed ? 'Aprobado' : 'Reprobado'}</Text>
                  </View>
                </View>
              </View>
            );
          }}
        />
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: Colors.background },
  centered: { flex: 1, justifyContent: 'center', alignItems: 'center' },
  header: { padding: 24, backgroundColor: Colors.surface, borderBottomWidth: 1, borderBottomColor: Colors.window },
  title: { fontSize: 24, fontWeight: '700', color: Colors.dark },
  subtitle: { fontSize: 14, color: Colors.gray, marginTop: 4 },
  list: { padding: 16, gap: 12 },
  empty: { alignItems: 'center', marginTop: 60 },
  emptyText: { fontSize: 16, color: Colors.gray, marginTop: 12, fontStyle: 'italic' },
  // ── Métricas ──
  metricsCard: { backgroundColor: Colors.surface, borderRadius: 16, padding: 20, marginBottom: 8, borderWidth: 1, borderColor: Colors.window, elevation: 2 },
  metricsTitle: { fontSize: 16, fontWeight: '700', color: Colors.dark, marginBottom: 16 },
  metricsGrid: { flexDirection: 'row', flexWrap: 'wrap', gap: 0 },
  metricItem: { width: '33%', alignItems: 'center', paddingVertical: 10 },
  metricValue: { fontSize: 24, fontWeight: '800', color: Colors.dark },
  metricLabel: { fontSize: 11, color: Colors.gray, marginTop: 2, fontWeight: '500' },
  // ── Cards de intentos ──
  card: { backgroundColor: Colors.surface, borderRadius: 12, padding: 16, borderWidth: 1, borderColor: Colors.window },
  cardHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 12 },
  studentName: { fontSize: 16, fontWeight: '700', color: Colors.dark },
  ovaName: { fontSize: 13, color: Colors.gray, marginTop: 2 },
  scoreBadge: { paddingHorizontal: 10, paddingVertical: 4, borderRadius: 12 },
  scoreText: { fontSize: 14, fontWeight: '700' },
  cardFooter: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', paddingTop: 12, borderTopWidth: 1, borderTopColor: Colors.window },
  dateText: { fontSize: 12, color: Colors.gray },
  statusText: { fontSize: 13, fontWeight: '600' },
  // ── Export ──
  exportBtn: { flexDirection: 'row', alignItems: 'center', gap: 6, backgroundColor: Colors.primary, paddingHorizontal: 14, paddingVertical: 10, borderRadius: 10 },
  exportBtnText: { color: Colors.surface, fontSize: 13, fontWeight: '700' },
});