import { useEffect, useRef } from 'react';
import { Animated, Text, View } from 'react-native';

const palette = {
  success: {
    bg: 'rgba(16, 185, 129, 0.95)',
    border: 'rgba(5, 150, 105, 1)',
    text: '#ffffff',
  },
  error: {
    bg: 'rgba(239, 68, 68, 0.95)',
    border: 'rgba(185, 28, 28, 1)',
    text: '#ffffff',
  },
  info: {
    bg: 'rgba(37, 99, 235, 0.95)',
    border: 'rgba(29, 78, 216, 1)',
    text: '#ffffff',
  },
};

export default function TopToast({ toast, onHide, duration = 2800 }) {
  const opacity = useRef(new Animated.Value(0)).current;
  const translateY = useRef(new Animated.Value(-30)).current;
  const timeoutRef = useRef(null);

  useEffect(() => {
    if (!toast?.visible) {
      return undefined;
    }

    if (timeoutRef.current) {
      clearTimeout(timeoutRef.current);
    }

    opacity.setValue(0);
    translateY.setValue(-30);

    Animated.parallel([
      Animated.timing(opacity, { toValue: 1, duration: 220, useNativeDriver: true }),
      Animated.timing(translateY, { toValue: 0, duration: 260, useNativeDriver: true }),
    ]).start();

    timeoutRef.current = setTimeout(() => {
      Animated.parallel([
        Animated.timing(opacity, { toValue: 0, duration: 180, useNativeDriver: true }),
        Animated.timing(translateY, { toValue: -22, duration: 180, useNativeDriver: true }),
      ]).start(() => {
        onHide?.();
      });
    }, duration);

    return () => {
      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current);
      }
    };
  }, [duration, onHide, opacity, toast?.id, toast?.visible, translateY]);

  if (!toast?.visible) {
    return null;
  }

  const colors = palette[toast.type] || palette.info;

  return (
    <View pointerEvents="none" style={{ position: 'absolute', top: 12, left: 12, right: 12, zIndex: 9999 }}>
      <Animated.View
        style={{
          opacity,
          transform: [{ translateY }],
          backgroundColor: colors.bg,
          borderColor: colors.border,
          borderWidth: 1,
          borderRadius: 14,
          paddingHorizontal: 14,
          paddingVertical: 11,
        }}
      >
        <Text style={{ color: colors.text, fontWeight: '800', textAlign: 'center' }}>{toast.text}</Text>
      </Animated.View>
    </View>
  );
}
