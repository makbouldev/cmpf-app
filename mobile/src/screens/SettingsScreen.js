import { useMemo } from 'react';
import { Ionicons } from '@expo/vector-icons';
import {
  SafeAreaView,
  ScrollView,
  StyleSheet,
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
  const arRegular = language === 'ar' ? { fontFamily: 'Cairo_400Regular' } : null;
  const arBold = language === 'ar' ? { fontFamily: 'Cairo_700Bold' } : null;

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
      <View style={[styles.topBar, { backgroundColor: colors.surface, borderColor: colors.border }]}>
        <TouchableOpacity style={[styles.backBtn, { backgroundColor: colors.surfaceAlt, borderColor: colors.border }]} onPress={onBack}>
          <Ionicons name="arrow-back" size={20} color={colors.textPrimary} />
        </TouchableOpacity>
        <Text style={[styles.topTitle, arBold, { color: colors.textPrimary }]}>{t('settings.title')}</Text>
        <View style={styles.backBtn} />
      </View>

      <ScrollView contentContainerStyle={styles.content} showsVerticalScrollIndicator={false}>
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
    topBar: {
      minHeight: s(72, 62, 86),
      borderBottomWidth: 1,
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'space-between',
      paddingHorizontal: s(16, 12, 22),
    },
    backBtn: {
      width: s(42, 36, 50),
      height: s(42, 36, 50),
      borderRadius: s(12, 10, 16),
      borderWidth: 1,
      alignItems: 'center',
      justifyContent: 'center',
    },
    topTitle: {
      fontSize: s(24, 20, 30),
      fontWeight: '900',
    },
    content: {
      paddingHorizontal: s(16, 12, 22),
      paddingVertical: s(14, 12, 20),
      gap: s(12, 10, 16),
    },
    card: {
      borderRadius: s(20, 16, 24),
      borderWidth: 1,
      padding: s(14, 12, 18),
    },
    cardTitle: {
      fontSize: s(20, 17, 25),
      fontWeight: '900',
    },
    cardSub: {
      marginTop: s(6, 5, 8),
      marginBottom: s(12, 10, 14),
      fontSize: s(13, 11, 16),
      lineHeight: s(19, 17, 22),
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
