import { HeaderBackButton } from '@react-navigation/elements';
import React, { useCallback, useEffect, useLayoutEffect, useState } from 'react';
import {
  ActivityIndicator, DeviceEventEmitter, FlatList,
  SafeAreaView, Text, TouchableHighlight, View
} from 'react-native';
import Toast from 'react-native-toast-message';
import CustomToast from '../../../../components/CustomToast';
import useBackHandler from '../../../../hooks/useBackHandler';
import SunmiScanner from '../../../../utils/sunmi/scanner';
import { mergeInventory } from './formatData';
import { ButtonProfile } from '../../../../components/buttons';
import FalseHeader from '../../../../components/FalseHeader';

const AuditArticleDetails = ({ navigation, route }) => {
  const { screen, material, description, bin, quantity, tracking, articles } = route.params;
  const [article] = mergeInventory(articles);
  const bins = article?.bins ? article.bins : [{ bin, quantity }];
  const [flatListFooterVisible, setFlatListFooterVisible] = useState(true);
  const [barcode, setBarcode] = useState('');
  const tableHeader = ['Bin Number', 'Quantity'];
  const { startScan, stopScan } = SunmiScanner;

  // Custom hook to navigate screen
  if (screen) {
    useBackHandler(screen, route.params);
  } else {
    useBackHandler('Audit');
  }

  const screenHeader = () => (
    <View className="screen-header bg-white flex-row items-center justify-between py-2 pr-3">
      <HeaderBackButton onPress={() => {
        if (screen) {
          navigation.replace(screen, route.params);
        } else {
          navigation.replace('Audit');
        }
      }} />
      <View className="text">
        <Text className="text-base text-sh text-center font-medium capitalize">
          article{' ' + material}
        </Text>
        <Text className="text-sm text-sh text-right font-medium capitalize">
          {article?.description ? article?.description : description}
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

  const handleEndReached = useCallback(() => {
    setFlatListFooterVisible(false);
  }, []);

  const renderFooter = () => {
    if (!flatListFooterVisible) return null;

    return (
      <ActivityIndicator size="large" color="#000" />
    );
  };

  const renderItem = ({ item, index }) => (
    <View
      key={index}
      className="flex-row items-center border border-tb rounded-lg mt-2.5 p-4"
    >
      <View className="w-1/2">
        <Text className="text-black text-center" numberOfLines={1}>
          {item.bin}
        </Text>
      </View>
      <View className="w-1/2">
        <Text className="text-black text-center" numberOfLines={1}>
          {item.quantity}
        </Text>
      </View>
    </View>
  );


  if (barcode) {
    const binItem = bins.find(item => item.bin === barcode);
    if (binItem) {
      navigation.replace('AuditBatchList', {
        material,
        description: article?.description ? article.description : description,
        bin: binItem.bin,
        tracking: binItem?.tracking ? binItem.tracking : tracking,
        ...route.params
      });
    } else {
      Toast.show({
        type: 'customError',
        text1: 'Bin not found',
      });
    }
  }

  // console.log('Article route data', route.params);

  return (
    <SafeAreaView className="flex-1 bg-white">
      <View className="flex-1 mt-2 px-4">
        <FalseHeader />
        <View className="content flex-1 justify-between pb-2">
          <View className="table h-[90%]">
            <View className="table-header flex-row bg-th text-center mb-2 px-4 py-2">
              {tableHeader.map(th => (
                <Text className="w-1/2 text-white text-center font-bold" key={th}>
                  {th}
                </Text>
              ))}
            </View>
            <FlatList
              data={bins}
              renderItem={renderItem}
              keyExtractor={item => item.bin}
              initialNumToRender={10}
              onEndReached={handleEndReached}
              ListFooterComponent={bins.length > 10 ? renderFooter : null}
              ListFooterComponentStyle={{ paddingVertical: 15 }}
            />
          </View>
        </View>
      </View>
      <CustomToast />
    </SafeAreaView>
  )
}

export default AuditArticleDetails;
