import React from 'react';
import { View, Text, StyleSheet, Image } from 'react-native';
import Colors from '../constants/Colors';
import { PrimaryButton } from './PrimaryButton';

interface PhotoPreviewProps {
  photoUri: string | null;
  onTakePhoto: () => void;
  onRetakePhoto: () => void;
}

export const PhotoPreview: React.FC<PhotoPreviewProps> = ({
  photoUri,
  onTakePhoto,
  onRetakePhoto,
}) => {
  if (!photoUri) {
    return (
      <View style={styles.card}>
        <Text style={styles.title}>ขั้นตอนที่ 2: ถ่ายภาพยืนยันตัวตน</Text>
        <Text style={styles.description}>
          กรุณาถ่ายภาพปัจจุบันของคุณในห้องเรียนเพื่อใช้ยืนยันการเข้าเรียน
        </Text>
        <View style={styles.placeholderBox}>
          <Text style={styles.placeholderText}>ยังไม่มีรูปถ่าย</Text>
        </View>
        <PrimaryButton
          title="ถ่ายรูปยืนยันตัวตน"
          variant="primary"
          onPress={onTakePhoto}
          style={{ marginTop: 12 }}
        />
      </View>
    );
  }

  return (
    <View style={styles.card}>
      <View style={styles.headerRow}>
        <Text style={styles.title}>ขั้นตอนที่ 2: ถ่ายภาพยืนยันตัวตน</Text>
        <Text style={styles.readyText}>✓ แนบรูปแล้ว</Text>
      </View>

      <View style={styles.imageContainer}>
        <Image source={{ uri: photoUri }} style={styles.photo} resizeMode="cover" />
        <View style={styles.evidenceOverlay}>
          <Text style={styles.overlayText}>ภาพหลักฐานการเข้าเรียน</Text>
        </View>
      </View>

      <PrimaryButton
        title="ถ่ายรูปใหม่"
        variant="outline"
        onPress={onRetakePhoto}
        style={{ marginTop: 12, height: 38 }}
        textStyle={{ fontSize: 12 }}
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
  headerRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 6,
  },
  title: {
    fontSize: 14,
    fontWeight: '800',
    color: Colors.inkDark,
    letterSpacing: 0.8,
  },
  description: {
    fontSize: 13,
    color: Colors.inkMuted,
    marginTop: 4,
    lineHeight: 18,
  },
  readyText: {
    fontSize: 11,
    fontWeight: '800',
    color: Colors.stampGreen,
    letterSpacing: 0.8,
  },
  placeholderBox: {
    height: 140,
    backgroundColor: Colors.panelBackground,
    borderWidth: 1.5,
    borderColor: Colors.borderLight,
    borderStyle: 'dashed',
    borderRadius: 4,
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: 12,
  },
  placeholderText: {
    fontSize: 12,
    fontWeight: '700',
    color: Colors.inkMuted,
    letterSpacing: 1,
  },
  imageContainer: {
    height: 200,
    borderRadius: 4,
    overflow: 'hidden',
    borderWidth: 2,
    borderColor: Colors.inkDark,
    marginTop: 10,
    position: 'relative',
  },
  photo: {
    width: '100%',
    height: '100%',
  },
  evidenceOverlay: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    backgroundColor: 'rgba(30, 32, 34, 0.75)',
    paddingVertical: 4,
    alignItems: 'center',
  },
  overlayText: {
    color: '#FFFFFF',
    fontSize: 10,
    fontWeight: '800',
    letterSpacing: 1,
  },
});
