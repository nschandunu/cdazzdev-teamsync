import React, { useState } from 'react';
import { View, Text, TextInput, TouchableOpacity, StyleSheet, ActivityIndicator, Alert } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import * as SecureStore from 'expo-secure-store';
import { fetchMobileAPI } from '../utils/api';

export default function LoginScreen({ setToken }: { setToken: (token: string) => void }) {
  // Pre-filled with the manager credentials we seeded in NestJS
  const [email, setEmail] = useState('manager@teamsync.com');
  const [password, setPassword] = useState('password123');
  const [isLoading, setIsLoading] = useState(false);
  const [errors, setErrors] = useState<{email?: string, password?: string, general?: string}>({});
  const [rememberMe, setRememberMe] = useState(false);

  const handleLogin = async () => {
    const newErrors: {email?: string, password?: string} = {};
    if (!email) {
      newErrors.email = 'Email is required';
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      newErrors.email = 'Invalid email address';
    }
    
    if (!password) {
      newErrors.password = 'Password is required';
    }

    setErrors(newErrors);

    if (Object.keys(newErrors).length > 0) {
      return;
    }

    setIsLoading(true);
    try {
      const data = await fetchMobileAPI('/auth/login', {
        method: 'POST',
        body: JSON.stringify({ email, password }),
      });

      // REQUIREMENT: Securely store the token in the Android Keystore
      await SecureStore.setItemAsync('access_token', data.access_token);
      setToken(data.access_token);
    } catch (error: any) {
      setErrors({ general: error.message || 'Invalid credentials' });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.formContainer}>
        <Text style={styles.title}>TeamSync</Text>
        <Text style={styles.subtitle}>Mobile Workspace</Text>

        {errors.general && (
          <View style={styles.errorContainer}>
            <Text style={styles.errorText}>{errors.general}</Text>
          </View>
        )}

        <View style={styles.inputContainer}>
          <Text style={styles.label}>Email Address</Text>
          <TextInput
            style={[styles.input, errors.email ? styles.inputError : null]}
            value={email}
            onChangeText={(text) => { setEmail(text); setErrors(prev => ({...prev, email: undefined})); }}
            autoCapitalize="none"
            keyboardType="email-address"
          />
          {errors.email && <Text style={styles.inlineErrorText}>{errors.email}</Text>}
        </View>

        <View style={styles.inputContainer}>
          <Text style={styles.label}>Password</Text>
          <TextInput
            style={[styles.input, errors.password ? styles.inputError : null]}
            value={password}
            onChangeText={(text) => { setPassword(text); setErrors(prev => ({...prev, password: undefined})); }}
            secureTextEntry
          />
          {errors.password && <Text style={styles.inlineErrorText}>{errors.password}</Text>}
        </View>

        <TouchableOpacity 
          style={styles.checkboxContainer} 
          onPress={() => setRememberMe(!rememberMe)}
          activeOpacity={0.7}
        >
          <View style={[styles.checkbox, rememberMe && styles.checkboxChecked]}>
            {rememberMe && <Text style={styles.checkmark}>✓</Text>}
          </View>
          <Text style={styles.checkboxLabel}>Remember me</Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={[styles.button, isLoading && styles.buttonDisabled]}
          onPress={handleLogin}
          disabled={isLoading}
        >
          {isLoading ? (
            <ActivityIndicator color="#fff" />
          ) : (
            <Text style={styles.buttonText}>Sign In</Text>
          )}
        </TouchableOpacity>

        <View style={styles.registerContainer}>
          <Text style={styles.registerText}>Don't have an account? </Text>
          <TouchableOpacity onPress={() => Alert.alert('Register', 'Navigate to Register Screen')}>
            <Text style={styles.registerLink}>Register here</Text>
          </TouchableOpacity>
        </View>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#F9FAFB', justifyContent: 'center' },
  formContainer: { padding: 24, width: '100%' },
  title: { fontSize: 28, fontWeight: 'bold', color: '#111827', textAlign: 'center', marginBottom: 8 },
  subtitle: { fontSize: 15, color: '#6B7280', textAlign: 'center', marginBottom: 32 },
  inputContainer: { marginBottom: 16 },
  label: { fontSize: 13, fontWeight: '500', color: '#374151', marginBottom: 8 },
  input: { backgroundColor: '#fff', borderWidth: 1, borderColor: '#D1D5DB', borderRadius: 6, padding: 12, fontSize: 15, color: '#111827' },
  button: { backgroundColor: '#2563EB', padding: 16, borderRadius: 6, alignItems: 'center', marginTop: 16 },
  buttonDisabled: { opacity: 0.7 },
  buttonText: { color: '#fff', fontSize: 15, fontWeight: 'bold' },
  errorContainer: { backgroundColor: '#FEE2E2', padding: 12, borderRadius: 6, marginBottom: 16, borderWidth: 1, borderColor: '#EF4444' },
  errorText: { color: '#DC2626', fontSize: 13, textAlign: 'center' },
  inputError: { borderColor: '#EF4444' },
  inlineErrorText: { color: '#EF4444', fontSize: 12, marginTop: 4 },
  checkboxContainer: { flexDirection: 'row', alignItems: 'center', marginBottom: 16, marginTop: -4 },
  checkbox: { width: 18, height: 18, borderWidth: 1, borderColor: '#D1D5DB', borderRadius: 4, marginRight: 8, justifyContent: 'center', alignItems: 'center', backgroundColor: '#fff' },
  checkboxChecked: { backgroundColor: '#2563EB', borderColor: '#2563EB' },
  checkmark: { color: '#fff', fontSize: 12, fontWeight: 'bold' },
  checkboxLabel: { fontSize: 14, color: '#4B5563' },
  registerContainer: { flexDirection: 'row', justifyContent: 'center', marginTop: 24 },
  registerText: { fontSize: 14, color: '#6B7280' },
  registerLink: { fontSize: 14, color: '#2563EB', fontWeight: '500' },
});