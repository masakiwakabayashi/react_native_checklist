import { useAuth } from '@/contexts/auth-context';
import { supabase } from '@/lib/supabase';
import { Alert, Pressable, StyleSheet, Text, View } from 'react-native';

export function Header() {
  const { user } = useAuth();

  const handleSignOut = async () => {
    const { error } = await supabase.auth.signOut();
    if (error) {
      Alert.alert('サインアウトに失敗しました', error.message);
    }
  };

  return (
    <View style={styles.headerContainer}>
      <View style={styles.textBlock}>
        <Text style={styles.title}>チェックリストアプリ</Text>
        <Text style={styles.subtitle} numberOfLines={1}>
          {user?.user_metadata?.full_name || user?.email || 'ゲスト'}
        </Text>
      </View>
      <Pressable
        accessibilityHint="現在のアカウントからログアウトします"
        accessibilityRole="button"
        onPress={handleSignOut}
        style={({ pressed }) => [styles.button, pressed && styles.buttonPressed]}
      >
        <Text style={styles.buttonText}>ログアウト</Text>
      </Pressable>
    </View>
  );
}

const styles = StyleSheet.create({
  headerContainer: {
    alignItems: 'center',
    backgroundColor: '#F9FAFB',
    borderBottomColor: '#E5E7EB',
    borderBottomWidth: StyleSheet.hairlineWidth,
    flexDirection: 'row',
    height: 64,
    justifyContent: 'space-between',
    paddingHorizontal: 20,
  },
  textBlock: {
    flex: 1,
    marginRight: 12,
  },
  title: {
    color: '#111827',
    fontSize: 18,
    fontWeight: '700',
    letterSpacing: 0.4,
  },
  subtitle: {
    color: '#6B7280',
    fontSize: 14,
    marginTop: 2,
  },
  button: {
    backgroundColor: '#111827',
    borderRadius: 999,
    paddingHorizontal: 18,
    paddingVertical: 8,
  },
  buttonPressed: {
    opacity: 0.7,
  },
  buttonText: {
    color: '#fff',
    fontSize: 14,
    fontWeight: '600',
  },
});
