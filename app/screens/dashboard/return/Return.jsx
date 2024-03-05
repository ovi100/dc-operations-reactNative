import { CommonActions } from '@react-navigation/native';
import { useEffect, useState } from 'react';
import {
  DeviceEventEmitter,
  FlatList,
  Platform,
  SafeAreaView,
  Text,
  View
} from 'react-native';
import { articles } from '../../../../constant/data';
import { toast } from '../../../../utils';
import SunmiScanner from '../../../../utils/sunmi/scanner';

const Return = ({ navigation }) => {
  const { startScan, stopScan } = SunmiScanner;
  const [barcode, setBarcode] = useState('');
  const tableHeader = ['Article ID', 'Article Name', 'Outlet', 'Quantity'];

  useEffect(() => {
    if (Platform.constants.Manufacturer === 'SUNMI') {
      startScan();
      DeviceEventEmitter.addListener('ScanDataReceived', data => {
        setBarcode(data.code);
        navigation.dispatch(CommonActions.setParams({}));
      });

      return () => {
        stopScan();
        DeviceEventEmitter.removeAllListeners('ScanDataReceived');
      };
    } else {
      console.log('Device do not have scanner')
    }
  }, [Platform]);

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
    const article = articles.find(item => String(item.barcode) === String(barcode));
    if (article) {
      navigation.push('ReturnDetails', article);
      setBarcode('');
    } else {
      toast('Barcode not found!');
      setBarcode('');
    }
  }

  return (
    <SafeAreaView className="flex-1 bg-white pt-14">
      <View className="flex-1 px-4">
        <View className="screen-header flex-row items-center mb-4">
          <Text className="text-lg flex-1 text-sh text-center font-semibold capitalize">
            return
          </Text>
        </View>

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
