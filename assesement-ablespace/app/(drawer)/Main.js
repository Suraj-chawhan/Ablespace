import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Image,
  FlatList,
  TextInput,
  ActivityIndicator,
  Alert,
  Dimensions,
} from 'react-native';
import * as ImagePicker from 'expo-image-picker';
import { Audio } from 'expo-av';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { Ionicons } from '@expo/vector-icons';
import { useThemeStore } from '../../components/ZustandStore';

const { width } = Dimensions.get('window');
const ITEM_SIZE = (width - 40) / 2;

export default function ComplaintScreen() {
  const { isDark } = useThemeStore();

  const [items, setItems] = useState([]);
  const [formVisible, setFormVisible] = useState(false);
  const [image, setImage] = useState(null);
  const [recording, setRecording] = useState(null);
  const [audioUri, setAudioUri] = useState(null);
  const [caption, setCaption] = useState('');
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    loadItems();
  }, []);

  const loadItems = async () => {
    try {
      const data = await AsyncStorage.getItem('complaintItems');
      if (data) setItems(JSON.parse(data));
    } catch (err) {
      console.error('Failed to load items:', err);
    }
  };

  const saveItem = async (newItem) => {
    try {
      const updatedItems = [newItem, ...items];
      setItems(updatedItems);
      await AsyncStorage.setItem('complaintItems', JSON.stringify(updatedItems));
      setImage(null);
      setAudioUri(null);
      setCaption('');
      setFormVisible(false);
    } catch (err) {
      console.error(err);
    }
  };

  // Pick image
  const pickImage = async () => {
    const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync();
    if (status !== 'granted') {
      Alert.alert('Permission required', 'Gallery access is needed.');
      return;
    }
    const result = await ImagePicker.launchImageLibraryAsync({ quality: 0.7 });
    if (!result.canceled) setImage(result.assets[0].uri);
  };

  // Audio Recording
  const startRecording = async () => {
    try {
      setLoading(true);
      const { status } = await Audio.requestPermissionsAsync();
      if (status !== 'granted') {
        Alert.alert('Permission required', 'Audio recording access is needed.');
        setLoading(false);
        return;
      }
      const rec = new Audio.Recording();
      await rec.prepareToRecordAsync(Audio.RECORDING_OPTIONS_PRESET_HIGH_QUALITY);
      await rec.startAsync();
      setRecording(rec);
      setLoading(false);
    } catch (err) {
      console.error(err);
      setLoading(false);
    }
  };

  const stopRecording = async () => {
    try {
      setLoading(true);
      await recording.stopAndUnloadAsync();
      const uri = recording.getURI();
      setRecording(null);
      setAudioUri(uri);

      // Send audio to backend API for transcription
      const formData = new FormData();
      formData.append('audio', { uri, name: 'audio.m4a', type: 'audio/m4a' });

      const res = await fetch('https://YOUR_BACKEND_URL/upload', {
        method: 'POST',
        body: formData,
      });

      if (!res.ok) {
        throw new Error(await res.text());
      }
      const data = await res.json();
      setCaption(data.transcription || '');
      setLoading(false);
    } catch (err) {
      console.error('Transcription failed:', err);
      Alert.alert('Error', 'Audio transcription failed. Make sure your internet is working.');
      setLoading(false);
    }
  };

  const addItem = () => {
    if (!image && !audioUri) {
      Alert.alert('Validation', 'Please pick an image or record audio.');
      return;
    }
    saveItem({ image, audioUri, caption });
  };

  const renderItem = ({ item }) => (
    <View style={[styles.gridItem, { backgroundColor: isDark ? '#333' : '#fff' }]}>
      {item.image && <Image source={{ uri: item.image }} style={styles.image} />}
      {item.audioUri && (
        <TouchableOpacity
          style={styles.audioButton}
          onPress={async () => {
            try {
              const sound = new Audio.Sound();
              await sound.loadAsync({ uri: item.audioUri });
              await sound.playAsync();
            } catch (err) {
              console.error(err);
            }
          }}
        >
          <Ionicons name="play" size={20} color="#fff" />
          <Text style={styles.audioButtonText}>Play</Text>
        </TouchableOpacity>
      )}
      {item.caption && (
        <Text style={[styles.caption, { color: isDark ? '#fff' : '#111' }]}>{item.caption}</Text>
      )}
    </View>
  );

  return (
    <View style={[styles.container, { backgroundColor: isDark ? '#121212' : '#f2f2f2' }]}>
      {formVisible && (
        <View style={[styles.formContainer, { backgroundColor: isDark ? '#222' : '#fff' }]}>
          <View style={styles.inlineRow}>
            <TouchableOpacity
              style={styles.button}
              onPress={recording ? stopRecording : startRecording}
            >
              <Ionicons name={recording ? 'square' : 'mic'} size={28} color="#fff" />
              <Text style={styles.buttonText}>{recording ? 'Stop' : 'Record'}</Text>
            </TouchableOpacity>

            <TouchableOpacity style={styles.button} onPress={pickImage}>
              <Ionicons name="image" size={28} color="#fff" />
              <Text style={styles.buttonText}>Image</Text>
            </TouchableOpacity>
          </View>

          <TextInput
            style={[styles.input, { backgroundColor: isDark ? '#333' : '#eee', color: isDark ? '#fff' : '#000' }]}
            value={caption}
            onChangeText={setCaption}
            placeholder="Caption..."
            placeholderTextColor={isDark ? '#aaa' : '#555'}
          />

          <TouchableOpacity style={styles.addButtonForm} onPress={addItem}>
            <Ionicons name="add-circle" size={32} color="#fff" />
            <Text style={styles.buttonText}>Add Item</Text>
          </TouchableOpacity>

          {loading && <ActivityIndicator size="large" color="#005af0" />}
        </View>
      )}

      <FlatList
        data={items}
        keyExtractor={(_, i) => i.toString()}
        renderItem={renderItem}
        numColumns={2}
        contentContainerStyle={{ padding: 10 }}
      />

      {!formVisible && (
        <TouchableOpacity
          style={styles.floatingAdd}
          onPress={() => setFormVisible(true)}
        >
          <Ionicons name="add-circle" size={56} color="#005af0" />
        </TouchableOpacity>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  formContainer: { padding: 10, margin: 10, borderRadius: 12, elevation: 3 },
  inlineRow: { flexDirection: 'row', justifyContent: 'space-between', marginBottom: 10 },
  button: {
    flex: 1,
    marginHorizontal: 5,
    padding: 12,
    backgroundColor: '#005af0',
    borderRadius: 12,
    alignItems: 'center',
  },
  buttonText: { color: '#fff', marginTop: 4, textAlign: 'center', fontWeight: '600' },
  input: { borderRadius: 12, padding: 10, fontSize: 16, marginBottom: 10 },
  addButtonForm: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#005af0',
    padding: 10,
    borderRadius: 12,
    justifyContent: 'center',
    marginBottom: 10,
  },
  gridItem: {
    flex: 1,
    margin: 6,
    borderRadius: 12,
    overflow: 'hidden',
    alignItems: 'center',
    padding: 8,
  },
  image: { width: ITEM_SIZE, height: ITEM_SIZE, borderRadius: 12 },
  caption: { padding: 6, textAlign: 'center' },
  audioButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#005af0',
    padding: 6,
    borderRadius: 8,
    marginTop: 6,
  },
  audioButtonText: { color: '#fff', marginLeft: 6, fontWeight: '600' },
  floatingAdd: { position: 'absolute', bottom: 25, right: 25, alignItems: 'center' },
});
