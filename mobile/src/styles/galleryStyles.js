import { StyleSheet } from 'react-native';
import { createScaler } from '../utils/responsive';

export const createGalleryStyles = (width) => {
  const s = createScaler(width);
  const numColumns = width > 600 ? 3 : 2;
  const padding = s(14, 12, 18);
  const gap = s(12, 10, 14);
  const itemWidth = (width - padding * 2 - gap * (numColumns - 1)) / numColumns;

  return StyleSheet.create({
    screen: {
      flex: 1,
      backgroundColor: '#f6f8fc',
    },
    content: {
      paddingHorizontal: padding,
      paddingTop: s(10, 8, 14),
      paddingBottom: s(28, 22, 36),
    },
    headerCard: {
      backgroundColor: '#ffffff',
      borderRadius: s(24, 20, 28),
      borderWidth: 1,
      borderColor: '#e2e8f0',
      paddingHorizontal: s(16, 14, 20),
      paddingVertical: s(14, 12, 18),
      marginBottom: s(12, 10, 16),
      shadowColor: '#0f172a',
      shadowOpacity: 0.06,
      shadowRadius: 16,
      shadowOffset: { width: 0, height: 6 },
      elevation: 4,
    },
    topBar: {
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'space-between',
      gap: s(12, 10, 16),
    },
    backBtn: {
      width: s(44, 38, 48),
      height: s(44, 38, 48),
      borderRadius: 999,
      alignItems: 'center',
      justifyContent: 'center',
      backgroundColor: '#f1f5f9',
      borderWidth: 1,
      borderColor: '#e2e8f0',
      shadowColor: '#0f172a',
      shadowOpacity: 0.05,
      shadowRadius: 8,
      shadowOffset: { width: 0, height: 2 },
      elevation: 2,
    },
    topTitleWrap: {
      flex: 1,
      alignItems: 'center',
      justifyContent: 'center',
      paddingHorizontal: s(8, 6, 12),
    },
    topTitle: {
      color: '#0a2540',
      fontSize: s(17, 15, 20),
      fontWeight: '900',
      textAlign: 'center',
      letterSpacing: -0.3,
    },
    topSub: {
      marginTop: s(2, 1, 4),
      color: '#64748b',
      fontSize: s(12, 11, 14),
      fontWeight: '500',
      textAlign: 'center',
    },
    grid: {
      flexDirection: 'row',
      flexWrap: 'wrap',
      gap: gap,
    },
    imageItem: {
      width: itemWidth,
      height: itemWidth * 1.2,
      borderRadius: s(16, 14, 20),
      backgroundColor: '#ffffff',
      overflow: 'hidden',
      borderWidth: 1,
      borderColor: '#f0f4f8',
      elevation: 2,
      shadowColor: '#000',
      shadowOffset: { width: 0, height: 2 },
      shadowOpacity: 0.1,
      shadowRadius: 4,
    },
    image: {
      width: '100%',
      height: '100%',
    },
    modalContainer: {
      flex: 1,
      backgroundColor: 'rgba(0, 0, 0, 0.9)',
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
      padding: s(10),
    },
  });
};
