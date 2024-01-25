import React from 'react';

import { SafeAreaView, StatusBar, Text, View } from 'react-native';

const App = () => {
  return (
    <SafeAreaView className="p-5">
      <StatusBar barStyle="light-content" />
      <View className="h-full items-center justify-center mt-5">
        <Text className="text-lg text-gray-400 text-center font-bold">
          React native 0.73.2
        </Text>
        <Text className="text-sm text-center font-bold my-5">with</Text>
        <Text className="text-lg text-gray-400 text-center font-bold">
          Tailwind CSS 3.3.2
        </Text>
      </View>
    </SafeAreaView>
  );
};

export default App;
