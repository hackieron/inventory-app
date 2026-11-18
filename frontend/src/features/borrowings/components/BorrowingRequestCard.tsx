import { ActivityIndicator, Pressable, StyleSheet, Text, View } from 'react-native';
import { Image } from 'expo-image';
import { Ionicons } from '@expo/vector-icons';
import { colors, radius, spacing } from '@/constants/theme';
import type { BorrowingRequest } from '@/types/borrowing';

type Props = { request: BorrowingRequest; mode: 'mine' | 'incoming'; busy?: boolean; onAction: (action: 'approve' | 'reject' | 'cancel') => void };

export default function BorrowingRequestCard({ request, mode, busy, onAction }: Props) {
  const item = request.item;
  const title = item?.name || `Item #${request.item_id}`;
  const statusColor = request.status === 'approved' ? '#2E8B57' : request.status === 'rejected' || request.status === 'cancelled' ? colors.danger : colors.textMuted;
  const returnDate = request.expected_return_at ? new Date(request.expected_return_at).toLocaleDateString(undefined, { month: 'short', day: 'numeric', year: 'numeric' }) : 'Not specified';

  return <View style={styles.card}>
    <View style={styles.hero}>
      {item?.image_url ? <Image source={{ uri: item.image_url }} style={styles.image} contentFit="cover" transition={180} /> : <View style={styles.fallback}><Ionicons name="cube-outline" size={42} color="rgba(255,255,255,0.78)" /></View>}
      <View style={styles.overlay} />
      <View style={[styles.statusBadge, { backgroundColor: request.status === 'pending' ? 'rgba(255,255,255,0.92)' : 'rgba(255,255,255,0.88)' }]}><View style={[styles.statusDot, { backgroundColor: statusColor }]} /><Text style={[styles.statusText, { color: statusColor }]}>{request.status}</Text></View>
      <View style={styles.heroCopy}><Text style={styles.name} numberOfLines={2}>{title}</Text>{!!item?.category && <Text style={styles.category}>{item.category.name}</Text>}</View>
    </View>
    <View style={styles.body}>
      <View style={styles.infoGrid}>
        {mode === 'incoming' ? (
          <Info icon="person-outline" label="Borrower" value={request.requester?.name || 'Unknown user'} />
        ) : (
          <Info icon="person-outline" label="Owner" value={item?.user?.name || 'Unknown owner'} />
        )}
        <Info icon="calendar-outline" label="Expected return" value={returnDate} />
      </View>
      {mode !== 'incoming' && (
        <View style={styles.infoGrid}>
          <Info icon="location-outline" label="Location" value={item?.location?.name || 'Not specified'} />
        </View>
      )}
      {!!item?.serial_number && <Text style={styles.meta}>Serial number · {item.serial_number}</Text>}
      {!!item?.description && <Text style={styles.description} numberOfLines={2}>{item.description}</Text>}
      {!!request.notes && <View style={styles.note}><Ionicons name="chatbubble-ellipses-outline" size={16} color={colors.textMuted} /><Text style={styles.noteText} numberOfLines={2}>{request.notes}</Text></View>}
      {busy ? <View style={styles.busy}><ActivityIndicator color={colors.primary} /></View> : mode === 'incoming' && request.status === 'pending' ? <View style={styles.actionRow}><Pressable style={styles.rejectButton} onPress={() => onAction('reject')}><Ionicons name="close" size={18} color={colors.danger} /><Text style={styles.rejectText}>Reject</Text></Pressable><Pressable style={styles.approveButton} onPress={() => onAction('approve')}><Ionicons name="checkmark" size={18} color="#fff" /><Text style={styles.approveText}>Approve</Text></Pressable></View> : mode === 'mine' && request.status === 'pending' ? <Pressable style={styles.cancelButton} onPress={() => onAction('cancel')}><Text style={styles.cancelText}>Cancel request</Text></Pressable> : null}
    </View>
  </View>;
}

function Info({ icon, label, value }: { icon: keyof typeof Ionicons.glyphMap; label: string; value: string }) { return <View style={styles.info}><Ionicons name={icon} size={16} color={colors.textMuted} /><View style={styles.infoCopy}><Text style={styles.infoLabel}>{label}</Text><Text style={styles.infoValue} numberOfLines={1}>{value}</Text></View></View>; }

const styles = StyleSheet.create({
  card: { backgroundColor: colors.surface, borderWidth: 1, borderColor: colors.border, borderRadius: radius.lg, overflow: 'hidden', marginBottom: spacing.md },
  hero: { height: 180, backgroundColor: '#334155', position: 'relative' }, image: { ...StyleSheet.absoluteFill, width: '100%', height: '100%' }, fallback: { ...StyleSheet.absoluteFill, alignItems: 'center', justifyContent: 'center', backgroundColor: '#334155' }, overlay: { ...StyleSheet.absoluteFill, backgroundColor: 'rgba(10,15,25,0.38)' }, statusBadge: { position: 'absolute', top: spacing.md, left: spacing.md, flexDirection: 'row', alignItems: 'center', gap: 6, borderRadius: 999, paddingHorizontal: 10, paddingVertical: 6 }, statusDot: { width: 7, height: 7, borderRadius: 4 }, statusText: { fontSize: 11, fontWeight: '700', textTransform: 'capitalize' }, heroCopy: { position: 'absolute', left: spacing.md, right: spacing.md, bottom: spacing.md }, name: { color: '#fff', fontSize: 21, lineHeight: 26, fontWeight: '800' }, category: { color: 'rgba(255,255,255,0.82)', fontSize: 13, marginTop: 4 }, body: { padding: spacing.md }, infoGrid: { flexDirection: 'row', gap: spacing.md }, info: { flex: 1, flexDirection: 'row', alignItems: 'center', gap: 7, minWidth: 0 }, infoCopy: { flex: 1 }, infoLabel: { color: colors.textMuted, fontSize: 10, fontWeight: '700', textTransform: 'uppercase', letterSpacing: 0.4 }, infoValue: { color: colors.text, fontSize: 13, marginTop: 2 }, meta: { color: colors.textMuted, fontSize: 12, marginTop: spacing.md }, description: { color: colors.textMuted, fontSize: 13, lineHeight: 19, marginTop: spacing.md }, note: { flexDirection: 'row', gap: spacing.sm, alignItems: 'flex-start', backgroundColor: colors.bg, borderRadius: radius.sm, padding: spacing.sm, marginTop: spacing.md }, noteText: { flex: 1, color: colors.textMuted, fontSize: 12, lineHeight: 17 }, actionRow: { flexDirection: 'row', gap: spacing.sm, marginTop: spacing.md }, rejectButton: { flex: 1, minHeight: 46, borderRadius: radius.md, borderWidth: 1, borderColor: colors.danger, flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: spacing.sm }, rejectText: { color: colors.danger, fontSize: 14, fontWeight: '700' }, approveButton: { flex: 1, minHeight: 46, borderRadius: radius.md, backgroundColor: colors.primary, flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: spacing.sm }, approveText: { color: '#fff', fontSize: 14, fontWeight: '700' }, cancelButton: { minHeight: 44, marginTop: spacing.md, borderRadius: radius.md, borderWidth: 1, borderColor: colors.border, alignItems: 'center', justifyContent: 'center' }, cancelText: { color: colors.textMuted, fontSize: 14, fontWeight: '700' }, busy: { minHeight: 46, alignItems: 'center', justifyContent: 'center', marginTop: spacing.md },
});
