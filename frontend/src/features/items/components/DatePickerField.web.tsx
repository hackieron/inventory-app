import { Pressable, Text, View } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { colors } from '@/constants/theme';
import { itemStyles as s } from '../styles/createItemStyles';
export default function DatePickerField({ value, onChange }: { value: string; onChange: (date: string) => void }) {
  const today = new Date();
  const max = `${today.getFullYear()}-${String(today.getMonth()+1).padStart(2,'0')}-${String(today.getDate()).padStart(2,'0')}`;
  return <View style={s.field}>
    <View style={s.fieldHeader}><Text style={s.fieldLabel}>Purchase date</Text><Text style={s.optional}>Optional</Text></View>
    <View style={s.inputShell}>
      <Ionicons name="calendar-outline" size={19} color={colors.textMuted} />
      <input type="date" aria-label="Purchase date" max={max} value={value} onChange={(e) => onChange(e.currentTarget.value)}
        style={{ flex: 1, minWidth: 0, height: 48, border: 'none', outline: 'none', background: 'transparent', color: colors.text, fontSize: 14 }} />
      {!!value && <Pressable accessibilityLabel="Clear purchase date" onPress={() => onChange('')}><Ionicons name="close-circle" size={19} color={colors.textMuted} /></Pressable>}
    </View>
  </View>;
}
