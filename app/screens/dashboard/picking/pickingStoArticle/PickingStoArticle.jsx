import { useEffect, useState } from 'react';
import { Image, SafeAreaView, Text, TextInput, View } from 'react-native';
import Toast from 'react-native-toast-message';
import CustomToast from '../../../../../components/CustomToast';
import { ButtonBack, ButtonLg, ButtonLoading } from '../../../../../components/buttons';
import { BoxIcon } from '../../../../../constant/icons';
import useStoTracking from '../../../../../hooks/useStoTracking';
import { getStorage, setStorage } from '../../../../../hooks/useStorage';

const PickingStoArticle = ({ navigation, route }) => {
  const { sto, material, description, quantity, picker, pickerId, packer, packerId } = route.params;
  const [isButtonLoading, setIsButtonLoading] = useState(false);
  const [isFirstStoItem, setIsFirstStoItem] = useState(null);
  const [pickedSKU, setPickedSKU] = useState(0);
  const [token, setToken] = useState('');
  const [pickedQuantity, setPickedQuantity] = useState(quantity);
  const { addToSTO, countSKU } = useStoTracking();
  const API_URL = 'https://shwapnooperation.onrender.com/api/';

  useEffect(() => {
    setStorage(`isFirst${sto}Item`, String(isFirstStoItem));
    const getAsyncStorage = async () => {
      await getStorage('token', setToken);
    }
    getAsyncStorage();
  }, []);

  const getStoTracking = async () => {
    try {
      await fetch(API_URL + `sto-tracking?filterBy=sto&value=${sto}`, {
        method: 'GET',
        headers: {
          authorization: token,
          'Content-Type': 'application/json',
        },
      })
        .then(response => response.json())
        .then(data => {
          if (data.status) {
            if (data.items[0].sku === data.items[0].pickedSku || data.items[0].pickedSku >= 1) {
              setIsFirstStoItem(false);
            } else {
              setIsFirstStoItem(true);
            }
            setPickedSKU(prev => prev + Number(data.items[0].pickedSku));
          } else {
            setIsFirstStoItem(true);
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

  useEffect(() => {
    getStoTracking();
  }, []);

  const stoSkuCount = countSKU.find(item => item.sto === sto);
  console.log('STO Sku Count', stoSkuCount)

  const postStoTracking = async () => {
    const article = {
      sto,
      material,
      description,
      quantity,
      picker,
      pickerId,
      packer,
      packerId,
    };
    let stoTrackingInfo = {
      sto,
      picker,
      pickerId,
      packer,
      packerId,
      pickedSku: pickedSKU,
      pickingStartingTime: new Date(),
    };
    if (isFirstStoItem) {
      stoTrackingInfo.status = 'inbound picking';
    }

    try {
      await fetch(API_URL + 'sto-tracking/update', {
        method: 'PATCH',
        headers: {
          authorization: token,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(stoTrackingInfo),
      })
        .then(response => response.json())
        .then(data => {
          if (data.status) {
            Toast.show({
              type: 'customSuccess',
              text1: data.message,
            });
            addToSTO(article);
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

  const addToArticleTracking = async () => {
    let articleTrackingInfo = {
      sto,
      code: material,
      quantity: quantity,
      name: description,
      inboundPicker: picker,
      inboundPickerId: pickerId,
      inboundPacker: packer,
      inboundPackerId: packerId,
      inboundPickedQuantity: pickedQuantity,
      inboundPickingStartingTime: new Date(),
      inboundPickingEndingTime: new Date(),
      status: quantity === Number(pickedQuantity) ? 'inbound picked' : 'partially inbound picked'
    };

    try {
      await fetch(API_URL + 'article-tracking', {
        method: 'POST',
        headers: {
          authorization: token,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(articleTrackingInfo),
      })
        .then(response => response.json())
        .then(result => {
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
      setIsButtonLoading(true);
      await postStoTracking();
      await addToArticleTracking();
      setIsButtonLoading(false);
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
