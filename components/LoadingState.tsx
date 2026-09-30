import React from 'react';
import { View, Text, StyleSheet, ActivityIndicator } from 'react-native';
import Colors from '../constants/Colors';

interface LoadingStateProps {
  message?: string;
}

export const LoadingState: React.FC<LoadingStateProps> = ({
  message = 'กำลังโหลดข้อมูล...',
}) => {
  return (
    <View style={styles.container}>
      <ActivityIndicator size="large" color={Colors.inkDark} />
      <Text style={styles.text}>{message}</Text>
      <Text style={styles.subText}>กรุณารอสักครู่</Text>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    padding: 24,
    backgroundColor: Colors.background,
  },
  text: {
    fontSize: 14,
    fontWeight: '800',
    color: Colors.inkDark,
    marginTop: 16,
    letterSpacing: 1.2,
    textAlign: 'center',
  },
  subText: {
    fontSize: 11,
    color: Colors.inkMuted,
    marginTop: 6,
    letterSpacing: 0.5,
  },
});
