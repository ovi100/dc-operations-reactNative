import { API_URL } from '@env';
import { HeaderBackButton } from '@react-navigation/elements';
import React, { useEffect, useLayoutEffect, useState } from 'react';
import {
  ActivityIndicator,
  Image, KeyboardAvoidingView,
  Platform, SafeAreaView,
  Text, TextInput,
  View
} from 'react-native';
import Toast from 'react-native-toast-message';
import CustomToast from '../../../../components/CustomToast';
import { ButtonLg, ButtonLoading, ButtonProfile } from '../../../../components/buttons';
import { BoxIcon } from '../../../../constant/icons';
import useActivity from '../../../../hooks/useActivity';
import useBackHandler from '../../../../hooks/useBackHandler';
import { getStorage } from '../../../../hooks/useStorage';

const ShelveArticle = ({ navigation, route }) => {
  const { _id, batch, bins, code, description, mrp, mfgDate, expiryDate, receivedQuantity } = route.params;
  const [isLoading, setIsLoading] = useState(false);
  const [isButtonLoading, setIsButtonLoading] = useState(false);
  const [newQuantity, setNewQuantity] = useState(Number(receivedQuantity));
  const [user, setUser] = useState({});
  const [token, setToken] = useState('');
  const { createActivity } = useActivity();

  // Custom hook to navigate screen
  useBackHandler('Shelving');

  useEffect(() => {
    const getAsyncStorage = async () => {
      setIsLoading(true);
      await getStorage('token', setToken);
      await getStorage('user', setUser, 'object');
      setIsLoading(false);
    }
    getAsyncStorage();
  }, []);

  const screenHeader = () => (
    <View className="screen-header bg-white flex-row items-center justify-between py-2 pr-3">
      <HeaderBackButton onPress={() => navigation.replace('Shelving')} />
      <View className="text items-center">
        <View className="flex-row">
          <Text className="text-base text-sh font-medium capitalize">
            shelving article
          </Text>
          <Text className="text-base text-sh font-bold capitalize">
            {' ' + code}
          </Text>
        </View>
        <Text className="text-sm text-sh text-center font-medium capitalize" numberOfLines={2}>
          {description}
        </Text>
      </View>
      <ButtonProfile onPress={() => navigation.push('Profile')} />
    </View>
  );

  useLayoutEffect(() => {
    let screenOptions = {
      headerTitleAlign: 'center',
      header: () => screenHeader(),
    };
    navigation.setOptions(screenOptions);
  }, [navigation.isFocused()]);

  const updateInventory = async () => {
    let updateStock = {
      material: code,
      description,
      quantity: Number(newQuantity),
      gondola: bins.gondola_id,
      bin: bins.bin_id,
      site: user.site,
      batch,
      mrp,
      mfgDate,
      expiryDate
    };

    try {
      await fetch(API_URL + 'api/inventory', {
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
            setIsButtonLoading(false);
            navigation.replace('Shelving');
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
      await fetch(API_URL + 'api/product-shelving/in-shelf/' + _id, {
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
    <SafeAreaView className="flex-1 bg-white px-4">
      <KeyboardAvoidingView className="flex-1 justify-between pb-2" behavior={Platform.OS === 'ios' ? 'padding' : 'height'}>
        <View>
          <View className="table mt-3 mb-4">
            <View className="flex-row bg-th text-center mb-2 py-2">
              <Text className="flex-1 text-white text-center font-bold">
                Bin ID
              </Text>
              <Text className="flex-1 text-white text-center font-bold">
                Batch No
              </Text>
              <Text className="flex-1 text-white text-center font-bold">
                Expiry Date
              </Text>
            </View>
            <View className="flex-row justify-between border border-tb rounded-lg mt-2.5 p-4">
              <Text
                className="text-black text-center"
                numberOfLines={1}>
                {bins.bin_id}
              </Text>
              <Text
                className="text-black text-center"
                numberOfLines={1}>
                {batch}
              </Text>
              <Text
                className="text-black text-center"
                numberOfLines={1}>
                {expiryDate && new Date(expiryDate).toLocaleDateString('en-Uk', { dateStyle: 'medium' })}
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
                <Image className="w-5 h-5" source={BoxIcon} />
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
        </View>

        <View className="button mt-4">
          {isButtonLoading ? <ButtonLoading styles='bg-theme rounded-md p-5' /> :
            <ButtonLg title="Mark as Shelved" onPress={() => postShelvingData()} />
          }
        </View>
      </KeyboardAvoidingView>
      <CustomToast />
    </SafeAreaView>
  );
};

export default ShelveArticle;
