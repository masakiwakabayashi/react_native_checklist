import { ThemedText } from '@/components/themed-text';
import { ThemedView } from '@/components/themed-view';
import { supabase } from '@/lib/supabase';
import { Alert, Button, SafeAreaView, StyleSheet } from 'react-native';

export default function HomeScreen() {
  const handleSignOut = async () => {
    const { error } = await supabase.auth.signOut();
    if (error) {
      Alert.alert('サインアウトに失敗しました', error.message);
    }
  };

  return (
    <SafeAreaView>
      <ThemedView style={styles.stepContainer}>
        <ThemedText type="subtitle">Account</ThemedText>
        <ThemedText>Supabaseの認証情報でログイン中です。</ThemedText>
        <Button title="サインアウト" onPress={handleSignOut} />
      </ThemedView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  titleContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  stepContainer: {
    gap: 8,
    marginBottom: 8,
  },
  reactLogo: {
    height: 178,
    width: 290,
    bottom: 0,
    left: 0,
    position: 'absolute',
  },
});
