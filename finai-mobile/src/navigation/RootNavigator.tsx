import { Ionicons } from '@expo/vector-icons';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { DarkTheme, DefaultTheme, NavigationContainer, type Theme } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { ActivityIndicator, View } from 'react-native';
import { BrandMark } from '../components/ui';
import { useAuth } from '../lib/auth';
import { useTheme } from '../lib/theme';
import AuthScreen from '../screens/AuthScreen';
import ConnectionsScreen from '../screens/ConnectionsScreen';
import DashboardScreen from '../screens/DashboardScreen';
import HoldingsScreen, { AddHoldingScreen, HoldingDetailScreen } from '../screens/HoldingsScreen';
import PortfolioScreen, { AccountDetailScreen } from '../screens/PortfolioScreen';
import SettingsScreen from '../screens/SettingsScreen';
import WelcomeScreen from '../screens/WelcomeScreen';
import type { AppStackParamList, AuthStackParamList, TabParamList } from './types';

const AuthStack = createNativeStackNavigator<AuthStackParamList>();
const AppStack = createNativeStackNavigator<AppStackParamList>();
const Tabs = createBottomTabNavigator<TabParamList>();

const TAB_ICONS: Record<keyof TabParamList, [React.ComponentProps<typeof Ionicons>['name'], React.ComponentProps<typeof Ionicons>['name']]> = {
  Dashboard: ['grid', 'grid-outline'],
  Portfolio: ['briefcase', 'briefcase-outline'],
  Holdings: ['stats-chart', 'stats-chart-outline'],
  Connections: ['link', 'link-outline'],
  Settings: ['settings', 'settings-outline'],
};

function TabNavigator() {
  const { colors } = useTheme();
  return (
    <Tabs.Navigator
      screenOptions={({ route }) => ({
        headerShown: false,
        tabBarActiveTintColor: colors.accent,
        tabBarInactiveTintColor: colors.textSubtle,
        tabBarStyle: { backgroundColor: colors.surface, borderTopColor: colors.border },
        tabBarLabelStyle: { fontSize: 11, fontWeight: '600' },
        tabBarIcon: ({ focused, color, size }) => (
          <Ionicons name={TAB_ICONS[route.name][focused ? 0 : 1]} size={size - 2} color={color} />
        ),
      })}
    >
      <Tabs.Screen name="Dashboard" component={DashboardScreen} options={{ title: 'Home' }} />
      <Tabs.Screen name="Portfolio" component={PortfolioScreen} />
      <Tabs.Screen name="Holdings" component={HoldingsScreen} />
      <Tabs.Screen name="Connections" component={ConnectionsScreen} />
      <Tabs.Screen name="Settings" component={SettingsScreen} />
    </Tabs.Navigator>
  );
}

export default function RootNavigator() {
  const { colors } = useTheme();
  const { session, isLoading } = useAuth();

  const navTheme: Theme = {
    ...(colors.isDark ? DarkTheme : DefaultTheme),
    colors: {
      ...(colors.isDark ? DarkTheme : DefaultTheme).colors,
      background: colors.background,
      card: colors.surface,
      text: colors.text,
      border: colors.border,
      primary: colors.accent,
    },
  };

  if (isLoading) {
    return (
      <View style={{ flex: 1, alignItems: 'center', justifyContent: 'center', gap: 20, backgroundColor: colors.background }}>
        <BrandMark size="lg" />
        <ActivityIndicator color={colors.textMuted} />
      </View>
    );
  }

  const detailOptions = {
    headerShown: true,
    headerTitle: '',
    headerBackButtonDisplayMode: 'minimal' as const,
    headerShadowVisible: false,
    headerStyle: { backgroundColor: colors.background },
    headerTintColor: colors.text,
  };

  return (
    <NavigationContainer theme={navTheme}>
      {session ? (
        <AppStack.Navigator screenOptions={{ headerShown: false }}>
          <AppStack.Screen name="Tabs" component={TabNavigator} />
          <AppStack.Screen name="HoldingDetail" component={HoldingDetailScreen} options={detailOptions} />
          <AppStack.Screen name="AccountDetail" component={AccountDetailScreen} options={detailOptions} />
          <AppStack.Screen
            name="AddHolding"
            component={AddHoldingScreen}
            options={{ ...detailOptions, presentation: 'modal', headerTitle: 'Add holding' }}
          />
        </AppStack.Navigator>
      ) : (
        <AuthStack.Navigator screenOptions={{ headerShown: false }}>
          <AuthStack.Screen name="Welcome" component={WelcomeScreen} />
          <AuthStack.Screen name="Auth" component={AuthScreen} />
        </AuthStack.Navigator>
      )}
    </NavigationContainer>
  );
}
