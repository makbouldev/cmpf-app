import { useMemo } from 'react';
import { Image, SafeAreaView, ScrollView, StyleSheet, Text, TouchableOpacity, View, useWindowDimensions } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { Ionicons } from '@expo/vector-icons';
import { useI18n } from '../i18n/I18nContext';
import { useAppTheme } from '../theme/ThemeContext';
import { createScaler } from '../utils/responsive';

const logo = require('../../assets/CMPFLOGO.png');

const STATS = [
  { key: 'experience', value: '75+', icon: 'ribbon-outline' },
  { key: 'availability', value: '24/7', icon: 'time-outline' },
  { key: 'support', value: 'SOS', icon: 'shield-checkmark-outline' },
];

export default function AboutScreen({ onBack }) {
  const { width } = useWindowDimensions();
  const styles = useMemo(() => createStyles(width), [width]);
  const { language } = useI18n();
  const { colors, mode } = useAppTheme();
  const isDark = mode === 'dark';
  const isArabic = language === 'ar';
  const arRegular = isArabic ? { fontFamily: 'Cairo_400Regular' } : null;
  const arBold = isArabic ? { fontFamily: 'Cairo_700Bold' } : null;

  const txt = isArabic
    ? {
        title: '\u0645\u0646 \u0646\u062d\u0646',
        heroTitle: 'CMPF',
        heroSub: '\u0631\u064a\u0627\u062f\u0629 \u0641\u064a \u062e\u062f\u0645\u0627\u062a \u0627\u0644\u0625\u0633\u0639\u0627\u0641 \u0648\u0627\u0644\u0645\u0648\u0627\u0643\u0628\u0629 \u0627\u0644\u0637\u0628\u064a\u0629.',
        storyTitle: '\u0642\u0635\u0629 CMPF',
        storyText:
          'CMPF \u0634\u0631\u0643\u0629 \u0631\u0627\u0626\u062f\u0629 \u0641\u064a \u062e\u062f\u0645\u0627\u062a \u0627\u0644\u0625\u0633\u0639\u0627\u0641 \u0648\u0627\u0644\u0631\u0639\u0627\u064a\u0629 \u0627\u0644\u0637\u0628\u064a\u0629 \u0628\u062e\u0628\u0631\u0629 \u062a\u062a\u062c\u0627\u0648\u0632 75 \u0633\u0646\u0629. \u0646\u0639\u0645\u0644 \u0639\u0644\u0649 \u062a\u0642\u062f\u064a\u0645 \u0627\u0633\u062a\u062c\u0627\u0628\u0629 \u0633\u0631\u064a\u0639\u0629\u060c \u0645\u0631\u0627\u0641\u0642\u0629 \u0622\u0645\u0646\u0629\u060c \u0648\u062d\u0644\u0648\u0644 \u0637\u0628\u064a\u0629 \u0639\u0635\u0631\u064a\u0629 \u062a\u0648\u0627\u0643\u0628 \u0627\u062d\u062a\u064a\u0627\u062c\u0627\u062a \u0627\u0644\u0623\u0641\u0631\u0627\u062f \u0648\u0627\u0644\u0639\u0627\u0626\u0644\u0627\u062a \u0648\u0627\u0644\u0645\u0624\u0633\u0633\u0627\u062a.',
        missionTitle: '\u0631\u0624\u064a\u062a\u0646\u0627 \u0648\u0645\u0647\u0645\u062a\u0646\u0627',
        missionText:
          '\u0646\u0624\u0645\u0646 \u0623\u0646 \u0627\u0644\u062e\u062f\u0645\u0629 \u0627\u0644\u0635\u062d\u064a\u0629 \u0627\u0644\u0645\u062d\u062a\u0631\u0641\u0629 \u062a\u062c\u0645\u0639 \u0628\u064a\u0646 \u0627\u0644\u0633\u0631\u0639\u0629\u060c \u0627\u0644\u0625\u0646\u0633\u0627\u0646\u064a\u0629\u060c \u0648\u0627\u0644\u062b\u0642\u0629. \u0644\u0647\u0630\u0627 \u0646\u0628\u0646\u064a \u062a\u062c\u0631\u0628\u0629 \u062a\u0633\u0647\u0644 \u0637\u0644\u0628 \u0627\u0644\u0625\u0633\u0639\u0627\u0641\u060c \u0627\u0644\u0637\u0628\u064a\u0628 \u0627\u0644\u0645\u0646\u0632\u0644\u064a\u060c \u062a\u062a\u0628\u0639 \u0627\u0644\u062f\u0648\u0627\u0621\u060c \u0648\u0627\u0644\u0648\u0635\u0648\u0644 \u0625\u0644\u0649 \u0627\u0644\u062e\u062f\u0645\u0627\u062a \u0627\u0644\u0642\u0631\u064a\u0628\u0629 \u0628\u0633\u0647\u0648\u0644\u0629.',
        points: [
          '\u0641\u0631\u0642 \u0645\u062f\u0631\u0628\u0629 \u0648\u0627\u0633\u062a\u062c\u0627\u0628\u0629 \u0633\u0631\u064a\u0639\u0629',
          '\u062a\u0646\u0638\u064a\u0645 \u0645\u062d\u062a\u0631\u0641 \u0644\u0644\u0646\u0642\u0644 \u0648\u0627\u0644\u0631\u0639\u0627\u064a\u0629',
          '\u062a\u062c\u0631\u0628\u0629 \u0631\u0642\u0645\u064a\u0629 \u0633\u0647\u0644\u0629 \u0648\u0648\u0627\u0636\u062d\u0629',
        ],
        statLabels: {
          experience: '\u0633\u0646\u0629 \u062e\u0628\u0631\u0629',
          availability: '\u062c\u0627\u0647\u0632\u064a\u0629 \u0645\u0633\u062a\u0645\u0631\u0629',
          support: '\u062f\u0639\u0645 \u0627\u0633\u062a\u0639\u062c\u0627\u0644\u064a',
        },
      }
    : language === 'en'
      ? {
          title: 'About Us',
          heroTitle: 'CMPF',
          heroSub: 'Trusted ambulance and medical support services with a long-standing legacy.',
          storyTitle: 'Who We Are',
          storyText:
            'CMPF is a healthcare services company with more than 75 years of experience in ambulance operations, patient transport, and emergency assistance. We combine field expertise with modern tools to deliver fast, dependable, and human-centered care.',
          missionTitle: 'Our Mission',
          missionText:
            'Our mission is to make emergency and support healthcare services easier to access, more reliable, and more reassuring for every patient, family, and partner we serve.',
          points: [
            'Experienced teams and dependable response',
            'Professional ambulance and patient transfer services',
            'A modern digital experience built around care',
          ],
          statLabels: {
            experience: 'Years of experience',
            availability: 'Availability',
            support: 'Emergency support',
          },
        }
      : {
          title: 'Qui Sommes-Nous',
          heroTitle: 'CMPF',
          heroSub: "Un acteur de confiance dans les services d'ambulance et l'accompagnement medical.",
          storyTitle: 'Notre Histoire',
          storyText:
            "CMPF est une entreprise specialisee dans les services d'ambulance avec plus de 75 ans d'experience. Nous mettons au service des patients une organisation solide, une reponse rapide et une vision moderne de l'accompagnement medical.",
          missionTitle: 'Notre Mission',
          missionText:
            "Nous voulons offrir une prise en charge plus simple, plus rassurante et plus proche des besoins reels des patients, grace a des services fiables, humains et disponibles.",
          points: [
            'Equipes experimentees et intervention rapide',
            'Transport sanitaire organise avec professionnalisme',
            'Experience digitale claire et accessible',
          ],
          statLabels: {
            experience: "Annees d'experience",
            availability: 'Disponibilite',
            support: "Assistance d'urgence",
          },
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
            <Text style={[styles.topTitle, arBold, { color: colors.textPrimary }]}>{txt.title}</Text>
          </View>
          <View style={styles.placeholderBtn} />
        </View>
      </View>

      <ScrollView contentContainerStyle={styles.content} showsVerticalScrollIndicator={false}>
        <LinearGradient
          colors={isDark ? ['#16223d', '#1d4ed8', '#0f766e'] : ['#f8fbff', '#eef5ff', '#fff4ec']}
          style={[styles.heroCard, { borderColor: colors.border }]}
        >
          <View style={styles.heroLogoWrap}>
            <Image source={logo} style={styles.heroLogo} resizeMode="contain" />
          </View>

          <Text style={[styles.heroName, arBold, { color: colors.textPrimary }]}>{txt.heroTitle}</Text>
          <Text style={[styles.heroSub, arRegular, { color: colors.textSecondary }]}>{txt.heroSub}</Text>

          <View style={styles.statsRow}>
            {STATS.map((item) => (
              <View key={item.key} style={[styles.statCard, { backgroundColor: colors.surface, borderColor: colors.border }]}>
                <Ionicons name={item.icon} size={18} color={colors.primary} />
                <Text style={[styles.statValue, arBold, { color: colors.textPrimary }]}>{item.value}</Text>
                <Text style={[styles.statLabel, arRegular, { color: colors.textSecondary }]}>{txt.statLabels[item.key]}</Text>
              </View>
            ))}
          </View>
        </LinearGradient>

        <View style={[styles.sectionCard, { backgroundColor: colors.surface, borderColor: colors.border }]}>
          <Text style={[styles.sectionTitle, arBold, { color: colors.textPrimary }]}>{txt.storyTitle}</Text>
          <Text style={[styles.sectionText, arRegular, { color: colors.textSecondary }]}>{txt.storyText}</Text>
        </View>

        <View style={[styles.sectionCard, { backgroundColor: colors.surface, borderColor: colors.border }]}>
          <Text style={[styles.sectionTitle, arBold, { color: colors.textPrimary }]}>{txt.missionTitle}</Text>
          <Text style={[styles.sectionText, arRegular, { color: colors.textSecondary }]}>{txt.missionText}</Text>

          <View style={styles.pointsWrap}>
            {txt.points.map((point) => (
              <View key={point} style={[styles.pointRow, { backgroundColor: colors.surfaceAlt, borderColor: colors.border }]}>
                <View style={[styles.pointIcon, { backgroundColor: 'rgba(13,110,253,0.12)' }]}>
                  <Ionicons name="checkmark" size={16} color={colors.primary} />
                </View>
                <Text style={[styles.pointText, arRegular, { color: colors.textPrimary }]}>{point}</Text>
              </View>
            ))}
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
      paddingVertical: s(14, 12, 22),
      gap: s(14, 12, 18),
    },
    heroCard: {
      borderRadius: s(28, 22, 34),
      borderWidth: 1,
      padding: s(16, 14, 22),
      overflow: 'hidden',
    },
    heroLogoWrap: {
      alignItems: 'center',
      marginTop: s(8, 6, 12),
    },
    heroLogo: {
      width: s(110, 90, 132),
      height: s(110, 90, 132),
    },
    topTitle: {
      marginTop: s(10, 8, 12),
      fontSize: s(16, 14, 20),
      textAlign: 'center',
      fontWeight: '800',
    },
    heroName: {
      marginTop: s(4, 4, 8),
      fontSize: s(34, 28, 42),
      textAlign: 'center',
      fontWeight: '900',
      letterSpacing: 1,
    },
    heroSub: {
      marginTop: s(8, 6, 10),
      fontSize: s(14, 12, 17),
      textAlign: 'center',
      lineHeight: s(22, 18, 26),
    },
    statsRow: {
      marginTop: s(18, 14, 22),
      flexDirection: 'row',
      gap: s(10, 8, 12),
    },
    statCard: {
      flex: 1,
      borderRadius: s(18, 16, 22),
      borderWidth: 1,
      paddingVertical: s(12, 10, 16),
      paddingHorizontal: s(10, 8, 12),
      alignItems: 'center',
      gap: s(6, 4, 8),
    },
    statValue: {
      fontSize: s(22, 18, 28),
      fontWeight: '900',
    },
    statLabel: {
      textAlign: 'center',
      fontSize: s(12, 10, 14),
      lineHeight: s(18, 16, 20),
      fontWeight: '700',
    },
    sectionCard: {
      borderRadius: s(24, 20, 30),
      borderWidth: 1,
      padding: s(16, 14, 22),
    },
    sectionTitle: {
      fontSize: s(24, 20, 30),
      fontWeight: '900',
    },
    sectionText: {
      marginTop: s(10, 8, 12),
      fontSize: s(14, 12, 17),
      lineHeight: s(24, 20, 28),
    },
    pointsWrap: {
      marginTop: s(14, 12, 18),
      gap: s(10, 8, 12),
    },
    pointRow: {
      borderRadius: s(18, 14, 22),
      borderWidth: 1,
      paddingHorizontal: s(12, 10, 16),
      paddingVertical: s(12, 10, 14),
      flexDirection: 'row',
      alignItems: 'center',
      gap: s(10, 8, 12),
    },
    pointIcon: {
      width: s(32, 28, 36),
      height: s(32, 28, 36),
      borderRadius: 999,
      alignItems: 'center',
      justifyContent: 'center',
    },
    pointText: {
      flex: 1,
      fontSize: s(14, 12, 17),
      lineHeight: s(22, 18, 26),
      fontWeight: '700',
    },
  });
};
