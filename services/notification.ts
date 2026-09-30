import { Platform, Alert } from 'react-native';
import * as Notifications from 'expo-notifications';

export const REMINDER_CHANNEL = 'class-reminders';

// Configure how notifications appear when app is in the foreground
Notifications.setNotificationHandler({
  handleNotification: async () => ({
    shouldShowAlert: true,
    shouldShowBanner: true,
    shouldShowList: true,
    shouldPlaySound: true,
    shouldSetBadge: false,
  }),
});

/**
 * Request notification permissions and configure Android notification channel
 * (Adapted from expo-location project pattern)
 */
export async function ensureNotificationPermission(): Promise<boolean> {
  if (Platform.OS === 'android') {
    try {
      await Notifications.setNotificationChannelAsync(REMINDER_CHANNEL, {
        name: 'การแจ้งเตือนคาบเรียน',
        description: 'แจ้งเตือนเมื่อใกล้ถึงเวลาเริ่มเรียนของรายวิชา',
        importance: Notifications.AndroidImportance.HIGH,
        vibrationPattern: [0, 250, 250, 250],
        lightColor: '#153966',
        enableLights: true,
        enableVibrate: true,
      });
    } catch (channelError) {
      console.warn('[notifications] Channel creation warning:', channelError);
    }
  }

  try {
    const current = await Notifications.getPermissionsAsync();
    if (current.granted) return true;

    const requested = await Notifications.requestPermissionsAsync({
      ios: {
        allowAlert: true,
        allowBadge: true,
        allowSound: true,
      },
    });
    return requested.granted;
  } catch (permError) {
    console.warn('[notifications] Permission check error:', permError);
    return false;
  }
}

/**
 * Schedule a quick test notification (default: 3 seconds) for testing foreground & background notifications
 * Follows 3-tier fallback strategy from expo-location:
 * 1. TIME_INTERVAL trigger
 * 2. DATE trigger fallback
 * 3. Immediate trigger (null) fallback
 */
export async function scheduleTestReminder(seconds = 3): Promise<string> {
  const granted = await ensureNotificationPermission();
  if (!granted) {
    throw new Error('notification-permission-denied');
  }

  const content: Notifications.NotificationContentInput = {
    title: '🔔 คาบเรียนกำลังจะเริ่ม (Class starting soon)',
    body: 'วิชา Mobile Application Development (CPE401) จะเริ่มในอีก 15 นาที • ห้อง 301 อย่าลืมเช็กชื่อเข้าเรียนนะ!',
    data: { courseId: 'course-1', courseCode: 'CPE401', room: 'ห้อง 301' },
    sound: true,
  };

  try {
    // 1st attempt: Time interval trigger
    const notificationId = await Notifications.scheduleNotificationAsync({
      content,
      trigger: {
        type: Notifications.SchedulableTriggerInputTypes.TIME_INTERVAL,
        seconds: Math.max(1, seconds),
        repeats: false,
        channelId: REMINDER_CHANNEL,
      },
    });

    return notificationId;
  } catch (firstErr: any) {
    console.warn('[notifications] TIME_INTERVAL failed, trying DATE trigger fallback:', firstErr);
    try {
      // 2nd attempt: Date trigger fallback
      const targetDate = new Date(Date.now() + Math.max(1, seconds) * 1000);
      const notificationId = await Notifications.scheduleNotificationAsync({
        content,
        trigger: {
          type: Notifications.SchedulableTriggerInputTypes.DATE,
          date: targetDate,
          channelId: REMINDER_CHANNEL,
        },
      });
      return notificationId;
    } catch (secondErr: any) {
      console.warn('[notifications] DATE trigger failed, trying immediate trigger fallback:', secondErr);
      // 3rd attempt: immediate trigger (trigger: null)
      const notificationId = await Notifications.scheduleNotificationAsync({
        content,
        trigger: null,
      });
      return notificationId;
    }
  }
}

/**
 * High-level helper for UI triggers with user feedback alerts
 */
export async function triggerTestNotificationWithFeedback(seconds = 3): Promise<boolean> {
  try {
    await scheduleTestReminder(seconds);
    Alert.alert(
      `เริ่มทดสอบแจ้งเตือน (${seconds} วินาที) ⏱️`,
      `การแจ้งเตือนจะแสดงผลในอีก ${seconds} วินาที\n\n(สามารถพับแอปไปหน้าโฮมเพื่อทดสอบการแจ้งเตือนตอนอยู่ Background ได้ครับ)`
    );
    return true;
  } catch (error: any) {
    console.error('[triggerTestNotificationWithFeedback error]:', error);
    if (error?.message === 'notification-permission-denied') {
      Alert.alert(
        'ไม่ได้รับอนุญาต',
        'กรุณาเปิดสิทธิ์การแจ้งเตือน (Notifications Permission) ในการตั้งค่าอุปกรณ์'
      );
    } else {
      const errorDetail = error?.message || (typeof error === 'object' ? JSON.stringify(error) : String(error));
      Alert.alert('เกิดข้อผิดพลาด', `ไม่สามารถส่งการแจ้งเตือนทดสอบได้:\n${errorDetail}`);
    }
    return false;
  }
}

// Keep backward compatibility object
export const notificationService = {
  init: ensureNotificationPermission,
  requestPermissions: ensureNotificationPermission,
  sendTestNotification: () => triggerTestNotificationWithFeedback(3),
  scheduleTestReminder,
};
