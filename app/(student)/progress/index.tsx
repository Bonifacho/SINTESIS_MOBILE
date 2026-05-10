import React, { useEffect, useState } from 'react';
import { View, Text, StyleSheet, ScrollView, ActivityIndicator } from 'react-native';
import { Colors } from '@/src/theme/colors';
import { useAuthStore } from '@/src/store/authStore';
import { academicApi } from '@/src/api/academic';
import { Ionicons } from '@expo/vector-icons';
import type { AcademicGroup, AcademicTopic, AcademicOva, ExamAttempt } from '@/src/models/academic';

interface GroupProgress {
  group: AcademicGroup;
  totalExams: number;
  passedExams: number;
  avgScore: number;
  progressPercent: number;
}

export default function StudentProgressScreen() {
  const user = useAuthStore((s) => s.user);

  const [progressData, setProgressData] = useState<GroupProgress[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!user?.id) return;

    const fetchProgress = async () => {
      try {
        setLoading(true);
        setError(null);

        // 1. Obtener grupos y intentos del estudiante en paralelo
        const [groupsRes, attemptsRes] = await Promise.all([
          academicApi.getUserGroups(user.id),
          academicApi.getStudentAttempts(user.id),
        ]);

        const groups: AcademicGroup[] = groupsRes.data.data;
        const allAttempts: ExamAttempt[] = attemptsRes.data.data;

        // 2. Para cada grupo, obtener temas y OVAs para calcular progreso
        const progressPromises = groups.map(async (group): Promise<GroupProgress> => {
          try {
            const topicsRes = await academicApi.getGroupTopics(group.id);
            const topics: AcademicTopic[] = topicsRes.data.data;

            // Obtener OVAs de todos los temas en paralelo
            const ovasResults = await Promise.all(
              topics.map(async (t) => {
                const ovasRes = await academicApi.getOvasByTopic(t.id);
                return { topicId: t.id, ovas: ovasRes.data.data as AcademicOva[] };
              })
            );

            // Contar total de exámenes (OVAs sin recursos = probablemente examen)
            let totalExams = 0;
            const topicIds = topics.map(t => t.id);
            const allOvaIds: number[] = [];

            ovasResults.forEach(({ ovas }) => {
              ovas.forEach(ova => {
                allOvaIds.push(ova.id);
                // Heurística: OVA sin recursos o con título de evaluación = examen
                if (ova.resources?.length === 0 || ova.title.toLowerCase().includes('evaluación') || ova.title.toLowerCase().includes('test')) {
                  totalExams++;
                }
              });
            });

            // Filtrar intentos que pertenezcan a este grupo
            const groupAttempts = allAttempts.filter(a => 
              'ova_id' in a && allOvaIds.includes((a as any).ova_id)
            );

            const passedOvaIds = new Set(groupAttempts.filter(a => a.passed).map(a => (a as any).ova_id));
            const passedExams = passedOvaIds.size;
            const progressPercent = totalExams > 0 ? (passedExams / totalExams) * 100 : 0;
            const avgScore = groupAttempts.length > 0
              ? Math.round(groupAttempts.reduce((sum, a) => sum + a.score, 0) / groupAttempts.length)
              : 0;

            return { group, totalExams, passedExams, avgScore, progressPercent };
          } catch {
            // Si falla un grupo individual, retornamos datos vacíos para ese grupo
            return { group, totalExams: 0, passedExams: 0, avgScore: 0, progressPercent: 0 };
          }
        });

        const results = await Promise.all(progressPromises);
        setProgressData(results);
      } catch (err) {
        console.error('[Progress] Error cargando progreso:', err);
        setError('No se pudo cargar tu progreso académico.');
      } finally {
        setLoading(false);
      }
    };

    fetchProgress();
  }, [user?.id]);

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
      </View>
    );
  }

  return (
    <ScrollView style={styles.container} contentContainerStyle={styles.content}>
      <View style={styles.header}>
        <Text style={styles.title}>Mi Rendimiento</Text>
        <Text style={styles.subtitle}>Métricas de tu avance académico</Text>
      </View>

      {progressData.length === 0 && (
        <View style={styles.centered}>
          <Ionicons name="bar-chart-outline" size={48} color={Colors.gray} />
          <Text style={styles.emptyText}>No hay datos de progreso aún.</Text>
        </View>
      )}

      {progressData.map(({ group, totalExams, passedExams, avgScore, progressPercent }) => (
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
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: Colors.background },
  content: { padding: 24, gap: 16 },
  centered: { flex: 1, justifyContent: 'center', alignItems: 'center', gap: 12 },
  loadingText: { fontSize: 14, color: Colors.gray },
  errorText: { fontSize: 15, color: Colors.error, textAlign: 'center', paddingHorizontal: 24 },
  emptyText: { fontSize: 15, color: Colors.gray, fontStyle: 'italic' },
  header: { marginBottom: 10, paddingTop: 20 },
  title: { fontSize: 28, fontWeight: '800', color: Colors.dark },
  subtitle: { fontSize: 15, color: Colors.gray, marginTop: 4 },
  card: { backgroundColor: Colors.surface, borderRadius: 16, padding: 20, elevation: 2, borderWidth: 1, borderColor: Colors.window },
  cardHeader: { flexDirection: 'row', alignItems: 'center', gap: 12, marginBottom: 20 },
  iconBox: { width: 48, height: 48, borderRadius: 12, backgroundColor: Colors.primary + '15', justifyContent: 'center', alignItems: 'center' },
  groupName: { fontSize: 18, fontWeight: '700', color: Colors.dark },
  groupDesc: { fontSize: 13, color: Colors.gray, marginTop: 2 },
  badge: { paddingHorizontal: 10, paddingVertical: 6, borderRadius: 8 },
  badgeText: { fontWeight: '700', fontSize: 13 },
  progressContainer: { gap: 8 },
  progressLabels: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'flex-end' },
  progressText: { fontSize: 14, color: Colors.gray, fontWeight: '500' },
  progressPercent: { fontSize: 16, fontWeight: '700', color: Colors.primary },
  progressBarBg: { height: 10, backgroundColor: Colors.window, borderRadius: 5, overflow: 'hidden' },
  progressBarFill: { height: '100%', backgroundColor: Colors.primary, borderRadius: 5 },
});