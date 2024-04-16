import { useFocusEffect } from '@react-navigation/native';
import React, { useCallback, useEffect, useState } from 'react';
import { ActivityIndicator, DeviceEventEmitter, FlatList, SafeAreaView, Text, View } from 'react-native';
import Toast from 'react-native-toast-message';
import CustomToast from '../../../../../components/CustomToast';
import { getStorage, setStorage } from '../../../../../hooks/useStorage';
import SunmiScanner from '../../../../../utils/sunmi/scanner';

const PickingSto = ({ navigation, route }) => {
  const { sto, picker, pickerId, packer, packerId } = route.params;
  const [isLoading, setIsLoading] = useState(false);
  const [serverError, setServerError] = useState('');
  const [barcode, setBarcode] = useState('');
  const [token, setToken] = useState('');
  let [articles, setArticles] = useState([]);
  const API_URL = 'https://shwapnooperation.onrender.com/';
  const { startScan, stopScan } = SunmiScanner;

  useEffect(() => {
    const getAsyncStorage = async () => {
      await getStorage('token', setToken, 'string');
      // await getStorage('user', setUser, 'object');
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
        body: JSON.stringify({ sto: sto }),
      })
        .then(response => response.json())
        .then(result => {
          if (result.status) {
            setArticles(result.data.items);
            setIsLoading(false);
            setServerError('');
          } else {
            setIsLoading(false);
            setServerError(result.message);
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

  useFocusEffect(
    useCallback(() => {
      if (token && sto) {
        fetchStoDetails();
      }
    }, [token, sto]),
  );

  const updateTrackingInfo = (article) => {
    let stoTrackingInfo;
    let articleTrackingInfo = {
      sto,
      inboundPicker: picker,
      inboundPickerId: pickerId,
      inboundPacker: packer,
      inboundPackerId: packerId,
      inboundPickingStartingTime: new Date(),
      status: 'inbound picking'
    };
    if (articles.length === 1) {
      stoTrackingInfo = {
        sto,
        picker,
        pickerId,
        packer,
        packerId,
        pickingEndingTime: new Date(),
        status: 'inbound picked',
      };
    } else {
      stoTrackingInfo = {
        sto,
        picker,
        pickerId,
        packer,
        packerId,
        pickingStartingTime: new Date(),
        status: 'inbound picking'
      };

    }
    setStorage('stoTrackingInfo', stoTrackingInfo);
    setStorage('articleTrackingInfo', articleTrackingInfo);
    navigation.push('PickingStoArticle', { ...article, ...stoTrackingInfo });
  };

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
              const article = articles.find(item => item.material === result.data.material);

              if (article && isValidBarcode) {
                // navigation.push('PickingStoArticle', article);
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
    <View
      key={index}
      className="flex-row items-center justify-between bg-white border border-tb rounded-lg mt-2.5 p-4"
    // style={{ elevation: 5 }}
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
        className="w-1/5 text-black text-sm text-center"
        numberOfLines={1}>
        {item.quantity}
      </Text>
    </View>
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
        <View className="screen-header flex-row items-center mb-4">
          <Text className="flex-1 text-lg text-sh text-center font-semibold capitalize">
            picking {' ' + sto}
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
              keyExtractor={item => item._id}
            />
          </View>
        </View>
      </View>
      <CustomToast />
    </SafeAreaView>
  );
};

export default PickingSto;
