import React, { useState } from 'react';
import { View, Text, StyleSheet, FlatList } from 'react-native';
import { Colors } from '@/src/theme/colors';
import { useAuthStore } from '@/src/store/authStore';
import { useMockDB } from '@/src/store/mockDB';
import { Ionicons } from '@expo/vector-icons';
import SearchableSelect from '@/src/components/ui/searchableSelect';

export default function TeacherResultsScreen() {
  const user = useAuthStore((s) => s.user);
  const getGroupsByTeacher = useMockDB((s) => s.getGroupsByTeacher);
  const getAttemptsByGroup = useMockDB((s) => s.getAttemptsByGroup);
  const getUserById = useMockDB((s) => s.getUserById);
  const getOvaById = useMockDB((s) => s.getOvaById);

  const myGroups = user ? getGroupsByTeacher(user.id) : [];
  const [selectedGroupId, setSelectedGroupId] = useState<number | null>(myGroups.length > 0 ? myGroups[0].id : null);

  const attempts = selectedGroupId ? getAttemptsByGroup(selectedGroupId) : [];
  const selectOptions = myGroups.map(g => ({ id: g.id, description: g.name }));

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

      <FlatList
        data={attempts}
        keyExtractor={(item) => item.id.toString()}
        contentContainerStyle={styles.list}
        ListEmptyComponent={() => (
          <View style={styles.empty}>
            <Ionicons name="document-text-outline" size={48} color={Colors.window} />
            <Text style={styles.emptyText}>No hay evaluaciones registradas aún.</Text>
          </View>
        )}
        renderItem={({ item }) => {
          const student = getUserById(item.student_id);
          const ova = getOvaById(item.ova_id);
          const passed = item.passed;
          const color = passed ? Colors.success : Colors.error;

          return (
            <View style={styles.card}>
              <View style={styles.cardHeader}>
                <View style={{ flex: 1 }}>
                  <Text style={styles.studentName}>{student?.full_name}</Text>
                  <Text style={styles.ovaName}>{ova?.title}</Text>
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
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: Colors.background },
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