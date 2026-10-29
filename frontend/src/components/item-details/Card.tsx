import type { ReactNode } from 'react';
import { StyleSheet, View } from 'react-native';
import { colors, spacing, radius } from '@/constants/theme';
import { SectionTitle } from './SectionTitle';

type Props = {
  title: string;
  children: ReactNode;
};

export function Card({ title, children }: Props) {
  return (
    <View style={styles.card}>
      <SectionTitle>{title}</SectionTitle>
      {children}
    </View>
  );
}

const styles = StyleSheet.create({
  card: {
    backgroundColor: colors.surface,
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: radius.md,
    padding: spacing.md,
    marginBottom: spacing.md,
  },
});