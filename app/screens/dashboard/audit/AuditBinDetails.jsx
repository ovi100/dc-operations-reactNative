import React, { useCallback, useEffect, useState } from 'react';
import {
  ActivityIndicator, DeviceEventEmitter, FlatList, KeyboardAvoidingView,
  Platform, SafeAreaView, ScrollView, Text, TouchableHighlight, View
} from 'react-native';
import { mergeInventory } from './formatData';
import useBackHandler from '../../../../hooks/useBackHandler';
import SunmiScanner from '../../../../utils/sunmi/scanner';
import { getStorage } from '../../../../hooks/useStorage';

const AuditBinDetails = ({ navigation, route }) => {
  const { code, articles } = route.params;
  const [article] = mergeInventory(articles);
  const bins = article.bins;
  const [pressMode, setPressMode] = useState(false);
  const [flatListFooterVisible, setFlatListFooterVisible] = useState(true);
  const [barcode, setBarcode] = useState('');
  const tableHeader = ['Bin Number', 'Quantity'];
  const { startScan, stopScan } = SunmiScanner;

  // Custom hook to navigate screen
  useBackHandler('Audit');

  useEffect(() => {
    const getAsyncStorage = async () => {
      await getStorage('pressMode', setPressMode);
    }
    getAsyncStorage();
  }, []);

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

  // console.log('Bin Details', bins);

  return (
    <SafeAreaView className="flex-1 bg-white pt-8">
      <View className="flex-1 px-4">
        <View className="screen-header mb-4">
          <View className="text items-center">
            {pressMode === 'true' ? (
              <TouchableHighlight onPress={() => null}>
                <Text className="text-lg text-sh font-medium capitalize">
                  article{' ' + code}
                </Text>
              </TouchableHighlight>
            ) : (
              <Text className="text-lg text-sh font-medium capitalize">
                article{' ' + code}
              </Text>
            )}
            <Text className="text-base text-sh text-right font-medium capitalize">
              {article.description}
            </Text>
          </View>
        </View>

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
    </SafeAreaView>
  )
}

export default AuditBinDetails;
