import AsyncStorage from '@react-native-async-storage/async-storage';
import { Platform } from 'react-native';
import * as Notifications from 'expo-notifications';
import { Audio } from 'expo-av';
import { scheduleNativeAlarm, cancelNativeAlarm } from './medicationAlarms';

const STORAGE_KEY = 'cmpf-medication-reminders';
// Keep a versioned channel id because Android channels are mostly immutable after creation.
const CHANNEL_ID = 'medication-alarms-v2';

export const isValidTime = (value) => /^([01]\d|2[0-3]):([0-5]\d)$/.test(String(value).trim());

const parseTime = (value) => {
  const [hour, minute] = String(value).trim().split(':').map(Number);
  return { hour, minute };
};

const sortTimes = (items) => [...items].sort((a, b) => a.time.localeCompare(b.time));

const normalizeReminders = (items) =>
  (Array.isArray(items) ? items : [])
    .map((item) => {
      if (Array.isArray(item.times)) {
        return {
          id: item.id,
          name: item.name,
          notes: item.notes || '',
          createdAt: item.createdAt || new Date().toISOString(),
          times: sortTimes(
            item.times
              .filter((timeItem) => isValidTime(timeItem?.time))
              .map((timeItem) => ({
                id: timeItem.id || `${Date.now()}-${Math.random()}`,
                time: timeItem.time,
                notificationId: timeItem.notificationId || null,
              })),
          ),
        };
      }

      if (isValidTime(item?.time)) {
        return {
          id: item.id || `${Date.now()}-${Math.random()}`,
          name: item.name,
          notes: item.notes || '',
          createdAt: item.createdAt || new Date().toISOString(),
          times: [
            {
              id: `time-${item.id || Date.now()}`,
              time: item.time,
              notificationId: item.notificationId || null,
            },
          ],
        };
      }

      return null;
    })
    .filter(Boolean)
    .sort((a, b) => {
      const firstA = a.times[0]?.time || '99:99';
      const firstB = b.times[0]?.time || '99:99';
      return firstA.localeCompare(firstB);
    });

const readReminders = async () => {
  const raw = await AsyncStorage.getItem(STORAGE_KEY);
  if (!raw) {
    return [];
  }

  try {
    return normalizeReminders(JSON.parse(raw));
  } catch (_error) {
    return [];
  }
};

const writeReminders = async (items) => {
  await AsyncStorage.setItem(STORAGE_KEY, JSON.stringify(items));
};

export const configureMedicationNotifications = async () => {
  Notifications.setNotificationHandler({
    handleNotification: async () => ({
      shouldPlaySound: true,
      shouldSetBadge: false,
      shouldShowBanner: true,
      shouldShowList: true,
      priority: Notifications.AndroidNotificationPriority.MAX,
    }),
  });

  if (Platform.OS === 'android') {
    await Notifications.setNotificationChannelAsync(CHANNEL_ID, {
      name: 'Medication alarms',
      importance: Notifications.AndroidImportance.MAX,
      sound: 'alarm.mp3', // Set to a packaged sound for native experience
      enableVibrate: true,
      vibrationPattern: [0, 500, 200, 500],
      lockscreenVisibility: Notifications.AndroidNotificationVisibility.PUBLIC,
      bypassDnd: true,
      showBadge: true,
      audioAttributes: {
        usage: Notifications.AndroidAudioUsage.ALARM,
        contentType: Notifications.AndroidAudioContentType.SONIFICATION,
      },
    });
  }

  // Listener for foreground notifications
  Notifications.addNotificationReceivedListener(async (notification) => {
    const title = notification.request.content.title || '';
    if (title.includes('Rappel')) {
      await playMedicationSound();
    }
  });
};

let soundObject = null;

export const playMedicationSound = async () => {
  try {
    if (soundObject) {
      await soundObject.unloadAsync();
    }
    const { sound } = await Audio.Sound.createAsync(
      { uri: 'https://cdn.pixabay.com/audio/2022/03/15/audio_783458cbf2.mp3' }, // Medical beep sound
      { shouldPlay: true, volume: 1.0 }
    );
    soundObject = sound;
  } catch (error) {
    console.error('Error playing sound:', error);
  }
};

export const stopMedicationSound = async () => {
  if (soundObject) {
    await soundObject.stopAsync();
  }
};

export const requestMedicationNotificationPermission = async () => {
  if (Platform.OS === 'web') {
    return { granted: false, platform: 'web' };
  }

  const current = await Notifications.getPermissionsAsync();
  if (current.granted) {
    return { granted: true, platform: Platform.OS };
  }

  const next = await Notifications.requestPermissionsAsync({
    ios: {
      allowAlert: true,
      allowBadge: true,
      allowSound: true,
      allowCriticalAlerts: true,
    },
  });
  return { granted: next.granted, platform: Platform.OS };
};

const scheduleReminderNotification = async ({ medicationName, time, notes }) => {
  if (Platform.OS === 'web') {
    return null;
  }

  try {
    const permission = await requestMedicationNotificationPermission();
    if (!permission.granted) {
      return null;
    }

    const { hour, minute } = parseTime(time);

    // 1. Schedule Native Alarm (Android Only)
    try {
      const triggerDate = new Date();
      triggerDate.setHours(hour, minute, 0, 0);
      if (triggerDate < new Date()) triggerDate.setDate(triggerDate.getDate() + 1);
      scheduleNativeAlarm(`med-${medicationName}-${time}`, medicationName, triggerDate.getTime());
    } catch (_err) {}

    // 2. Fallback Notification (Standard Expo)
    return await Notifications.scheduleNotificationAsync({
      content: {
        title: `Rappel médicament : ${medicationName}`,
        body: notes ? notes : "C'est l'heure de prendre votre médicament.",
        sound: 'alarm.mp3',
        priority: Notifications.AndroidNotificationPriority.MAX,
        sticky: true,
        autoDismiss: false,
        color: '#ff3b30',
        interruptionLevel: 'critical',
        categoryIdentifier: 'medication_alarm',
      },
      trigger: {
        type: Notifications.SchedulableTriggerInputTypes.DAILY,
        hour,
        minute,
        channelId: CHANNEL_ID,
      },
    });
  } catch (err) {
    console.warn('Could not schedule native notification, relying on in-app clock watcher:', err);
    return null;
  }
};

export const getMedicationReminders = async () => readReminders();

export const addMedicationReminder = async ({ name, times, notes }) => {
  const trimmedName = String(name || '').trim();
  const trimmedNotes = String(notes || '').trim();
  const cleanedTimes = (Array.isArray(times) ? times : [])
    .map((value) => String(value || '').trim())
    .filter(Boolean);

  if (!trimmedName) {
    throw new Error('MEDICATION_NAME_REQUIRED');
  }

  if (cleanedTimes.length === 0) {
    throw new Error('MEDICATION_TIME_REQUIRED');
  }

  if (cleanedTimes.some((value) => !isValidTime(value))) {
    throw new Error('MEDICATION_TIME_INVALID');
  }

  if (new Set(cleanedTimes).size !== cleanedTimes.length) {
    throw new Error('MEDICATION_TIME_DUPLICATED_IN_FORM');
  }

  const items = await readReminders();
  const existingIndex = items.findIndex((item) => item.name.toLowerCase() === trimmedName.toLowerCase());

  if (existingIndex >= 0) {
    const existingTimes = new Set(items[existingIndex].times.map((timeItem) => timeItem.time));
    if (cleanedTimes.some((value) => existingTimes.has(value))) {
      throw new Error('MEDICATION_TIME_ALREADY_EXISTS');
    }
  }

  const createdTimes = [];
  for (const time of cleanedTimes) {
    const notificationId = await scheduleReminderNotification({
      medicationName: trimmedName,
      time,
      notes: trimmedNotes,
    });

    createdTimes.push({
      id: `time-${Date.now()}-${Math.random()}`,
      time,
      notificationId,
    });
  }

  let nextItems = items;

  if (existingIndex >= 0) {
    nextItems = [...items];
    nextItems[existingIndex] = {
      ...nextItems[existingIndex],
      notes: trimmedNotes || nextItems[existingIndex].notes,
      times: sortTimes([...nextItems[existingIndex].times, ...createdTimes]),
    };
  } else {
    nextItems = [
      {
        id: `${Date.now()}`,
        name: trimmedName,
        notes: trimmedNotes,
        createdAt: new Date().toISOString(),
        times: sortTimes(createdTimes),
      },
      ...items,
    ];
  }

  nextItems = normalizeReminders(nextItems);
  await writeReminders(nextItems);

  return {
    reminders: nextItems,
    notificationsEnabled: createdTimes.some((item) => Boolean(item.notificationId)),
    appendedToExistingMedication: existingIndex >= 0,
    addedTimesCount: createdTimes.length,
  };
};

export const snoozeMedicationReminder = async (medicationName, notes) => {
  if (Platform.OS === 'web') return;

  // Schedule a one-time notification in 5 minutes
  await Notifications.scheduleNotificationAsync({
    content: {
      title: `Rappel médicament : ${medicationName} (Snooze)`,
      body: notes || "Rappel après 5 minutes.",
      sound: 'alarm.mp3',
      priority: Notifications.AndroidNotificationPriority.MAX,
      sticky: true,
      interruptionLevel: 'critical',
    },
    trigger: {
      seconds: 5 * 60,
      channelId: CHANNEL_ID,
    },
  });
};

export const removeMedicationTime = async (medicationId, timeId) => {
  const items = await readReminders();
  const medication = items.find((item) => item.id === medicationId);
  const timeItem = medication?.times.find((entry) => entry.id === timeId);

  if (timeItem?.notificationId) {
    await Notifications.cancelScheduledNotificationAsync(timeItem.notificationId);
  }

  const nextItems = items
    .map((item) =>
      item.id === medicationId
        ? {
            ...item,
            times: item.times.filter((entry) => entry.id !== timeId),
          }
        : item,
    )
    .filter((item) => item.times.length > 0);

  await writeReminders(normalizeReminders(nextItems));
  return normalizeReminders(nextItems);
};
