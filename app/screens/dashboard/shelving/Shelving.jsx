import { useFocusEffect, useIsFocused } from '@react-navigation/native';
import React, { useCallback, useEffect, useState } from 'react';
import {
  ActivityIndicator,
  DeviceEventEmitter,
  FlatList,
  SafeAreaView,
  Text,
  View
} from 'react-native';
import { getStorage } from '../../../../hooks/useStorage';
import { toast } from '../../../../utils';
import SunmiScanner from '../../../../utils/sunmi/scanner';

const Shelving = ({ navigation }) => {
  const isFocused = useIsFocused();
  const [isLoading, setIsLoading] = useState(false);
  const [token, setToken] = useState('');
  const [barcode, setBarcode] = useState('');
  let [articles, setArticles] = useState([]);
  const [page, setPage] = useState(1);
  const [totalPage, setTotalPage] = useState(0);
  const tableHeader = ['Article ID', 'BIN ID', 'Quantity'];
  const API_URL = 'https://shwapnooperation.onrender.com/api/product-shelving/';
  const { startScan, stopScan } = SunmiScanner;

  useEffect(() => {
    getStorage('token', setToken, 'string');
  }, []);

  useEffect(() => {
    startScan();
    DeviceEventEmitter.addListener('ScanDataReceived', data => {
      console.log(data.code);
      setBarcode(data.code);
    });

    return () => {
      stopScan();
      DeviceEventEmitter.removeAllListeners('ScanDataReceived');
    };
  }, [isFocused]);

  const getShelvingReady = async () => {
    try {
      setIsLoading(true);
      await fetch(API_URL + 'ready' + `?currentPage=${page}`, {
        method: 'GET',
        headers: {
          authorization: token,
        },
      })
        .then(response => response.json())
        .then(async readyData => {
          if (readyData.status) {
            await fetch(API_URL + 'in-shelf', {
              method: 'GET',
              headers: {
                authorization: token,
              },
            })
              .then(res => res.json())
              .then(inShelfData => {
                if (inShelfData.status) {
                  const readyItems = readyData.items;
                  const inShelfItems = inShelfData.items;
                  let remainingShelvingItems = readyItems.filter(
                    readyItem =>
                      !inShelfItems.some(
                        inShelfItem =>
                          inShelfItem.po === readyItem.po &&
                          inShelfItem.code === readyItem.code,
                      ),
                  );
                  setArticles([...articles, ...remainingShelvingItems]);
                  setTotalPage(readyData.totalPages);
                  setIsLoading(false);
                } else {
                  const readyItems = readyData.items;
                  setArticles([...articles, ...readyItems]);
                  setTotalPage(readyData.totalPages);
                  setIsLoading(false);
                }
              })
              .catch(error => toast(error.message));
          }
        })
        .catch(error => toast(error.message));
    } catch (error) {
      toast(error.message);
      setIsLoading(false);
    }
  };

  useFocusEffect(
    useCallback(() => {
      if (token) {
        getShelvingReady();
      }
    }, [token, page]),
  );

  const loadMoreItem = () => {
    if (totalPage >= page) {
      setPage(prev => prev + 1);
    } else {
      setIsLoading(false);
    }
  };

  if (barcode !== '') {
    const article = articles.find(item => item.barcode === barcode);
    if (article) {
      navigation.navigate('BinDetails', article);
      setBarcode('');
    } else {
      toast('Article not found!');
      setBarcode('');
    }
  }

  const renderItem = ({ item, index }) => (
    <View
      key={index}
      className="flex-row items-center border border-tb rounded-lg mt-2.5 p-3">
      <View className="flex-1">
        <Text className="text-xs text-black" numberOfLines={1}>
          {item.code}
        </Text>
        <Text className="text-black text-base mt-1" numberOfLines={1}>
          {item.description}
        </Text>
      </View>
      <View>
        {item.bins.length ? (
          <>
            {item.bins.map((bin, i) => (
              <Text
                key={i}
                className="flex-1 text-black text-center mb-1 last:mb-0"
                numberOfLines={1}>
                {bin.bin_id}
              </Text>
            ))}
          </>
        ) : (<Text>No bins found!</Text>)}
      </View>
      <Text className="flex-1 text-black text-center" numberOfLines={1}>
        {item.receivedQuantity}
      </Text>
    </View>
  );

  if (isLoading && articles.length === 0) {
    return (
      <View className="w-full h-4/5 justify-center px-3">
        <ActivityIndicator size="large" color="#0000ff" />
      </View>
    )
  }

  if (articles.length === 0) {
    return (
      <View className="h-full justify-center pb-2">
        <Text className="text-base font-bold text-center">
          No product is ready for shelving!
        </Text>
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
            <View className="flex-row bg-th mb-2 py-2">
              {tableHeader.map(th => (
                <Text
                  className="flex-1 text-white text-center font-bold"
                  key={th}>
                  {th}
                </Text>
              ))}
            </View>

            <FlatList
              data={articles}
              renderItem={renderItem}
              keyExtractor={item => item._id}
              onEndReached={loadMoreItem}
              ListFooterComponent={isLoading && <ActivityIndicator />}
              onEndReachedThreshold={0}
            />
          </View>
        </View>
      </View>
    </SafeAreaView>
  );
};

export default Shelving;
