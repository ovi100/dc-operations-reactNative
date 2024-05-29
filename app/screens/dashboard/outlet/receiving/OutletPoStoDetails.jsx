import { useFocusEffect } from '@react-navigation/native';
import React, { useCallback, useEffect, useState } from 'react';
import {
  ActivityIndicator, DeviceEventEmitter, FlatList,
  RefreshControl, SafeAreaView,
  ScrollView,
  Text, TouchableHighlight,
  TouchableOpacity,
  TouchableWithoutFeedback,
  View
} from 'react-native';
import Toast from 'react-native-toast-message';
import CustomToast from '../../../../../components/CustomToast';
import Dialog from '../../../../../components/Dialog';
import Modal from '../../../../../components/Modal';
import { ButtonLg, ButtonLoading } from '../../../../../components/buttons';
import useAppContext from '../../../../../hooks/useAppContext';
import useBackHandler from '../../../../../hooks/useBackHandler';
import { getStorage, setStorage } from '../../../../../hooks/useStorage';
import SunmiScanner from '../../../../../utils/sunmi/scanner';

const OutletPoStoDetails = ({ navigation, route }) => {
  const { po, dn, sto } = route.params;
  const { startScan, stopScan } = SunmiScanner;
  const [isLoading, setIsLoading] = useState(false);
  const [refreshing, setRefreshing] = useState(false);
  const [isButtonLoading, setIsButtonLoading] = useState(false);
  const [grnModal, setGrnModal] = useState(false);
  const [dialogVisible, setDialogVisible] = useState(false);
  const [reportDialogVisible, setReportDialogVisible] = useState(false);
  const [pressMode, setPressMode] = useState(false);
  const [barcode, setBarcode] = useState('');
  const [user, setUser] = useState({});
  const [token, setToken] = useState('');
  const [articles, setArticles] = useState([]);
  const [reportArticle, setReportArticle] = useState({});
  const [reportText, setReportText] = useState('');
  const tableHeader = ['Article Code', 'Quantity', 'Action'];
  const API_URL = 'https://shwapnooperation.onrender.com/';
  const { GRNInfo } = useAppContext();
  const { grnItems, setGrnItems, setIsUpdatingGrn } = GRNInfo;
  let GrnByPo = [];
  let remainingGrnItems = [];

  // Custom hook to navigate screen
  useBackHandler('OutletReceiving');

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
    const readyFetch = fetch(API_URL + `api/product-shelving/ready?filterBy=site&value=${user.site}&pageSize=500`, getOptions);
    const partialFetch = fetch(API_URL + `api/product-shelving/partially-in-shelf?filterBy=site&value=${user.site}&pageSize=500`, getOptions);
    const inShelfFetch = fetch(API_URL + `api/product-shelving/in-shelf?filterBy=site&value=${user.site}&pageSize=500`, getOptions);
    const poFetch = fetch(API_URL + 'bapi/po/display', postOptions);
    try {
      // Fetch data from both APIs simultaneously
      const [readyResponse, partialResponse, inShelfResponse, poResponse] = await Promise.all([readyFetch, partialFetch, inShelfFetch, poFetch]);

      // Check if both fetch requests were successful
      if (!readyResponse.ok || !partialResponse.ok || !inShelfResponse.ok || !poResponse.ok) {
        Toast.show({
          type: 'customError',
          text1: "Failed to fetch data from APIs",
        });
      }

      // Parse the JSON data from the responses
      const readyData = await readyResponse.json();
      const partialData = await partialResponse.json();
      const inShelfData = await inShelfResponse.json();
      const poData = await poResponse.json();

      const poItem = poData.items[0];
      if (poItem.receivingPlant !== user.site) {
        Toast.show({
          type: 'customError',
          text1: 'Not authorized to receive PO',
        });
        return;
      }

      const readyItems = readyData.items;
      const partialItems = partialData.items.map(item => {
        return {
          ...item,
          receivedQuantity: item.receivedQuantity - item.inShelf.reduce((acc, item) => acc + item.quantity, 0)
        }
      });
      const inShelfItems = inShelfData.items;

      const shelvingItems = [...readyItems, ...partialItems, ...inShelfItems];

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
    setIsLoading(true);
    await getPoDetails();
    setIsLoading(false);
  }

  const getDnDetails = async () => {
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
      body: JSON.stringify({ dn }),
    };
    const shelvingFetch = fetch(API_URL + `api/product-shelving?filterBy=sto&value=${sto}&pageSize=500`, getOptions);
    const stoFetch = fetch(API_URL + 'bapi/sto/display', {
      method: 'POST',
      headers: {
        authorization: token,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ sto }),
    });
    const dnFetch = fetch(API_URL + 'bapi/dn/display', postOptions);
    try {
      // Fetch data from both APIs simultaneously
      const [shelvingResponse, stoResponse, dnResponse] = await Promise.all([shelvingFetch, stoFetch, dnFetch]);

      // Check if both fetch requests were successful
      if (!shelvingResponse.ok || !stoResponse.ok || !dnResponse.ok) {
        Toast.show({
          type: 'customError',
          text1: "Failed to fetch data from APIs",
        });
      }

      // Parse the JSON data from the responses
      const shelvingData = await shelvingResponse.json();
      const stoData = await stoResponse.json();
      const dnData = await dnResponse.json();

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

      const storageLocation = stoData.data.items[0].storageLocation;
      let dnItems = dnData.data.items;
      // console.log('DN items', JSON.stringify(dnItems));
      dnItems = dnItems.map(item => {
        return {
          ...item,
          storageLocation,
          remainingQuantity: item.quantity
        }
      });

      let adjustedArticles = dnItems.map(dnItem => {
        const matchedItem = shelvingItems.find(
          shItem => shItem.code === dnItem.material
        );
        if (matchedItem) {
          return {
            ...dnItem,
            remainingQuantity: dnItem.quantity - matchedItem.receivedQuantity
          };
        } else {
          return {
            ...dnItem,
            remainingQuantity: dnItem.quantity
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

  const getDnInfo = async () => {
    setIsLoading(true);
    await getDnDetails();
    setIsLoading(false);
  }

  useFocusEffect(
    useCallback(() => {
      if (token && po && user.site) {
        getPoInfo();
        return;
      }
      if (token && dn && user.site) {
        getDnInfo();
        return;
      }
    }, [token, po, dn, user.site]),
  );

  const onRefresh = async () => {
    setRefreshing(true);
    if (po) {
      await getPoDetails();
    } else {
      await getDnDetails();
    }
    setRefreshing(false);
  };

  const renderItem = ({ item, index }) => (
    <>
      {pressMode === 'true' ? (
        <View key={index} className="flex-row items-center border border-tb rounded-lg mt-2.5 p-4">
          <TouchableOpacity className="w-4/5 flex-row items-center" onPress={() => navigation.replace('OutletArticleDetails', item)}>
            <View className="w-2/5">
              <Text className="text-black" numberOfLines={1}>
                {item.material}
              </Text>
              <Text className="w-36 text-black" numberOfLines={2}>
                {item.description}
              </Text>
            </View>
            <Text
              className="w-3/5 text-black text-center"
              numberOfLines={1}>
              {item.remainingQuantity}
            </Text>
          </TouchableOpacity>
          <TouchableOpacity className="w-1/5" onPress={() => confirmReport(item)}>
            <Text className="bg-blue-600 text-white text-center rounded capitalize p-1.5">
              report
            </Text>
          </TouchableOpacity>
        </View>
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
              const dnItem = articles.find(item => item.material === result.data.material);

              if (dnItem && isValidBarcode) {
                navigation.replace('OutletArticleDetails', dnItem);
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
    remainingGrnItems = grnItems.filter(grnItem => grnItem.po !== (po || sto));
    GrnByPo = grnItems.filter(grnItem => grnItem.po === (po || sto));
  }

  const confirmReport = (article) => {
    setReportArticle(article);
    if (article.quantity === article.remainingQuantity) {
      setReportText('No quantity received yet. Do you want to continue?');
    } else {
      setReportText('Do you want to report?');
    }
    setReportDialogVisible(true);
    //console.log(article);
  }

  const gotoReport = () => {
    setReportDialogVisible(false);
    navigation.push('OutletArticleReport', reportArticle);
    setReportArticle({});
  }

  const generateGRN = async (grnList) => {
    setDialogVisible(false);
    setGrnModal(false);
    setIsButtonLoading(true);
    let postData = {};
    if (po) {
      postData = {
        po,
        status: 'pending for grn',
        createdBy: user._id,
        grnData: grnList
      };
    } else {
      postData = {
        po: sto,
        dn,
        status: 'pending for grn',
        createdBy: user._id,
        grnData: grnList
      };
    }

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
        .then(result => {
          if (result.status) {
            Toast.show({
              type: 'customSuccess',
              text1: result.message,
            });
            setStorage('grnItems', remainingGrnItems);
            setIsUpdatingGrn(true);
            setGrnItems(remainingGrnItems);
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
        <Text className="mt-4 text-gray-400 text-base text-center">Loading {po ? 'po' : 'dn'} articles. Please wait......</Text>
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
                {po ? `po ${po}` : `dn ${dn}`}
              </Text>
            </TouchableHighlight>
          ) : (
            <Text className="text-lg text-sh font-semibold uppercase">
              {po ? `po ${po}` : `dn ${dn}`}
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
            {!isLoading && articles.length === 0 && GrnByPo.length > 0 ? (
              <Text className="text-black text-lg text-center font-bold mt-5">
                No articles left to receive
              </Text>
            ) : !isLoading && articles.length === 0 ? (
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
        <View className="content">
          <View className="grn-list mt-3 pb-3">
            {GrnByPo.length > 0 ? (
              <>
                <View className="bg-th flex-row items-center justify-between p-2">
                  <Text className="text-white">Code</Text>
                  <Text className="text-white">Quantity</Text>
                </View>
                <ScrollView>
                  {GrnByPo.map((item) => (
                    <View className="bg-gray-100 flex-row items-center justify-between p-2.5" key={item.material}>
                      <Text className="text-sh">{item.material}</Text>
                      <Text className="text-sh">{item.quantity}</Text>
                    </View>
                  ))}
                </ScrollView>
              </>
            ) : (
              <View className="outlet">
                <Text className="text-black text-lg text-center">No items ready for GRN</Text>
              </View>
            )}
          </View>
          {GrnByPo.length > 0 && (
            <View className="button w-1/3 mx-auto">
              <TouchableWithoutFeedback onPress={() => setDialogVisible(true)}>
                <Text className="bg-blue-600 text-white text-lg text-center rounded p-2 capitalize">confirm</Text>
              </TouchableWithoutFeedback>
            </View>
          )}
        </View>
      </Modal>
      <Dialog
        isOpen={dialogVisible}
        modalHeader="Are you sure?"
        modalSubHeader="GRN will be generated"
        onClose={() => setDialogVisible(false)}
        onSubmit={() => generateGRN(GrnByPo)}
        leftButtonText="cancel"
        rightButtonText="proceed"
      />
      <Dialog
        isOpen={reportDialogVisible}
        modalHeader="Are you sure?"
        modalSubHeader={reportText}
        onClose={() => setReportDialogVisible(false)}
        onSubmit={() => gotoReport()}
        leftButtonText="cancel"
        rightButtonText="confirm"
      />
      <CustomToast />
    </SafeAreaView >
  );
};

export default OutletPoStoDetails;