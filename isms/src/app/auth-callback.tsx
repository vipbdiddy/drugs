import { Redirect } from 'expo-router';

/** Social sign-in returns to isms://auth-callback; the sign-in screen finishes the job, so just go home. */
export default function AuthCallback() {
  return <Redirect href="/" />;
}
