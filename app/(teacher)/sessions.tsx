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
import { api } from '../../services/api';
import { AttendanceSession } from '../../types';
import Colors from '../../constants/Colors';
import { StatusBadge } from '../../components/StatusBadge';
import { LoadingState } from '../../components/LoadingState';
import { EmptyState } from '../../components/EmptyState';

export default function TeacherSessionsScreen() {
  const router = useRouter();
  const [sessions, setSessions] = useState<AttendanceSession[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  const loadSessions = async () => {
    try {
      const data = await api.getTodaySessions();
      setSessions(data);
    } catch (err) {
      console.warn('Error loading sessions', err);
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

  if (loading && !refreshing) {
    return <LoadingState message="ACCESSING SESSION REGISTRY..." />;
  }

  return (
    <ScrollView
      style={styles.container}
      contentContainerStyle={styles.content}
      refreshControl={<RefreshControl refreshing={refreshing} onRefresh={() => { setRefreshing(true); loadSessions(); }} />}
    >
      <View style={styles.header}>
        <Text style={styles.headerTitle}>REGISTRY OF ATTENDANCE CHECKPOINTS</Text>
        <Text style={styles.subtext}>Master archive of created verification perimeters</Text>
      </View>

      {sessions.length === 0 ? (
        <EmptyState
          title="NO SESSIONS REGISTERED"
          message="No attendance sessions recorded."
        />
      ) : (
        sessions.map((session) => (
          <TouchableOpacity
            key={session.id}
            style={styles.sessionCard}
            activeOpacity={0.7}
            onPress={() => {
              router.push({
                pathname: '/(teacher)/attendance/[sessionId]',
                params: { sessionId: session.id },
              });
            }}
          >
            <View style={styles.topRow}>
              <View style={{ flex: 1 }}>
                <Text style={styles.code}>{session.courseCode}</Text>
                <Text style={styles.courseName}>{session.courseName}</Text>
              </View>
              <StatusBadge status={session.status} size="small" />
            </View>

            <View style={styles.divider} />

            <View style={styles.detailsRow}>
              <Text style={styles.detailText}>
                {session.date} • {session.startTime} - {session.endTime}
              </Text>
              <Text style={styles.roomText}>{session.room || 'Room 301'}</Text>
            </View>

            <View style={styles.perimeterRow}>
              <Text style={styles.perimeterLabel}>
                PERIMETER: ({session.latitude.toFixed(4)}, {session.longitude.toFixed(4)}) • RADIUS: {session.allowedRadius}m
              </Text>
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
    paddingBottom: 36,
  },
  header: {
    marginBottom: 12,
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
  sessionCard: {
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
  code: {
    fontSize: 11,
    fontWeight: '800',
    color: Colors.inkMuted,
    letterSpacing: 1,
  },
  courseName: {
    fontSize: 15,
    fontWeight: '800',
    color: Colors.inkDark,
    marginTop: 2,
  },
  divider: {
    height: 1,
    backgroundColor: Colors.borderLight,
    marginVertical: 10,
  },
  detailsRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  detailText: {
    fontSize: 12,
    fontWeight: '700',
    color: Colors.inkDark,
  },
  roomText: {
    fontSize: 12,
    fontWeight: '800',
    color: Colors.inkMuted,
  },
  perimeterRow: {
    marginTop: 6,
    paddingTop: 6,
    borderTopWidth: 1,
    borderColor: Colors.panelBackground,
  },
  perimeterLabel: {
    fontSize: 10,
    fontWeight: '700',
    color: Colors.inkMuted,
    letterSpacing: 0.5,
  },
});
