import { Stack, router, useLocalSearchParams } from 'expo-router';
import { ScrollView, Text, View } from 'react-native';

import { IsmCard } from '../../components/IsmCard';
import { Button, Empty, styles } from '../../components/ui';
import { canSee } from '../../lib/advice';
import { useStore } from '../../lib/store';
import { colors, fonts } from '../../lib/theme';

export default function LovedOneScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const { getLovedOne, isms, userId } = useStore();
  const lovedOne = getLovedOne(id);

  if (!lovedOne || (lovedOne.ownerId !== userId && lovedOne.visibility !== 'public')) {
    return <Empty title="We couldn't find this person." />;
  }

  const mine = lovedOne.ownerId === userId;
  const theirIsms = isms.filter((i) => i.lovedOneId === id && canSee(i, lovedOne, userId));

  return (
    <ScrollView style={styles.screen} contentContainerStyle={styles.content}>
      <Stack.Screen
        options={{
          title: lovedOne.name,
          headerRight: mine
            ? () => (
                <Text
                  style={{ color: colors.accent, fontSize: 16 }}
                  onPress={() => router.push({ pathname: '/loved-one/edit', params: { id: lovedOne.id } })}>
                  Edit
                </Text>
              )
            : undefined,
        }}
      />
      <View style={{ gap: 4 }}>
        <Text style={{ fontFamily: fonts.quote, fontSize: 28, color: colors.ink }}>{lovedOne.name}</Text>
        <Text style={styles.muted}>{[lovedOne.relationship, lovedOne.years].filter(Boolean).join(' · ')}</Text>
        {lovedOne.about ? <Text style={[styles.body, { marginTop: 8 }]}>{lovedOne.about}</Text> : null}
        <Text style={[styles.muted, { marginTop: 8 }]}>
          {mine
            ? lovedOne.visibility === 'public'
              ? 'Shared publicly — other people can find their sayings.'
              : 'Private — only you can see their sayings.'
            : 'Shared by their family.'}
        </Text>
      </View>

      {mine && (
        <Button
          title="+ Add something they used to say"
          onPress={() => router.push({ pathname: '/ism/edit', params: { lovedOneId: lovedOne.id } })}
        />
      )}

      {theirIsms.length === 0 ? (
        <Empty title="No sayings yet. What did they always tell you?" />
      ) : (
        theirIsms.map((ism) => (
          <View key={ism.id} style={{ gap: 4 }}>
            <IsmCard ism={ism} showAuthor={false} />
            {mine && (
              <Text
                style={[styles.muted, { textAlign: 'right', color: colors.accent }]}
                onPress={() => router.push({ pathname: '/ism/edit', params: { lovedOneId: lovedOne.id, id: ism.id } })}>
                {ism.keepPrivate && lovedOne.visibility === 'public' ? 'Private · ' : ''}Edit
              </Text>
            )}
          </View>
        ))
      )}
    </ScrollView>
  );
}
