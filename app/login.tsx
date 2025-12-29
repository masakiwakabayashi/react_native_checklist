import { router } from 'expo-router';
import { useState } from 'react';
import {
  ActivityIndicator,
  Alert,
  KeyboardAvoidingView,
  Platform,
  Pressable,
  StyleSheet,
  Text,
  TextInput,
  View,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { supabase } from '@/lib/supabase';

export default function LoginScreen() {
  const [email, setEmail] = useState('user1@example.com');
  const [password, setPassword] = useState('aW4uHStOg');
  const [loading, setLoading] = useState(false);

  const isFormValid = email.trim().length > 0 && password.trim().length > 0;

  const handleSignIn = async () => {
    if (!isFormValid || loading) return;
    setLoading(true);
    const { error } = await supabase.auth.signInWithPassword({
      email: email.trim(),
      password,
    });
    setLoading(false);

    if (error) {
      Alert.alert('ログインに失敗しました', error.message);
      return;
    }

    router.replace('/(tabs)');
  };

  return (
    <SafeAreaView style={styles.safeArea}>
      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : undefined}
        style={styles.flex}
        keyboardVerticalOffset={32}>
        <View style={styles.container}>
          <View>
            <Text style={styles.title}>ログイン</Text>
            <Text style={styles.subtitle}>
              作成済みのユーザーでログインしてください。
            </Text>
          </View>

          <View style={styles.form}>
            <Text style={styles.label}>メールアドレス</Text>
            <TextInput
              autoCapitalize="none"
              autoComplete="email"
              keyboardType="email-address"
              placeholder="demo@checklist.supabase.test"
              value={email}
              onChangeText={setEmail}
              style={styles.input}
              textContentType="emailAddress"
            />

            <Text style={[styles.label, styles.passwordLabel]}>パスワード</Text>
            <TextInput
              secureTextEntry
              placeholder="Supabaseのパスワード"
              value={password}
              onChangeText={setPassword}
              style={styles.input}
              textContentType="password"
            />
          </View>

          <View>
            <Pressable
              accessibilityRole="button"
              onPress={handleSignIn}
              style={[styles.button, (!isFormValid || loading) && styles.buttonDisabled]}
              disabled={!isFormValid || loading}>
              {loading ? <ActivityIndicator color="#fff" /> : <Text style={styles.buttonText}>ログイン</Text>}
            </Pressable>
          </View>
        </View>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  flex: {
    flex: 1,
  },
  safeArea: {
    flex: 1,
    backgroundColor: '#fff',
  },
  container: {
    flex: 1,
    padding: 24,
    gap: 32,
  },
  title: {
    fontSize: 24,
    fontWeight: '700',
    marginBottom: 8,
  },
  subtitle: {
    fontSize: 16,
    color: '#4B5563',
    lineHeight: 22,
  },
  form: {
    gap: 8,
  },
  label: {
    fontWeight: '600',
    color: '#111827',
  },
  passwordLabel: {
    marginTop: 12,
  },
  input: {
    borderWidth: 1,
    borderColor: '#D1D5DB',
    borderRadius: 8,
    paddingHorizontal: 12,
    paddingVertical: 10,
    fontSize: 16,
    backgroundColor: '#F9FAFB',
  },
  button: {
    backgroundColor: '#2563EB',
    paddingVertical: 14,
    borderRadius: 999,
    alignItems: 'center',
  },
  buttonDisabled: {
    opacity: 0.5,
  },
  buttonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '600',
  },
  hint: {
    marginTop: 12,
    fontSize: 13,
    color: '#4B5563',
    lineHeight: 18,
  },
});
