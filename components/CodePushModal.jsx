import React from 'react';
import { Modal, Text, View } from 'react-native';

const CodePushModal = ({ visible, header, subHeader, progress, message }) => {
  const percent = (
    (Number(progress?.receivedBytes) / Number(progress?.totalBytes)) *
    100
  ).toFixed(0);

  return (
    <Modal animationType="fade" transparent visible={visible}>
      <View className="bg-zinc-900/40 flex-1 items-center justify-center p-3">
        <View className="modal relative w-full bg-white items-center rounded-lg p-5">
          <View className="modal-header mb-5">
            <Text className="text-xl text-black text-center font-bold">
              {header}
            </Text>
            <Text className="text-base text-black text-center font-semibold mt-3">
              {subHeader}
            </Text>
          </View>
          <View className="modal-content px-5">
            <Text className="text-base text-black text-center font-semibold mb-3">
              {message}
            </Text>
            <View className="relative flex-row items-center gap-3">
              <View className="progress relative bg-gray-300 w-full h-1.5 rounded-full mt-4">
                <View
                  className="absolute top-0 bg-blue-600 h-1.5 rounded-full"
                  style={{ width: `${percent}%` }}
                />
              </View>
            </View>
          </View>
        </View>
      </View>
    </Modal>
  );
};

export default CodePushModal;