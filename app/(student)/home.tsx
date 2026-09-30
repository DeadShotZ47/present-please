import React, { useState, useEffect, useCallback } from 'react';
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
import { AttendanceSession, Attendance } from '../../types';
import Colors from '../../constants/Colors';
import { AttendanceCard } from '../../components/AttendanceCard';
import { LoadingState } from '../../components/LoadingState';
import { EmptyState } from '../../components/EmptyState';

export default function StudentHomeScreen() {
  const router = useRouter();
  const { user } = useAuth();

  const [sessions, setSessions] = useState<AttendanceSession[]>([]);
  const [attendances, setAttendances] = useState<Attendance[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  const loadData = async () => {
    try {
      const [todaySessions, studentAttendances] = await Promise.all([
        api.getTodaySessions(),
        user ? api.getStudentAttendance(user.id) : Promise.resolve([]),
      ]);
      setSessions(todaySessions);
      setAttendances(studentAttendances);
    } catch (err) {
      console.warn('Error loading student dashboard', err);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  useFocusEffect(
    useCallback(() => {
      loadData();
    }, [user])
  );

  const onRefresh = () => {
    setRefreshing(true);
    loadData();
  };

  if (loading && !refreshing) {
    return <LoadingState message="ACCESSING TODAY'S CHECKPOINTS..." />;
  }

  const checkedSessionIds = new Set(attendances.map((a) => a.sessionId));

  return (
    <ScrollView
      style={styles.container}
      contentContainerStyle={styles.content}
      refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} />}
    >
      {/* Official Identification Banner */}
      <View style={styles.idCard}>
        <View style={styles.idHeader}>
          <Text style={styles.idHeaderTag}>VERIFIED STUDENT CREDENTIAL</Text>
          <Text style={styles.idNumber}>{user?.studentId || '6501234567'}</Text>
        </View>
        <Text style={styles.greeting}>Good day, {user?.name}.</Text>
        <Text style={styles.subtext}>
          Ensure physical presence within designated room perimeter before initiating verification.
        </Text>
      </View>

      {/* Section Title */}
      <View style={styles.sectionHeader}>
        <Text style={styles.sectionTitle}>TODAY'S SCHEDULED SESSIONS</Text>
        <Text style={styles.sessionCount}>
          {sessions.length} {sessions.length === 1 ? 'SESSION' : 'SESSIONS'}
        </Text>
      </View>

      {sessions.length === 0 ? (
        <EmptyState
          title="NO SESSIONS SCHEDULED"
          message="No active class checkpoints are currently scheduled for today."
          actionTitle="REFRESH LIST"
          onAction={loadData}
        />
      ) : (
        sessions.map((session) => {
          const isCompleted = checkedSessionIds.has(session.id);
          return (
            <AttendanceCard
              key={session.id}
              session={session}
              isCompleted={isCompleted}
              onCheckAttendance={() => {
                router.push({
                  pathname: '/(student)/attendance/[sessionId]',
                  params: { sessionId: session.id },
                });
              }}
            />
          );
        })
      )}

      {/* Rules Information Box */}
      <View style={styles.protocolBox}>
        <Text style={styles.protocolTitle}>INSPECTION PROTOCOL MANDATE</Text>
        <Text style={styles.protocolItem}>• Proof of Presence requires valid GPS coordinates within classroom radius.</Text>
        <Text style={styles.protocolItem}>• Real-time photo evidence must show clear presence in lecture room.</Text>
        <Text style={styles.protocolItem}>• Duplicate check-ins for identical sessions will be rejected by backend.</Text>
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
    paddingBottom: 32,
  },
  idCard: {
    backgroundColor: Colors.cardBackground,
    borderWidth: 2,
    borderColor: Colors.inkDark,
    borderRadius: 4,
    padding: 16,
    marginBottom: 16,
    shadowColor: Colors.inkDark,
    shadowOffset: { width: 3, height: 3 },
    shadowOpacity: 0.12,
    shadowRadius: 0,
    elevation: 3,
  },
  idHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 6,
  },
  idHeaderTag: {
    fontSize: 9,
    fontWeight: '900',
    color: Colors.inkMuted,
    letterSpacing: 1,
  },
  idNumber: {
    fontSize: 12,
    fontWeight: '900',
    color: Colors.inkDark,
    letterSpacing: 1,
  },
  greeting: {
    fontSize: 20,
    fontWeight: '900',
    color: Colors.inkDark,
    letterSpacing: 0.5,
  },
  subtext: {
    fontSize: 12,
    color: Colors.inkMuted,
    marginTop: 4,
    lineHeight: 17,
  },
  sectionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 10,
    marginTop: 6,
  },
  sectionTitle: {
    fontSize: 13,
    fontWeight: '900',
    color: Colors.inkDark,
    letterSpacing: 1.2,
  },
  sessionCount: {
    fontSize: 11,
    fontWeight: '800',
    color: Colors.inkMuted,
    letterSpacing: 0.8,
  },
  protocolBox: {
    backgroundColor: Colors.panelBackground,
    borderWidth: 1.5,
    borderColor: Colors.inkMuted,
    borderRadius: 4,
    padding: 14,
    marginTop: 20,
  },
  protocolTitle: {
    fontSize: 11,
    fontWeight: '900',
    color: Colors.inkDark,
    letterSpacing: 1,
    marginBottom: 6,
  },
  protocolItem: {
    fontSize: 11,
    color: Colors.inkDark,
    lineHeight: 16,
    marginVertical: 2,
    fontWeight: '600',
  },
});
