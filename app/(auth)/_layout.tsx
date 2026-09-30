import { Stack } from 'expo-router';
import Colors from '../../constants/Colors';

export default function AuthLayout() {
  return (
    <Stack
      screenOptions={{
        headerStyle: {
          backgroundColor: Colors.cardBackground,
        },
        headerTintColor: Colors.inkDark,
        headerTitleStyle: {
          fontWeight: '800',
          fontSize: 15,
        },
        headerShadowVisible: false,
        contentStyle: {
          backgroundColor: Colors.background,
        },
      }}
    >
      <Stack.Screen name="login" options={{ title: 'เข้าสู่ระบบ', headerShown: false }} />
      <Stack.Screen name="register" options={{ title: 'ลงทะเบียนบัญชีใหม่' }} />
    </Stack>
  );
}
