import React from 'react';
import { Image, SafeAreaView, Text, TouchableOpacity, View } from 'react-native';
import { SiteIcon } from '../../../constant/icons';
import useAppContext from '../../../hooks/useAppContext';
import { setStorage } from '../../../hooks/useStorage';

const SiteModal = ({ navigation }) => {
  const { authInfo } = useAppContext();
  const { user } = authInfo;
  // const [sites, setSites] = useState([]);

  console.log('user from site modal', user);

  console.log(Array.isArray(user.site))

  if (!Array.isArray(user.site)) {
    navigation.navigate('Home');
    return;
  }


  const updateUser = (site) => {
    let newUser = { ...user, site: site };
    console.log('updated user', newUser);
    setStorage("user", newUser);
    navigation.navigate('Home');
  };

  return (
    <SafeAreaView className="flex-1 bg-white pt-8">
      <View className="flex-1">
        <View className="flex-row flex-wrap items-center px-3">
          {user?.site.map(item => (
            <TouchableOpacity
              className="site-box items-center w-1/3 mt-8"
              onPress={() => updateUser(item)}
              key={item}>
              <View className="flex-col items-center">
                <View className="icon">
                  <Image className="w-16 h-16" source={SiteIcon} />
                </View>
                <Text className="text text-black mt-3">{item}</Text>
              </View>
            </TouchableOpacity>
          ))}
        </View>
      </View>
    </SafeAreaView>
  )
}


export default SiteModal;
