import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import Colors from '../constants/Colors';

interface ErrorMessageProps {
  message: string;
}

export const ErrorMessage: React.FC<ErrorMessageProps> = ({ message }) => {
  if (!message) return null;

  return (
    <View style={styles.container}>
      <Text style={styles.tag}>แจ้งเตือน</Text>
      <Text style={styles.text}>{message}</Text>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    backgroundColor: '#FFF0EF',
    borderColor: Colors.stampRed,
    borderWidth: 1.5,
    borderRadius: 4,
    padding: 12,
    marginVertical: 8,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
  },
  tag: {
    backgroundColor: Colors.stampRed,
    color: '#FFFFFF',
    fontWeight: '900',
    fontSize: 10,
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 2,
    letterSpacing: 0.8,
  },
  text: {
    flex: 1,
    color: Colors.stampRed,
    fontSize: 12,
    fontWeight: '700',
    lineHeight: 16,
  },
});
