import { useThemeStore } from '@/src/store/themeStore';
import React, { useEffect, useState } from 'react';
import {
  View, Text, StyleSheet, TouchableOpacity, ScrollView, ActivityIndicator,
} from 'react-native';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { Colors } from '@/src/theme/colors';
import { academicApi } from '@/src/api/academic';
import type { ExamAttempt, QuestionResult } from '@/src/models/academic';

export default function ExamResultScreen() {
  const isDark = useThemeStore((s) => s.isDark);
  const styles = makeStyles(isDark);
  const router      = useRouter();
  const { attemptId } = useLocalSearchParams<{ attemptId: string }>();

  const [attempt, setAttempt] = useState<ExamAttempt | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!attemptId) return;

    const fetchResult = async () => {
      try {
        setLoading(true);
        setError(null);
        const res = await academicApi.getAttemptResult(Number(attemptId));
        console.log('[Result] Backend response:', JSON.stringify(res.data.data, null, 2));
        setAttempt(res.data.data);
      } catch (err) {
        console.error('[Result] Error cargando resultado:', err);
        setError('No se pudo cargar el resultado.');
      } finally {
        setLoading(false);
      }
    };

    fetchResult();
  }, [attemptId]);

  if (loading) {
    return (
      <View style={styles.centered}>
        <ActivityIndicator size="large" color={Colors.primary} />
        <Text style={styles.loadingText}>Cargando resultado...</Text>
      </View>
    );
  }

  if (error || !attempt) {
    return (
      <View style={styles.centered}>
        <Ionicons name="alert-circle-outline" size={52} color={Colors.warning} />
        <Text style={styles.errorText}>{error ?? 'No se encontró el resultado.'}</Text>
        <TouchableOpacity
          style={styles.primaryBtn}
          onPress={() => router.back()}
        >
          <Text style={styles.primaryBtnText}>Volver</Text>
        </TouchableOpacity>
      </View>
    );
  }

  const passed      = attempt.passed;
  const accentColor = passed ? Colors.success : Colors.error;
  const icon        = passed ? 'checkmark-circle' : 'close-circle';
  const label       = passed ? '¡Aprobado!' : 'No aprobado';
  const feedback    = attempt.question_results ?? [];

  return (
    <ScrollView style={styles.container} contentContainerStyle={styles.body}>

      {/* Resultado principal */}
      <View style={[styles.resultCard, { borderColor: accentColor + '40' }]}>
        <Ionicons name={icon} size={72} color={accentColor} />
        <Text style={[styles.resultLabel, { color: accentColor }]}>{label}</Text>
        <Text style={styles.ovaName}>Examen</Text>

        {/* Score circular visual */}
        <View style={[styles.scoreCircle, { borderColor: accentColor }]}>
          <Text style={[styles.scoreNumber, { color: accentColor }]}>
            {attempt.score}
          </Text>
          <Text style={styles.scoreUnit}>/ 100</Text>
        </View>
      </View>

      {/* Desglose */}
      <View style={styles.detailCard}>
        <Text style={styles.detailTitle}>Desglose del resultado</Text>

        <View style={styles.detailRow}>
          <View style={styles.detailIcon}>
            <Ionicons name="checkmark-circle" size={20} color={Colors.success} />
          </View>
          <Text style={styles.detailLabel}>Respuestas correctas</Text>
          <Text style={[styles.detailValue, { color: Colors.success }]}>
            {attempt.correct_answers}
          </Text>
        </View>

        <View style={styles.divider} />

        <View style={styles.detailRow}>
          <View style={styles.detailIcon}>
            <Ionicons name="close-circle" size={20} color={Colors.error} />
          </View>
          <Text style={styles.detailLabel}>Respuestas incorrectas</Text>
          <Text style={[styles.detailValue, { color: Colors.error }]}>
            {attempt.total_questions - attempt.correct_answers}
          </Text>
        </View>

        <View style={styles.divider} />

        <View style={styles.detailRow}>
          <View style={styles.detailIcon}>
            <Ionicons name="help-circle" size={20} color={Colors.gray} />
          </View>
          <Text style={styles.detailLabel}>Total de preguntas</Text>
          <Text style={styles.detailValue}>{attempt.total_questions}</Text>
        </View>

        <View style={styles.divider} />

        <View style={styles.detailRow}>
          <View style={styles.detailIcon}>
            <Ionicons name="calendar" size={20} color={Colors.info} />
          </View>
          <Text style={styles.detailLabel}>Presentado el</Text>
          <Text style={styles.detailValue}>
            {new Date(attempt.submitted_at).toLocaleDateString('es-CO', {
              day: '2-digit', month: 'short', year: 'numeric',
            })}
          </Text>
        </View>
      </View>

      {/* ── RETROALIMENTACIÓN POR PREGUNTA ────────────────────────────────────── */}
      {feedback.length > 0 && (
        <View style={styles.feedbackSection}>
          <Text style={styles.feedbackTitle}>Retroalimentación</Text>
          <Text style={styles.feedbackSubtitle}>
            Revisa en qué preguntas acertaste y en cuáles te equivocaste.
          </Text>

          {feedback.map((q: QuestionResult, index: number) => (
            <View
              key={q.question_id}
              style={[
                styles.questionCard,
                { borderLeftColor: q.is_correct ? Colors.success : Colors.error },
              ]}
            >
              {/* Header de la pregunta */}
              <View style={styles.questionHeader}>
                <View style={[
                  styles.questionBadge,
                  { backgroundColor: (q.is_correct ? Colors.success : Colors.error) + '15' },
                ]}>
                  <Ionicons
                    name={q.is_correct ? 'checkmark-circle' : 'close-circle'}
                    size={16}
                    color={q.is_correct ? Colors.success : Colors.error}
                  />
                  <Text style={[
                    styles.questionBadgeText,
                    { color: q.is_correct ? Colors.success : Colors.error },
                  ]}>
                    {q.is_correct ? 'Correcta' : 'Incorrecta'}
                  </Text>
                </View>
                <Text style={styles.questionNumber}>#{index + 1}</Text>
              </View>

              {/* Enunciado */}
              <Text style={styles.questionStatement}>{q.statement}</Text>

              {/* Tu respuesta */}
              <View style={styles.answerRow}>
                <Text style={styles.answerLabel}>Tu respuesta:</Text>
                <View style={[
                  styles.answerPill,
                  {
                    backgroundColor: q.is_correct ? Colors.success + '12' : Colors.error + '12',
                    borderColor: q.is_correct ? Colors.success + '30' : Colors.error + '30',
                  },
                ]}>
                  <Text style={[
                    styles.answerText,
                    { color: q.is_correct ? Colors.success : Colors.error },
                  ]}>
                    {q.selected_option_text}
                  </Text>
                </View>
              </View>

              {/* Respuesta correcta (solo si la del estudiante fue incorrecta) */}
              {!q.is_correct && (
                <View style={styles.answerRow}>
                  <Text style={styles.answerLabel}>Correcta:</Text>
                  <View style={[styles.answerPill, {
                    backgroundColor: Colors.success + '12',
                    borderColor: Colors.success + '30',
                  }]}>
                    <Ionicons name="checkmark" size={14} color={Colors.success} />
                    <Text style={[styles.answerText, { color: Colors.success }]}>
                      {q.correct_option_text}
                    </Text>
                  </View>
                </View>
              )}
            </View>
          ))}
        </View>
      )}

      {/* Mensaje motivacional */}
      <View style={[styles.motivCard, { backgroundColor: accentColor + '12' }]}>
        <Text style={[styles.motivText, { color: accentColor }]}>
          {passed
            ? '¡Excelente trabajo! Continúa así con el resto de los módulos.'
            : 'No te rindas. Repasa el material y vuelve a intentarlo cuando estés listo.'}
        </Text>
      </View>

      {/* Acciones */}
      <TouchableOpacity
        style={styles.primaryBtn}
        onPress={() => router.back()}
      >
        <Ionicons name="arrow-back" size={18} color="#fff" />
        <Text style={styles.primaryBtnText}>Volver a la Unidad</Text>
      </TouchableOpacity>

      <TouchableOpacity
        style={styles.secondaryBtn}
        onPress={() => router.replace('/(student)' as any)}
      >
        <Text style={styles.secondaryBtnText}>Ir al Inicio</Text>
      </TouchableOpacity>

    </ScrollView>
  );
}

const makeStyles = (isDark: boolean) => StyleSheet.create({
  container:      { flex: 1, backgroundColor: isDark ? '#121212' : Colors.background },
  body:           { padding: 20, gap: 16, paddingBottom: 40 },
  centered:       { flex: 1, justifyContent: 'center', alignItems: 'center', padding: 24, gap: 16 },
  loadingText:    { fontSize: 14, color: isDark ? '#AAAAAA' : Colors.gray },
  errorText:      { fontSize: 16, color: isDark ? '#AAAAAA' : Colors.gray, textAlign: 'center' },
  resultCard: {
    backgroundColor: isDark ? '#1E1E1E' : Colors.surface,
    borderRadius: 20,
    padding: 32,
    alignItems: 'center',
    gap: 10,
    borderWidth: 1.5,
    elevation: 4,
    shadowColor: Colors.dark,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.08,
    shadowRadius: 10,
  },
  resultLabel:    { fontSize: 26, fontWeight: '800' },
  ovaName:        { fontSize: 14, color: isDark ? '#AAAAAA' : Colors.gray, textAlign: 'center', marginBottom: 8 },
  scoreCircle: {
    width: 110, height: 110, borderRadius: 55,
    borderWidth: 5, justifyContent: 'center', alignItems: 'center',
    marginTop: 8,
  },
  scoreNumber:    { fontSize: 38, fontWeight: '900' },
  scoreUnit:      { fontSize: 13, color: isDark ? '#AAAAAA' : Colors.gray, marginTop: -4 },
  detailCard:     { backgroundColor: isDark ? '#1E1E1E' : Colors.surface, borderRadius: 16, padding: 16, borderWidth: 1, borderColor: isDark ? '#2C2C2C' : Colors.window },
  detailTitle:    { fontSize: 15, fontWeight: '700', color: isDark ? '#FFFFFF' : Colors.dark, marginBottom: 12 },
  detailRow:      { flexDirection: 'row', alignItems: 'center', paddingVertical: 10, gap: 12 },
  detailIcon:     { width: 28, alignItems: 'center' },
  detailLabel:    { flex: 1, fontSize: 14, color: isDark ? '#AAAAAA' : Colors.gray },
  detailValue:    { fontSize: 15, fontWeight: '700', color: isDark ? '#FFFFFF' : Colors.dark },
  divider:        { height: 1, backgroundColor: Colors.window },
  // ── Feedback ──
  feedbackSection: { gap: 12 },
  feedbackTitle:   { fontSize: 18, fontWeight: '800', color: isDark ? '#FFFFFF' : Colors.dark },
  feedbackSubtitle:{ fontSize: 13, color: isDark ? '#AAAAAA' : Colors.gray, marginBottom: 4 },
  questionCard: {
    backgroundColor: isDark ? '#1E1E1E' : Colors.surface,
    borderRadius: 14,
    padding: 16,
    borderWidth: 1,
    borderColor: isDark ? '#2C2C2C' : Colors.window,
    borderLeftWidth: 4,
    gap: 12,
  },
  questionHeader:  { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  questionBadge:   { flexDirection: 'row', alignItems: 'center', gap: 6, paddingHorizontal: 10, paddingVertical: 4, borderRadius: 8 },
  questionBadgeText: { fontSize: 12, fontWeight: '700' },
  questionNumber:  { fontSize: 13, fontWeight: '700', color: isDark ? '#AAAAAA' : Colors.gray },
  questionStatement: { fontSize: 15, fontWeight: '600', color: isDark ? '#FFFFFF' : Colors.dark, lineHeight: 22 },
  answerRow:       { gap: 6 },
  answerLabel:     { fontSize: 12, fontWeight: '600', color: isDark ? '#AAAAAA' : Colors.gray },
  answerPill:      { flexDirection: 'row', alignItems: 'center', gap: 6, paddingHorizontal: 12, paddingVertical: 8, borderRadius: 10, borderWidth: 1, alignSelf: 'flex-start' },
  answerText:      { fontSize: 14, fontWeight: '600' },
  // ── Bottom ──
  motivCard:      { borderRadius: 12, padding: 16 },
  motivText:      { fontSize: 14, fontWeight: '600', lineHeight: 20, textAlign: 'center' },
  primaryBtn: {
    flexDirection: 'row', justifyContent: 'center', alignItems: 'center',
    gap: 8, backgroundColor: Colors.primary, borderRadius: 14, padding: 16,
  },
  primaryBtnText: { color: '#fff', fontSize: 16, fontWeight: '700' },
  secondaryBtn:   { borderRadius: 14, padding: 14, alignItems: 'center', borderWidth: 1, borderColor: isDark ? '#2C2C2C' : Colors.window },
  secondaryBtnText: { fontSize: 15, fontWeight: '600', color: isDark ? '#AAAAAA' : Colors.gray },
});