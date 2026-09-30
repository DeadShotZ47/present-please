import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import Colors from '../constants/Colors';
import { AttendanceSession } from '../types';
import { StatusBadge } from './StatusBadge';
import { PrimaryButton } from './PrimaryButton';

interface AttendanceCardProps {
  session: AttendanceSession;
  onCheckAttendance?: () => void;
  onViewDetails?: () => void;
  isCompleted?: boolean;
}

export const AttendanceCard: React.FC<AttendanceCardProps> = ({
  session,
  onCheckAttendance,
  onViewDetails,
  isCompleted = false,
}) => {
  const isOpen = session.status === 'open';

  return (
    <View style={styles.card}>
      <View style={styles.headerRow}>
        <View style={{ flex: 1 }}>
          <Text style={styles.codeText}>{session.courseCode || 'COURSE'}</Text>
          <Text style={styles.titleText}>{session.courseName || 'Class Session'}</Text>
        </View>
        <StatusBadge
          status={isCompleted ? 'present' : isOpen ? 'open' : 'closed'}
          label={isCompleted ? '✓ CHECKED' : undefined}
          size="small"
        />
      </View>

      <View style={styles.divider} />

      <View style={styles.infoGrid}>
        <View style={styles.infoCol}>
          <Text style={styles.label}>TIME WINDOW</Text>
          <Text style={styles.value}>{session.startTime} - {session.endTime}</Text>
        </View>
        <View style={styles.infoCol}>
          <Text style={styles.label}>ROOM</Text>
          <Text style={styles.value}>{session.room || 'Room 301'}</Text>
        </View>
        <View style={styles.infoCol}>
          <Text style={styles.label}>RADIUS</Text>
          <Text style={styles.value}>{session.allowedRadius}m</Text>
        </View>
      </View>

      {onCheckAttendance && !isCompleted && (
        <View style={styles.actionContainer}>
          {isOpen ? (
            <PrimaryButton
              title="CHECK ATTENDANCE"
              variant="primary"
              onPress={onCheckAttendance}
              style={{ marginTop: 8 }}
            />
          ) : (
            <View style={styles.closedNotice}>
              <Text style={styles.closedText}>ATTENDANCE: NOT OPEN</Text>
            </View>
          )}
        </View>
      )}

      {onViewDetails && (
        <TouchableOpacity onPress={onViewDetails} style={styles.detailsLink}>
          <Text style={styles.detailsLinkText}>INSPECT SESSION DETAILS →</Text>
        </TouchableOpacity>
      )}
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
    shadowColor: Colors.inkDark,
    shadowOffset: { width: 3, height: 3 },
    shadowOpacity: 0.15,
    shadowRadius: 0,
    elevation: 3,
  },
  headerRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    gap: 8,
  },
  codeText: {
    fontSize: 12,
    fontWeight: '800',
    color: Colors.inkMuted,
    letterSpacing: 1,
    textTransform: 'uppercase',
  },
  titleText: {
    fontSize: 18,
    fontWeight: '800',
    color: Colors.inkDark,
    marginTop: 2,
  },
  divider: {
    height: 1,
    backgroundColor: Colors.borderLight,
    marginVertical: 12,
  },
  infoGrid: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 8,
  },
  infoCol: {
    flex: 1,
  },
  label: {
    fontSize: 10,
    fontWeight: '700',
    color: Colors.inkMuted,
    letterSpacing: 0.8,
  },
  value: {
    fontSize: 14,
    fontWeight: '700',
    color: Colors.inkDark,
    marginTop: 2,
  },
  actionContainer: {
    marginTop: 6,
  },
  closedNotice: {
    backgroundColor: Colors.panelBackground,
    borderWidth: 1,
    borderColor: Colors.borderLight,
    paddingVertical: 10,
    alignItems: 'center',
    borderRadius: 3,
    marginTop: 6,
  },
  closedText: {
    fontSize: 12,
    fontWeight: '700',
    color: Colors.inkMuted,
    letterSpacing: 1,
  },
  detailsLink: {
    marginTop: 10,
    alignItems: 'center',
  },
  detailsLinkText: {
    fontSize: 12,
    fontWeight: '800',
    color: Colors.inkDark,
    textDecorationLine: 'underline',
  },
});
