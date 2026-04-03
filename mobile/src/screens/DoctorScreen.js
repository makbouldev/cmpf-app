import { useMemo, useState } from 'react';
import {
  ActivityIndicator,
  Alert,
  Image,
  Linking,
  Platform,
  SafeAreaView,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
  useWindowDimensions,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { useI18n } from '../i18n/I18nContext';
import { useAppTheme } from '../theme/ThemeContext';
import { createScaler } from '../utils/responsive';
import { createDoctorRequest } from '../services/api';
import { submitRequestWithFormSubmit } from '../services/requestDelivery';

const doctorMaleImg = require('../../assets/doctor_male.jpg');
const doctorFemaleImg = require('../../assets/doctor_female.jpg');

const DEFAULT_PHONE = '+212539941027';
const DEFAULT_WHATSAPP = '+212660884440';

const CITY_CONTACTS = {
  agadir: { name: 'Agadir', ar: 'أكادير', call: '+212 5 28 84 06 26', whatsapp: '+212 6 62 02 82 49' },
  casablanca: { name: 'Casablanca', ar: 'الدار البيضاء', call: '+212 5 22 49 16 16', whatsapp: '+212 6 61 50 27 63' },
  marrakech: { name: 'Marrakech', ar: 'مراكش', call: '+212 5 24 44 84 51', whatsapp: '+212 6 62 01 81 98' },
  rabat: { name: 'Rabat', ar: 'الرباط', call: '+212 5 37 70 60 17', whatsapp: '+212 7 00 99 51 53' },
  tanger: { name: 'Tanger', ar: 'طنجة', call: '+212 5 39 94 10 27', whatsapp: '+212 6 60 88 44 40' },
  fes: { name: 'Fès', ar: 'فاس', call: '+212 5 35 52 09 14', whatsapp: '+212 6 14 56 45 07' },
  meknes: { name: 'Meknès', ar: 'مكناس', call: '+212 5 35 52 09 14', whatsapp: '+212 6 14 56 45 07' },
  oujda: { name: 'Oujda', ar: 'وجدة', call: '+212 5 36 70 30 25', whatsapp: '+212 6 61 08 84 13' },
  laayoune: { name: 'Laâyoune', ar: 'العيون', call: '+212 5 28 99 76 01', whatsapp: '+212 6 78 98 90 04' },
};

const POPULAR_CITIES = [
  { id: 'agadir', fr: 'Agadir', ar: 'أكادير' },
  { id: 'casablanca', fr: 'Casablanca', ar: 'الدار البيضاء' },
  { id: 'marrakech', fr: 'Marrakech', ar: 'مراكش' },
  { id: 'rabat', fr: 'Rabat', ar: 'الرباط' },
  { id: 'tanger', fr: 'Tanger', ar: 'طنجة' },
  { id: 'fes', fr: 'Fès', ar: 'فاس' },
];

export default function DoctorScreen({ onNavigate, onBack, preferences }) {
  const { width } = useWindowDimensions();
  const s = useMemo(() => createScaler(width), [width]);
  const styles = useMemo(() => createStyles(width), [width]);
  const { language } = useI18n();
  const { colors, mode } = useAppTheme();
  const isDark = mode === 'dark';
  const isArabic = language === 'ar';
  const arRegular = isArabic ? { fontFamily: 'Cairo_400Regular' } : null;
  const arBold = isArabic ? { fontFamily: 'Cairo_700Bold' } : null;

  // Form State
  const initialUser = preferences?.account?.user || null;
  const [interventionType, setInterventionType] = useState('once'); // 'once' | 'continuous'
  const [doctorPreference, setDoctorPreference] = useState('any'); // 'male' | 'female' | 'any'
  const [fullName, setFullName] = useState(initialUser?.name || '');
  const [phone, setPhone] = useState(initialUser?.phone || preferences?.account?.phone || '');
  const [city, setCity] = useState(initialUser?.city || 'Agadir');
  const [address, setAddress] = useState('');
  const [symptoms, setSymptoms] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [successSubmitted, setSuccessSubmitted] = useState(false);

  // Translations
  const txt = {
    topTitle: isArabic ? 'طبيب الطوارئ والمنزل' : language === 'fr' ? 'Médecin urgentiste' : 'Emergency Doctor',
    topSub: isArabic ? 'استشارة ومرافقة طبية بالمنزل 24/7' : language === 'fr' ? 'Consultation & suivi à domicile 24/7' : 'Home consultation & care 24/7',
    heroBadge: isArabic ? 'خدمة طبية فورية 24/24' : language === 'fr' ? 'SERVICE MÉDICAL 24/24' : '24/7 MEDICAL SERVICE',
    heroTitle: isArabic ? 'طلب طبيب إلى المنزل' : language === 'fr' ? 'Médecin urgentiste à domicile' : 'Emergency Doctor at Home',
    heroDesc: isArabic
      ? 'فريق من الأطباء العامين والمختصين في طب المستعجلات، جاهزون للتنقل الفوري إلى منزلك لتقديم الفحص والعلاج.'
      : language === 'fr'
        ? 'Médecins généralistes et urgentistes hautement qualifiés, prêts à intervenir chez vous pour consultation, diagnostic et soins.'
        : 'Qualified emergency doctors ready to visit your home for urgent consultation, diagnosis and treatment.',
    responseTime: isArabic ? 'وصول تقديري: 20 إلى 35 دقيقة' : language === 'fr' ? 'Arrivée estimée : 20 à 35 min' : 'Estimated arrival: 20 to 35 min',

    // Section 1: Intervention Type
    sec1Title: isArabic ? '1. طبيعة التدخل الطبي' : language === 'fr' ? "1. Nature de l'intervention" : '1. Service Type',
    sec1Sub: isArabic ? 'حدد ما إذا كنت تحتاج فحصاً لمرة واحدة أو مرافقة مستمرة' : language === 'fr' ? 'Visite ponctuelle ou garde continue à domicile' : 'One-time visit or continuous home care',
    typeOnceTitle: isArabic ? 'استشارة فورية (مرة واحدة)' : language === 'fr' ? 'Visite ponctuelle (1 seule fois)' : 'One-time Urgent Visit',
    typeOnceBadge: isArabic ? 'مستعجل' : language === 'fr' ? 'Urgence' : 'Urgent',
    typeOnceDesc: isArabic
      ? 'فحص طبي فوري، تشخيص للحالة، وتقديم الوصفة الطبية والعلاجات الأولية بالمنزل.'
      : language === 'fr'
        ? "Examen clinique complet, diagnostic d'urgence et prescription immédiate à domicile."
        : 'Emergency physical exam, diagnosis and medical prescription at home.',
    typeContTitle: isArabic ? 'مرافقة ومبيت طبي مستمر' : language === 'fr' ? 'Garde & Suivi continu à domicile' : 'Continuous Home Care & Guard',
    typeContBadge: isArabic ? 'مرافقة دائمًا' : language === 'fr' ? '24h/24 ou Nuit' : '24/7 or Night',
    typeContDesc: isArabic
      ? 'طبيب أو ممرض ملازم للمريض بالمنزل للمراقبة الصحية المستمرة ومتابعة الحالات الحرجة أو ما بعد العمليات.'
      : language === 'fr'
        ? 'Présence continue d’un médecin ou soignant à domicile pour surveillance permanente et soins continus.'
        : 'Dedicated doctor or healthcare provider at home for continuous medical supervision.',

    // Section 2: Doctor Preference
    sec2Title: isArabic ? '2. تفضيل الطبيب المعالج' : language === 'fr' ? '2. Préférence du médecin' : '2. Doctor Preference',
    sec2Sub: isArabic ? 'اختر طبيباً أو طبيبة حسب رغبتك وراحتك الشخصية' : language === 'fr' ? 'Choisissez un médecin homme ou femme selon votre souhait' : 'Choose male or female doctor as you prefer',
    drMale: isArabic ? 'طبيب (رجل)' : language === 'fr' ? 'Médecin Homme' : 'Male Doctor',
    drMaleRole: isArabic ? 'طبيب عام / مستعجلات' : language === 'fr' ? 'Dr. Généraliste / Urgentiste' : 'General Practitioner',
    drFemale: isArabic ? 'طبيبة (امرأة)' : language === 'fr' ? 'Médecin Femme' : 'Female Doctor',
    drFemaleRole: isArabic ? 'طبيبة عامة / مستعجلات' : language === 'fr' ? 'Dre. Généraliste / Urgentiste' : 'General Practitioner',
    drAny: isArabic ? 'الأول المتاح' : language === 'fr' ? 'Premier disponible' : 'First Available',
    drAnyRole: isArabic ? 'الأسرع وصولاً' : language === 'fr' ? 'Le plus rapide' : 'Fastest arrival',

    // Section 3: Patient Form
    sec3Title: isArabic ? '3. معلومات المريض والموقع' : language === 'fr' ? '3. Informations du patient' : '3. Patient Information',
    sec3Sub: isArabic ? 'الرجاء ملء البيانات بدقة لتسهيل وصول الطبيب' : language === 'fr' ? 'Remplissez les détails pour l’intervention' : 'Fill details for medical dispatch',
    nameLabel: isArabic ? 'الاسم واللقب الكامل' : language === 'fr' ? 'Nom et prénom complet' : 'Full Name',
    namePlace: isArabic ? 'مثال: محمد العلمي' : language === 'fr' ? 'Ex: Mohamed Alami' : 'Ex: Mohamed Alami',
    phoneLabel: isArabic ? 'رقم الهاتف للتواصل' : language === 'fr' ? 'Numéro de téléphone' : 'Phone Number',
    phonePlace: '06 XX XX XX XX / 05 XX XX XX XX',
    cityLabel: isArabic ? 'المدينة' : language === 'fr' ? 'Ville' : 'City',
    cityPlace: isArabic ? 'اكتب مدينتك (مثال: أكادير، الدار البيضاء، مراكش...)' : language === 'fr' ? 'Saisissez votre ville (ex: Agadir, Casablanca...)' : 'Enter your city (e.g. Agadir, Casablanca...)',
    addressLabel: isArabic ? 'العنوان الدقيق بالمنزل' : language === 'fr' ? 'Adresse complète du domicile' : 'Home Address',
    addressPlace: isArabic ? 'الحي، اسم الشارع، رقم العمارة أو المنزل، الطابق...' : language === 'fr' ? 'Quartier, Rue, N° Immeuble/Maison, Étage...' : 'District, Street, Building No, Floor...',
    symptomsLabel: isArabic ? 'وصف الحالة المرضية والأعراض' : language === 'fr' ? 'Description des symptômes / Motif' : 'Symptoms / Medical reason',
    symptomsPlace: isArabic
      ? 'مثال: حمى شديدة، ضيق في التنفس، آلام حادة، مراقبة ضغط الدم، غيار جروح...'
      : language === 'fr'
        ? 'Ex: Forte fièvre, douleur thoracique, malaise, suivi post-opératoire...'
        : 'Ex: High fever, chest pain, dizziness, post-op care...',

    // Buttons & Actions
    submitBtn: isArabic ? 'تأكيد وإرسال طلب الطبيب' : language === 'fr' ? 'Confirmer la demande médicale' : 'Confirm Doctor Request',
    callBtn: isArabic ? 'اتصال مباشر بالطوارئ' : language === 'fr' ? 'Appel direct 24/7' : 'Direct Call 24/7',
    whatsappBtn: isArabic ? 'واتساب مباشر مع التفاصيل' : language === 'fr' ? 'WhatsApp direct' : 'Direct WhatsApp',
    requiredAlert: isArabic ? 'الرجاء ملء الاسم، رقم الهاتف، المدينة، والعنوان.' : language === 'fr' ? 'Veuillez renseigner le nom, le téléphone, la ville et l’adresse.' : 'Please enter name, phone, city, and address.',
    successTitle: isArabic ? 'تم إرسال طلبك بنجاح' : language === 'fr' ? 'Demande envoyée avec succès !' : 'Request Sent Successfully!',
    successDesc: isArabic
      ? 'يقوم مركز التنسيق الطبي بالاتصال بك هاتفياً في هذه اللحظات لتأكيد انطلاق الطبيب.'
      : language === 'fr'
        ? 'Notre régulateur médical vous contacte immédiatement par téléphone pour confirmer le départ du médecin.'
        : 'Our medical coordinator is calling you immediately to confirm the doctor departure.',
    backHome: isArabic ? 'العودة للرئيسية' : language === 'fr' ? "Retour à l'accueil" : 'Back to Home',
    newRequest: isArabic ? 'طلب آخر' : language === 'fr' ? 'Nouvelle demande' : 'New Request',
  };

  const currentCityContacts = useMemo(() => {
    const raw = String(city || '').toLowerCase().trim();
    const match = Object.keys(CITY_CONTACTS).find((key) => raw.includes(key));
    return match ? CITY_CONTACTS[match] : CITY_CONTACTS.agadir;
  }, [city]);

  const handleCall = async () => {
    const rawNumber = currentCityContacts.call || DEFAULT_PHONE;
    const cleanNumber = rawNumber.replace(/[^\d+]/g, '');
    const url = `tel:${cleanNumber}`;
    try {
      if (Platform.OS === 'web') {
        window.location.href = url;
      } else {
        await Linking.openURL(url);
      }
    } catch (_err) {
      Alert.alert('Erreur', 'Impossible de lancer l’appel.');
    }
  };

  const buildWhatsAppMessage = () => {
    const typeLabel = interventionType === 'once' ? txt.typeOnceTitle : txt.typeContTitle;
    const prefLabel =
      doctorPreference === 'male' ? txt.drMale : doctorPreference === 'female' ? txt.drFemale : txt.drAny;

    if (isArabic) {
      return (
        `السلام عليكم ورحمة الله،\n` +
        `أرغب في طلب طبيب منزلي من CMPF Assistance:\n` +
        `• نوع التدخل: ${typeLabel}\n` +
        `• تفضيل الطبيب: ${prefLabel}\n` +
        `• الاسم الكامل: ${fullName || 'غير محدد'}\n` +
        `• الهاتف: ${phone || 'غير محدد'}\n` +
        `• المدينة: ${city || 'غير محدد'}\n` +
        `• العنوان: ${address || 'غير محدد'}\n` +
        `• الحالة / الأعراض: ${symptoms || 'غير محدد'}\n` +
        `المرجو التأكيد والتواصل معي في أقرب وقت.`
      );
    }

    return (
      `Bonjour CMPF Assistance,\n` +
      `Je souhaite demander une intervention de médecin à domicile :\n` +
      `• Type d'intervention : ${typeLabel}\n` +
      `• Préférence médecin : ${prefLabel}\n` +
      `• Nom complet : ${fullName || 'Non spécifié'}\n` +
      `• Téléphone : ${phone || 'Non spécifié'}\n` +
      `• Ville : ${city || 'Non spécifiée'}\n` +
      `• Adresse : ${address || 'Non spécifiée'}\n` +
      `• Symptômes / Motif : ${symptoms || 'Non spécifié'}\n` +
      `Merci de confirmer la prise en charge rapide.`
    );
  };

  const handleWhatsApp = async () => {
    const rawWhatsapp = currentCityContacts.whatsapp || DEFAULT_WHATSAPP;
    let digits = rawWhatsapp.replace(/[^\d]/g, '');
    if (digits.startsWith('0')) {
      digits = '212' + digits.slice(1);
    }
    const message = encodeURIComponent(buildWhatsAppMessage());
    const url = `https://wa.me/${digits}?text=${message}`;
    try {
      if (Platform.OS === 'web') {
        window.open(url, '_blank');
      } else {
        await Linking.openURL(url);
      }
    } catch (_err) {
      Alert.alert('Erreur', 'Impossible d’ouvrir WhatsApp.');
    }
  };

  const handleSubmit = async () => {
    const trimmedName = fullName.trim();
    const trimmedPhone = phone.trim();
    const trimmedCity = city.trim();
    const trimmedAddress = address.trim();

    if (!trimmedName || !trimmedPhone || !trimmedCity || !trimmedAddress) {
      Alert.alert(isArabic ? 'تنبيه' : 'Attention', txt.requiredAlert);
      return;
    }

    setSubmitting(true);

    const typeLabel = interventionType === 'once' ? 'Visite ponctuelle (1 seule fois)' : 'Garde & Suivi continu à domicile (24h/24)';
    const prefLabel = doctorPreference === 'male' ? 'Médecin Homme' : doctorPreference === 'female' ? 'Médecin Femme' : 'Premier disponible';
    const notesSummary = `[Type: ${typeLabel}] [Préférence: ${prefLabel}] [Symptômes: ${symptoms.trim() || 'Non renseigné'}]`;

    const payload = {
      name: trimmedName,
      phone: trimmedPhone,
      fromLocation: trimmedCity || 'Agadir',
      address: trimmedAddress,
      notes: notesSummary,
      transferMode: 'same_city',
    };

    try {
      // 1. Send to Backend API
      await createDoctorRequest(payload);
    } catch (apiErr) {
      console.log('Doctor API warning (will fallback to FormSubmit):', apiErr?.message);
    }

    try {
      // 2. Send via FormSubmit email
      await submitRequestWithFormSubmit({ type: 'doctor-home', payload });
    } catch (fsErr) {
      console.log('FormSubmit warning:', fsErr?.message);
    }

    try {
      // 3. Backup to local AsyncStorage for admin/user history
      const rawStored = await AsyncStorage.getItem('@cmpf_doctor_requests');
      const list = rawStored ? JSON.parse(rawStored) : [];
      list.unshift({
        id: Date.now().toString(),
        type: 'doctor-home',
        ...payload,
        createdAt: new Date().toISOString(),
      });
      await AsyncStorage.setItem('@cmpf_doctor_requests', JSON.stringify(list.slice(0, 50)));
    } catch (_e) {}

    setSubmitting(false);
    setSuccessSubmitted(true);
  };

  return (
    <SafeAreaView style={[styles.screen, { backgroundColor: isDark ? colors.background : '#f8fafc' }]}>
      <ScrollView contentContainerStyle={styles.content} showsVerticalScrollIndicator={false}>
        {/* Navigation Header */}
        <View style={[styles.headerCard, isDark && { backgroundColor: colors.surface, borderColor: colors.border }]}>
          <View style={styles.topBar}>
            <TouchableOpacity
              style={[styles.backBtn, isDark && { backgroundColor: colors.surfaceAlt, borderColor: colors.border }]}
              onPress={onBack}
              activeOpacity={0.8}
            >
              <Ionicons name="arrow-back" size={s(20, 18, 24)} color={isDark ? colors.textPrimary : '#203554'} />
            </TouchableOpacity>

            <View style={styles.topTitleWrap}>
              <Text style={[styles.topTitle, arBold, { color: colors.textPrimary }]}>{txt.topTitle}</Text>
              <Text style={[styles.topSub, arRegular, { color: colors.textSecondary }]}>{txt.topSub}</Text>
            </View>

            <TouchableOpacity
              style={[styles.topActionBtn, isDark && { backgroundColor: colors.surfaceAlt, borderColor: colors.border }]}
              onPress={() => onNavigate?.('settings')}
              activeOpacity={0.8}
            >
              <Ionicons name="settings-outline" size={18} color={colors.textPrimary} />
            </TouchableOpacity>
          </View>
        </View>

        {/* Hero Card */}
        <LinearGradient
          colors={isDark ? ['#0f2942', '#0a1d30'] : ['#0284c7', '#0369a1']}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 1 }}
          style={styles.heroCard}
        >
          <View style={styles.heroBadgeRow}>
            <View style={styles.heroBadge}>
              <Ionicons name="medkit" size={12} color="#ffffff" style={{ marginRight: 4 }} />
              <Text style={[styles.heroBadgeText, arBold]}>{txt.heroBadge}</Text>
            </View>
            <View style={styles.heroTimeBadge}>
              <Ionicons name="time" size={12} color="#ffffff" style={{ marginRight: 4 }} />
              <Text style={[styles.heroTimeText, arBold]}>{txt.responseTime}</Text>
            </View>
          </View>

          <Text style={[styles.heroTitle, arBold]}>{txt.heroTitle}</Text>
          <Text style={[styles.heroDesc, arRegular]}>{txt.heroDesc}</Text>

          {/* Quick Contact Action Bar */}
          <View style={styles.heroActionsRow}>
            <TouchableOpacity style={styles.heroCallBtn} onPress={handleCall} activeOpacity={0.9}>
              <Ionicons name="call" size={16} color="#ffffff" style={{ marginRight: 6 }} />
              <Text style={[styles.heroActionBtnText, arBold]}>{txt.callBtn}</Text>
            </TouchableOpacity>
            <TouchableOpacity style={styles.heroWhatsappBtn} onPress={handleWhatsApp} activeOpacity={0.9}>
              <Ionicons name="logo-whatsapp" size={16} color="#ffffff" style={{ marginRight: 6 }} />
              <Text style={[styles.heroActionBtnText, arBold]}>{txt.whatsappBtn}</Text>
            </TouchableOpacity>
          </View>
        </LinearGradient>

        {/* Success Confirmation Modal / Card */}
        {successSubmitted ? (
          <View style={[styles.successCard, isDark && { backgroundColor: colors.surface, borderColor: '#10b981' }]}>
            <View style={styles.successIconCircle}>
              <Ionicons name="checkmark-done" size={32} color="#ffffff" />
            </View>
            <Text style={[styles.successTitle, arBold, { color: colors.textPrimary }]}>{txt.successTitle}</Text>
            <Text style={[styles.successDesc, arRegular, { color: colors.textSecondary }]}>{txt.successDesc}</Text>

            <View style={styles.successBtnsRow}>
              <TouchableOpacity
                style={[styles.successCallBtn, { backgroundColor: '#0284c7' }]}
                onPress={handleCall}
                activeOpacity={0.9}
              >
                <Ionicons name="call" size={16} color="#ffffff" style={{ marginRight: 6 }} />
                <Text style={[styles.successCallText, arBold]}>{txt.callBtn}</Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={[styles.successHomeBtn, isDark && { backgroundColor: colors.surfaceAlt }]}
                onPress={onBack}
                activeOpacity={0.8}
              >
                <Text style={[styles.successHomeText, arBold, { color: colors.textPrimary }]}>{txt.backHome}</Text>
              </TouchableOpacity>
            </View>
          </View>
        ) : (
          <>
            {/* SECTION 1: Nature de l'intervention (Visite ponctuelle vs Garde continue) */}
            <View style={[styles.sectionContainer, isDark && { backgroundColor: colors.surface, borderColor: colors.border }]}>
              <View style={styles.sectionHeader}>
                <View style={[styles.sectionNumberBadge, { backgroundColor: 'rgba(2, 132, 199, 0.12)' }]}>
                  <Ionicons name="calendar-outline" size={16} color="#0284c7" />
                </View>
                <View style={{ flex: 1 }}>
                  <Text style={[styles.sectionTitle, arBold, { color: colors.textPrimary }]}>{txt.sec1Title}</Text>
                  <Text style={[styles.sectionSub, arRegular, { color: colors.textSecondary }]}>{txt.sec1Sub}</Text>
                </View>
              </View>

              <View style={styles.choiceCardsCol}>
                {/* Option A: Visite ponctuelle */}
                <TouchableOpacity
                  style={[
                    styles.choiceCard,
                    interventionType === 'once' && styles.choiceCardActive,
                    isDark && { backgroundColor: colors.surfaceAlt, borderColor: colors.border },
                    isDark && interventionType === 'once' && { borderColor: '#0284c7', backgroundColor: 'rgba(2, 132, 199, 0.15)' },
                  ]}
                  onPress={() => setInterventionType('once')}
                  activeOpacity={0.85}
                >
                  <View style={styles.choiceCardTop}>
                    <View style={styles.choiceIconBadge}>
                      <Ionicons name="flash" size={18} color="#0284c7" />
                    </View>
                    <View style={{ flex: 1, paddingHorizontal: 8 }}>
                      <Text style={[styles.choiceCardTitle, arBold, { color: colors.textPrimary }]}>{txt.typeOnceTitle}</Text>
                      <View style={[styles.choiceBadgeTag, isDark && { backgroundColor: 'rgba(2, 132, 199, 0.2)', borderColor: '#0284c7' }]}>
                        <Text style={[styles.choiceBadgeTagText, arBold, isDark && { color: '#38bdf8' }]}>{txt.typeOnceBadge}</Text>
                      </View>
                    </View>
                    <View style={[styles.radioCircle, interventionType === 'once' && styles.radioCircleActive]}>
                      {interventionType === 'once' && <View style={styles.radioInner} />}
                    </View>
                  </View>
                  <Text style={[styles.choiceCardDesc, arRegular, { color: colors.textSecondary }]}>{txt.typeOnceDesc}</Text>
                </TouchableOpacity>

                {/* Option B: Garde & Suivi continu */}
                <TouchableOpacity
                  style={[
                    styles.choiceCard,
                    interventionType === 'continuous' && styles.choiceCardActive,
                    isDark && { backgroundColor: colors.surfaceAlt, borderColor: colors.border },
                    isDark && interventionType === 'continuous' && { borderColor: '#0284c7', backgroundColor: 'rgba(2, 132, 199, 0.15)' },
                  ]}
                  onPress={() => setInterventionType('continuous')}
                  activeOpacity={0.85}
                >
                  <View style={styles.choiceCardTop}>
                    <View style={[styles.choiceIconBadge, { backgroundColor: 'rgba(16, 185, 129, 0.15)' }]}>
                      <Ionicons name="bed" size={18} color="#10b981" />
                    </View>
                    <View style={{ flex: 1, paddingHorizontal: 8 }}>
                      <Text style={[styles.choiceCardTitle, arBold, { color: colors.textPrimary }]}>{txt.typeContTitle}</Text>
                      <View style={[styles.choiceBadgeTag, { backgroundColor: '#ecfdf5', borderColor: '#a7f3d0' }, isDark && { backgroundColor: 'rgba(16, 185, 129, 0.2)', borderColor: '#059669' }]}>
                        <Text style={[styles.choiceBadgeTagText, arBold, { color: '#047857' }, isDark && { color: '#34d399' }]}>{txt.typeContBadge}</Text>
                      </View>
                    </View>
                    <View style={[styles.radioCircle, interventionType === 'continuous' && styles.radioCircleActive]}>
                      {interventionType === 'continuous' && <View style={styles.radioInner} />}
                    </View>
                  </View>
                  <Text style={[styles.choiceCardDesc, arRegular, { color: colors.textSecondary }]}>{txt.typeContDesc}</Text>
                </TouchableOpacity>
              </View>
            </View>

            {/* SECTION 2: Préférence du Médecin (Cartoon 3D avatars) */}
            <View style={[styles.sectionContainer, isDark && { backgroundColor: colors.surface, borderColor: colors.border }]}>
              <View style={styles.sectionHeader}>
                <View style={[styles.sectionNumberBadge, { backgroundColor: 'rgba(16, 185, 129, 0.12)' }]}>
                  <Ionicons name="people-outline" size={16} color="#10b981" />
                </View>
                <View style={{ flex: 1 }}>
                  <Text style={[styles.sectionTitle, arBold, { color: colors.textPrimary }]}>{txt.sec2Title}</Text>
                  <Text style={[styles.sectionSub, arRegular, { color: colors.textSecondary }]}>{txt.sec2Sub}</Text>
                </View>
              </View>

              {/* 3 Doctor Preference Cards */}
              <View style={styles.doctorCardsRow}>
                {/* Doctor Male */}
                <TouchableOpacity
                  style={[
                    styles.doctorCard,
                    doctorPreference === 'male' && styles.doctorCardActive,
                    isDark && { backgroundColor: colors.surfaceAlt, borderColor: colors.border },
                    isDark && doctorPreference === 'male' && { borderColor: '#0284c7', backgroundColor: 'rgba(2, 132, 199, 0.18)' },
                  ]}
                  onPress={() => setDoctorPreference('male')}
                  activeOpacity={0.85}
                >
                  <View style={styles.doctorImgWrap}>
                    <Image source={doctorMaleImg} style={styles.doctorCartoonImg} resizeMode="cover" />
                    {doctorPreference === 'male' && (
                      <View style={styles.doctorActiveCheck}>
                        <Ionicons name="checkmark" size={12} color="#ffffff" />
                      </View>
                    )}
                  </View>
                  <Text style={[styles.doctorName, arBold, { color: colors.textPrimary }]} numberOfLines={1}>
                    {txt.drMale}
                  </Text>
                  <Text style={[styles.doctorRole, arRegular, { color: colors.textSecondary }]} numberOfLines={1}>
                    {txt.drMaleRole}
                  </Text>
                </TouchableOpacity>

                {/* Doctor Female */}
                <TouchableOpacity
                  style={[
                    styles.doctorCard,
                    doctorPreference === 'female' && styles.doctorCardActive,
                    isDark && { backgroundColor: colors.surfaceAlt, borderColor: colors.border },
                    isDark && doctorPreference === 'female' && { borderColor: '#0284c7', backgroundColor: 'rgba(2, 132, 199, 0.18)' },
                  ]}
                  onPress={() => setDoctorPreference('female')}
                  activeOpacity={0.85}
                >
                  <View style={styles.doctorImgWrap}>
                    <Image source={doctorFemaleImg} style={styles.doctorCartoonImg} resizeMode="cover" />
                    {doctorPreference === 'female' && (
                      <View style={styles.doctorActiveCheck}>
                        <Ionicons name="checkmark" size={12} color="#ffffff" />
                      </View>
                    )}
                  </View>
                  <Text style={[styles.doctorName, arBold, { color: colors.textPrimary }]} numberOfLines={1}>
                    {txt.drFemale}
                  </Text>
                  <Text style={[styles.doctorRole, arRegular, { color: colors.textSecondary }]} numberOfLines={1}>
                    {txt.drFemaleRole}
                  </Text>
                </TouchableOpacity>

                {/* First Available */}
                <TouchableOpacity
                  style={[
                    styles.doctorCard,
                    doctorPreference === 'any' && styles.doctorCardActive,
                    isDark && { backgroundColor: colors.surfaceAlt, borderColor: colors.border },
                    isDark && doctorPreference === 'any' && { borderColor: '#0284c7', backgroundColor: 'rgba(2, 132, 199, 0.18)' },
                  ]}
                  onPress={() => setDoctorPreference('any')}
                  activeOpacity={0.85}
                >
                  <View style={[styles.doctorImgWrap, styles.doctorAnyAvatarWrap, isDark && { backgroundColor: 'rgba(2, 132, 199, 0.2)', borderColor: '#0284c7' }]}>
                    <Ionicons name="flash" size={28} color="#0284c7" />
                    {doctorPreference === 'any' && (
                      <View style={styles.doctorActiveCheck}>
                        <Ionicons name="checkmark" size={12} color="#ffffff" />
                      </View>
                    )}
                  </View>
                  <Text style={[styles.doctorName, arBold, { color: colors.textPrimary }]} numberOfLines={1}>
                    {txt.drAny}
                  </Text>
                  <Text style={[styles.doctorRole, arRegular, { color: '#0284c7' }]} numberOfLines={1}>
                    {txt.drAnyRole}
                  </Text>
                </TouchableOpacity>
              </View>
            </View>

            {/* SECTION 3: Formulaire du Patient & Adresse */}
            <View style={[styles.sectionContainer, isDark && { backgroundColor: colors.surface, borderColor: colors.border }]}>
              <View style={styles.sectionHeader}>
                <View style={[styles.sectionNumberBadge, { backgroundColor: 'rgba(239, 68, 68, 0.12)' }]}>
                  <Ionicons name="person-outline" size={16} color="#ef4444" />
                </View>
                <View style={{ flex: 1 }}>
                  <Text style={[styles.sectionTitle, arBold, { color: colors.textPrimary }]}>{txt.sec3Title}</Text>
                  <Text style={[styles.sectionSub, arRegular, { color: colors.textSecondary }]}>{txt.sec3Sub}</Text>
                </View>
              </View>

              {/* Nom & Prénom */}
              <View style={styles.fieldWrap}>
                <Text style={[styles.fieldLabel, arBold, { color: colors.textPrimary }]}>{txt.nameLabel} *</Text>
                <View style={[styles.inputBox, isDark && { backgroundColor: colors.surfaceAlt, borderColor: colors.border }]}>
                  <Ionicons name="person" size={18} color={colors.textSecondary} style={{ marginRight: 8 }} />
                  <TextInput
                    style={[styles.textInput, arRegular, { color: colors.textPrimary }]}
                    placeholder={txt.namePlace}
                    placeholderTextColor={colors.textSecondary}
                    value={fullName}
                    onChangeText={setFullName}
                  />
                </View>
              </View>

              {/* Téléphone */}
              <View style={styles.fieldWrap}>
                <Text style={[styles.fieldLabel, arBold, { color: colors.textPrimary }]}>{txt.phoneLabel} *</Text>
                <View style={[styles.inputBox, isDark && { backgroundColor: colors.surfaceAlt, borderColor: colors.border }]}>
                  <Ionicons name="call" size={18} color={colors.textSecondary} style={{ marginRight: 8 }} />
                  <TextInput
                    style={[styles.textInput, { color: colors.textPrimary }]}
                    placeholder={txt.phonePlace}
                    placeholderTextColor={colors.textSecondary}
                    keyboardType="phone-pad"
                    value={phone}
                    onChangeText={setPhone}
                  />
                </View>
              </View>

              {/* Ville Input */}
              <View style={styles.fieldWrap}>
                <Text style={[styles.fieldLabel, arBold, { color: colors.textPrimary }]}>{txt.cityLabel} *</Text>
                <View style={[styles.inputBox, isDark && { backgroundColor: colors.surfaceAlt, borderColor: colors.border }]}>
                  <Ionicons name="business" size={18} color="#0284c7" style={{ marginRight: 8 }} />
                  <TextInput
                    style={[styles.textInput, arRegular, { color: colors.textPrimary }]}
                    placeholder={txt.cityPlace}
                    placeholderTextColor={colors.textSecondary}
                    value={city}
                    onChangeText={setCity}
                  />
                </View>
              </View>

              {/* Adresse Complète */}
              <View style={styles.fieldWrap}>
                <Text style={[styles.fieldLabel, arBold, { color: colors.textPrimary }]}>{txt.addressLabel} *</Text>
                <View style={[styles.inputBox, isDark && { backgroundColor: colors.surfaceAlt, borderColor: colors.border }]}>
                  <Ionicons name="location" size={18} color="#ef4444" style={{ marginRight: 8 }} />
                  <TextInput
                    style={[styles.textInput, arRegular, { color: colors.textPrimary }]}
                    placeholder={txt.addressPlace}
                    placeholderTextColor={colors.textSecondary}
                    value={address}
                    onChangeText={setAddress}
                  />
                </View>
              </View>

              {/* Symptômes / Description */}
              <View style={styles.fieldWrap}>
                <Text style={[styles.fieldLabel, arBold, { color: colors.textPrimary }]}>{txt.symptomsLabel}</Text>
                <View
                  style={[
                    styles.inputBox,
                    styles.textareaBox,
                    isDark && { backgroundColor: colors.surfaceAlt, borderColor: colors.border },
                  ]}
                >
                  <TextInput
                    style={[styles.textInput, styles.textarea, arRegular, { color: colors.textPrimary }]}
                    placeholder={txt.symptomsPlace}
                    placeholderTextColor={colors.textSecondary}
                    multiline
                    numberOfLines={3}
                    textAlignVertical="top"
                    value={symptoms}
                    onChangeText={setSymptoms}
                  />
                </View>
              </View>

              {/* Submit Button */}
              <TouchableOpacity
                style={[styles.submitBtn, submitting && { opacity: 0.7 }]}
                onPress={handleSubmit}
                disabled={submitting}
                activeOpacity={0.9}
              >
                <LinearGradient
                  colors={['#0284c7', '#0369a1']}
                  start={{ x: 0, y: 0 }}
                  end={{ x: 1, y: 0 }}
                  style={styles.submitBtnGradient}
                >
                  {submitting ? (
                    <ActivityIndicator color="#ffffff" size="small" />
                  ) : (
                    <>
                      <Ionicons name="checkmark-circle" size={20} color="#ffffff" style={{ marginRight: 8 }} />
                      <Text style={[styles.submitBtnText, arBold]}>{txt.submitBtn}</Text>
                    </>
                  )}
                </LinearGradient>
              </TouchableOpacity>
            </View>
          </>
        )}
      </ScrollView>
    </SafeAreaView>
  );
}

const createStyles = (width) => {
  const s = createScaler(width);
  const isNarrow = width <= 390;
  const horizontal = isNarrow ? s(14, 12, 18) : s(20, 16, 26);

  return StyleSheet.create({
    screen: {
      flex: 1,
    },
    content: {
      paddingHorizontal: horizontal,
      paddingTop: s(12, 10, 16),
      paddingBottom: s(36, 28, 44),
      gap: s(14, 12, 18),
    },

    // Header Card (identical to PharmaciesScreen)
    headerCard: {
      backgroundColor: '#ffffff',
      borderRadius: s(24, 20, 28),
      borderWidth: 1,
      borderColor: '#e2e8f0',
      paddingHorizontal: s(16, 14, 20),
      paddingVertical: s(14, 12, 18),
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
      fontSize: s(17, 15, 20),
      fontWeight: '700',
      color: '#0f172a',
      textAlign: 'center',
    },
    topSub: {
      fontSize: s(12, 11, 14),
      color: '#64748b',
      marginTop: 2,
      textAlign: 'center',
    },
    topActionBtn: {
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

    // Hero Card
    heroCard: {
      borderRadius: s(24, 20, 28),
      padding: s(18, 16, 22),
      shadowColor: '#0284c7',
      shadowOpacity: 0.22,
      shadowRadius: 18,
      shadowOffset: { width: 0, height: 8 },
      elevation: 6,
    },
    heroBadgeRow: {
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'space-between',
      marginBottom: s(10, 8, 12),
      flexWrap: 'wrap',
      gap: 6,
    },
    heroBadge: {
      flexDirection: 'row',
      alignItems: 'center',
      backgroundColor: 'rgba(255, 255, 255, 0.2)',
      paddingHorizontal: s(10, 8, 12),
      paddingVertical: s(4, 3, 6),
      borderRadius: 999,
      borderWidth: 1,
      borderColor: 'rgba(255, 255, 255, 0.3)',
    },
    heroBadgeText: {
      color: '#ffffff',
      fontSize: s(11, 10, 12),
      fontWeight: '700',
      letterSpacing: 0.5,
    },
    heroTimeBadge: {
      flexDirection: 'row',
      alignItems: 'center',
      backgroundColor: 'rgba(0, 0, 0, 0.2)',
      paddingHorizontal: s(10, 8, 12),
      paddingVertical: s(4, 3, 6),
      borderRadius: 999,
    },
    heroTimeText: {
      color: '#ffffff',
      fontSize: s(11, 10, 12),
      fontWeight: '600',
    },
    heroTitle: {
      color: '#ffffff',
      fontSize: s(20, 18, 24),
      fontWeight: '800',
      marginBottom: s(6, 4, 8),
    },
    heroDesc: {
      color: 'rgba(255, 255, 255, 0.92)',
      fontSize: s(12.5, 11.5, 14),
      lineHeight: s(18, 16, 20),
      marginBottom: s(14, 12, 16),
    },
    heroActionsRow: {
      flexDirection: 'row',
      alignItems: 'center',
      gap: s(10, 8, 12),
    },
    heroCallBtn: {
      flex: 1,
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'center',
      backgroundColor: '#ef4444',
      paddingVertical: s(10, 8, 12),
      borderRadius: s(14, 12, 16),
      shadowColor: '#ef4444',
      shadowOpacity: 0.3,
      shadowRadius: 8,
      shadowOffset: { width: 0, height: 4 },
      elevation: 3,
    },
    heroWhatsappBtn: {
      flex: 1,
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'center',
      backgroundColor: '#10b981',
      paddingVertical: s(10, 8, 12),
      borderRadius: s(14, 12, 16),
      shadowColor: '#10b981',
      shadowOpacity: 0.3,
      shadowRadius: 8,
      shadowOffset: { width: 0, height: 4 },
      elevation: 3,
    },
    heroActionBtnText: {
      color: '#ffffff',
      fontSize: s(12.5, 11.5, 14),
      fontWeight: '700',
    },

    // Sections
    sectionContainer: {
      backgroundColor: '#ffffff',
      borderRadius: s(24, 20, 28),
      borderWidth: 1,
      borderColor: '#e2e8f0',
      padding: s(16, 14, 20),
      shadowColor: '#0f172a',
      shadowOpacity: 0.05,
      shadowRadius: 14,
      shadowOffset: { width: 0, height: 4 },
      elevation: 3,
      gap: s(12, 10, 14),
    },
    sectionHeader: {
      flexDirection: 'row',
      alignItems: 'center',
      gap: s(10, 8, 12),
      marginBottom: 2,
    },
    sectionNumberBadge: {
      width: s(36, 32, 40),
      height: s(36, 32, 40),
      borderRadius: s(12, 10, 14),
      alignItems: 'center',
      justifyContent: 'center',
    },
    sectionTitle: {
      fontSize: s(15.5, 14, 17),
      fontWeight: '700',
      color: '#0f172a',
    },
    sectionSub: {
      fontSize: s(11.5, 10.5, 13),
      color: '#64748b',
      marginTop: 1,
    },

    // Choice Cards (Visite vs Garde)
    choiceCardsCol: {
      gap: s(10, 8, 12),
    },
    choiceCard: {
      backgroundColor: '#f8fafc',
      borderRadius: s(18, 16, 20),
      borderWidth: 1.5,
      borderColor: '#e2e8f0',
      padding: s(14, 12, 16),
    },
    choiceCardActive: {
      borderColor: '#0284c7',
      backgroundColor: '#f0f9ff',
    },
    choiceCardTop: {
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'space-between',
      marginBottom: s(6, 4, 8),
    },
    choiceIconBadge: {
      width: s(36, 32, 40),
      height: s(36, 32, 40),
      borderRadius: 999,
      backgroundColor: 'rgba(2, 132, 199, 0.12)',
      alignItems: 'center',
      justifyContent: 'center',
    },
    choiceCardTitle: {
      fontSize: s(14, 13, 16),
      fontWeight: '700',
      color: '#0f172a',
    },
    choiceBadgeTag: {
      alignSelf: 'flex-start',
      backgroundColor: '#e0f2fe',
      borderWidth: 1,
      borderColor: '#bae6fd',
      paddingHorizontal: 8,
      paddingVertical: 2,
      borderRadius: 999,
      marginTop: 2,
    },
    choiceBadgeTagText: {
      fontSize: s(10, 9, 11),
      color: '#0369a1',
      fontWeight: '700',
    },
    choiceCardDesc: {
      fontSize: s(11.5, 10.5, 13),
      lineHeight: s(16, 14, 18),
      color: '#64748b',
    },
    radioCircle: {
      width: 22,
      height: 22,
      borderRadius: 11,
      borderWidth: 2,
      borderColor: '#cbd5e1',
      alignItems: 'center',
      justifyContent: 'center',
    },
    radioCircleActive: {
      borderColor: '#0284c7',
    },
    radioInner: {
      width: 12,
      height: 12,
      borderRadius: 6,
      backgroundColor: '#0284c7',
    },

    // Doctor Avatar Selection Row
    doctorCardsRow: {
      flexDirection: 'row',
      gap: s(10, 8, 12),
      marginTop: 4,
    },
    doctorCard: {
      flex: 1,
      backgroundColor: '#f8fafc',
      borderRadius: s(18, 16, 20),
      borderWidth: 1.5,
      borderColor: '#e2e8f0',
      paddingVertical: s(12, 10, 14),
      paddingHorizontal: s(6, 4, 8),
      alignItems: 'center',
      justifyContent: 'center',
    },
    doctorCardActive: {
      borderColor: '#0284c7',
      backgroundColor: '#f0f9ff',
      shadowColor: '#0284c7',
      shadowOpacity: 0.15,
      shadowRadius: 10,
      shadowOffset: { width: 0, height: 4 },
      elevation: 3,
    },
    doctorImgWrap: {
      position: 'relative',
      width: s(64, 56, 72),
      height: s(64, 56, 72),
      borderRadius: 999,
      marginBottom: s(8, 6, 10),
      borderWidth: 2,
      borderColor: '#cbd5e1',
      overflow: 'hidden',
    },
    doctorCartoonImg: {
      width: '100%',
      height: '100%',
    },
    doctorAnyAvatarWrap: {
      backgroundColor: '#e0f2fe',
      alignItems: 'center',
      justifyContent: 'center',
      borderWidth: 2,
      borderColor: '#7dd3fc',
    },
    doctorActiveCheck: {
      position: 'absolute',
      bottom: 0,
      right: 0,
      width: 20,
      height: 20,
      borderRadius: 10,
      backgroundColor: '#10b981',
      alignItems: 'center',
      justifyContent: 'center',
      borderWidth: 2,
      borderColor: '#ffffff',
    },
    doctorName: {
      fontSize: s(12.5, 11.5, 14),
      fontWeight: '700',
      color: '#0f172a',
      textAlign: 'center',
    },
    doctorRole: {
      fontSize: s(10, 9, 11),
      color: '#64748b',
      textAlign: 'center',
      marginTop: 2,
    },

    // Form inputs
    fieldWrap: {
      gap: 6,
    },
    fieldLabel: {
      fontSize: s(13, 12, 14),
      fontWeight: '700',
      color: '#334155',
    },
    inputBox: {
      flexDirection: 'row',
      alignItems: 'center',
      backgroundColor: '#f8fafc',
      borderRadius: s(14, 12, 16),
      borderWidth: 1,
      borderColor: '#e2e8f0',
      paddingHorizontal: s(12, 10, 14),
      paddingVertical: s(10, 8, 12),
    },
    textareaBox: {
      alignItems: 'flex-start',
      minHeight: s(80, 70, 90),
    },
    textInput: {
      flex: 1,
      fontSize: s(13.5, 12.5, 15),
      color: '#0f172a',
      padding: 0,
    },
    textarea: {
      minHeight: s(60, 50, 70),
    },

    // City selector pills
    cityPillsRow: {
      flexDirection: 'row',
      gap: 8,
      paddingVertical: 4,
    },
    cityPill: {
      backgroundColor: '#f1f5f9',
      borderWidth: 1,
      borderColor: '#e2e8f0',
      paddingHorizontal: s(14, 12, 16),
      paddingVertical: s(8, 6, 10),
      borderRadius: 999,
    },
    cityPillActive: {
      backgroundColor: '#0284c7',
      borderColor: '#0284c7',
    },
    cityPillText: {
      fontSize: s(12, 11, 13),
      fontWeight: '600',
      color: '#475569',
    },
    cityPillTextActive: {
      color: '#ffffff',
      fontWeight: '700',
    },

    // Submit button
    submitBtn: {
      borderRadius: s(16, 14, 18),
      overflow: 'hidden',
      marginTop: 8,
      shadowColor: '#0284c7',
      shadowOpacity: 0.28,
      shadowRadius: 14,
      shadowOffset: { width: 0, height: 6 },
      elevation: 4,
    },
    submitBtnGradient: {
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'center',
      paddingVertical: s(14, 12, 16),
      paddingHorizontal: s(16, 14, 20),
    },
    submitBtnText: {
      color: '#ffffff',
      fontSize: s(15, 14, 17),
      fontWeight: '800',
    },

    // Success Card
    successCard: {
      backgroundColor: '#ffffff',
      borderRadius: s(24, 20, 28),
      borderWidth: 2,
      borderColor: '#10b981',
      padding: s(24, 20, 28),
      alignItems: 'center',
      shadowColor: '#10b981',
      shadowOpacity: 0.2,
      shadowRadius: 16,
      shadowOffset: { width: 0, height: 6 },
      elevation: 4,
      gap: s(12, 10, 14),
    },
    successIconCircle: {
      width: s(64, 56, 72),
      height: s(64, 56, 72),
      borderRadius: 999,
      backgroundColor: '#10b981',
      alignItems: 'center',
      justifyContent: 'center',
      shadowColor: '#10b981',
      shadowOpacity: 0.4,
      shadowRadius: 12,
      shadowOffset: { width: 0, height: 6 },
      elevation: 4,
    },
    successTitle: {
      fontSize: s(18, 16, 21),
      fontWeight: '800',
      color: '#0f172a',
      textAlign: 'center',
    },
    successDesc: {
      fontSize: s(13, 12, 14.5),
      lineHeight: s(19, 17, 21),
      color: '#64748b',
      textAlign: 'center',
    },
    successBtnsRow: {
      width: '100%',
      gap: 10,
      marginTop: 8,
    },
    successCallBtn: {
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'center',
      paddingVertical: s(12, 10, 14),
      borderRadius: s(14, 12, 16),
    },
    successCallText: {
      color: '#ffffff',
      fontSize: s(14, 13, 15),
      fontWeight: '700',
    },
    successHomeBtn: {
      alignItems: 'center',
      justifyContent: 'center',
      paddingVertical: s(12, 10, 14),
      borderRadius: s(14, 12, 16),
      backgroundColor: '#f1f5f9',
    },
    successHomeText: {
      fontSize: s(14, 13, 15),
      fontWeight: '700',
      color: '#334155',
    },
  });
};
