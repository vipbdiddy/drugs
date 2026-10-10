import { ScrollView, Text } from 'react-native';

import { Button, Field, ScopeToggle, confirmDestructive, styles } from '../../components/ui';
import { useStore } from '../../lib/store';

export default function SettingsScreen() {
  const { settings, updateSettings, resetEverything } = useStore();

  const confirmReset = () =>
    confirmDestructive(
      'Delete everything?',
      'This removes all your loved ones and their sayings from this device.',
      'Delete',
      resetEverything,
    );

  return (
    <ScrollView style={styles.screen} contentContainerStyle={styles.content}>
      <Field
        label="Your first name"
        placeholder="So we can say hi"
        value={settings.displayName}
        onChangeText={(displayName) => updateSettings({ displayName })}
      />

      <Text style={styles.subheading}>Whose advice to show by default</Text>
      <ScopeToggle value={settings.defaultScope} onChange={(defaultScope) => updateSettings({ defaultScope })} />
      <Text style={styles.muted}>
        "My loved ones" shows only the people you've added. "Everyone" also includes sayings other families have
        chosen to share. You can always flip it on any screen.
      </Text>

      <Text style={styles.subheading}>Privacy</Text>
      <Text style={styles.muted}>
        Everything you add is private unless you mark a loved one as shared. When shared, their sayings can be read by
        others, but you can still keep individual sayings private.
      </Text>

      <Text style={styles.subheading}>Danger zone</Text>
      <Button title="Delete all my data" variant="danger" onPress={confirmReset} />
    </ScrollView>
  );
}
