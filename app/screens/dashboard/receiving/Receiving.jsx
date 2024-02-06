import React from 'react';
import { SafeAreaView, Text, View } from 'react-native';
import { ButtonBack } from '../../../../components/buttons';
import Table from '../../../../components/table';
import { poList } from '../../../../constant/data';

const Receiving = ({ navigation }) => {
  const tableHeader = ['Purchase Order ID', 'SKU'];
  const dataFields = ['id', 'sku'];


  return (
    <SafeAreaView className="flex-1 bg-white pt-8">
      <View className="flex-1 px-4">
        <View className="screen-header flex-row items-center mb-4">
          <ButtonBack navigation={navigation} />
          <Text className="text-lg flex-1 text-sh text-center font-semibold capitalize">
            receiving screen
          </Text>
        </View>

        <View className="content">
          <Table
            header={tableHeader}
            data={poList}
            dataFields={dataFields}
            navigation={navigation}
            routeName="PurchaseOrder"
          />
        </View>
      </View>
    </SafeAreaView>
  );
};

export default Receiving;
