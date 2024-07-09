import LottieView from 'lottie-react-native';
import React from 'react';
import { View } from 'react-native';
import lottieScan from '../../assets/lottie/hour-glass.json';

const OurGlass = ({ width, height }) => {
  return (
    <View className="w-full">
      <LottieView
        source={lottieScan}
        className={`${width} ${height} mx-auto`}
        autoPlay
        loop
      />
    </View>
  );
};

export default OurGlass;
