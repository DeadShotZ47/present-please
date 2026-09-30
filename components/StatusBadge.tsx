import React from 'react';
import { View, Text, StyleSheet, ViewStyle } from 'react-native';
import Colors from '../constants/Colors';
import { AttendanceStatus } from '../types';

interface StatusBadgeProps {
  status: AttendanceStatus | 'open' | 'closed';
  label?: string;
  size?: 'small' | 'medium' | 'large';
  style?: ViewStyle;
}

export const StatusBadge: React.FC<StatusBadgeProps> = ({
  status,
  label,
  size = 'medium',
  style,
}) => {
  const getBadgeConfig = () => {
    switch (status) {
      case 'present':
        return {
          text: label || '✓ มาเรียน',
          color: Colors.stampGreen,
          bg: Colors.stampGreenBg,
          border: Colors.stampGreen,
        };
      case 'absent':
      case 'rejected':
        return {
          text: label || (status === 'absent' ? '✕ ขาดเรียน' : '✕ ไม่ผ่าน'),
          color: Colors.stampRed,
          bg: Colors.stampRedBg,
          border: Colors.stampRed,
        };
      case 'late':
        return {
          text: label || 'L มาสาย',
          color: Colors.stampAmber,
          bg: Colors.stampAmberBg,
          border: Colors.stampAmber,
        };
      case 'open':
        return {
          text: label || 'เปิดรับเช็กชื่อ',
          color: Colors.stampGreen,
          bg: Colors.stampGreenBg,
          border: Colors.stampGreen,
        };
      case 'closed':
        return {
          text: label || 'ปิดรับเช็กชื่อ',
          color: Colors.inkMuted,
          bg: Colors.panelBackground,
          border: Colors.inkMuted,
        };
      default:
        return {
          text: label || status,
          color: Colors.inkDark,
          bg: Colors.cardBackground,
          border: Colors.inkDark,
        };
    }
  };

  const config = getBadgeConfig();

  const isSmall = size === 'small';
  const isLarge = size === 'large';

  return (
    <View
      style={[
        styles.stampContainer,
        {
          borderColor: config.border,
          backgroundColor: config.bg,
          paddingVertical: isSmall ? 2 : isLarge ? 8 : 4,
          paddingHorizontal: isSmall ? 6 : isLarge ? 14 : 10,
        },
        style,
      ]}
    >
      <Text
        style={[
          styles.stampText,
          {
            color: config.color,
            fontSize: isSmall ? 11 : isLarge ? 16 : 13,
          },
        ]}
      >
        {config.text}
      </Text>
    </View>
  );
};

const styles = StyleSheet.create({
  stampContainer: {
    borderWidth: 2,
    borderRadius: 3,
    alignSelf: 'flex-start',
    alignItems: 'center',
    justifyContent: 'center',
  },
  stampText: {
    fontWeight: '900',
    letterSpacing: 1.1,
    textTransform: 'uppercase',
  },
});
