import React, { useEffect } from 'react';
import {
  DrawerContentScrollView,
  DrawerItemList,
  DrawerItem,
} from '@react-navigation/drawer';
import {
  View,
  Text,
  Linking,
  StyleSheet,
  Switch,
  Share,
  Alert,
  Image,
  TouchableOpacity,
} from 'react-native';
import { MaterialIcons, Ionicons } from '@expo/vector-icons';
import * as SecureStore from 'expo-secure-store';
import { useThemeStore } from './ZustandStore.js';



export default function DrawerContent(props) {
  const { isDark, setDark, initTheme } = useThemeStore();

  useEffect(() => {
    initTheme();
  }, []);

  const handleShare = async () => {
    try {
      await Share.share({
        message:
          'Made By Suraj Chawhan :) :\nhttps://www.drgitr.com',
      });
    } catch (error) {
      Alert.alert('Error', 'Could not share the app.');
    }
  };

  const openLink = async (url) => {
    try {
      const supported = await Linking.canOpenURL(url);
      if (supported) {
        await Linking.openURL(url);
      } else {
        Alert.alert('Error', `Can't open this URL: ${url}`);
      }
    } catch (error) {
      Alert.alert('Error', 'Failed to open the link.');
    }
  };

  // Logout function: clears token & user data and redirects to Signin screen
  const handleLogout = async () => {
    try {
      await SecureStore.deleteItemAsync('userToken');
      await SecureStore.deleteItemAsync('userData');
      props.navigation.replace('Signin');
    } catch (error) {
      Alert.alert('Error', 'Failed to logout properly.');
    }
  };

  return (
    <DrawerContentScrollView
      {...props}
      contentContainerStyle={[
        styles.container,
        { backgroundColor: isDark ? '#1e1e1e' : '#fff' },
      ]}
    >
      {/* App Header */}
      <View style={styles.header}>
        <Image
          source={require('../assets/logo-drgitr.jpg')}
          style={styles.avatar}
          resizeMode="contain"
        />
        <Text
          style={[
            styles.title,
            { color: isDark ? '#fff' : '#000' },
          ]}
        >
          DRGITR
        </Text>
      </View>

      {/* Drawer Items */}
      <DrawerItemList {...props} />

      <DrawerItem
        label="Privacy Policy"
        icon={({ color, size }) => (
          <MaterialIcons name="policy" size={size} color={color} />
        )}
        onPress={() =>
          openLink(
            `${process.env.EXPO_PUBLIC_API_URL}/privacy-policy`
          )
        }
      />

      <DrawerItem
        label="Report a Bug"
        icon={({ color, size }) => (
          <Ionicons name="bug-outline" size={size} color={color} />
        )}
        onPress={() =>
          openLink(`${process.env.EXPO_PUBLIC_API_URL}/report-form`)
        }
      />

      <DrawerItem
        label="Share App"
        icon={({ color, size }) => (
          <Ionicons name="share-social-outline" size={size} color={color} />
        )}
        onPress={handleShare}
      />

      {/* Theme Toggle */}
      <View style={styles.themeToggle}>
        <Text style={[styles.themeText, { color: isDark ? '#fff' : '#000' }]}>
          {isDark ? 'Dark' : 'Light'} Theme
        </Text>
        <Switch
          value={isDark}
          onValueChange={(val) => setDark(val)}
          trackColor={{ false: '#767577', true: '#81b0ff' }}
          thumbColor={isDark ? '#f5dd4b' : '#f4f3f4'}
        />
      </View>

      {/* Logout Button at Bottom */}
      <View style={styles.logoutContainer}>
        <TouchableOpacity
          onPress={handleLogout}
          style={styles.logoutButton}
          activeOpacity={0.7}
        >
          <Ionicons name="log-out-outline" size={22} color="#fff" />
          <Text style={styles.logoutText}>Logout</Text>
        </TouchableOpacity>
      </View>
    </DrawerContentScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  header: {
    padding: 20,
    borderBottomWidth: 1,
    borderColor: '#333',
    alignItems: 'center',
  },
  avatar: {
    width: 80,
    height: 80,
    borderRadius: 40,
    marginBottom: 10,
  },
  title: {
    fontSize: 18,
    marginTop: 4,
  },
  themeToggle: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 16,
    borderTopWidth: 1,
    borderColor: '#333',
  },
  themeText: {
    fontSize: 16,
  },
  logoutContainer: {
    marginTop: 'auto',
    padding: 20,
    borderTopWidth: 1,
    borderColor: '#333',
  },
  logoutButton: {
    flexDirection: 'row',
    backgroundColor: '#007bff',
    paddingVertical: 12,
    paddingHorizontal: 20,
    borderRadius: 30,
    alignItems: 'center',
    justifyContent: 'center',
  },
  logoutText: {
    color: '#fff',
    fontWeight: '700',
    fontSize: 16,
    marginLeft: 10,
  },
});
