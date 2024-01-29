import AsyncStorage from '@react-native-async-storage/async-storage';
import { Alert } from 'react-native';

const setStorage = async (key, value) => {
  try {
    if (typeof value === 'object') {
      const jsonValue = JSON.stringify(value);
      await AsyncStorage.setItem(key, jsonValue);
    } else {
      await AsyncStorage.setItem(key, value);
    }
  } catch (e) {
    Alert.alert(e);
  }
};

const getStorage = async (key, fn, type) => {
  try {
    const value = await AsyncStorage.getItem(key);
    if (type === 'object') {
      return fn(value != null ? JSON.parse(value) : null);
    } else {
      return fn(value != null ? value : null);
    }
  } catch (e) {
    Alert.alert(e);
  }
};

const removeItem = async key => {
  try {
    await AsyncStorage.removeItem(key);
  } catch (e) {
    Alert.alert(e);
  }
};

const removeAll = async () => {
  try {
    await AsyncStorage.clear();
  } catch (e) {
    Alert.alert(e);
  }
  console.log('All storage item is clear');
};

export { getStorage, removeAll, removeItem, setStorage };

