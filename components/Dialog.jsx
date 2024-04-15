import { Modal, Text, TouchableOpacity, View } from 'react-native';

const Dialog = ({ isOpen, modalHeader, modalSubHeader, onClose, onSubmit, leftButtonText, rightButtonText }) => {

  return (
    <Modal
      visible={isOpen}
      animationType='fade'
      statusBarTranslucent
      transparent
    >
      <View className="bg-zinc-900/40 flex-1 items-center justify-center px-3">
        <View className="bg-white w-full rounded-md">
          <View className="dialog-header p-5">
            <Text className="text-xl text-black text-center font-semibold">
              {modalHeader}
            </Text>
            <Text className="text-lg text-black text-center mt-3">
              {modalSubHeader}
            </Text>
          </View>
          <View className="dialog-footer border-t border-gray-300 mt-2">
            <View className="action-button flex-row items-center justify-around">
              <View className="button py-3">
                <TouchableOpacity onPress={onClose}>
                  <Text className="bg-rose-600 text-white text-base font-bold rounded px-3 py-2 capitalize">
                    {leftButtonText}
                  </Text>
                </TouchableOpacity>
              </View>
              <View className="separator w-[1px] h-full bg-gray-300"></View>
              <View className="button py-3">
                <TouchableOpacity onPress={onSubmit}>
                  <Text className="bg-green-600 text-white text-base font-bold rounded px-3 py-2 capitalize">
                    {rightButtonText}
                  </Text>
                </TouchableOpacity>
              </View>
            </View>
          </View>
        </View>
      </View>
    </Modal>
  )
}

export default Dialog;
