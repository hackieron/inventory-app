import { useCallback, useState } from 'react';
import {
  ActivityIndicator,
  RefreshControl,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';
import { useFocusEffect } from 'expo-router';
import { requestBorrowing } from '@/api/borrowings';
import { colors, radius, spacing } from '@/constants/theme';
import { discoverItems } from '@/api/items';
import type { Item } from '@/types/item';

export default function BorrowedScreen() {
  const [items, setItems] = useState<Item[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [selectedItem, setSelectedItem] = useState<Item | null>(null);
  const [borrowModalVisible, setBorrowModalVisible] = useState(false);
  const loadItems = async () => {
    try {
      const data = await discoverItems();
      setItems(data);
    } catch (error) {
      console.error('Failed to load discover items:', error);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  useFocusEffect(
    useCallback(() => {
      loadItems();
    }, [])
  );

  const handleRefresh = async () => {
    setRefreshing(true);
    await loadItems();
  };



  const handleBorrow = (item: Item) => {
    setSelectedItem(item);
    setBorrowModalVisible(true);
  };

  if (loading) {
    return (
      <View style={styles.center}>
        <ActivityIndicator
          size="large"
          color={colors.primary}
        />
      </View>
    );
  }

  return (
    <ScrollView
      style={styles.container}
      contentContainerStyle={styles.content}
      refreshControl={
        <RefreshControl
          refreshing={refreshing}
          onRefresh={handleRefresh}
        />
      }
    >
      {/* Header */}
      <View style={styles.header}>
        <Text style={styles.title}>
          Borrow Items
        </Text>

        <Text style={styles.subtitle}>
          Items available to borrow from other users.
        </Text>
      </View>

      {/* Available Items */}
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>AVAILABLE TO BORROW</Text>

        {items.length === 0 ? (
          <View style={styles.emptyCard}>
            <Text style={styles.emptyIcon}>📦</Text>
            <Text style={styles.emptyTitle}>No items available</Text>
            <Text style={styles.emptyText}>
              There are currently no items available for borrowing.
            </Text>
          </View>
        ) : (
          items.map((item) => (
            <View key={item.id} style={styles.itemCard}>
              {/* Item information */}
              <View style={styles.itemHeader}>
                <View style={styles.itemTitleContainer}>
                  <Text style={styles.itemName} numberOfLines={1}>
                    {item.name}
                  </Text>

                  {item.category && (
                    <Text style={styles.category}>{item.category.name}</Text>
                  )}
                </View>

                <View style={styles.availableBadge}>
                  <View style={styles.availableDot} />
                  <Text style={styles.availableText}>Available</Text>
                </View>
              </View>

              {/* Location */}
              {item.location && (
                <View style={styles.locationRow}>
                  <Text style={styles.locationText}>📍 {item.location.name}</Text>
                </View>
              )}

              <View style={styles.divider} />

              {/* Borrow button */}
              <TouchableOpacity
                style={styles.borrowButton}
                onPress={() => handleBorrow(item)}
                activeOpacity={0.75}
              >
                <Text style={styles.borrowButtonText}>
                  Borrow Item
                </Text>
              </TouchableOpacity>
            </View>
          ))
        )}
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.bg,
  },

  content: {
    padding: spacing.lg,
    paddingBottom: spacing.xl * 2,
  },

  center: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: colors.bg,
  },

  header: {
    marginBottom: spacing.xl,
  },

  title: {
    fontSize: 22,
    fontWeight: '700',
    color: colors.text,
    marginBottom: spacing.xs,
  },

  subtitle: {
    fontSize: 14,
    color: colors.textMuted,
  },

  section: {
    marginBottom: spacing.xl,
  },

  sectionTitle: {
    fontSize: 11,
    fontWeight: '700',
    color: colors.textMuted,
    letterSpacing: 0.5,
    marginBottom: spacing.md,
  },

  // --- Item card ---
  itemCard: {
    backgroundColor: colors.surface,
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: radius.lg,
    padding: spacing.lg,
    marginBottom: spacing.md,
    // subtle depth so cards separate from the bg without a heavy border
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.06,
    shadowRadius: 4,
    elevation: 1,
  },

  itemHeader: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    justifyContent: 'space-between',
    gap: spacing.sm,
  },

  itemTitleContainer: {
    flex: 1,
  },

  itemName: {
    fontSize: 17,
    fontWeight: '600',
    color: colors.text,
  },

  category: {
    marginTop: 3,
    fontSize: 13,
    color: colors.textMuted,
  },

  availableBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 5,
    paddingHorizontal: 10,
    paddingVertical: 5,
    borderRadius: 999,
    backgroundColor: 'rgba(80, 200, 120, 0.15)',
  },

  availableDot: {
    width: 6,
    height: 6,
    borderRadius: 3,
    backgroundColor: '#50C878',
  },

  availableText: {
    fontSize: 11,
    fontWeight: '600',
    color: '#3DA860', // ties text color to the badge's green instead of neutral text
  },

  // Location now reads as a lightweight meta row instead of a bordered "field"
  locationRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 5,
    marginTop: spacing.sm,
  },

  locationText: {
    fontSize: 13,
    color: colors.textMuted,
  },

  divider: {
    height: 1,
    backgroundColor: colors.border,
    marginTop: spacing.md,
    marginBottom: spacing.md,
  },

  borrowButton: {
    minHeight: 48, // meets the ~44-48pt minimum comfortable tap target
    borderRadius: radius.md,
    backgroundColor: colors.primary,
    justifyContent: 'center',
    alignItems: 'center',
  },

  borrowButtonText: {
    color: '#FFFFFF',
    fontSize: 15,
    fontWeight: '600',
  },

  // --- Empty state ---
  emptyCard: {
    backgroundColor: colors.surface,
    borderWidth: 1,
    borderColor: colors.border,
    borderStyle: 'dashed', // visually distinct from item cards, reads as "nothing here" rather than an error
    borderRadius: radius.lg,
    paddingVertical: spacing.xl,
    paddingHorizontal: spacing.lg,
    alignItems: 'center',
  },

  emptyIcon: {
    fontSize: 28,
    marginBottom: spacing.sm,
  },

  emptyTitle: {
    fontSize: 15,
    fontWeight: '600',
    color: colors.text,
    marginBottom: spacing.xs,
  },

  emptyText: {
    fontSize: 13,
    color: colors.textMuted,
    textAlign: 'center',
    lineHeight: 20,
    maxWidth: 240, // keeps the line length readable instead of stretching edge-to-edge
  },
});

