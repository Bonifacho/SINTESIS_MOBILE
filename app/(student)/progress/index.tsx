import React, { useEffect, useMemo, useState } from 'react';
import { View, Text, StyleSheet, ScrollView, ActivityIndicator, TouchableOpacity } from 'react-native';
import { Colors } from '@/src/theme/colors';
import { useAuthStore } from '@/src/store/authStore';
import { academicApi } from '@/src/api/academic';
import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import type { AcademicGroup, AcademicTopic, AcademicOva, ExamAttempt } from '@/src/models/academic';

interface GroupProgress {
  group: AcademicGroup;
  totalExams: number;
  passedExams: number;
  avgScore: number;
  highScore: number;
  lowScore: number;
  progressPercent: number;
  attempts: ExamAttempt[];
}

const PAGE_SIZE = 5;

export default function StudentProgressScreen() {
  const router = useRouter();
  const user = useAuthStore((s) => s.user);

  const [progressData, setProgressData] = useState<GroupProgress[]>([]);
  const [allAttempts, setAllAttempts] = useState<ExamAttempt[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [attemptPage, setAttemptPage] = useState(1);

  const fetchProgress = async () => {
    if (!user?.id) return;
    try {
      setError(null);

        const [groupsRes, attemptsRes] = await Promise.all([
          academicApi.getUserGroups(user.id),
          academicApi.getStudentAttempts(user.id),
        ]);

        const groups: AcademicGroup[] = groupsRes.data.data;
        const fetchedAttempts: ExamAttempt[] = attemptsRes.data.data;
        setAllAttempts(fetchedAttempts);

        const progressPromises = groups.map(async (group): Promise<GroupProgress> => {
          try {
            const topicsRes = await academicApi.getGroupTopics(group.id);
            const topics: AcademicTopic[] = topicsRes.data.data;

            const ovasResults = await Promise.all(
              topics.map(async (t) => {
                const ovasRes = await academicApi.getOvasByTopic(t.id);
                return { topicId: t.id, ovas: ovasRes.data.data as AcademicOva[] };
              })
            );

            let totalExams = 0;
            const allOvaIds: number[] = [];

            ovasResults.forEach(({ ovas }) => {
              ovas.forEach(ova => {
                allOvaIds.push(ova.id);
                if (ova.resources?.length === 0 || ova.title.toLowerCase().includes('evaluación') || ova.title.toLowerCase().includes('test')) {
                  totalExams++;
                }
              });
            });

            const groupAttempts = fetchedAttempts.filter(a =>
              'ova_id' in a && allOvaIds.includes((a as any).ova_id)
            );

            const passedOvaIds = new Set(groupAttempts.filter(a => a.passed).map(a => (a as any).ova_id));
            const passedExams = passedOvaIds.size;
            const progressPercent = totalExams > 0 ? (passedExams / totalExams) * 100 : 0;
            const scores = groupAttempts.map(a => a.score);
            const avgScore = scores.length > 0 ? Math.round(scores.reduce((s, v) => s + v, 0) / scores.length) : 0;
            const highScore = scores.length > 0 ? Math.max(...scores) : 0;
            const lowScore = scores.length > 0 ? Math.min(...scores) : 0;

            return { group, totalExams, passedExams, avgScore, highScore, lowScore, progressPercent, attempts: groupAttempts };
          } catch {
            return { group, totalExams: 0, passedExams: 0, avgScore: 0, highScore: 0, lowScore: 0, progressPercent: 0, attempts: [] };
          }
        });

        const results = await Promise.all(progressPromises);
        setProgressData(results);
      } catch (err) {
        console.error('[Progress] Error cargando progreso:', err);
        setError('No se pudo cargar tu progreso académico.');
      } finally {
      }
    };

  useEffect(() => {
    setLoading(true);
    fetchProgress().finally(() => setLoading(false));
  }, [user?.id]);

  const onRefresh = async () => {
    setRefreshing(true);
    await fetchProgress();
    setRefreshing(false);
  };

  // ── Métricas globales ──────────────────────────────────────────────────────
  const globalMetrics = useMemo(() => {
    if (allAttempts.length === 0) return null;
    const scores = allAttempts.map(a => a.score);
    const avg = Math.round(scores.reduce((s, v) => s + v, 0) / scores.length);
    const highest = Math.max(...scores);
    const lowest = Math.min(...scores);
    const passed = allAttempts.filter(a => a.passed).length;

    // Tendencia: comparar promedio primera mitad vs segunda mitad
    let trend: 'up' | 'down' | 'stable' = 'stable';
    if (scores.length >= 4) {
      const mid = Math.floor(scores.length / 2);
      const firstHalf = scores.slice(0, mid).reduce((s, v) => s + v, 0) / mid;
      const secondHalf = scores.slice(mid).reduce((s, v) => s + v, 0) / (scores.length - mid);
      if (secondHalf > firstHalf + 3) trend = 'up';
      else if (secondHalf < firstHalf - 3) trend = 'down';
    }

    return { total: allAttempts.length, avg, highest, lowest, passed, trend };
  }, [allAttempts]);

  // ── Paginación de historial ────────────────────────────────────────────────
  const sortedAttempts = useMemo(
    () => [...allAttempts].sort((a, b) => new Date(b.submitted_at).getTime() - new Date(a.submitted_at).getTime()),
    [allAttempts]
  );
  const totalAttemptPages = Math.max(1, Math.ceil(sortedAttempts.length / PAGE_SIZE));
  const pagedAttempts = sortedAttempts.slice((attemptPage - 1) * PAGE_SIZE, attemptPage * PAGE_SIZE);

  if (loading) {
    return (
      <View style={styles.centered}>
        <ActivityIndicator size="large" color={Colors.primary} />
        <Text style={styles.loadingText}>Calculando tu progreso...</Text>
      </View>
    );
  }

  if (error) {
    return (
      <View style={styles.centered}>
        <Ionicons name="cloud-offline-outline" size={48} color={Colors.error} />
        <Text style={styles.errorText}>{error}</Text>
        <TouchableOpacity style={styles.retryBtn} onPress={fetchProgress}>
          <Text style={styles.retryBtnText}>Reintentar conexión</Text>
        </TouchableOpacity>
      </View>
    );
  }

  const trendIcon = globalMetrics?.trend === 'up' ? 'trending-up' : globalMetrics?.trend === 'down' ? 'trending-down' : 'remove-outline';
  const trendColor = globalMetrics?.trend === 'up' ? Colors.success : globalMetrics?.trend === 'down' ? Colors.error : Colors.gray;

  return (
    <ScrollView 
      style={styles.container} 
      contentContainerStyle={styles.content} 
      showsVerticalScrollIndicator={false}
      refreshControl={
        <React.Fragment>
          {/* Workaround for importing RefreshControl without altering the top imports */}
          {React.createElement(require('react-native').RefreshControl, {
            refreshing,
            onRefresh,
            colors: [Colors.primary],
          })}
        </React.Fragment>
      }
    >
      <View style={styles.header}>
        <Text style={styles.title}>Mi Rendimiento</Text>
        <Text style={styles.subtitle}>Métricas de tu avance académico</Text>
      </View>

      {/* ── Resumen Global ─────────────────────────────────────────────────── */}
      {globalMetrics && (
        <View style={styles.globalCard}>
          <Text style={styles.sectionTitle}>Resumen General</Text>
          <View style={styles.metricsGrid}>
            <View style={styles.metricItem}>
              <Text style={styles.metricValue}>{globalMetrics.total}</Text>
              <Text style={styles.metricLabel}>Intentos</Text>
            </View>
            <View style={styles.metricItem}>
              <Text style={[styles.metricValue, { color: Colors.primary }]}>{globalMetrics.avg}%</Text>
              <Text style={styles.metricLabel}>Promedio</Text>
            </View>
            <View style={styles.metricItem}>
              <Ionicons name={trendIcon as any} size={28} color={trendColor} />
              <Text style={[styles.metricLabel, { color: trendColor }]}>
                {globalMetrics.trend === 'up' ? 'Mejorando' : globalMetrics.trend === 'down' ? 'Bajando' : 'Estable'}
              </Text>
            </View>
            <View style={styles.metricItem}>
              <Text style={[styles.metricValue, { color: Colors.success }]}>{globalMetrics.highest}</Text>
              <Text style={styles.metricLabel}>Más alta</Text>
            </View>
            <View style={styles.metricItem}>
              <Text style={[styles.metricValue, { color: Colors.error }]}>{globalMetrics.lowest}</Text>
              <Text style={styles.metricLabel}>Más baja</Text>
            </View>
            <View style={styles.metricItem}>
              <Text style={[styles.metricValue, { color: Colors.success }]}>{globalMetrics.passed}</Text>
              <Text style={styles.metricLabel}>Aprobados</Text>
            </View>
          </View>
        </View>
      )}

      {/* ── Progreso por Grupo ─────────────────────────────────────────────── */}
      {progressData.length === 0 && (
        <View style={styles.centeredInline}>
          <Ionicons name="bar-chart-outline" size={48} color={Colors.gray} />
          <Text style={styles.emptyText}>No hay datos de progreso aún.</Text>
        </View>
      )}

      {progressData.map(({ group, totalExams, passedExams, avgScore, highScore, lowScore, progressPercent }) => (
        <View key={group.id} style={styles.card}>
          <View style={styles.cardHeader}>
            <View style={styles.iconBox}>
              <Ionicons name="analytics" size={24} color={Colors.primary} />
            </View>
            <View style={{ flex: 1 }}>
              <Text style={styles.groupName}>{group.name}</Text>
              <Text style={styles.groupDesc}>Avance del curso</Text>
            </View>
            <View style={[styles.badge, { backgroundColor: avgScore >= 60 ? Colors.success + '20' : Colors.error + '20' }]}>
              <Text style={[styles.badgeText, { color: avgScore >= 60 ? Colors.success : Colors.error }]}>
                Prom: {avgScore}%
              </Text>
            </View>
          </View>

          {/* Mini métricas del grupo */}
          <View style={styles.miniMetricsRow}>
            <View style={styles.miniMetric}>
              <Ionicons name="arrow-up-circle" size={14} color={Colors.success} />
              <Text style={styles.miniMetricText}>Alta: {highScore}</Text>
            </View>
            <View style={styles.miniMetric}>
              <Ionicons name="arrow-down-circle" size={14} color={Colors.error} />
              <Text style={styles.miniMetricText}>Baja: {lowScore}</Text>
            </View>
          </View>

          <View style={styles.progressContainer}>
            <View style={styles.progressLabels}>
              <Text style={styles.progressText}>{passedExams} de {totalExams} Evaluaciones</Text>
              <Text style={styles.progressPercent}>{Math.round(progressPercent)}%</Text>
            </View>
            <View style={styles.progressBarBg}>
              <View style={[styles.progressBarFill, { width: `${progressPercent}%` }]} />
            </View>
          </View>
        </View>
      ))}

      {/* ── Historial de Intentos (paginado) ───────────────────────────────── */}
      {sortedAttempts.length > 0 && (
        <View style={styles.historySection}>
          <Text style={styles.sectionTitle}>Historial de Intentos</Text>

          {pagedAttempts.map((item) => {
            const color = item.passed ? Colors.success : Colors.error;
            return (
              <TouchableOpacity 
                key={item.attempt_id} 
                style={styles.historyCard}
                onPress={() => router.push(`/(student)/ovas/exam/result/${item.attempt_id}` as any)}
              >
                <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' }}>
                  <View>
                    <Text style={styles.historyExam}>Examen #{item.exam_id}</Text>
                    <Text style={styles.historyDate}>
                      {new Date(item.submitted_at).toLocaleDateString('es-CO', { day: 'numeric', month: 'short', year: 'numeric' })}
                    </Text>
                  </View>
                  <View style={[styles.historyBadge, { backgroundColor: color + '15' }]}>
                    <Ionicons name={item.passed ? 'checkmark-circle' : 'close-circle'} size={14} color={color} />
                    <Text style={[styles.historyScore, { color }]}>{item.score}/100</Text>
                  </View>
                </View>
                <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginTop: 4 }}>
                  <Text style={styles.historyDetail}>
                    {item.correct_answers}/{item.total_questions} correctas · Mínimo: {item.passing_score}%
                  </Text>
                  <Ionicons name="chevron-forward" size={16} color={Colors.gray} />
                </View>
              </TouchableOpacity>
            );
          })}

          {/* Controles de paginación */}
          {totalAttemptPages > 1 && (
            <View style={styles.paginationBar}>
              <TouchableOpacity
                style={[styles.pageBtn, attemptPage === 1 && styles.pageBtnDisabled]}
                onPress={() => setAttemptPage(p => Math.max(1, p - 1))}
                disabled={attemptPage === 1}
              >
                <Ionicons name="chevron-back" size={16} color={attemptPage === 1 ? Colors.window : Colors.primary} />
                <Text style={[styles.pageBtnText, attemptPage === 1 && { color: Colors.gray }]}>Ant</Text>
              </TouchableOpacity>

              <Text style={styles.pageInfo}>{attemptPage} de {totalAttemptPages}</Text>

              <TouchableOpacity
                style={[styles.pageBtn, attemptPage === totalAttemptPages && styles.pageBtnDisabled]}
                onPress={() => setAttemptPage(p => Math.min(totalAttemptPages, p + 1))}
                disabled={attemptPage === totalAttemptPages}
              >
                <Text style={[styles.pageBtnText, attemptPage === totalAttemptPages && { color: Colors.gray }]}>Sig</Text>
                <Ionicons name="chevron-forward" size={16} color={attemptPage === totalAttemptPages ? Colors.window : Colors.primary} />
              </TouchableOpacity>
            </View>
          )}
        </View>
      )}
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: Colors.background },
  content: { padding: 24, gap: 16, paddingBottom: 40 },
  centered: { flex: 1, justifyContent: 'center', alignItems: 'center', gap: 12 },
  centeredInline: { alignItems: 'center', gap: 12, paddingVertical: 40 },
  loadingText: { fontSize: 14, color: Colors.gray },
  errorText: { fontSize: 15, color: Colors.error, textAlign: 'center', paddingHorizontal: 24 },
  emptyText: { color: Colors.gray, marginTop: 8, fontStyle: 'italic' },
  retryBtn: { marginTop: 12, backgroundColor: Colors.primary, paddingHorizontal: 20, paddingVertical: 10, borderRadius: 12 },
  retryBtnText: { color: Colors.surface, fontSize: 14, fontWeight: 'bold' },
  header: { marginBottom: 4, paddingTop: 20 },
  title: { fontSize: 28, fontWeight: '800', color: Colors.dark },
  subtitle: { fontSize: 15, color: Colors.gray, marginTop: 4 },
  sectionTitle: { fontSize: 16, fontWeight: '700', color: Colors.dark, marginBottom: 16 },
  // ── Global metrics ──
  globalCard: { backgroundColor: Colors.surface, borderRadius: 16, padding: 20, elevation: 2, borderWidth: 1, borderColor: Colors.window },
  metricsGrid: { flexDirection: 'row', flexWrap: 'wrap' },
  metricItem: { width: '33%', alignItems: 'center', paddingVertical: 10 },
  metricValue: { fontSize: 22, fontWeight: '800', color: Colors.dark },
  metricLabel: { fontSize: 11, color: Colors.gray, marginTop: 2, fontWeight: '500' },
  // ── Group cards ──
  card: { backgroundColor: Colors.surface, borderRadius: 16, padding: 20, elevation: 2, borderWidth: 1, borderColor: Colors.window },
  cardHeader: { flexDirection: 'row', alignItems: 'center', gap: 12, marginBottom: 12 },
  iconBox: { width: 48, height: 48, borderRadius: 12, backgroundColor: Colors.primary + '15', justifyContent: 'center', alignItems: 'center' },
  groupName: { fontSize: 18, fontWeight: '700', color: Colors.dark },
  groupDesc: { fontSize: 13, color: Colors.gray, marginTop: 2 },
  badge: { paddingHorizontal: 10, paddingVertical: 6, borderRadius: 8 },
  badgeText: { fontWeight: '700', fontSize: 13 },
  miniMetricsRow: { flexDirection: 'row', gap: 16, marginBottom: 16, paddingLeft: 4 },
  miniMetric: { flexDirection: 'row', alignItems: 'center', gap: 4 },
  miniMetricText: { fontSize: 12, fontWeight: '600', color: Colors.gray },
  progressContainer: { gap: 8 },
  progressLabels: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'flex-end' },
  progressText: { fontSize: 14, color: Colors.gray, fontWeight: '500' },
  progressPercent: { fontSize: 16, fontWeight: '700', color: Colors.primary },
  progressBarBg: { height: 10, backgroundColor: Colors.window, borderRadius: 5, overflow: 'hidden' },
  progressBarFill: { height: '100%', backgroundColor: Colors.primary, borderRadius: 5 },
  // ── History ──
  historySection: { marginTop: 8 },
  historyCard: { backgroundColor: Colors.surface, borderRadius: 12, padding: 14, marginBottom: 8, borderWidth: 1, borderColor: Colors.window },
  historyExam: { fontSize: 14, fontWeight: '700', color: Colors.dark },
  historyDate: { fontSize: 11, color: Colors.gray, marginTop: 2 },
  historyBadge: { flexDirection: 'row', alignItems: 'center', gap: 6, paddingHorizontal: 10, paddingVertical: 4, borderRadius: 10 },
  historyScore: { fontSize: 14, fontWeight: '700' },
  historyDetail: { fontSize: 12, color: Colors.gray, marginTop: 8 },
  // ── Pagination ──
  paginationBar: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', paddingVertical: 12, paddingHorizontal: 4 },
  pageBtn: { flexDirection: 'row', alignItems: 'center', paddingVertical: 6, paddingHorizontal: 10, borderRadius: 8, backgroundColor: Colors.primary + '10', gap: 4 },
  pageBtnDisabled: { backgroundColor: Colors.window + '50' },
  pageBtnText: { fontSize: 13, fontWeight: '600', color: Colors.primary },
  pageInfo: { fontSize: 14, fontWeight: '700', color: Colors.primary },
});