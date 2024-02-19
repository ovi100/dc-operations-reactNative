import { useFocusEffect } from '@react-navigation/native';
import React, { useCallback, useEffect, useState } from 'react';
import { ActivityIndicator, DeviceEventEmitter, FlatList, Image, Keyboard, SafeAreaView, Text, TextInput, View } from 'react-native';
// import { ButtonBack } from '../../../../components/buttons';
import { SearchIcon } from '../../../../constant/icons';
import { getStorage } from '../../../../hooks/useStorage';
import { toast } from '../../../../utils';
import SunmiScanner from '../../../../utils/sunmi/scanner';

const Receiving = ({ navigation }) => {
  const [isLoading, setIsLoading] = useState(false);
  const [token, setToken] = useState('');
  const [barcode, setBarcode] = useState('');
  let [poList, setPoList] = useState([]);
  const [page, setPage] = useState(1);
  const [totalPage, setTotalPage] = useState(0);
  const [search, setSearch] = useState('');
  const tableHeader = ['Purchase Order ID', 'SKU'];
  const API_URL = 'https://shwapnooperation.onrender.com/api/po-tracking/pending-for-grn';
  const { startScan, stopScan } = SunmiScanner;

  useEffect(() => {
    getStorage('token', setToken, 'string');
    Keyboard.dismiss();
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
  }, []);

  const getPoList = async () => {
    setIsLoading(true);
    try {
      await fetch(API_URL + `?currentPage=${page}`, {
        method: 'GET',
        headers: {
          authorization: token,
        },
      })
        .then(response => response.json())
        .then(data => {
          if (data.status) {
            setPoList([...poList, ...data.items]);
            setTotalPage(data.totalPages);
            setIsLoading(false);
          } else {
            toast(data.message);
            setIsLoading(false);
          }
        })
        .catch(error => console.log('Fetch catch', error));
    } catch (error) {
      console.log(error);
    }
  };

  useFocusEffect(
    useCallback(() => {
      if (token) {
        getPoList();
      }
    }, [token, page])
  );

  if (barcode) {
    navigation.push('PurchaseOrder', { po_id: barcode });
    setBarcode('')
  }

  const loadMoreItem = () => {
    if (totalPage >= page) {
      setPage(prev => prev + 1);
    } else {
      setIsLoading(false);
    }
  };

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

  console.log(search)

  if (search !== '') {
    poList = poList.filter(item => item.po.includes(search.toLowerCase()));
  }

  poList = [...new Set(poList)]


  return (
    <SafeAreaView className="flex-1 bg-white pt-8">
      <View className="flex-1 px-4">
        <View className="screen-header flex-row items-center mb-4">
          {/* <ButtonBack navigation={navigation} /> */}
          <Text className="text-lg flex-1 text-sh text-center font-semibold capitalize">
            receiving screen
          </Text>
        </View>
        {/* Search and Button */}
        <View className="search-button flex-row items-center gap-3">
          <View className="input-box relative flex-1">
            <Image className="absolute top-3 left-3 z-10" source={SearchIcon} />
            <TextInput
              className="bg-[#F5F6FA] h-[50px] text-black rounded-lg pl-12 pr-4"
              placeholder="Search by purchase order"
              inputMode='text'
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
              keyExtractor={item => item._id}
              onEndReached={loadMoreItem}
              ListFooterComponent={isLoading && <ActivityIndicator />}
              onEndReachedThreshold={0}
            />
          </View>
        </View>
      </View>
    </SafeAreaView>
  );
};

export default Receiving;