import React, { useEffect, useRef, useState } from 'react';
import {
  Animated,
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Dimensions,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';

const { width } = Dimensions.get('window');

const Notifikasi = ({ message, visible, onClose, type = 'success' }) => {
  const slideAnim = useRef(new Animated.Value(-100)).current;
  const [isVisible, setIsVisible] = useState(visible);

  const backgroundColor = type === 'success' ? '#28a745' : '#dc3545';

  useEffect(() => {
    let timer;

    if (visible) {
      setIsVisible(true);
      Animated.timing(slideAnim, {
        toValue: 0,
        duration: 300,
        useNativeDriver: true,
      }).start();

      // Auto close after 1.5 seconds
      timer = setTimeout(() => {
        Animated.timing(slideAnim, {
          toValue: -100,
          duration: 300,
          useNativeDriver: true,
        }).start(() => {
          setIsVisible(false);
          if (onClose) onClose();
        });
      }, 1500);
    }

    return () => clearTimeout(timer);
  }, [visible]);

  if (!isVisible) return null;

  return (
    <Animated.View
      style={[
        styles.container,
        {
          transform: [{ translateY: slideAnim }],
          backgroundColor,
        },
      ]}
    >
      <Text style={styles.text} numberOfLines={2}>
        {message}
      </Text>
      {/* <TouchableOpacity onPress={onClose} style={styles.close}>
        <Ionicons name="close" size={20} color="white" />
      </TouchableOpacity> */}
    </Animated.View>
  );
};

export default Notifikasi;

const styles = StyleSheet.create({
  container: {
    position: 'absolute',
    top: 2,
    left: 20,
    right: 20,
    borderRadius: 12,
    paddingVertical: 12,
    paddingHorizontal: 16,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    elevation: 5,
    zIndex: 999,
  },
  text: {
    color: 'white',
    fontWeight: 'bold',
    flex: 1,
  },
  close: {
    marginLeft: 12,
  },
});
