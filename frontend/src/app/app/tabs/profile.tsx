import { useCallback, useState } from 'react';
import { ActivityIndicator, RefreshControl, ScrollView, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import * as ImagePicker from 'expo-image-picker';
import { router, useFocusEffect } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { colors, spacing } from '@/constants/theme';
import { getProfile, logout, updateAvatar, updatePassword, updateProfile, type ProfileData } from '@/api/auth';
import { getToken, removeToken } from '@/utils/auth';
import { resolveMediaUrl } from '@/utils/media';
import ProfileHeader from '@/components/profile/ProfileHeader';
import ProfileMessage from '@/components/profile/ProfileMessage';
import ProfilePasswordForm from '@/components/profile/ProfilePasswordForm';
import ProfileStats from '@/components/profile/ProfileStats';

export default function ProfileScreen() {
  const insets = useSafeAreaInsets();
  const [profile, setProfile] = useState<ProfileData | null>(null);
  const [token, setToken] = useState<string | null>(null);
  const [name, setName] = useState(''); const [email, setEmail] = useState('');
  const [current, setCurrent] = useState(''); const [password, setPassword] = useState(''); const [confirmation, setConfirmation] = useState('');
  const [passwordOpen, setPasswordOpen] = useState(false); const [editing, setEditing] = useState(false); const [loading, setLoading] = useState(true); const [refreshing, setRefreshing] = useState(false); const [saving, setSaving] = useState(false); const [error, setError] = useState<string | null>(null);

  const load = useCallback(async () => { try { setError(null); const [next, savedToken] = await Promise.all([getProfile(), getToken()]); setProfile(next); setToken(savedToken); setName(next.user.name); setEmail(next.user.email); } catch { setError('Could not load your profile. Pull down to try again.'); } finally { setLoading(false); setRefreshing(false); } }, []);
  useFocusEffect(useCallback(() => { void load(); }, [load]));

  async function pickAvatar() { const result = await ImagePicker.launchImageLibraryAsync({ mediaTypes: ['images'], allowsEditing: true, aspect: [1, 1], quality: 0.85 }); if (result.canceled) return; try { setSaving(true); const user = await updateAvatar(result.assets[0].uri); setProfile((p) => p ? { ...p, user } : p); } catch (e: any) { setError(e.response?.data?.message ?? 'Could not update your profile picture.'); } finally { setSaving(false); } }
  async function save() { if (!name.trim() || !email.trim()) return setError('Name and email are required.'); try { setSaving(true); setError(null); const user = await updateProfile({ name: name.trim(), email: email.trim() }); setProfile((p) => p ? { ...p, user } : p); setName(user.name); setEmail(user.email); setEditing(false); } catch (e: any) { setError(e.response?.data?.message ?? 'Could not update your profile.'); } finally { setSaving(false); } }
  async function savePassword() { if (password.length < 8 || password !== confirmation) return setError('Use at least 8 characters and make sure both new passwords match.'); try { setSaving(true); await updatePassword({ current_password: current, password, password_confirmation: confirmation }); setCurrent(''); setPassword(''); setConfirmation(''); setPasswordOpen(false); setError(null); } catch (e: any) { setError(e.response?.data?.message ?? 'Could not update your password.'); } finally { setSaving(false); } }
  async function signOut() { try { await logout(); } finally { await removeToken(); router.replace('/auth'); } }

  if (loading) return <View style={styles.center}><ActivityIndicator color={colors.primary} /></View>;
  const user = profile?.user; const initials = user?.name.split(' ').filter(Boolean).map((part) => part[0]).join('').slice(0, 2).toUpperCase() || '?'; const avatar = user?.avatar ? resolveMediaUrl(`${process.env.EXPO_PUBLIC_API_URL || 'http://10.0.2.2:8000/api'}/profile/avatar`) : null; const dirty = !!user && (name.trim() !== user.name || email.trim() !== user.email);
  return <ScrollView style={styles.container} contentContainerStyle={styles.content} keyboardShouldPersistTaps="handled" refreshControl={<RefreshControl refreshing={refreshing} onRefresh={() => { setRefreshing(true); void load(); }} tintColor={colors.primary} />}><ProfileHeader name={name} email={email} initials={initials} avatar={avatar} token={token} topInset={insets.top} editing={editing} onChangeAvatar={pickAvatar} onChangeEditing={() => setEditing((value) => !value)} onChangeName={setName} onChangeEmail={setEmail} />{error && <ProfileMessage message={error} />}{dirty && <TouchableOpacity style={styles.saveButton} onPress={save} disabled={saving}><Text style={styles.buttonText}>{saving ? 'Saving…' : 'Save changes'}</Text></TouchableOpacity>}<ProfileStats items={profile?.stats.items_count ?? 0} borrowed={profile?.stats.borrowed_items_count ?? 0} contacts={profile?.stats.contacts_count ?? 0} /><TouchableOpacity style={styles.passwordButton} onPress={() => setPasswordOpen((value) => !value)}><Text style={styles.buttonText}>Change Password</Text><Ionicons name={passwordOpen ? 'chevron-up' : 'lock-closed'} size={15} color="#FFFFFF" /></TouchableOpacity>{passwordOpen && <ProfilePasswordForm current={current} password={password} confirmation={confirmation} saving={saving} onCurrent={setCurrent} onPassword={setPassword} onConfirmation={setConfirmation} onSubmit={savePassword} />}<TouchableOpacity style={styles.logoutButton} onPress={signOut}><Text style={styles.logoutText}>Logout</Text><Ionicons name="log-out-outline" size={17} color={colors.danger} /></TouchableOpacity></ScrollView>;
}

const styles = StyleSheet.create({ container: { flex: 1, backgroundColor: colors.bg }, content: { paddingBottom: 96 }, center: { flex: 1, alignItems: 'center', justifyContent: 'center', backgroundColor: colors.bg }, saveButton: { height: 52, borderRadius: 26, alignItems: 'center', justifyContent: 'center', marginHorizontal: spacing.lg, marginTop: spacing.md, backgroundColor: colors.primary }, passwordButton: { height: 52, borderRadius: 26, flexDirection: 'row', gap: spacing.sm, alignItems: 'center', justifyContent: 'center', marginHorizontal: spacing.lg, marginTop: spacing.lg, backgroundColor: colors.text }, buttonText: { color: '#FFFFFF', fontSize: 15, fontWeight: '700' }, logoutButton: { height: 52, borderRadius: 26, flexDirection: 'row', gap: spacing.sm, alignItems: 'center', justifyContent: 'center', marginHorizontal: spacing.lg, marginTop: spacing.md, borderWidth: 1.5, borderColor: colors.danger }, logoutText: { color: colors.danger, fontSize: 15, fontWeight: '700' } });
