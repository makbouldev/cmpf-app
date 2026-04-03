import React from 'react';
import {
  SafeAreaView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { stopNativeAlarm, scheduleNativeAlarm } from '../services/medicationAlarms';

export default function AlarmScreen({ medicationName, onDismiss }) {
  const handleTakeMedication = () => {
    stopNativeAlarm();
    onDismiss?.();
  };

  const handleSnooze = () => {
    stopNativeAlarm();
    const snoozeTime = Date.now() + 5 * 60 * 1000;
    scheduleNativeAlarm('snooze-' + Date.now(), medicationName, snoozeTime);
    onDismiss?.();
  };

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.content}>
        <View style={styles.iconRing}>
          <Ionicons name="notifications" size={48} color="#ffffff" />
        </View>

        <Text style={styles.label}>ALERTE MÉDICAMENT</Text>
        <Text style={styles.medName}>{medicationName || "Nom du médicament"}</Text>
        <Text style={styles.subtitle}>C'est l'heure de votre prise</Text>

        <View style={styles.actions}>
          <TouchableOpacity style={styles.takeBtn} onPress={handleTakeMedication} activeOpacity={0.8}>
            <Ionicons name="checkmark" size={24} color="#fff" />
            <Text style={styles.takeBtnText}>JE L'AI PRIS</Text>
          </TouchableOpacity>

          <TouchableOpacity style={styles.snoozeBtn} onPress={handleSnooze} activeOpacity={0.8}>
            <Ionicons name="alarm-outline" size={22} color="#9ca3af" />
            <Text style={styles.snoozeBtnText}>SNOOZE (5 MIN)</Text>
          </TouchableOpacity>
        </View>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#111827',
  },
  content: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 24,
  },
  iconRing: {
    width: 96,
    height: 96,
    borderRadius: 48,
    backgroundColor: '#dc2626',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 32,
  },
  label: {
    fontSize: 14,
    color: '#dc2626',
    fontWeight: '700',
    letterSpacing: 2,
    marginBottom: 8,
  },
  medName: {
    fontSize: 32,
    color: '#f9fafb',
    fontWeight: '800',
    textAlign: 'center',
    marginBottom: 8,
  },
  subtitle: {
    fontSize: 16,
    color: '#6b7280',
    textAlign: 'center',
    marginBottom: 56,
  },
  actions: {
    width: '100%',
    gap: 12,
  },
  takeBtn: {
    flexDirection: 'row',
    height: 56,
    borderRadius: 16,
    justifyContent: 'center',
    alignItems: 'center',
    gap: 10,
    backgroundColor: '#059669',
  },
  takeBtnText: {
    color: '#fff',
    fontSize: 17,
    fontWeight: '700',
  },
  snoozeBtn: {
    flexDirection: 'row',
    height: 56,
    borderRadius: 16,
    justifyContent: 'center',
    alignItems: 'center',
    gap: 10,
    backgroundColor: '#1f2937',
    borderWidth: 1,
    borderColor: '#374151',
  },
  snoozeBtnText: {
    color: '#9ca3af',
    fontSize: 17,
    fontWeight: '700',
  },
});
