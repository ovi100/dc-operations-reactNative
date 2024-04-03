import { useFocusEffect } from '@react-navigation/native';
import { useCallback, useEffect, useState } from 'react';
import { ActivityIndicator, FlatList, RefreshControl, SafeAreaView, Text, TouchableOpacity, View } from 'react-native';
import Toast from 'react-native-toast-message';
import CustomToast from '../../../../components/CustomToast';
import ServerError from '../../../../components/animations/ServerError';
import { getStorage } from '../../../../hooks/useStorage';

const TaskAssign = ({ navigation }) => {
  const [isLoading, setIsLoading] = useState(false);
  const [refreshing, setRefreshing] = useState(false);
  const [token, setToken] = useState('');
  let [taskList, setTaskList] = useState([]);
  const tableHeader = ['STO ID', 'SKU', 'Outlet Code', 'Status'];
  const API_URL = 'https://shwapnooperation.onrender.com/api/sto-tracking?pageSize=200';

  useEffect(() => {
    getStorage('token', setToken, 'string');
  }, []);

  const getInDnList = async () => {
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
            const serverData = data.items.filter(item => item.status === 'in dn' || item.status === 'picker assigned');
            setTaskList(serverData);
          } else {
            Toast.show({
              type: 'customError',
              text1: data.message.toString(),
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

  useFocusEffect(
    useCallback(() => {
      const getTaskList = async () => {
        setIsLoading(true);
        await getInDnList();
        setIsLoading(false);
      };
      if (token) {
        getTaskList();
      }
    }, [token])
  );

  const onRefresh = async () => {
    setRefreshing(true);
    await getInDnList();
    setRefreshing(false);
  };

  const renderItem = ({ item, index }) => (
    <TouchableOpacity
      className="flex-row items-center border border-tb rounded-lg mt-2.5 p-4"
      key={index}
      onPress={() => navigation.push('PickerPackerTaskAssign', item)}
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
      <Text className="flex-1 text-black text-center uppercase" numberOfLines={2}>
        {item.status}
      </Text>
    </TouchableOpacity>
  );

  if (isLoading) {
    return (
      <View className="w-full h-screen justify-center px-3">
        <ActivityIndicator size="large" color="#EB4B50" />
        <Text className="mt-4 text-gray-400 text-base text-center">
          Loading task list. Please wait......
        </Text>
      </View>
    )
  }

  if (taskList.length === 0) {
    return (
      <View className="w-full h-screen justify-center px-3">
        <ServerError message="No data found!" />
      </View>
    )
  }

  return (
    <SafeAreaView className="flex-1 bg-white pt-8">
      <View className="flex-1 px-4">
        <View className="screen-header flex-row items-center mb-4">
          <Text className="flex-1 text-lg text-sh text-center font-semibold capitalize">
            task assign
          </Text>
        </View>
        <View className="content flex-1 justify-between py-5">
          <View className="table h-full pb-2">
            <View className="flex-row bg-th text-center mb-2 py-2">
              {tableHeader.map(th => (
                <Text className="flex-1 text-white text-center font-bold" key={th}>
                  {th}
                </Text>
              ))}
            </View>
            <FlatList
              data={taskList}
              renderItem={renderItem}
              keyExtractor={item => item._id}
              initialNumToRender={10}
              refreshControl={
                <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
              }
            />
          </View>
        </View>
      </View>
      <CustomToast />
    </SafeAreaView>
  );
};

export default TaskAssign;
