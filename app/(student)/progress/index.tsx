import React, { useEffect, useMemo, useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  ActivityIndicator,
  TouchableOpacity,
  TextInput,
  Alert,
  RefreshControl,
  SafeAreaView,
  StatusBar,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import { getColors } from '@/src/theme/colors';
import { useThemeStore } from '@/src/store/themeStore';
import { useAuthStore } from '@/src/store/authStore';
import { academicApi } from '@/src/api/academic';
import { generateAndSharePDF } from '@/src/utils/pdfExport';
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

const PAGE_SIZE_GROUPS = 3;

export default function StudentProgressScreen() {
  const isDark = useThemeStore((s) => s.isDark);
  const themeColors = getColors(isDark);
  const styles = makeStyles(isDark, themeColors);
  const router = useRouter();
  const user = useAuthStore((s) => s.user);

  const [progressData, setProgressData] = useState<GroupProgress[]>([]);
  const [allAttempts, setAllAttempts] = useState<ExamAttempt[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Estado independiente de búsqueda y paginación para materias (Sección 8.1)
  const [groupSearchQuery, setGroupSearchQuery] = useState('');
  const [groupPage, setGroupPage] = useState(1);

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
            ovas.forEach((ova) => {
              allOvaIds.push(ova.id);
              if (ova.has_exam) {
                totalExams++;
              }
            });
          });

          const groupAttempts = fetchedAttempts.filter(
            (a) => 'ova_id' in a && allOvaIds.includes((a as any).ova_id)
          );

          const passedOvaIds = new Set(
            groupAttempts.filter((a) => a.passed).map((a) => (a as any).ova_id)
          );
          const passedExams = passedOvaIds.size;
          const progressPercent = totalExams > 0 ? (passedExams / totalExams) * 100 : 0;
          const scores = groupAttempts.map((a) => a.score);
          const avgScore =
            scores.length > 0
              ? Math.round(scores.reduce((s, v) => s + v, 0) / scores.length)
              : 0;
          const highScore = scores.length > 0 ? Math.max(...scores) : 0;
          const lowScore = scores.length > 0 ? Math.min(...scores) : 0;

          return {
            group,
            totalExams,
            passedExams,
            avgScore,
            highScore,
            lowScore,
            progressPercent,
            attempts: groupAttempts,
          };
        } catch {
          return {
            group,
            totalExams: 0,
            passedExams: 0,
            avgScore: 0,
            highScore: 0,
            lowScore: 0,
            progressPercent: 0,
            attempts: [],
          };
        }
      });

      const results = await Promise.all(progressPromises);
      setProgressData(results);
    } catch (err) {
      console.error('[Progress] Error cargando progreso:', err);
      setError('No se pudo cargar tu progreso académico.');
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

  // ── Métricas Globales para el Resumen ──────────────────────────────────────
  const globalMetrics = useMemo(() => {
    if (allAttempts.length === 0) {
      return { total: 0, avg: 0, passed: 0 };
    }
    const scores = allAttempts.map((a) => a.score);
    const avg = Math.round(scores.reduce((s, v) => s + v, 0) / scores.length);
    const passed = allAttempts.filter((a) => a.passed).length;
    return { total: allAttempts.length, avg, passed };
  }, [allAttempts]);

  // ── Filtrado y Paginación de Materias (Sección 8.1) ────────────────────────
  const filteredGroups = useMemo(() => {
    let list = [...progressData];
    if (groupSearchQuery.trim()) {
      const q = groupSearchQuery.toLowerCase();
      list = list.filter((gp) => gp.group.name.toLowerCase().includes(q));
    }
    return list;
  }, [progressData, groupSearchQuery]);

  useEffect(() => {
    setGroupPage(1);
  }, [groupSearchQuery]);

  const totalGroupPages = Math.max(1, Math.ceil(filteredGroups.length / PAGE_SIZE_GROUPS));
  const pagedGroups = filteredGroups.slice(
    (groupPage - 1) * PAGE_SIZE_GROUPS,
    groupPage * PAGE_SIZE_GROUPS
  );

  const handleDownloadPDF = async () => {
    try {
      await generateAndSharePDF({
        title: 'Reporte de Progreso Académico',
        subtitle: 'Resumen personal de evaluaciones',
        generatedBy: user?.full_name ?? 'Estudiante',
        metrics: [
          { label: 'Total Intentos', value: globalMetrics.total },
          { label: 'Aprobados', value: globalMetrics.passed, color: themeColors.success },
          { label: 'Promedio Global', value: `${globalMetrics.avg}%`, color: themeColors.primary },
        ],
        attempts: allAttempts
          .map((a) => ({
            examId: a.exam_id,
            studentName: (a as any).ova_title ?? `Examen #${a.exam_id}`,
            score: a.score,
            passed: a.passed,
            correct: a.correct_answers,
            total: a.total_questions,
            date: new Date(a.submitted_at).toLocaleDateString('es-CO'),
          }))
          .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime()),
      });
    } catch {
      Alert.alert('Error', 'No se pudo generar el PDF.');
    }
  };

  if (loading) {
    return (
      <View style={styles.centered}>
        <ActivityIndicator size="large" color={themeColors.primary} />
        <Text style={styles.loadingText}>Calculando tu progreso...</Text>
      </View>
    );
  }

  if (error) {
    return (
      <View style={styles.centered}>
        <Ionicons name="cloud-offline-outline" size={48} color={themeColors.error} />
        <Text style={styles.errorText}>{error}</Text>
        <TouchableOpacity style={styles.retryBtn} onPress={fetchProgress}>
          <Text style={styles.retryBtnText}>Reintentar conexión</Text>
        </TouchableOpacity>
      </View>
    );
  }

  return (
    <SafeAreaView style={styles.safeArea}>
      <StatusBar barStyle="light-content" backgroundColor={themeColors.primary} />

      {/* ── Top Header Púrpura con Botón Descargar (Boceto 1) ─────────── */}
      <View style={styles.topHeader}>
        <Text style={styles.topHeaderTitle}>Progreso</Text>
        <TouchableOpacity
          style={styles.downloadCircleBtn}
          onPress={handleDownloadPDF}
          activeOpacity={0.8}
        >
          <Ionicons name="download-outline" size={20} color="#FFFFFF" />
        </TouchableOpacity>
      </View>

      <ScrollView
        style={styles.container}
        contentContainerStyle={styles.content}
        showsVerticalScrollIndicator={false}
        refreshControl={
          <RefreshControl
            refreshing={refreshing}
            onRefresh={onRefresh}
            colors={[themeColors.primary]}
          />
        }
      >
        {/* ── Tarjeta: RESUMEN GENERAL (Boceto 1) ─────────────────────── */}
        <View style={styles.summaryCard}>
          <Text style={styles.summaryHeaderLabel}>RESUMEN GENERAL</Text>
          <View style={styles.summaryGrid}>
            <View style={styles.summaryItem}>
              <Text style={styles.summaryNumber}>{globalMetrics.total}</Text>
              <Text style={styles.summaryLabel}>Intentos</Text>
            </View>
            <View style={styles.summaryItem}>
              <Text style={[styles.summaryNumber, { color: themeColors.primary }]}>
                {globalMetrics.avg}%
              </Text>
              <Text style={styles.summaryLabel}>Promedio</Text>
            </View>
            <View style={styles.summaryItem}>
              <Text style={[styles.summaryNumber, { color: themeColors.success }]}>
                {globalMetrics.passed}
              </Text>
              <Text style={styles.summaryLabel}>Aprobados</Text>
            </View>
          </View>
        </View>

        {/* ── Sección: Progreso por materia (Boceto 1) ───────────────── */}
        <View style={styles.sectionHeaderRow}>
          <Text style={styles.sectionTitle}>Progreso por materia</Text>
          <Text style={styles.sectionBadgeCount}>{progressData.length} materias</Text>
        </View>

        {/* Buscador de Materias */}
        <View style={styles.searchContainer}>
          <Ionicons
            name="search-outline"
            size={18}
            color={themeColors.gray}
            style={styles.searchIcon}
          />
          <TextInput
            style={styles.searchInput}
            placeholder="Buscar materia..."
            placeholderTextColor={themeColors.gray}
            value={groupSearchQuery}
            onChangeText={setGroupSearchQuery}
            autoCapitalize="none"
          />
          {groupSearchQuery.length > 0 && (
            <TouchableOpacity onPress={() => setGroupSearchQuery('')} style={styles.clearBtn}>
              <Ionicons name="close-circle" size={18} color={themeColors.gray} />
            </TouchableOpacity>
          )}
        </View>

        {/* Lista Paginada de Materias */}
        {pagedGroups.length === 0 ? (
          <View style={styles.emptyContainer}>
            <Ionicons name="school-outline" size={44} color={themeColors.gray} />
            <Text style={styles.emptyText}>
              {groupSearchQuery.trim().length > 0
                ? 'No se encontraron materias con ese nombre.'
                : 'No estás inscrito en ninguna materia aún.'}
            </Text>
          </View>
        ) : (
          pagedGroups.map(
            ({
              group,
              totalExams,
              passedExams,
              avgScore,
              highScore,
              lowScore,
              progressPercent,
            }) => {
              const isPassed = avgScore >= 60;
              const badgeBg = isDark
                ? isPassed
                  ? 'rgba(52, 211, 153, 0.15)'
                  : 'rgba(248, 113, 113, 0.15)'
                : isPassed
                ? '#D1FAE5'
                : '#FEE2E2';

              const badgeColor = isPassed ? themeColors.success : themeColors.error;

              return (
                <View key={group.id} style={styles.courseCard}>
                  <View style={styles.courseCardTop}>
                    <View style={styles.courseIconBox}>
                      <Ionicons name="trending-up" size={20} color={themeColors.primary} />
                    </View>
                    <View style={[styles.avgBadge, { backgroundColor: badgeBg }]}>
                      <Text style={[styles.avgBadgeText, { color: badgeColor }]}>
                        Prom: {avgScore}%
                      </Text>
                    </View>
                  </View>

                  <Text style={styles.courseTitle}>{group.name}</Text>
                  <Text style={styles.courseSubtitle}>Avance del curso</Text>

                  {/* Fila Alta / Baja */}
                  <View style={styles.highLowRow}>
                    <View style={styles.highLowItem}>
                      <Ionicons name="arrow-up" size={14} color={themeColors.success} />
                      <Text style={styles.highLowText}>Alta: {highScore}</Text>
                    </View>
                    <View style={styles.highLowItem}>
                      <Ionicons name="arrow-down" size={14} color={themeColors.error} />
                      <Text style={styles.highLowText}>Baja: {lowScore}</Text>
                    </View>
                  </View>

                  {/* Barra de progreso */}
                  <View style={styles.progressSection}>
                    <View style={styles.progressLabelRow}>
                      <Text style={styles.evalCountText}>
                        {passedExams} de {totalExams} evaluaciones
                      </Text>
                      <Text style={styles.percentText}>{Math.round(progressPercent)}%</Text>
                    </View>
                    <View style={styles.progressBarTrack}>
                      <View
                        style={[
                          styles.progressBarFill,
                          { width: `${Math.min(100, Math.max(0, progressPercent))}%` },
                        ]}
                      />
                    </View>
                  </View>
                </View>
              );
            }
          )
        )}

        {/* ── Controles de Paginación de Materias (Boceto 1) ─────────── */}
        {totalGroupPages > 1 && (
          <View style={styles.paginationBar}>
            <TouchableOpacity
              style={[styles.pageBtn, groupPage === 1 && styles.pageBtnDisabled]}
              onPress={() => setGroupPage((p) => Math.max(1, p - 1))}
              disabled={groupPage === 1}
              activeOpacity={0.6}
            >
              <Ionicons
                name="chevron-back"
                size={16}
                color={groupPage === 1 ? themeColors.gray : themeColors.primary}
              />
              <Text
                style={[
                  styles.pageBtnText,
                  groupPage === 1 && { color: themeColors.gray },
                ]}
              >
                Ant
              </Text>
            </TouchableOpacity>

            <Text style={styles.pageInfoText}>
              {groupPage} de {totalGroupPages}
            </Text>

            <TouchableOpacity
              style={[
                styles.pageBtn,
                groupPage === totalGroupPages && styles.pageBtnDisabled,
              ]}
              onPress={() => setGroupPage((p) => Math.min(totalGroupPages, p + 1))}
              disabled={groupPage === totalGroupPages}
              activeOpacity={0.6}
            >
              <Text
                style={[
                  styles.pageBtnText,
                  groupPage === totalGroupPages && { color: themeColors.gray },
                ]}
              >
                Sig
              </Text>
              <Ionicons
                name="chevron-forward"
                size={16}
                color={
                  groupPage === totalGroupPages ? themeColors.gray : themeColors.primary
                }
              />
            </TouchableOpacity>
          </View>
        )}

        {/* ── Tarjeta Inferior: Historial de Intentos (Boceto 1) ──────── */}
        <TouchableOpacity
          style={styles.historyBannerCard}
          activeOpacity={0.85}
          onPress={() => router.push('/(student)/progress/history' as any)}
        >
          <View style={styles.historyIconCircle}>
            <Ionicons name="time-outline" size={22} color="#FFFFFF" />
          </View>
          <View style={styles.historyBannerTextCol}>
            <Text style={styles.historyBannerTitle}>Historial de intentos</Text>
            <Text style={styles.historyBannerSub}>Revisa todos tus exámenes</Text>
          </View>
          <Ionicons name="chevron-forward" size={22} color="#FFFFFF" />
        </TouchableOpacity>
      </ScrollView>
    </SafeAreaView>
  );
}

const makeStyles = (isDark: boolean, theme: ReturnType<typeof getColors>) =>
  StyleSheet.create({
    safeArea: {
      flex: 1,
      backgroundColor: theme.primary,
    },
    topHeader: {
      flexDirection: 'row',
      justifyContent: 'space-between',
      alignItems: 'center',
      backgroundColor: theme.primary,
      paddingHorizontal: 20,
      paddingTop: 12,
      paddingBottom: 20,
    },
    topHeaderTitle: {
      fontSize: 24,
      fontWeight: '800',
      color: '#FFFFFF',
    },
    downloadCircleBtn: {
      width: 38,
      height: 38,
      borderRadius: 19,
      backgroundColor: 'rgba(255, 255, 255, 0.2)',
      justifyContent: 'center',
      alignItems: 'center',
    },
    container: {
      flex: 1,
      backgroundColor: isDark ? '#121212' : theme.background,
    },
    content: {
      padding: 16,
      paddingBottom: 40,
      gap: 16,
    },
    centered: {
      flex: 1,
      justifyContent: 'center',
      alignItems: 'center',
      backgroundColor: isDark ? '#121212' : theme.background,
      gap: 12,
      padding: 24,
    },
    loadingText: {
      fontSize: 14,
      color: theme.gray,
    },
    errorText: {
      fontSize: 15,
      color: theme.error,
      textAlign: 'center',
    },
    retryBtn: {
      marginTop: 8,
      backgroundColor: theme.primary,
      paddingHorizontal: 20,
      paddingVertical: 10,
      borderRadius: 12,
    },
    retryBtnText: {
      color: '#FFFFFF',
      fontWeight: '700',
      fontSize: 14,
    },
    // Resumen General
    summaryCard: {
      backgroundColor: isDark ? '#1E1E1E' : theme.surface,
      borderRadius: 18,
      paddingVertical: 18,
      paddingHorizontal: 20,
      borderWidth: 1,
      borderColor: isDark ? '#2C2C2C' : theme.window,
      shadowColor: '#000',
      shadowOffset: { width: 0, height: 1 },
      shadowOpacity: 0.05,
      shadowRadius: 3,
      elevation: 2,
    },
    summaryHeaderLabel: {
      fontSize: 12,
      fontWeight: '700',
      color: theme.gray,
      letterSpacing: 0.8,
      marginBottom: 14,
    },
    summaryGrid: {
      flexDirection: 'row',
      justifyContent: 'space-between',
    },
    summaryItem: {
      flex: 1,
      alignItems: 'center',
    },
    summaryNumber: {
      fontSize: 24,
      fontWeight: '800',
      color: isDark ? '#FFFFFF' : theme.dark,
    },
    summaryLabel: {
      fontSize: 12,
      color: theme.gray,
      fontWeight: '500',
      marginTop: 4,
    },
    // Sección Materias
    sectionHeaderRow: {
      flexDirection: 'row',
      justifyContent: 'space-between',
      alignItems: 'center',
      marginTop: 4,
    },
    sectionTitle: {
      fontSize: 18,
      fontWeight: '800',
      color: isDark ? '#FFFFFF' : theme.dark,
    },
    sectionBadgeCount: {
      fontSize: 13,
      color: theme.gray,
      fontWeight: '500',
    },
    // Buscador
    searchContainer: {
      flexDirection: 'row',
      alignItems: 'center',
      backgroundColor: isDark ? '#1E1E1E' : theme.surface,
      borderWidth: 1,
      borderColor: isDark ? '#2C2C2C' : theme.window,
      borderRadius: 14,
      paddingHorizontal: 14,
      height: 48,
    },
    searchIcon: {
      marginRight: 8,
    },
    searchInput: {
      flex: 1,
      fontSize: 14,
      color: isDark ? '#FFFFFF' : theme.dark,
      paddingVertical: 8,
    },
    clearBtn: {
      padding: 4,
    },
    // Tarjeta de materia
    courseCard: {
      backgroundColor: isDark ? '#1E1E1E' : theme.surface,
      borderRadius: 18,
      padding: 18,
      borderWidth: 1,
      borderColor: isDark ? '#2C2C2C' : theme.window,
      shadowColor: '#000',
      shadowOffset: { width: 0, height: 1 },
      shadowOpacity: 0.05,
      shadowRadius: 3,
      elevation: 2,
      gap: 6,
    },
    courseCardTop: {
      flexDirection: 'row',
      justifyContent: 'space-between',
      alignItems: 'center',
      marginBottom: 6,
    },
    courseIconBox: {
      width: 38,
      height: 38,
      borderRadius: 10,
      backgroundColor: isDark ? 'rgba(99, 102, 241, 0.15)' : '#EEF2FF',
      justifyContent: 'center',
      alignItems: 'center',
    },
    avgBadge: {
      paddingHorizontal: 10,
      paddingVertical: 4,
      borderRadius: 12,
    },
    avgBadgeText: {
      fontSize: 12,
      fontWeight: '700',
    },
    courseTitle: {
      fontSize: 17,
      fontWeight: '800',
      color: isDark ? '#FFFFFF' : theme.dark,
    },
    courseSubtitle: {
      fontSize: 12,
      color: theme.gray,
      marginBottom: 4,
    },
    highLowRow: {
      flexDirection: 'row',
      gap: 16,
      marginVertical: 4,
    },
    highLowItem: {
      flexDirection: 'row',
      alignItems: 'center',
      gap: 4,
    },
    highLowText: {
      fontSize: 12,
      color: theme.gray,
      fontWeight: '600',
    },
    progressSection: {
      marginTop: 8,
      gap: 6,
    },
    progressLabelRow: {
      flexDirection: 'row',
      justifyContent: 'space-between',
      alignItems: 'center',
    },
    evalCountText: {
      fontSize: 12,
      color: theme.gray,
      fontWeight: '500',
    },
    percentText: {
      fontSize: 13,
      fontWeight: '700',
      color: isDark ? '#FFFFFF' : theme.dark,
    },
    progressBarTrack: {
      height: 8,
      borderRadius: 4,
      backgroundColor: isDark ? '#2C2C2C' : '#E2E8F0',
      overflow: 'hidden',
    },
    progressBarFill: {
      height: '100%',
      borderRadius: 4,
      backgroundColor: theme.primary,
    },
    // Vacío
    emptyContainer: {
      alignItems: 'center',
      paddingVertical: 36,
      gap: 10,
    },
    emptyText: {
      fontSize: 14,
      color: theme.gray,
      textAlign: 'center',
      fontStyle: 'italic',
      paddingHorizontal: 20,
    },
    // Paginación
    paginationBar: {
      flexDirection: 'row',
      justifyContent: 'center',
      alignItems: 'center',
      gap: 20,
      paddingVertical: 8,
    },
    pageBtn: {
      flexDirection: 'row',
      alignItems: 'center',
      gap: 4,
      paddingVertical: 6,
      paddingHorizontal: 10,
    },
    pageBtnDisabled: {
      opacity: 0.4,
    },
    pageBtnText: {
      fontSize: 14,
      fontWeight: '700',
      color: theme.primary,
    },
    pageInfoText: {
      fontSize: 14,
      fontWeight: '600',
      color: theme.gray,
    },
    // Banner inferior
    historyBannerCard: {
      flexDirection: 'row',
      alignItems: 'center',
      backgroundColor: theme.primary,
      borderRadius: 18,
      paddingVertical: 18,
      paddingHorizontal: 18,
      marginTop: 10,
      gap: 14,
      shadowColor: theme.primary,
      shadowOffset: { width: 0, height: 4 },
      shadowOpacity: 0.25,
      shadowRadius: 6,
      elevation: 4,
    },
    historyIconCircle: {
      width: 44,
      height: 44,
      borderRadius: 22,
      backgroundColor: 'rgba(255, 255, 255, 0.2)',
      justifyContent: 'center',
      alignItems: 'center',
    },
    historyBannerTextCol: {
      flex: 1,
    },
    historyBannerTitle: {
      fontSize: 16,
      fontWeight: '800',
      color: '#FFFFFF',
    },
    historyBannerSub: {
      fontSize: 13,
      color: '#E0E7FF',
      marginTop: 2,
    },
  });