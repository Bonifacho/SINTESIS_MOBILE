import React, { useEffect, useState } from 'react';
import { View, Text, StyleSheet, FlatList, ActivityIndicator } from 'react-native';
import { Colors } from '@/src/theme/colors';
import { useAuthStore } from '@/src/store/authStore';
import { academicApi } from '@/src/api/academic';
import { Ionicons } from '@expo/vector-icons';
import SearchableSelect from '@/src/components/ui/searchableSelect';
import type { AcademicGroup, ExamAttempt, EnrolledStudent } from '@/src/models/academic';

export default function TeacherResultsScreen() {
  const user = useAuthStore((s) => s.user);

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
  const studentMap = new Map(students.map(s => [s.id, s]));

  const selectOptions = groups.map(g => ({ id: g.id, description: g.name }));

  if (loadingGroups) {
    return (
      <View style={styles.centered}>
        <ActivityIndicator size="large" color={Colors.primary} />
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.title}>Auditoría de Evaluaciones</Text>
        <Text style={styles.subtitle}>Monitorea el rendimiento de tus estudiantes.</Text>

        <View style={{ marginTop: 16 }}>
          <SearchableSelect
            data={selectOptions}
            value={selectedGroupId || 0}
            onSelect={(id) => setSelectedGroupId(id)}
            placeholder="Selecciona un grupo..."
          />
        </View>
      </View>

      {loadingAttempts ? (
        <View style={styles.centered}>
          <ActivityIndicator size="large" color={Colors.primary} />
        </View>
      ) : (
        <FlatList
          data={attempts}
          keyExtractor={(item) => item.attempt_id.toString()}
          contentContainerStyle={styles.list}
          ListEmptyComponent={() => (
            <View style={styles.empty}>
              <Ionicons name="document-text-outline" size={48} color={Colors.window} />
              <Text style={styles.emptyText}>No hay evaluaciones registradas aún.</Text>
            </View>
          )}
          renderItem={({ item }) => {
            const passed = item.passed;
            const color = passed ? Colors.success : Colors.error;
            // Resolvemos nombre del estudiante con el mapa de matrículas
            const student = studentMap.get(item.student_id);

            return (
              <View style={styles.card}>
                <View style={styles.cardHeader}>
                  <View style={{ flex: 1 }}>
                    <Text style={styles.studentName}>{student?.full_name ?? `Estudiante #${item.student_id}`}</Text>
                    <Text style={styles.ovaName}>Examen #{item.exam_id}</Text>
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
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: Colors.background },
  centered: { flex: 1, justifyContent: 'center', alignItems: 'center' },
  header: { padding: 24, backgroundColor: Colors.surface, borderBottomWidth: 1, borderBottomColor: Colors.window },
  title: { fontSize: 24, fontWeight: '700', color: Colors.dark },
  subtitle: { fontSize: 14, color: Colors.gray, marginTop: 4 },
  list: { padding: 16, gap: 12 },
  empty: { alignItems: 'center', marginTop: 60 },
  emptyText: { fontSize: 16, color: Colors.gray, marginTop: 12, fontStyle: 'italic' },
  card: { backgroundColor: Colors.surface, borderRadius: 12, padding: 16, borderWidth: 1, borderColor: Colors.window },
  cardHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 12 },
  studentName: { fontSize: 16, fontWeight: '700', color: Colors.dark },
  ovaName: { fontSize: 13, color: Colors.gray, marginTop: 2 },
  scoreBadge: { paddingHorizontal: 10, paddingVertical: 4, borderRadius: 12 },
  scoreText: { fontSize: 14, fontWeight: '700' },
  cardFooter: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', paddingTop: 12, borderTopWidth: 1, borderTopColor: Colors.window },
  dateText: { fontSize: 12, color: Colors.gray },
  statusText: { fontSize: 13, fontWeight: '600' },
});