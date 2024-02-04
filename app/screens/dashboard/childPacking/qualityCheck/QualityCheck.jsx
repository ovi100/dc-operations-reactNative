import {useState} from 'react';
import {
  ActivityIndicator,
  Image,
  SafeAreaView,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';
import {launchCamera} from 'react-native-image-picker';
import {ButtonBack, ButtonLg} from '../../../../../components/buttons';
import {CloseIcon, ImageIcon} from '../../../../../constant/icons';

const QualityCheck = ({navigation}) => {
  const [image, setImage] = useState(null);
  const [isLoading, setIsLoading] = useState(false);

  const pickImage = async () => {
    const options = {
      mediaType: 'photo',
    };
    try {
      setIsLoading(true);
      const options = {
        mediaType: 'photo',
      };

      await launchCamera(options, response => {
        if (response.didCancel) {
          console.log('User cancelled image picker');
        } else if (response.error) {
          console.log('ImagePicker Error: ', response.error);
        } else {
          // You can use response.uri to get the selected image URI
          const selectedImageUri = response.uri;
          console.log('Selected Image URI: ', selectedImageUri);

          // Handle the selected image URI as needed in your application
        }
      });
      setIsLoading(false);
    } catch (error) {
      console.error(error);
    }
    console.log(image, isLoading);
  };

  const removeImage = () => {
    setImage(null);
  };

  return (
    <SafeAreaView className="flex-1 bg-white pt-8">
      <View className="flex-1 h-full px-4">
        <View className="screen-header flex-row items-center mb-4">
          <ButtonBack navigation={navigation} />
          <Text className="flex-1 text-lg text-sh text-center font-semibold capitalize">
            quantity check
          </Text>
        </View>
        <View className="content flex-1 justify-between py-5">
          <View className="image-upload">
            {isLoading && (
              <View className="image-picker h-60 items-center justify-center border border-dashed border-theme">
                <ActivityIndicator size="large" color="#3758FA" />
              </View>
            )}
            {image === null && !isLoading && (
              <View className="image-picker h-60 items-center justify-center border border-dashed border-theme">
                <TouchableOpacity className="" onPress={pickImage}>
                  <Image className="mx-auto mb-2" source={ImageIcon} />
                  <Text className="text-theme text-base text-center">
                    Click here to upload image
                  </Text>
                </TouchableOpacity>
              </View>
            )}
            {image && (
              <View className="image-preview relative h-60">
                <TouchableOpacity
                  className="absolute top-0 right-0 z-10"
                  onPress={() => removeImage()}>
                  <Image className="w-10 h-10" source={CloseIcon} />
                </TouchableOpacity>
                <Image className="w-full h-60" source={{uri: image}} />
              </View>
            )}
          </View>
          <View className="button mt-3">
            <ButtonLg
              title="Submit"
              onPress={() => alert('submit button clicked')}
            />
          </View>
        </View>
      </View>
    </SafeAreaView>
  );
};

export default QualityCheck;
