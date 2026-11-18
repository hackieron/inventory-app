import { Pressable, Text, View } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { colors } from '@/constants/theme';
import { itemStyles as s } from '../styles/createItemStyles';
export default function DatePickerField({ value, onChange, label = 'Purchase date', emptyLabel = 'Select purchase date', minimumDate, maximumDate = new Date() }: { value: string; onChange: (date: string) => void; label?: string; emptyLabel?: string; minimumDate?: Date; maximumDate?: Date | null }) {
  const format = (date: Date) => `${date.getFullYear()}-${String(date.getMonth()+1).padStart(2,'0')}-${String(date.getDate()).padStart(2,'0')}`;
  const min = minimumDate ? format(minimumDate) : undefined;
  const max = maximumDate ? format(maximumDate) : undefined;
  return <View style={s.field}>
    <View style={s.fieldHeader}><Text style={s.fieldLabel}>{label}</Text><Text style={s.optional}>Optional</Text></View>
    <View style={s.inputShell}>
      <Ionicons name="calendar-outline" size={19} color={colors.textMuted} />
      <input type="date" aria-label={label} min={min} max={max} value={value} placeholder={emptyLabel} onChange={(e) => onChange(e.currentTarget.value)}
        style={{ flex: 1, minWidth: 0, height: 48, border: 'none', outline: 'none', background: 'transparent', color: colors.text, fontSize: 14 }} />
      {!!value && <Pressable accessibilityLabel="Clear purchase date" onPress={() => onChange('')}><Ionicons name="close-circle" size={19} color={colors.textMuted} /></Pressable>}
    </View>
  </View>;
}
