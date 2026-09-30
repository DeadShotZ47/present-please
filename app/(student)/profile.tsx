import React from 'react';
import { View, Text, StyleSheet, Image, ScrollView } from 'react-native';
import { useRouter } from 'expo-router';
import { useAuth } from '../../contexts/AuthContext';
import Colors from '../../constants/Colors';
import { PrimaryButton } from '../../components/PrimaryButton';

export default function StudentProfileScreen() {
  const router = useRouter();
  const { user, logout } = useAuth();

  const handleLogout = async () => {
    await logout();
    router.replace('/(auth)/login');
  };

  return (
    <ScrollView style={styles.container} contentContainerStyle={styles.content}>
      <View style={styles.badgeHeader}>
        <Text style={styles.badgeHeaderText}>MINISTRY OF HIGHER EDUCATION & DISCIPLINE</Text>
      </View>

      {/* ID Badge Card */}
      <View style={styles.idCard}>
        <View style={styles.topBar}>
          <Text style={styles.cardType}>STUDENT IDENTIFICATION PERMIT</Text>
          <Text style={styles.validYear}>VALID: 2026</Text>
        </View>

        <View style={styles.profileRow}>
          <View style={styles.avatarFrame}>
            {user?.profileImage ? (
              <Image source={{ uri: user.profileImage }} style={styles.avatar} />
            ) : (
              <View style={styles.avatarPlaceholder}>
                <Text style={styles.avatarPlaceholderText}>PHOTO</Text>
              </View>
            )}
          </View>
          <View style={styles.mainInfo}>
            <Text style={styles.name}>{user?.name || 'STUDENT CITIZEN'}</Text>
            <Text style={styles.roleTag}>STATUS: REGISTERED STUDENT</Text>
            <Text style={styles.dept}>{user?.department || 'College of Computing'}</Text>
          </View>
        </View>

        <View style={styles.divider} />

        <View style={styles.infoGrid}>
          <View style={styles.field}>
            <Text style={styles.label}>STUDENT IDENTIFIER</Text>
            <Text style={styles.value}>{user?.studentId || '6501234567'}</Text>
          </View>
          <View style={styles.field}>
            <Text style={styles.label}>INSTITUTIONAL EMAIL</Text>
            <Text style={styles.value}>{user?.email || 'student@example.com'}</Text>
          </View>
          <View style={styles.field}>
            <Text style={styles.label}>SYSTEM ACCESS LEVEL</Text>
            <Text style={styles.value}>STANDARD (STUDENT)</Text>
          </View>
        </View>

        <View style={styles.signatureSection}>
          <Text style={styles.seal}>OFFICIAL STAMP: VERIFIED</Text>
        </View>
      </View>

      <PrimaryButton
        title="SURRENDER CREDENTIALS & LOGOUT"
        variant="danger"
        onPress={handleLogout}
        style={{ marginTop: 24 }}
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
  avatarFrame: {
    width: 80,
    height: 95,
    borderWidth: 2,
    borderColor: Colors.inkDark,
    borderRadius: 3,
    overflow: 'hidden',
    backgroundColor: Colors.panelBackground,
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
    fontSize: 11,
    fontWeight: '800',
    color: Colors.inkMuted,
  },
  mainInfo: {
    flex: 1,
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
});
