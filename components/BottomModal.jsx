import React, { useState } from 'react';
import { View, Text, StyleSheet, Modal, TouchableOpacity, PanResponder, Animated } from 'react-native';

const BottomModal = ({ isVisible, onClose, height, children }) => {
  const [dragY] = useState(new Animated.Value(0));

  const panResponder = PanResponder.create({
    onMoveShouldSetPanResponder: () => true,
    onPanResponderMove: Animated.event([null, { dy: dragY }], { useNativeDriver: false }),
    onPanResponderRelease: (_, gestureState) => {
      if (gestureState.dy > 50) {
        // Close the modal if dragged down by a certain threshold
        onClose();
      } else {
        // Spring back to original position
        Animated.spring(dragY, {
          toValue: 0,
          useNativeDriver: false,
        }).start();
      }
    },
  });

  return (
    <Modal
      visible={isVisible}
      transparent
      animationType="slide"
      onRequestClose={() => onClose()}
    >
      <View style={styles.modalContainer}>
        <Animated.View
          {...panResponder.panHandlers}
          style={[styles.modalContent, { transform: [{ translateY: dragY }], height: height }]}
        >
          <View style={styles.draggableBar} />
          <View className="modal-content p-5">
            {children}
          </View>
        </Animated.View>
      </View>
    </Modal>
  );
};

const styles = StyleSheet.create({
  modalContainer: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'flex-end',
  },
  modalContent: {
    backgroundColor: 'white',
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
  },
  draggableBar: {
    width: 40,
    height: 4,
    backgroundColor: '#ccc',
    alignSelf: 'center',
    marginVertical: 10,
    borderRadius: 2,
  },
  content: {
    padding: 20,
  },
});

export default BottomModal;
