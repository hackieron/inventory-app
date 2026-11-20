import { useEffect, useRef } from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { router } from 'expo-router';
import { colors } from '@/constants/theme';
import type { Item } from '@/types/item';
import type { ItemsMapProps } from './ItemsMap';
import { getToken } from '@/utils/auth';
import { resolveMediaUrl } from '@/utils/media';
import * as maplibregl from 'maplibre-gl';
import 'maplibre-gl/dist/maplibre-gl.css';

export default function ItemsMap({ items, unmappedItems, region }: ItemsMapProps) {
  const mapContainer = useRef<View>(null);
  useEffect(() => {
    if (!mapContainer.current) return;
    const map = new maplibregl.Map({ container: mapContainer.current as unknown as HTMLElement, style: 'https://tiles.openfreemap.org/styles/liberty', center: [region.longitude, region.latitude], zoom: 12 });
    map.addControl(new maplibregl.NavigationControl(), 'top-right');
    const bounds = new maplibregl.LngLatBounds();
    items.forEach((item: Item) => {
      const longitude = Number(item.location?.longitude); const latitude = Number(item.location?.latitude);
      bounds.extend([longitude, latitude]);
      const marker = document.createElement('button'); marker.type = 'button'; marker.className = 'inventory-map-marker'; marker.title = item.name; marker.innerHTML = item.status === 'borrowed' ? '●' : '◆';
      if (item.image_url) void getToken().then((token) => fetch(resolveMediaUrl(item.image_url || ''), { headers: token ? { Authorization: `Bearer ${token}` } : undefined }).then((response) => response.blob()).then((blob) => { marker.style.backgroundImage = `url(${URL.createObjectURL(blob)})`; marker.innerHTML = ''; }).catch(() => undefined));
      marker.onclick = () => router.push({ pathname: '/app/items/[id]', params: { id: String(item.id) } });
      new maplibregl.Marker({ element: marker }).setLngLat([longitude, latitude]).addTo(map);
    });
    if (items.length > 1) map.fitBounds(bounds, { padding: 60, maxZoom: 15 });
    return () => map.remove();
  }, [items, region]);
  return <View style={styles.container}><View ref={mapContainer} style={styles.map} /><View style={styles.overlay}><Ionicons name="location" size={16} color={colors.primary} /><Text style={styles.overlayText}>{items.length} mapped item{items.length === 1 ? '' : 's'}</Text></View>{unmappedItems > 0 && <View style={styles.notice}><Ionicons name="information-circle-outline" size={17} color={colors.textMuted} /><Text style={styles.noticeText}>{unmappedItems} item{unmappedItems === 1 ? '' : 's'} need coordinates to appear on the map.</Text></View>}</View>;
}

const styles = StyleSheet.create({ container: { flex: 1, marginHorizontal: 20, overflow: 'hidden', borderRadius: 22, backgroundColor: colors.surface }, map: { flex: 1, minHeight: 360 }, overlay: { position: 'absolute', top: 14, left: 14, flexDirection: 'row', alignItems: 'center', gap: 5, paddingHorizontal: 10, paddingVertical: 8, borderRadius: 12, backgroundColor: 'rgba(255,255,255,0.94)' }, overlayText: { color: colors.text, fontSize: 12, fontWeight: '700' }, notice: { flexDirection: 'row', alignItems: 'center', gap: 7, padding: 12, backgroundColor: colors.surface }, noticeText: { flex: 1, color: colors.textMuted, fontSize: 12 } });
