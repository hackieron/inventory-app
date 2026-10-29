import { ActivityIndicator, KeyboardAvoidingView, Platform, Pressable, ScrollView, Text, View } from 'react-native';
import { router } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { colors } from '@/constants/theme';
import CreateItemForm from '@/features/items/components/CreateItemForm';
import ItemPreview from '@/features/items/components/ItemPreview';
import ItemImagePicker from '@/features/items/components/ItemImagePicker';
import { useCreateItem } from '@/features/items/hooks/useCreateItem';
import { itemStyles as s } from '@/features/items/styles/createItemStyles';

export default function CreateItemScreen() {
  const insets = useSafeAreaInsets();
  const { values, setField, loading, submit } = useCreateItem();
  const goBack = () => router.canGoBack() ? router.back() : router.replace('/app/tabs/items');
  const handleSave = async () => { if (await submit()) goBack(); };
  return <KeyboardAvoidingView style={s.screen} behavior={Platform.OS === 'ios' ? 'padding' : undefined}>
    <View style={[s.header, { paddingTop: Math.max(insets.top, 12) }]}>
      <Pressable onPress={goBack} accessibilityLabel="Go back" style={s.back}><Ionicons name="arrow-back" size={21} color={colors.text} /></Pressable>
      <Text style={s.headerTitle}>New Item</Text><View style={{ width: 42 }} />
    </View>
    <ScrollView style={{ flex: 1 }} contentContainerStyle={s.scrollContent} keyboardShouldPersistTaps="handled" showsVerticalScrollIndicator={false}>
      <View><Text style={s.eyebrow}>INVENTORY MANAGEMENT</Text><Text style={s.title}>Add to your collection</Text>
        <Text style={s.subtitle}>Keep track of your belongings and organize everything in one place.</Text></View>
      <ItemPreview name={values.name} serialNumber={values.serialNumber} imageUri={values.image?.uri} />
      <ItemImagePicker value={values.image} onChange={(image) => setField('image', image)} />
      <CreateItemForm values={values} setField={setField} />
      <View style={s.infoBanner}><Ionicons name="shield-checkmark-outline" size={21} color={colors.primary} />
        <Text style={s.infoText}>Your item will be saved to your personal inventory. You can update its details later.</Text></View>
    </ScrollView>
    <View style={[s.footer, { paddingBottom: Math.max(insets.bottom, 16) }]}>
      <Pressable accessibilityRole="button" accessibilityLabel="Add to inventory" disabled={loading} onPress={handleSave} style={[s.save, loading && { opacity: 0.6 }]}>
        {loading ? <ActivityIndicator color="#fff" /> : <><Ionicons name="add-circle-outline" size={21} color="#fff" /><Text style={s.saveText}>Add to Inventory</Text><Ionicons name="arrow-forward" size={18} color="#fff" /></>}
      </Pressable>
    </View>
  </KeyboardAvoidingView>;
}
