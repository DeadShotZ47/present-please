import * as Notifications from 'expo-notifications';
import { Platform, Alert } from 'react-native';

// Configure how notifications are handled when the app is in the foreground
Notifications.setNotificationHandler({
  handleNotification: async () => ({
    shouldShowAlert: true,
    shouldPlaySound: true,
    shouldSetBadge: false,
    shouldShowBanner: true,
    shouldShowList: true,
  }),
});

class NotificationService {
  private initialized = false;

  async init() {
    if (this.initialized) return;

    if (Platform.OS === 'android') {
      try {
        await Notifications.setNotificationChannelAsync('default', {
          name: 'การแจ้งเตือนคาบเรียน',
          importance: Notifications.AndroidImportance.MAX,
          vibrationPattern: [0, 250, 250, 250],
          lightColor: '#1B365D',
        });
      } catch (err) {
        console.warn('Error setting Android notification channel', err);
      }
    }

    this.initialized = true;
  }

  async requestPermissions(): Promise<boolean> {
    try {
      const { status: existingStatus } = await Notifications.getPermissionsAsync();
      let finalStatus = existingStatus;

      if (existingStatus !== 'granted') {
        const { status } = await Notifications.requestPermissionsAsync();
        finalStatus = status;
      }

      return finalStatus === 'granted';
    } catch (err) {
      console.warn('Error requesting notification permissions', err);
      return false;
    }
  }

  /**
   * Section 29 from requirement.md:
   * "Class starting soon
   * Mobile Application Development starts in 15 minutes.
   * Don't forget to check in."
   */
  async sendTestNotification(): Promise<boolean> {
    await this.init();

    try {
      const hasPermission = await this.requestPermissions();

      await Notifications.scheduleNotificationAsync({
        content: {
          title: '🔔 คาบเรียนกำลังจะเริ่ม (Class starting soon)',
          body: 'วิชา Mobile Application Development (CPE401) จะเริ่มในอีก 15 นาที • ห้อง 301 อย่าลืมเช็กชื่อเข้าเรียนนะ!',
          data: { courseId: 'course-1', courseCode: 'CPE401', room: 'ห้อง 301' },
          sound: true,
        },
        trigger: null, // trigger immediately
      });

      Alert.alert(
        '🔔 ยิงแจ้งเตือนสำเร็จ',
        'ระบบได้ส่งการแจ้งเตือนเตือนคาบเรียนเรียบร้อยแล้ว\n\nหัวข้อ: "คาบเรียนกำลังจะเริ่ม"\nเนื้อหา: "วิชา Mobile Application Development จะเริ่มในอีก 15 นาที"',
        [{ text: 'ตกลง' }]
      );

      return true;
    } catch (err: any) {
      console.warn('Failed to schedule notification', err);

      // Fallback alert for environments without native notifications (e.g. web or restricted simulator)
      Alert.alert(
        '🔔 ยิงแจ้งเตือน (จำลอง)',
        'วิชา Mobile Application Development (CPE401) จะเริ่มในอีก 15 นาที • ห้อง 301 อย่าลืมเช็กชื่อเข้าเรียนนะ!\n\n(จำลองการแจ้งเตือนตาม requirement.md ข้อ 29)',
        [{ text: 'ตกลง' }]
      );
      return false;
    }
  }

  async sendCustomReminder(courseName: string, room: string, minutes: number = 15): Promise<boolean> {
    await this.init();

    try {
      await this.requestPermissions();

      await Notifications.scheduleNotificationAsync({
        content: {
          title: '🔔 คาบเรียนกำลังจะเริ่ม',
          body: `วิชา ${courseName} (${room}) จะเริ่มในอีก ${minutes} นาที อย่าลืมเช็กชื่อเข้าเรียน!`,
          sound: true,
        },
        trigger: null,
      });

      return true;
    } catch (err) {
      console.warn('Failed to schedule custom notification', err);
      return false;
    }
  }
}

export const notificationService = new NotificationService();
