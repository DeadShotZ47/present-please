import React, { useState } from 'react';
import {
  View,
  Text,
  TextInput,
  StyleSheet,
  TouchableOpacity,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
} from 'react-native';
import { useRouter } from 'expo-router';
import { useAuth } from '../../contexts/AuthContext';
import Colors from '../../constants/Colors';
import { PrimaryButton } from '../../components/PrimaryButton';
import { ErrorMessage } from '../../components/ErrorMessage';

export default function LoginScreen() {
  const router = useRouter();
  const { login } = useAuth();

  const [identifier, setIdentifier] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleLogin = async () => {
    setError(null);
    if (!identifier.trim()) {
      setError('กรุณากรอกอีเมลหรือรหัสนักศึกษา');
      return;
    }
    if (!password) {
      setError('กรุณากรอกรหัสผ่าน');
      return;
    }

    try {
      setLoading(true);
      const user = await login(identifier, password);
      if (user.role === 'teacher') {
        router.replace('/(teacher)/home');
      } else {
        router.replace('/(student)/home');
      }
    } catch (err: any) {
      setError(err?.message || 'เข้าสู่ระบบไม่สำเร็จ ข้อมูลไม่ถูกต้อง');
    } finally {
      setLoading(false);
    }
  };

  const fillDemo = (role: 'student' | 'teacher') => {
    if (role === 'student') {
      setIdentifier('student@example.com');
      setPassword('password123');
    } else {
      setIdentifier('teacher@example.com');
      setPassword('password123');
    }
    setError(null);
  };

  return (
    <KeyboardAvoidingView
      behavior={Platform.OS === 'ios' ? 'padding' : undefined}
      style={styles.keyboardContainer}
    >
      <ScrollView contentContainerStyle={styles.container} keyboardShouldPersistTaps="handled">
        {/* Header Document Section */}
        <View style={styles.header}>
          <View style={styles.stampBadge}>
            <Text style={styles.stampText}>ระบบยืนยันการเข้าเรียน</Text>
          </View>
          <Text style={styles.title}>PRESENT, PLEASE.</Text>
          <Text style={styles.subtitle}>ระบบตรวจสอบและบันทึกการเข้าเรียน</Text>
        </View>

        {/* Main Inspection Form Card */}
        <View style={styles.card}>
          <Text style={styles.cardHeader}>เข้าสู่ระบบ (นักศึกษา / อาจารย์)</Text>
          <View style={styles.headerDivider} />

          <ErrorMessage message={error || ''} />

          <View style={styles.inputGroup}>
            <Text style={styles.label}>อีเมล หรือ รหัสนักศึกษา</Text>
            <TextInput
              style={styles.input}
              placeholder="เช่น 6501234567 หรืออีเมล"
              placeholderTextColor={Colors.inkFaint}
              value={identifier}
              onChangeText={setIdentifier}
              autoCapitalize="none"
              autoCorrect={false}
            />
          </View>

          <View style={styles.inputGroup}>
            <View style={styles.labelRow}>
              <Text style={styles.label}>รหัสผ่าน</Text>
              <TouchableOpacity onPress={() => setShowPassword(!showPassword)}>
                <Text style={styles.showHideText}>{showPassword ? 'ซ่อน' : 'แสดง'}</Text>
              </TouchableOpacity>
            </View>
            <TextInput
              style={styles.input}
              placeholder="••••••••"
              placeholderTextColor={Colors.inkFaint}
              value={password}
              onChangeText={setPassword}
              secureTextEntry={!showPassword}
              autoCapitalize="none"
            />
          </View>

          <PrimaryButton
            title="เข้าสู่ระบบ"
            variant="primary"
            loading={loading}
            onPress={handleLogin}
            style={{ marginTop: 12 }}
          />

          <View style={styles.demoSection}>
            <Text style={styles.demoTitle}>บัญชีทดสอบด่วน:</Text>
            <View style={styles.demoRow}>
              <TouchableOpacity
                style={styles.demoChip}
                onPress={() => fillDemo('student')}
              >
                <Text style={styles.demoChipText}>นักศึกษา (Demo)</Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={styles.demoChip}
                onPress={() => fillDemo('teacher')}
              >
                <Text style={styles.demoChipText}>อาจารย์ (Demo)</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>

        {/* Footer */}
        <View style={styles.footer}>
          <Text style={styles.footerText}>ยังไม่มีบัญชีผู้ใช้งานใช่หรือไม่?</Text>
          <TouchableOpacity onPress={() => router.push('/(auth)/register')}>
            <Text style={styles.registerLink}>ลงทะเบียนผู้ใช้ใหม่ →</Text>
          </TouchableOpacity>
        </View>
      </ScrollView>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  keyboardContainer: {
    flex: 1,
    backgroundColor: Colors.background,
  },
  container: {
    padding: 20,
    flexGrow: 1,
    justifyContent: 'center',
  },
  header: {
    alignItems: 'center',
    marginBottom: 20,
  },
  stampBadge: {
    borderWidth: 1.5,
    borderColor: Colors.inkMuted,
    paddingHorizontal: 10,
    paddingVertical: 3,
    borderRadius: 2,
    marginBottom: 8,
  },
  stampText: {
    fontSize: 9,
    fontWeight: '900',
    color: Colors.inkMuted,
    letterSpacing: 1.2,
  },
  title: {
    fontSize: 28,
    fontWeight: '900',
    color: Colors.inkDark,
    letterSpacing: 1.5,
  },
  subtitle: {
    fontSize: 12,
    fontWeight: '600',
    color: Colors.inkMuted,
    marginTop: 4,
    letterSpacing: 0.8,
  },
  card: {
    backgroundColor: Colors.cardBackground,
    borderWidth: 2,
    borderColor: Colors.inkDark,
    borderRadius: 4,
    padding: 20,
    shadowColor: Colors.inkDark,
    shadowOffset: { width: 3, height: 3 },
    shadowOpacity: 0.15,
    shadowRadius: 0,
    elevation: 4,
  },
  cardHeader: {
    fontSize: 13,
    fontWeight: '900',
    color: Colors.inkDark,
    letterSpacing: 1.2,
  },
  headerDivider: {
    height: 2,
    backgroundColor: Colors.inkDark,
    marginTop: 8,
    marginBottom: 16,
  },
  inputGroup: {
    marginBottom: 16,
  },
  labelRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  label: {
    fontSize: 11,
    fontWeight: '800',
    color: Colors.inkMuted,
    letterSpacing: 0.8,
    marginBottom: 6,
  },
  showHideText: {
    fontSize: 10,
    fontWeight: '800',
    color: Colors.inkDark,
    letterSpacing: 0.5,
  },
  input: {
    backgroundColor: '#FFFFFF',
    borderWidth: 1.5,
    borderColor: Colors.inkDark,
    borderRadius: 3,
    height: 44,
    paddingHorizontal: 12,
    fontSize: 14,
    fontWeight: '600',
    color: Colors.inkDark,
  },
  demoSection: {
    marginTop: 20,
    paddingTop: 14,
    borderTopWidth: 1,
    borderColor: Colors.borderLight,
  },
  demoTitle: {
    fontSize: 10,
    fontWeight: '800',
    color: Colors.inkMuted,
    letterSpacing: 0.8,
    marginBottom: 8,
  },
  demoRow: {
    flexDirection: 'row',
    gap: 10,
  },
  demoChip: {
    flex: 1,
    backgroundColor: Colors.panelBackground,
    borderWidth: 1,
    borderColor: Colors.border,
    paddingVertical: 7,
    alignItems: 'center',
    borderRadius: 3,
  },
  demoChipText: {
    fontSize: 10,
    fontWeight: '800',
    color: Colors.inkDark,
    letterSpacing: 0.8,
  },
  footer: {
    marginTop: 24,
    alignItems: 'center',
  },
  footerText: {
    fontSize: 12,
    color: Colors.inkMuted,
    fontWeight: '600',
  },
  registerLink: {
    fontSize: 12,
    fontWeight: '800',
    color: Colors.inkDark,
    marginTop: 4,
    letterSpacing: 0.8,
    textDecorationLine: 'underline',
  },
});
