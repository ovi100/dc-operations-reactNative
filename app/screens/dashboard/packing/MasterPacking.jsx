import CheckBox from '@react-native-community/checkbox';
import { useState } from "react";
import {
  Alert,
  FlatList,
  SafeAreaView,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';
import { ButtonBack, ButtonLg, ButtonXs } from '../../../../components/buttons';

const MasterPacking = ({ navigation }) => {
  const [isAllChecked, setIsAllChecked] = useState(false);
  const tableHeader = ["Child Pack ID", "Outlet Name", "Quantity"];
  const tableData = [
    {
      _id: "a435345ffs676",
      child_pack_id: 3475241,
      quantity: 10,
      outlet_name: "outlet name 1",
      selected: false,
    },
    {
      _id: "a435387ffs676",
      child_pack_id: 3475242,
      quantity: 5,
      outlet_name: "outlet name 2",
      selected: false,
    },
    {
      _id: "a435345ere676",
      child_pack_id: 3475243,
      quantity: 15,
      outlet_name: "outlet name 3",
      selected: false,
    },
    {
      _id: "a435345dfc676",
      child_pack_id: 3475244,
      quantity: 12,
      outlet_name: "outlet name 4",
      selected: false,
    },
    {
      _id: "a435345npm676",
      child_pack_id: 3475245,
      quantity: 20,
      outlet_name: "outlet name 5",
      selected: false,
    },
  ];

  const [MasterPackingList, setMasterPackingList] = useState(tableData);
  const [selectedList, setSelectedList] = useState([]);

  const renderItem = ({ item, index }) => (
    <TouchableOpacity
      key={index}
      className="flex-row border border-tb rounded-lg mt-2.5 p-4"
      onPress={() => handelCheckbox(item)}>
      <View className="flex-1 flex-row items-center">
        <CheckBox
          tintColors={item.selected ? '#56D342' : '#f5f5f5'}
          value={item.selected}
          onValueChange={() => handelCheckbox(item)}
        />
        <Text className="text-black" numberOfLines={1}>
          {item.child_pack_id}
        </Text>
      </View>
      <Text className="flex-1 text-center" numberOfLines={1}>
        {item.outlet_name}
      </Text>
      <Text className="flex-1 text-center" numberOfLines={1}>
        {item.quantity}
      </Text>
    </TouchableOpacity>
  );

  const handelCheckbox = (outlet) => {
    let newItems = MasterPackingList.map((item) =>
      outlet.child_pack_id === item.child_pack_id
        ? { ...item, selected: !item.selected }
        : item
    );
    setSelectedList(newItems.filter((item) => item.selected));
    setMasterPackingList(newItems);
  };

  const checkAll = () => {
    const checkAllData = MasterPackingList.map((item) => {
      return { ...item, selected: true };
    });
    setMasterPackingList(checkAllData);
    setSelectedList(checkAllData);
    setIsAllChecked((current) => !current);
  };

  const uncheckAll = () => {
    const checkAllData = MasterPackingList.map((item) => {
      return { ...item, selected: false };
    });
    setMasterPackingList(checkAllData);
    setSelectedList([]);
    setIsAllChecked((current) => !current);
  };

  const createPackingList = () => {
    if (selectedList.length > 0) {
      Alert.alert(`Totals selected items ${selectedList.length}`);
      return;
    } else {
      Alert.alert('please select an item');
    }
  };

  return (
    <SafeAreaView className="flex-1 bg-white pt-14">
      <View className="flex-1 h-full px-4">
        <View className="screen-header flex-row items-center mb-4">
          <ButtonBack navigation={navigation} />
          <Text className="flex-1 text-lg text-sh text-center font-semibold capitalize">
            create Master packing
          </Text>
          {isAllChecked ? (
            <TouchableOpacity onPress={() => uncheckAll()}>
              <ButtonXs title="uncheck all" />
            </TouchableOpacity>
          ) : (
            <TouchableOpacity onPress={() => checkAll()}>
              <ButtonXs title="check all" />
            </TouchableOpacity>
          )}
        </View>
        <View className="content flex-1 justify-around my-5">
          {/* Table data */}
          <View className="table h-full pb-2">
            <View className="flex-row bg-th text-center mb-2 py-2">
              {tableHeader.map(th => (
                <Text
                  className="flex-1 text-white text-center font-bold"
                  key={th}>
                  {th}
                </Text>
              ))}
            </View>
            <FlatList
              data={MasterPackingList}
              renderItem={renderItem}
              keyExtractor={item => item.id}
            />
          </View>
          <View className="button mt-3">
            <TouchableOpacity onPress={() => createPackingList()}>
              <ButtonLg title="Generate Master Packing List" />
            </TouchableOpacity>
          </View>
        </View>
      </View>
    </SafeAreaView>
  );
};

export default MasterPacking;