import { useFocusEffect } from '@react-navigation/native';
import React, { useCallback, useEffect, useState } from 'react';
import {
  ActivityIndicator, Alert,
  DeviceEventEmitter,
  FlatList, SafeAreaView, Text,
  View
} from 'react-native';
import { ButtonLg, ButtonLoading } from '../../../../components/buttons';
import useAppContext from '../../../../hooks/useAppContext';
import { getStorage } from '../../../../hooks/useStorage';
import { toast } from '../../../../utils';
import SunmiScanner from '../../../../utils/sunmi/scanner';

const PurchaseOrder = ({ navigation, route }) => {
  const { startScan, stopScan } = SunmiScanner;
  const [isLoading, setIsLoading] = useState(false);
  const [isButtonLoading, setIsButtonLoading] = useState(false);
  const [barcode, setBarcode] = useState('');
  const [scanArticle, setScanArticle] = useState({});
  const [token, setToken] = useState('');
  const [articles, setArticles] = useState([]);
  const tableHeader = ['Article ID', 'Article Name', 'Quantity'];
  const API_URL = 'https://shwapnooperation.onrender.com/';
  const { po_id } = route.params;
  const { GRNInfo } = useAppContext();
  const { grnItems, setGrnItems } = GRNInfo;

  useEffect(() => {
    getStorage('token', setToken, 'string');
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

  // const getArticleBarcode = async (barcode) => {
  //   const response = await fetch('https://shelves-backend-1.onrender.com/api/barcodes/material/' + barcode);
  //   const result = await response.json();
  //   const material = JSON.parse(result.data.material)
  //   console.log("Material from API ", typeof material, material)
  //   return material;
  // }

  const getArticleBarcode = async (barcode) => {
    try {
      const response = await fetch('https://shelves-backend-1.onrender.com/api/barcodes/material/' + barcode);

      if (!response.ok) {
        throw new Error('Network response was not ok');
      }
      const result = await response.json();

      if (!result.status) {
        throw new Error('API request failed');
      }
      setScanArticle(result.data);
    } catch (error) {
      console.error('Error fetching data:', error);
      throw error; // Rethrow the error for the caller to handle
    }
  };


  const getPoList = async () => {
    setIsLoading(true);
    await fetch(API_URL + 'bapi/po/display', {
      method: 'POST',
      headers: {
        authorization: token,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ po: po_id }),
    })
      .then(response => response.json())
      .then(async result => {
        if (result.status) {
          await fetch(API_URL + 'api/product-shelving/ready',
            {
              method: 'GET',
              headers: {
                authorization: token,
              },
            },
          )
            .then(res => res.json())
            .then(async shelveData => {
              if (shelveData.status) {
                const poItems = result.data.items;
                const shItems = shelveData.items;
                let remainingPoItems = poItems.filter(
                  poItem =>
                    !shItems.some(
                      shItem =>
                        shItem.po === poItem.po &&
                        shItem.code === poItem.material
                    )
                );
                setArticles(remainingPoItems);
                setIsLoading(false);
              }
              else {
                let poItems = result.data.items;
                setArticles(poItems);
                setIsLoading(false);
              }
            })
            .catch(error => {
              toast(error.message);
            });
        } else {
          setIsLoading(false);
          toast(result.message);
        }
      })
      .catch(error => {
        toast(error.message);
      });
  };

  useFocusEffect(
    useCallback(() => {
      if (token && po_id) {
        getPoList();
      }
    }, [token, po_id]),
  );


  const renderItem = ({ item, index }) => (
    <View
      key={index}
      className="flex-row border border-tb rounded-lg mt-2.5 p-4"
    >
      <Text
        className="flex-1 text-black text-center"
        numberOfLines={1}>
        {item.material}
      </Text>
      <Text
        className="flex-1 text-black text-center"
        numberOfLines={1}>
        {item.description}
      </Text>
      <Text
        className="flex-1 text-black text-center"
        numberOfLines={1}>
        {item.quantity}
      </Text>
    </View>
  );

  if (barcode !== '') {
    getArticleBarcode(barcode);
    const poItem = articles.find(item => item.material === scanArticle.material);
    console.log('Merge item', { ...poItem, barcode: scanArticle.barcodes });
    if (poItem) {
      navigation.replace('PoArticle', { ...poItem });
      setBarcode('');
    } else {
      toast('Article not found!');
      setBarcode('');
    }
  }

  const GRNByPo = grnItems.filter(grnItem => grnItem.po == po_id);

  const createGRN = async (grnList) => {
    setIsButtonLoading(true);
    try {
      await fetch(API_URL + 'bapi/grn/from-po/create', {
        method: 'POST',
        headers: {
          authorization: token,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(grnList),
      })
        .then(response => response.json())
        .then(async result => {
          if (result.status) {
            await fetch(API_URL + 'api/po-tracking', {
              method: 'PATCH',
              headers: {
                authorization: token,
                'Content-Type': 'application/json',
              },
              body: JSON.stringify({
                po: po_id,
                status: "pending for release"
              }),
            })
              .then(response => response.json())
              .then(data => {
                setGrnItems([]);
                toast(data.message);
                setIsButtonLoading(false);
                navigation.goBack();
              })
              .catch(error => {
                toast(error.message);
                setIsButtonLoading(false);
              });
          } else {
            toast(result.message);
            setIsButtonLoading(false);
          }
        })
        .catch(error => {
          toast(error.message);
          setIsButtonLoading(false);
        });
    } catch (error) {
      toast(error.message);
      setIsButtonLoading(false);
    }
  }

  const postGRN = () => {
    Alert.alert('Are you sure?', 'GRN will be created', [
      {
        text: 'Cancel',
        onPress: () => null,
        style: 'cancel',
      },
      { text: 'OK', onPress: () => createGRN(GRNByPo) },
    ]);
  }

  if (isLoading) {
    return (
      <View className="w-full h-screen justify-center px-3">
        <ActivityIndicator size="large" color="#EB4B50" />
        <Text className="mt-4 text-gray-400 text-base text-center">Loading po articles. Please wait......</Text>
      </View>
    )
  }

  if (articles.length === 0 && GRNByPo.length === 0) {
    return (
      <View className="w-full h-4/5 justify-center px-3">
        <Text className="text-blue-800 text-lg text-center font-semibold font-mono mt-5">
          PO {po_id} is waiting for release
        </Text>
      </View>
    )
  }

  // console.log('Initial GRN list', initialGrnItems, initialGrnItems.length);
  // console.log('Actual GRN list', grnItems, grnItems.length);
  // console.log('GRN by po list', GRNByPo, GRNByPo.length);

  return (
    <SafeAreaView className="flex-1 bg-white pt-8">
      <View className="flex-1 h-full px-4">
        <View className="screen-header flex-row items-center justify-center mb-4">
          <Text className="text-lg text-sh font-semibold uppercase">
            po {po_id}
          </Text>
        </View>
        <View className="content">
          <>
            <View className={`table ${GRNByPo.length > 0 ? 'h-[70vh]' : 'h-[80vh]'}`}>
              <View className="flex-row bg-th text-center mb-2 py-2">
                {tableHeader.map(th => (
                  <Text className="flex-1 text-white text-center font-bold" key={th}>
                    {th}
                  </Text>
                ))}
              </View>
              {articles.length === 0 && GRNByPo.length > 0 ? (
                <Text className="text-black text-lg text-center font-bold mt-5">
                  No articles left to receive
                </Text>
              ) : (
                <FlatList
                  data={articles}
                  renderItem={renderItem}
                  keyExtractor={item => item.material}
                  initialNumToRender={15}
                />
              )}

            </View>
            {Boolean(GRNByPo.length) && (
              <View className="button">
                {isButtonLoading ? <ButtonLoading styles='bg-theme rounded-md p-5' /> :
                  <ButtonLg
                    title="Create GRN"
                    onPress={() => postGRN()}
                  />
                }
              </View>
            )}
          </>
        </View>
      </View>
    </SafeAreaView >
  );
};

export default PurchaseOrder;