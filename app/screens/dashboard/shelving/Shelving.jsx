import { useFocusEffect } from '@react-navigation/native';
import React, { useCallback, useState } from 'react';
import {
  FlatList,
  SafeAreaView,
  Text,
  TouchableOpacity,
  View
} from 'react-native';
import SearchAnimation from '../../../../components/animations/Search';
import { ButtonBack } from '../../../../components/buttons';
import { getStorage } from '../../../../hooks/useStorage';

const Shelving = ({ navigation }) => {
  const [isLoading, setIsLoading] = useState(false);
  const [token, setToken] = useState('');
  const [articles, setArticles] = useState([]);
  const tableHeader = ['Article ID', 'BIN ID', 'Quantity'];
  const API_URL = 'https://shwapnooperation.onrender.com/api/product-shelving/';

  getStorage('token', setToken, 'string');

  useFocusEffect(
    useCallback(() => {
      setIsLoading(true);
      const getShelvingReady = async () => {
        try {
          setIsLoading(true);
          await fetch(API_URL + 'ready', {
            method: 'GET',
            headers: {
              authorization: token,
            },
          })
            .then(response => response.json())
            .then(data => {
              if (data.status) {
                fetch(API_URL + 'in-shelf', {
                  method: 'GET',
                  headers: {
                    authorization: token,
                  },
                })
                  .then(res => res.json())
                  .then(inShelfData => {
                    if (data.status) {
                      const readyItems = data.items;
                      const inShelfItems = inShelfData.items;
                      let remainingShelvingItems = readyItems.filter(
                        readyItem =>
                          !inShelfItems.some(
                            inShelfItem =>
                              inShelfItem.po === readyItem.po &&
                              inShelfItem.code === readyItem.code,
                          ),
                      );
                      setArticles(remainingShelvingItems);
                      setIsLoading(false);
                    }
                  })
                  .catch(error => console.log('Fetch catch', error));
              }
            })
            .catch(error => console.log('Fetch catch', error));
        } catch (error) {
          console.log(error);
        }
      };
      getShelvingReady();
    }, [token]),
  );

  const renderItem = ({ item }) => (
    <TouchableOpacity
      className="flex-row border border-tb rounded-lg mt-2.5 p-3"
      onPress={() => navigation.push('ShelvingScanner', { item })}>
      <View className="flex-1">
        <Text className="text-xs text-black" numberOfLines={1}>
          {item.code}
        </Text>
        <Text className="text-black text-base mt-1" numberOfLines={1}>
          {item.description}
        </Text>
      </View>
      <View>
        {item.bins.map((bin, i) => (
          <Text
            key={i}
            className="flex-1 text-black text-center mb-1 last:mb-0"
            numberOfLines={1}>
            {bin.bin_id}
          </Text>
        ))}
      </View>
      <Text className="flex-1 text-black text-center" numberOfLines={1}>
        {item.receivedQuantity}
      </Text>
    </TouchableOpacity>
  );

  return (
    <SafeAreaView className="flex-1 bg-white pt-8">
      <View className="flex-1 h-full px-4">
        <View className="screen-header flex-row items-center mb-4">
          <ButtonBack navigation={navigation} />
          <Text className="flex-1 text-lg text-sh text-center font-semibold capitalize">
            Shelving
          </Text>
        </View>

        <View className="content flex-1">
          {isLoading ? (
            <SearchAnimation />
          ) : (
            <>
              {articles.length ? (
                <View className="h-full pb-2">
                  <View className="flex-row bg-th mb-2 py-2">
                    {tableHeader.map(th => (
                      <Text
                        className="flex-1 text-white text-center font-bold"
                        key={th}>
                        {th}
                      </Text>
                    ))}
                  </View>

                  <FlatList
                    data={articles}
                    renderItem={renderItem}
                    keyExtractor={item => item._id}
                  />
                </View>
              ) : (
                <View className="h-full justify-center pb-2">
                  <Text className="text-base font-bold text-center">
                    No product is ready for shelving!
                  </Text>
                </View>
              )}
            </>
          )}
        </View>
      </View>
    </SafeAreaView>
  );
};

export default Shelving;
