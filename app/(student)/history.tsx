import React, { useState, useCallback } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  RefreshControl,
  TouchableOpacity,
} from 'react-native';
import { useRouter, useFocusEffect } from 'expo-router';
import { useAuth } from '../../contexts/AuthContext';
import { api } from '../../services/api';
import { Attendance } from '../../types';
import Colors from '../../constants/Colors';
import { StatusBadge } from '../../components/StatusBadge';
import { LoadingState } from '../../components/LoadingState';
import { EmptyState } from '../../components/EmptyState';
import { formatDate, formatTime } from '../../utils/formatting';

export default function StudentHistoryScreen() {
  const router = useRouter();
  const { user } = useAuth();

  const [attendances, setAttendances] = useState<Attendance[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  const loadHistory = async () => {
    try {
      if (user) {
        const data = await api.getStudentAttendance(user.id);
        setAttendances(data);
      }
    } catch (err) {
      console.warn('Error loading attendance history', err);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  useFocusEffect(
    useCallback(() => {
      loadHistory();
    }, [user])
  );

  if (loading && !refreshing) {
    return <LoadingState message="ACCESSING ARCHIVED VERIFICATION LOGS..." />;
  }

  return (
    <ScrollView
      style={styles.container}
      contentContainerStyle={styles.content}
      refreshControl={<RefreshControl refreshing={refreshing} onRefresh={() => { setRefreshing(true); loadHistory(); }} />}
    >
      <View style={styles.header}>
        <Text style={styles.headerTitle}>ATTENDANCE DOSSIER</Text>
        <Text style={styles.subtext}>Official log of verified presence and absences</Text>
      </View>

      {attendances.length === 0 ? (
        <EmptyState
          title="NO ENTRIES RECORDED"
          message="No attendance verification entries have been filed yet."
        />
      ) : (
        attendances.map((record) => (
          <TouchableOpacity
            key={record.id}
            style={styles.recordCard}
            activeOpacity={0.7}
            onPress={() => {
              router.push({
                pathname: '/(student)/attendance-detail/[attendanceId]',
                params: { attendanceId: record.id },
              });
            }}
          >
            <View style={styles.topRow}>
              <View style={{ flex: 1 }}>
                <Text style={styles.courseName}>{record.courseName || 'Course Session'}</Text>
                <Text style={styles.dateText}>
                  {formatDate(record.timestamp)} • {formatTime(record.timestamp)}
                </Text>
              </View>
              <StatusBadge status={record.status} size="small" />
            </View>

            <View style={styles.divider} />

            <View style={styles.bottomRow}>
              <Text style={styles.metaText}>
                {record.status === 'absent'
                  ? 'NO SUBMISSION ON FILE'
                  : `GPS: ${record.distanceFromClassroom}m from room (±${record.gpsAccuracy}m)`}
              </Text>
              <Text style={styles.inspectText}>INSPECT RECORD →</Text>
            </View>
          </TouchableOpacity>
        ))
      )}
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
    paddingBottom: 32,
  },
  header: {
    marginBottom: 14,
  },
  headerTitle: {
    fontSize: 13,
    fontWeight: '900',
    color: Colors.inkDark,
    letterSpacing: 1.2,
  },
  subtext: {
    fontSize: 12,
    color: Colors.inkMuted,
    marginTop: 2,
  },
  recordCard: {
    backgroundColor: Colors.cardBackground,
    borderWidth: 2,
    borderColor: Colors.inkDark,
    borderRadius: 4,
    padding: 14,
    marginVertical: 6,
    shadowColor: Colors.inkDark,
    shadowOffset: { width: 2, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 0,
    elevation: 2,
  },
  topRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    gap: 8,
  },
  courseName: {
    fontSize: 15,
    fontWeight: '800',
    color: Colors.inkDark,
  },
  dateText: {
    fontSize: 12,
    color: Colors.inkMuted,
    marginTop: 3,
    fontWeight: '600',
  },
  divider: {
    height: 1,
    backgroundColor: Colors.borderLight,
    marginVertical: 10,
  },
  bottomRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  metaText: {
    fontSize: 11,
    color: Colors.inkMuted,
    fontWeight: '700',
  },
  inspectText: {
    fontSize: 11,
    fontWeight: '800',
    color: Colors.inkDark,
    textDecorationLine: 'underline',
  },
});
