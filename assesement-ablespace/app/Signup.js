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
  ScrollView,
  ActivityIndicator,
  Image,
} from 'react-native';
import * as SecureStore from 'expo-secure-store';
import { useRouter } from 'expo-router';
import axios from 'axios';



export default function Signup() {
  const router = useRouter();

  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);

  const validate = () => {
    if (!name.trim()) {
      Alert.alert('Validation', 'Please enter your name.');
      return false;
    }
    if (name.length > 50) {
      Alert.alert('Validation', 'Name cannot exceed 50 characters.');
      return false;
    }
    if (!email.trim()) {
      Alert.alert('Validation', 'Please enter your email.');
      return false;
    }
    if (email.length > 100) {
      Alert.alert('Validation', 'Email cannot exceed 100 characters.');
      return false;
    }
    if (!password.trim()) {
      Alert.alert('Validation', 'Please enter your password.');
      return false;
    }
    if (password.length < 6 || password.length > 128) {
      Alert.alert('Validation', 'Password must be between 6 and 128 characters.');
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

  const handleSignup = async () => {
    if (!validate()) return;

    setLoading(true);
    try {
      const response = await axios.post(
        `${process.env.EXPO_PUBLIC_API_URL}/register`,
        { name, email, password },
        { headers: { 'Content-Type': 'application/json' } }
      );

      const data = response.data;

      await saveUserData(data.token, data.user);

      Alert.alert('Success', `Welcome, ${data.user.name}!`);
      router.replace('/(drawer)/Main');
    } catch (error) {
      const message =
        error.response?.data?.message || error.message || 'Unknown error occurred.';
      Alert.alert('Signup Failed', message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <KeyboardAvoidingView
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
      style={styles.keyboardAvoidingContainer}
    >
      <ScrollView
        contentContainerStyle={styles.scrollViewContainer}
        keyboardShouldPersistTaps="handled"
      >
        {/* Logo Image */}
        <Image source={require('../assets/tts.png')} style={styles.logo} />

        <Text style={styles.title}>Create Account</Text>

        <TextInput
          placeholder="Name"
          placeholderTextColor="black"
          value={name}
          onChangeText={setName}
          style={styles.input}
          editable={!loading}
        />

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
          onPress={handleSignup}
          disabled={loading}
        >
          {loading ? <ActivityIndicator color="#fff" /> : <Text style={styles.buttonText}>Sign Up</Text>}
        </TouchableOpacity>

        <View style={styles.footer}>
          <Text style={styles.footerText}>Already have an account? </Text>
          <TouchableOpacity onPress={() => router.push('/Signin')}>
            <Text style={styles.loginLink}>Login</Text>
          </TouchableOpacity>
        </View>
      </ScrollView>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  keyboardAvoidingContainer: {
    flex: 1,
    backgroundColor: 'white',
  },
  scrollViewContainer: {
    flexGrow: 1,
    justifyContent: 'center', // vertical center
    alignItems: 'center', // horizontal center
    padding: 24,
  },
  logo: {
    width: 120,
    height: 120,
    marginBottom: 20,
    resizeMode: 'contain',
  },
  title: {
    fontSize: 32,
    fontWeight: '700',
    marginBottom: 32,
    textAlign: 'center',
  },
  input: {
    height: 48,
    borderColor: '#bbb',
    borderWidth: 1,
    borderRadius: 8,
    marginBottom: 16,
    color: 'black',
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
    marginBottom: 24,
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
  loginLink: {
    fontSize: 16,
    color: '#005af0',
    fontWeight: '700',
  },
});
