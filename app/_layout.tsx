import { DarkTheme, DefaultTheme, ThemeProvider } from '@react-navigation/native';
import { Stack } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import 'react-native-reanimated';

import { useColorScheme } from '@/hooks/use-color-scheme';
import { Provider as PaperProvider, MD3LightTheme as PaperLight, MD3DarkTheme as PaperDark } from 'react-native-paper';
import { SafeAreaProvider } from 'react-native-safe-area-context';

export const unstable_settings = {
  anchor: '(tabs)',
};

export default function RootLayout() {
  const colorScheme = useColorScheme();

  const navigationTheme = colorScheme === 'dark' ? DarkTheme : DefaultTheme;
  const paperTheme = colorScheme === 'dark' ? PaperDark : PaperLight;

  return (
    <SafeAreaProvider>
      <ThemeProvider value={navigationTheme}>
        <PaperProvider theme={paperTheme}>
          <Stack>
            <Stack.Screen name="(tabs)" options={{ headerShown: false }} />
            <Stack.Screen name="modal" options={{ presentation: 'modal', title: 'Modal' }} />
          </Stack>
          <StatusBar style="auto" />
        </PaperProvider>
      </ThemeProvider>
    </SafeAreaProvider>
  );
}
