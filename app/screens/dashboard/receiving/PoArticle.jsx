import React, { useEffect, useState } from 'react';
import {
  ActivityIndicator, Image, KeyboardAvoidingView,
  Platform, SafeAreaView, ScrollView, Text, TextInput,
  TouchableOpacity, TouchableWithoutFeedback, View
} from 'react-native';
import DatePicker from 'react-native-date-picker';
import Toast from 'react-native-toast-message';
import CustomToast from '../../../../components/CustomToast';
import { ButtonLg, ButtonLoading } from '../../../../components/buttons';
import { BoxIcon, CalendarIcon } from '../../../../constant/icons';
import useActivity from '../../../../hooks/useActivity';
import useAppContext from '../../../../hooks/useAppContext';
import useBackHandler from '../../../../hooks/useBackHandler';
import { getStorage } from '../../../../hooks/useStorage';

const PoArticle = ({ navigation, route }) => {
  const {
    description, material, po, poItem, quantity,
    remainingQuantity, receivingPlant, storageLocation, unit
  } = route.params;
  const [isLoading, setIsLoading] = useState(false);
  const [isButtonLoading, setIsButtonLoading] = useState(false);
  const [openDatePicker, setOpenDatePicker] = useState(false);
  const [bins, setBins] = useState([]);
  const [newQuantity, setNewQuantity] = useState(remainingQuantity);
  const [batchNo, setBatchNo] = useState(null);
  const [expiryDate, setExpiryDate] = useState(new Date());
  const [token, setToken] = useState('');
  const { GRNInfo, authInfo } = useAppContext();
  const { user } = authInfo;
  const { addToGRN } = GRNInfo;
  const API_URL = 'https://shwapnooperation.onrender.com/api/';
  const { createActivity } = useActivity();

  // Custom hook to navigate screen
  useBackHandler('PurchaseOrder', { po });

  useEffect(() => {
    const getAsyncStorage = async () => {
      await getStorage('token', setToken);
    };
    getAsyncStorage();
  }, []);

  useEffect(() => {
    const getBins = async (code, site) => {
      try {
        await fetch(`https://api.shwapno.net/shelvesu/api/bins/product/${code}/${site}`, {
          method: 'GET',
          headers: {
            authorization: token,
            'Content-Type': 'application/json',
          }
        })
          .then(res => res.json())
          .then(result => {
            if (result.status) {
              let binsData = result.bins.map(result => {
                return { bin_id: result.bin_ID, gondola_id: result.gondola_ID ? result.gondola_ID : "NA" };
              });
              setBins(binsData);
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

    if (material && user.site) {
      setIsLoading(true);
      getBins(material, user.site);
      setIsLoading(false);
    }

  }, [material, user.site]);

  const readyForShelve = async () => {
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
    } else if (batchNo && !/^[a-zA-Z0-9]+$/.test(batchNo)) {
      Toast.show({
        type: 'customError',
        text1: 'Batch number must be an alphanumeric',
      });
    } else {
      const grnItem = {
        movementType: '101',
        movementIndicator: 'B',
        storageLocation,
        po: po,
        poItem: Number(poItem).toString(),
        material: material,
        plant: receivingPlant,
        quantity: Number(newQuantity),
        uom: unit,
        uomIso: unit,
      };

      let shelvingObject = {
        po: po,
        code: material,
        description: description,
        userId: user._id,
        site: receivingPlant,
        quantity,
        receivedQuantity: Number(newQuantity),
        receivedBy: user.name,
        bins,
        batch: batchNo,
        expiryDate: expiryDate > new Date() ? expiryDate : null
      };

      console.log('shelving object', shelvingObject);

      try {
        setIsButtonLoading(true);
        await fetch(API_URL + 'product-shelving/ready', {
          method: 'POST',
          headers: {
            authorization: token,
            'Content-Type': 'application/json',
          },
          body: JSON.stringify(shelvingObject),
        })
          .then(response => response.json())
          .then(async data => {
            if (data.status) {
              Toast.show({
                type: 'customSuccess',
                text1: data.message,
              });
              addToGRN(grnItem);
              //log user activity
              await createActivity(
                user._id,
                'shelving_ready',
                `${user.name} ready material ${material} with quantity of ${newQuantity} of PO ${po} for shelving`,
              );
              navigation.replace('PurchaseOrder', { po });
              setIsButtonLoading(false);
            } else {
              Toast.show({
                type: 'customError',
                text1: data.message,
              });
              navigation.replace('PurchaseOrder', { po });
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
                      receiving article
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
                    received quantity
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
                <ButtonLg title="Mark as Received" onPress={() => readyForShelve()} />
              }
            </View>
          </View>
        </ScrollView>
      </KeyboardAvoidingView>
      <CustomToast />
    </SafeAreaView>
  );
};

export default PoArticle;