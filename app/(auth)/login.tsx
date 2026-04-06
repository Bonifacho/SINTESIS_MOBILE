import React, { useState } from 'react';
import { View, Text, TextInput, TouchableOpacity, StyleSheet, KeyboardAvoidingView, Platform } from 'react-native';
import { useRouter } from 'expo-router';
import { useAuthStore, Role } from '@/src/store/authStore';
import { Colors } from '@/src/theme/colors';
import { IconSymbol } from '@/components/ui/icon-symbol';

export default function LoginScreen() {
  const router = useRouter();
  const setAuth = useAuthStore((state) => state.setAuth);
  
  // 1. EL ESTADO: Guardamos lo que el usuario escribe
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');

  // 2. LA LÓGICA: El "cerebro" que ya habíamos diseñado
  const handleLogin = async () => {
    if (!email || !password) return; // Validación básica

    const emailLower = email.toLowerCase();
    let role: Role = 'estudiante'; // Por defecto
    let route: any = '/(student)';

    // Asignación de roles según tu Base de Datos y MVP
    if (emailLower.includes('docente')) {
      role = 'docente';
      route = '/(teacher)';
    } else if (emailLower.includes('practicante')) {
      role = 'practicante';
      route = '/(trainee)';
    }

    // Simulamos que el backend nos respondió exitosamente
    const mockUser = {
      id: 1,
      email: emailLower,
      full_name: 'Usuario MVP SÍNTESIS',
      role: role
    };
    const mockToken = 'jwt_simulado_mvp_12345';

    // Guardamos en Zustand (Estado Global)
    await setAuth(mockUser, mockToken);

    // Navegamos al árbol correcto
    router.replace(route);
  };

  // 3. LA INTERFAZ: El cuerpo y diseño visual de la pantalla
  return (
    <KeyboardAvoidingView 
      style={styles.container} 
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
    >
      <View style={styles.card}>
        <View style={styles.logoContainer}>
          <IconSymbol name="lock.shield.fill" size={60} color={Colors.primary} />
          <Text style={styles.title}>SÍNTESIS</Text>
          <Text style={styles.subtitle}>Portal Académico</Text>
        </View>

        <View style={styles.inputContainer}>
          <Text style={styles.label}>Correo Electrónico</Text>
          <TextInput
            style={styles.input}
            placeholder="ejemplo@sintesis.edu.co"
            placeholderTextColor={Colors.gray}
            value={email}
            onChangeText={setEmail}
            autoCapitalize="none"
            keyboardType="email-address"
          />
        </View>

        <View style={styles.inputContainer}>
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

        <TouchableOpacity style={styles.button} onPress={handleLogin} activeOpacity={0.8}>
          <Text style={styles.buttonText}>Iniciar Sesión</Text>
        </TouchableOpacity>

        <Text style={styles.helperText}>
          Tip MVP: Usa "docente" o "practicante" en el correo para cambiar de rol.
        </Text>
      </View>
    </KeyboardAvoidingView>
  );
}

// 4. LOS ESTILOS: El maquillaje (usando tu paleta antifatiga)
const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.background,
    justifyContent: 'center',
    padding: 20,
  },
  card: {
    backgroundColor: Colors.surface,
    padding: 30,
    borderRadius: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.1,
    shadowRadius: 12,
    elevation: 5,
  },
  logoContainer: {
    alignItems: 'center',
    marginBottom: 40,
  },
  title: {
    fontSize: 28,
    fontWeight: '900',
    color: Colors.primary,
    marginTop: 10,
    letterSpacing: 1.5,
  },
  subtitle: {
    fontSize: 16,
    color: Colors.gray,
    marginTop: 5,
  },
  inputContainer: {
    marginBottom: 20,
  },
  label: {
    fontSize: 14,
    fontWeight: '600',
    color: Colors.dark,
    marginBottom: 8,
  },
  input: {
    backgroundColor: Colors.background,
    borderWidth: 1,
    borderColor: Colors.window,
    borderRadius: 8,
    padding: 15,
    fontSize: 16,
    color: Colors.dark,
  },
  button: {
    backgroundColor: Colors.primary,
    padding: 16,
    borderRadius: 8,
    alignItems: 'center',
    marginTop: 10,
  },
  buttonText: {
    color: Colors.surface,
    fontSize: 16,
    fontWeight: 'bold',
  },
  helperText: {
    marginTop: 20,
    textAlign: 'center',
    color: Colors.gray,
    fontSize: 12,
    fontStyle: 'italic',
  }
});