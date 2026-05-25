import { useThemeStore } from '@/src/store/themeStore';
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

export default function TraineeStatsScreen() {
  const isDark = useThemeStore((s) => s.isDark);
  const styles = makeStyles(isDark);
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

  const renderHeader = () => (
    <View style={{ paddingBottom: 16 }}>
      <View style={styles.header}>
        <View style={{ flexDirection: 'column', gap: 12 }}>
          <View>
            <Text style={styles.title}>Métricas del Grupo</Text>
            <Text style={styles.subtitle}>Supervisión de rendimiento académico.</Text>
          </View>
          
          <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' }}>
            <View style={styles.readOnlyBadge}>
              <Ionicons name="eye-outline" size={14} color={Colors.info} />
              <Text style={styles.readOnlyText}>Solo Lectura</Text>
            </View>
            
            {metrics && selectedGroupId && (
              <TouchableOpacity
                style={{ flexDirection: 'row', alignItems: 'center', gap: 6, backgroundColor: Colors.info, paddingHorizontal: 14, paddingVertical: 8, borderRadius: 10 }}
                onPress={async () => {
                  try {
                    const groupName = groups.find(g => g.id === selectedGroupId)?.name ?? 'Grupo';
                    await generateAndSharePDF({
                      title: `Reporte: ${groupName}`,
                      subtitle: 'Auditoría de evaluaciones del grupo (Vista Practicante)',
                      generatedBy: user?.full_name ?? 'Practicante',
                      metrics: [
                        { label: 'Alumnos', value: students.length },
                        { label: 'Tasa Aprobación', value: `${metrics.passRate}%`, color: Colors.success },
                        { label: 'Promedio', value: metrics.avg, color: Colors.primary },
                        { label: 'Nota Más Alta', value: metrics.highest, color: Colors.success },
                        { label: 'Nota Más Baja', value: metrics.lowest, color: Colors.error },
                        { label: 'Reprobados', value: metrics.failed, color: Colors.error },
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
                <Ionicons name="download-outline" size={16} color="#fff" />
                <Text style={{ color: '#fff', fontSize: 13, fontWeight: '700' }}>PDF</Text>
              </TouchableOpacity>
            )}
          </View>
        </View>
        
        <View style={{ marginTop: 20 }}>
          <SearchableSelect data={selectOptions} value={selectedGroupId || 0} onSelect={setSelectedGroupId} placeholder="Selecciona un grupo..." />
        </View>
      </View>

      {!loadingStats && selectedGroupId && metrics ? (
        <>
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
          <Text style={[styles.sectionTitle, { marginTop: 20, marginHorizontal: 24 }]}>Evaluaciones del Grupo</Text>
        </>
      ) : null}
    </View>
  );

  return (
    <View style={styles.container}>
      <PaginatedList
        data={loadingStats || !selectedGroupId || !metrics ? [] : attempts}
        keyExtractor={(item) => item.attempt_id.toString()}
        pageSize={8}
        contentContainerStyle={{ gap: 10, paddingBottom: 40 }}
        ListHeaderComponent={renderHeader()}
        ListEmptyComponent={
          loadingStats ? (
            <View style={styles.centeredInline}>
              <ActivityIndicator size="large" color={Colors.info} />
            </View>
          ) : !selectedGroupId ? (
            <Text style={{ textAlign: 'center', marginTop: 40, color: Colors.gray }}>Selecciona un grupo para ver estadísticas.</Text>
          ) : (
            <View style={styles.centeredInline}>
              <Ionicons name="document-text-outline" size={48} color={Colors.window} />
              <Text style={styles.emptyText}>Sin evaluaciones registradas.</Text>
            </View>
          )
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
    </View>
  );
}

const makeStyles = (isDark: boolean) => StyleSheet.create({
  container: { flex: 1, backgroundColor: isDark ? '#121212' : Colors.background },
  centered: { flex: 1, justifyContent: 'center', alignItems: 'center' },
  centeredInline: { alignItems: 'center', paddingTop: 40, gap: 12 },
  header: { marginBottom: 24, paddingTop: 20, paddingHorizontal: 24 },
  title: { fontSize: 28, fontWeight: '800', color: isDark ? '#FFFFFF' : Colors.dark },
  subtitle: { fontSize: 15, color: isDark ? '#AAAAAA' : Colors.gray, marginTop: 4 },
  readOnlyBadge: { flexDirection: 'row', alignItems: 'center', gap: 6, marginTop: 12, backgroundColor: Colors.info + '15', paddingHorizontal: 12, paddingVertical: 6, borderRadius: 8, alignSelf: 'flex-start' },
  readOnlyText: { fontSize: 12, fontWeight: '700', color: Colors.info, letterSpacing: 0.3 },
  sectionTitle: { fontSize: 16, fontWeight: '700', color: isDark ? '#FFFFFF' : Colors.dark, marginBottom: 12 },
  emptyText: { fontSize: 15, color: isDark ? '#AAAAAA' : Colors.gray, fontStyle: 'italic' },
  // ── Metrics ──
  metricsCard: { marginHorizontal: 24, backgroundColor: isDark ? '#1E1E1E' : Colors.surface, borderRadius: 16, padding: 20, borderWidth: 1, borderColor: Colors.info + '30', elevation: 2 },
  metricsGrid: { flexDirection: 'row', flexWrap: 'wrap' },
  metricItem: { width: '33%', alignItems: 'center', paddingVertical: 12 },
  metricValue: { fontSize: 24, fontWeight: '800', color: isDark ? '#FFFFFF' : Colors.dark },
  metricLabel: { fontSize: 11, color: isDark ? '#AAAAAA' : Colors.gray, marginTop: 2, fontWeight: '500' },
  // ── Attempt cards ──
  attemptCard: { marginHorizontal: 24, backgroundColor: isDark ? '#1E1E1E' : Colors.surface, borderRadius: 12, padding: 14, borderWidth: 1, borderColor: isDark ? '#2C2C2C' : Colors.window },
  attemptHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 10, gap: 12 },
  attemptStudent: { fontSize: 14, fontWeight: '700', color: isDark ? '#FFFFFF' : Colors.dark },
  attemptExam: { fontSize: 12, color: isDark ? '#AAAAAA' : Colors.gray, marginTop: 2 },
  scoreBadge: { paddingHorizontal: 12, paddingVertical: 6, borderRadius: 10, flexShrink: 0 },
  scoreText: { fontSize: 13, fontWeight: '700', textAlign: 'center' },
  attemptFooter: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', paddingTop: 10, borderTopWidth: 1, borderTopColor: isDark ? '#2C2C2C' : Colors.window },
  attemptDate: { fontSize: 11, color: isDark ? '#AAAAAA' : Colors.gray },
  attemptStatus: { fontSize: 12, fontWeight: '600' },
});