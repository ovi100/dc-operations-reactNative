import React from 'react';
import { Alert, SafeAreaView, Text, View } from 'react-native';
import { ButtonBack } from '../../../../../components/buttons';
import Table from '../../../../../components/table';
import { articles } from '../../../../../constant/data';

const PickingSto = ({ navigation, route }) => {
  const { id } = route.params;
  const tableHeader = ['Article ID', 'Article Name', 'Quantity'];
  const dataFields = ['id', 'name', 'quantity'];

  const updatePackingZone = () => {
    Alert.alert('packing zone button pressed');
  };
  return (
    <SafeAreaView className="flex-1 bg-white pt-8">
      <View className="flex-1 h-full px-4">
        <View className="screen-header flex-row items-center mb-4">
          <ButtonBack navigation={navigation} />
          <Text className="flex-1 text-lg text-sh text-center font-semibold capitalize">
            picking {' ' + id}
          </Text>
        </View>
        <View className="content flex-1 justify-around mt-5 mb-6">
          <Table
            header={tableHeader}
            data={articles}
            dataFields={dataFields}
            navigation={navigation}
            routeName="PickingStoArticle"
          />
        </View>
      </View>
    </SafeAreaView>
  );
};

export default PickingSto;
