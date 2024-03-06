import { Picker } from '@react-native-picker/picker';
import { useFocusEffect } from '@react-navigation/native';
import { useCallback, useEffect, useState } from 'react';
import { SafeAreaView, Text, View } from 'react-native';
import { ButtonBack, ButtonLg } from '../../../../../components/buttons';
import { getStorage } from '../../../../../hooks/useStorage';
import { toast } from '../../../../../utils';

const PickerPackerTaskAssign = ({ navigation, route }) => {
  const { sto } = route.params;
  const [isLoading, setIsLoading] = useState(false);
  const [pickers, setPickers] = useState([]);
  const [packers, setPackers] = useState([]);
  const [token, setToken] = useState('');
  const API_URL = 'https://shwapnooperation.onrender.com/api/';

  useEffect(() => {
    getStorage('token', setToken, 'string');
  }, []);

  const getUsers = async () => {
    try {
      setIsLoading(true);
      await fetch(API_URL + 'user?pageSize=50', {
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
        .catch(error => toast(error.message));
    } catch (error) {
      toast(error.message);
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
    if (selectedPicker) {
      if (assignedPicker && assignedPacker) {
        data = {
          sto: sto,
          picker: assignedPicker.name,
          pickerId: assignedPicker._id,
          packer: assignedPacker.name,
          packerId: assignedPacker._id,
          status: 'picker packer assigned'
        };
      }
      else if (assignedPicker) {
        data = {
          sto: sto,
          picker: assignedPicker.name,
          pickerId: assignedPicker._id,
          status: 'picker assigned'
        };
      } else if (assignedPacker) {
        data = {
          sto: sto,
          packer: assignedPacker.name,
          packerId: assignedPacker._id,
          status: 'picker packer assigned'
        };
      }
      else {
        toast('please select picker or picker')
        return;
      }
    }
    else {
      toast('select picker first')
      return;
    }

    console.log('task data', data);

    try {
      await fetch(API_URL + 'sto-tracking/update', {
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
            toast(data.message);
            setTimeout(() => {
              navigation.goBack();
            }, 1000);
          } else {
            toast(data.message);
          }
        })
        .catch(error => toast(error.message));
    } catch (error) {
      toast(error.message);
    }
  };

  return (
    <SafeAreaView className="flex-1 bg-white pt-8">
      <View className="flex-1 h-full px-4">
        <View className="screen-header flex-row items-center mb-4">
          <ButtonBack navigation={navigation} />
          <View className="flex-1 flex-row justify-center">
            <Text className="text-lg text-sh font-bold uppercase">sto:</Text>
            <Text className="text-lg text-sh">{' ' + sto}</Text>
          </View>
        </View>
        <View className="content flex-1 justify-between py-5">
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
    </SafeAreaView>
  );
};

export default PickerPackerTaskAssign;
