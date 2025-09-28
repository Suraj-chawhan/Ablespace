import React, { useEffect, useState } from 'react';
import { Drawer } from 'expo-router/drawer';
import DrawerContent from '../../components/DrawerContent';
import { Ionicons } from '@expo/vector-icons';
import { TouchableOpacity, View, Text, StyleSheet } from 'react-native';
import { router } from 'expo-router';
import * as SecureStore from 'expo-secure-store';
import { useThemeStore } from '../../components/ZustandStore';

export default function DrawerLayout() {
  const { isDark } = useThemeStore();
  const [userName, setUserName] = useState('');

  useEffect(() => {
    const fetchUserName = async () => {
      try {
        const userString = await SecureStore.getItemAsync('userData');
        if (userString) {
          const user = JSON.parse(userString);
          setUserName(user.name || '');
        }
      } catch (e) {
        console.warn('Failed to load user data', e);
      }
    };
    fetchUserName();
  }, []);

  return (
    <Drawer
      drawerContent={(props) => <DrawerContent {...props} />}
      screenOptions={({ route }) => ({
        headerShown: true,
        title: route?.params?.name || 'Content',
        drawerLabel: route?.params?.name || 'Content',

        headerRight: () => (
          <TouchableOpacity
            style={styles.headerRightContainer}
            onPress={() => router.replace('/')}
          >
            {userName ? (
              <Text style={styles.userNameText}>{userName}</Text>
            ) : null}
            
            <Ionicons name="arrow-forward" size={24} color="white" />
          </TouchableOpacity>
        ),

        headerStyle: {
          backgroundColor: isDark ? '#1e1e1e' : '#777',
        },
        headerTintColor: '#fff',

        drawerStyle: {
          backgroundColor: isDark ? '#1e1e1e' : '#fff',
        },
        drawerActiveTintColor: isDark ? '#fff' : '#000',
        drawerInactiveTintColor: isDark ? '#aaa' : '#555',
        drawerLabelStyle: {
          fontSize: 16,
          fontWeight: 'bold',
          color: isDark ? '#fff' : '#000',
        },
      })}
    />
  );
}

const styles = StyleSheet.create({
  headerRightContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginRight: 16,
  },
  userNameText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '600',
    marginLeft: 8,
  },
});
