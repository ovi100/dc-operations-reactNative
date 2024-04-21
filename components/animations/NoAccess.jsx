import LottieView from 'lottie-react-native';
import React from 'react';
import { View } from 'react-native';
import lottieNoAccess from '../../assets/lottie/no-access.json';

const NoAccess = () => {
  return (
    <View className="w-full">
      <LottieView
        source={lottieNoAccess}
        className="w-64 h-64 mx-auto"
        autoPlay
        loop
      />
    </View>
  );
};

export default NoAccess;
