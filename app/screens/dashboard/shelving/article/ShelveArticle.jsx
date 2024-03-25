import { useFocusEffect } from '@react-navigation/native';
import React, { useCallback, useState } from 'react';
import { Image, SafeAreaView, Text, TextInput, View } from 'react-native';
import { ButtonBack, ButtonLg } from '../../../../../components/buttons';
import { BoxIcon } from '../../../../../constant/icons';
import { getStorage } from '../../../../../hooks/useStorage';
import { toast } from '../../../../../utils';

const ShelveArticle = ({ navigation, route }) => {
  const { _id, bins, code, description, quantity } = route.params;
  console.log('shelving--> Barcode --> article', route.params);
  const [newQuantity, setNewQuantity] = useState(quantity);
  const [token, setToken] = useState('');
  const API_URL = 'https://shwapnooperation.onrender.com/api/product-shelving/';

  useFocusEffect(
    useCallback(() => {
      getStorage('token', setToken, 'string');
    }, []),
  );

  const shelveArticle = async () => {
    if (newQuantity > quantity) {
      toast('Quantity exceed');
    } else {
      const assignToShelveObject = {
        gondola: bins.gondola_id,
        bin: bins.bin_id,
        quantity: newQuantity,
      };
      console.log(assignToShelveObject);
      try {
        await fetch(API_URL + `in-shelf/${_id}`, {
          method: 'POST',
          headers: {
            authorization: token,
            'Content-Type': 'application/json',
          },
          body: JSON.stringify(assignToShelveObject),
        })
          .then(response => response.json())
          .then(data => {
            if (data.status) {
              toast(data.message);
              setTimeout(() => {
                navigation.navigate('Shelving');
              }, 2000);
            } else {
              toast(data.message);
            }
          })
          .catch(error => {
            toast(error.message);
          });
      } catch (error) {
        toast(error.message);
      }
    }
  };

  return (
    <SafeAreaView className="flex-1 bg-white pt-14">
      <View className="flex-1 px-4">
        <View className="screen-header flex-row items-start justify-between mb-4">
          <ButtonBack navigation={navigation} />
          <View className="text">
            <View className="flex-row justify-end">
              <Text className="text-base text-sh font-medium capitalize">
                Shelving article
              </Text>
              <Text className="text-base text-sh font-bold capitalize">
                {' ' + code}
              </Text>
            </View>
            <Text className="text-sm text-sh text-right font-medium capitalize">
              {description}
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
              <Text className="font-bold text-black">{quantity}</Text>
            </View>
          </View>
          <View className="input-box mt-6">
            <TextInput
              className="bg-[#F5F6FA] border border-t-0 border-black/25 h-[50px] text-[#5D80C5] rounded-2xl mb-3 px-4"
              placeholder="Type Picked Quantity"
              placeholderTextColor="#5D80C5"
              selectionColor="#5D80C5"
              keyboardType="numeric"
              autoFocus={true}
              value={newQuantity.toString()}
              onChangeText={value => {
                setNewQuantity(value);
              }}
            />
          </View>
        </View>

        <View className="button mt-3">
          <ButtonLg title="Mark as Shelved" onPress={() => shelveArticle()} />
        </View>
      </View>
    </SafeAreaView>
  );
};

export default ShelveArticle;
