import React from 'react';
import { Button, SafeAreaView, StatusBar, Text, View } from 'react-native';
import SunmiPrinter from '../utils/sunmi/printer';

const App = () => {
  const {printerText, lineWrap} = SunmiPrinter;
  const printReceipt = () => {
    printerText('print receipt');
    lineWrap(5);
  };
  return (
    <SafeAreaView className="p-5">
      <StatusBar barStyle="light-content" />
      <View className="h-full items-center justify-center">
        <Text className="text-lg text-gray-400 text-center font-bold capitalize mb-5">
          sunmi printer demo
        </Text>
        <Button title="Print Now" onPress={printReceipt} />
      </View>
    </SafeAreaView>
  );
};

export default App;
