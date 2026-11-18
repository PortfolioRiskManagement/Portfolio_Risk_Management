import { StatusBar } from 'expo-status-bar';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import { AuthProvider } from './src/lib/auth';
import { StoreProvider } from './src/lib/store';
import { ThemeProvider, useTheme } from './src/lib/theme';
import RootNavigator from './src/navigation/RootNavigator';

function ThemedStatusBar() {
  const { colors } = useTheme();
  return <StatusBar style={colors.isDark ? 'light' : 'dark'} />;
}

export default function App() {
  return (
    <SafeAreaProvider>
      <ThemeProvider>
        <AuthProvider>
          <StoreProvider>
            <ThemedStatusBar />
            <RootNavigator />
          </StoreProvider>
        </AuthProvider>
      </ThemeProvider>
    </SafeAreaProvider>
  );
}
