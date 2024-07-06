import { FlatList, SafeAreaView, Text, View } from 'react-native';
import { ButtonLg, ButtonProfile } from '../../../../components/buttons';
import { dnList } from '../../../../constant/data';
import { useLayoutEffect } from 'react';
import FalseHeader from '../../../../components/FalseHeader';

const DeliveryNote = ({ navigation, route }) => {
  const tableHeader = ['DN ID', 'Outlet', 'Packed Qnt', 'Order Qnt'];
  const dataFields = ['id', 'outlet', 'packed_quantity', 'order_quantity'];

  useLayoutEffect(() => {
    let screenOptions = {
      headerBackVisible: true,
      headerTitle: 'Delivery Note',
      headerTitleAlign: 'center',
      headerRight: () => (
        <ButtonProfile onPress={() => navigation.replace('Profile', { screen: route.name, data: null })} />
      ),
    };
    navigation.setOptions(screenOptions);
  }, [navigation.isFocused()]);

  const renderItem = ({ item, index }) => (
    <View
      key={index}
      className="flex-row items-center justify-between border border-tb rounded-lg mt-2.5 p-3">
      <Text className="w-1/4 text-sm text-black text-center" numberOfLines={1}>
        {item.id}
      </Text>
      <Text className="w-1/4 text-sm text-black text-center" numberOfLines={1}>
        {item.id}
      </Text>
      <Text className="w-1/4 text-sm text-black text-center" numberOfLines={1}>
        {item.id}
      </Text>
      <Text className="w-1/4 text-sm text-black text-center" numberOfLines={1}>
        {item.id}
      </Text>
    </View>
  );

  const generateDN = () => {
    alert('DN generate successfully');
  };

  return (
    <SafeAreaView className="flex-1 bg-white">
      <View className="flex-1 h-full px-4">
        <FalseHeader />
        <View className="content flex-1 justify-between py-2">
          <View className="table">
            <View className="flex-row bg-th mb-2 py-2 px-3">
              {tableHeader.map(th => (
                <Text
                  className="w-1/4 text-white text-center font-bold"
                  key={th}>
                  {th}
                </Text>
              ))}
            </View>
            <FlatList
              data={dnList}
              renderItem={renderItem}
              keyExtractor={item => item.id}
              initialNumToRender={10}
            />
          </View>
          <View className="button">
            <ButtonLg
              title="Generate Delivery Note"
              onPress={() => generateDN()}
            />
          </View>
        </View>
      </View>
    </SafeAreaView>
  );
};

export default DeliveryNote;
