import { API_URL } from '@env';
import { HeaderBackButton } from '@react-navigation/elements';
import { Picker } from '@react-native-picker/picker';
import { useFocusEffect } from '@react-navigation/native';
import { useCallback, useEffect, useLayoutEffect, useState } from 'react';
import { SafeAreaView, Text, View } from 'react-native';
import Toast from 'react-native-toast-message';
import CustomToast from '../../../../../components/CustomToast';
import { ButtonBack, ButtonLg, ButtonProfile } from '../../../../../components/buttons';
import useBackHandler from '../../../../../hooks/useBackHandler';
import { getStorage } from '../../../../../hooks/useStorage';

const PickerPackerTaskAssign = ({ navigation, route }) => {
  const { sto } = route.params;
  const [isLoading, setIsLoading] = useState(false);
  const [pickers, setPickers] = useState([]);
  const [packers, setPackers] = useState([]);
  const [token, setToken] = useState('');

  // Custom hook to navigate screen
  useBackHandler('TaskAssign');

  useLayoutEffect(() => {
    let screenOptions = {
      headerTitle: `STO ${sto}`,
      headerTitleAlign: 'center',
      headerLeft: () => (
        <HeaderBackButton onPress={() => navigation.replace('TaskAssign')} />
      ),
      headerRight: () => (
        <ButtonProfile onPress={() => navigation.replace('Profile', { screen: route.name, data: route.params })} />
      ),
    };
    navigation.setOptions(screenOptions);
  }, [navigation.isFocused()]);

  useEffect(() => {
    getStorage('token', setToken, 'string');
  }, []);

  const getUsers = async () => {
    try {
      setIsLoading(true);
      await fetch(API_URL + 'api/user?pageSize=50', {
        method: 'GET',
        headers: {
          authorization: token,
        },
      })
        .then(response => response.json())
        .then(data => {
          if (data.status) {
            const users = data.items;
            const pickers = users.filter(user => user.role === 'picker');
            const packers = users.filter(user => user.role === 'packer');
            setPickers(pickers);
            setPackers(packers);
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
      });
      setIsLoading(false);
    }
  };

  useFocusEffect(
    useCallback(() => {
      if (token) {
        getUsers();
      }
    }, [token]),
  );


  const [selectedPicker, setSelectedPicker] = useState(null);
  const [selectedPacker, setSelectedPacker] = useState(null);

  const updateTask = async () => {
    const assignedPicker = pickers.find(item => item.name === selectedPicker);
    const assignedPacker = packers.find(item => item.name === selectedPacker);
    let data = {};
    if (assignedPicker && assignedPacker) {
      data = {
        sto: sto,
        picker: assignedPicker.name,
        pickerId: assignedPicker._id,
        packer: assignedPacker.name,
        packerId: assignedPacker._id,
        status: 'picker packer assigned'
      };
    } else {
      Toast.show({
        type: 'customError',
        text1: 'please select picker and picker',
      });
      return;
    }

    try {
      await fetch(API_URL + 'api/sto-tracking/update', {
        method: 'PATCH',
        headers: {
          authorization: token,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(data),
      })
        .then(response => response.json())
        .then(data => {
          if (data.status) {
            Toast.show({
              type: 'customSuccess',
              text1: 'Task assigned successfully',
            });
            setTimeout(() => {
              navigation.replace('TaskAssign');
            }, 1000);
          } else {
            Toast.show({
              type: 'customError',
              text1: data.message,
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
      });
    }
  };

  return (
    <SafeAreaView className="flex-1 bg-white">
      <View className="flex-1 h-full px-4">
        <View className="content flex-1 justify-between py-2">
          <View className="picker-packer-assign">
            <View className="picker mb-4">
              <Text className="text-base text-sh font-semibold capitalize mb-2">
                assign picker
              </Text>
              {/* picker select box */}
              <View className="bg-white border border-solid border-gray-300 rounded mb-3 px-3">
                <Picker
                  selectedValue={selectedPicker}
                  onValueChange={picker => setSelectedPicker(picker)}
                  style={{ color: 'black' }}>
                  <Picker.Item label="Select Picker" value="" />
                  {pickers.map((picker, i) => (
                    <Picker.Item
                      label={picker.name}
                      value={picker.name}
                      key={i}
                      style={{ color: 'black' }}
                    />
                  ))}
                </Picker>
              </View>
            </View>
            <View className="packer">
              <Text className="text-base text-sh font-semibold capitalize mb-2">
                assign packer
              </Text>

              {/* packer select box */}
              <View className="bg-white border border-solid border-gray-300 rounded mb-3 px-3">
                <Picker
                  selectedValue={selectedPacker}
                  onValueChange={packer => setSelectedPacker(packer)}
                  style={{ color: 'black' }}>
                  <Picker.Item label="Select Packer" value="" />
                  {packers.map((packer, i) => (
                    <Picker.Item
                      label={packer.name}
                      value={packer.name}
                      key={i}
                      style={{ color: 'black' }}
                    />
                  ))}
                </Picker>
              </View>
            </View>
          </View>

          <View className="button mt-3">
            <ButtonLg title="Task Assign" onPress={() => updateTask()} />
          </View>
        </View>
      </View>
      <CustomToast />
    </SafeAreaView>
  );
};

export default PickerPackerTaskAssign;
