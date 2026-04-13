import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, FlatList } from 'react-native';
import { useLocalSearchParams } from 'expo-router';
import { Colors } from '@/src/theme/colors';
import { useAuthStore } from '@/src/store/authStore';
import { useMockDB } from '@/src/store/mockDB';
import { Ionicons } from '@expo/vector-icons';
import SearchableSelect from '@/src/components/ui/searchableSelect';

export default function TeacherStudents() {
  // <-- Atrapamos el parámetro que nos manda el Inicio
  const { preselectedGroup } = useLocalSearchParams<{ preselectedGroup?: string }>();
  
  const user = useAuthStore((s) => s.user);
  const getGroupsByTeacher = useMockDB((s) => s.getGroupsByTeacher);
  const getStudentsByGroup = useMockDB((s) => s.getStudentsByGroup);

  const myGroups = user ? getGroupsByTeacher(user.id) : [];
  
  const [selectedGroupId, setSelectedGroupId] = useState<number | null>(
    myGroups.length > 0 ? myGroups[0].id : null
  );

  // <-- AQUÍ LA MAGIA: Si nos enviaron un ID desde el inicio, actualizamos el selector
  useEffect(() => {
    if (preselectedGroup) {
      setSelectedGroupId(Number(preselectedGroup));
    }
  }, [preselectedGroup]);

  const students = selectedGroupId ? getStudentsByGroup(selectedGroupId) : [];
  const selectOptions = myGroups.map(g => ({ id: g.id, description: g.name }));

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
              <Text style={styles.avatarText}>{item.full_name.charAt(0).toUpperCase()}</Text>
            </View>
            <View style={styles.info}>
              <Text style={styles.name}>{item.full_name}</Text>
              <Text style={styles.username}>@{item.username}</Text>
            </View>
          </View>
        )}
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
  card: { flexDirection: 'row', alignItems: 'center', backgroundColor: Colors.surface, padding: 16, borderRadius: 12, borderWidth: 1, borderColor: Colors.window },
  avatar: { width: 44, height: 44, borderRadius: 22, backgroundColor: Colors.primary + '15', justifyContent: 'center', alignItems: 'center', marginRight: 14 },
  avatarText: { color: Colors.primary, fontSize: 18, fontWeight: '700' },
  info: { flex: 1 },
  name: { fontSize: 16, fontWeight: '600', color: Colors.dark },
  username: { fontSize: 13, color: Colors.gray, marginTop: 2 },
});