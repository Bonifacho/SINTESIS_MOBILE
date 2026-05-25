import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, FlatList, ActivityIndicator } from 'react-native';
import { useLocalSearchParams } from 'expo-router';
import { Colors } from '@/src/theme/colors';
import { useAuthStore } from '@/src/store/authStore';
import { academicApi } from '@/src/api/academic';
import { Ionicons } from '@expo/vector-icons';
import SearchableSelect from '@/src/components/ui/searchableSelect';
import type { AcademicGroup, EnrolledStudent } from '@/src/models/academic';

export default function TeacherStudents() {
  const { preselectedGroup } = useLocalSearchParams<{ preselectedGroup?: string }>();
  const user = useAuthStore((s) => s.user);

  const [groups, setGroups] = useState<AcademicGroup[]>([]);
  const [students, setStudents] = useState<EnrolledStudent[]>([]);
  const [selectedGroupId, setSelectedGroupId] = useState<number | null>(null);
  const [loadingGroups, setLoadingGroups] = useState(true);
  const [loadingStudents, setLoadingStudents] = useState(false);

  // Cargar grupos del docente
  useEffect(() => {
    if (!user?.id) return;
    const fetchGroups = async () => {
      try {
        setLoadingGroups(true);
        const res = await academicApi.getUserGroups(user.id);
        const fetched: AcademicGroup[] = res.data.data;
        setGroups(fetched);
        // Preseleccionar: parámetro de navegación o primer grupo
        const preId = preselectedGroup ? Number(preselectedGroup) : null;
        setSelectedGroupId(preId ?? (fetched.length > 0 ? fetched[0].id : null));
      } catch (err) {
        console.error('[Students] Error cargando grupos:', err);
      } finally {
        setLoadingGroups(false);
      }
    };
    fetchGroups();
  }, [user?.id]);

  // Actualizar selección si llega un preselectedGroup por navegación
  useEffect(() => {
    if (preselectedGroup) setSelectedGroupId(Number(preselectedGroup));
  }, [preselectedGroup]);

  // Cargar estudiantes cuando cambia el grupo
  useEffect(() => {
    if (!selectedGroupId) { setStudents([]); return; }
    const fetchStudents = async () => {
      try {
        setLoadingStudents(true);
        const res = await academicApi.getGroupEnrollments(selectedGroupId);
        setStudents(res.data.data);
      } catch (err) {
        console.error('[Students] Error cargando estudiantes:', err);
        setStudents([]);
      } finally {
        setLoadingStudents(false);
      }
    };
    fetchStudents();
  }, [selectedGroupId]);

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
        <Text style={styles.title}>Directorio de Estudiantes</Text>
        <Text style={styles.subtitle}>Selecciona un grupo para ver tus alumnos matriculados.</Text>

        <View style={{ marginTop: 16 }}>
          <SearchableSelect
            data={selectOptions}
            value={selectedGroupId || 0}
            onSelect={(id) => setSelectedGroupId(id)}
            placeholder="Selecciona un grupo..."
          />
        </View>
      </View>

      {loadingStudents ? (
        <View style={styles.centered}>
          <ActivityIndicator size="large" color={Colors.primary} />
        </View>
      ) : (
        <FlatList
          data={students}
          keyExtractor={(item) => item.id.toString()}
          contentContainerStyle={styles.list}
          ListEmptyComponent={() => (
            <View style={styles.empty}>
              <Ionicons name="people-outline" size={48} color={Colors.window} />
              <Text style={styles.emptyText}>No hay estudiantes en este grupo.</Text>
            </View>
          )}
          renderItem={({ item }) => (
            <View style={styles.card}>
              <View style={styles.avatar}>
                <Text style={styles.avatarText}>{(item.full_name || item.username || '?').charAt(0).toUpperCase()}</Text>
              </View>
              <View style={styles.info}>
                <Text style={styles.name}>{item.full_name || 'Sin nombre'}</Text>
                <Text style={styles.username}>@{item.username || 'usuario'}</Text>
              </View>
            </View>
          )}
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
  card: { flexDirection: 'row', alignItems: 'center', backgroundColor: Colors.surface, padding: 16, borderRadius: 12, borderWidth: 1, borderColor: Colors.window },
  avatar: { width: 44, height: 44, borderRadius: 22, backgroundColor: Colors.primary + '15', justifyContent: 'center', alignItems: 'center', marginRight: 14 },
  avatarText: { color: Colors.primary, fontSize: 18, fontWeight: '700' },
  info: { flex: 1 },
  name: { fontSize: 16, fontWeight: '600', color: Colors.dark },
  username: { fontSize: 13, color: Colors.gray, marginTop: 2 },
});