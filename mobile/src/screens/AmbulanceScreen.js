import { useEffect, useMemo, useRef, useState } from 'react';
import { Animated, Easing, Linking, Modal, Pressable, SafeAreaView, ScrollView, Text, TextInput, TouchableOpacity, View, useWindowDimensions } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import * as Location from 'expo-location';
import TopToast from '../components/TopToast';
import { createScaler } from '../utils/responsive';
import { createAmbulanceStyles } from '../styles/ambulanceStyles';
import { createAmbulanceRequest } from '../services/api';
import { submitRequestWithFormSubmit } from '../services/requestDelivery';
import { useAppTheme } from '../theme/ThemeContext';
import { useI18n } from '../i18n/I18nContext';

const emptyForm = {
  transferMode: 'same_city',
  fromLocation: 'casablanca',
  toLocation: 'casablanca',
  interventionType: 'urgent',
  name: '',
  phone: '',
  address: '',
  notes: '',
};

const CITY_OPTIONS = [
  { id: 'agadir', fr: 'Agadir', en: 'Agadir', ar: 'أكادير' },
  { id: 'casablanca', fr: 'Casablanca', en: 'Casablanca', ar: 'الدار البيضاء' },
  { id: 'fes', fr: 'Fes', en: 'Fez', ar: 'فاس' },
  { id: 'laayoune', fr: 'Laayoune', en: 'Laayoune', ar: 'العيون' },
  { id: 'marrakech', fr: 'Marrakech', en: 'Marrakech', ar: 'مراكش' },
  { id: 'meknes', fr: 'Meknes', en: 'Meknes', ar: 'مكناس' },
  { id: 'nador', fr: 'Nador', en: 'Nador', ar: 'الناظور' },
  { id: 'ouarzazate', fr: 'Ouarzazate', en: 'Ouarzazate', ar: 'ورزازات' },
  { id: 'oujda', fr: 'Oujda', en: 'Oujda', ar: 'وجدة' },
  { id: 'rabat', fr: 'Rabat', en: 'Rabat', ar: 'الرباط' },
  { id: 'tanger', fr: 'Tanger', en: 'Tangier', ar: 'طنجة' },
  { id: 'tetouan', fr: 'Tetouan', en: 'Tetouan', ar: 'تطوان' },
];

const CITY_COORDS = {
  agadir: [30.4278, -9.5981],
  casablanca: [33.5731, -7.5898],
  fes: [34.0331, -5.0003],
  laayoune: [27.1536, -13.2033],
  marrakech: [31.6295, -7.9811],
  meknes: [33.8935, -5.5473],
  nador: [35.1681, -2.9287],
  ouarzazate: [30.9335, -6.9370],
  oujda: [34.6814, -1.9086],
  rabat: [34.0209, -6.8416],
  tanger: [35.7595, -5.834],
  tetouan: [35.5889, -5.3626],
};

const typeOptions = [
  { id: 'urgent', icon: 'flash', color: '#ff4a4a' },
  { id: 'medical', icon: 'medical', color: '#2f80ff' },
  { id: 'transport', icon: 'car-sport', color: '#f59e0b' },
];

const TOTAL_STEPS = 4;
const SUPPORT_PHONE = '+212612345678';

export default function AmbulanceScreen({ onBack, preferences }) {
  const { width } = useWindowDimensions();
  const styles = useMemo(() => createAmbulanceStyles(width), [width]);
  const s = useMemo(() => createScaler(width), [width]);
  const { colors, mode } = useAppTheme();
  const { language } = useI18n();
  const isDark = mode === 'dark';
  const isArabic = language === 'ar';
  const arRegular = isArabic ? { fontFamily: 'Cairo_400Regular' } : null;
  const arBold = isArabic ? { fontFamily: 'Cairo_700Bold' } : null;
  const contactSheetY = useRef(new Animated.Value(-40)).current;
  const contactSheetOpacity = useRef(new Animated.Value(0)).current;

  const txt = isArabic
    ? {
        title: 'طلب سيارة إسعاف',
        topSub: 'اطلب الخدمة خطوة بخطوة',
        back: 'رجوع',
        next: 'التالي',
        previous: 'السابق',
        finish: 'إرسال الطلب',
        step1: 'المسار',
        step2: 'الاستعجال',
        step3: 'المعلومات',
        step4: 'التأكيد',
        routeTitle: 'حدد مسار التدخل',
        routeSub: 'اختر هل التدخل داخل نفس المدينة أو بين مدينتين.',
        sameCity: 'نفس المدينة',
        interCity: 'من مدينة إلى مدينة',
        from: 'من',
        to: 'إلى',
        chooseCity: 'اختر المدينة',
        myPosition: 'موقعي',
        address: 'العنوان أو وصف دقيق للمكان',
        urgencyTitle: 'اختر نوع الاستعجال',
        urgencySub: 'سنوجه الطلب حسب الأولوية ونوع التدخل المطلوب.',
        urgent: 'حالة استعجالية',
        urgentSub: 'ألم قوي، نزيف، ضيق تنفس، حالة مستعجلة',
        medical: 'تدخل طبي',
        medicalSub: 'مرافقة طبية، فحص أو حالة صحية غير مستقرة',
        transport: 'نقل طبي',
        transportSub: 'نقل إلى مستشفى أو مركز علاج أو مصحة',
        formTitle: 'معلومات المريض',
        formSub: 'أدخل البيانات الأساسية لتأكيد الطلب بسرعة.',
        name: 'اسم المريض',
        phone: 'رقم الهاتف',
        notes: 'ملاحظات إضافية',
        notesPlaceholder: 'مثلا: الطابق، الباب، الحالة، أو تفاصيل مفيدة للفريق',
        recapTitle: 'تأكيد الطلب',
        recapSub: 'راجع المعلومات ثم أرسل الطلب أو اتصل مباشرة.',
        summaryRoute: 'المسار',
        summaryType: 'نوع التدخل',
        callNow: 'اتصال الآن',
        sendNow: 'تأكيد وإرسال',
        cityTitle: 'اختيار المدينة',
        requiredRoute: 'اختر مدينة الانطلاق والوصول.',
        requiredForm: 'الاسم ورقم الهاتف ضروريان.',
        locationOff: 'يرجى تفعيل الموقع أولا.',
        currentDetected: 'تم تحديد موقعك الحالي.',
        sent: 'تم إرسال طلب الإسعاف بنجاح.',
        fail: 'تعذر الإرسال. حاول مرة أخرى.',
      }
    : {
        title: 'Commander une Ambulance',
        topSub: 'Un parcours simple et rapide',
        back: 'Retour',
        next: 'Suivant',
        previous: 'Retour',
        finish: 'Envoyer',
        step1: 'Trajet',
        step2: 'Urgence',
        step3: 'Formulaire',
        step4: 'Appel',
        routeTitle: 'Definir le trajet',
        routeSub: "Choisissez si l'intervention se fait dans la même ville ou entre deux villes.",
        sameCity: 'Même ville',
        interCity: 'Ville a ville',
        from: 'De',
        to: 'Vers',
        chooseCity: 'Choisir une ville',
        myPosition: 'Ma position',
        address: 'Adresse ou details precis',
        urgencyTitle: "Choisir le type d'urgence",
        urgencySub: "Nous orientons l'équipe selon le niveau d'urgence et le besoin médical.",
        urgent: 'Urgence vitale',
        urgentSub: 'Douleur forte, saignement, détresse, intervention prioritaire',
        medical: 'Urgence médicale',
        medicalSub: 'Accompagnement médical, malaise ou état instable',
        transport: 'Transport médical',
        transportSub: 'Transfert vers hôpital, clinique ou centre de soin',
        formTitle: 'Informations patient',
        formSub: 'Ajoutez les informations essentielles pour valider rapidement la demande.',
        name: 'Nom complet',
        phone: 'Telephone',
        notes: 'Notes',
        notesPlaceholder: "Ex. : étage, code, état du patient, détails utiles pour l'équipe",
        recapTitle: 'Confirmation finale',
        recapSub: 'Vérifiez les informations puis envoyez la demande ou appelez directement.',
        summaryRoute: 'Trajet',
        summaryType: "Type d'intervention",
        callNow: 'Appeler',
        sendNow: 'Confirmer et envoyer',
        cityTitle: 'Choisir une ville',
        requiredRoute: 'Choisissez le depart et la destination.',
        requiredForm: 'Le nom et le numéro de téléphone sont obligatoires.',
        locationOff: 'Activez la localisation pour continuer.',
        currentDetected: 'Position actuelle détectée.',
        sent: "La demande d'ambulance a ete envoyee.",
        fail: 'Envoi impossible. Réessayez.',
      };

  const contactTxt = isArabic
    ? {
        quickOrder: 'طلب مباشر بالاتصال',
        quickOrderSub: 'واتساب أو اتصال عادي',
        chooseContact: 'اختر طريقة التواصل',
        chooseContactSub: 'يمكنك التواصل مباشرة بواسطة واتساب أو عبر اتصال عادي.',
        whatsapp: 'WhatsApp',
        normalCall: 'اتصال عادي',
        close: 'إغلاق',
        noCallApp: 'تعذر فتح تطبيق الاتصال.',
        noWhatsapp: 'واتساب غير متوفر على هذا الجهاز.',
      }
    : {
        quickOrder: 'Commander directement par appel',
        quickOrderSub: 'WhatsApp ou appel normal',
        chooseContact: 'Choisir le mode de contact',
        chooseContactSub: "Vous pouvez contacter l'équipe directement via WhatsApp ou appel normal.",
        whatsapp: 'WhatsApp',
        normalCall: 'Appel normal',
        close: 'Fermer',
        noCallApp: "Impossible d'ouvrir l'application d'appel.",
        noWhatsapp: "WhatsApp n'est pas disponible sur cet appareil.",
      };

  const arrivalTxt = isArabic
    ? {
        badge: 'وصول سريع',
        text: 'سيارة الإسعاف قد تصل في أقل من 10 دقائق.',
      }
    : {
        badge: 'Arrivee rapide',
        text: "L'ambulance peut arriver en moins de 10 minutes.",
      };

  const stepTitles = [txt.step1, txt.step2, txt.step3, txt.step4];
  const [step, setStep] = useState(0);
  const [form, setForm] = useState(emptyForm);
  const [loading, setLoading] = useState(false);
  const [pickerOpen, setPickerOpen] = useState(false);
  const [pickerField, setPickerField] = useState('fromLocation');
  const [contactSheetOpen, setContactSheetOpen] = useState(false);
  const [toast, setToast] = useState({ visible: false, text: '', type: 'info', id: 0 });

  useEffect(() => {
    const savedPhone = preferences?.account?.user?.phone || preferences?.account?.phone || '';
    const savedName = preferences?.account?.user?.name || '';
    setForm((prev) => ({
      ...prev,
      name: prev.name || savedName,
      phone: prev.phone || savedPhone,
    }));
  }, [preferences]);

  const showToast = (text, type = 'info') => {
    setToast({
      visible: true,
      text: String(text || ''),
      type,
      id: Date.now(),
    });
  };

  const animateContactSheet = (visible) => {
    Animated.parallel([
      Animated.timing(contactSheetOpacity, {
        toValue: visible ? 1 : 0,
        duration: 220,
        easing: Easing.out(Easing.cubic),
        useNativeDriver: true,
      }),
      Animated.timing(contactSheetY, {
        toValue: visible ? 0 : -40,
        duration: 260,
        easing: Easing.out(Easing.cubic),
        useNativeDriver: true,
      }),
    ]).start(({ finished }) => {
      if (finished && !visible) {
        setContactSheetOpen(false);
      }
    });
  };

  const openContactSheet = () => {
    setContactSheetOpen(true);
    requestAnimationFrame(() => animateContactSheet(true));
  };

  const closeContactSheet = () => {
    animateContactSheet(false);
  };

  const update = (key, value) => setForm((prev) => ({ ...prev, [key]: value }));

  const openRegularCall = async () => {
    const url = `tel:${SUPPORT_PHONE}`;
    try {
      const canOpen = await Linking.canOpenURL(url);
      if (!canOpen) {
        showToast(contactTxt.noCallApp, 'error');
        return;
      }
      closeContactSheet();
      await Linking.openURL(url);
    } catch (_error) {
      showToast(contactTxt.noCallApp, 'error');
    }
  };

  const openWhatsapp = async () => {
    const cleanPhone = SUPPORT_PHONE.replace(/[^\d]/g, '');
    const message = encodeURIComponent(isArabic ? 'السلام عليكم، أريد طلب سيارة إسعاف.' : 'Bonjour, je souhaite commander une ambulance.');
    const nativeUrl = `whatsapp://send?phone=${cleanPhone}&text=${message}`;
    const webUrl = `https://wa.me/${cleanPhone}?text=${message}`;

    try {
      const canOpenNative = await Linking.canOpenURL(nativeUrl);
      closeContactSheet();
      if (canOpenNative) {
        await Linking.openURL(nativeUrl);
        return;
      }

      const canOpenWeb = await Linking.canOpenURL(webUrl);
      if (canOpenWeb) {
        await Linking.openURL(webUrl);
        return;
      }

      showToast(contactTxt.noWhatsapp, 'error');
    } catch (_error) {
      showToast(contactTxt.noWhatsapp, 'error');
    }
  };

  const cityLabel = (id) => {
    const item = CITY_OPTIONS.find((city) => city.id === id);
    return item?.[language] || item?.fr || item?.en || '';
  };

  const typeText = (id) => {
    if (id === 'medical') return txt.medical;
    if (id === 'transport') return txt.transport;
    return txt.urgent;
  };

  const setNearestCity = (coords) => {
    const nearest = CITY_OPTIONS.reduce((closest, city) => {
      if (!closest) return city;
      const cityCoords = CITY_COORDS[city.id];
      const closestCoords = CITY_COORDS[closest.id];
      const dist = Math.abs(coords.latitude - cityCoords[0]) + Math.abs(coords.longitude - cityCoords[1]);
      const best = Math.abs(coords.latitude - closestCoords[0]) + Math.abs(coords.longitude - closestCoords[1]);
      return dist < best ? city : closest;
    }, null);

    if (nearest) {
      setForm((prev) => ({
        ...prev,
        fromLocation: nearest.id,
        toLocation: prev.transferMode === 'same_city' ? nearest.id : prev.toLocation,
      }));
    }
  };

  const locateMe = async () => {
    try {
      const permission = await Location.requestForegroundPermissionsAsync();
      if (permission.status !== 'granted') {
        showToast(txt.locationOff, 'error');
        return;
      }

      const location = await Location.getCurrentPositionAsync({
        accuracy: Location.Accuracy.High,
      });

      if (!location?.coords) {
        showToast(txt.fail, 'error');
        return;
      }

      const coords = location.coords;
      setNearestCity(coords);

      try {
        const reverse = await Location.reverseGeocodeAsync({
          latitude: coords.latitude,
          longitude: coords.longitude,
        });
        const place = reverse?.[0];
        const nextAddress = [place?.streetNumber, place?.street, place?.city].filter(Boolean).join(', ');
        update('address', nextAddress || `${coords.latitude.toFixed(4)}, ${coords.longitude.toFixed(4)}`);
      } catch (_geoError) {
        update('address', `${coords.latitude.toFixed(4)}, ${coords.longitude.toFixed(4)}`);
      }

      showToast(txt.currentDetected, 'success');
    } catch (_error) {
      showToast(txt.fail, 'error');
    }
  };

  const validateStep = () => {
    if (step === 0) {
      if (!form.fromLocation || !form.toLocation) {
        showToast(txt.requiredRoute, 'error');
        return false;
      }
      return true;
    }

    if (step === 2) {
      if (!form.name.trim() || !form.phone.trim()) {
        showToast(txt.requiredForm, 'error');
        return false;
      }
      return true;
    }

    return true;
  };

  const nextStep = () => {
    if (!validateStep()) return;
    setStep((prev) => Math.min(TOTAL_STEPS - 1, prev + 1));
  };

  const previousStep = () => {
    setStep((prev) => Math.max(0, prev - 1));
  };

  const submit = async () => {
    if (!validateStep()) return;

    setLoading(true);
    try {
      let coords = null;
      try {
        const permission = await Location.requestForegroundPermissionsAsync();
        if (permission.status === 'granted') {
          const location = await Location.getCurrentPositionAsync({});
          coords = location.coords;
        }
      } catch (_error) {
        coords = null;
      }

      const payload = {
        ...form,
        fromLocation: cityLabel(form.fromLocation),
        toLocation: cityLabel(form.transferMode === 'same_city' ? form.fromLocation : form.toLocation),
        lat: coords?.latitude,
        lng: coords?.longitude,
      };

      try {
        await createAmbulanceRequest(payload);
      } catch (_apiError) {
        const fallback = await submitRequestWithFormSubmit({ type: 'ambulance', payload });
        if (!fallback.ok) {
          throw new Error(fallback.error || 'fallback failed');
        }
      }

      showToast(txt.sent, 'success');
      setStep(0);
      setForm((prev) => ({
        ...emptyForm,
        name: prev.name,
        phone: prev.phone,
      }));
    } catch (_error) {
      showToast(txt.fail, 'error');
    } finally {
      setLoading(false);
    }
  };

  const renderStepOne = () => (
    <View style={[styles.stepCard, isDark && { backgroundColor: colors.surface, borderColor: colors.border }]}>
      <Text style={[styles.sectionTitle, arBold, { color: colors.textPrimary }]}>{txt.routeTitle}</Text>
      <Text style={[styles.sectionSub, arRegular, { color: colors.textSecondary }]}>{txt.routeSub}</Text>

      <View style={styles.modeRow}>
        <TouchableOpacity
          style={[
            styles.modePill,
            form.transferMode === 'same_city' && styles.modePillActive,
            isDark && { backgroundColor: colors.surfaceAlt, borderColor: form.transferMode === 'same_city' ? '#ff5959' : colors.border },
          ]}
          onPress={() =>
            setForm((prev) => ({
              ...prev,
              transferMode: 'same_city',
              toLocation: prev.fromLocation,
            }))
          }
        >
          <Text style={[styles.modePillText, arBold, { color: form.transferMode === 'same_city' ? '#ff4a4a' : colors.textPrimary }]}>{txt.sameCity}</Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={[
            styles.modePill,
            form.transferMode === 'inter_city' && styles.modePillActive,
            isDark && { backgroundColor: colors.surfaceAlt, borderColor: form.transferMode === 'inter_city' ? '#ff5959' : colors.border },
          ]}
          onPress={() => update('transferMode', 'inter_city')}
        >
          <Text style={[styles.modePillText, arBold, { color: form.transferMode === 'inter_city' ? '#ff4a4a' : colors.textPrimary }]}>{txt.interCity}</Text>
        </TouchableOpacity>
      </View>

      <View style={styles.routeStack}>
        <TouchableOpacity
          style={[styles.routeField, isDark && { backgroundColor: colors.surfaceAlt, borderColor: colors.border }]}
          onPress={() => {
            setPickerField('fromLocation');
            setPickerOpen(true);
          }}
        >
          <View style={[styles.routeIconWrap, isDark && { backgroundColor: colors.surface }]}>
            <Ionicons name="radio-button-on" size={14} color="#33c36b" />
          </View>
          <View style={styles.routeTextWrap}>
            <Text style={[styles.routeLabel, arRegular, { color: colors.textSecondary }]}>{txt.from}</Text>
            <Text style={[styles.routeValue, arBold, { color: colors.textPrimary }]}>{cityLabel(form.fromLocation)}</Text>
          </View>
          <Ionicons name="chevron-forward" size={18} color={colors.textSecondary} />
        </TouchableOpacity>

        {form.transferMode === 'inter_city' && (
          <>
            <View style={styles.routeConnector}>
              <View style={styles.routeConnectorLine} />
              <View style={styles.routeConnectorDot} />
            </View>

            <TouchableOpacity
              style={[styles.routeField, isDark && { backgroundColor: colors.surfaceAlt, borderColor: colors.border }]}
              onPress={() => {
                setPickerField('toLocation');
                setPickerOpen(true);
              }}
            >
              <View style={[styles.routeIconWrap, isDark && { backgroundColor: colors.surface }]}>
                <Ionicons name="location" size={14} color="#ff5a4f" />
              </View>
              <View style={styles.routeTextWrap}>
                <Text style={[styles.routeLabel, arRegular, { color: colors.textSecondary }]}>{txt.to}</Text>
                <Text style={[styles.routeValue, arBold, { color: colors.textPrimary }]}>{cityLabel(form.toLocation)}</Text>
              </View>
              <Ionicons name="chevron-forward" size={18} color={colors.textSecondary} />
            </TouchableOpacity>
          </>
        )}
      </View>

      <View style={styles.routeActionsRow}>
        <TouchableOpacity style={styles.locateChip} onPress={locateMe}>
          <Ionicons name="locate-outline" size={14} color="#4d79d8" />
          <Text style={[styles.locateChipText, arRegular]}>{txt.myPosition}</Text>
        </TouchableOpacity>
      </View>

      <View style={[styles.addressInputShell, isDark && { backgroundColor: colors.surfaceAlt, borderColor: colors.border }]}>
        <TextInput
          value={form.address}
          onChangeText={(value) => update('address', value)}
          placeholder={txt.address}
          placeholderTextColor={colors.textSecondary}
          style={[styles.addressInput, arRegular, { color: colors.textPrimary }]}
          multiline
        />
      </View>
    </View>
  );

  const renderStepTwo = () => (
    <View style={[styles.stepCard, isDark && { backgroundColor: colors.surface, borderColor: colors.border }]}>
      <Text style={[styles.sectionTitle, arBold, { color: colors.textPrimary }]}>{txt.urgencyTitle}</Text>
      <Text style={[styles.sectionSub, arRegular, { color: colors.textSecondary }]}>{txt.urgencySub}</Text>

      {typeOptions.map((item) => {
        const active = form.interventionType === item.id;
        const title = item.id === 'medical' ? txt.medical : item.id === 'transport' ? txt.transport : txt.urgent;
        const subtitle = item.id === 'medical' ? txt.medicalSub : item.id === 'transport' ? txt.transportSub : txt.urgentSub;

        return (
          <TouchableOpacity
            key={item.id}
            style={[
              styles.typeOption,
              active && styles.typeOptionActive,
              isDark && { backgroundColor: colors.surfaceAlt, borderColor: active ? '#ff5959' : colors.border },
            ]}
            onPress={() => update('interventionType', item.id)}
          >
            <View style={styles.typeOptionLeft}>
              <View style={[styles.typeIconWrap, isDark && { backgroundColor: colors.surface }]}>
                <Ionicons name={item.icon} size={16} color={item.color} />
              </View>
              <View style={styles.typeTextWrap}>
                <Text style={[styles.typeTitle, arBold, { color: colors.textPrimary }]}>{title}</Text>
                <Text style={[styles.typeSub, arRegular, { color: colors.textSecondary }]}>{subtitle}</Text>
              </View>
            </View>
            <Ionicons name={active ? 'checkmark-circle' : 'ellipse-outline'} size={22} color={active ? '#ff4a4a' : '#cad4df'} />
          </TouchableOpacity>
        );
      })}
    </View>
  );

  const renderStepThree = () => (
    <View style={[styles.stepCard, isDark && { backgroundColor: colors.surface, borderColor: colors.border }]}>
      <Text style={[styles.sectionTitle, arBold, { color: colors.textPrimary }]}>{txt.formTitle}</Text>
      <Text style={[styles.sectionSub, arRegular, { color: colors.textSecondary }]}>{txt.formSub}</Text>

      <View style={[styles.fieldBlock, isDark && { backgroundColor: colors.surfaceAlt, borderColor: colors.border }]}>
        <Text style={[styles.inputLabel, arBold, { color: colors.textPrimary }]}>{txt.name}</Text>
        <TextInput
          value={form.name}
          onChangeText={(value) => update('name', value)}
          style={[styles.fieldInputFull, arRegular, { color: colors.textPrimary }]}
          placeholder={txt.name}
          placeholderTextColor={colors.textSecondary}
        />
      </View>

      <View style={[styles.fieldBlock, isDark && { backgroundColor: colors.surfaceAlt, borderColor: colors.border }]}>
        <Text style={[styles.inputLabel, arBold, { color: colors.textPrimary }]}>{txt.phone}</Text>
        <TextInput
          value={form.phone}
          keyboardType="phone-pad"
          onChangeText={(value) => update('phone', value)}
          style={[styles.fieldInputFull, arRegular, { color: colors.textPrimary }]}
          placeholder={txt.phone}
          placeholderTextColor={colors.textSecondary}
        />
      </View>

      <View style={[styles.notesBlock, isDark && { backgroundColor: colors.surfaceAlt, borderColor: colors.border }]}>
        <Text style={[styles.inputLabel, arBold, { color: colors.textPrimary }]}>{txt.notes}</Text>
        <TextInput
          value={form.notes}
          onChangeText={(value) => update('notes', value)}
          style={[styles.notesInput, arRegular, { color: colors.textPrimary }]}
          placeholder={txt.notesPlaceholder}
          placeholderTextColor={colors.textSecondary}
          multiline
          textAlignVertical="top"
        />
      </View>
    </View>
  );

  const renderStepFour = () => (
    <View style={[styles.stepCard, isDark && { backgroundColor: colors.surface, borderColor: colors.border }]}>
      <Text style={[styles.sectionTitle, arBold, { color: colors.textPrimary }]}>{txt.recapTitle}</Text>
      <Text style={[styles.sectionSub, arRegular, { color: colors.textSecondary }]}>{txt.recapSub}</Text>

      <View style={[styles.summaryCard, isDark && { backgroundColor: colors.surfaceAlt, borderColor: colors.border }]}>
        <View style={styles.summaryRow}>
          <Text style={[styles.summaryLabel, arRegular, { color: colors.textSecondary }]}>{txt.summaryRoute}</Text>
          <Text style={[styles.summaryValue, arBold, { color: colors.textPrimary }]}>
            {cityLabel(form.fromLocation)} {form.transferMode === 'inter_city' ? `→ ${cityLabel(form.toLocation)}` : ''}
          </Text>
        </View>
        <View style={styles.summaryRow}>
          <Text style={[styles.summaryLabel, arRegular, { color: colors.textSecondary }]}>{txt.summaryType}</Text>
          <Text style={[styles.summaryValue, arBold, { color: colors.textPrimary }]}>{typeText(form.interventionType)}</Text>
        </View>
        <View style={styles.summaryRow}>
          <Text style={[styles.summaryLabel, arRegular, { color: colors.textSecondary }]}>{txt.name}</Text>
          <Text style={[styles.summaryValue, arBold, { color: colors.textPrimary }]}>{form.name || '-'}</Text>
        </View>
        <View style={styles.summaryRow}>
          <Text style={[styles.summaryLabel, arRegular, { color: colors.textSecondary }]}>{txt.phone}</Text>
          <Text style={[styles.summaryValue, arBold, { color: colors.textPrimary }]}>{form.phone || '-'}</Text>
        </View>
      </View>

      <View style={styles.finalActions}>
        <TouchableOpacity style={[styles.callNowBtn, isDark && { backgroundColor: colors.surfaceAlt, borderColor: colors.border }]} onPress={openContactSheet} disabled={loading}>
          <Ionicons name="call-outline" size={18} color="#203554" />
          <Text style={[styles.callNowText, arBold]}>{txt.callNow}</Text>
        </TouchableOpacity>

        <TouchableOpacity style={styles.submitBtn} onPress={submit} disabled={loading}>
          <Ionicons name="checkmark-circle-outline" size={18} color="#ffffff" />
          <Text style={[styles.submitBtnText, arBold]}>{loading ? '...' : txt.sendNow}</Text>
        </TouchableOpacity>
      </View>
    </View>
  );

  return (
    <SafeAreaView style={[styles.screen, { backgroundColor: colors.background }]}>
      <TopToast toast={toast} onHide={() => setToast((prev) => ({ ...prev, visible: false }))} />

      <ScrollView contentContainerStyle={styles.content} showsVerticalScrollIndicator={false}>
        <View style={[styles.topBar, isDark && { backgroundColor: colors.surface, borderColor: colors.border }]}>
          <TouchableOpacity style={[styles.backBtn, isDark && { backgroundColor: colors.surfaceAlt, borderColor: colors.border }]} onPress={step === 0 ? onBack : previousStep}>
            <Ionicons name="arrow-back" size={s(20, 18, 24)} color={isDark ? colors.textPrimary : '#203554'} />
          </TouchableOpacity>

          <View style={styles.topTitleWrap}>
            <Text style={[styles.topTitle, arBold, { color: colors.textPrimary }]}>{txt.title}</Text>
            <Text style={[styles.topSub, arRegular, { color: colors.textSecondary }]}>{txt.topSub}</Text>
          </View>

          <View style={[styles.topActionBtn, isDark && { backgroundColor: colors.surfaceAlt, borderColor: colors.border }]}>
            <Ionicons name="person-outline" size={18} color={colors.textPrimary} />
          </View>
        </View>

        <View style={styles.progressWrap}>
          {stepTitles.map((label, index) => {
            const active = index === step;
            const done = index < step;
            return (
              <View key={label} style={styles.progressItem}>
                <View style={[styles.progressDot, active && styles.progressDotActive, done && styles.progressDotDone]}>
                  <Text style={[styles.progressDotText, (active || done) && styles.progressDotTextActive]}>{index + 1}</Text>
                </View>
                <Text style={[styles.progressLabel, arRegular, { color: active || done ? colors.textPrimary : colors.textSecondary }]} numberOfLines={1}>
                  {label}
                </Text>
              </View>
            );
          })}
        </View>

        <TouchableOpacity style={[styles.quickOrderBtn, isDark && { backgroundColor: colors.surface, borderColor: colors.border }]} onPress={openContactSheet} activeOpacity={0.92}>
          <View style={styles.quickOrderIcon}>
            <Ionicons name="call-outline" size={18} color="#ffffff" />
          </View>
          <View style={styles.quickOrderTextWrap}>
            <Text style={[styles.quickOrderTitle, arBold, { color: colors.textPrimary }]}>{contactTxt.quickOrder}</Text>
            <Text style={[styles.quickOrderSub, arRegular, { color: colors.textSecondary }]}>{contactTxt.quickOrderSub}</Text>
          </View>
          <Ionicons name="chevron-forward" size={18} color={colors.textSecondary} />
        </TouchableOpacity>

        <View style={[styles.arrivalInfoCard, isDark && { backgroundColor: colors.surface, borderColor: colors.border }]}>
          <View style={styles.arrivalBadge}>
            <Ionicons name="time-outline" size={14} color="#ffffff" />
            <Text style={[styles.arrivalBadgeText, arBold]}>{arrivalTxt.badge}</Text>
          </View>
          <Text style={[styles.arrivalInfoText, arRegular, { color: colors.textPrimary }]}>{arrivalTxt.text}</Text>
        </View>

        {step === 0 && renderStepOne()}
        {step === 1 && renderStepTwo()}
        {step === 2 && renderStepThree()}
        {step === 3 && renderStepFour()}

        {step < TOTAL_STEPS - 1 && (
          <View style={styles.navigationRow}>
            <View style={styles.stepCounterInline}>
              <Text style={[styles.stepCounterInlineText, arBold]}>{step + 1}/{TOTAL_STEPS}</Text>
            </View>

            <View style={styles.navigationRightSide}>
              {step > 0 && (
                <TouchableOpacity style={[styles.secondaryNavBtn, isDark && { backgroundColor: colors.surface, borderColor: colors.border }]} onPress={previousStep}>
                  <Text style={[styles.secondaryNavText, arBold, { color: colors.textPrimary }]}>{txt.previous}</Text>
                </TouchableOpacity>
              )}

              <TouchableOpacity style={styles.primaryNavBtn} onPress={nextStep}>
                <Text style={[styles.primaryNavText, arBold]}>{txt.next}</Text>
                <Ionicons name="arrow-forward" size={16} color="#ffffff" />
              </TouchableOpacity>
            </View>
          </View>
        )}
      </ScrollView>

      <Modal transparent visible={pickerOpen} animationType="fade" onRequestClose={() => setPickerOpen(false)}>
        <Pressable style={styles.modalOverlay} onPress={() => setPickerOpen(false)}>
          <View style={[styles.modalCard, isDark && { backgroundColor: colors.surface, borderColor: colors.border }]}>
            <Text style={[styles.modalTitle, arBold, { color: colors.textPrimary }]}>{txt.cityTitle}</Text>
            <ScrollView showsVerticalScrollIndicator={false}>
              {CITY_OPTIONS.map((city) => {
                const active = form[pickerField] === city.id;
                return (
                  <TouchableOpacity
                    key={city.id}
                    style={[styles.cityItem, active && styles.cityItemActive, isDark && { backgroundColor: colors.surfaceAlt, borderColor: active ? '#ff5959' : colors.border }]}
                    onPress={() => {
                      setForm((prev) => {
                        const next = { ...prev, [pickerField]: city.id };
                        if (pickerField === 'fromLocation' && prev.transferMode === 'same_city') {
                          next.toLocation = city.id;
                        }
                        return next;
                      });
                      setPickerOpen(false);
                    }}
                  >
                    <Text style={[styles.cityItemText, arRegular, { color: colors.textPrimary }]}>{city[language] || city.fr}</Text>
                  </TouchableOpacity>
                );
              })}
            </ScrollView>
          </View>
        </Pressable>
      </Modal>

      <Modal transparent visible={contactSheetOpen} animationType="none" onRequestClose={closeContactSheet}>
        <Pressable style={styles.contactOverlay} onPress={closeContactSheet}>
          <Animated.View
            style={[
              styles.contactSheet,
              isDark && { backgroundColor: colors.surface, borderColor: colors.border },
              {
                opacity: contactSheetOpacity,
                transform: [{ translateY: contactSheetY }],
              },
            ]}
          >
            <Pressable>
              <View style={styles.contactHandle} />
              <Text style={[styles.contactTitle, arBold, { color: colors.textPrimary }]}>{contactTxt.chooseContact}</Text>
              <Text style={[styles.contactSub, arRegular, { color: colors.textSecondary }]}>{contactTxt.chooseContactSub}</Text>

              <TouchableOpacity style={styles.contactOptionBtn} onPress={openWhatsapp} activeOpacity={0.9}>
                <View style={[styles.contactOptionIcon, { backgroundColor: '#25D366' }]}>
                  <Ionicons name="logo-whatsapp" size={18} color="#ffffff" />
                </View>
                <Text style={[styles.contactOptionText, arBold]}>{contactTxt.whatsapp}</Text>
                <Ionicons name="chevron-forward" size={18} color="#6982a9" />
              </TouchableOpacity>

              <TouchableOpacity style={styles.contactOptionBtn} onPress={openRegularCall} activeOpacity={0.9}>
                <View style={[styles.contactOptionIcon, { backgroundColor: '#4e8cff' }]}>
                  <Ionicons name="call-outline" size={18} color="#ffffff" />
                </View>
                <Text style={[styles.contactOptionText, arBold]}>{contactTxt.normalCall}</Text>
                <Ionicons name="chevron-forward" size={18} color="#6982a9" />
              </TouchableOpacity>

              <TouchableOpacity style={[styles.contactCloseBtn, isDark && { backgroundColor: colors.surfaceAlt, borderColor: colors.border }]} onPress={closeContactSheet}>
                <Text style={[styles.contactCloseText, arBold, { color: colors.textPrimary }]}>{contactTxt.close}</Text>
              </TouchableOpacity>
            </Pressable>
          </Animated.View>
        </Pressable>
      </Modal>
    </SafeAreaView>
  );
}
