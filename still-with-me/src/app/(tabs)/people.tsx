import { router } from 'expo-router';
import { ScrollView, Text } from 'react-native';

import { LovedOneRow } from '../../components/LovedOneRow';
import { Button, Empty, styles } from '../../components/ui';
import { canSee } from '../../lib/advice';
import { useStore } from '../../lib/store';

export default function People() {
  const { lovedOnes, isms, userId } = useStore();
  const mine = lovedOnes.filter((l) => l.ownerId === userId);
  const shared = lovedOnes.filter((l) => l.ownerId !== userId && l.visibility === 'public');
  const countFor = (id: string) =>
    isms.filter((i) => i.lovedOneId === id && canSee(i, lovedOnes.find((l) => l.id === id), userId)).length;

  return (
    <ScrollView style={styles.screen} contentContainerStyle={styles.content}>
      <Button title="+ Add a loved one" onPress={() => router.push('/loved-one/edit')} />

      <Text style={styles.subheading}>Yours</Text>
      {mine.length === 0 ? (
        <Empty title="Add the people you miss, and the things they always used to say." />
      ) : (
        mine.map((l) => <LovedOneRow key={l.id} lovedOne={l} count={countFor(l.id)} mine />)
      )}

      <Text style={styles.subheading}>Shared by other families</Text>
      {shared.map((l) => (
        <LovedOneRow key={l.id} lovedOne={l} count={countFor(l.id)} mine={false} />
      ))}
    </ScrollView>
  );
}
