import React, { useState } from 'react';
import { 
  View, Text, TextInput, TouchableOpacity, StyleSheet, 
  KeyboardAvoidingView, Platform 
} from 'react-native';
import { router } from 'expo-router';
import { Colors } from '@/src/theme/colors';

export default function LoginScreen() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');

  const handleLogin = () => {
    // TRUCO DE NAVEGACIÓN TEMPORAL
    if (email.toLowerCase().includes('docente')) {
      router.replace('/(teacher)');
    } else {
      router.replace('/(student)');
    }
  };

  return (
    <KeyboardAvoidingView 
      style={styles.container} 
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
    >
      <View style={styles.formContainer}>
        {/* Encabezado */}
        <Text style={styles.title}>S Í N T E S I S</Text>
        <Text style={styles.subtitle}>Sistema Integral Tecnológico</Text>

        {/* Inputs */}
        <View style={styles.inputGroup}>
          <Text style={styles.label}>Correo Institucional</Text>
          <TextInput
            style={styles.input}
            placeholder="estudiante@universidad.edu.co"
            placeholderTextColor={Colors.gray}
            value={email}
            onChangeText={setEmail}
            keyboardType="email-address"
            autoCapitalize="none"
          />
        </View>

        <View style={styles.inputGroup}>
          <Text style={styles.label}>Contraseña</Text>
          <TextInput
            style={styles.input}
            placeholder="••••••••"
            placeholderTextColor={Colors.gray}
            value={password}
            onChangeText={setPassword}
            secureTextEntry
          />
        </View>

        {/* Botón Principal */}
        <TouchableOpacity style={styles.button} onPress={handleLogin}>
          <Text style={styles.buttonText}>Ingresar al Sistema</Text>
        </TouchableOpacity>
      </View>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.background,
    justifyContent: 'center',
    padding: 24,
  },
  formContainer: {
    backgroundColor: Colors.surface,
    padding: 32,
    borderRadius: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.05,
    shadowRadius: 12,
    elevation: 2,
  },
  title: {
    fontSize: 28,
    fontWeight: '800',
    color: Colors.primary,
    textAlign: 'center',
    letterSpacing: 2,
    marginBottom: 4,
  },
  subtitle: {
    fontSize: 14,
    color: Colors.gray,
    textAlign: 'center',
    marginBottom: 32,
  },
  inputGroup: {
    marginBottom: 20,
  },
  label: {
    fontSize: 14,
    fontWeight: '600',
    color: Colors.dark,
    marginBottom: 8,
  },
  input: {
    backgroundColor: Colors.light,
    borderWidth: 1,
    borderColor: Colors.window,
    borderRadius: 8,
    padding: 16,
    fontSize: 16,
    color: Colors.dark,
  },
  button: {
    backgroundColor: Colors.primary,
    padding: 16,
    borderRadius: 8,
    alignItems: 'center',
    marginTop: 12,
  },
  buttonText: {
    color: Colors.surface, // Usamos la variable de blanco puro para el texto sobre el botón primary
    fontSize: 16,
    fontWeight: 'bold',
  },
});