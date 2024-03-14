import React from 'react';
import { Image, Text, TouchableOpacity, View } from 'react-native';
import { ButtonBackProfile, ButtonLogin } from '../../../../components/buttons';
import {
  AvatarImage,
  EmailIcon,
  IdIcon,
  LoginBGImage,
  PasswordIcon,
  ProfileIcon
} from '../../../../constant/icons';
import useAppContext from '../../../../hooks/useAppContext';
import styles from '../../../../styles/button';

const Profile = ({ navigation }) => {
  const { authInfo } = useAppContext();
  const { logout, user } = authInfo;

  return (
    <View className="flex-1 bg-white">
      <Image className="h-full w-full absolute -top-20" source={LoginBGImage} />
      <View className="flex-1">
        <View className="screen-header flex-row items-center mt-5 mb-4 px-4">
          <ButtonBackProfile navigation={navigation} />
          <Text className="flex-1 text-lg text-white text-center font-semibold capitalize">
            profile
          </Text>
        </View>
        <View className="content mt-32">
          <View className="px-4 mt-5">
            <View className="w-full px-4">
              <View className="profile-image mb-4 mx-auto">
                <Image
                  className="w-28 h-28 rounded-full"
                  source={AvatarImage}
                />
              </View>
            </View>
            <View className="w-full px-4">
              <View className="name border-b border-gray-200 flex-row items-center gap-3 py-3">
                <Image className="w-5 h-5" source={ProfileIcon} />
                <Text className="text-base text-gray-400 font-medium capitalize">
                  {user.name}
                </Text>
              </View>
            </View>
            <View className="w-full px-4">
              <View className="email border-b border-gray-200 flex-row items-center gap-3 py-3">
                <Image className="w-5 h-5" source={EmailIcon} />
                <Text className="text-base text-gray-400 font-medium">
                  {user.email}
                </Text>
              </View>
            </View>
            <View className="w-full px-4">
              <View className="role border-b border-gray-200 flex-row items-center gap-3 py-3">
                <Image className="w-5 h-5" source={IdIcon} />
                <Text className="text-base text-gray-400 font-medium capitalize">
                  {user.role}
                </Text>
              </View>
            </View>
            <View className="w-full px-4">
              <View className="password-change border-b border-gray-200 flex-row items-center gap-3 py-3">
                <Image className="w-5 h-5" source={PasswordIcon} />
                <TouchableOpacity onPress={() => navigation.push('ChangePassword', { id: user._id })}>
                  <Text className="bg-blue-500 text-white text-base rounded font-medium capitalize py-2 px-3">
                    change password
                  </Text>
                </TouchableOpacity>
              </View>
            </View>
          </View>
        </View>

        <View className="w-full px-4 mt-5">
          <ButtonLogin
            title="Logout"
            onPress={logout}
            buttonStyles={styles.buttonLogin}
            textStyles={styles.lgText}
          />
        </View>
      </View>
    </View>
  );
};

export default Profile;
