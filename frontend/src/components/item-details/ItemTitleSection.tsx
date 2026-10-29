import { StyleSheet, Text, View } from 'react-native';

import { colors, spacing } from '@/constants/theme';
import type { Item } from '@/types/item';

type Props = {
  item: Item;
  isBorrowed: boolean;
};

export function ItemTitleSection({ item, isBorrowed }: Props) {
  return (
    <View style={styles.titleSection}>
      <View style={styles.titleRow}>
        <Text style={styles.title}>{item.name}</Text>

        <View style={[styles.statusBadge, isBorrowed && styles.borrowedBadge]}>
          <Text style={styles.statusText}>
            {isBorrowed ? 'Borrowed' : 'Stored'}
          </Text>
        </View>
      </View>

      {item.category && (
        <Text style={styles.category}>{item.category.name}</Text>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  titleSection: {
    marginBottom: spacing.lg,
  },
  titleRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
  },
  title: {
    flex: 1,
    fontSize: 26,
    fontWeight: '700',
    color: colors.text,
  },
  category: {
    marginTop: spacing.xs,
    fontSize: 14,
    color: colors.textMuted,
  },
  statusBadge: {
    paddingHorizontal: 10,
    paddingVertical: 5,
    borderRadius: 999,
    backgroundColor: 'rgba(80, 200, 120, 0.15)',
  },
  borrowedBadge: {
    backgroundColor: 'rgba(255, 180, 80, 0.15)',
  },
  statusText: {
    fontSize: 11,
    fontWeight: '600',
    color: colors.text,
  },
});
