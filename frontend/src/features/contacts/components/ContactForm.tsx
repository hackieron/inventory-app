import { useEffect, useState } from 'react';
import { ActivityIndicator, Modal, Pressable, StyleSheet, Text, TextInput, View } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { colors, radius, spacing } from '@/constants/theme';
import type { Contact, ContactPayload } from '@/types/contact';

type Props = { contact: Contact | null; visible: boolean; onClose: () => void; onSave: (data: ContactPayload) => Promise<void> };

export default function ContactForm({ contact, visible, onClose, onSave }: Props) {
  const [values, setValues] = useState<ContactPayload>({ name: '', email: '', phone: '', notes: '' });
  const [error, setError] = useState('');
  const [saving, setSaving] = useState(false);

  // The form is intentionally reset when the modal opens or switches between contacts.
  // eslint-disable-next-line react-hooks/set-state-in-effect
  useEffect(() => { if (visible) setValues({ name: contact?.name || '', email: contact?.email || '', phone: contact?.phone || '', notes: contact?.notes || '' }); }, [contact, visible]);

  const submit = async () => {
    if (!values.name.trim()) { setError('Name is required.'); return; }
    setSaving(true); setError('');
    try { await onSave({ name: values.name.trim(), email: values.email?.trim() || null, phone: values.phone?.trim() || null, notes: values.notes?.trim() || null }); } catch (requestError: any) { setError(requestError?.response?.data?.message || 'Could not save this contact.'); } finally { setSaving(false); }
  };
  const field = (key: keyof ContactPayload, placeholder: string, multiline = false) => <TextInput value={values[key] || ''} onChangeText={(value) => setValues((current) => ({ ...current, [key]: value }))} placeholder={placeholder} placeholderTextColor={colors.placeholder} style={[styles.input, multiline && styles.multiline]} multiline={multiline} />;

  return <Modal visible={visible} transparent animationType="slide" onRequestClose={onClose}><View style={styles.overlay}><Pressable style={styles.backdrop} onPress={onClose} /><View style={styles.sheet}><View style={styles.heading}><View><Text style={styles.eyebrow}>CONTACTS</Text><Text style={styles.title}>{contact ? 'Edit contact' : 'Add contact'}</Text></View><Pressable onPress={onClose} hitSlop={12}><Ionicons name="close" size={24} color={colors.textMuted} /></Pressable></View><Text style={styles.helper}>Keep people you lend items to in one place.</Text><Text style={styles.label}>Name</Text>{field('name', 'e.g. Alex Rivera')}<Text style={styles.label}>Email <Text style={styles.optional}>(optional)</Text></Text>{field('email', 'alex@example.com')}<Text style={styles.label}>Phone <Text style={styles.optional}>(optional)</Text></Text>{field('phone', '+63 900 000 0000')}<Text style={styles.label}>Notes <Text style={styles.optional}>(optional)</Text></Text>{field('notes', 'Add useful context', true)}{!!error && <Text style={styles.error}>{error}</Text>}<Pressable onPress={submit} disabled={saving} style={[styles.button, saving && styles.disabled]}>{saving ? <ActivityIndicator color="#fff" /> : <><Ionicons name="checkmark-circle-outline" size={18} color="#fff" /><Text style={styles.buttonText}>{contact ? 'Save changes' : 'Add contact'}</Text></>}</Pressable></View></View></Modal>;
}

const styles = StyleSheet.create({ overlay: { flex: 1, justifyContent: 'flex-end' }, backdrop: { ...StyleSheet.absoluteFill, backgroundColor: 'rgba(0,0,0,0.42)' }, sheet: { backgroundColor: colors.surface, borderTopLeftRadius: 24, borderTopRightRadius: 24, padding: spacing.lg, paddingBottom: spacing.xl }, heading: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'flex-start' }, eyebrow: { color: colors.textMuted, fontSize: 10, fontWeight: '800', letterSpacing: 1 }, title: { color: colors.text, fontSize: 23, fontWeight: '800', marginTop: spacing.xs }, helper: { color: colors.textMuted, fontSize: 13, marginTop: spacing.sm, marginBottom: spacing.lg }, label: { color: colors.text, fontSize: 13, fontWeight: '700', marginBottom: spacing.xs }, optional: { color: colors.textMuted, fontWeight: '400' }, input: { minHeight: 46, borderWidth: 1, borderColor: colors.border, borderRadius: radius.md, color: colors.text, paddingHorizontal: spacing.md, marginBottom: spacing.md, fontSize: 14 }, multiline: { minHeight: 78, paddingTop: spacing.md, textAlignVertical: 'top' }, error: { color: colors.danger, fontSize: 13, marginBottom: spacing.md }, button: { minHeight: 50, borderRadius: radius.md, backgroundColor: colors.primary, flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: spacing.sm }, buttonText: { color: '#fff', fontSize: 14, fontWeight: '700' }, disabled: { opacity: 0.6 } });
