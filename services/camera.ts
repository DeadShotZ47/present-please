import * as ImagePicker from 'expo-image-picker';
import { Alert, Linking, Platform } from 'react-native';

export const CameraService = {
  /**
   * Request camera permission and take a real-time photo
   */
  async capturePhoto(): Promise<string | null> {
    try {
      const { status } = await ImagePicker.requestCameraPermissionsAsync();
      if (status !== 'granted') {
        Alert.alert(
          'จำเป็นต้องเข้าถึงกล้องถ่ายรูป',
          'แอปพลิเคชันจำเป็นต้องใช้กล้องถ่ายรูปเพื่อถ่ายภาพยืนยันการเข้าเรียน\nกรุณาเปิดสิทธิ์การใช้งานกล้องในการตั้งค่าอุปกรณ์',
          [
            { text: 'ยกเลิก', style: 'cancel' },
            {
              text: 'ไปที่การตั้งค่า',
              onPress: () => {
                if (Platform.OS !== 'web') {
                  Linking.openSettings();
                }
              },
            },
          ]
        );
        return null;
      }

      const result = await ImagePicker.launchCameraAsync({
        mediaTypes: ImagePicker.MediaTypeOptions.Images,
        allowsEditing: true,
        aspect: [4, 3],
        quality: 0.7,
      });

      if (!result.canceled && result.assets && result.assets.length > 0) {
        return result.assets[0].uri;
      }
      return null;
    } catch (err) {
      console.warn('Camera error', err);
      // Fallback to gallery if camera hardware fails (e.g. some emulators without webcam)
      return await this.pickFromGallery();
    }
  },

  /**
   * Optional fallback to pick image from library (useful for emulators without camera)
   */
  async pickFromGallery(): Promise<string | null> {
    try {
      const result = await ImagePicker.launchImageLibraryAsync({
        mediaTypes: ImagePicker.MediaTypeOptions.Images,
        allowsEditing: true,
        aspect: [4, 3],
        quality: 0.7,
      });

      if (!result.canceled && result.assets && result.assets.length > 0) {
        return result.assets[0].uri;
      }
      return null;
    } catch (err) {
      console.warn('Image picker error', err);
      return null;
    }
  },
};
