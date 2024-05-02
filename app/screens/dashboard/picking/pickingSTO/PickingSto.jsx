import { useFocusEffect } from '@react-navigation/native';
import React, { useCallback, useEffect, useState } from 'react';
import {
  ActivityIndicator, Button, DeviceEventEmitter, FlatList, SafeAreaView,
  Text, TouchableHighlight, TouchableOpacity, View
} from 'react-native';
import Toast from 'react-native-toast-message';
import CustomToast from '../../../../../components/CustomToast';
import ServerError from '../../../../../components/animations/ServerError';
import useAppContext from '../../../../../hooks/useAppContext';
import { getStorage } from '../../../../../hooks/useStorage';
import SunmiScanner from '../../../../../utils/sunmi/scanner';
import { mergeInventory, updateStoItems } from '../pickingStoArticle/helperFunctions';

const PickingSto = ({ navigation, route }) => {
  const { sto, picker, pickerId, packer, packerId } = route.params;
  const [isLoading, setIsLoading] = useState(false);
  const [pressMode, setPressMode] = useState(false);
  const [barcode, setBarcode] = useState('');
  const [user, setUser] = useState({});
  const [token, setToken] = useState('');
  let [articles, setArticles] = useState([]);
  const API_URL = 'https://shwapnooperation.onrender.com/';
  const { startScan, stopScan } = SunmiScanner;
  const { STOInfo } = useAppContext();
  const { addToTotalSku } = STOInfo;

  const [stoTrackingInfo, setStoTrackingInfo] = useState(null);

  useEffect(() => {
    const getAsyncStorage = async () => {
      await getStorage('token', setToken);
      await getStorage('user', setUser, 'object');
      await getStorage('pressMode', setPressMode);
      await getStorage('stoTrackingInfo', setStoTrackingInfo, 'object');
    }
    getAsyncStorage();
  }, [navigation.isFocused()]);

  // console.log('sto tracking AS info', stoTrackingInfo);

  useEffect(() => {
    startScan();
    DeviceEventEmitter.addListener('ScanDataReceived', data => {
      setBarcode(data.code);
    });

    return () => {
      stopScan();
      DeviceEventEmitter.removeAllListeners('ScanDataReceived');
    };
  }, []);


  const getStoDetails = async () => {
    try {
      await fetch(API_URL + 'bapi/sto/display', {
        method: 'POST',
        headers: {
          authorization: token,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ sto }),
      })
        .then(response => response.json())
        .then(async stoDetails => {
          if (stoDetails.status) {
            try {
              await fetch(API_URL + `api/inventory?filterBy=site&value=${user.site}&pageSize=500`, {
                method: 'GET',
                headers: {
                  authorization: token,
                  'Content-Type': 'application/json',
                }
              })
                .then(response => response.json())
                .then(inventoryData => {
                  if (inventoryData.status) {
                    const inventoryItems = mergeInventory(inventoryData.items);
                    const stoItems = stoDetails.data.items;
                    const mergedData = updateStoItems(stoItems, inventoryItems);
                    console.log('calculated data', mergedData)
                    setArticles(mergedData);
                    addToTotalSku({ sto, totalSku: stoItems.length });
                  } else {
                    const stoItems = stoDetails.data.items;
                    setArticles(stoItems);
                    addToTotalSku({ sto, totalSku: stoItems.length });
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
            Toast.show({
              type: 'customError',
              text1: stoDetails.message,
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

  const finalStoData = async () => {
    setIsLoading(true);
    await getStoDetails();
    setIsLoading(false);
  }

  useFocusEffect(
    useCallback(() => {
      if (token && sto && user.site) {
        finalStoData();
      }
    }, [token, sto, user.site]),
  );

  const goToStoArticle = async (article) => {
    navigation.push('PickingStoArticle', { ...article, picker, pickerId, packer, packerId });
  };

  if (barcode !== '' && pressMode === 'false') {
    const getArticleBarcode = async (barcode) => {
      try {
        await fetch('https://shelves-backend-1-kcgr.onrender.com/api/barcodes/barcode/' + barcode, {
          method: 'GET',
          headers: {
            authorization: token,
            'Content-Type': 'application/json',
          }
        })
          .then(response => response.json())
          .then(result => {
            if (result.status) {
              const isValidBarcode = result.data.barcode.includes(barcode);
              const article = articles.find(item => item.material === result.data.material);

              if (article && isValidBarcode) {
                goToStoArticle(article);
              } else {
                Toast.show({
                  type: 'customInfo',
                  text1: 'Article not found!',
                });
              }
              setBarcode('');
            } else {
              Toast.show({
                type: 'customError',
                text1: result.message,
              });
              setBarcode('');
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
    getArticleBarcode(barcode);
  }

  const renderItem = ({ item, index }) => (
    <>
      {pressMode === 'true' ? (
        <TouchableOpacity onPress={() => goToStoArticle(item)}>
          <View
            key={index}
            className="flex-row items-center justify-between border border-tb rounded-lg mt-2.5 p-3">
            <View className="w-[45%]">
              <Text className="text-xs text-black" numberOfLines={1}>
                {item.material}
              </Text>
              <Text className="w-36 text-black text-base mt-1" numberOfLines={2}>
                {item.description}
              </Text>
            </View>
            <View className="w-2/5">
              {item.bins?.length > 0 ? (
                <>
                  <Text
                    className="text-black text-center mb-1 last:mb-0"
                    numberOfLines={1}>
                    {item.bins[0].bin}
                  </Text>
                  <Text
                    className="text-blue-600 text-center mb-1 last:mb-0"
                    numberOfLines={1}>
                    {item.bins.slice(1).length} more bins
                  </Text>
                </>
              ) : (<Text className="text-black text-center">No bin has been assigned</Text>)}
            </View>
            <Text className="w-[15%] text-black text-right" numberOfLines={1}>
              {item.quantity}
            </Text>
          </View>
        </TouchableOpacity>
      ) : (
        <View
          key={index}
          className="flex-row items-center justify-between border border-tb rounded-lg mt-2.5 p-3">
          <View className="w-[45%]">
            <Text className="text-xs text-black" numberOfLines={1}>
              {item.material}
            </Text>
            <Text className="w-36 text-black text-base mt-1" numberOfLines={2}>
              {item.description}
            </Text>
          </View>
          <View className="w-2/5">
            {item.bins.length > 0 ? (
              <>
                <Text
                  className="text-black text-center mb-1 last:mb-0"
                  numberOfLines={1}>
                  {item.bins[0].bin}
                </Text>
                <Text
                  className="text-blue-600 text-center mb-1 last:mb-0"
                  numberOfLines={1}>
                  {item.bins.slice(1).length} more bins
                </Text>
              </>
            ) : (<Text className="text-black text-center">No bin has been assigned</Text>)}
          </View>
          <Text className="w-[15%] text-black text-right" numberOfLines={1}>
            {item.quantity}
          </Text>
        </View>
      )}
    </>
  );

  if (isLoading && articles.length === 0) {
    return (
      <View className="w-full h-screen justify-center px-3">
        <ActivityIndicator size="large" color="#EB4B50" />
        <Text className="mt-4 text-gray-400 text-base text-center">
          Loading sto articles. Please wait......
        </Text>
      </View>
    )
  }

  if (!isLoading && articles.length === 0) {
    return (
      <View className="w-full h-screen justify-center px-3">
        <ServerError message="No data found!" />
        <View className="w-1/4 mx-auto mt-5">
          <Button title='Retry' onPress={() => finalStoData()} />
        </View>
      </View>
    )
  }

  return (
    <SafeAreaView className="flex-1 bg-white pt-8">
      <View className="flex-1 h-full px-2">
        <View className="screen-header flex-row items-center justify-center mb-4">
          {pressMode === 'true' ? (
            <TouchableHighlight onPress={() => null}>
              <Text className="text-lg text-sh font-semibold">
                Picking STO  {sto}
              </Text>
            </TouchableHighlight>
          ) : (
            <Text className="text-lg text-sh font-semibold">
              Picking STO  {sto}
            </Text>
          )}
        </View>
        <View className="content flex-1 justify-around mt-5 mb-6">
          <View className="table h-full pb-2">
            <View className="flex-row justify-between bg-th mb-2 py-2 px-3">
              <Text className="text-white text-sm text-center font-bold">
                Article Info
              </Text>
              <Text className="text-white text-sm text-center font-bold">
                Bins
              </Text>
              <Text className="text-white text-sm text-center font-bold">
                Quantity
              </Text>
            </View>
            <FlatList
              data={articles}
              renderItem={renderItem}
              keyExtractor={item => item.material}
            />
          </View>
        </View>
      </View>
      <CustomToast />
    </SafeAreaView>
  );
};

export default PickingSto;
