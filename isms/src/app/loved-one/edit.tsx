import { router, useLocalSearchParams } from 'expo-router';
import { useState } from 'react';
import { Pressable, ScrollView, Switch, Text, View } from 'react-native';

import { Avatar } from '../../components/Avatar';
import { Button, DangerButton, Field, styles } from '../../components/ui';
import { deletePhoto, pickPhoto } from '../../lib/photos';
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
  const [obituary, setObituary] = useState(existing?.obituary ?? '');
  const [photoUri, setPhotoUri] = useState(existing?.photoUri);
  const [isPublic, setIsPublic] = useState(existing?.visibility === 'public');

  if (!editable) return null;

  const choosePhoto = async () => {
    try {
      const picked = await pickPhoto();
      if (!picked) return;
      // Drop a photo picked earlier in this visit that never got saved.
      if (photoUri !== existing?.photoUri) deletePhoto(photoUri);
      setPhotoUri(picked);
    } catch (e) {
      console.warn('Could not add photo', e);
    }
  };

  const save = () => {
    const fields = {
      name: name.trim(),
      relationship: relationship.trim(),
      years: years.trim() || undefined,
      about: about.trim() || undefined,
      obituary: obituary.trim() || undefined,
      photoUri,
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
      <View style={{ alignItems: 'center', gap: 8 }}>
        <Pressable onPress={choosePhoto} accessibilityRole="button" accessibilityLabel="Choose a photo">
          <Avatar lovedOne={{ name: name || '?', photoUri }} size={112} />
        </Pressable>
        <View style={{ flexDirection: 'row', gap: 16 }}>
          <Text style={{ color: colors.accent, fontWeight: '600' }} onPress={choosePhoto}>
            {photoUri ? 'Change photo' : 'Add a photo'}
          </Text>
          {photoUri ? (
            <Text style={{ color: colors.muted }} onPress={() => setPhotoUri(undefined)}>
              Remove
            </Text>
          ) : null}
        </View>
      </View>
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
      <Field
        label="Obituary (optional)"
        placeholder="Paste or write their obituary"
        value={obituary}
        onChangeText={setObituary}
        multiline
        style={{ minHeight: 160 }}
      />

      <View style={{ flexDirection: 'row', alignItems: 'center', gap: 12 }}>
        <View style={{ flex: 1 }}>
          <Text style={styles.label}>Share their memories with everyone</Text>
          <Text style={styles.hint}>
            Off: only you can see them. On: anyone using the app can see their profile, quotes and stories. You can
            keep single quotes or stories private.
          </Text>
        </View>
        <Switch value={isPublic} onValueChange={setIsPublic} trackColor={{ true: colors.sage }} />
      </View>

      <Button title={existing ? 'Save' : 'Add'} onPress={save} disabled={!name.trim()} />
      {existing && (
        <DangerButton
          title="Remove"
          message={`Remove ${existing.name}? This deletes them and every quote and story you added for them.`}
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
