import * as AppleAuthentication from 'expo-apple-authentication';
import * as AuthSession from 'expo-auth-session';
import * as Crypto from 'expo-crypto';
import * as WebBrowser from 'expo-web-browser';
import { Platform } from 'react-native';
import { GOOGLE_IOS_CLIENT_ID } from './config';
import { supabase } from './supabase';

WebBrowser.maybeCompleteAuthSession();

// Both providers hand back an ID token, which Supabase verifies and turns into a
// regular FIN/AI session, so the same account works on the website too.
// They need provider setup in Supabase, Apple and Google first (see README).

export async function isAppleLoginAvailable() {
  if (Platform.OS !== 'ios') return false;
  try {
    return await AppleAuthentication.isAvailableAsync();
  } catch {
    return false;
  }
}

/** Returns false when the person cancels the Apple sheet. */
export async function signInWithApple() {
  // Apple receives a hashed nonce; Supabase checks the raw one against it.
  const rawNonce = Crypto.randomUUID();
  const hashedNonce = await Crypto.digestStringAsync(Crypto.CryptoDigestAlgorithm.SHA256, rawNonce);

  let credential: AppleAuthentication.AppleAuthenticationCredential;
  try {
    credential = await AppleAuthentication.signInAsync({
      requestedScopes: [
        AppleAuthentication.AppleAuthenticationScope.FULL_NAME,
        AppleAuthentication.AppleAuthenticationScope.EMAIL,
      ],
      nonce: hashedNonce,
    });
  } catch (err: unknown) {
    if ((err as { code?: string })?.code === 'ERR_REQUEST_CANCELED') return false;
    throw err;
  }
  if (!credential.identityToken) throw new Error('Apple didn’t return a sign-in token. Please try again.');

  const { error } = await supabase.auth.signInWithIdToken({
    provider: 'apple',
    token: credential.identityToken,
    nonce: rawNonce,
  });
  if (error) throw error;

  // Apple only shares the name on the very first sign-in, so save it right away.
  const fullName = [credential.fullName?.givenName, credential.fullName?.familyName].filter(Boolean).join(' ');
  if (fullName) await supabase.auth.updateUser({ data: { full_name: fullName } });
  return true;
}

export const isGoogleLoginConfigured = Boolean(GOOGLE_IOS_CLIENT_ID);

const googleDiscovery = {
  authorizationEndpoint: 'https://accounts.google.com/o/oauth2/v2/auth',
  tokenEndpoint: 'https://oauth2.googleapis.com/token',
};

/** Returns false when the person cancels the Google sheet. */
export async function signInWithGoogle() {
  const clientIdPrefix = GOOGLE_IOS_CLIENT_ID.split('.apps.googleusercontent.com')[0];
  const redirectUri = `com.googleusercontent.apps.${clientIdPrefix}:/oauth2redirect`;

  const request = new AuthSession.AuthRequest({
    clientId: GOOGLE_IOS_CLIENT_ID,
    scopes: ['openid', 'email', 'profile'],
    redirectUri,
    responseType: AuthSession.ResponseType.Code,
    usePKCE: true,
    extraParams: { prompt: 'select_account' },
  });
  const result = await request.promptAsync(googleDiscovery);
  if (result.type !== 'success' || !result.params.code) return false;

  const tokens = await AuthSession.exchangeCodeAsync(
    {
      clientId: GOOGLE_IOS_CLIENT_ID,
      code: result.params.code,
      redirectUri,
      extraParams: { code_verifier: request.codeVerifier ?? '' },
    },
    googleDiscovery,
  );
  if (!tokens.idToken) throw new Error('Google didn’t return a sign-in token. Please try again.');

  const { error } = await supabase.auth.signInWithIdToken({ provider: 'google', token: tokens.idToken });
  if (error) throw error;
  return true;
}
