import { View, Text, StyleSheet, TouchableOpacity, Alert } from 'react-native';
import { useRouter } from 'expo-router';
import { useAuthStore } from '@/src/store/authStore';
import { authApi } from '@/src/api/auth';
import { Colors } from '@/src/theme/colors';
import { IconSymbol } from '@/components/ui/icon-symbol';

export default function ProfileScreen() {
  const router = useRouter();
  const { user, clearAuth } = useAuthStore();

  const handleLogout = async () => {
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

  const initials = user?.full_name?.split(' ').map((n) => n[0]).join('').toUpperCase().slice(0, 2) ?? 'U';

  const roleColors: Record<string, string> = { docente: Colors.primary, estudiante: Colors.success, practicante: Colors.info };
  const roleColor = roleColors[user?.role ?? 'estudiante'];

  return (
    <View style={styles.container}>
      <View style={styles.hero}>
        <View style={[styles.avatar, { backgroundColor: roleColor }]}>
          <Text style={styles.avatarText}>{initials}</Text>
        </View>
        <Text style={styles.name}>{user?.full_name ?? user?.username}</Text>
        <Text style={styles.username}>@{user?.username}</Text>
        <View style={[styles.roleBadge, { backgroundColor: roleColor + '22', borderColor: roleColor }]}>
          <Text style={[styles.roleText, { color: roleColor }]}>{user?.role?.toUpperCase()}</Text>
        </View>
      </View>

      <View style={styles.section}>
        <View style={styles.infoRow}>
          <IconSymbol name="person.fill" size={18} color={Colors.gray} />
          <View style={{ flex: 1, marginLeft: 12 }}>
            <Text style={styles.infoLabel}>Usuario</Text>
            <Text style={styles.infoValue}>{user?.username}</Text>
          </View>
        </View>
      </View>

      <TouchableOpacity style={styles.logoutBtn} onPress={handleLogout}>
        <IconSymbol name="rectangle.portrait.and.arrow.right" size={20} color="#fff" />
        <Text style={styles.logoutText}>Cerrar sesión</Text>
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: Colors.background },
  hero: { alignItems: 'center', paddingTop: 36, paddingBottom: 28, backgroundColor: Colors.surface, borderBottomWidth: 0.5, borderBottomColor: Colors.window },
  avatar: { width: 80, height: 80, borderRadius: 40, justifyContent: 'center', alignItems: 'center', marginBottom: 14 },
  avatarText: { fontSize: 28, fontWeight: '700', color: '#fff' },
  name: { fontSize: 20, fontWeight: '700', color: Colors.dark },
  username: { fontSize: 13, color: Colors.gray, marginTop: 4 },
  roleBadge: { marginTop: 10, paddingHorizontal: 14, paddingVertical: 4, borderRadius: 20, borderWidth: 1 },
  roleText: { fontSize: 12, fontWeight: '700', letterSpacing: 0.5 },
  section: { margin: 16, backgroundColor: Colors.surface, borderRadius: 14, borderWidth: 0.5, borderColor: Colors.window, padding: 4 },
  infoRow: { flexDirection: 'row', alignItems: 'center', padding: 14 },
  infoLabel: { fontSize: 12, color: Colors.gray },
  infoValue: { fontSize: 15, fontWeight: '600', color: Colors.dark, marginTop: 2 },
  logoutBtn: { flexDirection: 'row', alignItems: 'center', justifyContent: 'center', backgroundColor: Colors.error, borderRadius: 14, margin: 16, padding: 16, gap: 10 },
  logoutText: { color: '#fff', fontSize: 16, fontWeight: '700' },
});