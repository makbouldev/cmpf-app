import { useMemo } from 'react';
import { LinearGradient } from 'expo-linear-gradient';
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
    <View style={[styles.infoRow, { backgroundColor: colors.surfaceAlt, borderColor: colors.border }]}>
      <View style={[styles.infoIconWrap, { backgroundColor: 'rgba(59,130,246,0.14)' }]}>
        <Ionicons name={icon} size={18} color={colors.primary} />
      </View>
      <View style={{ flex: 1 }}>
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
            <Text style={[styles.topTitle, arBold, { color: colors.textPrimary }]}>{t('profile.title')}</Text>
          </View>
          <View style={styles.placeholderBtn} />
        </View>
      </View>

      <ScrollView contentContainerStyle={styles.content} showsVerticalScrollIndicator={false}>
        <LinearGradient
          colors={isDark ? ['#14213d', '#1d4ed8'] : ['#0a2540', '#0066ff']}
          style={styles.profileHero}
        >
          <View style={styles.avatarWrap}>
            <View style={styles.avatarCircle}>
              <Ionicons name="person" size={46} color="#ffffff" />
            </View>
            <Text style={[styles.nameText, arBold]}>{displayName}</Text>
            <Text style={[styles.modeText, arRegular]}>{accountMode}</Text>
          </View>
        </LinearGradient>

        <View style={[styles.card, { backgroundColor: colors.surface, borderColor: colors.border }]}>
          <Text style={[styles.cardTitle, arBold, { color: colors.textPrimary }]}>{t('profile.personalInfo')}</Text>
          <Text style={[styles.cardSub, arRegular, { color: colors.textSecondary }]}>{t('profile.personalInfoSub')}</Text>

          <InfoRow
            icon="call-outline"
            label={t('profile.phone')}
            value={displayPhone}
            styles={styles}
            colors={colors}
            arRegular={arRegular}
            arBold={arBold}
          />
          <InfoRow
            icon="calendar-outline"
            label={t('profile.age')}
            value={displayAge}
            styles={styles}
            colors={colors}
            arRegular={arRegular}
            arBold={arBold}
          />
          <InfoRow
            icon="transgender-outline"
            label={t('profile.gender')}
            value={displayGender}
            styles={styles}
            colors={colors}
            arRegular={arRegular}
            arBold={arBold}
          />
        </View>

        {isGuest ? (
          <View style={[styles.card, { marginTop: styles.s16 || 16, backgroundColor: colors.surface, borderColor: colors.border }]}>
            <Text style={[styles.cardTitle, arBold, { color: colors.textPrimary }]}>{t('profile.authRequiredTitle') || 'Connexion'}</Text>
            <Text style={[styles.cardSub, arRegular, { color: colors.textSecondary }]}>{t('profile.authRequiredSub') || 'Connectez-vous pour voir votre profil'}</Text>
            
            <TouchableOpacity 
              style={[styles.primaryBtn, { backgroundColor: colors.primary }]} 
              onPress={() => onNavigate('login')}
            >
              <Text style={[styles.primaryBtnText, arBold]}>{t('onboarding.signIn')}</Text>
            </TouchableOpacity>
            
            <TouchableOpacity 
              style={[styles.secondaryBtn, { backgroundColor: colors.surface, borderColor: colors.border }]} 
              onPress={() => onNavigate('signup')}
            >
              <Text style={[styles.secondaryBtnText, arRegular, { color: colors.textPrimary }]}>{t('onboarding.signUp')}</Text>
            </TouchableOpacity>
          </View>
        ) : (
          <TouchableOpacity 
            style={[styles.logoutBtn, { borderColor: '#ef4444' }]} 
            onPress={handleLogout}
          >
            <Ionicons name="log-out-outline" size={20} color="#ef4444" style={{ marginRight: 8 }} />
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
    profileHero: {
      borderRadius: s(24, 20, 28),
      paddingVertical: s(24, 20, 30),
      paddingHorizontal: s(16, 14, 22),
      alignItems: 'center',
      justifyContent: 'center',
      marginBottom: s(14, 12, 18),
      shadowColor: '#0a2540',
      shadowOpacity: 0.15,
      shadowRadius: 16,
      shadowOffset: { width: 0, height: 6 },
      elevation: 4,
    },
    avatarWrap: {
      marginTop: s(18, 14, 24),
      alignItems: 'center',
      justifyContent: 'center',
    },
    avatarCircle: {
      width: s(92, 76, 110),
      height: s(92, 76, 110),
      borderRadius: 999,
      alignItems: 'center',
      justifyContent: 'center',
      backgroundColor: 'rgba(255,255,255,0.24)',
      borderWidth: 2,
      borderColor: 'rgba(255,255,255,0.54)',
    },
    nameText: {
      marginTop: s(10, 8, 14),
      color: '#fff',
      fontSize: s(24, 20, 30),
      fontWeight: '900',
      textAlign: 'center',
    },
    modeText: {
      marginTop: s(4, 4, 8),
      color: 'rgba(255,255,255,0.92)',
      fontSize: s(13, 11, 16),
      fontWeight: '700',
      textAlign: 'center',
    },
    content: {
      paddingHorizontal: s(16, 14, 22),
      paddingTop: s(16, 14, 22),
      paddingBottom: s(28, 22, 34),
    },
    card: {
      borderRadius: s(24, 20, 30),
      borderWidth: 1,
      padding: s(16, 14, 22),
    },
    cardTitle: {
      fontSize: s(22, 19, 28),
      fontWeight: '900',
    },
    cardSub: {
      marginTop: s(6, 6, 10),
      marginBottom: s(14, 10, 16),
      fontSize: s(13, 11, 16),
      lineHeight: s(20, 17, 23),
    },
    infoRow: {
      minHeight: s(64, 56, 74),
      borderRadius: s(16, 14, 20),
      borderWidth: 1,
      paddingHorizontal: s(12, 10, 16),
      marginBottom: s(10, 8, 12),
      flexDirection: 'row',
      alignItems: 'center',
      gap: s(10, 8, 12),
    },
    infoIconWrap: {
      width: s(38, 34, 44),
      height: s(38, 34, 44),
      borderRadius: 999,
      alignItems: 'center',
      justifyContent: 'center',
    },
    infoLabel: {
      fontSize: s(12, 10, 14),
      fontWeight: '700',
    },
    infoValue: {
      marginTop: s(3, 2, 5),
      fontSize: s(16, 14, 20),
      fontWeight: '800',
    },
    s16: s(16, 14, 20),
    primaryBtn: {
      height: s(50, 44, 58),
      borderRadius: s(14, 12, 18),
      alignItems: 'center',
      justifyContent: 'center',
      marginTop: s(10, 8, 14),
    },
    primaryBtnText: { color: '#fff', fontSize: s(16, 14, 18), fontWeight: '800' },
    secondaryBtn: {
      height: s(50, 44, 58),
      borderRadius: s(14, 12, 18),
      borderWidth: 1,
      alignItems: 'center',
      justifyContent: 'center',
      marginTop: s(10, 8, 14),
    },
    secondaryBtnText: { fontSize: s(16, 14, 18), fontWeight: '700' },
    logoutBtn: {
      flexDirection: 'row',
      height: s(54, 48, 62),
      borderRadius: s(16, 14, 20),
      borderWidth: 1,
      alignItems: 'center',
      justifyContent: 'center',
      marginTop: s(24, 20, 30),
      backgroundColor: '#fef2f2',
    },
    logoutText: { color: '#ef4444', fontSize: s(16, 14, 18), fontWeight: '800' },
  });
};
