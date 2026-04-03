import { useEffect, useMemo, useRef, useState } from 'react';
import { Animated, BackHandler, I18nManager, Platform, StatusBar } from 'react-native';
import HomeScreen from '../screens/HomeScreen';
import AmbulanceScreen from '../screens/AmbulanceScreen';
import DoctorScreen from '../screens/DoctorScreen';
import PharmaciesScreen from '../screens/PharmaciesScreen';
import MedicationsScreen from '../screens/MedicationsScreen';
import ProfileScreen from '../screens/ProfileScreen';
import SettingsScreen from '../screens/SettingsScreen';
import AboutScreen from '../screens/AboutScreen';
import GalleryScreen from '../screens/GalleryScreen';
import LoginScreen from '../screens/LoginScreen';
import SignupScreen from '../screens/SignupScreen';
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
  about: AboutScreen,
  gallery: GalleryScreen,
  login: LoginScreen,
  signup: SignupScreen,
};

const getInitialRoute = () => {
  if (Platform.OS === 'web' && typeof window !== 'undefined' && window.location.hash) {
    const raw = window.location.hash.replace('#', '').toLowerCase().trim();
    if (ROUTES[raw]) {
      return raw;
    }
  }
  return 'home';
};

export default function AppRouter({ preferences, onUpdatePreferences }) {
  const { mode, colors } = useAppTheme();
  const isDarkMode = mode === 'dark';

  const initial = useMemo(() => getInitialRoute(), []);
  const [history, setHistory] = useState([initial]);
  const currentRoute = history[history.length - 1] || 'home';

  const opacity = useRef(new Animated.Value(1)).current;
  const translate = useRef(new Animated.Value(0)).current;

  // Sync with browser back / forward buttons (popstate and hashchange)
  useEffect(() => {
    if (Platform.OS !== 'web' || typeof window === 'undefined') return;

    const handleWebNav = () => {
      const raw = window.location.hash.replace('#', '').toLowerCase().trim();
      const nextRoute = ROUTES[raw] ? raw : 'home';

      setHistory((prev) => {
        const current = prev[prev.length - 1];
        if (current === nextRoute) return prev;

        // If route exists in history, pop back to it
        const existingIndex = prev.lastIndexOf(nextRoute);
        if (existingIndex !== -1) {
          return prev.slice(0, existingIndex + 1);
        }
        return [...prev, nextRoute];
      });

      // Quick smooth transition
      Animated.sequence([
        Animated.timing(opacity, { toValue: 0.3, duration: 80, useNativeDriver: true }),
        Animated.timing(opacity, { toValue: 1, duration: 140, useNativeDriver: true }),
      ]).start();
    };

    window.addEventListener('popstate', handleWebNav);
    window.addEventListener('hashchange', handleWebNav);
    return () => {
      window.removeEventListener('popstate', handleWebNav);
      window.removeEventListener('hashchange', handleWebNav);
    };
  }, []);

  const animateTransition = (callback, isBackward = false) => {
    const exitOffset = isBackward ? 16 : -16;
    const enterOffset = isBackward ? -16 : 16;

    Animated.parallel([
      Animated.timing(opacity, { toValue: 0, duration: 140, useNativeDriver: true }),
      Animated.timing(translate, { toValue: exitOffset, duration: 140, useNativeDriver: true }),
    ]).start(() => {
      callback();
      translate.setValue(enterOffset);
      Animated.parallel([
        Animated.timing(opacity, { toValue: 1, duration: 180, useNativeDriver: true }),
        Animated.spring(translate, { toValue: 0, friction: 8, tension: 90, useNativeDriver: true }),
      ]).start();
    });
  };

  const goTo = (nextRoute) => {
    if (!ROUTES[nextRoute] || nextRoute === currentRoute) return;

    animateTransition(() => {
      setHistory((prev) => [...prev, nextRoute]);

      if (Platform.OS === 'web' && typeof window !== 'undefined') {
        const targetHash = nextRoute === 'home' ? '' : `#${nextRoute}`;
        if (window.location.hash !== targetHash) {
          window.history.pushState({ route: nextRoute }, '', targetHash || window.location.pathname);
        }
      }
    }, false);
  };

  const goBack = () => {
    if (history.length > 1) {
      animateTransition(() => {
        setHistory((prev) => {
          const nextStack = prev.slice(0, -1);
          const targetRoute = nextStack[nextStack.length - 1] || 'home';

          if (Platform.OS === 'web' && typeof window !== 'undefined') {
            const targetHash = targetRoute === 'home' ? '' : `#${targetRoute}`;
            window.history.replaceState({ route: targetRoute }, '', targetHash || window.location.pathname);
          }
          return nextStack;
        });
      }, true);
      return true;
    }

    if (currentRoute !== 'home') {
      goTo('home');
      return true;
    }

    return false; // Exit app on home
  };

  // Android hardware back button handler
  useEffect(() => {
    const onHardwareBack = () => {
      if (history.length > 1 || currentRoute !== 'home') {
        goBack();
        return true; // Prevents app from exiting!
      }
      return false; // Allows normal exit if on home
    };

    const sub = BackHandler.addEventListener('hardwareBackPress', onHardwareBack);
    return () => sub.remove();
  }, [history, currentRoute]);

  const Screen = useMemo(() => ROUTES[currentRoute] || HomeScreen, [currentRoute]);

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
        <Screen
          onNavigate={goTo}
          onBack={goBack}
          preferences={preferences}
          onUpdatePreferences={onUpdatePreferences}
        />
      </Animated.View>
    </>
  );
}
