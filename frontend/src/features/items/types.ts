import type { ImagePickerAsset } from 'expo-image-picker';

export interface CreateItemValues {
  name: string;
  serialNumber: string;
  purchaseDate: string;
  description: string;
  notes: string;
  image: ImagePickerAsset | null;
  address: string;
  locationName: string;
  storageDetails: string;
  coordinates: {
    latitude: number;
    longitude: number;
  } | null;
}

export const initialCreateItemValues: CreateItemValues = {
  name: '',
  serialNumber: '',
  purchaseDate: '',
  description: '',
  notes: '',
  image: null,
  locationName: '',
  storageDetails: '',
  address: '',
  coordinates: null,
};