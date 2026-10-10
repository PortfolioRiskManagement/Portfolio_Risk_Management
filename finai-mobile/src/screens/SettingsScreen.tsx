import { Ionicons } from '@expo/vector-icons';
import Constants from 'expo-constants';
import { LinearGradient } from 'expo-linear-gradient';
import { useState } from 'react';
import { Alert, Pressable, StyleSheet, Text, View } from 'react-native';
import { Body, Card, CardHeader, Divider, ErrorBox, GradientButton, Heading, Input, OutlineButton, Screen, type IconName } from '../components/ui';
import { displayName, friendlyAuthError, useAuth } from '../lib/auth';
import { useStore } from '../lib/store';
import { supabase } from '../lib/supabase';
import { brand, useTheme, type ThemePreference } from '../lib/theme';

const THEMES: { value: ThemePreference; label: string; icon: IconName }[] = [
  { value: 'system', label: 'Auto', icon: 'phone-portrait-outline' },
  { value: 'light', label: 'Light', icon: 'sunny-outline' },
  { value: 'dark', label: 'Dark', icon: 'moon-outline' },
];

export default function SettingsScreen() {
  const { colors, preference, setPreference } = useTheme();
  const { user, signOut } = useAuth();
  const { resetHoldings } = useStore();
  const name = displayName(user);
  const [editing, setEditing] = useState(false);
  const [draftName, setDraftName] = useState(name);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');

  async function saveName() {
    if (!draftName.trim()) return setError('Enter your name.');
    setSaving(true);
    setError('');
    const { error: updateError } = await supabase.auth.updateUser({ data: { full_name: draftName.trim() } });
    setSaving(false);
    if (updateError) return setError(friendlyAuthError(updateError));
    setEditing(false);
  }

  function confirmSignOut() {
    Alert.alert('Sign out?', 'You can sign back in any time.', [
      { text: 'Cancel', style: 'cancel' },
      { text: 'Sign out', style: 'destructive', onPress: () => signOut() },
    ]);
  }

  function confirmReset() {
    Alert.alert('Reset sample holdings?', 'This replaces your holdings on this device with the original sample portfolio.', [
      { text: 'Cancel', style: 'cancel' },
      { text: 'Reset', style: 'destructive', onPress: resetHoldings },
    ]);
  }

  return (
    <Screen>
      <Heading size="xl">Settings</Heading>

      {/* Profile */}
      <Card>
        <View style={{ flexDirection: 'row', alignItems: 'center', gap: 14 }}>
          <LinearGradient colors={brand.gradient} start={{ x: 0, y: 0 }} end={{ x: 1, y: 1 }} style={styles.avatar}>
            <Text style={{ color: '#fff', fontWeight: '800', fontSize: 22 }}>{name.charAt(0).toUpperCase()}</Text>
          </LinearGradient>
          <View style={{ flex: 1 }}>
            <Text style={{ color: colors.text, fontWeight: '700', fontSize: 17 }} numberOfLines={1}>{name}</Text>
            <Text style={{ color: colors.textMuted, fontSize: 14 }} numberOfLines={1}>{user?.email}</Text>
          </View>
          {!editing && (
            <Pressable onPress={() => { setDraftName(name); setEditing(true); }} hitSlop={8}>
              <Text style={{ color: colors.accent, fontWeight: '700' }}>Edit</Text>
            </Pressable>
          )}
        </View>
        {editing && (
          <View style={{ gap: 12, marginTop: 16 }}>
            <Input label="Full name" value={draftName} onChangeText={setDraftName} autoFocus returnKeyType="done" onSubmitEditing={saveName} />
            {error ? <ErrorBox message={error} /> : null}
            <View style={{ flexDirection: 'row', gap: 10 }}>
              <View style={{ flex: 1 }}>
                <OutlineButton title="Cancel" onPress={() => setEditing(false)} />
              </View>
              <View style={{ flex: 1 }}>
                <GradientButton title="Save" onPress={saveName} loading={saving} />
              </View>
            </View>
          </View>
        )}
      </Card>

      {/* Appearance */}
      <Card>
        <CardHeader title="Appearance" />
        <View style={[styles.segment, { backgroundColor: colors.surfaceMuted }]}>
          {THEMES.map((t) => {
            const active = t.value === preference;
            return (
              <Pressable
                key={t.value}
                onPress={() => setPreference(t.value)}
                style={[styles.segmentItem, active && { backgroundColor: colors.surface, borderColor: colors.border, borderWidth: StyleSheet.hairlineWidth }]}
              >
                <Ionicons name={t.icon} size={16} color={active ? colors.text : colors.textMuted} />
                <Text style={{ color: active ? colors.text : colors.textMuted, fontWeight: '600', fontSize: 14 }}>{t.label}</Text>
              </Pressable>
            );
          })}
        </View>
      </Card>

      {/* About */}
      <Card style={{ paddingVertical: 4 }}>
        {[
          { icon: 'shield-checkmark-outline' as IconName, label: 'Read-only access', value: 'Always' },
          { icon: 'information-circle-outline' as IconName, label: 'Version', value: Constants.expoConfig?.version ?? '1.0.0' },
        ].map((row, i) => (
          <View key={row.label}>
            {i > 0 && <Divider />}
            <View style={styles.row}>
              <Ionicons name={row.icon} size={20} color={colors.textMuted} />
              <Text style={{ flex: 1, color: colors.text, fontSize: 15 }}>{row.label}</Text>
              <Text style={{ color: colors.textMuted, fontSize: 15 }}>{row.value}</Text>
            </View>
          </View>
        ))}
        <Divider />
        <Pressable onPress={confirmReset} style={styles.row}>
          <Ionicons name="refresh-outline" size={20} color={colors.textMuted} />
          <Text style={{ flex: 1, color: colors.text, fontSize: 15 }}>Reset sample holdings</Text>
          <Ionicons name="chevron-forward" size={18} color={colors.textSubtle} />
        </Pressable>
      </Card>

      <OutlineButton title="Sign out" icon="log-out-outline" tone="negative" onPress={confirmSignOut} />
      <Body style={{ textAlign: 'center', fontSize: 12 }}>FIN/AI provides educational analysis only and is not financial advice.</Body>
    </Screen>
  );
}

const styles = StyleSheet.create({
  avatar: { width: 54, height: 54, borderRadius: 18, alignItems: 'center', justifyContent: 'center' },
  segment: { flexDirection: 'row', borderRadius: 12, padding: 4, gap: 4 },
  segmentItem: { flex: 1, flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 6, paddingVertical: 10, borderRadius: 9 },
  row: { flexDirection: 'row', alignItems: 'center', gap: 12, paddingVertical: 14 },
});
