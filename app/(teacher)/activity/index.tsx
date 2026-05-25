// app/(teacher)/activity/index.tsx
// Funcionalidad 16 — Tracking Silencioso: Visualización de Auditoría de Actividad
// El docente selecciona un grupo y ve un timeline cronológico de lo que hicieron
// sus estudiantes (qué OVA abrieron, cuándo iniciaron un examen, etc.)

import React, { useEffect, useState, useCallback } from 'react';
import {
  View, Text, StyleSheet, FlatList, ActivityIndicator, TouchableOpacity,
} from 'react-native';
import { useAuthStore } from '@/src/store/authStore';
import { useThemeStore } from '@/src/store/themeStore';
import { getColors } from '@/src/theme/colors';
import { academicApi } from '@/src/api/academic';
import { Ionicons } from '@expo/vector-icons';
import SearchableSelect from '@/src/components/ui/searchableSelect';
import { useRouter } from 'expo-router';

// ── Traducción de acciones técnicas → lenguaje amigable ─────────────────────
interface ActionDef {
  label: string;
  icon: string;
  colorKey: 'primary' | 'success' | 'warning' | 'info' | 'secondary';
}

const ACTION_MAP: Record<string, ActionDef> = {
  resource_opened: {
    label: 'Revisó material de estudio',
    icon: 'document-text-outline',
    colorKey: 'info',
  },
  exam_started: {
    label: 'Inició una evaluación',
    icon: 'create-outline',
    colorKey: 'warning',
  },
  exam_opened: {
    label: 'Abrió el examen',
    icon: 'eye-outline',
    colorKey: 'primary',
  },
};

const DEFAULT_ACTION: ActionDef = {
  label: 'Realizó una acción',
  icon: 'flash-outline',
  colorKey: 'secondary',
};

// ── Tipos ────────────────────────────────────────────────────────────────────
interface ActivityRecord {
  user_id: number;
  student_name: string;
  ova_id: number;
  ova_title: string;
  topic_name?: string;
  resource_name?: string;
  action: string;
  timestamp: string | null;
}

interface AcademicGroup {
  id: number;
  name: string;
}

// ── Formateador de fecha ─────────────────────────────────────────────────────
function formatTimestamp(isoStr: string | null): string {
  if (!isoStr) return 'Fecha desconocida';
  const d = new Date(isoStr);
  return d.toLocaleString('es-CO', {
    day: '2-digit', month: 'short', year: 'numeric',
    hour: '2-digit', minute: '2-digit',
  });
}

// ── Componente ───────────────────────────────────────────────────────────────
export default function TeacherActivityScreen() {
  const router = useRouter();
  const { user } = useAuthStore();
  const { isDark } = useThemeStore();
  const C = getColors(isDark);
  const styles = makeStyles(isDark, C);

  const [groups, setGroups] = useState<AcademicGroup[]>([]);
  const [selectedGroupId, setSelectedGroupId] = useState<number | null>(null);
  const [activity, setActivity] = useState<ActivityRecord[]>([]);
  const [loadingGroups, setLoadingGroups] = useState(true);
  const [loadingActivity, setLoadingActivity] = useState(false);

  // Cargar grupos del docente al montar
  useEffect(() => {
    if (!user?.id) return;
    const fetchGroups = async () => {
      try {
        setLoadingGroups(true);
        const res = await academicApi.getUserGroups(user.id);
        const fetched: AcademicGroup[] = res.data.data;
        setGroups(fetched);
        // Pre-seleccionar el primer grupo por defecto
        if (fetched.length > 0) setSelectedGroupId(fetched[0].id);
      } catch (e) {
        console.error('[Activity] Error cargando grupos:', e);
      } finally {
        setLoadingGroups(false);
      }
    };
    fetchGroups();
  }, [user?.id]);

  // Cargar actividad cuando cambia el grupo seleccionado
  const fetchActivity = useCallback(async (groupId: number) => {
    try {
      setLoadingActivity(true);
      setActivity([]);
      const res = await academicApi.getGroupActivity(groupId);
      setActivity(res.data.data ?? []);
    } catch (e) {
      console.error('[Activity] Error cargando actividad:', e);
      setActivity([]);
    } finally {
      setLoadingActivity(false);
    }
  }, []);

  useEffect(() => {
    if (selectedGroupId) fetchActivity(selectedGroupId);
  }, [selectedGroupId, fetchActivity]);

  // ── Renders ───────────────────────────────────────────────────────────────

  if (loadingGroups) {
    return (
      <View style={styles.centered}>
        <ActivityIndicator size="large" color={C.primary} />
        <Text style={styles.loadingText}>Cargando grupos...</Text>
      </View>
    );
  }

  if (groups.length === 0) {
    return (
      <View style={styles.centered}>
        <Ionicons name="people-outline" size={56} color={C.gray} />
        <Text style={styles.emptyTitle}>Sin grupos asignados</Text>
        <Text style={styles.emptySubtitle}>
          Aún no tienes grupos asignados. Solicita al administrador que te asigne uno.
        </Text>
      </View>
    );
  }

  const selectOptions = groups.map((g) => ({ id: g.id, description: g.name }));
  const selectedGroupName = groups.find((g) => g.id === selectedGroupId)?.name ?? '';

  const renderActivityItem = ({ item, index }: { item: ActivityRecord; index: number }) => {
    const def = ACTION_MAP[item.action] ?? DEFAULT_ACTION;
    const actionColor = C[def.colorKey];
    const isLast = index === activity.length - 1;

    return (
      <View style={styles.cardContainer}>
        {/* Línea de tiempo + ícono */}
        <View style={styles.timelineLeft}>
          <View style={[styles.iconCircle, { backgroundColor: actionColor + '20' }]}>
            <Ionicons name={def.icon as any} size={20} color={actionColor} />
          </View>
          {!isLast && <View style={styles.timelineLine} />}
        </View>

        {/* Tarjeta de contenido */}
        <View style={styles.cardContent}>
          <Text style={styles.studentName}>{item.student_name}</Text>
          <Text style={[styles.actionLabel, { color: actionColor }]}>{def.label}</Text>
          {item.topic_name && (
            <Text style={styles.ovaTitle}>
              Unidad: <Text style={styles.ovaTitleBold}>{item.topic_name}</Text>
            </Text>
          )}
          <Text style={styles.ovaTitle}>
            OVA: <Text style={styles.ovaTitleBold}>{item.ova_title}</Text>
          </Text>
          {item.resource_name && (
            <Text style={styles.ovaTitle}>
              Recurso: <Text style={styles.ovaTitleBold}>{item.resource_name}</Text>
            </Text>
          )}
          <Text style={styles.timestamp}>
            <Ionicons name="time-outline" size={11} color={C.gray} /> {formatTimestamp(item.timestamp)}
          </Text>
        </View>
      </View>
    );
  };

  return (
    <View style={styles.container}>
      {/* Encabezado con botón volver y selector de grupo */}
      <View style={styles.header}>
        <TouchableOpacity style={{ flexDirection: 'row', alignItems: 'center', marginBottom: 12 }} onPress={() => router.push('/(teacher)/results')}>
          <Ionicons name="chevron-back" size={24} color={isDark ? '#FFFFFF' : C.dark} />
          <Text style={{ fontSize: 16, fontWeight: '600', color: isDark ? '#FFFFFF' : C.dark }}>Volver</Text>
        </TouchableOpacity>
        
        <Text style={styles.title}>Actividad del Grupo</Text>
        <Text style={styles.subtitle}>
          Monitorea en tiempo real lo que hacen tus estudiantes.
        </Text>
        <SearchableSelect
          data={selectOptions}
          value={selectedGroupId ?? 0}
          onSelect={(id) => setSelectedGroupId(id)}
          placeholder="Selecciona un grupo..."
        />
        {!loadingActivity && (
          <View style={styles.countBadge}>
            <Ionicons name="pulse-outline" size={14} color={C.gray} />
            <Text style={styles.countText}>
              {activity.length} evento{activity.length !== 1 ? 's' : ''} registrado{activity.length !== 1 ? 's' : ''} · {selectedGroupName}
            </Text>
          </View>
        )}
      </View>

      {/* Cuerpo: loading, vacío o timeline */}
      {loadingActivity ? (
        <View style={styles.centered}>
          <ActivityIndicator size="large" color={C.primary} />
          <Text style={styles.loadingText}>Cargando actividad...</Text>
        </View>
      ) : (
        <FlatList
          data={activity}
          keyExtractor={(_, i) => i.toString()}
          contentContainerStyle={styles.list}
          ListEmptyComponent={
            <View style={styles.emptyContainer}>
              <Ionicons name="bar-chart-outline" size={64} color={C.window} />
              <Text style={styles.emptyTitle}>Sin actividad registrada</Text>
              <Text style={styles.emptySubtitle}>
                Los estudiantes de <Text style={{ fontWeight: '700', color: C.dark }}>{selectedGroupName}</Text> aún no han interactuado con ningún OVA o examen.
              </Text>
              <TouchableOpacity
                style={styles.retryBtn}
                onPress={() => selectedGroupId && fetchActivity(selectedGroupId)}
              >
                <Text style={styles.retryBtnText}>Actualizar</Text>
              </TouchableOpacity>
            </View>
          }
          renderItem={renderActivityItem}
        />
      )}
    </View>
  );
}

const makeStyles = (isDark: boolean, C: any) => StyleSheet.create({
  container:      { flex: 1, backgroundColor: isDark ? '#121212' : '#FFFFFF' },
  header:         { padding: 24, paddingTop: 48, backgroundColor: isDark ? '#1E1E1E' : C.surface, borderBottomWidth: 1, borderBottomColor: isDark ? '#2C2C2C' : '#E5E5EA' },
  title:          { fontSize: 24, fontWeight: '700', color: isDark ? '#FFFFFF' : C.dark },
  subtitle:       { fontSize: 14, color: isDark ? '#AAAAAA' : C.gray, marginTop: 4, marginBottom: 16 },
  centered:       { flex: 1, justifyContent: 'center', alignItems: 'center', gap: 12, backgroundColor: isDark ? '#121212' : '#FFFFFF' },
  loadingText:    { fontSize: 14, color: isDark ? '#AAAAAA' : C.gray },
  list:           { padding: 16, paddingBottom: 32, gap: 0 },
  // Timeline card
  cardContainer:  { flexDirection: 'row', gap: 12, marginBottom: 8 },
  timelineLeft:   { alignItems: 'center', width: 40 },
  iconCircle:     { width: 40, height: 40, borderRadius: 20, justifyContent: 'center', alignItems: 'center' },
  timelineLine:   { flex: 1, width: 2, backgroundColor: isDark ? '#2C2C2C' : '#E5E5EA', marginTop: 4 },
  cardContent:    { flex: 1, backgroundColor: isDark ? '#1E1E1E' : C.surface, borderRadius: 12, padding: 14, borderWidth: 1, borderColor: isDark ? '#2C2C2C' : '#E5E5EA', marginBottom: 4 },
  studentName:    { fontSize: 15, fontWeight: '700', color: isDark ? '#FFFFFF' : C.dark },
  actionLabel:    { fontSize: 13, fontWeight: '500', marginTop: 2 },
  ovaTitle:       { fontSize: 12, color: isDark ? '#AAAAAA' : C.gray, marginTop: 4 },
  ovaTitleBold:   { fontWeight: '600', color: isDark ? '#FFFFFF' : C.dark },
  timestamp:      { fontSize: 11, color: isDark ? '#AAAAAA' : C.gray, marginTop: 6 },
  // Empty state
  emptyContainer: { alignItems: 'center', marginTop: 60, gap: 12, paddingHorizontal: 32 },
  emptyTitle:     { fontSize: 18, fontWeight: '700', color: isDark ? '#FFFFFF' : C.dark, textAlign: 'center' },
  emptySubtitle:  { fontSize: 14, color: isDark ? '#AAAAAA' : C.gray, textAlign: 'center', lineHeight: 20 },
  // Retry button
  retryBtn:       { marginTop: 8, paddingHorizontal: 20, paddingVertical: 10, backgroundColor: C.primary, borderRadius: 12 },
  retryBtnText:   { color: '#fff', fontWeight: '700', fontSize: 14 },
  // Header badge
  countBadge:     { marginTop: 8, flexDirection: 'row', alignItems: 'center', gap: 6 },
  countText:      { fontSize: 12, color: isDark ? '#AAAAAA' : C.gray },
});
