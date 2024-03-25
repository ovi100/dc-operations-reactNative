import { useFocusEffect, useIsFocused } from '@react-navigation/native';
import React, { useCallback, useEffect, useState } from 'react';
import { ActivityIndicator, Alert, DeviceEventEmitter, FlatList, SafeAreaView, Text, View } from 'react-native';
import { ButtonLg, ButtonLoading } from '../../../../../components/buttons';
import useAppContext from '../../../../../hooks/useAppContext';
import { getStorage } from '../../../../../hooks/useStorage';
import { toast } from '../../../../../utils';
import SunmiScanner from '../../../../../utils/sunmi/scanner';

const PurchaseOrder = ({ navigation, route }) => {
  const isFocused = useIsFocused();
  const { startScan, stopScan } = SunmiScanner;
  const [isLoading, setIsLoading] = useState(false);
  const [isButtonLoading, setIsButtonLoading] = useState(false);
  const [barcode, setBarcode] = useState('');
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
      console.log(data.code);
      setBarcode(data.code);
    });

    return () => {
      stopScan();
      DeviceEventEmitter.removeAllListeners('ScanDataReceived');
    };
  }, [isFocused]);

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
            .then(shelveData => {
              if (shelveData.status) {
                const poItems = result.data.items;
                const shItems = shelveData.items;
                let remainingPoItems = poItems.filter(
                  poItem =>
                    !shItems.some(
                      shItem => shItem.po === poItem.po && poItem.quantity === shItem.receivedQuantity
                    )
                );

                let remainingQuantityPoItems = shItems.filter(shItem => shItem.quantity > shItem.receivedQuantity && shItem.po === po_id);

                if (remainingQuantityPoItems.length > 0) {
                  const remainingQuantity = remainingQuantityPoItems.map((item) => {
                    return {
                      code: item.code,
                      quantity: item.quantity,
                      receivedQuantity: item.receivedQuantity,
                      remainingQuantity: item.quantity - item.receivedQuantity,
                    };
                  });

                  const adjustedItems = remainingQuantity.reduce((acc, curr) => {
                    const existingItem = acc.find((item) => item.code === curr.code);
                    if (existingItem) {
                      existingItem.receivedQuantity += curr.receivedQuantity;
                      existingItem.remainingQuantity =
                        curr.quantity - existingItem.receivedQuantity;
                    } else {
                      acc.push({
                        code: curr.code,
                        quantity: curr.quantity,
                        receivedQuantity: curr.receivedQuantity,
                        remainingQuantity: curr.quantity - curr.receivedQuantity,
                      });
                    }
                    return acc;
                  }, []);

                  remainingPoItems.forEach(poItem => {
                    const adjustedItem = adjustedItems.find(item => item.code === poItem.material);
                    if (adjustedItem) {
                      poItem.remainingQuantity = adjustedItem.remainingQuantity;
                    } else {
                      poItem.remainingQuantity = poItem.quantity;
                    }
                  });
                }
                setArticles(remainingPoItems);
                setIsLoading(false);
              }
              else {
                const poItems = result.data.items;
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

  const initialGrnItems = articles.map(article => {
    return {
      movementType: '101',
      movementIndicator: 'B',
      po: po_id,
      poItem: Number(article.poItem).toString(),
      material: article.material,
      plant: article.receivingPlant,
      storageLocation: article.storageLocation,
      quantity: 0,
      uom: article.unit,
      uomIso: article.unit,
    }
  });

  const renderItem = ({ item, index }) => (
    <View className="flex-row border border-tb rounded-lg mt-2.5 p-4" key={index}>
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
        {item.remainingQuantity}
      </Text>
    </View>
  );

  if (barcode !== '') {
    const poItem = articles.find(item => item.barcode === barcode);
    if (poItem) {
      navigation.push('PoArticles', poItem);
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
        .then(data => {
          setGrnItems([]);
          toast(data.message);
          setIsButtonLoading(false);
          setTimeout(() => {
            navigation.goBack();
          }, 1000);
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
    let finalGrnList = GRNByPo.concat(initialGrnItems);
    const uniqueGrnList = finalGrnList.reduce((acc, curr) => {
      const existingItem = acc.find(item => item.material === curr.material);
      if (existingItem) {
        existingItem.quantity += curr.quantity;
      } else {
        acc.push({ ...curr });
      }
      return acc;
    }, []);

    Alert.alert('Are you sure?', 'GRN will be created', [
      {
        text: 'Cancel',
        onPress: () => null,
        style: 'cancel',
      },
      { text: 'OK', onPress: () => createGRN(uniqueGrnList) },
    ]);
  }

  if (isLoading) {
    return (
      <View className="w-full h-4/5 justify-center px-3">
        <ActivityIndicator size="large" color="#0000ff" />
      </View>
    )
  }

  if (articles.length === 0) {
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

  return (
    <SafeAreaView className="flex-1 bg-white pt-8">
      <View className="flex-1 h-full px-4">
        <View className="screen-header flex-row mb-4">
          <Text className="flex-1 text-lg text-sh text-center font-semibold uppercase">
            po {po_id}
          </Text>
        </View>
        <View className="content flex-1 justify-between py-5">
          <>
            <View className="table h-4/5 pb-2">
              <View className="flex-row bg-th text-center mb-2 py-2">
                {tableHeader.map(th => (
                  <Text className="flex-1 text-white text-center font-bold" key={th}>
                    {th}
                  </Text>
                ))}
              </View>
              <FlatList
                data={articles}
                renderItem={renderItem}
                keyExtractor={item => item.material}
                initialNumToRender={15}
              />
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