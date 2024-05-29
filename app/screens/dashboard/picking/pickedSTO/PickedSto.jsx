import { useFocusEffect } from '@react-navigation/native';
import React, { useCallback, useEffect, useState } from 'react';
import {
  ActivityIndicator, FlatList,
  SafeAreaView,
  Text,
  TextInput,
  TouchableOpacity,
  View
} from 'react-native';
import Toast from 'react-native-toast-message';
import CustomToast from '../../../../../components/CustomToast';
import Dialog from '../../../../../components/Dialog';
import { ButtonBack, ButtonLg } from '../../../../../components/buttons';
import { getStorage } from '../../../../../hooks/useStorage';
import { updateArticleTracking, updateStoTracking } from '../processStoData';

const PickedSto = ({ navigation, route }) => {
  const { sto } = route.params;
  const [isLoading, setIsLoading] = useState(false);
  const [isSending, setIsSending] = useState(false);
  const [dialogVisible, setDialogVisible] = useState(false);
  const [user, setUser] = useState({});
  const [token, setToken] = useState('');
  let tableHeader = ['Article Code', 'Article Name', 'Picked Qnt', 'Packed Qnt'];
  let [articles, setArticles] = useState([]);
  const API_URL = 'https://shwapnooperation.onrender.com/';

  useEffect(() => {
    const getAsyncStorage = async () => {
      await getStorage('token', setToken);
      await getStorage('user', setUser, 'object');
    }
    getAsyncStorage();
  }, [navigation.isFocused()]);

  const getStoDetails = async () => {
    try {
      await fetch(API_URL + 'bapi/sto/display', {
        method: 'POST',
        headers: {
          authorization: token,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ sto }),
      })
        .then(response => response.json())
        .then(async stoDetails => {
          // console.log('sto details response', stoDetails);
          if (stoDetails.status) {
            try {
              await fetch(API_URL + `api/article-tracking?filterBy=sto&value=${sto}&pageSize=500`, {
                method: 'GET',
                headers: {
                  authorization: token,
                  'Content-Type': 'application/json',
                }
              })
                .then(response => response.json())
                .then(articleTrackingData => {
                  // console.log('article tracking response', articleTrackingData);
                  if (articleTrackingData.status) {
                    const stoItems = stoDetails.data.items;
                    const articleTrackingItems = articleTrackingData.items.filter(article => article.sto === sto && article.inboundPickerId === user._id);
                    const stoPickedItems = articleTrackingItems.map(item => {
                      const matchedItem = stoItems.find(
                        stoItem => item.code === stoItem.material
                      );
                      return {
                        ...item,
                        remainingPackedQuantity: item.inboundPickedQuantity - item.inboundPackedQuantity,
                        supplyingSite: user.site,
                        receivingPlant: matchedItem.receivingPlant,
                      };
                    }).filter(item => item.inboundPickedQuantity !== item.inboundPackedQuantity);
                    setArticles(stoPickedItems);
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
              text1: stoDetails.message,
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

  const finalStoData = async () => {
    setIsLoading(true);
    await getStoDetails();
    setIsLoading(false);
  }

  useFocusEffect(
    useCallback(() => {
      if (token && sto && user.site) {
        finalStoData();
      }
    }, [token, sto, user.site]),
  );

  const handleInputBox = (item, quantity) => {
    const index = articles.findIndex(article => article.code === item.code);

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
      const newItems = [...articles];
      newItems[index].inboundPackedQuantity = quantity;
      setArticles(newItems);
    }
  }

  const renderItem = ({ item, index }) => (
    <TouchableOpacity
      className="flex-row items-center justify-between border border-tb rounded-lg mt-2.5 p-4"
      key={index}
      onPress={() => null}
    >
      <Text className="w-1/4 text-black text-center" numberOfLines={1}>
        {item.code}
      </Text>
      <Text className="w-1/4 text-black text-center" numberOfLines={2}>
        {item.name}
      </Text>
      <Text className="w-1/4 text-black text-center" numberOfLines={1}>
        {item.inboundPickedQuantity}
      </Text>
      <View className="w-1/4 text-black">
        <TextInput
          className="text-black border border-gray-200 text-center rounded-md px-4 focus:border-blue-500"
          keyboardType="numeric"
          placeholder={item.remainingPackedQuantity.toString()}
          onChangeText={quantity => handleInputBox(item, Number(quantity))}
        />
      </View>
    </TouchableOpacity>
  );

  const sendToPackingZone = () => {
    setDialogVisible(false);
    setIsSending(true);
    try {
      articles.map(async item => {
        let updateArticle = {
          sto: item.sto,
          code: item.code,
          packedQuantity: item.inboundPackedQuantity
        };
        let updateSto = {
          sto: item.sto,
        };

        if (item.inboundPackedQuantity) {
          if (item.remainingPackedQuantity === item.inboundPackedQuantity && item.packingStartingTime === null) {
            updateSto = {
              ...updateSto,
              packingStartingTime: new Date(),
              packingEndingTime: new Date(),
              status: 'inbound packed'
            }
            updateArticle = {
              ...updateArticle,
              packingStartingTime: new Date(),
              packingEndingTime: new Date(),
              status: 'inbound packed'
            };
          } else if (item.remainingPackedQuantity > item.inboundPackedQuantity && item.packingStartingTime === null) {
            updateSto = {
              ...updateSto,
              packingStartingTime: new Date(),
              status: 'partially inbound packed'
            }
            updateArticle = {
              ...updateArticle,
              packingStartingTime: new Date(),
              status: 'partially inbound packed'
            };
          } else if (item.remainingPackedQuantity > item.inboundPackedQuantity && item.packingStartingTime !== null) {
            updateSto = {
              ...updateSto,
              status: 'partially inbound packed'
            }
            updateArticle = { ...updateArticle };
          } else {
            updateArticle = {
              ...updateArticle,
              packingEndingTime: new Date(),
              status: 'inbound packed'
            };
          }
          await updateStoTracking(token, updateSto);
          await updateArticleTracking(token, updateArticle);
        }
      })
    } catch (error) {
      Toast.show({
        type: 'customError',
        text1: error.message,
      });
    }
  };

  if (isLoading && articles.length === 0) {
    return (
      <View className="w-full h-screen justify-center px-3">
        <ActivityIndicator size="large" color="#EB4B50" />
        <Text className="mt-4 text-gray-400 text-base text-center">
          Loading sto articles. Please wait......
        </Text>
      </View>
    )
  }

  if (isSending) {
    return (
      <View className="w-full h-screen justify-center px-3">
        <ActivityIndicator size="large" color="#EB4B50" />
        <Text className="mt-4 text-gray-400 text-base text-center">
          Sending to packing zone. Please wait......
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
            picked {' ' + sto}
          </Text>
        </View>
        <View className="content flex-1 justify-between pb-2">
          <View className="table">
            <View className="table-header flex-row justify-between bg-th mb-2 py-2 px-3">
              {tableHeader.map(th => (
                <Text className="text-white text-center font-bold" key={th} numberOfLines={2}>
                  {th}
                </Text>
              ))}
            </View>
            {!isLoading && articles.length === 0 ? (
              <View className="w-full h-[90%] justify-center px-3">
                <Text className="text-black text-xl text-center font-bold">
                  No items left
                </Text>
              </View>
            ) : (
              <FlatList
                data={articles}
                renderItem={renderItem}
                keyExtractor={item => item.code}
              />
            )}
          </View>
          <View className="button">
            <ButtonLg
              title="Send to Packing Zone"
              onPress={() => setDialogVisible(true)()}
            />
          </View>
        </View>
      </View>
      <Dialog
        isOpen={dialogVisible}
        modalHeader="Are you sure?"
        modalSubHeader="Do you want to send this item to packing zone?"
        onClose={() => setDialogVisible(false)}
        onSubmit={() => sendToPackingZone()}
        leftButtonText="cancel"
        rightButtonText="proceed"
      />
      <CustomToast />
    </SafeAreaView>
  );
};

export default PickedSto;
