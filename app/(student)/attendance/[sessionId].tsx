import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  Alert,
} from 'react-native';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { api } from '../../../services/api';
import { AttendanceSession, Attendance } from '../../../types';
import Colors from '../../../constants/Colors';
import { LocationStatus } from '../../../components/LocationStatus';
import { PhotoPreview } from '../../../components/PhotoPreview';
import { PrimaryButton } from '../../../components/PrimaryButton';
import { ErrorMessage } from '../../../components/ErrorMessage';
import { LoadingState } from '../../../components/LoadingState';
import { LocationService } from '../../../services/location';
import { CameraService } from '../../../services/camera';
import { formatTimeWithSeconds } from '../../../utils/formatting';
import { getSessionTimeStatus } from '../../../utils/sessionTime';

export default function AttendanceFlowScreen() {
  const { sessionId } = useLocalSearchParams<{ sessionId: string }>();
  const router = useRouter();

  const [session, setSession] = useState<AttendanceSession | null>(null);
  const [loadingSession, setLoadingSession] = useState(true);

  // GPS verification state
  const [gpsLoading, setGpsLoading] = useState(false);
  const [gpsDistance, setGpsDistance] = useState<number | null>(null);
  const [gpsAccuracy, setGpsAccuracy] = useState<number | null>(null);
  const [gpsVerified, setGpsVerified] = useState(false);
  const [gpsCoords, setGpsCoords] = useState<{ lat: number; lon: number } | null>(null);
  const [gpsError, setGpsError] = useState<string | null>(null);

  // Photo state
  const [photoUri, setPhotoUri] = useState<string | null>(null);

  // Submission state
  const [submitting, setSubmitting] = useState(false);
  const [submitError, setSubmitError] = useState<string | null>(null);
  const [verifiedRecord, setVerifiedRecord] = useState<Attendance | null>(null);

  useEffect(() => {
    loadSession();
  }, [sessionId]);

  const loadSession = async () => {
    if (!sessionId) return;
    try {
      const data = await api.getSessionById(sessionId);
      setSession(data);
    } catch (err) {
      console.warn('Error loading session', err);
    } finally {
      setLoadingSession(false);
    }
  };

  const handleCheckLocation = async () => {
    if (!session) return;
    setGpsError(null);
    setGpsLoading(true);

    try {
      const pos = await LocationService.getCurrentPosition();
      if (!pos) {
        setGpsError('ไม่สามารถเข้าถึงพิกัด GPS ของอุปกรณ์ได้');
        setGpsVerified(false);
        return;
      }

      setGpsCoords({ lat: pos.latitude, lon: pos.longitude });
      setGpsAccuracy(pos.accuracy);

      const check = LocationService.verifyProximity(
        pos.latitude,
        pos.longitude,
        session.latitude,
        session.longitude,
        session.allowedRadius
      );

      setGpsDistance(check.distance);
      setGpsVerified(check.isWithinRadius);

      if (!check.isWithinRadius) {
        setGpsError(
          `คุณอยู่ห่างจากห้องเรียน ${check.distance} เมตร (ต้องอยู่ในระยะไม่เกิน ${session.allowedRadius} เมตรจาก ${session.room || 'ห้องเรียน'})`
        );
      }
    } catch (err: any) {
      setGpsError(err?.message || 'เกิดข้อผิดพลาดในการตรวจสอบพิกัด');
      setGpsVerified(false);
    } finally {
      setGpsLoading(false);
    }
  };

  const handleTakePhoto = async () => {
    const uri = await CameraService.capturePhoto();
    if (uri) {
      setPhotoUri(uri);
    }
  };

  const handleSubmit = async () => {
    if (!session) return;
    setSubmitError(null);

    const timeStatus = getSessionTimeStatus(session);
    if (!timeStatus.canCheckIn) {
      setSubmitError(timeStatus.message);
      return;
    }

    if (!gpsVerified || !gpsCoords) {
      setSubmitError('กรุณาตรวจสอบตำแหน่งให้อยู่ในห้องเรียนก่อนส่งข้อมูล');
      return;
    }

    if (!photoUri) {
      setSubmitError('กรุณาถ่ายภาพถ่ายยืนยันตัวตนก่อนส่งข้อมูล');
      return;
    }

    try {
      setSubmitting(true);
      const record = await api.submitAttendance({
        sessionId: session.id,
        latitude: gpsCoords.lat,
        longitude: gpsCoords.lon,
        gpsAccuracy: gpsAccuracy || 8,
        photoUri,
      });

      setVerifiedRecord(record);
    } catch (err: any) {
      setSubmitError(err?.message || 'การส่งข้อมูลเช็กชื่อไม่สำเร็จ');
    } finally {
      setSubmitting(false);
    }
  };

  if (loadingSession) {
    return <LoadingState message="กำลังเปิดหน้าระบบเช็กชื่อ..." />;
  }

  if (!session) {
    return (
      <View style={styles.errorContainer}>
        <Text style={styles.errorTitle}>ไม่พบคาบเรียนนี้</Text>
        <PrimaryButton title="ย้อนกลับ" onPress={() => router.back()} />
      </View>
    );
  }

  // Section 14: Attendance Success Screen
  if (verifiedRecord) {
    return (
      <ScrollView style={styles.container} contentContainerStyle={styles.content}>
        <View style={styles.successCard}>
          <View style={styles.stampGranted}>
            <Text style={styles.stampGrantedText}>บันทึกสำเร็จ</Text>
          </View>

          <Text style={styles.successHeading}>✓ เช็กชื่อสำเร็จ</Text>
          <Text style={styles.courseSubtitle}>{session.courseName}</Text>

          <View style={styles.divider} />

          <View style={styles.receiptGrid}>
            <View style={styles.receiptRow}>
              <Text style={styles.receiptLabel}>เวลาเรียน</Text>
              <Text style={styles.receiptValue}>{session.startTime} - {session.endTime}</Text>
            </View>
            <View style={styles.receiptRow}>
              <Text style={styles.receiptLabel}>ห้องเรียน</Text>
              <Text style={styles.receiptValue}>{session.room || 'ห้อง 301'}</Text>
            </View>
            <View style={styles.receiptRow}>
              <Text style={styles.receiptLabel}>เวลาที่เช็กชื่อ</Text>
              <Text style={styles.receiptValue}>{formatTimeWithSeconds(verifiedRecord.timestamp)}</Text>
            </View>
            <View style={styles.receiptRow}>
              <Text style={styles.receiptLabel}>ระยะห่าง</Text>
              <Text style={styles.receiptValue}>{verifiedRecord.distanceFromClassroom} เมตรจากห้องเรียน</Text>
            </View>
            <View style={styles.receiptRow}>
              <Text style={styles.receiptLabel}>ความแม่นยำ GPS</Text>
              <Text style={styles.receiptValue}>±{verifiedRecord.gpsAccuracy} ม.</Text>
            </View>
            <View style={styles.receiptRow}>
              <Text style={styles.receiptLabel}>สถานะ</Text>
              <Text style={[styles.receiptValue, { color: Colors.stampGreen, fontWeight: '900' }]}>
                มาเรียน
              </Text>
            </View>
          </View>

          <View style={styles.securitySeal}>
            <Text style={styles.sealText}>บันทึกข้อมูลและส่งหลักฐานไปยังระบบเรียบร้อยแล้ว</Text>
          </View>

          <PrimaryButton
            title="กลับสู่หน้าหลัก"
            variant="primary"
            onPress={() => router.replace('/(student)/home')}
            style={{ marginTop: 20 }}
          />
        </View>
      </ScrollView>
    );
  }

  const timeStatus = getSessionTimeStatus(session);
  const isTimeValid = timeStatus.canCheckIn;
  const isReadyToSubmit = isTimeValid && gpsVerified && !!photoUri && !submitting;

  let submitButtonTitle = 'กรุณาดำเนินการให้ครบทั้ง 2 ขั้นตอน';
  if (!isTimeValid) {
    submitButtonTitle = timeStatus.status === 'before'
      ? `ยังไม่ถึงเวลาเริ่มเรียน (เริ่ม ${session.startTime} น.)`
      : `หมดเวลาเช็กชื่อแล้ว (${session.endTime} น.)`;
  } else if (isReadyToSubmit) {
    submitButtonTitle = 'ยืนยันการเช็กชื่อ';
  }

  return (
    <ScrollView style={styles.container} contentContainerStyle={styles.content}>
      {/* Session Header Card */}
      <View style={styles.sessionHeaderCard}>
        <View style={styles.badgeRow}>
          <Text style={styles.tag}>เช็กชื่อเข้าเรียน</Text>
          <Text style={[
            styles.statusIndicator,
            !isTimeValid && { color: timeStatus.status === 'before' ? Colors.stampAmber : Colors.stampRed }
          ]}>
            {!isTimeValid
              ? timeStatus.badgeLabel
              : session.status === 'open' ? 'เปิดรับเช็กชื่อ' : 'ปิดรับเช็กชื่อ'}
          </Text>
        </View>
        <Text style={styles.courseName}>{session.courseName}</Text>
        <Text style={styles.timeAndRoom}>
          {session.startTime} - {session.endTime} • {session.room || 'ห้อง 301'}
        </Text>
      </View>

      {/* Time Alert Banner if outside class time */}
      {!isTimeValid && (
        <View style={[
          styles.timeBanner,
          timeStatus.status === 'before' ? styles.timeBannerWaiting : styles.timeBannerExpired
        ]}>
          <Text style={[
            styles.timeBannerTitle,
            { color: timeStatus.status === 'before' ? Colors.stampAmber : Colors.stampRed }
          ]}>
            {timeStatus.status === 'before' ? '🕒 ยังไม่ถึงเวลาเริ่มเรียน' : '✕ หมดเวลาเช็กชื่อแล้ว'}
          </Text>
          <Text style={styles.timeBannerMessage}>{timeStatus.message}</Text>
          <Text style={styles.timeBannerRule}>
            • กฎของระบบ: นักศึกษาต้องทำการเช็กชื่อภายในช่วงเวลาเรียนเท่านั้น ({session.startTime} - {session.endTime} น.)
          </Text>
        </View>
      )}

      <ErrorMessage message={submitError || ''} />

      {/* Step 1: Location Verification */}
      <LocationStatus
        loading={gpsLoading}
        verified={gpsVerified}
        distance={gpsDistance}
        accuracy={gpsAccuracy}
        allowedRadius={session.allowedRadius}
        errorMessage={gpsError}
        onRetry={handleCheckLocation}
      />

      {/* Step 2: Photo Evidence */}
      <PhotoPreview
        photoUri={photoUri}
        onTakePhoto={handleTakePhoto}
        onRetakePhoto={handleTakePhoto}
      />

      {/* Step 3: Summary and Submission */}
      <View style={styles.submitSection}>
        <View style={styles.checklist}>
          <Text style={styles.checklistTitle}>รายการที่ต้องดำเนินการ:</Text>
          <Text style={styles.checklistItem}>
            {isTimeValid ? '✓' : '✕'} เวลาเรียน: {session.startTime} - {session.endTime} น. ({timeStatus.message})
          </Text>
          <Text style={styles.checklistItem}>
            {gpsVerified ? '✓' : '○'} ขั้นตอนที่ 1: ตรวจสอบพิกัดให้อยู่ในห้องเรียน
          </Text>
          <Text style={styles.checklistItem}>
            {photoUri ? '✓' : '○'} ขั้นตอนที่ 2: ถ่ายรูปยืนยันตัวตนในห้องเรียน
          </Text>
        </View>

        <PrimaryButton
          title={submitButtonTitle}
          variant="primary"
          disabled={!isReadyToSubmit}
          loading={submitting}
          onPress={handleSubmit}
          style={{ marginTop: 12 }}
        />
      </View>
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
  errorContainer: {
    flex: 1,
    justifyContent: 'center',
    padding: 24,
    backgroundColor: Colors.background,
  },
  errorTitle: {
    fontSize: 16,
    fontWeight: '900',
    color: Colors.stampRed,
    textAlign: 'center',
    marginBottom: 16,
  },
  sessionHeaderCard: {
    backgroundColor: Colors.cardBackground,
    borderWidth: 2,
    borderColor: Colors.inkDark,
    borderRadius: 4,
    padding: 16,
    marginBottom: 10,
    shadowColor: Colors.inkDark,
    shadowOffset: { width: 2, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 0,
    elevation: 2,
  },
  badgeRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 6,
  },
  tag: {
    fontSize: 10,
    fontWeight: '900',
    color: Colors.inkMuted,
    letterSpacing: 1,
  },
  statusIndicator: {
    fontSize: 10,
    fontWeight: '900',
    color: Colors.stampGreen,
    letterSpacing: 1,
  },
  timeBanner: {
    borderWidth: 1.5,
    borderRadius: 4,
    padding: 12,
    marginBottom: 10,
  },
  timeBannerWaiting: {
    backgroundColor: Colors.stampAmberBg,
    borderColor: Colors.stampAmber,
  },
  timeBannerExpired: {
    backgroundColor: Colors.stampRedBg,
    borderColor: Colors.stampRed,
  },
  timeBannerTitle: {
    fontSize: 13,
    fontWeight: '900',
    marginBottom: 4,
  },
  timeBannerMessage: {
    fontSize: 12,
    fontWeight: '700',
    color: Colors.inkDark,
    lineHeight: 17,
  },
  timeBannerRule: {
    fontSize: 10,
    fontWeight: '600',
    color: Colors.inkMuted,
    marginTop: 6,
  },
  courseName: {
    fontSize: 18,
    fontWeight: '900',
    color: Colors.inkDark,
  },
  timeAndRoom: {
    fontSize: 13,
    color: Colors.inkMuted,
    fontWeight: '700',
    marginTop: 4,
  },
  submitSection: {
    backgroundColor: Colors.cardBackground,
    borderWidth: 2,
    borderColor: Colors.inkDark,
    borderRadius: 4,
    padding: 16,
    marginTop: 8,
  },
  checklist: {
    marginBottom: 8,
  },
  checklistTitle: {
    fontSize: 11,
    fontWeight: '900',
    color: Colors.inkDark,
    letterSpacing: 0.8,
    marginBottom: 4,
  },
  checklistItem: {
    fontSize: 12,
    fontWeight: '700',
    color: Colors.inkMuted,
    marginVertical: 2,
  },
  // Success Screen Styles
  successCard: {
    backgroundColor: Colors.cardBackground,
    borderWidth: 3,
    borderColor: Colors.stampGreen,
    borderRadius: 6,
    padding: 24,
    marginTop: 10,
    alignItems: 'center',
    shadowColor: Colors.inkDark,
    shadowOffset: { width: 3, height: 3 },
    shadowOpacity: 0.15,
    shadowRadius: 0,
    elevation: 4,
  },
  stampGranted: {
    borderWidth: 3,
    borderColor: Colors.stampGreen,
    borderRadius: 4,
    paddingHorizontal: 16,
    paddingVertical: 6,
    backgroundColor: Colors.stampGreenBg,
    marginBottom: 16,
    transform: [{ rotate: '-3deg' }],
  },
  stampGrantedText: {
    fontSize: 16,
    fontWeight: '900',
    color: Colors.stampGreen,
    letterSpacing: 2,
  },
  successHeading: {
    fontSize: 22,
    fontWeight: '900',
    color: Colors.inkDark,
    letterSpacing: 1,
    textAlign: 'center',
  },
  courseSubtitle: {
    fontSize: 14,
    fontWeight: '700',
    color: Colors.inkMuted,
    marginTop: 4,
    textAlign: 'center',
  },
  divider: {
    width: '100%',
    height: 1,
    backgroundColor: Colors.borderLight,
    marginVertical: 16,
  },
  receiptGrid: {
    width: '100%',
    gap: 10,
  },
  receiptRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  receiptLabel: {
    fontSize: 11,
    fontWeight: '700',
    color: Colors.inkMuted,
    letterSpacing: 0.6,
  },
  receiptValue: {
    fontSize: 13,
    fontWeight: '700',
    color: Colors.inkDark,
  },
  securitySeal: {
    marginTop: 20,
    paddingTop: 14,
    borderTopWidth: 1,
    borderColor: Colors.borderLight,
    alignItems: 'center',
    width: '100%',
  },
  sealText: {
    fontSize: 9,
    fontWeight: '900',
    color: Colors.inkFaint,
    letterSpacing: 1,
    textAlign: 'center',
  },
});
