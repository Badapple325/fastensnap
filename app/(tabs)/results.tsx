import React, { useEffect, useState } from 'react';
import { View, Image, StyleSheet, ScrollView, Linking } from 'react-native';
import { Card, Text, List, Button, Chip, Snackbar } from 'react-native-paper';
import { useLocalSearchParams, useRouter } from 'expo-router';
import PaperAppbar from '@/components/paper-appbar';

export default function ResultsScreen() {
  const params = useLocalSearchParams();
  const router = useRouter();
  const uri = params.uri as string | undefined;
  const resultJson = params.result as string | undefined;
  const successFlag = params.success as string | undefined;

  const [snackbarVisible, setSnackbarVisible] = useState(false);
  const [snackbarMsg, setSnackbarMsg] = useState('');

  let parsed: any = null;
  try {
    parsed = resultJson ? JSON.parse(resultJson) : null;
  } catch (e) {
    parsed = { error: 'Failed to parse result' };
  }

  const labels: Array<any> = parsed?.labels ?? [];
  const THRESHOLD = 0.5;

  useEffect(() => {
    if (successFlag === '1') {
      setSnackbarMsg('Upload successful');
      setSnackbarVisible(true);
    }
  }, [successFlag]);

  return (
    <View style={{ flex: 1 }}>
      <PaperAppbar title="Results" onBack={() => router.back()} />
      <View style={{ paddingHorizontal: 16, paddingTop: 8 }}>
        <Button mode="outlined" onPress={() => router.push('/capture')} icon="camera-arrow-left">
          Take another photo
        </Button>
      </View>
      <ScrollView contentContainerStyle={styles.container}>
        <Card style={{ width: '100%', marginBottom: 12 }}>
          {uri ? (
            <Card.Cover source={{ uri }} style={styles.preview} />
          ) : (
            <Card.Content>
              <Text>No image to display</Text>
            </Card.Content>
          )}
        </Card>

        <View style={{ width: '100%' }}>
          <Text variant="titleMedium" style={{ marginBottom: 8 }}>
            Recognition
          </Text>

          {labels.length === 0 ? (
            <Text>No labels returned.</Text>
          ) : (
            labels.map((l: any, i: number) => {
              const conf = l.confidence ?? 0;
              const low = conf < THRESHOLD;
              return (
                <Card key={i} style={[styles.labelCard, low ? styles.lowConfidence : null]}>
                  <Card.Content>
                    <View style={styles.labelRow}>
                      <Text variant="titleMedium">{l.label}</Text>
                      {low ? <Chip style={styles.chip} compact>Low Confidence</Chip> : null}
                    </View>
                    <Text variant="bodyMedium">Confidence: {Math.round(conf * 100)}%</Text>
                    {l.details ? (
                      <View style={{ marginTop: 8 }}>
                        {Object.entries(l.details).slice(0, 4).map(([k, v]) => (
                          <Text key={k} variant="bodySmall">{`${k}: ${String(v)}`}</Text>
                        ))}
                      </View>
                    ) : null}
                  </Card.Content>
                  <Card.Actions>
                    <Button onPress={() => {
                      const q = encodeURIComponent(l.label);
                      const url = `https://www.google.com/search?q=${q}`;
                      Linking.openURL(url);
                    }}>Find Parts</Button>
                    <Button onPress={() => { setSnackbarMsg('Saved (placeholder)'); setSnackbarVisible(true); }}>Save</Button>
                    <Button onPress={() => { setSnackbarMsg('Reported (placeholder)'); setSnackbarVisible(true); }}>Report Wrong</Button>
                  </Card.Actions>
                </Card>
              );
            })
          )}
        </View>

        <Snackbar visible={snackbarVisible} onDismiss={() => setSnackbarVisible(false)} duration={3000}>
          {snackbarMsg}
        </Snackbar>
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    padding: 16,
    alignItems: 'center',
  },
  preview: {
    width: '100%',
    height: 320,
  },
  labelCard: {
    width: '100%',
    marginBottom: 12,
  },
  lowConfidence: {
    opacity: 0.6,
  },
  labelRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  chip: {
    marginLeft: 8,
  },
});
