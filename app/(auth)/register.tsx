import React, { useMemo, useState } from 'react';
import {
  ActivityIndicator,
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
import Toast from 'react-native-toast-message';
import { Ionicons } from '@expo/vector-icons';
import apiClient from '../../src/api/client';
import { Colors } from '../../src/theme/colors';

type RegisterResponse = {
  user?: {
    id?: number;
    user_id?: number;
  };
  id?: number;
  user_id?: number;
};

const registerSchema = z.object({
  firstName: z
    .string({ error: 'Nombres requeridos.' })
    .trim()
    .min(2, 'Nombres debe tener al menos 2 caracteres.'),
  lastName: z
    .string({ error: 'Apellidos requeridos.' })
    .trim()
    .min(2, 'Apellidos debe tener al menos 2 caracteres.'),
  documentId: z
    .string({ error: 'Documento requerido.' })
    .trim()
    .min(5, 'El documento debe tener al menos 5 dígitos.')
    .max(15, 'El documento no puede superar 15 dígitos.')
    .regex(/^\d+$/, 'El documento solo debe contener números.'),
  username: z
    .string({ error: 'Usuario requerido.' })
    .trim()
    .min(3, 'Usuario debe tener al menos 3 caracteres.'),
  password: z
    .string({ error: 'Contraseña requerida.' })
    .min(6, 'La contraseña debe tener mínimo 6 caracteres.'),
  acceptTerms: z
    .boolean()
    .refine((value) => value, 'Debes aceptar términos y política de tratamiento de datos.'),
});

type RegisterFormValues = z.infer<typeof registerSchema>;

export default function RegisterScreen() {
  const router = useRouter();
  const [submitLoading, setSubmitLoading] = useState<boolean>(false);
  const [showPassword, setShowPassword] = useState(false);

  const {
    control,
    handleSubmit,
    formState: { errors },
  } = useForm<RegisterFormValues>({
    resolver: zodResolver(registerSchema),
    defaultValues: {
      firstName: '',
      lastName: '',
      documentId: '',
      username: '',
      password: '',
      acceptTerms: false,
    },
    mode: 'onSubmit',
  });

  const canSubmit = useMemo(() => !submitLoading, [submitLoading]);

  const onSubmit = async (values: RegisterFormValues) => {
    setSubmitLoading(true);
    try {
      const payload = {
        first_name: values.firstName.trim(),
        last_name: values.lastName.trim(),
        document_id: values.documentId.trim(),
        username: values.username.trim(),
        password: values.password,
      };

      await apiClient.post<RegisterResponse>('/api/v1/security/register', payload);

      Toast.show({
        type: 'success',
        text1: 'Registro exitoso',
        text2: 'Tu cuenta fue creada correctamente.',
        position: 'bottom',
      });
      router.replace('/(auth)/login');
    } catch (error: any) {
      const apiMessage: string | undefined =
        error?.response?.data?.message ?? error?.response?.data?.error;
      const apiStatus: number | undefined = error?.response?.status;
      
      Toast.show({
        type: 'error',
        text1: 'Error de registro',
        text2: apiMessage
          ? `(${apiStatus ?? 'sin-codigo'}) ${apiMessage}`
          : 'Verifica los datos e intenta nuevamente.',
        position: 'bottom',
      });
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
        style={styles.container}
        keyboardShouldPersistTaps="handled"
        showsVerticalScrollIndicator={false}
        contentContainerStyle={styles.contentContainer}
      >
        <View style={styles.card}>
          <Text style={styles.title}>Registro de Estudiante</Text>

        <View style={styles.field}>
          <Text style={styles.label}>Nombres</Text>
          <Controller
            control={control}
            name="firstName"
            render={({ field: { onChange, onBlur, value } }) => (
              <TextInput
                style={[styles.input, errors.firstName ? styles.inputError : null]}
                placeholder="Ingresa tus nombres"
                placeholderTextColor={Colors.gray}
                value={value}
                onBlur={onBlur}
                onChangeText={onChange}
              />
            )}
          />
          {errors.firstName ? <Text style={styles.errorText}>{errors.firstName.message}</Text> : null}
        </View>

        <View style={styles.field}>
          <Text style={styles.label}>Apellidos</Text>
          <Controller
            control={control}
            name="lastName"
            render={({ field: { onChange, onBlur, value } }) => (
              <TextInput
                style={[styles.input, errors.lastName ? styles.inputError : null]}
                placeholder="Ingresa tus apellidos"
                placeholderTextColor={Colors.gray}
                value={value}
                onBlur={onBlur}
                onChangeText={onChange}
              />
            )}
          />
          {errors.lastName ? <Text style={styles.errorText}>{errors.lastName.message}</Text> : null}
        </View>

        <View style={styles.field}>
          <Text style={styles.label}>Documento de Identidad</Text>
          <Controller
            control={control}
            name="documentId"
            render={({ field: { onChange, onBlur, value } }) => (
              <TextInput
                style={[styles.input, errors.documentId ? styles.inputError : null]}
                placeholder="Solo números (ej: 1072099991)"
                placeholderTextColor={Colors.gray}
                value={value}
                onBlur={onBlur}
                onChangeText={(text) => onChange(text.replace(/[^0-9]/g, ''))}
                keyboardType="numeric"
                maxLength={15}
              />
            )}
          />
          {errors.documentId ? <Text style={styles.errorText}>{errors.documentId.message}</Text> : null}
        </View>

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
              <View style={{ justifyContent: 'center' }}>
                <TextInput
                  style={[styles.input, errors.password ? styles.inputError : null, { paddingRight: 48 }]}
                  placeholder="Mínimo 6 caracteres"
                  placeholderTextColor={Colors.gray}
                  value={value}
                  onBlur={onBlur}
                  onChangeText={onChange}
                  secureTextEntry={!showPassword}
                  autoCapitalize="none"
                  autoCorrect={false}
                />
                <TouchableOpacity
                  style={{ position: 'absolute', right: 16, height: '100%', justifyContent: 'center' }}
                  onPress={() => setShowPassword(!showPassword)}
                  activeOpacity={0.7}
                >
                  <Ionicons name={showPassword ? 'eye-off' : 'eye'} size={22} color={Colors.gray} />
                </TouchableOpacity>
              </View>
            )}
          />
          {errors.password ? <Text style={styles.errorText}>{errors.password.message}</Text> : null}
        </View>

        <Controller
          control={control}
          name="acceptTerms"
          render={({ field: { value, onChange } }) => (
            <TouchableOpacity
              style={[styles.checkboxContainer, value ? styles.checkboxContainerActive : null]}
              onPress={() => onChange(!value)}
            >
              <View style={[styles.checkbox, value ? styles.checkboxActive : null]}>
                {value ? <Text style={styles.checkboxMark}>✓</Text> : null}
              </View>
              <Text style={styles.checkboxLabel}>
                Acepto términos y política de tratamiento de datos.
              </Text>
            </TouchableOpacity>
          )}
        />
        {errors.acceptTerms ? <Text style={styles.errorText}>{errors.acceptTerms.message}</Text> : null}

          <TouchableOpacity
            style={[styles.button, !canSubmit ? styles.buttonDisabled : null]}
            onPress={handleSubmit(onSubmit)}
            disabled={!canSubmit}
          >
            {submitLoading ? (
              <ActivityIndicator size="small" color={Colors.surface} />
            ) : (
              <Text style={styles.buttonText}>Registrar estudiante</Text>
            )}
          </TouchableOpacity>

          <TouchableOpacity
            style={styles.backLink}
            onPress={() => router.back()}
          >
            <Text style={styles.backLinkText}>
              ← Volver al inicio de sesión
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
    justifyContent: 'flex-start',
    padding: 20,
    paddingTop: 28,
    paddingBottom: 32,
  },
  card: {
    backgroundColor: Colors.surface,
    borderRadius: 20,
    borderWidth: 1,
    borderColor: Colors.window,
    padding: 18,
  },
  title: {
    fontSize: 24,
    fontWeight: '800',
    color: Colors.primary,
    marginBottom: 16,
    textAlign: 'center',
  },
  field: {
    marginBottom: 12,
  },
  label: {
    color: Colors.dark,
    fontSize: 14,
    fontWeight: '600',
    marginBottom: 8,
  },
  input: {
    height: 50,
    borderWidth: 1,
    borderColor: Colors.window,
    borderRadius: 12,
    paddingHorizontal: 12,
    color: Colors.dark,
    backgroundColor: Colors.surface,
  },
  inputError: {
    borderColor: Colors.error,
  },
  errorText: {
    color: Colors.error,
    fontSize: 12,
    marginTop: 6,
  },
  checkboxContainer: {
    marginTop: 6,
    marginBottom: 8,
    borderWidth: 1,
    borderColor: Colors.window,
    borderRadius: 12,
    padding: 12,
    backgroundColor: Colors.surface,
    flexDirection: 'row',
    alignItems: 'center',
  },
  checkboxContainerActive: {
    borderColor: Colors.primary,
  },
  checkbox: {
    width: 22,
    height: 22,
    borderRadius: 6,
    borderWidth: 1.5,
    borderColor: Colors.window,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 10,
    backgroundColor: Colors.surface,
  },
  checkboxActive: {
    backgroundColor: Colors.primary,
    borderColor: Colors.primary,
  },
  checkboxMark: {
    color: Colors.surface,
    fontSize: 14,
    fontWeight: '800',
  },
  checkboxLabel: {
    flex: 1,
    color: Colors.dark,
    fontSize: 13,
    lineHeight: 18,
  },
  button: {
    marginTop: 10,
    height: 52,
    borderRadius: 26,
    backgroundColor: Colors.primary,
    justifyContent: 'center',
    alignItems: 'center',
  },
  buttonDisabled: {
    opacity: 0.6,
  },
  buttonText: {
    color: Colors.surface,
    fontSize: 16,
    fontWeight: '700',
  },
  backLink: {
    marginTop: 16,
    alignItems: 'center',
  },
  backLinkText: {
    color: Colors.primary,
    fontSize: 14,
    fontWeight: '600',
  },
});
