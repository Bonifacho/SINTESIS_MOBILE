import { Redirect } from 'expo-router';
import { useAuthStore } from '@/src/store/authStore';
import { View, ActivityIndicator } from 'react-native';
import { Colors } from '@/src/theme/colors';

export default function Index() {
  const { user, isLoading } = useAuthStore();

  if (isLoading) {
    return (
      <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center', backgroundColor: Colors.background }}>
        <ActivityIndicator color={Colors.primary} size="large" />
      </View>
    );
  }

  if (!user) {
    return <Redirect href="/(auth)/login" />;
  }

  if (user.role === 'docente') {
    return <Redirect href="/(teacher)" />;
  }

  return <Redirect href="/(student)" />;
}