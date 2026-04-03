import { useEffect, useMemo, useRef, useState } from 'react';
import {
  ActivityIndicator,
  Alert,
  LayoutAnimation,
  Linking,
  Modal,
  Platform,
  SafeAreaView,
  ScrollView,
  Text,
  TouchableOpacity,
  UIManager,
  View,
  useWindowDimensions,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import * as Location from 'expo-location';
import { WebView } from 'react-native-webview';
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
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  return earth * c;
};

const fetchNearbyPharmaciesDirect = async ({ lat, lng, radius }) => {
  const query = `
    [out:json][timeout:25];
    (
      node["amenity"="pharmacy"](around:${radius},${lat},${lng});
      way["amenity"="pharmacy"](around:${radius},${lat},${lng});
      relation["amenity"="pharmacy"](around:${radius},${lat},${lng});
    );
    out center tags;
  `;

  const response = await fetch('https://overpass-api.de/api/interpreter', {
    method: 'POST',
    headers: { 'Content-Type': 'text/plain' },
    body: query,
  });

  if (!response.ok) {
    throw new Error('OVERPASS_REQUEST_FAILED');
  }

  const data = await response.json();
  return (data.elements || []).map((item) => ({
    id: `${item.type}-${item.id}`,
    name: item.tags?.name || 'Pharmacie',
    address: [item.tags?.['addr:street'], item.tags?.['addr:city']].filter(Boolean).join(', '),
    lat: item.lat ?? item.center?.lat ?? null,
    lng: item.lon ?? item.center?.lon ?? null,
  }));
};

const escapeHtml = (value = '') =>
  String(value)
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#39;');

export default function PharmaciesScreen({ onBack }) {
  const { width } = useWindowDimensions();
  const styles = useMemo(() => createPharmacyStyles(width), [width]);
  const s = useMemo(() => createScaler(width), [width]);
  const { t, language } = useI18n();
  const { colors, mode } = useAppTheme();
  const isDark = mode === 'dark';
  const darkCard = { backgroundColor: colors.surface, borderColor: colors.border };
  const darkSoft = { backgroundColor: colors.surfaceAlt, borderColor: colors.border };
  const arRegular = language === 'ar' ? { fontFamily: 'Cairo_400Regular' } : null;
  const arBold = language === 'ar' ? { fontFamily: 'Cairo_700Bold' } : null;
  const cityLabel = (city) => city?.[language] || city?.fr || city?.en || city?.id || '';
  const mapRef = useRef(null);
  const [mapModule, setMapModule] = useState(null);
  const preferWebMap = Platform.OS === 'android';

  const [loading, setLoading] = useState(false);
  const [pickerOpen, setPickerOpen] = useState(false);
  const [selectedCity, setSelectedCity] = useState(CITIES[0]);
  const [pharmacies, setPharmacies] = useState([]);
  const [selectedPharmacyId, setSelectedPharmacyId] = useState(null);
  const [routeTargetId, setRouteTargetId] = useState(null);
  const [routeCoords, setRouteCoords] = useState([]);
  const [routePreview, setRoutePreview] = useState(null);
  const [routeLoading, setRouteLoading] = useState(false);
  const [userLocation, setUserLocation] = useState(null);
  const [isSheetCollapsed, setIsSheetCollapsed] = useState(false);
  const [region, setRegion] = useState({
    latitude: CITIES[0].lat,
    longitude: CITIES[0].lng,
    latitudeDelta: 0.12,
    longitudeDelta: 0.12,
  });

  const fetchRouteCoords = async (from, to) => {
    try {
      const url = `https://router.project-osrm.org/route/v1/driving/${from.lng},${from.lat};${to.lng},${to.lat}?overview=full&geometries=geojson`;
      const response = await fetch(url);
      if (!response.ok) {
        throw new Error('ROUTE_HTTP_ERROR');
      }
      const data = await response.json();
      const points = data?.routes?.[0]?.geometry?.coordinates || [];
      const parsed = points
        .map((point) => ({ latitude: point[1], longitude: point[0] }))
        .filter((point) => isFiniteCoord(point.latitude, point.longitude));
      if (parsed.length >= 2) {
        return parsed;
      }
    } catch (_error) {
      // Fallback to a direct line when routing provider is unavailable.
    }
    return [
      { latitude: from.lat, longitude: from.lng },
      { latitude: to.lat, longitude: to.lng },
    ];
  };

  const openDirections = async ({ to }) => {
    if (!isFiniteCoord(to.lat, to.lng)) {
      Alert.alert(t('common.alert'), t('pharmacies.noCoords'));
      return;
    }

    setRouteLoading(true);
    let source = userLocation && isFiniteCoord(userLocation.lat, userLocation.lng) ? userLocation : null;
    if (!source) {
      try {
        const permission = await Location.requestForegroundPermissionsAsync();
        if (permission.status === 'granted') {
          const location = await Location.getCurrentPositionAsync({
            accuracy: Location.Accuracy.Balanced,
            mayShowUserSettingsDialog: true,
          });
          if (location?.coords) {
            source = { lat: location.coords.latitude, lng: location.coords.longitude };
            setUserLocation(source);
          }
        }
      } catch (_geoError) {
        source = null;
      }
    }
    if (!source) {
      source = { lat: selectedCity.lat, lng: selectedCity.lng };
    }

    try {
      const path = await fetchRouteCoords(source, to);
      setRouteCoords(path);
      setRouteTargetId(to.id || null);
      setRoutePreview({
        fromLabel: userLocation ? 'GPS' : cityLabel(selectedCity),
        toLabel: to.name || 'Pharmacie',
        distanceKm: distanceKm(source, { lat: Number(to.lat), lng: Number(to.lng) }),
      });
      focusPharmacy(to);
      if (mapRef.current && mapRef.current.fitToCoordinates && path.length > 1) {
        mapRef.current.fitToCoordinates(path, {
          edgePadding: { top: 90, right: 50, bottom: 220, left: 50 },
          animated: true,
        });
      }
      setIsSheetCollapsed(true);
    } finally {
      setRouteLoading(false);
    }
  };

  useEffect(() => {
    if (Platform.OS === 'web') return;
    try {
      const maps = require('react-native-maps');
      const MapViewComponent = maps?.default || maps?.MapView || maps;
      const MarkerComponent = maps?.Marker || maps?.default?.Marker;
      const CalloutComponent = maps?.Callout || maps?.default?.Callout;
      const PolylineComponent = maps?.Polyline || maps?.default?.Polyline;

      if (!MapViewComponent || !MarkerComponent || !CalloutComponent) {
        setMapModule(null);
        return;
      }

      setMapModule({
        MapView: MapViewComponent,
        Marker: MarkerComponent,
        Callout: CalloutComponent,
        Polyline: PolylineComponent,
      });
    } catch (_error) {
      setMapModule(null);
    }
  }, []);

  const loadPharmacies = async ({ lat, lng, cityForFallback }) => {
    setLoading(true);
    try {
      let items = [];
      const radiusSteps = [7000, 12000, 20000];

      for (const radius of radiusSteps) {
        try {
          const response = await fetchNearbyPharmacies({ lat, lng, radius });
          items = response.data.pharmacies || [];
        } catch (_apiError) {
          try {
            items = await fetchNearbyPharmaciesDirect({ lat, lng, radius });
          } catch (_overpassError) {
            items = [];
          }
        }
        if (items.length > 0) break;
      }

      const withDistance = items
        .map((item) => ({
          ...item,
          lat: Number(item.lat),
          lng: Number(item.lng),
          distanceKm: distanceKm({ lat, lng }, { lat: Number(item.lat), lng: Number(item.lng) }),
        }))
        .sort((a, b) => {
          if (a.distanceKm == null && b.distanceKm == null) return 0;
          if (a.distanceKm == null) return 1;
          if (b.distanceKm == null) return -1;
          return a.distanceKm - b.distanceKm;
        });

      setPharmacies(withDistance);
      setSelectedPharmacyId(withDistance[0]?.id || null);
      setRouteCoords([]);
      setRouteTargetId(null);
      setRoutePreview(null);
      setRegion({ latitude: lat, longitude: lng, latitudeDelta: 0.12, longitudeDelta: 0.12 });
      if (cityForFallback) {
        setSelectedCity(cityForFallback);
      }
      return withDistance.length;
    } catch (_error) {
      Alert.alert(t('common.error'), t('pharmacies.loadError'));
      return 0;
    } finally {
      setLoading(false);
    }
  };

  const loadFromCurrentLocation = async () => {
    setLoading(true);
    try {
      let permission = await Location.getForegroundPermissionsAsync();
      if (permission.status !== 'granted') {
        permission = await Location.requestForegroundPermissionsAsync();
      }
      if (permission.status !== 'granted') {
        await loadPharmacies({ lat: selectedCity.lat, lng: selectedCity.lng, cityForFallback: selectedCity });
        Alert.alert(
          t('common.info'),
          t('pharmacies.locDenied'),
          [
            { text: 'OK', style: 'cancel' },
            {
              text: t('pharmacies.settingsLabel'),
              onPress: () => Linking.openSettings(),
            },
          ],
        );
        return;
      }

      const gpsEnabled = await Location.hasServicesEnabledAsync();
      if (!gpsEnabled) {
        try {
          if (Platform.OS === 'android') {
            await Location.enableNetworkProviderAsync();
          }
        } catch (_providerError) {
          // Ignore and continue to fallback below if still unavailable.
        }
      }

      const gpsEnabledAfterPrompt = await Location.hasServicesEnabledAsync();
      if (!gpsEnabledAfterPrompt) {
        await loadPharmacies({ lat: selectedCity.lat, lng: selectedCity.lng, cityForFallback: selectedCity });
        Alert.alert(
          t('common.info'),
          language === 'ar'
            ? 'خدمة الموقع (GPS) مطفأة. شغّلها من الهاتف ثم اضغط تحديث.'
            : 'Le service de localisation (GPS) est desactive. Activez-le puis appuyez sur Actualiser.',
        );
        return;
      }

      let location = null;
      try {
        location = await Location.getCurrentPositionAsync({
          accuracy: Location.Accuracy.High,
          mayShowUserSettingsDialog: true,
          timeInterval: 1000,
        });
      } catch (_preciseError) {
        location = await Location.getLastKnownPositionAsync({});
      }

      if (!location?.coords) {
        await loadPharmacies({ lat: selectedCity.lat, lng: selectedCity.lng, cityForFallback: selectedCity });
        Alert.alert(
          t('common.info'),
          language === 'ar'
            ? 'تعذر تحديد موقعك الآن. تأكد من GPS والإنترنت ثم أعد المحاولة.'
            : 'Position introuvable pour le moment. Vérifiez le GPS et Internet puis réessayez.',
        );
        return;
      }

      const current = { lat: location.coords.latitude, lng: location.coords.longitude };
      setUserLocation(current);
      const nearbyCount = await loadPharmacies({ lat: current.lat, lng: current.lng });
      if (nearbyCount === 0) {
        Alert.alert(t('common.info'), t('pharmacies.noNearbyFromPos'));
      }
    } catch (_error) {
      setLoading(false);
      Alert.alert(t('common.error'), t('pharmacies.locError'));
    }
  };

  useEffect(() => {
    if (Platform.OS === 'android' && UIManager.setLayoutAnimationEnabledExperimental) {
      UIManager.setLayoutAnimationEnabledExperimental(true);
    }
  }, []);

  useEffect(() => {
    loadFromCurrentLocation();
  }, []);

  const toggleSheet = () => {
    LayoutAnimation.configureNext(LayoutAnimation.Presets.easeInEaseOut);
    setIsSheetCollapsed((prev) => !prev);
  };

  const onSelectCity = async (city) => {
    setPickerOpen(false);
    setUserLocation(null);
    setRouteCoords([]);
    setRouteTargetId(null);
    setRoutePreview(null);
    await loadPharmacies({ lat: city.lat, lng: city.lng, cityForFallback: city });
  };

  const focusPharmacy = (item) => {
    setSelectedPharmacyId(item.id);
    if (!isFiniteCoord(item.lat, item.lng)) return;

    const next = { latitude: item.lat, longitude: item.lng, latitudeDelta: 0.02, longitudeDelta: 0.02 };
    setRegion(next);
    if (mapRef.current && mapRef.current.animateToRegion) {
      mapRef.current.animateToRegion(next, 500);
    }
  };

  const validPharmacies = pharmacies.filter((p) => isFiniteCoord(p.lat, p.lng));
  const nearestPharmacyId = useMemo(() => {
    if (!userLocation) return null;
    let nearest = null;
    let minDist = Number.POSITIVE_INFINITY;
    for (const item of validPharmacies) {
      const d = distanceKm(userLocation, { lat: Number(item.lat), lng: Number(item.lng) });
      if (d != null && d < minDist) {
        minDist = d;
        nearest = item.id;
      }
    }
    return nearest;
  }, [userLocation, validPharmacies]);
  const useListMode = Platform.OS === 'web';
  const showWebViewMap = Platform.OS !== 'web' && (preferWebMap || !mapModule) && !useListMode;

  const webMapHtml = useMemo(() => {
    const markers = validPharmacies.map((item) => ({
      lat: item.lat,
      lng: item.lng,
      name: escapeHtml(item.name || ''),
      address: escapeHtml(item.address || ''),
      isNearest: item.id === nearestPharmacyId,
    }));
    const me = userLocation && isFiniteCoord(userLocation.lat, userLocation.lng)
      ? { lat: userLocation.lat, lng: userLocation.lng }
      : null;
    const route = routeCoords.map((point) => ({
      lat: point.latitude,
      lng: point.longitude,
    }));
    const centerLat = region.latitude || selectedCity.lat;
    const centerLng = region.longitude || selectedCity.lng;
    const payload = JSON.stringify({ centerLat, centerLng, markers, route, me }).replace(/</g, '\\u003c');

    return `<!DOCTYPE html>
<html>
  <head>
    <meta charset="utf-8" />
    <meta name="viewport" content="width=device-width, initial-scale=1.0, maximum-scale=1.0" />
    <link rel="stylesheet" href="https://unpkg.com/leaflet@1.9.4/dist/leaflet.css" />
    <style>
      html, body, #map { margin: 0; padding: 0; width: 100%; height: 100%; background: #e9f2ff; }
      .popup-title { font-weight: 700; margin-bottom: 4px; color: #1b2c49; }
      .popup-sub { color: #3e5578; font-size: 12px; }
    </style>
  </head>
  <body>
    <div id="map"></div>
    <script src="https://unpkg.com/leaflet@1.9.4/dist/leaflet.js"></script>
    <script>
      const data = ${payload};
      const map = L.map('map', { zoomControl: true }).setView([data.centerLat, data.centerLng], 13);
      L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
        maxZoom: 19,
        attribution: '&copy; OpenStreetMap contributors'
      }).addTo(map);

      if (Array.isArray(data.markers) && data.markers.length) {
        const points = [];
        data.markers.forEach((item) => {
          const marker = L.marker([item.lat, item.lng]).addTo(map);
            marker.bindPopup('<div class=\"popup-title\">' + item.name + '</div><div class=\"popup-sub\">' + item.address + '</div>');
          if (item.isNearest) {
            marker.bindTooltip('Plus proche', { permanent: false, direction: 'top' });
          }
          points.push([item.lat, item.lng]);
        });
        if (points.length > 1) {
          map.fitBounds(points, { padding: [20, 20] });
        } else if (points.length === 1) {
          map.setView(points[0], 15);
        }
      }

      if (Array.isArray(data.route) && data.route.length > 1) {
        const routePoints = data.route.map((p) => [p.lat, p.lng]);
        L.polyline(routePoints, { color: '#2f80ff', weight: 5, opacity: 0.9 }).addTo(map);
        map.fitBounds(routePoints, { padding: [40, 40] });
      }

      if (data.me && Number.isFinite(data.me.lat) && Number.isFinite(data.me.lng)) {
        L.circle([data.me.lat, data.me.lng], {
          radius: 700,
          color: '#2f80ff',
          weight: 1,
          fillColor: '#2f80ff',
          fillOpacity: 0.08
        }).addTo(map);
        L.circleMarker([data.me.lat, data.me.lng], {
          radius: 8,
          color: '#ffffff',
          weight: 2,
          fillColor: '#2f80ff',
          fillOpacity: 1
        }).addTo(map).bindPopup('Ma position');
      }
    </script>
  </body>
</html>`;
  }, [validPharmacies, nearestPharmacyId, routeCoords, userLocation, region.latitude, region.longitude, selectedCity.lat, selectedCity.lng]);

  return (
    <SafeAreaView style={[styles.screen, { backgroundColor: colors.background }]}>
      <View style={styles.topControls}>
        <TouchableOpacity style={[styles.nextBtn, isDark && darkCard]} onPress={onBack}>
          <Ionicons name="chevron-back" size={s(30, 24, 38)} color={isDark ? colors.textPrimary : '#1c2538'} />
        </TouchableOpacity>

        <TouchableOpacity style={[styles.cityBtn, isDark && darkCard]} onPress={() => setPickerOpen(true)}>
          <Ionicons name="chevron-down" size={s(24, 20, 30)} color={isDark ? colors.textSecondary : '#777'} />
          <Text style={[styles.cityText, arBold, isDark && { color: colors.textPrimary }]}>{cityLabel(selectedCity)}</Text>
        </TouchableOpacity>
      </View>

      <View style={[styles.heroCard, isDark && { backgroundColor: colors.surface, borderColor: colors.border }]}>
        <Text style={[styles.heroBadge, arRegular, isDark && { backgroundColor: '#1e2f52', color: '#bfd2f5' }]}>
          {userLocation ? t('pharmacies.nearYou') : t('pharmacies.searchByCity')}
        </Text>
        <Text style={[styles.heroTitle, arBold, isDark && { color: colors.textPrimary }]}>{t('pharmacies.title')}</Text>
        <Text style={[styles.heroSub, arRegular, isDark && { color: colors.textSecondary }]}>{t('pharmacies.sub')}</Text>
        <View style={styles.miniStats}>
          <View style={[styles.miniStat, isDark && darkSoft]}>
            <Text style={[styles.miniStatValue, isDark && { color: '#dce8ff' }]}>{pharmacies.length}</Text>
            <Text style={[styles.miniStatLabel, arRegular, isDark && { color: colors.textSecondary }]}>{t('pharmacies.found')}</Text>
          </View>
          <View style={[styles.miniStat, isDark && darkSoft]}>
            <Text style={[styles.miniStatValue, isDark && { color: '#dce8ff' }]}>{userLocation ? 'GPS' : cityLabel(selectedCity)}</Text>
            <Text style={[styles.miniStatLabel, arRegular, isDark && { color: colors.textSecondary }]}>{t('pharmacies.source')}</Text>
          </View>
        </View>
      </View>

      {useListMode ? (
        <View style={styles.webFallback}>
          <Text style={[styles.webFallbackTitle, arBold, { color: colors.textPrimary }]}>{t('pharmacies.results')}</Text>
          <Text style={[styles.webFallbackSub, arRegular, { color: colors.textSecondary }]}>{t('pharmacies.sub')}</Text>
          {routePreview ? (
            <View style={[styles.routePreviewCard, isDark && darkCard]}>
              <Text style={[styles.routePreviewTitle, isDark && { color: colors.textPrimary }]}>{t('pharmacies.routeReady')}</Text>
              <Text style={[styles.routePreviewSub, isDark && { color: colors.textSecondary }]}>
                {language === 'ar'
                  ? `${routePreview.fromLabel} <- ${routePreview.toLabel}`
                  : `${routePreview.fromLabel} -> ${routePreview.toLabel}`}
              </Text>
              <Text style={[styles.routePreviewSub, isDark && { color: colors.textSecondary }]}>
                {routePreview.distanceKm != null ? `${routePreview.distanceKm.toFixed(2)} km` : t('pharmacies.routeUnknownDistance')}
              </Text>
            </View>
          ) : null}
          {pharmacies.length === 0 ? (
            <View style={[styles.emptyState, isDark && darkCard]}>
              <Text style={[styles.emptyStateTitle, isDark && { color: colors.textPrimary }]}>{t('pharmacies.noResults')}</Text>
              <Text style={[styles.emptyStateSub, isDark && { color: colors.textSecondary }]}>{t('pharmacies.noResultsSub')}</Text>
            </View>
          ) : (
            <ScrollView showsVerticalScrollIndicator={false}>
              {pharmacies.map((item) => (
                <TouchableOpacity
                  key={item.id}
                  style={[styles.webCard, isDark && darkCard, item.id === routeTargetId && styles.webCardActive]}
                  onPress={() => openDirections({ to: item })}
                >
                  <Text style={[styles.webCardTitle, isDark && { color: colors.textPrimary }]}>{item.name}</Text>
                  <Text style={[styles.webCardSub, isDark && { color: colors.textSecondary }]}>{item.address || t('pharmacies.addrUnavailable')}</Text>
                  <Text style={[styles.webCardSub, isDark && { color: colors.textSecondary }]}>
                    {item.distanceKm != null ? `${item.distanceKm.toFixed(2)} km` : t('pharmacies.distUnavailable')}
                  </Text>
                </TouchableOpacity>
              ))}
            </ScrollView>
          )}
        </View>
      ) : showWebViewMap ? (
        <WebView
          key={`route-${routeTargetId || 'none'}-${routeCoords.length}`}
          originWhitelist={['*']}
          source={{ html: webMapHtml }}
          style={styles.map}
          javaScriptEnabled
          domStorageEnabled
        />
      ) : (
        <mapModule.MapView
          ref={mapRef}
          style={styles.map}
          region={region}
          onRegionChangeComplete={setRegion}
          showsUserLocation
          showsMyLocationButton
        >
          {mapModule.Circle && userLocation ? (
            <mapModule.Circle
              center={{ latitude: userLocation.lat, longitude: userLocation.lng }}
              radius={700}
              strokeColor="rgba(47,128,255,0.35)"
              fillColor="rgba(47,128,255,0.12)"
            />
          ) : null}

          {mapModule.Polyline && routeCoords.length > 1 ? (
            <mapModule.Polyline coordinates={routeCoords} strokeColor="#2f80ff" strokeWidth={5} />
          ) : null}

          {userLocation ? (
            <mapModule.Marker coordinate={{ latitude: userLocation.lat, longitude: userLocation.lng }} pinColor="#4b8dff" title={t('pharmacies.myPosition')} />
          ) : null}

          {validPharmacies.map((item) => (
            <mapModule.Marker
              key={item.id}
              coordinate={{ latitude: item.lat, longitude: item.lng }}
              pinColor={item.id === routeTargetId ? '#f05d23' : item.id === nearestPharmacyId ? '#1ea672' : item.id === selectedPharmacyId ? '#ff8b4a' : '#1f8fe6'}
              onPress={() => openDirections({ to: item })}
            >
              <mapModule.Callout onPress={() => openDirections({ to: item })}>
                <View>
                  <Text style={styles.calloutTitle}>{item.name}</Text>
                  <Text style={styles.calloutSub}>{item.address || t('pharmacies.addrUnavailable')}</Text>
                </View>
              </mapModule.Callout>
            </mapModule.Marker>
          ))}
        </mapModule.MapView>
      )}

      <View
        style={[
          styles.bottomSheet,
          isDark && { backgroundColor: colors.surface, borderColor: colors.border },
          isSheetCollapsed && styles.bottomSheetCollapsed,
        ]}
      >
        <TouchableOpacity style={styles.sheetHandle} onPress={toggleSheet} activeOpacity={0.85}>
          <Ionicons
            name={isSheetCollapsed ? 'chevron-up' : 'chevron-down'}
            size={s(18, 16, 22)}
            color={isDark ? colors.textSecondary : '#8aa6c8'}
          />
        </TouchableOpacity>

        {!isSheetCollapsed ? (
          <>
            <View style={styles.sheetHeader}>
              <TouchableOpacity style={styles.ctaBtn} onPress={loadFromCurrentLocation} disabled={loading || routeLoading}>
                {loading || routeLoading ? <ActivityIndicator color="#fff" /> : <Text style={[styles.ctaText, arRegular]}>{t('pharmacies.refresh')}</Text>}
              </TouchableOpacity>
              <Text style={[styles.sheetTitle, arBold, isDark && { color: colors.textPrimary }]}>{t('pharmacies.nearbyTitle')}</Text>
            </View>

            <ScrollView style={styles.resultList} showsVerticalScrollIndicator={false}>
              {pharmacies.length === 0 ? (
                <View style={[styles.emptyStateSmall, isDark && darkSoft]}>
                  <Text style={[styles.emptyStateTitle, isDark && { color: colors.textPrimary }]}>{t('pharmacies.noNear')}</Text>
                  <Text style={[styles.emptyStateSub, isDark && { color: colors.textSecondary }]}>{t('pharmacies.noNearSub')}</Text>
                </View>
              ) : (
                pharmacies.map((item) => {
                  const active = item.id === selectedPharmacyId;
                  return (
                    <TouchableOpacity
                      key={item.id}
                      style={[styles.resultCard, isDark && darkSoft, active && styles.resultCardActive]}
                      onPress={() => openDirections({ to: item })}
                      activeOpacity={0.9}
                    >
                      <View style={styles.resultTopRow}>
                        <TouchableOpacity style={styles.routeBtn} onPress={() => openDirections({ to: item })}>
                          <Ionicons name="navigate-outline" size={16} color="#fff" />
                          <Text style={[styles.routeBtnText, arRegular]}>{t('pharmacies.route')}</Text>
                        </TouchableOpacity>

                        <View style={styles.resultTitleWrap}>
                          <Text style={[styles.resultTitle, isDark && { color: colors.textPrimary }]}>{item.name}</Text>
                          <Text style={[styles.resultSub, isDark && { color: colors.textSecondary }]}>{item.address || t('pharmacies.addrUnavailable')}</Text>
                          <Text style={[styles.resultDistance, isDark && { color: '#9fb9e6' }]}>
                            {item.distanceKm != null ? `${item.distanceKm.toFixed(2)} km` : t('pharmacies.distUnavailable')}
                          </Text>
                        </View>
                      </View>
                    </TouchableOpacity>
                  );
                })
              )}
            </ScrollView>
          </>
        ) : null}
      </View>

      <Modal visible={pickerOpen} transparent animationType="slide" onRequestClose={() => setPickerOpen(false)}>
        <TouchableOpacity activeOpacity={1} style={styles.modalOverlay} onPress={() => setPickerOpen(false)}>
          <TouchableOpacity activeOpacity={1} style={[styles.modalCard, isDark && darkCard]}>
            <Text style={[styles.modalTitle, arBold, isDark && { color: colors.textPrimary }]}>{t('pharmacies.chooseCity')}</Text>
            <ScrollView>
              {CITIES.map((city) => {
                const active = selectedCity.id === city.id;
                return (
                  <TouchableOpacity
                    key={city.id}
                    style={[styles.cityItem, isDark && darkSoft, active && styles.cityItemActive]}
                    onPress={() => onSelectCity(city)}
                  >
                    <Ionicons
                      name={active ? 'checkmark-circle' : 'ellipse-outline'}
                      size={s(20, 18, 24)}
                      color={active ? '#1e95e9' : '#9aacbf'}
                    />
                    <Text style={[styles.cityItemText, isDark && { color: colors.textPrimary }, active && styles.cityItemTextActive]}>{cityLabel(city)}</Text>
                  </TouchableOpacity>
                );
              })}
            </ScrollView>
          </TouchableOpacity>
        </TouchableOpacity>
      </Modal>
    </SafeAreaView>
  );
}
