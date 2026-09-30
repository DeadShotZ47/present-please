import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  Image,
} from 'react-native';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { api } from '../../../services/api';
import { Attendance } from '../../../types';
import Colors from '../../../constants/Colors';
import { StatusBadge } from '../../../components/StatusBadge';
import { PrimaryButton } from '../../../components/PrimaryButton';
import { LoadingState } from '../../../components/LoadingState';
import { formatDate, formatTimeWithSeconds } from '../../../utils/formatting';

export default function AttendanceDetailScreen() {
  const { attendanceId } = useLocalSearchParams<{ attendanceId: string }>();
  const router = useRouter();

  const [record, setRecord] = useState<Attendance | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadDetail();
  }, [attendanceId]);

  const loadDetail = async () => {
    if (!attendanceId) return;
    try {
      const data = await api.getAttendanceById(attendanceId);
      setRecord(data);
    } catch (err) {
      console.warn('Error loading attendance detail', err);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return <LoadingState message="RETRIEVING DOSSIER ENTRY..." />;
  }

  if (!record) {
    return (
      <View style={styles.errorContainer}>
        <Text style={styles.errorTitle}>RECORD NOT FOUND</Text>
        <PrimaryButton title="RETURN" onPress={() => router.back()} />
      </View>
    );
  }

  return (
    <ScrollView style={styles.container} contentContainerStyle={styles.content}>
      <View style={styles.dossierCard}>
        {/* Header Tag */}
        <View style={styles.headerRow}>
          <Text style={styles.tag}>OFFICIAL ATTENDANCE ENTRY</Text>
          <Text style={styles.recordId}>REF: #{record.id.slice(-6).toUpperCase()}</Text>
        </View>

        <Text style={styles.courseTitle}>{record.courseName || 'Class Session'}</Text>
        <Text style={styles.sessionCode}>{record.courseCode} • {record.room || 'Room 301'}</Text>

        <View style={styles.badgeRow}>
          <StatusBadge status={record.status} size="medium" />
        </View>

        <View style={styles.divider} />

        {/* Verification Metadata Grid */}
        <View style={styles.fieldGrid}>
          <View style={styles.field}>
            <Text style={styles.label}>DATE</Text>
            <Text style={styles.value}>{formatDate(record.timestamp)}</Text>
          </View>
          <View style={styles.field}>
            <Text style={styles.label}>EXACT TIME STAMP</Text>
            <Text style={styles.value}>{formatTimeWithSeconds(record.timestamp)}</Text>
          </View>
          <View style={styles.field}>
            <Text style={styles.label}>DISTANCE FROM ROOM</Text>
            <Text style={styles.value}>{record.distanceFromClassroom} meters</Text>
          </View>
          <View style={styles.field}>
            <Text style={styles.label}>GPS SATELLITE ACCURACY</Text>
            <Text style={styles.value}>±{record.gpsAccuracy} meters</Text>
          </View>
          <View style={styles.field}>
            <Text style={styles.label}>COORDINATES</Text>
            <Text style={styles.value}>
              {record.latitude.toFixed(5)}, {record.longitude.toFixed(5)}
            </Text>
          </View>
          {record.verificationNotes && (
            <View style={styles.fieldFull}>
              <Text style={styles.label}>INSPECTION NOTES</Text>
              <Text style={styles.noteText}>{record.verificationNotes}</Text>
            </View>
          )}
        </View>

        {/* Photo Evidence Section */}
        <View style={styles.photoSection}>
          <Text style={styles.photoLabel}>PHYSICAL EVIDENCE PHOTOGRAPH:</Text>
          {record.photoUrl ? (
            <View style={styles.imageFrame}>
              <Image source={{ uri: record.photoUrl }} style={styles.photo} resizeMode="cover" />
            </View>
          ) : (
            <View style={styles.noPhotoBox}>
              <Text style={styles.noPhotoText}>NO PHOTOGRAPHIC EVIDENCE RECORDED</Text>
            </View>
          )}
        </View>

        <PrimaryButton
          title="RETURN TO LOG"
          variant="secondary"
          onPress={() => router.back()}
          style={{ marginTop: 20 }}
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
    paddingBottom: 36,
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
  dossierCard: {
    backgroundColor: Colors.cardBackground,
    borderWidth: 2,
    borderColor: Colors.inkDark,
    borderRadius: 4,
    padding: 18,
    shadowColor: Colors.inkDark,
    shadowOffset: { width: 3, height: 3 },
    shadowOpacity: 0.15,
    shadowRadius: 0,
    elevation: 3,
  },
  headerRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  tag: {
    fontSize: 9,
    fontWeight: '900',
    color: Colors.inkMuted,
    letterSpacing: 1,
  },
  recordId: {
    fontSize: 11,
    fontWeight: '800',
    color: Colors.inkDark,
    letterSpacing: 0.8,
  },
  courseTitle: {
    fontSize: 20,
    fontWeight: '900',
    color: Colors.inkDark,
  },
  sessionCode: {
    fontSize: 12,
    fontWeight: '700',
    color: Colors.inkMuted,
    marginTop: 2,
  },
  badgeRow: {
    marginTop: 10,
    marginBottom: 6,
  },
  divider: {
    height: 1,
    backgroundColor: Colors.borderLight,
    marginVertical: 12,
  },
  fieldGrid: {
    gap: 10,
  },
  field: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  fieldFull: {
    marginTop: 4,
  },
  label: {
    fontSize: 10,
    fontWeight: '700',
    color: Colors.inkMuted,
    letterSpacing: 0.6,
  },
  value: {
    fontSize: 13,
    fontWeight: '700',
    color: Colors.inkDark,
  },
  noteText: {
    fontSize: 12,
    color: Colors.inkDark,
    marginTop: 3,
    fontStyle: 'italic',
  },
  photoSection: {
    marginTop: 18,
    paddingTop: 14,
    borderTopWidth: 1,
    borderColor: Colors.borderLight,
  },
  photoLabel: {
    fontSize: 10,
    fontWeight: '800',
    color: Colors.inkMuted,
    letterSpacing: 0.8,
    marginBottom: 8,
  },
  imageFrame: {
    height: 220,
    borderWidth: 2,
    borderColor: Colors.inkDark,
    borderRadius: 4,
    overflow: 'hidden',
  },
  photo: {
    width: '100%',
    height: '100%',
  },
  noPhotoBox: {
    height: 100,
    backgroundColor: Colors.panelBackground,
    borderWidth: 1.5,
    borderColor: Colors.borderLight,
    borderStyle: 'dashed',
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: 4,
  },
  noPhotoText: {
    fontSize: 11,
    fontWeight: '700',
    color: Colors.inkMuted,
    letterSpacing: 0.8,
  },
});
