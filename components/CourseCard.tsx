import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import Colors from '../constants/Colors';
import { Course } from '../types';

interface CourseCardProps {
  course: Course;
}

export const CourseCard: React.FC<CourseCardProps> = ({ course }) => {
  return (
    <View style={styles.card}>
      <View style={styles.topRow}>
        <Text style={styles.code}>{course.code}</Text>
        <Text style={styles.students}>{course.enrolledStudentsCount || 40} คน</Text>
      </View>
      <Text style={styles.name}>{course.name}</Text>
      
      <View style={styles.divider} />

      <View style={styles.infoRow}>
        <View>
          <Text style={styles.label}>อาจารย์ผู้สอน</Text>
          <Text style={styles.value}>{course.teacherName || 'อาจารย์ประจำวิชา'}</Text>
        </View>
        <View style={{ alignItems: 'flex-end' }}>
          <Text style={styles.label}>ห้องเรียน / ตารางเวลา</Text>
          <Text style={styles.value}>{course.room} • {course.schedule}</Text>
        </View>
      </View>
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
    alignItems: 'center',
  },
  code: {
    fontSize: 12,
    fontWeight: '800',
    color: Colors.inkMuted,
    letterSpacing: 1,
  },
  students: {
    fontSize: 10,
    fontWeight: '800',
    color: Colors.stampBlue,
    backgroundColor: Colors.stampBlueBg,
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 2,
    letterSpacing: 0.5,
  },
  name: {
    fontSize: 16,
    fontWeight: '800',
    color: Colors.inkDark,
    marginTop: 4,
  },
  divider: {
    height: 1,
    backgroundColor: Colors.borderLight,
    marginVertical: 10,
  },
  infoRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  label: {
    fontSize: 9,
    fontWeight: '700',
    color: Colors.inkMuted,
    letterSpacing: 0.6,
  },
  value: {
    fontSize: 12,
    fontWeight: '700',
    color: Colors.inkDark,
    marginTop: 2,
  },
});
