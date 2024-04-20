import React, { useEffect, useState } from 'react';
import {
  ActivityIndicator,
  Image, SafeAreaView, Text, TextInput,
  TouchableOpacity,
  TouchableWithoutFeedback, View
} from 'react-native';
import Toast from 'react-native-toast-message';
import CustomToast from '../../../../components/CustomToast';
import { ButtonLg, ButtonLoading } from '../../../../components/buttons';
import { BoxIcon, CalendarIcon } from '../../../../constant/icons';
import useAppContext from '../../../../hooks/useAppContext';
import { getStorage } from '../../../../hooks/useStorage';
import DatePicker from 'react-native-date-picker'

const PoArticle = ({ navigation, route }) => {
  const {
    description, material, po, poItem, quantity,
    receivingPlant, storageLocation, unit
  } = route.params;
  const [isLoading, setIsLoading] = useState(false);
  const [isButtonLoading, setIsButtonLoading] = useState(false);
  const [bins, setBins] = useState([]);
  const [newQuantity, setNewQuantity] = useState(quantity);
  const [batchNo, setBatchNo] = useState('');
  const [token, setToken] = useState('');
  const { GRNInfo, authInfo } = useAppContext();
  const { user } = authInfo;
  const { addToGRN } = GRNInfo;
  const API_URL = 'https://shwapnooperation.onrender.com/api/';
  const [expiryDate, setExpiryDate] = useState(new Date())
  const [openDatePicker, setOpenDatePicker] = useState(false)

  useEffect(() => {
    getStorage('token', setToken, 'string');
  }, []);

  useEffect(() => {
    const getBins = async (code, site) => {
      setIsLoading(true);
      await fetch(`https://shelves-backend-dev.onrender.com/api/bins/product/${code}/${site}`)
        .then(res => res.json())
        .then(result => {
          if (result.status) {
            let binsData = result.bins.map(result => {
              return { bin_id: result.bin_ID, gondola_id: result.gondola_ID };
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

  const readyForShelve = async () => {
    if (newQuantity > quantity) {
      Toast.show({
        type: 'customWarn',
        text1: 'Quantity exceed',
      });
    } else {
      const grnItem = {
        movementType: '101',
        movementIndicator: 'B',
        po: po,
        poItem: Number(poItem).toString(),
        material: material,
        plant: receivingPlant,
        storageLocation: storageLocation,
        quantity: Number(newQuantity),
        uom: unit,
        uomIso: unit,
      };

      const shelvingObject = {
        po: po,
        code: material,
        description: description,
        userId: user._id,
        site: receivingPlant,
        name: '',
        quantity,
        receivedQuantity: Number(newQuantity),
        receivedBy: user.name,
        bins,
      };

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
          .then(data => {
            if (data.status) {
              Toast.show({
                type: 'customSuccess',
                text1: data.message,
              });
              addToGRN(grnItem);
              navigation.replace('PurchaseOrder', { po_id: po });
              setIsButtonLoading(false);
            } else {
              Toast.show({
                type: 'customError',
                text1: data.message,
              });
              navigation.replace('PurchaseOrder', { po_id: po });
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

  console.log(expiryDate, batchNo);

  return (
    <SafeAreaView className="flex-1 bg-white pt-8">
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

        {/* Product Box */}
        <View className="product-box bg-[#FEFBFB] border border-[#F2EFEF] rounded mt-3 p-5">
          <View className="box-header flex-row items-center justify-between">
            <View>
              <Text className="text-xl text-[#2E2C3B] font-medium capitalize">
                #Batch No.
              </Text>
            </View>
            <View className="date-picker">
              <TouchableOpacity onPress={() => setOpenDatePicker(true)}>
                <View className="flex-row items-center bg-black rounded-md p-2">
                  <Image className="w-6 h-6 mr-3" source={CalendarIcon} />
                  <Text className="font-bold text-white">Select Expiry Date</Text>
                </View>
              </TouchableOpacity>
              <DatePicker
                theme='dark'
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
      <CustomToast />
    </SafeAreaView>
  );
};

export default PoArticle;