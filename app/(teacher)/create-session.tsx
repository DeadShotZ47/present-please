import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  TextInput,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  ActivityIndicator,
  Alert,
} from 'react-native';
import { useRouter } from 'expo-router';
import { api } from '../../services/api';
import { Course } from '../../types';
import Colors from '../../constants/Colors';
import { PrimaryButton } from '../../components/PrimaryButton';
import { ErrorMessage } from '../../components/ErrorMessage';
import { LocationService } from '../../services/location';
import { TimePickerModal } from '../../components/TimePickerModal';
import { DatePickerModal } from '../../components/DatePickerModal';
import { RealMapView } from '../../components/RealMapView';

export default function CreateSessionScreen() {
  const router = useRouter();

  const [courses, setCourses] = useState<Course[]>([]);
  const [selectedCourse, setSelectedCourse] = useState<Course | null>(null);

  const todayStr = new Date().toISOString().split('T')[0];
  const [date, setDate] = useState(todayStr);

  // Default times around current time
  const now = new Date();
  const currentHourStr = now.getHours().toString().padStart(2, '0');
  const nextHourStr = ((now.getHours() + 3) % 24).toString().padStart(2, '0');
  const [startTime, setStartTime] = useState(`${currentHourStr}:00`);
  const [endTime, setEndTime] = useState(`${nextHourStr}:00`);
  const [room, setRoom] = useState('ห้อง 301');
  const [latitude, setLatitude] = useState('16.474431');
  const [longitude, setLongitude] = useState('102.823101');
  const [allowedRadius, setAllowedRadius] = useState('50');

  // Modals state
  const [timePickerTarget, setTimePickerTarget] = useState<'start' | 'end' | null>(null);
  const [datePickerVisible, setDatePickerVisible] = useState(false);

  const [fetchingGps, setFetchingGps] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    loadCourses();
  }, []);

  const loadCourses = async () => {
    try {
      const data = await api.getCourses();
      setCourses(data);
      if (data.length > 0) {
        setSelectedCourse(data[0]);
        if (data[0].room) setRoom(data[0].room);
      }
    } catch (err) {
      console.warn('Error loading courses', err);
    }
  };

  const handleUseCurrentLocation = async () => {
    setFetchingGps(true);
    setError(null);
    try {
      const pos = await LocationService.getCurrentPosition();
      if (pos) {
        setLatitude(pos.latitude.toFixed(6));
        setLongitude(pos.longitude.toFixed(6));
      } else {
        setError('ไม่สามารถดึงพิกัดตำแหน่งปัจจุบันได้');
      }
    } catch (err: any) {
      setError(err?.message || 'เกิดข้อผิดพลาดในการดึงพิกัด');
    } finally {
      setFetchingGps(false);
    }
  };

  const handleCreate = async () => {
    setError(null);
    if (!selectedCourse) {
      setError('กรุณาเลือกวิชาที่ต้องการเปิดเช็กชื่อ');
      return;
    }
    const latNum = parseFloat(latitude);
    const lonNum = parseFloat(longitude);
    const radiusNum = parseInt(allowedRadius, 10);

    if (isNaN(latNum) || isNaN(lonNum)) {
      setError('พิกัดละติจูดและลองจิจูดต้องเป็นตัวเลขที่ถูกต้อง');
      return;
    }
    if (!startTime || !endTime) {
      setError('กรุณากำหนดเวลาเริ่มและเวลาเลิกเรียน');
      return;
    }
    const [startH, startM] = startTime.split(':').map(Number);
    const [endH, endM] = endTime.split(':').map(Number);
    if (startH * 60 + startM >= endH * 60 + endM) {
      setError('เวลาเลิกเรียนต้องอยู่หลังเวลาเริ่มเรียน (เช่น เริ่ม 09:00 เลิก 12:00)');
      return;
    }

    try {
      setSubmitting(true);
      await api.createSession({
        courseId: selectedCourse.id,
        courseName: selectedCourse.name,
        courseCode: selectedCourse.code,
        room: room.trim() || 'ห้อง 301',
        date,
        startTime,
        endTime,
        latitude: latNum,
        longitude: lonNum,
        allowedRadius: radiusNum,
        totalExpected: selectedCourse.enrolledStudentsCount || 40,
      });

      Alert.alert(
        'เปิดคาบเช็กชื่อสำเร็จ',
        `เปิดรับการเช็กชื่อสำหรับวิชา "${selectedCourse.name}" เรียบร้อยแล้ว`,
        [
          {
            text: 'ตกลง',
            onPress: () => router.replace('/(teacher)/home'),
          },
        ]
      );
    } catch (err: any) {
      setError(err?.message || 'ไม่สามารถเปิดคาบเช็กชื่อได้');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <ScrollView style={styles.container} contentContainerStyle={styles.content}>
      <View style={styles.card}>
        <Text style={styles.cardHeader}>สร้างคาบเช็กชื่อใหม่</Text>
        <Text style={styles.cardSub}>กำหนดวัน เวลา ห้องเรียน และพิกัดรัศมีสำหรับเช็กชื่อ</Text>
        <View style={styles.headerDivider} />

        <ErrorMessage message={error || ''} />

        {/* Course Selection */}
        <Text style={styles.label}>เลือกรายวิชา</Text>
        <View style={styles.courseList}>
          {courses.map((c) => (
            <TouchableOpacity
              key={c.id}
              style={[
                styles.courseOption,
                selectedCourse?.id === c.id && styles.courseOptionActive,
              ]}
              onPress={() => {
                setSelectedCourse(c);
                if (c.room) setRoom(c.room);
              }}
            >
              <Text
                style={[
                  styles.courseOptionText,
                  selectedCourse?.id === c.id && styles.courseOptionTextActive,
                ]}
              >
                {c.code} — {c.name}
              </Text>
            </TouchableOpacity>
          ))}
        </View>

        {/* Date and Times with UI Pickers */}
        <View style={styles.row}>
          <View style={[styles.inputGroup, { flex: 1 }]}>
            <Text style={styles.label}>วันที่ทำการสอน</Text>
            <TouchableOpacity
              style={styles.pickerButton}
              onPress={() => setDatePickerVisible(true)}
            >
              <Text style={styles.pickerValueText}>📅 {date}</Text>
              <Text style={styles.pickerHint}>แตะเพื่อเปลี่ยนวัน</Text>
            </TouchableOpacity>
          </View>
          <View style={[styles.inputGroup, { flex: 1 }]}>
            <Text style={styles.label}>ห้องเรียน</Text>
            <TextInput
              style={styles.input}
              value={room}
              onChangeText={setRoom}
              placeholder="ห้อง 301"
            />
          </View>
        </View>

        <View style={styles.row}>
          <View style={[styles.inputGroup, { flex: 1 }]}>
            <Text style={styles.label}>เวลาเริ่มเรียน</Text>
            <TouchableOpacity
              style={styles.pickerButton}
              onPress={() => setTimePickerTarget('start')}
            >
              <Text style={styles.pickerValueText}>🕒 {startTime} น.</Text>
              <Text style={styles.pickerHint}>แตะเพื่อเลือกเวลา</Text>
            </TouchableOpacity>
          </View>
          <View style={[styles.inputGroup, { flex: 1 }]}>
            <Text style={styles.label}>เวลาเลิกเรียน</Text>
            <TouchableOpacity
              style={styles.pickerButton}
              onPress={() => setTimePickerTarget('end')}
            >
              <Text style={styles.pickerValueText}>🕒 {endTime} น.</Text>
              <Text style={styles.pickerHint}>แตะเพื่อเลือกเวลา</Text>
            </TouchableOpacity>
          </View>
        </View>

        {/* GPS Coordinates Section */}
        <View style={styles.geoBox}>
          <View style={styles.geoHeader}>
            <Text style={styles.geoTitle}>พิกัดตำแหน่งห้องเรียน (GPS)</Text>
            <Text style={styles.geoSubText}>สามารถกรอกพิกัดเอง หรือกดปุ่มดึงพิกัดปัจจุบัน</Text>
          </View>

          <TouchableOpacity
            style={styles.gpsButton}
            onPress={handleUseCurrentLocation}
            disabled={fetchingGps}
            activeOpacity={0.8}
          >
            {fetchingGps ? (
              <ActivityIndicator size="small" color="#FFFFFF" />
            ) : (
              <Text style={styles.gpsButtonText}>📍 ดึงพิกัดตำแหน่งปัจจุบันของฉัน</Text>
            )}
          </TouchableOpacity>

          <View style={styles.row}>
            <View style={[styles.inputGroup, { flex: 1 }]}>
              <Text style={styles.label}>ละติจูด (Latitude)</Text>
              <TextInput
                style={styles.input}
                value={latitude}
                onChangeText={setLatitude}
                keyboardType="numeric"
              />
            </View>
            <View style={[styles.inputGroup, { flex: 1 }]}>
              <Text style={styles.label}>ลองจิจูด (Longitude)</Text>
              <TextInput
                style={styles.input}
                value={longitude}
                onChangeText={setLongitude}
                keyboardType="numeric"
              />
            </View>
          </View>

          <View style={styles.inputGroup}>
            <Text style={styles.label}>รัศมีที่อนุญาตให้นักศึกษาเช็กชื่อ (เมตร)</Text>
            <TextInput
              style={styles.input}
              value={allowedRadius}
              onChangeText={setAllowedRadius}
              keyboardType="numeric"
              placeholder="50"
            />
          </View>

          {/* Map Preview for Teacher */}
          {!isNaN(parseFloat(latitude)) && !isNaN(parseFloat(longitude)) && (
            <View style={{ marginTop: 12 }}>
              <Text style={[styles.label, { marginBottom: 6 }]}>แผนที่พิกัดห้องเรียนและรัศมี</Text>
              <RealMapView
                classroomCoords={{
                  latitude: parseFloat(latitude),
                  longitude: parseFloat(longitude),
                }}
                classroomName={room.trim() || 'ห้องเรียน'}
                allowedRadius={parseFloat(allowedRadius) || 50}
                height={180}
              />
            </View>
          )}
        </View>

        <PrimaryButton
          title="บันทึกและเปิดรับเช็กชื่อ"
          variant="primary"
          loading={submitting}
          onPress={handleCreate}
          style={{ marginTop: 16 }}
        />
      </View>

      {/* Time Picker Modal */}
      <TimePickerModal
        visible={timePickerTarget !== null}
        title={timePickerTarget === 'start' ? 'เลือกเวลาเริ่มเรียน' : 'เลือกเวลาเลิกเรียน'}
        initialTime={timePickerTarget === 'start' ? startTime : endTime}
        onConfirm={(newTime) => {
          if (timePickerTarget === 'start') {
            setStartTime(newTime);
          } else {
            setEndTime(newTime);
          }
        }}
        onClose={() => setTimePickerTarget(null)}
      />

      {/* Date Picker Modal */}
      <DatePickerModal
        visible={datePickerVisible}
        selectedDate={date}
        onConfirm={(newDate) => setDate(newDate)}
        onClose={() => setDatePickerVisible(false)}
      />
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
    paddingBottom: 40,
  },
  card: {
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
  cardHeader: {
    fontSize: 13,
    fontWeight: '900',
    color: Colors.inkDark,
    letterSpacing: 1.2,
  },
  cardSub: {
    fontSize: 11,
    color: Colors.inkMuted,
    marginTop: 2,
  },
  headerDivider: {
    height: 2,
    backgroundColor: Colors.inkDark,
    marginTop: 8,
    marginBottom: 14,
  },
  courseList: {
    gap: 6,
    marginBottom: 14,
  },
  courseOption: {
    backgroundColor: Colors.panelBackground,
    borderWidth: 1.5,
    borderColor: Colors.borderLight,
    padding: 10,
    borderRadius: 3,
  },
  courseOptionActive: {
    backgroundColor: Colors.inkDark,
    borderColor: Colors.inkDark,
  },
  courseOptionText: {
    fontSize: 12,
    fontWeight: '800',
    color: Colors.inkDark,
  },
  courseOptionTextActive: {
    color: '#FFFFFF',
  },
  row: {
    flexDirection: 'row',
    gap: 10,
  },
  inputGroup: {
    marginBottom: 12,
  },
  label: {
    fontSize: 10,
    fontWeight: '800',
    color: Colors.inkMuted,
    letterSpacing: 0.8,
    marginBottom: 4,
  },
  input: {
    backgroundColor: '#FFFFFF',
    borderWidth: 1.5,
    borderColor: Colors.inkDark,
    borderRadius: 3,
    height: 44,
    paddingHorizontal: 10,
    fontSize: 13,
    fontWeight: '700',
    color: Colors.inkDark,
  },
  pickerButton: {
    backgroundColor: '#FFFFFF',
    borderWidth: 1.5,
    borderColor: Colors.inkDark,
    borderRadius: 3,
    height: 44,
    paddingHorizontal: 10,
    justifyContent: 'center',
  },
  pickerValueText: {
    fontSize: 13,
    fontWeight: '800',
    color: Colors.inkDark,
  },
  pickerHint: {
    fontSize: 9,
    fontWeight: '700',
    color: Colors.stampBlue,
    marginTop: 1,
  },
  geoBox: {
    backgroundColor: '#F9F7F2',
    borderWidth: 1.5,
    borderColor: Colors.inkDark,
    borderRadius: 4,
    padding: 12,
    marginVertical: 8,
  },
  geoHeader: {
    marginBottom: 8,
  },
  geoTitle: {
    fontSize: 12,
    fontWeight: '900',
    color: Colors.inkDark,
    letterSpacing: 0.6,
  },
  geoSubText: {
    fontSize: 10,
    color: Colors.inkMuted,
    marginTop: 2,
    fontWeight: '600',
  },
  gpsButton: {
    backgroundColor: Colors.stampBlue,
    borderWidth: 1.5,
    borderColor: Colors.inkDark,
    paddingVertical: 9,
    paddingHorizontal: 12,
    borderRadius: 4,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 12,
  },
  gpsButtonText: {
    fontSize: 11,
    fontWeight: '900',
    color: '#FFFFFF',
    letterSpacing: 0.5,
  },
});
