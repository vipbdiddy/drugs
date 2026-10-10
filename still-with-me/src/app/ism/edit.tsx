import { router, useLocalSearchParams } from 'expo-router';
import { useState } from 'react';
import { ScrollView, Switch, Text, View } from 'react-native';

import { Button, DangerButton, Field, TopicPicker, styles } from '../../components/ui';
import { detectTopics } from '../../lib/advice';
import { useStore } from '../../lib/store';
import { colors } from '../../lib/theme';

export default function EditIsm() {
  const { lovedOneId, id } = useLocalSearchParams<{ lovedOneId: string; id?: string }>();
  const { getLovedOne, isms, addIsm, updateIsm, deleteIsm, userId } = useStore();
  const lovedOne = getLovedOne(lovedOneId);
  const existing = id ? isms.find((i) => i.id === id) : undefined;

  const [text, setText] = useState(existing?.text ?? '');
  const [context, setContext] = useState(existing?.context ?? '');
  const [topics, setTopics] = useState<string[]>(existing?.topics ?? []);
  const [keepPrivate, setKeepPrivate] = useState(existing?.keepPrivate ?? false);

  if (!lovedOne || lovedOne.ownerId !== userId || (existing && existing.ownerId !== userId)) return null;

  // Until they pick topics themselves, suggest some from what they've typed.
  const suggested = topics.length === 0 ? detectTopics(`${text} ${context}`) : [];

  const save = () => {
    const fields = {
      lovedOneId: lovedOne.id,
      text: text.trim(),
      context: context.trim() || undefined,
      topics: topics.length ? topics : suggested,
      keepPrivate,
    };
    if (existing) updateIsm(existing.id, fields);
    else addIsm(fields);
    router.back();
  };

  return (
    <ScrollView style={styles.screen} contentContainerStyle={styles.content} keyboardShouldPersistTaps="handled">
      <Text style={styles.muted}>Something {lovedOne.name} always used to say</Text>
      <Field
        label="In their words"
        placeholder="“If you're scared, do it scared.”"
        value={text}
        onChangeText={setText}
        multiline
      />
      <Field
        label="When they'd say it (optional)"
        placeholder="Every time I was nervous before a game…"
        value={context}
        onChangeText={setContext}
        multiline
      />

      <Text style={styles.label}>When would this help someone?</Text>
      <TopicPicker
        wrap
        selected={topics.length ? topics : suggested}
        onToggle={(t) => {
          const current = topics.length ? topics : suggested;
          setTopics(current.includes(t) ? current.filter((x) => x !== t) : [...current, t]);
        }}
      />
      {suggested.length > 0 && <Text style={styles.hint}>We guessed these from the words — tap to change.</Text>}

      {lovedOne.visibility === 'public' && (
        <View style={{ flexDirection: 'row', alignItems: 'center', gap: 12 }}>
          <View style={{ flex: 1 }}>
            <Text style={styles.label}>Keep this one private</Text>
            <Text style={styles.hint}>{lovedOne.name} is shared publicly. Turn this on to keep just this saying to yourself.</Text>
          </View>
          <Switch value={keepPrivate} onValueChange={setKeepPrivate} trackColor={{ true: colors.sage }} />
        </View>
      )}

      <Button title={existing ? 'Save' : 'Add'} onPress={save} disabled={!text.trim()} />
      {existing && (
        <DangerButton
          title="Delete"
          message="Delete this saying? This can't be undone."
          confirmTitle="Delete"
          onConfirm={() => {
            deleteIsm(existing.id);
            router.back();
          }}
        />
      )}
    </ScrollView>
  );
}
