import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  Image,
  FlatList,
  TextInput,
  ActivityIndicator,
  Alert,
  Dimensions,
  Share,
} from 'react-native';
import * as ImagePicker from 'expo-image-picker';
import { Audio } from 'expo-av';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { Ionicons } from '@expo/vector-icons';
import { useThemeStore } from '../../components/ZustandStore';

const { width } = Dimensions.get('window');
const ITEM_SIZE = (width - 40) / 2;
const API_URL = process.env.EXPO_PUBLIC_API_URL;

export default function ComplaintScreen() {
  const [items, setItems] = useState([]);
  const [formVisible, setFormVisible] = useState(false);
  const [image, setImage] = useState(null);
  const [recording, setRecording] = useState(null);
  const [audioUri, setAudioUri] = useState(null);
  const [caption, setCaption] = useState('');
  const [loading, setLoading] = useState(false);

  const { isDark } = useThemeStore(); // ✅ Zustand theme

  useEffect(() => {
    const loadItems = async () => {
      try {
        const data = await AsyncStorage.getItem('complaintItems');
        if (data) setItems(JSON.parse(data));
      } catch (err) {
        console.error('Failed to load items:', err);
      }
    };
    loadItems();
  }, []);

  const saveItem = async (newItem) => {
    const updatedItems = [newItem, ...items];
    setItems(updatedItems);
    await AsyncStorage.setItem('complaintItems', JSON.stringify(updatedItems));
    setImage(null);
    setAudioUri(null);
    setCaption('');
    setFormVisible(false);
  };

  const deleteItem = async (index) => {
    const updatedItems = items.filter((_, i) => i !== index);
    setItems(updatedItems);
    await AsyncStorage.setItem('complaintItems', JSON.stringify(updatedItems));
  };

  const pickImage = async () => {
    const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync();
    if (status !== 'granted') {
      Alert.alert('Permission required', 'Gallery access is needed.');
      return;
    }
    const result = await ImagePicker.launchImageLibraryAsync({ quality: 0.7 });
    if (!result.canceled) setImage(result.assets[0].uri);
  };

  const startRecording = async () => {
    try {
      const { status } = await Audio.requestPermissionsAsync();
      if (status !== 'granted') {
        Alert.alert('Permission required', 'Audio recording access is needed.');
        return;
      }
      const rec = new Audio.Recording();
      await rec.prepareToRecordAsync(Audio.RECORDING_OPTIONS_PRESET_HIGH_QUALITY);
      await rec.startAsync();
      setRecording(rec);
    } catch (err) {
      console.error(err);
    }
  };

  const stopRecording = async () => {
    try {
      await recording.stopAndUnloadAsync();
      const uri = recording.getURI();
      setRecording(null);
      setAudioUri(uri);

      if (uri) {
        setLoading(true);
        const formData = new FormData();
        formData.append('audio', {
          uri,
          type: 'audio/mp4',
          name: 'audio.m4a',
        });

        try {
          const res = await fetch(`${API_URL}/upload`, {
            method: 'POST',
            body: formData,
            headers: { 'Content-Type': 'multipart/form-data' },
          });

          if (!res.ok) throw new Error(await res.text());
          const data = await res.json();
          setCaption(data.transcription || '');
        } catch (err) {
          console.error('Transcription failed:', err);
          Alert.alert('Error', 'Audio transcription failed.');
        } finally {
          setLoading(false);
        }
      }
    } catch (err) {
      console.error(err);
    }
  };

  const addItem = () => {
    if (!image && !audioUri) {
      Alert.alert('Validation', 'Please pick an image or record audio.');
      return;
    }
    saveItem({ image, audioUri, caption });
  };

  const renderItem = ({ item, index }) => {
    const onShare = async () => {
      try {
        let content = item.caption || '';
        if (item.image) content += `\n📷 Image: ${item.image}`;
        if (item.audioUri) content += `\n🎤 Audio: ${item.audioUri}`;
        await Share.share({ message: content });
      } catch (err) {
        console.error('Error sharing:', err);
      }
    };

    return (
      <View style={[styles.gridItem, { backgroundColor: isDark ? '#222' : '#fff' }]}>
        {/* Delete Button */}
        <TouchableOpacity style={styles.deleteButton} onPress={() => deleteItem(index)}>
          <Ionicons name="trash" size={22} color="red" />
        </TouchableOpacity>

        {/* Share Button */}
        <TouchableOpacity style={styles.shareButton} onPress={onShare}>
          <Ionicons name="share-social" size={22} color="#005af0" />
        </TouchableOpacity>

        {item.image && <Image source={{ uri: item.image }} style={styles.image} />}
        {item.caption && (
          <Text style={[styles.caption, { color: isDark ? '#eee' : '#111' }]}>{item.caption}</Text>
        )}
      </View>
    );
  };

  return (
    <View style={[styles.container, { backgroundColor: isDark ? '#000' : '#f2f2f2' }]}>
      {formVisible && (
        <View style={[styles.formContainer, { backgroundColor: isDark ? '#111' : '#fff' }]}>
          <View style={{ flexDirection: 'row', justifyContent: 'space-between' }}>
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
            style={[
              styles.input,
              { backgroundColor: isDark ? '#333' : '#eee', color: isDark ? '#fff' : '#000' },
            ]}
            value={caption}
            onChangeText={setCaption}
            placeholder="Caption..."
            placeholderTextColor={isDark ? '#888' : '#666'}
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
        <TouchableOpacity style={styles.floatingAdd} onPress={() => setFormVisible(true)}>
          <Ionicons name="add-circle" size={56} color="#005af0" />
        </TouchableOpacity>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  formContainer: { padding: 10, margin: 10, borderRadius: 12, elevation: 3 },
  button: {
    flex: 1,
    marginHorizontal: 5,
    padding: 12,
    backgroundColor: '#005af0',
    borderRadius: 12,
    alignItems: 'center',
    marginVertical: 5,
  },
  buttonText: { color: '#fff', marginTop: 4, textAlign: 'center', fontWeight: '600' },
  input: { borderRadius: 12, padding: 10, fontSize: 16, marginVertical: 10 },
  addButtonForm: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#005af0',
    padding: 10,
    borderRadius: 12,
    justifyContent: 'center',
    marginVertical: 5,
  },
  gridItem: {
    flex: 1,
    margin: 6,
    borderRadius: 12,
    overflow: 'hidden',
    alignItems: 'center',
    padding: 8,
    position: 'relative',
  },
  image: { width: ITEM_SIZE, height: ITEM_SIZE, borderRadius: 12 },
  caption: { padding: 6, textAlign: 'center' },
  deleteButton: {
    position: 'absolute',
    top: 6,
    right: 6,
    backgroundColor: '#fff',
    borderRadius: 12,
    padding: 4,
    elevation: 3,
    zIndex: 1,
  },
  shareButton: {
    position: 'absolute',
    top: 6,
    left: 6,
    backgroundColor: '#fff',
    borderRadius: 12,
    padding: 4,
    elevation: 3,
    zIndex: 1,
  },
  floatingAdd: { position: 'absolute', bottom: 25, right: 25, alignItems: 'center' },
});
