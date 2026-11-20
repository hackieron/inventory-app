import { Ionicons } from '@expo/vector-icons';
import { StyleSheet, Text, View } from 'react-native';
import { colors, spacing } from '@/constants/theme';
export default function ProfileMessage({ message }: { message: string }) { return <View style={styles.error}><Ionicons name="alert-circle-outline" size={18} color={colors.danger} /><Text style={styles.text}>{message}</Text></View>; }
const styles = StyleSheet.create({ error: { flexDirection: 'row', alignItems: 'center', gap: spacing.xs, backgroundColor: colors.dangerBg, borderRadius: 14, padding: spacing.sm, marginBottom: spacing.xs }, text: { color: colors.danger, fontSize: 13, flex: 1 } });
