import { Image } from 'expo-image';
import { Ionicons } from '@expo/vector-icons';
import { Pressable, StyleSheet, Text, View } from 'react-native';
import { colors, radius, spacing } from '@/constants/theme';
import type { Item } from '@/types/item';

type Props = { item: Item; onRequest: () => void };

export default function BorrowableItemCard({ item, onRequest }: Props) {
  return <View style={styles.card}>
    <View style={styles.hero}>
      {item.image_url ? <Image source={{ uri: item.image_url }} style={styles.image} contentFit="cover" transition={180} /> : <View style={styles.imageFallback}><Ionicons name="cube-outline" size={42} color="rgba(255,255,255,0.78)" /></View>}
      <View style={styles.heroOverlay} />
      <View style={styles.available}><View style={styles.dot} /><Text style={styles.availableText}>Available to borrow</Text></View>
      <View style={styles.heroCopy}><Text style={styles.name} numberOfLines={2}>{item.name}</Text>{!!item.category && <Text style={styles.category}>{item.category.name}</Text>}</View>
    </View>
    <View style={styles.body}>
      <View style={styles.infoGrid}>
        <Info icon="location-outline" label="Location" value={item.location?.name || 'Not specified'} />
        <Info icon="barcode-outline" label="Serial number" value={item.serial_number || 'Not specified'} />
      </View>
      {!!item.description && <Text style={styles.description} numberOfLines={3}>{item.description}</Text>}
      {!!item.notes && <View style={styles.note}><Ionicons name="information-circle-outline" size={16} color={colors.textMuted} /><Text style={styles.noteText} numberOfLines={2}>{item.notes}</Text></View>}
      <Pressable accessibilityRole="button" accessibilityLabel={`Request to borrow ${item.name}`} style={styles.button} onPress={onRequest}><Text style={styles.buttonText}>Request to borrow</Text><Ionicons name="arrow-forward" size={17} color="#fff" /></Pressable>
    </View>
  </View>;
}

function Info({ icon, label, value }: { icon: keyof typeof Ionicons.glyphMap; label: string; value: string }) { return <View style={styles.info}><Ionicons name={icon} size={16} color={colors.textMuted} /><View style={styles.infoCopy}><Text style={styles.infoLabel}>{label}</Text><Text style={styles.infoValue} numberOfLines={1}>{value}</Text></View></View>; }

const styles = StyleSheet.create({
  card: { backgroundColor: colors.surface, borderWidth: 1, borderColor: colors.border, borderRadius: radius.lg, overflow: 'hidden', marginBottom: spacing.md },
  hero: { height: 190, backgroundColor: '#334155', position: 'relative' },
  image: { ...StyleSheet.absoluteFill, width: '100%', height: '100%' },
  imageFallback: { ...StyleSheet.absoluteFill, alignItems: 'center', justifyContent: 'center', backgroundColor: '#334155' },
  heroOverlay: { ...StyleSheet.absoluteFill, backgroundColor: 'rgba(10,15,25,0.36)' },
  available: { position: 'absolute', top: spacing.md, left: spacing.md, flexDirection: 'row', alignItems: 'center', gap: 6, backgroundColor: 'rgba(255,255,255,0.92)', borderRadius: 999, paddingHorizontal: 10, paddingVertical: 6 },
  dot: { width: 7, height: 7, borderRadius: 4, backgroundColor: '#35A866' },
  availableText: { color: '#256B43', fontSize: 11, fontWeight: '700' },
  heroCopy: { position: 'absolute', left: spacing.md, right: spacing.md, bottom: spacing.md },
  name: { color: '#fff', fontSize: 22, lineHeight: 27, fontWeight: '800' },
  category: { color: 'rgba(255,255,255,0.82)', fontSize: 13, marginTop: 4 },
  body: { padding: spacing.md },
  infoGrid: { flexDirection: 'row', gap: spacing.md },
  info: { flex: 1, flexDirection: 'row', alignItems: 'center', gap: 7, minWidth: 0 },
  infoCopy: { flex: 1 },
  infoLabel: { color: colors.textMuted, fontSize: 10, fontWeight: '700', textTransform: 'uppercase', letterSpacing: 0.4 },
  infoValue: { color: colors.text, fontSize: 13, marginTop: 2 },
  description: { color: colors.textMuted, fontSize: 13, lineHeight: 19, marginTop: spacing.md },
  note: { flexDirection: 'row', gap: spacing.sm, alignItems: 'flex-start', backgroundColor: colors.bg, borderRadius: radius.sm, padding: spacing.sm, marginTop: spacing.md },
  noteText: { flex: 1, color: colors.textMuted, fontSize: 12, lineHeight: 17 },
  button: { minHeight: 48, marginTop: spacing.md, borderRadius: radius.md, backgroundColor: colors.primary, flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: spacing.sm },
  buttonText: { color: '#fff', fontSize: 14, fontWeight: '700' },
});
