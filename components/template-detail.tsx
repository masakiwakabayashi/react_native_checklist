import type { TemplateDetail as TemplateDetailModel } from '@/repositories/templates';
import { useMemo } from 'react';
import { StyleSheet, Text, View } from 'react-native';

type TemplateDetailProps = {
  template: TemplateDetailModel;
};

export function TemplateDetailView({ template }: TemplateDetailProps) {
  const sortedItems = useMemo(() => {
    if (!template.items) return [];
    return template.items.slice().sort((a, b) => {
      if (!a.created_at || !b.created_at) return a.title.localeCompare(b.title);
      return new Date(a.created_at).getTime() - new Date(b.created_at).getTime();
    });
  }, [template.items]);

  return (
    <View style={styles.wrapper}>
      <Text style={styles.title}>{template.name}</Text>
      {template.description ? <Text style={styles.description}>{template.description}</Text> : null}
      <View style={styles.itemsSection}>
        <Text style={styles.sectionTitle}>項目一覧</Text>
        {sortedItems.length === 0 ? (
          <Text style={styles.emptyItems}>項目が登録されていません。</Text>
        ) : (
          sortedItems.map((item) => (
            <View key={item.id} style={styles.itemRow}>
              <Text style={styles.itemTitle}>{item.sort_order}. {item.title}</Text>
            </View>
          ))
        )}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  wrapper: {
    gap: 12,
  },
  title: {
    fontSize: 24,
    fontWeight: '700',
    color: '#111827',
  },
  description: {
    fontSize: 16,
    color: '#374151',
    lineHeight: 22,
  },
  itemsSection: {
    marginTop: 24,
    gap: 12,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#111827',
  },
  emptyItems: {
    fontSize: 15,
    color: '#6B7280',
  },
  itemRow: {
    paddingVertical: 12,
    borderBottomWidth: StyleSheet.hairlineWidth,
    borderBottomColor: '#E5E7EB',
    gap: 4,
  },
  itemTitle: {
    fontSize: 16,
    fontWeight: '500',
  },
});
