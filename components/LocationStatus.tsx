import React from 'react';
import { View, Text, StyleSheet, ActivityIndicator } from 'react-native';
import Colors from '../constants/Colors';
import { PrimaryButton } from './PrimaryButton';
import { RealMapView, MapCoordinates } from './RealMapView';

interface LocationStatusProps {
  loading: boolean;
  verified: boolean;
  distance: number | null;
  accuracy: number | null;
  allowedRadius: number;
  errorMessage?: string | null;
  onRetry: () => void;
  classroomCoords?: MapCoordinates;
  classroomName?: string;
  userCoords?: MapCoordinates | null;
}

export const LocationStatus: React.FC<LocationStatusProps> = ({
  loading,
  verified,
  distance,
  accuracy,
  allowedRadius,
  errorMessage,
  onRetry,
  classroomCoords,
  classroomName,
  userCoords,
}) => {
  // If GPS is currently loading
  if (loading) {
    return (
      <View style={styles.card}>
        <ActivityIndicator size="small" color={Colors.inkDark} />
        <Text style={styles.loadingText}>กำลังตรวจสอบพิกัด GPS...</Text>
        <Text style={styles.subText}>กำลังรับสัญญาณเพื่อระบุตำแหน่งที่แม่นยำ</Text>

        {classroomCoords && (
          <View style={styles.mapWrapper}>
            <RealMapView
              classroomCoords={classroomCoords}
              classroomName={classroomName}
              allowedRadius={allowedRadius}
              userCoords={userCoords}
              userAccuracy={accuracy}
              distance={distance}
              isWithinRadius={verified}
              height={190}
            />
          </View>
        )}
      </View>
    );
  }

  // If there is an explicit error message (e.g. permission denied)
  if (errorMessage && distance === null) {
    return (
      <View style={[styles.card, styles.cardFailed]}>
        <Text style={styles.failTitle}>✕ ตรวจสอบตำแหน่งไม่ผ่าน</Text>
        <Text style={styles.failDetail}>{errorMessage}</Text>

        {classroomCoords && (
          <View style={styles.mapWrapper}>
            <RealMapView
              classroomCoords={classroomCoords}
              classroomName={classroomName}
              allowedRadius={allowedRadius}
              userCoords={userCoords}
              userAccuracy={accuracy}
              distance={distance}
              isWithinRadius={false}
              height={190}
            />
          </View>
        )}

        <PrimaryButton
          title="ตรวจสอบตำแหน่งใหม่อีกครั้ง"
          variant="secondary"
          onPress={onRetry}
          style={{ marginTop: 12 }}
        />
      </View>
    );
  }

  // Initial State: Distance has not been checked yet
  if (distance === null) {
    return (
      <View style={styles.card}>
        <View style={styles.headerRow}>
          <Text style={styles.neutralTitle}>ขั้นตอนที่ 1: ตรวจสอบตำแหน่งห้องเรียน</Text>
          <View style={styles.badgeWait}>
            <Text style={styles.badgeWaitText}>รอตรวจสอบ</Text>
          </View>
        </View>

        <Text style={styles.neutralText}>
          ระบบจะตรวจสอบว่าพิกัดของคุณอยู่ในรัศมีของห้องเรียนหรือไม่ (ไม่เกิน {allowedRadius} เมตร)
        </Text>

        {classroomCoords && (
          <View style={styles.mapWrapper}>
            <RealMapView
              classroomCoords={classroomCoords}
              classroomName={classroomName}
              allowedRadius={allowedRadius}
              userCoords={userCoords}
              userAccuracy={accuracy}
              distance={distance}
              isWithinRadius={null}
              height={210}
            />
          </View>
        )}

        <PrimaryButton
          title="📍 ตรวจสอบตำแหน่งปัจจุบัน"
          variant="primary"
          onPress={onRetry}
          style={{ marginTop: 12 }}
        />
      </View>
    );
  }

  // Failed State: Outside radius
  if (!verified) {
    return (
      <View style={[styles.card, styles.cardFailed]}>
        <View style={styles.headerRow}>
          <Text style={styles.failTitle}>✕ อยู่นอกระยะห้องเรียน</Text>
          <View style={styles.badgeFailed}>
            <Text style={styles.badgeFailedText}>ไม่ผ่าน</Text>
          </View>
        </View>

        <Text style={styles.failDetail}>
          คุณอยู่ห่างจากห้องเรียนประมาณ <Text style={{ fontWeight: '900' }}>{distance} เมตร</Text>
          {'\n'}
          <Text style={styles.criteria}>
            (เงื่อนไข: ต้องอยู่ในรัศมีไม่เกิน {allowedRadius} เมตร {accuracy ? `• GPS ±${accuracy} ม.` : ''})
          </Text>
        </Text>

        {classroomCoords && (
          <View style={styles.mapWrapper}>
            <RealMapView
              classroomCoords={classroomCoords}
              classroomName={classroomName}
              allowedRadius={allowedRadius}
              userCoords={userCoords}
              userAccuracy={accuracy}
              distance={distance}
              isWithinRadius={false}
              height={220}
            />
          </View>
        )}

        <PrimaryButton
          title="🔄 ลองตรวจสอบตำแหน่งใหม่"
          variant="secondary"
          onPress={onRetry}
          style={{ marginTop: 12 }}
        />
      </View>
    );
  }

  // Success State: Verified inside classroom radius
  return (
    <View style={[styles.card, styles.cardSuccess]}>
      <View style={styles.headerRow}>
        <Text style={styles.successTitle}>✓ ตำแหน่งถูกต้อง (อยู่ในห้องเรียน)</Text>
        <View style={styles.badgeSuccess}>
          <Text style={styles.badgeSuccessText}>ผ่าน</Text>
        </View>
      </View>

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
          <Text style={styles.label}>รัศมีที่อนุญาต</Text>
          <Text style={styles.successValue}>{allowedRadius} ม.</Text>
        </View>
      </View>

      {classroomCoords && (
        <View style={styles.mapWrapper}>
          <RealMapView
            classroomCoords={classroomCoords}
            classroomName={classroomName}
            allowedRadius={allowedRadius}
            userCoords={userCoords}
            userAccuracy={accuracy}
            distance={distance}
            isWithinRadius={true}
            height={220}
          />
        </View>
      )}

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
    padding: 14,
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
  headerRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 6,
  },
  mapWrapper: {
    marginVertical: 10,
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
    marginBottom: 8,
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
    lineHeight: 18,
  },
  successTitle: {
    fontSize: 14,
    fontWeight: '900',
    color: Colors.stampGreen,
    letterSpacing: 0.6,
  },
  successRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingVertical: 6,
    borderTopWidth: 1,
    borderBottomWidth: 1,
    borderColor: Colors.borderLight,
    marginVertical: 6,
  },
  label: {
    fontSize: 10,
    fontWeight: '700',
    color: Colors.inkMuted,
    letterSpacing: 0.5,
  },
  successValue: {
    fontSize: 14,
    fontWeight: '800',
    color: Colors.inkDark,
    marginTop: 2,
  },
  failTitle: {
    fontSize: 14,
    fontWeight: '900',
    color: Colors.stampRed,
    letterSpacing: 0.6,
  },
  failDetail: {
    fontSize: 13,
    color: Colors.inkDark,
    lineHeight: 18,
  },
  criteria: {
    fontSize: 11,
    color: Colors.inkMuted,
    marginTop: 2,
  },
  badgeWait: {
    backgroundColor: Colors.panelBackground,
    borderWidth: 1,
    borderColor: Colors.inkDark,
    borderRadius: 3,
    paddingVertical: 2,
    paddingHorizontal: 6,
  },
  badgeWaitText: {
    fontSize: 10,
    fontWeight: '800',
    color: Colors.inkDark,
  },
  badgeFailed: {
    backgroundColor: Colors.stampRedBg,
    borderWidth: 1,
    borderColor: Colors.stampRed,
    borderRadius: 3,
    paddingVertical: 2,
    paddingHorizontal: 6,
  },
  badgeFailedText: {
    fontSize: 10,
    fontWeight: '800',
    color: Colors.stampRed,
  },
  badgeSuccess: {
    backgroundColor: Colors.stampGreenBg,
    borderWidth: 1,
    borderColor: Colors.stampGreen,
    borderRadius: 3,
    paddingVertical: 2,
    paddingHorizontal: 6,
  },
  badgeSuccessText: {
    fontSize: 10,
    fontWeight: '800',
    color: Colors.stampGreen,
  },
});
