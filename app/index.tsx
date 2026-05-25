import { Redirect } from 'expo-router';
import { useAuthStore } from '../src/store/authStore';
import { View, ActivityIndicator } from 'react-native';
import { Colors } from '../src/theme/colors';

export default function Index() {
  const { user, token } = useAuthStore();

  if (!token || !user) {
    return <Redirect href="/(auth)/login" />;
  }


  if (user.role === 'docente') {
    return <Redirect href="/(teacher)" />;
  }
  
  if (user.role === 'practicante') {
    return <Redirect href="/(trainee)" />;
  }

  return <Redirect href="/(student)" />;
}