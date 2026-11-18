import { useState } from 'react';
import { Alert, Platform } from 'react-native';
import Toast from 'react-native-toast-message';
import { submitItemUpdate } from '../services/updateItemWithImage';
import type { CreateItemValues } from '../types';
import type { Item } from '@/types/item';

const notify = (message: string) => Platform.OS === 'web' ? window.alert(message) : Alert.alert('Unable to update item', message);

export function useEditItem(item: Item) {
  const [values, setValues] = useState<CreateItemValues>({
    name: item.name,
    serialNumber: item.serial_number || '',
    purchaseDate: item.purchase_date ? item.purchase_date.slice(0, 10) : '',
    description: item.description || '',
    notes: item.notes || '',
    image: null,
    address: item.location?.address || '',
    locationName: item.location?.name || '',
    storageDetails: item.location?.description || '',
    coordinates: item.location?.latitude != null && item.location?.longitude != null
      ? {
        latitude: Number(item.location.latitude),
        longitude: Number(item.location.longitude),
      }
      : null,
  });
  const [loading, setLoading] = useState(false);
  const setField = <K extends keyof CreateItemValues>(key: K, value: CreateItemValues[K]) => setValues((previous) => ({ ...previous, [key]: value }));
  const submit = async () => {
    if (!values.name.trim()) { notify('Please enter an item name.'); return false; }
    try {
      setLoading(true);
      await submitItemUpdate(item.id, {
        name: values.name.trim(), serial_number: values.serialNumber.trim() || null,
        purchase_date: values.purchaseDate || null, description: values.description.trim() || null,
        notes: values.notes.trim() || null, location_id: item.location_id, image: values.image,
      });
      Toast.show({ type: 'success', text1: 'Item updated', text2: 'Your changes have been saved.' });
      return true;
    } catch (error: any) {
      const message = error?.response?.data?.errors ? Object.values(error.response.data.errors).flat().join('\n') : error?.response?.data?.message || 'Unable to update item.';
      notify(message); return false;
    } finally { setLoading(false); }
  };
  return { values, setField, loading, submit };
}
