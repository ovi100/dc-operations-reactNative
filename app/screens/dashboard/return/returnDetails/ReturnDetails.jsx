import React, { useState } from 'react';
import { Image, SafeAreaView, Text, TextInput, View } from 'react-native';
import Toast from 'react-native-toast-message';
import CustomToast from '../../../../../components/CustomToast';
import { ButtonBack, ButtonLg } from '../../../../../components/buttons';
import { BoxIcon } from '../../../../../constant/icons';

const ReturnDetails = ({ navigation, route }) => {
  const { id, name, quantity } = route.params;
  const [newQuantity, setNewQuantity] = useState(quantity);

  console.log('Return--> Barcode --> article', route.params);

  const returnArticle = async () => {
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
    } else if (newQuantity > remainingQuantity) {
      Toast.show({
        type: 'customWarn',
        text1: 'Quantity exceed',
      });
    } else {
      Toast.show({
        type: 'customWarn',
        text1: 'Returning successfully',
      });
      navigation.goBack();
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
                Returning article
              </Text>
              <Text className="text-base text-sh font-bold capitalize">
                {' ' + id}
              </Text>
            </View>
            <Text className="text-sm text-sh text-right font-medium capitalize">
              {name}
            </Text>
          </View>
        </View>

        {/* Quantity Box */}
        <View className="quantity-box bg-[#FEFBFB] border border-[#F2EFEF] p-5">
          <View className="box-header flex-row items-center justify-between">
            <View className="text">
              <Text className="text-base text-[#2E2C3B] font-medium capitalize">
                returned quantity
              </Text>
            </View>
            <View className="quantity flex-row items-center gap-3">
              <Image className="w-5 h-5" source={BoxIcon} />
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
              value={newQuantity}
              onChangeText={value => {
                setNewQuantity(value);
              }}
            />
          </View>
        </View>

        <View className="button mt-3">
          <ButtonLg title="Mark as Returned" onPress={() => returnArticle()} />
        </View>
      </View>
      <CustomToast />
    </SafeAreaView>
  );
};

export default ReturnDetails;
