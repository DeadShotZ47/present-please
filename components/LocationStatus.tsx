import React from 'react';
import { View, Text, StyleSheet, ActivityIndicator } from 'react-native';
import Colors from '../constants/Colors';
import { PrimaryButton } from './PrimaryButton';

interface LocationStatusProps {
  loading: boolean;
  verified: boolean;
  distance: number | null;
  accuracy: number | null;
  allowedRadius: number;
  errorMessage?: string | null;
  onRetry: () => void;
}

export const LocationStatus: React.FC<LocationStatusProps> = ({
  loading,
  verified,
  distance,
  accuracy,
  allowedRadius,
  errorMessage,
  onRetry,
}) => {
  if (loading) {
    return (
      <View style={styles.card}>
        <ActivityIndicator size="small" color={Colors.inkDark} />
        <Text style={styles.loadingText}>CHECKING YOUR GPS COORDINATES...</Text>
        <Text style={styles.subText}>Acquiring high accuracy satellite fix</Text>
      </View>
    );
  }

  if (errorMessage) {
    return (
      <View style={[styles.card, styles.cardFailed]}>
        <Text style={styles.failTitle}>✕ LOCATION VERIFICATION FAILED</Text>
        <Text style={styles.failDetail}>{errorMessage}</Text>
        <PrimaryButton
          title="RETRY GPS VERIFICATION"
          variant="secondary"
          onPress={onRetry}
          style={{ marginTop: 12 }}
        />
      </View>
    );
  }

  if (distance === null) {
    return (
      <View style={styles.card}>
        <Text style={styles.neutralTitle}>STEP 1: LOCATION CHECK</Text>
        <Text style={styles.neutralText}>
          Your device coordinates will be verified against the classroom boundary (within {allowedRadius}m).
        </Text>
        <PrimaryButton
          title="CHECK LOCATION"
          variant="primary"
          onPress={onRetry}
          style={{ marginTop: 12 }}
        />
      </View>
    );
  }

  if (!verified) {
    return (
      <View style={[styles.card, styles.cardFailed]}>
        <Text style={styles.failTitle}>✕ LOCATION VERIFICATION FAILED</Text>
        <Text style={styles.failDetail}>
          You are approximately <Text style={{ fontWeight: '900' }}>{distance}m</Text> away from the classroom.
        </Text>
        <Text style={styles.criteria}>Allowed radius: {allowedRadius}m</Text>
        {accuracy !== null && (
          <Text style={styles.criteria}>GPS Accuracy: ±{accuracy}m</Text>
        )}
        <PrimaryButton
          title="RETRY LOCATION"
          variant="secondary"
          onPress={onRetry}
          style={{ marginTop: 12 }}
        />
      </View>
    );
  }

  return (
    <View style={[styles.card, styles.cardSuccess]}>
      <Text style={styles.successTitle}>✓ LOCATION VERIFIED</Text>
      <View style={styles.successRow}>
        <View>
          <Text style={styles.label}>DISTANCE FROM ROOM</Text>
          <Text style={styles.successValue}>{distance}m</Text>
        </View>
        <View>
          <Text style={styles.label}>GPS ACCURACY</Text>
          <Text style={styles.successValue}>±{accuracy || 8}m</Text>
        </View>
        <View>
          <Text style={styles.label}>STATUS</Text>
          <Text style={[styles.successValue, { color: Colors.stampGreen }]}>PASS</Text>
        </View>
      </View>
      <PrimaryButton
        title="RE-CHECK LOCATION"
        variant="outline"
        onPress={onRetry}
        style={{ marginTop: 12, height: 38 }}
        textStyle={{ fontSize: 11 }}
      />
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
    marginVertical: 8,
  },
  cardSuccess: {
    borderColor: Colors.stampGreen,
    backgroundColor: '#F3FAF5',
  },
  cardFailed: {
    borderColor: Colors.stampRed,
    backgroundColor: '#FFF5F4',
  },
  loadingText: {
    fontSize: 13,
    fontWeight: '800',
    color: Colors.inkDark,
    textAlign: 'center',
    marginTop: 8,
    letterSpacing: 0.8,
  },
  subText: {
    fontSize: 12,
    color: Colors.inkMuted,
    textAlign: 'center',
    marginTop: 4,
  },
  neutralTitle: {
    fontSize: 14,
    fontWeight: '800',
    color: Colors.inkDark,
    letterSpacing: 0.8,
  },
  neutralText: {
    fontSize: 13,
    color: Colors.inkMuted,
    marginTop: 4,
    lineHeight: 18,
  },
  successTitle: {
    fontSize: 15,
    fontWeight: '900',
    color: Colors.stampGreen,
    letterSpacing: 1,
    marginBottom: 8,
  },
  successRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingVertical: 6,
  },
  label: {
    fontSize: 10,
    fontWeight: '700',
    color: Colors.inkMuted,
    letterSpacing: 0.5,
  },
  successValue: {
    fontSize: 15,
    fontWeight: '800',
    color: Colors.inkDark,
    marginTop: 2,
  },
  failTitle: {
    fontSize: 15,
    fontWeight: '900',
    color: Colors.stampRed,
    letterSpacing: 1,
    marginBottom: 6,
  },
  failDetail: {
    fontSize: 13,
    color: Colors.inkDark,
    lineHeight: 18,
  },
  criteria: {
    fontSize: 12,
    color: Colors.inkMuted,
    marginTop: 4,
  },
});
