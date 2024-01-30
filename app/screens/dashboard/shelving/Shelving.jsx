import {useFocusEffect} from '@react-navigation/native';
import React, {useCallback, useState} from 'react';
import {
  ActivityIndicator,
  FlatList,
  SafeAreaView,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';
import {ButtonBack} from '../../../../components/buttons';
import {getStorage} from '../../../../hooks/useStorage';

const Shelving = ({navigation}) => {
  const [isLoading, setIsLoading] = useState(false);
  const [token, setToken] = useState('');
  const [articles, setArticles] = useState([]);
  // let articles = [];
  const tableHeader = ['Article ID', 'BIN ID', 'Quantity'];
  const API_URL =
    'https://shwapnooperation.onrender.com/api/product-shelving/ready';

  getStorage('token', setToken, 'string');

  useFocusEffect(
    useCallback(() => {
      setIsLoading(true);
      const getShelvingReady = async () => {
        try {
          setIsLoading(true);
          await fetch(API_URL, {
            method: 'GET',
            headers: {
              authorization: token,
            },
          })
            .then(response => response.json())
            .then(data => {
              if (data.status) {
                data.items.map(item => {
                  fetch(
                    `https://shelves-backend.onrender.com/api/bins/product/${item.code}`,
                  )
                    .then(res => res.json())
                    .then(results => {
                      const article = results.map(result => {
                        return {
                          code: item.code,
                          quantity: item.quantity,
                          description: item.description,
                          bin_id: result.bin_ID,
                          gondola_id: result.gondola_ID,
                        };
                      });
                      setArticles(...articles, article);
                    });
                });
                setIsLoading(false);
              }
            })
            .catch(error => console.log(error));
        } catch (error) {
          console.log(error);
        }
      };
      getShelvingReady();
    }, [token]),
  );

  console.log('articles', articles);

  const renderItem = ({item}) => (
    <TouchableOpacity className="flex-row border border-tb rounded-lg mt-2.5 p-3">
      <View className="flex-1">
        <Text className="text-[8px]" numberOfLines={1}>
          {item.code}
        </Text>
        <Text className="mt-1" numberOfLines={1}>
          {item.description}
        </Text>
      </View>
      <Text className="flex-1 text-center" numberOfLines={1}>
        {item.bin}
      </Text>
      <Text className="flex-1 text-center" numberOfLines={1}>
        {item.quantity}
      </Text>
    </TouchableOpacity>
  );

  return (
    <SafeAreaView className="flex-1 bg-white pt-14">
      <View className="flex-1 h-full px-4">
        <View className="screen-header flex-row items-center mb-4">
          <ButtonBack navigation={navigation} />
          <Text className="flex-1 text-lg text-sh text-center font-semibold capitalize">
            Shelving
          </Text>
        </View>

        <View className="content flex-1">
          {isLoading ? (
            <ActivityIndicator />
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
