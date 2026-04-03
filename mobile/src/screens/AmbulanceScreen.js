import { useMemo, useState, useEffect } from 'react';
import { Linking, SafeAreaView, ScrollView, Text, TouchableOpacity, View, useWindowDimensions, TextInput, SectionList } from 'react-native';
import { FontAwesome6, Ionicons } from '@expo/vector-icons';
import TopToast from '../components/TopToast';
import { createScaler } from '../utils/responsive';
import { createAmbulanceStyles } from '../styles/ambulanceStyles';
import { useAppTheme } from '../theme/ThemeContext';
import { useI18n } from '../i18n/I18nContext';

const DEFAULT_PHONE = '+212539941027';
const DEFAULT_WHATSAPP = '+212660884440';
const WEBSITE_URL = 'https://www.cmpf.ma';

const CITY_CONTACTS = {
  'أكادير': { call: '+212 5 28 84 06 26', whatsapp: '+212 6 62 02 82 49' },
  'الدار البيضاء': { call: '+212 5 22 49 16 16', whatsapp: '+212 6 61 50 27 63' },
  'فاس': { call: '+212535520914', whatsapp: '+212614564507' },
  'العيون': { call: '+212 5 28 99 76 01', whatsapp: '06 78 98 90 04' },
  'مراكش': { call: '+212 5 24 44 84 51', whatsapp: '+212 6 62 01 81 98' },
  'مكناس': { call: '+212535520914', whatsapp: '+212614564507' },
  'الناظور': { call: '+212 5 36 32 08 77', whatsapp: '+212677299084' },
  'ورزازات': { call: '+212 5 24 88 56 67', whatsapp: '+212 6 61 85 65 13' },
  'وجدة': { call: '+212 5 36 70 30 25', whatsapp: '+212 6 61 08 84 13' },
  'الرباط': { call: '+212 5 37 70 60 17', whatsapp: '+212700995153' },
  'طنجة': { call: '+212 5 39 94 10 27', whatsapp: '+212 6 60 88 44 40' },
  'تطوان': { call: '+212 5 39 97 40 88', whatsapp: '+212 6 62 02 21 08' },
};

const MOROCCO_REGIONS = [
  {
    ar: '1. طنجة - تطوان - الحسيمة',
    fr: '1. Tanger - Tétouan - Al Hoceima',
    cities: [
      { ar: 'طنجة', fr: 'Tanger' },
      { ar: 'تطوان', fr: 'Tétouan' },
      { ar: 'الحسيمة', fr: 'Al Hoceima' },
      { ar: 'العرائش', fr: 'Larache' },
      { ar: 'القصر الكبير', fr: 'Ksar El Kebir' },
      { ar: 'شفشاون', fr: 'Chefchaouen' },
      { ar: 'وزان', fr: 'Ouezzane' },
      { ar: 'أصيلة', fr: 'Assilah' },
      { ar: 'الفنيدق', fr: 'Fnideq' },
      { ar: 'مرتيل', fr: 'Martil' },
    ],
  },
  {
    ar: '2. الشرق',
    fr: '2. Oriental',
    cities: [
      { ar: 'وجدة', fr: 'Oujda' },
      { ar: 'الناظور', fr: 'Nador' },
      { ar: 'بركان', fr: 'Berkane' },
      { ar: 'تاوريرت', fr: 'Taourirt' },
      { ar: 'جرادة', fr: 'Jerada' },
      { ar: 'فجيج', fr: 'Figuig' },
      { ar: 'أحفير', fr: 'Ahfir' },
      { ar: 'زايو', fr: 'Zaïo' },
      { ar: 'السعيدية', fr: 'Saïdia' },
    ],
  },
  {
    ar: '3. فاس - مكناس',
    fr: '3. Fès - Meknès',
    cities: [
      { ar: 'فاس', fr: 'Fès' },
      { ar: 'مكناس', fr: 'Meknès' },
      { ar: 'تازة', fr: 'Taza' },
      { ar: 'إفران', fr: 'Ifrane' },
      { ar: 'آزرو', fr: 'Azrou' },
      { ar: 'صفرو', fr: 'Sefrou' },
      { ar: 'بولمان', fr: 'Boulemane' },
      { ar: 'الحاجب', fr: 'El Hajeb' },
    ],
  },
  {
    ar: '4. الرباط - سلا - القنيطرة',
    fr: '4. Rabat - Salé - Kénitra',
    cities: [
      { ar: 'الرباط', fr: 'Rabat' },
      { ar: 'سلا', fr: 'Salé' },
      { ar: 'القنيطرة', fr: 'Kénitra' },
      { ar: 'تمارة', fr: 'Témara' },
      { ar: 'الصخيرات', fr: 'Skhirat' },
      { ar: 'سيدي قاسم', fr: 'Sidi Kacem' },
      { ar: 'سيدي سليمان', fr: 'Sidi Slimane' },
    ],
  },
  {
    ar: '5. بني ملال - خنيفرة',
    fr: '5. Béni Mellal - Khénifra',
    cities: [
      { ar: 'بني ملال', fr: 'Béni Mellal' },
      { ar: 'خنيفرة', fr: 'Khénifra' },
      { ar: 'أزيلال', fr: 'Azilal' },
      { ar: 'الفقيه بن صالح', fr: 'Fquih Ben Salah' },
    ],
  },
  {
    ar: '6. الدار البيضاء - سطات',
    fr: '6. Casablanca - Settat',
    cities: [
      { ar: 'الدار البيضاء', fr: 'Casablanca' },
      { ar: 'المحمدية', fr: 'Mohammedia' },
      { ar: 'الجديدة', fr: 'El Jadida' },
      { ar: 'سطات', fr: 'Settat' },
      { ar: 'برشيد', fr: 'Berrechid' },
      { ar: 'بنسليمان', fr: 'Benslimane' },
      { ar: 'سيدي بنور', fr: 'Sidi Bennour' },
    ],
  },
  {
    ar: '7. مراكش - آسفي',
    fr: '7. Marrakech - Safi',
    cities: [
      { ar: 'مراكش', fr: 'Marrakech' },
      { ar: 'آسفي', fr: 'Safi' },
      { ar: 'الصويرة', fr: 'Essaouira' },
      { ar: 'قلعة السراغنة', fr: 'El Kelaâ de Sraghna' },
      { ar: 'الرحامنة', fr: 'Rehamna' },
      { ar: 'شيشاوة', fr: 'Chichaoua' },
      { ar: 'اليوسفية', fr: 'Youssoufia' },
    ],
  },
  {
    ar: '8. درعة - تافيلالت',
    fr: '8. Drâa - Tafilalet',
    cities: [
      { ar: 'الرشيدية', fr: 'Errachidia' },
      { ar: 'ورزازات', fr: 'Ouarzazate' },
      { ar: 'زاكورة', fr: 'Zagora' },
      { ar: 'تنغير', fr: 'Tinghir' },
      { ar: 'ميدلت', fr: 'Midelt' },
      { ar: 'الريصاني', fr: 'Rissani' },
    ],
  },
  {
    ar: '9. سوس - ماسة',
    fr: '9. Souss - Massa',
    cities: [
      { ar: 'أكادير', fr: 'Agadir' },
      { ar: 'إنزكان', fr: 'Inezgane' },
      { ar: 'تارودانت', fr: 'Taroudant' },
      { ar: 'تيزنيت', fr: 'Tiznit' },
      { ar: 'شتوكة آيت باها', fr: 'Biougra' },
    ],
  },
  {
    ar: '10. كلميم - واد نون',
    fr: '10. Guelmim - Oued Noun',
    cities: [
      { ar: 'كلميم', fr: 'Guelmim' },
      { ar: 'سيدي إفني', fr: 'Sidi Ifni' },
      { ar: 'طانطان', fr: 'Tan-Tan' },
      { ar: 'أسا الزاك', fr: 'Assa-Zag' },
    ],
  },
  {
    ar: '11. العيون - الساقية الحمراء',
    fr: '11. Laâyoune - Sakia El Hamra',
    cities: [
      { ar: 'العيون', fr: 'Laâyoune' },
      { ar: 'السمارة', fr: 'Es-Semara' },
      { ar: 'طرفاية', fr: 'Tarfaya' },
      { ar: 'بوجدور', fr: 'Boujdour' },
    ],
  },
  {
    ar: '12. الداخلة - وادي الذهب',
    fr: '12. Dakhla - Oued Ed Dahab',
    cities: [
      { ar: 'الداخلة', fr: 'Dakhla' },
      { ar: 'أوسرد', fr: 'Aousserd' },
    ],
  },
];

export default function AmbulanceScreen({ onBack, onNavigate, preferences }) {
  const { width } = useWindowDimensions();
  const styles = useMemo(() => createAmbulanceStyles(width), [width]);
  const s = useMemo(() => createScaler(width), [width]);
  const { colors, mode } = useAppTheme();
  const { language } = useI18n();
  const isDark = mode === 'dark';
  const isArabic = language === 'ar';

  const [step, setStep] = useState(1);
  const [selectedCity, setSelectedCity] = useState(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [toast, setToast] = useState({ visible: false, text: '', type: 'info', id: 0 });

  useEffect(() => {
    setSearchQuery('');
    setSelectedCity(null);
  }, [language]);

  const currentRegions = useMemo(() => {
    return MOROCCO_REGIONS.map(reg => ({
      title: isArabic ? reg.ar : reg.fr,
      data: reg.cities.map(city => ({
        display: isArabic ? city.ar : city.fr,
        ar: city.ar,
        fr: city.fr
      }))
    }));
  }, [isArabic]);

  const filteredSections = useMemo(() => {
    if (!searchQuery) return currentRegions;
    return currentRegions.map(region => ({
      ...region,
      data: region.data.filter(city =>
        city.display.toLowerCase().includes(searchQuery.toLowerCase()) ||
        city.ar.includes(searchQuery) ||
        city.fr.toLowerCase().includes(searchQuery.toLowerCase())
      )
    })).filter(region => region.data.length > 0);
  }, [searchQuery, currentRegions]);

  const showToast = (text, type = 'info') => {
    setToast({ visible: true, text: String(text || ''), type, id: Date.now() });
  };

  const getContactNumbers = () => {
    const customCities = new Set([
      'بركان', 'تاوريرت', 'جرادة', 'فجيج', 'أحفير', 'زايو', 'السعيدية',
      'فاس', 'مكناس', 'تازة', 'إفران', 'آزرو', 'صفرو', 'بولمان', 'الحاجب',
    ]);
    const rabatCities = new Set([
      'الرباط', 'سلا', 'القنيطرة', 'تمارة', 'الصخيرات', 'سيدي قاسم', 'سيدي سليمان',
    ]);
    const casablancaCities = new Set([
      'الدار البيضاء', 'المحمدية', 'الجديدة', 'سطات', 'برشيد', 'بنسليمان', 'سيدي بنور',
    ]);
    if (selectedCity && casablancaCities.has(selectedCity.ar)) {
      return { call: '+212522491616', whatsapp: '+212661502763' };
    }
    const laayouneCities = new Set(['العيون', 'السمارة', 'طرفاية', 'بوجدور']);
    if (selectedCity && laayouneCities.has(selectedCity.ar)) {
      return { call: '+212528997601', whatsapp: '0678989004' };
    }
    const soussMassaCities = new Set(['أكادير', 'إنزكان', 'تارودانت', 'تيزنيت', 'شتوكة آيت باها']);
    if (selectedCity && soussMassaCities.has(selectedCity.ar)) {
      return { call: '+212528840626', whatsapp: '+212662028249' };
    }
    const draaTafilaletCities = new Set(['الرشيدية', 'ورزازات', 'زاكورة', 'تنغير', 'ميدلت', 'الريصاني']);
    if (selectedCity && draaTafilaletCities.has(selectedCity.ar)) {
      return { call: '+212524885667', whatsapp: '+212661856513' };
    }
    const beniMellalCities = new Set(['بني ملال', 'خنيفرة', 'أزيلال', 'الفقيه بن صالح']);
    if (selectedCity && beniMellalCities.has(selectedCity.ar)) {
      return { call: '+212522491616', whatsapp: '+212661502763' };
    }
    if (selectedCity && rabatCities.has(selectedCity.ar)) {
      return { call: '+212537706017', whatsapp: '+212700995153' };
    }
    if (selectedCity && customCities.has(selectedCity.ar)) {
      return { call: '+212536703025', whatsapp: '+212661088413' };
    }
    return { call: DEFAULT_PHONE, whatsapp: DEFAULT_WHATSAPP };
  };

  const txt = isArabic
    ? {
        title: 'طلب سيارة إسعاف',
        subtitle: 'تدخل سريع 24/24 ساعة',
        heroTitle: 'سيارة إسعاف',
        badge: '24ساعة/7أيام',
        call: 'اتصل الآن',
        whatsapp: 'واتساب',
        website: 'زيارة الموقع',
        noApp: 'تعذر فتح التطبيق المطلوب.',
        step1Title: 'اختر مدينتك',
        step1Sub: 'يرجى تحديد المدينة لتقديم أفضل خدمة',
        searchPlaceholder: 'ابحث عن مدينة...',
        back: 'رجوع',
        callDirect: 'اتصال مباشر',
        whatsappDirect: 'واتساب مباشر',
        heroDesc: 'تصل سيارة الإسعاف الخاصة بنا عادةً في غضون 5 إلى 15 دقيقة. الخدمة متوفرة 24/24 ساعة و 7/7 أيام.',
        responseTime: 'وقت الاستجابة',
        responseValue: '5 - 15 دقيقة',
      }
    : {
        title: 'Commander une Ambulance',
        subtitle: 'Intervention rapide 24h/24',
        heroTitle: 'Ambulance',
        badge: '24h/7j',
        call: 'Appeler maintenant',
        whatsapp: 'WhatsApp',
        website: 'Visiter le site',
        noApp: 'Impossible d\'ouvrir l\'application.',
        step1Title: 'Choisissez votre ville',
        step1Sub: 'Sélectionnez une ville pour un service optimal',
        searchPlaceholder: 'Rechercher une ville...',
        back: 'Retour',
        callDirect: 'Appel direct',
        whatsappDirect: 'WhatsApp direct',
        heroDesc: 'Notre ambulance arrive généralement en 5 à 15 minutes. Service disponible 24h/24 et 7j/7.',
        responseTime: 'Temps de réponse',
        responseValue: '5 - 15 min',
      };

  const handleCall = async () => {
    const { call } = getContactNumbers();
    const cleanPhone = call.replace(/[^\d+]/g, '');
    try {
      await Linking.openURL(`tel:${cleanPhone}`);
    } catch {
      showToast(txt.noApp, 'error');
    }
  };

  const handleWhatsApp = async () => {
    const { whatsapp } = getContactNumbers();
    let digits = whatsapp.replace(/[^\d]/g, '');
    if (digits.startsWith('0')) digits = '212' + digits.slice(1);
    digits = digits.replace(/^\+/, '');
    const cityDisplay = selectedCity
      ? (isArabic ? selectedCity.ar : selectedCity.fr)
      : (isArabic ? 'مدينتي' : 'ma ville');
    const message = encodeURIComponent(
      isArabic
        ? `السلام عليكم، أحتاج إلى سيارة إسعاف في ${cityDisplay}.`
        : `Bonjour, j'ai besoin d'une ambulance d'urgence à ${cityDisplay}.`
    );
    try {
      await Linking.openURL(`https://wa.me/${digits}?text=${message}`);
    } catch {
      showToast(txt.noApp, 'error');
    }
  };

  const handleWebsite = async () => {
    try {
      await Linking.openURL(WEBSITE_URL);
    } catch {
      showToast(txt.noApp, 'error');
    }
  };

  const arFont = isArabic ? { fontFamily: 'Cairo_400Regular' } : null;
  const arFontBold = isArabic ? { fontFamily: 'Cairo_700Bold' } : null;

  return (
    <SafeAreaView style={[styles.screen, { backgroundColor: isDark ? colors.background : '#f8fafc' }]}>
      <TopToast toast={toast} onHide={() => setToast((prev) => ({ ...prev, visible: false }))} />

      {/* Header */}
      <View style={[styles.header, isDark && { backgroundColor: colors.surface, borderBottomColor: colors.border }]}>
        <TouchableOpacity style={styles.headerBackBtn} onPress={step === 1 ? onBack : () => setStep(1)} activeOpacity={0.7}>
          <Ionicons name={isArabic ? 'chevron-forward' : 'chevron-back'} size={22} color={isDark ? colors.textPrimary : '#111827'} />
        </TouchableOpacity>
        <Text style={[styles.headerTitle, arFontBold, { color: isDark ? colors.textPrimary : '#111827' }]}>
          {step === 1 ? txt.step1Title : txt.title}
        </Text>
        <View style={styles.headerRight} />
      </View>

      {step === 1 ? (
        <View style={{ flex: 1 }}>
          {/* Search */}
          <View style={[styles.searchWrap, isDark && { backgroundColor: colors.surface }]}>
            <View style={[styles.searchBar, isDark && { backgroundColor: colors.surfaceAlt, borderColor: colors.border }]}>
              <Ionicons name="search" size={18} color={isDark ? colors.textSecondary : '#9ca3af'} />
              <TextInput
                style={[styles.searchInput, { color: isDark ? colors.textPrimary : '#111827' }, isArabic && { textAlign: 'right', fontFamily: 'Cairo_400Regular' }]}
                placeholder={txt.searchPlaceholder}
                placeholderTextColor={isDark ? colors.textSecondary : '#9ca3af'}
                value={searchQuery}
                onChangeText={setSearchQuery}
              />
              {searchQuery.length > 0 && (
                <TouchableOpacity onPress={() => setSearchQuery('')} activeOpacity={0.7}>
                  <Ionicons name="close-circle" size={18} color={isDark ? colors.textSecondary : '#9ca3af'} />
                </TouchableOpacity>
              )}
            </View>

            {/* Quick actions */}
            <View style={styles.quickRow}>
              <TouchableOpacity style={styles.quickCallBtn} onPress={handleCall} activeOpacity={0.8}>
                <Ionicons name="call" size={16} color="#fff" />
                <Text style={[styles.quickBtnText, arFontBold]}>{txt.callDirect}</Text>
              </TouchableOpacity>
              <TouchableOpacity style={styles.quickWhatsappBtn} onPress={handleWhatsApp} activeOpacity={0.8}>
                <Ionicons name="logo-whatsapp" size={16} color="#fff" />
                <Text style={[styles.quickBtnText, arFontBold]}>{txt.whatsappDirect}</Text>
              </TouchableOpacity>
            </View>
          </View>

          {/* City list */}
          <SectionList
            sections={filteredSections}
            keyExtractor={(item) => item.ar}
            contentContainerStyle={styles.listContent}
            renderItem={({ item }) => (
              <TouchableOpacity
                style={[
                  styles.cityRow,
                  isDark && { borderBottomColor: colors.border },
                ]}
                onPress={() => { setSelectedCity(item); setStep(2); }}
                activeOpacity={0.6}
              >
                <Text style={[
                  styles.cityText,
                  { color: isDark ? colors.textPrimary : '#111827' },
                  arFont,
                ]}>
                  {item.display}
                </Text>
                <Ionicons name={isArabic ? 'chevron-back' : 'chevron-forward'} size={16} color={isDark ? colors.textMuted : '#d1d5db'} />
              </TouchableOpacity>
            )}
            renderSectionHeader={({ section: { title } }) => (
              <View style={[styles.regionHeader, { backgroundColor: isDark ? colors.background : '#f8fafc' }]}>
                <Text style={[styles.regionTitle, arFontBold, isDark && { color: colors.textSecondary }]}>{title}</Text>
              </View>
            )}
            showsVerticalScrollIndicator={false}
            stickySectionHeadersEnabled
          />
        </View>
      ) : (
        <ScrollView contentContainerStyle={styles.step2Content} showsVerticalScrollIndicator={false}>
          {/* Hero card */}
          <View style={[styles.heroCard, isDark && { backgroundColor: '#7f1d1d' }]}>
            <View style={styles.heroIconWrap}>
              <FontAwesome6 name="truck-medical" size={s(32, 26, 38)} color="rgba(255,255,255,0.9)" />
            </View>
            <Text style={[styles.heroTitle, arFontBold]}>
              {txt.heroTitle}
            </Text>
            <Text style={[styles.heroCityName, arFontBold]}>
              {isArabic ? selectedCity?.ar : selectedCity?.fr}
            </Text>
            <View style={styles.heroBadge}>
              <Ionicons name="time-outline" size={13} color="rgba(255,255,255,0.85)" />
              <Text style={[styles.heroBadgeText, arFont]}>{txt.badge}</Text>
            </View>
          </View>

          {/* Action buttons */}
          <View style={styles.actionsGroup}>
            <TouchableOpacity style={styles.callBtn} onPress={handleCall} activeOpacity={0.8}>
              <Ionicons name="call" size={20} color="#fff" />
              <Text style={[styles.actionBtnText, arFontBold]}>{txt.call}</Text>
            </TouchableOpacity>

            <TouchableOpacity style={styles.whatsappBtn} onPress={handleWhatsApp} activeOpacity={0.8}>
              <Ionicons name="logo-whatsapp" size={20} color="#fff" />
              <Text style={[styles.actionBtnText, arFontBold]}>{txt.whatsapp}</Text>
            </TouchableOpacity>

            <TouchableOpacity style={styles.webBtn} onPress={handleWebsite} activeOpacity={0.8}>
              <Ionicons name="globe-outline" size={20} color="#fff" />
              <Text style={[styles.actionBtnText, arFontBold]}>{txt.website}</Text>
            </TouchableOpacity>
          </View>

          {/* Info section */}
          <View style={[styles.infoCard, isDark && { backgroundColor: colors.surface, borderColor: colors.border }]}>
            <View style={styles.infoRow}>
              <View style={[styles.infoIconWrap, isDark && { backgroundColor: colors.surfaceAlt }]}>
                <Ionicons name="timer-outline" size={18} color="#dc2626" />
              </View>
              <View style={{ flex: 1 }}>
                <Text style={[styles.infoLabel, arFont, { color: isDark ? colors.textSecondary : '#6b7280' }]}>{txt.responseTime}</Text>
                <Text style={[styles.infoValue, arFontBold, { color: isDark ? colors.textPrimary : '#111827' }]}>{txt.responseValue}</Text>
              </View>
            </View>
            <Text style={[styles.infoDesc, arFont, { color: isDark ? colors.textSecondary : '#6b7280' }]}>
              {txt.heroDesc}
            </Text>
          </View>

          {/* Back button */}
          <TouchableOpacity
            style={[styles.backButton, isDark && { backgroundColor: colors.surface, borderColor: colors.border }]}
            onPress={() => setStep(1)}
            activeOpacity={0.7}
          >
            <Ionicons name="arrow-back" size={18} color={isDark ? colors.textPrimary : '#111827'} />
            <Text style={[styles.backButtonText, arFontBold, { color: isDark ? colors.textPrimary : '#111827' }]}>{txt.back}</Text>
          </TouchableOpacity>
        </ScrollView>
      )}
    </SafeAreaView>
  );
}
