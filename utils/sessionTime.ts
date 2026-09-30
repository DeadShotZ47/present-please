/**
 * Utilities for calculating and validating session time windows.
 */

export interface SessionTimeStatus {
  status: 'before' | 'during' | 'after';
  canCheckIn: boolean;
  message: string;
  badgeLabel: string;
  formattedTimeRange: string;
}

/**
 * Checks whether the current time is before, during, or after the session's scheduled time.
 * Enforces rule: Check-in is strictly forbidden before start time and after end time.
 */
export function getSessionTimeStatus(session: {
  date: string;
  startTime: string;
  endTime: string;
}): SessionTimeStatus {
  try {
    const datePart = (session.date || '').split('T')[0];
    const [year, month, day] = datePart.split('-').map(Number);
    const [startH, startM] = (session.startTime || '00:00').split(':').map(Number);
    const [endH, endM] = (session.endTime || '23:59').split(':').map(Number);

    if (isNaN(year) || isNaN(month) || isNaN(day) || isNaN(startH) || isNaN(startM) || isNaN(endH) || isNaN(endM)) {
      return {
        status: 'during',
        canCheckIn: true,
        message: 'อยู่ในช่วงเวลาเช็กชื่อ',
        badgeLabel: 'เปิดรับเช็กชื่อ',
        formattedTimeRange: `${session.startTime} - ${session.endTime}`,
      };
    }

    const startDateTime = new Date(year, month - 1, day, startH, startM, 0, 0);
    const endDateTime = new Date(year, month - 1, day, endH, endM, 0, 0);

    // Handle sessions that span past midnight if end < start
    if (endDateTime.getTime() < startDateTime.getTime()) {
      endDateTime.setDate(endDateTime.getDate() + 1);
    }

    const now = new Date();
    const nowTime = now.getTime();
    const startTime = startDateTime.getTime();
    const endTime = endDateTime.getTime();

    if (nowTime < startTime) {
      const diffMinutes = Math.ceil((startTime - nowTime) / (1000 * 60));
      let waitText = '';
      if (diffMinutes > 60) {
        const hours = Math.floor(diffMinutes / 60);
        const mins = diffMinutes % 60;
        waitText = `อีก ${hours} ชม. ${mins > 0 ? mins + ' นาที' : ''}`;
      } else {
        waitText = `อีก ${diffMinutes} นาที`;
      }

      return {
        status: 'before',
        canCheckIn: false,
        message: `ยังไม่ถึงเวลาเริ่มเรียน (เริ่มเวลา ${session.startTime} น. - ${waitText}) ไม่อนุญาตให้เช็กชื่อก่อนเวลา`,
        badgeLabel: `รอเริ่ม ${session.startTime} น.`,
        formattedTimeRange: `${session.startTime} - ${session.endTime}`,
      };
    }

    if (nowTime > endTime) {
      return {
        status: 'after',
        canCheckIn: false,
        message: `หมดเวลาเช็กชื่อสำหรับคาบเรียนนี้แล้ว (สิ้นสุดเวลา ${session.endTime} น.)`,
        badgeLabel: 'หมดเวลาเช็กชื่อ',
        formattedTimeRange: `${session.startTime} - ${session.endTime}`,
      };
    }

    return {
      status: 'during',
      canCheckIn: true,
      message: 'อยู่ในช่วงเวลาเรียน (เปิดให้เช็กชื่อ)',
      badgeLabel: 'เปิดรับเช็กชื่อ',
      formattedTimeRange: `${session.startTime} - ${session.endTime}`,
    };
  } catch {
    return {
      status: 'during',
      canCheckIn: true,
      message: 'อยู่ในช่วงเวลาเช็กชื่อ',
      badgeLabel: 'เปิดรับเช็กชื่อ',
      formattedTimeRange: `${session.startTime} - ${session.endTime}`,
    };
  }
}
