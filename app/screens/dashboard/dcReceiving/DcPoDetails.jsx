import { API_URL } from '@env';
import { HeaderBackButton } from '@react-navigation/elements';
import { useFocusEffect } from '@react-navigation/native';
import React, { useCallback, useEffect, useLayoutEffect, useState } from 'react';
import {
  ActivityIndicator,
  Alert,
  DeviceEventEmitter, FlatList,
  RefreshControl,
  SafeAreaView, ScrollView, Text,
  TouchableOpacity,
  TouchableWithoutFeedback,
  View
} from 'react-native';
import Toast from 'react-native-toast-message';
import CustomToast from '../../../../components/CustomToast';
import Dialog from '../../../../components/Dialog';
import FalseHeader from '../../../../components/FalseHeader';
import Modal from '../../../../components/Modal';
import { ButtonLg, ButtonLoading, ButtonProfile } from '../../../../components/buttons';
import useActivity from '../../../../hooks/useActivity';
import useBackHandler from '../../../../hooks/useBackHandler';
import { getStorage } from '../../../../hooks/useStorage';
import { toast } from '../../../../utils';
import { deleteTempData } from '../../../../utils/apiServices';
import SunmiScanner from '../../../../utils/sunmi/scanner';

const DcPoDetails = ({ navigation, route }) => {
  const { po } = route.params;
  const { createActivity } = useActivity();
  const { startScan, stopScan } = SunmiScanner;
  const [isLoading, setIsLoading] = useState(false);
  const [isChecking, setIsChecking] = useState(false);
  const [flatListFooterVisible, setFlatListFooterVisible] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [isButtonLoading, setIsButtonLoading] = useState(false);
  const [grnModal, setGrnModal] = useState(false);
  const [dialogVisible, setDialogVisible] = useState(false);
  const [pressMode, setPressMode] = useState(false);
  const [barcode, setBarcode] = useState('');
  const [user, setUser] = useState({});
  const [token, setToken] = useState('');
  const [articles, setArticles] = useState([]);
  let [grnItems, setGrnItems] = useState([]);
  const [tempDataId, setTempDataId] = useState('');
  const [storageLocation, setStorageLocation] = useState('');
  const tableHeader = ['Article Info', 'PO Qty', 'GRN Qty', 'REM Qty'];
  let grnSummery = {};

  // Custom hook to navigate screen
  useBackHandler('DcReceiving');

  useLayoutEffect(() => {
    let screenOptions = {
      headerTitleAlign: 'center',
      headerTitle: `PO ${po} Details`,
      headerLeft: () => (
        <HeaderBackButton onPress={() => navigation.replace('DcReceiving')} />
      ),
      headerRight: () => (
        <ButtonProfile onPress={() => navigation.replace('Profile', { screen: route.name, data: route.params })} />
      ),
    };
    navigation.setOptions(screenOptions);
  }, [navigation.isFocused()]);

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

  useEffect(() => {
    if (barcode && pressMode !== 'true') {
      checkBarcode(barcode);
      // checkBarcode(token, barcode, articles, 'DcPoArticleDetails', setBarcode, setIsChecking);
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

  useFocusEffect(
    useCallback(() => {
      if (token && po && user.site) {
        getPoInfo();
      }
    }, [token, po, user.site]),
  );

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
      if (!shelvingResponse.ok && !poResponse.ok) {
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
      } else {
        setStorageLocation(poItem?.storageLocation);
      }

      let shelvingItems = shelvingData.items;

      let poItems = poData.data.items;
      const historyItems = poData.data.historyTotal;

      poItems = poItems.map(poItem => {
        const matchedPhItem = historyItems.find(
          historyItem => historyItem.material === poItem.material
        );
        const matchedShItem = shelvingItems.find(
          shItem => shItem.code === poItem.material
        );
        if (matchedPhItem && matchedShItem) {
          return {
            ...poItem,
            remainingQuantity: poItem.quantity - (matchedPhItem.grnQuantity - matchedShItem.receivedQuantity),
            grnQuantity: matchedPhItem.grnQuantity
          };
        } else if (matchedPhItem) {
          return {
            ...poItem,
            remainingQuantity: poItem.quantity - matchedPhItem.grnQuantity,
            grnQuantity: matchedPhItem.grnQuantity
          };
        } else if (matchedShItem) {
          return {
            ...poItem,
            remainingQuantity: poItem.quantity - matchedShItem.receivedQuantity,
            grnQuantity: 0
          };
        } else {
          return {
            ...poItem,
            remainingQuantity: poItem.quantity,
            grnQuantity: 0
          };
        }
      });

      poItems = poItems.filter(item => item.quantity !== item.grnQuantity);

      setArticles(poItems);
    } catch (error) {
      Toast.show({
        type: 'customError',
        text1: error.message,
      });
    }
  };

  const getTempData = async () => {
    const filterObject = {
      userId: user._id,
      po,
      type: 'grn data'
    };
    try {
      await fetch(API_URL + 'api/tempData/getall', {
        method: 'POST',
        headers: {
          authorization: token,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(filterObject),
      })
        .then(response => response.json())
        .then(data => {
          if (data.status) {
            setTempDataId(data._id);
            setGrnItems(data.items);
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

  const getPoInfo = async () => {
    const start = performance.now();
    setIsLoading(true);
    await getPoDetails();
    await getTempData();
    setIsLoading(false);
    const end = performance.now();
    const time = (end - start) / 1000
    toast(`Loading time: ${time.toFixed(2)} Seconds`);
  }

  const onRefresh = async () => {
    const start = performance.now();
    setRefreshing(true);
    await getPoDetails();
    await getTempData();
    setRefreshing(false);
    const end = performance.now();
    const time = (end - start) / 1000
    toast(`Refreshing time: ${time.toFixed(2)} Seconds`);
  };

  const renderItem = ({ item, index }) => (
    <>
      {pressMode === 'true' || (item.material.startsWith('24') && item.unit === 'KG') ? (
        <TouchableOpacity onPress={() => navigation.replace('DcPoArticleDetails', item)}>
          <View
            key={index}
            className="flex-row items-center border border-tb rounded-lg mt-2.5 p-4"
          >
            <View className="w-2/5">
              <Text className="text-black" numberOfLines={1}>
                {item.material}
              </Text>
              <Text className="w-full text-black" numberOfLines={2}>
                {item.description}
              </Text>
            </View>
            <Text className="w-1/5 text-black text-center" numberOfLines={1}>
              {item.quantity}
            </Text>
            <Text className="w-1/5 text-black text-center" numberOfLines={1}>
              {item.grnQuantity}
            </Text>
            <Text className="w-1/5 text-blue-600 text-base text-right" numberOfLines={1}>
              {item.remainingQuantity}
            </Text>
          </View>
        </TouchableOpacity>
      ) : (
        <View
          key={index}
          className="flex-row items-center border border-tb rounded-lg mt-2.5 p-4"
        >
          <View className="w-2/5">
            <Text className="text-black" numberOfLines={1}>
              {item.material}
            </Text>
            <Text className="w-full text-black" numberOfLines={2}>
              {item.description}
            </Text>
          </View>
          <Text className="w-1/5 text-black text-center" numberOfLines={1}>
            {item.quantity}
          </Text>
          <Text className="w-1/5 text-black text-center" numberOfLines={1}>
            {item.grnQuantity}
          </Text>
          <Text className="w-1/5 text-blue-600 text-base text-right" numberOfLines={1}>
            {item.remainingQuantity}
          </Text>
        </View>
      )}
    </>
  );

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
            const isScannable = articles.some(
              article => article.material === barcode && !(article.material.startsWith('24') && article.unit === 'KG')
            );
            const article = articles.find(item => item.material === result.data.material);
            if (!isScannable && article) {
              Toast.show({
                type: 'customInfo',
                text1: `Please receive ${barcode} by taping on the product`,
              });
            } else if (isScannable && article && isValidBarcode) {
              navigation.replace('DcPoArticleDetails', article);
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
        text1: 'Unable to fetch data',
      });
    } finally {
      setBarcode('');
      setIsChecking(false);
    }
  };

  if (grnItems.length) {
    grnSummery = grnItems.reduce((acc, curr, i) => {
      acc.totalItems = i + 1;
      acc.totalPrice += curr.quantity * curr.netPrice;
      return acc;
    },
      { totalItems: 0, totalPrice: 0 }
    );
  }

  const postGRNData = () => {
    const isSameStorageLocation = user.storage_location.some(
      item => item.name === 'receiving' && item.code === storageLocation
    );

    const updateGRNData = () => {
      const storageLocation = user.storage_location.find(item => item.name === 'receiving').code;
      grnItems = grnItems.map(item => {
        return { ...item, storageLocation }
      });
      setDialogVisible(true);
    };

    if (!storageLocation) {
      Alert.alert('PO do not have storage location', 'Do you want to set user storage location as po storage location?', [
        {
          text: 'Cancel',
          onPress: () => null,
          style: 'cancel',
        },
        { text: 'YES', onPress: () => updateGRNData() },
      ]);
    } else if (!isSameStorageLocation) {
      Alert.alert("PO and user storage location isn't same", "Do you want to set user storage location as po storage location?", [
        {
          text: 'Cancel',
          onPress: () => null,
          style: 'cancel',
        },
        { text: 'YES', onPress: () => updateGRNData() },
      ]);
    } else {
      setDialogVisible(true);
    }
  };

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
            await deleteTempData(token, tempDataId);
            onRefresh();
            //log user activity
            await createActivity(
              user._id,
              'grn_request',
              `${user.name} send request for grn with document ${po}`,
            );
            setIsButtonLoading(false);
            if (articles.length === 0) {
              useBackHandler('DcReceiving');
            }
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
      <View className="w-full h-screen bg-white justify-center px-3">
        <ActivityIndicator size="large" color="#EB4B50" />
        <Text className="mt-4 text-gray-400 text-base text-center">Loading po articles. Please wait......</Text>
      </View>
    )
  }

  return (
    <SafeAreaView className="flex-1 bg-white">
      <View className="flex-1 h-full px-4">
        <FalseHeader />
        <View className="content flex-1 justify-between pb-2">
          <View className="table h-[90%]">
            <View className="table-header flex-row bg-th text-center mb-2 p-2">
              {tableHeader.map(th => (
                <Text className={` ${th === 'Article Info' ? 'w-2/5' : 'w-1/5'} text-white text-center font-bold`} key={th}>
                  {th}
                </Text>
              ))}
            </View>
            {!isLoading && articles.length === 0 ? (
              <Text className="text-black text-lg text-center font-bold mt-5">
                No articles left to receive
              </Text>
            ) : isChecking ? (
              <View className="w-full h-[85vh] justify-center bg-white px-3">
                <ActivityIndicator size="large" color="#EB4B50" />
                <Text className="mt-4 text-gray-400 text-base text-center">Checking barcode. Please wait......</Text>
              </View>
            ) : (
              <FlatList
                data={articles}
                renderItem={renderItem}
                keyExtractor={item => item.material}
                initialNumToRender={10}
                onEndReached={handleEndReached}
                ListFooterComponent={renderFooter}
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
          {Boolean(grnItems.length) && (
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
            {grnItems.length > 0 ? (
              <>
                <View className="bg-th flex-row items-center justify-between p-2">
                  <Text className="text-white text-xs">Article Code</Text>
                  <Text className="text-white text-xs">Unit Price(৳)</Text>
                  <Text className="text-white text-xs">Quantity</Text>
                  <Text className="text-white text-xs">Total Price(৳)</Text>
                </View>
                <ScrollView className="max-h-full">
                  {grnItems.map((item) => (
                    <View className="bg-gray-100 flex-row items-center justify-between mt-1 p-2.5" key={item.material}>
                      <Text className="text-sh text-xs">{item.material}</Text>
                      <Text className="text-sh text-xs">{item.netPrice}</Text>
                      <Text className="text-sh text-xs">{item.quantity}</Text>
                      <Text className="text-sh text-xs">{item.netPrice * item.quantity}</Text>
                    </View>
                  ))}
                </ScrollView>
                <View className="flex-row items-center justify-between mt-2 px-2">
                  <View className="flex-row items-center justify-between mt-2">
                    <Text className="text-black font-bold text-sm">Total Items:</Text>
                    <Text className="text-black ml-1 text-sm">{grnSummery.totalItems}</Text>
                  </View>
                  <View className="flex-row items-center justify-between mt-2">
                    <Text className="text-black font-bold text-sm">Total Price:</Text>
                    <Text className="text-black ml-1 text-sm">{grnSummery.totalPrice.toLocaleString()}</Text>
                  </View>
                </View>
                <View className="button w-1/3 mx-auto mt-5">
                  <TouchableWithoutFeedback onPress={() => postGRNData()}>
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
        onSubmit={() => generateGRN(grnItems)}
        leftButtonText="cancel"
        rightButtonText="proceed"
      />
      <CustomToast />
    </SafeAreaView >
  );
};

export default DcPoDetails;