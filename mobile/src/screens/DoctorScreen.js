import { useMemo, useState } from 'react';
import { Alert, Linking, Modal, Pressable, SafeAreaView, ScrollView, Text, TextInput, TouchableOpacity, View, useWindowDimensions } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import * as Location from 'expo-location';
import FormInput from '../components/FormInput';
import TopToast from '../components/TopToast';
import { createRequestStyles } from '../styles/requestStyles';
import { createScaler } from '../utils/responsive';
import { createDoctorRequest } from '../services/api';
import { submitRequestWithFormSubmit } from '../services/requestDelivery';
import { useAppTheme } from '../theme/ThemeContext';
import { useI18n } from '../i18n/I18nContext';

const CITIES = [
  'Casablanca',
  'Fes',
  'Meknes',
  'Rabat',
  'Oujda',
  'Nador',
  'Marrakech',
  'Laayoune',
  'Ourzazate',
  'Agadir',
  'Tetouane',
  'Tanger',
];

const TOTAL_STEPS = 4;

export default function DoctorScreen({ onBack, onNavigate, preferences }) {
  const { width } = useWindowDimensions();
  const styles = useMemo(() => createRequestStyles(width), [width]);
  const s = useMemo(() => createScaler(width), [width]);
  const { colors, mode } = useAppTheme();
  const { language } = useI18n();
  const isDark = mode === 'dark';
  const isArabic = language === 'ar';
  const arRegular = isArabic ? { fontFamily: 'Cairo_400Regular' } : null;
  const arBold = isArabic ? { fontFamily: 'Cairo_700Bold' } : null;

  const txt = isArabic
    ? {
        title: 'طلب طبيب منزلي',
        sub: 'مسار بسيط وسريع',
        step1: 'الموقع',
        step2: 'الحالة',
        step3: 'البيانات',
        step4: 'التأكيد',
        directCall: 'اطلب مباشرة عبر الاتصال',
        directCallSub: 'واتساب أو اتصال عادي',
        fastBadge: 'وصول سريع',
        fastText: 'يمكن للطبيب أن يصل بسرعة حسب منطقتك.',
        zoneTitle: 'حدد المنطقة',
        zoneSub: 'اختر المدينة المناسبة للتدخل.',
        chooseCity: 'اختر المدينة',
        myPosition: 'موقعي',
        locating: 'جاري تحديد الموقع...',
        preciseAddress: 'العنوان أو تفاصيل دقيقة',
        situationTitle: 'حدد الحالة',
        situationSub: 'اختر نوع الطلب لتوجيه الطبيب بسرعة.',
        urgent: 'حالة مستعجلة',
        urgentSub: 'ألم قوي أو تدخل سريع',
        visit: 'زيارة منزلية',
        visitSub: 'فحص أو متابعة عادية',
        meds: 'دواء واستشارة',
        medsSub: 'وصفة أو توجيه طبي',
        formTitle: 'معلومات المريض',
        formSub: 'أدخل المعلومات الأساسية لتأكيد الطلب.',
        name: 'الاسم الكامل',
        phone: 'رقم الهاتف',
        notes: 'ملاحظات',
        notesPlaceholder: 'مثال: الأعراض أو الطابق أو أي تفاصيل إضافية',
        confirmTitle: 'تأكيد الطلب',
        confirmSub: 'راجع المعلومات ثم أرسل الطلب.',
        city: 'المدينة',
        address: 'العنوان',
        type: 'نوع الطلب',
        next: 'التالي',
        previous: 'رجوع',
        send: 'تأكيد وإرسال',
        success: 'تم إرسال الطلب بنجاح.',
        fail: 'تعذر إرسال الطلب حاليا.',
        urgentCallFail: 'تعذر فتح تطبيق الاتصال.',
        permissionDenied: 'يجب تفعيل إذن الموقع أولا.',
        locationUnavailable: 'تعذر الحصول على الموقع حاليا.',
        locationReady: 'تم تحديث الموقع.',
        missingForm: 'الاسم ورقم الهاتف ضروريان.',
      }
    : {
        title: 'Demander un medecin',
        sub: 'Un parcours simple et rapide',
        step1: 'Localisation',
        step2: 'Situation',
        step3: 'Formulaire',
        step4: 'Confirmation',
        directCall: 'Commander directement par appel',
        directCallSub: 'WhatsApp ou appel normal',
        fastBadge: 'Arrivee rapide',
        fastText: 'Le medecin peut arriver rapidement selon votre zone.',
        zoneTitle: 'Definir la zone',
        zoneSub: "Choisissez la ville d'intervention.",
        chooseCity: 'Choisissez la ville',
        myPosition: 'Ma position',
        locating: 'Localisation en cours...',
        preciseAddress: 'Adresse ou details precis',
        situationTitle: 'Definir la situation',
        situationSub: 'Choisissez le type de prise en charge.',
        urgent: 'Urgence',
        urgentSub: 'Douleur forte ou intervention rapide',
        visit: 'Visite a domicile',
        visitSub: 'Consultation ou suivi classique',
        meds: 'Medicament et conseil',
        medsSub: 'Prescription ou orientation medicale',
        formTitle: 'Informations patient',
        formSub: 'Ajoutez les informations essentielles pour confirmer la demande.',
        name: 'Nom complet',
        phone: 'Telephone',
        notes: 'Notes',
        notesPlaceholder: 'Ex. : symptomes, etage, details utiles',
        confirmTitle: 'Confirmation',
        confirmSub: 'Verifiez les informations puis envoyez la demande.',
        city: 'Ville',
        address: 'Adresse',
        type: 'Type',
        next: 'Suivant',
        previous: 'Retour',
        send: 'Confirmer et envoyer',
        success: 'La demande a ete envoyee avec succes.',
        fail: 'Envoi impossible pour le moment.',
        urgentCallFail: "Impossible d'ouvrir l'application d'appel.",
        permissionDenied: 'Autorisez la localisation pour utiliser ce bouton.',
        locationUnavailable: 'Impossible de recuperer votre position pour le moment.',
        locationReady: 'Position mise a jour.',
        missingForm: 'Le nom et le numero de telephone sont obligatoires.',
      };

  const [step, setStep] = useState(0);
  const [selectedCity, setSelectedCity] = useState(CITIES[0]);
  const [cityModalOpen, setCityModalOpen] = useState(false);
  const [address, setAddress] = useState('');
  const [requestType, setRequestType] = useState('urgent');
  const [name, setName] = useState(preferences?.account?.user?.name || '');
  const [phone, setPhone] = useState(preferences?.account?.user?.phone || '');
  const [notes, setNotes] = useState('');
  const [loading, setLoading] = useState(false);
  const [locating, setLocating] = useState(false);
  const [toast, setToast] = useState({ visible: false, text: '', type: 'info', id: 0 });

  const showToast = (text, type = 'info') => {
    setToast({
      visible: true,
      text: String(text || ''),
      type,
      id: Date.now(),
    });
  };

  const openEmergencyCall = async () => {
    try {
      await Linking.openURL('tel:141');
    } catch (_error) {
      Alert.alert(txt.fail, txt.urgentCallFail);
    }
  };

  const useCurrentLocation = async () => {
    if (locating) {
      return;
    }

    setLocating(true);
    try {
      const permission = await Location.requestForegroundPermissionsAsync();
      if (permission.status !== 'granted') {
        showToast(txt.permissionDenied, 'error');
        return;
      }

      const location = await Location.getCurrentPositionAsync({
        accuracy: Location.Accuracy.Balanced,
      });

      let place = null;
      try {
        const result = await Location.reverseGeocodeAsync({
          latitude: location.coords.latitude,
          longitude: location.coords.longitude,
        });
        place = result?.[0] || null;
      } catch (_reverseError) {
        place = null;
      }

      const fallbackAddress = `Lat ${location.coords.latitude.toFixed(5)}, Lng ${location.coords.longitude.toFixed(5)}`;
      const formattedAddress = [
        place?.name,
        place?.street,
        place?.district,
        place?.city,
        place?.region,
      ]
        .filter(Boolean)
        .join(', ');

      setAddress(formattedAddress || fallbackAddress);

      const detectedCity = String(place?.city || place?.region || '')
        .trim()
        .toLowerCase();

      const matchedCity = CITIES.find((city) => {
        const normalizedCity = city.toLowerCase();
        return (
          normalizedCity === detectedCity ||
          normalizedCity.includes(detectedCity) ||
          detectedCity.includes(normalizedCity)
        );
      });

      if (matchedCity) {
        setSelectedCity(matchedCity);
      }

      showToast(txt.locationReady, 'success');
    } catch (_error) {
      showToast(txt.locationUnavailable, 'error');
    } finally {
      setLocating(false);
    }
  };

  const validateNext = () => {
    if (step === 2 && (!name.trim() || !phone.trim())) {
      showToast(txt.missingForm, 'error');
      return false;
    }
    return true;
  };

  const nextStep = () => {
    if (!validateNext()) {
      return;
    }
    setStep((prev) => Math.min(TOTAL_STEPS - 1, prev + 1));
  };

  const previousStep = () => {
    if (step === 0) {
      onBack?.();
      return;
    }
    setStep((prev) => Math.max(0, prev - 1));
  };

  const submit = async () => {
    if (!name.trim() || !phone.trim()) {
      showToast(txt.missingForm, 'error');
      setStep(2);
      return;
    }

    setLoading(true);
    try {
      let coords = null;
      try {
        const permission = await Location.requestForegroundPermissionsAsync();
        if (permission.status === 'granted') {
          const location = await Location.getCurrentPositionAsync({});
          coords = location.coords;
        }
      } catch (_geoError) {
        coords = null;
      }

      const payload = {
        name,
        phone,
        address,
        notes: `Ville: ${selectedCity} | Type: ${requestType} | ${notes}`.trim(),
        lat: coords?.latitude,
        lng: coords?.longitude,
      };

      try {
        await createDoctorRequest(payload);
      } catch (_apiError) {
        const fallback = await submitRequestWithFormSubmit({ type: 'doctor-home', payload });
        if (!fallback.ok) {
          throw new Error(fallback.error || 'fallback failed');
        }
      }

      showToast(txt.success, 'success');
      setStep(0);
    } catch (_error) {
      showToast(txt.fail, 'error');
    } finally {
      setLoading(false);
    }
  };

  const requestTypeLabel =
    requestType === 'visit' ? txt.visit : requestType === 'meds' ? txt.meds : txt.urgent;

  return (
    <SafeAreaView style={[styles.screen, { backgroundColor: colors.background }]}>
      <TopToast toast={toast} onHide={() => setToast((prev) => ({ ...prev, visible: false }))} />

      <ScrollView contentContainerStyle={styles.doctorStepContent} showsVerticalScrollIndicator={false}>
        <View style={[styles.doctorHeaderCard, isDark && { backgroundColor: colors.surface, borderColor: colors.border }]}>
          <View style={styles.doctorHeaderTop}>
            <TouchableOpacity
              style={[styles.doctorCircleBtn, isDark && { backgroundColor: colors.surfaceAlt, borderColor: colors.border }]}
              onPress={previousStep}
            >
              <Ionicons name="chevron-back" size={s(20, 18, 24)} color={colors.textPrimary} />
            </TouchableOpacity>

            <View style={styles.doctorHeaderCopy}>
              <Text style={[styles.doctorHeaderTitle, arBold, { color: colors.textPrimary }]}>{txt.title}</Text>
              <Text style={[styles.doctorHeaderSub, arRegular, { color: colors.textSecondary }]}>{txt.sub}</Text>
            </View>

            <TouchableOpacity
              style={[styles.doctorCircleBtn, isDark && { backgroundColor: colors.surfaceAlt, borderColor: colors.border }]}
              onPress={() => onNavigate?.('profile')}
            >
              <Ionicons name="person-outline" size={s(18, 16, 22)} color={colors.textPrimary} />
            </TouchableOpacity>
          </View>

          <View style={styles.doctorStepsWrap}>
            {[
              { id: 1, label: txt.step1 },
              { id: 2, label: txt.step2 },
              { id: 3, label: txt.step3 },
              { id: 4, label: txt.step4 },
            ].map((item, index) => (
              <View key={item.id} style={styles.doctorStepColumn}>
                <View style={[styles.doctorStepIndex, step === index && styles.doctorStepIndexActive]}>
                  <Text style={[styles.doctorStepIndexText, step === index && styles.doctorStepIndexTextActive]}>{item.id}</Text>
                </View>
                <Text
                  style={[
                    styles.doctorStepText,
                    arBold,
                    step === index && styles.doctorStepTextStrong,
                    isDark && step !== index && { color: colors.textSecondary },
                  ]}
                >
                  {item.label}
                </Text>
              </View>
            ))}
          </View>
        </View>

        {step === 0 && (
          <>
            <TouchableOpacity
              style={[styles.doctorEmergencyCard, isDark && { backgroundColor: colors.surface, borderColor: colors.border }]}
              onPress={openEmergencyCall}
              activeOpacity={0.9}
            >
              <View style={styles.doctorEmergencyIcon}>
                <Ionicons name="call-outline" size={s(18, 16, 20)} color="#ffffff" />
              </View>
              <View style={styles.doctorEmergencyCopy}>
                <Text style={[styles.doctorEmergencyText, arBold, { color: colors.textPrimary }]}>{txt.directCall}</Text>
                <Text style={[styles.doctorEmergencySub, arRegular, { color: colors.textSecondary }]}>{txt.directCallSub}</Text>
              </View>
              <Ionicons name="chevron-forward" size={18} color={colors.textSecondary} />
            </TouchableOpacity>

            <View style={[styles.doctorArrivalCard, isDark && { backgroundColor: colors.surface, borderColor: colors.border }]}>
              <View style={styles.doctorArrivalBadge}>
                <Ionicons name="time-outline" size={s(13, 12, 15)} color="#ffffff" />
                <Text style={styles.doctorArrivalBadgeText}>{txt.fastBadge}</Text>
              </View>
              <Text style={[styles.doctorArrivalText, arBold, { color: colors.textPrimary }]}>{txt.fastText}</Text>
            </View>

            <View style={[styles.doctorZoneCard, isDark && { backgroundColor: colors.surface, borderColor: colors.border }]}>
              <Text style={[styles.doctorZoneTitle, arBold, { color: colors.textPrimary }]}>{txt.zoneTitle}</Text>
              <Text style={[styles.doctorZoneSub, arRegular, { color: colors.textSecondary }]}>{txt.zoneSub}</Text>

              <View style={styles.cityPickerWrap}>
                <Text style={[styles.cityPickerTitle, arBold, { color: colors.textPrimary }]}>{txt.chooseCity}</Text>
                <TouchableOpacity
                  style={[styles.citySelectBtn, isDark && { backgroundColor: colors.surfaceAlt, borderColor: colors.border }]}
                  onPress={() => setCityModalOpen(true)}
                >
                  <View style={styles.doctorCitySelectValue}>
                    <Ionicons name="location-outline" size={s(16, 14, 18)} color="#59b88d" />
                    <Text style={[styles.citySelectText, arBold, { color: colors.textPrimary }]}>{selectedCity}</Text>
                  </View>
                  <Ionicons name="chevron-down" size={18} color={colors.textSecondary} />
                </TouchableOpacity>
              </View>

              <TouchableOpacity style={styles.doctorPositionShortcut} onPress={useCurrentLocation} disabled={locating}>
                <Ionicons name="locate-outline" size={s(14, 12, 16)} color="#4f76ff" />
                <Text style={styles.doctorPositionShortcutText}>{locating ? txt.locating : txt.myPosition}</Text>
              </TouchableOpacity>

              <View style={[styles.doctorPositionCard, isDark && { backgroundColor: colors.surfaceAlt, borderColor: colors.border }]}>
                <FormInput
                  styles={styles}
                  placeholder={txt.preciseAddress}
                  value={address}
                  onChangeText={setAddress}
                  shellStyle={isDark ? { backgroundColor: colors.surface, borderColor: colors.border } : null}
                  inputStyle={isDark ? { color: colors.textPrimary } : null}
                  placeholderTextColor={isDark ? '#8fa4c7' : '#98a8c0'}
                />
              </View>
            </View>
          </>
        )}

        {step === 1 && (
          <View style={[styles.doctorZoneCard, isDark && { backgroundColor: colors.surface, borderColor: colors.border }]}>
            <Text style={[styles.doctorZoneTitle, arBold, { color: colors.textPrimary }]}>{txt.situationTitle}</Text>
            <Text style={[styles.doctorZoneSub, arRegular, { color: colors.textSecondary }]}>{txt.situationSub}</Text>

            {[
              { id: 'urgent', title: txt.urgent, sub: txt.urgentSub, icon: 'flash-outline', color: '#ff4b50' },
              { id: 'visit', title: txt.visit, sub: txt.visitSub, icon: 'home-outline', color: '#4f76ff' },
              { id: 'meds', title: txt.meds, sub: txt.medsSub, icon: 'medkit-outline', color: '#22a06b' },
            ].map((item) => {
              const active = requestType === item.id;
              return (
                <TouchableOpacity
                  key={item.id}
                  onPress={() => setRequestType(item.id)}
                  style={{
                    marginTop: 12,
                    borderRadius: 18,
                    borderWidth: 1,
                    borderColor: active ? '#ff5a62' : '#dfe7f3',
                    backgroundColor: active ? '#fff5f6' : isDark ? colors.surfaceAlt : '#ffffff',
                    padding: 14,
                    flexDirection: 'row',
                    alignItems: 'center',
                    gap: 12,
                  }}
                >
                  <View
                    style={{
                      width: 38,
                      height: 38,
                      borderRadius: 999,
                      alignItems: 'center',
                      justifyContent: 'center',
                      backgroundColor: active ? '#ffffff' : '#f4f7fd',
                    }}
                  >
                    <Ionicons name={item.icon} size={18} color={item.color} />
                  </View>
                  <View style={{ flex: 1 }}>
                    <Text style={[arBold, { color: colors.textPrimary, fontSize: 15 }]}>{item.title}</Text>
                    <Text style={[arRegular, { color: colors.textSecondary, fontSize: 12, marginTop: 4 }]}>{item.sub}</Text>
                  </View>
                  <Ionicons name={active ? 'checkmark-circle' : 'ellipse-outline'} size={22} color={active ? '#ff5a62' : '#cad4df'} />
                </TouchableOpacity>
              );
            })}
          </View>
        )}

        {step === 2 && (
          <View style={[styles.doctorZoneCard, isDark && { backgroundColor: colors.surface, borderColor: colors.border }]}>
            <Text style={[styles.doctorZoneTitle, arBold, { color: colors.textPrimary }]}>{txt.formTitle}</Text>
            <Text style={[styles.doctorZoneSub, arRegular, { color: colors.textSecondary }]}>{txt.formSub}</Text>

            <FormInput
              styles={styles}
              placeholder={txt.name}
              value={name}
              onChangeText={setName}
              shellStyle={isDark ? { backgroundColor: colors.surfaceAlt, borderColor: colors.border } : null}
              inputStyle={isDark ? { color: colors.textPrimary } : null}
              placeholderTextColor={isDark ? '#8fa4c7' : '#98a8c0'}
            />

            <FormInput
              styles={styles}
              placeholder={txt.phone}
              value={phone}
              onChangeText={setPhone}
              keyboardType="phone-pad"
              shellStyle={isDark ? { backgroundColor: colors.surfaceAlt, borderColor: colors.border } : null}
              inputStyle={isDark ? { color: colors.textPrimary } : null}
              placeholderTextColor={isDark ? '#8fa4c7' : '#98a8c0'}
            />

            <FormInput
              styles={styles}
              placeholder={txt.notesPlaceholder}
              value={notes}
              onChangeText={setNotes}
              multiline
              shellStyle={isDark ? { backgroundColor: colors.surfaceAlt, borderColor: colors.border } : null}
              inputStyle={isDark ? { color: colors.textPrimary } : null}
              placeholderTextColor={isDark ? '#8fa4c7' : '#98a8c0'}
            />
          </View>
        )}

        {step === 3 && (
          <View style={[styles.doctorZoneCard, isDark && { backgroundColor: colors.surface, borderColor: colors.border }]}>
            <Text style={[styles.doctorZoneTitle, arBold, { color: colors.textPrimary }]}>{txt.confirmTitle}</Text>
            <Text style={[styles.doctorZoneSub, arRegular, { color: colors.textSecondary }]}>{txt.confirmSub}</Text>

            <View
              style={{
                borderWidth: 1,
                borderColor: isDark ? colors.border : '#dfe7f3',
                borderRadius: 18,
                backgroundColor: isDark ? colors.surfaceAlt : '#fbfcff',
                padding: 14,
                gap: 12,
              }}
            >
              {[
                { label: txt.city, value: selectedCity },
                { label: txt.address, value: address || '-' },
                { label: txt.type, value: requestTypeLabel },
                { label: txt.name, value: name || '-' },
                { label: txt.phone, value: phone || '-' },
                { label: txt.notes, value: notes || '-' },
              ].map((item) => (
                <View key={item.label} style={{ gap: 4 }}>
                  <Text style={[arRegular, { color: colors.textSecondary, fontSize: 12 }]}>{item.label}</Text>
                  <Text style={[arBold, { color: colors.textPrimary, fontSize: 15 }]}>{item.value}</Text>
                </View>
              ))}
            </View>
          </View>
        )}
      </ScrollView>

      <View style={[styles.doctorBottomBar, isDark && { backgroundColor: colors.surface, borderColor: colors.border }]}>
        <View style={styles.doctorBottomCountWrap}>
          <View style={styles.doctorBottomCountBadge}>
            <Text style={styles.doctorBottomCountBadgeText}>{step + 1}/4</Text>
          </View>
        </View>

        {step < TOTAL_STEPS - 1 ? (
          <TouchableOpacity style={styles.doctorBottomBtn} onPress={nextStep} activeOpacity={0.9}>
            <Text style={styles.doctorBottomBtnText}>{txt.next}</Text>
            <Ionicons name="arrow-forward" size={18} color="#fff" />
          </TouchableOpacity>
        ) : (
          <TouchableOpacity style={styles.doctorBottomBtn} onPress={submit} disabled={loading} activeOpacity={0.9}>
            <Text style={styles.doctorBottomBtnText}>{loading ? '...' : txt.send}</Text>
            <Ionicons name="checkmark" size={18} color="#fff" />
          </TouchableOpacity>
        )}
      </View>

      <Modal transparent visible={cityModalOpen} animationType="fade" onRequestClose={() => setCityModalOpen(false)}>
        <Pressable style={styles.cityModalOverlay} onPress={() => setCityModalOpen(false)}>
          <Pressable style={[styles.cityModalCard, isDark && { backgroundColor: colors.surface, borderColor: colors.border }]}>
            <Text style={[styles.cityModalTitle, arBold, { color: colors.textPrimary }]}>{txt.chooseCity}</Text>
            <ScrollView style={styles.cityModalList} showsVerticalScrollIndicator={false}>
              {CITIES.map((city) => {
                const selected = city === selectedCity;
                return (
                  <TouchableOpacity
                    key={city}
                    style={[
                      styles.cityModalItem,
                      selected && styles.cityModalItemActive,
                      isDark && !selected && { backgroundColor: colors.surfaceAlt, borderColor: colors.border },
                    ]}
                    onPress={() => {
                      setSelectedCity(city);
                      setCityModalOpen(false);
                    }}
                  >
                    <Text
                      style={[
                        styles.cityModalItemText,
                        arBold,
                        selected && { color: '#ff4b50' },
                        isDark && !selected && { color: colors.textPrimary },
                      ]}
                    >
                      {city}
                    </Text>
                  </TouchableOpacity>
                );
              })}
            </ScrollView>
          </Pressable>
        </Pressable>
      </Modal>
    </SafeAreaView>
  );
}
