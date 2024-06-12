import React, { useEffect, useState } from 'react';
import {
  ActivityIndicator,
  FlatList,
  Image,
  Keyboard,
  SafeAreaView,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from 'react-native';
import Toast from 'react-native-toast-message';
import CustomToast from '../../../../components/CustomToast';
import { ButtonBack } from '../../../../components/buttons';
import { BoxIcon, ClosedBoxIcon, EmptyBoxIcon } from '../../../../constant/icons';
import { getStorage } from '../../../../hooks/useStorage';

const Audit = ({ navigation }) => {
  const [user, setUser] = useState({});
  const [token, setToken] = useState('');
  const [shelveData, setShelveData] = useState([]);
  const [searchResult, setSearchResult] = useState(null);
  const [isLoading, setIsLoading] = useState(false);
  const API_URL = 'https://shwapnooperation.onrender.com/api/inventory?filterBy=material&';
  const [searchQuery, setSearchQuery] = useState('');

  useEffect(() => {
    const getAsyncStorage = async () => {
      await getStorage('token', setToken);
      await getStorage('user', setUser, 'object');
    };
    getAsyncStorage();
  }, []);

  const mergeQuantities = (data) => {
    let mergedItems = {};

    data.forEach(item => {
      const key = item.material + '_' + item.site;

      if (mergedItems[key]) {
        mergedItems[key].quantity += item.quantity;
        mergedItems[key].onHold += item.onHold;
      } else {
        mergedItems[key] = {
          material: item.material,
          description: item.description,
          quantity: item.quantity,
          onHold: item.onHold,
          site: item.site,
          bin: item.bin,
          key: key,
        };
      }
    });

    return Object.values(mergedItems);
  }

  const fetchData = async () => {
    setSearchResult(null);
    setShelveData([]);
    if (searchQuery.trim() === '') {
      return;
    }
    setIsLoading(true);

    try {
      const response = await fetch(API_URL + `value=${searchQuery}`, {
        method: 'GET',
        headers: {
          authorization: token,
          'Content-Type': 'application/json',
        },
      });

      const data = await response.json();

      if (data.status) {
        const filteredData = data.items.filter(item => item.site === user.site);
        setShelveData(filteredData);
        const mergedData = mergeQuantities(filteredData);
        setSearchResult(mergedData);
      } else {
        setSearchResult([]);
        Toast.show({
          type: 'customError',
          text1: data.message,
        });
      }
    } catch (error) {
      Toast.show({
        type: 'customError',
        text1: data.message,
      });
    } finally {
      setIsLoading(false);
      Keyboard.dismiss();
    }
  };

  const topHeader = () => (
    <View className="border-gray-200 border-b  py-2 bg-th">
      <View className={`flex-row justify-around  items-center px-3`}>
        <Text className={` text-white  font-bold`}>Quantity</Text>
        <Text className={` text-white  font-bold`}>Site</Text>
      </View>
    </View>
  );

  const renderTopItem = ({ item }) => (
    <View
      className={`flex-row mx-2 justify-around  border-b border-gray-200 py-2 items-center`}>
      <Text className={`px-2 text-black font-medium`}>{item.quantity}</Text>
      <Text className={`px-2 text-black font-medium`}>{item.site}</Text>
    </View>
  );

  const renderDetailedItem = ({ item }) => (
    <View
      className={`flex-row mx-2 justify-between  border-b border-gray-200 py-3 items-center`}>
      <Text className={`px-2 text-sm text-black font-medium`}>{item.gondola}</Text>
      <Text className={`px-2 text-sm text-black font-medium `}>{item.bin}</Text>
      <Text className={`px-2 text-sm text-black font-medium w-16`}>
        {item.quantity}
      </Text>
    </View>
  );

  const detailedHeader = () => (
    <View className="border-gray-200 border-b  py-2 bg-th">
      <View className={`flex-row justify-between  items-center px-2`}>
        <Text className={`px-2 text-white  font-bold`}>Gondola</Text>
        <Text className={`px2 text-white   font-bold`}>Bin</Text>
        <Text className={`px-2 text-white  font-bold`}>Quantity</Text>
      </View>
    </View>
  );

  const handleSearchQuery = e => {
    setSearchQuery(e);
  };

  return (
    <SafeAreaView className="flex-1 bg-white pt-8">
      <View className="h-full px-4">
        <View className="screen-header flex flex-row items-center justify-between mb-4">
          <ButtonBack navigation={navigation} />
          <Text className="text-lg text-sh text-center font-semibold capitalize">
            Audit
          </Text>
          <Text className="invisible mx-2"></Text>
        </View>
        <View style={{ flex: 1 }}>
          {/* Search Box */}
          <View className="search flex-row">
            <View className="input-box w-4/5">
              <TextInput
                className="bg-[#F5F6FA] text-black rounded-bl-lg rounded-tl-lg px-4"
                placeholder="Search by purchase order"
                keyboardType="phone-pad"
                placeholderTextColor="#CBC9D9"
                selectionColor="#CBC9D9"
                onChangeText={(e) => handleSearchQuery(e)}
                value={searchQuery}
              />
            </View>
            <View className="button w-1/5">
              <TouchableOpacity onPress={() => fetchData()}>
                <Text className="text-base bg-blue-600 text-white text-center rounded-tr-lg rounded-br-lg font-semibold py-3">
                  search
                </Text>
              </TouchableOpacity>
            </View>
          </View>

          {isLoading && (
            <View className="w-full h-[500px] justify-center px-3">
              <ActivityIndicator size="large" color="#EB4B50" />
              <Text className="mt-4 text-gray-400 text-base text-center">
                Loading audit data. Please wait......
              </Text>
            </View>
          )}

          {searchQuery && searchResult?.length > 0 && (
            <View>
              <View className="flex gap-3 justify-center items-center mt-2 mb-2">
                <Text className="text-slate-500 font-medium text-sm bg-slate-100 px-3 py-1 rounded-full">
                  {searchResult[0].material}
                </Text>
                <Text className="text-slate-900 font-medium text-xl">
                  {searchResult[0].description}
                </Text>
              </View>
              <View className="flex flex-row justify-start items-center gap-2  mt-4 mb-2">
                <Image className="w-6 h-6" source={BoxIcon} />
                <Text className="text-slate-800 font-medium text-base">
                  Summary View
                </Text>
              </View>
              <View className="border border-gray-600 rounded">
                <FlatList
                  data={searchResult}
                  renderItem={renderTopItem}
                  keyExtractor={item => item.key}
                  ListHeaderComponent={topHeader}
                />
              </View>

              <View className="flex flex-row justify-start items-center gap-2  mt-4 mb-2">
                <Image className='w-6 h-6' source={BoxIcon} />
                <Text className="text-slate-800 font-medium text-base">Detailed View</Text>

              </View>
              <View className="border border-gray-600 rounded">
                <FlatList
                  data={shelveData}
                  renderItem={renderDetailedItem}
                  keyExtractor={item => {
                    `${item.gondola} + ${item.bin} + ${item.quantity}`;
                  }}
                  ListHeaderComponent={detailedHeader}
                />
              </View>
            </View>
          )}

          {searchQuery && searchResult?.length === 0 && (
            <View className="flex justify-center items-center gap-3 mt-10">
              <Image className='w-32 h-32' source={EmptyBoxIcon} />
              <Text className="text-black text-lg font-medium">No Product found</Text>
            </View>
          )}

          {!isLoading && searchResult === null && (
            <View className="flex justify-center items-center gap-3 mt-10">
              <Image className='w-32 h-32' source={ClosedBoxIcon} />
              <Text className="text-black text-lg font-medium">Search and Audit Products</Text>
            </View>
          )}
        </View>
      </View>
      <CustomToast />
    </SafeAreaView>
  );
};

export default Audit;