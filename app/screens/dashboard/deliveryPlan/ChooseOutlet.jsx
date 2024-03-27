import CheckBox from '@react-native-community/checkbox';
import { useFocusEffect, useIsFocused } from '@react-navigation/native';
import React, { useCallback, useEffect, useState } from 'react';
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
import { toast } from '../../../../utils';

const ChooseOutlet = ({ navigation }) => {
  const isFocused = useIsFocused();
  const [isLoading, setIsLoading] = useState(false);
  const [isButtonLoading, setIsButtonLoading] = useState(false);
  const [refreshing, setRefreshing] = useState(false);
  const [token, setToken] = useState('');
  let [outlets, setOutlets] = useState([]);
  const [selectedList, setSelectedList] = useState('');
  const [search, setSearch] = useState('');
  const tableHeader = ['Code', 'Name', 'District'];
  const API_URL = 'https://shwapnooperation.onrender.com/bapi/outlet';

  useEffect(() => {
    getStorage('token', setToken);
    setSelectedList([]);
    setSearch('');
  }, [isFocused]);

  const getOutlets = async () => {
    setIsLoading(true);
    try {
      await fetch(API_URL, {
        method: 'GET',
        headers: {
          authorization: token,
        },
      })
        .then(response => response.json())
        .then(data => {
          if (data.status) {
            const serverData = data.outlets;
            setOutlets(serverData);
            setIsLoading(false);
            setRefreshing(false);
          } else {
            toast(data.message);
            setIsLoading(false);
            setRefreshing(false);
          }
        })
        .catch(error => toast(error.message));
    } catch (error) {
      toast(error.message)
    }
  };

  useFocusEffect(
    useCallback(() => {
      if (token) {
        getOutlets();
      }
    }, [token, refreshing])
  );

  const onRefresh = () => {
    setRefreshing(true);
  };

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


  const getDeliveryNote = () => {
    setIsButtonLoading(true);
    navigation.navigate('DeliveryPlan', selectedList);
    uncheckAll();
    setSearch('');
    setIsButtonLoading(false);
  };

  if (search) {
    outlets = outlets.filter(outlet =>
      outlet.code.toLowerCase().includes(search.trim().toLowerCase())
    );
  }


  // console.log('search', search);
  // console.log('outlets', outlets);

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
    <SafeAreaView className="flex-1 bg-white pt-8">
      <View className="flex-1 h-full px-4">
        <View className="screen-header flex-row items-center mb-4">
          <ButtonBack navigation={navigation} />
          <Text className="flex-1 text-lg text-sh text-center font-semibold capitalize">
            choose outlet
          </Text>
        </View>
        {/* Search filter */}
        <View className="search flex-row">
          <View className="input-box relative flex-1">
            <Image className="absolute top-3 left-3 z-10" source={SearchIcon} />
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
        <View className="content mt-3">
          {/* Table data */}
          <View className={`table ${selectedList.length > 0 ? 'h-[68vh]' : 'h-[77vh]'}`}>
            <View className="flex-row bg-th text-center mb-2 py-2">
              {tableHeader.map((th, i) => (
                <Text
                  className="flex-1 text-white text-center font-bold"
                  key={i}>
                  {th}
                </Text>
              ))}
            </View>
            <FlatList
              data={outlets}
              renderItem={renderItem}
              keyExtractor={item => item.code}
              initialNumToRender={15}
              refreshControl={
                <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
              }
            />
          </View>
          {selectedList.length > 0 && (
            <View className="button">
              {isButtonLoading ? <ButtonLoading styles='bg-theme rounded-md p-5' /> :
                <ButtonLg
                  title="Confirm"
                  onPress={() => getDeliveryNote()}
                />
              }
            </View>
          )}
        </View>
      </View>
    </SafeAreaView>
  );
};

export default ChooseOutlet;
