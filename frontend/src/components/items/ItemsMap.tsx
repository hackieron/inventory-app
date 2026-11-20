import { useEffect, useState } from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { Image } from 'expo-image';
import { Ionicons } from '@expo/vector-icons';
import { Camera, Map, Marker, type InitialViewState } from '@maplibre/maplibre-react-native';
import { router } from 'expo-router';
import { colors } from '@/constants/theme';
import type { Item } from '@/types/item';
import { resolveMediaUrl } from '@/utils/media';
import { getToken } from '@/utils/auth';

export interface ItemsMapProps { items: Item[]; unmappedItems: number; region: { latitude: number; longitude: number; latitudeDelta: number; longitudeDelta: number }; }

export default function ItemsMap({ items, unmappedItems, region }: ItemsMapProps) {
  const [token, setToken] = useState<string | null>(null);
  useEffect(() => { void getToken().then(setToken); }, []);
  const initialViewState: InitialViewState = { center: [region.longitude, region.latitude], zoom: Math.max(3, Math.min(16, Math.round(Math.log2(360 / Math.max(region.latitudeDelta, region.longitudeDelta))))) };
  return <View style={styles.container}><Map style={styles.map} mapStyle="https://tiles.openfreemap.org/styles/liberty"><Camera initialViewState={initialViewState} />{items.map((item) => { const imageUri = resolveMediaUrl(item.image_url) || undefined; return <Marker key={item.id} lngLat={[Number(item.location?.longitude), Number(item.location?.latitude)]} onPress={() => router.push({ pathname: '/app/items/[id]', params: { id: String(item.id) } })}><View style={styles.marker}>{imageUri && token ? <Image source={{ uri: imageUri, headers: { Authorization: `Bearer ${token}` } }} style={styles.markerImage} contentFit="cover" /> : <Ionicons name={item.status === 'borrowed' ? 'cube' : 'cube-outline'} size={18} color="#FFFFFF" />}</View></Marker>; })}</Map><View style={styles.overlay}><Ionicons name="location" size={16} color={colors.primary} /><Text style={styles.overlayText}>{items.length} mapped item{items.length === 1 ? '' : 's'}</Text></View>{unmappedItems > 0 && <View style={styles.notice}><Ionicons name="information-circle-outline" size={17} color={colors.textMuted} /><Text style={styles.noticeText}>{unmappedItems} item{unmappedItems === 1 ? '' : 's'} need coordinates to appear on the map.</Text></View>}</View>;
}

const styles = StyleSheet.create({ container: { flex: 1, marginHorizontal: 20, overflow: 'hidden', borderRadius: 22, backgroundColor: colors.surface }, map: { flex: 1, minHeight: 360 }, marker: { width: 38, height: 38, borderRadius: 19, alignItems: 'center', justifyContent: 'center', backgroundColor: colors.primary, borderWidth: 3, borderColor: colors.surface, overflow: 'hidden' }, markerImage: { width: '100%', height: '100%' }, overlay: { position: 'absolute', top: 14, left: 14, flexDirection: 'row', alignItems: 'center', gap: 5, paddingHorizontal: 10, paddingVertical: 8, borderRadius: 12, backgroundColor: 'rgba(255,255,255,0.94)' }, overlayText: { color: colors.text, fontSize: 12, fontWeight: '700' }, notice: { flexDirection: 'row', alignItems: 'center', gap: 7, padding: 12, backgroundColor: colors.surface }, noticeText: { flex: 1, color: colors.textMuted, fontSize: 12 } });
