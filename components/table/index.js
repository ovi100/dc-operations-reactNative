import { router } from "expo-router";
import { FlatList, Text, TouchableOpacity, View } from "react-native";

const Table = ({ header, data, dataFields, routePath = "" }) => {
  const hasSelectedField = dataFields.some((item) => item === "selected");

  console.log(hasSelectedField);

  const renderItem = ({ item }) => {
    if (routePath) {
      return (
        <TouchableOpacity
          className="flex-row border border-tb rounded-lg mt-2.5 p-4"
          onPress={() =>
            router.push({
              pathname: routePath,
              params: item,
            })
          }
        >
          {dataFields.map((dataField) => (
            <Text
              className="flex-1 text-center"
              key={dataField}
              numberOfLines={1}
            >
              {item[dataField]}
            </Text>
          ))}
        </TouchableOpacity>
      );
    } else {
      return (
        <View className="flex-row border border-tb rounded-lg mt-2.5 p-4">
          {dataFields.map((dataField) => (
            <Text
              className="flex-1 text-center"
              key={dataField}
              numberOfLines={1}
            >
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
        {header.map((th) => (
          <Text className="flex-1 text-white text-center font-bold" key={th}>
            {th}
          </Text>
        ))}
      </View>
      <FlatList
        data={data}
        renderItem={renderItem}
        keyExtractor={(item) => item.id}
      />
    </View>
  );
};

export default Table;
