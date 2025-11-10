import React from 'react';
import { StyleSheet, View } from 'react-native';
import { ThemedText } from '@/components/themed-text';
import { ThemedView } from '@/components/themed-view';
import { Button } from 'react-native-paper';
import { useRouter } from 'expo-router';

export default function HomeScreen() {
  const router = useRouter();

  return (
    <ThemedView style={styles.container}>
      <View style={styles.greetingWrap}>
        <ThemedText style={styles.greetingPre} type="title">
          Hello,
        </ThemedText>
        <ThemedText style={styles.greetingName} type="title">
          Alex
        </ThemedText>
      </View>

      <View style={styles.bottomBar}>
        <Button mode="contained" onPress={() => router.push('/capture')} icon="camera">
          Capture
        </Button>
        <Button onPress={() => router.push('/upload')} icon="image">
          Upload
        </Button>
      </View>
    </ThemedView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 24,
  },
  greetingWrap: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  greetingPre: {
    fontSize: 44,
    color: '#4F70FF',
    marginRight: 8,
  },
  greetingName: {
    fontSize: 44,
    color: '#C96BD6',
  },
  bottomBar: {
    position: 'absolute',
    left: 24,
    right: 24,
    bottom: 40,
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
});
