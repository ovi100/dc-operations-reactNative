import LottieView from 'lottie-react-native';
import React from 'react';
import lottieEmptyBox from '../../assets/lottie/empty-box.json';

const EmptyBox = () => {
  return (
    <LottieView source={lottieEmptyBox} className="w-full h-full" autoPlay loop />
  );
};

export default EmptyBox;
