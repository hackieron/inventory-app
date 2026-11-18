import { useCallback, useMemo, useState } from 'react';
import { ActivityIndicator, Pressable, RefreshControl, ScrollView, StyleSheet, Text, TextInput, TouchableOpacity, View } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import Toast from 'react-native-toast-message';
import { useFocusEffect } from 'expo-router';
import { discoverItems } from '@/api/items';
import { colors, radius, spacing } from '@/constants/theme';
import type { Item } from '@/types/item';
import BorrowingRequestModal from '@/features/borrowings/components/BorrowingRequestModal';
import BorrowingRequestCard from '@/features/borrowings/components/BorrowingRequestCard';
import BorrowableItemCard from '@/features/borrowings/components/BorrowableItemCard';
import { useBorrowingRequests } from '@/features/borrowings/hooks/useBorrowingRequests';

type ViewMode = 'discover' | 'mine' | 'incoming';

export default function BorrowedScreen() {
  const [items, setItems] = useState<Item[]>([]);
  const [selectedItem, setSelectedItem] = useState<Item | null>(null);
  const [mode, setMode] = useState<ViewMode>('discover');
  const [busyId, setBusyId] = useState<number | null>(null);
  const [search, setSearch] = useState('');
  const [category, setCategory] = useState('All');
  const [page, setPage] = useState(1);
  const pageSize = 6;
  const { mine, incoming, loading, refreshing, load: loadRequests, runAction } = useBorrowingRequests();

  const loadAll = useCallback(async () => {
    const [discovered] = await Promise.all([discoverItems(), loadRequests()]);
    setItems(discovered);
  }, [loadRequests]);

  useFocusEffect(useCallback(() => { loadAll(); }, [loadAll]));

  const performAction = async (action: 'approve' | 'reject' | 'cancel', id: number) => {
    setBusyId(id);
    const labels = { approve: 'approved', reject: 'rejected', cancel: 'cancelled' } as const;
    try {
      await runAction(action, id);
      Toast.show({
        type: 'success',
        text1: `Request ${labels[action]}`,
        text2: `The borrowing request was ${labels[action]} successfully.`,
        position: 'top',
        visibilityTime: 3000,
        autoHide: true,
      });
    } catch (error: any) {
      Toast.show({
        type: 'error',
        text1: 'Request update failed',
        text2: error?.response?.data?.message || 'Unable to update the request.',
        position: 'top',
        visibilityTime: 4000,
        autoHide: true,
      });
    } finally { setBusyId(null); }
  };

  const categories = useMemo(() => ['All', ...Array.from(new Set(items.map((item) => item.category?.name).filter((name): name is string => !!name))).sort()], [items]);
  const filteredItems = useMemo(() => {
    const needle = search.trim().toLowerCase();
    return items.filter((item) => {
      const matchesCategory = category === 'All' || item.category?.name === category;
      const searchable = [item.name, item.description, item.notes, item.serial_number, item.location?.name, item.category?.name].filter(Boolean).join(' ').toLowerCase();
      return matchesCategory && (!needle || searchable.includes(needle));
    });
  }, [items, search, category]);
  const pageCount = Math.max(1, Math.ceil(filteredItems.length / pageSize));
  const visibleItems = filteredItems.slice((page - 1) * pageSize, page * pageSize);

  if (loading) return <View style={styles.center}><ActivityIndicator size="large" color={colors.primary} /></View>;
  const visibleRequests = mode === 'mine' ? mine : incoming;

  return <><ScrollView style={styles.container} contentContainerStyle={styles.content} refreshControl={<RefreshControl refreshing={refreshing} onRefresh={loadAll} />}>
    <View style={styles.header}><Text style={styles.title}>Borrowing</Text><Text style={styles.subtitle}>Discover shared items and manage borrowing requests.</Text></View>
    <View style={styles.segment}><Segment label="Discover" active={mode === 'discover'} onPress={() => setMode('discover')} /><Segment label={`My requests${mine.filter((r) => r.status === 'pending').length ? ` · ${mine.filter((r) => r.status === 'pending').length}` : ''}`} active={mode === 'mine'} onPress={() => setMode('mine')} /><Segment label={`Incoming${incoming.filter((r) => r.status === 'pending').length ? ` · ${incoming.filter((r) => r.status === 'pending').length}` : ''}`} active={mode === 'incoming'} onPress={() => setMode('incoming')} /></View>
    {mode === 'discover' ? <><View style={styles.searchBox}><Ionicons name="search-outline" size={19} color={colors.textMuted} /><TextInput value={search} onChangeText={(value) => { setSearch(value); setPage(1); }} placeholder="Search items, location, or category" placeholderTextColor={colors.placeholder} style={styles.searchInput} accessibilityLabel="Search borrowable items" />{search.length > 0 && <Pressable onPress={() => { setSearch(''); setPage(1); }} hitSlop={10}><Ionicons name="close-circle" size={18} color={colors.textMuted} /></Pressable>}</View><ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.filterRow}>{categories.map((name) => <Pressable key={name} onPress={() => { setCategory(name); setPage(1); }} style={[styles.filterChip, category === name && styles.filterChipActive]}><Text style={[styles.filterText, category === name && styles.filterTextActive]}>{name}</Text></Pressable>)}</ScrollView><View style={styles.resultsRow}><Text style={styles.sectionTitle}>AVAILABLE TO BORROW</Text><Text style={styles.resultCount}>{filteredItems.length} item{filteredItems.length === 1 ? '' : 's'}</Text></View>{filteredItems.length === 0 ? <Empty icon="search-outline" text="No items match your search or filter." /> : <>{visibleItems.map((item) => <BorrowableItemCard key={item.id} item={item} onRequest={() => setSelectedItem(item)} />)}<View style={styles.pagination}><Pressable disabled={page <= 1} onPress={() => setPage((value) => value - 1)} style={[styles.pageButton, page <= 1 && styles.pageButtonDisabled]}><Ionicons name="chevron-back" size={18} color={page <= 1 ? colors.placeholder : colors.text} /></Pressable><Text style={styles.pageText}>Page {Math.min(page, pageCount)} of {pageCount}</Text><Pressable disabled={page >= pageCount} onPress={() => setPage((value) => value + 1)} style={[styles.pageButton, page >= pageCount && styles.pageButtonDisabled]}><Ionicons name="chevron-forward" size={18} color={page >= pageCount ? colors.placeholder : colors.text} /></Pressable></View></>}</> : <><Text style={styles.sectionTitle}>{mode === 'mine' ? 'MY REQUESTS' : 'REQUESTS FOR MY ITEMS'}</Text>{visibleRequests.length === 0 ? <Empty icon={mode === 'mine' ? 'paper-plane-outline' : 'notifications-outline'} text={mode === 'mine' ? 'You have not sent any borrowing requests.' : 'No incoming requests right now.'} /> : visibleRequests.map((request) => <BorrowingRequestCard key={request.id} request={request} mode={mode} busy={busyId === request.id} onAction={(action) => performAction(action, request.id)} />)}</>}
  </ScrollView><BorrowingRequestModal item={selectedItem} onClose={() => setSelectedItem(null)} onSubmitted={(message) => { setSelectedItem(null); Toast.show({ type: 'success', text1: 'Request sent', text2: message, position: 'top', visibilityTime: 3000, autoHide: true }); loadAll(); }} /></>;
}

function Segment({ label, active, onPress }: { label: string; active: boolean; onPress: () => void }) { return <TouchableOpacity style={[styles.segmentButton, active && styles.segmentActive]} onPress={onPress}><Text style={[styles.segmentText, active && styles.segmentTextActive]}>{label}</Text></TouchableOpacity>; }
function Empty({ icon, text }: { icon: keyof typeof Ionicons.glyphMap; text: string }) { return <View style={styles.empty}><Ionicons name={icon} size={30} color={colors.textMuted} /><Text style={styles.emptyText}>{text}</Text></View>; }

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: colors.bg }, content: { padding: spacing.lg, paddingBottom: spacing.xl * 2 }, center: { flex: 1, justifyContent: 'center', alignItems: 'center', backgroundColor: colors.bg }, header: { marginBottom: spacing.lg }, title: { color: colors.text, fontSize: 24, fontWeight: '700' }, subtitle: { color: colors.textMuted, fontSize: 14, marginTop: spacing.xs }, segment: { flexDirection: 'row', backgroundColor: colors.surface, borderRadius: radius.md, borderWidth: 1, borderColor: colors.border, padding: 4, marginBottom: spacing.xl }, segmentButton: { flex: 1, minHeight: 38, borderRadius: radius.sm, alignItems: 'center', justifyContent: 'center', paddingHorizontal: 4 }, segmentActive: { backgroundColor: colors.primary }, segmentText: { color: colors.textMuted, fontSize: 11, fontWeight: '600', textAlign: 'center' }, segmentTextActive: { color: '#fff' }, searchBox: { minHeight: 50, flexDirection: 'row', alignItems: 'center', gap: spacing.sm, backgroundColor: colors.surface, borderWidth: 1, borderColor: colors.border, borderRadius: radius.md, paddingHorizontal: spacing.md, marginBottom: spacing.sm }, searchInput: { flex: 1, color: colors.text, fontSize: 14, minHeight: 48 }, filterRow: { gap: spacing.sm, paddingVertical: spacing.xs, marginBottom: spacing.md }, filterChip: { borderWidth: 1, borderColor: colors.border, borderRadius: 999, paddingHorizontal: spacing.md, paddingVertical: spacing.sm, backgroundColor: colors.surface }, filterChipActive: { backgroundColor: colors.primary, borderColor: colors.primary }, filterText: { color: colors.textMuted, fontSize: 12, fontWeight: '600' }, filterTextActive: { color: '#fff' }, resultsRow: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' }, sectionTitle: { color: colors.textMuted, fontSize: 11, fontWeight: '700', letterSpacing: 0.5, marginBottom: spacing.md }, resultCount: { color: colors.textMuted, fontSize: 12, marginBottom: spacing.md }, pagination: { flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: spacing.md, marginTop: spacing.sm, marginBottom: spacing.md }, pageButton: { width: 38, height: 38, borderRadius: radius.sm, borderWidth: 1, borderColor: colors.border, backgroundColor: colors.surface, alignItems: 'center', justifyContent: 'center' }, pageButtonDisabled: { opacity: 0.5 }, pageText: { color: colors.text, fontSize: 13, fontWeight: '600' }, empty: { alignItems: 'center', padding: spacing.xl, backgroundColor: colors.surface, borderRadius: radius.lg, borderWidth: 1, borderColor: colors.border, borderStyle: 'dashed' }, emptyText: { color: colors.textMuted, fontSize: 13, textAlign: 'center', marginTop: spacing.sm },
});
