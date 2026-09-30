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
import { UserRole } from '../../types';

export default function RegisterScreen() {
  const router = useRouter();
  const { register } = useAuth();

  const [role, setRole] = useState<UserRole>('student');
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [studentId, setStudentId] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleRegister = async () => {
    setError(null);
    if (!name.trim()) {
      setError('กรุณากรอกชื่อ-นามสกุล');
      return;
    }
    if (!email.trim() || !email.includes('@')) {
      setError('กรุณากรอกอีเมลที่ถูกต้อง');
      return;
    }
    if (role === 'student' && !studentId.trim()) {
      setError('กรุณากรอกรหัสนักศึกษา');
      return;
    }
    if (password.length < 4) {
      setError('รหัสผ่านต้องมีความยาวอย่างน้อย 4 ตัวอักษร');
      return;
    }
    if (password !== confirmPassword) {
      setError('รหัสผ่านยืนยันไม่ตรงกัน');
      return;
    }

    try {
      setLoading(true);
      const newUser = await register({
        name,
        email,
        studentId: role === 'student' ? studentId : undefined,
        role,
        password,
      });

      if (newUser.role === 'teacher') {
        router.replace('/(teacher)/home');
      } else {
        router.replace('/(student)/home');
      }
    } catch (err: any) {
      setError(err?.message || 'การลงทะเบียนไม่สำเร็จ');
    } finally {
      setLoading(false);
    }
  };

  return (
    <KeyboardAvoidingView
      behavior={Platform.OS === 'ios' ? 'padding' : undefined}
      style={styles.keyboardContainer}
    >
      <ScrollView contentContainerStyle={styles.container} keyboardShouldPersistTaps="handled">
        <View style={styles.card}>
          <Text style={styles.cardHeader}>ลงทะเบียนผู้ใช้งานใหม่</Text>
          <Text style={styles.cardSub}>กรอกข้อมูลเพื่อสร้างบัญชีผู้ใช้งานระบบเช็กชื่อ</Text>
          <View style={styles.headerDivider} />

          <ErrorMessage message={error || ''} />

          {/* Role Selector Tabs */}
          <Text style={styles.label}>ประเภทผู้ใช้งาน</Text>
          <View style={styles.roleContainer}>
            <TouchableOpacity
              style={[styles.roleTab, role === 'student' && styles.roleTabActive]}
              onPress={() => setRole('student')}
            >
              <Text style={[styles.roleTabText, role === 'student' && styles.roleTabTextActive]}>
                นักศึกษา
              </Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={[styles.roleTab, role === 'teacher' && styles.roleTabActive]}
              onPress={() => setRole('teacher')}
            >
              <Text style={[styles.roleTabText, role === 'teacher' && styles.roleTabTextActive]}>
                อาจารย์ผู้สอน
              </Text>
            </TouchableOpacity>
          </View>

          <View style={styles.inputGroup}>
            <Text style={styles.label}>ชื่อ - นามสกุล</Text>
            <TextInput
              style={styles.input}
              placeholder="เช่น นายสมชาย ใจดี"
              placeholderTextColor={Colors.inkFaint}
              value={name}
              onChangeText={setName}
            />
          </View>

          <View style={styles.inputGroup}>
            <Text style={styles.label}>อีเมล</Text>
            <TextInput
              style={styles.input}
              placeholder="เช่น somchai@example.com"
              placeholderTextColor={Colors.inkFaint}
              value={email}
              onChangeText={setEmail}
              keyboardType="email-address"
              autoCapitalize="none"
            />
          </View>

          {role === 'student' && (
            <View style={styles.inputGroup}>
              <Text style={styles.label}>รหัสนักศึกษา (10 หลัก)</Text>
              <TextInput
                style={styles.input}
                placeholder="เช่น 6501234567"
                placeholderTextColor={Colors.inkFaint}
                value={studentId}
                onChangeText={setStudentId}
                keyboardType="numeric"
              />
            </View>
          )}

          <View style={styles.inputGroup}>
            <Text style={styles.label}>รหัสผ่าน</Text>
            <TextInput
              style={styles.input}
              placeholder="••••••••"
              placeholderTextColor={Colors.inkFaint}
              value={password}
              onChangeText={setPassword}
              secureTextEntry
            />
          </View>

          <View style={styles.inputGroup}>
            <Text style={styles.label}>ยืนยันรหัสผ่าน</Text>
            <TextInput
              style={styles.input}
              placeholder="••••••••"
              placeholderTextColor={Colors.inkFaint}
              value={confirmPassword}
              onChangeText={setConfirmPassword}
              secureTextEntry
            />
          </View>

          <PrimaryButton
            title="ยืนยันการลงทะเบียน"
            variant="primary"
            loading={loading}
            onPress={handleRegister}
            style={{ marginTop: 8 }}
          />

          <TouchableOpacity
            style={styles.backButton}
            onPress={() => router.back()}
          >
            <Text style={styles.backButtonText}>← กลับไปยังหน้าเข้าสู่ระบบ</Text>
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
    paddingTop: 10,
    paddingBottom: 40,
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
  cardSub: {
    fontSize: 11,
    color: Colors.inkMuted,
    marginTop: 2,
  },
  headerDivider: {
    height: 2,
    backgroundColor: Colors.inkDark,
    marginTop: 8,
    marginBottom: 16,
  },
  roleContainer: {
    flexDirection: 'row',
    gap: 8,
    marginBottom: 16,
  },
  roleTab: {
    flex: 1,
    height: 40,
    borderWidth: 1.5,
    borderColor: Colors.inkDark,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: Colors.panelBackground,
    borderRadius: 3,
  },
  roleTabActive: {
    backgroundColor: Colors.inkDark,
  },
  roleTabText: {
    fontSize: 11,
    fontWeight: '800',
    color: Colors.inkDark,
    letterSpacing: 0.8,
  },
  roleTabTextActive: {
    color: '#FFFFFF',
  },
  inputGroup: {
    marginBottom: 14,
  },
  label: {
    fontSize: 11,
    fontWeight: '800',
    color: Colors.inkMuted,
    letterSpacing: 0.8,
    marginBottom: 6,
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
  backButton: {
    marginTop: 14,
    alignItems: 'center',
  },
  backButtonText: {
    fontSize: 12,
    fontWeight: '800',
    color: Colors.inkDark,
    letterSpacing: 0.8,
  },
});
