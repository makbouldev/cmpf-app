import { useMemo, useState } from 'react';
import {
  Linking,
  Platform,
  SafeAreaView,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
  useWindowDimensions,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { createScaler } from '../utils/responsive';
import { useI18n } from '../i18n/I18nContext';
import { useAppTheme } from '../theme/ThemeContext';

const LANGUAGE_OPTIONS = ['ar', 'fr', 'en'];
const THEME_OPTIONS = ['light', 'dark'];

export default function OnboardingScreen({ onFinish }) {
  const { width } = useWindowDimensions();
  const s = useMemo(() => createScaler(width), [width]);
  const styles = useMemo(() => createStyles(width), [width]);
  const { language, setLanguage, t } = useI18n();
  const { colors, mode, setMode } = useAppTheme();
  const isDark = mode === 'dark';
  const isArabic = language === 'ar';
  const arRegular = isArabic ? { fontFamily: 'Cairo_400Regular' } : null;
  const arBold = isArabic ? { fontFamily: 'Cairo_700Bold' } : null;

  const [step, setStep] = useState(0);

  const completeSetup = () => {
    onFinish({
      language,
      theme: mode,
      account: {
        mode: 'skip',
        token: '',
        user: null,
        phone: '',
      },
    });
  };

  const goNext = () => {
    if (step < 2) {
      setStep((prev) => prev + 1);
      return;
    }
    completeSetup();
  };

  const goBack = () => {
    if (step > 0) setStep((prev) => prev - 1);
  };

  const handleOpenSettings = () => {
    if (Platform.OS === 'android') {
      Linking.openSettings().catch(() => {});
    } else if (Platform.OS === 'ios') {
      Linking.openURL('app-settings:').catch(() => {});
    } else {
      Linking.openSettings().catch(() => {});
    }
  };

  const languageLabel = (id) => {
    if (id === 'ar') return t('onboarding.languageAr');
    if (id === 'en') return t('onboarding.languageEn');
    return t('onboarding.languageFr');
  };

  return (
    <SafeAreaView style={[styles.screen, { backgroundColor: colors.background }]}>
      <ScrollView contentContainerStyle={styles.content} showsVerticalScrollIndicator={false}>
        <Text style={[styles.title, arBold, { color: colors.textPrimary }]}>{t('onboarding.title')}</Text>
        <Text style={[styles.subtitle, arRegular, { color: colors.textSecondary }]}>{t('onboarding.subtitle')}</Text>

        <View style={styles.progressRow}>
          {[0, 1, 2].map((index) => (
            <View
              key={index}
              style={[
                styles.progressBar,
                { backgroundColor: isDark ? '#1e293b' : '#e5e7eb' },
                step >= index && { backgroundColor: '#2563eb' },
              ]}
            />
          ))}
        </View>

        {step === 0 ? (
          <View style={[styles.card, { backgroundColor: colors.surface, borderColor: colors.border }]}>
            <Text style={[styles.cardTitle, arBold, { color: colors.textPrimary }]}>{t('onboarding.languageTitle')}</Text>
            <Text style={[styles.cardSub, arRegular, { color: colors.textSecondary }]}>{t('onboarding.languageSub')}</Text>

            {LANGUAGE_OPTIONS.map((item) => {
              const active = language === item;
              return (
                <TouchableOpacity
                  key={item}
                  style={[
                    styles.optionRow,
                    { backgroundColor: isDark ? colors.surfaceAlt : '#f9fafb', borderColor: colors.border },
                    active && { borderColor: '#2563eb', backgroundColor: isDark ? 'rgba(37,99,235,0.12)' : '#eff6ff' },
                  ]}
                  onPress={() => setLanguage(item)}
                >
                  <Ionicons name="language-outline" size={s(18, 16, 20)} color={active ? '#2563eb' : '#9ca3af'} />
                  <Text style={[styles.optionText, arRegular, { color: active ? '#2563eb' : colors.textSecondary }]}>
                    {languageLabel(item)}
                  </Text>
                  {active && <Ionicons name="checkmark-circle" size={20} color="#2563eb" style={{ marginLeft: 'auto' }} />}
                </TouchableOpacity>
              );
            })}
          </View>
        ) : null}

        {step === 1 ? (
          <View style={[styles.card, { backgroundColor: colors.surface, borderColor: colors.border }]}>
            <Text style={[styles.cardTitle, arBold, { color: colors.textPrimary }]}>{t('onboarding.themeTitle')}</Text>
            <Text style={[styles.cardSub, arRegular, { color: colors.textSecondary }]}>{t('onboarding.themeSub')}</Text>

            {THEME_OPTIONS.map((item) => {
              const active = mode === item;
              return (
                <TouchableOpacity
                  key={item}
                  style={[
                    styles.optionRow,
                    { backgroundColor: isDark ? colors.surfaceAlt : '#f9fafb', borderColor: colors.border },
                    active && { borderColor: '#2563eb', backgroundColor: isDark ? 'rgba(37,99,235,0.12)' : '#eff6ff' },
                  ]}
                  onPress={() => setMode(item)}
                >
                  <Ionicons
                    name={item === 'light' ? 'sunny-outline' : 'moon-outline'}
                    size={s(18, 16, 20)}
                    color={active ? '#2563eb' : '#9ca3af'}
                  />
                  <Text style={[styles.optionText, arRegular, { color: active ? '#2563eb' : colors.textSecondary }]}>
                    {item === 'light' ? t('onboarding.themeLight') : t('onboarding.themeDark')}
                  </Text>
                  {active && <Ionicons name="checkmark-circle" size={20} color="#2563eb" style={{ marginLeft: 'auto' }} />}
                </TouchableOpacity>
              );
            })}
          </View>
        ) : null}

        {step === 2 ? (
          <View style={[styles.card, { backgroundColor: colors.surface, borderColor: colors.border }]}>
            <Text style={[styles.cardTitle, arBold, { color: colors.textPrimary }]}>{t('onboarding.permTitle')}</Text>
            <Text style={[styles.cardSub, arRegular, { color: colors.textSecondary }]}>{t('onboarding.permSub')}</Text>

            <View style={[styles.permItem, { backgroundColor: isDark ? colors.surfaceAlt : '#f9fafb', borderColor: colors.border }]}>
              <View style={styles.permItemTop}>
                <View style={[styles.permIcon, { backgroundColor: '#eff6ff' }]}>
                  <Ionicons name="copy-outline" size={s(18, 16, 20)} color="#2563eb" />
                </View>
                <View style={{ flex: 1 }}>
                  <Text style={[styles.permItemTitle, arBold, { color: colors.textPrimary }]}>{t('onboarding.permOverlayTitle')}</Text>
                  <Text style={[styles.permItemDesc, arRegular, { color: colors.textSecondary }]}>{t('onboarding.permOverlayDesc')}</Text>
                </View>
              </View>
              <TouchableOpacity style={styles.permActionBtn} onPress={handleOpenSettings} activeOpacity={0.8}>
                <Ionicons name="settings-outline" size={14} color="#ffffff" />
                <Text style={[styles.permActionBtnText, arBold]}>{t('onboarding.permBtnOpenSettings')}</Text>
              </TouchableOpacity>
            </View>

            <View style={[styles.permItem, { backgroundColor: isDark ? colors.surfaceAlt : '#f9fafb', borderColor: colors.border }]}>
              <View style={styles.permItemTop}>
                <View style={[styles.permIcon, { backgroundColor: '#ecfdf5' }]}>
                  <Ionicons name="battery-charging-outline" size={s(18, 16, 20)} color="#059669" />
                </View>
                <View style={{ flex: 1 }}>
                  <Text style={[styles.permItemTitle, arBold, { color: colors.textPrimary }]}>{t('onboarding.permBatteryTitle')}</Text>
                  <Text style={[styles.permItemDesc, arRegular, { color: colors.textSecondary }]}>{t('onboarding.permBatteryDesc')}</Text>
                </View>
              </View>
              <TouchableOpacity style={[styles.permActionBtn, { backgroundColor: '#059669' }]} onPress={handleOpenSettings} activeOpacity={0.8}>
                <Ionicons name="flash-outline" size={14} color="#ffffff" />
                <Text style={[styles.permActionBtnText, arBold]}>{t('onboarding.permBtnOpenSettings')}</Text>
              </TouchableOpacity>
            </View>

            <View style={[styles.permItem, { backgroundColor: isDark ? colors.surfaceAlt : '#f9fafb', borderColor: colors.border }]}>
              <View style={styles.permItemTop}>
                <View style={[styles.permIcon, { backgroundColor: '#fef2f2' }]}>
                  <Ionicons name="notifications-outline" size={s(18, 16, 20)} color="#dc2626" />
                </View>
                <View style={{ flex: 1 }}>
                  <Text style={[styles.permItemTitle, arBold, { color: colors.textPrimary }]}>{t('onboarding.permNotifTitle')}</Text>
                  <Text style={[styles.permItemDesc, arRegular, { color: colors.textSecondary }]}>{t('onboarding.permNotifDesc')}</Text>
                </View>
              </View>
            </View>
          </View>
        ) : null}

        <View style={styles.bottomRow}>
          <TouchableOpacity
            style={[styles.secondaryBtn, { backgroundColor: colors.surface, borderColor: colors.border }, step === 0 && { opacity: 0.4 }]}
            disabled={step === 0}
            onPress={goBack}
          >
            <Text style={[styles.secondaryBtnText, arRegular, { color: colors.textSecondary }]}>{t('common.back')}</Text>
          </TouchableOpacity>

          <TouchableOpacity style={styles.primaryBtn} onPress={goNext}>
            <Text style={[styles.primaryBtnText, arBold]}>{step < 2 ? t('common.next') : t('onboarding.permBtnDone')}</Text>
          </TouchableOpacity>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

const createStyles = (width) => {
  const s = createScaler(width);

  return StyleSheet.create({
    screen: { flex: 1 },
    content: {
      paddingHorizontal: s(20, 16, 26),
      paddingTop: s(32, 24, 40),
      paddingBottom: s(24, 20, 30),
      gap: s(16, 14, 20),
    },
    title: {
      fontSize: s(28, 24, 34),
      fontWeight: '800',
    },
    subtitle: {
      fontSize: s(15, 13, 17),
      lineHeight: s(22, 19, 26),
      marginTop: -4,
    },
    progressRow: {
      flexDirection: 'row',
      gap: s(6, 4, 8),
    },
    progressBar: {
      flex: 1,
      height: 4,
      borderRadius: 2,
    },
    card: {
      borderRadius: 16,
      borderWidth: 1,
      padding: s(18, 14, 22),
    },
    cardTitle: {
      fontSize: s(20, 17, 24),
      fontWeight: '700',
    },
    cardSub: {
      marginTop: s(4, 3, 6),
      marginBottom: s(14, 12, 18),
      fontSize: s(13, 12, 15),
      lineHeight: s(19, 17, 22),
    },
    optionRow: {
      height: 48,
      borderRadius: 10,
      borderWidth: 1,
      paddingHorizontal: s(14, 12, 18),
      flexDirection: 'row',
      alignItems: 'center',
      gap: s(10, 8, 12),
      marginBottom: s(8, 6, 10),
    },
    optionText: {
      fontSize: s(15, 14, 18),
      fontWeight: '600',
    },
    permItem: {
      borderRadius: 12,
      borderWidth: 1,
      padding: s(14, 12, 16),
      marginBottom: s(10, 8, 12),
    },
    permItemTop: {
      flexDirection: 'row',
      alignItems: 'flex-start',
      gap: s(10, 8, 12),
    },
    permIcon: {
      width: s(34, 30, 38),
      height: s(34, 30, 38),
      borderRadius: 10,
      alignItems: 'center',
      justifyContent: 'center',
      marginTop: 2,
    },
    permItemTitle: {
      fontSize: s(14, 12, 16),
      fontWeight: '700',
    },
    permItemDesc: {
      marginTop: 2,
      fontSize: s(12, 11, 14),
      lineHeight: s(17, 15, 20),
    },
    permActionBtn: {
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'center',
      gap: 6,
      borderRadius: 10,
      paddingVertical: s(8, 7, 10),
      paddingHorizontal: s(12, 10, 14),
      marginTop: s(10, 8, 12),
      backgroundColor: '#2563eb',
    },
    permActionBtnText: {
      color: '#ffffff',
      fontSize: s(12, 11, 14),
      fontWeight: '700',
    },
    bottomRow: {
      flexDirection: 'row',
      gap: s(10, 8, 12),
      marginTop: s(4, 4, 8),
    },
    primaryBtn: {
      backgroundColor: '#2563eb',
      height: 48,
      borderRadius: 12,
      alignItems: 'center',
      justifyContent: 'center',
      paddingHorizontal: s(20, 16, 26),
      flex: 1,
    },
    primaryBtnText: {
      color: '#fff',
      fontSize: s(15, 13, 17),
      fontWeight: '700',
    },
    secondaryBtn: {
      height: 48,
      borderRadius: 12,
      borderWidth: 1,
      alignItems: 'center',
      justifyContent: 'center',
      paddingHorizontal: s(20, 16, 26),
      flex: 1,
    },
    secondaryBtnText: {
      fontSize: s(15, 13, 17),
      fontWeight: '600',
    },
  });
};
