import { useFocusEffect } from '@react-navigation/native';
import React, { useCallback, useState } from 'react';
import { FlatList, SafeAreaView, Text, View } from 'react-native';
// import { ButtonLg } from '../../../../components/buttons';
import { getStorage } from '../../../../hooks/useStorage';

const BinDetails = ({ navigation, route }) => {
  console.log(route.params);
  const { code, description, bins } = route.params;
  const tableHeader = ['Bin ID', 'Gondola ID'];
  const [token, setToken] = useState('');
  // const API_URL = 'https://shelves-backend.onrender.com/api/bins/product/2401040/DK11';

  useFocusEffect(
    useCallback(() => {
      getStorage('token', setToken);
    }, []),
  );

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
          <View className="table h-full pb-2">
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
        </View>

        {/* <View className="button mb-3">
          <ButtonLg title="Assign to bin" onPress={() => null} />
        </View> */}
      </View>
    </SafeAreaView>
  );
};

export default BinDetails;
