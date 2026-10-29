import { StyleSheet, Text, View } from 'react-native';

import { colors, spacing } from '@/constants/theme';
import { HistoryEntry, type History } from './HistoryEntry';
import { SectionTitle } from './SectionTitle';

export function ItemHistory({ histories }: { histories?: History[] | null }) {
  return (
    <View style={styles.historySection}>
      <SectionTitle>HISTORY</SectionTitle>

      {histories?.length ? (
        histories.map((history, index) => (
          <HistoryEntry
            key={history.id}
            history={history}
            isFirst={index === 0}
            isLast={index === histories.length - 1}
          />
        ))
      ) : (
        <Text style={styles.noHistory}>No history yet.</Text>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  historySection: {
    marginTop: spacing.sm,
  },
  noHistory: {
    fontSize: 13,
    color: colors.textMuted,
  },
});