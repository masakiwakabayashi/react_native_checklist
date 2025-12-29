import { StyleSheet, View } from 'react-native';

import { TemplateList } from '@/components/template-list';

export default function HomeScreen() {
  return (
    <View style={styles.screen}>
      <TemplateList />
    </View>
  );
}

const styles = StyleSheet.create({
  screen: {
    flex: 1,
    backgroundColor: '#fff',
    paddingHorizontal: 20,
    paddingTop: 12,
  },
});
