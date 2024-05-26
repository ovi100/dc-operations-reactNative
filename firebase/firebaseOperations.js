import storage from '@react-native-firebase/storage';
import Toast from 'react-native-toast-message';

const uploadImageToFirebase = async uri => {
  const filename = uri.substring(uri.lastIndexOf('/') + 1);
  const storageRef = storage().ref(`damage images/${filename}`);

  const task = storageRef.putFile(uri);

  task.on('state_changed', taskSnapshot => {
    const progress =
      (taskSnapshot.bytesTransferred / taskSnapshot.totalBytes) * 100;
    console.log(`Progress: ${progress.toFixed(2)}%`);
  });

  try {
    await task;
    const url = await storageRef.getDownloadURL();
    return url;
  } catch (error) {
    Toast.show({
      type: 'customError',
      text1: error,
    });
    console.log(error);
  }
};

export { uploadImageToFirebase };

