import CheckBox from '@react-native-community/checkbox';
import { useFocusEffect } from '@react-navigation/native';
import React, { useCallback, useEffect, useState } from 'react';
import {
  ActivityIndicator,
  Alert,
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
import Toast from 'react-native-toast-message';
import Modal from '../../../../components/Modal';
import { ButtonBack, ButtonLg, ButtonLoading } from '../../../../components/buttons';
import { SearchIcon } from '../../../../constant/icons';
import { getStorage } from '../../../../hooks/useStorage';
import { dateRange, toast } from '../../../../utils';

const DeliveryPlan = ({ navigation, route }) => {
  const [isLoading, setIsLoading] = useState(false);
  const [isButtonLoading, setIsButtonLoading] = useState(false);
  const [refreshing, setRefreshing] = useState(false);
  const [token, setToken] = useState('');
  const [sites, setSites] = useState('');
  let [dpList, setDpList] = useState([]);
  const [selectedList, setSelectedList] = useState([]);
  const [isAllChecked, setIsAllChecked] = useState(false);
  const [search, setSearch] = useState('');
  const tableHeader = ['STO ID', 'SKU', 'Outlet Code'];
  const API_URL = 'https://shwapnooperation.onrender.com/';
  const dateObject = dateRange(20);
  const { from, to } = dateObject;

  const [modalVisible, setModalVisible] = useState(false);

  const toggleModal = () => {
    setModalVisible(!modalVisible);
  };

  useEffect(() => {
    setModalVisible(true);
    getStorage('token', setToken);
    setSelectedList([]);
  }, []);

  const getDnList = async () => {
    setIsLoading(true);
    try {
      await fetch(API_URL + `bapi/sto/list?from=${from}&to=${to}&site=${sites}`, {
        method: 'GET',
        headers: {
          authorization: token,
          'Content-Type': 'application/json',
        }
      })
        .then(response => response.json())
        .then(async result => {
          if (result.status) {
            await fetch(API_URL + 'api/sto-tracking/in-dn', {
              method: 'GET',
              headers: {
                authorization: token,
              },
            })
              .then(res => res.json())
              .then(inDnData => {
                if (inDnData.status) {
                  const dnItems = result.data.sto;
                  const inDnItems = inDnData.items;
                  let remainingDnItems = dnItems.filter(
                    dnItem => !inDnItems.some(inDnItem => inDnItem.sto === dnItem.sto)
                  );
                  const finalDnList = remainingDnItems.map(item => {
                    return { ...item, selected: false };
                  });
                  setDpList(finalDnList);
                  setIsLoading(false);
                  setRefreshing(false);
                } else {
                  const stoData = result.data.sto;
                  const dpData = stoData.map(item => {
                    return { ...item, selected: false }
                  });
                  setDpList(dpData);
                  setIsLoading(false);
                  setRefreshing(false);
                }
              })
          } else {
            // toast(result.message);
            Toast.show({
              type: 'customError',
              text1: result.message.toString(),
            });
            setIsLoading(false);
            setRefreshing(false);
            setModalVisible(true);
          }
        })
        .catch(error => {
          // toast(error.message);
          Toast.show({
            type: 'customError',
            text1: error.message.toString(),
          });
          setIsLoading(false);
          setRefreshing(false);
          setModalVisible(true);
        });
    } catch (error) {
      // toast(error.message);
      Toast.show({
        type: 'customError',
        text1: error.message.toString(),
      });
      setIsLoading(false);
      setRefreshing(false);
      setModalVisible(true);
    }
  };

  console.log('sites', sites);

  useFocusEffect(
    useCallback(() => {
      if (token && sites) {
        getDnList();
      } else {
        setModalVisible(true);
      }
    }, [token, refreshing, sites])
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
          {item.sto}
        </Text>
      </View>
      <Text className="flex-1 text-black text-center" numberOfLines={1}>
        {item.sku}
      </Text>
      <Text className="flex-1 text-black text-center" numberOfLines={1}>
        {item.supplyingPlant}
      </Text>
    </TouchableOpacity>
  );

  const handelCheckbox = sto => {
    let newItems = dpList.map(item =>
      sto.sto === item.sto ? { ...item, selected: !item.selected } : item,
    );
    setSelectedList(newItems.filter(item => item.selected));
    setDpList(newItems);
    Keyboard.dismiss();
  };

  const toggleCheckAll = () => {
    const data = dpList.map(item => {
      return { ...item, selected: !item.selected };
    });
    setDpList(data);
    setSelectedList(data.filter(item => item.selected));
    setIsAllChecked(current => !current);
    Keyboard.dismiss();
  };

  const uncheckAll = () => {
    const checkAllData = dpList.map(item => {
      return { ...item, selected: false };
    });
    setDpList(checkAllData);
    setSelectedList([]);
    Keyboard.dismiss();
  };

  const createDN = () => {
    if (selectedList.length > 0) {
      setIsButtonLoading(true);
      try {
        selectedList.map(async item => {
          await fetch(API_URL + 'bapi/dn/create', {
            method: 'POST',
            headers: {
              authorization: token,
              'Content-Type': 'application/json',
            },
            body: JSON.stringify({ sto: item.sto }),
          })
            .then(response => response.json())
            .then(data => {
              if (data.status) {
                uncheckAll();
                toast(data.message);
                setIsButtonLoading(false);
                setRefreshing(true);
              } else {
                uncheckAll();
                toast(data.message);
                setIsButtonLoading(false);
                setRefreshing(true);
              }
            })
            .catch(error => toast(error.message));
        })
      } catch (error) {
        toast(error.message)
      }
    } else {
      toast('No item selected!');
    }
  };

  const createDeliveryPlan = () => {
    Alert.alert('Are you sure?',
      `Do you want to make delivery plan for sto ${selectedList.map(item => item.sto).join(',')}?`,
      [
        {
          text: 'Cancel',
          onPress: () => null,
          style: 'cancel',
        },
        { text: 'OK', onPress: () => createDN() },
      ]);
  };

  if (search !== '') {
    dpList = dpList.filter(
      dp =>
        dp.sto.trim().toLowerCase().includes(search.toLowerCase()) ||
        dp.receivingPlant.trim().toLowerCase().includes(search.toLowerCase())
    );
  }

  if (isLoading) {
    return (
      <View className="w-full h-screen justify-center px-3">
        <ActivityIndicator size="large" color="#EB4B50" />
        <Text className="mt-4 text-gray-400 text-base text-center">Loading delivery note. Please wait......</Text>
      </View>
    )
  }

  // if (!isLoading && dpList.length === 0) {
  //   return (
  //     <View className="w-full h-4/5 justify-center px-3">
  //       <ServerError message="No data found!" />
  //       <Button title='open modal' onPress={() => toggleModal()} />
  //     </View>
  //   )
  // }

  return (
    <SafeAreaView className="flex-1 bg-white pt-8">
      <View className="flex-1 h-full px-4">
        <View className="screen-header flex-row items-center mb-4">
          <ButtonBack navigation={navigation} />
          <Text className="flex-1 text-lg text-sh text-center font-semibold capitalize">
            delivery plan
          </Text>
        </View>

        {/* Search filter */}
        <View className="search flex-row">
          <View className="input-box relative flex-1">
            <Image className="absolute top-3 left-3 z-10" source={SearchIcon} />
            <TextInput
              className="bg-[#F5F6FA] h-[50px] text-black rounded-lg pl-12 pr-4"
              placeholder="Search by sto or outlet code"
              inputMode='text'
              placeholderTextColor="#CBC9D9"
              selectionColor="#CBC9D9"
              onChangeText={value => setSearch(value)}
              value={search}
            />
          </View>
        </View>
        <View className="content flex-1 mt-3">
          {/* Table data */}
          <View className={`table ${selectedList.length > 0 ? 'h-[68vh]' : 'h-[77vh]'}`}>
            <View className="flex-row bg-th text-center mb-2 py-2">
              {tableHeader.map((th) => (
                <>
                  {th.split(' ')[1] === 'ID' ? (
                    <TouchableOpacity
                      key={th}
                      className="flex-1 flex-row items-center justify-center"
                      onPress={() => toggleCheckAll()}
                    >
                      <CheckBox
                        tintColors={isAllChecked ? '#56D342' : '#ffffff'}
                        value={isAllChecked}
                        onValueChange={() => toggleCheckAll()}
                      />
                      <Text className="text-white text-center font-bold ml-2.5" numberOfLines={1}>
                        {th}
                      </Text>
                    </TouchableOpacity>
                  ) : (
                    <Text
                      className="flex-1 text-white text-center font-bold"
                      key={th}>
                      {th}
                    </Text>
                  )}

                </>
              ))}
            </View>
            {isLoading ? <ActivityIndicator /> : (
              <FlatList
                data={dpList}
                renderItem={renderItem}
                keyExtractor={item => item.sto}
                initialNumToRender={15}
                refreshControl={
                  <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
                }
              />
            )}
          </View>

          {selectedList.length > 0 && (
            <View className="button">
              {isButtonLoading ? <ButtonLoading styles='bg-theme rounded-md p-5' /> :
                <ButtonLg
                  title="Mark as delivery ready"
                  onPress={() => createDeliveryPlan()}
                />
              }
            </View>
          )}
        </View>
        {/* <BottomModal isVisible={isModalVisible} onClose={toggleModal} /> */}
        <Modal
          isOpen={sites.length > 0 ? true : modalVisible}
          modalHeader="choose outlets"
          onPress={() => setModalVisible(false)}
        >
          <View className="">
            <Text className="text-black text-base">
              modal content
            </Text>
          </View>
        </Modal>
      </View>

    </SafeAreaView>
  );
};

export default DeliveryPlan;