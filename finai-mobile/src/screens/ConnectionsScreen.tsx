import { Ionicons } from '@expo/vector-icons';
import { Alert, Pressable, StyleSheet, Text, View } from 'react-native';
import { Body, Card, Divider, Heading, IconTile, Screen } from '../components/ui';
import { PROVIDERS } from '../data/sample';
import { useStore } from '../lib/store';
import { useTheme } from '../lib/theme';

export default function ConnectionsScreen() {
  const { colors } = useTheme();
  const { connected, setConnected } = useStore();
  const linkedCount = PROVIDERS.filter((p) => connected[p.name]).length;

  // Real brokerage linking is being built separately; for now this only records the choice on the device.
  function toggle(name: string) {
    if (connected[name]) {
      Alert.alert(`Disconnect ${name}?`, 'FIN/AI will stop syncing this account.', [
        { text: 'Cancel', style: 'cancel' },
        { text: 'Disconnect', style: 'destructive', onPress: () => setConnected(name, false) },
      ]);
    } else {
      setConnected(name, true);
    }
  }

  return (
    <Screen>
      <View style={{ gap: 4 }}>
        <Heading size="xl">Connections</Heading>
        <Body>
          {linkedCount} of {PROVIDERS.length} accounts linked
        </Body>
      </View>

      <Card style={{ paddingVertical: 4 }}>
        {PROVIDERS.map((provider, i) => {
          const isConnected = Boolean(connected[provider.name]);
          return (
            <View key={provider.name}>
              {i > 0 && <Divider />}
              <View style={styles.row}>
                <View style={[styles.logo, { backgroundColor: provider.color }]}>
                  <Text style={styles.logoText}>{provider.letter}</Text>
                </View>
                <View style={{ flex: 1 }}>
                  <Text style={{ color: colors.text, fontWeight: '700', fontSize: 15 }}>{provider.name}</Text>
                  <View style={{ flexDirection: 'row', alignItems: 'center', gap: 6, marginTop: 2 }}>
                    <View style={{ width: 6, height: 6, borderRadius: 3, backgroundColor: isConnected ? colors.positive : colors.textSubtle }} />
                    <Text style={{ color: colors.textMuted, fontSize: 13 }}>{isConnected ? 'Synced just now' : provider.kind}</Text>
                  </View>
                </View>
                <Pressable
                  onPress={() => toggle(provider.name)}
                  style={({ pressed }) => [
                    styles.action,
                    isConnected
                      ? { borderColor: colors.border, backgroundColor: pressed ? colors.surfaceMuted : 'transparent' }
                      : { borderColor: 'transparent', backgroundColor: pressed ? colors.accent : colors.accentSoft },
                  ]}
                >
                  <Text style={{ color: isConnected ? colors.text : colors.accent, fontWeight: '700', fontSize: 13 }}>
                    {isConnected ? 'Manage' : 'Connect'}
                  </Text>
                </Pressable>
              </View>
            </View>
          );
        })}
      </Card>

      <Card>
        <View style={{ flexDirection: 'row', gap: 12 }}>
          <IconTile name="lock-closed-outline" tone="positive" />
          <View style={{ flex: 1, gap: 4 }}>
            <Text style={{ color: colors.text, fontWeight: '700', fontSize: 15 }}>Read-only and secure</Text>
            <Body style={{ fontSize: 14, lineHeight: 20 }}>
              Accounts link through your provider’s own sign-in. FIN/AI can view balances and positions, but can never move money or place trades.
            </Body>
          </View>
        </View>
      </Card>

      <View style={{ flexDirection: 'row', alignItems: 'center', gap: 8, paddingHorizontal: 4 }}>
        <Ionicons name="information-circle-outline" size={16} color={colors.textSubtle} />
        <Text style={{ color: colors.textSubtle, fontSize: 12, flex: 1 }}>More brokerages, including Questrade and Interactive Brokers, are coming soon.</Text>
      </View>
    </Screen>
  );
}

const styles = StyleSheet.create({
  row: { flexDirection: 'row', alignItems: 'center', gap: 12, paddingVertical: 14 },
  logo: { width: 44, height: 44, borderRadius: 13, alignItems: 'center', justifyContent: 'center' },
  logoText: { color: '#fff', fontWeight: '900', fontSize: 18 },
  action: { borderWidth: 1, borderRadius: 10, paddingHorizontal: 14, paddingVertical: 8 },
});
