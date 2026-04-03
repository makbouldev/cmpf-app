import { NativeModules, Platform } from 'react-native';

const { AlarmModule } = NativeModules;

export const scheduleNativeAlarm = (id, medicationName, timestamp) => {
  if (Platform.OS !== 'android') return;
  if (!AlarmModule) {
    console.warn('AlarmModule not found. Ensure you are running a Development Build.');
    return;
  }
  AlarmModule.scheduleAlarm(id, medicationName, timestamp);
};

export const stopNativeAlarm = () => {
  if (Platform.OS !== 'android') return;
  if (AlarmModule) {
    AlarmModule.stopAlarm();
  }
};

export const cancelNativeAlarm = (id) => {
    if (Platform.OS !== 'android') return;
    if (AlarmModule) {
      AlarmModule.cancelAlarm(id);
    }
  };
