import { ThemeProvider, DarkTheme, DefaultTheme } from '@react-navigation/native';
import { Stack } from 'expo-router';
import { useThemeStore } from '../components/ZustandStore.js';
import { useEffect, useState } from 'react';
import * as SplashScreen from 'expo-splash-screen';
import * as Asset from 'expo-asset';
import { View, Image, StyleSheet } from 'react-native';

SplashScreen.preventAutoHideAsync();

export default function RootLayout() {
  const { isDark, initTheme } = useThemeStore();
  const [isReady, setIsReady] = useState(false);

  useEffect(() => {
    const prepare = async () => {
      try {
        initTheme();

        // preload logo
        await Asset.loadAsync([require('../assets/tts.png')]);

        // delay for splash
        await new Promise((resolve) => setTimeout(resolve, 2000));
      } catch (e) {
        console.warn(e);
      } finally {
        setIsReady(true);
        await SplashScreen.hideAsync();
      }
    };

    prepare();
  }, []);

  if (!isReady) {
    return (
      <View style={styles.splashContainer}>
        <Image
          source={require('../assets/tts.png')}
          style={styles.splashImage}
          resizeMode="contain"
        />
      </View>
    );
  }

  return (
    <ThemeProvider value={isDark ? DarkTheme : DefaultTheme}>
      <Stack screenOptions={{ headerShown: false }}>
  
        <Stack.Screen name="index" options={{ href: "/" }} />

        {/* other routes */}
        <Stack.Screen name="Signin" />
        <Stack.Screen name="OnboardingScreen" />
        <Stack.Screen name="(drawer)" />
      </Stack>
    </ThemeProvider>
  );
}

const styles = StyleSheet.create({
  splashContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#fff',
  },
  splashImage: {
    width: 180,
    height: 180,
  },
});
