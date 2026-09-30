import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, ScrollView, RefreshControl } from 'react-native';
import { api } from '../../services/api';
import { Course } from '../../types';
import Colors from '../../constants/Colors';
import { CourseCard } from '../../components/CourseCard';
import { LoadingState } from '../../components/LoadingState';
import { EmptyState } from '../../components/EmptyState';

export default function StudentClassesScreen() {
  const [courses, setCourses] = useState<Course[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  const loadCourses = async () => {
    try {
      const data = await api.getCourses();
      setCourses(data);
    } catch (err) {
      console.warn('Error loading courses', err);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  useEffect(() => {
    loadCourses();
  }, []);

  if (loading && !refreshing) {
    return <LoadingState message="กำลังโหลดรายวิชาที่ลงทะเบียน..." />;
  }

  return (
    <ScrollView
      style={styles.container}
      contentContainerStyle={styles.content}
      refreshControl={<RefreshControl refreshing={refreshing} onRefresh={() => { setRefreshing(true); loadCourses(); }} />}
    >
      <View style={styles.header}>
        <Text style={styles.headerTitle}>รายวิชาที่ลงทะเบียนเรียน</Text>
        <Text style={styles.subtext}>รายวิชาทั้งหมดในภาคการศึกษาปี 2026</Text>
      </View>

      {courses.length === 0 ? (
        <EmptyState
          title="ไม่พบรายวิชาที่ลงทะเบียน"
          message="ยังไม่มีข้อมูลการลงทะเบียนเรียนในระบบของคุณ"
        />
      ) : (
        courses.map((course) => <CourseCard key={course.id} course={course} />)
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
});
