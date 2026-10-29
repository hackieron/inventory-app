
import { useState } from 'react';
import { Alert, Platform } from 'react-native';
import Toast from 'react-native-toast-message';

import { createLocation } from '@/api/locations';
import { createItemWithImage } from '../services/createItemWithImage';
import {
  initialCreateItemValues,
  type CreateItemValues,
} from '../types';

function notifyError(message: string) {
  if (Platform.OS === 'web') {
    window.alert(message);
  } else {
    Alert.alert('Unable to create item', message);
  }
}

function isValidDate(value: string): boolean {
  if (!/^\d{4}-\d{2}-\d{2}$/.test(value)) return false;

  const [year, month, day] = value.split('-').map(Number);
  const parsed = new Date(Date.UTC(year, month - 1, day));

  return (
    parsed.getUTCFullYear() === year &&
    parsed.getUTCMonth() + 1 === month &&
    parsed.getUTCDate() === day
  );
}

export function useCreateItem() {
  const [values, setValues] = useState<CreateItemValues>(
    initialCreateItemValues
  );

  const [loading, setLoading] = useState(false);

  const setField = <K extends keyof CreateItemValues>(
    key: K,
    value: CreateItemValues[K]
  ) => {
    setValues((previous) => ({
      ...previous,
      [key]: value,
    }));
  };

  const submit = async (): Promise<boolean> => {
    if (loading) return false;

    // Validate item name
    if (!values.name.trim()) {
      notifyError('Please enter an item name.');
      return false;
    }

    // Validate purchase date
    if (
      values.purchaseDate &&
      !isValidDate(values.purchaseDate)
    ) {
      notifyError('Please select a valid purchase date.');
      return false;
    }

    if (values.purchaseDate) {
      const today = new Date();

      const localToday = [
        today.getFullYear(),
        String(today.getMonth() + 1).padStart(2, '0'),
        String(today.getDate()).padStart(2, '0'),
      ].join('-');

      if (values.purchaseDate > localToday) {
        notifyError('Purchase date cannot be in the future.');
        return false;
      }
    }

    // Validate optional location
    // Validate optional location
    const locationName = (values.locationName ?? '').trim();
    const storageDetails = (values.storageDetails ?? '').trim();

    const hasLocation =
      Boolean(locationName) ||
      Boolean(storageDetails) ||
      values.coordinates != null;

    // if (hasLocation && !locationName) {
    //   notifyError('Please enter a location name.');
    //   return false;
    // }

    try {
      setLoading(true);

      let locationId: number | null = null;

      if (hasLocation) {
        const location = await createLocation({
          name: locationName,
          description: storageDetails || null,
          address: values.address.trim() || null,
          latitude: values.coordinates?.latitude ?? null,
          longitude: values.coordinates?.longitude ?? null,
        });

        locationId = location.id;
      }

      // STEP 2: Create item with image and location
      await createItemWithImage({
        name: values.name.trim(),
        serial_number:
          values.serialNumber.trim() || null,
        purchase_date: values.purchaseDate || null,
        description:
          values.description.trim() || null,
        notes: values.notes.trim() || null,
        image: values.image,
        location_id: locationId,
      });

      Toast.show({
        type: 'success',
        text1: 'Item created',
        text2:
          'Your item has been added to your inventory.',
      });

      return true;
    } catch (error: any) {
      console.error('Create item error:', error);

      const message =
        error?.response?.data?.errors
          ? Object.values(
            error.response.data.errors
          ).flat().join('\n')
          : error?.response?.data?.message ||
          'Unable to create item. Please try again.';

      notifyError(message);
      return false;
    } finally {
      setLoading(false);
    }
  };

  return {
    values,
    setField,
    loading,
    submit,
  };
}
