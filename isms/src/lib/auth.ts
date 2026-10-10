import * as Linking from 'expo-linking';
import * as WebBrowser from 'expo-web-browser';

import type { SocialProvider } from './config';
import { supabase } from './supabase';

/** Pull a query or fragment parameter out of a redirect URL (React Native's URL has no searchParams). */
function param(url: string, name: string): string | undefined {
  const match = url.match(new RegExp(`[?&#]${name}=([^&#]*)`));
  return match ? decodeURIComponent(match[1].replace(/\+/g, ' ')) : undefined;
}

/**
 * Sign in with Google, Apple or Facebook in the phone's browser, then come back to the app.
 * Returns false if the person closed the browser without finishing.
 */
export async function signInWithProvider(provider: SocialProvider): Promise<boolean> {
  const redirectTo = Linking.createURL('auth-callback');
  const { data, error } = await supabase.auth.signInWithOAuth({
    provider,
    options: { redirectTo, skipBrowserRedirect: true },
  });
  if (error) throw error;

  const result = await WebBrowser.openAuthSessionAsync(data.url, redirectTo);
  if (result.type !== 'success') return false;

  const failure = param(result.url, 'error_description') ?? param(result.url, 'error');
  if (failure) throw new Error(failure);
  const code = param(result.url, 'code');
  if (!code) throw new Error('Sign-in did not finish. Please try again.');
  const { error: exchangeError } = await supabase.auth.exchangeCodeForSession(code);
  if (exchangeError) throw exchangeError;
  return true;
}

export async function signInWithEmail(email: string, password: string) {
  const { error } = await supabase.auth.signInWithPassword({ email, password });
  if (error) throw error;
}

/** Returns true when the account is ready to use, false when the email must be confirmed with a code first. */
export async function signUpWithEmail(email: string, password: string): Promise<boolean> {
  const { data, error } = await supabase.auth.signUp({ email, password });
  if (error) throw error;
  // With email confirmation on, Supabase answers an existing address with a user that has no
  // identities (and sends nothing), so say so instead of waiting for a code that won't come.
  if (!data.session && data.user?.identities?.length === 0) throw new Error('User already registered');
  return data.session !== null;
}

export async function resendSignUpCode(email: string) {
  const { error } = await supabase.auth.resend({ type: 'signup', email });
  if (error) throw error;
}

export async function confirmSignUp(email: string, code: string) {
  const { error } = await supabase.auth.verifyOtp({ email, token: code, type: 'signup' });
  if (error) throw error;
}

export async function sendPasswordReset(email: string) {
  const { error } = await supabase.auth.resetPasswordForEmail(email);
  if (error) throw error;
}

/** Finish a password reset with the code from the email, then set the new password. */
export async function resetPassword(email: string, code: string, newPassword: string) {
  const { error } = await supabase.auth.verifyOtp({ email, token: code, type: 'recovery' });
  if (error) throw error;
  const { error: updateError } = await supabase.auth.updateUser({ password: newPassword });
  if (updateError) throw updateError;
}

export async function signOut() {
  const { error } = await supabase.auth.signOut();
  if (error) throw error;
}

/** Turn Supabase's error messages into something a person can act on. */
export function friendlyAuthError(e: unknown): string {
  const message = e instanceof Error ? e.message : String(e);
  if (/invalid login credentials/i.test(message)) return 'That email and password don’t match. Check them, or reset your password.';
  if (/email not confirmed/i.test(message)) return 'Confirm your email first: enter the code we sent you.';
  if (/already registered|already been registered/i.test(message)) return 'There’s already an account with that email. Sign in instead.';
  if (/password should be at least/i.test(message)) return 'Use a password with at least 6 characters.';
  if (/token has expired|invalid.*otp|otp.*invalid/i.test(message)) return 'That code didn’t work or has expired. Ask for a new one.';
  if (/rate limit/i.test(message)) return 'Too many tries. Wait a minute and try again.';
  if (/network|fetch/i.test(message)) return 'Couldn’t reach the server. Check your connection and try again.';
  return message;
}

/** Permanently delete the signed-in account, its photos, and everything it added. */
export async function deleteAccount(userId: string) {
  const photos = supabase.storage.from('photos');
  const { data: files } = await photos.list(userId, { limit: 1000 });
  if (files?.length) await photos.remove(files.map((f) => `${userId}/${f.name}`));
  const { error } = await supabase.rpc('delete_my_account');
  if (error) throw error;
  await supabase.auth.signOut();
}
