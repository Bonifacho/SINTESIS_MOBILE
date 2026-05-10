import { Redirect } from 'expo-router';
import { useAuthStore } from '../src/store/authStore';
import { View, ActivityIndicator } from 'react-native';
import { Colors } from '../src/theme/colors';

export default function Index() {
  const { user, token } = useAuthStore();

  if (!token || !user) {
    return <Redirect href="/(auth)/login" />;
  }

  // EL ENRUTAMIENTO CORREGIDO:
  if (user.role === 'docente') {
    return <Redirect href="/(teacher)" />;
  }
  
  if (user.role === 'practicante') { // <-- ¡ESTO ES LO QUE TE VA A SALVAR!
    return <Redirect href="/(trainee)" />;
  }

  return <Redirect href="/(student)" />;
}