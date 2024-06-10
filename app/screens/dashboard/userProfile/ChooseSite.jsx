import React, { useEffect, useState } from 'react';
import {
  ActivityIndicator, Image, SafeAreaView,
  ScrollView, Text, TouchableOpacity, View
} from 'react-native';
import Toast from 'react-native-toast-message';
import CustomToast from '../../../../components/CustomToast';
import { SitesIcon } from '../../../../constant/icons';
import useAppContext from '../../../../hooks/useAppContext';
import useBackHandler from '../../../../hooks/useBackHandler';
import { getStorage, setStorage } from '../../../../hooks/useStorage';

const ChooseSite = ({ navigation }) => {
  const [isLoading, setIsLoading] = useState(false);
  const { authInfo } = useAppContext();
  const { user, setUser } = authInfo;
  let [sites, setSites] = useState([]);

  // Custom hook to navigate screen
  useBackHandler('Profile');

  useEffect(() => {
    const getUserInfo = async () => {
      setIsLoading(true);
      await getStorage('userSites', setSites, 'array');
      setIsLoading(false);
    }
    getUserInfo();
  }, []);

  const updateUser = async (newSite) => {
    let newUser = { ...user, site: newSite };
    setUser(newUser);
    await setStorage("user", newUser);
    Toast.show({
      type: 'customSuccess',
      text1: 'Site updated successfully',
    });
  };

  if (isLoading) {
    return (
      <View className="w-full h-screen justify-center px-3">
        <ActivityIndicator size="large" color="#EB4B50" />
        <Text className="mt-4 text-gray-400 text-base text-center">
          Loading user sites. Please wait......
        </Text>
      </View>
    );
  }

  return (
    <SafeAreaView className="flex-1 bg-white pt-8">
      <View className="flex-1">
        <View className="screen-header mb-5 px-6">
          <Text className="text-lg text-[#060239] text-center font-semibold capitalize">
            choose site
          </Text>
        </View>
        <ScrollView>
          <View className="flex-row flex-wrap items-center px-3">
            {sites?.map(item => (
              <TouchableOpacity
                className="site-box items-center w-1/3 mt-8"
                onPress={() => updateUser(item.code)}
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
      <CustomToast />
    </SafeAreaView>
  )
}


export default ChooseSite;