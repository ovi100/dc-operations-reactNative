import { useIsFocused } from '@react-navigation/native';
import React, { useEffect, useState } from 'react';
import {
  ActivityIndicator,
  DeviceEventEmitter,
  SafeAreaView, Text, TextInput, TouchableHighlight,
  TouchableOpacity,
  View
} from 'react-native';
import Toast from 'react-native-toast-message';
import CustomToast from '../../../../components/CustomToast';
import Scan from '../../../../components/animations/Scan';
import { getStorage } from '../../../../hooks/useStorage';
import SunmiScanner from '../../../../utils/sunmi/scanner';

const Receiving = ({ navigation }) => {
  const isFocused = useIsFocused();
  const [isCheckingPo, setIsCheckingPo] = useState(false);
  const [pressMode, setPressMode] = useState(false);
  const [token, setToken] = useState('');
  const [barcode, setBarcode] = useState('');
  const [search, setSearch] = useState('');
  const API_URL = 'https://shwapnooperation.onrender.com/bapi/po/released';
  const { startScan, stopScan } = SunmiScanner;

  useEffect(() => {
    const getAsyncStorage = async () => {
      await getStorage('token', setToken);
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
  }, [isFocused]);


  const checkPo = async (po) => {
    try {
      await fetch(API_URL, {
        method: 'POST',
        headers: {
          authorization: token,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ po }),
      })
        .then(response => response.json())
        .then(result => {
          if (result.status) {
            if (result.data.poReleasedStatus) {
              navigation.push('PurchaseOrder', { po_id: po });
            } else {
              Toast.show({
                type: 'customError',
                text1: "PO not released",
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
      await getPoDetails(po);
      setBarcode('');
      setSearch('');
    }
  };

  if (barcode !== '') {
    getPoDetails(barcode);
    setBarcode('');
    setSearch('');
  }

  return (
    <SafeAreaView className="flex-1 bg-white pt-8">
      <View className="flex-1 px-4">
        <View className="screen-header flex-row items-center justify-center mb-4">
          {pressMode === 'true' ? (
            <TouchableHighlight onPress={() => null}>
              <Text className="text-lg text-sh font-semibold capitalize">
                receiving screen
              </Text>
            </TouchableHighlight>
          ) : (
            <Text className="text-lg text-sh font-semibold capitalize">
              receiving screen
            </Text>
          )}
        </View>

        {/* Search Box */}
        <View className="search flex-row z-0">
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
            <TouchableOpacity onPress={() => searchPo(search)}>
              <Text className="text-base bg-blue-600 text-white text-center rounded-tr-lg rounded-br-lg font-semibold py-3">
                search
              </Text>
            </TouchableOpacity>
          </View>
        </View>
        <View className="content flex-1 justify-center">
          {isCheckingPo ? (
            <View className="flex-1 justify-center">
              <ActivityIndicator size="large" color="#EB4B50" />
              <Text className="mt-4 text-gray-400 text-base text-center">Checking po number</Text>
            </View>
          ) : (
            <View className="">
              <Scan />
              <Text className="text-lg text-gray-400 text-center font-semibold">
                Scan a PO barcode
              </Text>
              <Text className="text-2xl text-gray-400 text-center font-semibold my-5">
                OR
              </Text>
              <Text className="text-lg text-gray-400 text-center font-semibold">
                Search by a PO number
              </Text>
            </View>
          )}
        </View>
      </View>
      <CustomToast />
    </SafeAreaView>
  );
};

export default Receiving;