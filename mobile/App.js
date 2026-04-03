import { useEffect, useState } from 'react';
import { ActivityIndicator, View } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { Cairo_400Regular, Cairo_700Bold, useFonts } from '@expo-google-fonts/cairo';
import AppRouter from './src/navigation/AppRouter';
import OnboardingScreen from './src/screens/OnboardingScreen';
import { I18nProvider } from './src/i18n/I18nContext';
import { ThemeProvider } from './src/theme/ThemeContext';
import { configureMedicationNotifications } from './src/services/medicationReminders';

const SETUP_KEY = 'cmpf-app-setup-v1';

export default function App() {
  const [loading, setLoading] = useState(true);
  const [setup, setSetup] = useState(null);
  const [language, setLanguage] = useState('fr');
  const [themeMode, setThemeMode] = useState('light');
  const [fontsLoaded] = useFonts({
    Cairo_400Regular,
    Cairo_700Bold,
  });

  useEffect(() => {
    configureMedicationNotifications();
  }, []);

  useEffect(() => {
    const loadSetup = async () => {
      try {
        const raw = await AsyncStorage.getItem(SETUP_KEY);
        if (raw) {
          const parsed = JSON.parse(raw);
          setSetup(parsed);
          if (parsed?.language) {
            setLanguage(parsed.language);
          }
          if (parsed?.theme) {
            setThemeMode(parsed.theme);
          }
        }
      } catch (_error) {
        setSetup(null);
      } finally {
        setLoading(false);
      }
    };

    loadSetup();
  }, []);

  const handleFinishOnboarding = async (payload) => {
    const next = {
      completed: true,
      ...payload,
      completedAt: new Date().toISOString(),
    };
    await AsyncStorage.setItem(SETUP_KEY, JSON.stringify(next));
    setSetup(next);
    if (next.language) {
      setLanguage(next.language);
    }
    if (next.theme) {
      setThemeMode(next.theme);
    }
  };

  const handleUpdateSetup = async (patch) => {
    const current = setup || {};
    const next = {
      ...current,
      ...patch,
      account: {
        ...(current.account || {}),
        ...(patch?.account || {}),
      },
    };
    await AsyncStorage.setItem(SETUP_KEY, JSON.stringify(next));
    setSetup(next);
    if (patch?.language) {
      setLanguage(patch.language);
    }
    if (patch?.theme) {
      setThemeMode(patch.theme);
    }
  };

  if (loading || !fontsLoaded) {
    return (
      <View style={{ flex: 1, alignItems: 'center', justifyContent: 'center', backgroundColor: '#f3f6fb' }}>
        <ActivityIndicator size="large" color="#0d6efd" />
      </View>
    );
  }

  if (!setup?.completed) {
    return (
      <ThemeProvider initialMode={themeMode}>
        <I18nProvider initialLanguage={language}>
          <OnboardingScreen onFinish={handleFinishOnboarding} />
        </I18nProvider>
      </ThemeProvider>
    );
  }

  return (
    <ThemeProvider initialMode={themeMode}>
      <I18nProvider initialLanguage={language}>
        <AppRouter preferences={setup} onUpdatePreferences={handleUpdateSetup} />
      </I18nProvider>
    </ThemeProvider>
  );
}
