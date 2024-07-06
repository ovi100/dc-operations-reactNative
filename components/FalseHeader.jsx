import React, { useEffect, useState } from 'react'
import { Text, TouchableHighlight, View } from 'react-native'
import { getStorage } from '../hooks/useStorage';

const FalseHeader = () => {
  const [pressMode, setPressMode] = useState(false);

  useEffect(() => {
    const getAsyncStorage = async () => {
      await getStorage('pressMode', setPressMode);
    }
    getAsyncStorage();
  }, []);

  return (
    <View className="screen-header absolute -top-10">
      {pressMode === 'true' ? (
        <TouchableHighlight onPress={() => null}>
          <Text className="text-xs text-black text-center font-semibold capitalize">
            false header
          </Text>
        </TouchableHighlight>
      ) : (
        <Text className="text-xs text-black text-center font-semibold capitalize">
          false header
        </Text>
      )}

    </View>
  )
}

export default FalseHeader;