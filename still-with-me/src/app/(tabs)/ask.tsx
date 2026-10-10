import { useMemo, useState } from 'react';
import { ScrollView, Text } from 'react-native';

import { IsmCard } from '../../components/IsmCard';
import { Empty, Field, ScopeToggle, TopicPicker, styles } from '../../components/ui';
import { detectTopics, findAdvice, visibleIsms } from '../../lib/advice';
import { useStore } from '../../lib/store';
import { topicLabel } from '../../lib/topics';
import { useScope } from '../../lib/useScope';

export default function Ask() {
  const { isms, lovedOnes, userId } = useStore();
  const [scope, setScope] = useScope();
  const [situation, setSituation] = useState('');
  const [picked, setPicked] = useState<string[]>([]);

  const detected = useMemo(() => detectTopics(situation).filter((t) => !picked.includes(t)), [situation, picked]);
  const matches = useMemo(
    () => findAdvice(situation, picked, visibleIsms(isms, lovedOnes, userId, scope), userId).slice(0, 25),
    [situation, picked, isms, lovedOnes, userId, scope],
  );
  const asked = situation.trim().length > 0 || picked.length > 0;

  return (
    <ScrollView style={styles.screen} contentContainerStyle={styles.content} keyboardShouldPersistTaps="handled">
      <Field
        label="What are you going through?"
        placeholder="e.g. I'm nervous about starting a new job"
        value={situation}
        onChangeText={setSituation}
        multiline
      />
      {detected.length > 0 && (
        <Text style={styles.muted}>Sounds like: {detected.map(topicLabel).join(', ')}</Text>
      )}
      <Text style={styles.subheading}>Or pick a situation</Text>
      <TopicPicker
        selected={picked}
        onToggle={(id) => setPicked((p) => (p.includes(id) ? p.filter((x) => x !== id) : [...p, id]))}
      />
      <ScopeToggle value={scope} onChange={setScope} />

      {asked && matches.length === 0 && (
        <Empty title={scope === 'mine' ? "Nothing from your loved ones fits yet. Try 'Everyone', or add more of their sayings." : 'Nothing fits yet. Try different words or another situation.'} />
      )}
      {matches.map(({ ism }) => (
        <IsmCard key={ism.id} ism={ism} />
      ))}
    </ScrollView>
  );
}
