import React from 'react';
import { Text, TouchableHighlight, View } from 'react-native';

const FalseHeader = () => {

  return (
    <View className="screen-header absolute -top-10">
      <TouchableHighlight onPress={() => null}>
        <Text className="text-xs text-black text-center font-semibold capitalize">
          false header
        </Text>
      </TouchableHighlight>
    </View>
  )
}

export default FalseHeader;