import React, { useState, useRef } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ActivityIndicator,
  Alert,
} from 'react-native';
import {
  CameraView,
  useCameraPermissions,
} from 'expo-camera';

const Camera = ({ onClose, onPhotoTaken }) => {
  // Use strings directly instead of CameraType enum
  const [facing, setFacing] = useState("back"); 
  const [permission, requestPermission] = useCameraPermissions();
  const cameraRef = useRef(null);
  const [isTakingPhoto, setIsTakingPhoto] = useState(false);

  if (!permission) {
    return (
      <View style={styles.permissionContainer}>
        <ActivityIndicator size="large" color="#005af0" />
        <Text style={{ color: '#fff', marginTop: 10 }}>
          Requesting camera permission...
        </Text>
      </View>
    );
  }

  if (!permission.granted) {
    return (
      <View style={styles.permissionContainer}>
        <Text style={styles.message}>
          Camera permission is required to take photos.
        </Text>
        <TouchableOpacity
          style={styles.permissionButton}
          onPress={requestPermission}
        >
          <Text style={styles.permissionButtonText}>Grant Permission</Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={[styles.permissionButton, { backgroundColor: 'red', marginTop: 10 }]}
          onPress={onClose}
        >
          <Text style={styles.permissionButtonText}>Close Camera</Text>
        </TouchableOpacity>
      </View>
    );
  }

  // Custom toggle logic using strings directly
  const toggleCameraFacing = () => {
    setFacing(current => (current === "back" ? "front" : "back"));
  };

  const takePicture = async () => {
    if (cameraRef.current && !isTakingPhoto) {
      try {
        setIsTakingPhoto(true);
        const photo = await cameraRef.current.takePictureAsync({
          quality: 0.7,
        });
        onPhotoTaken(photo.uri);
      } catch (error) {
        Alert.alert('Error', 'Failed to take photo. Please try again.');
      } finally {
        setIsTakingPhoto(false);
      }
    }
  };

  return (
    <View style={styles.container}>
      <CameraView
        ref={cameraRef}
        style={styles.camera}
        facing={facing} // pass string "back" or "front"
        onError={(error) => Alert.alert('Camera Error', error.message)}
      >
        <View style={styles.topButtons}>
          <TouchableOpacity onPress={onClose} style={styles.closeButton}>
            <Text style={styles.closeText}>Close</Text>
          </TouchableOpacity>

          <TouchableOpacity onPress={toggleCameraFacing} style={styles.flipButton}>
            <Text style={styles.flipText}>Flip</Text>
          </TouchableOpacity>
        </View>

        <View style={styles.bottomButtons}>
          <TouchableOpacity
            onPress={takePicture}
            style={styles.captureButton}
            disabled={isTakingPhoto}
          >
            {isTakingPhoto ? (
              <ActivityIndicator size="large" color="#005af0" />
            ) : (
              <View style={styles.innerCircle} />
            )}
          </TouchableOpacity>
        </View>
      </CameraView>
    </View>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: 'black' },
  camera: { flex: 1 },
  topButtons: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    padding: 20,
  },
  closeButton: {
    backgroundColor: '#00000080',
    borderRadius: 30,
    padding: 10,
  },
  closeText: {
    color: 'white',
    fontSize: 18,
  },
  flipButton: {
    backgroundColor: '#00000080',
    borderRadius: 30,
    padding: 10,
  },
  flipText: {
    color: 'white',
    fontSize: 18,
  },

  // Changed bottomButtons style here:
  bottomButtons: {
    position: 'absolute',
    bottom: 30,
    left: 0,
    right: 0,
    alignItems: 'center',
  },

  captureButton: {
    width: 70,
    height: 70,
    borderRadius: 35,
    borderWidth: 5,
    borderColor: 'white',
    justifyContent: 'center',
    alignItems: 'center',
  },
  innerCircle: {
    width: 50,
    height: 50,
    backgroundColor: 'white',
    borderRadius: 25,
  },
  permissionContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: 'black',
    paddingHorizontal: 20,
  },
  message: {
    color: 'white',
    fontSize: 18,
    textAlign: 'center',
    marginBottom: 20,
  },
  permissionButton: {
    backgroundColor: '#005af0',
    paddingVertical: 12,
    paddingHorizontal: 30,
    borderRadius: 30,
  },
  permissionButtonText: {
    color: 'white',
    fontSize: 18,
    fontWeight: 'bold',
  },
});

export default Camera;
