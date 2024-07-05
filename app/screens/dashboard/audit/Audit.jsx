import { API_URL } from '@env';
import { HeaderBackButton } from '@react-navigation/elements';
import React, { useEffect, useLayoutEffect, useState } from 'react';
import {
  ActivityIndicator,
  DeviceEventEmitter,
  KeyboardAvoidingView,
  Platform,
  Text,
  TextInput,
  TouchableHighlight,
  TouchableOpacity,
  View
} from 'react-native';
import Toast from 'react-native-toast-message';
import CustomToast from '../../../../components/CustomToast';
import Scan from '../../../../components/animations/Scan';
import { getStorage } from '../../../../hooks/useStorage';
import SunmiScanner from '../../../../utils/sunmi/scanner';
import { ButtonProfile } from '../../../../components/buttons';
import useBackHandler from '../../../../hooks/useBackHandler';

const Audit = ({ navigation, route }) => {
  const [isLoading, setIsLoading] = useState(false);
  const [user, setUser] = useState({});
  const [token, setToken] = useState('');
  const [barcode, setBarcode] = useState('');
  const [search, setSearch] = useState('');
  const { startScan, stopScan } = SunmiScanner;

  // Custom hook to navigate screen
  useBackHandler('Home');

  useLayoutEffect(() => {
    let screenOptions = {
      headerTitleAlign: 'center',
      headerLeft: () => (
        <HeaderBackButton onPress={() => navigation.replace('Home')} />
      ),
      headerRight: () => (
        <ButtonProfile onPress={() => navigation.replace('Profile', { screen: route.name, data: null })} />
      ),
    };
    navigation.setOptions(screenOptions);
  }, [navigation.isFocused()]);

  useEffect(() => {
    const getAsyncStorage = async () => {
      await getStorage('token', setToken);
      await getStorage('user', setUser, 'object');
    }
    getAsyncStorage();
  }, [navigation.isFocused()]);

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

  const getInventory = async (code) => {
    let postData = {
      filter: {
        site: user.site,
      },
      query: {
        pageSize: 1000,
        sortBy: "quantity",
        sortOrder: "desc"
      }
    }
    const isBin = isNaN(code);
    if (isBin) {
      postData.filter.bin = code;
    } else {
      postData.filter.material = code;
    }

    // console.log(postData)

    const postOptions = {
      method: 'POST',
      headers: {
        authorization: token,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(postData),
    };

    try {
      await fetch(API_URL + 'api/inventory/all', postOptions)
        .then(response => response.json())
        .then(data => {
          if (data.status) {
            if (isBin) {
              navigation.replace('AuditBinList', { bin: code, articles: data.items });
            } else {
              navigation.replace('AuditArticleDetails', { material: code, articles: data.items });
            }
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
    }
  };

  const getInventoryInfo = async (code) => {
    setIsLoading(true);
    await getInventory(code);
    setIsLoading(false);
  }

  if (barcode && user.site) {
    getInventoryInfo(barcode);
    setBarcode('');
    setSearch('');
  }

  const searchInventory = async (search) => {
    getInventoryInfo(search);
  };

  return (
    <KeyboardAvoidingView className="flex-1 bg-white pt-8 px-4" behavior={Platform.OS === 'ios' ? 'padding' : 'height'}>
      {/* Search Box */}
      <View className="search flex-row">
        <View className="input-box w-4/5">
          <TextInput
            className="bg-[#F5F6FA] text-black rounded-bl-lg rounded-tl-lg px-4"
            placeholder="Search by article code or bin number"
            keyboardType="phone-pad"
            placeholderTextColor="#CBC9D9"
            selectionColor="#CBC9D9"
            onChangeText={value => setSearch(value)}
            value={search}
          />
        </View>
        <View className="button w-1/5">
          {search ? (
            <TouchableOpacity onPress={() => searchInventory(search)}>
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
        {isLoading ? (
          <View>
            <ActivityIndicator size="large" color="#EB4B50" />
            <Text className="mt-4 text-gray-400 text-base text-center">searching info....</Text>
          </View>
        ) : (
          <View className="relative -z-10">
            <Scan />
            <Text className="text-lg text-gray-400 text-center font-semibold">
              Scan a article or bin barcode
            </Text>
            <Text className="text-xl text-gray-400 text-center font-semibold my-3">
              OR
            </Text>
            <Text className="text-lg text-gray-400 text-center font-semibold">
              Search article code or bin number
            </Text>
          </View>
        )}
      </View>
      <CustomToast />
    </KeyboardAvoidingView>
  );
};

export default Audit;