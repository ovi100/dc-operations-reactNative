import { Alert } from 'react-native';

const validateInput = (type, value) => {
  if (!value) {
    return `${type.charAt(0).toUpperCase() + type.slice(1)} is required`;
  } else {
    if (type === 'email') {
      const regex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
      if (!regex.test(value)) {
        return 'invalid email address';
      } else {
        return null;
      }
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

const groupBy = (array, type) => {
  return array.reduce((acc, obj) => {
    const key = obj[type];
    if (!acc[key]) {
      acc[key] = [];
    }
    acc[key].push(obj);
    return acc;
  }, {});
};

export {
  groupBy,
  uniqueArray,
  uniqueArrayOfObjects,
  validateFile,
  validateInput
};

