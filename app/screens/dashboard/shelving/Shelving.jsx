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
  TouchableOpacity,
  View
} from 'react-native';
import Toast from 'react-native-toast-message';
import CustomToast from '../../../../components/CustomToast';
import FalseHeader from '../../../../components/FalseHeader';
import ServerError from '../../../../components/animations/ServerError';
import { ButtonProfile } from '../../../../components/buttons';
import { getStorage } from '../../../../hooks/useStorage';
import SunmiScanner from '../../../../utils/sunmi/scanner';

const Shelving = ({ navigation, route }) => {
  const [isLoading, setIsLoading] = useState(false);
  const [isChecking, setIsChecking] = useState(false);
  const [flatListFooterVisible, setFlatListFooterVisible] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [pressMode, setPressMode] = useState(false);
  const [user, setUser] = useState({});
  const [token, setToken] = useState('');
  const [barcode, setBarcode] = useState('');
  let [articles, setArticles] = useState([]);
  const tableHeader = ['Article Info', 'BIN ID', 'Quantity'];
  const { startScan, stopScan } = SunmiScanner;
  const specialCodes = ['2304145', '2304146', '2304147', '2304149', '2304150', '2304422', '2600241'];

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

  useEffect(() => {
    if (barcode && pressMode !== 'true') {
      checkBarcode(barcode);
    }
  }, [barcode, pressMode]);

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
      setIsChecking(true);
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
            const isScannable = articles.some(article => {
              const isLooseCommodity = article.code.startsWith('24') && article.unit === 'KG';
              const isCustomArticle = specialCodes.includes(article.code);
              return isValidBarcode && (!isLooseCommodity || isCustomArticle);
            });
            const article = articles.find(item => item.code === result.data.material);
            if (!isScannable && article) {
              Toast.show({
                type: 'customInfo',
                text1: `Please receive ${article.code} by taping on the product`,
              });
            } else if (isScannable && article && isValidBarcode) {
              navigation.replace('ShelveBinList', article);
            } else {
              Toast.show({
                type: 'customInfo',
                text1: 'Article not found in the list',
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
      setIsChecking(false);
    }
  };

  const renderItem = ({ item }) => (
    <>
      {pressMode === 'true' || (item.code.startsWith('24') && item.unit === 'KG') || specialCodes.includes(item.code) ? (
        <TouchableOpacity onPress={() => navigation.replace('ShelveBinList', item)}>
          <View
            key={item._id}
            className={`${(item.code.startsWith('24') && item.unit === 'KG') || specialCodes.includes(item.code) ?
              'border-green-500' : 'border-tb'} flex-row items-center border rounded-lg mt-2.5 p-4`}
          >
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
          key={item._id}
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
      <View className="w-full h-screen bg-white justify-center px-3">
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
        <View className="w-full h-screen bg-white justify-center px-4">
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
                {isChecking ? (
                  <View className="w-full h-[85vh] justify-center bg-white px-3">
                    <ActivityIndicator size="large" color="#EB4B50" />
                    <Text className="mt-4 text-gray-400 text-base text-center">Checking barcode. Please wait......</Text>
                  </View>
                ) : (
                  <FlatList
                    data={articles}
                    renderItem={renderItem}
                    keyExtractor={item => item._id}
                    initialNumToRender={10}
                    onEndReached={handleEndReached}
                    ListFooterComponent={articles.length > 10 ? renderFooter : null}
                    ListFooterComponentStyle={{ paddingVertical: 10 }}
                    refreshControl={
                      <RefreshControl
                        colors={["#fff"]}
                        onRefresh={onRefresh}
                        progressBackgroundColor="#000"
                        refreshing={refreshing}
                      />
                    }
                  />
                )}
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
