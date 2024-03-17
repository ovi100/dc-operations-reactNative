import { useFocusEffect, useIsFocused } from '@react-navigation/native';
import React, { useCallback, useEffect, useState } from 'react';
import { ActivityIndicator, DeviceEventEmitter, FlatList, SafeAreaView, Text, View } from 'react-native';
import { getStorage } from '../../../../hooks/useStorage';
import SunmiScanner from '../../../../utils/sunmi/scanner';
import { toast } from '../../../../utils';
import useAppContext from '../../../../hooks/useAppContext';

const BinDetails = ({ navigation, route }) => {
  const { code, description } = route.params;
  const { authInfo } = useAppContext();
  const { user } = authInfo;
  const isFocused = useIsFocused();
  const [isLoading, setIsLoading] = useState(false);
  const tableHeader = ['Bin ID', 'Gondola ID'];
  const [barcode, setBarcode] = useState('');
  const [bins, setBins] = useState('');
  const [isBinsFound, setIsBinsFound] = useState(null);
  const [token, setToken] = useState('');
  const { startScan, stopScan } = SunmiScanner;
  const API_URL = 'https://shelves-backend.onrender.com/api/bins/product/';

  useEffect(() => {
    getStorage('token', setToken);
  }, [])

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

  const getBins = async (code, site) => {
    try {
      setIsLoading(true);
      await fetch(API_URL + `${code}/${site}`, {
        method: 'GET',
        headers: {
          authorization: token,
        },
      })
        .then(response => response.json())
        .then(data => {
          if (data.status) {
            console.log(data);
            setBins(data.bins);
            setIsBinsFound(true);
            setIsLoading(false);
          } else {
            toast('No bins found');
            setIsBinsFound(false);
            setIsLoading(false);
          }
        })
        .catch(error => toast(error.message));
    } catch (error) {
      toast(error.message);
      setIsLoading(false);
    }
  };

  useFocusEffect(
    useCallback(() => {
      if (token && user.site) {
        getBins(code, user.site);
      }
    }, [token, user.site]),
  );

  const renderItem = ({ item, index }) => (
    <View className="flex-row border border-tb rounded-lg mt-2.5 p-4" key={index}>
      <Text
        className="flex-1 text-black text-center"
        numberOfLines={1}>
        {item.bin_ID}
      </Text>
      <Text
        className="flex-1 text-black text-center"
        numberOfLines={1}>
        {item.gondola_ID}
      </Text>
    </View>
  );

  if (barcode) {
    const binItem = bins.find(item => item.bin_ID === barcode);
    if (binItem) {
      navigation.push('ShelveArticle', route.params);
      setBarcode('');
    } else {
      toast('Item not found!');
      setIsBinsFound(false);
    }
  }

  return (
    <SafeAreaView className="flex-1 bg-white pt-8">
      <View className="flex-1 px-4">
        <View className="screen-header flex-row items-center justify-end mb-4">
          <View className="text">
            <View className="flex-row justify-end">
              <Text className="text-base text-sh font-medium capitalize">
                Bins for article
              </Text>
              <Text className="text-base text-sh font-bold capitalize">
                {' ' + code}
              </Text>
            </View>
            <Text className="text-sm text-sh text-right font-medium capitalize">
              {description}
            </Text>
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
              data={bins}
              renderItem={renderItem}
              keyExtractor={item => item._id}
              ListFooterComponent={isLoading && <ActivityIndicator />}
              onEndReachedThreshold={0}
            />
          </View>
        </View>

        {/* <View className="button mb-3">
          <ButtonLg title="Assign to bin" onPress={() => null} />
        </View> */}
      </View>
    </SafeAreaView>
  );
};

export default BinDetails;
