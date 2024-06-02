import { useFocusEffect } from '@react-navigation/native';
import React, { useCallback, useEffect, useState } from 'react';
import {
  ActivityIndicator,
  DeviceEventEmitter, FlatList,
  RefreshControl,
  SafeAreaView, ScrollView, Text, TouchableHighlight,
  TouchableOpacity,
  TouchableWithoutFeedback,
  View
} from 'react-native';
import Toast from 'react-native-toast-message';
import CustomToast from '../../../../components/CustomToast';
import Dialog from '../../../../components/Dialog';
import Modal from '../../../../components/Modal';
import { ButtonLg, ButtonLoading } from '../../../../components/buttons';
import useActivity from '../../../../hooks/useActivity';
import useAppContext from '../../../../hooks/useAppContext';
import useBackHandler from '../../../../hooks/useBackHandler';
import { getStorage, setStorage } from '../../../../hooks/useStorage';
import { toast } from '../../../../utils';
import SunmiScanner from '../../../../utils/sunmi/scanner';

const PurchaseOrder = ({ navigation, route }) => {
  const { po } = route.params;
  const { createActivity } = useActivity();
  const { startScan, stopScan } = SunmiScanner;
  const [isLoading, setIsLoading] = useState(false);
  const [refreshing, setRefreshing] = useState(false);
  const [isButtonLoading, setIsButtonLoading] = useState(false);
  const [grnModal, setGrnModal] = useState(false);
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
  let grnPostItems = [], remainingGrnItems = [], grnSummery = {};

  // Custom hook to navigate screen
  useBackHandler('Receiving');

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
    const getOptions = {
      method: 'GET',
      headers: {
        authorization: token,
      }
    };
    const postOptions = {
      method: 'POST',
      headers: {
        authorization: token,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ po }),
    };
    const shelvingFetch = fetch(API_URL + `api/product-shelving?filterBy=po&value=${po}&pageSize=500`, getOptions);
    const poFetch = fetch(API_URL + 'bapi/po/display', postOptions);
    try {
      // Fetch data from both APIs simultaneously
      const [shelvingResponse, poResponse] = await Promise.all([shelvingFetch, poFetch]);

      // Check if both fetch requests were successful
      if (!shelvingResponse.ok || !poResponse.ok) {
        Toast.show({
          type: 'customError',
          text1: "Failed to fetch data from APIs",
        });
      }

      // Parse the JSON data from the responses
      const shelvingData = await shelvingResponse.json();
      const poData = await poResponse.json();

      const poItem = poData.data.items[0];
      if (poItem.receivingPlant !== user.site) {
        Toast.show({
          type: 'customError',
          text1: 'Not authorized to receive PO',
        });
        return;
      }

      let shelvingItems = shelvingData.items;
      // console.log('shelving items', JSON.stringify(shelvingItems));
      if (shelvingItems.length > 0) {
        shelvingItems = shelvingItems.map(item => {
          if (item.inShelf.length > 0) {
            return {
              ...item,
              receivedQuantity: item.receivedQuantity - item.inShelf.reduce((acc, item) => acc + item.quantity, 0)
            }
          } else {
            return {
              ...item,
              receivedQuantity: item.receivedQuantity
            }
          }
        });
      }

      let poItems = poData.data.items;
      const historyItems = poData.data.historyTotal;

      if (historyItems.length > 0) {
        poItems = poItems.map(poItem => {
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
      }
      else {
        poItems = poItems.map(item => {
          return {
            ...item,
            remainingQuantity: item.quantity
          };
        });
      }

      let adjustedArticles = poItems.map(poItem => {
        const matchedItem = shelvingItems.find(
          shItem => shItem.code === poItem.material
        );
        if (matchedItem) {
          return {
            ...poItem,
            remainingQuantity: poItem.quantity - matchedItem.receivedQuantity
          };
        } else {
          return {
            ...poItem,
            remainingQuantity: poItem.quantity
          };
        }
      }).filter(item => item.remainingQuantity !== 0);
      setArticles(adjustedArticles);
    } catch (error) {
      Toast.show({
        type: 'customError',
        text1: error.message,
      });
    }
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
      if (token && po && user.site) {
        getPoInfo();
      }
    }, [token, po, user.site]),
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
    remainingGrnItems = grnItems.filter(grnItem => grnItem.po !== po);
    grnPostItems = grnItems.filter(grnItem => grnItem.po === po);
  }

  // console.log('grnPostItems', grnPostItems);

  // const demoGrnItems = [
  //   { material: 1, netPrice: 22.5, quantity: 10 },
  //   { material: 2, netPrice: 15, quantity: 12 },
  //   { material: 3, netPrice: 54, quantity: 15 },
  //   { material: 4, netPrice: 22.5, quantity: 10 },
  //   { material: 5, netPrice: 15, quantity: 12 },
  //   { material: 6, netPrice: 54, quantity: 15 },
  //   { material: 7, netPrice: 22.5, quantity: 10 },
  //   { material: 8, netPrice: 15, quantity: 12 },
  //   { material: 9, netPrice: 54, quantity: 15 },
  //   { material: 10, netPrice: 22.5, quantity: 10 },
  //   { material: 11, netPrice: 15, quantity: 12 },
  //   { material: 12, netPrice: 54, quantity: 15 },
  // ];

  grnSummery = grnPostItems.reduce(
    (acc, curr, i) => {
      acc.totalItems = i + 1;
      acc.totalPrice += curr.quantity * curr.netPrice;
      return acc;
    },
    { totalItems: 0, totalPrice: 0 }
  );


  const generateGRN = async (grnList) => {
    setDialogVisible(false);
    setGrnModal(false);
    setIsButtonLoading(true);

    let postData = {
      po: po,
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
              `${user.name} send request for grn with document ${po}`,
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
                po {po}
              </Text>
            </TouchableHighlight>
          ) : (
            <Text className="text-lg text-sh font-semibold uppercase">
              po {po}
            </Text>
          )}
        </View>
        <View className="content flex-1 justify-between pb-2">
          <View className="table">
            <View className="table-header flex-row justify-between bg-th text-center mb-2 p-2">
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
          {Boolean(grnPostItems.length) && (
            <View className="button">
              {isButtonLoading ? <ButtonLoading styles='bg-theme rounded-md p-5' /> :
                <ButtonLg
                  title="Generate GRN"
                  onPress={() => setGrnModal(true)}
                />
              }
            </View>
          )}
        </View>
      </View>
      <Modal
        isOpen={grnModal}
        modalHeader="Review GRN"
        onPress={() => setGrnModal(false)}
      >
        <View className="content h-auto max-h-[85%]">
          <View className="grn-list mt-3 pb-3">
            {grnPostItems.length > 0 ? (
              <>
                <View className="bg-th flex-row items-center justify-between p-2">
                  <Text className="text-white">Article Code</Text>
                  <Text className="text-white">Unit Price(৳)</Text>
                  <Text className="text-white">Quantity</Text>
                  <Text className="text-white">Total Price(৳)</Text>
                </View>
                <ScrollView className="max-h-full">
                  {grnPostItems.map((item) => (
                    <View className="bg-gray-100 flex-row items-center justify-between mt-1 p-2.5" key={item.material}>
                      <Text className="text-sh">{item.material}</Text>
                      <Text className="text-sh">{item.netPrice}</Text>
                      <Text className="text-sh">{item.quantity}</Text>
                      <Text className="text-sh">{item.netPrice * item.quantity}</Text>
                    </View>
                  ))}
                </ScrollView>
                <View className="flex-row items-center justify-between mt-2 px-2">
                  <View className="flex-row items-center justify-between mt-2">
                    <Text className="text-black font-bold">Total Items:</Text>
                    <Text className="text-black ml-1">{grnSummery.totalItems}</Text>
                  </View>
                  <View className="flex-row items-center justify-between mt-2">
                    <Text className="text-black font-bold">Total Price:</Text>
                    <Text className="text-black ml-1">{grnSummery.totalPrice}</Text>
                  </View>
                </View>
                <View className="button w-1/3 mx-auto mt-5">
                  <TouchableWithoutFeedback onPress={() => setDialogVisible(true)}>
                    <Text className="bg-blue-600 text-white text-lg text-center rounded p-2 capitalize">confirm</Text>
                  </TouchableWithoutFeedback>
                </View>
              </>
            ) : (
              <View className="outlet">
                <Text className="text-black text-center">No items ready for GRN</Text>
              </View>
            )}
          </View>
        </View>
      </Modal>
      <Dialog
        isOpen={dialogVisible}
        modalHeader="Are you sure?"
        modalSubHeader="GRN will be generated"
        onClose={() => setDialogVisible(false)}
        onSubmit={() => generateGRN(grnPostItems)}
        leftButtonText="cancel"
        rightButtonText="proceed"
      />
      <CustomToast />
    </SafeAreaView >
  );
};

export default PurchaseOrder;