import { useThemeStore } from '@/src/store/themeStore';
import React, { useState, useEffect, useMemo } from 'react';
import { View, Text, StyleSheet, ActivityIndicator, TextInput } from 'react-native';
import { useLocalSearchParams } from 'expo-router';
import { Colors } from '@/src/theme/colors';
import { useAuthStore } from '@/src/store/authStore';
import { academicApi } from '@/src/api/academic';
import { Ionicons } from '@expo/vector-icons';
import SearchableSelect from '@/src/components/ui/searchableSelect';
import PaginatedList from '@/src/components/ui/PaginatedList';
import type { AcademicGroup, EnrolledStudent } from '@/src/models/academic';

export default function TraineeStudents() {
  const isDark = useThemeStore((s) => s.isDark);
  const styles = makeStyles(isDark);
  const { preselectedGroup } = useLocalSearchParams<{ preselectedGroup?: string }>();
  const user = useAuthStore((s) => s.user);

  const [groups, setGroups] = useState<AcademicGroup[]>([]);
  const [students, setStudents] = useState<EnrolledStudent[]>([]);
  const [selectedGroupId, setSelectedGroupId] = useState<number | null>(null);
  const [loadingGroups, setLoadingGroups] = useState(true);
  const [loadingStudents, setLoadingStudents] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');

  // Cargar grupos del practicante
  useEffect(() => {
    if (!user?.id) return;
    const fetchGroups = async () => {
      try {
        setLoadingGroups(true);
        const res = await academicApi.getUserGroups(user.id);
        const fetched: AcademicGroup[] = res.data.data;
        setGroups(fetched);
        const preId = preselectedGroup ? Number(preselectedGroup) : null;
        setSelectedGroupId(preId ?? (fetched.length > 0 ? fetched[0].id : null));
      } catch (err) {
        console.error('[TraineeStudents] Error cargando grupos:', err);
      } finally {
        setLoadingGroups(false);
      }
    };
    fetchGroups();
  }, [user?.id]);

  // Actualizar selección desde navegación
  useEffect(() => {
    if (preselectedGroup) setSelectedGroupId(Number(preselectedGroup));
  }, [preselectedGroup]);

  // Cargar estudiantes (solo lectura)
  useEffect(() => {
    if (!selectedGroupId) { setStudents([]); return; }
    const fetchStudents = async () => {
      try {
        setLoadingStudents(true);
        const res = await academicApi.getGroupEnrollments(selectedGroupId);
        setStudents(res.data.data);
      } catch (err) {
        console.error('[TraineeStudents] Error cargando estudiantes:', err);
        setStudents([]);
      } finally {
        setLoadingStudents(false);
      }
    };
    fetchStudents();
  }, [selectedGroupId]);

  // Filtrado local de estudiantes
  const filteredStudents = useMemo(() => {
    if (!searchQuery.trim()) return students;
    const lowerQ = searchQuery.toLowerCase();
    return students.filter(s => 
      (s.full_name && s.full_name.toLowerCase().includes(lowerQ)) ||
      (s.username && s.username.toLowerCase().includes(lowerQ))
    );
  }, [students, searchQuery]);

  const selectOptions = groups.map(g => ({ id: g.id, description: g.name }));

  if (loadingGroups) {
    return (
      <View style={styles.centered}>
        <ActivityIndicator size="large" color={Colors.info} />
      </View>
    );
  }

  const renderHeader = () => (
    <View style={styles.header}>
      <Text style={styles.title}>Directorio (Solo Lectura)</Text>
      <Text style={styles.subtitle}>Observa el listado de alumnos del grupo seleccionado.</Text>
      <View style={{ marginTop: 16, gap: 12 }}>
        <SearchableSelect 
          data={selectOptions} 
          value={selectedGroupId || 0} 
          onSelect={(id) => {
            setSelectedGroupId(id);
            setSearchQuery('');
          }} 
          placeholder="Selecciona un grupo..." 
        />
        {selectedGroupId && students.length > 0 && (
          <View style={styles.searchContainer}>
            <Ionicons name="search" size={20} color={isDark ? '#AAAAAA' : Colors.gray} style={{ marginRight: 8 }} />
            <TextInput
              style={styles.searchInput}
              placeholder="Buscar estudiante..."
              placeholderTextColor={isDark ? '#555' : Colors.gray}
              value={searchQuery}
              onChangeText={setSearchQuery}
              autoCapitalize="none"
              autoCorrect={false}
            />
          </View>
        )}
      </View>
    </View>
  );

  return (
    <View style={styles.container}>
      <PaginatedList
        data={loadingStudents || !selectedGroupId ? [] : filteredStudents}
        keyExtractor={(item) => item.id.toString()}
        pageSize={10}
        contentContainerStyle={styles.list}
        ListHeaderComponent={renderHeader()}
        ListEmptyComponent={() => (
          <View style={styles.empty}>
            {loadingStudents ? (
              <ActivityIndicator size="large" color={Colors.info} />
            ) : !selectedGroupId ? (
              <Text style={styles.emptyText}>Selecciona un grupo primero.</Text>
            ) : (
              <>
                <Ionicons name="people-outline" size={48} color={isDark ? '#2C2C2C' : Colors.window} />
                <Text style={styles.emptyText}>
                  {searchQuery ? "No se encontraron estudiantes con ese nombre." : "No hay estudiantes en este grupo."}
                </Text>
              </>
            )}
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
    </View>
  );
}

const makeStyles = (isDark: boolean) => StyleSheet.create({
  container: { flex: 1, backgroundColor: isDark ? '#121212' : Colors.background },
  centered: { flex: 1, justifyContent: 'center', alignItems: 'center' },
  header: { padding: 24, paddingBottom: 16 },
  title: { fontSize: 24, fontWeight: '700', color: isDark ? '#FFFFFF' : Colors.dark },
  subtitle: { fontSize: 14, color: isDark ? '#AAAAAA' : Colors.gray, marginTop: 4 },
  searchContainer: { flexDirection: 'row', alignItems: 'center', backgroundColor: isDark ? '#121212' : '#F5F5F7', paddingHorizontal: 12, borderRadius: 10, borderWidth: 1, borderColor: isDark ? '#2C2C2C' : '#E5E5EA', height: 48 },
  searchInput: { flex: 1, color: isDark ? '#FFF' : Colors.dark, fontSize: 15, paddingVertical: 0, height: '100%' },
  list: { paddingBottom: 16, gap: 12 },
  empty: { alignItems: 'center', marginTop: 60 },
  emptyText: { fontSize: 16, color: isDark ? '#AAAAAA' : Colors.gray, marginTop: 12, fontStyle: 'italic', textAlign: 'center' },
  card: { marginHorizontal: 24, flexDirection: 'row', alignItems: 'center', backgroundColor: isDark ? '#1E1E1E' : Colors.surface, padding: 16, borderRadius: 12, borderWidth: 1, borderColor: isDark ? '#2C2C2C' : Colors.window },
  avatar: { width: 44, height: 44, borderRadius: 22, backgroundColor: Colors.info + '15', justifyContent: 'center', alignItems: 'center', marginRight: 14 },
  avatarText: { color: Colors.info, fontSize: 18, fontWeight: '700' },
  info: { flex: 1 },
  name: { fontSize: 16, fontWeight: '600', color: isDark ? '#FFFFFF' : Colors.dark },
  username: { fontSize: 13, color: isDark ? '#AAAAAA' : Colors.gray, marginTop: 2 },
});