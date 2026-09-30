import React, { useEffect } from 'react';
import { View, Text, StyleSheet, ActivityIndicator } from 'react-native';
import { useRouter } from 'expo-router';
import { useAuth } from '../contexts/AuthContext';
import Colors from '../constants/Colors';

export default function SplashScreen() {
  const router = useRouter();
  const { user, isLoading } = useAuth();

  useEffect(() => {
    if (isLoading) return;

    const timer = setTimeout(() => {
      if (!user) {
        router.replace('/(auth)/login');
      } else if (user.role === 'teacher') {
        router.replace('/(teacher)/home');
      } else {
        router.replace('/(student)/home');
      }
    }, 900);

    return () => clearTimeout(timer);
  }, [user, isLoading]);

  return (
    <View style={styles.container}>
      <View style={styles.stampBorder}>
        <Text style={styles.tag}>ระบบยืนยันการเข้าเรียน</Text>
      </View>

      <Text style={styles.title}>PRESENT, PLEASE.</Text>
      <Text style={styles.tagline}>ระบบเช็กชื่อและยืนยันการเข้าชั้นเรียน</Text>

      <View style={styles.divider} />

      <ActivityIndicator size="small" color={Colors.inkDark} style={{ marginTop: 24 }} />
      <Text style={styles.statusText}>กำลังตรวจสอบข้อมูลผู้ใช้งาน...</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.background,
    alignItems: 'center',
    justifyContent: 'center',
    padding: 24,
  },
  stampBorder: {
    borderWidth: 2,
    borderColor: Colors.inkDark,
    paddingHorizontal: 12,
    paddingVertical: 5,
    borderRadius: 2,
    marginBottom: 16,
  },
  tag: {
    fontSize: 10,
    fontWeight: '900',
    color: Colors.inkDark,
    letterSpacing: 1.5,
  },
  title: {
    fontSize: 32,
    fontWeight: '900',
    color: Colors.inkDark,
    letterSpacing: 2,
    textAlign: 'center',
  },
  tagline: {
    fontSize: 16,
    fontWeight: '600',
    color: Colors.inkMuted,
    marginTop: 8,
    letterSpacing: 1,
    fontStyle: 'italic',
  },
  divider: {
    width: 60,
    height: 3,
    backgroundColor: Colors.inkDark,
    marginTop: 20,
  },
  statusText: {
    fontSize: 11,
    fontWeight: '800',
    color: Colors.inkMuted,
    letterSpacing: 1.2,
    marginTop: 10,
  },
});
