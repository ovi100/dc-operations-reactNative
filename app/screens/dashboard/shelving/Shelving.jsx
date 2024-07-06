import { API_URL } from '@env';
import { useFocusEffect } from '@react-navigation/native';
import React, { useCallback, useEffect, useLayoutEffect, useState } from 'react';
import {
  ActivityIndicator,
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
import ServerError from '../../../../components/animations/ServerError';
import { getStorage } from '../../../../hooks/useStorage';
import SunmiScanner from '../../../../utils/sunmi/scanner';
import { ButtonProfile } from '../../../../components/buttons';
import FalseHeader from '../../../../components/FalseHeader';

const Shelving = ({ navigation, route }) => {
  const [isLoading, setIsLoading] = useState(false);
  const [flatListFooterVisible, setFlatListFooterVisible] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [pressMode, setPressMode] = useState(false);
  const [user, setUser] = useState({});
  const [token, setToken] = useState('');
  const [barcode, setBarcode] = useState('');
  let [articles, setArticles] = useState([]);
  const tableHeader = ['Article Info', 'BIN ID', 'Quantity'];
  const { startScan, stopScan } = SunmiScanner;

  useLayoutEffect(() => {
    let screenOptions = {
      headerBackVisible: true,
      headerTitleAlign: 'center',
      headerRight: () => (
        <ButtonProfile onPress={() => navigation.replace('Profile', { screen: route.name, data: null })} />
      ),
    };
    navigation.setOptions(screenOptions);
  }, [navigation.isFocused()]);

  useEffect(() => {
    const getAsyncStorage = async () => {
      await getStorage('token', setToken);
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
  }, [navigation.isFocused()]);

  const handleEndReached = useCallback(() => {
    setFlatListFooterVisible(false);
  }, []);

  const renderFooter = () => {
    if (!flatListFooterVisible) return null;

    return (
      <ActivityIndicator />
    );
  };

  const getShelvingData = async () => {
    try {
      await fetch(API_URL + `api/product-shelving/?filterBy=site&value=${user.site}&pageSize=1000`, {
        method: 'GET',
        headers: {
          authorization: token,
        }
      }).then(response => response.json())
        .then(result => {
          if (result.status) {
            let shelvingItems = result.items;
            if (shelvingItems.length > 0) {
              shelvingItems = shelvingItems.map(item => {
                if (item.inShelf.length > 0) {
                  const bins = item.inShelf.map(item => {
                    return { bin_id: item.bin, gondola_id: item.gondola };
                  });
                  return {
                    ...item,
                    bins,
                    receivedQuantity: item.receivedQuantity - item.inShelf.reduce((acc, item) => acc + item.quantity, 0)
                  }
                } else {
                  return {
                    ...item,
                    receivedQuantity: item.receivedQuantity
                  }
                }
              });
              shelvingItems = shelvingItems.filter((item) => item.receivedQuantity !== 0);
            }
            setArticles(shelvingItems);
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
            const article = articles.find(item => item.code === result.data.material);
            if (article && isValidBarcode) {
              navigation.replace('BinDetails', article);
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
        <TouchableOpacity onPress={() => navigation.replace('BinDetails', item)}>
          <View
            key={index}
            className="flex-row items-center justify-between border border-tb rounded-lg mt-2.5 p-3">
            <View className="w-[42%]">
              <Text className="text-xs text-black" numberOfLines={1}>
                {item.code}
              </Text>
              <Text className="w-4/5 text-black" numberOfLines={2}>
                {item.description}
              </Text>
            </View>
            <View className="flex-1 justify-center">
              {item.bins.length > 0 ? (
                <Text className="w-4/5 text-black text-center" numberOfLines={2}>
                  {item.bins[0].bin_id}
                </Text>
              ) :
                (<Text className="w-4/5 text-black">No bin has been assigned</Text>)
              }
            </View>
            <Text className="text-black text-center" numberOfLines={1}>
              {item.receivedQuantity}
            </Text>
          </View>
        </TouchableOpacity>
      ) : (
        <View
          key={index}
          className="flex-row items-center justify-between border border-tb rounded-lg mt-2.5 p-3">
          <View className="w-[42%]">
            <Text className="text-xs text-black" numberOfLines={1}>
              {item.code}
            </Text>
            <Text className="w-4/5 text-black" numberOfLines={2}>
              {item.description}
            </Text>
          </View>
          <View className="flex-1 justify-center">
            {item.bins.length > 0 ? (
              <Text className="w-4/5 text-black" numberOfLines={2}>
                {item.bins[0].bin_id}
              </Text>
            ) :
              (<Text className="w-4/5 text-black">No bin has been assigned</Text>)
            }
          </View>
          <Text className="text-black text-center" numberOfLines={1}>
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

  return (
    <>
      {!isLoading && articles.length === 0 ? (
        <View className="w-full h-screen justify-center px-4">
          <ServerError message="No shelving data found" />
          <View className="button w-1/3 mx-auto mt-5">
            <TouchableOpacity onPress={() => getShelvingList()}>
              <Text className="bg-blue-600 text-white text-lg text-center rounded p-2 capitalize">retry</Text>
            </TouchableOpacity>
          </View>
        </View>
      ) : (
        <SafeAreaView className="flex-1 bg-white">
          <View className="flex-1 h-full px-4">
            <FalseHeader />
            <View className="content flex-1">
              <View className="table h-full pb-2">
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
                  onEndReached={handleEndReached}
                  ListFooterComponent={articles.length > 10 ? renderFooter : null}
                  ListFooterComponentStyle={{ paddingVertical: 15 }}
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
      )}
    </>
  );
};

export default Shelving;
