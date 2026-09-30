import React, { useEffect } from 'react';
import { Stack } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import { AuthProvider } from '../contexts/AuthContext';
import Colors from '../constants/Colors';
import { ensureNotificationPermission } from '../services/notification';

export default function RootLayout() {
  useEffect(() => {
    // Configure notification channels & check permissions on mount (same pattern as expo-location)
    ensureNotificationPermission().catch((err) => {
      console.warn('Initial notification setup warning:', err);
    });
  }, []);

  return (
    <SafeAreaProvider>
      <AuthProvider>
        <StatusBar style="dark" />
        <Stack
          screenOptions={{
            headerStyle: {
              backgroundColor: Colors.cardBackground,
            },
            headerTintColor: Colors.inkDark,
            headerTitleStyle: {
              fontWeight: '800',
              fontSize: 16,
            },
            headerShadowVisible: false,
            contentStyle: {
              backgroundColor: Colors.background,
            },
          }}
        >
          <Stack.Screen name="index" options={{ headerShown: false }} />
          <Stack.Screen name="(auth)" options={{ headerShown: false }} />
          <Stack.Screen name="(student)" options={{ headerShown: false }} />
          <Stack.Screen name="(teacher)" options={{ headerShown: false }} />
        </Stack>
      </AuthProvider>
    </SafeAreaProvider>
  );
}
