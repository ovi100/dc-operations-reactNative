import LottieView from 'lottie-react-native';
import React from 'react';
import { View } from 'react-native';
import lottieReady from '../../assets/lottie/ready.json';

const Ready = () => {
  return (
    <View className="w-full">
      <LottieView
        source={lottieReady}
        className="w-56 h-56 mx-auto"
        autoPlay
        loop
      />
    </View>
  );
};

export default Ready;
