import { StyleSheet, Text, View } from 'react-native';
import { colors, spacing } from '@/constants/theme';
type Props = { items: number; borrowed: number; contacts: number };
export default function ProfileStats({ items, borrowed, contacts }: Props) { return <View style={styles.wrap}>{[['Items', items], ['On loan', borrowed], ['Contacts', contacts]].map(([label, value]) => <View key={label} style={styles.row}><Text style={styles.label}>{label}</Text><Text style={styles.value}>{value}</Text></View>)}</View>; }
const styles = StyleSheet.create({ wrap: { borderTopWidth: 1, borderTopColor: colors.border, marginTop: spacing.lg, marginHorizontal: spacing.lg }, row: { flexDirection: 'row', justifyContent: 'space-between', paddingVertical: spacing.sm + 2, paddingHorizontal: spacing.xs }, label: { color: colors.textMuted, fontSize: 15 }, value: { color: colors.text, fontSize: 15, fontWeight: '700' } });
