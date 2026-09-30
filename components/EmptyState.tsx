import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import Colors from '../constants/Colors';
import { PrimaryButton } from './PrimaryButton';

interface EmptyStateProps {
  title?: string;
  message: string;
  actionTitle?: string;
  onAction?: () => void;
}

export const EmptyState: React.FC<EmptyStateProps> = ({
  title = 'NO RECORDS FOUND',
  message,
  actionTitle,
  onAction,
}) => {
  return (
    <View style={styles.container}>
      <View style={styles.stampBorder}>
        <Text style={styles.title}>{title}</Text>
      </View>
      <Text style={styles.message}>{message}</Text>
      {actionTitle && onAction && (
        <PrimaryButton
          title={actionTitle}
          variant="secondary"
          onPress={onAction}
          style={styles.button}
        />
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    padding: 32,
    alignItems: 'center',
    justifyContent: 'center',
    marginVertical: 20,
    backgroundColor: Colors.cardBackground,
    borderWidth: 2,
    borderColor: Colors.borderLight,
    borderStyle: 'dashed',
    borderRadius: 4,
  },
  stampBorder: {
    borderWidth: 2,
    borderColor: Colors.inkMuted,
    paddingHorizontal: 12,
    paddingVertical: 4,
    borderRadius: 2,
    marginBottom: 12,
  },
  title: {
    fontSize: 13,
    fontWeight: '900',
    color: Colors.inkMuted,
    letterSpacing: 1.2,
  },
  message: {
    fontSize: 13,
    color: Colors.inkDark,
    textAlign: 'center',
    lineHeight: 19,
  },
  button: {
    marginTop: 16,
    height: 40,
    paddingHorizontal: 16,
  },
});
