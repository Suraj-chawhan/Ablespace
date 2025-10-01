import { useEffect, useState } from 'react';
import { Redirect } from 'expo-router';
import AsyncStorage from '@react-native-async-storage/async-storage';

export default function Index() {
  const [loading, setLoading] = useState(true);
  const [hasSeenOnboarding, setHasSeenOnboarding] = useState(false);
  const [isAuthenticated, setIsAuthenticated] = useState(false);

  useEffect(() => {
    async function checkStatus() {
      try {
        const onboardingValue = await AsyncStorage.getItem('hasSeenOnboarding');
        setHasSeenOnboarding(!!onboardingValue);

        const userToken = await AsyncStorage.getItem('userToken');
        setIsAuthenticated(!!userToken);
      } catch (e) {
        console.error('Error reading storage:', e);
        setHasSeenOnboarding(false);
        setIsAuthenticated(false);
      } finally {
        setLoading(false);
      }
    }

    checkStatus();
  }, []);

  if (loading) return null;

  if (!hasSeenOnboarding) return <Redirect href="/OnboardingScreen" />;
  if (!isAuthenticated) return <Redirect href="/Signin" />;

  return <Redirect href="/(drawer)/Main" />;
}
