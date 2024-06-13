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
import CustomToast from '../../../../../components/CustomToast';
import Scan from '../../../../../components/animations/Scan';
import useActivity from '../../../../../hooks/useActivity';
import { getStorage } from '../../../../../hooks/useStorage';
import SunmiScanner from '../../../../../utils/sunmi/scanner';
import { API_URL } from '@env';

const Receiving = ({ navigation }) => {
  const [isChecking, setIsChecking] = useState(false);
  const [pressMode, setPressMode] = useState(false);
  const [user, setUser] = useState({});
  const [token, setToken] = useState('');
  const [barcode, setBarcode] = useState('');
  const [search, setSearch] = useState('');
  const { startScan, stopScan } = SunmiScanner;
  const { createActivity } = useActivity();
  let isDn;

  useEffect(() => {
    const getAsyncStorage = async () => {
      await getStorage('user', setUser, 'object');
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
  }, [navigation.isFocused()]);

  const isPo = (search.startsWith('1') || barcode.startsWith('1')) || (search.startsWith('2') || barcode.startsWith('2')) || (search.startsWith('3') || barcode.startsWith('3'))
    || (search.startsWith('4') || barcode.startsWith('4')) || (search.startsWith('6') || barcode.startsWith('6')) || (search.startsWith('7') || barcode.startsWith('7'));

  const checkPo = async (po) => {
    if (user.site.startsWith('DS')) {
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
                        navigation.replace('OutletPoStoDetails', { po });
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
    } else {
      try {
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
                navigation.replace('OutletPoStoDetails', { po });
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
      } catch (error) {
        Toast.show({
          type: 'customError',
          text1: error.message,
        });
      }
    }
  };

  const getPoDetails = async (po) => {
    setIsChecking(true);
    await checkPo(po);
    setIsChecking(false);
  };

  const checkDn = async (dn) => {
    try {
      await fetch(API_URL + 'bapi/dn/display', {
        method: 'POST',
        headers: {
          authorization: token,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ dn }),
      })
        .then(response => response.json())
        .then(async result => {
          if (result.status) {
            const data = result.data;
            if (data.receivingPlant === user.site) {
              navigation.replace('OutletPoStoDetails', { dn, sto: data.items[0].sto });
            } else {
              Toast.show({
                type: 'customError',
                text1: 'Not authorized to receive DN',
              });
            }

          } else {
            Toast.show({
              type: 'customError',
              text1: result.message,
            });
            if (result.message.trim() === 'MIS Logged Off the PC where BAPI is Hosted') {
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
    } catch (error) {
      Toast.show({
        type: 'customError',
        text1: error.message,
      });
    }
  };

  const getDnDetails = async (dn) => {
    setIsChecking(true);
    await checkDn(dn);
    setIsChecking(false);
  };

  const searchPo = async (searchTerms) => {
    isDn = searchTerms.startsWith('01');
    if (!searchTerms) {
      Toast.show({
        type: 'customError',
        text1: `Please enter a ${isDn ? 'DN' : 'PO'} number`,
      });
      setSearch('');
      return;
    }
    if (searchTerms.length !== 10) {
      Toast.show({
        type: 'customError',
        text1: `Enter 10 digit ${isDn ? 'DN' : 'PO'} number`,
      });
      return;
    }

    if (isDn) {
      await getDnDetails(searchTerms);
      setSearch('');
      Keyboard.dismiss();
    } else if (isPo) {
      await getPoDetails(searchTerms);
      setBarcode('');
      Keyboard.dismiss();
    } else {
      Toast.show({
        type: 'customError',
        text1: 'Enter PO or DN number',
      });
    }
  };

  if (barcode !== '') {
    isDn = barcode.startsWith('01');
    if (isDn && user.site) {
      getDnDetails(barcode);
      setBarcode('');
      setSearch('');
      return;
    }
    if (!isDn && user.site) {
      getPoDetails(barcode);
      setBarcode('');
      setSearch('');
      return;
    }
  }

  if (!user.site) {
    return (
      <View className="w-full h-screen justify-center px-3">
        <ActivityIndicator size="large" color="#EB4B50" />
        <Text className="mt-4 text-gray-400 text-base text-center">Loading user info. Please wait......</Text>
      </View>
    )
  }

  return (
    <KeyboardAvoidingView className="flex-1 bg-white pt-8 px-4" behavior={Platform.OS === 'ios' ? 'padding' : 'height'}>
      <View className="screen-header flex-row items-center justify-center mb-4">
        {pressMode === 'true' ? (
          <TouchableHighlight onPress={() => null}>
            <Text className="text-lg text-sh font-semibold capitalize">
              {user.site.startsWith('DS') ? 'dark store' : 'outlet'} receiving
            </Text>
          </TouchableHighlight>
        ) : (
          <Text className="text-lg text-sh font-semibold capitalize">
            {user.site.startsWith('DS') ? 'dark store' : 'outlet'} receiving
          </Text>
        )}
      </View>

      {/* Search Box */}
      <View className="search flex-row">
        <View className="input-box w-4/5">
          <TextInput
            className="bg-[#F5F6FA] text-black rounded-bl-lg rounded-tl-lg px-4"
            placeholder="Search by po or dn number"
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
        {isChecking ? (
          <View>
            <ActivityIndicator size="large" color="#EB4B50" />
            <Text className="mt-4 text-gray-400 text-base text-center">{`${isPo ? 'Loading po' : 'Checking dn number'}`}</Text>
          </View>
        ) : (
          <View className="relative -z-10">
            <Scan />
            <Text className="text-lg text-gray-400 text-center font-semibold">
              Scan a PO or DN barcode
            </Text>
            <Text className="text-xl text-gray-400 text-center font-semibold my-3">
              OR
            </Text>
            <Text className="text-lg text-gray-400 text-center font-semibold">
              Search by a PO or DN number
            </Text>
          </View>
        )}
      </View>
      <CustomToast />
    </KeyboardAvoidingView>
  );
};

export default Receiving;