import { API_URL } from '@env';
import { HeaderBackButton } from '@react-navigation/elements';
import { useFocusEffect } from '@react-navigation/native';
import React, { useCallback, useEffect, useLayoutEffect, useState } from 'react';
import {
  ActivityIndicator, Alert, DeviceEventEmitter, FlatList,
  RefreshControl, SafeAreaView,
  ScrollView,
  Text,
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
import { deleteTempData } from '../../../../utils/apiServices';
import SunmiScanner from '../../../../utils/sunmi/scanner';

const PoStoDetails = ({ navigation, route }) => {
  const { po, dn, sto } = route.params;
  const { createActivity } = useActivity();
  const { startScan, stopScan } = SunmiScanner;
  const [isLoading, setIsLoading] = useState(false);
  const [isChecking, setIsChecking] = useState(false);
  const [refreshing, setRefreshing] = useState(false);
  const [flatListFooterVisible, setFlatListFooterVisible] = useState(true);
  const [isButtonLoading, setIsButtonLoading] = useState(false);
  const [grnModal, setGrnModal] = useState(false);
  const [dialogVisible, setDialogVisible] = useState(false);
  const [reportDialogVisible, setReportDialogVisible] = useState(false);
  const [pressMode, setPressMode] = useState(false);
  const [barcode, setBarcode] = useState('');
  const [user, setUser] = useState({});
  const [token, setToken] = useState('');
  const [articles, setArticles] = useState([]);
  let [grnItems, setGrnItems] = useState([]);
  const [tempDataId, setTempDataId] = useState('');
  const [storageLocation, setStorageLocation] = useState('');
  const [reportArticle, setReportArticle] = useState({});
  const [reportText, setReportText] = useState('');
  const tableHeader = po ? ['Article Info', 'PO Qty', 'GRN Qty', 'REM Qty'] : ['Article Info', 'Quantity', 'Action'];
  let grnSummery = {};
  const specialCodes = ['2304145', '2304146', '2304147', '2304149', '2304150', '2304422', '2600241'];

  // Custom hook to navigate screen
  useBackHandler('Receiving');

  useLayoutEffect(() => {
    let screenOptions = {
      headerTitleAlign: 'center',
      headerTitle: po ? `PO ${po} Details` : `DN ${dn} Details`,
      headerLeft: () => (
        <HeaderBackButton onPress={() => navigation.replace('Receiving')} />
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
  }, [navigation.isFocused()]);

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
        return;
      }
      if (token && dn && user.site) {
        getDnInfo();
        return;
      }
    }, [token, po, dn, user.site]),
  );

  useEffect(() => {
    if (barcode && pressMode !== 'true') {
      checkBarcode(barcode);
    }
  }, [barcode, pressMode]);

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
          text1: "Failed to fetch data from API",
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

      poItems = poItems.filter(item => item.remainingQuantity !== 0);

      setArticles(poItems);
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
    await getTempData();
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
    const tpnFetch = fetch(API_URL + `api/tpn?filterBy=po&value=${sto}&pageSize=500`, getOptions);
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
      const [shelvingResponse, tpnResponse, stoResponse, dnResponse] = await Promise.all([shelvingFetch, tpnFetch, stoFetch, dnFetch]);

      // Check if both fetch requests were successful
      if (!shelvingResponse.ok && !tpnResponse.ok && !stoResponse.ok && !dnResponse.ok) {
        Toast.show({
          type: 'customError',
          text1: "Failed to fetch data from APIs",
        });
      }

      // Parse the JSON data from the responses
      const shelvingData = await shelvingResponse.json();
      const tpnData = await tpnResponse.json();
      const stoData = await stoResponse.json();
      const dnData = await dnResponse.json();

      let tpnItems = tpnData.items;
      if (tpnItems.length > 0) {
        tpnItems = tpnItems.reduce((acc, curr) => {
          const existingItem = acc.find(
            item => item.tpnData.material === curr.tpnData.material
          );
          if (existingItem) {
            existingItem.tpnData.tpnQuantity += curr.tpnData.tpnQuantity;
          } else {
            acc.push({ ...curr });
          }
          return acc;
        }, [])
          .map(item => {
            return {
              sto: item.po,
              dn: item.dn,
              material: item.tpnData.material,
              tpnQuantity: item.tpnData.tpnQuantity,
            };
          });
      }

      let shelvingItems = shelvingData.items;
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
      const netPrice = stoData.data.items[0].netPrice;
      let dnItems = dnData.data.items;
      dnItems = dnItems.map(item => {
        return {
          ...item,
          netPrice,
          storageLocation,
          remainingQuantity: item.quantity
        }
      });

      let adjustedArticles = dnItems.map(dnItem => {
        const matchedShItem = shelvingItems.find(
          shItem => shItem.code === dnItem.material
        );
        const matchedTpnItem = tpnItems.find(
          tpnItem => tpnItem.material === dnItem.material
        );

        if (matchedShItem && matchedTpnItem) {
          return {
            ...dnItem,
            remainingQuantity: dnItem.quantity - (matchedShItem.receivedQuantity + matchedTpnItem.tpnQuantity)
          };
        } else if (matchedShItem) {
          return {
            ...dnItem,
            remainingQuantity: dnItem.quantity - matchedShItem.receivedQuantity
          };
        } else if (matchedTpnItem) {
          return {
            ...dnItem,
            remainingQuantity: dnItem.quantity - matchedTpnItem.tpnQuantity
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
    await getTempData();
    setIsLoading(false);
  }

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

  const onRefresh = async () => {
    setRefreshing(true);
    if (po) {
      await getPoDetails();
      await getTempData();
    } else {
      await getDnDetails();
      await getTempData();
    }
    setRefreshing(false);
  };

  const renderPoItem = ({ item, index }) => (
    <>
      {pressMode === 'true' || (item.material.startsWith('24') && item.unit === 'KG') || specialCodes.includes(item.material) ? (
        <TouchableOpacity onPress={() => navigation.replace('ArticleDetails', item)}>
          <View
            key={index}
            className={`${(item.material.startsWith('24') && item.unit === 'KG') || specialCodes.includes(item.material) ?
              'border-green-500' : 'border-tb'} flex-row items-center border rounded-lg mt-2.5 p-4`}
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

  const renderDnItem = ({ item, index }) => (
    <>
      {pressMode === 'true' || (item.material.startsWith('24') && item.unit === 'KG') || specialCodes.includes(item.material) ? (
        <View key={index} className={`${(item.material.startsWith('24') && item.unit === 'KG') || specialCodes.includes(item.material) ?
          'border-green-500' : 'border-tb'} flex-row items-center border rounded-lg mt-2.5 p-4`}>
          <TouchableOpacity className="w-4/5 flex-row items-center" onPress={() => navigation.replace('ArticleDetails', item)}>
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
        <View key={index} className="flex-row items-center border border-tb rounded-lg mt-2.5 p-4">
          <View className="w-4/5 flex-row items-center">
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
          </View>
          <TouchableOpacity className="w-1/5" onPress={() => confirmReport(item)}>
            <Text className="bg-blue-600 text-white text-center rounded capitalize p-1.5">
              report
            </Text>
          </TouchableOpacity>
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
            const isScannable = articles.some(article => {
              const isLooseCommodity = article.material.startsWith('24') && article.unit === 'KG';
              const isCustomArticle = specialCodes.includes(article.material);
              return isValidBarcode && (!isLooseCommodity || isCustomArticle);
            });
            const article = articles.find(item => item.material === result.data.material);
            if (!isScannable && article) {
              Toast.show({
                type: 'customInfo',
                text1: `Please receive ${article.material} by taping on the product`,
              });
            } else if (isScannable && article && isValidBarcode) {
              navigation.replace('ArticleDetails', article);
            } else {
              Toast.show({
                type: 'customInfo',
                text1: 'Article not found in the PO',
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

  const confirmReport = (article) => {
    setReportArticle(article);
    if (article.quantity === article.remainingQuantity) {
      setReportText('No quantity received yet. Do you want to continue?');
    } else {
      setReportText('Do you want to report?');
    }
    setReportDialogVisible(true);
  }

  const gotoReport = () => {
    setReportDialogVisible(false);
    navigation.push('ArticleReport', reportArticle);
    setReportArticle({});
  }

  const postGRNData = () => {
    const isSameStorageLocation = user.storage_location.some(
      item => item.name === 'receiving' && item.code === storageLocation
    );

    const updateGRNData = () => {
      const code = user.storage_location.find(item => item.name === 'receiving').code;
      grnItems = grnItems.map(item => {
        return { ...item, storageLocation: code }
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
      status: 'pending for grn',
      createdBy: user._id,
      grnData: grnList
    };

    if (po) {
      postData.po = po;
    } else {
      postData.po = sto;
      postData.dn = dn;
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
        .then(async result => {
          if (result.status) {
            Toast.show({
              type: 'customSuccess',
              text1: result.message,
            });
            await deleteTempData(token, tempDataId);
            onRefresh();
            await createActivity(
              user._id,
              'grn_request',
              `${user.name} send request for grn with document ${po ? po : dn}`,
            );
            setIsButtonLoading(false);
            if (articles.length === 0) {
              useBackHandler('Receiving');
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
        <Text className="mt-4 text-gray-400 text-base text-center">Loading {po ? 'po' : 'dn'} articles. Please wait......</Text>
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
                <Text className={`${th === 'Action' || th !== 'Article Info' ? 'w-1/5' : 'w-2/5'} text-white text-center font-bold`} key={th}>
                  {th}
                </Text>
              ))}
            </View>
            {!isLoading && articles.length === 0 && grnItems.length > 0 ? (
              <Text className="text-black text-lg text-center font-bold mt-5">
                No articles left to receive
              </Text>
            ) : !isLoading && articles.length === 0 ? (
              <Text className="text-black text-lg text-center font-bold mt-5">
                No articles left to receive
              </Text>
            ) : isChecking ? (
              <View className="w-full h-[85vh] bg-white justify-center px-3">
                <ActivityIndicator size="large" color="#EB4B50" />
                <Text className="mt-4 text-gray-400 text-base text-center">Checking barcode. Please wait......</Text>
              </View>
            ) : (
              <FlatList
                data={articles}
                renderItem={po ? renderPoItem : renderDnItem}
                keyExtractor={item => item.material}
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
          {(dn || sto) && articles.length === 0 && grnItems.length > 0 && (
            <View className="button">
              {isButtonLoading ? <ButtonLoading styles='bg-theme rounded-md p-5' /> :
                <ButtonLg
                  title="Generate GRN"
                  onPress={() => setGrnModal(true)}
                />
              }
            </View>
          )}
          {po && grnItems.length > 0 && (
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
                  {po && (
                    <Text className="text-white text-xs">Unit Price(৳)</Text>
                  )}
                  <Text className="text-white text-xs">Quantity</Text>
                  {po && (
                    <Text className="text-white text-xs">Total Price(৳)</Text>
                  )}
                </View>
                <ScrollView className="max-h-full">
                  {grnItems.map((item) => (
                    <View className="bg-gray-100 flex-row items-center justify-between mt-1 p-2.5" key={item.material}>
                      <Text className="text-sh text-xs">{item.material}</Text>
                      {po && (
                        <Text className="text-sh text-xs">{item.netPrice}</Text>
                      )}
                      <Text className="text-sh text-xs">{item.quantity}</Text>
                      {po && (
                        <Text className="text-sh text-xs">{item.netPrice * item.quantity}</Text>
                      )}
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
                    <Text className="text-black ml-1">{grnSummery.totalPrice.toLocaleString()}</Text>
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

export default PoStoDetails;