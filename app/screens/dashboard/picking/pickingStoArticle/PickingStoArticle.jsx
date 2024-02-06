import {useState} from 'react';
import {Image, SafeAreaView, Text, TextInput, View} from 'react-native';
import {ButtonBack, ButtonLg} from '../../../../../components/buttons';
import {BoxIcon} from '../../../../../constant/icons';

const PickingStoArticle = ({navigation, route}) => {
  const {id, name, quantity} = route.params;
  const [newQuantity, setNewQuantity] = useState(quantity);

  const updateQuantity = () => {
    if (newQuantity > quantity) {
      alert('Quantity exceed');
    } else {
      alert(`Quantity ${newQuantity}`);
    }
  };

  console.log(route.params);

  return (
    <SafeAreaView className="flex-1 bg-white pt-14">
      <View className="flex-1 px-4">
        <View className="screen-header flex-row items-start justify-between mb-4">
          <ButtonBack navigation={navigation} />
          <View className="text">
            <View className="flex-row justify-end">
              <Text className="text-base text-sh font-medium capitalize">
                picking article
              </Text>
              <Text className="text-base text-sh font-bold capitalize">
                {' ' + id}
              </Text>
            </View>
            <Text className="text-sm text-sh text-right font-medium capitalize">
              {name}
            </Text>
          </View>
        </View>

        {/* Quantity Box */}
        <View className="quantity-box bg-[#FEFBFB] border border-[#F2EFEF] p-5">
          <View className="box-header flex-row items-center justify-between">
            <View className="text">
              <Text className="text-base text-[#2E2C3B] font-medium capitalize">
                ordered quantity
              </Text>
            </View>
            <View className="quantity flex-row items-center gap-3">
              <Image source={BoxIcon} />
              <Text className="text-black font-bold">{quantity}</Text>
            </View>
          </View>
          <View className="input-box mt-6">
            <TextInput
              className="bg-[#F5F6FA] border border-t-0 border-black/25 h-[50px] text-[#5D80C5] rounded-2xl mb-3 px-4"
              placeholder="Type Picked Quantity"
              placeholderTextColor="#5D80C5"
              selectionColor="#5D80C5"
              keyboardType="numeric"
              value={newQuantity.toString()}
              onChangeText={value => {
                setNewQuantity(value);
              }}
            />
          </View>
        </View>

        <View className="button mt-3">
          <ButtonLg title="Mark as Received" onPress={() => updateQuantity()} />
        </View>
      </View>
    </SafeAreaView>
  );
};

export default PickingStoArticle;
