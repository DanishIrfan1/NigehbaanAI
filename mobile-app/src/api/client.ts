import axios from 'axios';
import { Platform } from 'react-native';

// Override via EXPO_PUBLIC_API_URL (.env / docker-compose).
// Android emulator: 10.0.2.2. Expo Go on phone: use host LAN IP (e.g. http://192.168.x.x:8000).
const BASE_URL =
  process.env.EXPO_PUBLIC_API_URL ??
  (Platform.OS === 'android' ? 'http://10.0.2.2:8000' : 'http://localhost:8000');

const api = axios.create({
  baseURL: BASE_URL,
  timeout: 10000,
});

export const triggerAnalyze = async (payload: { text: string; socialMedia?: boolean; weather: boolean; traffic: boolean; emergencyCall?: boolean }) => {
  const res = await api.post('/analyze', payload);
  return res.data;
};

export const getCrisisStatus = async () => {
  const res = await api.get('/crisis/status');
  return res.data;
};

export const getAgentsTrace = async () => {
  const res = await api.get('/agents/trace');
  return res.data;
};

export const getActions = async () => {
  const res = await api.get('/actions');
  return res.data;
};

export const getOutcome = async () => {
  const res = await api.get('/outcome');
  return res.data;
};

export default api;
