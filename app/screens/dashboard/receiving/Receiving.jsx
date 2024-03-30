import { useFocusEffect, useIsFocused } from '@react-navigation/native';
import React, { useCallback, useEffect, useState } from 'react';
import { ActivityIndicator, DeviceEventEmitter, FlatList, Image, RefreshControl, SafeAreaView, Text, TextInput, View } from 'react-native';
import ServerError from '../../../../components/animations/ServerError';
import { getStorage } from '../../../../hooks/useStorage';
import { dateRange, toast } from '../../../../utils';
import SunmiScanner from '../../../../utils/sunmi/scanner';
import Toast from 'react-native-toast-message';
import CustomToast from '../../../../components/CustomToast';
import { ButtonLg } from '../../../../components/buttons';

const Receiving = ({ navigation }) => {
  const isFocused = useIsFocused();
  const [isLoading, setIsLoading] = useState(false);
  const [refreshing, setRefreshing] = useState(false);
  const [user, setUser] = useState(null);
  const [token, setToken] = useState('');
  const [barcode, setBarcode] = useState('');
  let [poList, setPoList] = useState([]);
  const [search, setSearch] = useState('');
  const tableHeader = ['Purchase Order ID', 'SKU'];
  const API_URL = 'https://shwapnooperation.onrender.com/';
  const { startScan, stopScan } = SunmiScanner;
  const dateObject = dateRange(15);
  const postObject = { ...dateObject, site: user?.site };

  console.log(postObject);

  useEffect(() => {
    getStorage('user', setUser, 'object');
    getStorage('token', setToken,);
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
    try {
      await fetch(API_URL + 'bapi/po/list', {
        method: 'POST',
        headers: {
          authorization: token,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(postObject),
      })
        .then(response => response.json())
        .then(async result => {
          if (result.status) {
            await fetch(API_URL + 'api/po-tracking?pageSize=500&filterBy=status&value=pending for release', {
              method: 'GET',
              headers: {
                authorization: token,
              },
            })
              .then(res => res.json())
              .then(releaseData => {
                if (releaseData.status) {
                  const poList = result.data.po;
                  const releaseItems = releaseData.items.filter(item => item.receivingPlant === user?.site);
                  let remainingPoItems = poList.filter(poItem => !releaseItems.some(releaseItem => releaseItem.po === poItem.po));
                  setPoList(remainingPoItems);
                  setIsLoading(false);
                  setRefreshing(false);
                  Toast.show({
                    type: 'customSuccess',
                    text1: 'Data successfully loaded',
                  });
                } else {
                  setPoList(result.data.po);
                  setIsLoading(false);
                  setRefreshing(false);
                  Toast.show({
                    type: 'customSuccess',
                    text1: 'Data successfully loaded',
                  });
                }
              })
              .catch(error => {
                Toast.show({
                  type: 'customSuccess',
                  text1: error.message.toString(),
                });
                setIsLoading(false);
                setRefreshing(false);
              });
          } else {
            Toast.show({
              type: 'customSuccess',
              text1: error.message.toString(),
            });
            setIsLoading(false);
            setRefreshing(false);
          }
        })
        .catch(error => {
          Toast.show({
            type: 'customSuccess',
            text1: error.message.toString(),
          });
          setIsLoading(false);
        });
    } catch (error) {
      Toast.show({
        type: 'customSuccess',
        text1: error.message.toString(),
      });
      setIsLoading(false);
    }
  };

  useFocusEffect(
    useCallback(() => {
      if (token) {
        getPoList();
      }
    }, [token, refreshing])
  );

  const onRefresh = () => {
    setIsLoading(false);
    setRefreshing(true);
  };

  if (barcode !== '') {
    const poItem = poList.find(item => item.po === barcode);
    if (poItem) {
      navigation.navigate('PurchaseOrder', { po_id: barcode });
      setBarcode('');
    } else {
      toast('PO not found!');
      setBarcode('');
    }
  }

  const renderItem = ({ item, index }) => (
    <View className="flex-row border border-tb rounded-lg mt-2.5 p-4" key={index}>
      <Text
        className="flex-1 text-black text-center"
        numberOfLines={1}>
        {item.po}
      </Text>
      <Text
        className="flex-1 text-black text-center"
        numberOfLines={1}>
        {item.sku}
      </Text>
    </View>
  );

  if (search !== '') {
    poList = poList.filter(item => item.po.includes(search.toLowerCase()));
  }

  if (isLoading) {
    return (
      <View className="w-full h-screen justify-center px-3">
        <ActivityIndicator size="large" color="#EB4B50" />
        <Text className="mt-4 text-gray-400 text-base text-center">Loading po list. Please wait......</Text>
      </View>
    )
  }

  if (poList.length === 0) {
    return (
      <View className="w-full h-screen justify-center px-3">
        <ServerError message="No data found!" />
      </View>
    )
  }

  return (
    <SafeAreaView className="flex-1 bg-white pt-8">
      <View className="flex-1 px-4">

        <View className="screen-header flex-row items-center mb-4">
          <Text className="text-lg flex-1 text-sh text-center font-semibold capitalize">
            receiving screen
          </Text>
        </View>

        {/* Search filter */}
        <View className="search flex-row">
          <View className="input-box relative flex-1">
            <TextInput
              className="bg-[#F5F6FA] h-[50px] text-black rounded-lg px-4"
              placeholder="Search by purchase order"
              keyboardType="phone-pad"
              placeholderTextColor="#CBC9D9"
              selectionColor="#CBC9D9"
              onChangeText={value => setSearch(value)}
              value={search}
            />
          </View>
        </View>
        <View className="content flex-1 justify-between py-5">
          <View className="table h-full pb-2">
            <View className="flex-row bg-th text-center mb-2 py-2">
              {tableHeader.map(th => (
                <Text className="flex-1 text-white text-center font-bold" key={th}>
                  {th}
                </Text>
              ))}
            </View>
            <FlatList
              data={poList}
              renderItem={renderItem}
              keyExtractor={item => item.po}
              initialNumToRender={15}
              refreshControl={
                <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
              }
            />
          </View>
        </View>
      </View>
      <CustomToast />
    </SafeAreaView>
  );
};

export default Receiving;