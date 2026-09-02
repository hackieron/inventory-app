import { useCallback, useState } from 'react';
import {
  ActivityIndicator,
  FlatList,
  RefreshControl,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';
import { useFocusEffect } from 'expo-router';
import { router } from 'expo-router';
import { colors, spacing, radius } from '@/constants/theme';
import { getItems } from '@/api/items';
import type { Item } from '@/types/item';

export default function ItemsScreen() {
  const [items, setItems] = useState<Item[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  const loadItems = async () => {
    try {
      const data = await getItems();
      setItems(data);
    } catch (error) {
      console.error('Failed to load items:', error);
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

  const handleRefresh = () => {
    setRefreshing(true);
    loadItems();
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
    <View style={styles.container}>
      <View style={styles.header}>
        <View>
          <Text style={styles.title}>My Items</Text>

          <Text style={styles.subtitle}>
            Everything you own, in one place.
          </Text>
        </View>

        <TouchableOpacity
          onPress={() => router.push('/app/items/create')}
        >
          <Text>+</Text>
        </TouchableOpacity>
      </View>

      <FlatList
        data={items}
        keyExtractor={(item) => item.id.toString()}
        refreshControl={
          <RefreshControl
            refreshing={refreshing}
            onRefresh={handleRefresh}
          />
        }
        contentContainerStyle={[
          styles.list,
          items.length === 0 && styles.emptyList,
        ]}
        renderItem={({ item }) => (
          <ItemCard item={item} />
        )}
        ListEmptyComponent={
          <View style={styles.empty}>
            <Text style={styles.emptyTitle}>
              No items yet
            </Text>

            <Text style={styles.emptyText}>
              Add your first item to start tracking your inventory.
            </Text>
          </View>
        }
      />
    </View>
  );
}

function ItemCard({ item }: { item: Item }) {
  const isBorrowed = item.status === 'borrowed';

  return (
    <TouchableOpacity
      style={styles.card}
      activeOpacity={0.7}
      onPress={() =>
        router.push({
          pathname: '/app/items/[id]',
          params: {
            id: item.id.toString(),
          },
        })
      }
    >
      <View style={styles.cardHeader}>
        <Text style={styles.itemName} numberOfLines={1}>
          {item.name}
        </Text>

        <View
          style={[
            styles.statusBadge,
            isBorrowed && styles.borrowedBadge,
          ]}
        >
          <Text style={styles.statusText}>
            {isBorrowed ? 'Borrowed' : 'Stored'}
          </Text>
        </View>
      </View>

      {item.category && (
        <Text style={styles.category}>
          {item.category.name}
        </Text>
      )}

      {item.location && (
        <Text style={styles.location}>
          📍 {item.location.name}
        </Text>
      )}

      {isBorrowed && item.current_borrowing?.contact && (
        <Text style={styles.borrowedBy}>
          👤 {item.current_borrowing.contact.name}
        </Text>
      )}
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: spacing.lg,
    backgroundColor: colors.bg,
  },

  center: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: colors.bg,
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
    marginBottom: spacing.lg,
  },

  list: {
    paddingBottom: spacing.xl,
  },

  emptyList: {
    flexGrow: 1,
  },

  card: {
    backgroundColor: colors.surface,
    borderRadius: 12,
    padding: spacing.md,
    marginBottom: spacing.sm,
    borderWidth: 1,
    borderColor: colors.border,
  },

  cardHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: spacing.sm,
  },

  itemName: {
    flex: 1,
    fontSize: 16,
    fontWeight: '600',
    color: colors.text,
  },

  category: {
    marginTop: 4,
    fontSize: 13,
    color: colors.textMuted,
  },

  location: {
    marginTop: spacing.sm,
    fontSize: 13,
    color: colors.text,
  },

  borrowedBy: {
    marginTop: 6,
    fontSize: 13,
    color: colors.textMuted,
  },

  statusBadge: {
    paddingHorizontal: 8,
    paddingVertical: 4,
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

  empty: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: spacing.xl,
  },

  emptyTitle: {
    fontSize: 17,
    fontWeight: '600',
    color: colors.text,
    marginBottom: spacing.xs,
  },

  emptyText: {
    fontSize: 14,
    color: colors.textMuted,
    textAlign: 'center',
    lineHeight: 20,
  },

  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: spacing.lg,
  },

  addButton: {
    width: 42,
    height: 42,
    borderRadius: radius.md,
    backgroundColor: colors.primary,
    alignItems: 'center',
    justifyContent: 'center',
  },

  addButtonText: {
    color: '#FFFFFF',
    fontSize: 28,
    fontWeight: '400',
    lineHeight: 30,
  },
});