import React, { useEffect, useMemo, useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  ActivityIndicator,
  TouchableOpacity,
  TextInput,
  RefreshControl,
  SafeAreaView,
  StatusBar,
} from 'react-native';
import { useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { Colors, getColors } from '@/src/theme/colors';
import { useThemeStore } from '@/src/store/themeStore';
import { useAuthStore } from '@/src/store/authStore';
import { academicApi } from '@/src/api/academic';
import { goBackOrTo } from '@/src/utils/navigation';
import type { ExamAttempt } from '@/src/models/academic';

const PAGE_SIZE = 5;

export default function StudentAttemptsHistoryScreen() {
  const isDark = useThemeStore((s) => s.isDark);
  const themeColors = getColors(isDark);
  const styles = makeStyles(isDark, themeColors);
  const router = useRouter();
  const user = useAuthStore((s) => s.user);

  const [attempts, setAttempts] = useState<ExamAttempt[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [page, setPage] = useState(1);

  const fetchAttempts = async () => {
    if (!user?.id) return;
    try {
      setError(null);
      const res = await academicApi.getStudentAttempts(user.id);
      setAttempts(res.data.data || []);
    } catch (err) {
      console.error('[History] Error cargando intentos:', err);
      setError('No se pudo cargar el historial de intentos.');
    }
  };

  useEffect(() => {
    setLoading(true);
    fetchAttempts().finally(() => setLoading(false));
  }, [user?.id]);

  const onRefresh = async () => {
    setRefreshing(true);
    await fetchAttempts();
    setRefreshing(false);
  };

  const approvedCount = useMemo(() => {
    return attempts.filter((a) => a.passed).length;
  }, [attempts]);

  const filteredAttempts = useMemo(() => {
    let list = [...attempts];
    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase();
      list = list.filter((a) => {
        const title = ((a as any).ova_title || `Examen #${a.exam_id}`).toLowerCase();
        return title.includes(q);
      });
    }
    return list.sort(
      (a, b) => new Date(b.submitted_at).getTime() - new Date(a.submitted_at).getTime()
    );
  }, [attempts, searchQuery]);

  useEffect(() => {
    setPage(1);
  }, [searchQuery]);

  const totalPages = Math.max(1, Math.ceil(filteredAttempts.length / PAGE_SIZE));
  const pagedAttempts = filteredAttempts.slice((page - 1) * PAGE_SIZE, page * PAGE_SIZE);

  if (loading) {
    return (
      <View style={styles.centered}>
        <ActivityIndicator size="large" color={themeColors.primary} />
        <Text style={styles.loadingText}>Cargando historial...</Text>
      </View>
    );
  }

  if (error) {
    return (
      <View style={styles.centered}>
        <Ionicons name="cloud-offline-outline" size={48} color={themeColors.error} />
        <Text style={styles.errorText}>{error}</Text>
        <TouchableOpacity style={styles.retryBtn} onPress={fetchAttempts}>
          <Text style={styles.retryBtnText}>Reintentar</Text>
        </TouchableOpacity>
      </View>
    );
  }

  return (
    <SafeAreaView style={styles.safeArea}>
      <StatusBar barStyle="light-content" backgroundColor={themeColors.primary} />

      {/* ── Header Púrpura con Botón Atrás ─────────────────────────── */}
      <View style={styles.header}>
        <TouchableOpacity
          style={styles.backBtn}
          onPress={() => goBackOrTo(router, '/(student)/progress')}
          activeOpacity={0.7}
        >
          <Ionicons name="chevron-back" size={26} color="#FFFFFF" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Historial de intentos</Text>
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
        {/* ── Tarjetas Resumen Métricas (Total e Intentos Aprobados) ── */}
        <View style={styles.metricsRow}>
          <View style={styles.metricCard}>
            <Text style={styles.metricNumber}>{attempts.length}</Text>
            <Text style={styles.metricLabel}>Total intentos</Text>
          </View>
          <View style={styles.metricCard}>
            <Text style={[styles.metricNumber, { color: themeColors.success }]}>
              {approvedCount}
            </Text>
            <Text style={styles.metricLabel}>Aprobados</Text>
          </View>
        </View>

        {/* ── Buscador ────────────────────────────────────────────── */}
        <View style={styles.searchContainer}>
          <Ionicons
            name="search-outline"
            size={20}
            color={themeColors.gray}
            style={styles.searchIcon}
          />
          <TextInput
            style={styles.searchInput}
            placeholder="Buscar por nombre de evaluación..."
            placeholderTextColor={themeColors.gray}
            value={searchQuery}
            onChangeText={setSearchQuery}
            autoCapitalize="none"
          />
          {searchQuery.length > 0 && (
            <TouchableOpacity onPress={() => setSearchQuery('')} style={styles.clearBtn}>
              <Ionicons name="close-circle" size={18} color={themeColors.gray} />
            </TouchableOpacity>
          )}
        </View>

        {/* ── Lista de Intentos ───────────────────────────────────── */}
        {pagedAttempts.length === 0 ? (
          <View style={styles.emptyContainer}>
            <Ionicons name="document-text-outline" size={48} color={themeColors.gray} />
            <Text style={styles.emptyText}>
              {searchQuery.trim().length > 0
                ? 'No se encontraron evaluaciones con ese nombre.'
                : 'Aún no has realizado ninguna evaluación.'}
            </Text>
          </View>
        ) : (
          pagedAttempts.map((item) => {
            const passed = item.passed;
            const scoreColor = passed ? themeColors.success : themeColors.error;
            const badgeBg = isDark
              ? passed
                ? 'rgba(52, 211, 153, 0.15)'
                : 'rgba(248, 113, 113, 0.15)'
              : passed
              ? '#D1FAE5'
              : '#FEE2E2';

            const iconBg = isDark
              ? passed
                ? 'rgba(52, 211, 153, 0.2)'
                : 'rgba(248, 113, 113, 0.2)'
              : passed
              ? '#DCFCE7'
              : '#FEE2E2';

            const formattedDate = new Date(item.submitted_at).toLocaleDateString('es-CO', {
              day: 'numeric',
              month: 'short',
              year: 'numeric',
            });

            const evalTitle = (item as any).ova_title
              ? `Evaluación: ${(item as any).ova_title}`
              : `Evaluación: Examen #${item.exam_id}`;

            return (
              <TouchableOpacity
                key={item.attempt_id}
                style={styles.attemptCard}
                activeOpacity={0.7}
                onPress={() =>
                  router.push(`/(student)/ovas/exam/result/${item.attempt_id}` as any)
                }
              >
                <View style={[styles.statusIconBox, { backgroundColor: iconBg }]}>
                  <Ionicons
                    name={passed ? 'checkmark' : 'close'}
                    size={16}
                    color={scoreColor}
                  />
                </View>

                <View style={styles.attemptInfo}>
                  <Text style={styles.attemptTitle} numberOfLines={1}>
                    {evalTitle}
                  </Text>
                  <Text style={styles.attemptDate}>{formattedDate}</Text>
                  <Text style={styles.attemptSub}>
                    {item.correct_answers}/{item.total_questions} correctas · Mínimo:{' '}
                    {item.passing_score}%
                  </Text>
                </View>

                <View style={styles.attemptRight}>
                  <View style={[styles.scoreBadge, { backgroundColor: badgeBg }]}>
                    <Text style={[styles.scoreBadgeText, { color: scoreColor }]}>
                      {item.score}/100
                    </Text>
                  </View>
                  <Ionicons name="chevron-forward" size={18} color={themeColors.gray} />
                </View>
              </TouchableOpacity>
            );
          })
        )}

        {/* ── Paginación ─────────────────────────────────────────── */}
        {totalPages > 1 && (
          <View style={styles.paginationBar}>
            <TouchableOpacity
              style={[styles.pageBtn, page === 1 && styles.pageBtnDisabled]}
              onPress={() => setPage((p) => Math.max(1, p - 1))}
              disabled={page === 1}
              activeOpacity={0.6}
            >
              <Ionicons
                name="chevron-back"
                size={16}
                color={page === 1 ? themeColors.gray : themeColors.primary}
              />
              <Text
                style={[
                  styles.pageBtnText,
                  page === 1 && { color: themeColors.gray },
                ]}
              >
                Ant
              </Text>
            </TouchableOpacity>

            <Text style={styles.pageInfoText}>
              {page} de {totalPages}
            </Text>

            <TouchableOpacity
              style={[styles.pageBtn, page === totalPages && styles.pageBtnDisabled]}
              onPress={() => setPage((p) => Math.min(totalPages, p + 1))}
              disabled={page === totalPages}
              activeOpacity={0.6}
            >
              <Text
                style={[
                  styles.pageBtnText,
                  page === totalPages && { color: themeColors.gray },
                ]}
              >
                Sig
              </Text>
              <Ionicons
                name="chevron-forward"
                size={16}
                color={page === totalPages ? themeColors.gray : themeColors.primary}
              />
            </TouchableOpacity>
          </View>
        )}
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
    header: {
      flexDirection: 'row',
      alignItems: 'center',
      backgroundColor: theme.primary,
      paddingHorizontal: 16,
      paddingTop: 12,
      paddingBottom: 20,
      gap: 12,
    },
    backBtn: {
      width: 40,
      height: 40,
      borderRadius: 20,
      alignItems: 'center',
      justifyContent: 'center',
    },
    headerTitle: {
      fontSize: 20,
      fontWeight: '800',
      color: '#FFFFFF',
    },
    container: {
      flex: 1,
      backgroundColor: isDark ? '#121212' : theme.background,
    },
    content: {
      padding: 16,
      paddingBottom: 40,
      gap: 14,
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
    // Métricas superiores
    metricsRow: {
      flexDirection: 'row',
      gap: 12,
    },
    metricCard: {
      flex: 1,
      backgroundColor: isDark ? '#1E1E1E' : theme.surface,
      borderRadius: 16,
      paddingVertical: 18,
      paddingHorizontal: 16,
      borderWidth: 1,
      borderColor: isDark ? '#2C2C2C' : theme.window,
      shadowColor: '#000',
      shadowOffset: { width: 0, height: 1 },
      shadowOpacity: 0.05,
      shadowRadius: 2,
      elevation: 1,
    },
    metricNumber: {
      fontSize: 28,
      fontWeight: '800',
      color: isDark ? '#FFFFFF' : theme.dark,
    },
    metricLabel: {
      fontSize: 13,
      fontWeight: '500',
      color: theme.gray,
      marginTop: 4,
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
    // Tarjeta de intento
    attemptCard: {
      flexDirection: 'row',
      alignItems: 'center',
      backgroundColor: isDark ? '#1E1E1E' : theme.surface,
      borderRadius: 16,
      padding: 16,
      borderWidth: 1,
      borderColor: isDark ? '#2C2C2C' : theme.window,
      gap: 12,
      shadowColor: '#000',
      shadowOffset: { width: 0, height: 1 },
      shadowOpacity: 0.04,
      shadowRadius: 2,
      elevation: 1,
    },
    statusIconBox: {
      width: 32,
      height: 32,
      borderRadius: 16,
      justifyContent: 'center',
      alignItems: 'center',
    },
    attemptInfo: {
      flex: 1,
    },
    attemptTitle: {
      fontSize: 15,
      fontWeight: '700',
      color: isDark ? '#FFFFFF' : theme.dark,
    },
    attemptDate: {
      fontSize: 12,
      color: theme.gray,
      marginTop: 2,
    },
    attemptSub: {
      fontSize: 12,
      color: theme.gray,
      marginTop: 4,
    },
    attemptRight: {
      flexDirection: 'row',
      alignItems: 'center',
      gap: 8,
    },
    scoreBadge: {
      paddingHorizontal: 10,
      paddingVertical: 5,
      borderRadius: 12,
    },
    scoreBadgeText: {
      fontSize: 13,
      fontWeight: '700',
    },
    // Vacío
    emptyContainer: {
      alignItems: 'center',
      paddingVertical: 40,
      gap: 12,
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
      paddingVertical: 12,
      marginTop: 8,
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
  });
