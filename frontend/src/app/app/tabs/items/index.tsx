import { useCallback, useState } from 'react';
import {
  ActivityIndicator,
  FlatList,
  RefreshControl,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
  useWindowDimensions,
} from 'react-native';
import { Image } from 'expo-image';
import { LinearGradient } from 'expo-linear-gradient';
import { router, useFocusEffect } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { colors, spacing } from '@/constants/theme';
import { getItems } from '@/api/items';
import type { Item } from '@/types/item';

type ViewMode = 'list' | 'grid';

const CARD_GAP = 12;
const SIDE_PADDING = 20;

export default function ItemsScreen() {
  const insets = useSafeAreaInsets();
  const { width } = useWindowDimensions();
  const [items, setItems] = useState<Item[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [viewMode, setViewMode] = useState<ViewMode>('grid');

  const loadItems = useCallback(async () => {
    try {
      const data = await getItems();
      setItems(data);
    } catch (error) {
      console.error('Failed to load items:', error);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, []);

  useFocusEffect(useCallback(() => { void loadItems(); }, [loadItems]));

  const handleRefresh = () => {
    setRefreshing(true);
    void loadItems();
  };

  const isGrid = viewMode === 'grid';
  const borrowedCount = items.filter((item) => item.status === 'borrowed').length;
  const cardWidth = isGrid
    ? Math.max(130, (width - SIDE_PADDING * 2 - CARD_GAP) / 2)
    : Math.max(200, width - SIDE_PADDING * 2);
  const listData: Array<Item | null> =
    isGrid && items.length % 2 !== 0 ? [...items, null] : items;

  if (loading) {
    return (
      <View style={styles.center}>
        <ActivityIndicator size="large" color={colors.primary} />
      </View>
    );
  }

  return (
    <View style={[styles.container, { paddingTop: Math.max(insets.top, spacing.md) }]}>
      <View style={styles.header}>
        <View style={styles.headerCopy}>
          <Text style={styles.title}>My Items</Text>
          <Text style={styles.subtitle}>
            {items.length === 0
              ? 'Everything you own, in one place.'
              : `${items.length} item${items.length === 1 ? '' : 's'}${borrowedCount ? ` · ${borrowedCount} borrowed` : ''}`}
          </Text>
        </View>
        <TouchableOpacity
          style={styles.addButton}
          onPress={() => router.push('/app/items/create')}
          accessibilityRole="button"
          accessibilityLabel="Add item"
        >
          <Ionicons name="add" size={25} color="#FFFFFF" />
        </TouchableOpacity>
      </View>

      {items.length > 0 && (
        <View style={styles.toolbar}>
          <Text style={styles.sectionLabel}>YOUR COLLECTION</Text>
          <View style={styles.viewToggle}>
            <TouchableOpacity
              style={[styles.viewToggleButton, !isGrid && styles.viewToggleButtonActive]}
              onPress={() => setViewMode('list')}
              accessibilityRole="button"
              accessibilityLabel="List view"
              accessibilityState={{ selected: !isGrid }}
            >
              <Ionicons name="list" size={18} color={!isGrid ? '#FFFFFF' : colors.textMuted} />
            </TouchableOpacity>
            <TouchableOpacity
              style={[styles.viewToggleButton, isGrid && styles.viewToggleButtonActive]}
              onPress={() => setViewMode('grid')}
              accessibilityRole="button"
              accessibilityLabel="Grid view"
              accessibilityState={{ selected: isGrid }}
            >
              <Ionicons name="grid" size={17} color={isGrid ? '#FFFFFF' : colors.textMuted} />
            </TouchableOpacity>
          </View>
        </View>
      )}

      <FlatList
        key={viewMode}
        data={listData}
        numColumns={isGrid ? 2 : 1}
        keyExtractor={(item, index) => item ? String(item.id) : `spacer-${index}`}
        columnWrapperStyle={isGrid ? styles.gridRow : undefined}
        contentContainerStyle={[
          styles.list,
          { paddingBottom: 64 + Math.max(insets.bottom, spacing.sm) + spacing.xl },
          items.length === 0 && styles.emptyList,
        ]}
        refreshControl={<RefreshControl refreshing={refreshing} onRefresh={handleRefresh} />}
        renderItem={({ item }) => item
          ? <ItemCard item={item} width={cardWidth} isGrid={isGrid} />
          : <View style={{ width: cardWidth }} />
        }
        ListEmptyComponent={
          <View style={styles.empty}>
            <View style={styles.emptyIconWrap}>
              <Ionicons name="images-outline" size={32} color={colors.textMuted} />
            </View>
            <Text style={styles.emptyTitle}>Your collection starts here</Text>
            <Text style={styles.emptyText}>Add an item to build your visual inventory.</Text>
            <TouchableOpacity style={styles.emptyButton} onPress={() => router.push('/app/items/create')}>
              <Ionicons name="add" size={18} color="#FFFFFF" />
              <Text style={styles.emptyButtonText}>Add item</Text>
            </TouchableOpacity>
          </View>
        }
      />
    </View>
  );
}

function ItemCard({ item, width, isGrid }: { item: Item; width: number; isGrid: boolean }) {
  const borrowed = item.status === 'borrowed';
  const initial = (item.name.trim()[0] || '?').toUpperCase();
  const borrower = borrowed ? item.current_borrowing?.contact?.name : undefined;

  return (
    <TouchableOpacity
      activeOpacity={0.9}
      accessibilityRole="button"
      accessibilityLabel={`View ${item.name}`}
      onPress={() => router.push({ pathname: '/app/items/[id]', params: { id: String(item.id) } })}
      style={[styles.card, { width, height: isGrid ? width * 1.5 : Math.min(width * 0.95, 410) }]}
    >
      {item.image ? (
        <Image source={{ uri: item.image }} style={StyleSheet.absoluteFill} contentFit="cover" />
      ) : (
        <View style={[StyleSheet.absoluteFill, styles.placeholder]}>
          <Text style={styles.placeholderInitial}>{initial}</Text>
          <Ionicons name="cube-outline" size={45} color="rgba(255,255,255,0.16)" style={styles.placeholderIcon} />
        </View>
      )}

      <LinearGradient
        colors={['rgba(0,0,0,0.10)', 'rgba(0,0,0,0.04)', borrowed ? 'rgba(116,67,9,0.76)' : 'rgba(4,77,88,0.85)', borrowed ? '#a86b1d' : '#006d7a']}
        locations={[0, 0.37, 0.73, 1]}
        style={StyleSheet.absoluteFill}
      />

      <View style={styles.cardContent}>
        <View style={styles.cardTop}>
          <View style={[styles.statusBadge, borrowed && styles.borrowedBadge]}>
            <View style={[styles.statusDot, borrowed && styles.borrowedDot]} />
            <Text style={styles.statusText}>{borrowed ? 'Borrowed' : 'Stored'}</Text>
          </View>
        </View>
        <View style={styles.cardBottom}>
          <Text style={[styles.cardTitle, isGrid && styles.cardTitleGrid]} numberOfLines={2}>
            {item.name}
          </Text>
          <View style={styles.cardDivider} />
          <View style={styles.cardDetails}>
            <View style={styles.cardDetailText}>
              <Text style={styles.categoryText} numberOfLines={1}>
                {item.category?.name || 'Uncategorized'}
              </Text>
              <View style={styles.locationRow}>
                <Ionicons name={borrower ? 'person-outline' : 'location-outline'} size={12} color="rgba(255,255,255,0.85)" />
                <Text style={styles.locationText} numberOfLines={1}>
                  {borrower || item.location?.name || 'No location assigned'}
                </Text>
              </View>
            </View>
            <Ionicons name="arrow-up-outline" size={18} color="#FFFFFF" />
          </View>
        </View>
      </View>
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: colors.bg },
  center: { flex: 1, alignItems: 'center', justifyContent: 'center', backgroundColor: colors.bg },
  header: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', paddingHorizontal: SIDE_PADDING, marginBottom: 18, gap: 12 },
  headerCopy: { flex: 1 },
  title: { fontSize: 29, fontWeight: '800', letterSpacing: -0.8, color: colors.text },
  subtitle: { marginTop: 4, fontSize: 13, color: colors.textMuted },
  addButton: { width: 44, height: 44, borderRadius: 15, backgroundColor: colors.primary, alignItems: 'center', justifyContent: 'center' },
  toolbar: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', paddingHorizontal: SIDE_PADDING, marginBottom: 14 },
  sectionLabel: { fontSize: 10, fontWeight: '800', letterSpacing: 1.8, color: colors.textMuted },
  viewToggle: { flexDirection: 'row', borderRadius: 11, backgroundColor: colors.surface, padding: 3, gap: 2 },
  viewToggleButton: { width: 36, height: 32, alignItems: 'center', justifyContent: 'center', borderRadius: 8 },
  viewToggleButtonActive: { backgroundColor: colors.primary },
  list: { flexGrow: 1, paddingHorizontal: SIDE_PADDING },
  gridRow: { gap: CARD_GAP, marginBottom: CARD_GAP },
  card: { borderRadius: 23, overflow: 'hidden', marginBottom: CARD_GAP, backgroundColor: '#234c55' },
  placeholder: { alignItems: 'center', justifyContent: 'center', backgroundColor: '#73929b' },
  placeholderInitial: { color: 'rgba(255,255,255,0.48)', fontSize: 72, fontWeight: '800' },
  placeholderIcon: { position: 'absolute', right: 18, top: 18 },
  cardContent: { flex: 1, justifyContent: 'space-between', padding: 14 },
  cardTop: { alignItems: 'flex-start' },
  statusBadge: { flexDirection: 'row', alignItems: 'center', gap: 5, paddingVertical: 6, paddingHorizontal: 9, borderRadius: 999, backgroundColor: 'rgba(0,55,60,0.67)' },
  borrowedBadge: { backgroundColor: 'rgba(105,64,14,0.78)' },
  statusDot: { width: 6, height: 6, borderRadius: 3, backgroundColor: '#9de9b4' },
  borrowedDot: { backgroundColor: '#ffd083' },
  statusText: { fontSize: 10, color: '#FFFFFF', fontWeight: '700' },
  cardBottom: { gap: 9 },
  cardTitle: { fontSize: 23, fontWeight: '800', lineHeight: 28, letterSpacing: -0.5, color: '#FFFFFF' },
  cardTitleGrid: { fontSize: 17, lineHeight: 21, letterSpacing: -0.3 },
  cardDivider: { height: 1, backgroundColor: 'rgba(255,255,255,0.32)' },
  cardDetails: { flexDirection: 'row', alignItems: 'flex-end', justifyContent: 'space-between', gap: 5 },
  cardDetailText: { flex: 1, minWidth: 0, gap: 4 },
  categoryText: { color: '#FFFFFF', fontSize: 12, fontWeight: '700' },
  locationRow: { flexDirection: 'row', alignItems: 'center', gap: 4 },
  locationText: { color: 'rgba(255,255,255,0.88)', fontSize: 10, flexShrink: 1 },
  emptyList: { justifyContent: 'center' },
  empty: { alignItems: 'center', paddingHorizontal: 20 },
  emptyIconWrap: { width: 74, height: 74, borderRadius: 24, backgroundColor: colors.surface, alignItems: 'center', justifyContent: 'center', marginBottom: 16 },
  emptyTitle: { fontSize: 18, fontWeight: '700', color: colors.text, textAlign: 'center' },
  emptyText: { fontSize: 14, color: colors.textMuted, textAlign: 'center', marginTop: 8, marginBottom: 20 },
  emptyButton: { flexDirection: 'row', gap: 6, backgroundColor: colors.primary, paddingHorizontal: 18, paddingVertical: 12, borderRadius: 12, alignItems: 'center' },
  emptyButtonText: { color: '#FFFFFF', fontWeight: '700' },
});
