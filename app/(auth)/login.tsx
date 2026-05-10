import React, { useState } from 'react';
import {
  Alert,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from 'react-native';
import { useRouter } from 'expo-router';
import { Controller, useForm } from 'react-hook-form';
import { z } from 'zod';
import { zodResolver } from '@hookform/resolvers/zod';
import { authApi } from '@/src/api/auth';
import { Colors } from '@/src/theme/colors';
import { useAuthStore } from '@/src/store/authStore';

const loginSchema = z.object({
  username: z
    .string({ error: 'Usuario requerido.' })
    .trim()
    .min(3, 'El usuario debe tener al menos 3 caracteres.')
    .max(50, 'El usuario no puede superar 50 caracteres.'),
  password: z
    .string({ error: 'Contraseña requerida.' })
    .min(4, 'La contraseña debe tener al menos 4 caracteres.')
    .max(128, 'La contraseña no puede superar 128 caracteres.'),
});

type LoginFormValues = z.infer<typeof loginSchema>;

export default function LoginScreen() {
  const router = useRouter();
  const setAuth = useAuthStore((s) => s.setAuth);
  const [submitLoading, setSubmitLoading] = useState(false);

  const {
    control,
    handleSubmit,
    formState: { errors, isValid },
  } = useForm<LoginFormValues>({
    resolver: zodResolver(loginSchema),
    defaultValues: {
      username: '',
      password: '',
    },
    mode: 'onChange',
  });

  const onSubmit = async (values: LoginFormValues) => {
    setSubmitLoading(true);
    try {
      const response = await authApi.login({
        username: values.username.trim(),
        password: values.password,
      });

      // Hidrata el store con los datos de sesión (persist middleware escribe en SecureStore)
      setAuth(response.user, response.access_token, response.refresh_token);

      if (response.user.role === 'docente') {
        router.replace('/(teacher)');
      } else if (response.user.role === 'practicante') {
        router.replace('/(trainee)');
      } else {
        router.replace('/(student)');
      }
    } catch (error: any) {
      if (error?.response?.status === 401) {
        Alert.alert('Acceso denegado', 'Usuario o contraseña incorrectos.');
      } else {
        Alert.alert(
          'Error de conexión',
          'No se pudo conectar con el servidor. Verifica la red o la API Flask.'
        );
      }
    } finally {
      setSubmitLoading(false);
    }
  };

  return (
    <KeyboardAvoidingView
      style={styles.container}
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
      keyboardVerticalOffset={Platform.OS === 'ios' ? 24 : 0}
    >
      <ScrollView
        contentContainerStyle={styles.contentContainer}
        keyboardShouldPersistTaps="handled"
        showsVerticalScrollIndicator={false}
      >
        <View style={styles.card}>
          <Text style={styles.title}>SÍNTESIS</Text>

          <View style={styles.field}>
            <Text style={styles.label}>Usuario</Text>
            <Controller
              control={control}
              name="username"
              render={({ field: { onChange, onBlur, value } }) => (
                <TextInput
                  style={[styles.input, errors.username ? styles.inputError : null]}
                  placeholder="Ingresa tu usuario"
                  placeholderTextColor={Colors.gray}
                  value={value}
                  onBlur={onBlur}
                  onChangeText={onChange}
                  autoCapitalize="none"
                  autoCorrect={false}
                  editable={!submitLoading}
                />
              )}
            />
            {errors.username ? <Text style={styles.errorText}>{errors.username.message}</Text> : null}
          </View>

          <View style={styles.field}>
            <Text style={styles.label}>Contraseña</Text>
            <Controller
              control={control}
              name="password"
              render={({ field: { onChange, onBlur, value } }) => (
                <TextInput
                  style={[styles.input, errors.password ? styles.inputError : null]}
                  placeholder="Ingresa tu contraseña"
                  placeholderTextColor={Colors.gray}
                  value={value}
                  onBlur={onBlur}
                  onChangeText={onChange}
                  secureTextEntry
                  autoCapitalize="none"
                  autoCorrect={false}
                  editable={!submitLoading}
                />
              )}
            />
            {errors.password ? <Text style={styles.errorText}>{errors.password.message}</Text> : null}
          </View>

          <TouchableOpacity
            style={styles.linkButton}
            onPress={() => router.push('/(auth)/forgot-password' as never)}
            disabled={submitLoading}
          >
            <Text style={styles.linkText}>¿Olvidaste tu contraseña?</Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={[styles.primaryButton, !isValid || submitLoading ? styles.primaryButtonDisabled : null]}
            onPress={handleSubmit(onSubmit)}
            disabled={!isValid || submitLoading}
          >
            <Text style={styles.primaryButtonText}>
              {submitLoading ? 'Ingresando...' : 'Ingresar'}
            </Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={styles.registerLink}
            onPress={() => router.push('/(auth)/register' as never)}
          >
            <Text style={styles.registerLinkText}>
              ¿No tienes cuenta?{' '}
              <Text style={styles.registerLinkHighlight}>Regístrate aquí</Text>
            </Text>
          </TouchableOpacity>
        </View>
      </ScrollView>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.background,
  },
  contentContainer: {
    flexGrow: 1,
    justifyContent: 'center',
    padding: 20,
    paddingBottom: 28,
  },
  card: {
    backgroundColor: Colors.surface,
    borderRadius: 28,
    padding: 20,
    borderWidth: 1,
    borderColor: Colors.window,
  },
  title: {
    fontSize: 28,
    fontWeight: '800',
    color: Colors.primary,
    textAlign: 'center',
    marginBottom: 18,
  },
  field: {
    marginBottom: 14,
  },
  label: {
    color: Colors.dark,
    fontSize: 14,
    fontWeight: '600',
    marginBottom: 8,
  },
  input: {
    height: 54,
    borderRadius: 27,
    borderWidth: 1,
    borderColor: Colors.window,
    backgroundColor: Colors.surface,
    paddingHorizontal: 18,
    color: Colors.dark,
    fontSize: 15,
  },
  inputError: {
    borderColor: Colors.error,
  },
  errorText: {
    color: Colors.error,
    fontSize: 12,
    marginTop: 6,
  },
  linkButton: {
    alignSelf: 'flex-end',
    marginBottom: 16,
  },
  linkText: {
    color: Colors.primary,
    fontSize: 13,
    fontWeight: '600',
  },
  primaryButton: {
    height: 54,
    borderRadius: 27,
    backgroundColor: Colors.secondary,
    alignItems: 'center',
    justifyContent: 'center',
  },
  primaryButtonDisabled: {
    opacity: 0.6,
  },
  primaryButtonText: {
    color: Colors.dark,
    fontSize: 16,
    fontWeight: '700',
  },
  registerLink: {
    marginTop: 18,
    alignItems: 'center',
  },
  registerLinkText: {
    color: Colors.gray,
    fontSize: 14,
  },
  registerLinkHighlight: {
    color: Colors.primary,
    fontWeight: '700',
  },
});