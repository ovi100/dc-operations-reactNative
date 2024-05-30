import { useFocusEffect } from '@react-navigation/native';
import React, { useCallback, useEffect, useState } from 'react';
import {
  ActivityIndicator,
  DeviceEventEmitter, FlatList,
  SafeAreaView,
  Text,
  TouchableHighlight,
  TouchableOpacity,
  TouchableWithoutFeedback, View
} from 'react-native';
import Toast from 'react-native-toast-message';
import CustomToast from '../../../../../components/CustomToast';
import ServerError from '../../../../../components/animations/ServerError';
import useAppContext from '../../../../../hooks/useAppContext';
import { getStorage } from '../../../../../hooks/useStorage';
import SunmiScanner from '../../../../../utils/sunmi/scanner';
import { adjustStoQuantity, mergeInventory, updateStoItems, updateStoTracking } from '../processStoData';

const PickingSto = ({ navigation, route }) => {
  const { sto, picker, pickerId, packer, packerId } = route.params;
  const [isLoading, setIsLoading] = useState(false);
  // const [serverMessage, setServerMessage] = useState("");
  const [pressMode, setPressMode] = useState(false);
  const [barcode, setBarcode] = useState('');
  const [user, setUser] = useState({});
  const [token, setToken] = useState('');
  let [articles, setArticles] = useState([]);
  const API_URL = 'https://shwapnooperation.onrender.com/';
  const { startScan, stopScan } = SunmiScanner;
  const { StoInfo } = useAppContext();
  const { addToStoInfo, stoInfo, setStoInfo, stoItems, setStoItems, setIsUpdatingSto } = StoInfo;
  let remainingStoInfo = [], remainingStoItems = [], pickedSto = [], stoTrackInfo = {};

  useEffect(() => {
    const getAsyncStorage = async () => {
      await getStorage('token', setToken);
      await getStorage('user', setUser, 'object');
      await getStorage('pressMode', setPressMode);
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
                .then(async inventoryData => {
                  if (inventoryData.status) {
                    try {
                      await fetch(API_URL + `api/article-tracking?filterBy=sto&value=${sto}&pageSize=500`, {
                        method: 'GET',
                        headers: {
                          authorization: token,
                          'Content-Type': 'application/json',
                        }
                      })
                        .then(response => response.json())
                        .then(articleTrackingData => {
                          if (articleTrackingData.status) {
                            const inventoryItems = mergeInventory(inventoryData.items);
                            const stoItems = stoDetails.data.items;
                            const stoMergedData = updateStoItems(stoItems, inventoryItems);
                            const articleTrackingItems = articleTrackingData.items;
                            const adjustStoItemsQuantity = adjustStoQuantity(stoMergedData, articleTrackingItems);
                            setArticles(adjustStoItemsQuantity);
                          } else {
                            const inventoryItems = mergeInventory(inventoryData.items);
                            const stoItems = stoDetails.data.items;
                            const updateStdData = updateStoItems(stoItems, inventoryItems);
                            const stoMergedData = updateStdData.map(updateStoItem => {
                              return { ...updateStoItem, remainingQuantity: updateStoItem.quantity }
                            }).filter(item => item.remainingQuantity !== 0);
                            setArticles(stoMergedData);
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
                    const stoItems = stoDetails.data.items;
                    setArticles(stoItems);
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
            addToStoInfo({ sto, sku: stoDetails.data.items.length });
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

  if (stoItems) {
    remainingStoItems = stoItems.filter(stoItem => stoItem.sto !== sto);
    pickedSto = stoItems.filter(stoItem => stoItem.sto === sto && stoItem.quantity === stoItem.pickedQuantity);
    remainingStoInfo = stoInfo.filter(item => item.sto !== sto);
    let matchedItem = stoInfo.find(item => item.sto === sto);
    stoTrackInfo = {
      ...matchedItem,
      pickedSku: pickedSto.length,
      remainingSku: matchedItem?.sku - pickedSto.length,
    }
  }

  const postStoTracking = async () => {
    let postData = {};
    const isOnlyItem = stoTrackInfo.sku === 1 && stoTrackInfo.pickedSku === 1;
    const isFirstItem = stoTrackInfo.sku > 1 && stoTrackInfo.pickedSku === 1 && articles.length > 1;
    const isLastItem = stoTrackInfo.sku - stoTrackInfo.pickedSku === 0 && stoTrackInfo.pickedSku > 1;

    // console.log('isOnlyItem', isOnlyItem);
    // console.log('isFirstItem', isFirstItem);
    // console.log('isLastItem', isLastItem);

    if (isOnlyItem) {
      postData = {
        sto,
        pickedSku: stoTrackInfo.pickedSku,
        picker,
        pickerId,
        packer,
        packerId,
        pickingStartingTime: new Date(),
        pickingEndingTime: new Date(),
        status: 'inbound picked'
      };
    } else if (isFirstItem) {
      postData = {
        sto,
        pickedSku: stoTrackInfo.pickedSku,
        picker,
        pickerId,
        packer,
        packerId,
        pickingStartingTime: new Date(),
        status: 'inbound picking'
      };
    } else if (isLastItem) {
      postData = {
        sto,
        pickedSku: stoTrackInfo.pickedSku,
        pickingEndingTime: new Date(),
        status: 'inbound picked'
      };
    } else {
      postData = {
        sto,
        pickedSku: stoTrackInfo.pickedSku,
        status: 'inbound picking'
      };
    }
    await updateStoTracking(token, postData);
  };

  if (stoTrackInfo.pickedSku > 0) {
    postStoTracking();
  }

  const goToStoArticleBins = async (article) => {
    navigation.push('PickingStoArticleBinDetails', { ...article, picker, pickerId, packer, packerId });
  };

  if (barcode !== '' && (pressMode === 'false' || pressMode === null)) {
    const getArticleBarcode = async (barcode) => {
      try {
        await fetch('https://api.shwapno.net/shelvesu/api/barcodes/barcode/' + barcode, {
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
                goToStoArticleBins(article);
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
        <TouchableOpacity onPress={() => goToStoArticleBins(item)}>
          <View
            key={index}
            className="flex-row items-center justify-between border border-tb rounded-lg mt-2.5 p-3">
            <View className="w-1/2">
              <View className="flex-row items-center">
                <Text className="text-xs text-black mr-2" numberOfLines={1}>
                  {item.material}
                </Text>
                <Text className="text-black text-xs font-bold" numberOfLines={1}>
                  quantity {'--> ' + item.remainingQuantity}
                </Text>
              </View>
              <Text className="text-black text-base mt-1" numberOfLines={2}>
                {item.description}
              </Text>
            </View>
            <View className="w-1/2">
              {item.bins?.length > 0 ? (
                <>
                  {item.bins.slice(0, 2).map(item => (
                    <Text
                      className="text-black text-center mb-1 last:mb-0"
                      numberOfLines={2}
                      key={item.bin}
                    >
                      {item.bin}{' --> '}{item.quantity}
                    </Text>
                  ))}
                  {item.bins.slice(2).length > 0 && (
                    <TouchableWithoutFeedback onPress={() => goToStoArticleBins(item)}>
                      <Text
                        className="text-blue-600 text-center mt-1"
                        numberOfLines={1}>
                        {item.bins.slice(2).length} more bins
                      </Text>
                    </TouchableWithoutFeedback>
                  )}
                </>
              ) : (<Text className="text-black text-center">No bin has been assigned</Text>)}
            </View>
          </View>
        </TouchableOpacity>
      ) : (
        <View
          key={index}
          className="flex-row items-center justify-between border border-tb rounded-lg mt-2.5 p-3">
          <View className="w-1/2">
            <View className="flex-row items-center">
              <Text className="text-xs text-black mr-2" numberOfLines={1}>
                {item.material}
              </Text>
              <Text className="text-black text-xs font-bold" numberOfLines={1}>
                quantity {'--> ' + item.remainingQuantity}
              </Text>
            </View>
            <Text className="text-black text-base mt-1" numberOfLines={2}>
              {item.description}
            </Text>
          </View>
          <View className="w-1/2">
            {item.bins?.length > 0 ? (
              <>
                {item.bins.slice(0, 2).map(item => (
                  <Text
                    className="text-black text-center mb-1 last:mb-0"
                    numberOfLines={2}
                    key={item.bin}
                  >
                    {item.bin}{' --> '}{item.quantity}
                  </Text>
                ))}
                {item.bins.slice(2).length > 0 && (
                  <TouchableWithoutFeedback onPress={() => goToStoArticleBins(item)}>
                    <Text
                      className="text-blue-600 text-center mt-1"
                      numberOfLines={1}>
                      {item.bins.slice(2).length} more bins
                    </Text>
                  </TouchableWithoutFeedback>
                )}
              </>
            ) : (<Text className="text-black text-center">No bin has been assigned</Text>)}
          </View>
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
            <View className="table-header flex-row justify-around bg-th mb-2 py-2 px-3">
              <Text className="text-white text-center font-bold">
                Article Info
              </Text>
              <Text className="text-white text-center font-bold">
                Bin Info
              </Text>
            </View>
            {!isLoading && articles.length === 0 ? (
              <View className="w-full h-[90%] justify-center px-4">
                <ServerError message="No sku left picking" />
                <View className="button w-1/3 mx-auto mt-5">
                  <TouchableOpacity onPress={() => finalStoData()}>
                    <Text className="bg-blue-600 text-white text-lg text-center rounded p-2 capitalize">retry</Text>
                  </TouchableOpacity>
                </View>
              </View>
            ) : (
              <FlatList
                data={articles}
                renderItem={renderItem}
                keyExtractor={item => item.material}
              />
            )}
          </View>
        </View>
      </View>
      <CustomToast />
    </SafeAreaView>
  );
};

export default PickingSto;
