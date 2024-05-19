import AsyncStorage from '@react-native-async-storage/async-storage';
import { Picker } from '@react-native-picker/picker';
import React, { useEffect, useState } from 'react';
import {
  ActivityIndicator, Alert, Image, ScrollView, Switch,
  Text,
  TouchableWithoutFeedback, View
} from 'react-native';
import { ButtonBack, ButtonLogin } from '../../../../components/buttons';
import {
  AvatarImage,
  EmailIcon,
  IdIcon,
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
  const [sites, setSites] = useState([]);
  const { authInfo } = useAppContext();
  const { logout, setUser } = authInfo;

  useEffect(() => {
    const getUserInfo = async () => {
      setIsLoading(true);
      await getStorage('user', setLsUser, 'object');
      await getStorage('userSites', setSites, 'object');
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
    <View className="flex-1 bg-white px-4">
      <View className="screen-header flex-row items-center my-5">
        <ButtonBack navigation={navigation} />
        <Text className="flex-1 text-lg text-black text-center font-semibold capitalize">
          profile
        </Text>
      </View>
      <ScrollView>
        <View className="content flex-1 justify-center mt-5">
          <View className="">
            <View className="profile-image mx-auto mb-4">
              <Image
                className="w-28 h-28 rounded-full"
                source={AvatarImage}
              />
            </View>
            <View className="name border-b border-gray-200 flex-row items-center py-4">
              <Image className="w-5 h-5 mr-3" source={ProfileIcon} />
              <Text className="text-base text-gray-400 font-medium capitalize">
                {user.name}
              </Text>
            </View>
            <View className="email border-b border-gray-200 flex-row items-center py-4">
              <Image className="w-5 h-5 mr-3" source={EmailIcon} />
              <Text className="text-base text-gray-400 font-medium">
                {user.email}
              </Text>
            </View>
            <View className="role border-b border-gray-200 flex-row items-center py-4">
              <Image className="w-5 h-5 mr-3" source={IdIcon} />
              <Text className="text-base text-gray-400 font-medium capitalize">
                {user.role}
              </Text>
            </View>
            <View className="password-change border-b border-gray-200 flex-row items-center py-4">
              <Image className="w-5 h-5 mr-3" source={PasswordIcon} />
              <TouchableWithoutFeedback onPress={() => navigation.push('ChangePassword', { id: user._id })}>
                <Text className="text-center text-blue-600 text-base font-semibold capitalize">change password</Text>
              </TouchableWithoutFeedback>
            </View>
            <View className="switch border-b border-gray-200 flex-row items-center py-4">
              <Image className="w-6 h-5 mr-2" source={SwitchIcon} />
              <View className="flex-row items-center">
                <TouchableWithoutFeedback onPress={() => toggleSwitch()}>
                  <Switch
                    trackColor={{ false: 'red', true: 'green' }}
                    thumbColor={'#dddddd'}
                    ios_backgroundColor="#3e3e3e"
                    value={isEnabled}
                    onPress={() => toggleSwitch()}
                  />
                </TouchableWithoutFeedback>
                <TouchableWithoutFeedback onPress={() => toggleSwitch()}>
                  <Text className={`text-base ${isEnabled ? 'text-green-600' : 'text-red-600'} font-medium`}>
                    {isEnabled ? 'Press mode is enabled' : 'Press mode is disabled'}
                  </Text>
                </TouchableWithoutFeedback>
              </View>
            </View>
            {sites !== null && (
              <View className="site bg-white border border-solid border-gray-300 rounded mt-4">
                <Picker
                  selectedValue={selectedSite}
                  onValueChange={site => updateUser(site)}
                  style={{ color: 'black' }}>
                  <Picker.Item label='Select site' value='' />
                  {sites?.map((item, i) => (
                    <Picker.Item
                      label={item.code}
                      value={item.code}
                      key={i}
                      style={{ color: user.site === item.code ? 'green' : 'black', fontWeight: '600' }}
                    />
                  ))}
                </Picker>
              </View>
            )}

            <View className="mt-5">
              <ButtonLogin
                title="Logout"
                onPress={logout}
                buttonStyles={styles.buttonLogin}
                textStyles={styles.lgText}
              />
            </View>
          </View>
        </View>
      </ScrollView>
    </View>
  );
};

export default Profile;
