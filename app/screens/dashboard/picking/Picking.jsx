import { useFocusEffect } from '@react-navigation/native';
import React, { useCallback, useEffect, useState } from 'react';
import { ActivityIndicator, FlatList, Image, SafeAreaView, Text, TouchableOpacity, View } from 'react-native';
import Toast from 'react-native-toast-message';
import CustomToast from '../../../../components/CustomToast';
import { NotPickingIcon, PickingIcon } from '../../../../constant/icons';
import { getStorage } from '../../../../hooks/useStorage';
import { toast } from '../../../../utils';

const Picking = ({ navigation }) => {
  const [isLoading, setIsLoading] = useState(false);
  const [user, setUser] = useState({});
  const [token, setToken] = useState('');
  let [notPickedData, setNotPickedData] = useState([]);
  let [pickedData, setPickedData] = useState([]);
  const [page, setPage] = useState(1);
  const [totalPage, setTotalPage] = useState(0);
  const tableHeader = ['STO', 'SKU', 'Outlet Code', 'Status'];
  const API_URL = 'https://shwapnooperation.onrender.com/api/sto-tracking';

  useEffect(() => {
    const getUserInfo = async () => {
      setIsLoading(true);
      await getStorage('token', setToken, 'string');
      await getStorage('user', setUser, 'object');
      setIsLoading(false);
    }
    getUserInfo();
  }, []);

  const getInDnList = async () => {
    setIsLoading(true);
    try {
      await fetch(API_URL + `?pageSize=500&currentPage=${page}`, {
        method: 'GET',
        headers: {
          authorization: token,
        },
      })
        .then(response => response.json())
        .then(data => {
          if (data.status) {
            const notPicked = data.items.filter(item => item.status === 'picker assigned' || item.status === 'picker packer assigned'
              && item.supplyingPlant === user?.site);
            const picked = data.items.filter(item => item.status === 'picked');
            setNotPickedData([...notPickedData, ...notPicked]);
            setPickedData([...pickedData, ...picked]);
            setTotalPage(data.totalPages);
            setIsLoading(false);
          } else {
            Toast.show({
              type: 'customError',
              text1: data.message,
            });
            setIsLoading(false);
          }
        })
        .catch(error => toast(error.message));
    } catch (error) {
      console.log(error);
    }
  };

  useFocusEffect(
    useCallback(() => {
      if (token) {
        getInDnList();
      }
    }, [token, page])
  );

  const loadMoreItem = () => {
    if (totalPage >= page) {
      setPage(prev => prev + 1);
    } else {
      setIsLoading(false);
    }
  };

  const pickingRenderItem = ({ item, index }) => (
    <TouchableOpacity
      className="flex-row items-center border border-tb rounded-lg mt-2.5 p-4"
      key={index}
      onPress={() => navigation.push('PickingSto', item)}
    >
      <Text className="flex-1 text-black text-center" numberOfLines={1}>
        {item.sto.slice(0, 2) + '...' + item.sto.slice(7, item.sto.length)}
      </Text>
      <Text className="flex-1 text-black text-center" numberOfLines={1}>
        {item.sku}
      </Text>
      <Text className="flex-1 text-black text-center" numberOfLines={1}>
        {item.receivingPlant}
      </Text>
      <Text className="flex-1 text-black text-center uppercase" numberOfLines={1}>
        {item.status}
      </Text>
    </TouchableOpacity>
  );

  const pickedRenderItem = ({ item, index }) => (
    <TouchableOpacity
      className="flex-row items-center border border-tb rounded-lg mt-2.5 p-4"
      key={index}
      onPress={() => navigation.push('PickedSto', item)}
    >
      <Text className="flex-1 text-black text-center" numberOfLines={1}>
        {item.sto.slice(0, 2) + '...' + item.sto.slice(7, item.sto.length)}
      </Text>
      <Text className="flex-1 text-black text-center" numberOfLines={1}>
        {item.sku}
      </Text>
      <Text className="flex-1 text-black text-center" numberOfLines={1}>
        {item.receivingPlant}
      </Text>
      <Text className="flex-1 text-black text-center uppercase" numberOfLines={1}>
        {item.status}
      </Text>
    </TouchableOpacity>
  );

  notPickedData = [...new Set(notPickedData)];
  pickedData = [...new Set(pickedData)];

  let tabInfo = [
    {
      id: 1,
      name: 'not picked',
      count: notPickedData.length,
      icon: NotPickingIcon,
    },
    {
      id: 2,
      name: 'picked',
      count: pickedData.length,
      icon: PickingIcon,
    },
  ]

  const [active, setActive] = useState(tabInfo[0]);

  if (isLoading) {
    return (
      <View className="w-full h-screen justify-center px-3">
        <ActivityIndicator size="large" color="#EB4B50" />
        <Text className="mt-4 text-gray-400 text-base text-center">
          Loading picking list. Please wait......
        </Text>
      </View>
    )
  }

  return (
    <SafeAreaView className="flex-1 bg-white pt-8">
      <CustomToast />
      <View className="flex-1 px-4">
        <View className="screen-header flex-row items-center mb-4">
          <Text className="text-lg flex-1 text-sh text-center font-semibold capitalize">
            picking
          </Text>
        </View>

        <View className="tab-header flex-row items-center justify-between bg-gray-50 rounded-full p-1.5 mb-4">
          {tabInfo.map(item => (
            <TouchableOpacity
              key={item.id}
              onPress={() => setActive(item)}
              className={`w-1/2 ${active?.name === item.name
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

        <View className="tab-content flex-1 justify-between py-5">
          {active?.name === 'not picked' ? (
            <>
              {notPickedData.length ? (
                <View className="table h-full pb-2">
                  <View className="flex-row bg-th text-center mb-2 py-2">
                    {tableHeader.map(th => (
                      <Text className="flex-1 text-white text-center font-bold" key={th}>
                        {th}
                      </Text>
                    ))}
                  </View>
                  <FlatList
                    data={notPickedData}
                    renderItem={pickingRenderItem}
                    keyExtractor={item => item._id}
                    onEndReached={loadMoreItem}
                    ListFooterComponent={isLoading && <ActivityIndicator />}
                    onEndReachedThreshold={0}
                  />
                </View>
              ) : (
                <View className="h-full justify-center pb-2">
                  <Text className="text-lg font-bold text-center">
                    No item ready for picking
                  </Text>
                </View>
              )}
            </>

          ) : null}

          {active?.name === 'picked' ? (
            <>
              {pickedData.length ? (
                <View className="table h-full pb-2">
                  <View className="flex-row bg-th text-center mb-2 py-2">
                    {tableHeader.map(th => (
                      <Text className="flex-1 text-white text-center font-bold" key={th}>
                        {th}
                      </Text>
                    ))}
                  </View>
                  <FlatList
                    data={pickedData}
                    renderItem={pickedRenderItem}
                    keyExtractor={item => item._id}
                    onEndReached={loadMoreItem}
                    ListFooterComponent={isLoading && <ActivityIndicator />}
                    onEndReachedThreshold={0}
                  />
                </View>
              ) : (
                <View className="h-full justify-center pb-2">
                  <Text className="text-lg font-bold text-center">
                    No item picked yet!
                  </Text>
                </View>
              )}
            </>
          ) : null}
        </View>
      </View>
    </SafeAreaView>
  );
};

export default Picking;
