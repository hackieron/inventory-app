
import { useState } from 'react';
import {
  Platform,
  Pressable,
  Text,
  View,
} from 'react-native';
import DateTimePicker from '@react-native-community/datetimepicker';
import { Ionicons } from '@expo/vector-icons';

import { colors } from '@/constants/theme';
import { itemStyles as s } from '../styles/createItemStyles';

interface DatePickerFieldProps {
  value: string;
  onChange: (date: string) => void;
}

function formatDate(date: Date): string {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, '0');
  const day = String(date.getDate()).padStart(2, '0');

  return `${year}-${month}-${day}`;
}

export default function DatePickerField({
  value,
  onChange,
}: DatePickerFieldProps) {
  const [showPicker, setShowPicker] = useState(false);

  const selectedDate = value
    ? new Date(`${value}T12:00:00`)
    : new Date();

  const displayDate = value
    ? selectedDate.toLocaleDateString('en-US', {
        month: 'long',
        day: 'numeric',
        year: 'numeric',
      })
    : 'Select purchase date';

  const handleValueChange = (
    event: any,
    date?: Date
  ) => {
    if (date) {
      onChange(formatDate(date));
    }

    if (Platform.OS === 'android') {
      setShowPicker(false);
    }
  };

  return (
    <View style={s.field}>
      <View style={s.fieldHeader}>
        <Text style={s.fieldLabel}>Purchase date</Text>
        <Text style={s.optional}>Optional</Text>
      </View>

      <Pressable
        style={s.inputShell}
        onPress={() => setShowPicker(true)}
        accessibilityRole="button"
        accessibilityLabel="Select purchase date"
      >
        <Ionicons
          name="calendar-outline"
          size={19}
          color={colors.textMuted}
        />

        <Text
          style={{
            flex: 1,
            fontSize: 14,
            color: value ? colors.text : colors.placeholder,
          }}
        >
          {displayDate}
        </Text>

        {value ? (
          <Pressable
            onPress={(event) => {
              event.stopPropagation();
              onChange('');
            }}
            hitSlop={10}
          >
            <Ionicons
              name="close-circle"
              size={19}
              color={colors.textMuted}
            />
          </Pressable>
        ) : (
          <Ionicons
            name="chevron-down"
            size={17}
            color={colors.textMuted}
          />
        )}
      </Pressable>

      {showPicker && (
        <DateTimePicker
          value={selectedDate}
          mode="date"
          display={Platform.OS === 'ios' ? 'spinner' : 'default'}
          maximumDate={new Date()}
          onValueChange={handleValueChange}
          onDismiss={() => setShowPicker(false)}
        />
      )}

      {Platform.OS === 'ios' && showPicker && (
        <Pressable
          onPress={() => setShowPicker(false)}
          style={{ alignSelf: 'flex-end', padding: 12 }}
        >
          <Text
            style={{
              color: colors.primary,
              fontWeight: '700',
            }}
          >
            Done
          </Text>
        </Pressable>
      )}
    </View>
  );
}
