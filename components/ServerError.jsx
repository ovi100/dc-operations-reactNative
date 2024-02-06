import LottieView from 'lottie-react-native';
import React from 'react';
import { Text, View } from 'react-native';
import lottieServer from '../assets/lottie/server.json';

const ServerError = () => {
  return (
    <View
      className="w-full h-64 bg-white rounded-bl-lg rounded-br-lg justify-center border-t-[6px] border-blue-500 pb-5"
      style={{
        elevation: 3,
        shadowColor: '#000',
      }}>
      <LottieView
        source={lottieServer}
        className="w-full h-full"
        autoPlay
        loop
      />
      <Text className="text-red-500 text-lg text-center font-semibold">Server Error!</Text>
    </View>
  );
};

export default ServerError;
