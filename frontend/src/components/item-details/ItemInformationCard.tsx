import { Image, StyleSheet, Text, View } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { colors, spacing } from '@/constants/theme';
import type { Item } from '@/types/item';
const IMAGE_WIDTH = 96;
const IMAGE_OVERLAP = 24; // how far the image tile sits over the card
const IMAGE_OVERFLOW = 14; // how far it pokes above and below the card
type Props = {
  item: Item;
  imageUri?: string | null; // pass this once you have real images
};
export function ItemInformationCard({ item, imageUri }: Props) {
  return (
    <View style={styles.wrapper}>
      {/* Colored card */}
      <View style={styles.card}>
        <Text style={styles.title} numberOfLines={1}>
          {item.name}
        </Text>
        <Text style={styles.subtitle} numberOfLines={1}>
          {item.location?.name ?? 'No location'}
        </Text>
        <Text style={styles.description} numberOfLines={1}>
          {item.description || 'No description'}
        </Text>
        <View style={styles.statsRow}>
          <Stat label="Serial Number" value={item.serial_number || 'None'} />
          <View style={styles.divider} />
          <Stat label="Purchase Date" value={item.purchase_date || 'None'} />
        </View>
      </View>
      {/* Overlapping image tile */}
      <View style={styles.imageShadow}>
        <View style={styles.imageClip}>
          {imageUri ? (
            <Image
              source={{ uri: imageUri }}
              style={styles.image}
              resizeMode="cover"
            />
          ) : (
            <View style={styles.placeholder}>
              <Ionicons
                name="image-outline"
                size={32}
                color={colors.textMuted}
              />
            </View>
          )}
        </View>
      </View>
    </View>
  );
}
function Stat({ label, value }: { label: string; value: string }) {
  return (
    <View style={styles.stat}>
      <Text style={styles.statLabel}>{label}</Text>
      <Text style={styles.statValue} numberOfLines={1}>
        {value}
      </Text>
    </View>
  );
}
const styles = StyleSheet.create({
  wrapper: {
    marginVertical: IMAGE_OVERFLOW + 2,
  },
  card: {
    marginLeft: IMAGE_WIDTH - IMAGE_OVERLAP,
    paddingVertical: spacing.md,
    paddingRight: spacing.md,
    paddingLeft: IMAGE_OVERLAP + spacing.md,
    minHeight: 120,
    justifyContent: 'center',
    borderRadius: 20,
    backgroundColor: colors.primary,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.2,
    shadowRadius: 10,
    elevation: 6,
  },
  title: {
    fontSize: 18,
    fontWeight: '700',
    color: '#FFFFFF',
  },
  subtitle: {
    marginTop: 2,
    fontSize: 12,
    color: 'rgba(255, 255, 255, 0.75)',
  },
  description: {
    marginTop: spacing.sm,
    fontSize: 12,
    color: 'rgba(255, 255, 255, 0.9)',
  },
  statsRow: {
    flexDirection: 'row',
    marginTop: spacing.md,
  },
  stat: {
    flex: 1,
  },
  statLabel: {
    fontSize: 11,
    color: 'rgba(255, 255, 255, 0.7)',
  },
  statValue: {
    marginTop: 2,
    fontSize: 14,
    fontWeight: '700',
    color: '#FFFFFF',
  },
  divider: {
    width: 1,
    alignSelf: 'stretch',
    marginHorizontal: spacing.md,
    backgroundColor: 'rgba(255, 255, 255, 0.35)',
  },
  imageShadow: {
    position: 'absolute',
    left: 0,
    top: -IMAGE_OVERFLOW,
    bottom: -IMAGE_OVERFLOW,
    width: IMAGE_WIDTH,
    borderRadius: 20,
    backgroundColor: colors.surface,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 8,
  },
  imageClip: {
    flex: 1,
    borderRadius: 20,
    overflow: 'hidden',
  },
  image: {
    width: '100%',
    height: '100%',
  },
  placeholder: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: colors.surface,
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: 20,
  },
});