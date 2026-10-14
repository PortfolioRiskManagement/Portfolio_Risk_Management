# FIN/AI mobile app

The iPhone and Android app for FIN/AI, built with Expo (React Native). It signs in with the same Supabase accounts as the website in `finai-dashboard`.

## Run it in the iPhone simulator

```bash
cd finai-mobile
npm install
npx expo start
```

Then press `i` to open it in the iOS simulator. You need Xcode installed. You can also scan the QR code with the Expo Go app on a real phone.

## What's inside

| Tab | What it shows |
| --- | --- |
| Home | Total value, risk score, diversification, total assets, 6-month chart, allocation, daily brief |
| Portfolio | RRSP, TFSA, FHSA and personal accounts with contribution room and tax notes |
| Holdings | Every position, with filters, a detail view and an add-holding form |
| Connections | Wealthsimple, Robinhood, Coinbase and Binance (placeholder linking for now) |
| Settings | Profile name, light/dark mode, reset sample data, sign out |

The numbers are hardcoded sample data in `src/data/sample.ts`, matching the website. They'll be replaced once the brokerage connection service is ready. Holdings you add are saved on the device only.

## Code layout

- `App.tsx`: providers (theme, auth, data) and navigation
- `src/navigation/`: bottom tabs and screen stacks (React Navigation)
- `src/screens/`: one file per screen
- `src/components/`: shared UI (cards, buttons, inputs, chart)
- `src/lib/`: Supabase client, auth, theme, scoring maths, local storage
- `src/data/sample.ts`: sample portfolio

## Turning on Sign in with Apple and Google

The buttons are already built. They only appear when they can work.

**Apple** (iOS only; needs a development or App Store build, not Expo Go):

1. In the Apple Developer portal, enable **Sign in with Apple** for the bundle ID `com.finai.mobile` (change it in `app.config.ts` first if you want a different one).
2. In Supabase, go to **Authentication → Sign In / Providers → Apple**, enable it, and add `com.finai.mobile` under **Client IDs**.
3. Build with `npx expo run:ios` or `npx eas-cli build --profile development`.

**Google:**

1. In Google Cloud Console, create an **iOS OAuth client ID** for the bundle ID `com.finai.mobile`.
2. In Supabase, go to **Authentication → Sign In / Providers → Google**, enable it, and add that client ID under **Client IDs**.
3. Create `finai-mobile/.env.local` with `EXPO_PUBLIC_GOOGLE_IOS_CLIENT_ID=<your client id>`, then rebuild.
