import { useFocusEffect, useIsFocused } from '@react-navigation/native';
import React, { useCallback, useEffect, useState } from 'react';
import {
  ActivityIndicator,
  Button,
  DeviceEventEmitter,
  FlatList,
  RefreshControl,
  SafeAreaView,
  Text,
  View
} from 'react-native';
import Toast from 'react-native-toast-message';
import CustomToast from '../../../../components/CustomToast';
import { getStorage } from '../../../../hooks/useStorage';
import SunmiScanner from '../../../../utils/sunmi/scanner';

const Shelving = ({ navigation }) => {
  const isFocused = useIsFocused();
  const [isLoading, setIsLoading] = useState(false);
  const [refreshing, setRefreshing] = useState(false);
  const [token, setToken] = useState('');
  const [barcode, setBarcode] = useState('');
  let articles = [];
  let [readyArticles, setReadyArticles] = useState([]);
  let [partialArticles, setPartialArticles] = useState([]);
  const tableHeader = ['Article ID', 'BIN ID', 'Quantity'];
  const API_URL = 'https://shwapnooperation.onrender.com/api/product-shelving/';
  const { startScan, stopScan } = SunmiScanner;

  useEffect(() => {
    const getAsyncStorage = async () => {
      await getStorage('token', setToken, 'string');
    }
    getAsyncStorage();
  }, []);

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
  }, [isFocused]);

  const getShelvingReadyData = async () => {
    try {
      await fetch(API_URL + 'ready?pageSize=500', {
        method: 'GET',
        headers: {
          authorization: token,
        },
      })
        .then(response => response.json())
        .then(result => {
          if (result.status) {
            const readyItems = result.items;
            setReadyArticles(readyItems);
          }
        })
        .catch(error => {
          Toast.show({
            type: 'customError',
            text1: error.message.toString(),
          });
        });
    } catch (error) {
      Toast.show({
        type: 'customError',
        text1: error.message.toString(),
      });
    }
  };

  const getPartiallyInShelfData = async () => {
    try {
      await fetch(API_URL + 'partially-in-shelf?pageSize=500', {
        method: 'GET',
        headers: {
          authorization: token,
        },
      })
        .then(res => res.json())
        .then(result => {
          if (result.status) {
            const partialData = result.items.map(item => {
              if (item.bins.length === 0) {
                const bins = item.inShelf.map(item => {
                  return { bin_id: item.bin, gondola_id: item.gondola };
                });
                return {
                  ...item,
                  bins,
                  receivedQuantity: item.receivedQuantity - item.inShelf.reduce((acc, item) => acc + item.quantity, 0)
                }
              }
              return {
                ...item,
                receivedQuantity: item.receivedQuantity - item.inShelf.reduce((acc, item) => acc + item.quantity, 0)
              }
            });
            setPartialArticles(partialData);
          }
        })
        .catch(error =>
          Toast.show({
            type: 'customError',
            text1: error.message.toString(),
          })
        );
    } catch (error) {
      Toast.show({
        type: 'customError',
        text1: error.message.toString(),
      });
    }
  }

  const getShelvingData = async () => {
    await getShelvingReadyData();
    await getPartiallyInShelfData();
  }

  const getShelvingList = async () => {
    setIsLoading(true);
    await getShelvingData();
    setIsLoading(false);
  };

  useFocusEffect(
    useCallback(() => {
      if (token) {
        getShelvingList();
      }
    }, [token]),
  );

  const onRefresh = async () => {
    setRefreshing(true);
    await getShelvingData();
    setRefreshing(false);
  };

  if (readyArticles.length > 0 || partialArticles.length > 0) {
    articles = [...partialArticles, ...readyArticles];
  }

  if (barcode !== '') {
    const getArticleBarcode = async (barcode) => {
      try {
        await fetch('https://shelves-backend-1.onrender.com/api/barcodes/barcode/' + barcode, {
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
              const article = articles.find(item => item.code === result.data.material);

              if (article && isValidBarcode) {
                navigation.replace('BinDetails', article);
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
                text1: result.message.toString(),
              });
              setBarcode('');
            }
          })
          .catch(error => {
            Toast.show({
              type: 'customError',
              text1: error.message.toString(),
            });
          });
      } catch (error) {
        Toast.show({
          type: 'customError',
          text1: error.message.toString(),
        });
      }
    };
    getArticleBarcode(barcode);
  }

  const renderItem = ({ item, index }) => (
    <View
      key={index}
      className="flex-row items-center justify-between border border-tb rounded-lg mt-2.5 p-3">
      <View className="w-[45%]">
        <Text className="text-xs text-black" numberOfLines={1}>
          {item.code}
        </Text>
        <Text className="text-black text-base mt-1" numberOfLines={2}>
          {item.description}
        </Text>
      </View>
      <View className="w-2/5">
        {item.bins.length > 0 ? (
          <Text
            className="text-black text-center mb-1 last:mb-0"
            numberOfLines={1}>
            {item.bins[0].bin_id}
          </Text>
        ) : (<Text className="text-black text-center">No bin has been assigned</Text>)}
      </View>
      <Text className="w-[15%] text-black text-center" numberOfLines={1}>
        {item.receivedQuantity}
      </Text>
    </View>
  );

  if (isLoading && articles.length === 0) {
    return (
      <View className="w-full h-screen justify-center px-3">
        <ActivityIndicator size="large" color="#EB4B50" />
        <Text className="mt-4 text-gray-400 text-base text-center">
          Loading shelving data. Please wait.....
        </Text>
      </View>
    )
  }

  if (!isLoading && articles.length === 0) {
    return (
      <View className="h-full justify-center pb-2">
        <Text className="text-base font-bold text-center">
          No product is ready for shelving!
        </Text>
        <View className="w-1/4 mx-auto mt-5">
          <Button title='Retry' onPress={() => getShelvingList()} />
        </View>
      </View>
    )
  }

  return (
    <SafeAreaView className="flex-1 bg-white pt-8">
      <View className="flex-1 h-full px-4">
        <View className="screen-header flex-row items-center mb-4">
          <Text className="flex-1 text-lg text-sh text-center font-semibold capitalize">
            Shelving
          </Text>
        </View>

        <View className="content flex-1">
          <View className="h-full pb-2">
            <View className="flex-row justify-between bg-th mb-2 py-2 px-3">
              {tableHeader.map(th => (
                <Text
                  className="text-white text-center font-bold"
                  key={th}>
                  {th}
                </Text>
              ))}
            </View>

            <FlatList
              data={articles}
              renderItem={renderItem}
              keyExtractor={item => item._id}
              initialNumToRender={10}
              refreshControl={
                <RefreshControl
                  colors={["#fff"]}
                  onRefresh={onRefresh}
                  progressBackgroundColor="#000"
                  refreshing={refreshing}
                />
              }
            />
          </View>
        </View>
      </View>
      <CustomToast />
    </SafeAreaView>
  );
};

export default Shelving;
