import React, { useState } from 'react';
import { StyleSheet, Text, TextInput, TouchableOpacity, View } from 'react-native';
import { useRouter } from 'expo-router';
import { Colors } from '@/src/theme/colors';

export default function ForgotPasswordScreen() {
  const router = useRouter();
  const [identifier, setIdentifier] = useState('');

  return (
    <View style={styles.container}>
      <View style={styles.card}>
        <Text style={styles.title}>Recuperar Contraseña</Text>

        <Text style={styles.label}>Usuario o Correo</Text>
        <TextInput
          style={styles.input}
          placeholder="Ingresa tu usuario o correo"
          placeholderTextColor={Colors.gray}
          value={identifier}
          onChangeText={setIdentifier}
          autoCapitalize="none"
          autoCorrect={false}
        />

        <TouchableOpacity style={styles.primaryButton}>
          <Text style={styles.primaryButtonText}>Enviar instrucciones</Text>
        </TouchableOpacity>

        <TouchableOpacity style={styles.secondaryButton} onPress={() => router.push('/(auth)/login')}>
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
