import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  Modal,
  TouchableOpacity,
  Image,
  ActivityIndicator,
  Alert,
} from 'react-native';
import Colors from '../constants/Colors';
import { CameraService } from '../services/camera';

interface EditProfileImageModalProps {
  visible: boolean;
  currentImage?: string;
  onImageUpdated: (newUri: string | null) => Promise<void>;
  onClose: () => void;
}

export const EditProfileImageModal: React.FC<EditProfileImageModalProps> = ({
  visible,
  currentImage,
  onImageUpdated,
  onClose,
}) => {
  const [loading, setLoading] = useState(false);

  const handlePick = async (mode: 'camera' | 'gallery') => {
    setLoading(true);
    try {
      const uri = await CameraService.pickProfileImage(mode);
      if (uri) {
        await onImageUpdated(uri);
        Alert.alert('สำเร็จ', 'อัปเดตรูปโปรไฟล์เรียบร้อยแล้ว');
        onClose();
      }
    } catch (err: any) {
      Alert.alert('เกิดข้อผิดพลาด', err?.message || 'ไม่สามารถเปลี่ยนรูปโปรไฟล์ได้');
    } finally {
      setLoading(false);
    }
  };

  const handleRemovePhoto = async () => {
    Alert.alert(
      'ยืนยันการลบรูปโปรไฟล์',
      'คุณต้องการลบรูปโปรไฟล์และใช้ภาพเริ่มต้นใช่หรือไม่?',
      [
        { text: 'ยกเลิก', style: 'cancel' },
        {
          text: 'ลบรูปภาพ',
          style: 'destructive',
          onPress: async () => {
            setLoading(true);
            try {
              await onImageUpdated(null);
              Alert.alert('สำเร็จ', 'ลบรูปโปรไฟล์เรียบร้อยแล้ว');
              onClose();
            } catch (err: any) {
              Alert.alert('เกิดข้อผิดพลาด', err?.message || 'ไม่สามารถลบรูปโปรไฟล์ได้');
            } finally {
              setLoading(false);
            }
          },
        },
      ]
    );
  };

  return (
    <Modal
      visible={visible}
      transparent
      animationType="fade"
      onRequestClose={onClose}
    >
      <View style={styles.overlay}>
        <View style={styles.modalCard}>
          {/* Header */}
          <View style={styles.header}>
            <Text style={styles.title}>เปลี่ยนรูปโปรไฟล์</Text>
            <TouchableOpacity onPress={onClose} hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}>
              <Text style={styles.closeIcon}>✕</Text>
            </TouchableOpacity>
          </View>

          {/* Current Avatar Preview */}
          <View style={styles.avatarPreviewContainer}>
            <View style={styles.avatarFrame}>
              {currentImage ? (
                <Image source={{ uri: currentImage }} style={styles.avatarImage} />
              ) : (
                <View style={styles.avatarPlaceholder}>
                  <Text style={styles.avatarPlaceholderIcon}>👤</Text>
                  <Text style={styles.avatarPlaceholderText}>ยังไม่มีรูปถ่าย</Text>
                </View>
              )}
            </View>
          </View>

          {loading ? (
            <View style={styles.loadingBox}>
              <ActivityIndicator size="large" color={Colors.stampBlue} />
              <Text style={styles.loadingText}>กำลังประมวลผลรูปภาพ...</Text>
            </View>
          ) : (
            <View style={styles.optionsList}>
              {/* Option 1: Take Photo */}
              <TouchableOpacity
                style={styles.optionButton}
                onPress={() => handlePick('camera')}
                activeOpacity={0.7}
              >
                <View style={styles.optionIconContainer}>
                  <Text style={styles.optionIcon}>📸</Text>
                </View>
                <View style={styles.optionContent}>
                  <Text style={styles.optionTitle}>ถ่ายภาพใหม่ด้วยกล้อง</Text>
                  <Text style={styles.optionSub}>เปิดกล้องและถ่ายภาพใบหน้าของคุณ</Text>
                </View>
              </TouchableOpacity>

              {/* Option 2: Pick from Gallery */}
              <TouchableOpacity
                style={styles.optionButton}
                onPress={() => handlePick('gallery')}
                activeOpacity={0.7}
              >
                <View style={styles.optionIconContainer}>
                  <Text style={styles.optionIcon}>🖼️</Text>
                </View>
                <View style={styles.optionContent}>
                  <Text style={styles.optionTitle}>เลือกรูปจากคลังภาพ</Text>
                  <Text style={styles.optionSub}>เลือกรูปถ่ายที่มีอยู่แล้วในอุปกรณ์</Text>
                </View>
              </TouchableOpacity>

              {/* Option 3: Remove Image (if exists) */}
              {currentImage && (
                <TouchableOpacity
                  style={[styles.optionButton, styles.optionButtonDanger]}
                  onPress={handleRemovePhoto}
                  activeOpacity={0.7}
                >
                  <View style={styles.optionIconContainer}>
                    <Text style={styles.optionIcon}>🗑️</Text>
                  </View>
                  <View style={styles.optionContent}>
                    <Text style={[styles.optionTitle, { color: Colors.stampRed }]}>
                      ลบรูปโปรไฟล์ปัจจุบัน
                    </Text>
                    <Text style={styles.optionSub}>เปลี่ยนกลับไปใช้รูปเริ่มต้น</Text>
                  </View>
                </TouchableOpacity>
              )}
            </View>
          )}

          {/* Cancel button */}
          <TouchableOpacity style={styles.cancelBtn} onPress={onClose} disabled={loading}>
            <Text style={styles.cancelBtnText}>ยกเลิก</Text>
          </TouchableOpacity>
        </View>
      </View>
    </Modal>
  );
};

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.65)',
    justifyContent: 'center',
    alignItems: 'center',
    padding: 16,
  },
  modalCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 8,
    borderWidth: 2,
    borderColor: Colors.inkDark,
    width: '100%',
    maxWidth: 380,
    padding: 20,
    shadowColor: Colors.inkDark,
    shadowOffset: { width: 4, height: 4 },
    shadowOpacity: 0.25,
    shadowRadius: 0,
    elevation: 6,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
  },
  title: {
    fontSize: 15,
    fontWeight: '900',
    color: Colors.inkDark,
    letterSpacing: 0.8,
  },
  closeIcon: {
    fontSize: 18,
    fontWeight: '900',
    color: Colors.inkMuted,
  },
  avatarPreviewContainer: {
    alignItems: 'center',
    marginVertical: 10,
  },
  avatarFrame: {
    width: 100,
    height: 100,
    borderRadius: 50,
    borderWidth: 3,
    borderColor: Colors.inkDark,
    overflow: 'hidden',
    backgroundColor: Colors.panelBackground,
    justifyContent: 'center',
    alignItems: 'center',
  },
  avatarImage: {
    width: '100%',
    height: '100%',
  },
  avatarPlaceholder: {
    alignItems: 'center',
    justifyContent: 'center',
  },
  avatarPlaceholderIcon: {
    fontSize: 32,
    marginBottom: 2,
  },
  avatarPlaceholderText: {
    fontSize: 9,
    fontWeight: '700',
    color: Colors.inkMuted,
  },
  loadingBox: {
    paddingVertical: 30,
    alignItems: 'center',
  },
  loadingText: {
    fontSize: 12,
    fontWeight: '700',
    color: Colors.inkMuted,
    marginTop: 10,
  },
  optionsList: {
    gap: 10,
    marginTop: 10,
  },
  optionButton: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 12,
    backgroundColor: '#F9F8F5',
    borderWidth: 1.5,
    borderColor: Colors.borderLight,
    borderRadius: 6,
  },
  optionButtonDanger: {
    borderColor: 'rgba(186, 26, 26, 0.3)',
    backgroundColor: '#FFF8F8',
  },
  optionIconContainer: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: '#FFFFFF',
    borderWidth: 1,
    borderColor: Colors.borderLight,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },
  optionIcon: {
    fontSize: 18,
  },
  optionContent: {
    flex: 1,
  },
  optionTitle: {
    fontSize: 13,
    fontWeight: '800',
    color: Colors.inkDark,
  },
  optionSub: {
    fontSize: 10,
    color: Colors.inkMuted,
    marginTop: 2,
  },
  cancelBtn: {
    marginTop: 16,
    paddingVertical: 12,
    backgroundColor: '#EFEFEA',
    borderWidth: 1.5,
    borderColor: Colors.inkDark,
    borderRadius: 4,
    alignItems: 'center',
  },
  cancelBtnText: {
    fontSize: 12,
    fontWeight: '800',
    color: Colors.inkDark,
  },
});
