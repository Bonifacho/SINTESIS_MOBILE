// app/settings/notifications.tsx
// Preferencias de notificación con toggles coherentes por rol.
// Docente: actividad del grupo, comunicados.
// Estudiante: nuevas evaluaciones, mensajes del docente, recordatorios.
// Practicante: solo comunicados y modo no molestar (solo lectura de actividad).

import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, Switch, TouchableOpacity, ScrollView } from 'react-native';
import { useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { getColors } from '@/src/theme/colors';
import { useThemeStore } from '@/src/store/themeStore';
import { useAuthStore } from '@/src/store/authStore';
import * as SecureStore from 'expo-secure-store';
import Toast from 'react-native-toast-message';

const STORE_KEY = 'sintesis_notifications_prefs';

// ── Definición de toggles por rol ────────────────────────────────────────────
interface ToggleDef {
  key: string;
  icon: string;
  title: string;
  description: string;
  defaultValue: boolean;
  roles: string[]; // qué roles ven este toggle
}

const ALL_TOGGLES: ToggleDef[] = [
  {
    key: 'announcements',
    icon: 'megaphone-outline',
    title: 'Anuncios generales',
    description: 'Comunicados importantes de la institución',
    defaultValue: true,
    roles: ['docente', 'estudiante', 'practicante'],
  },
  {
    key: 'evaluations',
    icon: 'book-outline',
    title: 'Nuevas evaluaciones',
    description: 'Avisos cuando el docente publica un examen en tu materia',
    defaultValue: true,
    roles: ['estudiante'], // Solo el estudiante "recibe" evaluaciones
  },
  {
    key: 'studentActivity',
    icon: 'pulse-outline',
    title: 'Actividad de estudiantes',
    description: 'Cuando un estudiante abre un OVA o inicia un examen',
    defaultValue: false,
    roles: ['docente', 'practicante'], // El docente/practicante monitorea a los estudiantes
  },
  {
    key: 'messages',
    icon: 'chatbubble-outline',
    title: 'Mensajes del docente',
    description: 'Respuestas y comentarios a tus actividades enviadas',
    defaultValue: true,
    roles: ['estudiante'], // Solo el estudiante recibe mensajes del docente
  },
  {
    key: 'reminders',
    icon: 'notifications-outline',
    title: 'Recordatorios',
    description: 'Alertas antes de la fecha límite de entrega',
    defaultValue: false,
    roles: ['estudiante'], // Solo el estudiante tiene fechas límite
  },
  {
    key: 'dnd',
    icon: 'moon-outline',
    title: 'Modo no molestar',
    description: 'Silenciar todas las notificaciones de 10pm a 6am',
    defaultValue: false,
    roles: ['docente', 'estudiante', 'practicante'],
  },
];

export default function NotificationsConfigScreen() {
  const router = useRouter();
  const { isDark } = useThemeStore();
  const { user } = useAuthStore();
  const Colors = getColors(isDark);

  const userRole = user?.role ?? 'estudiante';

  // Solo los toggles relevantes para el rol actual
  const visibleToggles = ALL_TOGGLES.filter((t) => t.roles.includes(userRole));

  // Estado inicial: construido desde los defaultValues de los toggles visibles
  const buildDefaultPrefs = () => {
    const defaults: Record<string, boolean> = {};
    ALL_TOGGLES.forEach((t) => { defaults[t.key] = t.defaultValue; });
    return defaults;
  };

  const [prefs, setPrefs] = useState<Record<string, boolean>>(buildDefaultPrefs);

  useEffect(() => {
    const loadPrefs = async () => {
      try {
        const stored = await SecureStore.getItemAsync(STORE_KEY);
        if (stored) {
          const parsed = JSON.parse(stored);
          setPrefs((prev) => ({ ...prev, ...parsed }));
        }
      } catch (e) {
        console.error('Error loading notification preferences', e);
      }
    };
    loadPrefs();
  }, []);

  const togglePref = async (key: string) => {
    const newPrefs = { ...prefs, [key]: !prefs[key] };
    setPrefs(newPrefs);
    try {
      await SecureStore.setItemAsync(STORE_KEY, JSON.stringify(newPrefs));
      Toast.show({
        type: 'success',
        text1: 'Preferencias guardadas',
        text2: 'Tus ajustes han sido actualizados.',
        position: 'bottom',
      });
    } catch (e) {
      console.error('Error saving notification preferences', e);
      Toast.show({
        type: 'error',
        text1: 'Error',
        text2: 'No se pudieron guardar las preferencias.',
        position: 'bottom',
      });
    }
  };

  const styles = StyleSheet.create({
    container:      { flex: 1, backgroundColor: Colors.background },
    header:         { flexDirection: 'row', alignItems: 'center', paddingTop: 48, paddingHorizontal: 16, paddingBottom: 16, backgroundColor: Colors.surface, borderBottomWidth: 1, borderBottomColor: Colors.window },
    backButton:     { marginRight: 16 },
    headerTitle:    { fontSize: 20, fontWeight: '700', color: Colors.dark },
    content:        { padding: 20 },
    subtitle:       { fontSize: 14, color: Colors.gray, marginBottom: 20, paddingHorizontal: 4 },
    card:           { backgroundColor: Colors.surface, borderRadius: 20, borderWidth: 1, borderColor: Colors.window, overflow: 'hidden' },
    row:            { flexDirection: 'row', alignItems: 'center', paddingVertical: 16, paddingHorizontal: 16, gap: 12 },
    iconContainer:  { width: 40, height: 40, borderRadius: 12, backgroundColor: Colors.background, justifyContent: 'center', alignItems: 'center' },
    textContainer:  { flex: 1 },
    toggleTitle:    { fontSize: 15, fontWeight: '700', color: Colors.dark, marginBottom: 2 },
    description:    { fontSize: 12, color: Colors.gray, lineHeight: 16 },
    divider:        { height: 1, backgroundColor: Colors.window, marginLeft: 68 },
    footerText:     { textAlign: 'center', fontSize: 12, color: Colors.gray, marginTop: 24, paddingHorizontal: 20 },
    roleChip:       { alignSelf: 'center', marginBottom: 16, backgroundColor: Colors.primary + '15', paddingHorizontal: 14, paddingVertical: 5, borderRadius: 20 },
    roleChipText:   { fontSize: 12, fontWeight: '700', color: Colors.primary, letterSpacing: 0.5 },
  });

  const roleLabel: Record<string, string> = {
    docente: 'Configuración para DOCENTE',
    estudiante: 'Configuración para ESTUDIANTE',
    practicante: 'Configuración para PRACTICANTE',
  };

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity style={styles.backButton} onPress={() => router.back()}>
          <Ionicons name="chevron-back" size={24} color={Colors.dark} />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Notificaciones</Text>
      </View>

      <ScrollView contentContainerStyle={styles.content}>
        {/* Chip de rol */}
        <View style={styles.roleChip}>
          <Text style={styles.roleChipText}>{roleLabel[userRole] ?? 'Configuración'}</Text>
        </View>

        <Text style={styles.subtitle}>
          Elige qué avisos quieres recibir según tu rol en la plataforma.
        </Text>

        <View style={styles.card}>
          {visibleToggles.map((toggle, index) => (
            <React.Fragment key={toggle.key}>
              <View style={styles.row}>
                <View style={styles.iconContainer}>
                  <Ionicons name={toggle.icon as any} size={22} color={Colors.dark} />
                </View>
                <View style={styles.textContainer}>
                  <Text style={styles.toggleTitle}>{toggle.title}</Text>
                  <Text style={styles.description}>{toggle.description}</Text>
                </View>
                <Switch
                  value={!!prefs[toggle.key]}
                  onValueChange={() => togglePref(toggle.key)}
                  trackColor={{ false: Colors.window, true: Colors.primary }}
                  thumbColor="#fff"
                />
              </View>
              {index < visibleToggles.length - 1 && <View style={styles.divider} />}
            </React.Fragment>
          ))}
        </View>

        <Text style={styles.footerText}>
          Puedes cambiar estas preferencias en cualquier momento.
        </Text>
      </ScrollView>
    </View>
  );
}
