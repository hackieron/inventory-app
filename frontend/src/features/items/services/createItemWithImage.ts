
import { Platform } from 'react-native';
import type { ImagePickerAsset } from 'expo-image-picker';
import api from '@/api/axios';

interface ItemPayload {
  name: string;
  serial_number: string | null;
  purchase_date: string | null;
  description: string | null;
  notes: string | null;
  image: ImagePickerAsset | null;
  location_id: number | null;
}

export async function createItemWithImage(
  payload: ItemPayload
) {
  const form = new FormData();

  // Required field
  form.append('name', payload.name);

  // Optional fields
  for (const key of [
    'serial_number',
    'purchase_date',
    'description',
    'notes',
  ] as const) {
    if (payload[key] !== null) {
      form.append(key, payload[key]!);
    }
  }

  // Item location
  if (payload.location_id !== null) {
    form.append(
      'location_id',
      String(payload.location_id)
    );
  }

  // Item image
  if (payload.image) {
    const asset = payload.image;

    if (Platform.OS === 'web') {
      const response = await fetch(asset.uri);
      const blob = await response.blob();

      form.append(
        'image',
        blob,
        asset.fileName || 'item.jpg'
      );
    } else {
      form.append('image', {
        uri: asset.uri,
        name: asset.fileName || 'item.jpg',
        type: asset.mimeType || 'image/jpeg',
      } as any);
    }
  }

  // Send multipart form data to Laravel
  return api.post('/items', form, {
    headers: {
      'Content-Type': undefined,
    },
  });
}
