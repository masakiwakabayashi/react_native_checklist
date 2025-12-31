import { Header } from '@/components/header';
import { DefaultTheme, ThemeProvider } from '@react-navigation/native';
import { Stack, usePathname, useRouter } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import { useEffect, useMemo } from 'react';
import { ActivityIndicator, StyleSheet, View } from 'react-native';
import 'react-native-reanimated';
import { SafeAreaView } from 'react-native-safe-area-context';

// 次はページ遷移のところを全体的になんとかする

import { AuthProvider, useAuth } from '@/contexts/auth-context';

export const unstable_settings = {
  anchor: '(tabs)',
};

export default function RootLayout() {
  return (
    <AuthProvider>
      <ThemeProvider value={DefaultTheme}>
        <SafeAreaView edges={['top', 'left', 'right']} style={styles.safeArea}>
          <AuthNavigator />
        </SafeAreaView>
        <StatusBar style="auto" />
      </ThemeProvider>
    </AuthProvider>
  );
}

function AuthNavigator() {
  const router = useRouter();
  const pathname = usePathname();
  const { session, initializing } = useAuth();

  const isAuthRoute = useMemo(() => pathname?.startsWith('/login'), [pathname]);

  useEffect(() => {
    if (initializing) return;

    if (!session && !isAuthRoute) {
      router.replace('/login');
      return;
    }

    if (session && isAuthRoute) {
      router.replace('/(tabs)');
    }
  }, [session, initializing, isAuthRoute, router]);

  if (initializing) {
    return (
      <View style={styles.centerContent}>
        <ActivityIndicator />
      </View>
    );
  }

  return (
    <Stack>
      <Stack.Screen 
        name="(tabs)" 
        options={{ 
          // ログインページ以外は共通のヘッダー
          header: () => <Header />,
        }}
      />
      <Stack.Screen
        name="template/create"
        options={{
          header: () => <Header />,
        }}
      />
      <Stack.Screen
        name="template/[id]"
        options={{
          header: () => <Header />,
        }}
      />
      <Stack.Screen
        name="template/[id]/edit"
        options={{
          header: () => <Header />,
        }}
      />
      <Stack.Screen
        name="template/[id]/run"
        options={{
          header: () => <Header />,
        }}
      />
      <Stack.Screen name="login" options={{ headerShown: false }} />
    </Stack>
  );
}

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: '#fff',
  },
  centerContent: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
});
