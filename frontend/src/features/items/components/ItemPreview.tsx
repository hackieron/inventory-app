import { View, Text, Image } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { colors } from '@/constants/theme';
import { itemStyles as s } from '../styles/createItemStyles';
export default function ItemPreview({ name, serialNumber, imageUri }: { name: string; serialNumber: string; imageUri?: string }) {
  return <View style={s.preview}>
    {imageUri ? <Image source={{ uri: imageUri }} style={s.previewIcon} /> : <View style={s.previewIcon}><Ionicons name="cube-outline" size={30} color={colors.primary} /></View>}
    <View style={s.previewInfo}>
      <Text style={s.previewOverline}>ITEM PREVIEW</Text>
      <Text style={s.previewName} numberOfLines={1}>{name.trim() || 'Your new item'}</Text>
      <Text style={s.previewSerial} numberOfLines={1}>{serialNumber.trim() || 'No serial number yet'}</Text>
    </View>
    <Ionicons name="sparkles-outline" size={18} color={colors.primary} />
  </View>;
}
