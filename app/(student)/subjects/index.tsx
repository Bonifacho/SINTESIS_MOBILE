import { useThemeStore } from '@/src/store/themeStore';
import React, { useEffect, useState } from 'react';
import {
  View, Text, StyleSheet, FlatList, TouchableOpacity, ActivityIndicator, TextInput, RefreshControl,
} from 'react-native';
import { useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { Colors } from '@/src/theme/colors';
import { useAuthStore } from '@/src/store/authStore';
import { academicApi } from '@/src/api/academic';
import type { AcademicGroup } from '@/src/models/academic';

export default function SubjectsScreen() {
  const isDark = useThemeStore((s) => s.isDark);
  const styles = makeStyles(isDark);
  const router = useRouter();
  const user   = useAuthStore((s) => s.user);

  const [groups, setGroups] = useState<AcademicGroup[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState('');

  const fetchGroups = async () => {
    if (!user?.id) return;
    try {
      setError(null);
        const res = await academicApi.getUserGroups(user.id);
        setGroups(res.data.data);
      } catch (err) {
        console.error('[Subjects] Error cargando materias:', err);
        setError('No se pudieron cargar tus materias.');
      }
    };

  useEffect(() => {
    setLoading(true);
    fetchGroups().finally(() => setLoading(false));
  }, [user?.id]);

  const onRefresh = async () => {
    setRefreshing(true);
    await fetchGroups();
    setRefreshing(false);
  };

  const filteredGroups = groups.filter(g => 
    g.name.toLowerCase().includes(searchQuery.toLowerCase())
  );

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
        <TouchableOpacity style={styles.retryBtn} onPress={fetchGroups}>
          <Text style={styles.retryBtnText}>Reintentar conexión</Text>
        </TouchableOpacity>
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
        
        {/* Buscador Local */}
        <View style={styles.searchContainer}>
          <Ionicons name="search" size={20} color={Colors.gray} />
          <TextInput
            style={styles.searchInput}
            placeholder="Buscar por nombre o descripción..."
            placeholderTextColor={Colors.gray}
            value={searchQuery}
            onChangeText={setSearchQuery}
          />
          {searchQuery.length > 0 && (
            <TouchableOpacity onPress={() => setSearchQuery('')}>
              <Ionicons name="close-circle" size={20} color={Colors.gray} />
            </TouchableOpacity>
          )}
        </View>
      </View>

      <FlatList
        data={filteredGroups}
        keyExtractor={(item) => String(item.id)}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={onRefresh} colors={[Colors.primary]} />
        }
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
                <Text style={styles.cardSub}>Progreso del grupo</Text>
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

const makeStyles = (isDark: boolean) => StyleSheet.create({
  container:  { flex: 1, backgroundColor: isDark ? '#121212' : Colors.background },
  centered:   { flex: 1, justifyContent: 'center', alignItems: 'center', gap: 12 },
  errorText:  { fontSize: 15, color: Colors.error, textAlign: 'center', paddingHorizontal: 24 },
  retryBtn:   { marginTop: 12, backgroundColor: Colors.primary, paddingHorizontal: 20, paddingVertical: 10, borderRadius: 12 },
  retryBtnText: { color: Colors.surface, fontSize: 14, fontWeight: 'bold' },
  header:     { padding: 24, backgroundColor: isDark ? '#1E1E1E' : Colors.surface, borderBottomWidth: 1, borderBottomColor: isDark ? '#2C2C2C' : Colors.window },
  title:      { fontSize: 24, fontWeight: 'bold', color: isDark ? '#FFFFFF' : Colors.dark, marginBottom: 4 },
  subtitle:   { fontSize: 14, color: isDark ? '#AAAAAA' : Colors.gray, lineHeight: 20, marginBottom: 16 },
  searchContainer: {
    flexDirection: 'row', alignItems: 'center', backgroundColor: isDark ? '#121212' : Colors.background,
    borderRadius: 12, paddingHorizontal: 12, height: 44, borderWidth: 1, borderColor: isDark ? '#2C2C2C' : Colors.window,
  },
  searchInput: { flex: 1, marginLeft: 8, fontSize: 15, color: isDark ? '#FFFFFF' : Colors.dark },
  list:       { padding: 16, gap: 14 },
  empty:      { alignItems: 'center', paddingTop: 60, gap: 12 },
  emptyText:  { fontSize: 15, color: isDark ? '#AAAAAA' : Colors.gray, fontStyle: 'italic' },
  card: {
    backgroundColor: isDark ? '#1E1E1E' : Colors.surface,
    borderRadius: 16,
    padding: 18,
    borderWidth: 1,
    borderColor: isDark ? '#2C2C2C' : Colors.window,
    elevation: 3,
    shadowColor: Colors.dark,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.06,
    shadowRadius: 8,
  },
  cardHeader:  { flexDirection: 'row', alignItems: 'center', gap: 14, marginBottom: 14 },
  iconBox:     { width: 48, height: 48, borderRadius: 12, backgroundColor: Colors.primary + '15', justifyContent: 'center', alignItems: 'center' },
  cardTitle:   { fontSize: 17, fontWeight: '700', color: isDark ? '#FFFFFF' : Colors.dark },
  cardSub:     { fontSize: 13, color: isDark ? '#AAAAAA' : Colors.gray, marginTop: 3, lineHeight: 18 },
  cardFooter:  { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', paddingTop: 12, borderTopWidth: 1, borderTopColor: isDark ? '#2C2C2C' : Colors.window },
  footerText:  { fontSize: 14, fontWeight: '600', color: Colors.secondary },
});