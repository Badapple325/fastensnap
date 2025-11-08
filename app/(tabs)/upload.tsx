import React, { useState } from 'react';
import { View, Image, StyleSheet } from 'react-native';
import { Card, Button, Text, ActivityIndicator } from 'react-native-paper';
import { pickImageAsync } from '@/hooks/use-image-picker';
import PaperAppbar from '@/components/paper-appbar';
import uploadService from '@/services/upload';
import { useRouter } from 'expo-router';

export default function UploadScreen() {
  const [uri, setUri] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const router = useRouter();

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
    <View style={{ flex: 1 }}>
      <PaperAppbar title="Upload" />
      <View style={styles.container}>
        <Card style={{ width: '100%' }}>
          {uri ? (
            <Card.Content>
              <Image source={{ uri }} style={styles.preview} />
            </Card.Content>
          ) : (
            <Card.Content>
              <Text>No image selected</Text>
            </Card.Content>
          )}
          <Card.Actions>
            <Button icon="upload" mode="contained" onPress={handlePick}>
              Pick Image
            </Button>
            <View style={{ width: 12 }} />
            <Button icon="cloud-upload" mode="contained" onPress={handleUpload} disabled={!uri || loading}>
              {loading ? <ActivityIndicator animating size={18} color="white" /> : 'Upload'}
            </Button>
          </Card.Actions>
        </Card>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    padding: 16,
    flex: 1,
    alignItems: 'center',
    justifyContent: 'flex-start',
  },
  preview: {
    width: '100%',
    height: 320,
    borderRadius: 8,
  },
});
