import { Picker } from '@react-native-picker/picker';
import { useState } from 'react';
import { Alert, SafeAreaView, Text, View } from 'react-native';
import { ButtonBack, ButtonLg } from '../../../../../components/buttons';

const PickerPackerTaskAssign = ({ navigation, route }) => {
  const { sto } = route.params;
  const pickers = [
    {
      id: 'pi1',
      name: 'picker 1',
    },
    {
      id: 'pi2',
      name: 'picker 2',
    },
    {
      id: 'pi3',
      name: 'picker 3',
    },
    {
      id: 'pi4',
      name: 'picker 4',
    },
    {
      id: 'pi5',
      name: 'picker 5',
    },
  ];
  const packers = [
    {
      id: 'pa1',
      name: 'packer 1',
    },
    {
      id: 'pa2',
      name: 'packer 2',
    },
    {
      id: 'pa3',
      name: 'packer 3',
    },
    {
      id: 'pa4',
      name: 'packer 4',
    },
    {
      id: 'pa5',
      name: 'packer 5',
    },
  ];
  const [selectedPicker, setSelectedPicker] = useState(pickers[0].name);
  const [selectedPacker, setSelectedPacker] = useState(packers[0].name);

  const updateTask = () => {
    Alert.alert(`picker-->${selectedPicker} and packer-->${selectedPacker}`);
    navigation.goBack();
  };

  console.log(selectedPicker);
  console.log(selectedPacker);

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
                  {pickers.map((picker, i) => (
                    <Picker.Item
                      label={picker.name}
                      value={picker.name}
                      key={i}
                      style={{ color: 'white' }}
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
                  {packers.map((packer, i) => (
                    <Picker.Item
                      label={packer.name}
                      value={packer.name}
                      key={i}
                      style={{ color: 'white' }}
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
