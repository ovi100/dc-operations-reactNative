import { useEffect, useState } from 'react';
import { Image, Keyboard, KeyboardAvoidingView, Platform, Modal as RNModal, Text, TouchableWithoutFeedback, View } from 'react-native';
import { CloseIcon } from '../constant/icons';

const Modal = ({ isOpen, withInput = false, withCloseButton = true, children, modalHeader, onPress }) => {
  const [keyboardStatus, setKeyboardStatus] = useState(false);

  useEffect(() => {
    const showSubscription = Keyboard.addListener('keyboardDidShow', () => {
      setKeyboardStatus(true);
    });
    const hideSubscription = Keyboard.addListener('keyboardDidHide', () => {
      setKeyboardStatus(false);
    });

    return () => {
      showSubscription.remove();
      hideSubscription.remove();
    };
  }, []);

  const content = withInput ? (
    <KeyboardAvoidingView
      className="bg-zinc-900/40 flex-1 items-center justify-center px-3"
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
    >
      <View className={`bg-white w-full relative ${keyboardStatus ? '-top-14' : ''} rounded-md p-5`}>
        <View className="modal-header flex-row items-center">
          <Text className="flex-1 text-lg text-center font-semibold">
            {modalHeader}
          </Text>
          {withCloseButton && (
            <TouchableWithoutFeedback
              onPress={onPress}>
              <Image className="w-6 h-6" source={CloseIcon} />
            </TouchableWithoutFeedback>
          )}
        </View>
        <View className="modal-content">
          {children}
        </View>
      </View>
    </KeyboardAvoidingView>
  ) : (
    <View className="bg-zinc-900/40 flex-1 items-center justify-center px-3">
      <View className={`bg-white w-full relative ${keyboardStatus ? '-top-14' : ''} rounded-md p-5`}>
        <View className="modal-header flex-row items-center">
          <Text className="flex-1 text-lg text-black text-center font-semibold">
            {modalHeader}
          </Text>
          {withCloseButton && (
            <TouchableWithoutFeedback
              onPress={onPress}>
              <Image className="w-6 h-6" source={CloseIcon} />
            </TouchableWithoutFeedback>
          )}
        </View>
        <View className="modal-content mt-3">
          {children}
        </View>
      </View>
    </View>
  )
  return (
    <RNModal
      visible={isOpen}
      animationType='fade'
      statusBarTranslucent
      transparent
    >
      {content}
    </RNModal>
  )
}

export default Modal;
