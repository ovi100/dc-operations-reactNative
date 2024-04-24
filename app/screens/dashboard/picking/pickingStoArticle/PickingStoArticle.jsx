import { useEffect, useState } from 'react';
import { Image, SafeAreaView, Text, TextInput, View } from 'react-native';
import Toast from 'react-native-toast-message';
import CustomToast from '../../../../../components/CustomToast';
import { ButtonBack, ButtonLg, ButtonLoading } from '../../../../../components/buttons';
import { BoxIcon } from '../../../../../constant/icons';
import { getStorage } from '../../../../../hooks/useStorage';

const PickingStoArticle = ({ navigation, route }) => {
  const [isButtonLoading, setIsButtonLoading] = useState(false);
  const [token, setToken] = useState('');
  const { sto, material, description, quantity, picker, pickerId, packer, packerId } = route.params;
  const [pickedQuantity, setPickedQuantity] = useState(quantity);
  const API_URL = 'https://shwapnooperation.onrender.com/api/article-tracking/update';

  useEffect(() => {
    const getAsyncStorage = async () => {
      await getStorage('token', setToken);
      // await getStorage('user', setUser, 'object');
    }
    getAsyncStorage();
  }, []);

  const addToArticleTracking = async () => {
    let articleTrackingInfo = {
      sto,
      code: article.material,
      quantity: article.quantity,
      name: article.description,
      inboundPicker: picker,
      inboundPickerId: pickerId,
      inboundPacker: packer,
      inboundPackerId: packerId,
      inboundPickedQuantity: pickedQuantity,
      inboundPickingStartingTime: new Date(),
      inboundPickingEndingTime: new Date(),
      status: quantity === Number(pickedQuantity) ? 'inbound picked' : 'partially inbound picked'
    };

    console.log('article tracking post data', articleTrackingInfo);

    try {
      await fetch(API_URL + 'api/article-tracking', {
        method: 'POST',
        headers: {
          authorization: token,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(postData),
      })
        .then(response => response.json())
        .then(result => {
          console.log('article post tracking response', result)
          Toast.show({
            type: 'customInfo',
            text1: result.message,
          });
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
  }

  const postPickedArticle = async () => {
    if (pickedQuantity > quantity) {
      Toast.show({
        type: 'customWarn',
        text1: 'Quantity exceed',
      });
    } else {
      await addToArticleTracking();
    }
  };

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
                {' ' + material}
              </Text>
            </View>
            <Text className="text-sm text-sh text-right font-medium capitalize">
              {description}
            </Text>
          </View>
        </View>

        {/* Quantity Box */}
        <View className="quantity-box bg-[#FEFBFB] border border-[#F2EFEF] p-5">
          <View className="box-header flex-row items-center justify-between">
            <View className="text">
              <Text className="text-base text-[#2E2C3B] font-medium capitalize">
                picked quantity
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
              autoFocus={true}
              value={pickedQuantity.toString()}
              onChangeText={value => {
                setPickedQuantity(value);
              }}
            />
          </View>
        </View>

        <View className="button mt-3">
          {isButtonLoading ? <ButtonLoading styles='bg-theme rounded-md p-5' /> :
            <ButtonLg title="Mark as Picked" onPress={() => postPickedArticle()} />
          }

        </View>
      </View>
      <CustomToast />
    </SafeAreaView>
  );
};

export default PickingStoArticle;
