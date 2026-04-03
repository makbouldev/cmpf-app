import { Audio } from 'expo-av';
import * as Notifications from 'expo-notifications';
import { Platform, Vibration } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { ALARM_SOUND_URI } from './alarmSoundData';

const ALARM_STATE_KEY = 'cmpf-active-alarm';
const localAlarmSound = require('../../assets/alarm.wav');

let soundInstance = null;
let isRinging = false;
let alarmStateListeners = new Set();
let clockWatcherInterval = null;
let webAudioCtx = null;
let webAudioInterval = null;
let webAudioEl = null;
const triggeredToday = new Set();

const notifyListeners = (state) => {
  alarmStateListeners.forEach((listener) => {
    try {
      listener(state);
    } catch (_e) {}
  });
};

const startWebAudio = () => {
  if (typeof window === 'undefined') return;
  try {
    if (!webAudioEl) {
      webAudioEl = new window.Audio(ALARM_SOUND_URI);
      webAudioEl.loop = true;
      webAudioEl.volume = 1.0;
    }
    webAudioEl.currentTime = 0;
    const playPromise = webAudioEl.play();
    if (playPromise !== undefined) {
      playPromise.catch((err) => {
        console.warn('HTML5 Audio play prevented:', err);
      });
    }
  } catch (e) {
    console.warn('Audio element error:', e);
  }
};

const stopWebAudio = () => {
  if (webAudioEl) {
    try {
      webAudioEl.pause();
      webAudioEl.currentTime = 0;
    } catch (_e) {}
  }
};

const startWebBuzzer = () => {
  try {
    if (typeof window === 'undefined') return;
    const AudioContext = window.AudioContext || window.webkitAudioContext;
    if (!AudioContext) return;
    if (!webAudioCtx) {
      webAudioCtx = new AudioContext();
    }
    if (webAudioCtx.state === 'suspended') {
      webAudioCtx.resume().catch(() => {});
    }
    const playBeep = () => {
      if (!webAudioCtx || !isRinging) return;
      try {
        if (webAudioCtx.state === 'suspended') {
          webAudioCtx.resume().catch(() => {});
        }
        const now = webAudioCtx.currentTime;
        const osc = webAudioCtx.createOscillator();
        const gain = webAudioCtx.createGain();
        osc.type = 'triangle';
        osc.frequency.setValueAtTime(880, now);
        osc.frequency.setValueAtTime(1100, now + 0.15);
        osc.frequency.setValueAtTime(1320, now + 0.3);
        gain.gain.setValueAtTime(0.7, now);
        gain.gain.linearRampToValueAtTime(0.01, now + 0.5);
        osc.connect(gain);
        gain.connect(webAudioCtx.destination);
        osc.start(now);
        osc.stop(now + 0.55);
      } catch (_e) {}
    };
    playBeep();
    if (!webAudioInterval) {
      webAudioInterval = setInterval(playBeep, 800);
    }
  } catch (e) {
    console.warn('Web audio buzzer error:', e);
  }
};

const stopWebBuzzer = () => {
  if (webAudioInterval) {
    clearInterval(webAudioInterval);
    webAudioInterval = null;
  }
};

const startNativeAlarm = async () => {
  try {
    await Audio.setAudioModeAsync({
      allowsRecordingIOS: false,
      staysActiveInBackground: true,
      playsInSilentModeIOS: true,
      shouldDuckAndroid: false,
      playThroughEarpieceAndroid: false,
    });

    const { sound } = await Audio.Sound.createAsync(
      localAlarmSound,
      { shouldPlay: true, isLooping: true, volume: 1.0 }
    );
    soundInstance = sound;

    const ONE_SECOND_IN_MS = 1000;
    const PATTERN = [
      0 * ONE_SECOND_IN_MS,
      1 * ONE_SECOND_IN_MS,
      1 * ONE_SECOND_IN_MS,
      1 * ONE_SECOND_IN_MS,
    ];
    Vibration.vibrate(PATTERN, true);
  } catch (error) {
    console.warn('Failed to start native alarm sound:', error);
  }
};

export const AlarmManager = {
  subscribe: (listener) => {
    alarmStateListeners.add(listener);
    return () => alarmStateListeners.delete(listener);
  },

  isRinging: () => isRinging,

  resumeSoundIfNeeded: () => {
    if (Platform.OS === 'web') {
      startWebAudio();
      startWebBuzzer();
    }
  },

  startAlarm: (medicationName, notes = '') => {
    if (isRinging) return;

    isRinging = true;

    // Trigger audio immediately and synchronously (preserves user gesture context on web)
    if (Platform.OS === 'web') {
      startWebAudio();
      startWebBuzzer();
    } else {
      startNativeAlarm();
    }

    const state = { medicationName, notes, startTime: Date.now() };
    AsyncStorage.setItem(ALARM_STATE_KEY, JSON.stringify(state)).catch(() => {});
    notifyListeners(state);
  },

  stopAlarm: async () => {
    isRinging = false;
    await AsyncStorage.removeItem(ALARM_STATE_KEY);
    notifyListeners(null);

    if (Platform.OS === 'web') {
      stopWebAudio();
      stopWebBuzzer();
    } else {
      if (soundInstance) {
        try {
          await soundInstance.stopAsync();
          await soundInstance.unloadAsync();
          soundInstance = null;
        } catch (_e) {}
      }
      Vibration.cancel();
    }
  },

  checkStoredAlarm: async () => {
    try {
      const raw = await AsyncStorage.getItem(ALARM_STATE_KEY);
      if (raw) {
        const state = JSON.parse(raw);
        if (Date.now() - state.startTime < 15 * 60 * 1000) {
          AlarmManager.startAlarm(state.medicationName, state.notes || '');
        } else {
          await AsyncStorage.removeItem(ALARM_STATE_KEY);
        }
      }
    } catch (_e) {}
  },

  startClockWatcher: () => {
    if (clockWatcherInterval) return;

    const checkReminders = async () => {
      try {
        const now = new Date();
        const hours = String(now.getHours()).padStart(2, '0');
        const minutes = String(now.getMinutes()).padStart(2, '0');
        const currentTime = `${hours}:${minutes}`;
        const dateStr = now.toISOString().slice(0, 10);

        const raw = await AsyncStorage.getItem('cmpf-medication-reminders');
        if (!raw) return;
        const reminders = JSON.parse(raw);
        if (!Array.isArray(reminders)) return;

        for (const med of reminders) {
          if (!med.times || !Array.isArray(med.times)) continue;
          for (const t of med.times) {
            const timeVal = typeof t === 'string' ? t : t.time;
            if (timeVal === currentTime) {
              const triggerKey = `${dateStr}_${med.id || med.name}_${timeVal}`;
              if (!triggeredToday.has(triggerKey)) {
                triggeredToday.add(triggerKey);
                AlarmManager.startAlarm(med.name, med.notes || '');

                if (Platform.OS === 'web' && typeof window !== 'undefined' && 'Notification' in window) {
                  if (Notification.permission === 'granted') {
                    new Notification(`Rappel Médicament : ${med.name}`, {
                      body: med.notes || "C'est l'heure de prendre votre médicament !",
                    });
                  }
                }
              }
            }
          }
        }
      } catch (_e) {}
    };

    checkReminders();
    clockWatcherInterval = setInterval(checkReminders, 5000);
  },

  initListeners: () => {
    AlarmManager.startClockWatcher();

    if (Platform.OS !== 'web') {
      try {
        Notifications.addNotificationResponseReceivedListener(async (response) => {
          const data = response?.notification?.request?.content?.data;
          if (data?.type === 'MEDICATION_ALARM') {
            await AlarmManager.startAlarm(data.medicationName, data.notes || '');
          }
        });
      } catch (_e) {}
    }
  },
};
