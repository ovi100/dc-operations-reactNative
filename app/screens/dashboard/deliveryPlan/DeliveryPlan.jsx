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
  TouchableWithoutFeedback,
  View
} from 'react-native';
import Toast from 'react-native-toast-message';
import CustomToast from '../../../../components/CustomToast';
import Modal from '../../../../components/Modal';
import ServerError from '../../../../components/animations/ServerError';
import { ButtonBack, ButtonLg, ButtonLoading } from '../../../../components/buttons';
import { SearchIcon } from '../../../../constant/icons';
import { getStorage, setStorage } from '../../../../hooks/useStorage';
import { dateRange, toast } from '../../../../utils';

const DeliveryPlan = ({ navigation }) => {
  const [isLoading, setIsLoading] = useState(false);
  const [isButtonLoading, setIsButtonLoading] = useState(false);
  const [refreshing, setRefreshing] = useState(false);
  const [modalVisible, setModalVisible] = useState(false);
  const [token, setToken] = useState('');
  const [outlets, setOutlets] = useState('');
  let [dpList, setDpList] = useState([]);
  const [selectedList, setSelectedList] = useState([]);
  const [modalText, setModalText] = useState('');
  const [isAllChecked, setIsAllChecked] = useState(false);
  const [search, setSearch] = useState('');
  const tableHeader = ['STO ID', 'SKU', 'Outlet Code'];
  const API_URL = 'https://shwapnooperation.onrender.com/';
  const dateObject = dateRange(20);
  const { from, to } = dateObject;

  useEffect(() => {
    getStorage('token', setToken);
    getStorage('outlets', setOutlets);
    setModalVisible(false);
    setSelectedList([]);
  }, []);


  const getDnList = async () => {
    try {
      await fetch(API_URL + `bapi/sto/list?from=${from}&to=${to}&site=${outlets}`, {
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

                } else {
                  const stoData = result.data.sto;
                  const dpData = stoData.map(item => {
                    return { ...item, selected: false }
                  });
                  setDpList(dpData);
                }
              })
          } else {
            // toast(result.message);
            Toast.show({
              type: 'customError',
              text1: result.message.toString(),
            });
          }
        })
        .catch(error => {
          // toast(error.message);
          Toast.show({
            type: 'customError',
            text1: error.message.toString(),
          });
        });
    } catch (error) {
      // toast(error.message);
      Toast.show({
        type: 'customError',
        text1: error.message.toString(),
      });
    }
  };

  useFocusEffect(
    useCallback(() => {
      const getDpList = async () => {
        setIsLoading(true);
        await getDnList();
        setIsLoading(false);
      };

      if (token && outlets) {
        getDpList();
      }
      else {
        setModalVisible(true);
      }
    }, [token, outlets])
  );

  const onRefresh = async () => {
    setRefreshing(true);
    await getDnList();
    setRefreshing(false);
  };

  const confirmModal = () => {
    if (modalText.length > 0) {
      let result = modalText.toUpperCase();
      setOutlets(result);
      setModalVisible(false);
      setStorage('outlets', result);
    }
  }

  const submitModal = () => {
    if (modalText.length > 0) {
      Alert.alert(
        'Are you sure?',
        `Delivery plan will be generated with ${modalText} outlet`,
        [
          {
            text: 'Cancel',
            onPress: () => null,
            style: 'cancel',
          },
          { text: 'OK', onPress: () => confirmModal() },
        ]);
    } else {
      Toast.show({
        type: 'customError',
        text1: 'No outlet selected',
      });
    }
  }

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
    Alert.alert(
      'Are you sure?',
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

  if (isLoading && dpList.length === 0) {
    return (
      <View className="w-full h-screen justify-center px-3">
        <ActivityIndicator size="large" color="#EB4B50" />
        <Text className="mt-4 text-gray-400 text-base text-center">Loading delivery note. Please wait......</Text>
      </View>
    )
  }

  if (!isLoading && outlets && dpList.length === 0) {
    return (
      <View className="w-full h-4/5 justify-center px-3">
        <ServerError message="No data found!" />
      </View>
    )
  }

  const chosenList = modalText.trim().split(",").filter(item => item !== "");

  return (
    <SafeAreaView className="flex-1 bg-white pt-8">
      <CustomToast />
      {outlets && !isLoading ? (
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
        </View>
      ) : (
        <Modal
          isOpen={modalVisible}
          withInput={true}
          withCloseButton={false}
          modalHeader="Choose outlet"
          onPress={() => setModalVisible(false)}
        >
          <View className="content">
            <View className="outlet-list flex-row border-b border-gray-300 mt-3 pb-3">
              {modalText.length > 0 ? (
                <>
                  {chosenList.map((outlet, i) => (
                    <View className="outlet bg-gray-300 rounded mr-1 px-2 py-1" key={i}>
                      <Text className="text-sh">{outlet}</Text>
                    </View>
                  ))}
                </>
              ) : (
                <View className="outlet">
                  <Text>No outlet selected</Text>
                </View>
              )}
            </View>
            <View className="input-box mt-3">
              <TextInput
                className="bg-[#F5F6FA] border border-gray-300 h-[50px] text-[#5D80C5] rounded-md mb-3 px-4 uppercase"
                placeholder="Add multiple outlets code by comma"
                placeholderTextColor="#5D80C5"
                selectionColor="#5D80C5"
                keyboardType="default"
                value={modalText}
                onChangeText={(text) => setModalText(text)}
              />
            </View>
            <View className="button w-1/3 mx-auto">
              <TouchableWithoutFeedback onPress={() => submitModal()}>
                <Text className="bg-blue-600 text-white text-base text-center rounded p-1.5">submit</Text>
              </TouchableWithoutFeedback>
            </View>
          </View>
        </Modal>
      )}
    </SafeAreaView>
  );
};

export default DeliveryPlan;