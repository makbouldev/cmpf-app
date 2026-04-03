import { LinearGradient } from 'expo-linear-gradient';
import { Ionicons } from '@expo/vector-icons';
import { useState } from 'react';
import { Alert, Image, Modal, Pressable, Text, TouchableOpacity, View } from 'react-native';
import { useI18n } from '../i18n/I18nContext';
import { useAppTheme } from '../theme/ThemeContext';

const logo = require('../../assets/CMPFLOGO.png');

export default function CMPFHeader({ styles, iconSize, actionIconSize, onNavigate }) {
  const [menuOpen, setMenuOpen] = useState(false);
  const { t, language } = useI18n();
  const { colors } = useAppTheme();
  const arRegular = language === 'ar' ? { fontFamily: 'Cairo_400Regular' } : null;
  const arBold = language === 'ar' ? { fontFamily: 'Cairo_700Bold' } : null;

  const handleMenuSelect = (action, label) => {
    setMenuOpen(false);
    if (action === 'profile' && onNavigate) {
      onNavigate('profile');
      return;
    }
    if (action === 'settings' && onNavigate) {
      onNavigate('settings');
      return;
    }
    Alert.alert(label, t('common.soon'));
  };

  return (
    <>
      <LinearGradient colors={colors.headerGradient} style={styles.heroContainer}>
        <View style={styles.heroGlowOne} />
        <View style={styles.heroGlowTwo} />

        <View style={styles.heroTopRow}>
          <TouchableOpacity style={styles.heroIconBtn} onPress={() => setMenuOpen(true)}>
            <Ionicons name="person" size={iconSize + 4} color="#fff" />
          </TouchableOpacity>

          <View style={styles.helloWrap}>
            <Text style={[styles.helloKicker, arRegular]}>CMPF</Text>
            <Text style={[styles.helloText, arBold]}>{t('header.hello')}</Text>
          </View>
        </View>

        <View style={styles.heroBody}>
          <View style={styles.heroCopy}>
            <View style={styles.heroBadge}>
              <Ionicons name="shield-checkmark-outline" size={actionIconSize - 4} color="#fff" />
              <Text style={[styles.heroBadgeText, arRegular]}>{t('header.badge')}</Text>
            </View>

            <Text style={[styles.heroTitle, arBold]}>{t('header.title')}</Text>
            <Text style={styles.brandSub}>CMPF Emergency Care Platform</Text>
          </View>

          <View style={styles.logoWrap}>
            <Image source={logo} style={styles.logoImage} resizeMode="contain" />
          </View>
        </View>

        <View style={styles.heroStatsRow}>
          <View style={styles.heroStatCard}>
            <Text style={styles.heroStatNumber}>24/7</Text>
            <Text style={[styles.heroStatLabel, arRegular]}>{t('header.statReady')}</Text>
          </View>
          <View style={styles.heroStatCard}>
            <Text style={styles.heroStatNumber}>+4</Text>
            <Text style={[styles.heroStatLabel, arRegular]}>{t('header.statServices')}</Text>
          </View>
        </View>

        <View style={styles.filterRow}>
          <TouchableOpacity style={styles.filterBtn}>
            <Text style={[styles.filterText, arRegular]}>{t('header.followRequests')}</Text>
            <View style={styles.filterIconWrap}>
              <Ionicons name="pulse-outline" size={iconSize + 1} color="#2b63bb" />
            </View>
          </TouchableOpacity>
          <TouchableOpacity style={styles.filterBtn}>
            <Text style={[styles.filterText, arRegular]}>{t('header.medAlerts')}</Text>
            <View style={styles.filterIconWrap}>
              <Ionicons name="alarm-outline" size={iconSize + 1} color="#2b63bb" />
            </View>
          </TouchableOpacity>
        </View>
      </LinearGradient>

      <Modal transparent visible={menuOpen} animationType="fade" onRequestClose={() => setMenuOpen(false)}>
        <Pressable style={[styles.profileMenuOverlay, { backgroundColor: colors.overlay }]} onPress={() => setMenuOpen(false)}>
          <View style={[styles.profileMenuCard, { backgroundColor: colors.surface, borderColor: colors.border }]}>
            <TouchableOpacity style={styles.profileMenuItem} onPress={() => handleMenuSelect('profile', t('header.menuProfile'))}>
              <Text style={[styles.profileMenuText, arRegular, { color: colors.textPrimary }]}>{t('header.menuProfile')}</Text>
              <Ionicons name="person-outline" size={18} color={colors.textSecondary} />
            </TouchableOpacity>

            <TouchableOpacity style={styles.profileMenuItem} onPress={() => handleMenuSelect('orders', t('header.menuOrders'))}>
              <Text style={[styles.profileMenuText, arRegular, { color: colors.textPrimary }]}>{t('header.menuOrders')}</Text>
              <Ionicons name="document-text-outline" size={18} color={colors.textSecondary} />
            </TouchableOpacity>

            <TouchableOpacity style={styles.profileMenuItem} onPress={() => handleMenuSelect('settings', t('header.menuSettings'))}>
              <Text style={[styles.profileMenuText, arRegular, { color: colors.textPrimary }]}>{t('header.menuSettings')}</Text>
              <Ionicons name="settings-outline" size={18} color={colors.textSecondary} />
            </TouchableOpacity>
          </View>
        </Pressable>
      </Modal>
    </>
  );
}
