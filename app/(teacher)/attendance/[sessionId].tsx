import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  Image,
  TouchableOpacity,
  Modal,
} from 'react-native';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { api } from '../../../services/api';
import { AttendanceSession, Attendance } from '../../../types';
import Colors from '../../../constants/Colors';
import { StatusBadge } from '../../../components/StatusBadge';
import { PrimaryButton } from '../../../components/PrimaryButton';
import { LoadingState } from '../../../components/LoadingState';
import { EmptyState } from '../../../components/EmptyState';
import { formatTimeWithSeconds } from '../../../utils/formatting';

export default function TeacherSessionAttendanceScreen() {
  const { sessionId } = useLocalSearchParams<{ sessionId: string }>();
  const router = useRouter();

  const [session, setSession] = useState<AttendanceSession | null>(null);
  const [attendances, setAttendances] = useState<Attendance[]>([]);
  const [loading, setLoading] = useState(true);

  // Inspection modal state
  const [inspectRecord, setInspectRecord] = useState<Attendance | null>(null);

  useEffect(() => {
    loadSessionAndAttendance();
  }, [sessionId]);

  const loadSessionAndAttendance = async () => {
    if (!sessionId) return;
    try {
      const [sessionData, attendanceData] = await Promise.all([
        api.getSessionById(sessionId),
        api.getSessionAttendance(sessionId),
      ]);
      setSession(sessionData);
      setAttendances(attendanceData);
    } catch (err) {
      console.warn('Error loading attendance list', err);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return <LoadingState message="ACCESSING SESSION ATTENDANCE ROSTER..." />;
  }

  if (!session) {
    return (
      <View style={styles.errorContainer}>
        <Text style={styles.errorTitle}>SESSION NOT FOUND</Text>
        <PrimaryButton title="RETURN" onPress={() => router.back()} />
      </View>
    );
  }

  const presentCount = attendances.filter((a) => a.status === 'present').length;
  const lateCount = attendances.filter((a) => a.status === 'late').length;
  const totalVerified = presentCount + lateCount;
  const totalExpected = session.totalExpected || 40;

  return (
    <View style={styles.screenWrapper}>
      <ScrollView style={styles.container} contentContainerStyle={styles.content}>
        {/* Header Summary Card */}
        <View style={styles.headerCard}>
          <Text style={styles.code}>{session.courseCode}</Text>
          <Text style={styles.courseName}>{session.courseName}</Text>
          <Text style={styles.roomAndTime}>
            {session.startTime} - {session.endTime} • {session.room || 'Room 301'}
          </Text>

          <View style={styles.divider} />

          <View style={styles.statsRow}>
            <View>
              <Text style={styles.statLabel}>VERIFIED ATTENDEES</Text>
              <Text style={styles.statCount}>
                {totalVerified} / {totalExpected}
              </Text>
            </View>
            <View style={{ alignItems: 'flex-end' }}>
              <Text style={styles.statLabel}>CHECKPOINT STATUS</Text>
              <StatusBadge status={session.status} size="small" />
            </View>
          </View>
        </View>

        <Text style={styles.rosterTitle}>INSPECTION LOG ENTRIES ({attendances.length})</Text>

        {attendances.length === 0 ? (
          <EmptyState
            title="NO ATTENDEES RECORDED"
            message="No students have submitted physical presence evidence yet."
          />
        ) : (
          attendances.map((item) => (
            <TouchableOpacity
              key={item.id}
              style={styles.studentRow}
              activeOpacity={0.7}
              onPress={() => setInspectRecord(item)}
            >
              <View style={{ flex: 1 }}>
                <Text style={styles.studentName}>{item.studentName || 'Student Citizen'}</Text>
                <Text style={styles.submissionMeta}>
                  {formatTimeWithSeconds(item.timestamp)} • {item.distanceFromClassroom}m from room
                </Text>
              </View>

              <View style={styles.rowRight}>
                <StatusBadge status={item.status} size="small" />
                <Text style={styles.inspectBtn}>INSPECT →</Text>
              </View>
            </TouchableOpacity>
          ))
        )}
      </ScrollView>

      {/* Verification Evidence Inspection Modal */}
      <Modal
        visible={!!inspectRecord}
        animationType="slide"
        transparent={true}
        onRequestClose={() => setInspectRecord(null)}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.modalCard}>
            <View style={styles.modalHeader}>
              <Text style={styles.modalTitle}>PHYSICAL EVIDENCE DOSSIER</Text>
              <TouchableOpacity onPress={() => setInspectRecord(null)}>
                <Text style={styles.closeBtn}>✕ CLOSE</Text>
              </TouchableOpacity>
            </View>

            {inspectRecord && (
              <ScrollView>
                <Text style={styles.modalStudentName}>{inspectRecord.studentName}</Text>
                <Text style={styles.modalTime}>
                  Submitted at: {formatTimeWithSeconds(inspectRecord.timestamp)}
                </Text>

                <View style={styles.modalBadgeRow}>
                  <StatusBadge status={inspectRecord.status} size="medium" />
                </View>

                {inspectRecord.photoUrl ? (
                  <View style={styles.modalImageContainer}>
                    <Image
                      source={{ uri: inspectRecord.photoUrl }}
                      style={styles.modalPhoto}
                      resizeMode="cover"
                    />
                    <View style={styles.watermark}>
                      <Text style={styles.watermarkText}>VERIFIED CHECKPOINT CAPTURE</Text>
                    </View>
                  </View>
                ) : (
                  <View style={styles.noPhoto}>
                    <Text style={styles.noPhotoText}>NO PHOTO CAPTURED</Text>
                  </View>
                )}

                <View style={styles.modalInfoGrid}>
                  <View style={styles.modalInfoRow}>
                    <Text style={styles.modalInfoLabel}>VERIFIED DISTANCE:</Text>
                    <Text style={styles.modalInfoValue}>
                      {inspectRecord.distanceFromClassroom} meters from classroom
                    </Text>
                  </View>
                  <View style={styles.modalInfoRow}>
                    <Text style={styles.modalInfoLabel}>GPS ACCURACY:</Text>
                    <Text style={styles.modalInfoValue}>±{inspectRecord.gpsAccuracy} meters</Text>
                  </View>
                  <View style={styles.modalInfoRow}>
                    <Text style={styles.modalInfoLabel}>COORDINATES:</Text>
                    <Text style={styles.modalInfoValue}>
                      {inspectRecord.latitude.toFixed(5)}, {inspectRecord.longitude.toFixed(5)}
                    </Text>
                  </View>
                </View>

                <PrimaryButton
                  title="CONFIRM INSPECTION"
                  variant="primary"
                  onPress={() => setInspectRecord(null)}
                  style={{ marginTop: 16 }}
                />
              </ScrollView>
            )}
          </View>
        </View>
      </Modal>
    </View>
  );
}

const styles = StyleSheet.create({
  screenWrapper: {
    flex: 1,
    backgroundColor: Colors.background,
  },
  container: {
    flex: 1,
  },
  content: {
    padding: 16,
    paddingBottom: 40,
  },
  errorContainer: {
    flex: 1,
    justifyContent: 'center',
    padding: 24,
  },
  errorTitle: {
    fontSize: 16,
    fontWeight: '900',
    color: Colors.stampRed,
    textAlign: 'center',
    marginBottom: 16,
  },
  headerCard: {
    backgroundColor: Colors.cardBackground,
    borderWidth: 2,
    borderColor: Colors.inkDark,
    borderRadius: 4,
    padding: 16,
    marginBottom: 14,
    shadowColor: Colors.inkDark,
    shadowOffset: { width: 3, height: 3 },
    shadowOpacity: 0.12,
    shadowRadius: 0,
    elevation: 3,
  },
  code: {
    fontSize: 11,
    fontWeight: '800',
    color: Colors.inkMuted,
    letterSpacing: 1,
  },
  courseName: {
    fontSize: 18,
    fontWeight: '900',
    color: Colors.inkDark,
    marginTop: 2,
  },
  roomAndTime: {
    fontSize: 12,
    color: Colors.inkMuted,
    fontWeight: '700',
    marginTop: 3,
  },
  divider: {
    height: 1,
    backgroundColor: Colors.borderLight,
    marginVertical: 12,
  },
  statsRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  statLabel: {
    fontSize: 9,
    fontWeight: '800',
    color: Colors.inkMuted,
    letterSpacing: 0.8,
  },
  statCount: {
    fontSize: 18,
    fontWeight: '900',
    color: Colors.stampBlue,
    marginTop: 2,
  },
  rosterTitle: {
    fontSize: 12,
    fontWeight: '900',
    color: Colors.inkDark,
    letterSpacing: 1,
    marginBottom: 8,
  },
  studentRow: {
    backgroundColor: Colors.cardBackground,
    borderWidth: 1.5,
    borderColor: Colors.inkDark,
    borderRadius: 3,
    padding: 12,
    marginVertical: 4,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  studentName: {
    fontSize: 14,
    fontWeight: '800',
    color: Colors.inkDark,
  },
  submissionMeta: {
    fontSize: 11,
    color: Colors.inkMuted,
    marginTop: 3,
    fontWeight: '600',
  },
  rowRight: {
    alignItems: 'flex-end',
    gap: 4,
  },
  inspectBtn: {
    fontSize: 10,
    fontWeight: '800',
    color: Colors.inkDark,
    textDecorationLine: 'underline',
  },
  // Modal Styles
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.6)',
    justifyContent: 'center',
    padding: 16,
  },
  modalCard: {
    backgroundColor: Colors.cardBackground,
    borderWidth: 2.5,
    borderColor: Colors.inkDark,
    borderRadius: 4,
    padding: 18,
    maxHeight: '85%',
  },
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    borderBottomWidth: 1.5,
    borderColor: Colors.inkDark,
    paddingBottom: 8,
    marginBottom: 12,
  },
  modalTitle: {
    fontSize: 12,
    fontWeight: '900',
    color: Colors.inkDark,
    letterSpacing: 1,
  },
  closeBtn: {
    fontSize: 11,
    fontWeight: '900',
    color: Colors.stampRed,
    letterSpacing: 0.5,
  },
  modalStudentName: {
    fontSize: 18,
    fontWeight: '900',
    color: Colors.inkDark,
  },
  modalTime: {
    fontSize: 12,
    color: Colors.inkMuted,
    fontWeight: '700',
    marginTop: 2,
  },
  modalBadgeRow: {
    marginVertical: 10,
  },
  modalImageContainer: {
    height: 220,
    borderWidth: 2,
    borderColor: Colors.inkDark,
    borderRadius: 3,
    overflow: 'hidden',
    position: 'relative',
    marginVertical: 10,
  },
  modalPhoto: {
    width: '100%',
    height: '100%',
  },
  watermark: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    backgroundColor: 'rgba(30, 32, 34, 0.75)',
    paddingVertical: 3,
    alignItems: 'center',
  },
  watermarkText: {
    fontSize: 9,
    fontWeight: '900',
    color: '#FFFFFF',
    letterSpacing: 1,
  },
  noPhoto: {
    height: 100,
    backgroundColor: Colors.panelBackground,
    borderWidth: 1,
    borderColor: Colors.borderLight,
    borderStyle: 'dashed',
    alignItems: 'center',
    justifyContent: 'center',
    marginVertical: 10,
  },
  noPhotoText: {
    fontSize: 11,
    fontWeight: '700',
    color: Colors.inkMuted,
  },
  modalInfoGrid: {
    gap: 8,
    marginVertical: 8,
  },
  modalInfoRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  modalInfoLabel: {
    fontSize: 10,
    fontWeight: '800',
    color: Colors.inkMuted,
    letterSpacing: 0.5,
  },
  modalInfoValue: {
    fontSize: 12,
    fontWeight: '800',
    color: Colors.inkDark,
  },
});
