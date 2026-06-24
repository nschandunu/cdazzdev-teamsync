import * as SecureStore from 'expo-secure-store';
import { Platform } from 'react-native';

// For Android emulator, localhost is 10.0.2.2. For iOS simulator, it is localhost.
const API_URL = Platform.OS === 'android' ? 'http://10.0.2.2:3000/api' : 'http://localhost:3000/api';

export async function fetchMobileAPI(endpoint: string, options: RequestInit = {}) {
  // REQUIREMENT: Securely retrieve the token from the native keychain
  const token = await SecureStore.getItemAsync('access_token');
  
  const defaultHeaders: HeadersInit = {
    'Content-Type': 'application/json',
    'Accept': 'application/json',
    ...(token ? { 'Authorization': `Bearer ${token}` } : {}),
  };

  const response = await fetch(`${API_URL}${endpoint}`, {
    ...options,
    headers: {
      ...defaultHeaders,
      ...options.headers,
    },
  });

  const data = await response.json().catch(() => null);

  if (!response.ok) {
    throw new Error(data?.message || 'API request failed');
  }

  return data;
}