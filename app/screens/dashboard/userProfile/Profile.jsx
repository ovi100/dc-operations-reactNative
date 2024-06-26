import AsyncStorage from '@react-native-async-storage/async-storage';
import React, { useEffect, useState } from 'react';
import {
  ActivityIndicator, Alert, Image, ScrollView, Switch,
  Text,
  TouchableWithoutFeedback, View
} from 'react-native';
import Dialog from '../../../../components/Dialog';
import { ButtonBack, ButtonLogin } from '../../../../components/buttons';
import {
  AvatarImage,
  EmailIcon,
  IdIcon,
  PasswordIcon,
  ProfileIcon,
  StoreIcon,
  SwapIcon
} from '../../../../constant/icons';
import useAppContext from '../../../../hooks/useAppContext';
import { getStorage, setStorage } from '../../../../hooks/useStorage';
import { version } from '../../../../package.json';
import styles from '../../../../styles/button';

const Profile = ({ navigation }) => {
  const [isLoading, setIsLoading] = useState(false);
  const [isEnabled, setIsEnabled] = useState(false);
  const [dialogVisible, setDialogVisible] = useState(false);
  const [user, setUser] = useState({});
  const [sites, setSites] = useState([]);
  const { authInfo } = useAppContext();
  const { logout } = authInfo;

  useEffect(() => {
    const getUserInfo = async () => {
      setIsLoading(true);
      await getStorage('user', setUser, 'object');
      await getStorage('userSites', setSites, 'array');
      setIsLoading(false);
    }
    getUserInfo();
  }, [navigation.isFocused()]);

  useEffect(() => {
    const getPressMode = async () => {
      try {
        const value = await AsyncStorage.getItem('pressMode');
        if (value === null || value === 'false') {
          setIsEnabled(false);
        } else {
          setIsEnabled(true);
        }
      } catch (e) {
        Alert.alert(e);
      }
    };
    getPressMode();
  }, [isEnabled]);

  const toggleSwitch = () => {
    setIsEnabled(previousState => {
      setStorage('pressMode', String(!previousState));
      return !previousState;
    });
  };

  if (isLoading) {
    return (
      <View className="w-full h-screen justify-center px-3">
        <ActivityIndicator size="large" color="#EB4B50" />
        <Text className="mt-4 text-gray-400 text-base text-center">Loading profile. Please wait......</Text>
      </View>
    )
  }

  // console.log('user sites', JSON.stringify(sites));
  // console.log('user info', JSON.stringify(user));

  return (
    <>
      {!user.name ? (
        <View className="w-full h-screen justify-center px-3">
          <ActivityIndicator size="large" color="#EB4B50" />
          <Text className="mt-4 text-gray-400 text-base text-center">Loading profile. Please wait......</Text>
        </View>
      ) : (
        <View className="flex-1 bg-white px-4">
          <View className="screen-header flex-row items-center my-5">
            <ButtonBack navigation={navigation} />
            <Text className="flex-1 text-base text-black text-center font-semibold capitalize">
              profile
            </Text>
          </View>
          <ScrollView>
            <View className="content justify-between">
              <View className="">
                <View className="profile-image mx-auto mb-4">
                  <Image
                    className="w-28 h-28 rounded-full"
                    source={AvatarImage}
                  />
                </View>
                <View className="name border-b border-gray-200 flex-row items-center py-4">
                  <Image className="w-6 h-6 mr-3" source={ProfileIcon} />
                  <Text className="text-base text-gray-400 font-medium capitalize">
                    {user.name}
                  </Text>
                </View>
                <View className="email border-b border-gray-200 flex-row items-center py-4">
                  <Image className="w-6 h-6 mr-3" source={EmailIcon} />
                  <Text className="text-base text-gray-400 font-medium">
                    {user.email}
                  </Text>
                </View>
                <View className="role border-b border-gray-200 flex-row items-center py-4">
                  <Image className="w-6 h-6 mr-3" source={IdIcon} />
                  <Text className="text-base text-gray-400 font-medium capitalize">
                    {user.role}
                  </Text>
                </View>
                <View className="password-change border-b border-gray-200 flex-row items-center py-4">
                  <Image className="w-6 h-6 mr-3" source={PasswordIcon} />
                  <TouchableWithoutFeedback onPress={() => navigation.push('ChangePassword', { id: user._id })}>
                    <Text className="text-center text-blue-600 text-base font-semibold capitalize">change password</Text>
                  </TouchableWithoutFeedback>
                </View>
                {(user.hasPermission.includes('*') || user.hasPermission.includes('press-mode-access')) && (
                  <View className="switch border-b border-gray-200 flex-row items-center py-4">
                    <View className="flex-row items-center">
                      <TouchableWithoutFeedback onPress={() => toggleSwitch()}>
                        <Switch
                          trackColor={{ false: '#3c3c3c', true: '#386641' }}
                          thumbColor={isEnabled ? '#3a5a40' : '#081c15'}
                          ios_backgroundColor="#3e3e3e"
                          value={isEnabled}
                          onPress={() => toggleSwitch()}
                        />
                      </TouchableWithoutFeedback>
                      <TouchableWithoutFeedback onPress={() => toggleSwitch()}>
                        <Text className={`text-base ${isEnabled ? 'text-[#386641]' : 'text-[#bc4749]'} font-medium`}>
                          {isEnabled ? 'Press mode is on' : 'Press mode is off'}
                        </Text>
                      </TouchableWithoutFeedback>
                    </View>
                  </View>
                )}
                <View className="active-site border-b border-gray-200 flex-row items-center py-4">
                  <Image className="w-6 h-6 mr-3" source={StoreIcon} />
                  <View className="flex-row items-center">
                    <Text className="text-base text-gray-400 font-medium uppercase">
                      {user.site}
                    </Text>
                    <Text className="text-base text-gray-400 font-medium capitalize ml-2">
                      (active site)
                    </Text>
                  </View>
                </View>

                {sites !== null && sites.length > 1 && (
                  <View className="password-change border-b border-gray-200 flex-row items-center py-4">
                    <Image className="w-6 h-6 mr-3" source={SwapIcon} />
                    <TouchableWithoutFeedback onPress={() => navigation.replace('ChooseSite', user)}>
                      <Text className="text-center text-blue-600 text-base font-semibold capitalize">change site</Text>
                    </TouchableWithoutFeedback>
                  </View>
                )}
              </View>
              <View className="pb-2 mt-10">
                <View className="version-info w-full">
                  <Text className="text-gray-400 text-center font-bold capitalize">
                    shwapno operations app
                  </Text>
                  <Text className="text-gray-400 text-center font-bold capitalize">
                    v {version}
                  </Text>
                </View>
                <View className="mt-5">
                  <ButtonLogin
                    title="Logout"
                    onPress={() => setDialogVisible(true)}
                    buttonStyles={styles.buttonLogin}
                    textStyles={styles.lgText}
                  />
                </View>
              </View>
            </View>
          </ScrollView>
          <Dialog
            isOpen={dialogVisible}
            modalHeader="Are you sure?"
            modalSubHeader="Some saved data and setting might be lost."
            onClose={() => setDialogVisible(false)}
            onSubmit={() => logout()}
            leftButtonText="cancel"
            rightButtonText="confirm"
          />
        </View>
      )}
    </>
  );
};

export default Profile;