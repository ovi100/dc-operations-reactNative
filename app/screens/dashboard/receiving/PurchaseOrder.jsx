import { useFocusEffect } from '@react-navigation/native';
import React, { useCallback, useEffect, useState } from 'react';
import {
  ActivityIndicator,
  DeviceEventEmitter, FlatList,
  RefreshControl,
  SafeAreaView, Text, TouchableHighlight, TouchableOpacity, View
} from 'react-native';
import Toast from 'react-native-toast-message';
import CustomToast from '../../../../components/CustomToast';
import Dialog from '../../../../components/Dialog';
import { ButtonLg, ButtonLoading } from '../../../../components/buttons';
import useActivity from '../../../../hooks/useActivity';
import useAppContext from '../../../../hooks/useAppContext';
import { getStorage, setStorage } from '../../../../hooks/useStorage';
import { toast } from '../../../../utils';
import SunmiScanner from '../../../../utils/sunmi/scanner';

const PurchaseOrder = ({ navigation, route }) => {
  const { po_id } = route.params;
  const { createActivity } = useActivity();
  const { startScan, stopScan } = SunmiScanner;
  const [isLoading, setIsLoading] = useState(false);
  const [refreshing, setRefreshing] = useState(false);
  const [isButtonLoading, setIsButtonLoading] = useState(false);
  const [dialogVisible, setDialogVisible] = useState(false);
  const [pressMode, setPressMode] = useState(false);
  const [barcode, setBarcode] = useState('');
  const [user, setUser] = useState({});
  const [token, setToken] = useState('');
  const [articles, setArticles] = useState([]);
  const tableHeader = ['Article Code', 'Article Name', 'Quantity'];
  const API_URL = 'https://shwapnooperation.onrender.com/';
  const { GRNInfo } = useAppContext();
  const { grnItems, setGrnItems, setIsUpdatingGrn } = GRNInfo;
  let GrnByPo = [];
  let remainingGrnItems = [];

  useEffect(() => {
    const getAsyncStorage = async () => {
      await getStorage('token', setToken);
      await getStorage('user', setUser, 'object');
      await getStorage('pressMode', setPressMode);
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

  const getPoDetails = async () => {
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
          const poItems = result.data.items;
          const historyItems = result.data.historyTotal;
          if (historyItems.length > 0) {
            let remainingPoItems = poItems.map(poItem => {
              const matchedItem = historyItems.find(
                historyItem => historyItem.material === poItem.material
              );
              if (matchedItem) {
                return {
                  ...poItem,
                  remainingQuantity: poItem.quantity - matchedItem.grnQuantity
                };
              } else {
                return {
                  ...poItem,
                  remainingQuantity: poItem.quantity
                };
              }
            }).filter(item => item.remainingQuantity !== 0);
            setArticles(remainingPoItems);
          }
          else {
            let poItems = result.data.items.map(item => {
              return {
                ...item,
                remainingQuantity: item.quantity
              };
            });
            setArticles(poItems);
          }
        } else {
          Toast.show({
            type: 'customError',
            text1: result.message,
          });
          if (result.message.trim() === 'MIS Logged Off the PC where BAPI is Hosted') {
            //log user activity
            await createActivity(user._id, 'error', result.message.trim());
          }
        }
      })
      .catch(error => {
        Toast.show({
          type: 'customError',
          text1: error.message,
        });
      });
  };

  const getPoInfo = async () => {
    const start = performance.now();
    setIsLoading(true);
    await getPoDetails();
    setIsLoading(false);
    const end = performance.now();
    const time = (end - start) / 1000
    toast(`Loading time: ${time.toFixed(2)} Seconds`);
  }

  useFocusEffect(
    useCallback(() => {
      if (token && po_id) {
        getPoInfo();
      }
    }, [token, po_id]),
  );

  const onRefresh = async () => {
    const start = performance.now();
    setRefreshing(true);
    await getPoDetails();
    setRefreshing(false);
    const end = performance.now();
    const time = (end - start) / 1000
    toast(`Refreshing time: ${time.toFixed(2)} Seconds`);
  };

  const renderItem = ({ item, index }) => (
    <>
      {pressMode === 'true' ? (
        <TouchableOpacity onPress={() => navigation.replace('PoArticle', item)}>
          <View
            key={index}
            className="flex-row items-center border border-tb rounded-lg mt-2.5 p-4"
          >
            <Text
              className="w-1/5 text-black"
              numberOfLines={1}>
              {item.material}
            </Text>
            <Text
              className="w-3/5 h-9 leading-9 text-black text-center"
              numberOfLines={2}>
              {item.description}
            </Text>
            <Text
              className="w-1/5 text-black text-center"
              numberOfLines={1}>
              {item.remainingQuantity}
            </Text>
          </View>
        </TouchableOpacity>
      ) : (
        <View
          key={index}
          className="flex-row items-center border border-tb rounded-lg mt-2.5 p-4"
        >
          <Text
            className="w-1/5 text-black text-left"
            numberOfLines={1}>
            {item.material}
          </Text>
          <Text
            className="w-3/5 h-9 leading-9 text-black text-center"
            numberOfLines={2}>
            {item.description}
          </Text>
          <Text
            className="w-1/5 text-black text-right"
            numberOfLines={1}>
            {item.remainingQuantity}
          </Text>
        </View>
      )}
    </>
  );

  if (barcode !== '' && (pressMode === 'false' || pressMode === null)) {
    const getArticleBarcode = async (barcode) => {
      try {
        await fetch(' https://api.shwapno.net/shelvesu/api/barcodes/barcode/' + barcode, {
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
              const poItem = articles.find(item => item.material === result.data.material);

              if (poItem && isValidBarcode) {
                navigation.replace('PoArticle', poItem);
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
          text1: 'Unable to fetch data',
        });
      }
    };
    getArticleBarcode(barcode);
  }

  if (grnItems) {
    remainingGrnItems = grnItems.filter(grnItem => grnItem.po !== po_id);
    GrnByPo = grnItems.filter(grnItem => grnItem.po === po_id);
  }

  const generateGRN = async (grnList) => {
    setDialogVisible(false);
    setIsButtonLoading(true);

    let postData = {
      po: po_id,
      status: 'pending for grn',
      createdBy: user._id,
      grnData: grnList
    };

    try {
      await fetch(API_URL + 'api/grn/pending-for-grn', {
        method: 'POST',
        headers: {
          authorization: token,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(postData),
      })
        .then(response => response.json())
        .then(async result => {
          if (result.status) {
            Toast.show({
              type: 'customSuccess',
              text1: result.message,
            });
            setStorage('grnItems', remainingGrnItems);
            setGrnItems(remainingGrnItems);
            setIsUpdatingGrn(true);
            //log user activity
            await createActivity(
              user._id,
              'grn_request',
              `${user.name} send request for grn with document ${po_id}`,
            );
            setIsButtonLoading(false);

          } else {
            Toast.show({
              type: 'customError',
              text1: result.message,
            });
            setIsButtonLoading(false);
          }
        })
        .catch(error => {
          Toast.show({
            type: 'customError',
            text1: error.message,
          });
          setIsButtonLoading(false);
        });
    } catch (error) {
      Toast.show({
        type: 'customError',
        text1: error.message,
      });
      setIsButtonLoading(false);
    }
  }

  if (isLoading) {
    return (
      <View className="w-full h-screen justify-center px-3">
        <ActivityIndicator size="large" color="#EB4B50" />
        <Text className="mt-4 text-gray-400 text-base text-center">Loading po articles. Please wait......</Text>
      </View>
    )
  }

  return (
    <SafeAreaView className="flex-1 bg-white pt-8">
      <View className="flex-1 h-full px-4">
        <View className="screen-header flex-row items-center justify-center mb-4">
          {pressMode === 'true' ? (
            <TouchableHighlight onPress={() => null}>
              <Text className="text-lg text-sh font-semibold uppercase">
                po {po_id}
              </Text>
            </TouchableHighlight>
          ) : (
            <Text className="text-lg text-sh font-semibold uppercase">
              po {po_id}
            </Text>
          )}
        </View>
        <View className="content">
          <>
            <View className={`table ${GrnByPo.length > 0 ? 'h-[80vh]' : 'h-[92vh]'}`}>
              <View className="flex-row justify-between bg-th text-center mb-2 p-2">
                {tableHeader.map(th => (
                  <Text className="text-white text-center font-bold" key={th}>
                    {th}
                  </Text>
                ))}
              </View>
              {!isLoading && articles.length === 0 ? (
                <Text className="text-black text-lg text-center font-bold mt-5">
                  No articles left to receive
                </Text>
              ) : (
                <FlatList
                  data={articles}
                  renderItem={renderItem}
                  keyExtractor={item => item.material}
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
              )}

            </View>
            {Boolean(GrnByPo.length) && (
              <View className="button mt-5">
                {isButtonLoading ? <ButtonLoading styles='bg-theme rounded-md p-5' /> :
                  <ButtonLg
                    title="Generate GRN"
                    onPress={() => setDialogVisible(true)}
                  />
                }
              </View>
            )}
          </>
        </View>
      </View>
      <CustomToast />
      <Dialog
        isOpen={dialogVisible}
        modalHeader="Are you sure?"
        modalSubHeader="GRN will be generated"
        onClose={() => setDialogVisible(false)}
        onSubmit={() => generateGRN(GrnByPo)}
        leftButtonText="cancel"
        rightButtonText="proceed"
      />
    </SafeAreaView >
  );
};

export default PurchaseOrder;