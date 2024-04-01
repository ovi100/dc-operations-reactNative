import CheckBox from '@react-native-community/checkbox';
import { useIsFocused } from '@react-navigation/native';
import React, { useEffect, useState } from 'react';
import {
  FlatList,
  Keyboard,
  Text,
  TextInput,
  TouchableOpacity,
  View
} from 'react-native';
import BottomSheet from '../../../../components/BottomSheet';
import { ButtonLg, ButtonLoading } from '../../../../components/buttons';

const ChooseOutlet = ({ navigation }) => {
  const isFocused = useIsFocused();
  const [isButtonLoading, setIsButtonLoading] = useState(false);
  const [selectedList, setSelectedList] = useState('');
  const [search, setSearch] = useState('');
  const [isModalVisible, setIsModalVisible] = useState(false);

  const outlets = [
    {
      code: 'D014',
      name: 'Nrayangonj',
      district: 'Dhaka',
      selected: false,
    },
    {
      code: 'C001',
      name: 'Cumilla',
      district: 'Chittagong',
      selected: false,
    },
  ];

  const toggleModal = () => {
    setIsModalVisible(!isModalVisible);
  };

  useEffect(() => {
    // toggleModal();
    setSelectedList([]);
    setSearch('');
  }, [isFocused]);


  const renderItem = ({ item, index }) => (
    <TouchableOpacity
      className="flex-row items-center border border-tb rounded-lg mt-2.5 p-4"
      onPress={() => handelCheckbox(item)} key={index}>
      <View className="flex-1 flex-row items-center">
        <CheckBox
          tintColors={item.selected ? '#56D342' : '#ffffff'}
          value={item.selected}
          onValueChange={() => handelCheckbox(item)}
        />
        <Text className="text-black" numberOfLines={1}>
          {item.code}
        </Text>
      </View>
      <Text className="flex-1 text-black text-center" numberOfLines={1}>
        {item.name}
      </Text>
      <Text className="flex-1 text-black text-center" numberOfLines={1}>
        {item.district}
      </Text>
    </TouchableOpacity>
  );

  const handelCheckbox = outlet => {
    let selectedOutlets = outlets.map(item =>
      outlet.code === item.code ? { ...item, selected: !item.selected } : item,
    );
    let selectedOutletCode = selectedOutlets.filter(item => item.selected).map(item => item.code).join(',');
    setSelectedList(selectedOutletCode);
    setOutlets(selectedOutlets);
    setSearch('');
    Keyboard.dismiss();
  };

  const uncheckAll = () => {
    const checkAllData = outlets.map(item => {
      return { ...item, selected: false };
    });
    setOutlets(checkAllData);
    setSelectedList([]);
    Keyboard.dismiss();
  };

  const getDeliveryNote = () => {
    setIsButtonLoading(true);
    navigation.navigate('DeliveryPlan', selectedList);
    uncheckAll();
    setSearch('');
    setIsButtonLoading(false);
  };

  if (search) {
    outlets = outlets.filter(outlet =>
      outlet.code.toLowerCase().includes(search.trim().toLowerCase())
    );
  }

  return (
    <>
      {/* <View className="flex-1 flex-row items-center justify-center">
        <Button title='open modal' onPress={() => toggleModal()} />
      </View>
      <BottomModal isVisible={isModalVisible} onClose={toggleModal} height={500}>
        <Text className="text-black text-center text-lg font-semibold">Modal Content</Text>
        <TouchableOpacity onPress={toggleModal}>
          <Text className="text-gray-300 text-right font-semibold">Close</Text>
        </TouchableOpacity>
      </BottomModal> */}
      <BottomSheet>
        <Text className="text-lg text-sh text-center font-semibold capitalize mb-3">
          choose outlet
        </Text>

        <View className="search flex-row">
          <View className="input-box relative flex-1">
            <TextInput
              className="bg-[#F5F6FA] h-[50px] text-black rounded-lg px-4"
              placeholder="Search by outlets code"
              inputMode='text'
              placeholderTextColor="#CBC9D9"
              selectionColor="#CBC9D9"
              onChangeText={value => setSearch(value)}
              value={search}
            />
          </View>
        </View>
        <View className='outlet-list h-[60%]'>
          <FlatList
            data={outlets}
            renderItem={renderItem}
            keyExtractor={item => item.code}
          />
        </View>
        {selectedList.length > 0 && (
          <View className="button w-1/3 mx-auto">
            {isButtonLoading ? <ButtonLoading styles='bg-theme rounded-md p-5' /> :
              <ButtonLg
                title="Confirm"
                onPress={() => getDeliveryNote()}
              />
            }
          </View>
        )}
      </BottomSheet>
    </>
  );
};

export default ChooseOutlet;
