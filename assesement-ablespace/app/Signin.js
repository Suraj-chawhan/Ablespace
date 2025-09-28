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


export default function Login() {
  const router = useRouter();

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);

  const [showForgotPassword, setShowForgotPassword] = useState(false);
  const [showOTPForm, setShowOTPForm] = useState(false);
  const [showResetForm, setShowResetForm] = useState(false);

  const [otp, setOtp] = useState('');
  const [newPassword, setNewPassword] = useState('');

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
      router.replace('/');
    } catch (error) {
      const message =
        error.response?.data?.message || error.message || 'Unknown error occurred.';
      Alert.alert('Login Failed', message);
    } finally {
      setLoading(false);
    }
  };

  const handleForgotPassword = async () => {
    if (!email.trim()) {
      Alert.alert('Validation', 'Please enter your email to receive OTP.');
      return;
    }
    setLoading(true);
    try {
      await axios.post(`${BACKEND_URL}/forgot-password`, { email });
      Alert.alert('OTP Sent', 'Check your email for the OTP.');
      setShowForgotPassword(false);
      setShowOTPForm(true);
    } catch (error) {
      const message =
        error.response?.data?.message || error.message || 'Failed to send OTP.';
      Alert.alert('Error', message);
    } finally {
      setLoading(false);
    }
  };

  const handleResetPassword = async () => {
    if (!otp.trim() || !newPassword.trim()) {
      Alert.alert('Validation', 'Please enter OTP and new password.');
      return;
    }
    setLoading(true);
    try {
      await axios.post(`${BACKEND_URL}/reset-password`, {
        email,
        otp,
        newPassword,
      });
      Alert.alert('Success', 'Password has been reset. Please login.');
      setShowResetForm(false);
    } catch (error) {
      const message =
        error.response?.data?.message || error.message || 'Failed to reset password.';
      Alert.alert('Error', message);
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
        <Image source={require('../assets/logo-drgitr.jpg')} style={styles.logo} />

        {showForgotPassword ? (
          <>
            <Text style={styles.title}>Forgot Password</Text>
            <TextInput
              placeholder="Enter your email"
              placeholderTextColor="black"
              keyboardType="email-address"
              autoCapitalize="none"
              value={email}
              onChangeText={setEmail}
              style={styles.input}
              editable={!loading}
            />
            <TouchableOpacity
              style={[styles.button, loading && styles.buttonDisabled]}
              onPress={handleForgotPassword}
              disabled={loading}
            >
              {loading ? (
                <ActivityIndicator color="#fff" />
              ) : (
                <Text style={styles.buttonText}>Send OTP</Text>
              )}
            </TouchableOpacity>
            <TouchableOpacity onPress={() => setShowForgotPassword(false)}>
              <Text style={styles.signupLink}>Back to Login</Text>
            </TouchableOpacity>
          </>
        ) : showOTPForm ? (
          <>
            <Text style={styles.title}>Enter OTP</Text>
            <TextInput
              placeholder="Enter OTP"
              placeholderTextColor="black"
              keyboardType="numeric"
              value={otp}
              onChangeText={setOtp}
              style={styles.input}
              editable={!loading}
            />
            <TouchableOpacity
              style={[styles.button, loading && styles.buttonDisabled]}
              onPress={() => {
                setShowOTPForm(false);
                setShowResetForm(true);
              }}
              disabled={loading}
            >
              <Text style={styles.buttonText}>Verify OTP</Text>
            </TouchableOpacity>
          </>
        ) : showResetForm ? (
          <>
            <Text style={styles.title}>Reset Password</Text>
            <TextInput
              placeholder="New Password"
              placeholderTextColor="black"
              secureTextEntry
              value={newPassword}
              onChangeText={setNewPassword}
              style={styles.input}
              editable={!loading}
            />
            <TouchableOpacity
              style={[styles.button, loading && styles.buttonDisabled]}
              onPress={handleResetPassword}
              disabled={loading}
            >
              {loading ? (
                <ActivityIndicator color="#fff" />
              ) : (
                <Text style={styles.buttonText}>Reset Password</Text>
              )}
            </TouchableOpacity>
          </>
        ) : (
          <>
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

            <TouchableOpacity onPress={() => setShowForgotPassword(true)}>
              <Text style={[styles.signupLink, { marginBottom: 20 }]}>
                Forgot Password?
              </Text>
            </TouchableOpacity>

            <View style={styles.footer}>
              <Text style={styles.footerText}>Don't have an account? </Text>
              <TouchableOpacity onPress={() => router.push('/Signup')}>
                <Text style={styles.signupLink}>Sign up</Text>
              </TouchableOpacity>
            </View>
          </>
        )}
      </View>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, justifyContent: 'center', backgroundColor: '#fff' },
  innerContainer: { padding: 24, alignItems: 'center' },
  logo: {
    width: 120,
    height: 120,
    marginBottom: 20,
    resizeMode: 'contain',
  },
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
  buttonDisabled: {
    backgroundColor: '#7f9cf5',
  },
  buttonText: {
    color: '#fff',
    fontSize: 18,
    fontWeight: '700',
  },
  footer: {
    flexDirection: 'row',
    justifyContent: 'center',
  },
  footerText: {
    fontSize: 16,
    color: '#555',
  },
  signupLink: {
    fontSize: 16,
    color: '#005af0',
    fontWeight: '700',
  },
});
