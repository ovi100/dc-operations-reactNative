import { API_URL } from '@env';
import { HeaderBackButton } from '@react-navigation/elements';
import React, { useEffect, useLayoutEffect, useState } from 'react';
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
import FalseHeader from '../../../../components/FalseHeader';
import Scan from '../../../../components/animations/Scan';
import { ButtonProfile } from '../../../../components/buttons';
import useActivity from '../../../../hooks/useActivity';
import useBackHandler from '../../../../hooks/useBackHandler';
import { getStorage } from '../../../../hooks/useStorage';
import SunmiScanner from '../../../../utils/sunmi/scanner';

const DcReceiving = ({ navigation, route }) => {
  const [isCheckingPo, setIsCheckingPo] = useState(false);
  const [pressMode, setPressMode] = useState(false);
  const [user, setUser] = useState({});
  const [token, setToken] = useState('');
  const [barcode, setBarcode] = useState('');
  const [search, setSearch] = useState('');
  const { startScan, stopScan } = SunmiScanner;
  const { createActivity } = useActivity();

  // Custom hook to navigate screen
  useBackHandler('Home');

  useLayoutEffect(() => {
    let screenOptions = {
      headerTitle: 'DC Receiving',
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
      await fetch(API_URL + 'bapi/po/released', {
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
              await fetch(API_URL + 'bapi/po/display', {
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
                      navigation.replace('DcPoDetails', { po });
                    } else {
                      Toast.show({
                        type: 'customError',
                        text1: `User site ${user.site} and PO site ${poItem.receivingPlant} isn't same.`,
                      });
                    }
                  } else {
                    Toast.show({
                      type: 'customError',
                      text1: poDetails.message.trim(),
                    });
                    if (poDetails.message.trim() === 'MIS Logged Off the PC where BAPI is Hosted') {
                      //log user activity
                      await createActivity(user._id, 'error', poDetails.message.trim());
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
    <KeyboardAvoidingView className="flex-1 bg-white px-4" behavior={Platform.OS === 'ios' ? 'padding' : 'height'}>
      <FalseHeader />

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

export default DcReceiving;