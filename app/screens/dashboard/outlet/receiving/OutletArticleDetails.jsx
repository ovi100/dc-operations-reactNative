import React, { useEffect, useState } from 'react';
import {
  ActivityIndicator, Image,
  KeyboardAvoidingView, Platform,
  SafeAreaView, ScrollView, Text, TextInput,
  TouchableWithoutFeedback, View
} from 'react-native';
import Toast from 'react-native-toast-message';
import CustomToast from '../../../../../components/CustomToast';
import { ButtonLg, ButtonLoading } from '../../../../../components/buttons';
import { BoxIcon } from '../../../../../constant/icons';
import useActivity from '../../../../../hooks/useActivity';
import useAppContext from '../../../../../hooks/useAppContext';
import useBackHandler from '../../../../../hooks/useBackHandler';
import { getStorage } from '../../../../../hooks/useStorage';
import { handleDate } from '../../../../../utils';


const OutletArticleDetails = ({ navigation, route }) => {
  const {
    description, material, po, poItem, sto, dn, dnItem, quantity,
    netPrice, remainingQuantity, receivingPlant, storageLocation, unit
  } = route.params;
  const [isLoading, setIsLoading] = useState(false);
  const [isButtonLoading, setIsButtonLoading] = useState(false);
  const [bins, setBins] = useState([]);
  const [newQuantity, setNewQuantity] = useState(remainingQuantity);
  // const [mfgDate, setMfgDate] = useState(new Date());
  const [expDate, setExpDate] = useState(new Date());
  const [batchNo, setBatchNo] = useState(null);
  // const [mrp, setMrp] = useState(null);
  const [token, setToken] = useState('');
  const { createActivity } = useActivity();
  const { GRNInfo, authInfo } = useAppContext();
  const { user } = authInfo;
  const { addToGRN } = GRNInfo;
  const API_URL = 'https://shwapnooperation.onrender.com/api/';

  // Custom hook to navigate screen
  useBackHandler('OutletPoStoDetails', { po, dn, sto });

  useEffect(() => {
    const getAsyncStorage = async () => {
      await getStorage('token', setToken);
    };
    getAsyncStorage();
  }, []);

  useEffect(() => {
    const getBins = async (code, site) => {
      setIsLoading(true);
      await fetch(`https://api.shwapno.net/shelvesu/api/bins/product/${code}/${site}`)
        .then(res => res.json())
        .then(result => {
          if (result.status) {
            let binsData = result.bins.map(result => {
              return { bin_id: result.bin_ID, gondola_id: result.gondola_ID ? result.gondola_ID : "NA" };
            });
            setBins(binsData);
            setIsLoading(false);
          } else {
            setIsLoading(false);
          }
        });
    };

    if (material && user.site) {
      getBins(material, user.site);
    }

  }, [material, user.site]);

  const postShelvingData = async (postData, grnItem) => {
    setIsButtonLoading(true);
    try {
      await fetch(API_URL + 'product-shelving/ready', {
        method: 'POST',
        headers: {
          authorization: token,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(postData),
      })
        .then(response => response.json())
        .then(async data => {
          // console.log('ready response', data);
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
              `${user.name} ready material ${material} with quantity of ${newQuantity} of ${po ? 'po' : 'dn'} ${po ? po : dn} for shelving`,
            );
            navigation.replace('OutletPoStoDetails', { po, dn, sto });
          } else {
            Toast.show({
              type: 'customError',
              text1: data.message,
            });
            // setTimeout(() => {
            //   navigation.replace('OutletPoStoDetails', { po, sto });
            // }, 1500);
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
    } finally {
      setIsButtonLoading(false);
    }
  }

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
    } else {
      let grnItem = {};
      if (po) {
        // for po -> grn
        grnItem = {
          movementType: '101',
          movementIndicator: 'B',
          storageLocation,
          po,
          poItem: Number(poItem).toString(),
          material: material,
          plant: receivingPlant,
          quantity: Number(newQuantity),
          netPrice,
          uom: unit,
          uomIso: unit,
        };
      } else {
        // for sto/dn -> TPN
        grnItem = {
          movementType: '101',
          movementIndicator: 'B',
          storageLocation,
          po: sto,
          poItem: Number(dnItem).toString(),
          dn,
          dnItem: Number(dnItem).toString(),
          material: material,
          plant: receivingPlant,
          quantity: Number(newQuantity),
          netPrice,
          uom: unit,
          uomIso: unit,
        };
      }

      let shelvingObject = {
        code: material,
        description: description,
        userId: user._id,
        site: receivingPlant,
        quantity,
        receivedQuantity: Number(newQuantity),
        receivedBy: user.name,
        bins,
        batch: batchNo,
        expiryDate: expDate?.date,
        // mrp
      };

      if (po) {
        shelvingObject.po = po;
      } else {
        shelvingObject.sto = sto;
      }

      await postShelvingData(shelvingObject, grnItem);
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
            <View className="quantity-box bg-[#FEFBFB] border border-[#F2EFEF] rounded px-5 py-2">
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
              <View className="input-box mt-2">
                <TextInput
                  className="bg-[#F5F6FA] border border-t-0 border-black/25 h-[50px] text-[#5D80C5] rounded-2xl px-4"
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

            {/* Product Manufacturing Date */}
            {/* <View className="mfg-date bg-[#FEFBFB] border border-[#F2EFEF] rounded mt-3 px-5 py-2">
              <View className="box-header">
                <View className="flex-row items-center justify-between">
                  <Text className="text-base text-[#2E2C3B] font-medium capitalize">
                    manufacturing date
                  </Text>
                  <Text className="text-base text-[#2E2C3B] font-medium capitalize">
                    {mfgDate?.date > new Date() && mfgDate?.date.toLocaleDateString('en-Uk', { dateStyle: 'medium' })}
                  </Text>
                </View>
              </View>
              <View className="date-picker mt-2">
                <TextInput
                  className="bg-[#F5F6FA] border border-t-0 border-black/25 h-[50px] text-[#5D80C5] rounded-2xl px-4"
                  placeholder="DD/MM/YYYY"
                  value={mfgDate?.text}
                  onChangeText={text => setMfgDate(handleDate(text))}
                  keyboardType="numeric"
                  maxLength={10}
                />
              </View>
            </View> */}

            {/* Product Expiry Date */}
            <View className="exp-date bg-[#FEFBFB] border border-[#F2EFEF] rounded mt-3 px-5 py-2">
              <View className="box-header">
                <View className="flex-row items-center justify-between">
                  <Text className="text-base text-[#2E2C3B] font-medium capitalize">
                    expiry date
                  </Text>
                  <Text className="text-base text-[#2E2C3B] font-medium capitalize">
                    {expDate?.date > new Date() && expDate?.date.toLocaleDateString('en-Uk', { dateStyle: 'medium' })}
                  </Text>
                </View>
              </View>
              <View className="date-picker mt-2">
                <TextInput
                  className="bg-[#F5F6FA] border border-t-0 border-black/25 h-[50px] text-[#5D80C5] rounded-2xl px-4"
                  placeholder="DD/MM/YYYY"
                  value={expDate?.text}
                  onChangeText={text => setExpDate(handleDate(text))}
                  keyboardType="numeric"
                  maxLength={10}
                />
              </View>
            </View>

            {/* Product Batch */}
            <View className="product-batch bg-[#FEFBFB] border border-[#F2EFEF] rounded mt-3 px-5 py-2">
              <View className="box-header flex-row items-center justify-between">
                <View>
                  <Text className="text-base text-[#2E2C3B] font-medium capitalize">
                    batch no.
                  </Text>
                </View>
              </View>
              <View className="input-box mt-2">
                <TextInput
                  className="bg-[#F5F6FA] border border-t-0 border-black/25 h-[50px] text-[#5D80C5] rounded-2xl px-4"
                  placeholder="Enter batch number"
                  placeholderTextColor="#5D80C5"
                  selectionColor="#5D80C5"
                  keyboardType="numeric"
                  value={batchNo}
                  onChangeText={value => setBatchNo(value)}
                />
              </View>
            </View>

            {/* Product MRP */}
            {/* <View className="product-mrp bg-[#FEFBFB] border border-[#F2EFEF] rounded mt-3 px-5 py-2">
              <View className="box-header flex-row items-center justify-between">
                <View>
                  <Text className="text-base text-[#2E2C3B] font-medium">
                    MRP Price
                  </Text>
                </View>
              </View>
              <View className="input-box mt-2">
                <TextInput
                  className="bg-[#F5F6FA] border border-t-0 border-black/25 h-[50px] text-[#5D80C5] rounded-2xl px-4"
                  placeholder="Enter MRP price"
                  placeholderTextColor="#5D80C5"
                  selectionColor="#5D80C5"
                  keyboardType="numeric"
                  value={mrp}
                  onChangeText={value => setMrp(value)}
                />
              </View>
            </View> */}

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

export default OutletArticleDetails;