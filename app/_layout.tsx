import { Stack } from 'expo-router';
import { Provider } from 'react-redux';

import {
    SessionProvider,
    useSession
} from '@/components/providers/session-provider';
import { Splash } from '@/components/ui/splash';
import { useColorScheme } from '@/hooks/use-color-scheme';
import { store } from '@/store/configure-store';

export default function RootLayout() {
    return (
        <Provider store={store}>
            <SessionProvider>
                <Splash />
                <Root />
            </SessionProvider>
        </Provider>
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
                <Stack.Screen name="login" options={{ title: 'Log In' }} />
            </Stack.Protected>
            <Stack.Protected guard={!session}>
                <Stack.Screen
                    name="create-new-account"
                    options={{ title: 'Teaming up!' }}
                />
            </Stack.Protected>
            <Stack.Protected guard={!session}>
                <Stack.Screen
                    name="forgot-password"
                    options={{ title: 'Forgot Password' }}
                />
            </Stack.Protected>
        </Stack>
    );
}
