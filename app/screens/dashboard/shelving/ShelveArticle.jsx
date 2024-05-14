import React, { useEffect, useState } from 'react';
import {
  ActivityIndicator, Image, KeyboardAvoidingView,
  Platform, SafeAreaView,
  ScrollView,
  Text, TextInput,
  TouchableOpacity,
  View
} from 'react-native';
import DatePicker from 'react-native-date-picker';
import Toast from 'react-native-toast-message';
import CustomToast from '../../../../components/CustomToast';
import { ButtonLg, ButtonLoading } from '../../../../components/buttons';
import { BoxIcon, CalendarIcon } from '../../../../constant/icons';
import useActivity from '../../../../hooks/useActivity';
import { getStorage } from '../../../../hooks/useStorage';

const ShelveArticle = ({ navigation, route }) => {
  const { _id, bins, code, description, receivedQuantity } = route.params;
  const [isLoading, setIsLoading] = useState(false);
  const [isButtonLoading, setIsButtonLoading] = useState(false);
  const [openDatePicker, setOpenDatePicker] = useState(false);
  const [newQuantity, setNewQuantity] = useState(Number(receivedQuantity));
  const [batchNo, setBatchNo] = useState(null);
  const [expiryDate, setExpiryDate] = useState(new Date());
  const [user, setUser] = useState({});
  const [token, setToken] = useState('');
  const API_URL = 'https://shwapnooperation.onrender.com/api/';
  const { createActivity } = useActivity();

  useEffect(() => {
    const getAsyncStorage = async () => {
      setIsLoading(true);
      await getStorage('token', setToken);
      await getStorage('user', setUser, 'object');
      setIsLoading(false);
    }
    getAsyncStorage();
  }, []);

  const updateInventory = async () => {
    let updateStock = {
      material: code,
      description,
      quantity: Number(newQuantity),
      gondola: bins.gondola_id,
      bin: bins.bin_id,
      site: user.site,
    };

    if (batchNo) {
      updateStock.batch = batchNo;
    }

    if (expiryDate > new Date()) {
      updateStock.expiryDate = expiryDate;
    }

    try {
      await fetch(API_URL + 'inventory', {
        method: 'POST',
        headers: {
          authorization: token,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(updateStock),
      })
        .then(response => response.json())
        .then(async inventoryData => {
          if (inventoryData.status) {
            Toast.show({
              type: 'customSuccess',
              text1: inventoryData.message,
            });
            //log user activity
            await createActivity(
              user._id,
              'inventory',
              `${user.name} add material ${code} with quantity of ${newQuantity} to inventory`,
            );
            setTimeout(() => {
              setIsButtonLoading(false);
              navigation.replace('Shelving');
            }, 1500);
          } else {
            Toast.show({
              type: 'customError',
              text1: inventoryData.message,
            });
          }
        })
        .catch(error => {
          Toast.show({
            type: 'customError',
            text1: error.message,
          });
        });
    } catch (error) {
      Toast.show({
        type: 'customError',
        text1: error.message,
      });
    }
  };

  const shelveProduct = async () => {
    const assignToShelveObject = {
      gondola: bins.gondola_id ? bins.gondola_id : '',
      bin: bins.bin_id,
      quantity: Number(newQuantity),
    };

    try {
      await fetch(API_URL + 'product-shelving/in-shelf/' + _id, {
        method: 'POST',
        headers: {
          authorization: token,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(assignToShelveObject),
      })
        .then(response => response.json())
        .then(async data => {
          if (data.status) {
            Toast.show({
              type: 'customSuccess',
              text1: data.message,
            });
            //log user activity
            await createActivity(
              user._id,
              'in_shelf',
              `${user.name} add material ${code} with quantity of ${newQuantity} to shelf`,
            );
          } else {
            Toast.show({
              type: 'customError',
              text1: data.message,
            });

          }
        })
        .catch(error => {
          Toast.show({
            type: 'customError',
            text1: error.message,
          });
        });
    } catch (error) {
      Toast.show({
        type: 'customError',
        text1: error.message,
      });
    }
  }

  const postShelvingData = async () => {
    if (!newQuantity) {
      Toast.show({
        type: 'customError',
        text1: 'Enter Quantity',
      });
    } else if (newQuantity <= 0) {
      Toast.show({
        type: 'customWarn',
        text1: 'Quantity must be greater than zero',
      });
    } else if (newQuantity > receivedQuantity) {
      Toast.show({
        type: 'customWarn',
        text1: 'Quantity exceed',
      });
    } else if (batchNo && !/^[a-zA-Z0-9]+$/.test(batchNo)) {
      Toast.show({
        type: 'customError',
        text1: 'Batch number must be an alphanumeric',
      });
    } else {
      if (user.site) {
        setIsButtonLoading(true);
        await shelveProduct();
        await updateInventory();
        setIsButtonLoading(false);
      }
    }
  };

  if (isLoading) {
    return (
      <View className="w-full h-screen justify-center px-3">
        <ActivityIndicator size="large" color="#EB4B50" />
        <Text className="mt-4 text-gray-400 text-base text-center">Loading article details. Please wait......</Text>
      </View>
    )
  }

  return (
    <SafeAreaView className="flex-1 bg-white pt-8 px-4">
      <KeyboardAvoidingView className="flex-1" behavior={Platform.OS === 'ios' ? 'padding' : 'height'}>
        <ScrollView>
          <View className="screen-header mb-4">
            <View className="text items-center">
              <View className="flex-row">
                <Text className="text-lg text-sh font-medium capitalize">
                  shelving article
                </Text>
                <Text className="text-lg text-sh font-bold capitalize">
                  {' ' + code}
                </Text>
              </View>
              <Text className="text-lg text-sh text-right font-medium capitalize my-1.5">
                {description}
              </Text>
              <Text className="text-lg text-sh text-right font-medium">
                {bins.bin_id}
              </Text>
            </View>
          </View>

          {/* Quantity Box */}
          <View className="quantity-box bg-[#FEFBFB] border border-[#F2EFEF] p-5">
            <View className="box-header flex-row items-center justify-between">
              <View className="text">
                <Text className="text-base text-[#2E2C3B] font-medium capitalize">
                  shelved quantity
                </Text>
              </View>
              <View className="quantity flex-row items-center gap-3">
                <Image source={BoxIcon} />
                <Text className="font-bold text-black">{receivedQuantity}</Text>
              </View>
            </View>
            <View className="input-box mt-6">
              <TextInput
                className="bg-[#F5F6FA] border border-t-0 border-black/25 h-[50px] text-[#5D80C5] rounded-2xl mb-3 px-4"
                placeholder="Type Picked Quantity"
                placeholderTextColor="#5D80C5"
                selectionColor="#5D80C5"
                keyboardType="default"
                value={newQuantity.toString()}
                onChangeText={value => setNewQuantity(value)}
              />
            </View>
          </View>

          {/* Product Date */}
          <View className="product-date bg-[#FEFBFB] border border-[#F2EFEF] rounded mt-3 p-5">
            <View className="box-header">
              <View className="flex-row items-center justify-between">
                <Text className="text-base text-[#2E2C3B] font-medium capitalize">
                  expiry date
                </Text>
                <Text className="text-base text-[#2E2C3B] font-medium capitalize">
                  {expiryDate > new Date() && new Date(expiryDate).toLocaleDateString('en-Uk', { dateStyle: 'medium' })}
                </Text>
              </View>
            </View>
            <View className="date-picker mt-6">
              <TouchableOpacity onPress={() => setOpenDatePicker(true)}>
                <View className="flex-row items-center justify-center bg-green-600 rounded-md p-4">
                  <Image className="w-7 h-7 mr-3" source={CalendarIcon} />
                  <Text className="text-lg font-bold text-white capitalize">select expiry date</Text>
                </View>
              </TouchableOpacity>
              <DatePicker
                theme='auto'
                modal
                title="Expiry Date"
                minimumDate={new Date()}
                open={openDatePicker}
                mode='date'
                date={expiryDate}
                onConfirm={(date) => {
                  setOpenDatePicker(false)
                  setExpiryDate(date)
                }}
                onCancel={() => setOpenDatePicker(false)}
              />
            </View>
          </View>

          {/* Product Batch */}
          <View className="product-batch bg-[#FEFBFB] border border-[#F2EFEF] rounded mt-3 p-5">
            <View className="box-header flex-row items-center justify-between">
              <View>
                <Text className="text-base text-[#2E2C3B] font-medium capitalize">
                  batch no.
                </Text>
              </View>
            </View>
            <View className="input-box mt-6">
              <TextInput
                className="bg-[#F5F6FA] border border-t-0 border-black/25 h-[50px] text-[#5D80C5] rounded-2xl mb-3 px-4"
                placeholder="Enter batch number"
                placeholderTextColor="#5D80C5"
                selectionColor="#5D80C5"
                keyboardType="numeric"
                value={batchNo}
                onChangeText={value => setBatchNo(value)}
              />

            </View>
          </View>

          <View className="button mt-4">
            {isButtonLoading ? <ButtonLoading styles='bg-theme rounded-md p-5' /> :
              <ButtonLg title="Mark as Shelved" onPress={() => postShelvingData()} />
            }
          </View>
        </ScrollView>
      </KeyboardAvoidingView>
      <CustomToast />
    </SafeAreaView>
  );
};

export default ShelveArticle;
