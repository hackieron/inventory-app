import { useEffect, useState } from 'react';
import { Image } from 'expo-image';
import { Ionicons } from '@expo/vector-icons';
import { StyleSheet, Text, View } from 'react-native';

import { colors, spacing } from '@/constants/theme';
import { getToken } from '@/utils/auth';
import type { Item } from '@/types/item';
import { resolveMediaUrl } from '@/utils/media';

type Props = { item: Item; imageUri?: string | null };

export function ItemInformationCard({ item, imageUri }: Props) {
  const [imageToken, setImageToken] = useState<string | null>(null);
  const imageSource = resolveMediaUrl(imageUri || item.image_url);
  const isBorrowed = item.status === 'borrowed';

  useEffect(() => {
    void getToken().then(setImageToken);
  }, []);

  return (
    <View style={styles.card}>
      <View style={styles.hero}>
        {imageSource ? (
          <Image
            source={{ uri: imageSource, headers: imageToken ? { Authorization: `Bearer ${imageToken}` } : undefined }}
            style={StyleSheet.absoluteFill}
            contentFit="cover"
            transition={180}
            cachePolicy="memory-disk"
          />
        ) : (
          <View style={styles.placeholder}>
            <Ionicons name="cube-outline" size={52} color="rgba(255,255,255,0.72)" />
            <Text style={styles.placeholderText}>No image</Text>
          </View>
        )}
        <View style={styles.heroShade} />
        <View style={styles.heroContent}>
          <View style={[styles.statusBadge, isBorrowed && styles.borrowedBadge]}>
            <View style={[styles.statusDot, isBorrowed && styles.borrowedDot]} />
            <Text style={styles.statusText}>{isBorrowed ? 'Borrowed' : 'Stored'}</Text>
          </View>
          <Text style={styles.heroTitle} numberOfLines={2}>{item.name}</Text>
        </View>
      </View>

      <View style={styles.body}>
        <View style={styles.locationRow}>
          <View style={styles.iconCircle}><Ionicons name="location-outline" size={16} color={colors.primary} /></View>
          <View style={styles.locationCopy}>
            <Text style={styles.eyebrow}>CURRENT LOCATION</Text>
            <Text style={styles.location} numberOfLines={1}>{item.location?.name || 'No location assigned'}</Text>
          </View>
        </View>

        <Text style={styles.description} numberOfLines={3}>
          {item.description || 'No description has been added for this item.'}
        </Text>

        <View style={styles.statsGrid}>
          <Stat icon="barcode-outline" label="Serial number" value={item.serial_number || 'Not set'} />
          <Stat icon="calendar-outline" label="Purchased" value={formatDate(item.purchase_date)} />
          <Stat icon="pricetag-outline" label="Category" value={item.category?.name || 'Uncategorized'} />
          <Stat icon="share-social-outline" label="Borrowing" value={item.is_borrowable ? 'Available to lend' : 'Personal use'} />
        </View>
      </View>
    </View>
  );
}

function Stat({ icon, label, value }: { icon: keyof typeof Ionicons.glyphMap; label: string; value: string }) {
  return (
    <View style={styles.stat}>
      <Ionicons name={icon} size={17} color={colors.textMuted} />
      <View style={styles.statCopy}>
        <Text style={styles.statLabel}>{label}</Text>
        <Text style={styles.statValue} numberOfLines={1}>{value}</Text>
      </View>
    </View>
  );
}

function formatDate(value: string | null) {
  if (!value) return 'Not set';
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return value;
  return date.toLocaleDateString(undefined, { month: 'short', day: 'numeric', year: 'numeric' });
}

const styles = StyleSheet.create({
  card: { marginBottom: spacing.lg, overflow: 'hidden', borderRadius: 22, backgroundColor: colors.surface, borderWidth: 1, borderColor: colors.border, shadowColor: '#111111', shadowOffset: { width: 0, height: 8 }, shadowOpacity: 0.1, shadowRadius: 18, elevation: 4 },
  hero: { height: 220, overflow: 'hidden', backgroundColor: '#315c64' },
  heroShade: { position: 'absolute', top: 0, right: 0, bottom: 0, left: 0, backgroundColor: 'rgba(0, 0, 0, 0.18)' },
  heroContent: { flex: 1, justifyContent: 'space-between', padding: spacing.md },
  heroTitle: { maxWidth: '92%', fontSize: 28, lineHeight: 32, fontWeight: '800', letterSpacing: -0.7, color: '#FFFFFF' },
  statusBadge: { alignSelf: 'flex-start', flexDirection: 'row', alignItems: 'center', gap: 6, paddingHorizontal: 10, paddingVertical: 7, borderRadius: 999, backgroundColor: 'rgba(10, 58, 57, 0.78)' },
  borrowedBadge: { backgroundColor: 'rgba(105, 64, 14, 0.82)' },
  statusDot: { width: 7, height: 7, borderRadius: 4, backgroundColor: '#9DE9B4' },
  borrowedDot: { backgroundColor: '#FFD083' },
  statusText: { fontSize: 11, fontWeight: '700', color: '#FFFFFF' },
  placeholder: { flex: 1, alignItems: 'center', justifyContent: 'center' },
  placeholderText: { marginTop: spacing.xs, fontSize: 12, color: 'rgba(255,255,255,0.72)' },
  body: { padding: spacing.md },
  locationRow: { flexDirection: 'row', alignItems: 'center', gap: spacing.sm },
  iconCircle: { width: 34, height: 34, borderRadius: 17, alignItems: 'center', justifyContent: 'center', backgroundColor: '#F0EFEC' },
  locationCopy: { flex: 1, gap: 2 },
  eyebrow: { fontSize: 9, fontWeight: '800', letterSpacing: 1.2, color: colors.textMuted },
  location: { fontSize: 15, fontWeight: '700', color: colors.text },
  description: { marginTop: spacing.md, fontSize: 13, lineHeight: 19, color: colors.textMuted },
  statsGrid: { flexDirection: 'row', flexWrap: 'wrap', marginTop: spacing.md, paddingTop: spacing.md, borderTopWidth: 1, borderTopColor: colors.border, rowGap: spacing.md },
  stat: { width: '50%', flexDirection: 'row', alignItems: 'center', gap: spacing.sm, paddingRight: spacing.sm },
  statCopy: { flex: 1, gap: 2 },
  statLabel: { fontSize: 10, color: colors.textMuted },
  statValue: { fontSize: 12, fontWeight: '700', color: colors.text },
});
