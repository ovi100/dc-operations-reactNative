import CheckBox from '@react-native-community/checkbox';
import { useFocusEffect, useIsFocused } from '@react-navigation/native';
import React, { useCallback, useEffect, useMemo, useState } from 'react';
import {
  ActivityIndicator,
  FlatList,
  Image,
  Keyboard,
  RefreshControl,
  SafeAreaView,
  Text,
  TextInput,
  TouchableOpacity,
  View
} from 'react-native';
import ServerError from '../../../../components/animations/ServerError';
import { ButtonBack, ButtonLg, ButtonLoading } from '../../../../components/buttons';
import { SearchIcon } from '../../../../constant/icons';
import { getStorage } from '../../../../hooks/useStorage';
import Toast from 'react-native-toast-message';
import BottomSheet from '../../../../components/BottomSheet';
import CustomToast from '../../../../components/CustomToast';

const ChooseOutlet = ({ navigation }) => {
  const isFocused = useIsFocused();
  const [isLoading, setIsLoading] = useState(false);
  const [isButtonLoading, setIsButtonLoading] = useState(false);
  let [outlets, setOutlets] = useState([]);
  const [selectedList, setSelectedList] = useState('');
  const [search, setSearch] = useState('');
  const tableHeader = ['Code', 'Name', 'District'];
  const API_URL = 'https://shwapnooperation.onrender.com/bapi/outlet';

  useEffect(() => {
    getStorage('outlets', setOutlets, 'object');
    setSelectedList([]);
    setSearch('');
  }, [isFocused]);


  const renderItem = ({ item, index }) => (
    <TouchableOpacity
      className="flex-row items-center border border-tb rounded-lg mt-2.5 p-4"
      onPress={() => handelCheckbox(item)} key={index}>
      <View className="flex-1 flex-row items-center">
        <CheckBox
          tintColors={item.selected ? '#56D342' : '#ffffff'}
          value={item.selected}
          onValueChange={() => handelCheckbox(item)}
        />
        <Text className="text-black" numberOfLines={1}>
          {item.code}
        </Text>
      </View>
      <Text className="flex-1 text-black text-center" numberOfLines={1}>
        {item.name}
      </Text>
      <Text className="flex-1 text-black text-center" numberOfLines={1}>
        {item.district}
      </Text>
    </TouchableOpacity>
  );

  const handelCheckbox = outlet => {
    let selectedOutlets = outlets.map(item =>
      outlet.code === item.code ? { ...item, selected: !item.selected } : item,
    );
    let selectedOutletCode = selectedOutlets.filter(item => item.selected).map(item => item.code).join(',');
    setSelectedList(selectedOutletCode);
    setOutlets(selectedOutlets);
    setSearch('');
    Keyboard.dismiss();
  };

  const uncheckAll = () => {
    const checkAllData = outlets.map(item => {
      return { ...item, selected: false };
    });
    setOutlets(checkAllData);
    setSelectedList([]);
    Keyboard.dismiss();
  };

  if (search) {
    outlets = outlets.filter(outlet =>
      outlet.code.toLowerCase().includes(search.trim().toLowerCase())
    );
  }

  if (isLoading) {
    return (
      <View className="w-full h-screen justify-center px-3">
        <ActivityIndicator size="large" color="#EB4B50" />
        <Text className="mt-4 text-gray-400 text-base text-center">
          Loading outlets. Please wait......
        </Text>
      </View>
    )
  }

  if (!isLoading && !search && outlets.length === 0) {
    return (
      <View className="w-full h-screen justify-center px-3">
        <ServerError message="No data found!" />
      </View>
    )
  }

  return (
    <BottomSheet>
      <Text className="text-lg text-sh text-center font-semibold capitalize">
        choose outlet
      </Text>
      {/* Search filter */}
      <View className="search flex-row">
        <View className="input-box relative flex-1">
          <TextInput
            className="bg-[#F5F6FA] h-[50px] text-black rounded-lg pl-12 pr-4"
            placeholder="Search by outlets code"
            inputMode='text'
            placeholderTextColor="#CBC9D9"
            selectionColor="#CBC9D9"
            onChangeText={value => setSearch(value)}
            value={search}
          />
        </View>
      </View>
      <View className=''>
        <FlatList
          data={outlets}
          renderItem={renderItem}
          keyExtractor={item => item.code}
        />
      </View>
    </BottomSheet>
  );
};

export default ChooseOutlet;
