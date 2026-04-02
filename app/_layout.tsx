import { useEffect } from 'react';
import { Slot, router } from 'expo-router';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { View, ActivityIndicator } from 'react-native';
import { useAuthStore } from '@/src/store/authStore';
import { Colors } from '@/src/theme/colors';

const queryClient = new QueryClient({
  defaultOptions: { queries: { retry: 2, staleTime: 1000 * 60 * 5 } },
});

export default function RootLayout() {
  const { isLoading, loadFromStorage } = useAuthStore();

  useEffect(() => { loadFromStorage(); }, []);

  if (isLoading) {
    return (
      <View style={{ flex: 1, justifyContent: 'center',
        alignItems: 'center', backgroundColor: Colors.background }}>
        <ActivityIndicator color={Colors.primary} size="large" />
      </View>
    );
  }

  return (
    <QueryClientProvider client={queryClient}>
      <Slot />
    </QueryClientProvider>
  );
}