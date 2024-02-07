import { useFocusEffect } from '@react-navigation/native';
import React, { useCallback, useState } from 'react';
import { Keyboard, SafeAreaView, Text, TextInput, View } from 'react-native';
import { ButtonBack } from '../../../../components/buttons';
import Table from '../../../../components/table';
import { poList } from '../../../../constant/data';

const Receiving = ({ navigation }) => {
  const [barcode, setBarcode] = useState('');
  const tableHeader = ['Purchase Order ID', 'SKU'];
  const dataFields = ['id', 'sku'];

  useFocusEffect(
    useCallback(() => {
      Keyboard.dismiss();
    }, [])
  );

  if (barcode.length == 11) {
    navigation.push('PurchaseOrder', { po_id: barcode });
    setBarcode('')
  }

  console.log(barcode)


  return (
    <SafeAreaView className="flex-1 bg-white pt-8">
      <View className="flex-1 px-4">
        <View className="screen-header flex-row items-center mb-4">
          <ButtonBack navigation={navigation} />
          <Text className="text-lg flex-1 text-sh text-center font-semibold capitalize">
            receiving screen
          </Text>
        </View>
        <View className="content flex-1 justify-between py-5">
          <Table
            header={tableHeader}
            data={poList}
            dataFields={dataFields}
            navigation={navigation}
          />
          <TextInput
            className="h-0 border-0 text-center"
            caretHidden={true}
            autoFocus={true}
            value={barcode}
            onChangeText={data => setBarcode(data)}
          />
        </View>
      </View>
    </SafeAreaView>
  );
};

export default Receiving;