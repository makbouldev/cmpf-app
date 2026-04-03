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

  const [overlayEnabled, setOverlayEnabled] = useState(false);
  const [batteryEnabled, setBatteryEnabled] = useState(false);
  const [notifEnabled, setNotifEnabled] = useState(false);
  const pendingPermRef = useRef(null);

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

  const PermRow = ({ icon, label, statusText, enabled, onToggle }) => (
    <TouchableOpacity style={[styles.permRow, { borderColor: colors.border }]} activeOpacity={0.7} onPress={onToggle}>
      <View style={[styles.permIcon, { backgroundColor: isDark ? colors.surfaceAlt : (enabled ? '#eff6ff' : '#f3f4f6') }]}>
        <Ionicons name={icon} size={18} color={enabled ? '#2563eb' : '#9ca3af'} />
      </View>
      <View style={styles.permTextWrap}>
        <Text style={[styles.permLabel, arBold, { color: colors.textPrimary }]}>{label}</Text>
        <Text style={[styles.permStatus, arRegular, { color: enabled ? '#2563eb' : '#9ca3af' }]}>{statusText}</Text>
      </View>
      <Switch
        trackColor={{ false: '#d1d5db', true: '#2563eb' }}
        thumbColor="#ffffff"
        ios_backgroundColor="#d1d5db"
        value={enabled}
        onValueChange={onToggle}
      />
    </TouchableOpacity>
  );

  return (
    <SafeAreaView style={[styles.screen, { backgroundColor: colors.background }]}>
      <View style={[styles.header, isDark && { backgroundColor: colors.surface, borderBottomColor: colors.border }]}>
        <TouchableOpacity style={[styles.backBtn, isDark && { backgroundColor: colors.surfaceAlt }]} onPress={onBack} activeOpacity={0.8}>
          <Ionicons name="chevron-back" size={20} color={colors.textPrimary} />
        </TouchableOpacity>
        <Text style={[styles.headerTitle, arBold, { color: colors.textPrimary }]}>{t('settings.title')}</Text>
        <View style={styles.headerPlaceholder} />
      </View>

      <ScrollView contentContainerStyle={styles.content} showsVerticalScrollIndicator={false}>
        <Text style={[styles.sectionLabel, arBold, { color: colors.textSecondary }]}>{t('settings.permTitle')}</Text>
        <View style={[styles.card, { backgroundColor: colors.surface, borderColor: colors.border }]}>
          <PermRow
            icon="copy-outline"
            label={t('settings.permOverlay')}
            statusText={overlayEnabled ? (isArabic ? 'مفعل' : 'Activé') : (isArabic ? 'غير مفعل' : 'Non configuré')}
            enabled={overlayEnabled}
            onToggle={() => togglePerm('overlay')}
          />
          <View style={[styles.divider, { backgroundColor: colors.border }]} />
          <PermRow
            icon="battery-charging-outline"
            label={t('settings.permBattery')}
            statusText={batteryEnabled ? (isArabic ? 'مفعل' : 'Activé') : (isArabic ? 'غير مفعل' : 'Non configuré')}
            enabled={batteryEnabled}
            onToggle={() => togglePerm('battery')}
          />
          <View style={[styles.divider, { backgroundColor: colors.border }]} />
          <PermRow
            icon="notifications-outline"
            label={t('settings.permNotif')}
            statusText={notifEnabled ? (isArabic ? 'مفعل' : 'Activé') : (isArabic ? 'غير مفعل' : 'Non configuré')}
            enabled={notifEnabled}
            onToggle={() => togglePerm('notif')}
          />
        </View>

        <Text style={[styles.sectionFooter, arRegular, { color: colors.textSecondary }]}>
          {activeCount}/3 {isArabic ? 'مفعلة' : 'configurés'}
        </Text>

        <TouchableOpacity
          style={[styles.openSettingsBtn, isDark && { backgroundColor: colors.surfaceAlt, borderColor: colors.border }]}
          onPress={handleOpenPhoneSettings}
          activeOpacity={0.7}
        >
          <Ionicons name="settings-outline" size={18} color={colors.textPrimary} />
          <Text style={[styles.openSettingsText, arBold, { color: colors.textPrimary }]}>{t('settings.permBtn')}</Text>
          <Ionicons name="chevron-forward" size={16} color={colors.textSecondary} />
        </TouchableOpacity>

        <Text style={[styles.sectionLabel, arBold, { color: colors.textSecondary }]}>{t('settings.appearanceTitle')}</Text>
        <View style={[styles.card, { backgroundColor: colors.surface, borderColor: colors.border }]}>
          <View style={styles.optionsRow}>
            {THEME_OPTIONS.map((item) => {
              const active = mode === item;
              return (
                <TouchableOpacity
                  key={item}
                  style={[styles.optionChip, { borderColor: colors.border, backgroundColor: isDark ? colors.surfaceAlt : '#f9fafb' }, active && { borderColor: '#2563eb', backgroundColor: isDark ? 'rgba(37,99,235,0.15)' : '#eff6ff' }]}
                  onPress={() => changeTheme(item)}
                >
                  <Ionicons name={item === 'light' ? 'sunny-outline' : 'moon-outline'} size={16} color={active ? '#2563eb' : colors.textSecondary} />
                  <Text style={[styles.optionChipText, arRegular, { color: active ? '#2563eb' : colors.textSecondary }]}>
                    {item === 'light' ? t('onboarding.themeLight') : t('onboarding.themeDark')}
                  </Text>
                </TouchableOpacity>
              );
            })}
          </View>
        </View>

        <Text style={[styles.sectionLabel, arBold, { color: colors.textSecondary }]}>{t('settings.languageTitle')}</Text>
        <View style={[styles.card, { backgroundColor: colors.surface, borderColor: colors.border }]}>
          <View style={styles.optionsRow}>
            {LANG_OPTIONS.map((item) => {
              const active = language === item;
              const label = item === 'ar' ? t('onboarding.languageAr') : item === 'en' ? t('onboarding.languageEn') : t('onboarding.languageFr');
              return (
                <TouchableOpacity
                  key={item}
                  style={[styles.optionChip, { borderColor: colors.border, backgroundColor: isDark ? colors.surfaceAlt : '#f9fafb' }, active && { borderColor: '#2563eb', backgroundColor: isDark ? 'rgba(37,99,235,0.15)' : '#eff6ff' }]}
                  onPress={() => changeLanguage(item)}
                >
                  <Text style={[styles.optionChipText, arRegular, { color: active ? '#2563eb' : colors.textSecondary }]}>{label}</Text>
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
    headerTitle: {
      flex: 1,
      textAlign: 'center',
      color: '#111827',
      fontSize: s(17, 15, 20),
      fontWeight: '700',
    },
    headerPlaceholder: {
      width: s(40, 36, 44),
    },
    content: {
      paddingHorizontal: s(16, 14, 20),
      paddingTop: s(8, 6, 10),
      paddingBottom: s(32, 24, 40),
    },
    sectionLabel: {
      fontSize: s(12, 11, 13),
      fontWeight: '600',
      textTransform: 'uppercase',
      letterSpacing: 0.5,
      marginTop: s(20, 16, 24),
      marginBottom: s(8, 6, 10),
      marginLeft: s(4, 2, 6),
    },
    sectionFooter: {
      fontSize: s(12, 11, 13),
      marginTop: s(6, 4, 8),
      marginLeft: s(4, 2, 6),
    },
    card: {
      borderRadius: 16,
      borderWidth: 1,
      overflow: 'hidden',
    },
    permRow: {
      flexDirection: 'row',
      alignItems: 'center',
      paddingHorizontal: s(14, 12, 16),
      paddingVertical: s(12, 10, 14),
      gap: s(12, 10, 14),
    },
    permIcon: {
      width: s(36, 32, 40),
      height: s(36, 32, 40),
      borderRadius: 10,
      alignItems: 'center',
      justifyContent: 'center',
    },
    permTextWrap: {
      flex: 1,
    },
    permLabel: {
      fontSize: s(14, 12, 16),
      fontWeight: '600',
    },
    permStatus: {
      marginTop: 2,
      fontSize: s(12, 11, 13),
      fontWeight: '500',
    },
    divider: {
      height: 1,
      marginLeft: s(62, 54, 70),
    },
    openSettingsBtn: {
      marginTop: s(10, 8, 12),
      flexDirection: 'row',
      alignItems: 'center',
      backgroundColor: '#f3f4f6',
      borderRadius: 12,
      paddingHorizontal: s(14, 12, 16),
      paddingVertical: s(12, 10, 14),
      gap: s(10, 8, 12),
    },
    openSettingsText: {
      flex: 1,
      fontSize: s(14, 12, 16),
      fontWeight: '600',
    },
    optionsRow: {
      flexDirection: 'row',
      gap: s(8, 6, 10),
      padding: s(14, 12, 16),
      flexWrap: 'wrap',
    },
    optionChip: {
      flexDirection: 'row',
      alignItems: 'center',
      gap: s(6, 4, 8),
      paddingHorizontal: s(14, 12, 18),
      paddingVertical: s(10, 8, 12),
      borderRadius: 10,
      borderWidth: 1,
    },
    optionChipText: {
      fontSize: s(14, 12, 16),
      fontWeight: '600',
    },
  });
};
