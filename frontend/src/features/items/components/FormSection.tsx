import type { ReactNode } from 'react';
import { View, Text } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { colors } from '@/constants/theme';
import { itemStyles as s } from '../styles/createItemStyles';

type IconName = React.ComponentProps<typeof Ionicons>['name'];
export default function FormSection({ title, subtitle, icon, children }: { title: string; subtitle: string; icon: IconName; children: ReactNode }) {
  return <View style={s.card}>
    <View style={s.cardHeader}>
      <View style={s.sectionIcon}><Ionicons name={icon} size={21} color={colors.primary} /></View>
      <View style={{ flex: 1 }}><Text style={s.sectionTitle}>{title}</Text><Text style={s.sectionSubtitle}>{subtitle}</Text></View>
    </View>
    <View style={s.cardBody}>{children}</View>
  </View>;
}
