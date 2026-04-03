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
    iconFamily: 'fontawesome6',
    icon: 'truck-medical',
    iconColor: '#e11d48',
    iconBg: '#ffe4e6',
  },
  {
    key: 'doctor',
    iconFamily: 'fontawesome6',
    icon: 'stethoscope',
    iconColor: '#2563eb',
    iconBg: '#dbeafe',
  },
  {
    key: 'pharmacies',
    iconFamily: 'fontawesome6',
    icon: 'kit-medical',
    iconColor: '#059669',
    iconBg: '#d1fae5',
  },
  {
    key: 'medications',
    iconFamily: 'fontawesome6',
    icon: 'capsules',
    iconColor: '#ea580c',
    iconBg: '#fed7aa',
  },
  {
    key: 'gallery',
    iconFamily: 'ionicons',
    icon: 'images',
    iconColor: '#0284c7',
    iconBg: '#e0f2fe',
  },
  {
    key: 'socialMedia',
    iconFamily: 'ionicons',
    icon: 'share-social',
    iconColor: '#0066ff',
    iconBg: '#f1f5f9',
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
      { ...servicePresets[0], title: t('home.ambulanceTitle'), subtitle: t('home.ambulanceSub') },
      { ...servicePresets[1], title: t('home.doctorTitle'), subtitle: t('home.doctorSub') },
      { ...servicePresets[2], title: t('home.pharmaciesTitle'), subtitle: t('home.pharmaciesSub') },
      { ...servicePresets[3], title: t('home.medsTitle'), subtitle: t('home.medsSub') },
      { ...servicePresets[4], title: t('home.galleryTitle'), subtitle: t('home.gallerySub') },
      { ...servicePresets[5], title: t('home.socialMediaTitle'), subtitle: t('home.socialMediaSub') },
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
        liveStatus: 'جاهزية تامة 24/7',
        quickCall: 'اتصال مباشر',
        orderNow: 'طلب فوري',
      }
    : {
        settings: 'Paramètres',
        about: 'À propos de CMPF',
        contact: "Appel d'urgence",
        profile: 'Mon Profil',
        liveStatus: 'Service Actif 24/7',
        quickCall: 'Appel Direct',
        orderNow: 'Commander',
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
    if (action === 'settings') { onNavigate('settings'); return; }
    if (action === 'about') { onNavigate('about'); return; }
    if (action === 'profile') { onNavigate('profile'); return; }
    if (action === 'contact') { openCall(); }
  };

  const handleServicePress = (service) => {
    if (service.key === 'socialMedia') {
      Alert.alert(service.title, t('common.soon'));
      return;
    }
    onNavigate(service.key === 'doctor' ? 'doctor' : service.key === 'medications' ? 'medications' : service.key);
  };

  const renderServiceIcon = (service, size) => {
    if (service.iconFamily === 'fontawesome6') {
      return <FontAwesome6 name={service.icon} size={size} color={service.iconColor} />;
    }
    return <Ionicons name={service.icon} size={size} color={service.iconColor} />;
  };

  return (
    <SafeAreaView style={[styles.screen, { backgroundColor: colors.background }]}>
      <View
        style={[styles.fixedHeroWrap, { backgroundColor: colors.background }]}
        onLayout={(event) => setHeroHeight(event.nativeEvent.layout.height)}
      >
        {/* Header Bar */}
        <View style={[styles.topHeaderCard, isDark && { backgroundColor: colors.surface, borderColor: colors.border }]}>
          <View style={styles.topRow}>
            <TouchableOpacity
              style={[styles.logoButton, isDark && { backgroundColor: colors.surfaceAlt, borderColor: colors.border }]}
              onPress={() => onNavigate('home')}
              activeOpacity={0.88}
            >
              <Image source={logo} style={styles.logoImage} resizeMode="contain" />
            </TouchableOpacity>

            <View style={[styles.greetingWrap, styles.greetingWrapCenter]}>
              <Text style={[styles.greetingTitle, isArabic && styles.greetingTitleArabic, arBold, { color: colors.textPrimary }]}>
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
          </View>
        </View>

        {/* Hero Ambulance Card */}
        <TouchableOpacity style={styles.ctaButton} activeOpacity={0.94} onPress={() => onNavigate('ambulance')}>
          <View style={styles.ctaButtonInner}>
            <Text style={[styles.ctaTitle, arBold]}>{t('home.ctaAmbulance')}</Text>
            <Text style={[styles.ctaSubtitle, arRegular]}>{t('home.ctaAmbulanceSub')}</Text>

            <View style={styles.ctaActionRow}>
              <View style={styles.ctaCommanderBtn}>
                <FontAwesome6 name="truck-medical" size={14} color="#dc2626" />
                <Text style={[styles.ctaCommanderText, arBold]}>{txt.orderNow}</Text>
              </View>

              <TouchableOpacity
                style={styles.ctaCallBtn}
                onPress={(e) => { e.stopPropagation(); openCall(); }}
                activeOpacity={0.8}
              >
                <Ionicons name="call" size={15} color="#ffffff" />
                <Text style={[styles.ctaCallText, arBold]}>{txt.quickCall}</Text>
              </TouchableOpacity>
            </View>
          </View>
        </TouchableOpacity>
      </View>

      {/* Scrollable Content */}
      <ScrollView
        contentContainerStyle={[styles.scrollContent, { paddingTop: heroHeight + heroGap }]}
        showsVerticalScrollIndicator={false}
      >
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

        <View style={styles.servicesGrid}>
          {services.map((service) => {
            if (service.key === 'socialMedia') {
              return (
                <View
                  key={service.key}
                  style={[
                    styles.serviceCard,
                    styles.serviceCardWide,
                    isDark && { backgroundColor: colors.surface, borderColor: colors.border },
                  ]}
                >
                  <View style={[styles.serviceIconBox, { backgroundColor: isDark ? colors.surfaceAlt : service.iconBg }]}>
                    {renderServiceIcon(service, 28)}
                  </View>
                  <Text style={[styles.serviceTitle, arBold, { color: colors.textPrimary }]}>
                    {service.title}
                  </Text>
                  <Text style={[styles.serviceSubtitle, arRegular, { color: colors.textSecondary }]}>
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
                style={[styles.serviceCard, isDark && { backgroundColor: colors.surface, borderColor: colors.border }]}
                activeOpacity={0.9}
                onPress={() => handleServicePress(service)}
              >
                <View style={[styles.serviceIconBox, { backgroundColor: isDark ? colors.surfaceAlt : service.iconBg }]}>
                  {renderServiceIcon(service, 28)}
                </View>
                <Text style={[styles.serviceTitle, arBold, { color: colors.textPrimary }]}>
                  {service.title}
                </Text>
              </TouchableOpacity>
            );
          })}
        </View>
      </ScrollView>

      {/* Bottom Navigation */}
      <View style={styles.bottomNavWrap}>
        <View style={[styles.bottomNav, isDark && { backgroundColor: colors.surface, borderColor: colors.border }]}>
          {navItems.slice(0, 1).map((item) => (
            <TouchableOpacity key={item.key} style={styles.navItem} onPress={() => onNavigate(item.route)}>
              <Ionicons name={item.icon} size={22} color={item.active ? colors.textPrimary : colors.textMuted} />
              <Text
                style={[
                  styles.navLabel,
                  { color: item.active ? colors.textPrimary : colors.textMuted, fontWeight: item.active ? '800' : '600' },
                  arRegular,
                ]}
              >
                {item.label}
              </Text>
              {item.active && <View style={styles.navActiveIndicator} />}
            </TouchableOpacity>
          ))}

          <TouchableOpacity
            style={[styles.sosButton, isDark && { borderColor: colors.surface }]}
            onPress={() => onNavigate('ambulance')}
            activeOpacity={0.9}
          >
            <Ionicons name="call" size={18} color="#ffffff" />
            <Text style={[styles.sosText, arBold]}>SOS</Text>
          </TouchableOpacity>

          {navItems.slice(1).map((item) => (
            <TouchableOpacity key={item.key} style={styles.navItem} onPress={() => onNavigate(item.route)}>
              <Ionicons name={item.icon} size={22} color={item.active ? colors.textPrimary : colors.textMuted} />
              <Text
                style={[
                  styles.navLabel,
                  { color: item.active ? colors.textPrimary : colors.textMuted, fontWeight: item.active ? '800' : '600' },
                  arRegular,
                ]}
              >
                {item.label}
              </Text>
              {item.active && <View style={styles.navActiveIndicator} />}
            </TouchableOpacity>
          ))}
        </View>
      </View>

      <TouchableOpacity style={styles.whatsappFloat} onPress={openWhatsapp} activeOpacity={0.9}>
        <Ionicons name="logo-whatsapp" size={28} color="#ffffff" />
      </TouchableOpacity>

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
