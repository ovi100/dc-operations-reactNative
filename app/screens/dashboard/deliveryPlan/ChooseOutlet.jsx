
import { useFocusEffect, useIsFocused } from '@react-navigation/native';
import React, { useCallback, useEffect, useState } from 'react';
import {
  ActivityIndicator,
  FlatList,
  Image,
  RefreshControl,
  SafeAreaView,
  Text,
  TextInput,
  TouchableOpacity,
  View
} from 'react-native';
import { ButtonBack } from '../../../../components/buttons';
import { SearchIcon } from '../../../../constant/icons';
import { getStorage } from '../../../../hooks/useStorage';
import { toast } from '../../../../utils';
import ServerError from '../../../../components/animations/ServerError';

const ChooseOutlet = ({ navigation }) => {
  const isFocused = useIsFocused();
  const [isLoading, setIsLoading] = useState(false);
  const [refreshing, setRefreshing] = useState(false);
  const [token, setToken] = useState('');
  let [outlets, setOutlets] = useState([]);
  const [search, setSearch] = useState('');
  const tableHeader = ['Code', 'Name', 'District'];
  const API_URL = 'https://shwapnooperation.onrender.com/bapi/outlet';

  useEffect(() => {
    getStorage('token', setToken);
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

  const renderItem = useCallback(({ item, index }) => (
    <TouchableOpacity
      className="flex-row items-center border border-tb rounded-lg mt-2.5 p-4"
      onPress={() => selectOutlet(item)} key={index}>
      <Text className="text-black" numberOfLines={1}>
        {item.code}
      </Text>
      <Text className="flex-1 text-black text-center" numberOfLines={1}>
        {item.name}
      </Text>
      <Text className="flex-1 text-black text-center" numberOfLines={1}>
        {item.district}
      </Text>
    </TouchableOpacity>
  ), []);


  const selectOutlet = (item) => {
    if (item) {
      navigation.navigate('DeliveryPlan', { site: item.code });
      setSearch('');
    }
  };


  if (search !== '') {
    outlets = outlets.filter(outlet => outlet.code.toLowerCase().includes(search.toLowerCase()));
  }


  return (
    <SafeAreaView className="flex-1 bg-white pt-14">
      <View className="flex-1 h-full px-4">
        <View className="screen-header flex-row items-center mb-4">
          <ButtonBack navigation={navigation} />
          <Text className="flex-1 text-lg text-sh text-center font-semibold capitalize">
            choose outlet
          </Text>
        </View>
        {!isLoading && outlets.length ? (
          <>
            {/* Search and Button */}
            <View className="search-button flex-row">
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
            <View className="content flex-1 justify-around my-6">
              {/* Table data */}
              <View className="table h-[90%] pb-2">
                <View className="flex-row bg-th text-center mb-2 py-2">
                  {tableHeader.map((th, i) => (
                    <Text
                      className="flex-1 text-white text-center font-bold"
                      key={i}>
                      {th}
                    </Text>
                  ))}
                </View>
                {isLoading ? <ActivityIndicator /> : outlets.length ? (

                  <FlatList
                    data={outlets}
                    renderItem={renderItem}
                    keyExtractor={item => item.code}
                    initialNumToRender={15}
                    refreshControl={
                      <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
                    }
                  />
                ) : (
                  <ServerError message="No data found!" />
                )}
              </View>
            </View>
          </>
        ) : (
          <View className="h-3/4 justify-center">
            <ServerError message="No data found!" />
          </View>
        )}
      </View>
    </SafeAreaView>
  );
};

export default ChooseOutlet;
