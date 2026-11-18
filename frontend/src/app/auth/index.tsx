import { useRef, useState } from 'react';
import {
  ActivityIndicator,
  KeyboardAvoidingView,
  Platform,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  View,
} from 'react-native';
import { Link, router } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { login } from '@/api/auth';
import { saveToken } from '@/utils/auth';
import { colors, radius, spacing } from '@/constants/theme';

type FieldErrors = { email?: string; password?: string };
type FieldName = 'email' | 'password';

const HEADER_GRADIENT = ['#3D176F', '#5A238E'] as const;
const BUTTON_GRADIENT = ['#54218D', '#B65CE0'] as const;
const ACCENT = '#54218D';
const BORDER = '#E3DDEA';
const MUTED = '#8F849B';

// Set to false to hide the social buttons until they are wired up.
const SHOW_SOCIAL = true;

export default function LoginScreen() {
  const insets = useSafeAreaInsets();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [focused, setFocused] = useState<FieldName | null>(null);
  const [errors, setErrors] = useState<FieldErrors>({});
  const [formError, setFormError] = useState<string | null>(null);
  const passwordRef = useRef<TextInput>(null);

  function validate() {
    const next: FieldErrors = {};
    if (!email.trim()) next.email = 'Enter your email.';
    else if (!/^\S+@\S+\.\S+$/.test(email.trim())) next.email = "That email doesn't look right.";
    if (!password) next.password = 'Enter your password.';
    setErrors(next);
    return Object.keys(next).length === 0;
  }

  async function handleLogin() {
    setFormError(null);
    if (!validate()) return;
    try {
      setLoading(true);
      const response = await login({ email: email.trim(), password });
      await saveToken(response.token);
      router.replace('/app/tabs/home');
    } catch (error: any) {
      const apiErrors = error.response?.data?.errors;
      if (apiErrors) setErrors({ email: apiErrors.email?.[0], password: apiErrors.password?.[0] });
      setFormError(
        error.response?.data?.message ?? 'Unable to sign in. Check your email and password and try again.'
      );
    } finally {
      setLoading(false);
    }
  }

  function clearError(field: FieldName) {
    if (errors[field]) setErrors((current) => ({ ...current, [field]: undefined }));
  }

  return (
    <LinearGradient colors={HEADER_GRADIENT} start={{ x: 0, y: 0 }} end={{ x: 1, y: 1 }} style={styles.screen}>
      <KeyboardAvoidingView style={styles.flex} behavior={Platform.OS === 'ios' ? 'padding' : undefined}>
        {/* Top bar */}
        <View style={[styles.topBar, { paddingTop: insets.top + spacing.sm }]}>
          <Pressable
            onPress={() => (router.canGoBack() ? router.back() : undefined)}
            hitSlop={10}
            accessibilityRole="button"
            accessibilityLabel="Go back"
          >
            <Ionicons name="arrow-back" size={22} color="#fff" />
          </Pressable>
          <View style={styles.topBarRight}>
            <Text style={styles.topBarText}>Don&apos;t have an account?</Text>
            <Link href="/auth/register" style={styles.topBarPill}>
              Sign up
            </Link>
          </View>
        </View>

        <ScrollView
          contentContainerStyle={styles.scroll}
          keyboardShouldPersistTaps="handled"
          showsVerticalScrollIndicator={false}
        >
          {/* Brand */}
          <View style={styles.brand}>
            <View style={styles.brandMark}>
              <Ionicons name="cube-outline" size={22} color="#fff" />
            </View>
            <Text style={styles.brandName}>Inventory</Text>
          </View>

          {/* Sheet */}
          <View style={[styles.sheet, { paddingBottom: insets.bottom + spacing.lg }]}>
            <Text style={styles.title}>Welcome back</Text>
            <Text style={styles.subtitle}>Enter your details below</Text>

            {!!formError && (
              <View style={styles.errorBox} accessibilityRole="alert">
                <Ionicons name="alert-circle" size={18} color={colors.danger} />
                <Text style={styles.errorText}>{formError}</Text>
              </View>
            )}

            <View style={styles.form}>
              <View>
                <View
                  style={[
                    styles.field,
                    focused === 'email' && styles.fieldFocused,
                    !!errors.email && styles.fieldError,
                  ]}
                >
                  <Text style={styles.fieldLabel}>Email address</Text>
                  <TextInput
                    value={email}
                    onChangeText={(value) => {
                      setEmail(value);
                      clearError('email');
                    }}
                    onFocus={() => setFocused('email')}
                    onBlur={() => setFocused(null)}
                    placeholder="you@example.com"
                    placeholderTextColor="#B8AFC2"
                    keyboardType="email-address"
                    autoCapitalize="none"
                    autoCorrect={false}
                    autoComplete="email"
                    textContentType="emailAddress"
                    editable={!loading}
                    returnKeyType="next"
                    onSubmitEditing={() => passwordRef.current?.focus()}
                    style={styles.input}
                  />
                </View>
                {!!errors.email && <Text style={styles.errorHint}>{errors.email}</Text>}
              </View>

              <View>
                <View
                  style={[
                    styles.field,
                    focused === 'password' && styles.fieldFocused,
                    !!errors.password && styles.fieldError,
                  ]}
                >
                  <Text style={styles.fieldLabel}>Password</Text>
                  <View style={styles.passwordRow}>
                    <TextInput
                      ref={passwordRef}
                      value={password}
                      onChangeText={(value) => {
                        setPassword(value);
                        clearError('password');
                      }}
                      onFocus={() => setFocused('password')}
                      onBlur={() => setFocused(null)}
                      placeholder="Enter your password"
                      placeholderTextColor="#B8AFC2"
                      secureTextEntry={!showPassword}
                      autoCapitalize="none"
                      autoCorrect={false}
                      autoComplete="password"
                      textContentType="password"
                      editable={!loading}
                      returnKeyType="done"
                      onSubmitEditing={handleLogin}
                      style={[styles.input, styles.flex]}
                    />
                    <Pressable
                      onPress={() => setShowPassword((value) => !value)}
                      hitSlop={10}
                      accessibilityRole="button"
                      accessibilityLabel={showPassword ? 'Hide password' : 'Show password'}
                    >
                      <Ionicons name={showPassword ? 'eye-off-outline' : 'eye-outline'} size={20} color={MUTED} />
                    </Pressable>
                  </View>
                </View>
                {!!errors.password && <Text style={styles.errorHint}>{errors.password}</Text>}
              </View>

              <Pressable
                onPress={handleLogin}
                disabled={loading}
                accessibilityRole="button"
                style={({ pressed }) => [pressed && styles.pressed, loading && styles.disabled]}
              >
                <LinearGradient
                  colors={BUTTON_GRADIENT}
                  start={{ x: 0, y: 0 }}
                  end={{ x: 1, y: 0 }}
                  style={styles.button}
                >
                  {loading ? <ActivityIndicator color="#fff" /> : <Text style={styles.buttonText}>Sign in</Text>}
                </LinearGradient>
              </Pressable>

              {/* TODO: point this at your forgot-password route */}
              <Pressable onPress={() => { }} hitSlop={8} style={styles.forgot}>
                <Text style={styles.forgotText}>Forgot your password?</Text>
              </Pressable>
            </View>

            {SHOW_SOCIAL && (
              <>
                <View style={styles.dividerRow}>
                  <View style={styles.dividerLine} />
                  <Text style={styles.dividerText}>or sign in with</Text>
                  <View style={styles.dividerLine} />
                </View>

                <View style={styles.socialRow}>
                  {/* TODO: hook up Google / Facebook auth */}
                  <Pressable style={styles.socialButton} onPress={() => { }} accessibilityLabel="Sign in with Google">
                    <Ionicons name="logo-google" size={18} color="#DB4437" />
                    <Text style={styles.socialText}>Google</Text>
                  </Pressable>
                  <Pressable style={styles.socialButton} onPress={() => { }} accessibilityLabel="Sign in with Facebook">
                    <Ionicons name="logo-facebook" size={18} color="#1877F2" />
                    <Text style={styles.socialText}>Facebook</Text>
                  </Pressable>
                </View>
              </>
            )}
          </View>
        </ScrollView>
      </KeyboardAvoidingView>
    </LinearGradient>
  );
}

const styles = StyleSheet.create({
  flex: { flex: 1 },
  screen: { flex: 1 },
  topBar: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: spacing.lg,
    paddingBottom: spacing.sm,
  },
  topBarRight: { flexDirection: 'row', alignItems: 'center', gap: spacing.sm },
  topBarText: { color: 'rgba(255,255,255,0.75)', fontSize: 12 },
  topBarPill: {
    color: '#fff',
    fontSize: 12,
    fontWeight: '700',
    backgroundColor: 'rgba(255,255,255,0.2)',
    paddingHorizontal: spacing.md,
    paddingVertical: 6,
    borderRadius: 999,
    overflow: 'hidden',
  },
  scroll: { flexGrow: 1 },
  brand: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: spacing.sm,
    paddingVertical: spacing.xl,
  },
  brandMark: {
    width: 38,
    height: 38,
    borderRadius: 12,
    backgroundColor: 'rgba(255,255,255,0.18)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  brandName: { color: '#fff', fontSize: 26, fontWeight: '800', letterSpacing: -0.5 },
  sheet: {
    flex: 1,
    width: '100%',
    maxWidth: 480,
    alignSelf: 'center',
    backgroundColor: '#fff',
    borderTopLeftRadius: 28,
    borderTopRightRadius: 28,
    paddingHorizontal: spacing.lg,
    paddingTop: spacing.xl,
  },
  title: { color: colors.text, fontSize: 24, fontWeight: '800', textAlign: 'center', letterSpacing: -0.4 },
  subtitle: {
    color: colors.textMuted,
    fontSize: 14,
    textAlign: 'center',
    marginTop: spacing.xs,
    marginBottom: spacing.lg,
  },
  errorBox: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
    backgroundColor: colors.dangerBg,
    borderRadius: radius.md,
    padding: spacing.md,
    marginBottom: spacing.md,
  },
  errorText: { flex: 1, color: colors.danger, fontSize: 13, lineHeight: 18 },
  form: { gap: spacing.md },
  field: {
    borderWidth: 1.5,
    borderColor: BORDER,
    borderRadius: 12,
    paddingHorizontal: spacing.md,
    paddingTop: 8,
    paddingBottom: 4,
    backgroundColor: '#fff',
  },
  fieldFocused: { borderColor: ACCENT },
  fieldError: { borderColor: colors.danger },
  fieldLabel: { color: MUTED, fontSize: 11, fontWeight: '600' },
  input: { color: colors.text, fontSize: 15, minHeight: 34, paddingVertical: 2 },
  passwordRow: { flexDirection: 'row', alignItems: 'center', gap: spacing.sm },
  errorHint: { color: colors.danger, fontSize: 12, marginTop: spacing.xs },
  button: { minHeight: 52, borderRadius: 12, alignItems: 'center', justifyContent: 'center' },
  buttonText: { color: '#fff', fontSize: 16, fontWeight: '700' },
  pressed: { opacity: 0.9, transform: [{ scale: 0.99 }] },
  disabled: { opacity: 0.6 },
  forgot: { alignSelf: 'center', paddingVertical: spacing.xs },
  forgotText: { color: ACCENT, fontSize: 13, fontWeight: '600' },
  dividerRow: { flexDirection: 'row', alignItems: 'center', gap: spacing.md, marginVertical: spacing.lg },
  dividerLine: { flex: 1, height: 1, backgroundColor: BORDER },
  dividerText: { color: MUTED, fontSize: 12 },
  socialRow: { flexDirection: 'row', gap: spacing.md },
  socialButton: {
    flex: 1,
    minHeight: 48,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: spacing.sm,
    borderWidth: 1.5,
    borderColor: BORDER,
    borderRadius: 12,
  },
  socialText: { color: colors.text, fontSize: 14, fontWeight: '600' },
});