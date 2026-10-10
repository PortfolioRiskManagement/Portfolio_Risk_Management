// Public, browser-safe values shared with the website (finai-dashboard).
// Row level security in Supabase decides what each signed-in user can read or write,
// so the publishable key is safe to ship inside the app.
export const SUPABASE_URL = 'https://adddgsdmfmcqdqhtoepr.supabase.co';
export const SUPABASE_PUBLISHABLE_KEY = 'sb_publishable_D8gSTeoVS9rb-A-izvXSrA_0g-WxtsS';

// Google sign-in needs an iOS OAuth client ID (see README). The button stays hidden until it is set.
export const GOOGLE_IOS_CLIENT_ID = process.env.EXPO_PUBLIC_GOOGLE_IOS_CLIENT_ID ?? '';
