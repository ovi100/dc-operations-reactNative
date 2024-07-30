import { useEffect, useLayoutEffect, useState } from 'react';
import {
  DeviceEventEmitter,
  FlatList,
  SafeAreaView,
  Text,
  View
} from 'react-native';
import { ButtonProfile } from '../../../../components/buttons';
import { articles } from '../../../../constant/data';
import { toast } from '../../../../utils';
import SunmiScanner from '../../../../utils/sunmi/scanner';

const Return = ({ navigation, route }) => {
  const { startScan, stopScan } = SunmiScanner;
  const [barcode, setBarcode] = useState('');
  const tableHeader = ['Article ID', 'Article Name', 'Outlet', 'Quantity'];

  useLayoutEffect(() => {
    let screenOptions = {
      headerBackVisible: true,
      headerTitle: 'Return',
      headerTitleAlign: 'center',
      headerRight: () => (
        <ButtonProfile onPress={() => navigation.replace('Profile', { screen: route.name, data: null })} />
      ),
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
    <View
      key={index}
      className="flex-row border border-tb rounded-lg mt-2.5 p-4"
    // onPress={() => navigation.push('ReturnDetails', item)}
    >
      <Text className="flex-1 text-black text-center" numberOfLines={1}>
        {item.id}
      </Text>
      <Text className="flex-1 text-black text-center" numberOfLines={1}>
        {item.name}
      </Text>
      <Text className="flex-1 text-black text-center" numberOfLines={1}>
        {item.outlet}
      </Text>
      <Text className="flex-1 text-black text-center" numberOfLines={1}>
        {item.quantity}
      </Text>
    </View>
  );

  if (barcode) {
    const article = articles.find(item => item.barcode === barcode);
    if (article) {
      navigation.push('ReturnDetails', article);
      setBarcode('');
    } else {
      toast('Barcode not found!');
      setBarcode('');
    }
  }

  return (
    <SafeAreaView className="flex-1 bg-white">
      <View className="flex-1 px-4">
        <View className="content flex-1">
          <View className="h-full pb-2">
            <View className="flex-row bg-th mb-2 py-2">
              {tableHeader.map(th => (
                <Text
                  className="flex-1 text-white text-center font-bold"
                  key={th}>
                  {th}
                </Text>
              ))}
            </View>

            <FlatList
              data={articles}
              renderItem={renderItem}
              keyExtractor={item => item.id}
            />
          </View>
        </View>
      </View>
    </SafeAreaView>
  );
};

export default Return;
