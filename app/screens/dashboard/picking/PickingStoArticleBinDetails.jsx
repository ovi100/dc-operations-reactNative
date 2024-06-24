import React, { useEffect, useState } from 'react';
import { DeviceEventEmitter, FlatList, SafeAreaView, Text, View } from 'react-native';
import Toast from 'react-native-toast-message';
import CustomToast from '../../../../components/CustomToast';
import useBackHandler from '../../../../hooks/useBackHandler';
import SunmiScanner from '../../../../utils/sunmi/scanner';

const BinDetails = ({ navigation, route }) => {
  const { material, description, bins } = route.params;
  const tableHeader = ['Bin ID', 'Quantity'];
  const [barcode, setBarcode] = useState('');
  const { startScan, stopScan } = SunmiScanner;

  // Custom hook to navigate screen
  useBackHandler('PickingSto', route.params);

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

  const renderItem = ({ item, index }) => (
    <View className="flex-row justify-between border border-tb rounded-lg mt-2.5 p-4" key={index}>
      <Text
        className="text-black text-center"
        numberOfLines={1}>
        {item.bin}
      </Text>
      <Text
        className="text-black text-center"
        numberOfLines={1}>
        {item.quantity}
      </Text>
    </View>
  );

  const sortedBins = bins?.sort((a, b) => b.quantity - a.quantity);

  if (barcode) {
    const binItem = bins.find(item => item.bin === barcode);
    if (binItem) {
      navigation.replace('PickingStoArticle', { ...route.params, bins: binItem });
    } else {
      Toast.show({
        type: 'customError',
        text1: 'Bin number not found!',
      });
    }
    setBarcode('');
  }

  return (
    <SafeAreaView className="flex-1 bg-white pt-8">
      <View className="flex-1 px-4">
        <View className="screen-header flex-row items-center justify-center mb-4">
          <View className="text">
            <View className="flex-row">
              <Text className="text-base text-sh font-medium capitalize">
                Bins for article
              </Text>
              <Text className="text-base text-sh font-bold capitalize">
                {' ' + material}
              </Text>
            </View>
            <Text className="text-sm text-sh text-center font-medium capitalize">
              {description}
            </Text>
          </View>
        </View>

        <View className="content flex-1 justify-between py-5">
          {bins?.length > 0 ? (
            <View className="table h-full pb-2">
              <View className="flex-row justify-between bg-th text-center mb-2 py-2 px-4">
                {tableHeader.map(th => (
                  <Text className="text-white text-center font-bold" key={th}>
                    {th}
                  </Text>
                ))}
              </View>
              <FlatList
                data={sortedBins}
                renderItem={renderItem}
                keyExtractor={item => item.bin}
              />
            </View>
          ) : (
            <View className="h-full justify-center pb-2">
              <Text className="text-xl font-bold text-center mb-5">
                No bins found for this product
              </Text>
            </View>
          )
          }
        </View>
      </View>
      <CustomToast />
    </SafeAreaView>
  );
};

export default BinDetails;
