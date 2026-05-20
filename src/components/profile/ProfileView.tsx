// src/components/profile/ProfileView.tsx
// Componente de perfil compartido entre los 3 roles.
// Sigue el diseño de Lovable adaptado a light mode + React Native.

import React, { useMemo } from 'react';
import {
  View, Text, StyleSheet, ScrollView, TouchableOpacity, Alert,
} from 'react-native';
import { useRouter } from 'expo-router';
import { useAuthStore } from '@/src/store/authStore';
import { authApi } from '@/src/api/auth';
import { Colors } from '@/src/theme/colors';
import { Ionicons } from '@expo/vector-icons';
import Toast from 'react-native-toast-message';

// ── Tipos ──────────────────────────────────────────────────────────────────────
export interface StatItem {
  value: string | number;
  label: string;
  color?: string;
}

interface ProfileViewProps {
  /** Stats específicos del rol para la sección RESUMEN */
  stats?: StatItem[];
  /** Si true, muestra badge "Solo Lectura" (practicante) */
  readOnly?: boolean;
  /** Label largo del rol (ej: "PRACTICANTE EN OBSERVACIÓN") */
  roleLabel?: string;
}

// ── Mapa de colores por rol ────────────────────────────────────────────────────
const ROLE_COLORS: Record<string, string> = {
  docente: Colors.primary,
  estudiante: Colors.primary,
  practicante: Colors.info,
};

// ── Componente ─────────────────────────────────────────────────────────────────
export default function ProfileView({ stats, readOnly, roleLabel }: ProfileViewProps) {
  const router = useRouter();
  const { user, clearAuth } = useAuthStore();

  const initials = useMemo(() => {
    if (!user?.full_name) return 'U';
    return user.full_name
      .split(' ')
      .map((n) => n[0])
      .join('')
      .toUpperCase()
      .slice(0, 2);
  }, [user?.full_name]);

  const roleColor = ROLE_COLORS[user?.role ?? 'estudiante'];
  const displayRole = roleLabel ?? user?.role?.toUpperCase() ?? 'USUARIO';

  const handleLogout = () => {
    Alert.alert('Cerrar sesión', '¿Estás seguro de que deseas salir?', [
      { text: 'Cancelar', style: 'cancel' },
      {
        text: 'Salir',
        style: 'destructive',
        onPress: async () => {
          try { await authApi.logout(); } catch (_) {}
          finally {
            await clearAuth();
            router.replace('/(auth)/login');
          }
        },
      },
    ]);
  };

  const handleComingSoon = (feature: string) => {
    Toast.show({
      type: 'info',
      text1: 'Próximamente',
      text2: `${feature} estará disponible en una futura actualización.`,
      visibilityTime: 2500,
    });
  };

  return (
    <ScrollView
      style={styles.container}
      contentContainerStyle={styles.content}
      showsVerticalScrollIndicator={false}
    >
      {/* ── HEADER: Avatar + Nombre + Rol ───────────────────────────────────── */}
      <View style={styles.heroCard}>
        <View style={[styles.avatar, { backgroundColor: roleColor }]}>
          <Text style={styles.avatarText}>{initials}</Text>
          {/* Ícono de cámara deshabilitado (funcionalidad futura) */}
          <View style={styles.cameraIcon}>
            <Ionicons name="camera-outline" size={14} color={Colors.gray} />
          </View>
        </View>

        <Text style={styles.name}>{user?.full_name ?? user?.username}</Text>

        <View style={[styles.roleBadge, { backgroundColor: roleColor + '18' }]}>
          <Text style={[styles.roleText, { color: roleColor }]}>{displayRole}</Text>
        </View>

        {readOnly && (
          <View style={styles.readOnlyBadge}>
            <Ionicons name="eye-outline" size={12} color={Colors.info} />
            <Text style={styles.readOnlyText}>Solo Lectura</Text>
          </View>
        )}

        <Text style={styles.username}>@{user?.username}</Text>
      </View>

      {/* ── INFORMACIÓN PERSONAL ────────────────────────────────────────────── */}
      <View style={styles.card}>
        <Text style={styles.sectionLabel}>INFORMACIÓN PERSONAL</Text>

        <View style={styles.infoRow}>
          <View style={styles.infoIcon}>
            <Ionicons name="card-outline" size={20} color={Colors.gray} />
          </View>
          <View style={{ flex: 1 }}>
            <Text style={styles.infoLabel}>Documento de identidad</Text>
            <Text style={styles.infoValue}>{user?.document_id ?? '—'}</Text>
          </View>
        </View>

        <View style={styles.divider} />

        <View style={styles.infoRow}>
          <View style={styles.infoIcon}>
            <Ionicons name="mail-outline" size={20} color={Colors.gray} />
          </View>
          <View style={{ flex: 1 }}>
            <Text style={styles.infoLabel}>Correo electrónico</Text>
            <Text style={styles.infoValue}>{user?.email || 'No registrado'}</Text>
          </View>
        </View>

        <View style={styles.divider} />

        <View style={styles.infoRow}>
          <View style={styles.infoIcon}>
            <Ionicons name="calendar-outline" size={20} color={Colors.gray} />
          </View>
          <View style={{ flex: 1 }}>
            <Text style={styles.infoLabel}>Fecha de registro</Text>
            <Text style={styles.infoValue}>
              {user?.created_at
                ? new Date(user.created_at).toLocaleDateString('es-CO', { day: 'numeric', month: 'long', year: 'numeric' })
                : '—'}
            </Text>
          </View>
        </View>
      </View>

      {/* ── RESUMEN / STATS ─────────────────────────────────────────────────── */}
      {stats && stats.length > 0 && (
        <View style={styles.card}>
          <Text style={styles.sectionLabel}>RESUMEN</Text>
          <View style={styles.statsGrid}>
            {stats.map((s, i) => (
              <View key={i} style={styles.statItem}>
                <Text style={[styles.statValue, s.color ? { color: s.color } : null]}>{s.value}</Text>
                <Text style={styles.statLabel}>{s.label}</Text>
              </View>
            ))}
          </View>
        </View>
      )}

      {/* ── ACCIONES ────────────────────────────────────────────────────────── */}
      <View style={styles.card}>
        <TouchableOpacity style={styles.actionRow} onPress={() => handleComingSoon('Cambiar contraseña')}>
          <Ionicons name="lock-closed-outline" size={20} color={Colors.dark} />
          <Text style={styles.actionText}>Cambiar contraseña</Text>
          <View style={styles.soonBadge}>
            <Text style={styles.soonBadgeText}>PRONTO</Text>
          </View>
        </TouchableOpacity>

        <View style={styles.divider} />

        <TouchableOpacity style={styles.actionRow} onPress={() => router.push('/settings/notifications' as any)}>
          <Ionicons name="notifications-outline" size={20} color={Colors.dark} />
          <Text style={styles.actionText}>Notificaciones</Text>
          <Ionicons name="chevron-forward" size={18} color={Colors.gray} />
        </TouchableOpacity>

        <View style={styles.divider} />

        <TouchableOpacity
          style={styles.actionRow}
          onPress={() => router.push('/settings/about' as any)}
        >
          <Ionicons name="information-circle-outline" size={20} color={Colors.dark} />
          <Text style={styles.actionText}>Información de la app</Text>
          <Ionicons name="chevron-forward" size={18} color={Colors.gray} />
        </TouchableOpacity>
      </View>

      {/* ── SESIÓN + LOGOUT ─────────────────────────────────────────────────── */}
      <Text style={styles.sessionInfo}>
        Sesión activa · {user?.full_name ?? user?.username}
      </Text>

      <TouchableOpacity style={styles.logoutRow} onPress={handleLogout}>
        <View style={styles.logoutIconBg}>
          <Ionicons name="log-out-outline" size={20} color={Colors.error} />
        </View>
        <Text style={styles.logoutText}>Cerrar sesión</Text>
      </TouchableOpacity>

      {/* ── Versión ─────────────────────────────────────────────────────────── */}
      <Text style={styles.versionText}>v1.0.0 · SÍNTESIS</Text>
    </ScrollView>
  );
}

// ── Estilos ────────────────────────────────────────────────────────────────────
const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: Colors.background },
  content: { paddingBottom: 40 },
  // ── Hero ──
  heroCard: { alignItems: 'center', paddingTop: 32, paddingBottom: 28, backgroundColor: Colors.surface, borderBottomWidth: 1, borderBottomColor: Colors.window },
  avatar: { width: 96, height: 96, borderRadius: 48, justifyContent: 'center', alignItems: 'center', marginBottom: 16 },
  avatarText: { fontSize: 34, fontWeight: '800', color: '#fff' },
  cameraIcon: { position: 'absolute', bottom: 2, right: 2, width: 28, height: 28, borderRadius: 14, backgroundColor: Colors.surface, borderWidth: 1, borderColor: Colors.window, justifyContent: 'center', alignItems: 'center', opacity: 0.5 },
  name: { fontSize: 22, fontWeight: '800', color: Colors.dark },
  username: { fontSize: 13, color: Colors.gray, marginTop: 6 },
  roleBadge: { marginTop: 10, paddingHorizontal: 16, paddingVertical: 5, borderRadius: 20 },
  roleText: { fontSize: 11, fontWeight: '800', letterSpacing: 0.8 },
  readOnlyBadge: { flexDirection: 'row', alignItems: 'center', gap: 4, marginTop: 8, backgroundColor: Colors.info + '15', paddingHorizontal: 10, paddingVertical: 4, borderRadius: 12 },
  readOnlyText: { fontSize: 11, fontWeight: '700', color: Colors.info },
  // ── Cards ──
  card: { margin: 16, marginBottom: 0, backgroundColor: Colors.surface, borderRadius: 16, padding: 20, borderWidth: 1, borderColor: Colors.window },
  sectionLabel: { fontSize: 12, fontWeight: '700', color: Colors.gray, letterSpacing: 0.8, marginBottom: 16 },
  divider: { height: 1, backgroundColor: Colors.window, marginVertical: 2 },
  // ── Info ──
  infoRow: { flexDirection: 'row', alignItems: 'center', paddingVertical: 12, gap: 14 },
  infoIcon: { width: 36, height: 36, borderRadius: 10, backgroundColor: Colors.background, justifyContent: 'center', alignItems: 'center' },
  infoLabel: { fontSize: 12, color: Colors.gray },
  infoValue: { fontSize: 15, fontWeight: '600', color: Colors.dark, marginTop: 2 },
  // ── Stats ──
  statsGrid: { flexDirection: 'row', gap: 10 },
  statItem: { flex: 1, backgroundColor: Colors.background, borderRadius: 12, paddingVertical: 16, alignItems: 'center', borderWidth: 1, borderColor: Colors.window },
  statValue: { fontSize: 24, fontWeight: '900', color: Colors.primary },
  statLabel: { fontSize: 11, color: Colors.gray, marginTop: 4, textAlign: 'center', fontWeight: '500' },
  // ── Actions ──
  actionRow: { flexDirection: 'row', alignItems: 'center', paddingVertical: 16, gap: 14 },
  actionText: { flex: 1, fontSize: 15, fontWeight: '600', color: Colors.dark },
  soonBadge: { backgroundColor: Colors.window, paddingHorizontal: 8, paddingVertical: 3, borderRadius: 6 },
  soonBadgeText: { fontSize: 10, fontWeight: '700', color: Colors.gray, letterSpacing: 0.5 },
  // ── Session / Logout ──
  sessionInfo: { textAlign: 'center', fontSize: 12, color: Colors.gray, marginTop: 20, marginBottom: 12 },
  logoutRow: { flexDirection: 'row', alignItems: 'center', marginHorizontal: 16, backgroundColor: Colors.surface, borderRadius: 16, padding: 16, gap: 14, borderWidth: 1, borderColor: Colors.error + '20' },
  logoutIconBg: { width: 36, height: 36, borderRadius: 10, backgroundColor: Colors.error + '12', justifyContent: 'center', alignItems: 'center' },
  logoutText: { fontSize: 15, fontWeight: '700', color: Colors.error },
  // ── Version ──
  versionText: { textAlign: 'center', fontSize: 11, color: Colors.gray, marginTop: 16, opacity: 0.6 },
});
