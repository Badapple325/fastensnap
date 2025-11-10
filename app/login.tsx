import React from 'react';
import { View, StyleSheet } from 'react-native';
import { Button, Text, TextInput } from 'react-native-paper';
import { useRouter } from 'expo-router';

export default function LoginScreen() {
  const router = useRouter();

  const handleLogin = () => {
    // lightweight: navigate to the capture tab immediately
    router.replace('/capture');
  };

  return (
    <View style={styles.container}>
      <Text variant="headlineMedium" style={{ marginBottom: 12 }}>
        Welcome to FastenSnap
      </Text>
      <Text style={{ marginBottom: 24 }}>Sign in to get instant camera access.</Text>
      <TextInput mode="outlined" label="Email or phone" placeholder="you@example.com" style={{ width: '100%', marginBottom: 12 }} />
      <Button mode="contained" onPress={handleLogin} style={{ width: '100%' }}>
        Continue
      </Button>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 24,
    alignItems: 'center',
    justifyContent: 'center',
  },
});
