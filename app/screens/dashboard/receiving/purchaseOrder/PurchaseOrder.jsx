import React from 'react';
import {SafeAreaView, Text, View} from 'react-native';
import {ButtonBack} from '../../../../../components/buttons';
import Table from '../../../../../components/table';
import {articles} from '../../../../../constant/data';

const PurchaseOrder = ({navigation, route}) => {
  const tableHeader = ['Article ID', 'Article Name', 'Quantity'];
  const dataFields = ['id', 'name', 'quantity'];

  console.log(route.params);
  const {id} = route.params;

  console.log('receiving--> po id', id);

  return (
    <SafeAreaView className="flex-1 bg-white pt-14">
      <View className="flex-1 h-full px-4">
        <View className="screen-header flex-row items-center mb-4">
          <ButtonBack navigation={navigation} />
          <Text className="flex-1 text-lg text-sh text-center font-semibold capitalize">
            purchase order {id}
          </Text>
        </View>
        <View className="content flex-1 justify-between py-5">
          <Table
            header={tableHeader}
            data={articles}
            dataFields={dataFields}
            navigation={navigation}
            routeName="PoArticles"
          />
        </View>
      </View>
    </SafeAreaView>
  );
};

export default PurchaseOrder;
