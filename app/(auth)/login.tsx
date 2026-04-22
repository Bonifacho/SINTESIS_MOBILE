import React, { useState } from 'react';
import {
  View, Text, TextInput, TouchableOpacity,
  StyleSheet, KeyboardAvoidingView, Platform,
  ActivityIndicator, Alert,
} from 'react-native';
import { useRouter } from 'expo-router';
import { useAuthStore } from '@/src/store/authStore';
import { authApi } from '@/src/api/auth'; // <-- IMPORTAMOS LA API REAL
import { Colors } from '@/src/theme/colors';
import { IconSymbol } from '@/components/ui/icon-symbol';

export default function LoginScreen() {
  const router   = useRouter();
  const setAuth  = useAuthStore((s) => s.setAuth);

  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [loading,  setLoading]  = useState(false);
  const [showPass, setShowPass] = useState(false);

  const handleLogin = async () => {
    if (!username.trim() || !password.trim()) {
      Alert.alert('Campos requeridos', 'Ingresa tu usuario y contraseña.');
      return;
    }

    setLoading(true);

    try {
      // 1. Llamada HTTP real al backend Flask
      const response = await authApi.login({
        username: username.trim(),
        password: password
      });

      // 2. Guardar sesión en SecureStore y Zustand
      await setAuth(response.user, response.access_token);

      // 3. Navegación basada en el rol real que devuelve la base de datos
      if (response.user.role === 'docente') {
        router.replace('/(teacher)');
      } else if (response.user.role === 'practicante') {
        router.replace('/(trainee)');
      } else {
        router.replace('/(student)');
      }
      
    } catch (error: any) {
      console.error("Error en login:", error);
      
      // Manejo de errores específicos del backend
      if (error.response?.status === 401) {
        Alert.alert('Acceso denegado', 'Usuario o contraseña incorrectos.');
      } else {
        Alert.alert('Error de conexión', 'No se pudo conectar con el servidor. Verifica tu red o que la API de Python esté corriendo.');
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <KeyboardAvoidingView
      style={styles.container}
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
    >
      <View style={styles.card}>

        <View style={styles.logoBox}>
          <IconSymbol name="lock.shield.fill" size={56} color={Colors.primary} />
          <Text style={styles.appName}>SÍNTESIS</Text>
          <Text style={styles.appSub}>Portal Académico</Text>
        </View>

        <View style={styles.field}>
          <Text style={styles.label}>Usuario</Text>
          <View style={styles.inputRow}>
            <IconSymbol name="person.fill" size={18} color={Colors.gray} />
            <TextInput
              style={styles.input}
              placeholder="Ingresa tu usuario"
              placeholderTextColor={Colors.gray}
              value={username}
              onChangeText={setUsername}
              autoCapitalize="none"
              autoCorrect={false}
              editable={!loading}
            />
          </View>
        </View>

        <View style={styles.field}>
          <Text style={styles.label}>Contraseña</Text>
          <View style={styles.inputRow}>
            <IconSymbol name="lock.fill" size={18} color={Colors.gray} />
            <TextInput
              style={styles.input}
              placeholder="••••••••"
              placeholderTextColor={Colors.gray}
              value={password}
              onChangeText={setPassword}
              secureTextEntry={!showPass}
              editable={!loading}
            />
            <TouchableOpacity onPress={() => setShowPass(!showPass)}>
              <IconSymbol
                name={showPass ? 'eye.slash.fill' : 'eye.fill'}
                size={18}
                color={Colors.gray}
              />
            </TouchableOpacity>
          </View>
        </View>

        <TouchableOpacity
          style={[styles.btn, loading && styles.btnDisabled]}
          onPress={handleLogin}
          disabled={loading}
        >
          {loading
            ? <ActivityIndicator color="#fff" />
            : <Text style={styles.btnText}>Ingresar</Text>
          }
        </TouchableOpacity>

        <Text style={styles.footer}>
          Conectando a servidor: {process.env.EXPO_PUBLIC_API_URL}
        </Text>
      </View>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: Colors.primary, justifyContent: 'center', padding: 24 },
  card: { backgroundColor: Colors.surface, borderRadius: 20, padding: 28 },
  logoBox: { alignItems: 'center', marginBottom: 24 },
  appName: { fontSize: 28, fontWeight: '800', color: Colors.primary, marginTop: 10, letterSpacing: 2 },
  appSub: { fontSize: 13, color: Colors.gray, marginTop: 4 },
  field: { marginBottom: 16 },
  label: { fontSize: 12, fontWeight: '700', color: Colors.gray, textTransform: 'uppercase', letterSpacing: 0.5, marginBottom: 8 },
  inputRow: { flexDirection: 'row', alignItems: 'center', backgroundColor: Colors.background, borderRadius: 12, borderWidth: 1, borderColor: Colors.window, paddingHorizontal: 14, height: 52, gap: 10 },
  input: { flex: 1, fontSize: 15, color: Colors.dark },
  btn: { backgroundColor: Colors.primary, borderRadius: 12, height: 52, justifyContent: 'center', alignItems: 'center', marginTop: 8 },
  btnDisabled: { opacity: 0.6 },
  btnText: { color: '#fff', fontSize: 16, fontWeight: '700' },
  footer: { textAlign: 'center', fontSize: 11, color: Colors.gray, marginTop: 20 },
});