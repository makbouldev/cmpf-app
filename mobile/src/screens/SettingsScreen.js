import { useEffect, useMemo, useRef, useState } from 'react';
import { Ionicons } from '@expo/vector-icons';
import AsyncStorage from '@react-native-async-storage/async-storage';
import * as Notifications from 'expo-notifications';
import {
  Alert,
  AppState,
  Linking,
  Platform,
  SafeAreaView,
  ScrollView,
  StyleSheet,
  Switch,
  Text,
  TouchableOpacity,
  View,
  useWindowDimensions,
} from 'react-native';
import { useI18n } from '../i18n/I18nContext';
import { useAppTheme } from '../theme/ThemeContext';
import { createScaler } from '../utils/responsive';

const LANG_OPTIONS = ['fr', 'en', 'ar'];
const THEME_OPTIONS = ['light', 'dark'];

export default function SettingsScreen({ onBack, onUpdatePreferences }) {
  const { width } = useWindowDimensions();
  const styles = useMemo(() => createStyles(width), [width]);
  const { t, language, setLanguage } = useI18n();
  const { colors, mode, setMode } = useAppTheme();
  const isDark = mode === 'dark';
  const isArabic = language === 'ar';
  const arRegular = isArabic ? { fontFamily: 'Cairo_400Regular' } : null;
  const arBold = isArabic ? { fontFamily: 'Cairo_700Bold' } : null;

  // Real permission states - start as false (unconfigured / green)
  const [overlayEnabled, setOverlayEnabled] = useState(false);
  const [batteryEnabled, setBatteryEnabled] = useState(false);
  const [notifEnabled, setNotifEnabled] = useState(false);
  const pendingPermRef = useRef(null);

  // Check real notifications permission from OS
  const checkRealNotificationPermission = async () => {
    if (Platform.OS === 'web') {
      if (typeof window !== 'undefined' && 'Notification' in window) {
        return window.Notification.permission === 'granted';
      }
      const val = await AsyncStorage.getItem('@cmpf_perm_notif');
      return val === 'true';
    }
    try {
      const status = await Notifications.getPermissionsAsync();
      return Boolean(status.granted || status.status === 'granted');
    } catch (_e) {
      return false;
    }
  };

  // Verify all permissions status
  const verifyAllPermissions = async () => {
    try {
      const realNotif = await checkRealNotificationPermission();
      setNotifEnabled(realNotif);

      const overlayVal = await AsyncStorage.getItem('@cmpf_perm_overlay');
      setOverlayEnabled(overlayVal === 'true');

      const batteryVal = await AsyncStorage.getItem('@cmpf_perm_battery');
      setBatteryEnabled(batteryVal === 'true');
    } catch (_e) {}
  };

  useEffect(() => {
    verifyAllPermissions();

    const handleAppState = async (nextAppState) => {
      if (nextAppState === 'active') {
        const realNotif = await checkRealNotificationPermission();
        setNotifEnabled(realNotif);

        const pending = pendingPermRef.current;
        pendingPermRef.current = null;

        if (pending === 'overlay') {
          Alert.alert(
            isArabic ? 'الظهور فوق التطبيقات' : 'Superposition d\'applications',
            isArabic
              ? 'هل قمت بتفعيل صلاحية الظهور فوق التطبيقات (Overlay) في الإعدادات؟'
              : 'Avez-vous activé l\'autorisation d\'affichage au-dessus des autres applications ?',
            [
              {
                text: isArabic ? 'ليس بعد' : 'Pas encore',
                style: 'cancel',
                onPress: async () => {
                  setOverlayEnabled(false);
                  await AsyncStorage.setItem('@cmpf_perm_overlay', 'false');
                },
              },
              {
                text: isArabic ? 'نعم، تم التفعيل' : 'Oui, activé',
                onPress: async () => {
                  setOverlayEnabled(true);
                  await AsyncStorage.setItem('@cmpf_perm_overlay', 'true');
                },
              },
            ]
          );
        } else if (pending === 'battery') {
          Alert.alert(
            isArabic ? 'استثناء توفير الطاقة والبطارية' : 'Optimisation de la batterie',
            isArabic
              ? 'هل قمت باستثناء التطبيق من قيود توفير الطاقة لضمان رنين المنبه في وقته؟'
              : 'Avez-vous exclu l\'application de l\'économie d\'énergie pour garantir la sonnerie ?',
            [
              {
                text: isArabic ? 'ليس بعد' : 'Pas encore',
                style: 'cancel',
                onPress: async () => {
                  setBatteryEnabled(false);
                  await AsyncStorage.setItem('@cmpf_perm_battery', 'false');
                },
              },
              {
                text: isArabic ? 'نعم، تم التفعيل' : 'Oui, activé',
                onPress: async () => {
                  setBatteryEnabled(true);
                  await AsyncStorage.setItem('@cmpf_perm_battery', 'true');
                },
              },
            ]
          );
        } else if (pending === 'notif') {
          if (realNotif) {
            await AsyncStorage.setItem('@cmpf_perm_notif', 'true');
          }
        }
      }
    };

    const sub = AppState.addEventListener('change', handleAppState);
    return () => sub.remove();
  }, [isArabic]);

  const handleOpenPhoneSettings = () => {
    if (Platform.OS === 'web') {
      Alert.alert(
        isArabic ? 'إعدادات المتصفح' : 'Paramètres du navigateur',
        isArabic
          ? 'في المتصفح، يرجى الضغط على أيقونة الإعدادات أو القفل بجانب رابط الموقع في شريط العناوين للسماح بالإشعارات والصوت.'
          : 'Sur le navigateur, cliquez sur l\'icône de cadenas ou de réglages à côté de l\'URL pour activer les notifications et le son.'
      );
      return;
    }
    if (Platform.OS === 'android') {
      Linking.openSettings().catch(() => {});
    } else if (Platform.OS === 'ios') {
      Linking.openURL('app-settings:').catch(() => {});
    } else {
      Linking.openSettings().catch(() => {});
    }
  };

  const togglePerm = async (type) => {
    if (type === 'notif') {
      if (notifEnabled) {
        setNotifEnabled(false);
        await AsyncStorage.setItem('@cmpf_perm_notif', 'false');
      } else {
        if (Platform.OS !== 'web') {
          try {
            const req = await Notifications.requestPermissionsAsync({
              ios: { allowAlert: true, allowBadge: true, allowSound: true, allowCriticalAlerts: true },
            });
            if (req.granted || req.status === 'granted') {
              setNotifEnabled(true);
              await AsyncStorage.setItem('@cmpf_perm_notif', 'true');
              return;
            }
          } catch (_e) {}
        }
        pendingPermRef.current = 'notif';
        Alert.alert(
          isArabic ? 'إذن الإشعارات' : 'Autorisation des notifications',
          isArabic
            ? 'يرجى السماح بالإشعارات في إعدادات الهاتف لضمان رنين وتنبيهات الأدوية في وقتها المحدد.'
            : 'Veuillez autoriser les notifications dans les paramètres du téléphone pour recevoir vos alertes.',
          [
            { text: isArabic ? 'إلغاء' : 'Annuler', style: 'cancel' },
            {
              text: isArabic ? 'فتح الإعدادات' : 'Ouvrir les Paramètres',
              onPress: handleOpenPhoneSettings,
            },
          ]
        );
      }
    } else if (type === 'overlay') {
      if (overlayEnabled) {
        setOverlayEnabled(false);
        await AsyncStorage.setItem('@cmpf_perm_overlay', 'false');
      } else {
        pendingPermRef.current = 'overlay';
        Alert.alert(
          isArabic ? 'صلاحية الظهور فوق التطبيقات' : 'Affichage par-dessus les applications',
          isArabic
            ? 'لإظهار شاشة المنبه ورنينها تلقائياً عند موعد الدواء حتى عند قفل الهاتف، يرجى تفعيل إذن الظهور فوق التطبيقات في الإعدادات.'
            : 'Pour afficher l\'alarme plein écran lors de l\'échéance du médicament, veuillez activer la superposition dans les paramètres.',
          [
            { text: isArabic ? 'إلغاء' : 'Annuler', style: 'cancel' },
            {
              text: isArabic ? 'فتح الإعدادات' : 'Ouvrir les Paramètres',
              onPress: handleOpenPhoneSettings,
            },
          ]
        );
      }
    } else if (type === 'battery') {
      if (batteryEnabled) {
        setBatteryEnabled(false);
        await AsyncStorage.setItem('@cmpf_perm_battery', 'false');
      } else {
        pendingPermRef.current = 'battery';
        Alert.alert(
          isArabic ? 'استثناء توفير الطاقة والبطارية' : 'Optimisation de la batterie',
          isArabic
            ? 'لمنع نظام أندرويد من إيقاف تنبيهات الأدوية في الخلفية، يرجى استثناء التطبيق من قيود توفير الطاقة (غير مقيد / Pas de restriction).'
            : 'Pour empêcher le système d\'interrompre les alarmes en arrière-plan, réglez la batterie sur "Non restreint".',
          [
            { text: isArabic ? 'إلغاء' : 'Annuler', style: 'cancel' },
            {
              text: isArabic ? 'فتح الإعدادات' : 'Ouvrir les Paramètres',
              onPress: handleOpenPhoneSettings,
            },
          ]
        );
      }
    }
  };

  const activeCount = (overlayEnabled ? 1 : 0) + (batteryEnabled ? 1 : 0) + (notifEnabled ? 1 : 0);
  const allConfigured = activeCount === 3;

  const getIconBg = (enabled) => {
    if (enabled) {
      return isDark ? 'rgba(0, 102, 255, 0.2)' : '#eff6ff';
    }
    return isDark ? 'rgba(16, 185, 129, 0.2)' : '#ecfdf5';
  };

  const getIconColor = (enabled) => {
    if (enabled) {
      return isDark ? '#60a5fa' : '#0066ff';
    }
    return isDark ? '#34d399' : '#10b981';
  };

  const changeTheme = async (nextMode) => {
    setMode(nextMode);
    if (onUpdatePreferences) {
      await onUpdatePreferences({ theme: nextMode });
    }
  };

  const changeLanguage = async (nextLanguage) => {
    setLanguage(nextLanguage);
    if (onUpdatePreferences) {
      await onUpdatePreferences({ language: nextLanguage });
    }
  };

  return (
    <SafeAreaView style={[styles.screen, { backgroundColor: colors.background }]}>
      <View style={[styles.headerCard, isDark && { backgroundColor: colors.surface, borderColor: colors.border }]}>
        <View style={styles.topBar}>
          <TouchableOpacity 
            style={[styles.backBtn, isDark && { backgroundColor: colors.surfaceAlt, borderColor: colors.border }]} 
            onPress={onBack}
            activeOpacity={0.8}
          >
            <Ionicons name="chevron-back" size={20} color={colors.textPrimary} />
          </TouchableOpacity>
          <View style={styles.topTitleWrap}>
            <Text style={[styles.topTitle, arBold, { color: colors.textPrimary }]}>{t('settings.title')}</Text>
          </View>
          <View style={styles.placeholderBtn} />
        </View>
      </View>

      <ScrollView contentContainerStyle={styles.content} showsVerticalScrollIndicator={false}>
        {/* Permissions & System Settings Card */}
        <View style={[styles.card, { backgroundColor: colors.surface, borderColor: colors.border }]}>
          <View style={styles.permHeaderRow}>
            <View
              style={[
                styles.permIconBadge,
                {
                  backgroundColor: allConfigured
                    ? isDark
                      ? 'rgba(0, 102, 255, 0.15)'
                      : '#eff6ff'
                    : isDark
                      ? 'rgba(16, 185, 129, 0.15)'
                      : '#ecfdf5',
                  borderColor: allConfigured
                    ? isDark
                      ? 'rgba(0, 102, 255, 0.4)'
                      : '#bfdbfe'
                    : isDark
                      ? 'rgba(16, 185, 129, 0.4)'
                      : '#a7f3d0',
                },
              ]}
            >
              <Ionicons
                name="shield-checkmark"
                size={24}
                color={allConfigured ? (isDark ? '#60a5fa' : '#0066ff') : (isDark ? '#34d399' : '#10b981')}
              />
            </View>
            <View style={{ flex: 1 }}>
              <View style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' }}>
                <Text style={[styles.cardTitle, arBold, { color: colors.textPrimary }]}>{t('settings.permTitle')}</Text>
                <View
                  style={{
                    backgroundColor: allConfigured ? 'rgba(0, 102, 255, 0.12)' : 'rgba(16, 185, 129, 0.15)',
                    paddingHorizontal: 8,
                    paddingVertical: 2,
                    borderRadius: 999,
                    borderWidth: 1,
                    borderColor: allConfigured ? '#0066ff' : '#10b981',
                  }}
                >
                  <Text
                    style={[
                      arBold,
                      {
                        fontSize: 11,
                        color: allConfigured ? (isDark ? '#60a5fa' : '#0066ff') : (isDark ? '#34d399' : '#10b981'),
                      },
                    ]}
                  >
                    {allConfigured
                      ? isArabic
                        ? 'مفعلة بالكامل (3/3)'
                        : '100% Configuré (3/3)'
                      : isArabic
                        ? `في انتظار الإعداد (${activeCount}/3)`
                        : `À configurer (${activeCount}/3)`}
                  </Text>
                </View>
              </View>
              <Text style={[styles.cardSub, arRegular, { color: colors.textSecondary, marginBottom: 0 }]}>
                {t('settings.permSub')}
              </Text>
            </View>
          </View>

          {/* Item 1: Overlay */}
          <TouchableOpacity
            style={[styles.permItem, { backgroundColor: colors.surfaceAlt, borderColor: colors.border }]}
            activeOpacity={0.85}
            onPress={() => togglePerm('overlay')}
          >
            <View style={styles.permItemRow}>
              <View style={[styles.permSmallIcon, { backgroundColor: getIconBg(overlayEnabled) }]}>
                <Ionicons name="copy-outline" size={17} color={getIconColor(overlayEnabled)} />
              </View>
              <View style={{ flex: 1, paddingHorizontal: 8 }}>
                <Text style={[styles.permItemText, arBold, { color: colors.textPrimary }]}>
                  {t('settings.permOverlay')}
                </Text>
                <Text style={[styles.permStatusSub, arRegular, { color: overlayEnabled ? (isDark ? '#60a5fa' : '#0066ff') : (isDark ? '#34d399' : '#10b981') }]}>
                  {overlayEnabled
                    ? (isArabic ? '● مفعل ونشط' : '● Activé et configuré')
                    : (isArabic ? '○ غير مفعل - اضغط للإعداد في الهاتف' : '○ Non configuré - Appuyer pour régler')}
                </Text>
              </View>
              <Switch
                trackColor={{ false: '#10b981', true: '#0066ff' }}
                thumbColor="#ffffff"
                ios_backgroundColor="#10b981"
                value={overlayEnabled}
                onValueChange={() => togglePerm('overlay')}
              />
            </View>
          </TouchableOpacity>

          {/* Item 2: Battery */}
          <TouchableOpacity
            style={[styles.permItem, { backgroundColor: colors.surfaceAlt, borderColor: colors.border }]}
            activeOpacity={0.85}
            onPress={() => togglePerm('battery')}
          >
            <View style={styles.permItemRow}>
              <View style={[styles.permSmallIcon, { backgroundColor: getIconBg(batteryEnabled) }]}>
                <Ionicons name="battery-charging-outline" size={17} color={getIconColor(batteryEnabled)} />
              </View>
              <View style={{ flex: 1, paddingHorizontal: 8 }}>
                <Text style={[styles.permItemText, arBold, { color: colors.textPrimary }]}>
                  {t('settings.permBattery')}
                </Text>
                <Text style={[styles.permStatusSub, arRegular, { color: batteryEnabled ? (isDark ? '#60a5fa' : '#0066ff') : (isDark ? '#34d399' : '#10b981') }]}>
                  {batteryEnabled
                    ? (isArabic ? '● مفعل ونشط' : '● Activé et configuré')
                    : (isArabic ? '○ غير مفعل - اضغط للإعداد في الهاتف' : '○ Non configuré - Appuyer pour régler')}
                </Text>
              </View>
              <Switch
                trackColor={{ false: '#10b981', true: '#0066ff' }}
                thumbColor="#ffffff"
                ios_backgroundColor="#10b981"
                value={batteryEnabled}
                onValueChange={() => togglePerm('battery')}
              />
            </View>
          </TouchableOpacity>

          {/* Item 3: Notifications */}
          <TouchableOpacity
            style={[styles.permItem, { backgroundColor: colors.surfaceAlt, borderColor: colors.border }]}
            activeOpacity={0.85}
            onPress={() => togglePerm('notif')}
          >
            <View style={styles.permItemRow}>
              <View style={[styles.permSmallIcon, { backgroundColor: getIconBg(notifEnabled) }]}>
                <Ionicons name="notifications-outline" size={17} color={getIconColor(notifEnabled)} />
              </View>
              <View style={{ flex: 1, paddingHorizontal: 8 }}>
                <Text style={[styles.permItemText, arBold, { color: colors.textPrimary }]}>
                  {t('settings.permNotif')}
                </Text>
                <Text style={[styles.permStatusSub, arRegular, { color: notifEnabled ? (isDark ? '#60a5fa' : '#0066ff') : (isDark ? '#34d399' : '#10b981') }]}>
                  {notifEnabled
                    ? (isArabic ? '● مفعل ونشط' : '● Activé et configuré')
                    : (isArabic ? '○ غير مفعل - اضغط للإعداد في الهاتف' : '○ Non configuré - Appuyer pour régler')}
                </Text>
              </View>
              <Switch
                trackColor={{ false: '#10b981', true: '#0066ff' }}
                thumbColor="#ffffff"
                ios_backgroundColor="#10b981"
                value={notifEnabled}
                onValueChange={() => togglePerm('notif')}
              />
            </View>
          </TouchableOpacity>

          {/* Main Action Button to open Phone Settings */}
          <TouchableOpacity
            style={styles.openSettingsBtn}
            onPress={handleOpenPhoneSettings}
            activeOpacity={0.88}
          >
            <Ionicons name="settings" size={18} color="#ffffff" />
            <Text style={[styles.openSettingsBtnText, arBold]}>{t('settings.permBtn')}</Text>
          </TouchableOpacity>
        </View>

        {/* Appearance Card */}
        <View style={[styles.card, { backgroundColor: colors.surface, borderColor: colors.border }]}>
          <Text style={[styles.cardTitle, arBold, { color: colors.textPrimary }]}>{t('settings.appearanceTitle')}</Text>
          <Text style={[styles.cardSub, arRegular, { color: colors.textSecondary }]}>{t('settings.appearanceSub')}</Text>
          <View style={styles.row}>
            {THEME_OPTIONS.map((item) => {
              const active = mode === item;
              return (
                <TouchableOpacity
                  key={item}
                  style={[styles.optionBtn, { borderColor: colors.border, backgroundColor: colors.surfaceAlt }, active && [styles.optionBtnActive, { borderColor: colors.primary }]]}
                  onPress={() => changeTheme(item)}
                >
                  <Text style={[styles.optionText, arRegular, active && { color: colors.primary }]}>{item === 'light' ? t('onboarding.themeLight') : t('onboarding.themeDark')}</Text>
                </TouchableOpacity>
              );
            })}
          </View>
        </View>

        {/* Language Card */}
        <View style={[styles.card, { backgroundColor: colors.surface, borderColor: colors.border }]}>
          <Text style={[styles.cardTitle, arBold, { color: colors.textPrimary }]}>{t('settings.languageTitle')}</Text>
          <Text style={[styles.cardSub, arRegular, { color: colors.textSecondary }]}>{t('settings.languageSub')}</Text>
          <View style={styles.row}>
            {LANG_OPTIONS.map((item) => {
              const active = language === item;
              const label = item === 'ar' ? t('onboarding.languageAr') : item === 'en' ? t('onboarding.languageEn') : t('onboarding.languageFr');
              return (
                <TouchableOpacity
                  key={item}
                  style={[styles.optionBtn, { borderColor: colors.border, backgroundColor: colors.surfaceAlt }, active && [styles.optionBtnActive, { borderColor: colors.primary }]]}
                  onPress={() => changeLanguage(item)}
                >
                  <Text style={[styles.optionText, arRegular, active && { color: colors.primary }]}>{label}</Text>
                </TouchableOpacity>
              );
            })}
          </View>
        </View>

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
    placeholderBtn: {
      width: s(44, 38, 48),
      height: s(44, 38, 48),
    },
    content: {
      paddingHorizontal: s(16, 12, 22),
      paddingVertical: s(14, 12, 20),
      gap: s(14, 12, 18),
    },
    card: {
      borderRadius: s(20, 16, 24),
      borderWidth: 1,
      padding: s(16, 14, 20),
    },
    cardTitle: {
      fontSize: s(19, 16, 23),
      fontWeight: '900',
    },
    cardSub: {
      marginTop: s(6, 4, 8),
      marginBottom: s(12, 10, 14),
      fontSize: s(13, 11, 16),
      lineHeight: s(19, 17, 22),
    },
    permHeaderRow: {
      flexDirection: 'row',
      alignItems: 'center',
      gap: s(12, 10, 14),
      marginBottom: s(12, 10, 14),
    },
    permIconBadge: {
      width: s(48, 42, 54),
      height: s(48, 42, 54),
      borderRadius: s(14, 12, 16),
      backgroundColor: '#fff1f2',
      alignItems: 'center',
      justifyContent: 'center',
      borderWidth: 1,
      borderColor: '#fecdd3',
    },
    permItem: {
      borderRadius: s(14, 12, 16),
      borderWidth: 1,
      paddingHorizontal: s(12, 10, 14),
      paddingVertical: s(10, 8, 12),
      marginBottom: s(8, 6, 10),
    },
    permItemRow: {
      flexDirection: 'row',
      alignItems: 'center',
      gap: s(10, 8, 12),
    },
    permSmallIcon: {
      width: s(32, 28, 36),
      height: s(32, 28, 36),
      borderRadius: s(8, 7, 10),
      alignItems: 'center',
      justifyContent: 'center',
    },
    permItemText: {
      fontSize: s(13, 11, 15),
      fontWeight: '700',
    },
    permStatusSub: {
      marginTop: s(2, 2, 4),
      fontSize: s(11, 10, 13),
      fontWeight: '600',
    },
    openSettingsBtn: {
      backgroundColor: '#0066ff',
      minHeight: s(46, 40, 52),
      borderRadius: s(14, 12, 16),
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'center',
      gap: s(8, 6, 10),
      marginTop: s(6, 4, 8),
      shadowColor: '#0066ff',
      shadowOpacity: 0.25,
      shadowRadius: 10,
      shadowOffset: { width: 0, height: 4 },
      elevation: 4,
    },
    openSettingsBtnText: {
      color: '#ffffff',
      fontSize: s(13, 12, 15),
      fontWeight: '800',
    },
    row: {
      flexDirection: 'row',
      gap: s(8, 6, 10),
      flexWrap: 'wrap',
    },
    optionBtn: {
      minWidth: s(96, 84, 120),
      minHeight: s(42, 36, 50),
      borderRadius: s(12, 10, 16),
      borderWidth: 1,
      alignItems: 'center',
      justifyContent: 'center',
      paddingHorizontal: s(10, 8, 14),
    },
    optionBtnActive: {
      borderWidth: 2,
      backgroundColor: '#eaf2ff',
    },
    optionText: {
      color: '#2c4e7d',
      fontWeight: '700',
      fontSize: s(13, 11, 16),
    },
  });
};
