import { useEffect, useMemo, useState } from 'react';
import {
  Alert,
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
import { useAppTheme } from '../theme/ThemeContext';
import { useI18n } from '../i18n/I18nContext';

const emptyForm = { name: '', timeInput: '', times: [], notes: '' };
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

  const txt = isArabic
      ? {
        pageTitle: 'تنظيم مواعيد تناول أدويتك بسهولة',
        pageSub: 'مسار بسيط وسريع',
        addMedicine: 'إضافة دواء جديد',
        medName: 'اسم الدواء',
        medPlaceholder: 'Paracetamol 500mg',
        times: 'أوقات التناول',
        addTime: 'إضافة وقت',
        notesPlaceholder: 'قبل الأكل - بعد الأكل - مع الماء',
        currentMeds: 'الأدوية الحالية',
        noMeds: 'لا توجد أدوية مبرمجة حالياً.',
        edit: 'تعديل',
        delete: 'حذف',
        invalidTime: 'أدخل الوقت بصيغة HH:MM مثل 08:30.',
        duplicateTime: 'هذا الوقت مضاف بالفعل.',
        nameRequired: 'أدخل اسم الدواء.',
        timeRequired: 'أضف وقتاً واحداً على الأقل.',
        timeInvalid: 'يوجد وقت غير صالح. الصيغة يجب أن تكون HH:MM.',
        duplicateInForm: 'يوجد وقت مكرر في نفس النموذج.',
        timeExists: 'هذا الوقت موجود لهذا الدواء.',
        saveFail: 'تعذر حفظ التذكير حالياً.',
        saved: 'تم حفظ التذكير بنجاح.',
        chooseTime: 'اختيار الوقت',
        hour: 'الساعة',
        minute: 'الدقائق',
        confirm: 'تأكيد',
        cancel: 'إلغاء',
      }
      : {
        pageTitle: 'Organisez vos rappels medicaments facilement',
        pageSub: 'Un parcours simple et rapide',
        addMedicine: 'Ajouter un nouveau medicament',
        medName: 'Nom du medicament',
        medPlaceholder: 'Paracetamol 500mg',
        times: 'Heures de prise',
        addTime: 'Ajouter heure',
        notesPlaceholder: 'Avant repas - apres repas - avec eau',
        currentMeds: 'Medicaments actuels',
        noMeds: 'Aucun medicament programme pour le moment.',
        edit: 'Modifier',
        delete: 'Supprimer',
        invalidTime: "Entrez l'heure au format HH:MM, ex: 08:30.",
        duplicateTime: 'Cette heure est deja ajoutee.',
        nameRequired: 'Entrez le nom du medicament.',
        timeRequired: 'Ajoutez au moins un horaire.',
        timeInvalid: 'Un horaire est invalide. Le format doit etre HH:MM.',
        duplicateInForm: 'Le formulaire contient un horaire en double.',
        timeExists: 'Cet horaire existe deja pour ce medicament.',
        saveFail: "Impossible d'enregistrer le rappel pour le moment.",
        saved: 'Rappel enregistre avec succes.',
        chooseTime: "Choisir l'heure",
        hour: 'Heure',
        minute: 'Minutes',
        confirm: 'Confirmer',
        cancel: 'Annuler',
      };

  const [form, setForm] = useState(emptyForm);
  const [loading, setLoading] = useState(false);
  const [reminders, setReminders] = useState([]);
  const [timePickerOpen, setTimePickerOpen] = useState(false);
  const [selectedHour, setSelectedHour] = useState('08');
  const [selectedMinute, setSelectedMinute] = useState('30');

  const update = (key, value) => setForm((prev) => ({ ...prev, [key]: value }));

  const loadReminders = async () => {
    const items = await getMedicationReminders();
    setReminders(items);
  };

  useEffect(() => {
    loadReminders();
  }, []);

  const appendTime = (value) => {
    const time = String(value || '').trim();
    if (!time) {
      return;
    }
    if (!isValidTime(time)) {
      Alert.alert('Alert', txt.invalidTime);
      return;
    }
    if (form.times.includes(time)) {
      Alert.alert('Alert', txt.duplicateTime);
      return;
    }
    setForm((prev) => ({
      ...prev,
      times: [...prev.times, time].sort(),
      timeInput: '',
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
    update('timeInput', `${selectedHour}:${selectedMinute}`);
    setTimePickerOpen(false);
  };

  const submit = async () => {
    setLoading(true);
    try {
      let nextTimes = [...form.times];
      const inputTime = String(form.timeInput || '').trim();

      if (inputTime) {
        if (!isValidTime(inputTime)) {
          Alert.alert('Alert', txt.invalidTime);
          setLoading(false);
          return;
        }
        if (!nextTimes.includes(inputTime)) {
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
      Alert.alert('Succes', txt.saved);
    } catch (error) {
      if (error.message === 'MEDICATION_NAME_REQUIRED') {
        Alert.alert('Alert', txt.nameRequired);
      } else if (error.message === 'MEDICATION_TIME_REQUIRED') {
        Alert.alert('Alert', txt.timeRequired);
      } else if (error.message === 'MEDICATION_TIME_INVALID') {
        Alert.alert('Alert', txt.timeInvalid);
      } else if (error.message === 'MEDICATION_TIME_DUPLICATED_IN_FORM') {
        Alert.alert('Alert', txt.duplicateInForm);
      } else if (error.message === 'MEDICATION_TIME_ALREADY_EXISTS') {
        Alert.alert('Alert', txt.timeExists);
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
      timeInput: '',
      times: item.times.map((entry) => entry.time),
      notes: item.notes || '',
    });
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
            <Text style={[styles.medicationItemTimes, arRegular, { color: colors.textSecondary }]}>{timeLabel}</Text>
            {item.notes ? (
              <Text style={[styles.medicationItemMeta, arRegular, { color: colors.textSecondary }]}>{item.notes}</Text>
            ) : null}
          </View>

          <View style={styles.medicationActions}>
            <TouchableOpacity style={styles.editBtn} onPress={() => startEdit(item)} activeOpacity={0.9}>
              <Ionicons name="create-outline" size={15} color="#4b8bff" />
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
              onPress={() => onNavigate?.('profile')}
              activeOpacity={0.9}
            >
              <Ionicons name="person-outline" size={18} color={colors.textPrimary} />
            </TouchableOpacity>
          </View>
        </View>

        <View style={[styles.formCard, isDark && { backgroundColor: colors.surface, borderColor: colors.border }]}>
          <TouchableOpacity style={styles.addMedicineBtn} activeOpacity={0.9} onPress={submit} disabled={loading}>
            <Ionicons name="add" size={22} color="#ffffff" />
            <Text style={[styles.addMedicineBtnText, arBold]}>{txt.addMedicine}</Text>
          </TouchableOpacity>

          <View style={styles.formSection}>
            <View style={styles.labelRow}>
              <Ionicons name="medical-outline" size={18} color="#ff7e7e" />
              <Text style={[styles.sectionLabel, arBold, { color: colors.textPrimary }]}>{txt.medName}</Text>
            </View>

            <FormInput
              styles={styles}
              placeholder={txt.medPlaceholder}
              value={form.name}
              onChangeText={(value) => update('name', value)}
              shellStyle={isDark ? { backgroundColor: colors.surfaceAlt, borderColor: colors.border } : null}
              inputStyle={isDark ? { color: colors.textPrimary } : null}
              placeholderTextColor={isDark ? '#8fa4c7' : '#8ea0ba'}
            />
          </View>

          <View style={styles.formSection}>
            <View style={styles.labelRow}>
              <Ionicons name="time-outline" size={18} color="#6d88c3" />
              <Text style={[styles.sectionLabel, arBold, { color: colors.textPrimary }]}>{txt.times}</Text>
            </View>

            <View style={styles.timeChipsWrap}>
              {form.times.map((time) => (
                <TouchableOpacity key={time} style={styles.timeChip} onPress={() => removeDraftTime(time)} activeOpacity={0.9}>
                  <Text style={styles.timeChipText}>{time}</Text>
                  <Ionicons name="close" size={15} color="#4d5f85" />
                </TouchableOpacity>
              ))}
            </View>

            <View style={styles.addTimeRow}>
              <View style={styles.addTimeInputWrap}>
                <TouchableOpacity
                  style={[
                    styles.timePickerField,
                    isDark && { backgroundColor: colors.surfaceAlt, borderColor: colors.border },
                  ]}
                  onPress={openTimePicker}
                  activeOpacity={0.9}
                >
                  <Text
                    style={[
                      styles.timePickerFieldText,
                      { color: form.timeInput ? colors.textPrimary : isDark ? '#8fa4c7' : '#8ea0ba' },
                    ]}
                  >
                    {form.timeInput || '08:30'}
                  </Text>
                  <Ionicons name="time-outline" size={18} color="#7b8dad" />
                </TouchableOpacity>
              </View>

              <TouchableOpacity style={styles.addTimePill} onPress={() => appendTime(form.timeInput)} activeOpacity={0.9}>
                <Ionicons name="add" size={18} color="#23c46e" />
                <Text style={styles.addTimePillText}>{txt.addTime}</Text>
              </TouchableOpacity>
            </View>
          </View>

          <View style={styles.formSection}>
            <FormInput
              styles={styles}
              placeholder={txt.notesPlaceholder}
              value={form.notes}
              onChangeText={(value) => update('notes', value)}
              multiline
              shellStyle={isDark ? { backgroundColor: colors.surfaceAlt, borderColor: colors.border } : null}
              inputStyle={isDark ? { color: colors.textPrimary } : null}
              placeholderTextColor={isDark ? '#8fa4c7' : '#8ea0ba'}
            />
          </View>
        </View>

        <View style={[styles.listCard, isDark && { backgroundColor: colors.surface, borderColor: colors.border }]}>
          <View style={styles.listHeader}>
            <Text style={[styles.listTitle, arBold, { color: colors.textPrimary }]}>{txt.currentMeds}</Text>
            <Ionicons name="ellipsis-horizontal" size={20} color="#7a8cab" />
          </View>

          {reminders.length === 0 ? (
            <Text style={[styles.emptyText, arRegular, { color: colors.textSecondary }]}>{txt.noMeds}</Text>
          ) : (
            reminders.map(renderReminder)
          )}
        </View>
      </ScrollView>

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
    </SafeAreaView>
  );
}
