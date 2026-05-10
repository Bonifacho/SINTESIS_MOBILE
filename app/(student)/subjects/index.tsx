import React, { useEffect, useState } from 'react';
import {
  View, Text, StyleSheet, FlatList, TouchableOpacity, ActivityIndicator,
} from 'react-native';
import { useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { Colors } from '@/src/theme/colors';
import { useAuthStore } from '@/src/store/authStore';
import { academicApi } from '@/src/api/academic';
import type { AcademicGroup } from '@/src/models/academic';

export default function SubjectsScreen() {
  const router = useRouter();
  const user   = useAuthStore((s) => s.user);

  const [groups, setGroups] = useState<AcademicGroup[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!user?.id) return;

    const fetchGroups = async () => {
      try {
        setLoading(true);
        setError(null);
        const res = await academicApi.getUserGroups(user.id);
        setGroups(res.data.data);
      } catch (err) {
        console.error('[Subjects] Error cargando materias:', err);
        setError('No se pudieron cargar tus materias.');
      } finally {
        setLoading(false);
      }
    };

    fetchGroups();
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
        <Text style={styles.title}>Mis Asignaturas</Text>
        <Text style={styles.subtitle}>
          Selecciona una materia para acceder a su contenido interactivo.
        </Text>
      </View>

      <FlatList
        data={groups}
        keyExtractor={(item) => String(item.id)}
        contentContainerStyle={styles.list}
        showsVerticalScrollIndicator={false}
        ListEmptyComponent={() => (
          <View style={styles.empty}>
            <Ionicons name="school-outline" size={48} color={Colors.gray} />
            <Text style={styles.emptyText}>No tienes materias asignadas.</Text>
          </View>
        )}
        renderItem={({ item }) => (
          <TouchableOpacity
            style={styles.card}
            activeOpacity={0.75}
            onPress={() =>
              router.push({
                pathname: '/(student)/ovas',
                params: { groupId: item.id, name: item.name },
              })
            }
          >
            <View style={styles.cardHeader}>
              <View style={styles.iconBox}>
                <Ionicons name="flask" size={24} color={Colors.primary} />
              </View>
              <View style={{ flex: 1 }}>
                <Text style={styles.cardTitle}>{item.name}</Text>
                <Text style={styles.cardSub}>{item.description}</Text>
              </View>
            </View>
            <View style={styles.cardFooter}>
              <Text style={styles.footerText}>Ver OVAs Disponibles</Text>
              <Ionicons name="chevron-forward" size={18} color={Colors.secondary} />
            </View>
          </TouchableOpacity>
        )}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container:  { flex: 1, backgroundColor: Colors.background },
  centered:   { flex: 1, justifyContent: 'center', alignItems: 'center', gap: 12 },
  errorText:  { fontSize: 15, color: Colors.error, textAlign: 'center', paddingHorizontal: 24 },
  header:     { padding: 24, backgroundColor: Colors.surface, borderBottomWidth: 1, borderBottomColor: Colors.window },
  title:      { fontSize: 24, fontWeight: 'bold', color: Colors.dark, marginBottom: 4 },
  subtitle:   { fontSize: 14, color: Colors.gray, lineHeight: 20 },
  list:       { padding: 16, gap: 14 },
  empty:      { alignItems: 'center', paddingTop: 60, gap: 12 },
  emptyText:  { fontSize: 15, color: Colors.gray, fontStyle: 'italic' },
  card: {
    backgroundColor: Colors.surface,
    borderRadius: 16,
    padding: 18,
    borderWidth: 1,
    borderColor: Colors.window,
    elevation: 3,
    shadowColor: Colors.dark,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.06,
    shadowRadius: 8,
  },
  cardHeader:  { flexDirection: 'row', alignItems: 'center', gap: 14, marginBottom: 14 },
  iconBox:     { width: 48, height: 48, borderRadius: 12, backgroundColor: Colors.primary + '15', justifyContent: 'center', alignItems: 'center' },
  cardTitle:   { fontSize: 17, fontWeight: '700', color: Colors.dark },
  cardSub:     { fontSize: 13, color: Colors.gray, marginTop: 3, lineHeight: 18 },
  cardFooter:  { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', paddingTop: 12, borderTopWidth: 1, borderTopColor: Colors.window },
  footerText:  { fontSize: 14, fontWeight: '600', color: Colors.secondary },
});