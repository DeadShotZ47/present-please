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
import { AttendanceSession } from '../../types';
import Colors from '../../constants/Colors';
import { StatusBadge } from '../../components/StatusBadge';
import { PrimaryButton } from '../../components/PrimaryButton';
import { LoadingState } from '../../components/LoadingState';
import { EmptyState } from '../../components/EmptyState';

export default function TeacherHomeScreen() {
  const router = useRouter();
  const { user } = useAuth();

  const [sessions, setSessions] = useState<AttendanceSession[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  const loadSessions = async () => {
    try {
      const data = await api.getTodaySessions();
      setSessions(data);
    } catch (err) {
      console.warn('Error loading teacher sessions', err);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  useFocusEffect(
    useCallback(() => {
      loadSessions();
    }, [])
  );

  const toggleStatus = async (sessionId: string, currentStatus: 'open' | 'closed') => {
    try {
      const nextStatus = currentStatus === 'open' ? 'closed' : 'open';
      await api.updateSessionStatus(sessionId, nextStatus);
      await loadSessions();
    } catch (err) {
      console.warn('Error updating session status', err);
    }
  };

  if (loading && !refreshing) {
    return <LoadingState message="ACCESSING FACULTY COMMAND POST..." />;
  }

  return (
    <ScrollView
      style={styles.container}
      contentContainerStyle={styles.content}
      refreshControl={<RefreshControl refreshing={refreshing} onRefresh={() => { setRefreshing(true); loadSessions(); }} />}
    >
      {/* Officer Header Card */}
      <View style={styles.officerCard}>
        <View style={styles.officerRow}>
          <Text style={styles.officerTag}>CHECKPOINT CHIEF / FACULTY</Text>
          <Text style={styles.officerDept}>{user?.department || 'Department of Computer Science'}</Text>
        </View>
        <Text style={styles.officerName}>{user?.name || 'Instructor'}</Text>
        <Text style={styles.officerSub}>
          Oversee classroom boundary enforcement and review physical evidence submissions.
        </Text>
      </View>

      <View style={styles.sectionHeader}>
        <Text style={styles.sectionTitle}>ACTIVE CLASS SESSIONS</Text>
        <TouchableOpacity onPress={() => router.push('/(teacher)/create-session')}>
          <Text style={styles.newSessionLink}>+ NEW SESSION</Text>
        </TouchableOpacity>
      </View>

      {sessions.length === 0 ? (
        <EmptyState
          title="NO ACTIVE SESSIONS"
          message="No attendance sessions have been created for today."
          actionTitle="CREATE ATTENDANCE SESSION"
          onAction={() => router.push('/(teacher)/create-session')}
        />
      ) : (
        sessions.map((session) => {
          const isOpen = session.status === 'open';
          const present = session.totalPresent || 0;
          const total = session.totalExpected || 40;

          return (
            <View key={session.id} style={styles.sessionCard}>
              <View style={styles.cardTop}>
                <View style={{ flex: 1 }}>
                  <Text style={styles.code}>{session.courseCode || 'COURSE'}</Text>
                  <Text style={styles.courseName}>{session.courseName}</Text>
                </View>
                <StatusBadge status={isOpen ? 'open' : 'closed'} size="small" />
              </View>

              <View style={styles.divider} />

              <View style={styles.infoRow}>
                <View>
                  <Text style={styles.label}>TIME & ROOM</Text>
                  <Text style={styles.value}>
                    {session.startTime} - {session.endTime} ({session.room || 'Room 301'})
                  </Text>
                </View>
                <View style={{ alignItems: 'flex-end' }}>
                  <Text style={styles.label}>ATTENDANCE COUNT</Text>
                  <Text style={styles.attendanceCount}>
                    {present} / {total}
                  </Text>
                </View>
              </View>

              <View style={styles.buttonRow}>
                <PrimaryButton
                  title={isOpen ? 'CLOSE SESSION' : 'OPEN SESSION'}
                  variant={isOpen ? 'outline' : 'secondary'}
                  onPress={() => toggleStatus(session.id, session.status)}
                  style={{ flex: 1, height: 42 }}
                  textStyle={{ fontSize: 11 }}
                />
                <PrimaryButton
                  title="VIEW ATTENDANCE"
                  variant="primary"
                  onPress={() => {
                    router.push({
                      pathname: '/(teacher)/attendance/[sessionId]',
                      params: { sessionId: session.id },
                    });
                  }}
                  style={{ flex: 1.2, height: 42 }}
                  textStyle={{ fontSize: 11 }}
                />
              </View>
            </View>
          );
        })
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
    paddingBottom: 36,
  },
  officerCard: {
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
  officerRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 4,
  },
  officerTag: {
    fontSize: 9,
    fontWeight: '900',
    color: Colors.stampBlue,
    letterSpacing: 1,
  },
  officerDept: {
    fontSize: 10,
    color: Colors.inkMuted,
    fontWeight: '700',
  },
  officerName: {
    fontSize: 20,
    fontWeight: '900',
    color: Colors.inkDark,
    marginTop: 2,
  },
  officerSub: {
    fontSize: 12,
    color: Colors.inkMuted,
    marginTop: 4,
    lineHeight: 16,
  },
  sectionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 10,
  },
  sectionTitle: {
    fontSize: 13,
    fontWeight: '900',
    color: Colors.inkDark,
    letterSpacing: 1.2,
  },
  newSessionLink: {
    fontSize: 12,
    fontWeight: '900',
    color: Colors.inkDark,
    textDecorationLine: 'underline',
  },
  sessionCard: {
    backgroundColor: Colors.cardBackground,
    borderWidth: 2,
    borderColor: Colors.inkDark,
    borderRadius: 4,
    padding: 16,
    marginVertical: 6,
    shadowColor: Colors.inkDark,
    shadowOffset: { width: 2, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 0,
    elevation: 2,
  },
  cardTop: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    gap: 8,
  },
  code: {
    fontSize: 11,
    fontWeight: '800',
    color: Colors.inkMuted,
    letterSpacing: 1,
  },
  courseName: {
    fontSize: 16,
    fontWeight: '900',
    color: Colors.inkDark,
    marginTop: 2,
  },
  divider: {
    height: 1,
    backgroundColor: Colors.borderLight,
    marginVertical: 10,
  },
  infoRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 10,
  },
  label: {
    fontSize: 9,
    fontWeight: '700',
    color: Colors.inkMuted,
    letterSpacing: 0.6,
  },
  value: {
    fontSize: 13,
    fontWeight: '700',
    color: Colors.inkDark,
    marginTop: 2,
  },
  attendanceCount: {
    fontSize: 16,
    fontWeight: '900',
    color: Colors.stampBlue,
    marginTop: 2,
  },
  buttonRow: {
    flexDirection: 'row',
    gap: 8,
    marginTop: 6,
  },
});
