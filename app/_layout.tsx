import { Stack } from 'expo-router';
import 'react-native-reanimated';

import { ActionProvider } from '@/components/providers/action-provider';
import { SessionProvider, useSession } from '@/components/providers/session-provider';
import { Splash } from '@/components/ui/splash';
import { useColorScheme } from '@/hooks/use-color-scheme';

export default function RootLayout() {
  return (
    <SessionProvider>
      <ActionProvider>
        <Splash />
        <Root />
      </ActionProvider>
    </SessionProvider>
  );
}

function Root() {
  const colorScheme = useColorScheme();
  const { session } = useSession();

  return (
    <Stack>
      <Stack.Protected guard={!!session}>
        <Stack.Screen
          name="(authd)"
          options={{ headerShown: false, title: 'Home' }}
        />
      </Stack.Protected>
      <Stack.Protected guard={!session}>
        <Stack.Screen
          name="sign-in"
          options={{ title: 'Sign In' }}
        />
      </Stack.Protected>
      <Stack.Protected guard={!session}>
        <Stack.Screen
          name="new-user"
          options={{ title: 'Teaming up!' }}
        />
      </Stack.Protected>
    </Stack>
  );
}
