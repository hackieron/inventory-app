import { useCallback, useState } from 'react';
import {
  ActivityIndicator,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';
import {
  router,
  useFocusEffect,
  useLocalSearchParams,
} from 'expo-router';

import { colors, spacing, radius } from '@/constants/theme';

import type { Item } from '@/types/item';
import { getItem, toggleItemBorrowable } from '@/api/items';
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
      console.error(
        'Failed to update borrowable status:',
        error
      );
    }
  };
  useFocusEffect(
    useCallback(() => {
      loadItem();
    }, [id])
  );

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

  if (!item) {
    return (
      <View style={styles.center}>
        <Text style={styles.errorText}>
          Item not found.
        </Text>

        <TouchableOpacity
          style={styles.backButton}
          onPress={() => router.back()}
        >
          <Text style={styles.backButtonText}>
            Go Back
          </Text>
        </TouchableOpacity>
      </View>
    );
  }

  const isBorrowed = item.status === 'borrowed';

  return (
    <ScrollView
      style={styles.container}
      contentContainerStyle={styles.content}
    >
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity
          onPress={() => router.back()}
        >
          <Text style={styles.back}>
            ‹ Back
          </Text>
        </TouchableOpacity>
      </View>

      {/* Item title */}
      <View style={styles.titleSection}>
        <View style={styles.titleRow}>
          <Text style={styles.title}>
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
      </View>

      {/* Item information */}
      <View style={styles.card}>
        <Text style={styles.sectionTitle}>
          ITEM INFORMATION
        </Text>

        <InfoRow
          label="Location"
          value={
            item.location
              ? `📍 ${item.location.name}`
              : 'No location'
          }
        />

        <InfoRow
          label="Serial Number"
          value={item.serial_number || 'None'}
        />

        <InfoRow
          label="Purchase Date"
          value={item.purchase_date || 'None'}
        />
      </View>

      {/* Borrowing */}
      {isBorrowed &&
        item.current_borrowing?.contact && (
          <View style={styles.card}>
            <Text style={styles.sectionTitle}>
              CURRENTLY BORROWED
            </Text>

            <InfoRow
              label="Borrowed By"
              value={
                item.current_borrowing.contact.name
              }
            />

            {item.current_borrowing.expected_return_at && (
              <InfoRow
                label="Expected Return"
                value={
                  item.current_borrowing
                    .expected_return_at
                }
              />
            )}

            <TouchableOpacity
              style={styles.returnButton}
            >
              <Text style={styles.returnButtonText}>
                Return Item
              </Text>
            </TouchableOpacity>
          </View>
        )}

      {/* Description */}
      {item.description && (
        <View style={styles.card}>
          <Text style={styles.sectionTitle}>
            DESCRIPTION
          </Text>

          <Text style={styles.description}>
            {item.description}
          </Text>
        </View>
      )}

      {/* Notes */}
      {item.notes && (
        <View style={styles.card}>
          <Text style={styles.sectionTitle}>
            NOTES
          </Text>

          <Text style={styles.description}>
            {item.notes}
          </Text>
        </View>
      )}

      {/* Actions */}
      <View style={styles.actions}>
        <TouchableOpacity
          style={styles.primaryButton}
          onPress={() => {
            // We'll implement this next
          }}
        >
          <Text style={styles.primaryButtonText}>
            Edit Item
          </Text>
        </TouchableOpacity>

        {!isBorrowed && (
          <TouchableOpacity
            style={styles.secondaryButton}
            onPress={handleToggleBorrowable}
          >
            <Text style={styles.secondaryButtonText}>
              {item.is_borrowable
                ? 'Disable Borrowing'
                : 'Make Available for Borrowing'}
            </Text>
          </TouchableOpacity>
        )}
      </View>

      {/* History */}
      <View style={styles.historySection}>
        <Text style={styles.sectionTitle}>
          HISTORY
        </Text>

        {item.histories?.length ? (
          item.histories.map((history) => (
            <View
              key={history.id}
              style={styles.historyItem}
            >
              <View style={styles.historyDot} />

              <View style={styles.historyContent}>
                <Text style={styles.historyAction}>
                  {history.action}
                </Text>

                {history.description && (
                  <Text style={styles.historyDescription}>
                    {history.description}
                  </Text>
                )}

                {history.old_location ||
                  history.new_location ? (
                  <Text style={styles.historyLocation}>
                    {history.old_location || '—'}
                    {' → '}
                    {history.new_location || '—'}
                  </Text>
                ) : null}

                {history.contact && (
                  <Text style={styles.historyContact}>
                    👤 {history.contact.name}
                  </Text>
                )}

                <Text style={styles.historyDate}>
                  {new Date(
                    history.created_at
                  ).toLocaleString()}
                </Text>
              </View>
            </View>
          ))
        ) : (
          <Text style={styles.noHistory}>
            No history yet.
          </Text>
        )}
      </View>
    </ScrollView>
  );
}

function InfoRow({
  label,
  value,
}: {
  label: string;
  value: string;
}) {
  return (
    <View style={styles.infoRow}>
      <Text style={styles.infoLabel}>
        {label}
      </Text>

      <Text style={styles.infoValue}>
        {value}
      </Text>
    </View>
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
    padding: spacing.lg,
  },

  errorText: {
    color: colors.text,
    fontSize: 16,
    marginBottom: spacing.md,
  },

  header: {
    marginBottom: spacing.lg,
  },

  back: {
    fontSize: 15,
    color: colors.textMuted,
  },

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

  card: {
    backgroundColor: colors.surface,
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: radius.md,
    padding: spacing.md,
    marginBottom: spacing.md,
  },

  sectionTitle: {
    fontSize: 11,
    fontWeight: '700',
    color: colors.textMuted,
    letterSpacing: 0.5,
    marginBottom: spacing.md,
  },

  infoRow: {
    paddingVertical: spacing.sm,
    borderBottomWidth: 1,
    borderBottomColor: colors.border,
  },

  infoLabel: {
    fontSize: 12,
    color: colors.textMuted,
    marginBottom: 3,
  },

  infoValue: {
    fontSize: 15,
    color: colors.text,
  },

  description: {
    fontSize: 14,
    color: colors.text,
    lineHeight: 21,
  },

  actions: {
    gap: spacing.sm,
    marginBottom: spacing.xl,
  },

  primaryButton: {
    minHeight: 50,
    borderRadius: radius.md,
    backgroundColor: colors.primary,
    justifyContent: 'center',
    alignItems: 'center',
  },

  primaryButtonText: {
    color: '#FFFFFF',
    fontSize: 15,
    fontWeight: '600',
  },

  secondaryButton: {
    minHeight: 50,
    borderRadius: radius.md,
    borderWidth: 1,
    borderColor: colors.border,
    backgroundColor: colors.surface,
    justifyContent: 'center',
    alignItems: 'center',
  },

  secondaryButtonText: {
    color: colors.text,
    fontSize: 15,
    fontWeight: '600',
  },

  returnButton: {
    marginTop: spacing.md,
    minHeight: 45,
    borderRadius: radius.md,
    backgroundColor: colors.primary,
    justifyContent: 'center',
    alignItems: 'center',
  },

  returnButtonText: {
    color: '#FFFFFF',
    fontSize: 14,
    fontWeight: '600',
  },

  historySection: {
    marginTop: spacing.sm,
  },

  historyItem: {
    flexDirection: 'row',
    marginBottom: spacing.md,
  },

  historyDot: {
    width: 10,
    height: 10,
    borderRadius: 5,
    backgroundColor: colors.primary,
    marginTop: 5,
    marginRight: spacing.sm,
  },

  historyContent: {
    flex: 1,
  },

  historyAction: {
    fontSize: 14,
    fontWeight: '600',
    color: colors.text,
    textTransform: 'capitalize',
  },

  historyDescription: {
    marginTop: 3,
    fontSize: 13,
    color: colors.textMuted,
  },

  historyLocation: {
    marginTop: 5,
    fontSize: 13,
    color: colors.text,
  },

  historyContact: {
    marginTop: 5,
    fontSize: 13,
    color: colors.textMuted,
  },

  historyDate: {
    marginTop: 5,
    fontSize: 11,
    color: colors.textMuted,
  },

  noHistory: {
    fontSize: 13,
    color: colors.textMuted,
  },

  backButton: {
    paddingHorizontal: spacing.lg,
    paddingVertical: spacing.sm,
    backgroundColor: colors.primary,
    borderRadius: radius.md,
  },

  backButtonText: {
    color: '#FFFFFF',
    fontWeight: '600',
  },
});