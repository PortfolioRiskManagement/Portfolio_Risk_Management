import type { BottomTabScreenProps } from '@react-navigation/bottom-tabs';
import type { CompositeScreenProps, NavigatorScreenParams } from '@react-navigation/native';
import type { NativeStackScreenProps } from '@react-navigation/native-stack';

export type AuthStackParamList = {
  Welcome: undefined;
  Auth: { mode: 'login' | 'signup' | 'reset' };
};

export type TabParamList = {
  Dashboard: undefined;
  Portfolio: undefined;
  Holdings: undefined;
  Connections: undefined;
  Settings: undefined;
};

export type AppStackParamList = {
  Tabs: NavigatorScreenParams<TabParamList>;
  AddHolding: undefined;
  HoldingDetail: { id: string };
  AccountDetail: { id: string };
};

export type AuthScreenProps<T extends keyof AuthStackParamList> = NativeStackScreenProps<AuthStackParamList, T>;
export type AppScreenProps<T extends keyof AppStackParamList> = NativeStackScreenProps<AppStackParamList, T>;
export type TabProps<T extends keyof TabParamList> = CompositeScreenProps<
  BottomTabScreenProps<TabParamList, T>,
  NativeStackScreenProps<AppStackParamList>
>;
