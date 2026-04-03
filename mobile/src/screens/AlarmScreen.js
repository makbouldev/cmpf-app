import React, { useEffect, useState } from 'react';
import {
  SafeAreaView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
  Dimensions,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { stopNativeAlarm, scheduleNativeAlarm } from '../services/medicationAlarms';

const { width, height } = Dimensions.get('window');

export default function AlarmScreen({ medicationName, onDismiss }) {
  const handleTakeMedication = () => {
    stopNativeAlarm();
    onDismiss?.();
  };

  const handleSnooze = () => {
    stopNativeAlarm();
    // Schedule snooze in 5 minutes
    const snoozeTime = Date.now() + 5 * 60 * 1000;
    scheduleNativeAlarm('snooze-' + Date.now(), medicationName, snoozeTime);
    onDismiss?.();
  };

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.content}>
        <View style={styles.iconContainer}>
          <Ionicons name="notifications" size={100} color="#ff3b30" />
        </View>

        <Text style={styles.title}>ALERTE MÉDICAMENT</Text>
        <Text style={styles.medName}>{medicationName || "Nom du médicament"}</Text>
        <Text style={styles.subtitle}>C'est l'heure de votre prise !</Text>

        <View style={styles.buttonContainer}>
          <TouchableOpacity 
            style={[styles.button, styles.takeButton]} 
            onPress={handleTakeMedication}
          >
            <Ionicons name="checkmark-circle" size={30} color="#fff" />
            <Text style={styles.buttonText}>JE L'AI PRIS</Text>
          </TouchableOpacity>

          <TouchableOpacity 
            style={[styles.button, styles.snoozeButton]} 
            onPress={handleSnooze}
          >
            <Ionicons name="alarm" size={30} color="#8e8e93" />
            <Text style={styles.buttonTextSnooze}>SNOOZE (5 MIN)</Text>
          </TouchableOpacity>
        </View>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#000',
  },
  content: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  iconContainer: {
    marginBottom: 30,
    backgroundColor: 'rgba(255, 59, 48, 0.1)',
    borderRadius: 100,
    padding: 30,
  },
  title: {
    fontSize: 28,
    color: '#ff3b30',
    fontWeight: '900',
    letterSpacing: 2,
    marginBottom: 10,
  },
  medName: {
    fontSize: 40,
    color: '#fff',
    fontWeight: 'bold',
    textAlign: 'center',
    marginBottom: 10,
  },
  subtitle: {
    fontSize: 18,
    color: '#8e8e93',
    textAlign: 'center',
    marginBottom: 60,
  },
  buttonContainer: {
    width: '100%',
    gap: 20,
  },
  button: {
    flexDirection: 'row',
    height: 80,
    borderRadius: 40,
    justifyContent: 'center',
    alignItems: 'center',
    gap: 15,
  },
  takeButton: {
    backgroundColor: '#34c759',
  },
  snoozeButton: {
    backgroundColor: '#1c1c1e',
    borderWidth: 1,
    borderColor: '#3a3a3c',
  },
  buttonText: {
    color: '#fff',
    fontSize: 22,
    fontWeight: 'bold',
  },
  buttonTextSnooze: {
    color: '#8e8e93',
    fontSize: 22,
    fontWeight: 'bold',
  },
});
