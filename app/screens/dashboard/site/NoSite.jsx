import React from 'react';
import { Image, SafeAreaView, Text, TouchableWithoutFeedback, View } from 'react-native';
import useAppContext from '../../../../hooks/useAppContext';
import { AvatarImage } from '../../../../constant/icons';

const SiteChoose = () => {
  const { authInfo } = useAppContext();
  const { user, logout } = authInfo;

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


export default SiteChoose;
