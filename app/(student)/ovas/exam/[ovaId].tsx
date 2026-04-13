import React, { useState } from 'react';
import {
  View, Text, StyleSheet, TouchableOpacity,
  ScrollView, Alert, ActivityIndicator,
} from 'react-native';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { Colors } from '@/src/theme/colors';
import { useAuthStore } from '@/src/store/authStore';
import { useMockDB } from '@/src/store/mockDB';

export default function ExamScreen() {
  const router  = useRouter();
  const user    = useAuthStore((s) => s.user);
  const { ovaId } = useLocalSearchParams<{ ovaId: string }>();

  const getQuestionsByOva = useMockDB((s) => s.getQuestionsByOva);
  const getOvaById        = useMockDB((s) => s.getOvaById);
  const registerAttempt   = useMockDB((s) => s.registerAttempt);

  const ova       = getOvaById(Number(ovaId));
  const questions = getQuestionsByOva(Number(ovaId));

  const [currentIndex, setCurrentIndex] = useState(0);
  const [answers, setAnswers]           = useState<Record<number, number>>({});
  const [submitting, setSubmitting]     = useState(false);

  const currentQ    = questions[currentIndex];
  const totalQ      = questions.length;
  const isLast      = currentIndex === totalQ - 1;
  const isAnswered  = currentQ ? answers[currentQ.id] !== undefined : false;
  const progress    = totalQ > 0 ? ((currentIndex + 1) / totalQ) * 100 : 0;

  if (!ova || totalQ === 0) {
    return (
      <View style={styles.centered}>
        <Ionicons name="alert-circle-outline" size={52} color={Colors.warning} />
        <Text style={styles.errorText}>Examen no disponible.</Text>
        <TouchableOpacity style={styles.backBtn} onPress={() => router.replace('/(student)/subjects')}>
          <Text style={styles.backBtnText}>Volver a Materias</Text>
        </TouchableOpacity>
      </View>
    );
  }

  if (!currentQ) {
    return (
      <View style={styles.centered}>
        <ActivityIndicator size="large" color={Colors.primary} />
      </View>
    );
  }

  const handleSelectOption = (optionId: number) => {
    setAnswers((prev) => ({ ...prev, [currentQ.id]: optionId }));
  };

  const handleNext = () => {
    if (!isAnswered) {
      Alert.alert('Atención', 'Debes elegir una opción antes de continuar.');
      return;
    }
    setCurrentIndex((prev) => (prev < totalQ - 1 ? prev + 1 : prev));
  };

  // NUEVO: Función para retroceder y corregir
  const handlePrev = () => {
    setCurrentIndex((prev) => (prev > 0 ? prev - 1 : prev));
  };

  const handleSubmit = async () => {
    if (!isAnswered) {
      Alert.alert('Atención', 'Selecciona una respuesta para la última pregunta.');
      return;
    }
    Alert.alert(
      'Enviar Examen',
      '¿Estás seguro? Tus respuestas serán guardadas.',
      [
        { text: 'Revisar', style: 'cancel' },
        {
          text: 'Enviar',
          onPress: async () => {
            setSubmitting(true);
            await new Promise((r) => setTimeout(r, 700));

            const formattedAnswers = Object.entries(answers).map(
              ([qId, optId]) => ({
                question_id:        Number(qId),
                selected_option_id: optId,
              })
            );

            const attempt = registerAttempt(Number(ovaId), user!.id, formattedAnswers);
            setSubmitting(false);
            
            router.replace(`/(student)/ovas/exam/result/${attempt.id}` as any);
          },
        },
      ]
    );
  };

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => router.replace('/(student)/subjects')} style={styles.closeBtn}>
          <Ionicons name="close" size={26} color={Colors.gray} />
        </TouchableOpacity>
        <View style={{ flex: 1 }}>
          <Text style={styles.examTitle} numberOfLines={1}>{ova.title}</Text>
          <Text style={styles.examSub}>Pregunta {currentIndex + 1} de {totalQ}</Text>
        </View>
      </View>

      <View style={styles.progressTrack}>
        <View style={[styles.progressFill, { width: `${progress}%` }]} />
      </View>

      <ScrollView contentContainerStyle={styles.body} showsVerticalScrollIndicator={false}>
        <View style={styles.questionCard}>
          <Text style={styles.questionText}>{currentQ.statement}</Text>
        </View>

        {currentQ.options.map((opt) => {
          const selected = answers[currentQ.id] === opt.id;
          return (
            <TouchableOpacity
              key={opt.id}
              style={[styles.option, selected && styles.optionSelected]}
              onPress={() => handleSelectOption(opt.id)}
              activeOpacity={0.7}
            >
              <View style={[styles.optionCircle, selected && styles.optionCircleSelected]}>
                {selected && <Ionicons name="checkmark" size={14} color="#fff" />}
              </View>
              <Text style={[styles.optionText, selected && styles.optionTextSelected]}>{opt.text}</Text>
            </TouchableOpacity>
          );
        })}
      </ScrollView>

      {/* NUEVO: Layout del pie de página con botones de Anterior y Siguiente */}
      <View style={styles.footer}>
        {currentIndex > 0 ? (
          <TouchableOpacity style={styles.actionBtnSecondary} onPress={handlePrev}>
            <Ionicons name="arrow-back" size={18} color={Colors.dark} />
            <Text style={styles.actionBtnSecondaryText}>Anterior</Text>
          </TouchableOpacity>
        ) : <View style={{ width: 80 }} />}

        {!isLast ? (
          <TouchableOpacity style={[styles.actionBtn, !isAnswered && styles.actionBtnDisabled]} onPress={handleNext}>
            <Text style={styles.actionBtnText}>Siguiente</Text>
            <Ionicons name="arrow-forward" size={18} color="#fff" />
          </TouchableOpacity>
        ) : (
          <TouchableOpacity
            style={[styles.actionBtn, styles.submitBtn, (!isAnswered || submitting) && styles.actionBtnDisabled]}
            onPress={handleSubmit}
            disabled={submitting}
          >
            {submitting ? <ActivityIndicator color="#fff" /> : (
              <>
                <Text style={styles.actionBtnText}>Enviar</Text>
                <Ionicons name="send" size={18} color="#fff" />
              </>
            )}
          </TouchableOpacity>
        )}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container:           { flex: 1, backgroundColor: Colors.background },
  centered:            { flex: 1, justifyContent: 'center', alignItems: 'center', padding: 24, gap: 16 },
  errorText:           { fontSize: 16, color: Colors.gray, textAlign: 'center' },
  backBtn:             { backgroundColor: Colors.primary, borderRadius: 10, paddingHorizontal: 24, paddingVertical: 12 },
  backBtnText:         { color: '#fff', fontWeight: '700' },
  header:              { flexDirection: 'row', alignItems: 'center', padding: 16, paddingTop: 48, backgroundColor: Colors.surface, borderBottomWidth: 1, borderBottomColor: Colors.window, gap: 12 },
  closeBtn:            { padding: 4 },
  examTitle:           { fontSize: 16, fontWeight: '700', color: Colors.dark },
  examSub:             { fontSize: 13, color: Colors.gray, marginTop: 2 },
  progressTrack:       { height: 4, backgroundColor: Colors.window },
  progressFill:        { height: 4, backgroundColor: Colors.primary, borderRadius: 2 },
  body:                { padding: 20, gap: 12 },
  questionCard:        { backgroundColor: Colors.surface, borderRadius: 16, padding: 20, borderWidth: 1, borderColor: Colors.window, marginBottom: 8 },
  questionText:        { fontSize: 17, fontWeight: '600', color: Colors.dark, lineHeight: 26 },
  option:              { flexDirection: 'row', alignItems: 'center', gap: 14, backgroundColor: Colors.surface, borderRadius: 12, padding: 16, borderWidth: 1.5, borderColor: Colors.window },
  optionSelected:      { borderColor: Colors.primary, backgroundColor: Colors.primary + '0A' },
  optionCircle:        { width: 22, height: 22, borderRadius: 11, borderWidth: 2, borderColor: Colors.gray, justifyContent: 'center', alignItems: 'center' },
  optionCircleSelected:{ borderColor: Colors.primary, backgroundColor: Colors.primary },
  optionText:          { flex: 1, fontSize: 15, color: Colors.dark },
  optionTextSelected:  { color: Colors.primary, fontWeight: '600' },
  footer:              { flexDirection: 'row', justifyContent: 'space-between', padding: 16, paddingBottom: 28, backgroundColor: Colors.surface, borderTopWidth: 1, borderTopColor: Colors.window },
  actionBtnSecondary:  { flexDirection: 'row', alignItems: 'center', gap: 6, backgroundColor: Colors.window, borderRadius: 12, paddingVertical: 12, paddingHorizontal: 16 },
  actionBtnSecondaryText:{ color: Colors.dark, fontSize: 15, fontWeight: '600' },
  actionBtn:           { flexDirection: 'row', alignItems: 'center', gap: 6, backgroundColor: Colors.primary, borderRadius: 12, paddingVertical: 12, paddingHorizontal: 20 },
  actionBtnDisabled:   { opacity: 0.4 },
  actionBtnText:       { color: '#fff', fontSize: 15, fontWeight: '700' },
  submitBtn:           { backgroundColor: Colors.success },
});