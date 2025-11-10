import React, { useState } from 'react';
import { View, Image, StyleSheet, TouchableOpacity } from 'react-native';
import { Text, ActivityIndicator, IconButton } from 'react-native-paper';
import { takePhotoAsync, pickImageAsync } from '@/hooks/use-image-picker';
import uploadService from '@/services/upload';
import { useRouter } from 'expo-router';

export default function CaptureScreen() {
  const [uri, setUri] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const router = useRouter();

  const handleTake = async () => {
    const u = await takePhotoAsync();
    if (u) setUri(u);
  };

  const handlePick = async () => {
    const u = await pickImageAsync();
    if (u) setUri(u);
  };

  const handleUpload = async () => {
    if (!uri) return;
    setLoading(true);
    const result = await uploadService.uploadImage(uri /*, webhookUrl optional */);
    setLoading(false);
    router.push({ pathname: '/results', params: { uri, result: JSON.stringify(result), success: '1' } });
  };

  return (
    <View style={styles.fullscreen}>
      <View style={styles.previewArea}>
        {uri ? <Image source={{ uri }} style={styles.previewImage} /> : <View style={styles.black} />}
      </View>

      <View style={styles.controls}>
        <IconButton icon="image" size={28} onPress={handlePick} accessibilityLabel="Pick image" />

        <TouchableOpacity style={styles.shutter} onPress={handleTake} accessibilityLabel="Take photo">
          <View style={styles.shutterInner} />
        </TouchableOpacity>

        <TouchableOpacity
          style={styles.uploadPill}
          onPress={handleUpload}
          disabled={!uri || loading}
          accessibilityLabel="Upload">
          {loading ? <ActivityIndicator animating size={18} color="white" /> : <Text style={styles.uploadText}>Upload</Text>}
        </TouchableOpacity>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  fullscreen: {
    flex: 1,
    backgroundColor: '#000',
  },
  previewArea: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  black: {
    flex: 1,
    width: '100%',
    backgroundColor: '#000',
  },
  previewImage: {
    width: '100%',
    height: '100%',
    resizeMode: 'cover',
  },
  controls: {
    height: 120,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-around',
    paddingHorizontal: 24,
    backgroundColor: 'transparent',
  },
  shutter: {
    width: 84,
    height: 84,
    borderRadius: 42,
    borderWidth: 4,
    borderColor: '#fff',
    alignItems: 'center',
    justifyContent: 'center',
  },
  shutterInner: {
    width: 64,
    height: 64,
    borderRadius: 32,
    backgroundColor: '#fff',
  },
  uploadPill: {
    backgroundColor: '#4F70FF',
    paddingHorizontal: 18,
    paddingVertical: 10,
    borderRadius: 28,
    alignItems: 'center',
    justifyContent: 'center',
  },
  uploadText: {
    color: '#fff',
    fontWeight: '600',
  },
});
