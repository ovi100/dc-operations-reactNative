import AsyncStorage from '@react-native-async-storage/async-storage';
import React, { useEffect, useState } from 'react';
import {
  ActivityIndicator, Alert, Image, RefreshControl, ScrollView, Switch,
  Text,
  TouchableOpacity,
  TouchableWithoutFeedback, View
} from 'react-native';
import Toast from 'react-native-toast-message';
import Dialog from '../../../../components/Dialog';
import { ButtonBack, ButtonLogin } from '../../../../components/buttons';
import {
  AvatarImage,
  EmailIcon,
  IdIcon,
  PasswordIcon,
  ProfileIcon,
  StoreIcon,
  SwitchIcon
} from '../../../../constant/icons';
import useAppContext from '../../../../hooks/useAppContext';
import { getStorage, setStorage } from '../../../../hooks/useStorage';
import { version } from '../../../../package.json';
import styles from '../../../../styles/button';
const API_URL = 'https://shwapnooperation.onrender.com/api/user/';

const Profile = ({ navigation }) => {
  const [isLoading, setIsLoading] = useState(false);
  const [isEnabled, setIsEnabled] = useState(false);
  const [refreshing, setRefreshing] = useState(false);
  const [dialogVisible, setDialogVisible] = useState(false);
  const [token, setToken] = useState('');
  const [user, setLsUser] = useState({});
  const [sites, setSites] = useState([]);
  const [activeSite, setLsActiveSite] = useState(null);
  const { authInfo } = useAppContext();
  const { logout, setUser, setActiveSite } = authInfo;

  useEffect(() => {
    const getUserInfo = async () => {
      setIsLoading(true);
      await getStorage('token', setToken);
      await getStorage('user', setLsUser, 'object');
      await getStorage('activeSite', setLsActiveSite);
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

  const getUserInfo = async () => {
    try {
      await fetch(API_URL + user._id, {
        method: 'GET',
        headers: {
          authorization: token,
        }
      }).then(response => response.json())
        .then(result => {
          if (result.status) {
            const serverUser = result.user;
            setLsUser(serverUser);
            setUser(serverUser);
            setStorage("user", serverUser);
          } else {
            Toast.show({
              type: 'customError',
              text1: result.message,
            });
          }
        })
        .catch(error => {
          Toast.show({
            type: 'customError',
            text1: error.message,
          });
        });
    } catch (error) {
      Toast.show({
        type: 'customError',
        text1: error.message,
      })
    }
  };

  const onRefresh = async () => {
    if (user._id) {
      setRefreshing(true);
      await getUserInfo();
      setRefreshing(false);
    }
  };

  const toggleSwitch = () => {
    setIsEnabled(previousState => {
      setStorage('pressMode', String(!previousState));
      return !previousState;
    });
  };

  const updateUser = async (site) => {
    let newUser = { ...user, site: site };
    setUser(newUser);
    setActiveSite(site);
    await setStorage("user", newUser);
    await setStorage("activeSite", site);
  };

  if (isLoading) {
    return (
      <View className="w-full h-screen justify-center px-3">
        <ActivityIndicator size="large" color="#EB4B50" />
        <Text className="mt-4 text-gray-400 text-base text-center">Loading profile. Please wait......</Text>
      </View>
    )
  }

  console.log('user sites', sites);

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
            <Text className="flex-1 text-lg text-black text-center font-semibold capitalize">
              profile
            </Text>
          </View>
          <ScrollView refreshControl={
            <RefreshControl
              colors={["white", "red", "green", "yellow"]}
              onRefresh={onRefresh}
              progressBackgroundColor="#000"
              refreshing={refreshing}
            />
          }>
            <View className="content flex-1 justify-center mt-5">
              <View className="pb-2">
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
                {(user.hasPermission.includes('*') || user.hasPermission.includes('press-mode-access')) && (
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
                )}
                <View className="active-site border-b border-gray-200 flex-row items-center py-4">
                  <Image className="w-5 h-5 mr-3" source={StoreIcon} />
                  <Text className="text-base text-green-400 font-medium uppercase">
                    {activeSite}
                  </Text>
                </View>
                {sites !== null && sites.length > 1 && (
                  <View className="choose-site bg-white rounded mt-4">
                    <TouchableOpacity onPress={() => navigation.push('SiteChoose', { from: 'profile' })}>
                      <Text className="w-full bg-blue-600 text-white text-lg text-center font-semibold rounded mx-auto mt-4 p-3.5 capitalize">
                        choose site
                      </Text>
                    </TouchableOpacity>
                  </View>
                )}

                <View className="mt-5">
                  <ButtonLogin
                    title="Logout"
                    onPress={() => setDialogVisible(true)}
                    buttonStyles={styles.buttonLogin}
                    textStyles={styles.lgText}
                  />
                </View>
              </View>
              <View className="version-info w-full mt-5">
                <Text className="text-gray-400 text-center font-bold capitalize">
                  shwapno operations app
                </Text>
                <Text className="text-gray-400 text-center font-bold capitalize">
                  v {version}
                </Text>
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
