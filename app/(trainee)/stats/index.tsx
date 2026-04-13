import React, { useState } from 'react';
import { View, Text, StyleSheet, ScrollView } from 'react-native';
import { Colors } from '@/src/theme/colors';
import { useAuthStore } from '@/src/store/authStore';
import { useMockDB } from '@/src/store/mockDB';
import { Ionicons } from '@expo/vector-icons';
import SearchableSelect from '@/src/components/ui/searchableSelect';

export default function TraineeStatsScreen() {
  const user = useAuthStore((s) => s.user);
  const getGroupsByTrainee = useMockDB((s) => s.getGroupsByTrainee);
  const getAttemptsByGroup = useMockDB((s) => s.getAttemptsByGroup);
  const getStudentsByGroup = useMockDB((s) => s.getStudentsByGroup);

  const myGroups = user ? getGroupsByTrainee(user.id) : [];
  const [selectedGroupId, setSelectedGroupId] = useState<number | null>(myGroups.length > 0 ? myGroups[0].id : null);

  const selectOptions = myGroups.map(g => ({ id: g.id, description: g.name }));
  const attempts = selectedGroupId ? getAttemptsByGroup(selectedGroupId) : [];
  const students = selectedGroupId ? getStudentsByGroup(selectedGroupId) : [];

  const totalStudents = students.length;
  const totalAttempts = attempts.length;
  const passedAttempts = attempts.filter(a => a.passed).length;
  
  const avgScore = totalAttempts > 0 ? Math.round(attempts.reduce((acc, curr) => acc + curr.score, 0) / totalAttempts) : 0;
  const passRate = totalAttempts > 0 ? Math.round((passedAttempts / totalAttempts) * 100) : 0;

  return (
    <ScrollView style={styles.container} contentContainerStyle={{ padding: 24 }}>
      <View style={styles.header}>
        <Text style={styles.title}>Métricas del Grupo</Text>
        <Text style={styles.subtitle}>Supervisión de rendimiento académico.</Text>
        <View style={{ marginTop: 20 }}>
          <SearchableSelect data={selectOptions} value={selectedGroupId || 0} onSelect={setSelectedGroupId} placeholder="Selecciona un grupo..." />
        </View>
      </View>

      {selectedGroupId ? (
        <View style={styles.metricsGrid}>
          <View style={styles.metricCard}>
            <Ionicons name="people" size={32} color={Colors.info} />
            <Text style={styles.metricValue}>{totalStudents}</Text>
            <Text style={styles.metricLabel}>Alumnos</Text>
          </View>
          <View style={styles.metricCard}>
            <Ionicons name="podium" size={32} color={Colors.success} />
            <Text style={styles.metricValue}>{avgScore}%</Text>
            <Text style={styles.metricLabel}>Promedio</Text>
          </View>
          <View style={[styles.metricCard, { width: '100%' }]}>
            <Ionicons name="checkmark-circle" size={32} color={Colors.primary} />
            <Text style={styles.metricValue}>{passRate}%</Text>
            <Text style={styles.metricLabel}>Tasa de Aprobación de Evaluaciones</Text>
          </View>
        </View>
      ) : (
        <Text style={{ textAlign: 'center', marginTop: 40, color: Colors.gray }}>Selecciona un grupo para ver estadísticas.</Text>
      )}
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: Colors.background },
  header: { marginBottom: 24, paddingTop: 20 },
  title: { fontSize: 28, fontWeight: '800', color: Colors.dark },
  subtitle: { fontSize: 15, color: Colors.gray, marginTop: 4 },
  metricsGrid: { flexDirection: 'row', flexWrap: 'wrap', justifyContent: 'space-between', gap: 16 },
  metricCard: { backgroundColor: Colors.surface, width: '47%', padding: 20, borderRadius: 16, alignItems: 'center', elevation: 2, borderWidth: 1, borderColor: Colors.window },
  metricValue: { fontSize: 26, fontWeight: '900', color: Colors.dark, marginTop: 12 },
  metricLabel: { fontSize: 13, color: Colors.gray, marginTop: 4, textAlign: 'center', fontWeight: '500' }
});