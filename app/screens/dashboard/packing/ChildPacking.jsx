import CheckBox from '@react-native-community/checkbox';
import { useFocusEffect } from '@react-navigation/native';
import { useCallback, useEffect, useState } from 'react';
import {
  ActivityIndicator,
  FlatList,
  RefreshControl,
  SafeAreaView,
  Text,
  TextInput,
  TouchableOpacity,
  View
} from 'react-native';
import Toast from 'react-native-toast-message';
import CustomToast from '../../../../components/CustomToast';
import Dialog from '../../../../components/Dialog';
import { ButtonBack, ButtonLg, ButtonLoading } from '../../../../components/buttons';
import { getStorage } from '../../../../hooks/useStorage';
import { printChildPackingList } from './printPackInfo';

const ChildPacking = ({ navigation }) => {
  const [isLoading, setIsLoading] = useState(false);
  const [isButtonLoading, setIsButtonLoading] = useState(false);
  const [dialogVisible, setDialogVisible] = useState(false);
  const [refreshing, setRefreshing] = useState(false);
  const [isAllChecked, setIsAllChecked] = useState(false);
  let [childPackingList, setChildPackingList] = useState([]);
  const [selectedList, setSelectedList] = useState([]);
  let tableHeader = ['Code', 'Received Qnt', 'Packed Qnt'];
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
            const articleTrackingItems = articleTrackingData.items.filter(article => article.inboundPackerId === user._id);
            const finalList = articleTrackingItems.map(item => {
              return { ...item, remainingPackedQuantity: item.inboundPackedQuantity, supplyingSite: user.site, receivingSite: "D014", selected: false };
            });
            setChildPackingList(finalList);
          } else {
            let dummyList = [{
              "_id": "663f650fc1dbf034b21a65c3",
              "name": "Shwapno Hot Tomato Sauce 500g",
              "code": "2704564",
              "sto": "8000273084",
              "dn": "012000000012",
              "status": "ready for child packing",
              "quantity": 2000,
              "inboundPickedQuantity": 2000,
              "inboundPackedQuantity": 2000,
              "inboundPicker": "sadman",
              "inboundPickerId": "65e82a67235524c0f3923afc",
              "inboundPacker": "boshir",
              "inboundPackerId": "65c88df6d61a79ae50a94123",
              "inboundPickingStartingTime": "2024-05-11T12:31:10.082Z",
              "inboundPickingEndingTime": "2024-05-11T12:31:22.659Z",
              "inboundPackingStartingTime": null,
              "inboundPackingEndingTime": null,
            },
            {
              "_id": "663f655ac1dbf034b21a6614",
              "name": "Shwapno Facial Tissue 300 sheet",
              "code": "3003618",
              "sto": "8000273084",
              "dn": "012000000012",
              "status": "ready for child packing",
              "quantity": 1500,
              "inboundPickedQuantity": 1500,
              "inboundPackedQuantity": 1500,
              "inboundPicker": "sadman",
              "inboundPickerId": "65e82a67235524c0f3923afc",
              "inboundPacker": "boshir",
              "inboundPackerId": "65c88df6d61a79ae50a94123",
              "inboundPickingStartingTime": "2024-05-11T12:32:25.224Z",
              "inboundPickingEndingTime": "2024-05-11T12:32:38.577Z",
              "inboundPackingStartingTime": null,
              "inboundPackingEndingTime": null,
            }]
            const finalList = dummyList.map(item => {
              return { ...item, remainingPackedQuantity: item.inboundPackedQuantity, supplyingSite: user.site, receivingSite: "D014", selected: false };
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

  const handleInputBox = (item, quantity) => {
    const index = childPackingList.findIndex(article => article.code === item.code);

    if (!quantity) {
      Toast.show({
        type: 'customError',
        text1: 'Enter a valid quantity',
      });
    } else if (quantity > item.remainingPackedQuantity) {
      Toast.show({
        type: 'customError',
        text1: 'Packed quantity cannot be greater than picked quantity',
      });
    } else {
      const newItems = [...childPackingList];
      newItems[index].inboundPackedQuantity = quantity;
      setChildPackingList(newItems);
    }
  }

  const renderItem = ({ item }) => (
    <TouchableOpacity
      className="flex-row items-center border border-tb rounded-lg mt-2.5 px-2 py-3"
      onPress={() => handelCheckbox(item)}>
      <View className="item-info w-1/3">
        <View className="flex-row items-center">
          <CheckBox
            tintColors={item.selected ? '#56D342' : '#f5f5f5'}
            value={item.selected}
            onValueChange={() => handelCheckbox(item)}
          />
          <Text className="text-xs text-black" numberOfLines={1}>
            {item.code}
          </Text>
        </View>
        <Text className="text-black text-sm" numberOfLines={2}>
          {item.name}
        </Text>
      </View>
      <Text className="w-1/3 text-black text-center" numberOfLines={1}>
        {item.quantity}
      </Text>
      <View className="w-1/4 text-black mx-auto">
        <TextInput
          className="text-black border border-gray-200 text-center rounded-md px-4 focus:border-blue-500"
          keyboardType="numeric"
          editable={item.selected}
          placeholder={item.remainingPackedQuantity.toString()}
          onChangeText={quantity => handleInputBox(item, Number(quantity))}
        />
      </View>
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
    const data = childPackingList.map(item => ({ ...item, selected: true }));
    setChildPackingList(data);
    setSelectedList(data);
    setIsAllChecked(data.every(elm => elm.selected));
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
      // setIsButtonLoading(true);

      const formattedData = {};

      selectedList.forEach(item => {
        const { sto, dn, supplyingSite, receivingSite, inboundPackedQuantity, name, code, inboundPackerId } = item;

        if (!formattedData[sto]) {
          formattedData[sto] = {
            sto,
            dn,
            supplyingSite,
            receivingSite,
            packedBy: inboundPackerId,
            dateTimePacked: new Date(),
            list: []
          };
        }

        formattedData[sto].list.push({
          material: code,
          description: name,
          quantity: inboundPackedQuantity
        });
      });

      const postData = Object.values(formattedData);

      console.log(JSON.stringify(postData));

      try {
        postData.map(async item => {
          await fetch(API_URL + 'api/child-packing', {
            method: 'POST',
            headers: {
              authorization: token,
              'Content-Type': 'application/json',
            },
            body: JSON.stringify(item),
          })
            .then(response => response.json())
            .then(result => {
              if (result.status) {
                printChildPackingList(result.data)
              } else {
                Toast.show({
                  type: 'customError',
                  text1: result.message,
                });
              }
            })
            .catch(error => {
              Toast.show({
                type: 'customError',
                text1: error.message,
              });
            });
        })
      } catch (error) {
        Toast.show({
          type: 'customError',
          text1: error.message,
        });
      } finally {
        uncheckAll();
        setIsButtonLoading(false);
        onRefresh();
      }
    } else {
      setDialogVisible(false);
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
            <View className="flex-row items-center bg-gray-400 text-center mb-2 px-2 py-2">
              {tableHeader.map((th) => (
                <>
                  {th === 'Code' ? (
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
              keyExtractor={item => item.code}
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
            {isButtonLoading ? <ButtonLoading styles='bg-theme rounded-md p-5' /> :
              <ButtonLg
                title="Generate Child Packing List"
                onPress={() => setDialogVisible(true)}
              />
            }
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
      <CustomToast />
    </SafeAreaView>
  );
};

export default ChildPacking;
