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

  const initialUser = preferences?.account?.user || null;
  const [interventionType, setInterventionType] = useState('once');
  const [doctorPreference, setDoctorPreference] = useState('any');
  const [fullName, setFullName] = useState(initialUser?.name || '');
  const [phone, setPhone] = useState(initialUser?.phone || preferences?.account?.phone || '');
  const [city, setCity] = useState(initialUser?.city || 'Agadir');
  const [address, setAddress] = useState('');
  const [symptoms, setSymptoms] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [successSubmitted, setSuccessSubmitted] = useState(false);

  const txt = {
    topTitle: isArabic ? 'طبيب الطوارئ والمنزل' : language === 'fr' ? 'Médecin urgentiste' : 'Emergency Doctor',
    topSub: isArabic ? 'استشارة ومرافقة طبية بالمنزل 24/7' : language === 'fr' ? 'Consultation & suivi à domicile 24/7' : 'Home consultation & care 24/7',
    heroTitle: isArabic ? 'طلب طبيب إلى المنزل' : language === 'fr' ? 'Médecin urgentiste à domicile' : 'Emergency Doctor at Home',
    heroDesc: isArabic
      ? 'فريق من الأطباء العامين والمختصين في طب المستعجلات، جاهزون للتنقل الفوري إلى منزلك.'
      : language === 'fr'
        ? 'Médecins généralistes et urgentistes qualifiés, prêts à intervenir chez vous.'
        : 'Qualified emergency doctors ready to visit your home.',
    responseTime: isArabic ? '20 - 35 دقيقة' : '20 - 35 min',
    sec1Title: isArabic ? 'طبيعة التدخل الطبي' : language === 'fr' ? "Nature de l'intervention" : 'Service Type',
    typeOnceTitle: isArabic ? 'استشارة فورية' : language === 'fr' ? 'Visite ponctuelle' : 'One-time Visit',
    typeOnceDesc: isArabic
      ? 'فحص طبي فوري، تشخيص للحالة، وتقديم الوصفة الطبية.'
      : language === 'fr'
        ? "Examen clinique, diagnostic d'urgence et prescription à domicile."
        : 'Emergency exam, diagnosis and prescription at home.',
    typeContTitle: isArabic ? 'مرافقة طبية مستمرة' : language === 'fr' ? 'Garde & Suivi continu' : 'Continuous Care',
    typeContDesc: isArabic
      ? 'طبيب ملازم للمريض بالمنزل للمراقبة الصحية المستمرة.'
      : language === 'fr'
        ? "Présence continue d'un médecin à domicile pour surveillance permanente."
        : 'Dedicated doctor at home for continuous medical supervision.',
    sec2Title: isArabic ? 'تفضيل الطبيب' : language === 'fr' ? 'Préférence du médecin' : 'Doctor Preference',
    drMale: isArabic ? 'طبيب' : language === 'fr' ? 'Homme' : 'Male',
    drMaleRole: isArabic ? 'طبيب عام' : language === 'fr' ? 'Généraliste' : 'General',
    drFemale: isArabic ? 'طبيبة' : language === 'fr' ? 'Femme' : 'Female',
    drFemaleRole: isArabic ? 'طبيبة عامة' : language === 'fr' ? 'Généraliste' : 'General',
    drAny: isArabic ? 'الأول المتاح' : language === 'fr' ? 'Premier dispo.' : 'First Available',
    drAnyRole: isArabic ? 'الأسرع وصولاً' : language === 'fr' ? 'Le plus rapide' : 'Fastest',
    sec3Title: isArabic ? 'معلومات المريض' : language === 'fr' ? 'Informations du patient' : 'Patient Information',
    nameLabel: isArabic ? 'الاسم الكامل' : language === 'fr' ? 'Nom complet' : 'Full Name',
    namePlace: isArabic ? 'مثال: محمد العلمي' : 'Ex: Mohamed Alami',
    phoneLabel: isArabic ? 'رقم الهاتف' : language === 'fr' ? 'Téléphone' : 'Phone',
    phonePlace: '06 XX XX XX XX',
    cityLabel: isArabic ? 'المدينة' : language === 'fr' ? 'Ville' : 'City',
    cityPlace: isArabic ? 'مدينتك' : language === 'fr' ? 'Votre ville' : 'Your city',
    addressLabel: isArabic ? 'العنوان' : language === 'fr' ? 'Adresse complète' : 'Full Address',
    addressPlace: isArabic ? 'الحي، الشارع، رقم العمارة...' : language === 'fr' ? 'Quartier, Rue, N°...' : 'District, Street, No...',
    symptomsLabel: isArabic ? 'الأعراض' : language === 'fr' ? 'Symptômes / Motif' : 'Symptoms',
    symptomsPlace: isArabic
      ? 'حمى، ضيق تنفس، آلام...'
      : language === 'fr'
        ? 'Fièvre, douleur, malaise...'
        : 'Fever, pain, dizziness...',
    submitBtn: isArabic ? 'تأكيد الطلب' : language === 'fr' ? 'Confirmer la demande' : 'Confirm Request',
    callBtn: isArabic ? 'اتصال مباشر' : language === 'fr' ? 'Appeler' : 'Call Now',
    whatsappBtn: isArabic ? 'واتساب' : 'WhatsApp',
    requiredAlert: isArabic ? 'الرجاء ملء الاسم، الهاتف، المدينة، والعنوان.' : language === 'fr' ? 'Veuillez renseigner le nom, téléphone, ville et adresse.' : 'Please fill name, phone, city, and address.',
    successTitle: isArabic ? 'تم إرسال طلبك' : language === 'fr' ? 'Demande envoyée !' : 'Request Sent!',
    successDesc: isArabic
      ? 'سيتصل بك مركز التنسيق الطبي لتأكيد انطلاق الطبيب.'
      : language === 'fr'
        ? 'Notre régulateur vous contacte pour confirmer le départ du médecin.'
        : 'Our coordinator will call to confirm the doctor departure.',
    backHome: isArabic ? 'الرئيسية' : language === 'fr' ? "Retour à l'accueil" : 'Back Home',
    newRequest: isArabic ? 'طلب جديد' : language === 'fr' ? 'Nouvelle demande' : 'New Request',
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
      Alert.alert('Erreur', "Impossible de lancer l'appel.");
    }
  };

  const buildWhatsAppMessage = () => {
    const typeLabel = interventionType === 'once' ? txt.typeOnceTitle : txt.typeContTitle;
    const prefLabel =
      doctorPreference === 'male' ? txt.drMale : doctorPreference === 'female' ? txt.drFemale : txt.drAny;

    if (isArabic) {
      return (
        `السلام عليكم،\n` +
        `أرغب في طلب طبيب منزلي من CMPF:\n` +
        `• نوع التدخل: ${typeLabel}\n` +
        `• تفضيل الطبيب: ${prefLabel}\n` +
        `• الاسم: ${fullName || 'غير محدد'}\n` +
        `• الهاتف: ${phone || 'غير محدد'}\n` +
        `• المدينة: ${city || 'غير محدد'}\n` +
        `• العنوان: ${address || 'غير محدد'}\n` +
        `• الأعراض: ${symptoms || 'غير محدد'}\n` +
        `المرجو التأكيد.`
      );
    }

    return (
      `Bonjour CMPF,\n` +
      `Demande médecin à domicile :\n` +
      `• Type : ${typeLabel}\n` +
      `• Préférence : ${prefLabel}\n` +
      `• Nom : ${fullName || 'Non spécifié'}\n` +
      `• Tél : ${phone || 'Non spécifié'}\n` +
      `• Ville : ${city || 'Non spécifiée'}\n` +
      `• Adresse : ${address || 'Non spécifiée'}\n` +
      `• Symptômes : ${symptoms || 'Non spécifié'}\n` +
      `Merci de confirmer.`
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
      Alert.alert('Erreur', "Impossible d'ouvrir WhatsApp.");
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

    const typeLabel = interventionType === 'once' ? 'Visite ponctuelle' : 'Garde & Suivi continu';
    const prefLabel = doctorPreference === 'male' ? 'Homme' : doctorPreference === 'female' ? 'Femme' : 'Premier disponible';
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
      await createDoctorRequest(payload);
    } catch (apiErr) {
      console.log('Doctor API warning:', apiErr?.message);
    }

    try {
      await submitRequestWithFormSubmit({ type: 'doctor-home', payload });
    } catch (fsErr) {
      console.log('FormSubmit warning:', fsErr?.message);
    }

    try {
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

  const dk = isDark;
  const cardBg = dk ? colors.surface : '#ffffff';
  const cardBorder = dk ? colors.border : '#e5e7eb';
  const inputBg = dk ? colors.surfaceAlt : '#f9fafb';
  const inputBorder = dk ? colors.border : '#d1d5db';
  const textColor = dk ? colors.textPrimary : '#111827';
  const textSec = dk ? colors.textSecondary : '#6b7280';

  return (
    <SafeAreaView style={[styles.screen, { backgroundColor: dk ? colors.background : '#f8fafc' }]}>
      {/* Header */}
      <View style={[styles.header, dk && { backgroundColor: colors.surface, borderBottomColor: colors.border }]}>
        <TouchableOpacity style={styles.headerBack} onPress={onBack} activeOpacity={0.7}>
          <Ionicons name="chevron-back" size={22} color={textColor} />
        </TouchableOpacity>
        <Text style={[styles.headerTitle, arBold, { color: textColor }]}>{txt.topTitle}</Text>
        <View style={styles.headerBack} />
      </View>

      <ScrollView contentContainerStyle={styles.content} showsVerticalScrollIndicator={false}>
        {/* Hero Card */}
        <View style={styles.heroCard}>
          <View style={styles.heroTopRow}>
            <View style={styles.heroIconWrap}>
              <Ionicons name="medkit" size={20} color="#ffffff" />
            </View>
            <Text style={[styles.heroTime, arRegular]}>{txt.responseTime}</Text>
          </View>
          <Text style={[styles.heroTitle, arBold]}>{txt.heroTitle}</Text>
          <Text style={[styles.heroDesc, arRegular]}>{txt.heroDesc}</Text>
          <View style={styles.heroActions}>
            <TouchableOpacity style={styles.heroCallBtn} onPress={handleCall} activeOpacity={0.85}>
              <Ionicons name="call" size={16} color="#ffffff" />
              <Text style={[styles.heroCallText, arBold]}>{txt.callBtn}</Text>
            </TouchableOpacity>
            <TouchableOpacity style={styles.heroWaBtn} onPress={handleWhatsApp} activeOpacity={0.85}>
              <Ionicons name="logo-whatsapp" size={16} color="#ffffff" />
              <Text style={[styles.heroWaText, arBold]}>{txt.whatsappBtn}</Text>
            </TouchableOpacity>
          </View>
        </View>

        {successSubmitted ? (
          <View style={[styles.successCard, dk && { backgroundColor: cardBg, borderColor: '#059669' }]}>
            <View style={styles.successIcon}>
              <Ionicons name="checkmark" size={32} color="#ffffff" />
            </View>
            <Text style={[styles.successTitle, arBold, { color: textColor }]}>{txt.successTitle}</Text>
            <Text style={[styles.successDesc, arRegular, { color: textSec }]}>{txt.successDesc}</Text>
            <TouchableOpacity style={styles.successCallBtn} onPress={handleCall} activeOpacity={0.85}>
              <Ionicons name="call" size={16} color="#ffffff" />
              <Text style={[styles.successCallText, arBold]}>{txt.callBtn}</Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={[styles.successBackBtn, dk && { backgroundColor: colors.surfaceAlt }]}
              onPress={onBack}
              activeOpacity={0.85}
            >
              <Text style={[styles.successBackText, arBold, { color: textColor }]}>{txt.backHome}</Text>
            </TouchableOpacity>
          </View>
        ) : (
          <>
            {/* Section 1: Intervention Type */}
            <View style={[styles.section, { backgroundColor: cardBg, borderColor: cardBorder }]}>
              <Text style={[styles.sectionTitle, arBold, { color: textColor }]}>{txt.sec1Title}</Text>

              <TouchableOpacity
                style={[
                  styles.optionCard,
                  { borderColor: cardBorder },
                  dk && { backgroundColor: colors.surfaceAlt },
                  interventionType === 'once' && styles.optionCardSelected,
                  dk && interventionType === 'once' && { borderColor: '#2563eb', backgroundColor: 'rgba(37, 99, 235, 0.1)' },
                ]}
                onPress={() => setInterventionType('once')}
                activeOpacity={0.8}
              >
                <View style={styles.optionRow}>
                  <View style={styles.optionContent}>
                    <Text style={[styles.optionTitle, arBold, { color: textColor }]}>{txt.typeOnceTitle}</Text>
                    <Text style={[styles.optionDesc, arRegular, { color: textSec }]}>{txt.typeOnceDesc}</Text>
                  </View>
                  <View style={[styles.radio, interventionType === 'once' && styles.radioSelected]}>
                    {interventionType === 'once' && <View style={styles.radioDot} />}
                  </View>
                </View>
              </TouchableOpacity>

              <TouchableOpacity
                style={[
                  styles.optionCard,
                  { borderColor: cardBorder },
                  dk && { backgroundColor: colors.surfaceAlt },
                  interventionType === 'continuous' && styles.optionCardSelected,
                  dk && interventionType === 'continuous' && { borderColor: '#2563eb', backgroundColor: 'rgba(37, 99, 235, 0.1)' },
                ]}
                onPress={() => setInterventionType('continuous')}
                activeOpacity={0.8}
              >
                <View style={styles.optionRow}>
                  <View style={styles.optionContent}>
                    <Text style={[styles.optionTitle, arBold, { color: textColor }]}>{txt.typeContTitle}</Text>
                    <Text style={[styles.optionDesc, arRegular, { color: textSec }]}>{txt.typeContDesc}</Text>
                  </View>
                  <View style={[styles.radio, interventionType === 'continuous' && styles.radioSelected]}>
                    {interventionType === 'continuous' && <View style={styles.radioDot} />}
                  </View>
                </View>
              </TouchableOpacity>
            </View>

            {/* Section 2: Doctor Preference */}
            <View style={[styles.section, { backgroundColor: cardBg, borderColor: cardBorder }]}>
              <Text style={[styles.sectionTitle, arBold, { color: textColor }]}>{txt.sec2Title}</Text>
              <View style={styles.doctorRow}>
                {[
                  { key: 'male', img: doctorMaleImg, label: txt.drMale, sub: txt.drMaleRole },
                  { key: 'female', img: doctorFemaleImg, label: txt.drFemale, sub: txt.drFemaleRole },
                  { key: 'any', img: null, label: txt.drAny, sub: txt.drAnyRole },
                ].map((doc) => {
                  const active = doctorPreference === doc.key;
                  return (
                    <TouchableOpacity
                      key={doc.key}
                      style={[
                        styles.doctorCard,
                        { borderColor: cardBorder },
                        dk && { backgroundColor: colors.surfaceAlt },
                        active && styles.doctorCardSelected,
                        dk && active && { borderColor: '#2563eb', backgroundColor: 'rgba(37, 99, 235, 0.1)' },
                      ]}
                      onPress={() => setDoctorPreference(doc.key)}
                      activeOpacity={0.8}
                    >
                      {doc.img ? (
                        <View style={[styles.doctorAvatar, active && { borderColor: '#2563eb' }]}>
                          <Image source={doc.img} style={styles.doctorAvatarImg} resizeMode="cover" />
                        </View>
                      ) : (
                        <View style={[styles.doctorAvatar, styles.doctorAvatarIcon, active && { borderColor: '#2563eb', backgroundColor: '#eff6ff' }]}>
                          <Ionicons name="flash" size={22} color="#2563eb" />
                        </View>
                      )}
                      <Text style={[styles.doctorLabel, arBold, { color: textColor }]} numberOfLines={1}>{doc.label}</Text>
                      <Text style={[styles.doctorSub, arRegular, { color: textSec }]} numberOfLines={1}>{doc.sub}</Text>
                      {active && (
                        <View style={styles.doctorCheck}>
                          <Ionicons name="checkmark" size={10} color="#ffffff" />
                        </View>
                      )}
                    </TouchableOpacity>
                  );
                })}
              </View>
            </View>

            {/* Section 3: Patient Info */}
            <View style={[styles.section, { backgroundColor: cardBg, borderColor: cardBorder }]}>
              <Text style={[styles.sectionTitle, arBold, { color: textColor }]}>{txt.sec3Title}</Text>

              <View style={styles.field}>
                <Text style={[styles.label, arBold, { color: textColor }]}>{txt.nameLabel} *</Text>
                <TextInput
                  style={[styles.input, arRegular, { color: textColor, backgroundColor: inputBg, borderColor: inputBorder }]}
                  placeholder={txt.namePlace}
                  placeholderTextColor={textSec}
                  value={fullName}
                  onChangeText={setFullName}
                />
              </View>

              <View style={styles.field}>
                <Text style={[styles.label, arBold, { color: textColor }]}>{txt.phoneLabel} *</Text>
                <TextInput
                  style={[styles.input, { color: textColor, backgroundColor: inputBg, borderColor: inputBorder }]}
                  placeholder={txt.phonePlace}
                  placeholderTextColor={textSec}
                  keyboardType="phone-pad"
                  value={phone}
                  onChangeText={setPhone}
                />
              </View>

              <View style={styles.field}>
                <Text style={[styles.label, arBold, { color: textColor }]}>{txt.cityLabel} *</Text>
                <TextInput
                  style={[styles.input, arRegular, { color: textColor, backgroundColor: inputBg, borderColor: inputBorder }]}
                  placeholder={txt.cityPlace}
                  placeholderTextColor={textSec}
                  value={city}
                  onChangeText={setCity}
                />
              </View>

              <View style={styles.field}>
                <Text style={[styles.label, arBold, { color: textColor }]}>{txt.addressLabel} *</Text>
                <TextInput
                  style={[styles.input, arRegular, { color: textColor, backgroundColor: inputBg, borderColor: inputBorder }]}
                  placeholder={txt.addressPlace}
                  placeholderTextColor={textSec}
                  value={address}
                  onChangeText={setAddress}
                />
              </View>

              <View style={styles.field}>
                <Text style={[styles.label, arBold, { color: textColor }]}>{txt.symptomsLabel}</Text>
                <TextInput
                  style={[styles.input, styles.textarea, arRegular, { color: textColor, backgroundColor: inputBg, borderColor: inputBorder }]}
                  placeholder={txt.symptomsPlace}
                  placeholderTextColor={textSec}
                  multiline
                  numberOfLines={3}
                  textAlignVertical="top"
                  value={symptoms}
                  onChangeText={setSymptoms}
                />
              </View>

              <TouchableOpacity
                style={[styles.submitBtn, submitting && { opacity: 0.6 }]}
                onPress={handleSubmit}
                disabled={submitting}
                activeOpacity={0.85}
              >
                {submitting ? (
                  <ActivityIndicator color="#ffffff" size="small" />
                ) : (
                  <Text style={[styles.submitText, arBold]}>{txt.submitBtn}</Text>
                )}
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
  const px = width <= 390 ? s(14, 12, 18) : s(20, 16, 26);

  return StyleSheet.create({
    screen: { flex: 1 },

    header: {
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'space-between',
      backgroundColor: '#ffffff',
      paddingHorizontal: px,
      paddingVertical: s(12, 10, 16),
      borderBottomWidth: 1,
      borderBottomColor: '#f3f4f6',
    },
    headerBack: {
      width: 40,
      height: 40,
      alignItems: 'center',
      justifyContent: 'center',
    },
    headerTitle: {
      flex: 1,
      textAlign: 'center',
      fontSize: s(17, 15, 19),
      fontWeight: '700',
    },

    content: {
      padding: px,
      paddingBottom: s(40, 32, 48),
      gap: s(16, 14, 20),
    },

    heroCard: {
      backgroundColor: '#2563eb',
      borderRadius: 16,
      padding: s(20, 16, 24),
    },
    heroTopRow: {
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'space-between',
      marginBottom: s(12, 10, 14),
    },
    heroIconWrap: {
      width: 36,
      height: 36,
      borderRadius: 10,
      backgroundColor: 'rgba(255,255,255,0.2)',
      alignItems: 'center',
      justifyContent: 'center',
    },
    heroTime: {
      color: 'rgba(255,255,255,0.85)',
      fontSize: s(13, 11, 14),
      fontWeight: '600',
    },
    heroTitle: {
      color: '#ffffff',
      fontSize: s(20, 17, 23),
      fontWeight: '800',
      marginBottom: s(6, 4, 8),
    },
    heroDesc: {
      color: 'rgba(255,255,255,0.8)',
      fontSize: s(13, 12, 15),
      lineHeight: s(19, 17, 21),
      marginBottom: s(16, 12, 18),
    },
    heroActions: {
      flexDirection: 'row',
      gap: s(10, 8, 12),
    },
    heroCallBtn: {
      flex: 1,
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'center',
      gap: 6,
      backgroundColor: '#dc2626',
      height: 44,
      borderRadius: 10,
    },
    heroCallText: {
      color: '#ffffff',
      fontSize: s(13, 12, 14),
      fontWeight: '700',
    },
    heroWaBtn: {
      flex: 1,
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'center',
      gap: 6,
      backgroundColor: '#059669',
      height: 44,
      borderRadius: 10,
    },
    heroWaText: {
      color: '#ffffff',
      fontSize: s(13, 12, 14),
      fontWeight: '700',
    },

    section: {
      backgroundColor: '#ffffff',
      borderRadius: 16,
      borderWidth: 1,
      borderColor: '#e5e7eb',
      padding: s(18, 14, 22),
      gap: s(14, 12, 16),
      shadowColor: '#000000',
      shadowOpacity: 0.04,
      shadowRadius: 3,
      shadowOffset: { width: 0, height: 1 },
      elevation: 2,
    },
    sectionTitle: {
      fontSize: s(17, 15, 19),
      fontWeight: '700',
    },

    optionCard: {
      borderWidth: 1,
      borderColor: '#e5e7eb',
      borderRadius: 12,
      padding: s(14, 12, 16),
      backgroundColor: '#ffffff',
    },
    optionCardSelected: {
      borderWidth: 2,
      borderColor: '#2563eb',
      backgroundColor: '#eff6ff',
    },
    optionRow: {
      flexDirection: 'row',
      alignItems: 'center',
    },
    optionContent: {
      flex: 1,
      paddingRight: 12,
    },
    optionTitle: {
      fontSize: s(15, 13, 16),
      fontWeight: '700',
      marginBottom: 4,
    },
    optionDesc: {
      fontSize: s(12, 11, 13),
      lineHeight: s(17, 15, 19),
    },
    radio: {
      width: 22,
      height: 22,
      borderRadius: 11,
      borderWidth: 2,
      borderColor: '#d1d5db',
      alignItems: 'center',
      justifyContent: 'center',
    },
    radioSelected: {
      borderColor: '#2563eb',
    },
    radioDot: {
      width: 12,
      height: 12,
      borderRadius: 6,
      backgroundColor: '#2563eb',
    },

    doctorRow: {
      flexDirection: 'row',
      gap: s(10, 8, 12),
    },
    doctorCard: {
      flex: 1,
      alignItems: 'center',
      borderWidth: 1,
      borderColor: '#e5e7eb',
      borderRadius: 12,
      paddingVertical: s(14, 12, 16),
      paddingHorizontal: s(6, 4, 8),
      backgroundColor: '#ffffff',
    },
    doctorCardSelected: {
      borderWidth: 2,
      borderColor: '#2563eb',
      backgroundColor: '#eff6ff',
    },
    doctorAvatar: {
      width: s(56, 48, 64),
      height: s(56, 48, 64),
      borderRadius: 999,
      borderWidth: 2,
      borderColor: '#d1d5db',
      overflow: 'hidden',
      marginBottom: s(8, 6, 10),
    },
    doctorAvatarImg: {
      width: '100%',
      height: '100%',
    },
    doctorAvatarIcon: {
      backgroundColor: '#f0f9ff',
      alignItems: 'center',
      justifyContent: 'center',
      borderColor: '#bfdbfe',
    },
    doctorLabel: {
      fontSize: s(13, 11, 14),
      fontWeight: '700',
      textAlign: 'center',
    },
    doctorSub: {
      fontSize: s(11, 10, 12),
      textAlign: 'center',
      marginTop: 2,
    },
    doctorCheck: {
      position: 'absolute',
      top: 8,
      right: 8,
      width: 18,
      height: 18,
      borderRadius: 9,
      backgroundColor: '#2563eb',
      alignItems: 'center',
      justifyContent: 'center',
    },

    field: {
      gap: 6,
    },
    label: {
      fontSize: s(13, 12, 14),
      fontWeight: '600',
    },
    input: {
      height: 48,
      borderRadius: 10,
      borderWidth: 1,
      borderColor: '#d1d5db',
      paddingHorizontal: 14,
      fontSize: s(15, 13, 16),
      backgroundColor: '#f9fafb',
    },
    textarea: {
      height: 90,
      paddingTop: 12,
      paddingBottom: 12,
      textAlignVertical: 'top',
    },

    submitBtn: {
      height: 52,
      borderRadius: 12,
      backgroundColor: '#dc2626',
      alignItems: 'center',
      justifyContent: 'center',
      marginTop: 4,
    },
    submitText: {
      color: '#ffffff',
      fontSize: s(16, 14, 17),
      fontWeight: '700',
    },

    successCard: {
      backgroundColor: '#ffffff',
      borderRadius: 16,
      borderWidth: 1,
      borderColor: '#e5e7eb',
      padding: s(28, 22, 32),
      alignItems: 'center',
      gap: s(14, 12, 16),
    },
    successIcon: {
      width: 56,
      height: 56,
      borderRadius: 28,
      backgroundColor: '#059669',
      alignItems: 'center',
      justifyContent: 'center',
    },
    successTitle: {
      fontSize: s(19, 17, 22),
      fontWeight: '800',
      textAlign: 'center',
    },
    successDesc: {
      fontSize: s(14, 12, 15),
      lineHeight: s(20, 18, 22),
      textAlign: 'center',
    },
    successCallBtn: {
      width: '100%',
      flexDirection: 'row',
      height: 48,
      borderRadius: 12,
      backgroundColor: '#2563eb',
      alignItems: 'center',
      justifyContent: 'center',
      gap: 6,
    },
    successCallText: {
      color: '#ffffff',
      fontSize: s(15, 13, 16),
      fontWeight: '700',
    },
    successBackBtn: {
      width: '100%',
      height: 48,
      borderRadius: 12,
      backgroundColor: '#f3f4f6',
      alignItems: 'center',
      justifyContent: 'center',
    },
    successBackText: {
      fontSize: s(15, 13, 16),
      fontWeight: '700',
    },
  });
};
