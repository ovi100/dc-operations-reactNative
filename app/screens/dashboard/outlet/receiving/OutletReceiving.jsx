import React, { useEffect, useState } from 'react';
import {
  ActivityIndicator,
  Button,
  DeviceEventEmitter,
  Keyboard,
  KeyboardAvoidingView,
  Text, TextInput, TouchableHighlight,
  TouchableOpacity,
  View
} from 'react-native';
import Toast from 'react-native-toast-message';
import CustomToast from '../../../../../components/CustomToast';
import Scan from '../../../../../components/animations/Scan';
import { getStorage } from '../../../../../hooks/useStorage';
import SunmiScanner from '../../../../../utils/sunmi/scanner';


const Receiving = ({ navigation }) => {
  const [isChecking, setIsChecking] = useState(false);
  const [pressMode, setPressMode] = useState(false);
  const [token, setToken] = useState('');
  const [barcode, setBarcode] = useState('');
  const [search, setSearch] = useState('');
  const API_URL = 'https://shwapnooperation.onrender.com/';
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
  }, [navigation.isFocused()]);

  const isSto = search.startsWith('8') || barcode.startsWith('8');
  const isDn = search.startsWith('01') || barcode.startsWith('01');
  const isPo = (search.startsWith('1') || barcode.startsWith('1')) || (search.startsWith('2') || barcode.startsWith('2')) || (search.startsWith('3') || barcode.startsWith('3'))
    || (search.startsWith('4') || barcode.startsWith('4')) || (search.startsWith('6') || barcode.startsWith('6')) || (search.startsWith('7') || barcode.startsWith('7'));

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
        .then(result => {
          if (result.status) {
            if (result.data.poReleasedStatus) {
              navigation.replace('OutletPoStoDetails', { po });
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
    setIsChecking(true);
    await checkPo(po);
    setIsChecking(false);
  };

  const checkSto = async (sto) => {
    try {
      await fetch(API_URL + `api/sto-tracking?filterBy=sto&value=${sto}`, {
        method: 'GET',
        headers: {
          authorization: token,
          'Content-Type': 'application/json',
        },
      })
        .then(response => response.json())
        .then(result => {
          const status = result.items[0].status
          if (result.status && (status === 'partially inbound picked' || status === 'inbound picked')) {
            navigation.replace('OutletPoStoDetails', { sto });
          } else {
            Toast.show({
              type: 'customError',
              text1: 'STO not received in DC',
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

  const getStoDetails = async (sto) => {
    setIsChecking(true);
    await checkSto(sto);
    setIsChecking(false);
  };

  const searchPo = async (searchTerms) => {
    if (!searchTerms) {
      Toast.show({
        type: 'customError',
        text1: `Please enter a ${isSto ? 'STO' : 'PO'} number`,
      });
      setBarcode('');
      setSearch('');
      return;
    }
    if (searchTerms.length !== 10) {
      Toast.show({
        type: 'customError',
        text1: `Enter 10 digit ${isSto ? 'STO' : 'PO'} number`,
      });
      return;
    }
    if (isSto) {
      await getStoDetails(searchTerms);
      setBarcode('');
      setSearch('');
      Keyboard.dismiss();
    } else {
      await getPoDetails(searchTerms);
      setBarcode('');
      setSearch('');
      Keyboard.dismiss();
    }
  };

  if (barcode !== '') {
    if (isSto) {
      getStoDetails(barcode);
    } else {
      getPoDetails(barcode);
    }
    setBarcode('');
    setSearch('');
  }

  return (
    <KeyboardAvoidingView className="flex-1 bg-white pt-8 px-4" behavior={Platform.OS === 'ios' ? 'padding' : 'height'}>
      <View className="screen-header flex-row items-center justify-center mb-4">
        {pressMode === 'true' ? (
          <TouchableHighlight onPress={() => null}>
            <Text className="text-lg text-sh font-semibold capitalize">
              outlet receiving
            </Text>
          </TouchableHighlight>
        ) : (
          <Text className="text-lg text-sh font-semibold capitalize">
            outlet receiving
          </Text>
        )}
      </View>

      {/* Search Box */}
      <View className="search flex-row">
        <View className="input-box w-4/5">
          <TextInput
            className="bg-[#F5F6FA] text-black rounded-bl-lg rounded-tl-lg px-4"
            placeholder="Search by po or sto"
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
            <Text className="mt-4 text-gray-400 text-base text-center">Checking {isSto ? 'STO' : 'PO'} number</Text>
          </View>
        ) : (
          <View>
            <Scan />
            <Text className="text-lg text-gray-400 text-center font-semibold">
              Scan a PO or sto barcode
            </Text>
            <Text className="text-xl text-gray-400 text-center font-semibold my-3">
              OR
            </Text>
            <Text className="text-lg text-gray-400 text-center font-semibold mb-5">
              Search by a PO or sto number
            </Text>
            <Button title='go to po/dn details' onPress={() => navigation.replace('OutletPoStoDetails', { sto: '8000331438' })} />
          </View>
        )}
      </View>
      <CustomToast />
    </KeyboardAvoidingView>
  );
};

export default Receiving;