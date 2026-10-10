import * as ImagePicker from 'expo-image-picker';
import { Directory, File, Paths } from 'expo-file-system';
import { Platform } from 'react-native';

import { newId } from './ids';

/**
 * Let the user pick a square photo and keep a copy the app owns.
 * On phones the picker's file lives in a cache the system can clear, so it's copied into the
 * app's documents; on the web there's no file system, so a small JPEG data URI is stored.
 * Returns undefined if they cancel.
 */
export async function pickPhoto(): Promise<string | undefined> {
  const web = Platform.OS === 'web';
  const result = await ImagePicker.launchImageLibraryAsync({
    mediaTypes: ['images'],
    allowsEditing: true,
    aspect: [1, 1],
    quality: web ? 0.4 : 0.7,
    base64: web,
  });
  if (result.canceled) return undefined;
  const asset = result.assets[0];
  if (web) return asset.base64 ? `data:image/jpeg;base64,${asset.base64}` : asset.uri;

  const dir = new Directory(Paths.document, 'photos');
  if (!dir.exists) dir.create();
  const dest = new File(dir, `${newId()}.jpg`);
  await new File(asset.uri).copy(dest);
  return dest.uri;
}

/** Best-effort cleanup of a photo the app copied in. */
export function deletePhoto(uri: string | undefined) {
  if (!uri || Platform.OS === 'web' || !uri.startsWith('file:')) return;
  try {
    const file = new File(uri);
    if (file.exists) file.delete();
  } catch (e) {
    console.warn('Could not delete photo', e);
  }
}
