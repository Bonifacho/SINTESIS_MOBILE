import React, { useState } from 'react';
import { StyleSheet, Text, TextInput, TouchableOpacity, View, ActivityIndicator } from 'react-native';
import { useRouter } from 'expo-router';
import Toast from 'react-native-toast-message';
import apiClient from '@/src/api/client';
import { Colors } from '@/src/theme/colors';

export default function ForgotPasswordScreen() {
  const router = useRouter();
  const [step, setStep] = useState<1 | 2>(1);
  const [identifier, setIdentifier] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [devToken, setDevToken] = useState('');
  const [loading, setLoading] = useState(false);

  const requestReset = async () => {
    if (!identifier.trim()) {
      Toast.show({ type: 'error', text1: 'Error', text2: 'Ingresa un usuario o correo.', position: 'bottom' });
      return;
    }
    setLoading(true);
    try {
      const res = await apiClient.post('/api/v1/security/forgot-password', { identifier: identifier.trim() });
      if (res.data?.dev_token) {
        setDevToken(res.data.dev_token);
        setStep(2);
        Toast.show({ type: 'success', text1: 'Usuario encontrado', text2: 'Por favor, ingresa tu nueva contraseña.', position: 'bottom' });
      } else {
        Toast.show({ type: 'error', text1: 'Error', text2: 'No se recibió un token válido.', position: 'bottom' });
      }
    } catch (error: any) {
      Toast.show({ type: 'error', text1: 'Error', text2: error?.response?.data?.message || 'No se pudo verificar el usuario.', position: 'bottom' });
    } finally {
      setLoading(false);
    }
  };

  const confirmReset = async () => {
    if (newPassword.length < 6) {
      Toast.show({ type: 'error', text1: 'Contraseña débil', text2: 'La nueva contraseña debe tener al menos 6 caracteres.', position: 'bottom' });
      return;
    }
    setLoading(true);
    try {
      await apiClient.post('/api/v1/security/reset-password', {
        token: devToken,
        new_password: newPassword,
      });
      Toast.show({ type: 'success', text1: '¡Éxito!', text2: 'Tu contraseña ha sido actualizada correctamente.', position: 'bottom' });
      router.replace('/(auth)/login');
    } catch (error: any) {
      Toast.show({ type: 'error', text1: 'Error', text2: error?.response?.data?.message || 'No se pudo cambiar la contraseña.', position: 'bottom' });
    } finally {
      setLoading(false);
    }
  };

  return (
    <View style={styles.container}>
      <View style={styles.card}>
        <Text style={styles.title}>Recuperar Contraseña</Text>

        {step === 1 ? (
          <>
            <Text style={styles.label}>Usuario o Correo</Text>
            <TextInput
              style={styles.input}
              placeholder="Ingresa tu usuario o correo"
              placeholderTextColor={Colors.gray}
              value={identifier}
              onChangeText={setIdentifier}
              autoCapitalize="none"
              autoCorrect={false}
              editable={!loading}
            />

            <TouchableOpacity style={styles.primaryButton} onPress={requestReset} disabled={loading}>
              {loading ? <ActivityIndicator color={Colors.dark} /> : <Text style={styles.primaryButtonText}>Siguiente paso</Text>}
            </TouchableOpacity>
          </>
        ) : (
          <>
            <Text style={styles.label}>Nueva Contraseña</Text>
            <TextInput
              style={styles.input}
              placeholder="Escribe tu nueva contraseña"
              placeholderTextColor={Colors.gray}
              value={newPassword}
              onChangeText={setNewPassword}
              secureTextEntry
              autoCapitalize="none"
              autoCorrect={false}
              editable={!loading}
            />

            <TouchableOpacity style={styles.primaryButton} onPress={confirmReset} disabled={loading}>
              {loading ? <ActivityIndicator color={Colors.dark} /> : <Text style={styles.primaryButtonText}>Guardar contraseña</Text>}
            </TouchableOpacity>
          </>
        )}

        <TouchableOpacity style={styles.secondaryButton} onPress={() => router.replace('/(auth)/login')} disabled={loading}>
          <Text style={styles.secondaryButtonText}>Volver al Login</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.background,
    justifyContent: 'center',
    padding: 20,
  },
  card: {
    backgroundColor: Colors.surface,
    borderRadius: 24,
    borderWidth: 1,
    borderColor: Colors.window,
    padding: 20,
  },
  title: {
    fontSize: 26,
    fontWeight: '800',
    color: Colors.primary,
    textAlign: 'center',
    marginBottom: 20,
  },
  label: {
    color: Colors.dark,
    fontSize: 14,
    fontWeight: '600',
    marginBottom: 8,
  },
  input: {
    height: 50,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: Colors.window,
    backgroundColor: Colors.background,
    paddingHorizontal: 14,
    color: Colors.dark,
    fontSize: 15,
    marginBottom: 16,
  },
  primaryButton: {
    height: 52,
    borderRadius: 26,
    backgroundColor: Colors.secondary,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 10,
  },
  primaryButtonText: {
    color: Colors.dark,
    fontSize: 16,
    fontWeight: '700',
  },
  secondaryButton: {
    height: 48,
    borderRadius: 24,
    borderWidth: 1,
    borderColor: Colors.primary,
    alignItems: 'center',
    justifyContent: 'center',
  },
  secondaryButtonText: {
    color: Colors.primary,
    fontSize: 15,
    fontWeight: '600',
  },
});
