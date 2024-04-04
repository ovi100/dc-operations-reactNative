import { useIsFocused } from '@react-navigation/native';
import React, { useEffect, useState } from 'react';
import { Alert, DeviceEventEmitter, FlatList, SafeAreaView, Text, View } from 'react-native';
import Toast from 'react-native-toast-message';
import CustomToast from '../../../../components/CustomToast';
import EmptyBox from '../../../../components/animations/EmptyBox';
import { ButtonLg } from '../../../../components/buttons';
import SunmiScanner from '../../../../utils/sunmi/scanner';

const BinDetails = ({ navigation, route }) => {
  const isFocused = useIsFocused();
  const { bins, code, description } = route.params;
  const tableHeader = ['Bin ID', 'Gondola ID'];
  const [barcode, setBarcode] = useState('');
  const isBinsFound = Boolean(bins.length);
  const { startScan, stopScan } = SunmiScanner;

  useEffect(() => {
    startScan();
    DeviceEventEmitter.addListener('ScanDataReceived', data => {
      console.log(data.code)
      setBarcode(data.code);
    });

    return () => {
      stopScan();
      DeviceEventEmitter.removeAllListeners('ScanDataReceived');
    };
  }, [isFocused]);

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

  const assignToNew = () => {
    navigation.replace('AssignToBin', { ...route.params })
  }

  if (barcode !== '') {
    const binItem = bins.find(item => item.bin_id === barcode);
    if (binItem) {
      navigation.replace('ShelveArticle', { ...route.params, bins: { bin_id: binItem.bin_id, gondola_id: binItem.gondola_id } });
    } else {
      const isBinExist = async (code) => {
        await fetch(`https://shelves-backend.onrender.com/api/bins/checkBin/${code}`)
          .then(res => res.json())
          .then(result => {
            if (result.status) {
              Alert.alert('Are you sure?', 'assign to new bin', [
                {
                  text: 'Cancel',
                  onPress: () => null,
                  style: 'cancel',
                },
                { text: 'OK', onPress: () => assignToNew() },
              ]);
            } else {
              Toast.show({
                type: 'customError',
                text1: result.message,
              });
            }
          });
      };
      isBinExist(barcode);
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
                  <ButtonLg title="Assign to bin" onPress={() => navigation.replace('AssignToBin', { ...route.params })} />
                </View>
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
