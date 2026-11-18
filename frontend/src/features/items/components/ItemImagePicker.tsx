import { useEffect, useState } from 'react';
import { Alert, Platform, Pressable, StyleSheet, Text, View } from 'react-native';
import { Image } from 'expo-image';
import { Ionicons } from '@expo/vector-icons';
import * as ImagePicker from 'expo-image-picker';
import { colors } from '@/constants/theme';
import { getToken } from '@/utils/auth';
import type { ImagePickerAsset } from 'expo-image-picker';

interface Props {
  value: ImagePickerAsset | null;
  onChange: (image: ImagePickerAsset | null) => void;
  existingImageUri?: string | null;
  imageHeaders?: Record<string, string>;
  showRemove?: boolean;
}
export default function ItemImagePicker({ value, onChange, existingImageUri, imageHeaders, showRemove = true }: Props) {
  const [token, setToken] = useState<string | null>(null);

  useEffect(() => {
    void getToken().then(setToken);
  }, []);

  const headers = imageHeaders || (token ? { Authorization: `Bearer ${token}` } : undefined);
  async function choose(source: 'camera' | 'gallery') {
    try {
      if (source === 'camera' && Platform.OS === 'web') {
        Alert.alert('Unavailable', 'Camera capture is available in the mobile app.');
        return;
      }
      const permission = source === 'camera'
        ? await ImagePicker.requestCameraPermissionsAsync()
        : await ImagePicker.requestMediaLibraryPermissionsAsync();
      if (!permission.granted) {
        Alert.alert('Permission required', 'Please allow access in your device settings.');
        return;
      }
      const result = source === 'camera'
        ? await ImagePicker.launchCameraAsync({ mediaTypes: ['images'], allowsEditing: true, quality: 0.8 })
        : await ImagePicker.launchImageLibraryAsync({ mediaTypes: ['images'], allowsEditing: true, quality: 0.8 });
      if (!result.canceled && result.assets[0]) onChange(result.assets[0]);
    } catch (error) {
      console.error('Image picker error:', error);
      Alert.alert('Image error', 'Unable to select an image.');
    }
  }
  return <View style={styles.card}>
    <Text style={styles.title}>Item photo <Text style={styles.optional}>· Optional</Text></Text>
    {value || existingImageUri ? <View style={styles.photoWrap}>
      <Image
        source={value ? { uri: value.uri } : { uri: existingImageUri!, headers }}
        style={styles.photo}
        contentFit="cover"
        transition={180}
        cachePolicy="memory-disk"
      />
      {!value && existingImageUri && <View style={styles.currentBadge}><Text style={styles.currentBadgeText}>Current photo</Text></View>}
      {showRemove && <Pressable style={styles.remove} onPress={() => onChange(null)} accessibilityLabel="Remove image"><Ionicons name="close" size={20} color="#fff" /></Pressable>}
    </View> : <View style={styles.empty}><Ionicons name="image-outline" size={34} color={colors.primary} /><Text style={styles.help}>Add a photo to recognize your item easily</Text></View>}
    <View style={styles.actions}>
      {Platform.OS !== 'web' && <Pressable style={styles.action} onPress={() => choose('camera')}><Ionicons name="camera-outline" size={19} color={colors.primary}/><Text style={styles.actionText}>Take photo</Text></Pressable>}
      <Pressable style={styles.action} onPress={() => choose('gallery')}><Ionicons name="images-outline" size={19} color={colors.primary}/><Text style={styles.actionText}>Choose photo</Text></Pressable>
    </View>
  </View>;
}
const styles = StyleSheet.create({
  card: { backgroundColor: colors.surface, borderRadius: 20, borderWidth: 1, borderColor: colors.border, padding: 16, gap: 14 },
  title: { color: colors.text, fontSize: 15, fontWeight: '700' }, optional: { fontSize: 12, color: colors.textMuted, fontWeight: '400' },
  empty: { minHeight: 150, borderRadius: 14, borderWidth: 1, borderStyle: 'dashed', borderColor: colors.border, backgroundColor: colors.bg, justifyContent: 'center', alignItems: 'center', gap: 10, padding: 16 },
  help: { fontSize: 12, color: colors.textMuted, textAlign: 'center' }, photoWrap: { position: 'relative' },
  photo: { width: '100%', height: 200, borderRadius: 14 },
  currentBadge: { position: 'absolute', left: 10, bottom: 10, paddingHorizontal: 9, paddingVertical: 5, borderRadius: 999, backgroundColor: 'rgba(0,0,0,0.65)' },
  currentBadgeText: { color: '#fff', fontSize: 11, fontWeight: '700' },
  remove: { position: 'absolute', top: 10, right: 10, backgroundColor: 'rgba(0,0,0,0.65)', borderRadius: 20, padding: 7 },
  actions: { flexDirection: 'row', gap: 10 }, action: { flex: 1, flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 7, paddingVertical: 13, borderRadius: 12, backgroundColor: colors.bg, borderWidth: 1, borderColor: colors.border },
  actionText: { color: colors.primary, fontWeight: '700', fontSize: 12 },
});
