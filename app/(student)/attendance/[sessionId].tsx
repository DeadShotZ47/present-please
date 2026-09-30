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
        setGpsError('Unable to access device GPS coordinates.');
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
          `You are approximately ${check.distance}m away. Must be within ${session.allowedRadius}m of ${session.room || 'the classroom'}.`
        );
      }
    } catch (err: any) {
      setGpsError(err?.message || 'Error calculating position.');
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

    if (!gpsVerified || !gpsCoords) {
      setSubmitError('Location verification must pass before submission.');
      return;
    }

    if (!photoUri) {
      setSubmitError('Photo evidence is required to confirm presence.');
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
      setSubmitError(err?.message || 'Submission rejected by checkpoint authority.');
    } finally {
      setSubmitting(false);
    }
  };

  if (loadingSession) {
    return <LoadingState message="INITIALIZING CHECKPOINT SESSION..." />;
  }

  if (!session) {
    return (
      <View style={styles.errorContainer}>
        <Text style={styles.errorTitle}>SESSION NOT FOUND</Text>
        <PrimaryButton title="RETURN" onPress={() => router.back()} />
      </View>
    );
  }

  // Section 14: Attendance Success Screen
  if (verifiedRecord) {
    return (
      <ScrollView style={styles.container} contentContainerStyle={styles.content}>
        <View style={styles.successCard}>
          <View style={styles.stampGranted}>
            <Text style={styles.stampGrantedText}>ACCESS GRANTED</Text>
          </View>

          <Text style={styles.successHeading}>✓ ATTENDANCE VERIFIED</Text>
          <Text style={styles.courseSubtitle}>{session.courseName}</Text>

          <View style={styles.divider} />

          <View style={styles.receiptGrid}>
            <View style={styles.receiptRow}>
              <Text style={styles.receiptLabel}>SESSION TIME</Text>
              <Text style={styles.receiptValue}>{session.startTime} - {session.endTime}</Text>
            </View>
            <View style={styles.receiptRow}>
              <Text style={styles.receiptLabel}>ROOM LOCATION</Text>
              <Text style={styles.receiptValue}>{session.room || 'Room 301'}</Text>
            </View>
            <View style={styles.receiptRow}>
              <Text style={styles.receiptLabel}>SUBMISSION TIME</Text>
              <Text style={styles.receiptValue}>{formatTimeWithSeconds(verifiedRecord.timestamp)}</Text>
            </View>
            <View style={styles.receiptRow}>
              <Text style={styles.receiptLabel}>DISTANCE VERIFIED</Text>
              <Text style={styles.receiptValue}>{verifiedRecord.distanceFromClassroom}m from classroom</Text>
            </View>
            <View style={styles.receiptRow}>
              <Text style={styles.receiptLabel}>GPS ACCURACY</Text>
              <Text style={styles.receiptValue}>±{verifiedRecord.gpsAccuracy}m</Text>
            </View>
            <View style={styles.receiptRow}>
              <Text style={styles.receiptLabel}>OFFICIAL STATUS</Text>
              <Text style={[styles.receiptValue, { color: Colors.stampGreen, fontWeight: '900' }]}>
                PRESENT
              </Text>
            </View>
          </View>

          <View style={styles.securitySeal}>
            <Text style={styles.sealText}>DIGITALLY SIGNED & ARCHIVED TO CENTRAL REGISTRY</Text>
          </View>

          <PrimaryButton
            title="BACK TO CHECKPOINT HOME"
            variant="primary"
            onPress={() => router.replace('/(student)/home')}
            style={{ marginTop: 20 }}
          />
        </View>
      </ScrollView>
    );
  }

  const isReadyToSubmit = gpsVerified && !!photoUri && !submitting;

  return (
    <ScrollView style={styles.container} contentContainerStyle={styles.content}>
      {/* Session Header Card */}
      <View style={styles.sessionHeaderCard}>
        <View style={styles.badgeRow}>
          <Text style={styles.tag}>ATTENDANCE CHECKPOINT</Text>
          <Text style={styles.statusIndicator}>
            STATUS: {session.status.toUpperCase()}
          </Text>
        </View>
        <Text style={styles.courseName}>{session.courseName}</Text>
        <Text style={styles.timeAndRoom}>
          {session.startTime} - {session.endTime} • {session.room || 'Room 301'}
        </Text>
      </View>

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
          <Text style={styles.checklistTitle}>VERIFICATION CHECKLIST:</Text>
          <Text style={styles.checklistItem}>
            {gpsVerified ? '✓' : '○'} Step 1: Physical classroom proximity verified
          </Text>
          <Text style={styles.checklistItem}>
            {photoUri ? '✓' : '○'} Step 2: Live photo evidence captured
          </Text>
        </View>

        <PrimaryButton
          title={isReadyToSubmit ? 'SUBMIT ATTENDANCE VERIFICATION' : 'COMPLETE ALL STEPS TO SUBMIT'}
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
