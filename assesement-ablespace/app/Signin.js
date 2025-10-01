import React, { useState } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  KeyboardAvoidingView,
  Platform,
  Alert,
  ActivityIndicator,
  Image,
} from 'react-native';
import * as SecureStore from 'expo-secure-store';
import { useRouter } from 'expo-router';
import axios from 'axios';

export default function Signin() {
  const router = useRouter();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);

  const validate = () => {
    if (!email.trim()) {
      Alert.alert('Validation', 'Please enter your email.');
      return false;
    }
    if (!password.trim()) {
      Alert.alert('Validation', 'Please enter your password.');
      return false;
    }
    return true;
  };

  const saveUserData = async (token, user) => {
    try {
      await SecureStore.setItemAsync('userToken', token);
      await SecureStore.setItemAsync('userData', JSON.stringify(user));
    } catch (e) {
      console.warn('Failed to save user data', e);
    }
  };

  const handleLogin = async () => {
    if (!validate()) return;
    setLoading(true);
    try {
      const response = await axios.post(
        `${process.env.EXPO_PUBLIC_API_URL}/login`,
        { email, password },
        { headers: { 'Content-Type': 'application/json' } }
      );

      const data = response.data;
      await saveUserData(data.token, data.user);

      Alert.alert('Success', `Welcome back, ${data.user.name}!`);
      router.replace('/(drawer)/Main');
    } catch (error) {
      const message =
        error.response?.data?.message || error.message || 'Unknown error occurred.';
      Alert.alert('Login Failed', message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <KeyboardAvoidingView
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
      style={styles.container}
    >
      <View style={styles.innerContainer}>
        <Image source={require('../assets/tts.png')} style={styles.logo} />
        <Text style={styles.title}>Login</Text>

        <TextInput
          placeholder="Email"
          placeholderTextColor="black"
          keyboardType="email-address"
          autoCapitalize="none"
          autoComplete="email"
          value={email}
          onChangeText={setEmail}
          style={styles.input}
          editable={!loading}
        />
        <TextInput
          placeholder="Password"
          placeholderTextColor="black"
          secureTextEntry
          value={password}
          onChangeText={setPassword}
          style={styles.input}
          editable={!loading}
        />

        <TouchableOpacity
          style={[styles.button, loading && styles.buttonDisabled]}
          onPress={handleLogin}
          disabled={loading}
        >
          {loading ? (
            <ActivityIndicator color="#fff" />
          ) : (
            <Text style={styles.buttonText}>Login</Text>
          )}
        </TouchableOpacity>

        <View style={styles.footer}>
          <Text style={styles.footerText}>Don't have an account? </Text>
          <TouchableOpacity onPress={() => router.push('/Signup')}>
            <Text style={styles.signupLink}>Sign up</Text>
          </TouchableOpacity>
        </View>
      </View>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, justifyContent: 'center', backgroundColor: '#fff' },
  innerContainer: { padding: 24, alignItems: 'center' },
  logo: { width: 120, height: 120, marginBottom: 20, resizeMode: 'contain' },
  title: { fontSize: 28, fontWeight: '700', marginBottom: 24, textAlign: 'center' },
  input: {
    height: 48,
    borderColor: '#bbb',
    borderWidth: 1,
    borderRadius: 8,
    color: 'black',
    marginBottom: 16,
    paddingHorizontal: 16,
    fontSize: 16,
    width: '100%',
  },
  button: {
    backgroundColor: '#005af0',
    height: 48,
    borderRadius: 8,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 16,
    width: '100%',
  },
  buttonDisabled: { backgroundColor: '#7f9cf5' },
  buttonText: { color: '#fff', fontSize: 18, fontWeight: '700' },
  footer: { flexDirection: 'row', justifyContent: 'center' },
  footerText: { fontSize: 16, color: '#555' },
  signupLink: { fontSize: 16, color: '#005af0', fontWeight: '700' },
});
