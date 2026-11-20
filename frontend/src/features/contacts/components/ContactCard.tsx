import { useEffect, useMemo, useState } from 'react';
import { Image } from 'expo-image';
import { Pressable, StyleSheet, Text, View } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { colors, radius, spacing } from '@/constants/theme';
import type { Contact } from '@/types/contact';
import { getToken } from '@/utils/auth';
import { resolveMediaUrl } from '@/utils/media';

export default function ContactCard({ contact, onEdit, onDelete }: { contact: Contact; onEdit?: () => void; onDelete?: () => void }) {
  const [token, setToken] = useState<string | null>(null);
  useEffect(() => { void getToken().then(setToken); }, []);
  const contactUser = contact.contact_user;
  const initials = useMemo(() => contactUser?.name || contact.name, [contactUser?.name, contact.name]).split(' ').filter(Boolean).map((part) => part[0]).join('').slice(0, 2).toUpperCase();
  const avatarUri = contactUser?.avatar && contactUser.id ? resolveMediaUrl(`${process.env.EXPO_PUBLIC_API_URL || 'http://10.0.2.2:8000/api'}/users/${contactUser.id}/avatar`) : null;
  return <View style={styles.card}><View style={styles.avatar}>{avatarUri && token ? <Image source={{ uri: avatarUri, headers: { Authorization: `Bearer ${token}` } }} style={styles.avatarImage} contentFit="cover" /> : <Text style={styles.avatarText}>{initials}</Text>}</View><View style={styles.copy}><Text style={styles.name}>{contactUser?.name || contact.name}</Text>{!!contact.email && <Text style={styles.meta}>{contact.email}</Text>}{!!contact.phone && <Text style={styles.meta}>{contact.phone}</Text>}<View style={styles.borrowed}><Ionicons name="cube-outline" size={14} color={colors.textMuted} /><Text style={styles.borrowedText}>{contact.borrowings_count || 0} active borrowing{contact.borrowings_count === 1 ? '' : 's'}</Text></View></View>{(onEdit || onDelete) && <View style={styles.actions}>{onEdit && <Pressable onPress={onEdit} hitSlop={8} accessibilityLabel={`Edit ${contact.name}`}><Ionicons name="create-outline" size={20} color={colors.textMuted} /></Pressable>}{onDelete && <Pressable onPress={onDelete} hitSlop={8} accessibilityLabel={`Delete ${contact.name}`}><Ionicons name="trash-outline" size={20} color={colors.danger} /></Pressable>}</View>}</View>;
}

const styles = StyleSheet.create({ card: { flexDirection: 'row', alignItems: 'center', gap: spacing.md, backgroundColor: colors.surface, borderWidth: 1, borderColor: colors.border, borderRadius: radius.lg, padding: spacing.md, marginBottom: spacing.sm }, avatar: { width: 48, height: 48, borderRadius: 16, overflow: 'hidden', backgroundColor: colors.primary, alignItems: 'center', justifyContent: 'center' }, avatarImage: { width: '100%', height: '100%' }, avatarText: { color: '#fff', fontSize: 20, fontWeight: '800' }, copy: { flex: 1 }, name: { color: colors.text, fontSize: 16, fontWeight: '700' }, meta: { color: colors.textMuted, fontSize: 12, marginTop: 3 }, borrowed: { flexDirection: 'row', alignItems: 'center', gap: 5, marginTop: 7 }, borrowedText: { color: colors.textMuted, fontSize: 11 }, actions: { flexDirection: 'row', gap: spacing.md } });
