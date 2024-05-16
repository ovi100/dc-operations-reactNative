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
  TouchableHighlight,
  TouchableOpacity,
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
  const [pressMode, setPressMode] = useState(false);
  const [user, setUser] = useState({});
  const [token, setToken] = useState('');
  const [barcode, setBarcode] = useState('');
  let [articles, setArticles] = useState([]);
  const tableHeader = ['Article Info', 'BIN ID', 'Quantity'];
  const API_URL = 'https://shwapnooperation.onrender.com/api/product-shelving/';
  const { startScan, stopScan } = SunmiScanner;

  useEffect(() => {
    const getAsyncStorage = async () => {
      await getStorage('token', setToken, 'string');
      await getStorage('pressMode', setPressMode);
      await getStorage('user', setUser, 'object');
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
  }, [isFocused]);

  const getShelvingData = async () => {
    try {
      await fetch(API_URL + `ready?filterBy=site&value=${user.site}&pageSize=500`, {
        method: 'GET',
        headers: {
          authorization: token,
        },
      })
        .then(response => response.json())
        .then(async readyData => {
          if (readyData.status) {
            await fetch(API_URL + `partially-in-shelf??filterBy=site&value=${user.site}&pageSize=500`, {
              method: 'GET',
              headers: {
                authorization: token,
              },
            })
              .then(res => res.json())
              .then(result => {
                if (result.status) {
                  const readyItems = readyData.items;
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
                  const combinedData = [...partialData, ...readyItems];
                  setArticles(combinedData);
                } else {
                  const readyItems = readyData.items;
                  setArticles(readyItems);
                }
              })
              .catch(error =>
                Toast.show({
                  type: 'customError',
                  text1: error.message,
                })
              );
          } else {
            Toast.show({
              type: 'customError',
              text1: readyData.message,
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

  const getShelvingList = async () => {
    setIsLoading(true);
    await getShelvingData();
    setIsLoading(false);
  };

  useFocusEffect(
    useCallback(() => {
      if (token && user.site) {
        getShelvingList();
      }
    }, [token, user.site]),
  );

  const onRefresh = async () => {
    setRefreshing(true);
    await getShelvingData();
    setRefreshing(false);
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
        <TouchableOpacity onPress={() => navigation.replace('BinDetails', item)}>
          <View
            key={index}
            className="flex-row items-center justify-between border border-tb rounded-lg mt-2.5 p-3">
            <View className="w-[45%]">
              <Text className="text-xs text-black" numberOfLines={1}>
                {item.code}
              </Text>
              <Text className="w-36 text-black text-base mt-1" numberOfLines={2}>
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
            <Text className="w-[15%] text-black text-right" numberOfLines={1}>
              {item.receivedQuantity}
            </Text>
          </View>
        </TouchableOpacity>
      ) : (
        <View
          key={index}
          className="flex-row items-center justify-between border border-tb rounded-lg mt-2.5 p-3">
          <View className="w-[45%]">
            <Text className="text-xs text-black" numberOfLines={1}>
              {item.code}
            </Text>
            <Text className="w-36 text-black text-base mt-1" numberOfLines={2}>
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
          <Text className="w-[15%] text-black text-right" numberOfLines={1}>
            {item.receivedQuantity}
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
          Loading shelving data. Please wait.....
        </Text>
      </View>
    )
  }

  if (!isLoading && articles.length === 0) {
    return (
      <View className="h-full justify-center pb-2">
        <Text className="text-base text-black font-bold text-center">
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
        <View className="screen-header flex-row items-center justify-center mb-4">
          {pressMode === 'true' ? (
            <TouchableHighlight onPress={() => null}>
              <Text className="text-lg text-sh font-semibold capitalize">
                Shelving
              </Text>
            </TouchableHighlight>
          ) : (
            <Text className="text-lg text-sh font-semibold capitalize">
              Shelving
            </Text>
          )}
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
