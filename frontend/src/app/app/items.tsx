import { StyleSheet, Text, View } from 'react-native';
import { colors, spacing } from '@/constants/theme';

export default function ItemsScreen() {
  return (
    <View style={styles.container}>
      <Text style={styles.title}>My Items</Text>
      <Text style={styles.subtitle}>Everything you own, in one place.</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, padding: spacing.lg, backgroundColor: colors.bg },
  title: { fontSize: 22, fontWeight: '700', color: colors.text, marginBottom: spacing.xs },
  subtitle: { fontSize: 14, color: colors.textMuted },
});