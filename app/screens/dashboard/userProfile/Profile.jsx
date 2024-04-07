import React, { useEffect, useState } from 'react';
import { Picker } from '@react-native-picker/picker';
import { Image, Switch, Text, TouchableOpacity, View } from 'react-native';
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
import styles from '../../../../styles/button';
import { getStorage, setStorage } from '../../../../hooks/useStorage';
import AsyncStorage from '@react-native-async-storage/async-storage';

const Profile = ({ navigation }) => {
  const [isLoading, setIsLoading] = useState(false);
  const [isEnabled, setIsEnabled] = useState(false);
  const [site, setSite] = useState([]);
  const [selectedSite, setSelectedSite] = useState('');
  const [token, setToken] = useState('');
  const { authInfo } = useAppContext();
  const { logout, user } = authInfo;

  useEffect(() => {
    getStorage('token', setToken, 'string');
  }, []);

  useEffect(() => {
    const getUserSites = async (id) => {
      setIsLoading(true);
      await fetch(`https://shwapnooperation.onrender.com/api/user//${id}`, {
        method: 'GET',
        headers: {
          authorization: token,
          'Content-Type': 'application/json',
        }
      })
        .then(res => res.json())
        .then(result => {
          console.log(result)
          if (result.status) {
            let userSite = result.user.site;
            setSite(userSite);
            setIsLoading(false);
          } else {
            setIsLoading(false);
          }
        });
    };

    if (token && user._id) {
      getUserSites(user._id);
    }

  }, [token, user._id]);

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

  console.log(site)

  const updateUser = (site) => {
    setSelectedSite(site)
    let newUser = { ...user, site: site };
    setUser(newUser);
    setStorage("user", newUser);
  };

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
              <View className="role border-b border-gray-200 flex-row items-center gap-3 py-3">
                {/* <Text className="text-base text-gray-400 font-medium capitalize">
                  press mode:
                </Text> */}
                <Image className="w-6 h-5" source={SwitchIcon} />
                <Switch
                  trackColor={{ false: 'red', true: 'green' }}
                  thumbColor={'#f4f3f4'}
                  ios_backgroundColor="#3e3e3e"
                  onValueChange={toggleSwitch}
                  value={isEnabled}
                />
              </View>
            </View>
            <View className="site mt-2">
              {/* picker select box */}
              <View className="bg-white border border-solid border-gray-300 rounded px-3">
                <Picker
                  selectedValue={selectedSite}
                  onValueChange={site => updateUser(site)}
                  style={{ color: 'black' }}>
                  <Picker.Item label="Change Site" value="" />
                  {site.map((item, i) => (
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
