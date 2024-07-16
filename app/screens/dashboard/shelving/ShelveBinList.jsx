import { HeaderBackButton } from '@react-navigation/elements';
import React, { useEffect, useLayoutEffect, useState } from 'react';
import {
  ActivityIndicator,
  DeviceEventEmitter, FlatList, SafeAreaView,
  Text,
  View
} from 'react-native';
import Toast from 'react-native-toast-message';
import CustomToast from '../../../../components/CustomToast';
import Dialog from '../../../../components/Dialog';
import FalseHeader from '../../../../components/FalseHeader';
import Scan from '../../../../components/animations/Scan';
import { ButtonProfile } from '../../../../components/buttons';
import useActivity from '../../../../hooks/useActivity';
import useBackHandler from '../../../../hooks/useBackHandler';
import { getStorage } from '../../../../hooks/useStorage';
import SunmiScanner from '../../../../utils/sunmi/scanner';

const ShelveBinList = ({ navigation, route }) => {
  const { code, bins, description } = route.params;
  const [isLoading, setIsLoading] = useState(false);
  const [isChecking, setIsChecking] = useState(false);
  const [dialogVisible, setDialogVisible] = useState(false);
  const [isAssigning, setIsAssigning] = useState(false);
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
    setBarcode('');
    const getAsyncStorage = async () => {
      await getStorage('token', setToken);
      await getStorage('user', setUser, 'object');
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
      setBarcode(data.code);
    });

    return () => {
      stopScan();
      DeviceEventEmitter.removeAllListeners('ScanDataReceived');
    };
  }, [navigation.isFocused()]);

  useEffect(() => {
    if (barcode) {
      const binItem = binsData.find(item => item.bin_id === barcode);
      if (binItem) {
        navigation.replace('ShelveArticleDetails', { ...route.params, bins: { bin_id: binItem.bin_id, gondola_id: binItem.gondola_id } });
      } else {
        checkBin(barcode);
      }
    }
  }, [barcode]);

  const renderItem = ({ item }) => (
    <View className="flex-row items-center border border-tb rounded-lg mt-2.5 p-4" key={item.bin_id}>
      <Text
        className="w-1/2 text-black text-center"
        numberOfLines={1}>
        {item.bin_id}
      </Text>
      <Text
        className="w-1/2 text-black text-center"
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
                  navigation.replace('ShelveArticleDetails', { ...route.params, bins: { bin_id: result.bin.bin_ID, gondola_id: result.bin.gondola_ID } })
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

  const checkBin = async (code) => {
    try {
      setIsChecking(true);
      await fetch(API_URL + `checkBin/${code}`)
        .then(res => res.json())
        .then(result => {
          if (result.status) {
            setDialogVisible(true);
          } else {
            Toast.show({
              type: 'customError',
              text1: result.message,
            });
          }
        });
    } catch (error) {
      Toast.show({
        type: 'customError',
        text1: error.message,
      });
    } finally {
      setIsChecking(false);
    }
  };

  if (isLoading) {
    return (
      <View className="w-full h-screen bg-white justify-center px-3">
        <ActivityIndicator size="large" color="#EB4B50" />
        <Text className="mt-4 text-gray-400 text-base text-center">
          Loading bins data. Please wait.....
        </Text>
      </View>
    )
  }

  if (isAssigning) {
    return (
      <View className="w-full h-screen bg-white justify-center px-3">
        <ActivityIndicator size="large" color="#EB4B50" />
        <Text className="mt-4 text-gray-400 text-base text-center">
          Assigning to new bin. Please wait.....
        </Text>
      </View>
    )
  }

  console.log(barcode)

  return (
    <SafeAreaView className="flex-1 bg-white">
      <View className="flex-1 px-4">
        <FalseHeader />
        <View className="content flex-1 justify-between">
          {!isLoading && binsData.length > 0 ? (
            <View className="table h-full pb-2">
              <View className="flex-row items-center bg-th text-center mb-2 py-2">
                {tableHeader.map(th => (
                  <Text className="w-1/2 text-white text-sm text-center font-bold" key={th}>
                    {th}
                  </Text>
                ))}
              </View>
              {isChecking ? (
                <View className="w-full h-[85vh] justify-center bg-white px-3">
                  <ActivityIndicator size="large" color="#EB4B50" />
                  <Text className="mt-4 text-gray-400 text-base text-center">Checking barcode. Please wait......</Text>
                </View>
              ) : (
                <FlatList
                  data={binsData}
                  renderItem={renderItem}
                  keyExtractor={item => item.bin_ID}
                />)}
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
      <Dialog
        isOpen={dialogVisible}
        modalHeader="Are you sure?"
        modalSubHeader={`Assign article to bin ${barcode}`}
        onClose={() => setDialogVisible(false)}
        onSubmit={() => assignToBin()}
        leftButtonText="cancel"
        rightButtonText="confirm"
      />
    </SafeAreaView>
  );
};

export default ShelveBinList;
