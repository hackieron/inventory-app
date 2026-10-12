import { StyleSheet, Text, View } from 'react-native';
import { colors, spacing } from '@/constants/theme';

export default function HomeScreen() {
  return (
    <View style={styles.container}>
      <Text style={styles.title}>Welcome back</Text>
      <Text style={styles.subtitle}>Here's a quick look at your stuff.</Text>

      <View style={styles.statsRow}>
        <View style={styles.statCard}>
          <Text style={styles.statNumber}>—</Text>
          <Text style={styles.statLabel}>Items tracked</Text>
        </View>
        <View style={styles.statCard}>
          <Text style={styles.statNumber}>—</Text>
          <Text style={styles.statLabel}>Currently borrowed</Text>
        </View>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, padding: spacing.lg, backgroundColor: colors.bg },
  title: { fontSize: 26, fontWeight: '700', color: colors.text, marginBottom: spacing.xs },
  subtitle: { fontSize: 15, color: colors.textMuted, marginBottom: spacing.xl },
  statsRow: { flexDirection: 'row', gap: spacing.md },
  statCard: {
    flex: 1,
    backgroundColor: colors.surface,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: colors.border,
    padding: spacing.md,
  },
  statNumber: { fontSize: 24, fontWeight: '700', color: colors.text },
  statLabel: { fontSize: 13, color: colors.textMuted, marginTop: spacing.xs },
});