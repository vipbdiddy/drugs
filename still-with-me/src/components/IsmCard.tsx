import { router } from 'expo-router';
import { Pressable, StyleSheet, Text, View } from 'react-native';

import { useStore } from '../lib/store';
import { colors, fonts, space } from '../lib/theme';
import { topicLabel } from '../lib/topics';
import type { Ism } from '../lib/types';

export function IsmCard({ ism, showAuthor = true }: { ism: Ism; showAuthor?: boolean }) {
  const { getLovedOne, savedIsmIds, toggleSaved, userId } = useStore();
  const lovedOne = getLovedOne(ism.lovedOneId);
  const saved = savedIsmIds.has(ism.id);
  const mine = ism.ownerId === userId;

  return (
    <Pressable
      style={styles.card}
      onPress={() => router.push({ pathname: '/loved-one/[id]', params: { id: ism.lovedOneId } })}>
      <Text style={styles.quote}>“{ism.text}”</Text>
      {ism.context ? <Text style={styles.context}>{ism.context}</Text> : null}
      <View style={styles.footer}>
        <View style={{ flex: 1 }}>
          {showAuthor && lovedOne ? (
            <Text style={styles.author}>
              — {lovedOne.name}
              {mine ? '' : '  ·  shared by their family'}
            </Text>
          ) : null}
          <Text style={styles.topics}>{ism.topics.map(topicLabel).join(' · ')}</Text>
        </View>
        <Pressable
          onPress={() => toggleSaved(ism.id)}
          hitSlop={12}
          accessibilityRole="button"
          accessibilityLabel={saved ? 'Remove from saved' : 'Save'}>
          <Text style={[styles.heart, saved && { color: colors.accent }]}>{saved ? '♥' : '♡'}</Text>
        </Pressable>
      </View>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  card: {
    backgroundColor: colors.card,
    borderRadius: 14,
    padding: space.lg,
    gap: space.sm,
    borderWidth: 1,
    borderColor: colors.border,
  },
  quote: { fontFamily: fonts.quote, fontSize: 19, lineHeight: 27, color: colors.ink },
  context: { fontSize: 14, color: colors.muted, fontStyle: 'italic', lineHeight: 20 },
  footer: { flexDirection: 'row', alignItems: 'flex-end', gap: space.md, marginTop: space.xs },
  author: { fontSize: 14, fontWeight: '600', color: colors.accent },
  topics: { fontSize: 12, color: colors.muted, marginTop: 2 },
  heart: { fontSize: 24, color: colors.muted },
});
