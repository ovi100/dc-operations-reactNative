import { Alert, Dimensions, ToastAndroid } from 'react-native';
import Toast from 'react-native-toast-message';

const handleDate = (value, type) => {
  let input = value.replace(/\D/g, '');
  let day = '',
    month = '',
    year = '';
  day = input.slice(0, 2);
  month = input.slice(2, 4);
  year = input.slice(4);

  if (day.length === 2 && day > 31) {
    Toast.show({
      type: 'customError',
      text1: 'Day must be between 1 and 31',
    });
    return;
  }
  if (month.length === 2 && month > 12) {
    Toast.show({
      type: 'customError',
      text1: 'Month must be between 1 and 12',
    });
    return;
  }
  if (
    type === 'mfg' &&
    year.length === 2 &&
    year < Number((new Date().getFullYear() - 3).toString().slice(2))
  ) {
    Toast.show({
      type: 'customError',
      text1: `Minimum year must be ${new Date().getFullYear() - 3}`,
    });
    return;
  }
  if (
    type === 'exp' &&
    year.length === 2 &&
    year < Number(new Date().getFullYear().toString().slice(2))
  ) {
    Toast.show({
      type: 'customError',
      text1: `Minimum year must be ${new Date().getFullYear()}`,
    });
    return;
  }
  if (year.length === 2 && year > 99) {
    Toast.show({
      type: 'customError',
      text1: 'Year must be up to 2099',
    });
    return;
  }
  if (input.length > 2) {
    input = input.slice(0, 2) + '/' + input.slice(2);
  }
  if (input.length > 5) {
    input = input.slice(0, 5) + '/' + input.slice(5);
  }

  year = '20' + year;

  const formattedDate = new Date(Number(year), Number(month) - 1, Number(day));

  if (input.length === 10 && formattedDate < new Date()) {
    Toast.show({
      type: 'customError',
      text1: 'Date must be greater than today',
    });
    input = null;
    return;
  }

  if (input.length === 2 && new Date(Number(input)) < new Date()) {
    Toast.show({
      type: 'customError',
      text1: 'Invalid date format',
    });
    input = null;
    return;
  }

  return {date: formattedDate, text: input};
};

const validateInput = (type, value) => {
  if (!value) {
    return `${type.charAt(0).toUpperCase() + type.slice(1)} is required`;
  } else {
    let regex;
    if (type === 'email') {
      regex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    } else if (type === 'staff id') {
      regex = /^\d+$/;
    } else if (type === 'name') {
      regex = /^[a-zA-Z ]+$/;
    } else {
      regex = /s*/;
    }
    if (!regex.test(value)) {
      return `Invalid ${type}`;
    } else {
      return null;
    }
  }
};

const validateFile = file => {
  const types = ['jpg', 'png', 'jpeg'];
  const extension = file?.name.split('.').pop().toLowerCase();
  const isValid = types.some(type => type === extension);

  if (isValid) {
    return true;
  } else {
    Alert.alert('upload jpg, png or jpeg file');
    return false;
  }
};

const uniqueArray = array => {
  return [...new Set(array)];
};

const uniqueArrayOfObjects = (arr, prop) => {
  const unique = arr.filter((item, index) => {
    return index === arr.findIndex(obj => item[prop] === obj[prop]);
  });
  return unique;
};

const groupBy = (array, key) => {
  return array.reduce((acc, obj) => {
    if (obj.hasOwnProperty(key)) {
      const groupKey = obj[key];
      acc[groupKey] = acc[groupKey] || [];
      acc[groupKey].push(obj);
    } else {
      return null;
    }
    return acc;
  }, {});
};

const toast = message => {
  ToastAndroid.show(message, ToastAndroid.LONG, ToastAndroid.CENTER);
};

const formatDateYYYYMMDD = value => {
  const date = new Date(value);
  const year = date.getFullYear();
  const month = (date.getMonth() + 1).padStart(2, '0');
  const day = date.getDate().padStart(2, '0');

  return `${year}${month}${day}`;
};

const dateRange = range => {
  const current_date = new Date();
  const end_date = current_date.toISOString().split('T')[0].replaceAll('-', '');

  const timeStamp = new Date(
    current_date.getTime() - range * 24 * 60 * 60 * 1000,
  );
  const start_date = timeStamp.toISOString().split('T')[0].replaceAll('-', '');

  return {
    from: start_date,
    to: end_date,
  };
};

const dateDiffInDays = (date1, date2) => {
  if (date1 && date2) {
    const mfg = new Date(date1);
    const exp = new Date(date2);
    const oneDay = 24 * 60 * 60 * 1000;
    return Math.round(Math.abs((exp - mfg) / oneDay));
  }
  return null;
};

const calculateShelfLife = (mfg, exp) => {
  if (mfg && exp) {
    const date = new Date();
    const totalDays = dateDiffInDays(mfg, exp);
    const daysPassed = dateDiffInDays(mfg, date);
    const shelfLife = Math.round(100 - (daysPassed / totalDays) * 100);
    return shelfLife;
  }
  return 0;
};

const {width: WINDOW_WIDTH, height: WINDOW_HEIGHT} = Dimensions.get('window');

export {
  WINDOW_HEIGHT,
  WINDOW_WIDTH,
  calculateShelfLife,
  dateDiffInDays,
  dateRange,
  formatDateYYYYMMDD,
  groupBy,
  handleDate,
  toast,
  uniqueArray,
  uniqueArrayOfObjects,
  validateFile,
  validateInput
};

