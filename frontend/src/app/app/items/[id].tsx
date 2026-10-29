import { useCallback, useState } from 'react';
import { ScrollView, StyleSheet } from 'react-native';
import { useFocusEffect, useLocalSearchParams } from 'expo-router';

import { colors, spacing } from '@/constants/theme';
import { getItem, toggleItemBorrowable } from '@/api/items';
import type { Item } from '@/types/item';

import {
  CurrentBorrowingCard,
  ItemActions,
  ItemHeader,
  ItemHistory,
  ItemInformationCard,
  ItemLoading,
  ItemNotFound,
  ItemTitleSection,
  TextCard,
} from '@/components/item-details/Index';

export default function ItemDetailsScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();

  const [item, setItem] = useState<Item | null>(null);
  const [loading, setLoading] = useState(true);

  const loadItem = async () => {
    try {
      const data = await getItem(Number(id));
      setItem(data);
    } catch (error) {
      console.error('Failed to load item:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleToggleBorrowable = async () => {
    if (!item) return;

    try {
      await toggleItemBorrowable(item.id);
      await loadItem();
    } catch (error) {
      console.error('Failed to update borrowable status:', error);
    }
  };

  useFocusEffect(
    useCallback(() => {
      loadItem();
    }, [id])
  );

  if (loading) return <ItemLoading />;
  if (!item) return <ItemNotFound />;

  const isBorrowed = item.status === 'borrowed';

  return (
    <ScrollView style={styles.container} contentContainerStyle={styles.content}>
      <ItemHeader />

      <ItemTitleSection item={item} isBorrowed={isBorrowed} />

      <ItemInformationCard item={item} />

      {isBorrowed && item.current_borrowing && (
        <CurrentBorrowingCard borrowing={item.current_borrowing} />
      )}

      {item.description && (
        <TextCard title="DESCRIPTION" text={item.description} />
      )}

      {item.notes && <TextCard title="NOTES" text={item.notes} />}

      <ItemActions
        isBorrowed={isBorrowed}
        isBorrowable={item.is_borrowable}
        onEdit={() => {
          // We'll implement this next
        }}
        onToggleBorrowable={handleToggleBorrowable}
      />

      <ItemHistory histories={item.histories} />
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
});