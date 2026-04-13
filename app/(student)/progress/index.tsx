import React from 'react';
import { View, Text, StyleSheet, ScrollView } from 'react-native';
import { Colors } from '@/src/theme/colors';
import { useAuthStore } from '@/src/store/authStore';
import { useMockDB } from '@/src/store/mockDB';
import { Ionicons } from '@expo/vector-icons';

export default function StudentProgressScreen() {
  const user = useAuthStore((s) => s.user);
  const getGroupsByStudent = useMockDB((s) => s.getGroupsByStudent);
  const getTopicsByGroup = useMockDB((s) => s.getTopicsByGroup);
  const getOvasByTopic = useMockDB((s) => s.getOvasByTopic);
  const getAttemptsByStudent = useMockDB((s) => s.getAttemptsByStudent);

  const myGroups = getGroupsByStudent(user?.id || 0);
  const myAttempts = getAttemptsByStudent(user?.id || 0);

  return (
    <ScrollView style={styles.container} contentContainerStyle={styles.content}>
      <View style={styles.header}>
        <Text style={styles.title}>Mi Rendimiento</Text>
        <Text style={styles.subtitle}>Métricas de tu avance académico</Text>
      </View>

      {myGroups.map((group) => {
        const topics = getTopicsByGroup(group.id);
        let totalExams = 0;
        
        topics.forEach(t => {
          totalExams += getOvasByTopic(t.id).filter(o => o.has_exam).length;
        });

        const groupAttempts = myAttempts.filter(a => {
          const ova = useMockDB.getState().getOvaById(a.ova_id);
          return topics.some(t => t.id === ova?.topic_id);
        });

        const passedExams = new Set(groupAttempts.filter(a => a.passed).map(a => a.ova_id)).size;
        const progressPercent = totalExams > 0 ? (passedExams / totalExams) * 100 : 0;
        
        const avgScore = groupAttempts.length > 0 
          ? Math.round(groupAttempts.reduce((sum, a) => sum + a.score, 0) / groupAttempts.length) 
          : 0;

        return (
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
        );
      })}
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: Colors.background },
  content: { padding: 24, gap: 16 },
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