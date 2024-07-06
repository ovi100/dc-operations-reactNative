import { API_URL } from '@env';
import { HeaderBackButton } from '@react-navigation/elements';
import { useFocusEffect } from '@react-navigation/native';
import React, { useCallback, useEffect, useLayoutEffect, useState } from 'react';
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
import useBackHandler from '../../../../../hooks/useBackHandler';
import { getStorage } from '../../../../../hooks/useStorage';
import SunmiScanner from '../../../../../utils/sunmi/scanner';
import { updateStoTracking } from '../processStoData';
import { ButtonProfile } from '../../../../../components/buttons';
import FalseHeader from '../../../../../components/FalseHeader';

const PickingSto = ({ navigation, route }) => {
  const { sto, picker, pickerId, packer, packerId } = route.params;
  const [isLoading, setIsLoading] = useState(false);
  const [pressMode, setPressMode] = useState(false);
  const [barcode, setBarcode] = useState('');
  const [user, setUser] = useState({});
  const [token, setToken] = useState('');
  let [articles, setArticles] = useState([]);
  const { startScan, stopScan } = SunmiScanner;
  const { StoInfo } = useAppContext();
  const { stoInfo, stoItems } = StoInfo;
  let pickedSto = [], stoTrackInfo = {};

  // Custom hook to navigate screen
  useBackHandler('Picking');

  useLayoutEffect(() => {
    let screenOptions = {
      headerTitle: `Picking STO ${sto}`,
      headerTitleAlign: 'center',
      headerLeft: () => (
        <HeaderBackButton onPress={() => navigation.replace('Picking')} />
      ),
      headerRight: () => (
        <ButtonProfile onPress={() => navigation.replace('Profile', { screen: route.name, data: route.params })} />
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
    const postOptions = {
      method: 'POST',
      headers: {
        authorization: token,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ sto, site: user.site }),
    };

    try {
      await fetch(API_URL + 'api/service/sto-picking', postOptions)
        .then(response => response.json())
        .then(data => {
          if (data.status) {
            setArticles(data.items);
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
    navigation.replace('PickingStoArticleBinDetails', { ...article, picker, pickerId, packer, packerId });
  };

  if (barcode && pressMode === 'true') {
    Toast.show({
      type: 'customWarn',
      text1: 'Turn off the press mode',
    });
  }

  const checkBarcode = async (barcode) => {
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
          });
        });
    } catch (error) {
      Toast.show({
        type: 'customError',
        text1: error.message,
      });
    } finally {
      setBarcode('');
    }
  };

  if (barcode && pressMode !== 'true') {
    checkBarcode(barcode);
  }

  const renderItem = ({ item, index }) => (
    <>
      {pressMode === 'true' ? (
        <TouchableOpacity onPress={() => goToStoArticleBins(item)}>
          <View
            key={index}
            className="flex-row items-center justify-between border border-tb rounded-lg mt-2.5 p-2">
            <View className="article-info w-1/2">
              <View className="flex-row items-center">
                <Text className="text-xs text-black mr-2" numberOfLines={1}>
                  {item.material}
                </Text>
                <Text className="text-black text-xs font-bold" numberOfLines={1}>
                  quantity {'--> ' + item.quantity}
                </Text>
              </View>
              <Text className="w-4/5 text-black text-sm mt-1" numberOfLines={2}>
                {item.description}
              </Text>
            </View>
            <View className="bin-info w-1/2">
              {item.bins?.length > 0 ? (
                <>
                  {item.bins.slice(0, 2).map(item => (
                    <Text
                      className="text-black text-xs text-right mb-1 last:mb-0"
                      numberOfLines={2}
                      key={item.bin}
                    >
                      {item.bin}({item.quantity})
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
              ) : (<Text className="text-black text-sm text-center">No bin has been assigned</Text>)}
            </View>
          </View>
        </TouchableOpacity>
      ) : (
        <View
          key={index}
          className="flex-row items-center justify-between border border-tb rounded-lg mt-2.5 p-3">
          <View className="article-info w-1/2">
            <View className="flex-row items-center">
              <Text className="text-xs text-black mr-2" numberOfLines={1}>
                {item.material}
              </Text>
              <Text className="text-black text-xs font-bold" numberOfLines={1}>
                quantity {'--> ' + item.quantity}
              </Text>
            </View>
            <Text className="w-4/5 text-black text-sm mt-1" numberOfLines={2}>
              {item.description}
            </Text>
          </View>
          <View className="bin-info w-1/2">
            {item.bins?.length > 0 ? (
              <>
                {item.bins.slice(0, 2).map(item => (
                  <Text
                    className="text-black text-sm text-right mb-1 last:mb-0"
                    numberOfLines={2}
                    key={item.bin}
                  >
                    {item.bin}({item.quantity})
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
            ) : (<Text className="text-black text-sm text-center">No bin has been assigned</Text>)}
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
    <SafeAreaView className="flex-1 bg-white">
      <View className="flex-1 h-full px-2">
        <FalseHeader />
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
