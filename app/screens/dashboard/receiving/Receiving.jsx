import { useFocusEffect } from '@react-navigation/native';
import React, { useCallback, useEffect, useState } from 'react';
import { ActivityIndicator, FlatList, Keyboard, SafeAreaView, Text, TextInput, View } from 'react-native';
import { ButtonBack } from '../../../../components/buttons';
import { getStorage } from '../../../../hooks/useStorage';

const Receiving = ({ navigation }) => {
  const [isLoading, setIsLoading] = useState(false);
  const [token, setToken] = useState('');
  const [barcode, setBarcode] = useState('');
  const [poList, setPoList] = useState([]);
  const [page, setPage] = useState(1);
  const [totalPage, setTotalPage] = useState(0);
  const tableHeader = ['Purchase Order ID', 'SKU'];
  // const dataFields = ['po', 'sku'];
  const API_URL = 'https://shwapnooperation.onrender.com/api/po-tracking/pending-for-grn';

  useEffect(() => {
    getStorage('token', setToken, 'string');
    Keyboard.dismiss();
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
            console.log(data)
            setPoList([...poList, ...data.items]);
            setTotalPage(data.totalPages);
            setIsLoading(false);
          } else {
            console.log(data.message);
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

  if (barcode.length == 10) {
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

  return (
    <SafeAreaView className="flex-1 bg-white pt-8">
      <View className="flex-1 px-4">
        <View className="screen-header flex-row items-center mb-4">
          <ButtonBack navigation={navigation} />
          <Text className="text-lg flex-1 text-sh text-center font-semibold capitalize">
            receiving screen
          </Text>
          {/* <Button onPress={() => navigation.toggleDrawer()} title="Menu" /> */}
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

          <TextInput
            className="h-0 border-0 text-center"
            caretHidden={true}
            autoFocus={true}
            value={barcode}
            onChangeText={data => setBarcode(data)}
          />
        </View>
      </View>
    </SafeAreaView>
  );
};

export default Receiving;