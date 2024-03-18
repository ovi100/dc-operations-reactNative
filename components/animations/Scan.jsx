import LottieView from 'lottie-react-native';
import React from 'react';
import { View } from 'react-native';
import lottieScan from '../../assets/lottie/scan.json';

const Scan = () => {
  return (
    <View className="w-full">
      <LottieView
        source={lottieScan}
        className="w-56 h-56 mx-auto"
        autoPlay
        loop
      />
    </View>
  );
};

export default Scan;
