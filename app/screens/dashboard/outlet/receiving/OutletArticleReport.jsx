import storage from '@react-native-firebase/storage';
import { Picker } from '@react-native-picker/picker';
import React, { useEffect, useState } from 'react';
import {
  ActivityIndicator,
  Image,
  KeyboardAvoidingView, Platform,
  SafeAreaView, ScrollView, Text, TextInput,
  TouchableOpacity, TouchableWithoutFeedback, View
} from 'react-native';
import { launchCamera } from 'react-native-image-picker';
import Toast from 'react-native-toast-message';
import CustomToast from '../../../../../components/CustomToast';
import { ButtonLg, ButtonLoading } from '../../../../../components/buttons';
import { BoxIcon, CameraIcon, DeleteIcon } from '../../../../../constant/icons';
import { getStorage } from '../../../../../hooks/useStorage';


const OutletArticleReport = ({ navigation, route }) => {
  const {
    description, material, po, poItem, sto, stoItem, quantity,
    remainingQuantity, receivingPlant, storageLocation, unit
  } = route.params;
  const types = [
    "Report Types",
    "Damage",
    "Missing",
  ];
  const reasons = [
    "Damage Types",
    "Physical Damage",
    "Airless Packet",
    "BSTI Seal Not available",
    "Near Expiry",
    "Expired",
    "Torn Package",
    "Rotten",
    "Broken",
    "Importer Seal Not Available",
  ];

  const [isLoading, setIsLoading] = useState(false);
  const [isButtonLoading, setIsButtonLoading] = useState(false);
  const [newQuantity, setNewQuantity] = useState(remainingQuantity);
  const [image, setImage] = useState(null);
  const [filePath, setFilePath] = useState('');
  const [progress, setProgress] = useState(0);
  const [user, setUser] = useState({});
  const [token, setToken] = useState('');
  const [selectedType, setSelectedType] = useState(types[0]);
  const [selectedReason, setSelectedReason] = useState(reasons[0]);
  const API_URL = 'https://shwapnooperation.onrender.com/api/';

  useEffect(() => {
    const getAsyncStorage = async () => {
      setIsLoading(true);
      await getStorage('user', setUser, 'object');
      await getStorage('token', setToken);
      setIsLoading(false);
    };
    getAsyncStorage();
  }, []);

  const pickImage = async () => {
    try {
      setIsLoading(true);
      const result = await launchCamera({ mediaType: 'photo', quality: 0.18 });

      if (result.didCancel) {
        setImage(null);
        setIsLoading(false);
        return;
      }

      if (result.assets[0].uri) {
        setImage(result.assets[0].uri);
        setIsLoading(false);
        return;
      }
    } catch (error) {
      console.error(error);
    }
  };

  const removeImage = () => {
    setImage(null);
  };

  const reTake = () => {
    setImage(null);
    pickImage();
  };

  const uploadImageToFirebase = async uri => {
    let filename = uri.substring(uri.lastIndexOf('/') + 1);
    filename = filename.replace(filename, `${user.site}(${new Date().toLocaleDateString('en-UK').replaceAll('/', '-')})-${po ? po : sto}-${material}-${selectedReason.toLowerCase()}.jpg`);
    const storageRef = storage().ref(`damage images/${filename}`);

    const task = storageRef.putFile(uri);

    task.on('state_changed', taskSnapshot => {
      const progress =
        (taskSnapshot.bytesTransferred / taskSnapshot.totalBytes) * 100;
      setProgress(progress.toFixed(2));
      console.log(taskSnapshot.bytesTransferred);
    });

    try {
      await task;
      const url = await storageRef.getDownloadURL();
      setProgress(0);
      return url;
    } catch (error) {
      Toast.show({
        type: 'customError',
        text1: error.message,
      });
    }
  };

  const submitReport = async () => {
    if (selectedType === "Damage" && selectedReason === "Damage Types") {
      Toast.show({
        type: 'customError',
        text1: 'please select a damage type',
      });
      return;
    }
    if (selectedType === "Damage" && !image) {
      Toast.show({
        type: 'customError',
        text1: 'please upload an image',
      });
      return;
    }
    setIsButtonLoading(true);
    const imageLink = await uploadImageToFirebase(image);
    // console.log('Firebase image link', imageLink)
    setIsButtonLoading(false);
  };

  if (isLoading) {
    return (
      <View className="w-full h-screen justify-center px-3">
        <ActivityIndicator size="large" color="#EB4B50" />
        <Text className="mt-4 text-gray-400 text-base text-center">Loading article. Please wait......</Text>
      </View>
    )
  }

  return (
    <SafeAreaView className="flex-1 bg-white pt-8">
      <KeyboardAvoidingView className="flex-1" behavior={Platform.OS === 'ios' ? 'padding' : 'height'}>
        <ScrollView>
          <View className="flex-1 px-4">
            <View className="screen-header mb-4">
              <View className="text items-center">
                <TouchableWithoutFeedback>
                  <View className="flex-row">
                    <Text className="text-lg text-sh font-medium capitalize">
                      article details
                    </Text>
                    <Text className="text-lg text-sh font-bold capitalize">
                      {' ' + material}
                    </Text>
                  </View>
                </TouchableWithoutFeedback>
                <Text className="text-base text-sh text-right font-medium capitalize">
                  {description}
                </Text>
              </View>
            </View>

            {/* Quantity Box */}
            <View className="quantity-box bg-[#FEFBFB] border border-[#F2EFEF] rounded p-5">
              <View className="box-header flex-row items-center justify-between">
                <View className="text">
                  <Text className="text-base text-[#2E2C3B] font-medium capitalize">
                    quantity
                  </Text>
                </View>
                <View className="quantity flex-row items-center gap-3">
                  <Image source={BoxIcon} />
                  <Text className="font-bold text-black">{remainingQuantity}</Text>
                </View>
              </View>
              <View className="input-box mt-6">
                <TextInput
                  className="bg-[#F5F6FA] border border-t-0 border-black/25 h-[50px] text-[#5D80C5] rounded-2xl mb-3 px-4"
                  placeholder="Type Picked Quantity"
                  placeholderTextColor="#5D80C5"
                  selectionColor="#5D80C5"
                  keyboardType="numeric"
                  value={newQuantity.toString()}
                  onChangeText={value => {
                    setNewQuantity(value);
                  }}
                />
              </View>
            </View>

            <View className="types bg-white border border-solid border-gray-300 rounded mt-4">
              <Picker
                selectedValue={selectedType}
                onValueChange={type => setSelectedType(type)}
                style={{ color: 'black' }}>
                {types?.map((item) => (
                  <Picker.Item
                    label={item}
                    value={item}
                    key={item}
                  />
                ))}
              </Picker>
            </View>

            {selectedType === "Damage" && (
              <View className="reasons bg-white border border-solid border-gray-300 rounded mt-4">
                <Picker
                  selectedValue={selectedReason}
                  onValueChange={reason => setSelectedReason(reason)}
                  style={{ color: 'black' }}>
                  {reasons?.map((item) => (
                    <Picker.Item
                      label={item}
                      value={item}
                      key={item}
                    />
                  ))}
                </Picker>
              </View>
            )}

            {/* Upload Damage Prove */}
            {selectedType === 'Damage' && selectedReason !== "Damage Types" && (
              <View className="image-upload mt-4">
                {isLoading && (
                  <View className="image-picker h-60 items-center justify-center border border-dashed border-theme">
                    <ActivityIndicator size="large" color="#3758FA" />
                  </View>
                )}
                {image === null && !isLoading && (
                  <TouchableOpacity onPress={pickImage}>
                    <View className="image-picker bg-theme flex-row items-center justify-center rounded p-4">
                      <Image className="w-8 h-8 mr-2" source={CameraIcon} />
                      <Text className="text-white text-xl text-center font-semibold">
                        Take a photo
                      </Text>
                    </View>
                  </TouchableOpacity>
                )}
                {image && (
                  <View className="image-preview relative">
                    <Image className="w-full h-60 rounded" source={{ uri: image }} />
                    <View className="buttons absolute top-5 right-5 flex-col gap-8">
                      <TouchableOpacity onPress={() => removeImage()}>
                        <Image className="w-12 h-12 bg-white rounded-full" source={DeleteIcon} />
                      </TouchableOpacity>
                      <TouchableOpacity onPress={() => reTake()}>
                        <Image className="w-12 h-12" source={CameraIcon} />
                      </TouchableOpacity>
                    </View>
                  </View>
                )}
              </View>
            )}

            {/* {image || selectedType === "Missing" && (
              <View className="button mt-4">
                {isButtonLoading ? <ButtonLoading styles='bg-theme rounded-md p-5' /> :
                  <ButtonLg title="Submit" onPress={() => submitReport()} />
                }
              </View>
            )} */}

            <View className="button mt-4">
              {isButtonLoading ? <ButtonLoading styles='bg-theme rounded-md p-5' /> :
                <ButtonLg title="Submit" onPress={() => submitReport()} />
              }
            </View>

            {progress > 0 && (
              <View className="progress relative bg-gray-300 w-full h-1 rounded-full mt-4" >
                <View className="absolute top-0 bg-green-600 h-1 rounded-full" style={{ width: `${progress}%` }}></View>
              </View>
            )}
          </View>
        </ScrollView>
      </KeyboardAvoidingView>
      <CustomToast />
    </SafeAreaView >
  );
};

export default OutletArticleReport;