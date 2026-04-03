import React, { useEffect, useState } from 'react';
import {
  Modal,
  SafeAreaView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { AlarmManager } from '../services/AlarmManager';
import { snoozeMedicationReminder } from '../services/medicationReminders';
import { useI18n } from '../i18n/I18nContext';

export const AlarmOverlay = () => {
  const [alarmState, setAlarmState] = useState(null);
  const { t, language } = useI18n();
  const isArabic = language === 'ar';
  const arRegular = isArabic ? { fontFamily: 'Cairo_400Regular' } : null;
  const arBold = isArabic ? { fontFamily: 'Cairo_700Bold' } : null;

  useEffect(() => {
    const unsub = AlarmManager.subscribe((state) => {
      setAlarmState(state);
      if (state) {
        AlarmManager.resumeSoundIfNeeded();
      }
    });
    return () => unsub();
  }, []);

  const handleTakeMedication = async () => {
    await AlarmManager.stopAlarm();
  };

  const handleSnooze = async () => {
    const medName = alarmState?.medicationName || t('overlayAlarm.defaultMed');
    await AlarmManager.stopAlarm();
    await snoozeMedicationReminder(medName, 'Rappel snooze');
  };

  if (!alarmState) return null;

  return (
    <Modal
      transparent={false}
      visible={!!alarmState}
      animationType="slide"
      statusBarTranslucent={true}
    >
      <SafeAreaView style={styles.container}>
        <View style={styles.content}>
          <View style={styles.iconPulseRing}>
            <View style={styles.iconContainer}>
              <Ionicons name="medical" size={72} color="#ffffff" />
            </View>
          </View>

          <View style={styles.badgeRow}>
            <Ionicons name="notifications" size={14} color="#e11d48" />
            <Text style={[styles.badgeText, arBold]}>{t('overlayAlarm.badge')}</Text>
          </View>

          <Text style={[styles.title, arBold]}>{t('overlayAlarm.title')}</Text>

          <View style={styles.medCard}>
            <Text style={[styles.medicationName, arBold]}>
              {alarmState.medicationName || t('overlayAlarm.defaultMed')}
            </Text>
            {alarmState.notes ? (
              <Text style={[styles.notesText, arRegular]}>{alarmState.notes}</Text>
            ) : null}
          </View>

          <TouchableOpacity
            style={styles.soundBanner}
            onPress={() => AlarmManager.resumeSoundIfNeeded()}
            activeOpacity={0.8}
          >
            <Ionicons name="volume-high" size={20} color="#38bdf8" />
            <Text style={[styles.soundBannerText, arBold]}>{t('overlayAlarm.soundActive')}</Text>
          </TouchableOpacity>

          <View style={styles.buttonContainer}>
            <TouchableOpacity
              style={[styles.button, styles.confirmButton]}
              onPress={handleTakeMedication}
              activeOpacity={0.88}
            >
              <Ionicons name="checkmark-circle" size={24} color="#ffffff" />
              <Text style={[styles.buttonText, arBold]}>{t('overlayAlarm.takeMed')}</Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={[styles.button, styles.snoozeButton]}
              onPress={handleSnooze}
              activeOpacity={0.88}
            >
              <Ionicons name="time-outline" size={22} color="#94a3b8" />
              <Text style={[styles.buttonTextSnooze, arBold]}>{t('overlayAlarm.snooze')}</Text>
            </TouchableOpacity>
          </View>
        </View>
      </SafeAreaView>
    </Modal>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#090d16',
  },
  content: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 28,
  },
  iconPulseRing: {
    padding: 14,
    borderRadius: 999,
    backgroundColor: 'rgba(225, 29, 72, 0.1)',
    marginBottom: 24,
  },
  iconContainer: {
    width: 110,
    height: 110,
    borderRadius: 999,
    backgroundColor: '#dc2626',
    justifyContent: 'center',
    alignItems: 'center',
  },
  badgeRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    backgroundColor: 'rgba(225, 29, 72, 0.12)',
    borderRadius: 999,
    paddingHorizontal: 14,
    paddingVertical: 6,
    marginBottom: 16,
  },
  badgeText: {
    color: '#fb7185',
    fontSize: 12,
    fontWeight: '700',
    letterSpacing: 0.3,
  },
  title: {
    fontSize: 24,
    color: '#ffffff',
    fontWeight: '900',
    textAlign: 'center',
    marginBottom: 24,
  },
  medCard: {
    width: '100%',
    backgroundColor: '#111827',
    borderColor: '#1e293b',
    borderWidth: 1,
    borderRadius: 16,
    paddingVertical: 20,
    paddingHorizontal: 18,
    alignItems: 'center',
    marginBottom: 16,
  },
  soundBanner: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    backgroundColor: 'rgba(56, 189, 248, 0.1)',
    borderRadius: 999,
    paddingHorizontal: 18,
    paddingVertical: 10,
    marginBottom: 24,
  },
  soundBannerText: {
    color: '#38bdf8',
    fontSize: 13,
    fontWeight: '700',
  },
  medicationName: {
    fontSize: 26,
    color: '#ffffff',
    fontWeight: '900',
    textAlign: 'center',
  },
  notesText: {
    marginTop: 8,
    fontSize: 14,
    color: '#94a3b8',
    textAlign: 'center',
    fontWeight: '500',
  },
  buttonContainer: {
    width: '100%',
    gap: 14,
  },
  button: {
    flexDirection: 'row',
    height: 56,
    borderRadius: 14,
    justifyContent: 'center',
    alignItems: 'center',
    gap: 10,
  },
  confirmButton: {
    backgroundColor: '#059669',
  },
  snoozeButton: {
    backgroundColor: 'rgba(255, 255, 255, 0.08)',
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.15)',
  },
  buttonText: {
    color: '#ffffff',
    fontSize: 17,
    fontWeight: '800',
  },
  buttonTextSnooze: {
    color: '#cbd5e1',
    fontSize: 15,
    fontWeight: '700',
  },
});
