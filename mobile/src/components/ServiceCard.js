import { LinearGradient } from 'expo-linear-gradient';
import { Text, TouchableOpacity, View } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useI18n } from '../i18n/I18nContext';
import { useAppTheme } from '../theme/ThemeContext';

const defaultPalette = {
  card: ['#fefeff', '#f4fbff'],
  icon: ['#4b8dff', '#57d6d2'],
  bubble: 'rgba(87, 214, 210, 0.18)',
  arrow: '#0f4ba8',
};

export default function ServiceCard({ styles, icon, title, subtitle, onPress, iconSize, palette = defaultPalette }) {
  const { language } = useI18n();
  const { colors, mode } = useAppTheme();
  const isDark = mode === 'dark';
  const arRegular = language === 'ar' ? { fontFamily: 'Cairo_400Regular' } : null;
  const arBold = language === 'ar' ? { fontFamily: 'Cairo_700Bold' } : null;
  const cardGradient = isDark ? ['#16233f', '#1e2e50'] : palette.card;
  const accentColor = isDark ? 'rgba(74, 111, 184, 0.28)' : palette.bubble;
  const arrowBg = isDark ? 'rgba(15, 25, 48, 0.9)' : 'rgba(255,255,255,0.92)';
  const arrowColor = isDark ? '#dbe8ff' : palette.arrow;

  return (
    <TouchableOpacity style={[styles.serviceCard, isDark && { borderColor: colors.border, backgroundColor: colors.surface }]} activeOpacity={0.92} onPress={onPress}>
      <LinearGradient colors={cardGradient} style={styles.serviceCardInner}>
        <View style={[styles.serviceAccent, { backgroundColor: accentColor }]} />
        <LinearGradient colors={palette.icon} style={styles.serviceIconCircle}>
          <Ionicons name={icon} size={iconSize} color="#fff" />
        </LinearGradient>
        <View style={[styles.serviceArrow, { backgroundColor: arrowBg }]}>
          <Ionicons name="arrow-forward-outline" size={18} color={arrowColor} />
        </View>
        <Text numberOfLines={2} style={[styles.serviceTitle, arBold, isDark && { color: '#ecf2ff' }]}>
          {title}
        </Text>
        <Text numberOfLines={3} style={[styles.serviceSubtitle, arRegular, isDark && { color: '#c1d2ee' }]}>
          {subtitle}
        </Text>
      </LinearGradient>
    </TouchableOpacity>
  );
}
