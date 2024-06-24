import { API_URL } from '@env';
import { useEffect, useState } from 'react';
import { Image, SafeAreaView, Text, TextInput, TouchableOpacity, View } from 'react-native';
import Toast from 'react-native-toast-message';
import CustomToast from '../../../../../components/CustomToast';
import { ButtonLg, ButtonLoading } from '../../../../../components/buttons';
import { ArrowLeftIcon, BoxIcon } from '../../../../../constant/icons';
import useAppContext from '../../../../../hooks/useAppContext';
import useBackHandler from '../../../../../hooks/useBackHandler';
import { getStorage } from '../../../../../hooks/useStorage';
import { updateArticleTracking } from '../processStoData';

const PickingStoArticle = ({ navigation, route }) => {
  const {
    sto, material, description, quantity, remainingQuantity, bins,
    receivingPlant, picker, pickerId, packer, packerId
  } = route.params;
  const [isButtonLoading, setIsButtonLoading] = useState(false);
  const [user, setUser] = useState({});
  const [token, setToken] = useState('');
  const [pickedQuantity, setPickedQuantity] = useState();
  const { StoInfo } = useAppContext();
  const { addToSTO } = StoInfo;
  // Custom hook to navigate screen
  useBackHandler('PickingSto', { sto, picker, pickerId, packer, packerId });

  console.log('params', route.params);

  useEffect(() => {
    const getAsyncStorage = async () => {
      await getStorage('token', setToken);
      await getStorage('user', setUser, 'object');
    }
    getAsyncStorage();
  }, []);

  const addToArticleTracking = async () => {
    let articleTrackingInfo = {
      sto,
      code: material,
      name: description,
      quantity: quantity,
      supplyingSite: user.site,
      receivingSite: receivingPlant,
      inboundPicker: picker,
      inboundPickerId: pickerId,
      inboundPacker: packer,
      inboundPackerId: packerId,
      inboundPickedQuantity: Number(pickedQuantity),
      inboundPickingStartingTime: new Date(),
      status: 'partially inbound picked'
    };

    const stoArticle = {
      sto,
      material,
      description,
      quantity,
      pickedQuantity: Number(pickedQuantity),
      supplyingSite: user.site,
      receivingSite: receivingPlant,
      picker,
      pickerId,
      packer,
      packerId,
    };

    try {
      setIsButtonLoading(true);
      await fetch(API_URL + 'api/article-tracking', {
        method: 'POST',
        headers: {
          authorization: token,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(articleTrackingInfo),
      })
        .then(response => response.json())
        .then(async result => {
          console.log('Article Tracking post response: ' + JSON.stringify(result));
          if (result.status) {
            const article = result.data;
            if (article.quantity === article.inboundPickedQuantity) {
              let updateObject = {
                sto: article.sto,
                code: article.code,
                pickingEndingTime: new Date(),
                status: 'inbound picked'
              };
              await updateArticleTracking(token, updateObject);
            }
            addToSTO(stoArticle);
            navigation.replace('PickingSto', { sto, picker, pickerId, packer, packerId });
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
  }

  const postPickedArticle = async () => {
    if (!pickedQuantity) {
      Toast.show({
        type: 'customError',
        text1: 'Enter a valid quantity',
      });
    } else if (pickedQuantity <= 0) {
      Toast.show({
        type: 'customError',
        text1: 'Quantity must be greater than zero',
      });
    } else if (pickedQuantity > bins.quantity || pickedQuantity > quantity) {
      Toast.show({
        type: 'customError',
        text1: 'quantity exceed',
      });
    } else {
      if (user.site) {
        await addToArticleTracking();
        setIsButtonLoading(false);
      }
    }
  };

  return (
    <SafeAreaView className="flex-1 bg-white pt-14">
      <View className="flex-1 px-4">
        <View className="screen-header flex-row items-start justify-between mb-4">
          <TouchableOpacity onPress={() => navigation.replace('PickingSto', { sto, picker, pickerId, packer, packerId })}>
            <Image source={ArrowLeftIcon} />
          </TouchableOpacity>
          <View className="text">
            <View className="flex-row justify-end">
              <Text className="text-base text-sh font-medium capitalize">
                picking article
              </Text>
              <Text className="text-base text-sh font-bold capitalize">
                {' ' + material}
              </Text>
            </View>
            <Text className="text-sm text-sh text-right font-medium capitalize my-1">
              {description}
            </Text>
            <Text className="text-sm text-sh text-right font-medium">
              {bins.bin}{' --> '}{bins.quantity}
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
              <Text className="text-black font-bold">{remainingQuantity}</Text>
            </View>
          </View>
          <View className="input-box mt-6">
            <TextInput
              className="bg-[#F5F6FA] border border-t-0 border-black/25 h-[50px] text-[#5D80C5] rounded-2xl mb-3 px-4"
              placeholder="Type Picked Quantity"
              placeholderTextColor="#5D80C5"
              selectionColor="#5D80C5"
              keyboardType="numeric"
              // autoFocus={true}
              // value={pickedQuantity.toString()}
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
    </SafeAreaView >
  );
};

export default PickingStoArticle;
