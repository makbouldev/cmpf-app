import { useMemo, useState } from 'react';
import {
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
    if (step < 1) {
      setStep((prev) => prev + 1);
      return;
    }
    completeSetup();
  };

  const goBack = () => {
    if (step > 0) setStep((prev) => prev - 1);
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
          {[0, 1].map((index) => (
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

        <View style={styles.bottomRow}>
          <TouchableOpacity
            style={[styles.secondaryBtn, { backgroundColor: colors.surface, borderColor: colors.border }, step === 0 && styles.disabledBtn]}
            disabled={step === 0}
            onPress={goBack}
          >
            <Text style={[styles.secondaryBtnText, arRegular, { color: colors.textSecondary }]}>{t('common.back')}</Text>
          </TouchableOpacity>

          <TouchableOpacity style={[styles.primaryBtn, { backgroundColor: colors.primary }]} onPress={goNext}>
            <Text style={[styles.primaryBtnText, arBold]}>{step < 1 ? t('common.next') : t('common.finish')}</Text>
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
    progressDotActive: { backgroundColor: '#0d6efd' },
    card: {
      backgroundColor: '#fff',
      borderRadius: s(22, 18, 28),
      borderWidth: 1,
      borderColor: '#d9e4f2',
      padding: s(16, 12, 22),
    },
    cardTitle: { fontSize: s(24, 20, 30), fontWeight: '900', color: '#102a43' },
    cardSub: {
      marginTop: s(8, 6, 10),
      marginBottom: s(14, 10, 16),
      color: '#486581',
      fontSize: s(14, 12, 17),
      lineHeight: s(20, 18, 24),
    },
    optionRow: {
      minHeight: s(50, 44, 58),
      borderRadius: s(14, 12, 18),
      borderWidth: 1,
      borderColor: '#d8e5f5',
      paddingHorizontal: s(14, 12, 18),
      flexDirection: 'row',
      alignItems: 'center',
      gap: s(10, 8, 12),
      marginBottom: s(10, 8, 12),
      backgroundColor: '#f8fbff',
    },
    optionRowActive: { borderColor: '#0d6efd', backgroundColor: '#eef5ff' },
    optionText: { color: '#284b72', fontSize: s(16, 14, 20), fontWeight: '700' },
    optionTextActive: { color: '#0d6efd', fontWeight: '900' },
    bottomRow: {
      flexDirection: 'row',
      justifyContent: 'space-between',
      gap: s(10, 8, 12),
      marginTop: s(4, 4, 8),
    },
    primaryBtn: {
      backgroundColor: '#0d6efd',
      minHeight: s(50, 44, 58),
      borderRadius: s(14, 12, 18),
      alignItems: 'center',
      justifyContent: 'center',
      paddingHorizontal: s(20, 16, 26),
      flex: 1,
    },
    primaryBtnText: { color: '#fff', fontSize: s(15, 13, 18), fontWeight: '800' },
    secondaryBtn: {
      backgroundColor: '#ffffff',
      minHeight: s(50, 44, 58),
      borderRadius: s(14, 12, 18),
      borderWidth: 1,
      borderColor: '#d7e3f2',
      alignItems: 'center',
      justifyContent: 'center',
      paddingHorizontal: s(20, 16, 26),
      flex: 1,
    },
    secondaryBtnText: { color: '#284b72', fontSize: s(15, 13, 18), fontWeight: '700' },
    disabledBtn: { opacity: 0.5 },
  });
};
