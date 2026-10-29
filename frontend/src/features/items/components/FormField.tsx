import { useState } from 'react';
import { View, Text, TextInput } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { colors } from '@/constants/theme';
import { itemStyles as s } from '../styles/createItemStyles';

type IconName = React.ComponentProps<typeof Ionicons>['name'];
interface Props {
  label: string; icon: IconName; value: string; onChangeText: (value: string) => void;
  placeholder: string; required?: boolean; multiline?: boolean; hint?: string;
  autoCapitalize?: 'none' | 'sentences' | 'words' | 'characters';
}
export default function FormField({ label, icon, value, onChangeText, placeholder, required = false, multiline = false, hint, autoCapitalize = 'sentences' }: Props) {
  const [focused, setFocused] = useState(false);
  return <View style={s.field}>
    <View style={s.fieldHeader}>
      <Text style={s.fieldLabel}>{label}{required && <Text style={s.required}> *</Text>}</Text>
      {!required && <Text style={s.optional}>Optional</Text>}
    </View>
    <View style={[s.inputShell, multiline && s.multilineShell, focused && s.inputFocused]}>
      <Ionicons name={icon} size={19} color={focused ? colors.primary : colors.textMuted} />
      <TextInput accessibilityLabel={label} style={[s.input, multiline && s.multilineInput]}
        placeholder={placeholder} placeholderTextColor={colors.placeholder}
        value={value} onChangeText={onChangeText} autoCapitalize={autoCapitalize}
        onFocus={() => setFocused(true)} onBlur={() => setFocused(false)}
        multiline={multiline} textAlignVertical={multiline ? 'top' : 'center'} selectionColor={colors.primary} />
    </View>
    {!!hint && <Text style={s.hint}>{hint}</Text>}
  </View>;
}
