import { Platform, StyleSheet, Text, View } from 'react-native';

import { colors, spacing, radius } from '@/constants/theme';
import type { Item } from '@/types/item';

export type History = NonNullable<Item['histories']>[number];

/* ---------- Constants ---------- */

const RAIL_WIDTH = 24;
const DOT_SIZE = 14;
const DOT_TOP = spacing.md + 2; // lines the dot up with the card's title row
const DOT_CENTER = DOT_TOP + DOT_SIZE / 2;
const LINE_WIDTH = 2;

const MONO = Platform.select({ ios: 'Menlo', default: 'monospace' });

/* ---------- Main component ---------- */

type Props = {
  history: History;
  isFirst?: boolean;
  isLast?: boolean;
};

export function HistoryEntry({ history, isFirst, isLast }: Props) {
  const hasLocationChange = !!(history.old_location || history.new_location);

  return (
    <View style={styles.entry}>
      <TimelineRail isFirst={isFirst} isLast={isLast} />

      <View style={[styles.cardWrapper, !isLast && styles.cardWrapperSpacing]}>
        <View style={[styles.card, isFirst && styles.cardLatest]}>
          <CardHeader
            action={history.action}
            id={history.id}
            isLatest={isFirst}
          />

          {history.description && (
            <Text style={styles.description}>{history.description}</Text>
          )}

          {hasLocationChange && (
            <LocationDiff
              from={history.old_location}
              to={history.new_location}
            />
          )}

          <CardFooter
            contactName={history.contact?.name}
            createdAt={history.created_at}
          />
        </View>
      </View>
    </View>
  );
}

/* ---------- Sub-components ---------- */

function TimelineRail({
  isFirst,
  isLast,
}: {
  isFirst?: boolean;
  isLast?: boolean;
}) {
  return (
    <View style={styles.rail}>
      {!(isFirst && isLast) && (
        <View
          style={[
            styles.line,
            isFirst && { top: DOT_CENTER },
            isLast && { bottom: undefined, height: DOT_CENTER },
          ]}
        />
      )}
      <View style={[styles.dot, isFirst && styles.dotLatest]} />
    </View>
  );
}

function CardHeader({
  action,
  id,
  isLatest,
}: {
  action: string;
  id: number | string;
  isLatest?: boolean;
}) {
  return (
    <View style={styles.header}>
      <View style={styles.headerLeft}>
        <Text style={styles.action} numberOfLines={1}>
          {action}
        </Text>

        {isLatest && (
          <View style={styles.latestBadge}>
            <Text style={styles.latestBadgeText}>LATEST</Text>
          </View>
        )}
      </View>

      <Text style={styles.hash}>#{id}</Text>
    </View>
  );
}

function LocationDiff({
  from,
  to,
}: {
  from?: string | null;
  to?: string | null;
}) {
  return (
    <View style={styles.diff}>
      <View style={[styles.diffRow, styles.diffRemoved]}>
        <Text style={[styles.diffSign, styles.diffRemovedText]}>−</Text>
        <Text style={[styles.diffValue, styles.diffRemovedText]}>
          {from || '—'}
        </Text>
      </View>

      <View style={[styles.diffRow, styles.diffAdded]}>
        <Text style={[styles.diffSign, styles.diffAddedText]}>+</Text>
        <Text style={[styles.diffValue, styles.diffAddedText]}>
          {to || '—'}
        </Text>
      </View>
    </View>
  );
}

function CardFooter({
  contactName,
  createdAt,
}: {
  contactName?: string;
  createdAt: string;
}) {
  const date = new Date(createdAt).toLocaleString(undefined, {
    month: 'short',
    day: 'numeric',
    year: 'numeric',
    hour: 'numeric',
    minute: '2-digit',
  });

  return (
    <View style={styles.footer}>
      {contactName ? (
        <View style={styles.contact}>
          <View style={styles.avatar}>
            <Text style={styles.avatarText}>
              {contactName.charAt(0).toUpperCase()}
            </Text>
          </View>
          <Text style={styles.contactName} numberOfLines={1}>
            {contactName}
          </Text>
        </View>
      ) : null}

      <Text style={styles.date}>{date}</Text>
    </View>
  );
}

/* ---------- Styles ---------- */

const styles = StyleSheet.create({
  entry: {
    flexDirection: 'row',
  },

  /* Timeline rail */
  rail: {
    width: RAIL_WIDTH,
    alignItems: 'center',
  },
  line: {
    position: 'absolute',
    top: 0,
    bottom: 0,
    left: (RAIL_WIDTH - LINE_WIDTH) / 2,
    width: LINE_WIDTH,
    backgroundColor: colors.border,
  },
  dot: {
    position: 'absolute',
    top: DOT_TOP,
    width: DOT_SIZE,
    height: DOT_SIZE,
    borderRadius: DOT_SIZE / 2,
    borderWidth: 2,
    borderColor: colors.primary,
    backgroundColor: colors.bg, // hides the line behind the dot
  },
  dotLatest: {
    backgroundColor: colors.primary,
  },

  /* Card */
  cardWrapper: {
    flex: 1,
    marginLeft: spacing.sm,
  },
  cardWrapperSpacing: {
    paddingBottom: spacing.md, // keeps the rail line continuous between cards
  },
  card: {
    padding: spacing.md,
    borderRadius: radius.md,
    borderWidth: 1,
    borderColor: colors.border,
    backgroundColor: colors.surface,
  },
  cardLatest: {
    borderColor: colors.primary,
  },

  /* Header */
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: spacing.sm,
  },
  headerLeft: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
  },
  action: {
    flexShrink: 1,
    fontSize: 14,
    fontWeight: '700',
    color: colors.text,
    textTransform: 'capitalize',
  },
  latestBadge: {
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 999,
    backgroundColor: colors.primary,
  },
  latestBadgeText: {
    fontSize: 9,
    fontWeight: '700',
    letterSpacing: 0.5,
    color: '#FFFFFF',
  },
  hash: {
    fontFamily: MONO,
    fontSize: 11,
    color: colors.textMuted,
  },

  description: {
    marginTop: spacing.xs,
    fontSize: 13,
    lineHeight: 19,
    color: colors.textMuted,
  },

  /* Location diff */
  diff: {
    marginTop: spacing.sm,
    borderRadius: 8,
    overflow: 'hidden',
  },
  diffRow: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 10,
    paddingVertical: 6,
    gap: 8,
  },
  diffRemoved: {
    backgroundColor: 'rgba(255, 90, 90, 0.15)',
  },
  diffAdded: {
    backgroundColor: 'rgba(80, 200, 120, 0.15)',
  },
  diffSign: {
    width: 10,
    fontFamily: MONO,
    fontSize: 12,
    fontWeight: '700',
  },
  diffValue: {
    flex: 1,
    fontFamily: MONO,
    fontSize: 12,
  },
  diffRemovedText: {
    color: '#FF6B6B',
  },
  diffAddedText: {
    color: '#4CC97A',
  },

  /* Footer */
  footer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: spacing.md,
    paddingTop: spacing.sm,
    borderTopWidth: StyleSheet.hairlineWidth,
    borderTopColor: colors.border,
    gap: spacing.sm,
  },
  contact: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  avatar: {
    width: 20,
    height: 20,
    borderRadius: 10,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: colors.border,
  },
  avatarText: {
    fontSize: 10,
    fontWeight: '700',
    color: colors.text,
  },
  contactName: {
    flexShrink: 1,
    fontSize: 12,
    color: colors.text,
  },
  date: {
    marginLeft: 'auto',
    fontSize: 11,
    color: colors.textMuted,
  },
});