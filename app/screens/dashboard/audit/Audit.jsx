import { useFocusEffect } from '@react-navigation/native';
import React, { useCallback, useEffect, useState } from 'react';
import {
  ActivityIndicator,
  FlatList,
  SafeAreaView,
  Text,
  TextInput,
  TouchableOpacity,
  View
} from 'react-native';
import { getStorage } from '../../../../hooks/useStorage';


// components
import Toast from 'react-native-toast-message';
import ServerError from '../../../../components/animations/ServerError';
import { ButtonBack } from '../../../../components/buttons';


const Audit = ({ navigation }) => {
  // states
  const [user, setUser] = useState(null);
  const [token, setToken] = useState('');
  const [shelveData, setShelveData] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  const API_URL = 'https://shwapnooperation.onrender.com/api/product-shelving/in-shelf?filterBy=site&';

  useEffect(() => {
    const getAsyncStorage = async () => {
      await getStorage('token', setToken, 'string');
      await getStorage('user', setUser, 'object');
    }
    getAsyncStorage();
  }, []);

  // custom functions
  const makeOrganizedData = (data) => {
    let organizedData = {};

    data.forEach(item => {
      item.inShelf.forEach(shelfItem => {
        const key = shelfItem.gondola + shelfItem.bin + item.code;

        if (organizedData[key]) {
          organizedData[key].quantity += shelfItem.quantity;
        } else {
          organizedData[key] = {
            key: shelfItem.gondola + shelfItem.bin + item.code,
            code: item.code,
            description: item.description,
            quantity: shelfItem.quantity,
            bin: shelfItem.bin,
            gondola: shelfItem.gondola,
          };
        }
      });
    });

    return Object.values(organizedData);
  }

  const getShelveData = async () => {
    try {
      setIsLoading(true);
      await fetch(API_URL + `value=${user?.site}&pageSize=500`, {
        method: 'GET',
        headers: {
          authorization: token,
          'Content-Type': 'application/json',
        },
      })
        .then(response => response.json())
        .then(result => {
          if (result.status) {
            setShelveData(makeOrganizedData(result.items));
            setIsLoading(false);
          } else {
            Toast.show({
              type: 'customError',
              text1: result.message,
            });
            setIsLoading(false);
          }
        })
        .catch(error => {
          Toast.show({
            type: 'customError',
            text1: error.message,
          });
          setIsLoading(false);
        });
    } catch (error) {
      Toast.show({
        type: 'customError',
        text1: error.message,
      });
      setIsLoading(false);
    }
  };

  useFocusEffect(
    useCallback(() => {
      if (token && user?.site) {
        getShelveData();
      }
    }, [token, user?.site]),
  );

  const [searchQuery, setSearchQuery] = useState('');
  const [selectedProduct, setSelectedProduct] = useState(null);

  const filteredData = shelveData.filter(item =>
    item.description.toLowerCase().includes(searchQuery.toLowerCase()) ||
    item.code.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const renderItem = ({ item }) => (
    <TouchableOpacity onPress={() => handleSelectProduct(item)}>
      <Text className="text-black py-3 px-3  
       rounded" >{item.code} - {item.description}</Text>
    </TouchableOpacity>
  );

  const handleSearchQuery = (e) => {
    setSelectedProduct(null)
    setSearchQuery(e)
  }

  const handleSelectProduct = product => {
    setSelectedProduct(product);
    setSearchQuery(product.code)
  };

  if (isLoading) {
    return (
      <View className="w-full h-screen justify-center px-3">
        <ActivityIndicator size="large" color="#EB4B50" />
        <Text className="mt-4 text-gray-400 text-base text-center">Loading audit data. Please wait......</Text>
      </View>
    )
  }

  if (!shelveData || shelveData.length === 0) {
    return (
      <View className="h-3/4 flex-1 items-center justify-center">
        <ServerError />
        <Text className="text-sh text-lg">No data available</Text>
      </View>
    );
  }

  return (
    <SafeAreaView className="flex-1 bg-white pt-8">
      <View className="h-full px-4">
        <View className="screen-header flex flex-row items-center justify-between mb-4">
          <ButtonBack navigation={navigation} />
          <Text className="text-lg text-sh text-center font-semibold capitalize">
            Audit Screen
          </Text>
          <Text className="invisible w-2"></Text>
        </View>
        <View style={{ flex: 1 }}>

          <TextInput
            className="py-2 px-3 border mb-4 rounded-md text-slate-900 "
            placeholderTextColor="#333"
            placeholder="Search Product by code or name..."
            onChangeText={(e) => handleSearchQuery(e)}
            value={searchQuery}
          />


          {searchQuery && !selectedProduct &&
            <View className="border border-gray-600 rounded">
              <FlatList
                data={filteredData}
                renderItem={renderItem}
                keyExtractor={item => item.key}
                initialNumToRender={10}
                keyboardShouldPersistTaps="always"
              />
            </View>}
          {searchQuery && selectedProduct && (
            <View className="p-4 shadow border-[0.5px  rounded-md text-slate-800">
              <View className="mb-3 border-b-[0.5px]">
                <Text className="text-slate-600 font-medium">Code:</Text>
                <Text className="text-slate-800 text-2xl font-bold mb-3">{selectedProduct?.code}</Text>
              </View>
              <View className="mb-3 border-b-[0.5px]">
                <Text className="text-slate-800 font-medium">Description:</Text>
                <Text className="text-slate-800 text-2xl font-bold mb-3">{selectedProduct?.description}</Text>
              </View>
              <View className="mb-3 border-b-[0.5px]">
                <Text className="text-slate-600 font-medium">Quantity:</Text>
                <Text className="text-slate-800 text-2xl font-bold mb-3">{selectedProduct?.quantity}</Text>
              </View>
              <View className="mb-3 border-b-[0.5px]">
                <Text className="text-slate-600 font-medium">Bin:</Text>
                <Text className="text-slate-800 text-2xl font-bold mb-3">{selectedProduct?.bin}</Text>
              </View>
              <View className="mb-3 border-b-[0.5px]">
                <Text className="text-slate-600 font-medium">Gondola:</Text>
                <Text className="text-slate-800 text-2xl font-bold mb-3">{selectedProduct?.gondola}</Text>
              </View>
            </View>
          )}
        </View>

      </View>
    </SafeAreaView>
  );
};

export default Audit;