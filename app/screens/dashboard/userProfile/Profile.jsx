import AsyncStorage from '@react-native-async-storage/async-storage';
import { Picker } from '@react-native-picker/picker';
import React, { useEffect, useState } from 'react';
import { ActivityIndicator, Alert, Image, Switch, Text, TouchableOpacity, View } from 'react-native';
import { ButtonBackProfile, ButtonLogin } from '../../../../components/buttons';
import {
  AvatarImage,
  EmailIcon,
  IdIcon,
  LoginBGImage,
  PasswordIcon,
  ProfileIcon,
  SwitchIcon
} from '../../../../constant/icons';
import useAppContext from '../../../../hooks/useAppContext';
import { getStorage, setStorage } from '../../../../hooks/useStorage';
import styles from '../../../../styles/button';

const Profile = ({ navigation }) => {
  const [isLoading, setIsLoading] = useState(false);
  const [isEnabled, setIsEnabled] = useState(false);
  const [selectedSite, setSelectedSite] = useState('');
  const [user, setLsUser] = useState({});
  const [site, setSite] = useState([]);
  const { authInfo } = useAppContext();
  const { logout, setUser } = authInfo;

  useEffect(() => {
    const getUserInfo = async () => {
      setIsLoading(true);
      await getStorage('user', setLsUser, 'object');
      await getStorage('usersite', setSite, 'object');
      setIsLoading(false);
    }
    getUserInfo();
  }, []);

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

  const updateUser = (site) => {
    setSelectedSite(site);
    let newUser = { ...user, site: site };
    setUser(newUser);
    setStorage("user", newUser);
  };

  if (isLoading) {
    return (
      <View className="w-full h-screen justify-center px-3">
        <ActivityIndicator size="large" color="#EB4B50" />
        <Text className="mt-4 text-gray-400 text-base text-center">Loading profile. Please wait......</Text>
      </View>
    )
  }

  return (
    <View className="flex-1 bg-white">
      <Image className="h-full w-full absolute -top-20" source={LoginBGImage} />
      <View className="flex-1 h-full">
        <View className="screen-header flex-row items-center mt-5 mb-4 px-4">
          <ButtonBackProfile navigation={navigation} />
          <Text className="flex-1 text-lg text-white text-center font-semibold capitalize">
            profile
          </Text>
        </View>
        <View className="content mt-40">
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
            <View className="w-full px-4">
              <View className="switch border-b border-gray-200 flex-row items-center gap-3 py-3">
                <Image className="w-6 h-5" source={SwitchIcon} />
                <Switch
                  trackColor={{ false: 'red', true: 'green' }}
                  thumbColor={'#dddddd'}
                  ios_backgroundColor="#3e3e3e"
                  onValueChange={toggleSwitch}
                  value={isEnabled}
                />
                <Text className={`text-base ${isEnabled ? 'text-green-600' : 'text-red-600'} font-medium capitalize`}>
                  {isEnabled ? 'press mode enabled' : 'press mode disabled'}
                </Text>
              </View>
            </View>
            {site !== null && (
              <View className="site mt-2 px-3">
                {/* picker select box */}
                <View className="bg-white border border-solid border-gray-300 rounded">
                  <Picker
                    selectedValue={selectedSite}
                    onValueChange={site => updateUser(site)}
                    style={{ color: 'black' }}>
                    <Picker.Item label={user.site} value={user.site} />
                    {site?.map((item, i) => (
                      <Picker.Item
                        label={item}
                        value={item}
                        key={i}
                        style={{ color: 'black' }}
                      />
                    ))}
                  </Picker>
                </View>
              </View>
            )}
          </View>
        </View>

        <View className="w-full px-4 mt-2">
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
