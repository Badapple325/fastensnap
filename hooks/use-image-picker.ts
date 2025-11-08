import * as ImagePicker from 'expo-image-picker';

export async function requestLibraryPermission(): Promise<boolean> {
  const res = await ImagePicker.requestMediaLibraryPermissionsAsync();
  return res.granted ?? false;
}

export async function requestCameraPermission(): Promise<boolean> {
  const res = await ImagePicker.requestCameraPermissionsAsync();
  return res.granted ?? false;
}

export async function pickImageAsync(): Promise<string | null> {
  const result = await ImagePicker.launchImageLibraryAsync({
    mediaTypes: ImagePicker.MediaTypeOptions.Images,
    quality: 0.8,
    allowsEditing: true,
  });

  // Newer expo-image-picker returns { cancelled, assets } shape
  // Return the first asset URI or null when cancelled
  // @ts-ignore
  if (result.canceled || result.cancelled) return null;
  // @ts-ignore
  return result.assets?.[0]?.uri ?? null;
}

export async function takePhotoAsync(): Promise<string | null> {
  const result = await ImagePicker.launchCameraAsync({
    mediaTypes: ImagePicker.MediaTypeOptions.Images,
    quality: 0.8,
    allowsEditing: true,
  });

  // @ts-ignore
  if (result.canceled || result.cancelled) return null;
  // @ts-ignore
  return result.assets?.[0]?.uri ?? null;
}
