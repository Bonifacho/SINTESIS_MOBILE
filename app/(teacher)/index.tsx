import { useThemeStore } from '@/src/store/themeStore';
import React, { useEffect, useState } from 'react';
import { View, Text, StyleSheet, FlatList, TouchableOpacity, ActivityIndicator } from 'react-native';
import { useRouter } from 'expo-router';
import { Colors } from '@/src/theme/colors';
import { useAuthStore } from '@/src/store/authStore';
import { academicApi } from '@/src/api/academic';
import { Ionicons } from '@expo/vector-icons';
import type { AcademicGroup, EnrolledStudent } from '@/src/models/academic';

export default function TeacherGroupsScreen() {
  const isDark = useThemeStore((s) => s.isDark);
  const styles = makeStyles(isDark);
  const router = useRouter();
  const { user } = useAuthStore();

  const [groups, setGroups] = useState<AcademicGroup[]>([]);
  const [studentCounts, setStudentCounts] = useState<Record<number, number>>({});
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!user?.id) return;

    const fetchData = async () => {
      try {
        setLoading(true);
        setError(null);
        const res = await academicApi.getUserGroups(user.id);
        const fetchedGroups: AcademicGroup[] = res.data.data;
        setGroups(fetchedGroups);

        // Obtener conteo de estudiantes por grupo en paralelo
        const counts: Record<number, number> = {};
        await Promise.all(
          fetchedGroups.map(async (g) => {
            try {
              const enrollRes = await academicApi.getGroupEnrollments(g.id);
              counts[g.id] = (enrollRes.data.data as EnrolledStudent[]).length;
            } catch {
              counts[g.id] = 0;
            }
          })
        );
        setStudentCounts(counts);
      } catch (err) {
        console.error('[TeacherHome] Error cargando grupos:', err);
        setError('No se pudieron cargar tus grupos.');
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [user?.id]);

  if (loading) {
    return (
      <View style={styles.centered}>
        <ActivityIndicator size="large" color={Colors.primary} />
      </View>
    );
  }

  if (error) {
    return (
      <View style={styles.centered}>
        <Ionicons name="cloud-offline-outline" size={48} color={Colors.error} />
        <Text style={styles.errorText}>{error}</Text>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.title}>Mis Grupos Asignados</Text>
        <Text style={styles.subtitle}>Selecciona un grupo para administrar su contenido.</Text>
      </View>
      
      <FlatList
        data={groups}
        keyExtractor={(item) => item.id.toString()}
        contentContainerStyle={{ padding: 16, gap: 16 }}
        ListEmptyComponent={() => (
          <View style={styles.centered}>
            <Ionicons name="folder-open-outline" size={48} color={Colors.gray} />
            <Text style={styles.emptyText}>No tienes grupos asignados.</Text>
          </View>
        )}
        renderItem={({ item }) => {
          const studentCount = studentCounts[item.id] ?? 0;
          return (
            <TouchableOpacity 
              style={styles.card} 
              activeOpacity={0.8}
              onPress={() => router.push({ pathname: '/(teacher)/students', params: { preselectedGroup: item.id } })}
            >
              <View style={styles.cardHeader}>
                <Ionicons name="folder-open" size={24} color={Colors.primary} />
                <Text style={styles.cardTitle}>{item.name}</Text>
              </View>
              <View style={styles.cardFooter}>
                <Text style={styles.studentCount}>{studentCount} Estudiantes inscritos</Text>
                <Ionicons name="chevron-forward" size={20} color={Colors.gray} />
              </View>
            </TouchableOpacity>
          );
        }}
      />
    </View>
  );
}

const makeStyles = (isDark: boolean) => StyleSheet.create({
  container: { flex: 1, backgroundColor: isDark ? '#121212' : Colors.background },
  centered: { flex: 1, justifyContent: 'center', alignItems: 'center', gap: 12 },
  errorText: { fontSize: 15, color: Colors.error, textAlign: 'center', paddingHorizontal: 24 },
  emptyText: { fontSize: 15, color: isDark ? '#AAAAAA' : Colors.gray, fontStyle: 'italic' },
  header: { padding: 24, backgroundColor: isDark ? '#1E1E1E' : Colors.surface, borderBottomWidth: 1, borderBottomColor: isDark ? '#2C2C2C' : Colors.window },
  title: { fontSize: 24, fontWeight: 'bold', color: isDark ? '#FFFFFF' : Colors.dark, marginBottom: 4 },
  subtitle: { fontSize: 14, color: isDark ? '#AAAAAA' : Colors.gray },
  card: { backgroundColor: isDark ? '#1E1E1E' : Colors.surface, borderRadius: 12, padding: 16, borderWidth: 1, borderColor: isDark ? '#2C2C2C' : Colors.window, elevation: 2 },
  cardHeader: { flexDirection: 'row', alignItems: 'center', marginBottom: 8, gap: 10 },
  cardTitle: { fontSize: 18, fontWeight: 'bold', color: isDark ? '#FFFFFF' : Colors.dark },
  cardDesc: { fontSize: 14, color: isDark ? '#AAAAAA' : Colors.gray, marginBottom: 16, lineHeight: 20 },
  cardFooter: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', borderTopWidth: 1, borderTopColor: isDark ? '#2C2C2C' : Colors.window, paddingTop: 12 },
  studentCount: { fontSize: 13, fontWeight: '600', color: Colors.secondary }
});