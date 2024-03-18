import { useIsFocused } from '@react-navigation/native';
import React, { useEffect, useState } from 'react';
import { DeviceEventEmitter, FlatList, SafeAreaView, Text, View } from 'react-native';
import EmptyBox from '../../../../components/animations/EmptyBox';
import { ButtonLg } from '../../../../components/buttons';
import { getStorage } from '../../../../hooks/useStorage';
import { toast } from '../../../../utils';
import SunmiScanner from '../../../../utils/sunmi/scanner';

const BinDetails = ({ navigation, route }) => {
  const isFocused = useIsFocused();
  const { bins, code, description, quantity } = route.params;
  const tableHeader = ['Bin ID', 'Gondola ID'];
  const [barcode, setBarcode] = useState('');
  const isBinsFound = Boolean(bins.length);
  const [token, setToken] = useState('');
  const { startScan, stopScan } = SunmiScanner;

  console.log(isBinsFound)

  useEffect(() => {
    getStorage('token', setToken);
  }, [])

  useEffect(() => {
    startScan();
    DeviceEventEmitter.addListener('ScanDataReceived', data => {
      setBarcode(data.code);
    });


    return () => {
      stopScan();
      DeviceEventEmitter.removeAllListeners('ScanDataReceived');
    };
  }, [isFocused, !isBinsFound]);


  const renderItem = ({ item, index }) => (
    <View className="flex-row border border-tb rounded-lg mt-2.5 p-4" key={index}>
      <Text
        className="flex-1 text-black text-center"
        numberOfLines={1}>
        {item.bin_id}
      </Text>
      <Text
        className="flex-1 text-black text-center"
        numberOfLines={1}>
        {item.gondola_id}
      </Text>
    </View>
  );

  if (barcode && Boolean(bins)) {
    const binItem = bins.find(item => item.bin_id === barcode);
    if (binItem) {
      navigation.push('ShelveArticle', { ...route.params, bins: { bin_id: binItem.bin_id, gondola_id: binItem.gondola_id } });
      setBarcode('');
    } else {
      toast('Bin not found!');
      setBarcode('');
    }
  }

  console.log('Bin details screen');

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
          {isBinsFound ?
            (<View className="table h-full pb-2">
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
              />
            </View>
            )
            : (
              <View className="h-full justify-center pb-2">
                <EmptyBox />
                <Text className="text-xl font-bold text-center mb-5">
                  No bins found for this product
                </Text>
                <View className="button mb-20">
                  <ButtonLg title="Assign to bin" onPress={() => navigation.push('AssignToBin', { code, description, quantity })} />
                </View>
              </View>
            )
          }
        </View>


      </View>
    </SafeAreaView>
  );
};

export default BinDetails;
