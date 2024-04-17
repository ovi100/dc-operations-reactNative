import { useFocusEffect } from '@react-navigation/native';
import React, { useCallback, useEffect, useState } from 'react';
import { ActivityIndicator, DeviceEventEmitter, FlatList, SafeAreaView, Text, View } from 'react-native';
import Toast from 'react-native-toast-message';
import CustomToast from '../../../../../components/CustomToast';
import { getStorage } from '../../../../../hooks/useStorage';
import SunmiScanner from '../../../../../utils/sunmi/scanner';

const PickingSto = ({ navigation, route }) => {
  const { sto, picker, pickerId, packer, packerId } = route.params;
  const [isLoading, setIsLoading] = useState(false);
  // const [isTracking, setIsTracking] = useState(false);
  const [isFirstItem, setIsFirstItem] = useState(true);
  // const [countSKU, setCountSKU] = useState(1);
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

  const addToArticleTracking = async (article) => {
    let postData = {
      sto,
      code: article.material,
      quantity: article.quantity,
      name: article.description,
      picker,
      pickerId,
      packer,
      packerId,
      pickingStartingTime: new Date(),
      status: 'inbound picking',
    };

    try {
      await fetch(API_URL + 'api/article-tracking', {
        method: 'POST',
        headers: {
          authorization: token,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(postData),
      })
        .then(response => response.json())
        .then(result => {
          console.log('article post tracking response', result)
          Toast.show({
            type: 'customInfo',
            text1: result.message,
          });
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
  }

  const updateStoTracking = async (updateInfo) => {
    try {
      await fetch(API_URL + 'api/sto-tracking/update', {
        method: 'PATCH',
        headers: {
          authorization: token,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(updateInfo),
      })
        .then(response => response.json())
        .then(data => {
          if (data.status) {
            console.log('updating sto tracking', data);
            Toast.show({
              type: 'customSuccess',
              text1: result.message,
            });
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
    } Toast.show({
      type: 'customError',
      text1: error.message,
    });
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
                let countSKU = 1;
                if (isFirstItem) {
                  let stoTrackingInfo = {
                    sto,
                    picker,
                    pickerId,
                    packer,
                    packerId,
                    pickingStartingTime: new Date(),
                    status: 'inbound picking'
                  };
                  updateStoTracking(stoTrackingInfo);
                }

                if (articles.length === 1) {
                  let stoTrackingInfo = {
                    sto,
                    picker,
                    pickerId,
                    packer,
                    packerId,
                    pickedSku: countSKU,
                    pickingEndingTime: new Date(),
                    status: 'inbound picked',
                  };
                  updateStoTracking(stoTrackingInfo);
                }
                addToArticleTracking(article);
                setIsFirstItem(false);
                navigation.replace('PickingStoArticle', { ...article, picker, pickerId, packer, packerId });
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
      // setIsTracking(false);
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

  // if (isTracking) {
  //   return (
  //     <View className="w-full h-screen justify-center px-3">
  //       <ActivityIndicator size="large" color="#EB4B50" />
  //       <Text className="mt-4 text-gray-400 text-base text-center">Loading article details. Please wait......</Text>
  //     </View>
  //   )
  // }

  console.log('articles length', articles.length);

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
