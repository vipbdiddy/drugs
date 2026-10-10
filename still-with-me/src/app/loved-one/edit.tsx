import { router, useLocalSearchParams } from 'expo-router';
import { useState } from 'react';
import { ScrollView, Switch, Text, View } from 'react-native';

import { Button, DangerButton, Field, styles } from '../../components/ui';
import { useStore } from '../../lib/store';
import { colors } from '../../lib/theme';

export default function EditLovedOne() {
  const { id } = useLocalSearchParams<{ id?: string }>();
  const { getLovedOne, addLovedOne, updateLovedOne, deleteLovedOne, userId } = useStore();
  const existing = id ? getLovedOne(id) : undefined;
  const editable = !existing || existing.ownerId === userId;

  const [name, setName] = useState(existing?.name ?? '');
  const [relationship, setRelationship] = useState(existing?.relationship ?? '');
  const [years, setYears] = useState(existing?.years ?? '');
  const [about, setAbout] = useState(existing?.about ?? '');
  const [isPublic, setIsPublic] = useState(existing?.visibility === 'public');

  if (!editable) return null;

  const save = () => {
    const fields = {
      name: name.trim(),
      relationship: relationship.trim(),
      years: years.trim() || undefined,
      about: about.trim() || undefined,
      visibility: isPublic ? ('public' as const) : ('private' as const),
    };
    if (existing) {
      updateLovedOne(existing.id, fields);
      router.back();
    } else {
      const created = addLovedOne(fields);
      router.replace({ pathname: '/loved-one/[id]', params: { id: created.id } });
    }
  };

  return (
    <ScrollView style={styles.screen} contentContainerStyle={styles.content} keyboardShouldPersistTaps="handled">
      <Field label="Name" placeholder="What you called them — Grandma Jo, Pops…" value={name} onChangeText={setName} />
      <Field label="Relationship" placeholder="Grandmother, best friend, dad…" value={relationship} onChangeText={setRelationship} />
      <Field label="Years (optional)" placeholder="1950 – 2022" value={years} onChangeText={setYears} />
      <Field
        label="About them (optional)"
        placeholder="A line or two about who they were"
        value={about}
        onChangeText={setAbout}
        multiline
      />

      <View style={{ flexDirection: 'row', alignItems: 'center', gap: 12 }}>
        <View style={{ flex: 1 }}>
          <Text style={styles.label}>Share their sayings with everyone</Text>
          <Text style={styles.hint}>
            Off: only you can see them. On: anyone using the app can find their advice. You can keep single sayings
            private.
          </Text>
        </View>
        <Switch value={isPublic} onValueChange={setIsPublic} trackColor={{ true: colors.sage }} />
      </View>

      <Button title={existing ? 'Save' : 'Add'} onPress={save} disabled={!name.trim()} />
      {existing && (
        <DangerButton
          title="Remove"
          message={`Remove ${existing.name}? This deletes them and every saying you added for them.`}
          confirmTitle="Remove"
          onConfirm={() => {
            deleteLovedOne(existing.id);
            router.dismissAll();
          }}
        />
      )}
    </ScrollView>
  );
}
