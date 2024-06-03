import React, { useEffect, useState } from 'react';
import {
  ActivityIndicator,
  DeviceEventEmitter,
  Keyboard,
  KeyboardAvoidingView,
  Platform,
  Text, TextInput, TouchableHighlight,
  TouchableOpacity,
  View
} from 'react-native';
import Toast from 'react-native-toast-message';
import CustomToast from '../../../../components/CustomToast';
import Scan from '../../../../components/animations/Scan';
import useActivity from '../../../../hooks/useActivity';
import { getStorage } from '../../../../hooks/useStorage';
import SunmiScanner from '../../../../utils/sunmi/scanner';

const Receiving = ({ navigation }) => {
  const [isCheckingPo, setIsCheckingPo] = useState(false);
  const [pressMode, setPressMode] = useState(false);
  const [user, setUser] = useState({});
  const [token, setToken] = useState('');
  const [barcode, setBarcode] = useState('');
  const [search, setSearch] = useState('');
  const API_URL = 'https://shwapnooperation.onrender.com/bapi/po/';
  const { startScan, stopScan } = SunmiScanner;
  const { createActivity } = useActivity();

  useEffect(() => {
    const getAsyncStorage = async () => {
      await getStorage('token', setToken);
      await getStorage('user', setUser, 'object');
      await getStorage('pressMode', setPressMode);
    }
    getAsyncStorage();
  }, []);

  useEffect(() => {
    startScan();
    DeviceEventEmitter.addListener('ScanDataReceived', data => {
      setBarcode(data.code);
    });

    return () => {
      stopScan();
      DeviceEventEmitter.removeAllListeners('ScanDataReceived');
    };
  }, [navigation.isFocused()]);

  const checkPo = async (po) => {
    try {
      await fetch(API_URL + 'released', {
        method: 'POST',
        headers: {
          authorization: token,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ po }),
      })
        .then(response => response.json())
        .then(async result => {
          if (result.status) {
            const data = result.data;
            if (data.poReleasedStatus) {
              await fetch(API_URL + 'display', {
                method: 'POST',
                headers: {
                  authorization: token,
                  'Content-Type': 'application/json',
                },
                body: JSON.stringify({ po }),
              })
                .then(response => response.json())
                .then(async poDetails => {
                  if (poDetails.status) {
                    const poData = poDetails.data;
                    // const companyCode = poData.companyCode;
                    const poItem = poData.items[0];
                    if (poItem.receivingPlant === user.site) {
                      navigation.replace('PurchaseOrder', { po });
                    } else {
                      Toast.show({
                        type: 'customError',
                        text1: 'Not authorized to receive PO',
                      });
                    }
                  } else {
                    Toast.show({
                      type: 'customError',
                      text1: poDetails.message.trim(),
                    });
                    if (poDetails.message.trim() === 'MIS Logged Off the PC where BAPI is Hosted') {
                      //log user activity
                      await createActivity(user._id, 'error', result.message.trim());
                    }
                  }
                })
                .catch(error => {
                  Toast.show({
                    type: 'customError',
                    text1: error.message,
                  });
                });
            } else {
              Toast.show({
                type: 'customError',
                text1: 'PO not released',
              });
            }
          } else {
            Toast.show({
              type: 'customError',
              text1: result.message.trim(),
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

  const getPoDetails = async (po) => {
    setIsCheckingPo(true);
    await checkPo(po);
    setIsCheckingPo(false);
  };

  const searchPo = async (po) => {
    if (!po) {
      Toast.show({
        type: 'customError',
        text1: 'Please enter a PO number',
      });
      setBarcode('');
      setSearch('');
    } else if (po.length !== 10) {
      Toast.show({
        type: 'customError',
        text1: 'Enter 10 digit PO number',
      });
    }
    else {
      if (po && user.site) {
        await getPoDetails(po);
        setBarcode('');
        setSearch('');
        Keyboard.dismiss();
      }
    }
  };

  if (barcode !== '' && user.site) {
    getPoDetails(barcode);
    setBarcode('');
    setSearch('');
  }

  return (
    <KeyboardAvoidingView className="flex-1 bg-white pt-8 px-4" behavior={Platform.OS === 'ios' ? 'padding' : 'height'}>
      <View className="screen-header flex-row items-center justify-center mb-4">
        {pressMode === 'true' ? (
          <TouchableHighlight onPress={() => null}>
            <Text className="text-lg text-sh font-semibold capitalize">
              receiving
            </Text>
          </TouchableHighlight>
        ) : (
          <Text className="text-lg text-sh font-semibold capitalize">
            receiving
          </Text>
        )}
      </View>

      {/* Search Box */}
      <View className="search flex-row">
        <View className="input-box w-4/5">
          <TextInput
            className="bg-[#F5F6FA] text-black rounded-bl-lg rounded-tl-lg px-4"
            placeholder="Search by purchase order"
            keyboardType="phone-pad"
            placeholderTextColor="#CBC9D9"
            selectionColor="#CBC9D9"
            onChangeText={value => setSearch(value)}
            value={search}
          />
        </View>
        <View className="button w-1/5">
          {search ? (
            <TouchableOpacity onPress={() => searchPo(search)}>
              <Text className="text-base bg-blue-600 text-white text-center rounded-tr-lg rounded-br-lg font-semibold py-3">
                search
              </Text>
            </TouchableOpacity>
          ) : (
            <TouchableHighlight onPress={() => null}>
              <Text className="text-base bg-blue-600 text-white text-center rounded-tr-lg rounded-br-lg font-semibold py-3">
                search
              </Text>
            </TouchableHighlight>
          )}
        </View>
      </View>
      <View className="content h-3/4 justify-center">
        {isCheckingPo ? (
          <View>
            <ActivityIndicator size="large" color="#EB4B50" />
            <Text className="mt-4 text-gray-400 text-base text-center">Checking po number</Text>
          </View>
        ) : (
          <View className="relative -z-10">
            <Scan />
            <Text className="text-lg text-gray-400 text-center font-semibold">
              Scan a PO barcode
            </Text>
            <Text className="text-xl text-gray-400 text-center font-semibold my-3">
              OR
            </Text>
            <Text className="text-lg text-gray-400 text-center font-semibold">
              Search by a PO number
            </Text>
          </View>
        )}
      </View>
      {/* </View> */}
      <CustomToast />
    </KeyboardAvoidingView>
  );
};

export default Receiving;