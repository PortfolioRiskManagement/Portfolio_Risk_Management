import type { ExpoConfig } from 'expo/config';

// Google sign-in redirects back to the app through the reversed iOS client ID.
const googleIosClientId = process.env.EXPO_PUBLIC_GOOGLE_IOS_CLIENT_ID ?? '';
const googleScheme = googleIosClientId ? `com.googleusercontent.apps.${googleIosClientId.split('.apps.googleusercontent.com')[0]}` : null;

const config: ExpoConfig = {
  name: 'FIN/AI',
  slug: 'finai-mobile',
  version: '1.0.0',
  scheme: 'finai',
  orientation: 'portrait',
  icon: './assets/icon.png',
  userInterfaceStyle: 'automatic',
  newArchEnabled: true,
  splash: {
    image: './assets/splash-icon.png',
    resizeMode: 'contain',
    backgroundColor: '#07070a',
  },
  ios: {
    // Change before the first App Store build if you want a different identifier.
    bundleIdentifier: 'com.finai.mobile',
    supportsTablet: false,
    usesAppleSignIn: true,
    infoPlist: {
      ITSAppUsesNonExemptEncryption: false,
      ...(googleScheme ? { CFBundleURLTypes: [{ CFBundleURLSchemes: [googleScheme] }] } : {}),
    },
  },
  android: {
    package: 'com.finai.mobile',
    adaptiveIcon: {
      foregroundImage: './assets/adaptive-icon.png',
      backgroundColor: '#4f46e5',
    },
    edgeToEdgeEnabled: true,
    predictiveBackGestureEnabled: false,
  },
  web: {
    favicon: './assets/favicon.png',
  },
  plugins: ['expo-web-browser', 'expo-apple-authentication'],
};

export default config;
