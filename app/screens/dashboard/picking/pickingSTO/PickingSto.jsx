import { useFocusEffect } from '@react-navigation/native';
import React, { useCallback, useEffect, useState } from 'react';
import { ActivityIndicator, DeviceEventEmitter, FlatList, SafeAreaView, Text, TouchableOpacity, View } from 'react-native';
import Toast from 'react-native-toast-message';
import CustomToast from '../../../../../components/CustomToast';
import ServerError from '../../../../../components/animations/ServerError';
import { getStorage } from '../../../../../hooks/useStorage';
import SunmiScanner from '../../../../../utils/sunmi/scanner';
import useAppContext from '../../../../../hooks/useAppContext';

const PickingSto = ({ navigation, route }) => {
  const { sto, picker, pickerId, packer, packerId } = route.params;
  const [isLoading, setIsLoading] = useState(false);
  const [pressMode, setPressMode] = useState(false);
  const [barcode, setBarcode] = useState('');
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
      await getStorage('pressMode', setPressMode);
      await getStorage('stoTrackingInfo', setStoTrackingInfo, 'object');
    }
    getAsyncStorage();
  }, [navigation.isFocused()]);

  console.log('sto tracking AS info', stoTrackingInfo);

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

  const fetchStoDetails = async () => {
    try {
      setIsLoading(true);
      await fetch(API_URL + 'bapi/sto/display', {
        method: 'POST',
        headers: {
          authorization: token,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ sto }),
      })
        .then(response => response.json())
        .then(result => {
          if (result.status) {
            const stoData = result.data.items;
            setArticles(stoData);
            addToTotalSku({ sto, totalSku: stoData.length });
            setIsLoading(false);
          } else {
            setIsLoading(false);
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

  useFocusEffect(
    useCallback(() => {
      if (token && sto) {
        fetchStoDetails();
      }
    }, [token, sto]),
  );

  const goToStoArticle = async (article) => {
    navigation.push('PickingStoArticle', { ...article, picker, pickerId, packer, packerId });
  };

  if (barcode !== '') {
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
            className="flex-row items-center justify-between bg-white border border-tb rounded-lg mt-2.5 p-4"
          >
            <Text
              className="w-1/5 text-black text-sm text-center"
              numberOfLines={1}>
              {item.material}
            </Text>
            <Text
              className="w-3/5 text-black text-sm text-center"
              numberOfLines={1}>
              {item.description}
            </Text>
            <Text
              className="w-1/5 text-black text-sm text-center pl-5"
              numberOfLines={1}>
              {item.quantity}
            </Text>
          </View>
        </TouchableOpacity>
      ) : (
        <View
          key={index}
          className="flex-row items-center justify-between bg-white border border-tb rounded-lg mt-2.5 p-4"
        >
          <Text
            className="w-1/5 text-black text-sm text-center"
            numberOfLines={1}>
            {item.material}
          </Text>
          <Text
            className="w-3/5 text-black text-sm text-center"
            numberOfLines={1}>
            {item.description}
          </Text>
          <Text
            className="w-1/5 text-black text-sm text-center pl-5"
            numberOfLines={1}>
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
      </View>
    )
  }

  console.log('articles length', articles.length);

  return (
    <SafeAreaView className="flex-1 bg-white pt-8">
      <View className="flex-1 h-full px-2">
        <View className="screen-header flex-row items-center mb-4">
          <Text className="flex-1 text-lg text-sh text-center font-semibold">
            Picking STO  {sto}
          </Text>
        </View>
        <View className="content flex-1 justify-around mt-5 mb-6">
          <View className="table h-full pb-2">
            <View className="flex-row bg-th text-center mb-2 py-2">
              <Text className="w-1/5 text-white text-sm text-center font-bold">
                Article ID
              </Text>
              <Text className="w-3/5 text-white text-sm text-center font-bold">
                Article Name
              </Text>
              <Text className="w-1/5 text-white text-sm text-center font-bold">
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
