import { HeaderBackButton } from '@react-navigation/elements';
import React, { useEffect, useLayoutEffect, useState } from 'react';
import {
  ActivityIndicator, Alert,
  DeviceEventEmitter, FlatList, SafeAreaView,
  Text, TouchableHighlight, View
} from 'react-native';
import Toast from 'react-native-toast-message';
import CustomToast from '../../../../components/CustomToast';
import Scan from '../../../../components/animations/Scan';
import { ButtonProfile } from '../../../../components/buttons';
import useActivity from '../../../../hooks/useActivity';
import useBackHandler from '../../../../hooks/useBackHandler';
import { getStorage } from '../../../../hooks/useStorage';
import SunmiScanner from '../../../../utils/sunmi/scanner';
import FalseHeader from '../../../../components/FalseHeader';

const BinDetails = ({ navigation, route }) => {
  const { code, bins, description } = route.params;
  const [isLoading, setIsLoading] = useState(false);
  const [isAssigning, setIsAssigning] = useState(false);
  const [pressMode, setPressMode] = useState(false);
  const tableHeader = ['Bin ID', 'Gondola ID'];
  const [user, setUser] = useState({});
  const [token, setToken] = useState('');
  const [binsData, setBinsData] = useState([]);
  const [barcode, setBarcode] = useState('');
  const { startScan, stopScan } = SunmiScanner;
  const { createActivity } = useActivity();
  const API_URL = 'https://api.shwapno.net/shelvesu/api/bins/';

  // Custom hook to navigate screen
  useBackHandler('Shelving');

  const screenHeader = () => (
    <View className="screen-header bg-white flex-row items-center justify-between py-2 pr-3">
      <HeaderBackButton onPress={() => navigation.replace('Shelving')} />
      <View className="text items-center">
        <View className="flex-row">
          <Text className="text-base text-sh font-medium capitalize">
            Bins for article
          </Text>
          <Text className="text-base text-sh font-bold capitalize">
            {' ' + code}
          </Text>
        </View>
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
  }, [navigation.isFocused(), user.site]);

  useEffect(() => {
    const getAsyncStorage = async () => {
      await getStorage('token', setToken);
      await getStorage('user', setUser, 'object');
      await getStorage('pressMode', setPressMode);
    }
    getAsyncStorage();
  }, []);

  const getBins = async (code) => {
    try {
      await fetch(API_URL + `product/${code}/${user.site}`, {
        method: 'GET',
        headers: {
          authorization: token,
          'Content-Type': 'application/json',
        }
      })
        .then(response => response.json())
        .then(result => {
          if (result.status) {
            let binsData = result.bins.map(item => {
              return { bin_id: item.bin_ID, gondola_id: item.gondola_ID ? item.gondola_ID : "NA" };
            });
            setBinsData(binsData);
          } else {
            Toast.show({
              type: 'customError',
              text1: result.message,
            });
          }
        })
        .catch(error => {
          Toast.show({
            type: 'customError',
            text1: error.message,
          })
        });
    } catch (error) {
      Toast.show({
        type: 'customError',
        text1: error.message,
      })
    }
  }

  const getBinsInfo = async () => {
    setIsLoading(true);
    await getBins(code);
    setIsLoading(false);
  }

  useEffect(() => {
    if (token && code && user.site && bins.length === 0) {
      getBinsInfo();
    } else {
      setBinsData(bins);
    }
  }, [token, code, user.site, bins.length]);

  useEffect(() => {
    startScan();
    DeviceEventEmitter.addListener('ScanDataReceived', data => {
      console.log(data.code)
      setBarcode(data.code);
    });

    return () => {
      stopScan();
      DeviceEventEmitter.removeAllListeners('ScanDataReceived');
    };
  }, [navigation.isFocused()]);

  const renderItem = ({ item, index }) => (
    <View className="flex-row border border-tb rounded-lg mt-2.5 p-4" key={index}>
      <Text
        className="flex-1 text-black text-center"
        numberOfLines={1}>
        {item.bin_id}
      </Text>
      <Text
        className="flex-1 text-black text-center"
        numberOfLines={1}>
        {item.gondola_id}
      </Text>
    </View>
  );

  const addArticleToBin = async () => {
    const assignToBinObject = {
      binID: barcode,
      newProducts: [
        {
          article_code: code,
          article_name: description
        }
      ]
    };

    try {
      await fetch(API_URL + 'addProducts', {
        method: 'POST',
        headers: {
          authorization: token,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(assignToBinObject),
      })
        .then(response => response.json())
        .then(async data => {
          if (data.status) {
            Toast.show({
              type: 'customSuccess',
              text1: data.message,
            });
            await fetch(API_URL + barcode, {
              method: 'GET',
              headers: {
                authorization: token,
                'Content-Type': 'application/json',
              }
            })
              .then(res => res.json())
              .then(result => {
                if (result.status) {
                  navigation.replace('ShelveArticle', { ...route.params, bins: { bin_id: result.bin.bin_ID, gondola_id: result.bin.gondola_ID } })
                } else {
                  Toast.show({
                    type: 'customError',
                    text1: result.message,
                  });
                }
              });
            //log user activity
            await createActivity(
              user._id,
              'bin_assign',
              `${user.name} assign material ${code} to bin ${result.bin.bin_ID}`,
            );
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
  }

  const assignToBin = async () => {
    if (token && user._id) {
      setIsAssigning(true);
      await addArticleToBin();
      setIsAssigning(false);
    }
  }

  // if (barcode && pressMode === 'true') {
  //   Toast.show({
  //     type: 'customWarn',
  //     text1: 'Turn off the press mode',
  //   });
  // }

  const checkBin = async (code) => {
    await fetch(API_URL + `checkBin/${code}`)
      .then(res => res.json())
      .then(result => {
        if (result.status) {
          Alert.alert('Are you sure?', `Assign article to bin ${code}`, [
            {
              text: 'Cancel',
              onPress: () => null,
              style: 'cancel',
            },
            { text: 'Confirm', onPress: () => assignToBin() },
          ]);
        } else {
          Toast.show({
            type: 'customError',
            text1: result.message,
          });
        }
      });
  };

  if (barcode) {
    const binItem = binsData.find(item => item.bin_id === barcode);
    if (binItem) {
      navigation.replace('ShelveArticle', { ...route.params, bins: { bin_id: binItem.bin_id, gondola_id: binItem.gondola_id } });
    } else {
      checkBin(barcode);
    }
    setBarcode('');
  }

  if (isLoading) {
    return (
      <View className="w-full h-screen justify-center px-3">
        <ActivityIndicator size="large" color="#EB4B50" />
        <Text className="mt-4 text-gray-400 text-base text-center">
          Loading bins data. Please wait.....
        </Text>
      </View>
    )
  }

  if (isAssigning) {
    return (
      <View className="w-full h-screen justify-center px-3">
        <ActivityIndicator size="large" color="#EB4B50" />
        <Text className="mt-4 text-gray-400 text-base text-center">
          Assigning to bin. Please wait.....
        </Text>
      </View>
    )
  }

  return (
    <SafeAreaView className="flex-1 bg-white">
      <View className="flex-1 px-4">
        <FalseHeader />
        <View className="content flex-1 justify-between">
          {!isLoading && binsData.length > 0 ? (
            <View className="table h-full pb-2">
              <View className="flex-row bg-th text-center mb-2 py-2">
                {tableHeader.map(th => (
                  <Text className="flex-1 text-white text-sm text-center font-bold" key={th}>
                    {th}
                  </Text>
                ))}
              </View>
              <FlatList
                data={binsData}
                renderItem={renderItem}
                keyExtractor={item => item.bin_ID}
              />
            </View>
          ) : (
            <View className="h-full justify-center pb-2">
              <Text className="text-lg font-bold text-center">
                No bins found for this product
              </Text>
              <Scan className="my-3" />
              <Text className="text-lg font-bold text-center">
                Please scan a bin barcode to assign the product
              </Text>
            </View>
          )
          }
        </View>


      </View>
      <CustomToast />
    </SafeAreaView>
  );
};

export default BinDetails;
