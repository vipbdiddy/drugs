# Still With Me

A mobile app for keeping the sayings — the "isms" — of people you've lost, and finding the right one when you need it.

- **Loved ones** – add the people you miss, then the things they always used to say, with the story behind each one.
- **Ask** – describe what you're going through ("my brother wants to borrow money again") or pick a situation, and get the sayings that fit.
- **Browse** – search and filter every saying by topic.
- **Today** – one saying a day, plus everything you've saved (♥).
- **My loved ones / Everyone** – every screen can show just your own loved ones' words, or also those other families chose to share. Set your default in Settings.
- **Privacy** – a loved one is private unless you turn on sharing. When shared, you can still keep individual sayings private.

## Run it

```bash
npm install
npx expo start      # then scan the QR code with Expo Go, or press w for web
npm test            # advice-matching and privacy rules
npm run typecheck
```

## How it's built

Expo (React Native) + Expo Router, TypeScript.

| Path | What |
| --- | --- |
| `src/app/(tabs)/` | Today, Ask, Browse, Loved ones, Settings |
| `src/app/loved-one/` | Loved-one profile and add/edit form |
| `src/app/ism/edit.tsx` | Add/edit a saying |
| `src/lib/advice.ts` | Who can see what, and matching a situation to sayings |
| `src/lib/topics.ts` | Situations and the words that suggest them |
| `src/lib/store.tsx` | App state, saved on the device |
| `src/lib/seed.ts` | Example shared families so "Everyone" isn't empty |

## What's next

Right now everything is stored on the phone, so "Everyone" shows the example families plus your own. To let families actually share with each other the app needs a backend (e.g. Supabase or Firebase) with:

- accounts, so each loved one has an owner (and later, several family members who can add sayings);
- `loved_ones` and `isms` tables, readable by anyone only when the loved one is shared and the saying isn't kept private — the same rule as `canSee` in `src/lib/advice.ts`, enforced on the server;
- reporting / moderation for shared content.

Other ideas: photos and voice recordings of them, reminders on birthdays and anniversaries, and smarter matching for "Ask" (e.g. using an LLM to pick the sayings that fit, while still only ever showing their real words).
