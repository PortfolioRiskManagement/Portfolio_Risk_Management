import { Ionicons } from '@expo/vector-icons';
import { Pressable, Text, View } from 'react-native';
import { Badge, Body, Card, CardHeader, Divider, Heading, IconTile, Label, Screen, ScoreBar, type IconName, type Tone } from '../components/ui';
import { SAMPLE_ACCOUNTS, type Account } from '../data/sample';
import { useStore } from '../lib/store';
import { money, percent, signedMoney } from '../lib/format';
import { brand, useTheme } from '../lib/theme';
import type { AppScreenProps, TabProps } from '../navigation/types';

export const ACCOUNT_META: Record<Account['type'], { icon: IconName; color: string; short: string }> = {
  RRSP: { icon: 'business-outline', color: brand.blue, short: 'RRSP' },
  TFSA: { icon: 'trending-up', color: brand.emerald, short: 'TFSA' },
  FHSA: { icon: 'home-outline', color: brand.purple, short: 'FHSA' },
  PERSONAL: { icon: 'briefcase-outline', color: brand.indigo, short: 'Personal' },
  CASH: { icon: 'wallet-outline', color: brand.emerald, short: 'Cash' },
};

export const STATUS: Record<Account['status'], { text: string; tone: Tone | 'neutral' }> = {
  optimized: { text: 'Optimized', tone: 'positive' },
  underused: { text: 'Underused', tone: 'warning' },
  overused: { text: 'Over limit', tone: 'negative' },
  normal: { text: 'On track', tone: 'neutral' },
};

function AccountIcon({ type }: { type: Account['type'] }) {
  const meta = ACCOUNT_META[type];
  return (
    <View style={{ width: 42, height: 42, borderRadius: 13, alignItems: 'center', justifyContent: 'center', backgroundColor: `${meta.color}22` }}>
      <Ionicons name={meta.icon} size={20} color={meta.color} />
    </View>
  );
}

function ContributionRoom({ account }: { account: Account }) {
  const { colors } = useTheme();
  if (account.contributionLimit <= 0) {
    return (
      <View style={{ flexDirection: 'row', justifyContent: 'space-between' }}>
        <Text style={{ color: colors.textMuted, fontSize: 13 }}>Contribution room</Text>
        <Text style={{ color: colors.textMuted, fontSize: 13 }}>No annual limit</Text>
      </View>
    );
  }
  const used = (account.contributionUsed / account.contributionLimit) * 100;
  return (
    <View style={{ gap: 8 }}>
      <View style={{ flexDirection: 'row', justifyContent: 'space-between' }}>
        <Text style={{ color: colors.textMuted, fontSize: 13 }}>Contribution room</Text>
        <Text style={{ color: colors.text, fontSize: 13, fontWeight: '700' }}>{money(account.contributionRoom)} left</Text>
      </View>
      <ScoreBar value={used} />
      <View style={{ flexDirection: 'row', justifyContent: 'space-between' }}>
        <Text style={{ color: colors.textSubtle, fontSize: 12 }}>{money(account.contributionUsed)} used</Text>
        <Text style={{ color: colors.textSubtle, fontSize: 12 }}>{money(account.contributionLimit)} limit</Text>
      </View>
    </View>
  );
}

export default function PortfolioScreen({ navigation }: TabProps<'Portfolio'>) {
  const { colors } = useTheme();
  const { liveAccounts, liveAccountValue } = useStore();
  const accounts: Account[] = liveAccounts.length > 0
    ? liveAccounts.map((account, index) => ({
        id: account.id,
        type: account.type === 'UNKNOWN' ? 'PERSONAL' : account.type,
        name: account.name,
        purpose: account.type === 'CASH' ? 'Cash and deposit account' : 'Investment account',
        balance: account.balance,
        gain: 0,
        gainPercent: 0,
        contributionRoom: 0,
        contributionUsed: 0,
        contributionLimit: 0,
        taxBenefit: account.type === 'PERSONAL' ? 'Capital gains are taxable.' : 'Tax treatment is determined by the account category.',
        status: 'normal',
        recommendedAction: 'View account details for the latest SnapTrade balance.',
      }))
    : SAMPLE_ACCOUNTS;
  const visibleAccounts = liveAccounts.length > 0 ? accounts.filter((account) => account.balance > 0) : accounts;
  const total = liveAccountValue ?? visibleAccounts.reduce((sum, a) => sum + a.balance, 0);
  const totalGain = liveAccounts.length > 0 ? 0 : SAMPLE_ACCOUNTS.reduce((sum, a) => sum + a.gain, 0);
  const registered = visibleAccounts.filter((a) => ['RRSP', 'TFSA', 'FHSA'].includes(a.type)).reduce((sum, a) => sum + a.balance, 0);
  const registeredPct = total > 0 ? (registered / total) * 100 : 0;

  return (
    <Screen>
      <View style={{ gap: 4 }}>
        <Heading size="xl">Your accounts</Heading>
        <Body>Balances, contribution room and tax treatment in one place.</Body>
      </View>

      <Card>
        <Label>Total portfolio</Label>
        <View style={{ flexDirection: 'row', alignItems: 'baseline', gap: 10, marginTop: 6 }}>
          <Text style={{ color: colors.text, fontSize: 32, fontWeight: '800', letterSpacing: -1 }}>{money(total)}</Text>
          <Text style={{ color: colors.positive, fontWeight: '700' }}>{signedMoney(totalGain)}</Text>
        </View>
        <View style={{ flexDirection: 'row', height: 8, borderRadius: 999, overflow: 'hidden', gap: 2, marginTop: 16, marginBottom: 10 }}>
          {visibleAccounts.map((a) => (
            <View key={a.id} style={{ flex: a.balance, backgroundColor: ACCOUNT_META[a.type].color }} />
          ))}
        </View>
        <View style={{ flexDirection: 'row', flexWrap: 'wrap', gap: 12 }}>
          {visibleAccounts.map((a) => (
            <View key={a.id} style={{ flexDirection: 'row', alignItems: 'center', gap: 6 }}>
              <View style={{ width: 8, height: 8, borderRadius: 4, backgroundColor: ACCOUNT_META[a.type].color }} />
              <Text style={{ color: colors.textMuted, fontSize: 12 }}>
                {ACCOUNT_META[a.type].short} <Text style={{ color: colors.text, fontWeight: '700' }}>{((a.balance / total) * 100).toFixed(0)}%</Text>
              </Text>
            </View>
          ))}
        </View>
        <View style={{ marginVertical: 16 }}>
          <Divider />
        </View>
        <View style={{ flexDirection: 'row', justifyContent: 'space-between' }}>
          <View>
            <Text style={{ color: colors.textMuted, fontSize: 13 }}>Registered</Text>
            <Text style={{ color: colors.text, fontWeight: '700', fontSize: 16, marginTop: 2 }}>{money(registered)}</Text>
          </View>
          <View style={{ alignItems: 'center' }}>
            <Text style={{ color: colors.textMuted, fontSize: 13 }}>Tax-sheltered</Text>
            <Text style={{ color: colors.positive, fontWeight: '700', fontSize: 16, marginTop: 2 }}>{registeredPct.toFixed(0)}%</Text>
          </View>
          <View style={{ alignItems: 'flex-end' }}>
            <Text style={{ color: colors.textMuted, fontSize: 13 }}>Non-registered</Text>
            <Text style={{ color: colors.text, fontWeight: '700', fontSize: 16, marginTop: 2 }}>{money(total - registered)}</Text>
          </View>
        </View>
      </Card>

      {visibleAccounts.map((account) => (
        <Pressable key={account.id} onPress={() => navigation.navigate('AccountDetail', { id: account.id })} style={({ pressed }) => ({ opacity: pressed ? 0.85 : 1 })}>
          <Card>
            <View style={{ flexDirection: 'row', alignItems: 'center', gap: 12, marginBottom: 16 }}>
              <AccountIcon type={account.type} />
              <View style={{ flex: 1 }}>
                <Text style={{ color: colors.text, fontWeight: '700', fontSize: 15 }} numberOfLines={1}>{account.name}</Text>
                <Text style={{ color: colors.textMuted, fontSize: 12, marginTop: 2 }} numberOfLines={1}>{account.purpose}</Text>
              </View>
              <Badge text={STATUS[account.status].text} tone={STATUS[account.status].tone} />
            </View>
            <View style={{ flexDirection: 'row', alignItems: 'baseline', gap: 10, marginBottom: 16 }}>
              <Text style={{ color: colors.text, fontSize: 26, fontWeight: '800', letterSpacing: -0.6 }}>{money(account.balance)}</Text>
              <Text style={{ color: account.gain >= 0 ? colors.positive : colors.negative, fontWeight: '700', fontSize: 13 }}>
                {signedMoney(account.gain)} ({percent(account.gainPercent)})
              </Text>
            </View>
            <ContributionRoom account={account} />
          </Card>
        </Pressable>
      ))}
    </Screen>
  );
}

export function AccountDetailScreen({ route }: AppScreenProps<'AccountDetail'>) {
  const { colors } = useTheme();
  const { liveAccounts } = useStore();
  const live = liveAccounts.find((a) => a.id === route.params.id);
  const account: Account | undefined = live
    ? {
        id: live.id,
        type: live.type === 'UNKNOWN' ? 'PERSONAL' : live.type,
        name: live.name,
        purpose: live.type === 'CASH' ? 'Cash and deposit account' : 'Investment account',
        balance: live.balance,
        gain: 0,
        gainPercent: 0,
        contributionRoom: 0,
        contributionUsed: 0,
        contributionLimit: 0,
        taxBenefit: 'Tax treatment is determined by the account category.',
        status: 'normal',
        recommendedAction: 'View the latest balance in your linked account.',
      }
    : SAMPLE_ACCOUNTS.find((a) => a.id === route.params.id);
  if (!account) return null;

  return (
    <Screen edges="none">
      <View style={{ flexDirection: 'row', alignItems: 'center', gap: 12 }}>
        <AccountIcon type={account.type} />
        <View style={{ flex: 1 }}>
          <Heading size="md">{account.name}</Heading>
          <Text style={{ color: colors.textMuted, fontSize: 13, marginTop: 2 }}>{account.purpose}</Text>
        </View>
      </View>

      <Card>
        <Label>Balance</Label>
        <Text style={{ color: colors.text, fontSize: 34, fontWeight: '800', letterSpacing: -1, marginTop: 6 }}>{money(account.balance)}</Text>
        <View style={{ flexDirection: 'row', gap: 8, marginTop: 8, alignItems: 'center' }}>
          <Badge text={percent(account.gainPercent)} tone={account.gain >= 0 ? 'positive' : 'negative'} />
          <Text style={{ color: colors.textMuted }}>{signedMoney(account.gain)} all time</Text>
        </View>
      </Card>

      <Card>
        <ContributionRoom account={account} />
      </Card>

      <Card>
        <CardHeader title="Tax advantage" />
        <View style={{ flexDirection: 'row', gap: 12 }}>
          <IconTile name="shield-checkmark-outline" />
          <Body muted={false} style={{ flex: 1 }}>{account.taxBenefit}</Body>
        </View>
      </Card>

      <Card style={{ borderColor: `${colors.positive}55` }}>
        <CardHeader title="Recommended action" />
        <View style={{ flexDirection: 'row', gap: 12 }}>
          <IconTile name="bulb-outline" tone="positive" />
          <Body muted={false} style={{ flex: 1 }}>{account.recommendedAction}</Body>
        </View>
      </Card>
    </Screen>
  );
}
