import { useFocusEffect } from '@react-navigation/native';
import React, { useCallback, useEffect, useState } from 'react';
import { ActivityIndicator, FlatList, Image, RefreshControl, SafeAreaView, Text, TouchableOpacity, View } from 'react-native';
import Toast from 'react-native-toast-message';
import CustomToast from '../../../../components/CustomToast';
import { NotPickingIcon, PickingIcon } from '../../../../constant/icons';
import { getStorage } from '../../../../hooks/useStorage';

const Picking = ({ navigation }) => {
  const [isLoading, setIsLoading] = useState(false);
  const [refreshing, setRefreshing] = useState(false);
  const [user, setUser] = useState({});
  const [token, setToken] = useState('');
  const [assignedData, setAssignedData] = useState([]);
  const [notPicked, setNotPicked] = useState([]);
  const [picked, setPicked] = useState([]);
  const tableHeader = ['STO', 'SKU', 'Outlet Code', 'Status'];
  const API_URL = 'https://shwapnooperation.onrender.com/api/sto-tracking?pageSize=500&filterBy=supplyingPlant&';

  useEffect(() => {
    const getAsyncStorage = async () => {
      await getStorage('token', setToken, 'string');
      await getStorage('user', setUser, 'object');
    }
    getAsyncStorage();
  }, []);

  const getStoData = async () => {
    try {
      await fetch(API_URL + `value=${user?.site}`, {
        method: 'GET',
        headers: {
          authorization: token,
        },
      })
        .then(response => response.json())
        .then(data => {
          if (data.status) {
            setAssignedData(data.items);
            const notPicked = data.items.filter(item => item.status === 'picker assigned' || item.status === 'picker packer assigned');
            const picked = data.items.filter(item => item.status === 'picked');
            setNotPicked(notPicked);
            setPicked(picked);
          } else {
            Toast.show({
              type: 'customError',
              text1: data.message,
            });
          }
        })
        .catch(error => {
          Toast.show({
            type: 'customError',
            text1: error.message.toString(),
          });
        });
    } catch (error) {
      Toast.show({
        type: 'customError',
        text1: error.message.toString(),
      });
    }
  };

  const getAssignedTask = async () => {
    setIsLoading(true);
    await getStoData();
    setIsLoading(false);
  }

  useFocusEffect(
    useCallback(() => {
      if (token && user?.site) {
        getAssignedTask();
      }
    }, [token, user?.site])
  );

  const onRefresh = async () => {
    if (token && user?.site) {
      setRefreshing(true);
      await getStoData();
      setRefreshing(false);
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

  let tabInfo = [
    {
      id: 1,
      name: 'not picked',
      count: notPicked.length,
      icon: NotPickingIcon,
    },
    {
      id: 2,
      name: 'picked',
      count: picked.length,
      icon: PickingIcon,
    },
  ]

  const [active, setActive] = useState(tabInfo[0]);

  if (isLoading && assignedData.length === 0) {
    return (
      <View className="w-full h-screen justify-center px-3">
        <ActivityIndicator size="large" color="#EB4B50" />
        <Text className="mt-4 text-gray-400 text-base text-center">
          Loading picking list. Please wait......
        </Text>
      </View>
    )
  }

  if (assignedData.length === 0) {
    return (
      <View className="w-full h-full justify-center px-3">
        <Text className="text-black text-xl text-center font-semibold font-mono mt-5">
          No task assigned yet
        </Text>
      </View>
    )
  }

  return (
    <SafeAreaView className="flex-1 bg-white pt-8">
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
              {notPicked.length > 0 ? (
                <View className="table h-full pb-2">
                  <View className="flex-row bg-th text-center mb-2 py-2">
                    {tableHeader.map(th => (
                      <Text className="flex-1 text-white text-center font-bold" key={th}>
                        {th}
                      </Text>
                    ))}
                  </View>
                  <FlatList
                    data={notPicked}
                    renderItem={pickingRenderItem}
                    keyExtractor={item => item._id}
                    initialNumToRender={10}
                    refreshControl={
                      <RefreshControl
                        colors={["#fff"]}
                        onRefresh={onRefresh}
                        progressBackgroundColor="#000"
                        refreshing={refreshing}
                      />
                    }
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
              {picked.length > 0 ? (
                <View className="table h-full pb-2">
                  <View className="flex-row bg-th text-center mb-2 py-2">
                    {tableHeader.map(th => (
                      <Text className="flex-1 text-white text-center font-bold" key={th}>
                        {th}
                      </Text>
                    ))}
                  </View>
                  <FlatList
                    data={picked}
                    renderItem={pickedRenderItem}
                    keyExtractor={item => item._id}
                    initialNumToRender={10}
                    refreshControl={
                      <RefreshControl
                        colors={["#fff"]}
                        onRefresh={onRefresh}
                        progressBackgroundColor="#000"
                        refreshing={refreshing}
                      />
                    }
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
      <CustomToast />
    </SafeAreaView>
  );
};

export default Picking;
