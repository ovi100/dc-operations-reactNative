import React from 'react';

import {SafeAreaView, StatusBar, Text, View} from 'react-native';

const App = () => {
  return (
    <SafeAreaView className="p-5">
      <StatusBar barStyle="light-content" />
      <View className="mt-5">
        <Text className="text-lg text-gray-400 text-center font-bold">
          Hello React native
        </Text>
      </View>
    </SafeAreaView>
  );
};

export default App;
