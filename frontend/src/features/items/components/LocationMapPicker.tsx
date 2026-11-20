import { useEffect, useRef, useState } from 'react';
import {
  ActivityIndicator,
  Alert,
  Pressable,
  StyleSheet,
  Text,
  View,
} from 'react-native';
import { Camera, Map, Marker, type CameraRef, type InitialViewState } from '@maplibre/maplibre-react-native';
import * as Location from 'expo-location';
import { Ionicons } from '@expo/vector-icons';
import { colors } from '@/constants/theme';
import { Image } from 'expo-image';
import { getToken } from '@/utils/auth';
import { resolveMediaUrl } from '@/utils/media';

export type MapCoordinates = { latitude: number; longitude: number };

type Props = {
  value: MapCoordinates | null;
  address: string;
  onChange: (coordinates: MapCoordinates) => void;
  onAddressChange: (address: string) => void;
  imageUri?: string | null;
};

const INITIAL_REGION: InitialViewState = {
  zoom: 14,
  center: [120.9842, 14.5995],
};

const initialViewState = (value: MapCoordinates | null): InitialViewState => value ? {
  zoom: 14,
  center: [value.longitude, value.latitude],
} : INITIAL_REGION;

export default function LocationMapPicker({ value, address, onChange, onAddressChange, imageUri }: Props) {
  const [loading, setLoading] = useState(false);
  const [token, setToken] = useState<string | null>(null);
  const cameraRef = useRef<CameraRef>(null);
  useEffect(() => { void getToken().then(setToken); }, []);

  const selectLocation = async (coordinates: MapCoordinates) => {
    onChange(coordinates);
    onAddressChange('');
    try {
      const results = await Location.reverseGeocodeAsync(coordinates);
      if (results.length > 0) {
        const place = results[0];
        onAddressChange([
          place.streetNumber, place.street, place.district, place.city,
          place.region, place.postalCode, place.country,
        ].filter(Boolean).join(', '));
      }
    } catch (error) {
      console.error('Reverse geocoding failed:', error);
    }
  };

  const useCurrentLocation = async () => {
    try {
      setLoading(true);
      const { status } = await Location.requestForegroundPermissionsAsync();
      if (status !== 'granted') {
        Alert.alert('Permission required', 'Allow location access to use your current position.');
        return;
      }
      const position = await Location.getCurrentPositionAsync({ accuracy: Location.Accuracy.High });
      const coordinates = { latitude: position.coords.latitude, longitude: position.coords.longitude };
      await selectLocation(coordinates);
      cameraRef.current?.flyTo({ center: [coordinates.longitude, coordinates.latitude], duration: 500 });
    } catch {
      Alert.alert('Location unavailable', 'Unable to retrieve your current location.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <View style={styles.container}>
      <Map style={styles.map} mapStyle="https://tiles.openfreemap.org/styles/liberty" onPress={(event) => void selectLocation({ latitude: event.nativeEvent.lngLat[1], longitude: event.nativeEvent.lngLat[0] })}>
        <Camera ref={cameraRef} initialViewState={initialViewState(value)} />
        {value && <Marker lngLat={[value.longitude, value.latitude]}><View style={styles.marker}>{imageUri ? <Image source={{ uri: resolveMediaUrl(imageUri || ''), headers: token ? { Authorization: `Bearer ${token}` } : undefined }} style={styles.markerImage} contentFit="cover" /> : <Ionicons name="location" size={18} color="#FFFFFF" />}</View></Marker>}
      </Map>
      <Pressable style={styles.locationButton} onPress={useCurrentLocation} disabled={loading}>
        {loading ? <ActivityIndicator color={colors.primary} /> : <Ionicons name="locate-outline" size={21} color={colors.primary} />}
      </Pressable>
      <View style={styles.footer}>
        <Ionicons name="location-outline" size={17} color={colors.primary} />
        <Text style={styles.coordinates}>{address || 'Select a location on the map'}</Text>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { borderRadius: 18, overflow: 'hidden', borderWidth: 1, borderColor: colors.border, backgroundColor: colors.surface },
  map: { width: '100%', height: 240 },
  locationButton: { position: 'absolute', right: 12, top: 12, width: 44, height: 44, borderRadius: 14, backgroundColor: colors.surface, alignItems: 'center', justifyContent: 'center', elevation: 4 },
  footer: { flexDirection: 'row', alignItems: 'center', padding: 13, gap: 8 },
  coordinates: { flex: 1, fontSize: 12, color: colors.textMuted },
  marker: { width: 36, height: 36, borderRadius: 18, alignItems: 'center', justifyContent: 'center', backgroundColor: colors.primary, borderWidth: 3, borderColor: colors.surface, overflow: 'hidden' }, markerImage: { width: '100%', height: '100%' },
});
