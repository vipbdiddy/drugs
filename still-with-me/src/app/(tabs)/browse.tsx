import { useLocalSearchParams } from 'expo-router';
import { useEffect, useMemo, useState } from 'react';
import { FlatList, View } from 'react-native';

import { IsmCard } from '../../components/IsmCard';
import { Empty, Field, ScopeToggle, TopicPicker, styles } from '../../components/ui';
import { visibleIsms } from '../../lib/advice';
import { useStore } from '../../lib/store';
import { useScope } from '../../lib/useScope';

export default function Browse() {
  const { topic } = useLocalSearchParams<{ topic?: string }>();
  const { isms, lovedOnes, userId, getLovedOne } = useStore();
  const [scope, setScope] = useScope();
  const [topics, setTopics] = useState<string[]>(topic ? [topic] : []);
  const [search, setSearch] = useState('');

  // Arriving from a topic link on Today narrows to that topic.
  useEffect(() => {
    if (topic) setTopics([topic]);
  }, [topic]);

  const results = useMemo(() => {
    const q = search.trim().toLowerCase();
    return visibleIsms(isms, lovedOnes, userId, scope).filter(
      (ism) =>
        (topics.length === 0 || ism.topics.some((t) => topics.includes(t))) &&
        (!q ||
          `${ism.text} ${ism.context ?? ''} ${getLovedOne(ism.lovedOneId)?.name ?? ''}`.toLowerCase().includes(q)),
    );
  }, [isms, lovedOnes, userId, scope, topics, search, getLovedOne]);

  return (
    <FlatList
      style={styles.screen}
      contentContainerStyle={styles.content}
      keyboardShouldPersistTaps="handled"
      data={results}
      keyExtractor={(ism) => ism.id}
      renderItem={({ item }) => <IsmCard ism={item} />}
      ListHeaderComponent={
        <View style={{ gap: 12 }}>
          <ScopeToggle value={scope} onChange={setScope} />
          <Field label="Search" placeholder="A word, a phrase, a name…" value={search} onChangeText={setSearch} />
          <TopicPicker
            selected={topics}
            onToggle={(id) => setTopics((t) => (t.includes(id) ? t.filter((x) => x !== id) : [...t, id]))}
          />
        </View>
      }
      ListEmptyComponent={
        <Empty
          title={
            scope === 'mine'
              ? 'No sayings from your loved ones match. Add some, or switch to Everyone.'
              : 'Nothing matches yet.'
          }
        />
      }
    />
  );
}
