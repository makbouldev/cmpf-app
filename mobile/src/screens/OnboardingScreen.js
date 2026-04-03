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
        <View style={styles.headerWrap}>
          <Text style={[styles.title, arBold, { color: colors.textPrimary }]}>{t('onboarding.title')}</Text>
          <Text style={[styles.subtitle, arRegular, { color: colors.textSecondary }]}>{t('onboarding.subtitle')}</Text>
        </View>

        <View style={styles.progressRow}>
          {[0, 1, 2].map((index) => (
            <View
              key={index}
              style={[
                styles.progressDot,
                { backgroundColor: isDark ? '#2b3b5e' : '#d7e3f2' },
                step >= index && styles.progressDotActive,
              ]}
            />
          ))}
        </View>

        {/* Step 0: Language */}
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
                    { backgroundColor: colors.surfaceAlt, borderColor: colors.border },
                    active && [styles.optionRowActive, { borderColor: colors.primary }],
                  ]}
                  onPress={() => setLanguage(item)}
                >
                  <Ionicons name="language-outline" size={s(20, 18, 24)} color={active ? colors.primary : '#40638f'} />
                  <Text
                    style={[
                      styles.optionText,
                      active && styles.optionTextActive,
                      arRegular,
                      { color: active ? colors.primary : colors.textSecondary },
                    ]}
                  >
                    {languageLabel(item)}
                  </Text>
                </TouchableOpacity>
              );
            })}
          </View>
        ) : null}

        {/* Step 1: Theme */}
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
                    { backgroundColor: colors.surfaceAlt, borderColor: colors.border },
                    active && [styles.optionRowActive, { borderColor: colors.primary }],
                  ]}
                  onPress={() => setMode(item)}
                >
                  <Ionicons
                    name={item === 'light' ? 'sunny-outline' : 'moon-outline'}
                    size={s(20, 18, 24)}
                    color={active ? colors.primary : '#40638f'}
                  />
                  <Text
                    style={[
                      styles.optionText,
                      active && styles.optionTextActive,
                      arRegular,
                      { color: active ? colors.primary : colors.textSecondary },
                    ]}
                  >
                    {item === 'light' ? t('onboarding.themeLight') : t('onboarding.themeDark')}
                  </Text>
                </TouchableOpacity>
              );
            })}
          </View>
        ) : null}

        {/* Step 2: Essential Alarm Permissions */}
        {step === 2 ? (
          <View style={[styles.card, { backgroundColor: colors.surface, borderColor: colors.border }]}>
            <View style={styles.permHeaderRow}>
              <View style={styles.permIconBadge}>
                <Ionicons name="shield-checkmark" size={s(26, 22, 30)} color="#e11d48" />
              </View>
              <View style={{ flex: 1 }}>
                <Text style={[styles.cardTitle, arBold, { color: colors.textPrimary }]}>{t('onboarding.permTitle')}</Text>
                <Text style={[styles.cardSub, arRegular, { color: colors.textSecondary, marginBottom: 0 }]}>{t('onboarding.permSub')}</Text>
              </View>
            </View>

            {/* Permission 1: Overlay (Draw over apps) */}
            <View style={[styles.permItem, { backgroundColor: colors.surfaceAlt, borderColor: colors.border }]}>
              <View style={styles.permItemTop}>
                <View style={[styles.permSmallIcon, { backgroundColor: '#eff6ff' }]}>
                  <Ionicons name="copy-outline" size={s(20, 18, 22)} color="#0066ff" />
                </View>
                <View style={{ flex: 1 }}>
                  <Text style={[styles.permItemTitle, arBold, { color: colors.textPrimary }]}>
                    {t('onboarding.permOverlayTitle')}
                  </Text>
                  <Text style={[styles.permItemDesc, arRegular, { color: colors.textSecondary }]}>
                    {t('onboarding.permOverlayDesc')}
                  </Text>
                </View>
              </View>
              <TouchableOpacity
                style={[styles.permActionBtn, { backgroundColor: '#0066ff' }]}
                onPress={handleOpenSettings}
                activeOpacity={0.88}
              >
                <Ionicons name="settings-outline" size={16} color="#ffffff" />
                <Text style={[styles.permActionBtnText, arBold]}>{t('onboarding.permBtnOpenSettings')}</Text>
              </TouchableOpacity>
            </View>

            {/* Permission 2: Battery optimization */}
            <View style={[styles.permItem, { backgroundColor: colors.surfaceAlt, borderColor: colors.border }]}>
              <View style={styles.permItemTop}>
                <View style={[styles.permSmallIcon, { backgroundColor: '#ecfdf5' }]}>
                  <Ionicons name="battery-charging-outline" size={s(20, 18, 22)} color="#10b981" />
                </View>
                <View style={{ flex: 1 }}>
                  <Text style={[styles.permItemTitle, arBold, { color: colors.textPrimary }]}>
                    {t('onboarding.permBatteryTitle')}
                  </Text>
                  <Text style={[styles.permItemDesc, arRegular, { color: colors.textSecondary }]}>
                    {t('onboarding.permBatteryDesc')}
                  </Text>
                </View>
              </View>
              <TouchableOpacity
                style={[styles.permActionBtn, { backgroundColor: '#10b981' }]}
                onPress={handleOpenSettings}
                activeOpacity={0.88}
              >
                <Ionicons name="flash-outline" size={16} color="#ffffff" />
                <Text style={[styles.permActionBtnText, arBold]}>{t('onboarding.permBtnOpenSettings')}</Text>
              </TouchableOpacity>
            </View>

            {/* Permission 3: Notifications & Sound */}
            <View style={[styles.permItem, { backgroundColor: colors.surfaceAlt, borderColor: colors.border }]}>
              <View style={styles.permItemTop}>
                <View style={[styles.permSmallIcon, { backgroundColor: '#fff1f2' }]}>
                  <Ionicons name="notifications-outline" size={s(20, 18, 22)} color="#e11d48" />
                </View>
                <View style={{ flex: 1 }}>
                  <Text style={[styles.permItemTitle, arBold, { color: colors.textPrimary }]}>
                    {t('onboarding.permNotifTitle')}
                  </Text>
                  <Text style={[styles.permItemDesc, arRegular, { color: colors.textSecondary }]}>
                    {t('onboarding.permNotifDesc')}
                  </Text>
                </View>
              </View>
            </View>
          </View>
        ) : null}

        <View style={styles.bottomRow}>
          <TouchableOpacity
            style={[styles.secondaryBtn, { backgroundColor: colors.surface, borderColor: colors.border }, step === 0 && styles.disabledBtn]}
            disabled={step === 0}
            onPress={goBack}
          >
            <Text style={[styles.secondaryBtnText, arRegular, { color: colors.textSecondary }]}>{t('common.back')}</Text>
          </TouchableOpacity>

          <TouchableOpacity style={[styles.primaryBtn, { backgroundColor: colors.primary }]} onPress={goNext}>
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
    screen: { flex: 1, backgroundColor: '#f3f6fb' },
    content: { paddingHorizontal: s(18, 14, 26), paddingVertical: s(22, 18, 30), gap: s(14, 12, 18) },
    headerWrap: { marginBottom: s(8, 6, 10) },
    title: { fontSize: s(34, 28, 42), fontWeight: '900', color: '#102a43' },
    subtitle: { marginTop: s(8, 6, 10), fontSize: s(15, 13, 18), color: '#486581', lineHeight: s(22, 19, 26) },
    progressRow: { flexDirection: 'row', gap: s(8, 6, 10), marginBottom: s(4, 4, 6) },
    progressDot: { flex: 1, height: 6, borderRadius: 999, backgroundColor: '#d7e3f2' },
    progressDotActive: { backgroundColor: '#0066ff' },
    card: {
      backgroundColor: '#fff',
      borderRadius: s(22, 18, 28),
      borderWidth: 1,
      borderColor: '#e2e8f0',
      padding: s(16, 12, 22),
      shadowColor: '#0f172a',
      shadowOpacity: 0.05,
      shadowRadius: 14,
      shadowOffset: { width: 0, height: 4 },
      elevation: 3,
    },
    cardTitle: { fontSize: s(22, 18, 28), fontWeight: '900', color: '#0a2540' },
    cardSub: {
      marginTop: s(6, 4, 8),
      marginBottom: s(14, 10, 16),
      color: '#475569',
      fontSize: s(13, 11, 16),
      lineHeight: s(19, 17, 23),
    },
    permHeaderRow: {
      flexDirection: 'row',
      alignItems: 'center',
      gap: s(12, 10, 14),
      marginBottom: s(14, 10, 18),
    },
    permIconBadge: {
      width: s(52, 44, 60),
      height: s(52, 44, 60),
      borderRadius: s(16, 14, 18),
      backgroundColor: '#fff1f2',
      alignItems: 'center',
      justifyContent: 'center',
      borderWidth: 1,
      borderColor: '#fecdd3',
    },
    permItem: {
      borderRadius: s(16, 14, 20),
      borderWidth: 1,
      borderColor: '#e2e8f0',
      padding: s(14, 11, 16),
      marginBottom: s(10, 8, 12),
      backgroundColor: '#f8fafc',
    },
    permItemTop: {
      flexDirection: 'row',
      alignItems: 'flex-start',
      gap: s(10, 8, 12),
    },
    permSmallIcon: {
      width: s(36, 32, 40),
      height: s(36, 32, 40),
      borderRadius: s(10, 8, 12),
      alignItems: 'center',
      justifyContent: 'center',
      marginTop: 2,
    },
    permItemTitle: {
      fontSize: s(14, 12, 16),
      fontWeight: '800',
      color: '#0a2540',
    },
    permItemDesc: {
      marginTop: 3,
      fontSize: s(12, 10, 14),
      color: '#64748b',
      lineHeight: s(17, 15, 20),
    },
    permActionBtn: {
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'center',
      gap: 6,
      borderRadius: s(10, 8, 12),
      paddingVertical: s(9, 7, 11),
      paddingHorizontal: s(12, 10, 14),
      marginTop: s(10, 8, 12),
    },
    permActionBtnText: {
      color: '#ffffff',
      fontSize: s(12, 11, 14),
      fontWeight: '800',
    },
    optionRow: {
      minHeight: s(50, 44, 58),
      borderRadius: s(14, 12, 18),
      borderWidth: 1,
      borderColor: '#e2e8f0',
      paddingHorizontal: s(14, 12, 18),
      flexDirection: 'row',
      alignItems: 'center',
      gap: s(10, 8, 12),
      marginBottom: s(10, 8, 12),
      backgroundColor: '#f8fafc',
    },
    optionRowActive: { borderColor: '#0066ff', backgroundColor: '#eff6ff' },
    optionText: { color: '#0a2540', fontSize: s(16, 14, 20), fontWeight: '700' },
    optionTextActive: { color: '#0066ff', fontWeight: '900' },
    bottomRow: {
      flexDirection: 'row',
      justifyContent: 'space-between',
      gap: s(10, 8, 12),
      marginTop: s(4, 4, 8),
    },
    primaryBtn: {
      backgroundColor: '#0066ff',
      minHeight: s(50, 44, 58),
      borderRadius: s(14, 12, 18),
      alignItems: 'center',
      justifyContent: 'center',
      paddingHorizontal: s(20, 16, 26),
      flex: 1,
      shadowColor: '#0066ff',
      shadowOpacity: 0.25,
      shadowRadius: 12,
      shadowOffset: { width: 0, height: 4 },
      elevation: 4,
    },
    primaryBtnText: { color: '#fff', fontSize: s(15, 13, 18), fontWeight: '800' },
    secondaryBtn: {
      backgroundColor: '#ffffff',
      minHeight: s(50, 44, 58),
      borderRadius: s(14, 12, 18),
      borderWidth: 1,
      borderColor: '#e2e8f0',
      alignItems: 'center',
      justifyContent: 'center',
      paddingHorizontal: s(20, 16, 26),
      flex: 1,
    },
    secondaryBtnText: { color: '#284b72', fontSize: s(15, 13, 18), fontWeight: '700' },
    disabledBtn: { opacity: 0.5 },
  });
};
