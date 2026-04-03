import { useMemo } from 'react';
import { Image, SafeAreaView, ScrollView, StyleSheet, Text, TouchableOpacity, View, useWindowDimensions } from 'react-native';
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
        title: 'من نحن',
        heroTitle: 'CMPF',
        heroSub: 'ريادة في خدمات الإسعاف والمواكبة الطبية.',
        storyTitle: 'قصة CMPF',
        storyText:
          'CMPF شركة رائدة في خدمات الإسعاف والرعاية الطبية بخبرة تتجاوز 75 سنة. نعمل على تقديم استجابة سريعة، مرافقة آمنة، وحلول طبية عصرية تواكب احتياجات الأفراد والعائلات والمؤسسات.',
        missionTitle: 'رؤيتنا ومهمتنا',
        missionText:
          'نؤمن أن الخدمة الصحية المحترفة تجمع بين السرعة، الإنسانية، والثقة. لهذا نبني تجربة تسهل طلب الإسعاف، الطبيب المنزلي، تتبع الدواء، والوصول إلى الخدمات القريبة بسهولة.',
        points: [
          'فرق مدربة واستجابة سريعة',
          'تنظيم محترف للنقل والرعاية',
          'تجربة رقمية سهلة وواضحة',
        ],
        statLabels: {
          experience: 'سنة خبرة',
          availability: 'جاهزية مستمرة',
          support: 'دعم استعجالي',
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
      <View style={[styles.header, isDark && { backgroundColor: colors.surface, borderBottomColor: colors.border }]}>
        <TouchableOpacity style={[styles.backBtn, isDark && { backgroundColor: colors.surfaceAlt }]} onPress={onBack} activeOpacity={0.8}>
          <Ionicons name="chevron-back" size={20} color={colors.textPrimary} />
        </TouchableOpacity>
        <Text style={[styles.headerTitle, arBold, { color: colors.textPrimary }]}>{txt.title}</Text>
        <View style={styles.headerPlaceholder} />
      </View>

      <ScrollView contentContainerStyle={styles.content} showsVerticalScrollIndicator={false}>
        <View style={styles.logoSection}>
          <Image source={logo} style={styles.logo} resizeMode="contain" />
          <Text style={[styles.brandName, arBold, { color: colors.textPrimary }]}>{txt.heroTitle}</Text>
          <Text style={[styles.brandSub, arRegular, { color: colors.textSecondary }]}>{txt.heroSub}</Text>
        </View>

        <View style={styles.statsRow}>
          {STATS.map((item) => (
            <View key={item.key} style={[styles.statCard, { backgroundColor: colors.surface, borderColor: colors.border }]}>
              <Ionicons name={item.icon} size={18} color="#2563eb" />
              <Text style={[styles.statValue, arBold, { color: colors.textPrimary }]}>{item.value}</Text>
              <Text style={[styles.statLabel, arRegular, { color: colors.textSecondary }]}>{txt.statLabels[item.key]}</Text>
            </View>
          ))}
        </View>

        <View style={[styles.section, { backgroundColor: colors.surface, borderColor: colors.border }]}>
          <Text style={[styles.sectionTitle, arBold, { color: colors.textPrimary }]}>{txt.storyTitle}</Text>
          <Text style={[styles.sectionText, arRegular, { color: colors.textSecondary }]}>{txt.storyText}</Text>
        </View>

        <View style={[styles.section, { backgroundColor: colors.surface, borderColor: colors.border }]}>
          <Text style={[styles.sectionTitle, arBold, { color: colors.textPrimary }]}>{txt.missionTitle}</Text>
          <Text style={[styles.sectionText, arRegular, { color: colors.textSecondary }]}>{txt.missionText}</Text>

          {txt.points.map((point) => (
            <View key={point} style={styles.pointRow}>
              <View style={styles.pointDot}>
                <Ionicons name="checkmark" size={14} color="#2563eb" />
              </View>
              <Text style={[styles.pointText, arRegular, { color: colors.textPrimary }]}>{point}</Text>
            </View>
          ))}
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
      paddingTop: s(24, 20, 30),
      paddingBottom: s(32, 24, 40),
      gap: s(16, 14, 20),
    },
    logoSection: {
      alignItems: 'center',
      paddingVertical: s(8, 6, 12),
    },
    logo: {
      width: s(88, 72, 104),
      height: s(88, 72, 104),
    },
    brandName: {
      marginTop: s(12, 10, 16),
      fontSize: s(28, 24, 34),
      fontWeight: '800',
      letterSpacing: 1,
    },
    brandSub: {
      marginTop: s(6, 4, 8),
      fontSize: s(14, 12, 16),
      textAlign: 'center',
      lineHeight: s(22, 18, 26),
      paddingHorizontal: s(12, 8, 16),
    },
    statsRow: {
      flexDirection: 'row',
      gap: s(10, 8, 12),
    },
    statCard: {
      flex: 1,
      borderRadius: 16,
      borderWidth: 1,
      paddingVertical: s(14, 12, 18),
      paddingHorizontal: s(10, 8, 12),
      alignItems: 'center',
      gap: s(4, 3, 6),
    },
    statValue: {
      fontSize: s(20, 17, 24),
      fontWeight: '800',
    },
    statLabel: {
      textAlign: 'center',
      fontSize: s(11, 10, 13),
      lineHeight: s(16, 14, 18),
    },
    section: {
      borderRadius: 16,
      borderWidth: 1,
      padding: s(18, 14, 22),
    },
    sectionTitle: {
      fontSize: s(20, 17, 24),
      fontWeight: '700',
      marginBottom: s(8, 6, 10),
    },
    sectionText: {
      fontSize: s(14, 12, 16),
      lineHeight: s(22, 19, 26),
    },
    pointRow: {
      flexDirection: 'row',
      alignItems: 'center',
      gap: s(10, 8, 12),
      marginTop: s(10, 8, 12),
    },
    pointDot: {
      width: s(28, 24, 32),
      height: s(28, 24, 32),
      borderRadius: 999,
      backgroundColor: '#eff6ff',
      alignItems: 'center',
      justifyContent: 'center',
    },
    pointText: {
      flex: 1,
      fontSize: s(14, 12, 16),
      lineHeight: s(20, 17, 24),
    },
  });
};
