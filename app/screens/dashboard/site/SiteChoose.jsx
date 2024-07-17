import React, { useEffect, useLayoutEffect, useState } from 'react';
import {
  ActivityIndicator, Image, SafeAreaView, ScrollView, Text,
  TouchableOpacity, TouchableWithoutFeedback, View
} from 'react-native';
import Toast from 'react-native-toast-message';
import { AvatarImage, SitesIcon } from '../../../../constant/icons';
import useAppContext from '../../../../hooks/useAppContext';
import { setStorage } from '../../../../hooks/useStorage';
const API_URL = 'https://api.shwapno.net/shelvesu/api/sites';

const SiteChoose = ({ navigation }) => {
  const { authInfo } = useAppContext();
  const { user, setUser, setUserSites, token, logout } = authInfo;
  const [isLoading, setIsLoading] = useState(false);
  const [search, setSearch] = useState('');
  let [sites, setSites] = useState([]);
  let singleSite = '';

  useLayoutEffect(() => {
    let screenOptions = {
      headerSearchBarOptions: {
        autoCapitalize: 'words',
        headerIconColor: 'black',
        onChangeText: (event) => setSearch(event.nativeEvent.text)
      }
    };
    navigation.setOptions(screenOptions);
  }, [navigation.isFocused()]);

  const getSites = async () => {
    try {
      setIsLoading(true);
      await fetch(API_URL, {
        method: 'GET',
        headers: {
          authorization: token,
          'Content-Type': 'application/json',
        },
      })
        .then(response => response.json())
        .then(result => {
          if (result.status) {
            setSites(result.sites.sort((a, b) => a.code.localeCompare(b.code)));
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
  }

  useEffect(() => {
    if (token) {
      getSites();
    }
  }, [token]);

  useEffect(() => {
    setUserSites(sites);
    setStorage('userSites', sites);
  }, [sites]);

  if (search !== '') {
    sites = sites.filter(item => item.code.toLowerCase().includes(search.toLowerCase()));
  }

  const updateUser = async (siteObj) => {
    let newUser = { ...user, site: siteObj.code, storage_location: siteObj.storage_location };
    setUser(newUser);
    await setStorage("user", newUser);
    navigation.navigate('Home');
  };

  if (!Array.isArray(user.site)) {
    navigation.navigate('Home');
    return;
  }

  if (user.site.length > 1 && !user.site.includes("all-site-access") && sites.length > 0) {
    sites = user.site.map(item => sites.find(site => site.code === item));
  }

  if (user.site.length === 1 && !user.site.includes("all-site-access") && sites.length > 0) {
    sites = user.site.map(item => sites.find(site => site.code === item));
    singleSite = sites.find(site => site.code === user.site[0]);
  }

  if (singleSite) {
    updateUser(singleSite);
  }

  if (isLoading) {
    return (
      <View className="w-full h-screen bg-white justify-center px-3">
        <ActivityIndicator size="large" color="#EB4B50" />
        <Text className="mt-4 text-gray-400 text-base text-center">
          Loading user sites. Please wait......
        </Text>
      </View>
    );
  }

  if (user.site.length === 0) {
    return (
      <SafeAreaView className="flex-1 bg-white pt-8">
        <View className="flex-1">
          <View className="h-full items-center justify-center px-3">
            <View className="photo">
              <Image
                className="w-36 h-36 rounded-full"
                source={AvatarImage}
              />
            </View>
            <View className="mt-3">
              <Text className="text text-blue-600 text-2xl font-semibold capitalize">hello, {user.name}</Text>
            </View>
            <View className="w-4/5 mt-3">
              <Text className="text text-center text-gray-400 text-lg">You don't have any site access. Please contact with admin</Text>
            </View>
            <View className="mt-5">
              <TouchableWithoutFeedback onPress={() => logout()}>
                <Text className="bg-[#AC3232] text-center text-white text-lg rounded-md px-3 py-1.5">Logout</Text>
              </TouchableWithoutFeedback>
            </View>
          </View>
        </View>
      </SafeAreaView>
    )
  }

  return (
    <SafeAreaView className="flex-1 bg-white">
      <View className="flex-1">
        <ScrollView>
          <View className="flex-row flex-wrap items-center px-3">
            {sites?.map(item => (
              <TouchableOpacity
                className="site-box items-center w-1/3 mt-8"
                onPress={() => updateUser(item)}
                key={item.code}>
                <View className="flex-col items-center">
                  <View className="icon">
                    <Image className="w-16 h-16" source={item.imgURL !== '' ? { uri: item.imgURL } : SitesIcon} />
                  </View>
                  <Text className="text text-black mt-3">{item.code}</Text>
                </View>
              </TouchableOpacity>
            ))}
          </View>
        </ScrollView>
      </View>
    </SafeAreaView>
  )
}


export default SiteChoose;