import React, { useCallback, useEffect, useState } from 'react';
import {
  ActivityIndicator, DeviceEventEmitter, FlatList, SafeAreaView,
  Text, TouchableHighlight, TouchableOpacity, View
} from 'react-native';
import { getStorage } from '../../../../hooks/useStorage';
import SunmiScanner from '../../../../utils/sunmi/scanner';
import useBackHandler from '../../../../hooks/useBackHandler';

const AuditBinList = ({ navigation, route }) => {
  const { bin, articles } = route.params;
  const [pressMode, setPressMode] = useState(false);
  const [flatListFooterVisible, setFlatListFooterVisible] = useState(true);
  const [barcode, setBarcode] = useState('');
  const tableHeader = ['Code', 'Description', 'Quantity'];
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

  // console.log('audit article list', route.params.articles);

  const renderItem = ({ item, index }) => (
    <>
      {pressMode === 'true' ? (
        <TouchableOpacity onPress={() => navigation.replace('AuditArticleDetails', { screen: 'AuditBinList', ...item, ...route.params })}>
          <View
            key={index}
            className="flex-row items-center border border-tb rounded-lg mt-2.5 p-4"
          >
            <View className="w-1/4">
              <Text className="text-black text-center" numberOfLines={1}>
                {item.material}
              </Text>
            </View>
            <View className="w-1/2 flex-1">
              <Text className="text-black text-center" numberOfLines={2}>
                {item.description}
              </Text>
            </View>
            <View className="w-1/4">
              <Text className="text-black text-center" numberOfLines={1}>
                {item.quantity}
              </Text>
            </View>
          </View>
        </TouchableOpacity>
      ) : (
        <View
          key={index}
          className="flex-row items-center border border-tb rounded-lg mt-2.5 p-4"
        >
          <View className="w-1/4">
            <Text className="text-black text-center" numberOfLines={1}>
              {item.material}
            </Text>
          </View>
          <View className="w-1/2 flex-1">
            <Text className="text-black text-center" numberOfLines={2}>
              {item.description}
            </Text>
          </View>
          <View className="w-1/4">
            <Text className="text-black text-center" numberOfLines={1}>
              {item.quantity}
            </Text>
          </View>
        </View>
      )}
    </>
  );

  return (
    <SafeAreaView className="flex-1 bg-white pt-8">
      <View className="flex-1 h-full px-4">
        <View className="screen-header flex-row items-center justify-center mb-4">
          {pressMode === 'true' ? (
            <TouchableHighlight onPress={() => null}>
              <Text className="text-lg text-sh font-semibold uppercase">
                bin {bin}
              </Text>
            </TouchableHighlight>
          ) : (
            <Text className="text-lg text-sh font-semibold uppercase">
              bin {bin}
            </Text>
          )}
        </View>
        <View className="content flex-1 justify-between pb-2">
          <View className="table h-[90%]">
            <View className="table-header flex-row bg-th text-center mb-2 p-2">
              {tableHeader.map(th => (
                <Text className={`${th === 'Description' ? 'w-1/2' : 'w-1/4'} text-white text-center font-bold`} key={th}>
                  {th}
                </Text>
              ))}
            </View>
            <FlatList
              data={articles}
              renderItem={renderItem}
              keyExtractor={item => item.material}
              initialNumToRender={10}
              onEndReached={handleEndReached}
              ListFooterComponent={articles.length > 10 ? renderFooter : null}
              ListFooterComponentStyle={{ paddingVertical: 15 }}
            />
          </View>
        </View>
      </View>
    </SafeAreaView >
  )
}

export default AuditBinList;




