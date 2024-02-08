import CheckBox from '@react-native-community/checkbox';
import React, { useEffect, useState } from 'react';
import {
  Alert,
  FlatList,
  Image,
  Keyboard,
  SafeAreaView,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from 'react-native';
import { ButtonBack, ButtonLg, ButtonXs } from '../../../../components/buttons';
import { stoList } from '../../../../constant/data';
import { SearchIcon } from '../../../../constant/icons';

const DeliveryPlan = ({ navigation }) => {
  const [keyboardStatus, setKeyboardStatus] = useState(false);
  let [deliveryPlanList, setDeliveryPlanList] = useState(stoList);
  const [selectedList, setSelectedList] = useState([]);
  const [isAllChecked, setIsAllChecked] = useState(false);
  const [search, setSearch] = useState('');
  const tableHeader = ['STO ID', 'SKU', 'Outlet Name', 'Status'];

  useEffect(() => {
    const showKeyboard = Keyboard.addListener('keyboardDidShow', () => {
      setKeyboardStatus(true);
    });
    const hideKeyboard = Keyboard.addListener('keyboardDidHide', () => {
      setKeyboardStatus(false);
    });

    return () => {
      showKeyboard.remove();
      hideKeyboard.remove();
    };
  }, []);

  console.log('keyboard status', keyboardStatus);

  const renderItem = ({ item }) => (
    <TouchableOpacity
      className="flex-row items-center border border-tb rounded-lg mt-2.5 p-4"
      onPress={() => handelCheckbox(item)}>
      <View className="flex-1 flex-row items-center">
        <CheckBox
          tintColors={item.selected ? '#56D342' : '#f5f5f5'}
          value={item.selected}
          onValueChange={() => handelCheckbox(item)}
        />
        <Text className="text-black" numberOfLines={1}>
          {String(item.id).slice(0, 2) + '...' + String(item.id).slice(7, item.id.length)}
        </Text>
      </View>
      <Text className="flex-1 text-black text-center" numberOfLines={1}>
        {item.sku}
      </Text>
      <Text className="flex-1 text-black text-center" numberOfLines={1}>
        {item.outlet}
      </Text>
      <Text className="flex-1 text-black text-center" numberOfLines={1}>
        {item.status}
      </Text>
    </TouchableOpacity>
  );

  const handelCheckbox = sto => {
    let newItems = deliveryPlanList.map(item =>
      sto.id === item.id ? { ...item, selected: !item.selected } : item,
    );
    setSelectedList(newItems.filter(item => item.selected));
    setDeliveryPlanList(newItems);
    Keyboard.dismiss();
  };

  const checkAll = () => {
    const checkAllData = deliveryPlanList.map(item => {
      return { ...item, selected: true };
    });
    setDeliveryPlanList(checkAllData);
    setSelectedList(checkAllData);
    setIsAllChecked(current => !current);
    Keyboard.dismiss();
  };

  const uncheckAll = () => {
    const checkAllData = deliveryPlanList.map(item => {
      return { ...item, selected: false };
    });
    setDeliveryPlanList(checkAllData);
    setSelectedList(checkAllData);
    setIsAllChecked(current => !current);
    Keyboard.dismiss();
  };

  const updateDelivery = () => {
    if (selectedList.length > 0) {
      Alert.alert(`\n Total DP ready--> ${selectedList.length}`);
      return;
    } else {
      Alert.alert('please select an item');
    }
  };

  if (search !== '') {
    deliveryPlanList = deliveryPlanList.filter(
      dp =>
        String(dp.id).toLowerCase().includes(search.toLowerCase()) ||
        dp.outlet.toLowerCase().includes(search.toLowerCase()),
    );
  }

  return (
    <SafeAreaView className="flex-1 bg-white pt-14">
      <View className="flex-1 h-full px-4">
        <View className="screen-header flex-row items-center mb-4">
          <ButtonBack navigation={navigation} />
          <Text className="flex-1 text-lg text-sh text-center font-semibold capitalize">
            delivery plan
          </Text>
        </View>

        {/* Search and Button */}
        <View className="search-button flex-row items-center gap-3">
          <View className="input-box relative flex-1">
            <Image className="absolute top-3 left-3 z-10" source={SearchIcon} />
            <TextInput
              className="bg-[#F5F6FA] h-[50px] text-[#5D80C5] rounded-lg pl-12 pr-4"
              placeholder="Search for STO/Outlet"
              placeholderTextColor="#CBC9D9"
              selectionColor="#CBC9D9"
              onChangeText={value => {
                setSearch(value);
              }}
            />
          </View>
          <View className="box-header flex-row items-center justify-between">
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
        </View>
        <View className="content flex-1 justify-around my-6">
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
              data={deliveryPlanList}
              renderItem={renderItem}
              keyExtractor={item => item.id}
            />
          </View>

          {!keyboardStatus && (
            <View className="button">
              <ButtonLg
                title="Mark as delivery ready"
                onPress={() => updateDelivery()}
              />
            </View>
          )}
        </View>
      </View>
    </SafeAreaView>
  );
};

export default DeliveryPlan;
