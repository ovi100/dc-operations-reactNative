import { HeaderBackButton } from '@react-navigation/elements';
import React, { useCallback, useEffect, useLayoutEffect, useState } from 'react';
import {
  ActivityIndicator, DeviceEventEmitter, FlatList, SafeAreaView,
  Text,
  TouchableOpacity, View
} from 'react-native';
import Toast from 'react-native-toast-message';
import CustomToast from '../../../../components/CustomToast';
import FalseHeader from '../../../../components/FalseHeader';
import { ButtonProfile } from '../../../../components/buttons';
import useBackHandler from '../../../../hooks/useBackHandler';
import { getStorage } from '../../../../hooks/useStorage';
import SunmiScanner from '../../../../utils/sunmi/scanner';

const AuditBinList = ({ navigation, route }) => {
  const { bin, articles } = route.params;
  const [pressMode, setPressMode] = useState(false);
  const [flatListFooterVisible, setFlatListFooterVisible] = useState(true);
  const [barcode, setBarcode] = useState('');
  const tableHeader = ['Code', 'Description', 'Quantity'];
  const { startScan, stopScan } = SunmiScanner;

  // Custom hook to navigate screen
  useBackHandler('Audit');

  useLayoutEffect(() => {
    let screenOptions = {
      headerTitleAlign: 'center',
      headerTitle: `BIN ${bin}`,
      headerLeft: () => (
        <HeaderBackButton onPress={() => navigation.replace('Audit')} />
      ),
      headerRight: () => (
        <ButtonProfile onPress={() => navigation.replace('Profile', { screen: route.name, data: route.params })} />
      ),
    };
    navigation.setOptions(screenOptions);
  }, [navigation.isFocused()]);

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
      <ActivityIndicator />
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

  if (barcode && pressMode === 'true') {
    Toast.show({
      type: 'customWarn',
      text1: 'Turn off the press mode',
    });
  }

  if (barcode && pressMode !== 'true') {
    const article = articles.find(article => article.material === barcode);
    if (article) {
      navigation.replace('AuditArticleDetails', { screen: 'AuditBinList', ...article, ...route.params });
    } else {
      Toast.show({
        type: 'customError',
        text1: 'Article not found',
      });
    }
  }

  return (
    <SafeAreaView className="flex-1 bg-white">
      <View className="flex-1 h-full px-4">
        <FalseHeader />
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
              ListFooterComponentStyle={{ paddingVertical: 10 }}
            />
          </View>
        </View>
      </View>
      <CustomToast />
    </SafeAreaView >
  )
}

export default AuditBinList;




