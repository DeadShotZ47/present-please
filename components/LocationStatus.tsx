import React from 'react';
import { View, Text, StyleSheet, ActivityIndicator } from 'react-native';
import Colors from '../constants/Colors';
import { PrimaryButton } from './PrimaryButton';

interface LocationStatusProps {
  loading: boolean;
  verified: boolean;
  distance: number | null;
  accuracy: number | null;
  allowedRadius: number;
  errorMessage?: string | null;
  onRetry: () => void;
}

export const LocationStatus: React.FC<LocationStatusProps> = ({
  loading,
  verified,
  distance,
  accuracy,
  allowedRadius,
  errorMessage,
  onRetry,
}) => {
  if (loading) {
    return (
      <View style={styles.card}>
        <ActivityIndicator size="small" color={Colors.inkDark} />
        <Text style={styles.loadingText}>กำลังตรวจสอบพิกัด GPS...</Text>
        <Text style={styles.subText}>กำลังรับสัญญาณเพื่อระบุตำแหน่งที่แม่นยำ</Text>
      </View>
    );
  }

  if (errorMessage) {
    return (
      <View style={[styles.card, styles.cardFailed]}>
        <Text style={styles.failTitle}>✕ ตรวจสอบตำแหน่งไม่ผ่าน</Text>
        <Text style={styles.failDetail}>{errorMessage}</Text>
        <PrimaryButton
          title="ตรวจสอบตำแหน่งใหม่อีกครั้ง"
          variant="secondary"
          onPress={onRetry}
          style={{ marginTop: 12 }}
        />
      </View>
    );
  }

  if (distance === null) {
    return (
      <View style={styles.card}>
        <Text style={styles.neutralTitle}>ขั้นตอนที่ 1: ตรวจสอบตำแหน่งห้องเรียน</Text>
        <Text style={styles.neutralText}>
          ระบบจะตรวจสอบว่าพิกัดของคุณอยู่ในรัศมีของห้องเรียนหรือไม่ (ไม่เกิน {allowedRadius} เมตร)
        </Text>
        <PrimaryButton
          title="ตรวจสอบตำแหน่งปัจจุบัน"
          variant="primary"
          onPress={onRetry}
          style={{ marginTop: 12 }}
        />
      </View>
    );
  }

  if (!verified) {
    return (
      <View style={[styles.card, styles.cardFailed]}>
        <Text style={styles.failTitle}>✕ ตรวจสอบตำแหน่งไม่ผ่าน</Text>
        <Text style={styles.failDetail}>
          คุณอยู่ห่างจากห้องเรียนประมาณ <Text style={{ fontWeight: '900' }}>{distance} เมตร</Text>
        </Text>
        <Text style={styles.criteria}>รัศมีที่อนุญาต: {allowedRadius} เมตร</Text>
        {accuracy !== null && (
          <Text style={styles.criteria}>ความแม่นยำของ GPS: ±{accuracy} เมตร</Text>
        )}
        <PrimaryButton
          title="ลองตรวจสอบตำแหน่งใหม่"
          variant="secondary"
          onPress={onRetry}
          style={{ marginTop: 12 }}
        />
      </View>
    );
  }

  return (
    <View style={[styles.card, styles.cardSuccess]}>
      <Text style={styles.successTitle}>✓ ตำแหน่งถูกต้อง (อยู่ในห้องเรียน)</Text>
      <View style={styles.successRow}>
        <View>
          <Text style={styles.label}>ระยะห่างจากห้อง</Text>
          <Text style={styles.successValue}>{distance} ม.</Text>
        </View>
        <View>
          <Text style={styles.label}>ความแม่นยำ GPS</Text>
          <Text style={styles.successValue}>±{accuracy || 8} ม.</Text>
        </View>
        <View>
          <Text style={styles.label}>ผลการตรวจ</Text>
          <Text style={[styles.successValue, { color: Colors.stampGreen }]}>ผ่าน</Text>
        </View>
      </View>
      <PrimaryButton
        title="ตรวจสอบตำแหน่งซ้ำ"
        variant="outline"
        onPress={onRetry}
        style={{ marginTop: 12, height: 38 }}
        textStyle={{ fontSize: 12 }}
      />
    </View>
  );
};

const styles = StyleSheet.create({
  card: {
    backgroundColor: Colors.cardBackground,
    borderWidth: 2,
    borderColor: Colors.inkDark,
    borderRadius: 4,
    padding: 16,
    marginVertical: 8,
  },
  cardSuccess: {
    borderColor: Colors.stampGreen,
    backgroundColor: '#F3FAF5',
  },
  cardFailed: {
    borderColor: Colors.stampRed,
    backgroundColor: '#FFF5F4',
  },
  loadingText: {
    fontSize: 13,
    fontWeight: '800',
    color: Colors.inkDark,
    textAlign: 'center',
    marginTop: 8,
    letterSpacing: 0.8,
  },
  subText: {
    fontSize: 12,
    color: Colors.inkMuted,
    textAlign: 'center',
    marginTop: 4,
  },
  neutralTitle: {
    fontSize: 14,
    fontWeight: '800',
    color: Colors.inkDark,
    letterSpacing: 0.8,
  },
  neutralText: {
    fontSize: 13,
    color: Colors.inkMuted,
    marginTop: 4,
    lineHeight: 18,
  },
  successTitle: {
    fontSize: 15,
    fontWeight: '900',
    color: Colors.stampGreen,
    letterSpacing: 1,
    marginBottom: 8,
  },
  successRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingVertical: 6,
  },
  label: {
    fontSize: 10,
    fontWeight: '700',
    color: Colors.inkMuted,
    letterSpacing: 0.5,
  },
  successValue: {
    fontSize: 15,
    fontWeight: '800',
    color: Colors.inkDark,
    marginTop: 2,
  },
  failTitle: {
    fontSize: 15,
    fontWeight: '900',
    color: Colors.stampRed,
    letterSpacing: 1,
    marginBottom: 6,
  },
  failDetail: {
    fontSize: 13,
    color: Colors.inkDark,
    lineHeight: 18,
  },
  criteria: {
    fontSize: 12,
    color: Colors.inkMuted,
    marginTop: 4,
  },
});
