import React from 'react'
import { ActivityIndicator, Text, View } from 'react-native';

const LoadingData = ({ text }) => {
  return (
    <View className="w-full h-screen justify-center px-3">
      <ActivityIndicator size="large" color="#EB4B50" />
      <Text className="mt-4 text-gray-400 text-base text-center">{text}</Text>
    </View>
  )
}

export default LoadingData;
