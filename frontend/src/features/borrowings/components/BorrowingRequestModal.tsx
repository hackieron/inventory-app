import { useState } from 'react';
import {
  ActivityIndicator,
  KeyboardAvoidingView,
  Modal,
  Platform,
  Pressable,
  StyleSheet,
  Text,
  TextInput,
  View,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { Image } from 'expo-image';
import { requestBorrowing } from '@/api/borrowings';
import { colors, radius, spacing } from '@/constants/theme';
import type { Item } from '@/types/item';
import DatePickerField from '@/features/items/components/DatePickerField';

type Props = { item: Item | null; onClose: () => void; onSubmitted: (message: string) => void };

export default function BorrowingRequestModal({ item, onClose, onSubmitted }: Props) {
  const [returnDate, setReturnDate] = useState('');
  const [notes, setNotes] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState('');
  const today = new Date();

  const submit = async () => {
    if (!item) return;
    if (returnDate && !/^\d{4}-\d{2}-\d{2}$/.test(returnDate)) {
      setError('Use the date format YYYY-MM-DD.');
      return;
    }
    setSubmitting(true);
    setError('');
    try {
      const result = await requestBorrowing(item.id, {
        expected_return_at: returnDate ? `${returnDate}T23:59:59` : null,
        notes: notes.trim() || null,
      });
      setReturnDate('');
      setNotes('');
      onSubmitted(result.message || 'Borrowing request sent.');
    } catch (requestError: any) {
      setError(requestError?.response?.data?.message || 'Could not send the request. Please try again.');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <Modal visible={!!item} transparent animationType="slide" onRequestClose={onClose}>
      <KeyboardAvoidingView style={styles.overlay} behavior={Platform.OS === 'ios' ? 'padding' : undefined}>
        <Pressable style={styles.backdrop} onPress={onClose} />
        <View style={styles.sheet}>
          <View style={styles.headingRow}>
            <View style={styles.headingCopy}>
              <Text style={styles.eyebrow}>BORROWING REQUEST</Text>
              <Text style={styles.title}>Request {item?.name}</Text>
            </View>
            <Pressable onPress={onClose} accessibilityLabel="Close request form" hitSlop={12}>
              <Ionicons name="close" size={24} color={colors.textMuted} />
            </Pressable>
          </View>
          <View style={styles.itemCard}>
            {item?.image_url ? <Image source={{ uri: item.image_url }} style={styles.itemImage} contentFit="cover" /> : <View style={styles.itemImageFallback}><Ionicons name="cube-outline" size={28} color={colors.textMuted} /></View>}
            <View style={styles.itemDetails}>
              <Text style={styles.itemOverline}>ITEM DETAILS</Text>
              <Text style={styles.itemName} numberOfLines={2}>{item?.name}</Text>
              {!!item?.category && <Text style={styles.itemMeta}>{item.category.name}</Text>}
              {!!item?.location && <View style={styles.metaRow}><Ionicons name="location-outline" size={13} color={colors.textMuted} /><Text style={styles.itemMeta}>{item.location.name}</Text></View>}
              {!!item?.serial_number && <Text style={styles.itemMeta}>Serial · {item.serial_number}</Text>}
            </View>
          </View>
          <Text style={styles.helper}>The owner will review your request before the item is lent to you.</Text>
          <DatePickerField value={returnDate} onChange={setReturnDate} label="Expected return date" emptyLabel="Choose a return date" minimumDate={today} maximumDate={null} />
          <Text style={styles.label}>Message <Text style={styles.optional}>(optional)</Text></Text>
          <TextInput value={notes} onChangeText={setNotes} placeholder="Tell the owner why you need it or where it will be used" placeholderTextColor={colors.placeholder} style={[styles.input, styles.multiline]} multiline maxLength={500} />
          <Text style={styles.counter}>{notes.length}/500</Text>
          {!!error && <Text style={styles.error}>{error}</Text>}
          <Pressable disabled={submitting} onPress={submit} style={[styles.submit, submitting && styles.disabled]}>
            {submitting ? <ActivityIndicator color="#fff" /> : <><Ionicons name="paper-plane-outline" size={18} color="#fff" /><Text style={styles.submitText}>Send request</Text></>}
          </Pressable>
        </View>
      </KeyboardAvoidingView>
    </Modal>
  );
}

const styles = StyleSheet.create({
  overlay: { flex: 1, justifyContent: 'flex-end' },
  backdrop: { ...StyleSheet.absoluteFill, backgroundColor: 'rgba(0,0,0,0.42)' },
  sheet: { backgroundColor: colors.surface, borderTopLeftRadius: 24, borderTopRightRadius: 24, padding: spacing.lg, paddingBottom: spacing.xl },
  headingRow: { flexDirection: 'row', alignItems: 'flex-start', justifyContent: 'space-between' },
  headingCopy: { flex: 1, paddingRight: spacing.md },
  eyebrow: { color: colors.textMuted, fontSize: 11, fontWeight: '700', letterSpacing: 1 },
  title: { color: colors.text, fontSize: 22, fontWeight: '700', marginTop: spacing.xs },
  helper: { color: colors.textMuted, fontSize: 14, lineHeight: 20, marginTop: spacing.md, marginBottom: spacing.lg },
  itemCard: { flexDirection: 'row', gap: spacing.md, padding: spacing.md, backgroundColor: colors.bg, borderRadius: radius.md, borderWidth: 1, borderColor: colors.border, marginTop: spacing.lg },
  itemImage: { width: 76, height: 76, borderRadius: radius.sm, backgroundColor: colors.surface },
  itemImageFallback: { width: 76, height: 76, borderRadius: radius.sm, backgroundColor: colors.surface, alignItems: 'center', justifyContent: 'center' },
  itemDetails: { flex: 1, justifyContent: 'center', gap: 3 },
  itemOverline: { color: colors.textMuted, fontSize: 10, fontWeight: '800', letterSpacing: 1 },
  itemName: { color: colors.text, fontSize: 16, fontWeight: '700' },
  itemMeta: { color: colors.textMuted, fontSize: 12 },
  metaRow: { flexDirection: 'row', alignItems: 'center', gap: 3 },
  label: { color: colors.text, fontSize: 13, fontWeight: '600', marginBottom: spacing.xs },
  optional: { color: colors.textMuted, fontWeight: '400' },
  input: { borderColor: colors.border, borderWidth: 1, borderRadius: radius.md, color: colors.text, fontSize: 15, minHeight: 48, paddingHorizontal: spacing.md, marginBottom: spacing.md },
  multiline: { minHeight: 88, paddingTop: spacing.md, textAlignVertical: 'top' },
  counter: { color: colors.textMuted, fontSize: 11, textAlign: 'right', marginTop: -spacing.sm, marginBottom: spacing.md },
  error: { color: colors.danger, fontSize: 13, marginBottom: spacing.md },
  submit: { minHeight: 50, borderRadius: radius.md, backgroundColor: colors.primary, alignItems: 'center', justifyContent: 'center', flexDirection: 'row', gap: spacing.sm },
  disabled: { opacity: 0.6 },
  submitText: { color: '#fff', fontSize: 15, fontWeight: '700' },
});
