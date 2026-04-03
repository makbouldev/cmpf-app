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

function InfoRow({ icon, label, value, styles, colors, arRegular, arBold }) {
  return (
    <View style={[styles.infoRow, { borderColor: colors.border }]}>
      <Ionicons name={icon} size={18} color="#6b7280" />
      <View style={styles.infoTextWrap}>
        <Text style={[styles.infoLabel, arRegular, { color: colors.textSecondary }]}>{label}</Text>
        <Text style={[styles.infoValue, arBold, { color: colors.textPrimary }]}>{value}</Text>
      </View>
    </View>
  );
}

export default function ProfileScreen({ onNavigate, onBack, preferences, onUpdatePreferences }) {
  const { width } = useWindowDimensions();
  const styles = useMemo(() => createStyles(width), [width]);
  const { t, language } = useI18n();
  const { colors, mode } = useAppTheme();
  const isDark = mode === 'dark';
  const arRegular = language === 'ar' ? { fontFamily: 'Cairo_400Regular' } : null;
  const arBold = language === 'ar' ? { fontFamily: 'Cairo_700Bold' } : null;

  const isGuest = preferences?.account?.mode === 'skip' || !preferences?.account?.token;
  const user = preferences?.account?.user || null;

  const fallbackName = t('profile.notSet');
  const fallbackValue = t('profile.notProvided');
  const displayName = user?.name || fallbackName;
  const displayPhone = user?.phone || preferences?.account?.phone || fallbackValue;
  const displayAge = user?.age ? String(user.age) : fallbackValue;
  const displayGender =
    user?.gender === 'male'
      ? t('profile.male')
      : user?.gender === 'female'
        ? t('profile.female')
        : fallbackValue;
  const accountMode = isGuest ? t('profile.modeGuest') : t('profile.modeAccount');

  const handleLogout = async () => {
    if (onUpdatePreferences) {
      await onUpdatePreferences({
        account: { ...preferences?.account, mode: 'skip', token: '', user: null },
      });
    }
  };

  return (
    <SafeAreaView style={[styles.screen, { backgroundColor: colors.background }]}>
      <View style={[styles.header, isDark && { backgroundColor: colors.surface, borderBottomColor: colors.border }]}>
        <TouchableOpacity style={[styles.backBtn, isDark && { backgroundColor: colors.surfaceAlt }]} onPress={onBack} activeOpacity={0.8}>
          <Ionicons name="chevron-back" size={20} color={colors.textPrimary} />
        </TouchableOpacity>
        <Text style={[styles.headerTitle, arBold, { color: colors.textPrimary }]}>{t('profile.title')}</Text>
        <View style={styles.headerPlaceholder} />
      </View>

      <ScrollView contentContainerStyle={styles.content} showsVerticalScrollIndicator={false}>
        <View style={styles.avatarSection}>
          <View style={[styles.avatarCircle, isDark && { backgroundColor: colors.surfaceAlt, borderColor: colors.border }]}>
            <Ionicons name="person" size={36} color={isDark ? colors.textSecondary : '#9ca3af'} />
          </View>
          <Text style={[styles.nameText, arBold, { color: colors.textPrimary }]}>{displayName}</Text>
          <Text style={[styles.modeText, arRegular, { color: colors.textSecondary }]}>{accountMode}</Text>
        </View>

        <Text style={[styles.sectionLabel, arBold, { color: colors.textSecondary }]}>{t('profile.personalInfo')}</Text>
        <View style={[styles.card, { backgroundColor: colors.surface, borderColor: colors.border }]}>
          <InfoRow icon="call-outline" label={t('profile.phone')} value={displayPhone} styles={styles} colors={colors} arRegular={arRegular} arBold={arBold} />
          <View style={[styles.divider, { backgroundColor: colors.border }]} />
          <InfoRow icon="calendar-outline" label={t('profile.age')} value={displayAge} styles={styles} colors={colors} arRegular={arRegular} arBold={arBold} />
          <View style={[styles.divider, { backgroundColor: colors.border }]} />
          <InfoRow icon="transgender-outline" label={t('profile.gender')} value={displayGender} styles={styles} colors={colors} arRegular={arRegular} arBold={arBold} />
        </View>

        {isGuest ? (
          <View style={styles.authSection}>
            <TouchableOpacity style={[styles.primaryBtn, { backgroundColor: '#2563eb' }]} onPress={() => onNavigate('login')}>
              <Text style={[styles.primaryBtnText, arBold]}>{t('onboarding.signIn')}</Text>
            </TouchableOpacity>
            <TouchableOpacity style={[styles.outlineBtn, { borderColor: colors.border }]} onPress={() => onNavigate('signup')}>
              <Text style={[styles.outlineBtnText, arRegular, { color: colors.textPrimary }]}>{t('onboarding.signUp')}</Text>
            </TouchableOpacity>
          </View>
        ) : (
          <TouchableOpacity style={styles.logoutBtn} onPress={handleLogout}>
            <Ionicons name="log-out-outline" size={18} color="#dc2626" />
            <Text style={[styles.logoutText, arBold]}>Déconnexion</Text>
          </TouchableOpacity>
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
      paddingTop: s(24, 20, 30),
      paddingBottom: s(32, 24, 40),
    },
    avatarSection: {
      alignItems: 'center',
      marginBottom: s(24, 20, 30),
    },
    avatarCircle: {
      width: s(80, 68, 92),
      height: s(80, 68, 92),
      borderRadius: 999,
      alignItems: 'center',
      justifyContent: 'center',
      backgroundColor: '#f3f4f6',
      borderWidth: 1,
      borderColor: '#e5e7eb',
    },
    nameText: {
      marginTop: s(12, 10, 16),
      color: '#111827',
      fontSize: s(22, 18, 26),
      fontWeight: '700',
      textAlign: 'center',
    },
    modeText: {
      marginTop: s(4, 3, 6),
      color: '#6b7280',
      fontSize: s(14, 12, 16),
      textAlign: 'center',
    },
    sectionLabel: {
      fontSize: s(12, 11, 13),
      fontWeight: '600',
      textTransform: 'uppercase',
      letterSpacing: 0.5,
      marginBottom: s(8, 6, 10),
      marginLeft: s(4, 2, 6),
    },
    card: {
      borderRadius: 16,
      borderWidth: 1,
      overflow: 'hidden',
    },
    infoRow: {
      flexDirection: 'row',
      alignItems: 'center',
      paddingHorizontal: s(16, 14, 20),
      paddingVertical: s(14, 12, 16),
      gap: s(12, 10, 14),
    },
    infoTextWrap: {
      flex: 1,
    },
    infoLabel: {
      fontSize: s(12, 11, 13),
      fontWeight: '500',
    },
    infoValue: {
      marginTop: 2,
      fontSize: s(15, 13, 17),
      fontWeight: '600',
    },
    divider: {
      height: 1,
      marginLeft: s(46, 40, 52),
    },
    authSection: {
      marginTop: s(24, 20, 30),
      gap: s(10, 8, 12),
    },
    primaryBtn: {
      height: 48,
      borderRadius: 12,
      alignItems: 'center',
      justifyContent: 'center',
    },
    primaryBtnText: { color: '#fff', fontSize: s(15, 14, 17), fontWeight: '700' },
    outlineBtn: {
      height: 48,
      borderRadius: 12,
      borderWidth: 1,
      alignItems: 'center',
      justifyContent: 'center',
    },
    outlineBtnText: { fontSize: s(15, 14, 17), fontWeight: '600' },
    logoutBtn: {
      flexDirection: 'row',
      height: 48,
      borderRadius: 12,
      alignItems: 'center',
      justifyContent: 'center',
      marginTop: s(24, 20, 30),
      backgroundColor: '#fef2f2',
      gap: s(8, 6, 10),
    },
    logoutText: { color: '#dc2626', fontSize: s(15, 14, 17), fontWeight: '700' },
  });
};
