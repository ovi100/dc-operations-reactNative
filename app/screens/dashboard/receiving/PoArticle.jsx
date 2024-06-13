import React, { useEffect, useState } from 'react';
import {
  ActivityIndicator, Image, KeyboardAvoidingView,
  Platform, SafeAreaView, ScrollView, Text, TextInput,
  TouchableWithoutFeedback, View
} from 'react-native';
// import DatePicker from 'react-native-date-picker';
import { API_URL } from '@env';
import Toast from 'react-native-toast-message';
import CustomToast from '../../../../components/CustomToast';
import { ButtonLg, ButtonLoading } from '../../../../components/buttons';
import { BoxIcon } from '../../../../constant/icons';
import useActivity from '../../../../hooks/useActivity';
import useAppContext from '../../../../hooks/useAppContext';
import useBackHandler from '../../../../hooks/useBackHandler';
import { getStorage } from '../../../../hooks/useStorage';
import { handleDate } from '../../../../utils';

const PoArticle = ({ navigation, route }) => {
  const {
    description, material, po, poItem, quantity, netPrice,
    remainingQuantity, receivingPlant, storageLocation, unit
  } = route.params;
  const [isLoading, setIsLoading] = useState(false);
  const [isButtonLoading, setIsButtonLoading] = useState(false);
  const [bins, setBins] = useState([]);
  const [newQuantity, setNewQuantity] = useState(0); //update_upol
  const [mfgDate, setMfgDate] = useState(new Date());
  const [expDate, setExpDate] = useState(new Date());
  const [batchNo, setBatchNo] = useState(null);
  const [mrp, setMrp] = useState(null);
  const [token, setToken] = useState('');
  const { GRNInfo, authInfo } = useAppContext();
  const { user } = authInfo;
  const { addToGRN } = GRNInfo;
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
        netPrice,
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
        mfgDate: mfgDate?.date,
        expiryDate: expDate?.date,
        batch: batchNo,
        mrp: Number(mrp)
      };

      // console.log('shelving object', shelvingObject);

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
                `${user.name} ready material ${material} with quantity of ${newQuantity} of PO ${po} for shelving`,
              );
              navigation.replace('PurchaseOrder', { po });
            } else {
              Toast.show({
                type: 'customError',
                text1: data.message,
              });
              // navigation.replace('PurchaseOrder', { po });
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
      <View className="w-full h-screen justify-center px-3">
        <ActivityIndicator size="large" color="#EB4B50" />
        <Text className="mt-4 text-gray-400 text-base text-center">Loading article. Please wait......</Text>
      </View>
    )
  }

  // Function to calculate the difference in days between two dates
  function dateDiffInDays(date1, date2) {
    const oneDay = 24 * 60 * 60 * 1000; // hours * minutes * seconds * milliseconds
    return Math.round(Math.abs((date2 - date1) / oneDay));
  }

  // Calculate the total lifespan of the product in days
  const totalLifespan = dateDiffInDays(mfgDate?.date, expDate?.date);

  // Calculate the number of days from the manufacturing date to the current date
  const daysPassed = dateDiffInDays(mfgDate?.date, new Date());

  // Calculate the percentage of the product's life that has passed
  const percentageOfLifePassed = 100 - ((daysPassed / totalLifespan) * 100);

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

            <View className="content h-[85vh] flex-1 justify-around">
              <View className="input-boxes">
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
                      <Text className="font-bold bg-blue-600 text-white rounded-full py-1 px-2">{remainingQuantity}</Text>
                    </View>
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

                <View className="w-full flex-row mt-3">
                  {/* Product Batch */}
                  <View className="w-1/2 product-batch bg-[#FEFBFB] border border-[#F2EFEF] rounded px-3 py-2 mr-0.5">
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
                  <View className="w-1/2 product-mrp bg-[#FEFBFB] border border-[#F2EFEF] rounded px-3 py-2 ml-0.5">
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
                  </View>
                </View>
                <View className="w-full flex-row mt-3">
                  {/* Product Manufacturing Date */}
                  <View className="w-1/2 mfg-date bg-[#FEFBFB] border border-[#F2EFEF] rounded px-3 py-2 mr-0.5">
                    <View className="box-header">
                      <View className="">
                        <Text className="text-base text-[#2E2C3B] font-medium">
                          MFG Date
                        </Text>
                        {mfgDate?.date && (
                          <Text className="text-base text-[#2E2C3B] font-medium capitalize">
                            {mfgDate?.date.toLocaleDateString('en-Uk', { dateStyle: 'medium' })}
                          </Text>
                        )}
                      </View>
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
                      <View className="">
                        <Text className="text-base text-[#2E2C3B] font-medium capitalize">
                          exp date
                        </Text>
                        {expDate?.date && (
                          <Text className="text-base text-[#2E2C3B] font-medium capitalize">
                            {expDate?.date.toLocaleDateString('en-Uk', { dateStyle: 'medium' })}
                          </Text>
                        )}
                      </View>
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

                <View className="w-1/2 mx-auto rounded-md mt-5 bg-green-600 py-3">
                  <Text className="text-lg text-white text-center font-bold capitalize">shelf life: {percentageOfLifePassed ? `${percentageOfLifePassed.toFixed(2)}%` : '0%'}</Text>
                </View>
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

export default PoArticle;