import { useFocusEffect, useIsFocused } from '@react-navigation/native';
import React, { useCallback, useEffect, useState } from 'react';
import { ActivityIndicator, DeviceEventEmitter, FlatList, Image, SafeAreaView, Text, TextInput, View } from 'react-native';
import { SearchIcon } from '../../../../constant/icons';
import { getStorage } from '../../../../hooks/useStorage';
import { dateRange, toast } from '../../../../utils';
import SunmiScanner from '../../../../utils/sunmi/scanner';
import ServerError from '../../../../components/animations/ServerError';

const Receiving = ({ navigation }) => {
  const isFocused = useIsFocused();
  const [isLoading, setIsLoading] = useState(false);
  const [user, setUser] = useState(null);
  const [token, setToken] = useState('');
  const [barcode, setBarcode] = useState('');
  let [poList, setPoList] = useState([]);
  const [search, setSearch] = useState('');
  const tableHeader = ['Purchase Order ID', 'SKU'];
  const API_URL = 'https://shwapnooperation.onrender.com/';
  const { startScan, stopScan } = SunmiScanner;
  const dateObject = dateRange(7);
  const postObject = { ...dateObject, site: user?.site };

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
            await fetch(API_URL + 'api/po-tracking/in-grn', {
              method: 'GET',
              headers: {
                authorization: token,
              },
            })
              .then(res => res.json())
              .then(inGRNData => {
                if (inGRNData.status) {
                  const poList = result.data.po;
                  const inGrnItems = inGRNData.items;
                  let remainingPoItems = poList.filter(poItem => !inGrnItems.some(inGrnItem => inGrnItem.po === poItem.po));
                  setPoList(remainingPoItems);
                  setIsLoading(false);
                } else {
                  setPoList(result.data.po);
                  setIsLoading(false);
                }
              })
              .catch(error => {
                toast(error.message)
                setIsLoading(false);
              });

          } else {
            toast(data.message);
            setIsLoading(false);
          }
        })
        .catch(error => {
          toast(error.message)
          setIsLoading(false);
        });
    } catch (error) {
      toast(error.message);
      setIsLoading(false);
    }
  };

  useFocusEffect(
    useCallback(() => {
      if (token) {
        getPoList();
      }
    }, [token])
  );

  if (barcode) {
    const poItem = poList.find(item => item.po === barcode);
    if (poItem) {
      navigation.push('PurchaseOrder', { po_id: barcode });
      setBarcode('');
    } else {
      toast('Item not found!')
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


  console.log(poList.length);

  return (
    <SafeAreaView className="flex-1 bg-white pt-8">
      <View className="flex-1 px-4">
        <View className="screen-header flex-row items-center mb-4">
          <Text className="text-lg flex-1 text-sh text-center font-semibold capitalize">
            receiving screen
          </Text>
        </View>

        {!isLoading && poList.length ? (
          <>
            {/* Search and Button */}
            <View className="search-button flex-row items-center gap-3">
              <View className="input-box relative flex-1">
                <Image className="absolute top-3 left-3 z-10" source={SearchIcon} />
                <TextInput
                  className="bg-[#F5F6FA] h-[50px] text-black rounded-lg pl-12 pr-4"
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
                  ListFooterComponent={isLoading && <ActivityIndicator />}
                />
              </View>
            </View>
          </>
        ) : (
          <View className="h-3/4 justify-center">
            <ServerError message="No data found!" />
          </View>
        )}

      </View>
    </SafeAreaView>
  );
};

export default Receiving;