import { useEffect, useState } from 'react';
import { useRouter, Redirect } from 'expo-router';
import AsyncStorage from '@react-native-async-storage/async-storage';

export default function Index() {
  const [hasSeen, setHasSeen] = useState(null);
  const router = useRouter();

  useEffect(() => {
    async function checkOnboarding() {
      try {
        const onboardingValue = await AsyncStorage.getItem('hasSeenOnboarding');
        setHasSeen(!!onboardingValue);
      } catch (e) {
        console.error('Error reading onboarding flag:', e);
        setHasSeen(false);
      }
    }

    checkOnboarding();
  }, []);

  if (hasSeen === null) return null; // still loading

  // ✅ If seen onboarding, redirect to main
  if (hasSeen) {
    return <Redirect href="/(drawer)/Main" />;
  }

  // Else, redirect to onboarding
  return <Redirect href="/OnboardingScreen" />;
}
