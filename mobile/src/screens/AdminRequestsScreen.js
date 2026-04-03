import { useCallback, useEffect, useMemo, useState } from 'react';
import { ActivityIndicator, Alert, RefreshControl, SafeAreaView, ScrollView, StyleSheet, Text, TouchableOpacity, View, useWindowDimensions } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useI18n } from '../i18n/I18nContext';
import { useAppTheme } from '../theme/ThemeContext';
import { createScaler } from '../utils/responsive';
import { fetchAdminRequests, updateAdminRequestStatus } from '../services/api';

const TYPE_FILTERS = ['all', 'ambulance', 'doctor-home'];
const STATUS_ACTIONS = ['pending', 'in-progress', 'completed', 'rejected'];

const STATUS_COLORS = {
  pending: '#f59e0b',
  'in-progress': '#2563eb',
  completed: '#059669',
  rejected: '#dc2626',
};

export default function AdminRequestsScreen({ onBack, onNavigate, preferences, onUpdatePreferences }) {
  const { width } = useWindowDimensions();
  const styles = useMemo(() => createStyles(width), [width]);
  const { t, language } = useI18n();
  const { colors, mode } = useAppTheme();
  const isDark = mode === 'dark';
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
        <View style={styles.emptyCenter}>
          <Text style={[styles.emptyTitle, arBold, { color: colors.textPrimary }]}>{t('admin.notConnected')}</Text>
          <TouchableOpacity style={styles.primaryBtn} onPress={() => onNavigate('admin-login')}>
            <Text style={[styles.primaryBtnText, arBold]}>{t('admin.loginButton')}</Text>
          </TouchableOpacity>
          <TouchableOpacity style={[styles.outlineBtn, { borderColor: colors.border }]} onPress={onBack}>
            <Text style={[styles.outlineBtnText, arRegular, { color: colors.textSecondary }]}>{t('common.back')}</Text>
          </TouchableOpacity>
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={[styles.screen, { backgroundColor: colors.background }]}>
      <View style={[styles.header, isDark && { backgroundColor: colors.surface, borderBottomColor: colors.border }]}>
        <TouchableOpacity style={[styles.iconBtn, isDark && { backgroundColor: colors.surfaceAlt }]} onPress={onBack}>
          <Ionicons name="chevron-back" size={20} color={colors.textPrimary} />
        </TouchableOpacity>
        <Text style={[styles.headerTitle, arBold, { color: colors.textPrimary }]}>{t('admin.requestsTitle')}</Text>
        <TouchableOpacity style={[styles.iconBtn, isDark && { backgroundColor: colors.surfaceAlt }]} onPress={logout}>
          <Ionicons name="log-out-outline" size={20} color={colors.textPrimary} />
        </TouchableOpacity>
      </View>

      <View style={styles.filtersWrap}>
        {TYPE_FILTERS.map((item) => {
          const active = typeFilter === item;
          const label =
            item === 'all' ? t('admin.filterAll') : item === 'ambulance' ? t('admin.filterAmbulance') : t('admin.filterDoctor');
          return (
            <TouchableOpacity
              key={item}
              style={[styles.filterChip, { borderColor: colors.border, backgroundColor: isDark ? colors.surfaceAlt : '#f9fafb' }, active && { borderColor: '#2563eb', backgroundColor: isDark ? 'rgba(37,99,235,0.12)' : '#eff6ff' }]}
              onPress={() => setTypeFilter(item)}
            >
              <Text style={[styles.filterText, arRegular, { color: active ? '#2563eb' : colors.textSecondary }]}>{label}</Text>
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
            <ActivityIndicator size="large" color="#2563eb" />
          </View>
        ) : requests.length === 0 ? (
          <View style={styles.emptyCenter}>
            <Text style={[styles.emptyTitle, arBold, { color: colors.textPrimary }]}>{t('admin.noRequests')}</Text>
          </View>
        ) : (
          requests.map((item) => {
            const statusColor = STATUS_COLORS[item.status] || '#6b7280';
            return (
              <View key={item.id} style={[styles.card, { backgroundColor: colors.surface, borderColor: colors.border }]}>
                <View style={styles.cardTop}>
                  <Text style={[styles.cardType, arBold, { color: colors.textPrimary }]}>
                    {item.type === 'ambulance' ? t('admin.filterAmbulance') : t('admin.filterDoctor')}
                  </Text>
                  <View style={styles.statusRow}>
                    <View style={[styles.statusDot, { backgroundColor: statusColor }]} />
                    <Text style={[styles.statusText, arRegular, { color: statusColor }]}>{t(`admin.status_${item.status || 'pending'}`)}</Text>
                  </View>
                </View>
                <Text style={[styles.cardLine, arRegular, { color: colors.textSecondary }]}>{item.name || '-'}</Text>
                <Text style={[styles.cardLine, arRegular, { color: colors.textSecondary }]}>{item.phone || '-'}</Text>
                {item.fromLocation || item.toLocation ? (
                  <Text style={[styles.cardLine, arRegular, { color: colors.textSecondary }]}>
                    {`${t('admin.fromLabel')}: ${item.fromLocation || '-'}  |  ${t('admin.toLabel')}: ${item.toLocation || '-'} (${item.transferMode || 'same_city'})`}
                  </Text>
                ) : null}
                {item.address ? <Text style={[styles.cardLine, arRegular, { color: colors.textSecondary }]}>{item.address}</Text> : null}
                {item.notes ? <Text style={[styles.cardLine, arRegular, { color: colors.textSecondary }]}>{item.notes}</Text> : null}

                <View style={styles.actionsRow}>
                  {STATUS_ACTIONS.map((status) => {
                    const isActive = item.status === status;
                    return (
                      <TouchableOpacity
                        key={status}
                        style={[styles.actionChip, { borderColor: colors.border, backgroundColor: isDark ? colors.surfaceAlt : '#f9fafb' }, isActive && { borderColor: '#2563eb', backgroundColor: isDark ? 'rgba(37,99,235,0.12)' : '#eff6ff' }]}
                        onPress={() => onChangeStatus(item.id, status)}
                        disabled={updatingId === item.id}
                      >
                        <Text style={[styles.actionText, arRegular, { color: isActive ? '#2563eb' : colors.textSecondary }]}>{t(`admin.status_${status}`)}</Text>
                      </TouchableOpacity>
                    );
                  })}
                </View>
              </View>
            );
          })
        )}
      </ScrollView>
    </SafeAreaView>
  );
}

const createStyles = (width) => {
  const s = createScaler(width);
  return StyleSheet.create({
    screen: { flex: 1 },
    header: {
      backgroundColor: '#ffffff',
      borderBottomWidth: 1,
      borderBottomColor: '#f3f4f6',
      paddingHorizontal: s(16, 14, 20),
      paddingVertical: s(12, 10, 16),
      flexDirection: 'row',
      alignItems: 'center',
    },
    iconBtn: {
      width: s(40, 36, 44),
      height: s(40, 36, 44),
      borderRadius: 10,
      alignItems: 'center',
      justifyContent: 'center',
      backgroundColor: '#f3f4f6',
    },
    headerTitle: {
      flex: 1,
      textAlign: 'center',
      color: '#111827',
      fontSize: s(17, 15, 20),
      fontWeight: '700',
    },
    filtersWrap: {
      flexDirection: 'row',
      flexWrap: 'wrap',
      gap: s(8, 6, 10),
      paddingHorizontal: s(16, 14, 20),
      paddingVertical: s(10, 8, 14),
    },
    filterChip: {
      height: s(36, 32, 40),
      borderWidth: 1,
      borderRadius: 10,
      paddingHorizontal: s(14, 12, 18),
      alignItems: 'center',
      justifyContent: 'center',
    },
    filterText: { fontWeight: '600', fontSize: s(13, 11, 15) },
    content: {
      paddingHorizontal: s(16, 14, 20),
      paddingBottom: s(28, 20, 32),
      gap: s(10, 8, 12),
    },
    loaderWrap: { minHeight: 200, alignItems: 'center', justifyContent: 'center' },
    emptyCenter: {
      flex: 1,
      alignItems: 'center',
      justifyContent: 'center',
      paddingHorizontal: s(20, 16, 26),
      paddingVertical: s(40, 32, 50),
      gap: s(12, 10, 14),
    },
    emptyTitle: { fontSize: s(17, 15, 20), fontWeight: '700', textAlign: 'center' },
    card: {
      borderWidth: 1,
      borderRadius: 16,
      padding: s(14, 12, 18),
    },
    cardTop: {
      flexDirection: 'row',
      justifyContent: 'space-between',
      alignItems: 'center',
      marginBottom: s(8, 6, 10),
    },
    cardType: { fontSize: s(15, 13, 18), fontWeight: '700' },
    statusRow: {
      flexDirection: 'row',
      alignItems: 'center',
      gap: 6,
    },
    statusDot: {
      width: 8,
      height: 8,
      borderRadius: 4,
    },
    statusText: {
      fontSize: s(12, 11, 14),
      fontWeight: '600',
    },
    cardLine: { fontSize: s(13, 11, 15), marginBottom: s(2, 2, 4), lineHeight: s(18, 16, 22) },
    actionsRow: {
      flexDirection: 'row',
      flexWrap: 'wrap',
      gap: s(6, 5, 8),
      marginTop: s(10, 8, 12),
    },
    actionChip: {
      height: s(32, 28, 36),
      borderWidth: 1,
      borderRadius: 8,
      paddingHorizontal: s(10, 8, 14),
      alignItems: 'center',
      justifyContent: 'center',
    },
    actionText: { fontWeight: '600', fontSize: s(12, 10, 14) },
    primaryBtn: {
      height: 48,
      borderRadius: 12,
      alignItems: 'center',
      justifyContent: 'center',
      paddingHorizontal: s(24, 20, 30),
      width: '100%',
      backgroundColor: '#2563eb',
    },
    primaryBtnText: { color: '#fff', fontSize: s(15, 13, 17), fontWeight: '700' },
    outlineBtn: {
      height: 48,
      borderRadius: 12,
      borderWidth: 1,
      alignItems: 'center',
      justifyContent: 'center',
      paddingHorizontal: s(24, 20, 30),
      width: '100%',
    },
    outlineBtnText: { fontSize: s(14, 12, 16), fontWeight: '600' },
  });
};
