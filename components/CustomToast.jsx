import { Text, View } from "react-native";
import Toast from "react-native-toast-message";

const CustomToast = () => {
  const toastConfig = {
    customInfo: ({ text1 }) => (
      <View className="bg-[#3498db] w-[70%] rounded shadow-md mx-auto p-3 z-50">
        <Text className="text-white text-lg text-center">{text1}</Text>
      </View>
    ),
    customSuccess: ({ text1 }) => (
      <View className="bg-[#07bc0c] w-[70%] rounded shadow-md mx-auto p-3 z-50">
        <Text className="text-white text-lg text-center">{text1}</Text>
      </View>
    ),
    customWarn: ({ text1 }) => (
      <View className="bg-[#f1c40f] w-[70%] rounded shadow-md mx-auto p-3 z-50">
        <Text className="text-white text-lg text-center">{text1}</Text>
      </View>
    ),
    customError: ({ text1 }) => (
      <View className="bg-[#e74c3c] w-[70%] rounded shadow-md mx-auto p-3 z-50">
        <Text className="text-white text-lg text-center">{text1}</Text>
      </View>
    ),
  };
  return <Toast config={toastConfig} />;
};

export default CustomToast;
