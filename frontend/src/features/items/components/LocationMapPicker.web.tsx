import { useEffect, useRef } from 'react';
import { Pressable, StyleSheet, Text, View } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { colors } from '@/constants/theme';
import * as maplibregl from 'maplibre-gl';
import 'maplibre-gl/dist/maplibre-gl.css';
import type { MapCoordinates } from './LocationMapPicker';
import { getToken } from '@/utils/auth';
import { resolveMediaUrl } from '@/utils/media';

type Props = { value: MapCoordinates | null; address: string; onChange: (coordinates: MapCoordinates) => void; onAddressChange: (address: string) => void; imageUri?: string | null };

export default function LocationMapPicker({ value, address, onChange, imageUri }: Props) {
  const container = useRef<View>(null); const mapRef = useRef<maplibregl.Map | null>(null); const markerRef = useRef<maplibregl.Marker | null>(null);
  useEffect(() => { if (!container.current) return; const center: [number, number] = value ? [value.longitude, value.latitude] : [120.9842, 14.5995]; const map = new maplibregl.Map({ container: container.current as unknown as HTMLElement, style: 'https://tiles.openfreemap.org/styles/liberty', center, zoom: 14 }); mapRef.current = map; const select = (longitude: number, latitude: number) => { onChange({ latitude, longitude }); markerRef.current?.remove(); const element = document.createElement('div'); element.className = 'inventory-map-marker'; if (imageUri) void getToken().then((token) => fetch(resolveMediaUrl(imageUri || ''), { headers: token ? { Authorization: `Bearer ${token}` } : undefined }).then((response) => response.blob()).then((blob) => { element.style.backgroundImage = `url(${URL.createObjectURL(blob)})`; element.textContent = ''; }).catch(() => undefined)); markerRef.current = new maplibregl.Marker({ element, draggable: true }).setLngLat([longitude, latitude]).addTo(map); markerRef.current.on('dragend', () => { const position = markerRef.current?.getLngLat(); if (position) onChange({ latitude: position.lat, longitude: position.lng }); }); }; map.on('click', (event: maplibregl.MapMouseEvent) => select(event.lngLat.lng, event.lngLat.lat)); if (value) select(value.longitude, value.latitude); return () => { markerRef.current?.remove(); map.remove(); mapRef.current = null; }; }, [imageUri, onChange, value]);
  return <View style={styles.container}><View ref={container} style={styles.map} /><Pressable style={styles.locationButton} onPress={() => navigator.geolocation.getCurrentPosition((position) => mapRef.current?.flyTo({ center: [position.coords.longitude, position.coords.latitude], zoom: 15 }))}><Ionicons name="locate-outline" size={21} color={colors.primary} /></Pressable><View style={styles.footer}><Ionicons name="location-outline" size={17} color={colors.primary} /><Text style={styles.coordinates}>{address || (value ? `${value.latitude}, ${value.longitude}` : 'Click the map to select a location')}</Text></View></View>;
}

const styles = StyleSheet.create({ container: { borderRadius: 18, overflow: 'hidden', borderWidth: 1, borderColor: colors.border, backgroundColor: colors.surface }, map: { width: '100%', height: 240 }, locationButton: { position: 'absolute', right: 12, top: 12, width: 44, height: 44, borderRadius: 14, backgroundColor: colors.surface, alignItems: 'center', justifyContent: 'center', elevation: 4 }, footer: { flexDirection: 'row', alignItems: 'center', padding: 13, gap: 8 }, coordinates: { flex: 1, fontSize: 12, color: colors.textMuted } });
