import { HeaderBackButton } from '@react-navigation/elements';
import React, { useEffect, useLayoutEffect, useState } from 'react';
import { DeviceEventEmitter, FlatList, SafeAreaView, Text, View } from 'react-native';
import Toast from 'react-native-toast-message';
import CustomToast from '../../../../components/CustomToast';
import FalseHeader from '../../../../components/FalseHeader';
import { ButtonProfile } from '../../../../components/buttons';
import useBackHandler from '../../../../hooks/useBackHandler';
import SunmiScanner from '../../../../utils/sunmi/scanner';

const PickingArticleBinDetails = ({ navigation, route }) => {
  const { material, description, bins } = route.params;
  const tableHeader = ['Bin ID', 'Quantity'];
  const [barcode, setBarcode] = useState('');
  const { startScan, stopScan } = SunmiScanner;

  // Custom hook to navigate screen
  useBackHandler('PickingSto', route.params);

  const screenHeader = () => (
    <View className="screen-header bg-white flex-row items-center justify-between py-2 pr-3">
      <HeaderBackButton onPress={() => navigation.replace('PickingSto', route.params)} />
      <View className="text items-center">
        <View className="flex-row">
          <Text className="text-base text-sh font-medium capitalize">
            Bins for article
          </Text>
          <Text className="text-base text-sh font-bold capitalize">
            {' ' + material}
          </Text>
        </View>
        <Text className="text-sm text-sh text-center font-medium capitalize" numberOfLines={2}>
          {description}
        </Text>
      </View>
      <ButtonProfile onPress={() => navigation.replace('Profile', { screen: route.name, data: route.params })} />
    </View>
  );

  useLayoutEffect(() => {
    let screenOptions = {
      headerTitleAlign: 'center',
      header: () => screenHeader(),
    };
    navigation.setOptions(screenOptions);
  }, [navigation.isFocused()]);

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
      navigation.replace('PickingArticleDetails', { ...route.params, bins: binItem });
    } else {
      Toast.show({
        type: 'customError',
        text1: 'Bin number not found!',
      });
    }
    setBarcode('');
  }

  return (
    <SafeAreaView className="flex-1 bg-white">
      <View className="flex-1 px-4">
        <FalseHeader />
        <View className="content flex-1 justify-between py-2">
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

export default PickingArticleBinDetails;
