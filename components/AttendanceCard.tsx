import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import Colors from '../constants/Colors';
import { AttendanceSession } from '../types';
import { StatusBadge } from './StatusBadge';
import { PrimaryButton } from './PrimaryButton';

import { getSessionTimeStatus } from '../utils/sessionTime';

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
  const timeStatus = getSessionTimeStatus(session);

  const getBadgeInfo = () => {
    if (isCompleted) return { status: 'present' as const, label: '✓ เช็กชื่อแล้ว' };
    if (!isOpen) return { status: 'closed' as const, label: 'ปิดรับเช็กชื่อ' };
    if (timeStatus.status === 'before') return { status: 'waiting' as const, label: timeStatus.badgeLabel };
    if (timeStatus.status === 'after') return { status: 'expired' as const, label: timeStatus.badgeLabel };
    return { status: 'open' as const, label: 'เปิดรับเช็กชื่อ' };
  };

  const badgeInfo = getBadgeInfo();
  const canCheckIn = isOpen && timeStatus.canCheckIn && !isCompleted;

  return (
    <View style={styles.card}>
      <View style={styles.headerRow}>
        <View style={{ flex: 1 }}>
          <Text style={styles.codeText}>{session.courseCode || 'COURSE'}</Text>
          <Text style={styles.titleText}>{session.courseName || 'Class Session'}</Text>
        </View>
        <StatusBadge
          status={badgeInfo.status}
          label={badgeInfo.label}
          size="small"
        />
      </View>

      <View style={styles.divider} />

      <View style={styles.infoGrid}>
        <View style={styles.infoCol}>
          <Text style={styles.label}>เวลาเรียน</Text>
          <Text style={styles.value}>{session.startTime} - {session.endTime}</Text>
        </View>
        <View style={styles.infoCol}>
          <Text style={styles.label}>ห้องเรียน</Text>
          <Text style={styles.value}>{session.room || 'ห้อง 301'}</Text>
        </View>
        <View style={styles.infoCol}>
          <Text style={styles.label}>รัศมีพิกัด</Text>
          <Text style={styles.value}>{session.allowedRadius} ม.</Text>
        </View>
      </View>

      {onCheckAttendance && !isCompleted && (
        <View style={styles.actionContainer}>
          {!isOpen ? (
            <View style={styles.closedNotice}>
              <Text style={styles.closedText}>อาจารย์ปิดรับการเช็กชื่อแล้ว</Text>
            </View>
          ) : timeStatus.status === 'before' ? (
            <View style={styles.waitingNotice}>
              <Text style={styles.waitingNoticeTitle}>🕒 ยังไม่ถึงเวลาเริ่มเรียน</Text>
              <Text style={styles.waitingNoticeSub}>
                เปิดเช็กชื่อเฉพาะช่วงเวลาเรียน ({session.startTime} - {session.endTime} น.)
              </Text>
            </View>
          ) : timeStatus.status === 'after' ? (
            <View style={styles.closedNotice}>
              <Text style={styles.closedText}>หมดเวลาเช็กชื่อแล้ว (สิ้นสุด {session.endTime} น.)</Text>
            </View>
          ) : (
            <PrimaryButton
              title="เช็กชื่อเข้าเรียน"
              variant="primary"
              onPress={onCheckAttendance}
              style={{ marginTop: 8 }}
            />
          )}
        </View>
      )}

      {onViewDetails && (
        <TouchableOpacity onPress={onViewDetails} style={styles.detailsLink}>
          <Text style={styles.detailsLinkText}>ดูรายละเอียดคาบเรียน →</Text>
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
    letterSpacing: 0.5,
  },
  waitingNotice: {
    backgroundColor: Colors.stampAmberBg,
    borderWidth: 1.5,
    borderColor: Colors.stampAmber,
    paddingVertical: 10,
    paddingHorizontal: 12,
    alignItems: 'center',
    borderRadius: 4,
    marginTop: 6,
  },
  waitingNoticeTitle: {
    fontSize: 12,
    fontWeight: '900',
    color: Colors.stampAmber,
  },
  waitingNoticeSub: {
    fontSize: 10,
    fontWeight: '600',
    color: Colors.inkDark,
    marginTop: 2,
    textAlign: 'center',
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
