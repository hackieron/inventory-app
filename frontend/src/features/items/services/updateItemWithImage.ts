import { Platform } from 'react-native';
import type { ImagePickerAsset } from 'expo-image-picker';
import { updateItemWithImage } from '@/api/items';

export async function submitItemUpdate(id: number, payload: {
  name: string;
  serial_number: string | null;
  purchase_date: string | null;
  description: string | null;
  notes: string | null;
  location_id: number | null;
  image: ImagePickerAsset | null;
}) {
  const form = new FormData();
  form.append('name', payload.name);
  form.append('serial_number', payload.serial_number || '');
  form.append('purchase_date', payload.purchase_date || '');
  form.append('description', payload.description || '');
  form.append('notes', payload.notes || '');
  if (payload.location_id !== null) form.append('location_id', String(payload.location_id));

  if (payload.image) {
    if (Platform.OS === 'web') {
      const response = await fetch(payload.image.uri);
      form.append('image', await response.blob(), payload.image.fileName || 'item.jpg');
    } else {
      form.append('image', {
        uri: payload.image.uri,
        name: payload.image.fileName || 'item.jpg',
        type: payload.image.mimeType || 'image/jpeg',
      } as any);
    }
  }

  return updateItemWithImage(id, form);
}
