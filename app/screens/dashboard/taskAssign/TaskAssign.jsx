import { API_URL } from '@env';
import { useFocusEffect } from '@react-navigation/native';
import { useCallback, useEffect, useState } from 'react';
import {
  ActivityIndicator, FlatList, RefreshControl,
  SafeAreaView, Text, TouchableOpacity, View
} from 'react-native';
import Toast from 'react-native-toast-message';
import CustomToast from '../../../../components/CustomToast';
import ServerError from '../../../../components/animations/ServerError';
import { getStorage } from '../../../../hooks/useStorage';

const TaskAssign = ({ navigation }) => {
  const [isLoading, setIsLoading] = useState(false);
  const [refreshing, setRefreshing] = useState(false);
  const [user, setUser] = useState({});
  const [token, setToken] = useState('');
  let [taskList, setTaskList] = useState([]);
  const tableHeader = ['STO ID', 'SKU', 'Outlet Code', 'Status'];

  useEffect(() => {
    const getAsyncStorage = async () => {
      await getStorage('token', setToken);
      await getStorage('user', setUser, 'object');
    }
    getAsyncStorage();
  }, []);

  const getInDnList = async () => {
    const filterBy = {
      filter: {
        supplyingPlant: user.site,
        status: "in dn"
      },
      query: {
        pageSize: 500,
        sortBy: "sto",
        sortOrder: "asc"
      }
    };

    try {
      await fetch(API_URL + 'api/sto-tracking/all', {
        method: 'POST',
        headers: {
          authorization: token,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(filterBy),
      })
        .then(response => response.json())
        .then(data => {
          if (data.status) {
            setTaskList(data.items);
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
            text1: error.message,
          });
        });
    } catch (error) {
      Toast.show({
        type: 'customError',
        text1: error.message,
      });
    }
  };

  const getTaskList = async () => {
    setIsLoading(true);
    await getInDnList();
    setIsLoading(false);
  };

  useFocusEffect(
    useCallback(() => {
      if (token && user.site) {
        getTaskList();
      }
    }, [token, user.site])
  );

  const onRefresh = async () => {
    if (token && user.site) {
      setRefreshing(true);
      await getInDnList();
      setRefreshing(false);
    }
  };

  const renderItem = ({ item, index }) => (
    <TouchableOpacity
      className="flex-row items-center border border-tb rounded-lg mt-2.5 p-4"
      key={index}
      onPress={() => navigation.replace('PickerPackerTaskAssign', item)}
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
      <View className="w-full h-screen justify-center px-4">
        <ServerError message="No task list found" />
        <View className="button w-1/3 mx-auto mt-5">
          <TouchableOpacity onPress={() => getTaskList()}>
            <Text className="bg-blue-600 text-white text-lg text-center rounded p-2 capitalize">retry</Text>
          </TouchableOpacity>
        </View>
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
        <View className="content flex-1 py-5">
          <View className="table h-full pb-2">
            <View className="table-header flex-row bg-th text-center mb-2 py-2">
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
                <RefreshControl
                  colors={["#fff"]}
                  onRefresh={onRefresh}
                  progressBackgroundColor="#000"
                  refreshing={refreshing}
                />
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
