import CheckBox from '@react-native-community/checkbox';
import { useFocusEffect } from '@react-navigation/native';
import { useCallback, useEffect, useState } from 'react';
import {
  ActivityIndicator,
  FlatList,
  RefreshControl,
  SafeAreaView,
  Text,
  TouchableOpacity,
  View
} from 'react-native';
import { ButtonBack, ButtonLg, ButtonXs } from '../../../../components/buttons';
import Toast from 'react-native-toast-message';
import CustomToast from '../../../../components/CustomToast';
import { getStorage } from '../../../../hooks/useStorage';
import Dialog from '../../../../components/Dialog';

const ChildPacking = ({ navigation }) => {
  const [isLoading, setIsLoading] = useState(false);
  const [isButtonLoading, setIsButtonLoading] = useState(false);
  const [dialogVisible, setDialogVisible] = useState(false);
  const [refreshing, setRefreshing] = useState(false);
  const [isAllChecked, setIsAllChecked] = useState(false);
  const [childPackingList, setChildPackingList] = useState([]);
  const [selectedList, setSelectedList] = useState([]);
  let tableHeader = ['Article Code', 'Article Name', 'Packed Qnt'];
  const [user, setUser] = useState({});
  const [token, setToken] = useState('');
  const API_URL = 'https://shwapnooperation.onrender.com/';

  useEffect(() => {
    const getAsyncStorage = async () => {
      await getStorage('token', setToken);
      await getStorage('user', setUser, 'object');
    }
    getAsyncStorage();
  }, [navigation.isFocused()]);

  const getChildPackingLists = async () => {
    try {
      await fetch(API_URL + `api/article-tracking?filterBy=status&value=ready for child packing&pageSize=500`, {
        method: 'GET',
        headers: {
          authorization: token,
          'Content-Type': 'application/json',
        }
      })
        .then(response => response.json())
        .then(articleTrackingData => {
          if (articleTrackingData.status) {
            const articleTrackingItems = articleTrackingData.items;
            const finalList = articleTrackingItems.map(item => {
              return { ...item, supplyingSite: user.site, selected: false };
            });
            setChildPackingList(finalList);
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

  const finalStoData = async () => {
    setIsLoading(true);
    await getChildPackingLists();
    setIsLoading(false);
  }

  useFocusEffect(
    useCallback(() => {
      if (token && user.site) {
        finalStoData();
      }
    }, [token, user.site]),
  );

  const onRefresh = async () => {
    setRefreshing(true);
    await getChildPackingLists();
    setRefreshing(false);
  };

  const renderItem = ({ item }) => (
    <TouchableOpacity
      className="flex-row border border-tb rounded-lg mt-2.5 p-4"
      onPress={() => handelCheckbox(item)}>
      <View className="flex-1 flex-row items-center">
        <CheckBox
          tintColors={item.selected ? '#56D342' : '#f5f5f5'}
          value={item.selected}
        // onValueChange={() => handelCheckbox(item)}
        />
        <Text className="text-black" numberOfLines={1}>
          {item.code}
        </Text>
      </View>
      <Text className="flex-1 text-black text-center" numberOfLines={2}>
        {item.name}
      </Text>
      <Text className="flex-1 text-black text-center" numberOfLines={1}>
        {item.quantity}
      </Text>
    </TouchableOpacity>
  );

  const handelCheckbox = article => {
    let newItems = childPackingList.map(item =>
      article._id === item._id ? { ...item, selected: !item.selected } : item,
    );
    setSelectedList(newItems.filter(item => item.selected));
    setChildPackingList(newItems);
  };

  const toggleCheckAll = () => {
    const data = childPackingList.map(item => {
      return { ...item, selected: !item.selected };
    });
    setChildPackingList(data);
    setSelectedList(data);
    setIsAllChecked(current => !current);
  };

  const uncheckAll = () => {
    const checkAllData = childPackingList.map(item => {
      return { ...item, selected: false };
    });
    setChildPackingList(checkAllData);
    setSelectedList([]);
    setIsAllChecked(current => !current);
  };

  const createPackingList = async () => {
    if (selectedList.length > 0) {
      setDialogVisible(false);
      setIsButtonLoading(true);
      try {
        await fetch(API_URL + 'api/child-packing', {
          method: 'POST',
          headers: {
            authorization: token,
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({}),
        })
          .then(response => response.json())
          .then(data => {
            if (data.status) {
              uncheckAll();
              Toast.show({
                type: 'customInfo',
                text1: data.message,
              });
              setIsButtonLoading(false);
              onRefresh();
            } else {
              uncheckAll();
              Toast.show({
                type: 'customError',
                text1: data.message,
              });
              setIsButtonLoading(false);
              onRefresh();
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
    } else {
      Toast.show({
        type: 'customError',
        text1: 'No item selected!',
      });
    }
  };

  if (isLoading && childPackingList.length === 0) {
    return (
      <View className="w-full h-screen justify-center px-3">
        <ActivityIndicator size="large" color="#EB4B50" />
        <Text className="mt-4 text-gray-400 text-base text-center">
          Loading articles. Please wait......
        </Text>
      </View>
    )
  }

  return (
    <SafeAreaView className="flex-1 bg-white pt-8">
      <View className="flex-1 h-full px-4">
        <View className="screen-header flex-row items-center mb-4">
          <ButtonBack navigation={navigation} />
          <Text className="flex-1 text-lg text-sh text-center font-semibold capitalize">
            child packing
          </Text>
        </View>

        <View className="content flex-1 justify-around my-5">
          {/* Table data */}
          <View className="table h-full pb-2">
            <View className="flex-row items-center justify-between bg-gray-400 text-center mb-2 px-3 py-2">
              {tableHeader.map((th) => (
                <>
                  {th.split(' ')[1] === 'Code' ? (
                    <TouchableOpacity
                      key={th}
                      className="flex-row items-center w-1/3"
                      onPress={() => toggleCheckAll()}
                    >
                      <CheckBox
                        tintColors='#ffffff'
                        value={isAllChecked}
                        onValueChange={() => toggleCheckAll()}
                      />
                      <Text className="text-white text-center font-bold ml-1.5" numberOfLines={1}>
                        {th}
                      </Text>
                    </TouchableOpacity>
                  ) : (
                    <Text
                      className="w-1/3 text-white text-center font-bold"
                      key={th}>
                      {th}
                    </Text>
                  )}

                </>
              ))}
            </View>
            <FlatList
              data={childPackingList}
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
          <View className="button">
            <ButtonLg
              title="Generate Child Packing List"
              onPress={() => setDialogVisible(true)}
            />
          </View>
        </View>
      </View>
      <Dialog
        isOpen={dialogVisible}
        modalHeader="Are you sure?"
        modalSubHeader="Do you want to create child packing with selected article?"
        onClose={() => setDialogVisible(false)}
        onSubmit={() => createPackingList()}
        leftButtonText="cancel"
        rightButtonText="proceed"
      />
    </SafeAreaView>
  );
};

export default ChildPacking;
