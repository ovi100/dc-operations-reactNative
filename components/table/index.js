import React from 'react';
import { FlatList, Text, TouchableOpacity, View } from 'react-native';
const Table = ({header, data, dataFields, navigation, routeName = ''}) => {
  // const isStoID = header.some(item => item === 'STO ID');
  const renderItem = ({item}) => {
    if (routeName) {
      return (
        <TouchableOpacity
          className="flex-row border border-tb justify-between rounded-lg mt-2.5 p-4"
          onPress={() => navigation.push(routeName, item)}>
          {dataFields.map(dataField => (
            <Text
              className="flex-1 text-black text-center"
              numberOfLines={1}
              key={dataField}>
              {item[dataField]}
            </Text>
          ))}
        </TouchableOpacity>
      );
    } else {
      return (
        <View className="flex-row border border-tb rounded-lg mt-2.5 p-4">
          {dataFields.map((dataField, i) => (
            <Text
              className="flex-1 text-black text-center"
              key={i}
              numberOfLines={1}>
              {item[dataField]}
            </Text>
          ))}
        </View>
      );
    }
  };

  return (
    <View className="table h-full pb-2">
      <View className="flex-row bg-th text-center mb-2 py-2">
        {header.map(th => (
          <Text className="flex-1 text-white text-center font-bold" key={th}>
            {th}
          </Text>
        ))}
      </View>
      <FlatList
        data={data}
        renderItem={renderItem}
        keyExtractor={item => item.id}
      />
    </View>
  );
};

export default Table;
