import { useCallback, useState } from 'react';
import { ActivityIndicator, KeyboardAvoidingView, Platform, Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useFocusEffect, useLocalSearchParams } from 'expo-router';

import { colors, spacing } from '@/constants/theme';
import { getItem, toggleItemBorrowable } from '@/api/items';
import EditItemForm from '@/features/items/components/EditItemForm';
import ItemImagePicker from '@/features/items/components/ItemImagePicker';
import ItemPreview from '@/features/items/components/ItemPreview';
import { useEditItem } from '@/features/items/hooks/useEditItem';
import { itemStyles as s } from '@/features/items/styles/createItemStyles';
import type { Item } from '@/types/item';

import {
  CurrentBorrowingCard,
  ItemActions,
  ItemHeader,
  ItemHistory,
  ItemInformationCard,
  ItemLoading,
  ItemNotFound,
  ItemTitleSection,
  TextCard,
} from '@/components/item-details/Index';

export default function ItemDetailsScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();

  const [item, setItem] = useState<Item | null>(null);
  const [loading, setLoading] = useState(true);
  const [editing, setEditing] = useState(false);

  const loadItem = async () => {
    try {
      const data = await getItem(Number(id));
      setItem(data);
    } catch (error) {
      console.error('Failed to load item:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleToggleBorrowable = async () => {
    if (!item) return;

    try {
      await toggleItemBorrowable(item.id);
      await loadItem();
    } catch (error) {
      console.error('Failed to update borrowable status:', error);
    }
  };

  useFocusEffect(
    useCallback(() => {
      loadItem();
    }, [id])
  );

  if (loading) return <ItemLoading />;
  if (!item) return <ItemNotFound />;

  if (editing) return <EditScreen item={item} onCancel={() => setEditing(false)} onSaved={loadItem} />;

  const isBorrowed = item.status === 'borrowed';

  return (
    <ScrollView style={styles.container} contentContainerStyle={styles.content}>
      <ItemHeader />

      <ItemTitleSection item={item} isBorrowed={isBorrowed} />

      <ItemInformationCard item={item} />

      {isBorrowed && item.current_borrowing && (
        <CurrentBorrowingCard borrowing={item.current_borrowing} />
      )}

      {item.description && (
        <TextCard title="DESCRIPTION" text={item.description} />
      )}

      {item.notes && <TextCard title="NOTES" text={item.notes} />}

      <ItemActions
        isBorrowed={isBorrowed}
        isBorrowable={item.is_borrowable}
        onEdit={() => {
          setEditing(true)
        }}
        onToggleBorrowable={handleToggleBorrowable}
      />

      <ItemHistory histories={item.histories} />
    </ScrollView>
  );
}

function EditScreen({ item, onCancel, onSaved }: { item: Item; onCancel: () => void; onSaved: () => Promise<void> }) {
  const insets = useSafeAreaInsets();
  const { values, setField, loading, submit } = useEditItem(item);
  const handleSave = async () => { if (await submit()) { await onSaved(); onCancel(); } };

  return <KeyboardAvoidingView style={s.screen} behavior={Platform.OS === 'ios' ? 'padding' : undefined}>
    <View style={[s.header, { paddingTop: Math.max(insets.top, 12) }]}>
      <Pressable onPress={onCancel} accessibilityLabel="Cancel editing" style={s.back}><Ionicons name="close" size={21} color={colors.text} /></Pressable>
      <Text style={s.headerTitle}>Edit Item</Text><View style={{ width: 42 }} />
    </View>
    <ScrollView style={{ flex: 1 }} contentContainerStyle={s.scrollContent} keyboardShouldPersistTaps="handled" showsVerticalScrollIndicator={false}>
      <View><Text style={s.eyebrow}>INVENTORY MANAGEMENT</Text><Text style={s.title}>Update your item</Text><Text style={s.subtitle}>Keep the details and photo up to date.</Text></View>
      <ItemPreview name={values.name} serialNumber={values.serialNumber} imageUri={values.image?.uri || item.image_url || undefined} />
      <ItemImagePicker
        value={values.image}
        existingImageUri={item.image_url}
        showRemove={false}
        onChange={(image) => setField('image', image)}
      />
      <EditItemForm values={values} setField={setField} />
    </ScrollView>
    <View style={[s.footer, { paddingBottom: Math.max(insets.bottom, 16) }]}>
      <Pressable accessibilityRole="button" disabled={loading} onPress={handleSave} style={[s.save, loading && { opacity: 0.6 }]}>
        {loading ? <ActivityIndicator color="#fff" /> : <><Ionicons name="checkmark-circle-outline" size={21} color="#fff" /><Text style={s.saveText}>Save Changes</Text></>}
      </Pressable>
    </View>
  </KeyboardAvoidingView>;
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.bg,
  },
  content: {
    padding: spacing.lg,
    paddingBottom: spacing.xl * 2,
  },
});
