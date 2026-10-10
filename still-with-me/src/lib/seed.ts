import type { Ism, LovedOne } from './types';

/**
 * Example public families so "Everyone" isn't empty on first launch.
 * Once the app has a shared backend these come from other users instead.
 */
export const COMMUNITY_OWNER = 'community';

const lovedOne = (id: string, name: string, relationship: string, years: string, about: string): LovedOne => ({
  id,
  ownerId: COMMUNITY_OWNER,
  name,
  relationship,
  years,
  about,
  visibility: 'public',
  createdAt: 0,
});

let n = 0;
const ism = (lovedOneId: string, text: string, topics: string[], context?: string): Ism => ({
  id: `seed-ism-${++n}`,
  ownerId: COMMUNITY_OWNER,
  lovedOneId,
  text,
  context,
  topics,
  createdAt: n,
});

export const SEED_LOVED_ONES: LovedOne[] = [
  lovedOne('seed-ruth', 'Grandma Ruth', 'Grandmother', '1931 – 2018', 'Raised six kids on a farm in Iowa. Never sat down during a holiday dinner.'),
  lovedOne('seed-earl', 'Pop Earl', 'Father', '1948 – 2021', 'Machinist, fisherman, terrible singer, great dad.'),
  lovedOne('seed-mae', 'Aunt Mae', 'Aunt', '1960 – 2023', 'Nurse for 35 years. The one everybody called first.'),
];

export const SEED_ISMS: Ism[] = [
  ism('seed-ruth', "Worry is a rocking chair. Gives you something to do, but it don't get you anywhere.", ['courage', 'hard-times'], 'Whenever any of us paced the kitchen.'),
  ism('seed-ruth', 'Feed people first. Then argue.', ['family', 'forgiveness'], 'Every Thanksgiving, without fail.'),
  ism('seed-ruth', "You don't have to like everybody. You do have to be kind to them.", ['forgiveness', 'everyday']),
  ism('seed-ruth', 'Save a little out of every check, even if it\'s a dollar. Especially if it\'s a dollar.', ['money']),
  ism('seed-ruth', "The ones who love you will wait for you to catch up.", ['grief', 'family', 'love']),
  ism('seed-earl', 'Measure twice, cut once — and that goes for words, too.', ['forgiveness', 'everyday', 'work'], 'From the shop, but he used it for everything.'),
  ism('seed-earl', "Show up early, leave last, and nobody can say you didn't earn it.", ['work', 'self-worth']),
  ism('seed-earl', "Bad days are just the ones that make good stories later.", ['hard-times', 'humor']),
  ism('seed-earl', "Don't ever lend money you need back. Give it, or don't.", ['money', 'family']),
  ism('seed-earl', "If you're scared, do it scared.", ['courage'], 'Said it on my first day of school and again before my wedding.'),
  ism('seed-earl', 'Fish are like problems — they bite when you stop staring at the water.', ['humor', 'hard-times']),
  ism('seed-mae', 'Drink some water and go to bed. Everything looks different in the morning.', ['health', 'hard-times']),
  ism('seed-mae', "Grief is just love with nowhere to go. So give it somewhere to go.", ['grief', 'love'], 'At Uncle Joe\'s service.'),
  ism('seed-mae', "Anybody who makes you feel small isn't big enough for you.", ['self-worth', 'love']),
  ism('seed-mae', 'Kids remember how you made them feel, not what you bought them.', ['parenting', 'money']),
  ism('seed-mae', 'Celebrate the little wins. The big ones are made of them.', ['celebration', 'work']),
];
