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

export default function ProfileScreen({ onBack, preferences }) {
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

  return (
    <SafeAreaView style={[styles.screen, { backgroundColor: colors.background }]}>
      <LinearGradient
        colors={isDark ? ['#14213d', '#1d4ed8', '#0f766e'] : ['#0f6dff', '#0d6efd', '#22b8cf']}
        style={styles.topHero}
      >
        <View style={styles.topRow}>
          <TouchableOpacity style={styles.backBtn} onPress={onBack}>
            <Ionicons name="arrow-back" size={22} color="#fff" />
          </TouchableOpacity>
          <Text style={[styles.topTitle, arBold]}>{t('profile.title')}</Text>
          <View style={styles.backBtn} />
        </View>

        <View style={styles.avatarWrap}>
          <View style={styles.avatarCircle}>
            <Ionicons name="person" size={46} color="#ffffff" />
          </View>
          <Text style={[styles.nameText, arBold]}>{displayName}</Text>
          <Text style={[styles.modeText, arRegular]}>{accountMode}</Text>
        </View>
      </LinearGradient>

      <ScrollView contentContainerStyle={styles.content} showsVerticalScrollIndicator={false}>
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
      </ScrollView>
    </SafeAreaView>
  );
}

const createStyles = (width) => {
  const s = createScaler(width);
  return StyleSheet.create({
    screen: { flex: 1 },
    topHero: {
      borderBottomLeftRadius: s(34, 28, 44),
      borderBottomRightRadius: s(34, 28, 44),
      paddingTop: s(12, 10, 16),
      paddingHorizontal: s(16, 14, 22),
      paddingBottom: s(22, 18, 28),
    },
    topRow: {
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'space-between',
    },
    backBtn: {
      width: s(44, 38, 50),
      height: s(44, 38, 50),
      borderRadius: s(14, 12, 18),
      alignItems: 'center',
      justifyContent: 'center',
      backgroundColor: 'rgba(255,255,255,0.2)',
      borderWidth: 1,
      borderColor: 'rgba(255,255,255,0.52)',
    },
    topTitle: {
      color: '#fff',
      fontSize: s(24, 20, 30),
      fontWeight: '900',
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
  });
};
