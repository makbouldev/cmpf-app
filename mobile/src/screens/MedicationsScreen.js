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
        pageTitle: 'تنظيم مواعيد الأدوية',
        pageSub: 'منبه صوتي وتذكير منتظم',
        addMedicine: 'حفظ وتفعيل التنبيه',
        medName: 'اسم الدواء',
        medPlaceholder: 'مثال: Paracetamol 500mg',
        times: 'أوقات التناول',
        addTime: 'إضافة',
        notesPlaceholder: 'ملاحظات (مثال: حبة واحدة بعد الأكل)',
        currentMeds: 'الأدوية المبرمجة',
        noMeds: 'لا توجد أدوية مبرمجة. أضف دواءك لضبط المنبه.',
        edit: 'تعديل',
        delete: 'حذف',
        invalidTime: 'أدخل الوقت بصيغة HH:MM.',
        duplicateTime: 'هذا الوقت مضاف بالفعل.',
        nameRequired: 'يرجى إدخال اسم الدواء.',
        timeRequired: 'أضف وقتاً واحداً على الأقل.',
        timeInvalid: 'يوجد وقت غير صالح.',
        duplicateInForm: 'يوجد وقت مكرر.',
        timeExists: 'هذا الوقت موجود مسبقاً.',
        saveFail: 'تعذر حفظ التذكير.',
        saved: 'تم حفظ الدواء بنجاح.',
        chooseTime: 'اختيار التوقيت',
        hour: 'الساعة',
        minute: 'الدقائق',
        confirm: 'تأكيد',
        cancel: 'إلغاء',
        settings: 'الإعدادات',
        about: 'من نحن',
        contact: 'اتصل بنا',
        permissions: 'إعدادات التنبيهات',
      }
    : {
        pageTitle: 'Rappels Médicaments',
        pageSub: 'Alarme sonore quotidienne',
        addMedicine: "Enregistrer l'alarme",
        medName: 'Nom du médicament',
        medPlaceholder: 'Ex: Doliprane 1000mg',
        times: 'Heures de prise',
        addTime: 'Ajouter',
        notesPlaceholder: 'Instructions (ex: 1 comprimé après repas)',
        currentMeds: 'Médicaments programmés',
        noMeds: 'Aucun rappel programmé. Ajoutez un médicament ci-dessus.',
        edit: 'Modifier',
        delete: 'Supprimer',
        invalidTime: "Entrez l'heure au format HH:MM.",
        duplicateTime: 'Cette heure est déjà ajoutée.',
        nameRequired: 'Veuillez saisir le nom du médicament.',
        timeRequired: 'Ajoutez au moins un horaire.',
        timeInvalid: 'Un horaire est invalide.',
        duplicateInForm: 'Horaire en double.',
        timeExists: 'Cet horaire existe déjà.',
        saveFail: "Impossible d'enregistrer le rappel.",
        saved: 'Rappel enregistré avec succès.',
        chooseTime: "Choisir l'heure",
        hour: 'Heure',
        minute: 'Minutes',
        confirm: 'Confirmer',
        cancel: 'Annuler',
        settings: 'Paramètres',
        about: 'À propos',
        contact: 'Contact',
        permissions: 'Autorisations alarmes',
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
    if (action === 'settings') { onNavigate?.('settings'); return; }
    if (action === 'about') { onNavigate?.('about'); return; }
    if (action === 'contact') { onNavigate?.('home'); }
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

  const renderReminder = (item) => {
    const timeLabel = item.times.map((entry) => entry.time).join('  ·  ');
    return (
      <View
        key={item.id}
        style={[styles.medicationItemCard, isDark && { backgroundColor: colors.surfaceAlt, borderColor: colors.border }]}
      >
        <View style={styles.medicationItemTop}>
          <View style={styles.medicationItemMain}>
            <Text style={[styles.medicationItemName, arBold, { color: colors.textPrimary }]}>{item.name}</Text>
            <View style={{ flexDirection: 'row', alignItems: 'center', gap: 5, marginTop: 4 }}>
              <Ionicons name="time-outline" size={13} color="#2563eb" />
              <Text style={[styles.medicationItemTimes, arBold]}>{timeLabel}</Text>
            </View>
            {item.notes ? (
              <Text style={[styles.medicationItemMeta, arRegular, { color: colors.textSecondary }]}>{item.notes}</Text>
            ) : null}
          </View>

          <View style={styles.medicationActions}>
            <TouchableOpacity style={[styles.editBtn, isDark && { backgroundColor: colors.surface, borderColor: colors.border }]} onPress={() => startEdit(item)} activeOpacity={0.8}>
              <Ionicons name="create-outline" size={13} color="#2563eb" />
              <Text style={styles.editBtnText}>{txt.edit}</Text>
            </TouchableOpacity>

            <TouchableOpacity style={[styles.deleteBtn, isDark && { backgroundColor: 'rgba(220, 38, 38, 0.1)', borderColor: 'rgba(220, 38, 38, 0.2)' }]} onPress={() => handleDeleteMedication(item)} activeOpacity={0.8}>
              <Text style={styles.deleteBtnText}>{txt.delete}</Text>
            </TouchableOpacity>
          </View>
        </View>
      </View>
    );
  };

  return (
    <SafeAreaView style={[styles.screen, { backgroundColor: isDark ? colors.background : '#f8fafc' }]}>
      {/* Header */}
      <View style={[styles.header, isDark && { backgroundColor: colors.surface, borderBottomColor: colors.border }]}>
        <View style={styles.headerRow}>
          <TouchableOpacity style={[styles.backBtn, isDark && { backgroundColor: colors.surfaceAlt }]} onPress={onBack}>
            <Ionicons name="arrow-back" size={20} color={isDark ? colors.textPrimary : '#374151'} />
          </TouchableOpacity>

          <View style={styles.headerTitleWrap}>
            <Text style={[styles.headerTitle, arBold, { color: colors.textPrimary }]}>{txt.pageTitle}</Text>
            <Text style={[styles.headerSub, arRegular, { color: colors.textSecondary }]}>{txt.pageSub}</Text>
          </View>

          <TouchableOpacity
            style={[styles.headerActionBtn, isDark && { backgroundColor: colors.surfaceAlt }]}
            onPress={() => setMenuOpen(true)}
            activeOpacity={0.8}
          >
            <Ionicons name="ellipsis-vertical" size={18} color={isDark ? colors.textPrimary : '#374151'} />
          </TouchableOpacity>
        </View>
      </View>

      <ScrollView contentContainerStyle={styles.content} showsVerticalScrollIndicator={false}>
        {/* Form Card */}
        <View style={[styles.formCard, isDark && { backgroundColor: colors.surface, borderColor: colors.border }]}>
          {/* Permission Bar */}
          <TouchableOpacity
            style={[styles.permissionBar, isDark && { backgroundColor: 'rgba(5, 150, 105, 0.1)', borderColor: 'rgba(5, 150, 105, 0.2)' }]}
            onPress={() => Linking.openSettings().catch(() => {})}
            activeOpacity={0.8}
          >
            <Ionicons name="shield-checkmark-outline" size={16} color={isDark ? '#34d399' : '#059669'} />
            <Text style={[styles.permissionBarText, arRegular, { color: isDark ? '#34d399' : '#059669' }]}>
              {txt.permissions}
            </Text>
          </TouchableOpacity>

          {/* Medicine Name */}
          <View style={styles.formSection}>
            <View style={styles.labelRow}>
              <Ionicons name="medical-outline" size={16} color="#dc2626" />
              <Text style={[styles.sectionLabel, arBold, { color: colors.textPrimary }]}>{txt.medName}</Text>
            </View>
            <FormInput
              styles={styles}
              placeholder={txt.medPlaceholder}
              value={form.name}
              onChangeText={(value) => update('name', value)}
              shellStyle={isDark ? { backgroundColor: colors.surfaceAlt, borderColor: colors.border } : null}
              inputStyle={isDark ? { color: colors.textPrimary } : null}
              placeholderTextColor="#9ca3af"
            />
          </View>

          {/* Times */}
          <View style={styles.formSection}>
            <View style={styles.labelRow}>
              <Ionicons name="time-outline" size={16} color="#2563eb" />
              <Text style={[styles.sectionLabel, arBold, { color: colors.textPrimary }]}>{txt.times}</Text>
            </View>

            {form.times.length > 0 ? (
              <View style={styles.timeChipsWrap}>
                {form.times.map((time) => (
                  <TouchableOpacity
                    key={time}
                    style={[styles.timeChip, isDark && { backgroundColor: 'rgba(37, 99, 235, 0.15)' }]}
                    onPress={() => removeDraftTime(time)}
                    activeOpacity={0.8}
                  >
                    <Text style={[styles.timeChipText, isDark && { color: '#60a5fa' }]}>{time}</Text>
                    <Ionicons name="close-circle" size={14} color="#dc2626" />
                  </TouchableOpacity>
                ))}
              </View>
            ) : null}

            <View style={styles.addTimeRow}>
              <View style={styles.addTimeInputWrap}>
                <TouchableOpacity
                  style={[styles.timePickerField, isDark && { backgroundColor: colors.surfaceAlt, borderColor: colors.border }]}
                  onPress={openTimePicker}
                  activeOpacity={0.8}
                >
                  <Text style={[styles.timePickerFieldText, { color: colors.textPrimary }]}>
                    {form.timeInput || '08:30'}
                  </Text>
                  <Ionicons name="time-outline" size={16} color="#2563eb" />
                </TouchableOpacity>
              </View>

              <TouchableOpacity
                style={[styles.addTimePill, isDark && { backgroundColor: 'rgba(5, 150, 105, 0.1)', borderColor: 'rgba(5, 150, 105, 0.2)' }]}
                onPress={() => appendTime(form.timeInput)}
                activeOpacity={0.8}
              >
                <Ionicons name="add" size={16} color={isDark ? '#34d399' : '#059669'} />
                <Text style={[styles.addTimePillText, isDark && { color: '#34d399' }]}>{txt.addTime}</Text>
              </TouchableOpacity>
            </View>
          </View>

          {/* Notes */}
          <View style={styles.formSection}>
            <FormInput
              styles={styles}
              placeholder={txt.notesPlaceholder}
              value={form.notes}
              onChangeText={(value) => update('notes', value)}
              multiline
              shellStyle={isDark ? { backgroundColor: colors.surfaceAlt, borderColor: colors.border } : null}
              inputStyle={isDark ? { color: colors.textPrimary } : null}
              placeholderTextColor="#9ca3af"
            />
          </View>

          {/* Submit */}
          <TouchableOpacity style={styles.addMedicineBtn} activeOpacity={0.8} onPress={submit} disabled={loading}>
            <Ionicons name="checkmark-circle" size={20} color="#ffffff" />
            <Text style={[styles.addMedicineBtnText, arBold]}>{txt.addMedicine}</Text>
          </TouchableOpacity>
        </View>

        {/* Reminders List */}
        <View style={[styles.listCard, isDark && { backgroundColor: colors.surface, borderColor: colors.border }]}>
          <View style={styles.listHeader}>
            <Text style={[styles.listTitle, arBold, { color: colors.textPrimary }]}>{txt.currentMeds}</Text>
            <View style={[styles.countBadge, isDark && { backgroundColor: colors.surfaceAlt }]}>
              <Text style={[styles.countBadgeText, { color: colors.textSecondary }]}>{reminders.length}</Text>
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
          <Pressable style={[styles.timeModalCard, isDark && { backgroundColor: colors.surface, borderColor: colors.border }]}>
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
                        style={[
                          styles.timeOptionChip,
                          active && styles.timeOptionChipActive,
                          isDark && !active && { backgroundColor: colors.surfaceAlt },
                        ]}
                        onPress={() => setSelectedHour(hour)}
                        activeOpacity={0.8}
                      >
                        <Text style={[styles.timeOptionText, active && styles.timeOptionTextActive, isDark && !active && { color: colors.textPrimary }]}>
                          {hour}
                        </Text>
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
                        style={[
                          styles.timeOptionChip,
                          active && styles.timeOptionChipActive,
                          isDark && !active && { backgroundColor: colors.surfaceAlt },
                        ]}
                        onPress={() => setSelectedMinute(minute)}
                        activeOpacity={0.8}
                      >
                        <Text style={[styles.timeOptionText, active && styles.timeOptionTextActive, isDark && !active && { color: colors.textPrimary }]}>
                          {minute}
                        </Text>
                      </TouchableOpacity>
                    );
                  })}
                </View>
              </View>
            </View>

            <View style={styles.timeModalActions}>
              <TouchableOpacity style={[styles.timeModalCancelBtn, isDark && { backgroundColor: colors.surfaceAlt, borderColor: colors.border }]} onPress={() => setTimePickerOpen(false)} activeOpacity={0.8}>
                <Text style={[styles.timeModalCancelText, { color: colors.textSecondary }]}>{txt.cancel}</Text>
              </TouchableOpacity>

              <TouchableOpacity style={styles.timeModalConfirmBtn} onPress={confirmTimeSelection} activeOpacity={0.8}>
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
            <TouchableOpacity style={styles.menuItem} onPress={() => handleMenuAction('settings')} activeOpacity={0.8}>
              <Text style={[styles.menuText, arRegular, { color: colors.textPrimary }]}>{txt.settings}</Text>
              <Ionicons name="settings-outline" size={16} color={colors.textSecondary} />
            </TouchableOpacity>

            <TouchableOpacity style={styles.menuItem} onPress={() => handleMenuAction('about')} activeOpacity={0.8}>
              <Text style={[styles.menuText, arRegular, { color: colors.textPrimary }]}>{txt.about}</Text>
              <Ionicons name="information-circle-outline" size={16} color={colors.textSecondary} />
            </TouchableOpacity>

            <TouchableOpacity style={styles.menuItem} onPress={() => handleMenuAction('contact')} activeOpacity={0.8}>
              <Text style={[styles.menuText, arRegular, { color: colors.textPrimary }]}>{txt.contact}</Text>
              <Ionicons name="call-outline" size={16} color={colors.textSecondary} />
            </TouchableOpacity>
          </View>
        </Pressable>
      </Modal>
    </SafeAreaView>
  );
}
