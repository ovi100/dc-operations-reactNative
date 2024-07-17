import AsyncStorage from '@react-native-async-storage/async-storage';
import {toast} from '../utils';

const setStorage = async (key, value) => {
  try {
    if (typeof value === 'object') {
      const jsonValue = JSON.stringify(value);
      await AsyncStorage.setItem(key, jsonValue);
    } else {
      await AsyncStorage.setItem(key, value);
    }
  } catch (e) {
    toast(e.message);
  }
};

const getAll = async () => {
  let keys = [];
  try {
    keys = await AsyncStorage.getAllKeys();
    if (keys.length > 0) {
      const values = await AsyncStorage.multiGet(keys);
      return values;
    } else {
      return null;
    }
  } catch (e) {
    toast(e.message);
  }
};

const getStorage = async (key, setFunction, type = '') => {
  try {
    const value = await AsyncStorage.getItem(key);
    if (type === 'object') {
      return setFunction(value !== null ? JSON.parse(value) : null);
    } else if (type === 'array') {
      return setFunction(value !== null ? JSON.parse(value) : []);
    } else {
      return setFunction(value !== null ? value : null);
    }
  } catch (e) {
    toast(e.message);
  }
};

const removeItem = async key => {
  try {
    await AsyncStorage.removeItem(key);
  } catch (e) {
    toast(e.message);
  }
};

const removeAll = async () => {
  try {
    await AsyncStorage.clear();
  } catch (e) {
    toast(e.message);
  }
};

export {getAll, getStorage, removeAll, removeItem, setStorage};
