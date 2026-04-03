import { StyleSheet } from 'react-native';
import { createScaler } from '../utils/responsive';

export const createGalleryStyles = (width) => {
  const s = createScaler(width);
  const numColumns = width > 600 ? 3 : 2;
  const padding = s(16, 14, 20);
  const gap = s(10, 8, 12);
  const itemWidth = (width - padding * 2 - gap * (numColumns - 1)) / numColumns;

  return StyleSheet.create({
    screen: {
      flex: 1,
      backgroundColor: '#f8fafc',
    },
    content: {
      paddingHorizontal: padding,
      paddingTop: s(10, 8, 14),
      paddingBottom: s(28, 22, 36),
    },
    header: {
      backgroundColor: '#ffffff',
      borderBottomWidth: 1,
      borderBottomColor: '#f3f4f6',
      paddingHorizontal: s(16, 14, 20),
      paddingVertical: s(12, 10, 16),
      flexDirection: 'row',
      alignItems: 'center',
    },
    backBtn: {
      width: s(40, 36, 44),
      height: s(40, 36, 44),
      borderRadius: 10,
      alignItems: 'center',
      justifyContent: 'center',
      backgroundColor: '#f3f4f6',
    },
    titleWrap: {
      flex: 1,
      alignItems: 'center',
      paddingHorizontal: s(8, 6, 12),
    },
    title: {
      color: '#111827',
      fontSize: s(17, 15, 20),
      fontWeight: '700',
      textAlign: 'center',
    },
    subtitle: {
      marginTop: 2,
      color: '#6b7280',
      fontSize: s(12, 11, 13),
      fontWeight: '400',
      textAlign: 'center',
    },
    placeholder: {
      width: s(40, 36, 44),
    },
    grid: {
      flexDirection: 'row',
      flexWrap: 'wrap',
      gap: gap,
    },
    imageItem: {
      width: itemWidth,
      height: itemWidth * 1.15,
      borderRadius: 12,
      backgroundColor: '#ffffff',
      overflow: 'hidden',
      borderWidth: 1,
      borderColor: '#e5e7eb',
    },
    image: {
      width: '100%',
      height: '100%',
    },
    modalContainer: {
      flex: 1,
      backgroundColor: 'rgba(0, 0, 0, 0.92)',
      justifyContent: 'center',
      alignItems: 'center',
    },
    fullImage: {
      width: '100%',
      height: '80%',
    },
    closeButton: {
      position: 'absolute',
      top: s(50, 40, 60),
      right: s(20, 15, 25),
      zIndex: 10,
      width: 40,
      height: 40,
      borderRadius: 20,
      backgroundColor: 'rgba(255,255,255,0.15)',
      alignItems: 'center',
      justifyContent: 'center',
    },
  });
};
