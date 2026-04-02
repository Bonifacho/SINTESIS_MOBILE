import { View, Text, TouchableOpacity } from 'react-native';
import { router } from 'expo-router';
import { useAuthStore } from '@/src/store/authStore';
import { Colors } from '@/src/theme/colors';

export default function LoginScreen() {
  const { setAuth } = useAuthStore();

  // ── Botones temporales para probar navegación ──
  const simularDocente = async () => {
    await setAuth(
      { id: 1, email: 'docente@test.com',
        full_name: 'Docente Test', role: 'docente' },
      'fake-token-docente'
    );
    router.replace('/teacher' as any);
  };

  const simularEstudiante = async () => {
    await setAuth(
      { id: 2, email: 'estudiante@test.com',
        full_name: 'Estudiante Test', role: 'estudiante' },
      'fake-token-estudiante'
    );
    router.replace('/student' as any);
  };

  return (
    <View style={{ flex: 1, justifyContent: 'center',
      alignItems: 'center', backgroundColor: Colors.background, gap: 16 }}>

      <Text style={{ color: Colors.primary, fontSize: 28,
        fontWeight: '700', marginBottom: 24 }}>SÍNTESIS</Text>

      <TouchableOpacity
        onPress={simularDocente}
        style={{ backgroundColor: Colors.primary, paddingHorizontal: 32,
          paddingVertical: 14, borderRadius: 12, width: 220 }}>
        <Text style={{ color: '#fff', textAlign: 'center',
          fontWeight: '600', fontSize: 15 }}>
          Entrar como Docente
        </Text>
      </TouchableOpacity>

      <TouchableOpacity
        onPress={simularEstudiante}
        style={{ backgroundColor: Colors.secondary, paddingHorizontal: 32,
          paddingVertical: 14, borderRadius: 12, width: 220 }}>
        <Text style={{ color: '#fff', textAlign: 'center',
          fontWeight: '600', fontSize: 15 }}>
          Entrar como Estudiante
        </Text>
      </TouchableOpacity>

    </View>
  );
}