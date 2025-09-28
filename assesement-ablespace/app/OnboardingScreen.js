import React, { useRef, useState } from 'react';
import {
  View,
  Text,
  FlatList,
  TouchableOpacity,
  StyleSheet,
  Dimensions,
  Image,
} from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { router } from 'expo-router';
import { LinearGradient } from 'expo-linear-gradient';
import { Ionicons } from '@expo/vector-icons';

const { width } = Dimensions.get('window');

const data = [
  {
    id: '0',
    title: 'Welcome to DRGITR Complaint App',
    description:
      'Use this app to easily send complaints directly to the right department in your college.',
    image: require('../assets/logo-drgitr.jpg'), // College logo
    colors: ['#283c86', '#45a247'], // Blue-green gradient
  },
  {
    id: '1',
    title: 'Cleaner Service',
    description:
      'Report cleanliness issues around campus and get them resolved quickly.',
    image: require('../assets/cleaner.png'),
    colors: ['#1c92d2', '#f2fcfe'],
  },
  {
    id: '2',
    title: 'Electrician Service',
    description:
      'Report electrical issues such as broken lights or wiring problems.',
    image: require('../assets/electrician.png'),
    colors: ['#ff9966', '#ff5e62'],
  },
  {
    id: '3',
    title: 'Canteen Complaints',
    description:
      'Share feedback or complaints about the canteen food and hygiene.',
    image: require('../assets/canteen.png'),
    colors: ['#56ab2f', '#a8e063'],
  },
  {
    id: '4',
    title: 'Water Cooler Maintenance',
    description:
      'Report problems with water coolers so they can be fixed promptly.',
    image: require('../assets/watercoller.png'),
    colors: ['#36d1dc', '#5b86e5'],
  },
];

export default function OnboardingScreen() {
  const [index, setIndex] = useState(0);
  const flatListRef = useRef();

  const handleDone = async () => {
    await AsyncStorage.setItem('hasSeenOnboarding', 'true');
    router.replace('/');
  };

  const handleNext = () => {
    if (index < data.length - 1) {
      flatListRef.current.scrollToIndex({ index: index + 1 });
      setIndex(index + 1);
    } else {
      handleDone();
    }
  };

  const handlePrev = () => {
    if (index > 0) {
      flatListRef.current.scrollToIndex({ index: index - 1 });
      setIndex(index - 1);
    }
  };

  const handleSkip = () => handleDone();

  const renderItem = ({ item }) => (
    <LinearGradient colors={item.colors} style={styles.page}>
      {/* Top-right skip button */}
      <TouchableOpacity style={styles.skipButton} onPress={handleSkip}>
        <Text style={styles.skipText}>Skip</Text>
      </TouchableOpacity>

      <Image source={item.image} style={styles.image} resizeMode="contain" />
      <Text style={styles.title}>{item.title}</Text>
      <Text style={styles.desc}>{item.description}</Text>
    </LinearGradient>
  );

  return (
    <View style={styles.container}>
      <FlatList
        data={data}
        ref={flatListRef}
        horizontal
        pagingEnabled
        keyExtractor={(item) => item.id}
        showsHorizontalScrollIndicator={false}
        renderItem={renderItem}
        onMomentumScrollEnd={(e) => {
          const newIndex = Math.round(e.nativeEvent.contentOffset.x / width);
          setIndex(newIndex);
        }}
      />

      <View style={styles.bullets}>
        {data.map((_, i) => (
          <View key={i} style={[styles.dot, index === i && styles.activeDot]} />
        ))}
      </View>

      {/* Navigation buttons with arrows */}
      <View style={styles.btnContainer}>
        <TouchableOpacity
          onPress={handlePrev}
          disabled={index === 0}
          style={styles.navBtn}
        >
          <Ionicons
            name="arrow-back"
            size={20}
            color={index === 0 ? '#aaa' : '#fff'}
          />
          <Text style={[styles.btnText, index === 0 && styles.disabledText]}>
            Prev
          </Text>
        </TouchableOpacity>

        <TouchableOpacity onPress={handleNext} style={styles.navBtn}>
          <Text style={styles.btnText}>
            {index === data.length - 1 ? 'Finish' : 'Next'}{' '}
          </Text>
          <Ionicons name="arrow-forward" size={20} color="#fff" />
        </TouchableOpacity>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  page: {
    width,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 30,
    flex: 1,
  },
  skipButton: {
    position: 'absolute',
    top: 40,
    right: 20,
    zIndex: 10,
    padding: 8,
  },
  skipText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: 'bold',
  },
  image: {
    width: 250,
    height: 250,
    marginBottom: 30,
  },
  title: {
    fontSize: 26,
    fontWeight: 'bold',
    color: '#fff',
    textAlign: 'center',
    marginBottom: 10,
  },
  desc: {
    fontSize: 16,
    color: '#eee',
    textAlign: 'center',
    paddingHorizontal: 20,
  },
  bullets: {
    flexDirection: 'row',
    justifyContent: 'center',
    marginVertical: 15,
  },
  dot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: '#ccc',
    marginHorizontal: 4,
  },
  activeDot: {
    backgroundColor: '#fff',
    width: 10,
    height: 10,
  },
  btnContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingHorizontal: 40,
    paddingBottom: 20,
  },
  navBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 10,
    backgroundColor: 'rgba(0, 0, 0, 0.3)',
    borderRadius: 12,
  },
  btnText: {
    fontSize: 16,
    color: '#fff',
    fontWeight: 'bold',
  },
  disabledText: {
    color: '#aaa',
  },
});
