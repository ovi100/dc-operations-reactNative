import LottieView from 'lottie-react-native';
import React from 'react';
import { View } from 'react-native';
import lottieLoading from '../../assets/lottie/loading.json';

const Loading = () => {
  return (
    <View className="w-full">
      <LottieView
        source={lottieLoading}
        className="w-64 h-64 mx-auto"
        autoPlay
        loop
      />
    </View>
  );
};

export default Loading;
