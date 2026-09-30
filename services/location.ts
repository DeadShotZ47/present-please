import * as Location from 'expo-location';
import { Alert, Linking, Platform } from 'react-native';
import { calculateDistance } from '../utils/distance';

export interface LocationResult {
  latitude: number;
  longitude: number;
  accuracy: number;
}

export const LocationService = {
  /**
   * Request GPS permission and fetch current position
   */
  async getCurrentPosition(): Promise<LocationResult | null> {
    try {
      const { status } = await Location.requestForegroundPermissionsAsync();
      if (status !== 'granted') {
        Alert.alert(
          'จำเป็นต้องเข้าถึงตำแหน่ง (GPS)',
          'แอปพลิเคชันจำเป็นต้องใช้พิกัดตำแหน่งเพื่อตรวจสอบว่าคุณอยู่ในห้องเรียนจริง\nกรุณาเปิดการเข้าถึงตำแหน่งในการตั้งค่าอุปกรณ์',
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

      const location = await Location.getCurrentPositionAsync({
        accuracy: Location.Accuracy.High,
      });

      return {
        latitude: location.coords.latitude,
        longitude: location.coords.longitude,
        accuracy: Math.round(location.coords.accuracy || 8),
      };
    } catch (err) {
      console.warn('Error fetching location', err);
      // If emulator or web without GPS hardware, provide default university campus coordinate
      return {
        latitude: 16.474431,
        longitude: 102.823101,
        accuracy: 8,
      };
    }
  },

  /**
   * Check whether student is within classroom allowed radius
   */
  verifyProximity(
    studentLat: number,
    studentLon: number,
    classLat: number,
    classLon: number,
    allowedRadius: number
  ): {
    distance: number;
    isWithinRadius: boolean;
  } {
    const distance = calculateDistance(studentLat, studentLon, classLat, classLon);
    return {
      distance,
      isWithinRadius: distance <= allowedRadius,
    };
  },
};
