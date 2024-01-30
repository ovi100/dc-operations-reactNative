import React, {useEffect, useState} from 'react';
import {Alert, Image, SafeAreaView, Text, TextInput, View} from 'react-native';
import {ButtonBack, ButtonLg} from '../../../../../components/buttons';
import {BoxIcon} from '../../../../../constant/icons';
import {getStorage} from '../../../../../hooks/useStorage';

const PoArticles = ({navigation, route}) => {
  const {description, material, po, quantity, receivingPlant} = route.params;
  const [newQuantity, setNewQuantity] = useState(quantity);
  const [user, setUser] = useState({});
  const [token, setToken] = useState('');
  const API_URL =
    'https://shwapnooperation.onrender.com/api/product-shelving/ready/';

  useEffect(() => {
    const subscribe = navigation.addListener('focus', () => {
      getStorage('user', setUser, 'object');
      getStorage('token', setToken, 'string');
    });

    return subscribe;
  }, [navigation]);

  const updateQuantity = async () => {
    if (newQuantity > quantity) {
      Alert.alert('Quantity exceed');
    } else {
      const shelvingObject = {
        po: po,
        code: material,
        description: description,
        userId: user._id,
        site: receivingPlant,
        name: '',
        quantity: quantity,
        receivedQuantity: newQuantity,
        receivedBy: user.name,
      };
      try {
        await fetch(API_URL, {
          method: 'POST',
          headers: {
            authorization: token,
            'Content-Type': 'application/json',
          },
          body: JSON.stringify(shelvingObject),
        })
          .then(response => response.json())
          .then(data => {
            console.log(data);
            if (data.status) {
              Alert.alert(data.message);
              setTimeout(() => {
                navigation.goBack();
              }, 2000);
            }
          })
          .catch(error => {
            console.log(error);
          });
      } catch (error) {
        console.log(error);
      }
    }
  };

  console.log('receiving--> PO List --> article', route.params);

  return (
    <SafeAreaView className="flex-1 bg-white pt-14">
      <View className="flex-1 px-4">
        <View className="screen-header flex-row items-start justify-between mb-4">
          <ButtonBack navigation={navigation} />
          <View className="text">
            <View className="flex-row justify-end">
              <Text className="text-base text-sh font-medium capitalize">
                receiving article
              </Text>
              <Text className="text-base text-sh font-bold capitalize">
                {' ' + material}
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
                received quantity
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
              value={newQuantity.toString()}
              onChangeText={value => {
                setNewQuantity(value);
              }}
            />
          </View>
        </View>

        <View className="button mt-3">
          <ButtonLg title="Mark as Received" onPress={() => updateQuantity()} />
        </View>
      </View>
    </SafeAreaView>
  );
};

export default PoArticles;
