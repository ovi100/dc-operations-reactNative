import React, { useCallback, useState } from 'react';
import {
  ActivityIndicator, FlatList, SafeAreaView,
  Text, TouchableOpacity, View
} from 'react-native';
import useBackHandler from '../../../../hooks/useBackHandler';

const AuditBatchList = ({ navigation, route }) => {
  const { material, description, bin, tracking } = route.params;
  const [flatListFooterVisible, setFlatListFooterVisible] = useState(true);
  const tableHeader = ['Exp Date', 'Batch No', 'Quantity'];
  // Custom hook to navigate screen
  useBackHandler('AuditArticleDetails', route.params);

  const handleEndReached = useCallback(() => {
    setFlatListFooterVisible(false);
  }, []);

  const renderFooter = () => {
    if (!flatListFooterVisible) return null;

    return (
      <ActivityIndicator size="large" color="#000" />
    );
  };

  // console.log('batch list', route.params);

  const renderItem = ({ item }) => (
    <TouchableOpacity onPress={() => navigation.push('AuditBatchDetails', { material, description, bin, ...item, ...route.params })}>
      <View
        key={item._id}
        className="flex-row items-center border border-tb rounded-lg mt-2.5 p-4"
      >
        <View className="w-1/3">
          <Text className="text-black text-center" numberOfLines={1}>
            {item.expiryDate ? new Date(item.expiryDate).toLocaleDateString('en-US', { dateStyle: 'medium' }) : 'Not found'}
          </Text>
        </View>
        <View className="w-1/3">
          <Text className="text-black text-center" numberOfLines={2}>
            {item.batch ? item.batch : 'Not found'}
          </Text>
        </View>
        <View className="w-1/3">
          <Text className="text-black text-center" numberOfLines={1}>
            {item.quantity}
          </Text>
        </View>
      </View>
    </TouchableOpacity>
  );

  return (
    <SafeAreaView className="flex-1 bg-white pt-8">
      <View className="flex-1 h-full px-4">
        <View className="screen-header mb-4">
          <Text className="text-lg text-sh text-center font-medium capitalize">
            article{' ' + material}
          </Text>
          <Text className="text-base text-sh text-center font-medium capitalize">
            {description}
          </Text>
          <Text className="text-base text-sh text-center font-medium">
            {bin}
          </Text>
        </View>
        <View className="content flex-1 justify-between pb-2">
          <View className="table h-[90%]">
            <View className="table-header flex-row items-center bg-th text-center mb-2 p-2">
              {tableHeader.map(th => (
                <Text className="w-1/3 text-white text-center font-bold" key={th}>
                  {th}
                </Text>
              ))}
            </View>
            <FlatList
              data={tracking}
              renderItem={renderItem}
              keyExtractor={item => item._id}
              initialNumToRender={10}
              onEndReached={handleEndReached}
              ListFooterComponent={tracking?.length > 10 ? renderFooter : null}
              ListFooterComponentStyle={{ paddingVertical: 15 }}
            />
          </View>
        </View>
      </View>
    </SafeAreaView >
  )
}

export default AuditBatchList;




