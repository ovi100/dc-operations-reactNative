import { API_URL } from '@env';
import { HeaderBackButton } from '@react-navigation/elements';
import React, { useEffect, useLayoutEffect, useState } from 'react';
import {
  ActivityIndicator, Image, KeyboardAvoidingView,
  Platform, SafeAreaView, ScrollView, Text, TextInput,
  View
} from 'react-native';
import CircularProgress from 'react-native-circular-progress-indicator';
import Toast from 'react-native-toast-message';
import CustomToast from '../../../../components/CustomToast';
import FalseHeader from '../../../../components/FalseHeader';
import { ButtonLg, ButtonLoading, ButtonProfile } from '../../../../components/buttons';
import { BatchIcon, BoxIcon, MrpIcon, StopWatchGreenIcon, StopWatchRedIcon } from '../../../../constant/icons';
import useActivity from '../../../../hooks/useActivity';
import useAppContext from '../../../../hooks/useAppContext';
import useBackHandler from '../../../../hooks/useBackHandler';
import { getStorage } from '../../../../hooks/useStorage';
import { calculateShelfLife, handleDate } from '../../../../utils';
import { addTempData } from '../../../../utils/apiServices';

const DcPoArticleDetails = ({ navigation, route }) => {
  const {
    description, material, po, poItem, quantity, netPrice,
    remainingQuantity, receivingPlant, storageLocation, unit
  } = route.params;
  const [isLoading, setIsLoading] = useState(false);
  const [isButtonLoading, setIsButtonLoading] = useState(false);
  const [bins, setBins] = useState([]);
  const [newQuantity, setNewQuantity] = useState(0);
  const [mfgDate, setMfgDate] = useState(new Date());
  const [expDate, setExpDate] = useState(new Date());
  const [batchNo, setBatchNo] = useState(null);
  const [mrp, setMrp] = useState(null);
  const [token, setToken] = useState('');
  const { authInfo } = useAppContext();
  const { user } = authInfo;
  const { createActivity } = useActivity();

  // Custom hook to navigate screen
  useBackHandler('DcPoDetails', { po });

  const screenHeader = () => (
    <View className="screen-header bg-white flex-row items-center justify-between py-2 pr-3">
      <HeaderBackButton onPress={() => navigation.replace('DcPoDetails', { po })} />
      <View className="text">
        <Text className="text-base text-sh text-center font-medium capitalize">
          article {' ' + material + ' '} details
        </Text>
        <Text className="text-sm text-sh text-center font-medium capitalize" numberOfLines={2}>
          {description}
        </Text>
      </View>
      <ButtonProfile onPress={() => navigation.replace('Profile', { screen: route.name, data: route.params })} />
    </View>
  );

  useLayoutEffect(() => {
    let screenOptions = {
      headerTitleAlign: 'center',
      header: () => screenHeader(),
    };
    navigation.setOptions(screenOptions);
  }, [navigation.isFocused()]);

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
        userId: user._id,
        type: 'grn data',
        movementType: '101',
        movementIndicator: 'B',
        storageLocation,
        po: po,
        poItem: Number(poItem).toString(),
        material: material,
        plant: receivingPlant,
        quantity: Number(newQuantity),
        netPrice,
        uom: unit,
        uomIso: unit,
      };

      let shelvingObject = {
        po: po,
        code: material,
        description: description ? description : 'NA',
        userId: user._id,
        site: receivingPlant,
        quantity,
        receivedQuantity: Number(newQuantity),
        receivedBy: user.name,
        bins,
        mfgDate: mfgDate?.date,
        expiryDate: expDate?.date,
        batch: batchNo,
        mrp: Number(mrp),
        unit
      };

      try {
        setIsButtonLoading(true);
        await fetch(API_URL + 'api/product-shelving/ready', {
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
              await addTempData(token, grnItem);
              //log user activity
              await createActivity(
                user._id,
                'shelving_ready',
                `${user.name} ready material ${material} with quantity of ${newQuantity} of PO ${po} for shelving`,
              );
              navigation.replace('DcPoDetails', { po });
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
      } finally {
        setIsButtonLoading(false);
      };
    }
  };

  if (isLoading) {
    return (
      <View className="w-full h-screen bg-white justify-center px-3">
        <ActivityIndicator size="large" color="#EB4B50" />
        <Text className="mt-4 text-gray-400 text-base text-center">Loading article. Please wait......</Text>
      </View>
    )
  }

  const shelfLife = calculateShelfLife(mfgDate?.date, expDate?.date);

  return (
    <SafeAreaView className="flex-1 bg-white">
      <KeyboardAvoidingView className="flex-1" behavior={Platform.OS === 'ios' ? 'padding' : 'height'}>
        <ScrollView>
          <View className="flex-1 px-4">
            <FalseHeader />

            <View className="content h-[85vh] flex-1 justify-between">
              <View className="input-boxes mt-2">
                {/* Quantity Box */}
                <View className="quantity-box bg-[#FEFBFB] border border-[#F2EFEF] rounded px-5 py-2">
                  <View className="box-header flex-row items-center justify-between">
                    <View className="text flex-row items-center gap-3">
                      <Image className="w-5 h-5" source={BoxIcon} />
                      <Text className="text-base text-[#2E2C3B] font-medium capitalize">
                        received quantity
                      </Text>
                    </View>
                    <Text className="font-bold bg-blue-600 text-white rounded-full py-1 px-2">{remainingQuantity}</Text>
                  </View>
                  <View className="input-box mt-2">
                    <TextInput
                      className="bg-[#F5F6FA] border border-t-0 border-black/25 h-[50px] text-[#5D80C5] rounded-2xl px-4"
                      placeholder="Enter received quantity"
                      placeholderTextColor="#5D80C5"
                      selectionColor="#5D80C5"
                      keyboardType="numeric"
                      // value={newQuantity.toString()}
                      onChangeText={value => {
                        setNewQuantity(value);
                      }}
                    />
                  </View>
                </View>

                <View className="w-full batch-mrp flex-row mt-3">
                  {/* Product Batch */}
                  <View className="w-1/2 product-batch bg-[#FEFBFB] border border-[#F2EFEF] rounded px-3 py-2 mr-0.5">
                    <View className="box-header flex-row items-center gap-3">
                      <Image className="w-5 h-5" source={BatchIcon} />
                      <Text className="text-base text-[#2E2C3B] font-medium capitalize">
                        batch no.
                      </Text>
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
                  <View className="w-1/2 product-mrp bg-[#FEFBFB] border border-[#F2EFEF] rounded px-3 py-2 ml-0.5">
                    <View className="box-header flex-row items-center gap-3">
                      <Image className="w-5 h-5" source={MrpIcon} />
                      <Text className="text-base text-[#2E2C3B] font-medium">
                        MRP Price
                      </Text>
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
                  </View>
                </View>
                <View className="w-full mfg-exp-date flex-row mt-3">
                  {/* Product Manufacturing Date */}
                  <View className="w-1/2 mfg-date bg-[#FEFBFB] border border-[#F2EFEF] rounded px-3 py-2 mr-0.5">
                    <View className="box-header">
                      <View className="flex-row items-center gap-3">
                        <Image className="w-5 h-5" source={StopWatchGreenIcon} />
                        <Text className="text-base text-[#2E2C3B] font-medium">
                          MFG Date
                        </Text>
                      </View>
                      {mfgDate?.text?.length === 8 && (
                        <Text className="text-base text-[#2E2C3B] font-medium capitalize">
                          {mfgDate?.date.toLocaleDateString('en-Uk', { dateStyle: 'medium' })}
                        </Text>
                      )}
                    </View>
                    <View className="date-picker mt-2">
                      <TextInput
                        className="bg-[#F5F6FA] border border-t-0 border-black/25 h-[50px] text-[#5D80C5] rounded-2xl px-4"
                        placeholder="DD/MM/YY"
                        value={mfgDate?.text}
                        onChangeText={text => setMfgDate(handleDate(text, 'mfg'))}
                        keyboardType="numeric"
                        maxLength={10}
                      />
                    </View>
                  </View>

                  {/* Product Expiry Date */}
                  <View className="w-1/2 exp-date bg-[#FEFBFB] border border-[#F2EFEF] rounded px-3 py-2 ml-0.5">
                    <View className="box-header">
                      <View className="flex-row items-center gap-3">
                        <Image className="w-5 h-5" source={StopWatchRedIcon} />
                        <Text className="text-base text-[#2E2C3B] font-medium capitalize">
                          exp date
                        </Text>
                      </View>
                      {expDate?.text?.length === 8 && (
                        <Text className="text-base text-[#2E2C3B] font-medium capitalize">
                          {expDate?.date.toLocaleDateString('en-Uk', { dateStyle: 'medium' })}
                        </Text>
                      )}
                    </View>
                    <View className="date-picker mt-2">
                      <TextInput
                        className="bg-[#F5F6FA] border border-t-0 border-black/25 h-[50px] text-[#5D80C5] rounded-2xl px-4"
                        placeholder="DD/MM/YY"
                        value={expDate?.text}
                        onChangeText={text => setExpDate(handleDate(text, 'exp'))}
                        keyboardType="numeric"
                        maxLength={10}
                      />
                    </View>
                  </View>
                </View>

                {(mfgDate?.text?.length === 8 && expDate?.text?.length === 8) && (
                  <View className="w-full bg-[#FEFBFB] border border-[#F2EFEF] rounded mt-3 py-2 flex-col items-center">
                    <Text className="text-sm text-[#2E2C3B] text-center font-medium capitalize mb-2">
                      shelf life
                    </Text>
                    <CircularProgress
                      radius={30}
                      value={shelfLife}
                      progressValueColor={shelfLife >= 50 ? 'green' : shelfLife >= 11 ? 'orange' : 'red'}
                      valueSuffix={'%'}
                      duration={1500}
                      strokeColorConfig={[
                        { color: 'red', value: 10 },
                        { color: 'orange', value: 49 },
                        { color: 'green', value: 50 },
                      ]} />
                  </View>
                )}
              </View>
              <View className="button">
                {isButtonLoading ? <ButtonLoading styles='bg-theme rounded-md p-5' /> :
                  <ButtonLg title="Mark as Received" onPress={() => readyForShelve()} />
                }
              </View>
            </View>
          </View>
        </ScrollView>
      </KeyboardAvoidingView>
      <CustomToast />
    </SafeAreaView>
  );
};

export default DcPoArticleDetails;