import { useMemo, useRef, useState } from 'react';
import { Animated, I18nManager, StatusBar } from 'react-native';
import HomeScreen from '../screens/HomeScreen';
import AmbulanceScreen from '../screens/AmbulanceScreen';
import DoctorScreen from '../screens/DoctorScreen';
import PharmaciesScreen from '../screens/PharmaciesScreen';
import MedicationsScreen from '../screens/MedicationsScreen';
import ProfileScreen from '../screens/ProfileScreen';
import SettingsScreen from '../screens/SettingsScreen';
import { useAppTheme } from '../theme/ThemeContext';

I18nManager.allowRTL(false);

const ROUTES = {
  home: HomeScreen,
  ambulance: AmbulanceScreen,
  doctor: DoctorScreen,
  pharmacies: PharmaciesScreen,
  medications: MedicationsScreen,
  profile: ProfileScreen,
  settings: SettingsScreen,
};

export default function AppRouter({ preferences, onUpdatePreferences }) {
  const { mode, colors } = useAppTheme();
  const isDarkMode = mode === 'dark';
  const [route, setRoute] = useState('home');
  const opacity = useRef(new Animated.Value(1)).current;
  const translate = useRef(new Animated.Value(0)).current;

  const goTo = (nextRoute) => {
    Animated.parallel([
      Animated.timing(opacity, { toValue: 0, duration: 160, useNativeDriver: true }),
      Animated.timing(translate, { toValue: 12, duration: 160, useNativeDriver: true }),
    ]).start(() => {
      setRoute(nextRoute);
      translate.setValue(-12);
      Animated.parallel([
        Animated.timing(opacity, { toValue: 1, duration: 200, useNativeDriver: true }),
        Animated.spring(translate, { toValue: 0, friction: 8, tension: 80, useNativeDriver: true }),
      ]).start();
    });
  };

  const Screen = useMemo(() => ROUTES[route] || HomeScreen, [route]);

  return (
    <>
      <StatusBar barStyle={isDarkMode ? 'light-content' : 'dark-content'} backgroundColor={colors.background} />
      <Animated.View
        style={{
          flex: 1,
          opacity,
          transform: [{ translateX: translate }],
          backgroundColor: colors.background,
        }}
      >
        <Screen onNavigate={goTo} onBack={() => goTo('home')} preferences={preferences} onUpdatePreferences={onUpdatePreferences} />
      </Animated.View>
    </>
  );
}
