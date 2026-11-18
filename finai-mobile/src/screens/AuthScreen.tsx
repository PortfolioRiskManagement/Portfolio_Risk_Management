import { Ionicons } from '@expo/vector-icons';
import * as AppleAuthentication from 'expo-apple-authentication';
import { useEffect, useRef, useState } from 'react';
import { KeyboardAvoidingView, Platform, Pressable, ScrollView, StyleSheet, Text, TextInput, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Body, BrandMark, ErrorBox, GradientButton, Heading, Input } from '../components/ui';
import { friendlyAuthError } from '../lib/auth';
import { isAppleLoginAvailable, isGoogleLoginConfigured, signInWithApple, signInWithGoogle } from '../lib/socialLogin';
import { supabase } from '../lib/supabase';
import { useTheme } from '../lib/theme';
import type { AuthScreenProps } from '../navigation/types';

const COPY = {
  login: { title: 'Welcome back', subtitle: 'Log in to see your portfolio.', button: 'Log in' },
  signup: { title: 'Create your account', subtitle: 'Start understanding your portfolio in minutes.', button: 'Create account' },
  reset: { title: 'Reset your password', subtitle: 'We’ll email you a link to choose a new one.', button: 'Send reset link' },
};

export default function AuthScreen({ navigation, route }: AuthScreenProps<'Auth'>) {
  const { colors } = useTheme();
  const insets = useSafeAreaInsets();
  const [mode, setMode] = useState(route.params.mode);
  const [fullName, setFullName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState('');
  const [busy, setBusy] = useState(false);
  const [sentTo, setSentTo] = useState('');
  const [appleAvailable, setAppleAvailable] = useState(false);
  const emailRef = useRef<TextInput>(null);
  const passwordRef = useRef<TextInput>(null);

  useEffect(() => {
    isAppleLoginAvailable().then(setAppleAvailable);
  }, []);

  function switchMode(next: typeof mode) {
    setMode(next);
    setError('');
    setSentTo('');
  }

  async function submit() {
    setError('');
    const trimmedEmail = email.trim().toLowerCase();
    if (!/^\S+@\S+\.\S+$/.test(trimmedEmail)) return setError('Enter a valid email address.');
    if (mode !== 'reset' && password.length < 8) return setError('Use a password with at least 8 characters.');
    if (mode === 'signup' && !fullName.trim()) return setError('Enter your full name.');

    setBusy(true);
    try {
      if (mode === 'login') {
        const { error: signInError } = await supabase.auth.signInWithPassword({ email: trimmedEmail, password });
        if (signInError) throw signInError;
      } else if (mode === 'signup') {
        const { data, error: signUpError } = await supabase.auth.signUp({
          email: trimmedEmail,
          password,
          options: { data: { full_name: fullName.trim() } },
        });
        if (signUpError) throw signUpError;
        // With email confirmation on, there is no session until the link is clicked.
        if (!data.session) setSentTo(trimmedEmail);
      } else {
        const { error: resetError } = await supabase.auth.resetPasswordForEmail(trimmedEmail);
        if (resetError) throw resetError;
        setSentTo(trimmedEmail);
      }
    } catch (err) {
      setError(friendlyAuthError(err));
    } finally {
      setBusy(false);
    }
  }

  async function social(provider: 'apple' | 'google') {
    setError('');
    try {
      await (provider === 'apple' ? signInWithApple() : signInWithGoogle());
    } catch (err) {
      setError(friendlyAuthError(err));
    }
  }

  const copy = COPY[mode];

  if (sentTo) {
    return (
      <View style={[styles.centered, { backgroundColor: colors.background, paddingTop: insets.top }]}>
        <View style={[styles.mailIcon, { backgroundColor: colors.accentSoft }]}>
          <Ionicons name="mail-unread-outline" size={34} color={colors.accent} />
        </View>
        <Heading>Check your email</Heading>
        <Body style={{ textAlign: 'center' }}>
          We sent a {mode === 'reset' ? 'password reset' : 'confirmation'} link to{'\n'}
          <Text style={{ color: colors.text, fontWeight: '700' }}>{sentTo}</Text>
        </Body>
        <Body style={{ textAlign: 'center', fontSize: 13 }}>Can’t find it? Check your spam or promotions folder.</Body>
        <Pressable onPress={() => switchMode('login')} style={{ marginTop: 12 }} hitSlop={8}>
          <Text style={{ color: colors.accent, fontWeight: '700', fontSize: 15 }}>Back to log in</Text>
        </Pressable>
      </View>
    );
  }

  return (
    <KeyboardAvoidingView style={{ flex: 1, backgroundColor: colors.background }} behavior={Platform.OS === 'ios' ? 'padding' : undefined}>
      <ScrollView
        contentContainerStyle={{ paddingTop: insets.top + 12, paddingBottom: insets.bottom + 24, paddingHorizontal: 24, gap: 22 }}
        keyboardShouldPersistTaps="handled"
      >
        <View style={styles.topBar}>
          <Pressable onPress={() => navigation.goBack()} hitSlop={12} accessibilityLabel="Back">
            <Ionicons name="chevron-back" size={26} color={colors.text} />
          </Pressable>
          <BrandMark />
          <View style={{ width: 26 }} />
        </View>

        <View style={{ gap: 6, marginTop: 8 }}>
          <Heading size="xl">{copy.title}</Heading>
          <Body>{copy.subtitle}</Body>
        </View>

        {mode !== 'reset' && (appleAvailable || isGoogleLoginConfigured) && (
          <View style={{ gap: 10 }}>
            {appleAvailable && (
              <AppleAuthentication.AppleAuthenticationButton
                buttonType={
                  mode === 'signup'
                    ? AppleAuthentication.AppleAuthenticationButtonType.SIGN_UP
                    : AppleAuthentication.AppleAuthenticationButtonType.SIGN_IN
                }
                buttonStyle={
                  colors.isDark ? AppleAuthentication.AppleAuthenticationButtonStyle.WHITE : AppleAuthentication.AppleAuthenticationButtonStyle.BLACK
                }
                cornerRadius={14}
                style={{ height: 52 }}
                onPress={() => social('apple')}
              />
            )}
            {isGoogleLoginConfigured && (
              <Pressable
                onPress={() => social('google')}
                style={({ pressed }) => [styles.google, { borderColor: colors.border, backgroundColor: pressed ? colors.surfaceMuted : colors.surface }]}
              >
                <Ionicons name="logo-google" size={18} color={colors.text} />
                <Text style={{ color: colors.text, fontSize: 16, fontWeight: '600' }}>Continue with Google</Text>
              </Pressable>
            )}
            <View style={styles.orRow}>
              <View style={[styles.orLine, { backgroundColor: colors.border }]} />
              <Text style={{ color: colors.textSubtle, fontSize: 13 }}>or with email</Text>
              <View style={[styles.orLine, { backgroundColor: colors.border }]} />
            </View>
          </View>
        )}

        <View style={{ gap: 16 }}>
          {mode === 'signup' && (
            <Input
              label="Full name"
              value={fullName}
              onChangeText={setFullName}
              placeholder="Jane Doe"
              autoComplete="name"
              textContentType="name"
              returnKeyType="next"
              onSubmitEditing={() => emailRef.current?.focus()}
            />
          )}
          <Input
            ref={emailRef}
            label="Email"
            value={email}
            onChangeText={setEmail}
            placeholder="you@example.com"
            autoCapitalize="none"
            autoComplete="email"
            keyboardType="email-address"
            textContentType="emailAddress"
            returnKeyType={mode === 'reset' ? 'send' : 'next'}
            onSubmitEditing={() => (mode === 'reset' ? submit() : passwordRef.current?.focus())}
          />
          {mode !== 'reset' && (
            <Input
              ref={passwordRef}
              label="Password"
              value={password}
              onChangeText={setPassword}
              placeholder={mode === 'signup' ? 'At least 8 characters' : 'Your password'}
              secureTextEntry={!showPassword}
              autoCapitalize="none"
              autoComplete={mode === 'signup' ? 'new-password' : 'current-password'}
              textContentType={mode === 'signup' ? 'newPassword' : 'password'}
              returnKeyType="go"
              onSubmitEditing={submit}
              right={
                <Pressable onPress={() => setShowPassword((v) => !v)} hitSlop={10} accessibilityLabel={showPassword ? 'Hide password' : 'Show password'}>
                  <Ionicons name={showPassword ? 'eye-off-outline' : 'eye-outline'} size={20} color={colors.textMuted} />
                </Pressable>
              }
            />
          )}
          {mode === 'login' && (
            <Pressable onPress={() => switchMode('reset')} style={{ alignSelf: 'flex-end' }} hitSlop={8}>
              <Text style={{ color: colors.accent, fontSize: 14, fontWeight: '600' }}>Forgot password?</Text>
            </Pressable>
          )}
        </View>

        {error ? <ErrorBox message={error} /> : null}

        <GradientButton title={copy.button} onPress={submit} loading={busy} />

        <Pressable onPress={() => switchMode(mode === 'signup' ? 'login' : 'signup')} style={{ alignItems: 'center' }} hitSlop={8}>
          <Text style={{ color: colors.textMuted, fontSize: 15 }}>
            {mode === 'signup' ? 'Already have an account? ' : 'New to FIN/AI? '}
            <Text style={{ color: colors.accent, fontWeight: '700' }}>{mode === 'signup' ? 'Log in' : 'Create an account'}</Text>
          </Text>
        </Pressable>

        <Text style={{ color: colors.textSubtle, fontSize: 12, textAlign: 'center', lineHeight: 18 }}>
          FIN/AI provides educational analysis only and is not financial advice.
        </Text>
      </ScrollView>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  topBar: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' },
  centered: { flex: 1, alignItems: 'center', justifyContent: 'center', paddingHorizontal: 32, gap: 12 },
  mailIcon: { width: 72, height: 72, borderRadius: 24, alignItems: 'center', justifyContent: 'center', marginBottom: 8 },
  google: { height: 52, borderRadius: 14, borderWidth: 1, flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 10 },
  orRow: { flexDirection: 'row', alignItems: 'center', gap: 12, marginTop: 4 },
  orLine: { flex: 1, height: StyleSheet.hairlineWidth },
});
