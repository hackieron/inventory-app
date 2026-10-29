import { StyleSheet, Text, TouchableOpacity } from 'react-native';

import { colors, spacing, radius } from '@/constants/theme';
import type { Item } from '@/types/item';
import { Card } from './Card';
import { InfoRow } from './InfoRow';

type Borrowing = NonNullable<Item['current_borrowing']>;

type Props = {
  borrowing: Borrowing;
  onReturn?: () => void;
};

export function CurrentBorrowingCard({ borrowing, onReturn }: Props) {
  if (!borrowing.contact) return null;

  return (
    <Card title="CURRENTLY BORROWED">
      <InfoRow label="Borrowed By" value={borrowing.contact.name} />

      {borrowing.expected_return_at && (
        <InfoRow
          label="Expected Return"
          value={borrowing.expected_return_at}
        />
      )}

      <TouchableOpacity style={styles.returnButton} onPress={onReturn}>
        <Text style={styles.returnButtonText}>Return Item</Text>
      </TouchableOpacity>
    </Card>
  );
}

const styles = StyleSheet.create({
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
});
