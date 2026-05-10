import React, { useEffect, useState } from 'react';
import {
  View, Text, StyleSheet, TouchableOpacity, ScrollView, ActivityIndicator,
} from 'react-native';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { Colors } from '@/src/theme/colors';
import { academicApi } from '@/src/api/academic';
import type { ExamAttempt } from '@/src/models/academic';

export default function ExamResultScreen() {
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
          onPress={() => router.replace('/(student)/subjects' as any)}
        >
          <Text style={styles.primaryBtnText}>Ir a Materias</Text>
        </TouchableOpacity>
      </View>
    );
  }

  const passed      = attempt.passed;
  const accentColor = passed ? Colors.success : Colors.error;
  const icon        = passed ? 'checkmark-circle' : 'close-circle';
  const label       = passed ? '¡Aprobado!' : 'No aprobado';

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
        onPress={() => router.replace('/(student)/subjects' as any)}
      >
        <Ionicons name="arrow-back" size={18} color="#fff" />
        <Text style={styles.primaryBtnText}>Volver a Materias</Text>
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

const styles = StyleSheet.create({
  container:      { flex: 1, backgroundColor: Colors.background },
  body:           { padding: 20, gap: 16, paddingBottom: 40 },
  centered:       { flex: 1, justifyContent: 'center', alignItems: 'center', padding: 24, gap: 16 },
  loadingText:    { fontSize: 14, color: Colors.gray },
  errorText:      { fontSize: 16, color: Colors.gray, textAlign: 'center' },
  resultCard: {
    backgroundColor: Colors.surface,
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
  ovaName:        { fontSize: 14, color: Colors.gray, textAlign: 'center', marginBottom: 8 },
  scoreCircle: {
    width: 110, height: 110, borderRadius: 55,
    borderWidth: 5, justifyContent: 'center', alignItems: 'center',
    marginTop: 8,
  },
  scoreNumber:    { fontSize: 38, fontWeight: '900' },
  scoreUnit:      { fontSize: 13, color: Colors.gray, marginTop: -4 },
  detailCard:     { backgroundColor: Colors.surface, borderRadius: 16, padding: 16, borderWidth: 1, borderColor: Colors.window },
  detailTitle:    { fontSize: 15, fontWeight: '700', color: Colors.dark, marginBottom: 12 },
  detailRow:      { flexDirection: 'row', alignItems: 'center', paddingVertical: 10, gap: 12 },
  detailIcon:     { width: 28, alignItems: 'center' },
  detailLabel:    { flex: 1, fontSize: 14, color: Colors.gray },
  detailValue:    { fontSize: 15, fontWeight: '700', color: Colors.dark },
  divider:        { height: 1, backgroundColor: Colors.window },
  motivCard:      { borderRadius: 12, padding: 16 },
  motivText:      { fontSize: 14, fontWeight: '600', lineHeight: 20, textAlign: 'center' },
  primaryBtn: {
    flexDirection: 'row', justifyContent: 'center', alignItems: 'center',
    gap: 8, backgroundColor: Colors.primary, borderRadius: 14, padding: 16,
  },
  primaryBtnText: { color: '#fff', fontSize: 16, fontWeight: '700' },
  secondaryBtn:   { borderRadius: 14, padding: 14, alignItems: 'center', borderWidth: 1, borderColor: Colors.window },
  secondaryBtnText: { fontSize: 15, fontWeight: '600', color: Colors.gray },
});