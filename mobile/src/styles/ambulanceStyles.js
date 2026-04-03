import { StyleSheet } from 'react-native';
import { createScaler } from '../utils/responsive';

export const createAmbulanceStyles = (width) => {
  const s = createScaler(width);
  const pad = s(16, 14, 20);

  return StyleSheet.create({
    screen: {
      flex: 1,
      backgroundColor: '#f8fafc',
    },

    header: {
      flexDirection: 'row',
      alignItems: 'center',
      paddingHorizontal: pad,
      paddingVertical: s(12, 10, 14),
      backgroundColor: '#ffffff',
      borderBottomWidth: 1,
      borderBottomColor: '#f3f4f6',
    },
    headerBackBtn: {
      width: s(36, 32, 40),
      height: s(36, 32, 40),
      alignItems: 'center',
      justifyContent: 'center',
    },
    headerTitle: {
      flex: 1,
      textAlign: 'center',
      fontSize: s(17, 15, 19),
      fontWeight: '700',
      color: '#111827',
    },
    headerRight: {
      width: s(36, 32, 40),
    },

    searchWrap: {
      paddingHorizontal: pad,
      paddingTop: s(12, 10, 14),
      paddingBottom: s(4, 2, 6),
      backgroundColor: '#ffffff',
    },
    searchBar: {
      flexDirection: 'row',
      alignItems: 'center',
      height: s(44, 40, 48),
      backgroundColor: '#f3f4f6',
      borderRadius: s(10, 8, 12),
      paddingHorizontal: s(12, 10, 14),
      gap: s(8, 6, 10),
    },
    searchInput: {
      flex: 1,
      fontSize: s(15, 13, 17),
      paddingVertical: 0,
      color: '#111827',
    },

    quickRow: {
      flexDirection: 'row',
      gap: s(10, 8, 12),
      marginTop: s(12, 10, 14),
      marginBottom: s(8, 6, 10),
    },
    quickCallBtn: {
      flex: 1,
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'center',
      height: s(44, 40, 48),
      backgroundColor: '#dc2626',
      borderRadius: s(10, 8, 12),
      gap: s(6, 5, 8),
    },
    quickWhatsappBtn: {
      flex: 1,
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'center',
      height: s(44, 40, 48),
      backgroundColor: '#16a34a',
      borderRadius: s(10, 8, 12),
      gap: s(6, 5, 8),
    },
    quickBtnText: {
      color: '#ffffff',
      fontSize: s(13, 11, 15),
      fontWeight: '700',
    },

    listContent: {
      paddingBottom: s(24, 20, 28),
    },
    regionHeader: {
      paddingHorizontal: pad,
      paddingTop: s(16, 14, 18),
      paddingBottom: s(6, 5, 8),
      backgroundColor: '#f8fafc',
    },
    regionTitle: {
      fontSize: s(12, 11, 13),
      fontWeight: '700',
      color: '#6b7280',
      textTransform: 'uppercase',
      letterSpacing: 0.3,
    },
    cityRow: {
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'space-between',
      minHeight: s(48, 44, 52),
      paddingHorizontal: pad,
      backgroundColor: '#ffffff',
      borderBottomWidth: 1,
      borderBottomColor: '#f3f4f6',
    },
    cityText: {
      fontSize: s(15, 13, 17),
      fontWeight: '500',
      color: '#111827',
    },

    step2Content: {
      padding: pad,
      paddingBottom: s(40, 32, 48),
    },

    heroCard: {
      backgroundColor: '#dc2626',
      borderRadius: s(16, 14, 18),
      paddingVertical: s(28, 24, 34),
      paddingHorizontal: s(20, 16, 24),
      alignItems: 'center',
    },
    heroIconWrap: {
      width: s(60, 52, 68),
      height: s(60, 52, 68),
      borderRadius: s(16, 14, 18),
      backgroundColor: 'rgba(255,255,255,0.15)',
      alignItems: 'center',
      justifyContent: 'center',
      marginBottom: s(14, 12, 16),
    },
    heroTitle: {
      color: 'rgba(255,255,255,0.8)',
      fontSize: s(14, 12, 16),
      fontWeight: '600',
      textTransform: 'uppercase',
      letterSpacing: 1,
    },
    heroCityName: {
      color: '#ffffff',
      fontSize: s(24, 20, 28),
      fontWeight: '800',
      marginTop: s(4, 3, 6),
    },
    heroBadge: {
      flexDirection: 'row',
      alignItems: 'center',
      gap: s(4, 3, 6),
      marginTop: s(10, 8, 12),
      backgroundColor: 'rgba(255,255,255,0.15)',
      paddingHorizontal: s(10, 8, 12),
      paddingVertical: s(4, 3, 6),
      borderRadius: 999,
    },
    heroBadgeText: {
      color: 'rgba(255,255,255,0.9)',
      fontSize: s(12, 11, 13),
      fontWeight: '600',
    },

    actionsGroup: {
      marginTop: s(16, 14, 18),
      gap: s(10, 8, 12),
    },
    callBtn: {
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'center',
      height: s(52, 48, 58),
      backgroundColor: '#dc2626',
      borderRadius: s(12, 10, 14),
      gap: s(8, 6, 10),
    },
    whatsappBtn: {
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'center',
      height: s(52, 48, 58),
      backgroundColor: '#16a34a',
      borderRadius: s(12, 10, 14),
      gap: s(8, 6, 10),
    },
    webBtn: {
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'center',
      height: s(52, 48, 58),
      backgroundColor: '#2563eb',
      borderRadius: s(12, 10, 14),
      gap: s(8, 6, 10),
    },
    actionBtnText: {
      color: '#ffffff',
      fontSize: s(15, 13, 17),
      fontWeight: '700',
    },

    infoCard: {
      marginTop: s(16, 14, 18),
      backgroundColor: '#ffffff',
      borderRadius: s(14, 12, 16),
      borderWidth: 1,
      borderColor: '#e5e7eb',
      padding: s(16, 14, 18),
    },
    infoRow: {
      flexDirection: 'row',
      alignItems: 'center',
      gap: s(12, 10, 14),
      marginBottom: s(12, 10, 14),
    },
    infoIconWrap: {
      width: s(40, 36, 44),
      height: s(40, 36, 44),
      borderRadius: s(10, 8, 12),
      backgroundColor: '#fef2f2',
      alignItems: 'center',
      justifyContent: 'center',
    },
    infoLabel: {
      fontSize: s(12, 11, 13),
      fontWeight: '500',
      color: '#6b7280',
    },
    infoValue: {
      fontSize: s(16, 14, 18),
      fontWeight: '700',
      color: '#111827',
      marginTop: 1,
    },
    infoDesc: {
      fontSize: s(14, 12, 16),
      fontWeight: '400',
      lineHeight: s(22, 19, 25),
      color: '#6b7280',
    },

    backButton: {
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'center',
      height: s(48, 44, 52),
      backgroundColor: '#ffffff',
      borderRadius: s(12, 10, 14),
      borderWidth: 1,
      borderColor: '#e5e7eb',
      marginTop: s(16, 14, 18),
      gap: s(6, 5, 8),
    },
    backButtonText: {
      fontSize: s(15, 13, 17),
      fontWeight: '600',
      color: '#111827',
    },
  });
};
