import { useCallback, useEffect, useMemo, useState } from 'react';
import { ActivityIndicator, Alert, RefreshControl, SafeAreaView, ScrollView, StyleSheet, Text, TouchableOpacity, View, useWindowDimensions } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useI18n } from '../i18n/I18nContext';
import { useAppTheme } from '../theme/ThemeContext';
import { createScaler } from '../utils/responsive';
import { fetchAdminRequests, updateAdminRequestStatus } from '../services/api';

const TYPE_FILTERS = ['all', 'ambulance', 'doctor-home'];
const STATUS_ACTIONS = ['pending', 'in-progress', 'completed', 'rejected'];

export default function AdminRequestsScreen({ onBack, onNavigate, preferences, onUpdatePreferences }) {
  const { width } = useWindowDimensions();
  const styles = useMemo(() => createStyles(width), [width]);
  const { t, language } = useI18n();
  const { colors } = useAppTheme();
  const arRegular = language === 'ar' ? { fontFamily: 'Cairo_400Regular' } : null;
  const arBold = language === 'ar' ? { fontFamily: 'Cairo_700Bold' } : null;

  const token = preferences?.admin?.token || '';
  const [typeFilter, setTypeFilter] = useState('all');
  const [requests, setRequests] = useState([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [updatingId, setUpdatingId] = useState('');

  const load = useCallback(async (isRefresh = false) => {
    if (!token) {
      setLoading(false);
      return;
    }
    if (isRefresh) setRefreshing(true);
    else setLoading(true);

    try {
      const response = await fetchAdminRequests({
        token,
        type: typeFilter === 'all' ? undefined : typeFilter,
      });
      setRequests(response.data?.requests || []);
    } catch (error) {
      const apiMessage = error?.response?.data?.error;
      Alert.alert(t('common.error'), apiMessage || t('admin.loadFailed'));
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, [token, typeFilter, t]);

  useEffect(() => {
    load();
  }, [load]);

  useEffect(() => {
    if (!token) return undefined;
    const timer = setInterval(() => {
      load(true);
    }, 8000);
    return () => clearInterval(timer);
  }, [token, load]);

  const onChangeStatus = async (id, status) => {
    if (!token) return;
    setUpdatingId(id);
    try {
      await updateAdminRequestStatus({ token, id, status });
      setRequests((prev) => prev.map((item) => (item.id === id ? { ...item, status } : item)));
    } catch (error) {
      const apiMessage = error?.response?.data?.error;
      Alert.alert(t('common.error'), apiMessage || t('admin.updateFailed'));
    } finally {
      setUpdatingId('');
    }
  };

  const logout = async () => {
    if (onUpdatePreferences) {
      await onUpdatePreferences({ admin: null });
    }
    onNavigate('admin-login');
  };

  if (!token) {
    return (
      <SafeAreaView style={[styles.screen, { backgroundColor: colors.background }]}>
        <View style={[styles.emptyWrap, { backgroundColor: colors.surface, borderColor: colors.border }]}>
          <Text style={[styles.emptyTitle, arBold, { color: colors.textPrimary }]}>{t('admin.notConnected')}</Text>
          <TouchableOpacity style={[styles.primaryBtn, { backgroundColor: colors.primary }]} onPress={() => onNavigate('admin-login')}>
            <Text style={[styles.primaryBtnText, arBold]}>{t('admin.loginButton')}</Text>
          </TouchableOpacity>
          <TouchableOpacity style={[styles.secondaryBtn, { borderColor: colors.border }]} onPress={onBack}>
            <Text style={[styles.secondaryBtnText, arRegular, { color: colors.textSecondary }]}>{t('common.back')}</Text>
          </TouchableOpacity>
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={[styles.screen, { backgroundColor: colors.background }]}>
      <View style={[styles.headerCard, { backgroundColor: colors.surface, borderColor: colors.border }]}>
        <View style={styles.topBar}>
          <TouchableOpacity style={[styles.iconBtn, { backgroundColor: colors.surfaceAlt, borderColor: colors.border }]} onPress={onBack}>
            <Ionicons name="chevron-back" size={20} color={colors.textPrimary} />
          </TouchableOpacity>
          <View style={styles.topTitleWrap}>
            <Text style={[styles.topTitle, arBold, { color: colors.textPrimary }]}>{t('admin.requestsTitle')}</Text>
          </View>
          <TouchableOpacity style={[styles.iconBtn, { backgroundColor: colors.surfaceAlt, borderColor: colors.border }]} onPress={logout}>
            <Ionicons name="log-out-outline" size={20} color={colors.textPrimary} />
          </TouchableOpacity>
        </View>
      </View>

      <View style={styles.filtersWrap}>
        {TYPE_FILTERS.map((item) => {
          const active = typeFilter === item;
          const label =
            item === 'all' ? t('admin.filterAll') : item === 'ambulance' ? t('admin.filterAmbulance') : t('admin.filterDoctor');
          return (
            <TouchableOpacity
              key={item}
              style={[styles.filterBtn, { borderColor: colors.border, backgroundColor: colors.surfaceAlt }, active && [styles.filterBtnActive, { borderColor: colors.primary }]]}
              onPress={() => setTypeFilter(item)}
            >
              <Text style={[styles.filterText, arRegular, active && { color: colors.primary }]}>{label}</Text>
            </TouchableOpacity>
          );
        })}
      </View>

      <ScrollView
        contentContainerStyle={styles.content}
        refreshControl={<RefreshControl refreshing={refreshing} onRefresh={() => load(true)} />}
        showsVerticalScrollIndicator={false}
      >
        {loading ? (
          <View style={styles.loaderWrap}>
            <ActivityIndicator size="large" color={colors.primary} />
          </View>
        ) : requests.length === 0 ? (
          <View style={[styles.emptyWrap, { backgroundColor: colors.surface, borderColor: colors.border }]}>
            <Text style={[styles.emptyTitle, arBold, { color: colors.textPrimary }]}>{t('admin.noRequests')}</Text>
          </View>
        ) : (
          requests.map((item) => (
            <View key={item.id} style={[styles.card, { backgroundColor: colors.surface, borderColor: colors.border }]}>
              <View style={styles.cardTop}>
                <Text style={[styles.cardTitle, arBold, { color: colors.textPrimary }]}>{item.type === 'ambulance' ? t('admin.filterAmbulance') : t('admin.filterDoctor')}</Text>
                <Text style={[styles.statusPill, { backgroundColor: colors.surfaceAlt, color: colors.textPrimary }]}>{t(`admin.status_${item.status || 'pending'}`)}</Text>
              </View>
              <Text style={[styles.cardLine, arRegular, { color: colors.textSecondary }]}>{item.name || '-'}</Text>
              <Text style={[styles.cardLine, arRegular, { color: colors.textSecondary }]}>{item.phone || '-'}</Text>
              {item.fromLocation || item.toLocation ? (
                <Text style={[styles.cardLine, arRegular, { color: colors.textSecondary }]}>
                  {`${t('admin.fromLabel')}: ${item.fromLocation || '-'}  |  ${t('admin.toLabel')}: ${item.toLocation || '-'} (${item.transferMode || 'same_city'})`}
                </Text>
              ) : null}
              <Text style={[styles.cardLine, arRegular, { color: colors.textSecondary }]}>{item.address || '-'}</Text>
              <Text style={[styles.cardLine, arRegular, { color: colors.textSecondary }]}>{item.notes || '-'}</Text>

              <View style={styles.actionsRow}>
                {STATUS_ACTIONS.map((status) => (
                  <TouchableOpacity
                    key={status}
                    style={[styles.actionBtn, { borderColor: colors.border, backgroundColor: colors.surfaceAlt }, item.status === status && [styles.actionBtnActive, { borderColor: colors.primary }]]}
                    onPress={() => onChangeStatus(item.id, status)}
                    disabled={updatingId === item.id}
                  >
                    <Text style={[styles.actionText, item.status === status && { color: colors.primary }]}>{t(`admin.status_${status}`)}</Text>
                  </TouchableOpacity>
                ))}
              </View>
            </View>
          ))
        )}
      </ScrollView>
    </SafeAreaView>
  );
}

const createStyles = (width) => {
  const s = createScaler(width);
  return StyleSheet.create({
    screen: { flex: 1 },
    headerCard: {
      backgroundColor: '#ffffff',
      borderRadius: s(24, 20, 28),
      borderWidth: 1,
      borderColor: '#e2e8f0',
      paddingHorizontal: s(16, 14, 20),
      paddingVertical: s(14, 12, 18),
      marginHorizontal: s(16, 14, 20),
      marginTop: s(12, 10, 16),
      marginBottom: s(6, 4, 8),
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
    iconBtn: {
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
    filtersWrap: {
      flexDirection: 'row',
      flexWrap: 'wrap',
      gap: s(8, 6, 10),
      paddingHorizontal: s(16, 12, 22),
      paddingTop: s(10, 8, 14),
    },
    filterBtn: {
      minHeight: s(38, 34, 44),
      borderWidth: 1,
      borderRadius: s(12, 10, 16),
      paddingHorizontal: s(12, 10, 14),
      alignItems: 'center',
      justifyContent: 'center',
    },
    filterBtnActive: {
      borderWidth: 2,
      backgroundColor: '#eaf2ff',
    },
    filterText: { color: '#2f4f79', fontWeight: '700', fontSize: s(12, 10, 14) },
    content: {
      paddingHorizontal: s(16, 12, 22),
      paddingVertical: s(12, 10, 16),
      gap: s(10, 8, 12),
      paddingBottom: s(28, 20, 32),
    },
    loaderWrap: { minHeight: 220, alignItems: 'center', justifyContent: 'center' },
    emptyWrap: {
      margin: s(16, 12, 22),
      borderWidth: 1,
      borderRadius: s(18, 14, 22),
      padding: s(16, 12, 20),
      alignItems: 'center',
      gap: s(10, 8, 12),
    },
    emptyTitle: { fontSize: s(18, 16, 22), fontWeight: '800' },
    card: {
      borderWidth: 1,
      borderRadius: s(18, 14, 22),
      padding: s(12, 10, 16),
    },
    cardTop: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: s(6, 5, 8) },
    cardTitle: { fontSize: s(16, 14, 20), fontWeight: '800' },
    statusPill: {
      paddingHorizontal: s(10, 8, 12),
      paddingVertical: s(4, 4, 6),
      borderRadius: 999,
      fontWeight: '700',
      fontSize: s(11, 10, 13),
      overflow: 'hidden',
    },
    cardLine: { fontSize: s(12, 10, 15), marginBottom: s(2, 2, 4) },
    actionsRow: { flexDirection: 'row', flexWrap: 'wrap', gap: s(6, 5, 8), marginTop: s(10, 8, 12) },
    actionBtn: {
      minHeight: s(34, 30, 40),
      borderWidth: 1,
      borderRadius: s(10, 8, 12),
      paddingHorizontal: s(10, 8, 12),
      alignItems: 'center',
      justifyContent: 'center',
    },
    actionBtnActive: {
      borderWidth: 2,
      backgroundColor: '#eaf2ff',
    },
    actionText: { color: '#2f4f79', fontWeight: '700', fontSize: s(11, 10, 13) },
    primaryBtn: {
      minHeight: s(46, 40, 54),
      borderRadius: s(12, 10, 16),
      alignItems: 'center',
      justifyContent: 'center',
      paddingHorizontal: s(18, 14, 24),
      width: '100%',
    },
    primaryBtnText: { color: '#fff', fontSize: s(14, 12, 17), fontWeight: '800' },
    secondaryBtn: {
      minHeight: s(44, 38, 50),
      borderRadius: s(12, 10, 16),
      borderWidth: 1,
      alignItems: 'center',
      justifyContent: 'center',
      paddingHorizontal: s(18, 14, 24),
      width: '100%',
    },
    secondaryBtnText: { fontSize: s(13, 11, 16), fontWeight: '700' },
  });
};
