import * as SecureStore from 'expo-secure-store';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { Platform } from 'react-native';

const TOKEN_KEY = 'present_please_auth_token';
const USER_KEY = 'present_please_current_user';

export const StorageService = {
  /**
   * Save auth token securely (falls back on web where SecureStore isn't native)
   */
  async setToken(token: string): Promise<void> {
    try {
      if (Platform.OS === 'web') {
        await AsyncStorage.setItem(TOKEN_KEY, token);
      } else {
        await SecureStore.setItemAsync(TOKEN_KEY, token);
      }
    } catch (err) {
      console.warn('Error saving token', err);
      await AsyncStorage.setItem(TOKEN_KEY, token);
    }
  },

  /**
   * Retrieve auth token
   */
  async getToken(): Promise<string | null> {
    try {
      if (Platform.OS === 'web') {
        return await AsyncStorage.getItem(TOKEN_KEY);
      }
      return await SecureStore.getItemAsync(TOKEN_KEY);
    } catch {
      return await AsyncStorage.getItem(TOKEN_KEY);
    }
  },

  /**
   * Remove auth token
   */
  async removeToken(): Promise<void> {
    try {
      if (Platform.OS === 'web') {
        await AsyncStorage.removeItem(TOKEN_KEY);
      } else {
        await SecureStore.deleteItemAsync(TOKEN_KEY);
      }
    } catch {
      await AsyncStorage.removeItem(TOKEN_KEY);
    }
  },

  /**
   * Store general JSON data in AsyncStorage
   */
  async setItem<T>(key: string, value: T): Promise<void> {
    try {
      await AsyncStorage.setItem(key, JSON.stringify(value));
    } catch (err) {
      console.warn(`Error setting key ${key}`, err);
    }
  },

  /**
   * Retrieve general JSON data from AsyncStorage
   */
  async getItem<T>(key: string): Promise<T | null> {
    try {
      const data = await AsyncStorage.getItem(key);
      return data ? JSON.parse(data) : null;
    } catch {
      return null;
    }
  },

  /**
   * Remove item from AsyncStorage
   */
  async removeItem(key: string): Promise<void> {
    try {
      await AsyncStorage.removeItem(key);
    } catch (err) {
      console.warn(`Error removing key ${key}`, err);
    }
  },

  /**
   * Clear all storage on full logout
   */
  async clearAll(): Promise<void> {
    await this.removeToken();
    await AsyncStorage.removeItem(USER_KEY);
  }
};
