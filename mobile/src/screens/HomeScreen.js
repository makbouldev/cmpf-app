import { useMemo, useState } from 'react';
import { Alert, Image, Linking, Modal, Pressable, SafeAreaView, ScrollView, Text, TouchableOpacity, View, useWindowDimensions } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { createHomeStyles } from '../styles/homeStyles';
import { useAppTheme } from '../theme/ThemeContext';
import { useI18n } from '../i18n/I18nContext';

const logo = require('../../assets/CMPFLOGO.png');
const SUPPORT_PHONE = '+212612345678';

const servicePresets = [
  {
    key: 'ambulance',
    icon: 'car-outline',
    pill: '24h/24',
    pillBg: '#ffe8e8',
    pillColor: '#ff4a4a',
    iconColor: '#ff5c5c',
  },
  {
    key: 'doctor',
    icon: 'medical-outline',
    pill: 'Rapide',
    pillBg: '#e9f1ff',
    pillColor: '#5b8cff',
    iconColor: '#ffb020',
  },
  {
    key: 'pharmacies',
    icon: 'location-outline',
    pill: 'Map Interactive',
    pillBg: '#e8fff2',
    pillColor: '#2bb673',
    iconColor: '#ff5c5c',
  },
  {
    key: 'medications',
    icon: 'fitness-outline',
    pill: 'Nouveau',
    pillBg: '#f1e8ff',
    pillColor: '#9b5cff',
    iconColor: '#8d63ff',
  },
];

export default function HomeScreen({ onNavigate, preferences }) {
  const { width, height } = useWindowDimensions();
  const styles = useMemo(() => createHomeStyles(width, height), [width, height]);
  const { t, language } = useI18n();
  const { colors, mode } = useAppTheme();
  const isDark = mode === 'dark';
  const isArabic = language === 'ar';
  const arRegular = language === 'ar' ? { fontFamily: 'Cairo_400Regular' } : null;
  const arBold = language === 'ar' ? { fontFamily: 'Cairo_700Bold' } : null;
  const [menuOpen, setMenuOpen] = useState(false);
  const account = preferences?.account || {};
  const user = account?.user || null;
  const isGuest = account?.mode === 'skip' || !account?.token || !user;
  const accountName = user?.name?.trim() || account?.name?.trim() || '';
  const firstName = accountName.split(' ')[0] || '';
  const greetingText = isGuest ? t('header.hello') : `${t('header.hello')}, ${firstName}`;

  const services = useMemo(
    () => [
      {
        ...servicePresets[0],
        pill: '24h/24',
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
    ],
    [t],
  );

  const navItems = [
    { key: 'home', icon: 'home', label: t('home.navHome'), route: 'home', active: true },
    { key: 'map', icon: 'location-outline', label: t('home.navMap'), route: 'pharmacies' },
  ];

  const txt = isArabic
    ? {
        settings: 'الإعدادات',
        about: 'من نحن',
        contact: 'اتصل بنا',
        aboutTitle: 'من نحن',
        aboutText: 'CMPF تقدم خدمات الإسعاف والطبيب المنزلي والصيدليات القريبة وتذكير الأدوية.',
      }
    : {
        settings: 'Parametres',
        about: 'About us',
        contact: 'Contact us',
        aboutTitle: 'About us',
        aboutText: 'CMPF provides ambulance, home doctor, nearby pharmacies, and medication reminder services.',
      };

  const openWhatsapp = async () => {
    const cleanPhone = SUPPORT_PHONE.replace(/[^\d]/g, '');
    const message = encodeURIComponent(
      isArabic ? 'السلام عليكم، أريد المساعدة.' : 'Bonjour, je souhaite obtenir de l aide.',
    );
    const nativeUrl = `whatsapp://send?phone=${cleanPhone}&text=${message}`;
    const webUrl = `https://wa.me/${cleanPhone}?text=${message}`;

    try {
      const canOpenNative = await Linking.canOpenURL(nativeUrl);
      if (canOpenNative) {
        await Linking.openURL(nativeUrl);
        return;
      }

      const canOpenWeb = await Linking.canOpenURL(webUrl);
      if (canOpenWeb) {
        await Linking.openURL(webUrl);
        return;
      }

      Alert.alert('WhatsApp', isArabic ? 'واتساب غير متوفر على هذا الجهاز.' : "WhatsApp n'est pas disponible sur cet appareil.");
    } catch (_error) {
      Alert.alert('WhatsApp', isArabic ? 'تعذر فتح واتساب حالياً.' : "Impossible d'ouvrir WhatsApp pour le moment.");
    }
  };

  const handleMenuAction = (action) => {
    setMenuOpen(false);
    if (action === 'settings') {
      onNavigate('settings');
      return;
    }
    if (action === 'about') {
      Alert.alert(txt.aboutTitle, txt.aboutText);
      return;
    }
    if (action === 'contact') {
      openWhatsapp();
    }
  };

  return (
    <SafeAreaView style={[styles.screen, { backgroundColor: colors.background }]}>
      <ScrollView contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>
        <View style={styles.topRow}>
          {isArabic ? (
            <>
              <TouchableOpacity style={styles.logoButton} onPress={() => onNavigate('home')}>
                <Image source={logo} style={styles.logoImage} resizeMode="contain" />
              </TouchableOpacity>

              <View style={[styles.greetingWrap, styles.greetingWrapCenter]}>
                <Text style={[styles.greetingTitle, styles.greetingTitleArabic, arBold, { color: colors.textPrimary }]}>{greetingText}</Text>
                <Text style={[styles.greetingSubtitle, styles.greetingSubtitleArabic, arRegular, { color: colors.textSecondary }]}>{t('home.greetingQuestion')}</Text>
              </View>

              <TouchableOpacity style={[styles.avatar, isDark && { backgroundColor: colors.surfaceAlt, borderColor: colors.border }]} onPress={() => setMenuOpen(true)} activeOpacity={0.9}>
                <Ionicons name="settings-outline" size={22} color={colors.textPrimary} />
              </TouchableOpacity>
            </>
          ) : (
            <>
              <View style={styles.profileCluster}>
                <TouchableOpacity style={[styles.avatar, isDark && { backgroundColor: colors.surfaceAlt, borderColor: colors.border }]} onPress={() => setMenuOpen(true)} activeOpacity={0.9}>
                  <Ionicons name="settings-outline" size={22} color={colors.textPrimary} />
                </TouchableOpacity>
                <View style={styles.greetingWrap}>
                  <Text style={[styles.greetingTitle, arBold, { color: colors.textPrimary }]}>{greetingText}</Text>
                  <Text style={[styles.greetingSubtitle, arRegular, { color: colors.textSecondary }]}>{t('home.greetingQuestion')}</Text>
                </View>
              </View>

              <TouchableOpacity style={styles.logoButton} onPress={() => onNavigate('home')}>
                <Image source={logo} style={styles.logoImage} resizeMode="contain" />
              </TouchableOpacity>
            </>
          )}
        </View>

        <TouchableOpacity style={styles.ctaButton} activeOpacity={0.92} onPress={() => onNavigate('ambulance')}>
          <View style={styles.ctaTitleRow}>
            <Ionicons name="car-outline" size={18} color="#ffffff" />
            <Text style={[styles.ctaTitle, arBold]}>{t('home.ctaAmbulance')}</Text>
          </View>
          <Text style={[styles.ctaSubtitle, arRegular]}>{t('home.ctaAmbulanceSub')}</Text>
        </TouchableOpacity>

        <View style={styles.sectionHeader}>
          <Text style={[styles.sectionTitle, arBold, { color: colors.textPrimary }]}>{t('home.servicesHeadline')}</Text>
          <View style={[styles.sectionBadge, isDark && { backgroundColor: '#2b2618' }]}>
            <Ionicons name="shield-checkmark" size={14} color="#d7a11d" />
            <Text style={[styles.sectionBadgeText, arRegular]}>{t('home.securityBadge')}</Text>
          </View>
        </View>

        <View style={styles.servicesGrid}>
          {services.map((service) => (
            <TouchableOpacity
              key={service.key}
              style={[styles.serviceCard, isDark && { backgroundColor: colors.surface, borderColor: colors.border }]}
              activeOpacity={0.92}
              onPress={() => onNavigate(service.key === 'doctor' ? 'doctor' : service.key === 'medications' ? 'medications' : service.key)}
            >
              <View style={styles.serviceTop}>
                <View style={[styles.serviceIconBox, isDark && { backgroundColor: colors.surfaceAlt }]}>
                  <Ionicons name={service.icon} size={18} color={service.iconColor} />
                </View>
                <Text style={[styles.serviceTitle, arBold, { color: colors.textPrimary }]}>{service.title}</Text>
              </View>
              <Text style={[styles.serviceSubtitle, arRegular, { color: colors.textSecondary }]}>{service.subtitle}</Text>
              <View style={[styles.servicePill, { backgroundColor: service.pillBg }]}>
                <Text style={[styles.servicePillText, arRegular, { color: service.pillColor }]}>{service.pill}</Text>
              </View>
            </TouchableOpacity>
          ))}
        </View>

      </ScrollView>

      <View style={styles.bottomNavWrap}>
        <View style={[styles.bottomNav, isDark && { backgroundColor: colors.surface, borderColor: colors.border, borderWidth: 1 }]}>
          {navItems.slice(0, 1).map((item) => (
            <TouchableOpacity key={item.key} style={styles.navItem} onPress={() => onNavigate(item.route)}>
              <Ionicons name={item.icon} size={20} color={item.active ? colors.primary : colors.textSecondary} />
              <Text style={[styles.navLabel, { color: colors.textSecondary }, item.active && { color: colors.primary }, arRegular]}>{item.label}</Text>
            </TouchableOpacity>
          ))}

          <TouchableOpacity style={styles.sosButton} onPress={() => onNavigate('ambulance')}>
            <Text style={[styles.sosText, arBold]}>SOS</Text>
          </TouchableOpacity>

          {navItems.slice(1).map((item) => (
            <TouchableOpacity key={item.key} style={styles.navItem} onPress={() => onNavigate(item.route)}>
              <Ionicons name={item.icon} size={20} color={item.active ? colors.primary : colors.textSecondary} />
              <Text style={[styles.navLabel, { color: colors.textSecondary }, item.active && { color: colors.primary }, arRegular]}>{item.label}</Text>
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
            <TouchableOpacity style={styles.menuItem} onPress={() => handleMenuAction('settings')} activeOpacity={0.9}>
              <Text style={[styles.menuText, arRegular, { color: colors.textPrimary }]}>{txt.settings}</Text>
              <Ionicons name="settings-outline" size={18} color={colors.textSecondary} />
            </TouchableOpacity>

            <TouchableOpacity style={styles.menuItem} onPress={() => handleMenuAction('about')} activeOpacity={0.9}>
              <Text style={[styles.menuText, arRegular, { color: colors.textPrimary }]}>{txt.about}</Text>
              <Ionicons name="information-circle-outline" size={18} color={colors.textSecondary} />
            </TouchableOpacity>

            <TouchableOpacity style={styles.menuItem} onPress={() => handleMenuAction('contact')} activeOpacity={0.9}>
              <Text style={[styles.menuText, arRegular, { color: colors.textPrimary }]}>{txt.contact}</Text>
              <Ionicons name="call-outline" size={18} color={colors.textSecondary} />
            </TouchableOpacity>
          </View>
        </Pressable>
      </Modal>
    </SafeAreaView>
  );
}
