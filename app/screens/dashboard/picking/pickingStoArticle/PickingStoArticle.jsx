import { useEffect, useState } from 'react';
import { ActivityIndicator, Image, SafeAreaView, Text, TextInput, View } from 'react-native';
import Toast from 'react-native-toast-message';
import CustomToast from '../../../../../components/CustomToast';
import { ButtonBack, ButtonLg, ButtonLoading } from '../../../../../components/buttons';
import { BoxIcon } from '../../../../../constant/icons';
import useAppContext from '../../../../../hooks/useAppContext';
import { getStorage } from '../../../../../hooks/useStorage';
import { updateStoTracking, updateArticleTracking } from '../processStoData';

const PickingStoArticle = ({ navigation, route }) => {
  const {
    sto, material, description, quantity, bins,
    picker, pickerId, packer, packerId
  } = route.params;
  const [isLoading, setIsLoading] = useState(false);
  const [isButtonLoading, setIsButtonLoading] = useState(false);
  const [isFirstStoItem, setIsFirstStoItem] = useState(true);
  const [isLastStoItem, setIsLastStoItem] = useState(false);
  const [user, setUser] = useState({});
  const [pickedSku, setPickedSku] = useState(1);
  const [token, setToken] = useState('');
  const [pickedQuantity, setPickedQuantity] = useState(bins.quantity);
  // const [stoTrackingInfo, setStoTrackingInfo] = useState(null);
  const { STOInfo } = useAppContext();
  const { addToSTO, stoItems } = STOInfo;
  const API_URL = 'https://shwapnooperation.onrender.com/api/';

  useEffect(() => {
    const getAsyncStorage = async () => {
      await getStorage('token', setToken);
      await getStorage('user', setUser, 'object');
      // await getStorage('stoTrackingInfo', setStoTrackingInfo, 'object');
    }
    getAsyncStorage();
  }, []);

  const article = {
    sto,
    material,
    description,
    quantity,
    pickedQuantity: Number(pickedQuantity),
    picker,
    pickerId,
    packer,
    packerId,
  };

  console.log('sto tracking AS info', stoTrackingInfo);
  // const filteredSto = JSON.parse(stoTrackingInfo.stoItems).filter(
  //   item => item.sto === stoItem.sto);
  console.log('sto Items', stoItems);

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
            let sku = data.items[0].sku;
            let picSku = data.items[0].pickedSku ? data.items[0].pickedSku : 0;
            if (sku === picSku || picSku >= 1) {
              setIsFirstStoItem(false);
            } else {
              setIsFirstStoItem(true);
            }

            if (sku - picSku === 1) {
              setIsLastStoItem(true);
            } else {
              setIsLastStoItem(false);
            }
            setPickedSku(prev => prev + picSku);
          } else {
            setIsFirstStoItem(true);
            setIsLastStoItem(false);
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
    if (token && route.params) {
      getStoTracking();
    }
  }, [token, route.params]);

  // const addToOnHold = async () => {
  //   let holdObject = {
  //     material,
  //     onHold: Number(pickedQuantity),
  //     bin: bins.bin,
  //     gondola: bins.gondola,
  //     site: user.site,
  //   };

  //   try {
  //     await fetch(API_URL + 'inventory/hold', {
  //       method: 'POST',
  //       headers: {
  //         authorization: token,
  //         'Content-Type': 'application/json',
  //       },
  //       body: JSON.stringify(holdObject),
  //     })
  //       .then(response => response.json())
  //       .then(result => {
  //         console.log('on hold response', result);
  //         Toast.show({
  //           type: 'customInfo',
  //           text1: result.message,
  //         });
  //       })
  //       .catch(error => {
  //         Toast.show({
  //           type: 'customError',
  //           text1: error.message,
  //         });
  //       });
  //   } catch (error) {
  //     Toast.show({
  //       type: 'customError',
  //       text1: error.message,
  //     });
  //   }
  // };

  const postStoTracking = async () => {
    let postStoData = {
      sto,
      pickedSku,
    };
    let stoTrackingInfo = {};
    if (isFirstStoItem) {
      stoTrackingInfo = {
        ...postStoData,
        picker,
        pickerId,
        packer,
        packerId,
        pickingStartingTime: new Date(),
        status: 'inbound picking'
      };
    } else if (isLastStoItem) {
      stoTrackingInfo = {
        ...postStoData,
        pickingEndingTime: new Date(),
        status: 'inbound picked'
      };
    } else {
      stoTrackingInfo = {
        ...postStoData
      };
    }

    console.log('sto tracking post data', stoTrackingInfo);
    await updateStoTracking(token, stoTrackingInfo);

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
      inboundPickedQuantity: Number(pickedQuantity),
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
        .then(async result => {
          if (result.status) {
            const article = result.data;
            if (!quantity === Number(pickedQuantity) && article.quantity === article.inboundPickedQuantity) {
              let updateObject = {
                sto: article.sto,
                code: article.code,
                status: "inbound picked"
              };
              await updateArticleTracking(token, updateObject);
            }
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
    } else if (pickedQuantity > bins.quantity) {
      Toast.show({
        type: 'customError',
        text1: 'Bin quantity exceed',
      });
    } else {
      if (user.site) {
        setIsButtonLoading(true);
        await postStoTracking();
        await addToArticleTracking();
        // await addToOnHold();
        addToSTO(article);
        setIsButtonLoading(false);
        navigation.goBack();
      }
    }
  };

  if (isLoading) {
    return (
      <View className="w-full h-screen justify-center px-3">
        <ActivityIndicator size="large" color="#EB4B50" />
        <Text className="mt-4 text-gray-400 text-base text-center">
          Loading bins data. Please wait.....
        </Text>
      </View>
    )
  }

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
    </SafeAreaView>
  );
};

export default PickingStoArticle;
