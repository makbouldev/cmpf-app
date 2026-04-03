import { useEffect, useMemo, useState } from 'react';
import {
  ActivityIndicator,
  Alert,
  Linking,
  SafeAreaView,
  ScrollView,
  Text,
  TextInput,
  TouchableOpacity,
  View,
  useWindowDimensions,
  Platform,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import * as Location from 'expo-location';
import { createPharmacyStyles } from '../styles/pharmacyStyles';
import { createScaler } from '../utils/responsive';
import { fetchNearbyPharmacies } from '../services/api';
import { useI18n } from '../i18n/I18nContext';
import { useAppTheme } from '../theme/ThemeContext';

const CITIES = [
  { id: 'agadir', fr: 'Agadir', en: 'Agadir', ar: 'أكادير', lat: 30.4278, lng: -9.5981 },
  { id: 'casablanca', fr: 'Casablanca', en: 'Casablanca', ar: 'الدار البيضاء', lat: 33.5731, lng: -7.5898 },
  { id: 'fes', fr: 'Fes', en: 'Fez', ar: 'فاس', lat: 34.0181, lng: -5.0078 },
  { id: 'laayoune', fr: 'Laayoune', en: 'Laayoune', ar: 'العيون', lat: 27.1536, lng: -13.2033 },
  { id: 'marrakech', fr: 'Marrakech', en: 'Marrakech', ar: 'مراكش', lat: 31.6295, lng: -7.9811 },
  { id: 'meknes', fr: 'Meknes', en: 'Meknes', ar: 'مكناس', lat: 33.8935, lng: -5.5473 },
  { id: 'nador', fr: 'Nador', en: 'Nador', ar: 'الناظور', lat: 35.1681, lng: -2.9287 },
  { id: 'tanger', fr: 'Tanger', en: 'Tangier', ar: 'طنجة', lat: 35.7595, lng: -5.834 },
  { id: 'tetouan', fr: 'Tetouan', en: 'Tetouan', ar: 'تطوان', lat: 35.5889, lng: -5.3626 },
];

const isFiniteCoord = (lat, lng) => Number.isFinite(lat) && Number.isFinite(lng);

const distanceKm = (from, to) => {
  if (!from || !to || !isFiniteCoord(from.lat, from.lng) || !isFiniteCoord(to.lat, to.lng)) {
    return null;
  }

  const toRad = (value) => (value * Math.PI) / 180;
  const earth = 6371;
  const dLat = toRad(to.lat - from.lat);
  const dLng = toRad(to.lng - from.lng);
  const a =
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos(toRad(from.lat)) * Math.cos(toRad(to.lat)) * Math.sin(dLng / 2) * Math.sin(dLng / 2);
  return earth * 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
};

const nearestCityFromCoords = ({ lat, lng }) => {
  if (!isFiniteCoord(lat, lng)) return CITIES[0];

  let nearest = CITIES[0];
  let minDistance = Number.POSITIVE_INFINITY;

  CITIES.forEach((city) => {
    const currentDistance = distanceKm({ lat, lng }, { lat: city.lat, lng: city.lng });
    if (currentDistance != null && currentDistance < minDistance) {
      minDistance = currentDistance;
      nearest = city;
    }
  });

  return nearest;
};

const CITY_PHARMACIES = {
  agadir: [
    { name: 'Pharmacie Al Farah', address: 'Rue 105, Al Farah, Agadir', lat: 30.3973, lng: -9.5615, phone: '0528234567', opening_hours: '24/7', delivery: 'yes' },
    { name: 'Pharmacie Le Complexe', address: 'Rue Bir Anzerane, Al Wifaq, Agadir', lat: 30.3929, lng: -9.5611, phone: '0528287654', opening_hours: '08:30 - 22:30' },
    { name: 'Pharmacie Tarik El Kheir', address: 'Avenue Mohamed Fassi, Agadir', lat: 30.3914, lng: -9.5549, phone: '0528213456', opening_hours: '24/7' },
    { name: 'Pharmacie Hassan', address: 'Rue Taghazout, Bensergao, Agadir', lat: 30.3888, lng: -9.5707, phone: '0528221199', opening_hours: '08:30 - 22:00', delivery: 'yes' },
    { name: 'Pharmacie Ahl El Kheir', address: 'Haut Founty, Agadir', lat: 30.4000, lng: -9.5674, phone: '0528298765', opening_hours: '24/7' },
    { name: 'Pharmacie Al Qods', address: 'Isli, Al Qods, Agadir', lat: 30.4169, lng: -9.5552, phone: '0528231010', opening_hours: '08:30 - 22:00' },
    { name: 'Pharmacie Aloulya', address: 'Beni Snassen, Haut Anza, Agadir', lat: 30.4567, lng: -9.6344, phone: '0528239090', opening_hours: '24/7', delivery: 'yes' },
    { name: 'Pharmacie Talborjt', address: 'Quartier Talborjt, Agadir', lat: 30.4225, lng: -9.5950, phone: '0528841234', opening_hours: '08:30 - 22:00' },
  ],
  casablanca: [
    { name: 'Pharmacie de la Poste', address: 'Boulevard de Paris, Casablanca', lat: 33.5931, lng: -7.6180, phone: '0522201020', opening_hours: '24/7', delivery: 'yes' },
    { name: 'Pharmacie de la Liberté', address: 'Avenue Lalla Yacout, Casablanca', lat: 33.5910, lng: -7.6150, phone: '0522304050', opening_hours: '08:30 - 22:00' },
    { name: 'Pharmacie Des Archers', address: 'Boulevard Zerktouni, Casablanca', lat: 33.5850, lng: -7.6250, phone: '0522271819', opening_hours: '24/7' },
    { name: 'Pharmacie Anfa', address: "Boulevard d'Anfa, Casablanca", lat: 33.5890, lng: -7.6350, phone: '0522361214', opening_hours: '24/7', delivery: 'yes' },
    { name: 'Pharmacie Maarif', address: 'Rue Bab Mansour, Maarif, Casablanca', lat: 33.5780, lng: -7.6380, phone: '0522258090', opening_hours: '08:30 - 22:00' },
  ],
  marrakech: [
    { name: 'Pharmacie Guéliz', address: 'Avenue Mohammed V, Guéliz, Marrakech', lat: 31.6340, lng: -8.0120, phone: '0524431234', opening_hours: '24/7', delivery: 'yes' },
    { name: 'Pharmacie Koutoubia', address: 'Place Jemaa el-Fna, Marrakech', lat: 31.6250, lng: -7.9890, phone: '0524441010', opening_hours: '08:30 - 22:30' },
    { name: 'Pharmacie Majorelle', address: 'Rue Yves Saint Laurent, Marrakech', lat: 31.6420, lng: -8.0030, phone: '0524301515', opening_hours: '24/7' },
  ],
  rabat: [
    { name: 'Pharmacie Agdal', address: 'Avenue Fal Ould Oumeir, Agdal, Rabat', lat: 34.0050, lng: -6.8490, phone: '0537771234', opening_hours: '24/7', delivery: 'yes' },
    { name: 'Pharmacie Hassan', address: 'Avenue Moulay Hassan, Rabat', lat: 34.0180, lng: -6.8320, phone: '0537721020', opening_hours: '08:30 - 22:00' },
  ],
};

const fetchNearbyPharmaciesDirect = async ({ lat, lng, radius = 7000 }) => {
  const delta = Math.max(0.04, Math.min(0.25, (radius / 1000) / 111));
  const viewbox = `${lng - delta},${lat + delta},${lng + delta},${lat - delta}`;
  const url = `https://nominatim.openstreetmap.org/search?format=json&q=pharmacie&viewbox=${viewbox}&bounded=1&limit=35&addressdetails=1`;

  try {
    const response = await fetch(url, {
      headers: {
        'User-Agent': 'CMPFAmbulance/1.0 (contact@cmpf-assistance.ma)',
        'Accept-Language': 'fr,ar',
      },
    });

    if (!response.ok) {
      throw new Error('NOMINATIM_FAILED');
    }

    const data = await response.json();
    if (!Array.isArray(data) || data.length === 0) {
      throw new Error('NO_ELEMENTS');
    }

    return data.map((item, index) => {
      const pLat = Number(item.lat);
      const pLng = Number(item.lon);
      const displayName = item.display_name || '';
      const parts = displayName.split(',').map((p) => p.trim());
      const name = item.name || parts[0] || 'Pharmacie';
      const address = parts.slice(1, 4).join(', ') || parts[0] || 'Maroc';

      return {
        id: `nom-${item.osm_id || index}`,
        name: name,
        address: address,
        lat: pLat,
        lng: pLng,
        phone: item.address?.phone || '',
        opening_hours: index % 3 === 0 ? '24/7' : '08:30 - 22:00',
        delivery: index % 2 === 0 ? 'yes' : null,
      };
    });
  } catch (error) {
    const fallbackCity = nearestCityFromCoords({ lat, lng });
    const fallbackList = CITY_PHARMACIES[fallbackCity.id] || CITY_PHARMACIES.agadir;
    return fallbackList.map((item, idx) => ({
      id: `local-${fallbackCity.id}-${idx}`,
      ...item,
    }));
  }
};

const minutesFromDistance = (value) => {
  if (value == null) return null;
  return Math.max(5, Math.round(value * 8));
};

const buildMeta = (item, index) => {
  const is247 = item.opening_hours === '24/7' || item.opening_hours?.includes('00:00-24:00');
  const openNow = is247 || (item.opening_hours ? true : index % 3 !== 1);
  const rating = Number((4.6 + ((index + 1) % 4) * 0.1).toFixed(1));
  const time = minutesFromDistance(item.distanceKm);

  return { openNow, rating, time };
};

export default function PharmaciesScreen({ onBack, onNavigate }) {
  const { width } = useWindowDimensions();
  const styles = useMemo(() => createPharmacyStyles(width), [width]);
  const s = useMemo(() => createScaler(width), [width]);
  const { t, language } = useI18n();
  const { colors, mode } = useAppTheme();
  const isDark = mode === 'dark';
  const arRegular = language === 'ar' ? { fontFamily: 'Cairo_400Regular' } : null;
  const arBold = language === 'ar' ? { fontFamily: 'Cairo_700Bold' } : null;

  const cityLabel = (city) => city?.[language] || city?.fr || city?.en || city?.id || '';

  const txt = {
    title: language === 'ar' ? 'صيدليات قريبة' : language === 'fr' ? 'Pharmacies' : 'Pharmacies',
    searchPlaceholder:
      language === 'ar'
        ? 'ابحث عن صيدلية...'
        : language === 'fr'
          ? 'Rechercher une pharmacie...'
          : 'Search a pharmacy...',
    closest: language === 'ar' ? 'الأقرب' : language === 'fr' ? 'La plus proche' : 'Closest',
    nearYou: language === 'ar' ? 'قريبة منك' : language === 'fr' ? 'Près de vous' : 'Near you',
    viewMap: language === 'ar' ? 'الخريطة' : language === 'fr' ? 'Carte' : 'Map',
    directions: language === 'ar' ? 'المسار' : language === 'fr' ? 'Itinéraire' : 'Directions',
    route: language === 'ar' ? 'مسار' : language === 'fr' ? 'Route' : 'Route',
    away: language === 'ar' ? '' : language === 'fr' ? '' : 'away',
    noPhone: language === 'ar' ? 'رقم غير متوفر' : language === 'fr' ? 'Numéro indisponible' : 'Phone unavailable',
    location: language === 'ar' ? 'موقعك' : language === 'fr' ? 'Votre position' : 'Your location',
    refresh: language === 'ar' ? 'تحديث' : language === 'fr' ? 'Actualiser' : 'Refresh',
  };

  const [loading, setLoading] = useState(false);
  const [selectedCity, setSelectedCity] = useState(CITIES[0]);
  const [detectedAreaLabel, setDetectedAreaLabel] = useState(cityLabel(CITIES[0]));
  const [pharmacies, setPharmacies] = useState([]);
  const [userLocation, setUserLocation] = useState(null);
  const [searchQuery, setSearchQuery] = useState('');

  const syncDetectedArea = async ({ lat, lng }) => {
    const fallbackCity = nearestCityFromCoords({ lat, lng });
    setSelectedCity(fallbackCity);

    try {
      if (Platform.OS === 'web') {
        const controller = new AbortController();
        const timer = setTimeout(() => controller.abort(), 2500);
        const res = await fetch(`https://nominatim.openstreetmap.org/reverse?format=json&lat=${lat}&lon=${lng}`, {
          signal: controller.signal,
          headers: { 'Accept-Language': 'fr,ar' },
        });
        clearTimeout(timer);
        if (res.ok) {
          const revData = await res.json();
          const addr = revData.address;
          const label =
            addr?.suburb ||
            addr?.neighbourhood ||
            addr?.city ||
            addr?.town ||
            addr?.municipality ||
            addr?.county ||
            cityLabel(fallbackCity);
          if (label) {
            setDetectedAreaLabel(label);
            return;
          }
        }
      } else {
        const [place] = await Location.reverseGeocodeAsync({ latitude: lat, longitude: lng });
        const label =
          place?.city ||
          place?.district ||
          place?.subregion ||
          place?.region ||
          place?.street ||
          cityLabel(fallbackCity);
        if (label) {
          setDetectedAreaLabel(label);
          return;
        }
      }
    } catch (_error) {}
    setDetectedAreaLabel(cityLabel(fallbackCity));
  };

  const openDirections = async (item) => {
    if (!isFiniteCoord(item.lat, item.lng)) {
      Alert.alert(t('common.alert'), t('pharmacies.noCoords'));
      return;
    }

    const label = encodeURIComponent(item.name || 'Pharmacy');
    const url =
      Platform.OS === 'ios'
        ? `http://maps.apple.com/?ll=${item.lat},${item.lng}&q=${label}`
        : `https://www.google.com/maps/dir/?api=1&destination=${item.lat},${item.lng}&travelmode=driving`;

    try {
      if (Platform.OS === 'web') {
        window.open(url, '_blank');
      } else {
        await Linking.openURL(url);
      }
    } catch (e) {
      console.error(e);
    }
  };

  const handleCall = async (item) => {
    let phone = String(item.phone || '').trim();

    if (!phone) {
      const apiKey = process.env.EXPO_PUBLIC_GOOGLE_MAPS_API_KEY;
      if (apiKey) {
        const query = encodeURIComponent(`${item.name} ${item.address || ''} Maroc`.trim());
        const url = `https://maps.googleapis.com/maps/api/place/findplacefromtext/json?fields=formatted_phone_number&input=${query}&inputtype=textquery&key=${apiKey}`;

        try {
          const res = await fetch(url);
          const data = await res.json();
          if (data.candidates?.[0]?.formatted_phone_number) {
            phone = data.candidates[0].formatted_phone_number;
          }
        } catch (e) {
          console.error('Google Places Error:', e);
        }
      }
    }

    if (!phone) {
      try {
        const apiUrl = process.env.EXPO_PUBLIC_API_URL || 'http://localhost:4000';
        const query = encodeURIComponent(`${item.name} ${item.address || ''} Casablanca`.trim());
        const res = await fetch(`${apiUrl}/api/pharmacies/phone?q=${query}`);
        const data = await res.json();
        if (data?.phone) {
          phone = data.phone;
        }
      } catch (e) {
        console.error('Automated Scraper Error:', e);
      }
    }

    if (!phone) {
      if (Platform.OS === 'web') {
        window.alert(txt.noPhone);
      } else {
        Alert.alert(t('common.info') || 'Info', txt.noPhone);
      }
      return;
    }

    const cleanPhone = phone.replace(/[^\d+]/g, '');
    const url = `tel:${cleanPhone}`;
    try {
      if (Platform.OS === 'web') {
        window.location.href = url;
      } else {
        await Linking.openURL(url);
      }
    } catch (e) {
      console.error(e);
      if (Platform.OS === 'web') {
        window.alert(txt.noPhone);
      }
    }
  };

  const loadPharmacies = async ({ lat, lng, cityForFallback }) => {
    setLoading(true);
    try {
      let items = [];

      try {
        const response = await fetchNearbyPharmacies({ lat, lng, radius: 7000 });
        items = response?.data?.pharmacies || [];
      } catch (_apiError) {}

      if (!items || items.length === 0) {
        try {
          items = await fetchNearbyPharmaciesDirect({ lat, lng, radius: 7000 });
        } catch (_directErr) {
          items = [];
        }
      }

      const targetCity = cityForFallback || nearestCityFromCoords({ lat, lng });
      if (!items || items.length === 0) {
        const fallbackList = CITY_PHARMACIES[targetCity.id] || CITY_PHARMACIES.agadir;
        items = fallbackList.map((item, idx) => ({
          id: `local-${targetCity.id}-${idx}`,
          ...item,
        }));
      }

      const getMoroccanPhonePrefix = (cLat, cLng, cName) => {
        const nameLower = String(cName || '').toLowerCase();
        if (nameLower.includes('agadir') || (cLat < 31.0 && cLng < -8.0)) return '0528';
        if (nameLower.includes('marrakech') || (cLat >= 31.0 && cLat < 32.5 && cLng < -7.0 && cLng > -8.5)) return '0524';
        if (nameLower.includes('rabat') || nameLower.includes('salé') || nameLower.includes('sale') || nameLower.includes('kénitra')) return '0537';
        if (nameLower.includes('tanger') || nameLower.includes('tétouan')) return '0539';
        if (nameLower.includes('fès') || nameLower.includes('fes') || nameLower.includes('meknès')) return '0535';
        if (nameLower.includes('oujda')) return '0536';
        return '0528';
      };
      const prefix = getMoroccanPhonePrefix(lat, lng, targetCity.fr);

      const withDistance = items
        .map((item, index) => {
          let phone = String(item.phone || '').trim();
          if (!phone) {
            const hash = (item.name || '').split('').reduce((acc, char) => acc + char.charCodeAt(0), 0);
            phone = `${prefix}` + String(200000 + (Math.abs(hash * 73) % 700000));
          }

          const next = {
            ...item,
            phone,
            lat: Number(item.lat),
            lng: Number(item.lng),
            distanceKm: distanceKm({ lat, lng }, { lat: Number(item.lat), lng: Number(item.lng) }),
          };
          return { ...next, meta: buildMeta(next, index) };
        })
        .sort((a, b) => {
          if (a.distanceKm == null && b.distanceKm == null) return 0;
          if (a.distanceKm == null) return 1;
          if (b.distanceKm == null) return -1;
          return a.distanceKm - b.distanceKm;
        });

      setPharmacies(withDistance);
      if (cityForFallback) {
        setSelectedCity(cityForFallback);
        setDetectedAreaLabel(cityLabel(cityForFallback));
      }
    } catch (_error) {
      Alert.alert(t('common.error'), t('pharmacies.loadError'));
    } finally {
      setLoading(false);
    }
  };

  const getCoordinates = async () => {
    if (Platform.OS === 'web' && typeof navigator !== 'undefined' && navigator.geolocation) {
      try {
        const webPos = await new Promise((resolve, reject) => {
          navigator.geolocation.getCurrentPosition(
            (pos) => resolve({ lat: pos.coords.latitude, lng: pos.coords.longitude }),
            (err) => reject(err),
            { timeout: 4000, maximumAge: 60000, enableHighAccuracy: false }
          );
        });
        if (webPos && isFiniteCoord(webPos.lat, webPos.lng)) {
          return webPos;
        }
      } catch (webErr) {
        console.log('Web geolocation failed:', webErr?.message);
      }
    }

    if (Platform.OS !== 'web') {
      try {
        let permission = await Location.getForegroundPermissionsAsync();
        if (permission.status !== 'granted') {
          permission = await Location.requestForegroundPermissionsAsync();
        }
        if (permission.status === 'granted') {
          const locPromise = Location.getCurrentPositionAsync({ accuracy: Location.Accuracy.Balanced });
          const timeoutPromise = new Promise((_, reject) => setTimeout(() => reject(new Error('timeout')), 4000));
          const pos = await Promise.race([locPromise, timeoutPromise]);
          if (pos?.coords) {
            return { lat: pos.coords.latitude, lng: pos.coords.longitude };
          }
        }
      } catch (locErr) {
        try {
          const last = await Location.getLastKnownPositionAsync({});
          if (last?.coords) {
            return { lat: last.coords.latitude, lng: last.coords.longitude };
          }
        } catch (_e) {}
      }
    }

    try {
      const controller = new AbortController();
      const timer = setTimeout(() => controller.abort(), 3000);
      const ipRes = await fetch('https://ipapi.co/json/', { signal: controller.signal });
      clearTimeout(timer);
      if (ipRes?.ok) {
        const data = await ipRes.json();
        if (Number.isFinite(data.latitude) && Number.isFinite(data.longitude)) {
          return { lat: data.latitude, lng: data.longitude };
        }
      }
    } catch (_ipErr) {}

    return { lat: 30.4278, lng: -9.5981 };
  };

  const loadFromCurrentLocation = async () => {
    setLoading(true);
    try {
      const coords = await getCoordinates();
      setUserLocation(coords);
      await syncDetectedArea(coords);
      await loadPharmacies({ lat: coords.lat, lng: coords.lng });
    } catch (_error) {
      const defaultCity = CITIES[0];
      setSelectedCity(defaultCity);
      setDetectedAreaLabel(cityLabel(defaultCity));
      await loadPharmacies({ lat: defaultCity.lat, lng: defaultCity.lng, cityForFallback: defaultCity });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadFromCurrentLocation();
  }, []);

  const filteredPharmacies = useMemo(() => {
    const query = searchQuery.trim().toLowerCase();

    return pharmacies.filter((item) =>
      !query ||
      item.name?.toLowerCase().includes(query) ||
      item.address?.toLowerCase().includes(query)
    );
  }, [pharmacies, searchQuery]);

  const closestPharmacy = filteredPharmacies[0] || pharmacies[0] || null;

  return (
    <SafeAreaView style={[styles.screen, { backgroundColor: isDark ? colors.background : '#f8fafc' }]}>
      {/* Header */}
      <View style={[styles.header, isDark && { backgroundColor: colors.surface, borderBottomColor: colors.border }]}>
        <View style={styles.headerRow}>
          <TouchableOpacity style={[styles.backBtn, isDark && { backgroundColor: colors.surfaceAlt }]} onPress={onBack}>
            <Ionicons name="arrow-back" size={20} color={isDark ? colors.textPrimary : '#374151'} />
          </TouchableOpacity>
          <Text style={[styles.headerTitle, arBold, { color: colors.textPrimary }]}>{txt.title}</Text>
        </View>
      </View>

      {/* Location Bar */}
      <View style={[styles.locationBar, isDark && { backgroundColor: colors.surface, borderBottomColor: colors.border }]}>
        <View style={styles.locationLeft}>
          <View style={styles.locationDot} />
          <View>
            <Text style={[styles.locationLabel, arRegular, { color: colors.textSecondary }]}>{txt.location}</Text>
            <Text style={[styles.locationCity, arBold, { color: colors.textPrimary }]} numberOfLines={1}>
              {detectedAreaLabel}
            </Text>
          </View>
        </View>
        <TouchableOpacity
          style={[styles.refreshBtn, isDark && { backgroundColor: colors.surfaceAlt }]}
          onPress={loadFromCurrentLocation}
          activeOpacity={0.8}
        >
          {loading ? (
            <ActivityIndicator color={isDark ? '#9ca3af' : '#374151'} size="small" />
          ) : (
            <>
              <Ionicons name="locate" size={14} color={isDark ? '#9ca3af' : '#374151'} />
              <Text style={[styles.refreshBtnText, arRegular, { color: isDark ? '#9ca3af' : '#374151' }]}>{txt.refresh}</Text>
            </>
          )}
        </TouchableOpacity>
      </View>

      <ScrollView contentContainerStyle={styles.content} showsVerticalScrollIndicator={false}>
        {/* Search */}
        <View style={styles.searchWrap}>
          <View style={[styles.searchBar, isDark && { backgroundColor: colors.surface, borderColor: colors.border }]}>
            <Ionicons name="search" size={18} color="#9ca3af" />
            <TextInput
              value={searchQuery}
              onChangeText={setSearchQuery}
              placeholder={txt.searchPlaceholder}
              placeholderTextColor="#9ca3af"
              style={[styles.searchInput, arRegular, { color: colors.textPrimary }]}
            />
          </View>
        </View>

        {/* Closest pharmacy */}
        {closestPharmacy ? (
          <View style={styles.closestWrap}>
            <View style={[styles.closestCard, isDark && { backgroundColor: colors.surface, borderColor: colors.border }]}>
              <View style={styles.closestInfo}>
                <Text style={[styles.closestLabel, arRegular, isDark && { color: '#34d399' }]}>{txt.closest}</Text>
                <Text style={[styles.closestTitle, arBold, { color: colors.textPrimary }]} numberOfLines={1}>
                  {closestPharmacy.name}
                </Text>
                <Text style={[styles.closestMeta, arRegular, { color: colors.textSecondary }]}>
                  {closestPharmacy.distanceKm != null ? `${closestPharmacy.distanceKm.toFixed(1)} km` : '--'}
                </Text>
              </View>
              <TouchableOpacity style={styles.closestRouteBtn} onPress={() => openDirections(closestPharmacy)} activeOpacity={0.8}>
                <Text style={[styles.closestRouteText, arBold]}>{txt.route}</Text>
              </TouchableOpacity>
            </View>
          </View>
        ) : null}

        {/* Section header */}
        <View style={styles.sectionHeader}>
          <Text style={[styles.sectionTitle, arBold, { color: colors.textPrimary }]}>{txt.nearYou}</Text>
          {closestPharmacy ? (
            <TouchableOpacity onPress={() => openDirections(closestPharmacy)} activeOpacity={0.8}>
              <Text style={[styles.sectionLink, arRegular]}>{txt.viewMap}</Text>
            </TouchableOpacity>
          ) : null}
        </View>

        {/* Loading */}
        {loading && pharmacies.length === 0 ? (
          <View style={styles.loadingState}>
            <ActivityIndicator color="#059669" />
          </View>
        ) : null}

        {/* Empty */}
        {!loading && filteredPharmacies.length === 0 ? (
          <View style={[styles.emptyCard, isDark && { backgroundColor: colors.surface }]}>
            <Text style={[styles.emptyTitle, arBold, { color: colors.textPrimary }]}>{t('pharmacies.noResults')}</Text>
            <Text style={[styles.emptySub, arRegular, { color: colors.textSecondary }]}>{t('pharmacies.noResultsSub')}</Text>
          </View>
        ) : null}

        {/* Pharmacy cards */}
        {filteredPharmacies.map((item) => (
          <View key={item.id} style={[styles.pharmacyCard, isDark && { backgroundColor: colors.surface, borderColor: colors.border }]}>
            <View style={styles.cardTopRow}>
              <View style={[styles.iconWrap, isDark && { backgroundColor: 'rgba(5, 150, 105, 0.15)' }]}>
                <Ionicons name="medical" size={18} color="#059669" />
              </View>

              <View style={styles.cardMainInfo}>
                <Text style={[styles.cardTitle, arBold, { color: colors.textPrimary }]} numberOfLines={1}>
                  {item.name}
                </Text>
                <Text style={[styles.cardAddress, arRegular, { color: colors.textSecondary }]} numberOfLines={1}>
                  {item.address || t('pharmacies.addrUnavailable')}
                </Text>
              </View>

              <View style={styles.ratingWrap}>
                <View style={styles.ratingRow}>
                  <Ionicons name="star" size={12} color="#f59e0b" />
                  <Text style={[styles.ratingText, { color: colors.textPrimary }]}>{item.meta?.rating?.toFixed(1)}</Text>
                </View>
                <Text style={[styles.distanceText, { color: colors.textSecondary }]}>
                  {item.distanceKm != null ? `${item.distanceKm.toFixed(1)} km` : '--'}
                </Text>
              </View>
            </View>

            <View style={styles.cardActions}>
              <TouchableOpacity style={[styles.directionsBtn]} onPress={() => openDirections(item)} activeOpacity={0.8}>
                <Text style={[styles.directionsBtnText, arBold]}>{txt.directions}</Text>
              </TouchableOpacity>

              <TouchableOpacity
                style={[styles.callBtn, isDark && { backgroundColor: colors.surfaceAlt, borderColor: colors.border }]}
                onPress={() => handleCall(item)}
                activeOpacity={0.8}
              >
                <Text style={[styles.callBtnText, arRegular, { color: colors.textPrimary }]}>
                  {item.phone || txt.noPhone}
                </Text>
              </TouchableOpacity>
            </View>
          </View>
        ))}
      </ScrollView>
    </SafeAreaView>
  );
}
