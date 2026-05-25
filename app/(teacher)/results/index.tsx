import React, { useEffect, useMemo, useState } from 'react';
import { View, Text, StyleSheet, ActivityIndicator, TouchableOpacity, Alert } from 'react-native';
import { useColors } from '@/src/hooks/useColors';
import { useThemeStore } from '@/src/store/themeStore';
import { Colors } from '@/src/theme/colors';
import { useAuthStore } from '@/src/store/authStore';
import { academicApi } from '@/src/api/academic';
import { Ionicons } from '@expo/vector-icons';
import SearchableSelect from '@/src/components/ui/searchableSelect';
import PaginatedList from '@/src/components/ui/PaginatedList';
import { generateAndSharePDF } from '@/src/utils/pdfExport';
import type { AcademicGroup, ExamAttempt, EnrolledStudent } from '@/src/models/academic';
import { useRouter } from 'expo-router';

export default function TeacherResultsScreen() {
  const user = useAuthStore((s) => s.user);
  const router = useRouter();
  const C = useColors();
  const isDark = useThemeStore((s) => s.isDark);
  const styles = makeStyles(isDark);

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
    () => new Map(students.map(s => [s.student_id, s])),
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
        <ActivityIndicator size="large" color={C.primary} />
      </View>
    );
  }

  const renderHeader = () => (
    <>
      <View style={styles.header}>
        <View style={{ flexDirection: 'column', gap: 12 }}>
          <View>
            <Text style={styles.title}>Auditoría de Evaluaciones</Text>
            <Text style={styles.subtitle}>Monitorea el rendimiento de tus estudiantes.</Text>
          </View>
          <View style={{ flexDirection: 'row', gap: 8, alignItems: 'center' }}>
            {selectedGroupId && (
              <TouchableOpacity
                style={{ flexDirection: 'row', alignItems: 'center', gap: 6, backgroundColor: C.info, paddingHorizontal: 12, paddingVertical: 10, borderRadius: 10 }}
                onPress={() => router.push({ pathname: '/(teacher)/activity', params: { groupId: selectedGroupId, groupName: groups.find(g => g.id === selectedGroupId)?.name ?? '' } } as any)}
              >
                <Ionicons name="pulse" size={16} color="#fff" />
                <Text style={{ color: '#fff', fontSize: 12, fontWeight: '700' }}>Actividad</Text>
              </TouchableOpacity>
            )}
            {groupMetrics && (
              <TouchableOpacity
                style={{ flexDirection: 'row', alignItems: 'center', gap: 6, backgroundColor: C.primary, paddingHorizontal: 14, paddingVertical: 10, borderRadius: 10 }}
                onPress={async () => {
                  try {
                    const groupName = groups.find(g => g.id === selectedGroupId)?.name ?? 'Grupo';
                    await generateAndSharePDF({
                      title: `Reporte: ${groupName}`,
                      subtitle: 'Auditoría de evaluaciones del grupo',
                      generatedBy: user?.full_name ?? 'Docente',
                      metrics: [
                        { label: 'Total Intentos', value: groupMetrics.totalAttempts },
                        { label: 'Tasa Aprobación', value: `${groupMetrics.passRate}%`, color: C.success },
                        { label: 'Promedio', value: groupMetrics.avgScore, color: C.primary },
                        { label: 'Nota Más Alta', value: groupMetrics.highestScore, color: C.success },
                        { label: 'Nota Más Baja', value: groupMetrics.lowestScore, color: C.error },
                        { label: 'Reprobados', value: groupMetrics.failedAttempts, color: C.error },
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
                <Ionicons name="download-outline" size={18} color="#fff" />
                <Text style={{ color: '#fff', fontSize: 13, fontWeight: '700' }}>PDF</Text>
              </TouchableOpacity>
            )}
          </View>
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

      {!loadingAttempts && groupMetrics ? (
        <View style={styles.metricsCard}>
          <Text style={styles.metricsTitle}>Resumen del Grupo</Text>
          <View style={styles.metricsGrid}>
            <View style={styles.metricItem}>
              <Text style={styles.metricValue}>{groupMetrics.totalAttempts}</Text>
              <Text style={styles.metricLabel}>Intentos</Text>
            </View>
            <View style={styles.metricItem}>
              <Text style={[styles.metricValue, { color: C.success }]}>{groupMetrics.passRate}%</Text>
              <Text style={styles.metricLabel}>Aprobación</Text>
            </View>
            <View style={styles.metricItem}>
              <Text style={[styles.metricValue, { color: C.primary }]}>{groupMetrics.avgScore}</Text>
              <Text style={styles.metricLabel}>Promedio</Text>
            </View>
            <View style={styles.metricItem}>
              <Text style={[styles.metricValue, { color: C.success }]}>{groupMetrics.highestScore}</Text>
              <Text style={styles.metricLabel}>Más alta</Text>
            </View>
            <View style={styles.metricItem}>
              <Text style={[styles.metricValue, { color: C.error }]}>{groupMetrics.lowestScore}</Text>
              <Text style={styles.metricLabel}>Más baja</Text>
            </View>
            <View style={styles.metricItem}>
              <Text style={[styles.metricValue, { color: C.error }]}>{groupMetrics.failedAttempts}</Text>
              <Text style={styles.metricLabel}>Reprobados</Text>
            </View>
          </View>
        </View>
      ) : null}
    </>
  );

  return (
    <View style={styles.container}>
        <PaginatedList
          data={loadingAttempts ? [] : attempts}
          keyExtractor={(item) => item.attempt_id.toString()}
          pageSize={10}
          contentContainerStyle={styles.list}
          ListHeaderComponent={renderHeader()}
          ListEmptyComponent={
            loadingAttempts ? (
              <View style={styles.empty}>
                <ActivityIndicator size="large" color={C.primary} />
                <Text style={styles.emptyText}>Cargando registros...</Text>
              </View>
            ) : (
              <View style={styles.empty}>
                <Ionicons name="document-text-outline" size={48} color={isDark ? '#2C2C2C' : Colors.window} />
                <Text style={styles.emptyText}>No hay evaluaciones registradas aún.</Text>
              </View>
            )
          }
          renderItem={({ item }) => {
            const passed = item.passed;
            const color = passed ? C.success : C.error;
            // Resolvemos nombre del estudiante con el mapa de matrículas
            const student = studentMap.get(item.student_id);

            return (
              <View style={styles.card}>
                <View style={styles.cardHeader}>
                  <View style={{ flex: 1 }}>
                    <Text style={styles.studentName}>{student?.full_name ?? `Estudiante #${item.student_id}`}</Text>
                    <Text style={styles.ovaName}>{item.ova_title ?? `Examen #${item.exam_id}`}</Text>
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
    </View>
  );
}

const makeStyles = (isDark: boolean) => StyleSheet.create({
  container: { flex: 1, backgroundColor: isDark ? '#121212' : '#FFFFFF' },
  centered: { flex: 1, justifyContent: 'center', alignItems: 'center', backgroundColor: isDark ? '#121212' : '#FFFFFF' },
  header: { padding: 24, backgroundColor: isDark ? '#1E1E1E' : Colors.surface, borderBottomWidth: 1, borderBottomColor: isDark ? '#2C2C2C' : '#E5E5EA' },
  title: { fontSize: 24, fontWeight: '700', color: isDark ? '#FFFFFF' : Colors.dark },
  subtitle: { fontSize: 14, color: isDark ? '#AAAAAA' : Colors.gray, marginTop: 4 },
  list: { paddingBottom: 16, gap: 12 },
  empty: { alignItems: 'center', marginTop: 60 },
  emptyText: { fontSize: 16, color: isDark ? '#AAAAAA' : Colors.gray, marginTop: 12, fontStyle: 'italic' },
  // ── Métricas ──
  metricsCard: { marginHorizontal: 16, backgroundColor: isDark ? '#1E1E1E' : Colors.surface, borderRadius: 16, padding: 20, marginBottom: 8, borderWidth: 1, borderColor: isDark ? '#2C2C2C' : '#E5E5EA', elevation: 2 },
  metricsTitle: { fontSize: 16, fontWeight: '700', color: isDark ? '#FFFFFF' : Colors.dark, marginBottom: 16 },
  metricsGrid: { flexDirection: 'row', flexWrap: 'wrap', gap: 0 },
  metricItem: { width: '33%', alignItems: 'center', paddingVertical: 10 },
  metricValue: { fontSize: 24, fontWeight: '800', color: isDark ? '#FFFFFF' : Colors.dark },
  metricLabel: { fontSize: 11, color: isDark ? '#AAAAAA' : Colors.gray, marginTop: 2, fontWeight: '500' },
  // ── Cards de intentos ──
  card: { marginHorizontal: 16, backgroundColor: isDark ? '#1E1E1E' : Colors.surface, borderRadius: 12, padding: 16, borderWidth: 1, borderColor: isDark ? '#2C2C2C' : '#E5E5EA' },
  cardHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 12, gap: 12 },
  studentName: { fontSize: 16, fontWeight: '700', color: isDark ? '#FFFFFF' : Colors.dark },
  ovaName: { fontSize: 13, color: isDark ? '#AAAAAA' : Colors.gray, marginTop: 2 },
  scoreBadge: { paddingHorizontal: 12, paddingVertical: 6, borderRadius: 12, flexShrink: 0 },
  scoreText: { fontSize: 14, fontWeight: '700', textAlign: 'center' },
  cardFooter: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', paddingTop: 12, borderTopWidth: 1, borderTopColor: isDark ? '#2C2C2C' : '#E5E5EA' },
  dateText: { fontSize: 12, color: isDark ? '#AAAAAA' : Colors.gray },
  statusText: { fontSize: 13, fontWeight: '600' },
});