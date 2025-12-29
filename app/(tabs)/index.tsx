import { supabase } from '@/lib/supabase';
import { Alert, Button, StyleSheet, Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

export default function HomeScreen() {
  const handleSignOut = async () => {
    const { error } = await supabase.auth.signOut();
    if (error) {
      Alert.alert('サインアウトに失敗しました', error.message);
    }
  };

  return (
    <SafeAreaView style={styles.safeArea}>
      <View style={styles.card}>
        <Text style={styles.subtitle}>Account</Text>
        <Text style={styles.body}>Supabaseの認証情報でログイン中です。</Text>
        <Button title="サインアウト" onPress={handleSignOut} />
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    padding: 24,
    backgroundColor: '#fff',
  },
  card: {
    gap: 12,
  },
  subtitle: {
    fontSize: 18,
    fontWeight: '600',
  },
  body: {
    fontSize: 16,
    color: '#4B5563',
  },
});
