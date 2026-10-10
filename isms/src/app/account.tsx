import { router } from 'expo-router';
import { useState } from 'react';
import { Platform, ScrollView, Text, View } from 'react-native';

import { Button, ErrorNote, Field, styles } from '../components/ui';
import {
  confirmSignUp,
  friendlyAuthError,
  resetPassword,
  sendPasswordReset,
  signInWithEmail,
  signInWithProvider,
  signUpWithEmail,
} from '../lib/auth';
import { SOCIAL_PROVIDERS, type SocialProvider } from '../lib/config';
import { colors } from '../lib/theme';

type Mode = 'signIn' | 'signUp' | 'confirm' | 'forgot' | 'reset';

const PROVIDER_LABELS: Record<SocialProvider, string> = {
  google: 'Continue with Google',
  apple: 'Continue with Apple',
  facebook: 'Continue with Facebook',
};

const TITLES: Record<Mode, string> = {
  signIn: 'Sign in',
  signUp: 'Create your account',
  confirm: 'Check your email',
  forgot: 'Reset your password',
  reset: 'Choose a new password',
};

export default function Account() {
  const [mode, setMode] = useState<Mode>('signIn');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [code, setCode] = useState('');
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string>();
  const [info, setInfo] = useState<string>();

  const go = (next: Mode) => {
    setMode(next);
    setError(undefined);
    setInfo(undefined);
    setCode('');
  };

  const run = async (action: () => Promise<void>) => {
    setBusy(true);
    setError(undefined);
    try {
      await action();
    } catch (e) {
      setError(friendlyAuthError(e));
    } finally {
      setBusy(false);
    }
  };

  const done = () => (router.canGoBack() ? router.back() : router.replace('/'));
  const cleanEmail = email.trim().toLowerCase();
  // Social sign-in opens the phone's browser and returns to the app; the web version can't do that.
  const providers = Platform.OS === 'web' ? [] : SOCIAL_PROVIDERS;

  const submit = () =>
    run(async () => {
      switch (mode) {
        case 'signIn':
          await signInWithEmail(cleanEmail, password);
          return done();
        case 'signUp':
          if (await signUpWithEmail(cleanEmail, password)) return done();
          setInfo(`We sent a code to ${cleanEmail}. Enter it below to finish.`);
          return setMode('confirm');
        case 'confirm':
          await confirmSignUp(cleanEmail, code.trim());
          return done();
        case 'forgot':
          await sendPasswordReset(cleanEmail);
          setInfo(`If there's an account for ${cleanEmail}, we sent it a code.`);
          return setMode('reset');
        case 'reset':
          await resetPassword(cleanEmail, code.trim(), password);
          return done();
      }
    });

  const canSubmit =
    cleanEmail.includes('@') &&
    (mode === 'forgot' ||
      (mode === 'confirm' && code.trim().length >= 6) ||
      (mode === 'reset' && code.trim().length >= 6 && password.length >= 6) ||
      ((mode === 'signIn' || mode === 'signUp') && password.length >= 6));

  return (
    <ScrollView style={styles.screen} contentContainerStyle={styles.content} keyboardShouldPersistTaps="handled">
      <Text style={styles.heading}>{TITLES[mode]}</Text>
      {mode === 'signIn' || mode === 'signUp' ? (
        <Text style={styles.muted}>
          Your loved ones, quotes and stories are saved to your account, so they're safe if you change phones.
        </Text>
      ) : null}

      {(mode === 'signIn' || mode === 'signUp') && providers.length > 0 && (
        <View style={{ gap: 8 }}>
          {providers.map((p) => (
            <Button
              key={p}
              title={PROVIDER_LABELS[p]}
              variant="secondary"
              disabled={busy}
              onPress={() =>
                run(async () => {
                  if (await signInWithProvider(p)) done();
                })
              }
            />
          ))}
          <Text style={[styles.muted, { textAlign: 'center', marginTop: 4 }]}>or use your email</Text>
        </View>
      )}

      {info ? <Text style={[styles.body, { color: colors.sage }]}>{info}</Text> : null}

      <Field
        label="Email"
        value={email}
        onChangeText={setEmail}
        autoCapitalize="none"
        autoComplete="email"
        keyboardType="email-address"
        textContentType="emailAddress"
        editable={mode !== 'confirm' && mode !== 'reset'}
      />
      {(mode === 'confirm' || mode === 'reset') && (
        <Field
          label="Code from the email"
          value={code}
          onChangeText={setCode}
          keyboardType="number-pad"
          autoComplete="one-time-code"
          textContentType="oneTimeCode"
          maxLength={10}
        />
      )}
      {(mode === 'signIn' || mode === 'signUp' || mode === 'reset') && (
        <Field
          label={mode === 'reset' ? 'New password' : 'Password'}
          value={password}
          onChangeText={setPassword}
          secureTextEntry
          autoCapitalize="none"
          autoComplete={mode === 'signIn' ? 'current-password' : 'new-password'}
          textContentType={mode === 'signIn' ? 'password' : 'newPassword'}
          hint={mode === 'signIn' ? undefined : 'At least 6 characters.'}
        />
      )}

      {error ? <ErrorNote message={error} /> : null}

      <Button
        title={
          busy
            ? 'One moment…'
            : { signIn: 'Sign in', signUp: 'Create account', confirm: 'Confirm', forgot: 'Send code', reset: 'Save new password' }[mode]
        }
        onPress={submit}
        disabled={!canSubmit || busy}
      />

      <View style={{ gap: 12, alignItems: 'center', marginTop: 8 }}>
        {mode === 'signIn' && (
          <>
            <Text style={link} onPress={() => go('signUp')}>
              New here? Create an account
            </Text>
            <Text style={link} onPress={() => go('forgot')}>
              Forgot your password?
            </Text>
          </>
        )}
        {mode === 'signUp' && (
          <Text style={link} onPress={() => go('signIn')}>
            Already have an account? Sign in
          </Text>
        )}
        {mode === 'confirm' && (
          <Text style={link} onPress={() => run(async () => void (await signUpWithEmail(cleanEmail, password)))}>
            Send the code again
          </Text>
        )}
        {(mode === 'forgot' || mode === 'reset' || mode === 'confirm') && (
          <Text style={link} onPress={() => go('signIn')}>
            Back to sign in
          </Text>
        )}
      </View>
    </ScrollView>
  );
}

const link = { color: colors.accent, fontSize: 15, fontWeight: '600' as const };
