import { Pressable, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { router } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';

import { logout } from '@/api/auth';
import { removeToken } from '@/utils/auth';
import { colors, spacing, radius } from '@/constants/theme';

export default function ProfileScreen() {
  async function handleLogout() {
    try {
      await logout();
    } catch (error) {
      console.error('Logout failed:', error);
    } finally {
      await removeToken();
      router.replace('/auth');
    }
  }

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Profile</Text>

      <Pressable style={styles.contactsButton} onPress={() => router.push('/app/tabs/contacts')}>
        <View style={styles.contactsIcon}><Ionicons name="people-outline" size={21} color={colors.text} /></View>
        <View style={styles.contactsCopy}><Text style={styles.contactsTitle}>Contacts</Text><Text style={styles.contactsSubtitle}>Manage people you lend items to</Text></View>
        <Ionicons name="chevron-forward" size={19} color={colors.textMuted} />
      </Pressable>

      <TouchableOpacity style={styles.button} onPress={handleLogout}>
        <Text style={styles.buttonText}>Sign Out</Text>
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, padding: spacing.lg, backgroundColor: colors.bg },
  title: { fontSize: 22, fontWeight: '700', color: colors.text, marginBottom: spacing.xl },
  button: {
    backgroundColor: colors.primary,
    paddingVertical: 14,
    borderRadius: radius.sm,
    alignItems: 'center',
  },
  buttonText: { color: colors.surface, fontSize: 16, fontWeight: '600' },
  contactsButton: { flexDirection: 'row', alignItems: 'center', gap: spacing.md, padding: spacing.md, backgroundColor: colors.surface, borderWidth: 1, borderColor: colors.border, borderRadius: radius.lg, marginBottom: spacing.lg },
  contactsIcon: { width: 42, height: 42, borderRadius: 13, backgroundColor: colors.bg, alignItems: 'center', justifyContent: 'center' },
  contactsCopy: { flex: 1 },
  contactsTitle: { color: colors.text, fontSize: 15, fontWeight: '700' },
  contactsSubtitle: { color: colors.textMuted, fontSize: 12, marginTop: 3 },
});
