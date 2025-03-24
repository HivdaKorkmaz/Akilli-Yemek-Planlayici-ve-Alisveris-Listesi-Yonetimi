import { Redirect } from 'expo-router';
import { auth } from '../src/config/firebase';

export default function Index() {
  // Kullanıcı giriş yapmışsa tabs'a, yapmamışsa HomePage'e yönlendir
  if (auth.currentUser) {
    return <Redirect href="/(tabs)" />;
  }
  return <Redirect href="/HomePage" />;
} 