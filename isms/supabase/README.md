# Setting up Supabase for Ism's

The app talks to the Supabase project in `src/lib/config.ts`. These steps are done once, in the Supabase dashboard.

## 1. Create the tables and privacy rules

1. Open **SQL Editor → New query**.
2. Paste the whole of [`schema.sql`](schema.sql) and press **Run**. It should say "Success. No rows returned".

Running it again later is safe.

## 2. Let people confirm their email and reset passwords with a code

The app asks for a 6-digit code instead of sending people to a web page.

1. Open **Authentication → Emails** (called **Email Templates** on some dashboards).
2. In **Confirm signup**, replace the message with:

   ```html
   <h2>Welcome to Ism's</h2>
   <p>Your code is: <strong>{{ .Token }}</strong></p>
   <p>Enter it in the app to finish creating your account.</p>
   ```

3. In **Reset Password**, replace the message with:

   ```html
   <h2>Reset your Ism's password</h2>
   <p>Your code is: <strong>{{ .Token }}</strong></p>
   <p>Enter it in the app, then choose a new password.</p>
   ```

4. Save both.

Supabase's built-in email service sends only a few emails an hour. That's fine for testing; before inviting lots of people, set up your own email sender under **Authentication → Emails → SMTP Settings** (Resend and Postmark both have free tiers).

## 3. Allow the app to receive sign-ins

Open **Authentication → URL Configuration** and, under **Redirect URLs**, add:

```
isms://**
```

## 4. Google, Apple and Facebook sign-in (optional, one at a time)

Each provider is switched on under **Authentication → Sign In / Providers**. The callback URL each provider asks for is shown on that page: `https://bxuvjyinsaekyufrewxs.supabase.co/auth/v1/callback`.

- **Google** (free): create an OAuth client of type **Web application** in Google Cloud Console → APIs & Services → Credentials, add the callback URL above as an authorized redirect URI, and paste its Client ID and Client Secret into Supabase.
- **Facebook** (free): create an app at developers.facebook.com with **Facebook Login**, add the callback URL under Valid OAuth Redirect URIs, and paste its App ID and App Secret into Supabase. Facebook only lets the public sign in after the app passes its review.
- **Apple** (needs an Apple Developer account, $99/year): create a Services ID and a key for **Sign in with Apple**, then fill them into Supabase. Required by Apple if the iPhone app offers Google or Facebook sign-in.

After switching a provider on, add it to `SOCIAL_PROVIDERS` in `src/lib/config.ts`, for example `['google']`, so its button appears.
