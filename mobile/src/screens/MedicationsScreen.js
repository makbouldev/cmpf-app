import { useEffect, useMemo, useState } from 'react';
import {
  Alert,
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
import { Ionicons } from '@expo/vector-icons';
import FormInput from '../components/FormInput';
import { createMedicationStyles } from '../styles/medicationStyles';
import {
  addMedicationReminder,
  getMedicationReminders,
  isValidTime,
  removeMedicationTime,
} from '../services/medicationReminders';
import { AlarmManager } from '../services/AlarmManager';
import { useAppTheme } from '../theme/ThemeContext';
import { useI18n } from '../i18n/I18nContext';

const emptyForm = { name: '', timeInput: '08:30', times: [], notes: '' };
const HOURS = Array.from({ length: 24 }, (_, index) => String(index).padStart(2, '0'));
const MINUTES = ['00', '15', '30', '45'];

export default function MedicationsScreen({ onBack, onNavigate }) {
  const { width } = useWindowDimensions();
  const styles = useMemo(() => createMedicationStyles(width), [width]);
  const { colors, mode } = useAppTheme();
  const { language } = useI18n();
  const isArabic = language === 'ar';
  const isDark = mode === 'dark';
  const arRegular = isArabic ? { fontFamily: 'Cairo_400Regular' } : null;
  const arBold = isArabic ? { fontFamily: 'Cairo_700Bold' } : null;
  const [menuOpen, setMenuOpen] = useState(false);

  const txt = isArabic
    ? {
        pageTitle: 'تنظيم مواعيد وتنبيهات الأدوية',
        pageSub: 'منبه صوتي وتذكير منتظم لمواعيدك',
        addMedicine: 'حفظ وتفعيل التنبيه',
        medName: 'اسم الدواء',
        medPlaceholder: 'مثال: Paracetamol 500mg',
        times: 'أوقات التناول',
        addTime: 'إضافة وقت',
        notesPlaceholder: 'ملاحظات (مثال: حبة واحدة بعد الأكل)',
        currentMeds: 'الأدوية المبرمجة حالياً',
        noMeds: 'لا توجد أدوية مبرمجة حالياً. أضف دواءك لضبط المنبه.',
        edit: 'تعديل',
        delete: 'حذف',
        testSound: '🔔 تجربة المنبه الصوتي الآن',
        testItem: 'تجربة',
        invalidTime: 'أدخل الوقت بصيغة HH:MM مثل 08:30.',
        duplicateTime: 'هذا الوقت مضاف بالفعل.',
        nameRequired: 'يرجى إدخال اسم الدواء أولاً.',
        timeRequired: 'أضف وقتاً واحداً على الأقل للتذكير.',
        timeInvalid: 'يوجد وقت غير صالح. الصيغة يجب أن تكون HH:MM.',
        duplicateInForm: 'يوجد وقت مكرر في نفس النموذج.',
        timeExists: 'هذا الوقت موجود مسبقاً لهذا الدواء.',
        saveFail: 'تعذر حفظ التذكير حالياً.',
        saved: 'تم حفظ الدواء وتفعيل التنبيه بنجاح.',
        chooseTime: 'اختيار توقيت التنبيه',
        hour: 'الساعة',
        minute: 'الدقائق',
        confirm: 'تأكيد الوقت',
        cancel: 'إلغاء',
        settings: 'الإعدادات',
        about: 'من نحن',
        contact: 'اتصل بنا',
      }
    : {
        pageTitle: 'Rappels & Alarmes Médicaments',
        pageSub: 'Suivi rigoureux et alerte sonore quotidienne',
        addMedicine: "Enregistrer & Activer l'alarme",
        medName: 'Nom du médicament',
        medPlaceholder: 'Ex: Doliprane 1000mg',
        times: 'Heures de prise',
        addTime: 'Ajouter heure',
        notesPlaceholder: 'Instructions (ex: 1 comprimé après repas)',
        currentMeds: 'Médicaments programmés',
        noMeds: 'Aucun rappel programmé pour le moment. Ajoutez un médicament ci-dessus.',
        edit: 'Modifier',
        delete: 'Supprimer',
        testSound: "🔔 Tester la sonnerie d'alarme",
        testItem: 'Tester',
        invalidTime: "Entrez l'heure au format HH:MM, ex: 08:30.",
        duplicateTime: 'Cette heure est déjà ajoutée.',
        nameRequired: 'Veuillez saisir le nom du médicament.',
        timeRequired: 'Ajoutez au moins un horaire de prise.',
        timeInvalid: 'Un horaire est invalide. Le format doit être HH:MM.',
        duplicateInForm: 'Le formulaire contient un horaire en double.',
        timeExists: 'Cet horaire existe déjà pour ce médicament.',
        saveFail: "Impossible d'enregistrer le rappel pour le moment.",
        saved: "Rappel enregistré et alarme activée avec succès.",
        chooseTime: "Choisir l'heure du rappel",
        hour: 'Heure',
        minute: 'Minutes',
        confirm: "Confirmer l'horaire",
        cancel: 'Annuler',
        settings: 'Paramètres',
        about: 'À propos',
        contact: 'Contact',
      };

  const [form, setForm] = useState(emptyForm);
  const [loading, setLoading] = useState(false);
  const [reminders, setReminders] = useState([]);
  const [timePickerOpen, setTimePickerOpen] = useState(false);
  const [selectedHour, setSelectedHour] = useState('08');
  const [selectedMinute, setSelectedMinute] = useState('30');

  const update = (key, value) => setForm((prev) => ({ ...prev, [key]: value }));

  const handleMenuAction = (action) => {
    setMenuOpen(false);
    if (action === 'settings') {
      onNavigate?.('settings');
      return;
    }
    if (action === 'about') {
      onNavigate?.('about');
      return;
    }
    if (action === 'contact') {
      onNavigate?.('home');
    }
  };

  const loadReminders = async () => {
    const items = await getMedicationReminders();
    setReminders(items);
  };

  useEffect(() => {
    loadReminders();
    AlarmManager.startClockWatcher();
  }, []);

  const appendTime = (value) => {
    const time = String(value || form.timeInput || '08:30').trim();
    if (!time) return;
    if (!isValidTime(time)) {
      Alert.alert('Attention', txt.invalidTime);
      return;
    }
    if (form.times.includes(time)) {
      Alert.alert('Attention', txt.duplicateTime);
      return;
    }
    setForm((prev) => ({
      ...prev,
      times: [...prev.times, time].sort(),
      timeInput: time,
    }));
  };

  const removeDraftTime = (time) => {
    setForm((prev) => ({
      ...prev,
      times: prev.times.filter((item) => item !== time),
    }));
  };

  const openTimePicker = () => {
    const [hour = '08', minute = '30'] = String(form.timeInput || '08:30').split(':');
    setSelectedHour(hour);
    setSelectedMinute(minute);
    setTimePickerOpen(true);
  };

  const confirmTimeSelection = () => {
    const time = `${selectedHour}:${selectedMinute}`;
    setForm((prev) => {
      const alreadyHas = prev.times.includes(time);
      return {
        ...prev,
        timeInput: time,
        times: alreadyHas ? prev.times : [...prev.times, time].sort(),
      };
    });
    setTimePickerOpen(false);
  };

  const submit = async () => {
    setLoading(true);
    try {
      let nextTimes = [...form.times];
      const inputTime = String(form.timeInput || '08:30').trim();

      if (nextTimes.length === 0) {
        if (inputTime && isValidTime(inputTime)) {
          nextTimes.push(inputTime);
        }
      }

      nextTimes = nextTimes.sort();
      await addMedicationReminder({
        name: form.name,
        times: nextTimes,
        notes: form.notes,
      });

      await loadReminders();
      setForm(emptyForm);
      Alert.alert(isArabic ? 'نجاح' : 'Succès', txt.saved);
    } catch (error) {
      if (error.message === 'MEDICATION_NAME_REQUIRED') {
        Alert.alert('Attention', txt.nameRequired);
      } else if (error.message === 'MEDICATION_TIME_REQUIRED') {
        Alert.alert('Attention', txt.timeRequired);
      } else if (error.message === 'MEDICATION_TIME_INVALID') {
        Alert.alert('Attention', txt.timeInvalid);
      } else if (error.message === 'MEDICATION_TIME_DUPLICATED_IN_FORM') {
        Alert.alert('Attention', txt.duplicateInForm);
      } else if (error.message === 'MEDICATION_TIME_ALREADY_EXISTS') {
        Alert.alert('Attention', txt.timeExists);
      } else {
        Alert.alert('Erreur', txt.saveFail);
      }
    } finally {
      setLoading(false);
    }
  };

  const handleDeleteMedication = async (item) => {
    for (const timeItem of item.times) {
      await removeMedicationTime(item.id, timeItem.id);
    }
    await loadReminders();
  };

  const startEdit = (item) => {
    setForm({
      name: item.name,
      timeInput: item.times[0]?.time || '08:30',
      times: item.times.map((entry) => entry.time),
      notes: item.notes || '',
    });
  };

  const testAlarmNow = (medName = 'Doliprane 1000mg', medNotes = '') => {
    AlarmManager.startAlarm(medName, medNotes || 'Test de sonnerie immédiat');
  };

  const renderReminder = (item) => {
    const timeLabel = item.times.map((entry) => entry.time).join(' | ');
    return (
      <View
        key={item.id}
        style={[
          styles.medicationItemCard,
          isDark && { backgroundColor: colors.surfaceAlt, borderColor: colors.border },
        ]}
      >
        <View style={styles.medicationItemTop}>
          <View style={styles.medicationItemMain}>
            <Text style={[styles.medicationItemName, arBold, { color: colors.textPrimary }]}>{item.name}</Text>
            <View style={{ flexDirection: 'row', alignItems: 'center', gap: 6, marginTop: 4 }}>
              <Ionicons name="time" size={14} color="#0066ff" />
              <Text style={[styles.medicationItemTimes, arBold, { color: '#0066ff' }]}>{timeLabel}</Text>
            </View>
            {item.notes ? (
              <Text style={[styles.medicationItemMeta, arRegular, { color: colors.textSecondary }]}>{item.notes}</Text>
            ) : null}
          </View>

          <View style={styles.medicationActions}>
            <TouchableOpacity style={styles.editBtn} onPress={() => startEdit(item)} activeOpacity={0.9}>
              <Ionicons name="create-outline" size={14} color="#4b8bff" />
              <Text style={styles.editBtnText}>{txt.edit}</Text>
            </TouchableOpacity>

            <TouchableOpacity style={styles.deleteBtn} onPress={() => handleDeleteMedication(item)} activeOpacity={0.9}>
              <Text style={styles.deleteBtnText}>{txt.delete}</Text>
            </TouchableOpacity>
          </View>
        </View>
      </View>
    );
  };

  return (
    <SafeAreaView style={[styles.screen, { backgroundColor: colors.background }]}>
      <ScrollView contentContainerStyle={styles.content} showsVerticalScrollIndicator={false}>
        {/* Top Header Card */}
        <View style={[styles.topHeaderCard, isDark && { backgroundColor: colors.surface, borderColor: colors.border }]}>
          <View style={styles.topBar}>
            <TouchableOpacity
              style={[styles.topIconBtn, isDark && { backgroundColor: colors.surfaceAlt, borderColor: colors.border }]}
              onPress={onBack}
              activeOpacity={0.9}
            >
              <Ionicons name="chevron-back" size={20} color={colors.textPrimary} />
            </TouchableOpacity>

            <View style={styles.topTitleWrap}>
              <Text style={[styles.pageTitle, arBold, { color: colors.textPrimary }]}>{txt.pageTitle}</Text>
              <Text style={[styles.pageSub, arRegular, { color: colors.textSecondary }]}>{txt.pageSub}</Text>
            </View>

            <TouchableOpacity
              style={[styles.topIconBtn, isDark && { backgroundColor: colors.surfaceAlt, borderColor: colors.border }]}
              onPress={() => setMenuOpen(true)}
              activeOpacity={0.9}
            >
              <Ionicons name="settings-outline" size={18} color={colors.textPrimary} />
            </TouchableOpacity>
          </View>
        </View>

        {/* Form Card */}
        <View style={[styles.formCard, isDark && { backgroundColor: colors.surface, borderColor: colors.border }]}>
          {/* Quick Permission Settings Bar */}
          <TouchableOpacity
            style={[
              styles.testAlarmBtn,
              {
                backgroundColor: isDark ? 'rgba(16, 185, 129, 0.15)' : '#f0fdf4',
                borderColor: isDark ? '#065f46' : '#bbf7d0',
                marginBottom: 2,
              },
            ]}
            onPress={() => Linking.openSettings().catch(() => {})}
            activeOpacity={0.88}
          >
            <Ionicons name="shield-checkmark" size={18} color="#10b981" />
            <Text style={[styles.testAlarmText, arBold, { color: isDark ? '#34d399' : '#10b981' }]}>
              {isArabic ? 'إعدادات أذونات التنبيه في الخلفية ⚙️' : 'Autorisations des alarmes en arrière-plan ⚙️'}
            </Text>
          </TouchableOpacity>

          <View style={[styles.formSection, { marginTop: 14 }, isDark && { backgroundColor: colors.surfaceAlt, borderColor: colors.border }]}>
            <View style={styles.labelRow}>
              <Ionicons name="medical" size={18} color="#e11d48" />
              <Text style={[styles.sectionLabel, arBold, { color: colors.textPrimary }]}>{txt.medName}</Text>
            </View>

            <FormInput
              styles={styles}
              placeholder={txt.medPlaceholder}
              value={form.name}
              onChangeText={(value) => update('name', value)}
              shellStyle={isDark ? { backgroundColor: colors.surface, borderColor: colors.border } : null}
              inputStyle={isDark ? { color: colors.textPrimary } : null}
              placeholderTextColor={isDark ? '#8fa4c7' : '#8ea0ba'}
            />
          </View>

          <View style={[styles.formSection, isDark && { backgroundColor: colors.surfaceAlt, borderColor: colors.border }]}>
            <View style={styles.labelRow}>
              <Ionicons name="time" size={18} color="#0066ff" />
              <Text style={[styles.sectionLabel, arBold, { color: colors.textPrimary }]}>{txt.times}</Text>
            </View>

            {form.times.length > 0 ? (
              <View style={styles.timeChipsWrap}>
                {form.times.map((time) => (
                  <TouchableOpacity
                    key={time}
                    style={[styles.timeChip, isDark && { backgroundColor: 'rgba(0, 102, 255, 0.18)' }]}
                    onPress={() => removeDraftTime(time)}
                    activeOpacity={0.9}
                  >
                    <Text style={[styles.timeChipText, isDark && { color: '#60a5fa' }]}>{time}</Text>
                    <Ionicons name="close-circle" size={16} color="#e11d48" />
                  </TouchableOpacity>
                ))}
              </View>
            ) : null}

            <View style={styles.addTimeRow}>
              <View style={styles.addTimeInputWrap}>
                <TouchableOpacity
                  style={[
                    styles.timePickerField,
                    isDark && { backgroundColor: colors.surface, borderColor: colors.border },
                  ]}
                  onPress={openTimePicker}
                  activeOpacity={0.9}
                >
                  <Text
                    style={[
                      styles.timePickerFieldText,
                      { color: colors.textPrimary, fontWeight: '800' },
                    ]}
                  >
                    {form.timeInput || '08:30'}
                  </Text>
                  <Ionicons name="time-outline" size={18} color="#0066ff" />
                </TouchableOpacity>
              </View>

              <TouchableOpacity
                style={[
                  styles.addTimePill,
                  isDark && { backgroundColor: 'rgba(16, 185, 129, 0.15)', borderColor: '#065f46' },
                ]}
                onPress={() => appendTime(form.timeInput)}
                activeOpacity={0.9}
              >
                <Ionicons name="add" size={18} color="#10b981" />
                <Text style={[styles.addTimePillText, isDark && { color: '#34d399' }]}>{txt.addTime}</Text>
              </TouchableOpacity>
            </View>
          </View>

          <View style={[styles.formSection, isDark && { backgroundColor: colors.surfaceAlt, borderColor: colors.border }]}>
            <FormInput
              styles={styles}
              placeholder={txt.notesPlaceholder}
              value={form.notes}
              onChangeText={(value) => update('notes', value)}
              multiline
              shellStyle={isDark ? { backgroundColor: colors.surface, borderColor: colors.border } : null}
              inputStyle={isDark ? { color: colors.textPrimary } : null}
              placeholderTextColor={isDark ? '#8fa4c7' : '#8ea0ba'}
            />
          </View>

          {/* Submit Button */}
          <TouchableOpacity style={styles.addMedicineBtn} activeOpacity={0.9} onPress={submit} disabled={loading}>
            <Ionicons name="checkmark-circle" size={22} color="#ffffff" />
            <Text style={[styles.addMedicineBtnText, arBold]}>{txt.addMedicine}</Text>
          </TouchableOpacity>
        </View>

        {/* Reminders List */}
        <View style={[styles.listCard, isDark && { backgroundColor: colors.surface, borderColor: colors.border }]}>
          <View style={styles.listHeader}>
            <Text style={[styles.listTitle, arBold, { color: colors.textPrimary }]}>{txt.currentMeds}</Text>
            <View style={{ backgroundColor: '#eff6ff', paddingHorizontal: 10, paddingVertical: 4, borderRadius: 999 }}>
              <Text style={{ color: '#0066ff', fontSize: 12, fontWeight: '800' }}>{reminders.length}</Text>
            </View>
          </View>

          {reminders.length === 0 ? (
            <Text style={[styles.emptyText, arRegular, { color: colors.textSecondary }]}>{txt.noMeds}</Text>
          ) : (
            reminders.map(renderReminder)
          )}
        </View>
      </ScrollView>

      {/* Time Picker Modal */}
      <Modal transparent visible={timePickerOpen} animationType="fade" onRequestClose={() => setTimePickerOpen(false)}>
        <Pressable style={styles.timeModalOverlay} onPress={() => setTimePickerOpen(false)}>
          <Pressable
            style={[styles.timeModalCard, isDark && { backgroundColor: colors.surface, borderColor: colors.border }]}
          >
            <Text style={[styles.timeModalTitle, arBold, { color: colors.textPrimary }]}>{txt.chooseTime}</Text>

            <View style={styles.timePickerColumns}>
              <View style={styles.timePickerColumn}>
                <Text style={[styles.timePickerColumnTitle, arBold, { color: colors.textSecondary }]}>{txt.hour}</Text>
                <View style={styles.timeOptionGrid}>
                  {HOURS.map((hour) => {
                    const active = selectedHour === hour;
                    return (
                      <TouchableOpacity
                        key={hour}
                        style={[styles.timeOptionChip, active && styles.timeOptionChipActive]}
                        onPress={() => setSelectedHour(hour)}
                        activeOpacity={0.9}
                      >
                        <Text style={[styles.timeOptionText, active && styles.timeOptionTextActive]}>{hour}</Text>
                      </TouchableOpacity>
                    );
                  })}
                </View>
              </View>

              <View style={styles.timePickerColumn}>
                <Text style={[styles.timePickerColumnTitle, arBold, { color: colors.textSecondary }]}>{txt.minute}</Text>
                <View style={styles.timeOptionGrid}>
                  {MINUTES.map((minute) => {
                    const active = selectedMinute === minute;
                    return (
                      <TouchableOpacity
                        key={minute}
                        style={[styles.timeOptionChip, active && styles.timeOptionChipActive]}
                        onPress={() => setSelectedMinute(minute)}
                        activeOpacity={0.9}
                      >
                        <Text style={[styles.timeOptionText, active && styles.timeOptionTextActive]}>{minute}</Text>
                      </TouchableOpacity>
                    );
                  })}
                </View>
              </View>
            </View>

            <View style={styles.timeModalActions}>
              <TouchableOpacity style={styles.timeModalCancelBtn} onPress={() => setTimePickerOpen(false)} activeOpacity={0.9}>
                <Text style={styles.timeModalCancelText}>{txt.cancel}</Text>
              </TouchableOpacity>

              <TouchableOpacity style={styles.timeModalConfirmBtn} onPress={confirmTimeSelection} activeOpacity={0.9}>
                <Text style={styles.timeModalConfirmText}>{txt.confirm}</Text>
              </TouchableOpacity>
            </View>
          </Pressable>
        </Pressable>
      </Modal>

      {/* Menu Modal */}
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
