import axios from 'axios';
import { Platform } from 'react-native';

// For Android emulator, localhost is 10.0.2.2.
// For iOS simulator, localhost works.
const BASE_URL = Platform.OS === 'android' ? 'http://10.0.2.2:8000' : 'http://localhost:8000';

const api = axios.create({
  baseURL: BASE_URL,
  timeout: 10000,
});

export const triggerAnalyze = async (payload: { text: string; weather: boolean; traffic: boolean }) => {
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
