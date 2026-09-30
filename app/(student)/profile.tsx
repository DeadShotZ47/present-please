import React, { useState } from 'react';
import { View, Text, StyleSheet, Image, ScrollView, TouchableOpacity } from 'react-native';
import { useRouter } from 'expo-router';
import { useAuth } from '../../contexts/AuthContext';
import Colors from '../../constants/Colors';
import { PrimaryButton } from '../../components/PrimaryButton';
import { notificationService } from '../../services/notification';
import { EditProfileImageModal } from '../../components/EditProfileImageModal';

export default function StudentProfileScreen() {
  const router = useRouter();
  const { user, logout, updateUserProfile } = useAuth();
  const [testingNotif, setTestingNotif] = useState(false);
  const [editImageModalVisible, setEditImageModalVisible] = useState(false);

  const handleTestNotif = async () => {
    setTestingNotif(true);
    try {
      await notificationService.sendTestNotification();
    } finally {
      setTestingNotif(false);
    }
  };

  const handleLogout = async () => {
    await logout();
    router.replace('/(auth)/login');
  };

  return (
    <ScrollView style={styles.container} contentContainerStyle={styles.content}>
      <View style={styles.badgeHeader}>
        <Text style={styles.badgeHeaderText}>ข้อมูลบัญชีผู้ใช้งาน</Text>
      </View>

      {/* ID Badge Card */}
      <View style={styles.idCard}>
        <View style={styles.topBar}>
          <Text style={styles.cardType}>บัตรประจำตัวนักศึกษา</Text>
          <Text style={styles.validYear}>ปีการศึกษา 2026</Text>
        </View>

        <View style={styles.profileRow}>
          <TouchableOpacity
            style={styles.avatarTouchable}
            onPress={() => setEditImageModalVisible(true)}
            activeOpacity={0.8}
          >
            <View style={styles.avatarFrame}>
              {user?.profileImage ? (
                <Image source={{ uri: user.profileImage }} style={styles.avatar} />
              ) : (
                <View style={styles.avatarPlaceholder}>
                  <Text style={{ fontSize: 24 }}>👤</Text>
                  <Text style={styles.avatarPlaceholderText}>เพิ่มรูปถ่าย</Text>
                </View>
              )}
            </View>
            <View style={styles.cameraBadge}>
              <Text style={styles.cameraBadgeIcon}>📷</Text>
            </View>
          </TouchableOpacity>

          <View style={styles.mainInfo}>
            <Text style={styles.name}>{user?.name || 'นักศึกษา'}</Text>
            <Text style={styles.roleTag}>สถานะ: นักศึกษาลงทะเบียน</Text>
            <Text style={styles.dept}>{user?.department || 'วิทยาลัยการคอมพิวเตอร์'}</Text>

            <TouchableOpacity
              style={styles.changePhotoBtn}
              onPress={() => setEditImageModalVisible(true)}
              activeOpacity={0.7}
            >
              <Text style={styles.changePhotoBtnText}>📷 เปลี่ยนรูปโปรไฟล์</Text>
            </TouchableOpacity>
          </View>
        </View>

        <View style={styles.divider} />

        <View style={styles.infoGrid}>
          <View style={styles.field}>
            <Text style={styles.label}>รหัสนักศึกษา</Text>
            <Text style={styles.value}>{user?.studentId || '6501234567'}</Text>
          </View>
          <View style={styles.field}>
            <Text style={styles.label}>อีเมล</Text>
            <Text style={styles.value}>{user?.email || 'student@example.com'}</Text>
          </View>
          <View style={styles.field}>
            <Text style={styles.label}>สิทธิ์การใช้งาน</Text>
            <Text style={styles.value}>นักศึกษา (Student)</Text>
          </View>
        </View>

        <View style={styles.signatureSection}>
          <Text style={styles.seal}>ยืนยันตัวตนในระบบแล้ว</Text>
        </View>
      </View>

      {/* Test Notification Card */}
      <View style={styles.notifCard}>
        <Text style={styles.notifTitle}>🔔 ระบบการแจ้งเตือน (Notifications)</Text>
        <Text style={styles.notifDesc}>
          ทดสอบยิงการแจ้งเตือนเตือนเข้าเรียนตามเงื่อนไข Section 29
        </Text>
        <PrimaryButton
          title="ทดสอบยิงแจ้งเตือนเตือนเข้าเรียน"
          variant="secondary"
          loading={testingNotif}
          onPress={handleTestNotif}
          style={{ marginTop: 10 }}
        />
      </View>

      <PrimaryButton
        title="ออกจากระบบ"
        variant="danger"
        onPress={handleLogout}
        style={{ marginTop: 14 }}
      />

      {/* Edit Profile Image Modal */}
      <EditProfileImageModal
        visible={editImageModalVisible}
        currentImage={user?.profileImage}
        onImageUpdated={async (newUri) => {
          await updateUserProfile({ profileImage: newUri || undefined });
        }}
        onClose={() => setEditImageModalVisible(false)}
      />
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.background,
  },
  content: {
    padding: 16,
    paddingBottom: 40,
  },
  badgeHeader: {
    alignItems: 'center',
    marginBottom: 12,
  },
  badgeHeaderText: {
    fontSize: 9,
    fontWeight: '900',
    color: Colors.inkMuted,
    letterSpacing: 1.2,
  },
  idCard: {
    backgroundColor: Colors.cardBackground,
    borderWidth: 2.5,
    borderColor: Colors.inkDark,
    borderRadius: 4,
    padding: 18,
    shadowColor: Colors.inkDark,
    shadowOffset: { width: 3, height: 3 },
    shadowOpacity: 0.18,
    shadowRadius: 0,
    elevation: 4,
  },
  topBar: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    borderBottomWidth: 1.5,
    borderColor: Colors.inkDark,
    paddingBottom: 8,
    marginBottom: 14,
  },
  cardType: {
    fontSize: 10,
    fontWeight: '900',
    color: Colors.inkDark,
    letterSpacing: 1,
  },
  validYear: {
    fontSize: 10,
    fontWeight: '800',
    color: Colors.inkMuted,
  },
  profileRow: {
    flexDirection: 'row',
    gap: 14,
    alignItems: 'center',
  },
  avatarTouchable: {
    position: 'relative',
  },
  avatarFrame: {
    width: 80,
    height: 95,
    borderWidth: 2,
    borderColor: Colors.inkDark,
    borderRadius: 3,
    overflow: 'hidden',
    backgroundColor: Colors.panelBackground,
  },
  cameraBadge: {
    position: 'absolute',
    bottom: -6,
    right: -6,
    backgroundColor: '#FFFFFF',
    borderWidth: 1.5,
    borderColor: Colors.inkDark,
    borderRadius: 12,
    width: 24,
    height: 24,
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: Colors.inkDark,
    shadowOffset: { width: 1, height: 1 },
    shadowOpacity: 0.2,
    shadowRadius: 0,
    elevation: 3,
  },
  cameraBadgeIcon: {
    fontSize: 12,
  },
  avatar: {
    width: '100%',
    height: '100%',
  },
  avatarPlaceholder: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  avatarPlaceholderText: {
    fontSize: 10,
    fontWeight: '800',
    color: Colors.inkMuted,
    marginTop: 2,
  },
  mainInfo: {
    flex: 1,
  },
  changePhotoBtn: {
    marginTop: 8,
    backgroundColor: Colors.panelBackground,
    borderWidth: 1.5,
    borderColor: Colors.inkDark,
    borderRadius: 3,
    paddingVertical: 5,
    paddingHorizontal: 8,
    alignSelf: 'flex-start',
  },
  changePhotoBtnText: {
    fontSize: 10,
    fontWeight: '800',
    color: Colors.inkDark,
  },
  name: {
    fontSize: 18,
    fontWeight: '900',
    color: Colors.inkDark,
  },
  roleTag: {
    fontSize: 10,
    fontWeight: '800',
    color: Colors.stampGreen,
    marginTop: 4,
    letterSpacing: 0.5,
  },
  dept: {
    fontSize: 12,
    color: Colors.inkMuted,
    marginTop: 2,
    fontWeight: '600',
  },
  divider: {
    height: 1,
    backgroundColor: Colors.borderLight,
    marginVertical: 14,
  },
  infoGrid: {
    gap: 10,
  },
  field: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  label: {
    fontSize: 10,
    fontWeight: '700',
    color: Colors.inkMuted,
    letterSpacing: 0.6,
  },
  value: {
    fontSize: 12,
    fontWeight: '800',
    color: Colors.inkDark,
  },
  signatureSection: {
    marginTop: 16,
    paddingTop: 10,
    borderTopWidth: 1,
    borderColor: Colors.borderLight,
    alignItems: 'center',
  },
  seal: {
    fontSize: 10,
    fontWeight: '900',
    color: Colors.inkFaint,
    letterSpacing: 1.5,
  },
  notifCard: {
    backgroundColor: '#FAF7EE',
    borderWidth: 1.5,
    borderColor: Colors.stampAmber,
    borderRadius: 4,
    padding: 14,
    marginTop: 16,
  },
  notifTitle: {
    fontSize: 12,
    fontWeight: '900',
    color: Colors.inkDark,
    letterSpacing: 0.5,
  },
  notifDesc: {
    fontSize: 11,
    color: Colors.inkMuted,
    marginTop: 2,
    lineHeight: 16,
  },
});
