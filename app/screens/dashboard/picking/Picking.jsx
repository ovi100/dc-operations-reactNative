import React, {useState} from 'react';
import {Image, SafeAreaView, Text, TouchableOpacity, View} from 'react-native';
import {ButtonBack} from '../../../../components/buttons';
import Table from '../../../../components/table';
import {stoList} from '../../../../constant/data';
import {NotPickingIcon, PickingIcon} from '../../../../constant/icons';

const Picking = ({navigation}) => {
  const pickedInfo = [
    {
      id: 1,
      name: 'not picked',
      count: 150,
      icon: NotPickingIcon,
    },
    {
      id: 2,
      name: 'picked',
      count: 249,
      icon: PickingIcon,
    },
  ];
  const [active, setActive] = useState(pickedInfo[0]);
  const tableHeader = ['STO ID', 'SKU', 'Outlet Name', 'Status'];
  const dataFields = ['id', 'sku', 'outlet', 'status'];

  const notPickedData = stoList.filter(data => data.status !== 'picked');
  const pickedData = stoList.filter(data => data.status === 'picked');

  return (
    <SafeAreaView className="flex-1 bg-white pt-8">
      <View className="flex-1 px-4">
        <View className="screen-header flex-row items-center mb-4">
          <ButtonBack navigation={navigation} />
          <Text className="text-lg flex-1 text-sh text-center font-semibold capitalize">
            picking
          </Text>
        </View>

        <View className="tab-header flex-row items-center justify-between bg-gray-50 rounded-full p-1.5 mb-4">
          {pickedInfo.map(item => (
            <TouchableOpacity
              key={item.id}
              onPress={() => setActive(item)}
              className={`w-1/2 ${
                active.name === item.name
                  ? 'bg-[#F6FEFF] border border-gray-200 rounded-full'
                  : ''
              } p-1.5`}>
              <View className="item-box flex-row items-center justify-center">
                <Image className="w-8 h-8" source={item.icon} />
                <Text className="text-sm text-sh font-semibold mx-1.5">
                  {item.count}
                </Text>
                <Text className="text-sm text-sh capitalize">{item.name}</Text>
              </View>
            </TouchableOpacity>
          ))}
        </View>

        <View className="tab-content">
          {active.name === 'not picked' && notPickedData.length && (
            <Table
              header={tableHeader}
              data={notPickedData}
              dataFields={dataFields}
              navigation={navigation}
              routeName="PickingSto"
            />
          )}

          {active.name === 'picked' && pickedData.length && (
            <Table
              header={tableHeader}
              data={pickedData}
              dataFields={dataFields}
              navigation={navigation}
            />
          )}
        </View>
      </View>
    </SafeAreaView>
  );
};

export default Picking;
