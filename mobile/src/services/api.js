import { Platform } from 'react-native';
import Constants from 'expo-constants';
import axios from 'axios';

const resolveApiBaseUrl = () => {
  const explicitApiUrl = process.env.EXPO_PUBLIC_API_URL;
  if (explicitApiUrl) {
    return explicitApiUrl;
  }

  const hostUri =
    Constants.expoConfig?.hostUri ||
    Constants.expoGoConfig?.debuggerHost ||
    Constants.manifest2?.extra?.expoClient?.hostUri;

  if (hostUri) {
    const host = hostUri.split(':')[0];
    if (host) {
      return `http://${host}:4000`;
    }
  }

  if (Platform.OS === 'android') {
    return 'http://10.0.2.2:4000';
  }

  return 'http://localhost:4000';
};

const API_BASE = resolveApiBaseUrl();

const api = axios.create({
  baseURL: API_BASE,
  timeout: 20000,
});

export const createAmbulanceRequest = (payload) => api.post('/api/requests/ambulance', payload);
export const createDoctorRequest = (payload) => api.post('/api/requests/doctor-home', payload);
export const signUp = (payload) => api.post('/api/auth/signup', payload);
export const signIn = (payload) => api.post('/api/auth/signin', payload);
export const updateAccount = (payload) => api.post('/api/auth/update-account', payload);
export const adminSignIn = (payload) => api.post('/api/admin/signin', payload);
export const fetchAdminRequests = ({ token, type, status } = {}) =>
  api.get('/api/admin/requests', {
    params: { type, status },
    headers: token ? { Authorization: `Bearer ${token}` } : undefined,
  });
export const updateAdminRequestStatus = ({ token, id, status }) =>
  api.patch(
    `/api/admin/requests/${id}/status`,
    { status },
    {
      headers: token ? { Authorization: `Bearer ${token}` } : undefined,
    },
  );

export const fetchNearbyPharmacies = ({ lat, lng, radius = 3000 }) =>
  api.get('/api/pharmacies/nearby', {
    params: { lat, lng, radius },
  });
