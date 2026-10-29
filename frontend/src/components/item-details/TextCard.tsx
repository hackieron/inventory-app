import { StyleSheet, Text } from 'react-native';

import { colors } from '@/constants/theme';
import { Card } from './Card';

type Props = {
  title: string;
  text: string;
};

/** Used for Description and Notes. */
export function TextCard({ title, text }: Props) {
  return (
    <Card title={title}>
      <Text style={styles.text}>{text}</Text>
    </Card>
  );
}

const styles = StyleSheet.create({
  text: {
    fontSize: 14,
    color: colors.text,
    lineHeight: 21,
  },
});
