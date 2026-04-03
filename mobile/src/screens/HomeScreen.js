import { useMemo, useState } from 'react';
import {
  Alert,
  Image,
  Linking,
  Modal,
  Pressable,
  SafeAreaView,
  ScrollView,
  Text,
  TouchableOpacity,
  View,
  useWindowDimensions,
} from 'react-native';
import { FontAwesome6, Ionicons } from '@expo/vector-icons';
import { createHomeStyles } from '../styles/homeStyles';
import { useAppTheme } from '../theme/ThemeContext';
import { useI18n } from '../i18n/I18nContext';

const logo = require('../../assets/CMPFLOGO.png');
const SUPPORT_PHONE = '+212522491616';
const SUPPORT_WHATSAPP_PHONE = '+212661502763';

const socialIcons = [
  { key: 'facebook', family: 'ionicons', icon: 'logo-facebook', color: '#1877F2' },
  { key: 'whatsapp', family: 'ionicons', icon: 'logo-whatsapp', color: '#25D366' },
  { key: 'instagram', family: 'ionicons', icon: 'logo-instagram', color: '#E4405F' },
  { key: 'tiktok', family: 'fontawesome6', icon: 'tiktok', color: '#111111' },
  { key: 'youtube', family: 'ionicons', icon: 'logo-youtube', color: '#FF0000' },
];

const socialLinks = {
  facebook: 'https://www.facebook.com/profile.php?id=100010128672008',
  whatsapp: 'https://api.whatsapp.com/send/?phone=212661502763&text&type=phone_number&app_absent=0',
  instagram: 'https://www.instagram.com/cmpf.ma_ambulance_depannage/?igsh=MWh1NmZsbXZ1dHVsOQ#',
  youtube: 'https://www.youtube.com/channel/UC92V4I_n53gBfTColHfXBlw',
  tiktok: 'https://www.tiktok.com/@cmpf.assistance',
};

const servicePresets = [
  {
    key: 'ambulance',
    icon: 'car-sport',
    pill: '24h/7j',
    pillBg: '#ffe4e6',
    pillColor: '#e11d48',
    iconColor: '#e11d48',
    iconBg: '#fff1f2',
  },
  {
    key: 'doctor',
    icon: 'medkit',
    pill: 'À Domicile',
    pillBg: '#fef3c7',
    pillColor: '#b45309',
    iconColor: '#d97706',
    iconBg: '#fffbeb',
  },
  {
    key: 'pharmacies',
    icon: 'location',
    pill: 'GPS Live',
    pillBg: '#d1fae5',
    pillColor: '#047857',
    iconColor: '#059669',
    iconBg: '#ecfdf5',
  },
  {
    key: 'medications',
    icon: 'alarm',
    pill: 'Rappels',
    pillBg: '#e0e7ff',
    pillColor: '#4338ca',
    iconColor: '#6366f1',
    iconBg: '#eef2ff',
  },
  {
    key: 'gallery',
    icon: 'images',
    pill: 'Flotte',
    pillBg: '#e0f2fe',
    pillColor: '#0369a1',
    iconColor: '#0284c7',
    iconBg: '#f0f9ff',
  },
  {
    key: 'socialMedia',
    icon: 'share-social',
    pill: 'Support',
    pillBg: '#f1f5f9',
    pillColor: '#0066ff',
    iconColor: '#0066ff',
    iconBg: '#f8fafc',
  },
];

export default function HomeScreen({ onNavigate, preferences }) {
  const { width, height } = useWindowDimensions();
  const styles = useMemo(() => createHomeStyles(width, height), [width, height]);
  const heroGap = width <= 390 ? 12 : 16;
  const { t, language } = useI18n();
  const { colors, mode } = useAppTheme();
  const isDark = mode === 'dark';
  const isArabic = language === 'ar';
  const arRegular = isArabic ? { fontFamily: 'Cairo_400Regular' } : null;
  const arBold = isArabic ? { fontFamily: 'Cairo_700Bold' } : null;
  const [menuOpen, setMenuOpen] = useState(false);
  const [heroHeight, setHeroHeight] = useState(0);

  const greetingText = isArabic ? 'ألو CMPF' : 'Allo CMPF';

  const services = useMemo(
    () => [
      {
        ...servicePresets[0],
        pill: '24h/7j',
        title: t('home.ambulanceTitle'),
        subtitle: t('home.ambulanceSub'),
      },
      {
        ...servicePresets[1],
        pill: t('home.pillFast'),
        title: t('home.doctorTitle'),
        subtitle: t('home.doctorSub'),
      },
      {
        ...servicePresets[2],
        pill: t('home.pillMap'),
        title: t('home.pharmaciesTitle'),
        subtitle: t('home.pharmaciesSub'),
      },
      {
        ...servicePresets[3],
        pill: t('home.pillNew'),
        title: t('home.medsTitle'),
        subtitle: t('home.medsSub'),
      },
      {
        ...servicePresets[4],
        pill: isArabic ? 'أسطولنا' : 'Notre Flotte',
        title: t('home.galleryTitle'),
        subtitle: t('home.gallerySub'),
      },
      {
        ...servicePresets[5],
        pill: isArabic ? 'مساعدة' : 'Assistance',
        title: t('home.socialMediaTitle'),
        subtitle: t('home.socialMediaSub'),
      },
    ],
    [t, isArabic],
  );

  const navItems = [
    { key: 'home', icon: 'home', label: t('home.navHome'), route: 'home', active: true },
    { key: 'map', icon: 'location-outline', label: t('home.navMap'), route: 'pharmacies' },
  ];

  const txt = isArabic
    ? {
        settings: 'الإعدادات',
        about: 'من نحن (CMPF)',
        contact: 'اتصل بالطوارئ',
        profile: 'ملفي الشخصي',
        aboutTitle: 'من نحن',
        aboutText: 'CMPF تقدم خدمات الإسعاف والطبيب المنزلي والصيدليات القريبة وتذكير الأدوية.',
        liveStatus: 'جاهزية تامة 24/7',
        quickCall: 'اتصال مباشر',
        orderNow: 'طلب فوري',
        trustExp: '75+ سنة',
        trustExpLabel: 'خبرة موثوقة',
        trustAvail: '24h/24',
        trustAvailLabel: 'جاهزية مستمرة',
        trustCoverage: 'المغرب',
        trustCoverageLabel: 'تغطية شاملة',
        trustApproved: '100%',
        trustApprovedLabel: 'أطقم معتمدة',
        emergencyBadge: 'تدخل عاجل 24/7',
      }
    : {
        settings: 'Paramètres',
        about: 'À propos de CMPF',
        contact: "Appel d'urgence",
        profile: 'Mon Profil',
        aboutTitle: 'À propos',
        aboutText: 'CMPF est votre partenaire de confiance pour les urgences médicales au Maroc.',
        liveStatus: 'Service Actif 24/7',
        quickCall: 'Appel Direct',
        orderNow: 'Commander',
        trustExp: '+75 ans',
        trustExpLabel: "D'expérience",
        trustAvail: '24h / 7j',
        trustAvailLabel: 'Disponibilité',
        trustCoverage: 'Maroc',
        trustCoverageLabel: 'Couverture',
        trustApproved: '100%',
        trustApprovedLabel: 'Agréé & SAMU',
        emergencyBadge: 'URGENCE VITALE 24/7',
      };

  const openWhatsapp = async () => {
    const cleanPhone = SUPPORT_WHATSAPP_PHONE.replace(/[^\d]/g, '');
    const message = encodeURIComponent(
      isArabic ? 'السلام عليكم، أريد طلب مساعدة عاجلة من CMPF.' : 'Bonjour, je souhaite une assistance médicale urgente CMPF.',
    );
    const nativeUrl = `whatsapp://send?phone=${cleanPhone}&text=${message}`;
    const webUrl = `https://wa.me/${cleanPhone}?text=${message}`;

    try {
      await Linking.openURL(nativeUrl);
    } catch (_error) {
      try {
        await Linking.openURL(webUrl);
      } catch (_webError) {
        Alert.alert('WhatsApp', isArabic ? 'تعذر فتح واتساب حاليا.' : "Impossible d'ouvrir WhatsApp pour le moment.");
      }
    }
  };

  const openCall = async () => {
    const cleanPhone = SUPPORT_PHONE.replace(/[^\d+]/g, '');
    const telUrl = `tel:${cleanPhone}`;

    try {
      await Linking.openURL(telUrl);
    } catch (_error) {
      Alert.alert('Appel', isArabic ? 'تعذر فتح تطبيق الاتصال حاليا.' : "Impossible d'ouvrir l'application d'appel pour le moment.");
    }
  };

  const openSocialLink = async (key) => {
    const url = socialLinks[key];
    if (!url) return;

    try {
      await Linking.openURL(url);
    } catch (_error) {
      Alert.alert('Link', isArabic ? 'تعذر فتح الرابط.' : "Impossible d'ouvrir le lien.");
    }
  };

  const handleMenuAction = (action) => {
    setMenuOpen(false);
    if (action === 'settings') {
      onNavigate('settings');
      return;
    }
    if (action === 'about') {
      onNavigate('about');
      return;
    }
    if (action === 'profile') {
      onNavigate('profile');
      return;
    }
    if (action === 'contact') {
      openCall();
    }
  };

  const handleServicePress = (service) => {
    if (service.key === 'socialMedia') {
      Alert.alert(service.title, t('common.soon'));
      return;
    }
    onNavigate(service.key === 'doctor' ? 'doctor' : service.key === 'medications' ? 'medications' : service.key);
  };

  return (
    <SafeAreaView style={[styles.screen, { backgroundColor: colors.background }]}>
      {/* Fixed Sticky Header + Emergency Hero */}
      <View
        style={[styles.fixedHeroWrap, { backgroundColor: colors.background }]}
        onLayout={(event) => setHeroHeight(event.nativeEvent.layout.height)}
      >
        <View style={[styles.topHeaderCard, isDark && { backgroundColor: colors.surface, borderColor: colors.border }]}>
          <View style={styles.topRow}>
            {isArabic ? (
              <>
                <TouchableOpacity
                  style={[styles.logoButton, isDark && { backgroundColor: colors.surfaceAlt, borderColor: colors.border }]}
                  onPress={() => onNavigate('home')}
                  activeOpacity={0.88}
                >
                  <Image source={logo} style={styles.logoImage} resizeMode="contain" />
                </TouchableOpacity>

                <View style={[styles.greetingWrap, styles.greetingWrapCenter]}>
                  <Text style={[styles.greetingTitle, styles.greetingTitleArabic, arBold, { color: colors.textPrimary }]}>
                    {greetingText}
                  </Text>
                  <View style={[styles.liveBadge, isDark && { backgroundColor: 'rgba(16, 185, 129, 0.15)', borderColor: '#065f46' }]}>
                    <View style={styles.liveDot} />
                    <Text style={[styles.liveText, arRegular, isDark && { color: '#34d399' }]}>{txt.liveStatus}</Text>
                  </View>
                </View>

                <TouchableOpacity
                  style={[styles.avatar, isDark && { backgroundColor: colors.surfaceAlt, borderColor: colors.border }]}
                  onPress={() => setMenuOpen(true)}
                  activeOpacity={0.88}
                >
                  <Ionicons name="menu-outline" size={24} color={colors.textPrimary} />
                </TouchableOpacity>
              </>
            ) : (
              <>
                <TouchableOpacity
                  style={[styles.logoButton, isDark && { backgroundColor: colors.surfaceAlt, borderColor: colors.border }]}
                  onPress={() => onNavigate('home')}
                  activeOpacity={0.88}
                >
                  <Image source={logo} style={styles.logoImage} resizeMode="contain" />
                </TouchableOpacity>

                <View style={[styles.greetingWrap, styles.greetingWrapCenter]}>
                  <Text style={[styles.greetingTitle, arBold, { color: colors.textPrimary }]}>
                    {greetingText}
                  </Text>
                  <View style={[styles.liveBadge, isDark && { backgroundColor: 'rgba(16, 185, 129, 0.15)', borderColor: '#065f46' }]}>
                    <View style={styles.liveDot} />
                    <Text style={[styles.liveText, arRegular, isDark && { color: '#34d399' }]}>{txt.liveStatus}</Text>
                  </View>
                </View>

                <TouchableOpacity
                  style={[styles.avatar, isDark && { backgroundColor: colors.surfaceAlt, borderColor: colors.border }]}
                  onPress={() => setMenuOpen(true)}
                  activeOpacity={0.88}
                >
                  <Ionicons name="menu-outline" size={24} color={colors.textPrimary} />
                </TouchableOpacity>
              </>
            )}
          </View>
        </View>

        {/* Emergency Ambulance Hero Card */}
        <TouchableOpacity
          style={styles.ctaButton}
          activeOpacity={0.94}
          onPress={() => onNavigate('ambulance')}
        >
          <View style={styles.ctaButtonInner}>
            <View style={styles.ctaPillBadge}>
              <Ionicons name="flash" size={13} color="#ffffff" />
              <Text style={[styles.ctaPillText, arBold]}>{txt.emergencyBadge}</Text>
            </View>

            <View style={styles.ctaTitleRow}>
              <Ionicons name="car-sport" size={22} color="#ffffff" />
              <Text style={[styles.ctaTitle, arBold]}>{t('home.ctaAmbulance')}</Text>
            </View>

            <Text style={[styles.ctaSubtitle, arRegular]}>{t('home.ctaAmbulanceSub')}</Text>

            <View style={styles.ctaActionRow}>
              <View style={styles.ctaSubAction}>
                <Ionicons name="arrow-forward" size={14} color="#ffffff" />
                <Text style={[styles.ctaSubActionText, arBold]}>{txt.orderNow}</Text>
              </View>

              <TouchableOpacity
                style={styles.ctaSubAction}
                onPress={(e) => {
                  e.stopPropagation();
                  openCall();
                }}
                activeOpacity={0.8}
              >
                <Ionicons name="call" size={14} color="#ffffff" />
                <Text style={[styles.ctaSubActionText, arBold]}>{txt.quickCall}</Text>
              </TouchableOpacity>
            </View>
          </View>
        </TouchableOpacity>
      </View>

      {/* Main Scrollable Content */}
      <ScrollView
        contentContainerStyle={[styles.scrollContent, { paddingTop: heroHeight + heroGap }]}
        showsVerticalScrollIndicator={false}
      >
        {/* Section Header */}
        <View style={styles.sectionHeader}>
          <Text style={[styles.sectionTitle, arBold, { color: colors.textPrimary }]}>
            {t('home.servicesHeadline')}
          </Text>
          <View style={[styles.sectionBadge, isDark && { backgroundColor: colors.surfaceAlt, borderColor: colors.border }]}>
            <Ionicons name="shield-checkmark" size={14} color="#059669" />
            <Text style={[styles.sectionBadgeText, arRegular, isDark && { color: colors.textSecondary }]}>
              {t('home.securityBadge')}
            </Text>
          </View>
        </View>

        {/* Bento Services Grid */}
        <View style={styles.servicesGrid}>
          {services.map((service) => {
            const isWide = service.key === 'gallery' || service.key === 'socialMedia';

            if (service.key === 'socialMedia') {
              return (
                <View
                  key={service.key}
                  style={[
                    styles.serviceCard,
                    isWide && styles.serviceCardWide,
                    isDark && { backgroundColor: colors.surface, borderColor: colors.border },
                  ]}
                >
                  <View style={[styles.serviceTop, isWide && styles.serviceCardWideTop]}>
                    <View style={[styles.serviceIconBox, { backgroundColor: isDark ? colors.surfaceAlt : service.iconBg }]}>
                      <Ionicons name={service.icon} size={22} color={service.iconColor} />
                    </View>
                    <Text
                      style={[
                        styles.serviceTitle,
                        arBold,
                        isWide && styles.serviceCardWideTitle,
                        { color: colors.textPrimary },
                      ]}
                    >
                      {service.title}
                    </Text>
                  </View>
                  <Text
                    style={[
                      styles.serviceSubtitle,
                      arRegular,
                      isWide && styles.serviceCardWideSubtitle,
                      { color: colors.textSecondary },
                    ]}
                  >
                    {service.subtitle}
                  </Text>
                  <View style={styles.socialIconsRow}>
                    {socialIcons.map((item) => (
                      <TouchableOpacity
                        key={item.key}
                        style={[styles.socialIconBadge, isDark && { backgroundColor: colors.surfaceAlt, borderColor: colors.border }]}
                        onPress={() => openSocialLink(item.key)}
                        activeOpacity={0.85}
                      >
                        {item.family === 'fontawesome6' ? (
                          <FontAwesome6 name={item.icon} size={16} color={item.color} />
                        ) : (
                          <Ionicons name={item.icon} size={18} color={item.color} />
                        )}
                      </TouchableOpacity>
                    ))}
                  </View>
                </View>
              );
            }

            return (
              <TouchableOpacity
                key={service.key}
                style={[
                  styles.serviceCard,
                  isWide && styles.serviceCardWide,
                  service.key === 'gallery' && styles.serviceCardGallery,
                  isDark && { backgroundColor: colors.surface, borderColor: colors.border },
                ]}
                activeOpacity={0.9}
                onPress={() => handleServicePress(service)}
              >
                {service.key === 'gallery' ? (
                  <>
                    <View style={styles.serviceCardGalleryLayerOne} />
                    <View style={styles.serviceCardGalleryLayerTwo} />
                    <View style={styles.serviceCardGalleryLayerThree} />
                  </>
                ) : null}

                <View style={[styles.serviceTop, isWide && styles.serviceCardWideTop]}>
                  <View style={[styles.serviceIconBox, { backgroundColor: isDark ? colors.surfaceAlt : service.iconBg }]}>
                    <Ionicons name={service.icon} size={22} color={service.iconColor} />
                  </View>
                </View>

                <View>
                  <Text
                    style={[
                      styles.serviceTitle,
                      arBold,
                      isWide && styles.serviceCardWideTitle,
                      { color: colors.textPrimary },
                    ]}
                  >
                    {service.title}
                  </Text>
                  <Text
                    style={[
                      styles.serviceSubtitle,
                      arRegular,
                      isWide && styles.serviceCardWideSubtitle,
                      { color: colors.textSecondary },
                    ]}
                    numberOfLines={2}
                  >
                    {service.subtitle}
                  </Text>
                </View>
              </TouchableOpacity>
            );
          })}
        </View>
      </ScrollView>

      {/* Floating Modern Bottom Navigation Dock */}
      <View style={styles.bottomNavWrap}>
        <View style={[styles.bottomNav, isDark && { backgroundColor: colors.surface, borderColor: colors.border }]}>
          {navItems.slice(0, 1).map((item) => (
            <TouchableOpacity key={item.key} style={styles.navItem} onPress={() => onNavigate(item.route)}>
              <Ionicons name={item.icon} size={22} color={item.active ? colors.primary : colors.textMuted} />
              <Text
                style={[
                  styles.navLabel,
                  { color: colors.textMuted },
                  item.active && { color: colors.primary, fontWeight: '800' },
                  arRegular,
                ]}
              >
                {item.label}
              </Text>
            </TouchableOpacity>
          ))}

          {/* Elevated SOS Emergency Button */}
          <TouchableOpacity
            style={[styles.sosButton, isDark && { borderColor: colors.surface }]}
            onPress={() => onNavigate('ambulance')}
            activeOpacity={0.9}
          >
            <Text style={[styles.sosText, arBold]}>SOS</Text>
          </TouchableOpacity>

          {navItems.slice(1).map((item) => (
            <TouchableOpacity key={item.key} style={styles.navItem} onPress={() => onNavigate(item.route)}>
              <Ionicons name={item.icon} size={22} color={item.active ? colors.primary : colors.textMuted} />
              <Text
                style={[
                  styles.navLabel,
                  { color: colors.textMuted },
                  item.active && { color: colors.primary, fontWeight: '800' },
                  arRegular,
                ]}
              >
                {item.label}
              </Text>
            </TouchableOpacity>
          ))}
        </View>
      </View>

      {/* Floating WhatsApp Action Button */}
      <TouchableOpacity style={styles.whatsappFloat} onPress={openWhatsapp} activeOpacity={0.9}>
        <Ionicons name="logo-whatsapp" size={28} color="#ffffff" />
      </TouchableOpacity>

      {/* Quick Action Menu Modal */}
      <Modal transparent visible={menuOpen} animationType="fade" onRequestClose={() => setMenuOpen(false)}>
        <Pressable style={styles.menuOverlay} onPress={() => setMenuOpen(false)}>
          <View style={[styles.menuCard, isDark && { backgroundColor: colors.surface, borderColor: colors.border }]}>
            <TouchableOpacity style={styles.menuItem} onPress={() => handleMenuAction('settings')} activeOpacity={0.88}>
              <Text style={[styles.menuText, arRegular, { color: colors.textPrimary }]}>{txt.settings}</Text>
              <Ionicons name="settings-outline" size={19} color={colors.textSecondary} />
            </TouchableOpacity>

            <TouchableOpacity style={styles.menuItem} onPress={() => handleMenuAction('about')} activeOpacity={0.88}>
              <Text style={[styles.menuText, arRegular, { color: colors.textPrimary }]}>{txt.about}</Text>
              <Ionicons name="information-circle-outline" size={19} color={colors.textSecondary} />
            </TouchableOpacity>

            <TouchableOpacity style={styles.menuItem} onPress={() => handleMenuAction('contact')} activeOpacity={0.88}>
              <Text style={[styles.menuText, arRegular, { color: colors.emergency }]}>{txt.contact}</Text>
              <Ionicons name="call-outline" size={19} color={colors.emergency} />
            </TouchableOpacity>
          </View>
        </Pressable>
      </Modal>
    </SafeAreaView>
  );
}
