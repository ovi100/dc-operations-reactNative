import React, { useEffect, useState } from 'react';
import { ActivityIndicator, Image, SafeAreaView, Text, TextInput, TouchableWithoutFeedback, View } from 'react-native';
import Toast from 'react-native-toast-message';
import CustomToast from '../../../../components/CustomToast';
import { ButtonLg, ButtonLoading } from '../../../../components/buttons';
import { BoxIcon } from '../../../../constant/icons';
import { getStorage } from '../../../../hooks/useStorage';
import { toast } from '../../../../utils';

const ShelveArticle = ({ navigation, route }) => {
  const { _id, bins, code, description, receivedQuantity } = route.params;
  const [isLoading, setIsLoading] = useState(false);
  const [isButtonLoading, setIsButtonLoading] = useState(false);
  const [newQuantity, setNewQuantity] = useState(Number(receivedQuantity));
  const [user, setUser] = useState({});
  const [token, setToken] = useState('');
  const API_URL = 'https://shwapnooperation.onrender.com/api/';

  useEffect(() => {
    const getAsyncStorage = async () => {
      setIsLoading(true);
      await getStorage('token', setToken, 'string');
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
      site: user.site
    };

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
        .then(inventoryData => {
          if (inventoryData.status) {
            Toast.show({
              type: 'customSuccess',
              text1: inventoryData.message,
            });
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

    }
  };

  const shelveArticle = async () => {
    if (newQuantity > receivedQuantity) {
      toast('Quantity exceed');
    } else {
      if (user.site) {
        const assignToShelveObject = {
          gondola: bins.gondola_id ? bins.gondola_id : '',
          bin: bins.bin_id,
          quantity: Number(newQuantity),
        };

        try {
          setIsButtonLoading(true);
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
                await updateInventory();
              } else {
                Toast.show({
                  type: 'customError',
                  text1: data.message,
                });
                setIsButtonLoading(false);
              }
            })
            .catch(error => {
              Toast.show({
                type: 'customError',
                text1: error.message,
              });
              setIsButtonLoading(false);
            });
        } catch (error) {
          Toast.show({
            type: 'customError',
            text1: error.message,
          });
          setIsButtonLoading(false);
        }
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
    <SafeAreaView className="flex-1 bg-white pt-8">
      <View className="flex-1 px-4">
        <View className="screen-header mb-4">
          <View className="text items-center">
            <TouchableWithoutFeedback>
              <View className="flex-row">
                <Text className="text-xl text-sh font-medium capitalize">
                  shelving article
                </Text>
                <Text className="text-xl text-sh font-bold capitalize">
                  {' ' + code}
                </Text>
              </View>
            </TouchableWithoutFeedback>
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
              keyboardType="numeric"
              value={newQuantity.toString()}
              onChangeText={value => setNewQuantity(value)}
            />
          </View>
        </View>

        <View className="button mt-4">
          {isButtonLoading ? <ButtonLoading styles='bg-theme rounded-md p-5' /> :
            <ButtonLg title="Mark as Shelved" onPress={() => shelveArticle()} />
          }
        </View>
      </View>
      <CustomToast />
    </SafeAreaView>
  );
};

export default ShelveArticle;
