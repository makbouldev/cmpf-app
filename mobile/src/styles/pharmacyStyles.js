import { StyleSheet } from 'react-native';
import { createScaler } from '../utils/responsive';

export const createPharmacyStyles = (width) => {
  const s = createScaler(width);
  const horizontal = s(16, 14, 20);

  return StyleSheet.create({
    screen: {
      flex: 1,
      backgroundColor: '#f8fafc',
    },
    content: {
      paddingBottom: s(32, 24, 40),
    },

    header: {
      backgroundColor: '#ffffff',
      paddingHorizontal: horizontal,
      paddingTop: s(12, 10, 16),
      paddingBottom: s(12, 10, 16),
      borderBottomWidth: 1,
      borderBottomColor: '#f3f4f6',
    },
    headerRow: {
      flexDirection: 'row',
      alignItems: 'center',
      gap: s(12, 10, 14),
    },
    backBtn: {
      width: s(40, 36, 44),
      height: s(40, 36, 44),
      borderRadius: 10,
      alignItems: 'center',
      justifyContent: 'center',
      backgroundColor: '#f9fafb',
    },
    headerTitle: {
      flex: 1,
      color: '#111827',
      fontSize: s(18, 16, 20),
      fontWeight: '700',
    },

    locationBar: {
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'space-between',
      paddingHorizontal: horizontal,
      paddingVertical: s(10, 8, 12),
      backgroundColor: '#ffffff',
      borderBottomWidth: 1,
      borderBottomColor: '#f3f4f6',
    },
    locationLeft: {
      flex: 1,
      flexDirection: 'row',
      alignItems: 'center',
      gap: s(8, 6, 10),
    },
    locationDot: {
      width: 8,
      height: 8,
      borderRadius: 4,
      backgroundColor: '#059669',
    },
    locationLabel: {
      color: '#6b7280',
      fontSize: s(12, 11, 13),
      fontWeight: '500',
    },
    locationCity: {
      color: '#111827',
      fontSize: s(14, 13, 16),
      fontWeight: '600',
    },
    refreshBtn: {
      height: s(34, 30, 38),
      borderRadius: 8,
      backgroundColor: '#f3f4f6',
      flexDirection: 'row',
      alignItems: 'center',
      paddingHorizontal: s(10, 8, 12),
      gap: s(4, 3, 6),
    },
    refreshBtnText: {
      color: '#374151',
      fontSize: s(12, 11, 13),
      fontWeight: '600',
    },

    searchWrap: {
      paddingHorizontal: horizontal,
      paddingVertical: s(12, 10, 14),
    },
    searchBar: {
      height: s(48, 44, 52),
      borderRadius: 10,
      backgroundColor: '#ffffff',
      borderWidth: 1,
      borderColor: '#d1d5db',
      flexDirection: 'row',
      alignItems: 'center',
      paddingHorizontal: s(14, 12, 16),
      gap: s(10, 8, 12),
    },
    searchInput: {
      flex: 1,
      color: '#111827',
      fontSize: s(14, 13, 16),
      paddingVertical: 0,
    },

    closestWrap: {
      paddingHorizontal: horizontal,
      marginBottom: s(8, 6, 10),
    },
    closestCard: {
      borderRadius: 16,
      backgroundColor: '#ffffff',
      borderWidth: 1,
      borderColor: '#e5e7eb',
      padding: s(16, 14, 18),
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'space-between',
      shadowColor: '#000000',
      shadowOpacity: 0.03,
      shadowRadius: 3,
      shadowOffset: { width: 0, height: 1 },
      elevation: 1,
    },
    closestInfo: {
      flex: 1,
      paddingRight: s(12, 8, 14),
    },
    closestLabel: {
      color: '#059669',
      fontSize: s(11, 10, 12),
      fontWeight: '600',
      textTransform: 'uppercase',
      letterSpacing: 0.3,
    },
    closestTitle: {
      marginTop: s(4, 3, 5),
      color: '#111827',
      fontSize: s(16, 14, 18),
      fontWeight: '700',
    },
    closestMeta: {
      marginTop: s(2, 2, 4),
      color: '#6b7280',
      fontSize: s(12, 11, 13),
      fontWeight: '500',
    },
    closestRouteBtn: {
      height: s(38, 34, 42),
      borderRadius: 10,
      backgroundColor: '#059669',
      alignItems: 'center',
      justifyContent: 'center',
      paddingHorizontal: s(16, 12, 20),
    },
    closestRouteText: {
      color: '#ffffff',
      fontSize: s(13, 12, 14),
      fontWeight: '700',
    },

    sectionHeader: {
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'space-between',
      paddingHorizontal: horizontal,
      paddingTop: s(14, 12, 16),
      paddingBottom: s(8, 6, 10),
    },
    sectionTitle: {
      color: '#111827',
      fontSize: s(16, 14, 18),
      fontWeight: '700',
    },
    sectionLink: {
      color: '#059669',
      fontSize: s(13, 12, 14),
      fontWeight: '600',
    },

    loadingState: {
      paddingTop: s(40, 32, 48),
      alignItems: 'center',
    },
    emptyCard: {
      marginHorizontal: horizontal,
      borderRadius: 16,
      backgroundColor: '#ffffff',
      padding: s(24, 20, 28),
      alignItems: 'center',
    },
    emptyTitle: {
      color: '#111827',
      fontSize: s(16, 14, 18),
      fontWeight: '700',
      textAlign: 'center',
    },
    emptySub: {
      marginTop: s(6, 4, 8),
      color: '#6b7280',
      fontSize: s(13, 12, 14),
      lineHeight: s(20, 18, 22),
      textAlign: 'center',
    },

    pharmacyCard: {
      marginHorizontal: horizontal,
      marginBottom: s(10, 8, 12),
      borderRadius: 16,
      backgroundColor: '#ffffff',
      borderWidth: 1,
      borderColor: '#e5e7eb',
      padding: s(16, 14, 18),
      shadowColor: '#000000',
      shadowOpacity: 0.03,
      shadowRadius: 3,
      shadowOffset: { width: 0, height: 1 },
      elevation: 1,
    },
    cardTopRow: {
      flexDirection: 'row',
      alignItems: 'flex-start',
    },
    iconWrap: {
      width: s(40, 36, 44),
      height: s(40, 36, 44),
      borderRadius: 10,
      backgroundColor: '#ecfdf5',
      alignItems: 'center',
      justifyContent: 'center',
      marginRight: s(12, 10, 14),
    },
    cardMainInfo: {
      flex: 1,
      paddingRight: s(8, 6, 10),
    },
    cardTitle: {
      color: '#111827',
      fontSize: s(15, 14, 17),
      fontWeight: '700',
    },
    cardAddress: {
      marginTop: s(2, 2, 3),
      color: '#6b7280',
      fontSize: s(12, 11, 13),
      fontWeight: '400',
    },
    ratingWrap: {
      alignItems: 'flex-end',
    },
    ratingRow: {
      flexDirection: 'row',
      alignItems: 'center',
      gap: 3,
    },
    ratingText: {
      color: '#111827',
      fontSize: s(13, 12, 14),
      fontWeight: '600',
    },
    distanceText: {
      marginTop: 2,
      color: '#9ca3af',
      fontSize: s(11, 10, 12),
      fontWeight: '500',
    },
    cardActions: {
      marginTop: s(12, 10, 14),
      flexDirection: 'row',
      gap: s(8, 6, 10),
    },
    directionsBtn: {
      flex: 1,
      height: s(40, 38, 44),
      borderRadius: 10,
      backgroundColor: '#059669',
      alignItems: 'center',
      justifyContent: 'center',
    },
    directionsBtnText: {
      color: '#ffffff',
      fontSize: s(13, 12, 14),
      fontWeight: '700',
    },
    callBtn: {
      flex: 1,
      height: s(40, 38, 44),
      borderRadius: 10,
      borderWidth: 1,
      borderColor: '#d1d5db',
      backgroundColor: '#ffffff',
      alignItems: 'center',
      justifyContent: 'center',
    },
    callBtnText: {
      color: '#374151',
      fontSize: s(13, 12, 14),
      fontWeight: '600',
    },
  });
};
